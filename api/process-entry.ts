// =============================================================================
// POST /api/process-entry
// -----------------------------------------------------------------------------
// Recebe um registro recém-salvo, extrai emoções + pensamentos (Prompt 1) e
// persiste: emoções em `emotions` (validation 'pending') e pensamentos em
// `entry_analysis_logs.parsed_thoughts`. Também grava o status de processamento
// em `entries` e é idempotente (não reprocessa um registro já 'done').
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
import { SYSTEM_PROCESS_ENTRY, buildProcessEntryUser } from './_lib/prompts.js';

export const config = { maxDuration: 30 };

interface Body {
  entry_id?: string;
  transcricao?: string;
  idioma?: string;
  qualidade?: string | null;
  historico_resumido?: string | null;
  data_hora?: string;
}

interface AiEmotion {
  nome: string;
  intensidade?: string;
  confianca?: number;
}
interface AiResult {
  status?: string;
  emocoes?: AiEmotion[];
  pensamentos?: string[];
}

// "sutil/moderada/alta" (saída da IA) → "low/medium/high" (coluna emotions.intensity)
function mapIntensity(v?: string): 'low' | 'medium' | 'high' | null {
  switch ((v ?? '').toLowerCase().trim()) {
    case 'sutil':
    case 'subtle':
    case 'low':
      return 'low';
    case 'moderada':
    case 'moderate':
    case 'medium':
      return 'medium';
    case 'alta':
    case 'high':
      return 'high';
    default:
      return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = readJsonBody<Body>(req, res);
  if (!body) return;

  const user = await requireUser(req, res);
  if (!user) return;

  const entryId = body.entry_id;
  if (!entryId) return sendError(res, 400, 'entry_id é obrigatório.');

  const db = serviceClient();

  // 1) Carrega o registro e confirma que pertence ao usuário autenticado.
  const { data: entry, error: entryErr } = await db
    .from('entries')
    .select('id, user_id, raw_text, processing_status, created_at')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle();

  if (entryErr) {
    console.error('[process-entry] erro ao buscar entry:', entryErr);
    return sendError(res, 500, 'Não foi possível carregar o registro.');
  }
  if (!entry) return sendError(res, 404, 'Registro não encontrado.');

  // 2) Idempotência: se já foi processado, devolve o que existe sem reprocessar.
  if (entry.processing_status === 'done') {
    const [{ data: emo }, { data: log }] = await Promise.all([
      db.from('emotions').select('name, intensity').eq('entry_id', entryId).neq('validation', 'rejected'),
      db
        .from('entry_analysis_logs')
        .select('parsed_thoughts')
        .eq('entry_id', entryId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    return sendJson(res, 200, {
      status: 'already_processed',
      emocoes: (emo ?? []).map((e) => ({ nome: e.name, intensidade: e.intensity })),
      pensamentos: Array.isArray(log?.parsed_thoughts) ? log?.parsed_thoughts : [],
    });
  }

  const transcricao = (body.transcricao ?? entry.raw_text ?? '').trim();
  if (!transcricao) return sendError(res, 400, 'Registro sem texto para analisar.');

  // Marca como "processing" para sinalizar a UI e evitar corrida.
  await db.from('entries').update({ processing_status: 'processing' }).eq('id', entryId);

  try {
    // 3) Monta histórico resumido (contexto) a partir dos últimos registros.
    const historicoResumido = body.historico_resumido ?? (await buildHistorico(db, user.id, entryId));

    // 4) Chama o Claude.
    const ai = await runStructured<AiResult>(
      SYSTEM_PROCESS_ENTRY,
      buildProcessEntryUser({
        transcricao,
        idioma: body.idioma ?? 'pt-BR',
        qualidade: body.qualidade ?? null,
        historicoResumido,
        dataHora: body.data_hora ?? entry.created_at,
      }),
      1500
    );

    const emocoes = (ai.emocoes ?? []).slice(0, 6).filter((e) => e?.nome?.trim());
    const pensamentos = (ai.pensamentos ?? [])
      .filter((p) => typeof p === 'string' && p.trim())
      .slice(0, 3)
      .map((p) => p.trim());

    // 5) Persiste emoções (validation 'pending') e o log de análise.
    if (emocoes.length) {
      const rows = emocoes.map((e) => ({
        user_id: user.id,
        entry_id: entryId,
        name: e.nome.trim(),
        name_original: e.nome.trim(),
        validation: 'pending' as const,
        intensity: mapIntensity(e.intensidade),
      }));
      const { error: insErr } = await db.from('emotions').insert(rows);
      if (insErr) console.error('[process-entry] erro ao inserir emoções:', insErr);
    }

    const { error: logErr } = await db.from('entry_analysis_logs').insert({
      user_id: user.id,
      entry_id: entryId,
      parsed_thoughts: pensamentos,
    });
    if (logErr) console.error('[process-entry] erro ao inserir log de análise:', logErr);

    await db.from('entries').update({ processing_status: 'done' }).eq('id', entryId);

    return sendJson(res, 200, {
      status: 'ok',
      emocoes,
      pensamentos,
    });
  } catch (err) {
    console.error('[process-entry] falha na análise:', err);
    await db.from('entries').update({ processing_status: 'error' }).eq('id', entryId);
    return sendError(res, 502, 'Não foi possível analisar o relato agora. Tente novamente.');
  }
}

// Resumo curto dos últimos registros (contexto, não fonte de extração).
async function buildHistorico(
  db: ReturnType<typeof serviceClient>,
  userId: string,
  excludeEntryId: string
): Promise<string> {
  const { data } = await db
    .from('entries')
    .select('raw_text, created_at, emotions(name, validation)')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .neq('id', excludeEntryId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!data?.length) return '';

  return data
    .map((row: { raw_text: string | null; created_at: string; emotions: { name: string; validation: string }[] | null }) => {
      const date = new Date(row.created_at).toISOString().slice(0, 10);
      const emo = (row.emotions ?? [])
        .filter((e) => e.validation === 'confirmed')
        .map((e) => e.name)
        .join(', ');
      const snippet = (row.raw_text ?? '').slice(0, 160);
      return `  • [${date}] ${snippet}${emo ? ` (emoções: ${emo})` : ''}`;
    })
    .join('\n');
}
