// =============================================================================
// POST /api/translate-insights
// -----------------------------------------------------------------------------
// Traduz para o novo idioma nativo o conteúdo de insights já salvo do usuário:
// nomes de emoções, textos de crenças e descrições de padrões. Disparado quando
// o usuário troca o idioma nativo no perfil.
//
// Estratégia (simples e robusta):
//  - A IA recebe uma lista de textos e devolve um ARRAY de traduções na MESMA
//    ORDEM. Casamos por ÍNDICE (não por texto), então frases (crenças/padrões)
//    não dependem do modelo repetir a frase original.
//  - Emoções: muitas linhas repetem o mesmo nome, então atualizamos por valor.
//  - Crenças e padrões: linhas agregadas (poucas), atualizadas 1 a 1 pelo ID.
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

const SYSTEM_TRANSLATE = `Você é um tradutor preciso para um app de autoconhecimento. Recebe um idioma alvo (código BCP-47) e uma lista de textos em "items". Traduza CADA texto para o idioma alvo, preservando sentido e tom. Emoções: UMA palavra em minúsculas. Crenças e padrões: frases curtas. Se um texto já estiver no idioma alvo, repita-o igual. Responda SOMENTE com um array JSON de traduções, na MESMA ORDEM e MESMO TAMANHO da lista recebida. Exemplo: ["tradução 1","tradução 2","tradução 3"].`;

// Traduz uma lista e devolve um array alinhado por índice (null onde não traduziu
// ou onde a tradução ficou igual ao original).
async function translateTexts(target: string, texts: string[]): Promise<(string | null)[]> {
  if (texts.length === 0) return [];
  try {
    const { data } = await runStructured<unknown>(
      SYSTEM_TRANSLATE,
      JSON.stringify({ target_language: target, items: texts }),
      4000
    );
    // Aceita array ["t0","t1"] OU objeto {"0":"t0","1":"t1"}: o modelo às vezes
    // devolve um formato, às vezes o outro. Assim funciona nos dois casos.
    const at = (i: number): string => {
      if (Array.isArray(data)) return (data[i] ?? '').toString();
      if (data && typeof data === 'object') {
        return (((data as Record<string, unknown>)[String(i)] ?? '') as string).toString();
      }
      return '';
    };
    return texts.map((orig, i) => {
      const to = at(i).trim();
      return to && to !== orig ? to : null;
    });
  } catch (err) {
    console.error('[translate-insights] falha ao traduzir:', err);
    return texts.map(() => null);
  }
}

const SCHEMA_MISMATCH = new Set(['42703', '22P02', '22023', '23514']);

// Atualiza uma linha pelo ID BUMPANDO a versão. As crenças têm um trigger
// BEFORE UPDATE (snapshot_belief_version) que exige a versão nova a cada alteração
// de conteúdo; um update simples (sem version+1) falha em silêncio e a tradução
// não grava — era ESTE o motivo de as crenças nunca traduzirem. Fallback sem
// version pra tabelas que não têm a coluna (código 42703).
async function updateRowVersioned(
  db: Db,
  table: string,
  col: string,
  id: string,
  value: string
): Promise<boolean> {
  const { data: cur } = await (db as any).from(table).select('version').eq('id', id).maybeSingle();
  const next = cur && typeof cur.version === 'number' ? cur.version + 1 : undefined;
  const attempts: Record<string, unknown>[] =
    next !== undefined ? [{ [col]: value, version: next }, { [col]: value }] : [{ [col]: value }];
  for (const payload of attempts) {
    const { error } = await (db as any).from(table).update(payload).eq('id', id);
    if (!error) return true;
    if (SCHEMA_MISMATCH.has(String(error.code))) continue; // tenta payload mais simples
    console.error(`[translate-insights] update ${table}:`, error);
    return false;
  }
  return false;
}

// Atualiza cada linha (crença/padrão) pelo ID, com a tradução alinhada por índice.
async function updateRows(
  db: Db,
  table: string,
  col: string,
  rows: { id: string }[],
  translations: (string | null)[]
): Promise<number> {
  let count = 0;
  for (let i = 0; i < rows.length; i++) {
    const to = translations[i];
    if (to && (await updateRowVersioned(db, table, col, rows[i].id, to))) count += 1;
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

  // Emoções: uniq (nomes repetem em muitas linhas), atualizadas por valor.
  const emotions = uniq(((emoRes.data ?? []) as any[]).map((r) => r.name));
  // Crenças e padrões: linhas agregadas, atualizadas 1 a 1 pelo ID.
  const belRows = ((belRes.data ?? []) as any[]).filter((r) => (r.content ?? '').trim());
  const patRows = ((patRes.data ?? []) as any[]).filter((r) => (r.description ?? '').trim());

  if (emotions.length + belRows.length + patRows.length === 0) {
    return sendJson(res, 200, { status: 'ok', translated: { emotions: 0, beliefs: 0, patterns: 0 } });
  }

  const [emoT, belT, patT] = await Promise.all([
    translateTexts(target, emotions),
    translateTexts(target, belRows.map((r) => r.content as string)),
    translateTexts(target, patRows.map((r) => r.description as string)),
  ]);

  // Emoções por valor (uma linha por ocorrência; muitas repetem o mesmo nome).
  let nEmo = 0;
  for (let i = 0; i < emotions.length; i++) {
    const to = emoT[i];
    if (!to) continue;
    const { error } = await db
      .from('emotions')
      .update({ name: to })
      .eq('user_id', user.id)
      .eq('name', emotions[i]);
    if (!error) nEmo += 1;
  }

  const nBel = await updateRows(db, 'beliefs', 'content', belRows, belT);
  const nPat = await updateRows(db, 'patterns', 'description', patRows, patT);

  // Crenças que ficaram idênticas após a tradução viram variação de uma canônica.
  await dedupeExactBeliefs(db, user.id);

  return sendJson(res, 200, {
    status: 'ok',
    translated: { emotions: nEmo, beliefs: nBel, patterns: nPat },
  });
}

// Une crenças com conteúdo idêntico numa canônica (parent_belief_id + soma ocorrências).
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
