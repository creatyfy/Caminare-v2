// =============================================================================
// Caminare — Utilidades de cripto para IAP (JWS/JWT), sem dependências externas
// -----------------------------------------------------------------------------
// • decodeJws: lê o PAYLOAD de um JWS (transações assinadas da Apple, payloads
//   das notificações). NÃO verifica assinatura — ver TODO em iap-apple.ts.
// • signEs256Jwt: JWT ES256 para autenticar na App Store Server API (chave .p8).
// • signRs256Jwt: JWT RS256 para obter access token OAuth do Google (service acct).
// Usa apenas o módulo `crypto` nativo do Node (runtime da Vercel).
// =============================================================================

import { createSign, sign as cryptoSign, type KeyObject, createPrivateKey } from 'crypto';

export function base64urlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

export function base64urlEncode(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

export interface DecodedJws<T = Record<string, unknown>> {
  header: Record<string, unknown>;
  payload: T;
}

/**
 * Decodifica um JWS compacto (header.payload.signature) e devolve header+payload.
 * ⚠️ NÃO valida a assinatura — quem chama deve verificar (ou confiar na origem,
 * ex.: resposta autenticada da própria App Store Server API).
 */
export function decodeJws<T = Record<string, unknown>>(jws: string): DecodedJws<T> {
  const parts = jws.split('.');
  if (parts.length !== 3) {
    throw new Error('JWS malformado (esperado header.payload.signature).');
  }
  const header = JSON.parse(base64urlDecode(parts[0]).toString('utf8'));
  const payload = JSON.parse(base64urlDecode(parts[1]).toString('utf8')) as T;
  return { header, payload };
}

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
}

function encodeSigningInput({ header, payload }: JwtParts): string {
  return `${base64urlEncode(JSON.stringify(header))}.${base64urlEncode(JSON.stringify(payload))}`;
}

/**
 * JWT ES256 (ECDSA P-256 + SHA-256) assinado com a chave .p8 da App Store.
 * `dsaEncoding: 'ieee-p1363'` faz o Node emitir a assinatura no formato JOSE
 * (r||s) exigido por JWT — sem isso o crypto devolveria DER e a Apple recusa.
 */
export function signEs256Jwt(parts: JwtParts, privateKeyPem: string): string {
  const key = loadKey(privateKeyPem);
  const signingInput = encodeSigningInput(parts);
  const signature = cryptoSign('sha256', Buffer.from(signingInput), {
    key,
    dsaEncoding: 'ieee-p1363',
  });
  return `${signingInput}.${base64urlEncode(signature)}`;
}

/** JWT RS256 (RSA + SHA-256) assinado com a private_key do service account Google. */
export function signRs256Jwt(parts: JwtParts, privateKeyPem: string): string {
  const signingInput = encodeSigningInput(parts);
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(privateKeyPem);
  return `${signingInput}.${base64urlEncode(signature)}`;
}

// Normaliza a chave .p8/PEM vinda de env var — que quase sempre chega "suja"
// (copiar/colar no Vercel/Windows): aspas em volta, \r reais do clipboard (CRLF),
// \r/\n literais escapados. Sem essa limpeza o createPrivateKey estoura e a Apple
// só devolve 401 lá na frente. Também aceita a .p8 inteira em base64 (sem headers
// PEM), que é imune a problema de quebra de linha.
function normalizePem(input: string): string {
  let s = input.trim();
  // Remove um par de aspas simples/duplas em volta (colagem em YAML/CLI).
  if (
    s.length >= 2 &&
    ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
  ) {
    s = s.slice(1, -1);
  }
  // \r literais (\\r) e reais fora; \n literais (\\n) viram quebra real.
  s = s
    .replace(/\\r/g, '')
    .replace(/\r/g, '')
    .replace(/\\n/g, '\n')
    .trim();
  return s;
}

export function loadKey(pem: string): KeyObject {
  const normalized = normalizePem(pem);
  // Se não parece PEM, tratar como base64 da .p8 inteira e decodificar (blindagem
  // extra: base64 não sofre com \r\n). Suporta APPLE_IAP_PRIVATE_KEY_B64 também.
  const pemText = normalized.includes('-----BEGIN')
    ? normalized
    : Buffer.from(normalized.replace(/\s+/g, ''), 'base64').toString('utf8');
  return createPrivateKey(pemText);
}
