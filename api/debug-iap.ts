// =============================================================================
// GET /api/debug-iap?t=SEGREDO  ⚠️ ENDPOINT TEMPORÁRIO — REMOVER APÓS DEBUG
// -----------------------------------------------------------------------------
// Diagnóstico do 401 do validate-purchase: mostra se a APPLE_IAP_PRIVATE_KEY (ou
// _B64) que está no Vercel realmente PARSEIA e qual chave pública ela gera, pra
// comparar com a chave real local (SubscriptionKey_D6T7LQB42C.p8). NÃO vaza
// segredo: só devolve IDs (que não são segredos), um bool e o thumbprint da chave
// PÚBLICA (hash, irreversível). Usa o MESMO loadKey de produção.
//
// Protegido por token na querystring (?t=). Apagar este arquivo quando resolver.
// =============================================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createPublicKey, createHash } from 'crypto';
import { loadKey } from './_lib/iap-crypto.js';
import { sendJson } from './_lib/runtime.js';

// Token de acesso: prefere a env DEBUG_IAP_TOKEN; senão usa este fallback fixo
// (endpoint é temporário e será removido). Não é segredo de produção.
const FALLBACK_TOKEN = 'fbd51d8035486ee4ccbc5894713904faf538';

function readVar(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const expected = readVar('DEBUG_IAP_TOKEN') ?? FALLBACK_TOKEN;
  const provided = typeof req.query.t === 'string' ? req.query.t : '';
  if (!provided || provided !== expected) {
    return sendJson(res, 401, { error: 'unauthorized' });
  }

  const rawPem = readVar('APPLE_IAP_PRIVATE_KEY');
  const rawB64 = readVar('APPLE_IAP_PRIVATE_KEY_B64');
  const usedVar: 'PRIVATE_KEY' | 'B64' | null = rawPem ? 'PRIVATE_KEY' : rawB64 ? 'B64' : null;
  const keyMaterial = rawPem ?? rawB64;

  let parsed = false;
  let pubThumbprint: string | null = null;
  let parseError: string | null = null;
  if (keyMaterial) {
    try {
      const priv = loadKey(keyMaterial);
      // Thumbprint = sha256 hex do DER (SPKI) da chave PÚBLICA derivada. Não é
      // segredo (a pública é derivável e o hash é irreversível). Serve só p/
      // comparar se a chave no Vercel é a MESMA da .p8 real.
      const pubDer = createPublicKey(priv).export({ type: 'spki', format: 'der' });
      pubThumbprint = createHash('sha256').update(pubDer).digest('hex');
      parsed = true;
    } catch (e) {
      parseError = e instanceof Error ? e.message : String(e);
    }
  }

  return sendJson(res, 200, {
    APPLE_IAP_KEY_ID: readVar('APPLE_IAP_KEY_ID') ?? null,
    APPLE_IAP_ISSUER_ID: readVar('APPLE_IAP_ISSUER_ID') ?? null,
    APPLE_IAP_BUNDLE_ID: readVar('APPLE_IAP_BUNDLE_ID') ?? null,
    usedVar,
    parsed,
    pubThumbprint,
    parseError,
  });
}
