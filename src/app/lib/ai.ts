// =============================================================================
// Caminare — Cliente dos endpoints de IA (/api)
// -----------------------------------------------------------------------------
// Faz POST autenticado (Bearer = access_token do Supabase) para as funções
// serverless. Em produção (Vercel) as rotas /api estão no mesmo domínio.
// Em desenvolvimento local, rode `vercel dev` para servir /api junto do Vite.
// =============================================================================

import { supabase } from './supabase';
import { apiUrl } from './api';

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  // apiUrl() prefixa a base absoluta no app nativo (no web fica relativo).
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // resposta não-JSON (ex.: HTML de erro) — trataremos como erro abaixo
  }
  if (!res.ok) {
    const msg = (json as { error?: string })?.error || `Erro ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

// ─── process-entry ───────────────────────────────────────────────────────────

export interface ProcessEntryResult {
  // 'ok' | 'already_processed' | 'processing' (202, outra requisição está processando)
  status: 'ok' | 'already_processed' | 'processing' | string;
  emocoes?: { nome: string; intensidade?: string; confianca?: number }[];
}

export function processEntry(entryId: string, idioma: string): Promise<ProcessEntryResult> {
  return postJson<ProcessEntryResult>('/api/process-entry', {
    entry_id: entryId,
    idioma,
  });
}

// ─── analyze-beliefs ─────────────────────────────────────────────────────────

export interface AnalyzeBeliefsInput {
  entryId: string;
  idioma: string;
  emocoesValidadas: string[];
  emocoesRejeitadas: string[];
}

export interface AnalyzeBeliefsResult {
  status: string;
  crencas: { formulacao: string; tipo?: string; confianca?: number }[];
}

export function analyzeBeliefs(input: AnalyzeBeliefsInput): Promise<AnalyzeBeliefsResult> {
  return postJson<AnalyzeBeliefsResult>('/api/analyze-beliefs', {
    entry_id: input.entryId,
    idioma: input.idioma,
    emocoes_validadas: input.emocoesValidadas,
    emocoes_rejeitadas: input.emocoesRejeitadas,
  });
}

// ─── detect-patterns ─────────────────────────────────────────────────────────

export interface DetectPatternsResult {
  status: 'ok' | 'insuficiente' | string;
  padroes: { nome: string; descricao?: string }[];
}

export function detectPatterns(userId: string, idioma: string): Promise<DetectPatternsResult> {
  return postJson<DetectPatternsResult>('/api/detect-patterns', {
    user_id: userId,
    idioma,
  });
}
