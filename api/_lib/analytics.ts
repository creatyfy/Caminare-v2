// =============================================================================
// Encaminhamento server-side de eventos para o GA4 (Measurement Protocol).
// -----------------------------------------------------------------------------
// Usado pelos endpoints de análise (analysis_prompt_run) e pelo store-webhook
// (renovação/cancelamento/reembolso). É NO-OP até GA4_MEASUREMENT_ID +
// GA4_API_SECRET estarem no ambiente, então pode ser commitado sem quebrar nada.
//
// Atenção: para os eventos caírem no MESMO usuário da análise no GA4, o ideal é
// enviar o client_id/app_instance_id do GA4 daquele usuário. Enquanto isso não
// é guardado por usuário, passamos um id estável (ex.: user_id) como fallback —
// serve pra contagem, mas não junta com as sessões do app. Ver Mapa de Eventos.
// =============================================================================

const MP_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

export interface ServerEvent {
  name: string;
  params?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Envia um evento ao GA4 via Measurement Protocol. No-op se as credenciais ou o
 * clientId não estiverem presentes. Nunca lança — analytics não pode quebrar o
 * fluxo do servidor.
 */
export async function trackServer(
  clientId: string | null | undefined,
  event: ServerEvent
): Promise<void> {
  try {
    const measurementId = process.env.GA4_MEASUREMENT_ID;
    const apiSecret = process.env.GA4_API_SECRET;
    if (!measurementId || !apiSecret || !clientId) return; // no-op até configurar

    const url =
      `${MP_ENDPOINT}?measurement_id=${encodeURIComponent(measurementId)}` +
      `&api_secret=${encodeURIComponent(apiSecret)}`;

    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name: event.name, params: event.params ?? {} }],
      }),
    });
  } catch {
    // silencioso de propósito
  }
}
