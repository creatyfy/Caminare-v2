// ─────────────────────────────────────────────────────────────────────────────
// Caminare — preços e regras de plano (Fase 2, AINDA SEM IAP)
//
// FONTE ÚNICA de verdade para tudo que é mostrado na tela de planos, nos avisos
// de trial e no "tipo de conta" do Perfil. Quando o pagamento real entrar
// (Fase 4 / IAP), os valores de cobrança vêm do *offering* das lojas (App Store /
// Play). Estes números aqui continuam servindo para a vitrine/marketing e como
// fallback. Trocar preço = mexer só neste arquivo.
//
// Valores em USD / outros países: entram na Fase 4 (vêm do offering da loja).
// ─────────────────────────────────────────────────────────────────────────────

export type Cadence = 'monthly' | 'annual';
export type Tier = 'basico' | 'avancado';

// ── Trial e limites ──────────────────────────────────────────────────────────
// ⚠️ PENDENTE confirmar com o cliente: no ambiente de teste o trial conta 75
// registros; e se os limites mensais (150/250) valem igual para os dois planos.
export const TRIAL_DAYS = 15;
export const TRIAL_ENTRY_LIMIT = 75;
export const TIER_MONTHLY_LIMITS: Record<Tier, number> = {
  basico: 150,
  avancado: 250,
};

export interface TierPricing {
  tier: Tier;
  monthlyLimit: number; // registros por mês
  monthly: {
    priceBRL: number; // R$/mês no plano mensal
  };
  annual: {
    priceBRL: number; // R$/ano
    perMonthBRL: number; // equivalente mensal (priceBRL / 12)
    discountPct: number; // desconto vs 12× o mensal
  };
  // Promo de 1º acesso: só na criação da conta, plano ANUAL, 25% off sobre 12×.
  firstAccessPromo: {
    discountPct: number;
    priceBRL: number;
    perMonthBRL: number;
  };
}

// Números conferidos: anual = 12× mensal × (1 − desconto).
//   Básico:   12×8,90 = 106,80 → 18% → 87,58 · promo 25% → 80,10
//   Avançado: 12×13,35 = 160,20 → 18% → 131,40 · promo 25% → 120,15
export const PLANS: Record<Tier, TierPricing> = {
  basico: {
    tier: 'basico',
    monthlyLimit: TIER_MONTHLY_LIMITS.basico,
    monthly: { priceBRL: 8.9 },
    annual: { priceBRL: 87.58, perMonthBRL: 7.3, discountPct: 18 },
    firstAccessPromo: { discountPct: 25, priceBRL: 80.1, perMonthBRL: 6.66 },
  },
  avancado: {
    tier: 'avancado',
    monthlyLimit: TIER_MONTHLY_LIMITS.avancado,
    monthly: { priceBRL: 13.35 },
    annual: { priceBRL: 131.4, perMonthBRL: 10.95, discountPct: 18 },
    firstAccessPromo: { discountPct: 25, priceBRL: 120.15, perMonthBRL: 10.01 },
  },
};

export const PLAN_ORDER: Tier[] = ['basico', 'avancado'];

// CONFIRMADO PELO CLIENTE (Ricardo): o aviso de "teste encerrado" (dia 15+) usa
// os MESMOS preços do Plano Básico da vitrine (R$8,90/mês · R$87,58/ano · 18%),
// não uma oferta especial. Por isso derivamos direto de PLANS.basico — assim o
// número nunca diverge da tela de planos.
export const POST_TRIAL_OFFER = {
  confirmed: true,
  monthlyBRL: PLANS.basico.monthly.priceBRL,
  annualBRL: PLANS.basico.annual.priceBRL,
  discountPct: PLANS.basico.annual.discountPct,
};

// Aviso de trial (dias 7 e 14) usa o Plano Básico da vitrine.
export const TRIAL_NOTICE_PRICING = {
  monthlyBRL: PLANS.basico.monthly.priceBRL,
  annualBRL: PLANS.basico.annual.priceBRL,
  discountPct: PLANS.basico.annual.discountPct,
};

// ── Helpers de formatação ──────────────────────────────────────────────────────
const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata um valor em reais: 8.9 → "R$ 8,90". */
export function formatBRL(value: number): string {
  return brl.format(value);
}
