// =============================================================================
// POST /api/store-webhook
// -----------------------------------------------------------------------------
// Recebe as notificações server-to-server das lojas e atualiza `subscriptions`
// por external_id (renovação/cancelamento/reembolso/grace). Um único endpoint
// detecta a origem pelo formato do corpo:
//   • Apple: App Store Server Notifications V2  → { signedPayload }
//   • Google: Real-time Developer Notifications (Pub/Sub push) → { message: {data,messageId} }
//
// IDEMPOTENTE: dedup por event_id (iap_events) + guarda de fora-de-ordem em
// applyEntitlementByExternalId. Sem credenciais da loja, responde 200 'skipped'
// (não quebra e não provoca tempestade de retries).
//
// URLs a configurar nas lojas (quando o Ricardo liberar):
//   Apple  → App Store Connect: https://<app>/api/store-webhook
//   Google → Pub/Sub push para: https://<app>/api/store-webhook?token=<GOOGLE_PUBSUB_VERIFICATION_TOKEN>
// =============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJsonBody, serviceClient, sendJson, sendError } from './_lib/runtime.js';
import { applyCors } from './_lib/cors.js';
import { productInfo, IapNotConfiguredError } from './_lib/iap-products.js';
import { parseAppleNotification } from './_lib/iap-apple.js';
import {
  parseGoogleNotification,
  fetchGoogleSubState,
  verifyPubsubToken,
} from './_lib/iap-google.js';
import {
  applyEntitlementByExternalId,
  recordWebhookEvent,
  type EntitlementUpdate,
} from './_lib/iap-subscriptions.js';

export const config = { maxDuration: 30 };

interface Body {
  signedPayload?: string; // Apple
  message?: { data?: string; messageId?: string }; // Google Pub/Sub push
}

type Db = ReturnType<typeof serviceClient>;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res)) return;

  const body = readJsonBody<Body>(req, res);
  if (!body) return;

  const db = serviceClient();
  try {
    if (body.signedPayload) return await handleApple(db, body.signedPayload, res);
    if (body.message?.data) return await handleGoogle(db, req, body.message, res);
    return sendJson(res, 200, { status: 'ignored', reason: 'payload não reconhecido' });
  } catch (err) {
    if (err instanceof IapNotConfiguredError) {
      console.warn('[store-webhook] loja não configurada:', err.message);
      // 200 de propósito: sem credenciais não há o que processar; evita retries.
      return sendJson(res, 200, { status: 'skipped', reason: 'not_configured' });
    }
    console.error('[store-webhook] falha ao processar:', err);
    // 5xx → a loja reenvia depois (idempotência cobre o reprocessamento).
    return sendError(res, 500, 'Erro ao processar a notificação.');
  }
}

async function handleApple(db: Db, signedPayload: string, res: VercelResponse) {
  const n = parseAppleNotification(signedPayload);

  const { isNew } = await recordWebhookEvent(db, n.eventId, 'apple', n.type);
  if (!isNew) return sendJson(res, 200, { status: 'duplicate' });

  if (!n.status || !n.externalId) {
    return sendJson(res, 200, { status: 'ignored', type: n.type });
  }

  const info = productInfo(n.productId);
  const update: EntitlementUpdate = {
    status: n.status,
    tier: info?.tier ?? null,
    cadence: info?.cadence ?? null,
    currentPeriodEnd: n.periodEndISO,
    externalId: n.externalId,
    source: 'apple',
  };
  const r = await applyEntitlementByExternalId(db, update);
  return sendJson(res, 200, { status: 'ok', type: n.type, matched: r.matched, applied: r.applied });
}

async function handleGoogle(
  db: Db,
  req: VercelRequest,
  message: NonNullable<Body['message']>,
  res: VercelResponse
) {
  const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
  if (!verifyPubsubToken(queryToken)) {
    return sendError(res, 403, 'token de verificação do Pub/Sub inválido.');
  }

  const data = parseGoogleNotification(message.data!);

  const { isNew } = await recordWebhookEvent(db, message.messageId, 'google', data.kind);
  if (!isNew) return sendJson(res, 200, { status: 'duplicate' });

  if (!data.purchaseToken) return sendJson(res, 200, { status: 'ignored', kind: data.kind });

  // Reembolso/chargeback → revoga.
  if (data.kind === 'voided') {
    const r = await applyEntitlementByExternalId(db, {
      status: 'canceled',
      externalId: data.purchaseToken,
      source: 'google',
    });
    return sendJson(res, 200, { status: 'ok', kind: 'voided', matched: r.matched, applied: r.applied });
  }

  // Demais eventos: consulta o estado autoritativo na Play Developer API.
  const state = await fetchGoogleSubState(data.purchaseToken);
  if (!state.status) return sendJson(res, 200, { status: 'ignored', state: 'sem_mapeamento' });

  const info = productInfo(state.productId ?? data.productId);
  const r = await applyEntitlementByExternalId(db, {
    status: state.status,
    tier: info?.tier ?? null,
    cadence: info?.cadence ?? null,
    currentPeriodEnd: state.expiresAtISO,
    externalId: data.purchaseToken,
    source: 'google',
  });
  return sendJson(res, 200, { status: 'ok', matched: r.matched, applied: r.applied });
}
