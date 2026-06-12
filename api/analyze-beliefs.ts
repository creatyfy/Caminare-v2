// =============================================================================
// POST /api/analyze-beliefs
// -----------------------------------------------------------------------------
// A partir do relato + itens validados/rejeitados pelo usuário, identifica
// crenças centrais (Prompt 2) e persiste em `beliefs` com validation 'pending'.
// =============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  readJsonBody,
  requireUser,
  serviceClient,
  sendJson,
  sendError,
} from './_lib/runtime.js';
import { runStructured } from './_lib/claude.js';
import { SYSTEM_ANALYZE_BELIEFS, buildAnalyzeBeliefsUser } from './_lib/prompts.js';

export const config = { maxDuration: 30 };

interface Body {
  entry_id?: string;
  transcricao?: string;
  idioma?: string;
  emocoes_validadas?: string[];
  emocoes_rejeitadas?: string[];
  crencas_existentes?: string[];
  data_hora?: string;
}

interface AiBelief {
  formulacao: string;
  tipo?: string;
  categoria?: string;
  origem_provavel?: string;
  areas_de_vida?: string[];
  recorrencia?: string;
  confianca?: number;
}
interface AiResult {
  status?: string;
  crencas?: AiBelief[];
}

const asStrArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()).map((x) => x.trim()) : [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = readJsonBody<Body>(req, res);
  if (!body) return;

  const user = await requireUser(req, res);
  if (!user) return;

  const entryId = body.entry_id;
  if (!entryId) return sendError(res, 400, 'entry_id é obrigatório.');

  const db = serviceClient();

  // Carrega o relato (confirma posse) — transcricao do corpo é só fallback.
  const { data: entry, error: entryErr } = await db
    .from('entries')
    .select('id, raw_text')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (entryErr) {
    console.error('[analyze-beliefs] erro ao buscar entry:', entryErr);
    return sendError(res, 500, 'Não foi possível carregar o registro.');
  }
  if (!entry) return sendError(res, 404, 'Registro não encontrado.');

  const transcricao = (body.transcricao ?? entry.raw_text ?? '').trim();
  if (!transcricao) return sendError(res, 400, 'Registro sem texto para analisar.');

  // Crenças existentes: usa as do corpo ou busca no banco para evitar duplicação.
  let crencasExistentes = asStrArray(body.crencas_existentes);
  if (!crencasExistentes.length) {
    const { data: existing } = await db
      .from('beliefs')
      .select('content')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .neq('validation', 'rejected');
    crencasExistentes = (existing ?? []).map((b) => b.content).filter(Boolean);
  }

  // Crenças já rejeitadas pelo usuário: o prompt nunca deve sugeri-las de novo e
  // filtramos qualquer formulação que bata com elas antes de inserir.
  const { data: rejected } = await db
    .from('beliefs')
    .select('content')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .eq('validation', 'rejected');
  const crencasRejeitadas = (rejected ?? []).map((b) => b.content).filter(Boolean);

  try {
    const { data: ai } = await runStructured<AiResult>(
      SYSTEM_ANALYZE_BELIEFS,
      buildAnalyzeBeliefsUser({
        transcricao,
        idioma: body.idioma ?? 'pt-BR',
        emocoesValidadas: asStrArray(body.emocoes_validadas),
        emocoesRejeitadas: asStrArray(body.emocoes_rejeitadas),
        crencasExistentes,
        crencasRejeitadas,
        dataHora: body.data_hora ?? new Date().toISOString(),
      }),
      1500
    );

    const crencas = (ai.crencas ?? []).filter((c) => c?.formulacao?.trim()).slice(0, 5);

    if (crencas.length) {
      const nowIso = body.data_hora ?? new Date().toISOString();
      // Não recria crença pending com formulação idêntica a uma já existente
      // nem reintroduz uma crença que o usuário já rejeitou.
      const existingSet = new Set(crencasExistentes.map((c) => c.toLowerCase()));
      const rejectedSet = new Set(crencasRejeitadas.map((c) => c.toLowerCase()));
      const rows = crencas
        .filter((c) => {
          const key = c.formulacao.trim().toLowerCase();
          return !existingSet.has(key) && !rejectedSet.has(key);
        })
        .map((c) => ({
          user_id: user.id,
          source_entry_id: entryId,
          content: c.formulacao.trim(),
          content_original: c.formulacao.trim(),
          validation: 'pending' as const,
          first_seen_at: nowIso,
          last_seen_at: nowIso,
          occurrence_count: 1,
          version: 1,
        }));
      if (rows.length) {
        const { error: insErr } = await db.from('beliefs').insert(rows);
        // Resiliência ao deploy: se a coluna source_entry_id ainda não existir
        // no banco (migration não aplicada), reinsere sem ela para não quebrar a
        // geração de crenças. Postgres: 42703 = undefined_column.
        if (insErr?.code === '42703') {
          const fallback = rows.map(({ source_entry_id, ...rest }) => rest);
          const { error: fbErr } = await db.from('beliefs').insert(fallback);
          if (fbErr) console.error('[analyze-beliefs] erro ao inserir crenças (fallback):', fbErr);
        } else if (insErr) {
          console.error('[analyze-beliefs] erro ao inserir crenças:', insErr);
        }
      }
    }

    return sendJson(res, 200, { status: 'ok', crencas });
  } catch (err) {
    console.error('[analyze-beliefs] falha na análise:', err);
    return sendError(res, 502, 'Não foi possível analisar as crenças agora. Tente novamente.');
  }
}
