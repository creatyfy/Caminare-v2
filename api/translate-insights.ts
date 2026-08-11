// =============================================================================
// POST /api/translate-insights
// -----------------------------------------------------------------------------
// Traduz para o novo idioma nativo todo o conteúdo de insights já salvo do
// usuário: nomes de emoções, textos de crenças e descrições de padrões. Isso
// evita a contagem fragmentada quando registros foram feitos em línguas
// diferentes (ex.: "ansiedade" e "anxiety" contadas separado). Após traduzir,
// crenças que ficaram idênticas viram variação umas das outras (parent_belief_id).
//
// Disparado pelo app quando o usuário troca o idioma nativo no perfil.
// =============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJsonBody, requireUser, serviceClient, sendJson, sendError } from './_lib/runtime.js';
import { applyCors } from './_lib/cors.js';
import { runStructured } from './_lib/claude.js';

export const config = { maxDuration: 60 };

interface Body {
  target_language?: string;
}

interface TranslateResult {
  emotions: string[];
  beliefs: string[];
  patterns: string[];
}

type Db = ReturnType<typeof serviceClient>;

const SYSTEM_TRANSLATE = `Você é um tradutor preciso. Recebe listas de textos curtos (emoções, crenças e padrões de um app de autoconhecimento) e um idioma alvo em código BCP-47. Traduza cada texto para o idioma alvo, preservando o sentido e o tom, mantendo o formato: emoções como UMA palavra em minúsculas; crenças e padrões como frases curtas. Se um texto já estiver no idioma alvo, repita-o igual. NÃO adicione, remova ou reordene itens. Responda SOMENTE com JSON no formato exato {"emotions":[...],"beliefs":[...],"patterns":[...]}, com cada array na MESMA ORDEM e MESMO TAMANHO da entrada correspondente.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  const body = readJsonBody<Body>(req, res);
  if (!body) return;

  const user = await requireUser(req, res);
  if (!user) return;

  const target = (body.target_language ?? '').trim();
  if (!target) return sendError(res, 400, 'target_language é obrigatório.');

  const db = serviceClient();

  const [emoRes, belRes, patRes] = await Promise.all([
    db.from('emotions').select('name').eq('user_id', user.id),
    db.from('beliefs').select('content').eq('user_id', user.id).is('deleted_at', null),
    db.from('patterns').select('description').eq('user_id', user.id).is('deleted_at', null),
  ]);

  const uniq = (arr: (string | null | undefined)[]) =>
    Array.from(new Set(arr.map((s) => (s ?? '').trim()).filter(Boolean)));

  const emotions = uniq(((emoRes.data ?? []) as any[]).map((r) => r.name));
  const beliefs = uniq(((belRes.data ?? []) as any[]).map((r) => r.content));
  const patterns = uniq(((patRes.data ?? []) as any[]).map((r) => r.description));

  if (emotions.length + beliefs.length + patterns.length === 0) {
    return sendJson(res, 200, { status: 'ok', translated: { emotions: 0, beliefs: 0, patterns: 0 } });
  }

  let out: TranslateResult;
  try {
    const { data } = await runStructured<TranslateResult>(
      SYSTEM_TRANSLATE,
      JSON.stringify({ target_language: target, emotions, beliefs, patterns }),
      4000
    );
    out = data;
  } catch (err) {
    console.error('[translate-insights] falha na tradução:', err);
    return sendError(res, 502, 'Não foi possível traduzir os insights agora.');
  }

  const nEmo = await translateColumn(db, user.id, 'emotions', 'name', emotions, out.emotions, false);
  const nBel = await translateColumn(db, user.id, 'beliefs', 'content', beliefs, out.beliefs, true);
  const nPat = await translateColumn(db, user.id, 'patterns', 'description', patterns, out.patterns, true);

  // Crenças que ficaram idênticas após a tradução viram variação de uma canônica.
  await dedupeExactBeliefs(db, user.id);

  return sendJson(res, 200, {
    status: 'ok',
    translated: { emotions: nEmo, beliefs: nBel, patterns: nPat },
  });
}

/** Aplica old->new em uma coluna de texto, casando por valor. Retorna quantos grupos mudaram. */
async function translateColumn(
  db: Db,
  userId: string,
  table: string,
  col: string,
  olds: string[],
  news: string[] | undefined,
  softDelete: boolean
): Promise<number> {
  if (!Array.isArray(news) || news.length !== olds.length) return 0;
  let count = 0;
  for (let i = 0; i < olds.length; i++) {
    const from = olds[i];
    const to = (news[i] ?? '').trim();
    if (!to || to === from) continue;
    // db dinâmico por nome de tabela: cast local para não brigar com os tipos gerados.
    let query = (db as any).from(table).update({ [col]: to }).eq('user_id', userId).eq(col, from);
    if (softDelete) query = query.is('deleted_at', null);
    const { error } = await query;
    if (!error) count += 1;
  }
  return count;
}

/** Une crenças com conteúdo idêntico numa canônica (parent_belief_id + soma ocorrências). */
async function dedupeExactBeliefs(db: Db, userId: string): Promise<void> {
  const { data } = await db
    .from('beliefs')
    .select('id, content, occurrence_count, first_seen_at')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .is('parent_belief_id', null);
  if (!data) return;

  const groups = new Map<string, any[]>();
  for (const b of data as any[]) {
    const key = (b.content ?? '').trim().toLowerCase();
    if (!key) continue;
    const arr = groups.get(key) ?? [];
    arr.push(b);
    groups.set(key, arr);
  }

  for (const arr of groups.values()) {
    if (arr.length < 2) continue;
    arr.sort(
      (a, b) => new Date(a.first_seen_at).getTime() - new Date(b.first_seen_at).getTime()
    );
    const canonical = arr[0];
    let total = canonical.occurrence_count ?? 1;
    for (let i = 1; i < arr.length; i++) {
      total += arr[i].occurrence_count ?? 1;
      await db.from('beliefs').update({ parent_belief_id: canonical.id }).eq('id', arr[i].id);
    }
    await db.from('beliefs').update({ occurrence_count: total }).eq('id', canonical.id);
  }
}
