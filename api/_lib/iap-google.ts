// =============================================================================
// Caminare — Validação Google Play (Play Developer API) + parsing das RTDN
// -----------------------------------------------------------------------------
//  • validate-purchase: o app manda o purchaseToken; chamamos
//    purchases.subscriptionsv2.get com um access token OAuth obtido via service
//    account (JWT RS256 → token endpoint). Lemos estado + expiryTime + productId.
//  • store-webhook: Real-time Developer Notifications chegam via Pub/Sub push
//    ({ message: { data: base64, messageId } }); o `data` traz o purchaseToken e
//    re-consultamos a API pra obter o estado autoritativo.
//
// TODO(credenciais): preencher quando o Ricardo liberar o Play Console:
//   GOOGLE_IAP_PACKAGE_NAME       = applicationId do app (ex.: com.caminare.app)
//   GOOGLE_SERVICE_ACCOUNT_JSON   = JSON do service account c/ acesso à
//                                   Play Developer API  [Vercel env, secret]
//   GOOGLE_PUBSUB_VERIFICATION_TOKEN = (opcional) segredo na query do push p/
//                                      autenticar o webhook do Pub/Sub
// =============================================================================

import { signRs256Jwt } from './iap-crypto.js';
import { IapNotConfiguredError, IapValidationError, type SubStatus } from './iap-products.js';

interface GoogleConfig {
  packageName: string;
  clientEmail: string;
  privateKey: string;
  tokenUri: string;
}

function readOptional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

/** Lê as credenciais Google; lança IapNotConfiguredError listando o que falta. */
export function googleConfig(): GoogleConfig {
  const packageName = readOptional('GOOGLE_IAP_PACKAGE_NAME');
  const rawJson = readOptional('GOOGLE_SERVICE_ACCOUNT_JSON');
  const missing = [
    ['GOOGLE_IAP_PACKAGE_NAME', packageName],
    ['GOOGLE_SERVICE_ACCOUNT_JSON', rawJson],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new IapNotConfiguredError(`Google IAP não configurado: faltam ${missing.join(', ')}.`);
  }
  let sa: { client_email?: string; private_key?: string; token_uri?: string };
  try {
    sa = JSON.parse(rawJson!);
  } catch {
    throw new IapNotConfiguredError('GOOGLE_SERVICE_ACCOUNT_JSON inválido (não é JSON).');
  }
  if (!sa.client_email || !sa.private_key) {
    throw new IapNotConfiguredError('GOOGLE_SERVICE_ACCOUNT_JSON sem client_email/private_key.');
  }
  return {
    packageName: packageName!,
    clientEmail: sa.client_email,
    privateKey: sa.private_key,
    tokenUri: sa.token_uri || 'https://oauth2.googleapis.com/token',
  };
}

const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

// Cache em memória do access token (vale ~1h). Evita um round-trip OAuth por chamada.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function googleAccessToken(cfg: GoogleConfig): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const now = Math.floor(Date.now() / 1000);
  const assertion = signRs256Jwt(
    {
      header: { alg: 'RS256', typ: 'JWT' },
      payload: {
        iss: cfg.clientEmail,
        scope: SCOPE,
        aud: cfg.tokenUri,
        iat: now,
        exp: now + 3600,
      },
    },
    cfg.privateKey
  );

  const r = await fetch(cfg.tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!r.ok) {
    throw new IapValidationError(`Falha ao obter access token do Google (${r.status}).`);
  }
  const body = (await r.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new IapValidationError('Google não retornou access_token.');
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return body.access_token;
}

interface SubscriptionPurchaseV2 {
  subscriptionState?: string;
  lineItems?: Array<{ productId?: string; expiryTime?: string }>;
  linkedPurchaseToken?: string;
}

