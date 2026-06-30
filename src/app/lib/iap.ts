// =============================================================================
// Caminare — IAP no cliente (cordova-plugin-purchase / CdvPurchase v13)
// -----------------------------------------------------------------------------
// DIY, SEM RevenueCat. O plugin abre o pagamento nativo da loja (StoreKit /
// Play Billing), entrega o recibo/token, e ESTE módulo o envia pro backend
// (/api/validate-purchase) validar e ativar a assinatura. Entitlement vem
// SEMPRE do servidor (subscriptions) via useEntitlement — o cliente nunca
// decide acesso; aqui só disparamos a compra e o refresh.
//
// O plugin é um plugin Cordova embutido pelo Capacitor; expõe `window.CdvPurchase`
// no app nativo. No web (Vercel) NÃO existe — todas as funções viram no-op e a
// tela cai no preço de fallback (pricing.ts). Por isso acessamos só o global e
// nunca importamos o módulo (manteria o web limpo, sem cordova no bundle).
// =============================================================================

import { supabase } from './supabase';
import { isNative, isIOS } from './native';
import { apiUrl } from './api';
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

const ALL_PRODUCTS: { id: string; tier: Tier; cadence: Cadence }[] = [
  { id: IAP_PRODUCT_IDS.basico_monthly, tier: 'basico', cadence: 'monthly' },
  { id: IAP_PRODUCT_IDS.basico_annual, tier: 'basico', cadence: 'annual' },
  { id: IAP_PRODUCT_IDS.avancado_monthly, tier: 'avancado', cadence: 'monthly' },
  { id: IAP_PRODUCT_IDS.avancado_annual, tier: 'avancado', cadence: 'annual' },
];

function infoFor(productId: string): { tier: Tier; cadence: Cadence } | undefined {
  return ALL_PRODUCTS.find((p) => p.id === productId);
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
 * Apple: transactionId · Google: purchaseToken.
 */
export async function validatePurchase(input: {
  platform: StorePlatform;
  productId: string;
  token: string;
}): Promise<ValidatePurchaseResult> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  const url = apiUrl('/api/validate-purchase');
  let res: Response;
  try {
    res = await fetch(url, {
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
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error(`[iap] falha de rede/CORS em ${url}:`, detail);
    throw new Error(`Falha de conexão ao validar a compra (${detail}). Verifique VITE_API_BASE_URL e o CORS da função.`);
  }

  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // resposta não-JSON → tratada como erro abaixo
  }
  if (!res.ok) {
    const apiMsg = (json as { error?: string })?.error;
    const snippet = text ? text.slice(0, 300) : '(corpo vazio)';
    console.error(`[iap] validate-purchase respondeu ${res.status}:`, snippet);
    throw new Error(apiMsg || `Erro ${res.status} em /api/validate-purchase: ${snippet}`);
  }
  return json as ValidatePurchaseResult;
}

// ─── Integração com o plugin (CdvPurchase) ──────────────────────────────────
// Tipamos como `any` de propósito: o plugin é um global injetado só no nativo;
// não importamos os tipos pra não puxar cordova pro bundle web.
/* eslint-disable @typescript-eslint/no-explicit-any */

/** Visão de um produto pra UI: preço JÁ localizado pela loja. */
export interface IapOffering {
  productId: string;
  tier: Tier;
  cadence: Cadence;
  /** Preço formatado pela loja na moeda do usuário (ex.: "R$ 8,90", "$2.99"). */
  priceText: string | null;
  /** Código da moeda (ex.: "BRL", "USD"), se a loja informar. */
  currency: string | null;
  /** Preço numérico (unidade da moeda), se conhecido. */
  priceValue: number | null;
  canPurchase: boolean;
}

function cdv(): any | null {
  if (!isNative) return null;
  return (globalThis as any).CdvPurchase ?? null;
}

let initPromise: Promise<void> | null = null;
let storeReady = false;
const changeListeners = new Set<() => void>();
// Compras em andamento, resolvidas quando a transação do produto é validada+finalizada.
const pendingOrders = new Map<string, { resolve: () => void; reject: (e: Error) => void }>();

function notifyChange() {
  for (const cb of changeListeners) cb();
}

/** Aguarda o global do plugin ficar disponível (pode demorar 1 tick no boot). */
async function waitForCdv(timeoutMs = 4000): Promise<any | null> {
  if (!isNative) return null;
  const start = Date.now();
  // sem Date.now()? roda só no app nativo, ok.
  while (Date.now() - start < timeoutMs) {
    const c = cdv();
    if (c?.store) return c;
    await new Promise((r) => setTimeout(r, 100));
  }
  return cdv();
}

function platformConst(C: any): any {
  return isIOS ? C.Platform.APPLE_APPSTORE : C.Platform.GOOGLE_PLAY;
}

/** Extrai {platform, token} da transação para enviar ao backend. */
function tokenFromTransaction(C: any, tx: any): { platform: StorePlatform; token: string } {
  const isApple = tx?.platform === C.Platform.APPLE_APPSTORE;
  if (isApple) {
    return { platform: 'apple', token: tx?.transactionId };
  }
  const token =
    tx?.parentReceipt?.purchaseToken ??
    tx?.nativePurchase?.purchaseToken ??
    tx?.transactionId;
  return { platform: 'google', token };
}

async function handleApproved(C: any, tx: any): Promise<void> {
  const productId: string | undefined = tx?.products?.[0]?.id;
  try {
    const { platform, token } = tokenFromTransaction(C, tx);
    if (!productId || !token) throw new Error('Transação sem produto/token.');
    await validatePurchase({ platform, productId, token });
    // Só finaliza (libera o dinheiro) depois do backend confirmar.
    await tx.finish();
    if (productId) pendingOrders.get(productId)?.resolve();
  } catch (e) {
    // NÃO finaliza em falha de validação — deixa a loja reentregar depois.
    const err = e instanceof Error ? e : new Error('Falha ao validar a compra.');
    if (productId) pendingOrders.get(productId)?.reject(err);
    console.error('[iap] validação/finish falhou:', err.message);
  } finally {
    if (productId) pendingOrders.delete(productId);
    notifyChange();
  }
}

/**
 * Inicializa o plugin uma única vez: registra os 4 produtos e liga os listeners.
 * No web é no-op. Idempotente (retorna a mesma promise).
 */
export function initIap(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const C = await waitForCdv();
    if (!C?.store) return; // web ou plugin indisponível
    const store = C.store;
    const plat = platformConst(C);

    store.register(
      ALL_PRODUCTS.map((p) => ({
        id: p.id,
        type: C.ProductType.PAID_SUBSCRIPTION,
        platform: plat,
      })),
    );

    store
      .when()
      .approved((tx: any) => void handleApproved(C, tx))
      .productUpdated(() => notifyChange())
      .receiptUpdated(() => notifyChange());

    store.error((err: any) => {
      console.warn('[iap] store error:', err?.code, err?.message);
      notifyChange();
    });

    await store.initialize([plat]);
    storeReady = true;
    notifyChange();
  })();
  return initPromise;
}

