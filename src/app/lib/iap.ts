// =============================================================================
// Caminare — Gancho de IAP no cliente (estrutura; sem UI de compra ainda)
// -----------------------------------------------------------------------------
// FASE 4: o backend (/api/validate-purchase) já valida e ativa a assinatura.
// FASE 3 (Capacitor): o plugin de compras (StoreKit/Billing) entregará o
// token/recibo real, que esta camada envia pro backend validar.
//
// Hoje NADA aqui é chamado pela UI — o botão "Assinar" segue STUB. Isto existe
// só pra a tela ter onde plugar quando o IAP entrar. Entitlement vem SEMPRE do
// servidor (subscriptions) via useEntitlement — nunca confiar no cliente.
// =============================================================================

import { supabase } from './supabase';
import type { Cadence, Tier } from './pricing';

export type StorePlatform = 'apple' | 'google';

// Product IDs das lojas — os MESMOS na App Store e na Play Store.
// Espelha api/_lib/iap-products.ts (server); manter os dois em sincronia.
export const IAP_PRODUCT_IDS: Record<`${Tier}_${Cadence}`, string> = {
  basico_monthly: 'caminare_basico_mensal',
  basico_annual: 'caminare_basico_anual',
  avancado_monthly: 'caminare_avancado_mensal',
  avancado_annual: 'caminare_avancado_anual',
};

export function productIdFor(tier: Tier, cadence: Cadence): string {
  return IAP_PRODUCT_IDS[`${tier}_${cadence}`];
}

export interface ValidatePurchaseResult {
  status: string;
  tier?: Tier;
  cadence?: Cadence;
  sub_status?: string;
  current_period_end?: string | null;
}

/**
 * Envia o token/recibo da loja pro backend validar e ativar a assinatura.
 * Já funcional; a Fase 3 vai chamá-la com o token vindo do plugin de compras.
 */
export async function validatePurchase(input: {
  platform: StorePlatform;
  productId: string;
  token: string; // Apple: transactionId · Google: purchaseToken
}): Promise<ValidatePurchaseResult> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  const res = await fetch('/api/validate-purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      platform: input.platform,
      product_id: input.productId,
      token: input.token,
    }),
  });

  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // resposta não-JSON → tratada como erro abaixo
  }
  if (!res.ok) {
    throw new Error((json as { error?: string })?.error || `Erro ${res.status}`);
  }
  return json as ValidatePurchaseResult;
}

/**
 * STUB do fluxo de compra. A Fase 3 (Capacitor) liga aqui o plugin nativo de
 * compras: abre a loja, obtém o token e chama validatePurchase().
 * TODO(Fase 3): implementar com o plugin de IAP do Capacitor.
 */
export async function startPurchase(_tier: Tier, _cadence: Cadence): Promise<never> {
  throw new Error('Compra ainda não disponível (IAP entra na Fase 3).');
}

/**
 * STUB de "Restaurar compras". A Fase 3 vai obter as transações ativas do plugin
 * e revalidá-las via validatePurchase().
 * TODO(Fase 3): implementar restauração com o plugin de IAP do Capacitor.
 */
export async function restorePurchases(): Promise<never> {
  throw new Error('Restauração ainda não disponível (IAP entra na Fase 3).');
}
