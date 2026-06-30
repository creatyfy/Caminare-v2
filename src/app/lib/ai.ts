// =============================================================================
// Caminare — Cliente dos endpoints de IA (/api)
// -----------------------------------------------------------------------------
// Faz POST autenticado (Bearer = access_token do Supabase) para as funções
// serverless. Em produção (Vercel) as rotas /api estão no mesmo domínio.
// Em desenvolvimento local, rode `vercel dev` para servir /api junto do Vite.
// =============================================================================

import { supabase } from './supabase';
import { apiUrl, API_BASE } from './api';

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
  const url = apiUrl(path);

  // [DEBUG TEMPORÁRIO] Mostra a URL final chamada. No APK precisa ser a ABSOLUTA
  // da Vercel (https://caminare-v2.vercel.app/api/...). Se aparecer só "/api/..."
  // relativa, a VITE_API_BASE_URL não entrou no build → chamada vai pro
  // capacitor://localhost e falha. Remover quando o diagnóstico terminar.
  console.warn(`[ai][debug] POST ${url} (API_BASE="${API_BASE}")`);

  // fetch só rejeita em falha de REDE/CORS (não em status HTTP de erro). No app
  // nativo é o caso mais comum: preflight CORS bloqueado ou domínio errado.
  // Capturamos para reportar uma mensagem útil em vez de "Failed to fetch".
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`[ai] falha de rede/CORS em ${url}:`, detail);
    throw new Error(`Falha de conexão ao chamar ${path} (${detail}). Verifique VITE_API_BASE_URL e o CORS da função.`);
  }

  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // resposta não-JSON (ex.: HTML de erro) — trataremos como erro abaixo
  }
  if (!res.ok) {
    // Mostra status + corpo (texto da resposta) + URL para diagnosticar o erro real.
    const apiMsg = (json as { error?: string })?.error;
    const snippet = text ? text.slice(0, 300) : '(corpo vazio)';
    console.error(`[ai] ${url} respondeu ${res.status}:`, snippet);
    throw new Error(
      apiMsg
        ? `${apiMsg} [${res.status} em ${url}]`
        : `Erro ${res.status} em ${url}: ${snippet}`
    );
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
