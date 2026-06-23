// Gera o "Secret Key (for OAuth)" do Sign in with Apple: um JWT ES256 assinado
// com a chave .p8. Sem dependências (usa o crypto nativo do Node).
//
//   node gen-apple-secret.mjs
//
// Imprime SÓ o token no console. O JWT expira em ~6 meses (limite da Apple) e
// precisa ser regerado depois disso.
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';

const TEAM_ID = 'N4GBC57KVM'; // iss
const KEY_ID = 'W4CP53BY4J'; // kid
const SERVICES_ID = 'com.caminare.app.signin'; // sub
const AUDIENCE = 'https://appleid.apple.com';
const P8_PATH = 'AuthKey_W4CP53BY4J.p8';

const b64url = (input) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const now = Math.floor(Date.now() / 1000);
const exp = now + 180 * 24 * 60 * 60; // 180 dias

const header = { alg: 'ES256', kid: KEY_ID };
const payload = { iss: TEAM_ID, iat: now, exp, aud: AUDIENCE, sub: SERVICES_ID };

const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;

const privateKey = crypto.createPrivateKey(readFileSync(P8_PATH));
const signature = crypto.sign('SHA256', Buffer.from(signingInput), {
  key: privateKey,
  dsaEncoding: 'ieee-p1363', // JWS exige r||s cru (não DER)
});

console.log(`${signingInput}.${b64url(signature)}`);