/** Assina os eventos do plugin (produtos/recibos atualizados). */
export function onIapChange(cb: () => void): () => void {
  changeListeners.add(cb);
  return () => changeListeners.delete(cb);
}

/** Lê o offering atual da loja → preços JÁ localizados. Vazio no web. */
export function getOfferings(): IapOffering[] {
  const C = cdv();
  if (!C?.store) return [];
  return ALL_PRODUCTS.map((p) => {
    const product = C.store.get(p.id, platformConst(C));
    const offer = product?.getOffer?.();
    const phases = offer?.pricingPhases ?? [];
    // Fase recorrente = a última (assinaturas simples têm 1 fase).
    const phase = phases[phases.length - 1] ?? product?.pricing;
    return {
      productId: p.id,
      tier: p.tier,
      cadence: p.cadence,
      priceText: phase?.price ?? null,
      currency: phase?.currency ?? null,
      priceValue:
        typeof phase?.priceMicros === 'number' ? phase.priceMicros / 1_000_000 : null,
      canPurchase: Boolean(product?.canPurchase),
    } satisfies IapOffering;
  });
}

/** true se o plugin está pronto e há produtos carregados (app nativo). */
export function isIapAvailable(): boolean {
  return storeReady && getOfferings().some((o) => o.priceText);
}

/**
 * Inicia a compra de um plano. Abre o pagamento nativo; resolve quando o backend
 * valida e a transação é finalizada; rejeita em cancelamento/erro.
 */
export async function startPurchase(tier: Tier, cadence: Cadence): Promise<void> {
  const C = cdv();
  if (!C?.store) throw new Error('Compra indisponível neste dispositivo.');
  const productId = productIdFor(tier, cadence);
  const product = C.store.get(productId, platformConst(C));
  const offer = product?.getOffer?.();
  if (!offer) throw new Error('Produto não disponível na loja.');

  const done = new Promise<void>((resolve, reject) => {
    pendingOrders.set(productId, { resolve, reject });
  });

  const err = await offer.order();
  if (err) {
    pendingOrders.delete(productId);
    if (err.code === C.ErrorCode.PAYMENT_CANCELLED) {
      throw new PurchaseCancelledError();
    }
    throw new Error(err.message || 'Não foi possível concluir a compra.');
  }
  // Espera o approved → validate → finish (com teto pra não travar a UI).
  await Promise.race([
    done,
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Tempo esgotado validando a compra.')), 60_000),
    ),
  ]);
}

/** Erro de cancelamento pelo usuário — a UI trata como "sem aviso de erro". */
export class PurchaseCancelledError extends Error {
  constructor() {
    super('Compra cancelada.');
    this.name = 'PurchaseCancelledError';
  }
}

/**
 * Restaura compras: pede ao plugin as transações ativas; cada uma passa pelo
 * handler `approved` → revalida no backend → ativa a assinatura.
 */
export async function restorePurchases(): Promise<void> {
  const C = cdv();
  if (!C?.store) throw new Error('Restauração indisponível neste dispositivo.');
  const err = await C.store.restorePurchases();
  if (err) throw new Error(err.message || 'Não foi possível restaurar as compras.');
}
