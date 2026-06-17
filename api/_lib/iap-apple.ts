// =============================================================================
// Caminare — Validação Apple (App Store Server API) + parsing das notificações
// -----------------------------------------------------------------------------
// Fluxo StoreKit 2 (sem verifyReceipt legado):
//  • validate-purchase: o app manda o transactionId; chamamos a App Store Server
//    API (GET /inApps/v1/transactions/{id}), que devolve um JWS assinado com a
//    transação. Decodificamos o payload e extraímos tier/validade/originalTxId.
//  • store-webhook: App Store Server Notifications V2 mandam um `signedPayload`
//    (JWS) com a notificação; decodificamos e mapeamos pro status da assinatura.
//
// TODO(assinatura): ainda NÃO verificamos a cadeia x5c do JWS contra a Apple Root
// CA. Na validate-purchase a resposta vem autenticada da própria API Apple (TLS +
// nosso JWT), então é segura; no webhook a verificação x5c deve ser adicionada
// antes de confiar no payload em produção. Marcado abaixo em parseAppleNotification.
//
// TODO(credenciais): preencher quando o Ricardo liberar o App Store Connect:
//   APPLE_IAP_BUNDLE_ID   = bundle id do app (ex.: com.caminare.app)
//   APPLE_IAP_ISSUER_ID   = Issuer ID da chave da App Store Server API
//   APPLE_IAP_KEY_ID      = Key ID (.p8)
//   APPLE_IAP_PRIVATE_KEY = conteúdo da chave .p8 (ES256)  [Vercel env, secret]
//   APPLE_IAP_ENV         = 'production' | 'sandbox' (opcional; default production)
// =============================================================================

import { decodeJws, signEs256Jwt } from './iap-crypto.js';
import { IapNotConfiguredError, IapValidationError, type SubStatus } from './iap-products.js';

interface AppleConfig {
  bundleId: string;
  issuerId: string;
  keyId: string;
  privateKey: string;
  environment: 'production' | 'sandbox';
}

function readOptional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

/** Lê as credenciais Apple; lança IapNotConfiguredError listando o que falta. */
export function appleConfig(): AppleConfig {
  const bundleId = readOptional('APPLE_IAP_BUNDLE_ID');
  const issuerId = readOptional('APPLE_IAP_ISSUER_ID');
  const keyId = readOptional('APPLE_IAP_KEY_ID');
  const privateKey = readOptional('APPLE_IAP_PRIVATE_KEY');
  const missing = [
    ['APPLE_IAP_BUNDLE_ID', bundleId],
    ['APPLE_IAP_ISSUER_ID', issuerId],
    ['APPLE_IAP_KEY_ID', keyId],
    ['APPLE_IAP_PRIVATE_KEY', privateKey],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new IapNotConfiguredError(`Apple IAP não configurado: faltam ${missing.join(', ')}.`);
  }
  const environment = readOptional('APPLE_IAP_ENV') === 'sandbox' ? 'sandbox' : 'production';
  return { bundleId: bundleId!, issuerId: issuerId!, keyId: keyId!, privateKey: privateKey!, environment };
}

const API_BASE: Record<AppleConfig['environment'], string> = {
  production: 'https://api.storekit.itunes.apple.com',
  sandbox: 'https://api.storekit-sandbox.itunes.apple.com',
};

// JWT de autenticação na App Store Server API (validade curta, aud fixo).
function appStoreApiJwt(cfg: AppleConfig): string {
  const now = Math.floor(Date.now() / 1000);
  return signEs256Jwt(
    {
      header: { alg: 'ES256', kid: cfg.keyId, typ: 'JWT' },
      payload: {
        iss: cfg.issuerId,
        iat: now,
        exp: now + 60 * 5,
        aud: 'appstoreconnect-v1',
        bid: cfg.bundleId,
      },
    },
    cfg.privateKey
  );
}

interface AppleTransaction {
  productId: string;
  originalTransactionId: string;
  bundleId?: string;
  expiresDate?: number; // epoch ms
}

export interface AppleValidationResult {
  productId: string;
  originalTransactionId: string; // vira external_id
  expiresAtISO: string | null;
}

/**
 * Valida um transactionId na App Store Server API e devolve os dados normalizados.
 * Tenta produção e, em 404, o ambiente sandbox (transações de TestFlight/sandbox).
 */
