// =============================================================================
// POST /api/merge-beliefs
// -----------------------------------------------------------------------------
// De tempos em tempos, une crenças validadas EXTREMAMENTE parecidas: escolhe uma
// canônica, aponta as demais como variação dela (parent_belief_id), soma as
// ocorrências e mantém as variações (não apaga). Assim a mesma crença deixa de
// aparecer várias vezes com ocorrência 1 na lista de Insights.
//
// Conservador de propósito: só agrupa o que é praticamente a mesma crença.
// =============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJsonBody, requireUser, serviceClient, sendJson, sendError } from './_lib/runtime.js';
import { applyCors } from './_lib/cors.js';
import { runStructured } from './_lib/claude.js';

export const config = { maxDuration: 60 };

type Db = ReturnType<typeof serviceClient>;

interface BeliefRow {
  id: string;
  content: string | null;
  occurrence_count: number | null;
  first_seen_at: string;
}

interface GroupsResult {
  groups: string[][];
}

const SYSTEM_MERGE = `Você agrupa crenças centrais de um app de autoconhecimento que são ESSENCIALMENTE A MESMA crença, escritas de formas ligeiramente diferentes (mesma ideia, palavras trocadas). Seja MUITO conservador: só agrupe quando o significado for praticamente idêntico. NÃO agrupe crenças apenas relacionadas ou do mesmo tema. Recebe uma lista de objetos {id, text}. Responda SOMENTE com JSON {"groups": [["id","id",...], ...]}, onde cada grupo tem 2 ou mais ids de crenças equivalentes. Crenças únicas NÃO entram em nenhum grupo. Se não houver nada a agrupar, responda {"groups": []}.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  const body = readJsonBody<Record<string, unknown>>(req, res);
  if (!body) return;

  const user = await requireUser(req, res);
  if (!user) return;

  const db = serviceClient();

  // Crenças validadas, de topo (não são variação de outra), não apagadas.
  const { data, error } = await db
    .from('beliefs')
    .select('id, content, occurrence_count, first_seen_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .is('parent_belief_id', null)
    .in('validation', ['confirmed', 'edited']);

  if (error) {
    console.error('[merge-beliefs] erro ao carregar crenças:', error);
    return sendError(res, 500, 'Não foi possível carregar as crenças.');
  }

  const beliefs = (data ?? []) as BeliefRow[];
  if (beliefs.length < 2) {
    return sendJson(res, 200, { status: 'ok', merged: 0 });
  }

  const byId = new Map<string, BeliefRow>(beliefs.map((b) => [b.id, b] as [string, BeliefRow]));

  let groups: string[][];
  try {
    const { data: out } = await runStructured<GroupsResult>(
      SYSTEM_MERGE,
      JSON.stringify(beliefs.map((b) => ({ id: b.id, text: (b.content ?? '').trim() }))),
      2000
    );
    groups = Array.isArray(out?.groups) ? out.groups : [];
  } catch (err) {
    console.error('[merge-beliefs] falha na IA:', err);
    return sendError(res, 502, 'Não foi possível analisar as crenças agora.');
  }

  let merged = 0;
  for (const group of groups) {
    // Só ids válidos e ainda de topo; precisa de 2+ pra unir.
    const members = group
      .filter((id) => byId.has(id))
      .map((id) => byId.get(id)!)
      .filter((b, i, arr) => arr.indexOf(b) === i);
    if (members.length < 2) continue;

    // Canônica = a mais antiga (first_seen_at).
    members.sort(
      (a, b) => new Date(a.first_seen_at).getTime() - new Date(b.first_seen_at).getTime()
    );
    const canonical = members[0];
    let total = canonical.occurrence_count ?? 1;

    for (let i = 1; i < members.length; i++) {
      const variation = members[i];
      total += variation.occurrence_count ?? 1;
      const { error: upErr } = await db
        .from('beliefs')
        .update({ parent_belief_id: canonical.id })
        .eq('id', variation.id)
        .eq('user_id', user.id);
      if (!upErr) {
        merged += 1;
        // Evita reprocessar essa crença como topo em grupos seguintes.
        byId.delete(variation.id);
      }
    }
    await db
      .from('beliefs')
      .update({ occurrence_count: total })
      .eq('id', canonical.id)
      .eq('user_id', user.id);
  }

  return sendJson(res, 200, { status: 'ok', merged });
}