// subscriptionState → status. Segue o mapeamento pedido no spec (grace/on_hold →
// past_due; canceled → canceled; expired → expired). default null = ignora.
function mapGoogleState(state: string | undefined): SubStatus | null {
  switch (state) {
    case 'SUBSCRIPTION_STATE_ACTIVE':
      return 'active';
    case 'SUBSCRIPTION_STATE_CANCELED':
      return 'canceled';
    case 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD':
    case 'SUBSCRIPTION_STATE_ON_HOLD':
    case 'SUBSCRIPTION_STATE_PAUSED':
      return 'past_due';
    case 'SUBSCRIPTION_STATE_EXPIRED':
      return 'expired';
    default:
      return null;
  }
}

export interface GoogleSubState {
  status: SubStatus | null;
  productId: string | null;
  expiresAtISO: string | null;
  externalId: string; // purchaseToken
}

async function getSubscriptionV2(purchaseToken: string): Promise<GoogleSubState> {
  const cfg = googleConfig();
  const token = await googleAccessToken(cfg);
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/` +
    `${encodeURIComponent(cfg.packageName)}/purchases/subscriptionsv2/tokens/` +
    `${encodeURIComponent(purchaseToken)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) {
    throw new IapValidationError(`Play Developer API respondeu ${r.status}.`);
  }
  const body = (await r.json()) as SubscriptionPurchaseV2;
  const line = body.lineItems?.[0];
  return {
    status: mapGoogleState(body.subscriptionState),
    productId: line?.productId ?? null,
    expiresAtISO: line?.expiryTime ?? null,
    externalId: purchaseToken,
  };
}

/** Valida uma compra (purchaseToken) e confere o productId esperado. */
export async function validateGooglePurchase(params: {
  purchaseToken: string;
  productId: string;
}): Promise<GoogleSubState> {
  const state = await getSubscriptionV2(params.purchaseToken);
  if (state.productId && state.productId !== params.productId) {
    throw new IapValidationError('productId informado não confere com a compra.');
  }
  return state;
}

/** Estado autoritativo a partir do purchaseToken (usado pelo webhook). */
export function fetchGoogleSubState(purchaseToken: string): Promise<GoogleSubState> {
  return getSubscriptionV2(purchaseToken);
}

// ─── Notificações (Real-time Developer Notifications via Pub/Sub) ────────────

export interface GoogleNotificationData {
  purchaseToken: string | null;
  productId: string | null; // subscriptionId
  eventTimeISO: string;
  kind: 'subscription' | 'voided' | 'other';
}

interface RtdnPayload {
  eventTimeMillis?: string;
  subscriptionNotification?: { notificationType?: number; purchaseToken?: string; subscriptionId?: string };
  voidedPurchaseNotification?: { purchaseToken?: string };
}

/** Decodifica o `message.data` (base64) de uma RTDN do Pub/Sub. */
export function parseGoogleNotification(dataBase64: string): GoogleNotificationData {
  const json = JSON.parse(Buffer.from(dataBase64, 'base64').toString('utf8')) as RtdnPayload;
  const eventTimeISO = json.eventTimeMillis
    ? new Date(Number(json.eventTimeMillis)).toISOString()
    : new Date().toISOString();

  if (json.subscriptionNotification) {
    return {
      purchaseToken: json.subscriptionNotification.purchaseToken ?? null,
      productId: json.subscriptionNotification.subscriptionId ?? null,
      eventTimeISO,
      kind: 'subscription',
    };
  }
  if (json.voidedPurchaseNotification) {
    return {
      purchaseToken: json.voidedPurchaseNotification.purchaseToken ?? null,
      productId: null,
      eventTimeISO,
      kind: 'voided',
    };
  }
  return { purchaseToken: null, productId: null, eventTimeISO, kind: 'other' };
}

/** Confere o token de verificação do push do Pub/Sub, se configurado. */
export function verifyPubsubToken(queryToken: string | undefined): boolean {
  const expected = readOptional('GOOGLE_PUBSUB_VERIFICATION_TOKEN');
  if (!expected) return true; // sem token configurado → não bloqueia (gate opcional)
  return queryToken === expected;
}
