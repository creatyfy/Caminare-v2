// =============================================================================
// Encaminhamento server-side de conversões para a Meta (Conversions API / CAPI).
// -----------------------------------------------------------------------------
// Espelha o que _lib/analytics.ts faz pro GA4, mas pro pixel/dataset da Meta.
// Usado pelo store-webhook (assinatura/conversão de trial). É NO-OP até
// META_PIXEL_ID + META_ACCESS_TOKEN estarem no ambiente, então pode ser
// commitado sem quebrar nada e sem gerar erro.
//
// Config (Vercel env, quando o pixel da Calíope estiver criado):
//   META_PIXEL_ID      -> ID do dataset/pixel (só o número)
//   META_ACCESS_TOKEN  -> token de acesso da CAPI (System User token)
//   META_TEST_EVENT_CODE (opcional) -> código do "Testar eventos" p/ validar
//
// Privacidade: NENHUM conteúdo do usuário vai daqui. O único identificador
// enviado é o external_id (id estável do usuário/assinatura) já com hash SHA-256,
// como a Meta exige. Sem e-mail, sem telefone.
// =============================================================================

import { createHash } from 'node:crypto';

const GRAPH_VERSION = 'v21.0';

export interface MetaConversion {
  /** Nome do evento padrão da Meta: 'Subscribe' | 'StartTrial' | 'Purchase' ... */
  eventName: string;
  /** Id estável do usuário/assinatura (external_id). Vira hash antes de enviar. */
  externalId: string;
  /** Dados opcionais da conversão (value, currency, etc.). Sem PII. */
  customData?: Record<string, string | number | boolean | null | undefined>;
  /** Id único do evento p/ dedupe com o pixel do browser (opcional). */
  eventId?: string;
}

/** SHA-256 em minúsculas/sem espaços, como a Meta pede pro external_id. */
function hash(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

/** Remove null/undefined dos custom_data. */
function clean(
  params: Record<string, string | number | boolean | null | undefined> = {}
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    out[k] = v;
  }
  return out;
}

/**
 * Envia uma conversão à Meta via CAPI. No-op se as credenciais ou o externalId
 * não estiverem presentes. Nunca lança — analytics não pode quebrar o webhook.
 */
export async function trackMetaConversion(conv: MetaConversion): Promise<void> {
  try {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    if (!pixelId || !accessToken || !conv.externalId) return; // no-op até configurar

    const url =
      `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events` +
      `?access_token=${encodeURIComponent(accessToken)}`;

    const event: Record<string, unknown> = {
      event_name: conv.eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'app',
      user_data: { external_id: [hash(conv.externalId)] },
      custom_data: clean(conv.customData),
    };
    if (conv.eventId) event.event_id = conv.eventId;

    const body: Record<string, unknown> = { data: [event] };
    const testCode = process.env.META_TEST_EVENT_CODE;
    if (testCode) body.test_event_code = testCode;

    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // silencioso de propósito — nunca quebra o fluxo do servidor
  }
}
