// =============================================================================
// Caminare — Escrita de entitlement na tabela `subscriptions` (service role)
// -----------------------------------------------------------------------------
// Centraliza as duas escritas do IAP, ambas IDEMPOTENTES:
//  • applyEntitlementForUser  — fluxo validate-purchase (sabemos o usuário): faz
//    upsert pela coluna única user_id.
//  • applyEntitlementByExternalId — fluxo store-webhook (só temos a transação):
//    atualiza pela coluna única external_id; NÃO cria linha órfã; ignora eventos
//    fora de ordem (period_end menor que o já gravado).
//  • recordWebhookEvent — dedup de notificações (event_id único em iap_events).
//
// Resiliência: se a coluna `source` ou a tabela `iap_events` ainda não existirem
// no banco (migration 20260617 não aplicada), o código degrada com segurança em
// vez de quebrar — ver tratamento de 42703 / 42P01.
// =============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Cadence, Platform, SubStatus, Tier } from './iap-products.js';

export interface EntitlementUpdate {
  status: SubStatus;
  tier?: Tier | null;
  cadence?: Cadence | null; // grava na coluna `plan`
  currentPeriodEnd?: string | null;
  externalId: string;
  source: Platform;
}

type Db = SupabaseClient;

// Remove a coluna `source` de um objeto (fallback quando a coluna não existe).
function withoutSource<T extends { source?: unknown }>(row: T): Omit<T, 'source'> {
  const { source, ...rest } = row;
  void source;
  return rest;
}

/** Upsert do entitlement pelo usuário autenticado (validate-purchase). */
export async function applyEntitlementForUser(
  db: Db,
  userId: string,
  u: EntitlementUpdate
): Promise<{ error: string | null }> {
  const nowISO = new Date().toISOString();
  const row = {
    user_id: userId,
    status: u.status,
    tier: u.tier ?? null,
    plan: u.cadence ?? null,
    current_period_start: u.status === 'active' ? nowISO : null,
    current_period_end: u.currentPeriodEnd ?? null,
    external_id: u.externalId,
    source: u.source,
    updated_at: nowISO,
  };

  let { error } = await db.from('subscriptions').upsert(row, { onConflict: 'user_id' });
  if (error?.code === '42703') {
    ({ error } = await db.from('subscriptions').upsert(withoutSource(row), { onConflict: 'user_id' }));
  }
  return { error: error ? error.message : null };
}

export interface ByExternalIdResult {
  matched: boolean; // havia uma assinatura com esse external_id
  applied: boolean; // a atualização foi aplicada (false se evento obsoleto)
  error: string | null;
}

/** Atualiza o entitlement pela transação (webhook). Idempotente e à prova de fora-de-ordem. */
export async function applyEntitlementByExternalId(
  db: Db,
  u: EntitlementUpdate
): Promise<ByExternalIdResult> {
  if (!u.externalId) return { matched: false, applied: false, error: null };

  const { data: existing, error: selErr } = await db
    .from('subscriptions')
    .select('id, current_period_end')
    .eq('external_id', u.externalId)
    .maybeSingle();
  if (selErr) return { matched: false, applied: false, error: selErr.message };
  if (!existing) return { matched: false, applied: false, error: null };

  // Fora de ordem: se o evento traz um fim de período ANTERIOR ao já gravado,
  // é uma notificação atrasada — ignora pra não regredir o estado.
  if (
    u.currentPeriodEnd &&
    existing.current_period_end &&
    new Date(u.currentPeriodEnd).getTime() < new Date(existing.current_period_end).getTime()
  ) {
    return { matched: true, applied: false, error: null };
  }

  const patch: Record<string, unknown> = {
    status: u.status,
    source: u.source,
    updated_at: new Date().toISOString(),
  };
  if (u.currentPeriodEnd) patch.current_period_end = u.currentPeriodEnd;
  if (u.tier != null) patch.tier = u.tier;
  if (u.cadence != null) patch.plan = u.cadence;

  let { error } = await db.from('subscriptions').update(patch).eq('external_id', u.externalId);
  if (error?.code === '42703') {
    ({ error } = await db.from('subscriptions').update(withoutSource(patch)).eq('external_id', u.externalId));
  }
  return { matched: true, applied: !error, error: error ? error.message : null };
}

/**
 * Registra um evento de webhook para dedup. Retorna isNew=false se o event_id já
 * foi processado (duplicado). Se a tabela iap_events ainda não existir, segue sem
 * dedup (degrada com log) — a atualização é idempotente de qualquer forma.
 */
export async function recordWebhookEvent(
  db: Db,
  eventId: string | null | undefined,
  platform: Platform,
  type: string
): Promise<{ isNew: boolean }> {
  if (!eventId) return { isNew: true };
  const { error } = await db.from('iap_events').insert({ event_id: eventId, platform, type });
  if (!error) return { isNew: true };
  if (error.code === '23505') return { isNew: false }; // já processado
  if (error.code === '42P01') {
    console.warn('[iap] tabela iap_events ausente — seguindo sem dedup.');
    return { isNew: true };
  }
  console.error('[iap] erro ao registrar evento:', error);
  return { isNew: true };
}
