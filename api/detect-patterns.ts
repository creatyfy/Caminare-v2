// =============================================================================
// POST /api/detect-patterns
// -----------------------------------------------------------------------------
// Analisa o histórico longitudinal do usuário (Prompt 3) e persiste padrões em
// `patterns` com validation 'pending'. Só processa com >= 3 registros em >= 2
// dias distintos — caso contrário devolve { status: 'insuficiente' }.
// O histórico é montado no servidor a partir do banco (mais seguro e confiável).
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
import { SYSTEM_DETECT_PATTERNS, buildDetectPatternsUser } from './_lib/prompts.js';

export const config = { maxDuration: 30 };

interface Body {
  user_id?: string;
  idioma?: string;
  data_hora?: string;
}

interface AiPattern {
  nome: string;
  categoria_taxonomia?: string;
  descricao?: string;
  gatilhos?: string[];
  correlacoes?: string[];
  areas_de_vida?: string[];
  crencas_relacionadas?: string[];
  severidade?: string;
  valencia?: string;
  evolucao?: string;
  confianca?: number;
}
interface AiResult {
  status?: string;
  padroes?: AiPattern[];
}

interface HistEntry {
  id: string;
  raw_text: string | null;
  created_at: string;
  emotions: { name: string; validation: string }[] | null;
  entry_analysis_logs: { parsed_thoughts: unknown; created_at: string }[] | null;
}

const asStrArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()).map((x) => x.trim()) : [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = readJsonBody<Body>(req, res);
  if (!body) return;

  const user = await requireUser(req, res);
  if (!user) return;

  // O usuário só pode analisar o próprio histórico.
  if (body.user_id && body.user_id !== user.id) {
    return sendError(res, 403, 'Operação não permitida.');
  }

  const db = serviceClient();

  // 1) Carrega histórico completo (registros + emoções confirmadas + pensamentos).
  const { data, error } = await db
    .from('entries')
    .select(
      'id, raw_text, created_at, emotions(name, validation), entry_analysis_logs(parsed_thoughts, created_at)'
    )
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[detect-patterns] erro ao buscar histórico:', error);
    return sendError(res, 500, 'Não foi possível carregar o histórico.');
  }

  const entries = (data ?? []) as HistEntry[];

  // 2) Pré-requisito: >= 3 registros em >= 2 dias distintos.
  const distinctDays = new Set(entries.map((e) => new Date(e.created_at).toISOString().slice(0, 10)));
  if (entries.length < 3 || distinctDays.size < 2) {
    return sendJson(res, 200, {
      status: 'insuficiente',
      padroes: [],
      info: {
        registros: entries.length,
        dias_distintos: distinctDays.size,
        minimo: { registros: 3, dias: 2 },
      },
    });
  }

  // 3) Monta o texto do histórico para o prompt.
  const historicoCompleto = entries
    .map((e) => {
      const date = new Date(e.created_at).toISOString().slice(0, 10);
      const emo = (e.emotions ?? [])
        .filter((x) => x.validation === 'confirmed')
        .map((x) => x.name)
        .join(', ');
      const thoughts = collectThoughts(e.entry_analysis_logs);
      const parts = [`[${date}] ${(e.raw_text ?? '').slice(0, 400)}`];
      if (emo) parts.push(`    emoções: ${emo}`);
      if (thoughts.length) parts.push(`    pensamentos: ${thoughts.join(' | ')}`);
      return parts.join('\n');
    })
    .join('\n\n');

  // 4) Padrões e crenças já existentes (evitar duplicação / dar contexto).
  const [{ data: pats }, { data: bels }] = await Promise.all([
    db.from('patterns').select('description').eq('user_id', user.id).is('deleted_at', null),
    db
      .from('beliefs')
      .select('content')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .neq('validation', 'rejected'),
  ]);
  const padroesExistentes = (pats ?? []).map((p) => p.description).filter(Boolean);
  const crencasMapeadas = (bels ?? []).map((b) => b.content).filter(Boolean);

  try {
    const ai = await runStructured<AiResult>(
      SYSTEM_DETECT_PATTERNS,
      buildDetectPatternsUser({
        idioma: body.idioma ?? 'pt-BR',
        historicoCompleto,
        padroesExistentes,
        crencasMapeadas,
        dataHora: body.data_hora ?? new Date().toISOString(),
      }),
      2000
    );

    const padroes = (ai.padroes ?? []).filter((p) => p?.nome?.trim() || p?.descricao?.trim()).slice(0, 3);

    if (padroes.length) {
      const nowIso = body.data_hora ?? new Date().toISOString();
      const existingSet = new Set(padroesExistentes.map((p) => p.toLowerCase()));
      const rows = padroes
        .map((p) => {
          const description = (p.descricao ?? p.nome ?? '').trim();
          return {
            user_id: user.id,
            description,
            triggers: asStrArray(p.gatilhos),
            emotions_involved: asStrArray(p.correlacoes),
            validation: 'pending' as const,
            occurrence_count: 1,
            first_detected_at: nowIso,
            last_updated_at: nowIso,
            _key: description.toLowerCase(),
          };
        })
        .filter((r) => r.description && !existingSet.has(r._key))
        .map(({ _key, ...row }) => row);

      if (rows.length) {
        const { error: insErr } = await db.from('patterns').insert(rows);
        if (insErr) console.error('[detect-patterns] erro ao inserir padrões:', insErr);
      }
    }

    return sendJson(res, 200, { status: 'ok', padroes });
  } catch (err) {
    console.error('[detect-patterns] falha na análise:', err);
    return sendError(res, 502, 'Não foi possível detectar padrões agora. Tente novamente.');
  }
}

function collectThoughts(logs: HistEntry['entry_analysis_logs']): string[] {
  if (!logs?.length) return [];
  const latest = [...logs].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const raw = latest?.parsed_thoughts;
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string' && !!x.trim()) : [];
}
