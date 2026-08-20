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

type Db = ReturnType<typeof serviceClient>;

// Traduz UMA categoria por vez e devolve um MAPA original->tradução. Usar mapa (em
// vez de arrays paralelos) corrige o bug em que, se o modelo devolvia a lista de
// crenças com tamanho diferente do enviado, TODAS as crenças eram descartadas.
// Com mapa cada item é casado pelo próprio texto; se faltar um, só ele é pulado.
// Casamento por ÍNDICE (não por texto): o modelo devolve {"0":"trad","1":"trad"}.
// Isso corrige o caso das crenças/padrões (frases), em que o modelo não repetia a
// frase original idêntica como chave, então o casamento por texto falhava e nada
// era traduzido. Por índice, basta ele preservar a numeração.
const SYSTEM_TRANSLATE = `Você é um tradutor preciso para um app de autoconhecimento. Recebe um idioma alvo (código BCP-47) e uma lista de itens numerados no formato [{"i":0,"text":"..."}]. Traduza o campo "text" de cada item para o idioma alvo, preservando sentido e tom. Emoções: UMA palavra em minúsculas. Crenças e padrões: frases curtas. Se já estiver no idioma alvo, repita igual. Responda SOMENTE com um objeto JSON que mapeia o índice (i, como string) para a tradução, ex.: {"0":"...","1":"..."}. Inclua TODOS os índices recebidos.`;

async function translateList(target: string, items: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (items.length === 0) return map;
  try {
    const numbered = items.map((text, i) => ({ i, text }));
    const { data } = await runStructured<Record<string, string>>(
      SYSTEM_TRANSLATE,
      JSON.stringify({ target_language: target, items: numbered }),
      4000
    );
    items.forEach((orig, i) => {
      const to = (data?.[String(i)] ?? '').trim();
      if (to && to !== orig) map.set(orig, to);
    });
  } catch (err) {
    console.error('[translate-insights] falha ao traduzir lista:', err);
  }
  return map;
}

// Traduz uma lista de textos e devolve um ARRAY alinhado por índice (null onde não
// traduziu). Usado por crenças/padrões, que são atualizadas linha a linha pelo ID.
async function translateTexts(target: string, texts: string[]): Promise<(string | null)[]> {
  if (texts.length === 0) return [];
  try {
    const numbered = texts.map((text, i) => ({ i, text }));
    const { data } = await runStructured<Record<string, string>>(
      SYSTEM_TRANSLATE,
      JSON.stringify({ target_language: target, items: numbered }),
      4000
    );
    return texts.map((orig, i) => {
      const to = (data?.[String(i)] ?? '').trim();
      return to && to !== orig ? to : null;
    });
  } catch (err) {
    console.error('[translate-insights] falha ao traduzir textos:', err);
    return texts.map(() => null);
  }
}

// Atualiza cada linha pelo seu ID com a tradução correspondente (alinhada por índice).
// Sem casar texto — impossível "não achar" a linha. Retorna quantas foram atualizadas.
async function updateById(
  db: Db,
  table: string,
  col: string,
  rows: { id: string }[],
  translations: (string | null)[]
): Promise<number> {
  let count = 0;
  for (let i = 0; i < rows.length; i++) {
    const to = translations[i];
    if (!to) continue;
    const { error } = await (db as any).from(table).update({ [col]: to }).eq('id', rows[i].id);
    if (!error) count += 1;
  }
  return count;
}

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
    db.from('beliefs').select('id, content').eq('user_id', user.id).is('deleted_at', null),
    db.from('patterns').select('id, description').eq('user_id', user.id).is('deleted_at', null),
  ]);

  const uniq = (arr: (string | null | undefined)[]) =>
    Array.from(new Set(arr.map((s) => (s ?? '').trim()).filter(Boolean)));

  // Emoções: muitas linhas com nomes repetidos, então uniq + atualiza por valor.
  const emotions = uniq(((emoRes.data ?? []) as any[]).map((r) => r.name));
  // Crenças e padrões: linhas agregadas (poucas), atualizadas 1 a 1 pelo ID.
  const belRows = ((belRes.data ?? []) as any[]).filter((r) => (r.content ?? '').trim());
  const patRows = ((patRes.data ?? []) as any[]).filter((r) => (r.description ?? '').trim());

  if (emotions.length + belRows.length + patRows.length === 0) {
    return sendJson(res, 200, { status: 'ok', translated: { emotions: 0, beliefs: 0, patterns: 0 } });
  }

  const [emoMap, belT, patT] = await Promise.all([
    translateList(target, emotions),
    translateTexts(target, belRows.map((r) => r.content as string)),
    translateTexts(target, patRows.map((r) => r.description as string)),
  ]);

  const nEmo = await translateColumn(db, user.id, 'emotions', 'name', emotions, emoMap, false);
  const nBel = await updateById(db, 'beliefs', 'content', belRows, belT);
  const nPat = await updateById(db, 'patterns', 'description', patRows, patT);

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
  items: string[],
  map: Map<string, string>,
  softDelete: boolean
): Promise<number> {
  let count = 0;
  for (const from of items) {
    const to = (map.get(from) ?? '').trim();
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
