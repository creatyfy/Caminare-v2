// =============================================================================
// POST /api/validate-purchase
// -----------------------------------------------------------------------------
// Chamado pelo app logo após uma compra na loja. Valida o recibo/transação na
// loja correspondente e, em sucesso, ativa a assinatura do usuário autenticado
// em `subscriptions` (status='active', tier+cadência do mapa de produtos,
// current_period_end da loja, external_id, source). Entitlement vem SEMPRE do
// servidor — o cliente nunca decide acesso.
//
// Sem as credenciais da loja (env vars), responde 503 tratado (não quebra).
// =============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJsonBody, requireUser, serviceClient, sendJson, sendError } from './_lib/runtime.js';
import {
  productInfo,
  IapNotConfiguredError,
  IapValidationError,
  type Platform,
  type SubStatus,
} from './_lib/iap-products.js';
import { validateApplePurchase } from './_lib/iap-apple.js';
import { validateGooglePurchase } from './_lib/iap-google.js';
import { applyEntitlementForUser } from './_lib/iap-subscriptions.js';

export const config = { maxDuration: 30 };

interface Body {
  platform?: Platform;
  token?: string; // Apple: transactionId · Google: purchaseToken
  product_id?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = readJsonBody<Body>(req, res);
  if (!body) return;

  const user = await requireUser(req, res);
  if (!user) return;

  const platform = body.platform;
  const token = (body.token ?? '').trim();
  const productId = (body.product_id ?? '').trim();

  if (platform !== 'apple' && platform !== 'google') {
    return sendError(res, 400, "plataforma inválida (use 'apple' ou 'google').");
  }
  if (!token) return sendError(res, 400, 'token/recibo é obrigatório.');
  const info = productInfo(productId);
  if (!info) return sendError(res, 400, 'product_id desconhecido.');

  try {
    let externalId: string;
    let expiresAtISO: string | null;
    let status: SubStatus = 'active';

    if (platform === 'apple') {
      const r = await validateApplePurchase({ transactionId: token, productId });
      externalId = r.originalTransactionId;
      expiresAtISO = r.expiresAtISO;
    } else {
      const r = await validateGooglePurchase({ purchaseToken: token, productId });
      externalId = r.externalId;
      expiresAtISO = r.expiresAtISO;
      status = r.status ?? 'active';
    }

    const db = serviceClient();
    const { error } = await applyEntitlementForUser(db, user.id, {
      status,
      tier: info.tier,
      cadence: info.cadence,
      currentPeriodEnd: expiresAtISO,
      externalId,
      source: platform,
    });
    if (error) {
      console.error('[validate-purchase] erro ao salvar assinatura:', error);
      return sendError(res, 500, 'Não foi possível salvar a assinatura.');
    }

    return sendJson(res, 200, {
      status: 'ok',
      tier: info.tier,
      cadence: info.cadence,
      sub_status: status,
      current_period_end: expiresAtISO,
    });
  } catch (err) {
    if (err instanceof IapNotConfiguredError) {
      console.error('[validate-purchase] loja não configurada:', err.message);
      return sendError(res, 503, 'Pagamento ainda não disponível.');
    }
    if (err instanceof IapValidationError) {
      console.warn('[validate-purchase] recibo rejeitado:', err.message);
      return sendError(res, 422, 'Não foi possível confirmar a compra.');
    }
    console.error('[validate-purchase] falha inesperada:', err);
    return sendError(res, 502, 'Não foi possível validar a compra agora. Tente novamente.');
  }
}
