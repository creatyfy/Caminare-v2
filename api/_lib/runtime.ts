// =============================================================================
// Caminare — Utilidades compartilhadas das funções serverless (/api)
// -----------------------------------------------------------------------------
// Tudo que é transversal aos 3 endpoints: leitura de env, helpers de resposta
// JSON, validação do token de autenticação do Supabase e cliente service_role.
// Arquivos/pastas começando com "_" não viram rotas no Vercel — seguro para libs.
// =============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─── Env ─────────────────────────────────────────────────────────────────────
// No servidor (Vercel) lemos das variáveis SEM prefixo VITE_. Mantemos fallback
// para as VITE_* porque elas também ficam disponíveis em process.env quando
// configuradas no projeto Vercel — assim funciona mesmo que só as VITE_ existam.

export function getEnv(name: string, ...fallbacks: string[]): string {
  for (const key of [name, ...fallbacks]) {
    const v = process.env[key];
    if (v && v.trim()) return v.trim();
  }
  throw new Error(`Variável de ambiente ausente: ${name}`);
}

export const SUPABASE_URL = () => getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = () => getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');
export const SUPABASE_SERVICE_ROLE_KEY = () => getEnv('SUPABASE_SERVICE_ROLE_KEY');
export const ANTHROPIC_API_KEY = () => getEnv('ANTHROPIC_API_KEY');

// ─── Respostas JSON ────────────────────────────────────────────────────────

export function sendJson(res: VercelResponse, status: number, body: unknown): void {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(body));
}

export function sendError(res: VercelResponse, status: number, message: string): void {
  sendJson(res, status, { status: 'error', error: message });
}

// Garante POST + corpo JSON. Retorna o corpo já parseado, ou null se já respondeu erro.
export function readJsonBody<T = Record<string, unknown>>(
  req: VercelRequest,
  res: VercelResponse
): T | null {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendError(res, 405, 'Método não permitido. Use POST.');
    return null;
  }
  const body = req.body;
  if (!body) return {} as T;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as T;
    } catch {
      sendError(res, 400, 'Corpo da requisição inválido (JSON malformado).');
      return null;
    }
  }
  return body as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
// Valida o Bearer token do Supabase. Endpoints NUNCA ficam abertos: sem token
// válido → 401. A leitura/escrita real usa o cliente service_role.

export interface AuthedUser {
  id: string;
  email: string | null;
}

export async function requireUser(
  req: VercelRequest,
  res: VercelResponse
): Promise<AuthedUser | null> {
  const header = req.headers['authorization'] || req.headers['Authorization' as never];
  const token = typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    sendError(res, 401, 'Não autenticado.');
    return null;
  }

  // Cliente anon só para verificar o token (não persiste sessão).
  const authClient = createClient(SUPABASE_URL(), SUPABASE_ANON_KEY(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) {
    sendError(res, 401, 'Sessão inválida ou expirada.');
    return null;
  }
  return { id: data.user.id, email: data.user.email ?? null };
}

// ─── Cliente service_role (escrita no servidor, ignora RLS) ──────────────────

let _service: SupabaseClient | null = null;
export function serviceClient(): SupabaseClient {
  if (_service) return _service;
  _service = createClient(SUPABASE_URL(), SUPABASE_SERVICE_ROLE_KEY(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _service;
}
