// =============================================================================
// Caminare — Mapa de produtos das lojas (IAP) → {tier, cadência}
// -----------------------------------------------------------------------------
// FONTE ÚNICA (server) que traduz os product IDs das lojas para o que o app
// entende: tier (limite: basico 150 / avancado 250) + cadência (cobrança:
// monthly/annual → coluna `plan`). Os MESMOS IDs são usados na App Store e na
// Play Store. Espelhar em src/app/lib/iap.ts (cliente) se mudar.
// =============================================================================

export type Tier = 'basico' | 'avancado';
export type Cadence = 'monthly' | 'annual';
export type Platform = 'apple' | 'google';

// Status da assinatura usados pelo servidor (subconjunto do enum subscription_status
// que o IAP escreve; 'trial' é só do signup, não vem das lojas).
export type SubStatus = 'active' | 'past_due' | 'canceled' | 'expired';

export interface ProductInfo {
  tier: Tier;
  cadence: Cadence;
}

export const IAP_PRODUCTS: Record<string, ProductInfo> = {
  caminare_basico_mensal: { tier: 'basico', cadence: 'monthly' },
  caminare_basico_anual: { tier: 'basico', cadence: 'annual' },
  caminare_avancado_mensal: { tier: 'avancado', cadence: 'monthly' },
  caminare_avancado_anual: { tier: 'avancado', cadence: 'annual' },
};

/** Resolve um product ID das lojas → {tier, cadence}, ou null se desconhecido. */
export function productInfo(productId: string | undefined | null): ProductInfo | null {
  if (!productId) return null;
  return IAP_PRODUCTS[productId] ?? null;
}

// ─── Erros tipados ────────────────────────────────────────────────────────────
// Permitem aos endpoints distinguir "faltam credenciais da loja" (config) de
// "recibo inválido" (validação) e responder de forma tratada, sem quebrar.

/** Credenciais da loja ausentes/incompletas (env var não preenchida ainda). */
export class IapNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IapNotConfiguredError';
  }
}

/** Recibo/transação inválido ou rejeitado pela loja. */
export class IapValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IapValidationError';
  }
}
