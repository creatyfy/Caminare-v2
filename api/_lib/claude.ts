// =============================================================================
// Caminare — Wrapper do Claude (Anthropic SDK)
// -----------------------------------------------------------------------------
// Centraliza: modelo, prompt caching no bloco SISTEMA, retry simples (1 tentativa
// extra) e extração defensiva do JSON retornado.
// =============================================================================

import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from './runtime.js';

export const CLAUDE_MODEL = 'claude-sonnet-4-5';

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  // timeout por chamada < maxDuration (30s) do endpoint, deixando folga p/ retry.
  _client = new Anthropic({ apiKey: ANTHROPIC_API_KEY(), timeout: 25_000, maxRetries: 0 });
  return _client;
}

/**
 * Executa uma chamada ao Claude e devolve o JSON parseado da resposta.
 *
 * @param systemPrompt Bloco SISTEMA fixo — recebe cache_control: ephemeral
 *                     (prompt caching), pois é longo e imutável entre chamadas.
 * @param userContent  Parte variável (contexto + dados/relato) no turno do user.
 * @param maxTokens    Limite de tokens de saída.
 */
export async function runStructured<T>(
  systemPrompt: string,
  userContent: string,
  maxTokens: number
): Promise<T> {
  const doCall = () =>
    client().messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          // Prompt caching: reaproveita o prefixo fixo entre chamadas, reduzindo
          // custo e latência. (Cache só ativa acima do mínimo de tokens do modelo.)
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userContent }],
    });

  let raw: Anthropic.Message;
  try {
    raw = await doCall();
  } catch (err) {
    // Retry simples: 1 tentativa extra antes de desistir.
    console.error('[claude] primeira tentativa falhou, tentando novamente:', err);
    raw = await doCall();
  }

  const text = raw.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  return extractJson<T>(text);
}

/**
 * Extrai e parseia JSON de uma string, tolerando cercas de código (```json)
 * ou texto acidental ao redor do objeto.
 */
export function extractJson<T>(text: string): T {
  let candidate = text.trim();

  // Remove cercas de código, se houver.
  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidate = fence[1].trim();

  // Tenta parse direto.
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Fallback: recorta do primeiro { (ou [) até o último } (ou ]).
    const firstObj = candidate.indexOf('{');
    const firstArr = candidate.indexOf('[');
    const start =
      firstObj === -1 ? firstArr : firstArr === -1 ? firstObj : Math.min(firstObj, firstArr);
    const lastObj = candidate.lastIndexOf('}');
    const lastArr = candidate.lastIndexOf(']');
    const end = Math.max(lastObj, lastArr);
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    }
    throw new Error('Resposta da IA não continha JSON válido.');
  }
}