export async function validateApplePurchase(params: {
  transactionId: string;
  productId: string;
}): Promise<AppleValidationResult> {
  const cfg = appleConfig();
  const jwt = appStoreApiJwt(cfg);

  const order: AppleConfig['environment'][] =
    cfg.environment === 'production' ? ['production', 'sandbox'] : ['sandbox', 'production'];

  let lastStatus = 0;
  for (const env of order) {
    const url = `${API_BASE[env]}/inApps/v1/transactions/${encodeURIComponent(params.transactionId)}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${jwt}` } });
    if (r.status === 404) {
      lastStatus = 404;
      continue; // tenta o outro ambiente
    }
    if (!r.ok) {
      throw new IapValidationError(`App Store Server API respondeu ${r.status}.`);
    }
    const body = (await r.json()) as { signedTransactionInfo?: string };
    if (!body.signedTransactionInfo) {
      throw new IapValidationError('Resposta da Apple sem signedTransactionInfo.');
    }
    const { payload } = decodeJws<AppleTransaction>(body.signedTransactionInfo);

    if (payload.bundleId && payload.bundleId !== cfg.bundleId) {
      throw new IapValidationError('bundleId da transação não confere.');
    }
    if (payload.productId !== params.productId) {
      throw new IapValidationError('productId informado não confere com a transação.');
    }
    return {
      productId: payload.productId,
      originalTransactionId: payload.originalTransactionId,
      expiresAtISO: payload.expiresDate ? new Date(payload.expiresDate).toISOString() : null,
    };
  }

  throw new IapValidationError(
    lastStatus === 404 ? 'Transação não encontrada na Apple.' : 'Falha ao validar na Apple.'
  );
}

// ─── Notificações (App Store Server Notifications V2) ────────────────────────

export interface AppleNotificationResult {
  eventId: string; // notificationUUID (idempotência)
  type: string; // notificationType (ex.: DID_RENEW)
  eventTimeISO: string; // signedDate
  externalId: string; // originalTransactionId
  status: SubStatus | null; // null = evento que não muda o status (ignorar)
  periodEndISO: string | null;
  productId: string | null;
}

interface AppleNotificationPayload {
  notificationType: string;
  subtype?: string;
  notificationUUID: string;
  signedDate?: number;
  data?: {
    bundleId?: string;
    environment?: string;
    signedTransactionInfo?: string;
    signedRenewalInfo?: string;
  };
}

// notificationType → status da assinatura. Eventos puramente informativos
// devolvem null (não mexem no status).
function mapAppleStatus(type: string, subtype?: string): SubStatus | null {
  switch (type) {
    case 'SUBSCRIBED':
    case 'DID_RENEW':
    case 'OFFER_REDEEMED':
    case 'DID_CHANGE_RENEWAL_PREF':
      return 'active';
    case 'DID_CHANGE_RENEWAL_STATUS':
      // Liga/desliga renovação automática: o acesso continua até o fim do período.
      return subtype === 'AUTO_RENEW_ENABLED' ? 'active' : null;
    case 'DID_FAIL_TO_RENEW':
      // Em retry de cobrança / período de carência → past_due (ainda tem acesso).
      return 'past_due';
    case 'GRACE_PERIOD_EXPIRED':
    case 'EXPIRED':
      return 'expired';
    case 'REFUND':
    case 'REVOKE':
      return 'canceled';
    default:
      return null;
  }
}

/**
 * Decodifica o `signedPayload` de uma App Store Server Notification V2 e devolve
 * os dados normalizados para atualizar a assinatura (ou status null = ignorar).
 *
 * TODO(assinatura x5c): verificar a cadeia de certificados do JWS contra a Apple
 * Root CA antes de confiar no payload em produção.
 */
export function parseAppleNotification(signedPayload: string): AppleNotificationResult {
  const { payload } = decodeJws<AppleNotificationPayload>(signedPayload);
  const tx = payload.data?.signedTransactionInfo
    ? decodeJws<AppleTransaction>(payload.data.signedTransactionInfo).payload
    : null;

  return {
    eventId: payload.notificationUUID,
    type: payload.notificationType,
    eventTimeISO: new Date(payload.signedDate ?? Date.now()).toISOString(),
    externalId: tx?.originalTransactionId ?? '',
    status: mapAppleStatus(payload.notificationType, payload.subtype),
    periodEndISO: tx?.expiresDate ? new Date(tx.expiresDate).toISOString() : null,
    productId: tx?.productId ?? null,
  };
}
