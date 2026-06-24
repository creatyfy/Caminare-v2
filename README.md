# Caminare

App de autoconhecimento (React + Vite + TypeScript). O web roda na Vercel; os apps
nativos (iOS/Android) são empacotados com **Capacitor** sobre o mesmo build web
(`dist/`). Pagamentos via **IAP DIY** (cordova-plugin-purchase), validados no backend
Vercel (`api/validate-purchase.ts` + `api/store-webhook.ts`) — **sem RevenueCat**.

## Desenvolvimento

```bash
npm i            # instala dependências
npm run dev      # servidor de desenvolvimento (Vite)
npm run build    # build de produção web → dist/
```

Variáveis locais em `.env.local` (ver `.env.example`). O painel de teste de
assinatura (admin) só aparece em **dev** e com `VITE_SHOW_DEV_TOOLS=true`.

## Build nativo (Capacitor)

```bash
npm run native:build     # vite build + cap sync (copia o web pros projetos nativos)
npx cap sync android     # registra plugins (inclui cordova-plugin-purchase)
npx cap open android     # abre no Android Studio
```

iOS **não** é versionado (gerado no Mac/CI). Ver `guidelines/native-setup.md` e
`native/ios/`.

## Variáveis de ambiente

### Cliente (Vite — expostas ao browser, prefixo `VITE_`)
| Var | Onde | Obrigatória |
|-----|------|-------------|
| `VITE_SUPABASE_URL` | Vercel + Codemagic (`app_env`) | sim |
| `VITE_SUPABASE_ANON_KEY` | Vercel + Codemagic (`app_env`) | sim |
| `VITE_SHOW_DEV_TOOLS` | só `.env.local` (dev) | **NÃO** definir em prod/CI |

### Servidor (Vercel — Project Settings › Environment Variables, sem `VITE_`)
| Var | Para quê |
|-----|----------|
| `ANTHROPIC_API_KEY` | endpoints de IA |
| `SUPABASE_SERVICE_ROLE_KEY` | escrita server-side (ignora RLS) |
| `APPLE_IAP_BUNDLE_ID` | validação IAP Apple (`com.caminare.app`) |
| `APPLE_IAP_ISSUER_ID` | App Store Connect › Integrations |
| `APPLE_IAP_KEY_ID` | ID da chave `.p8` de In-App Purchase |
| `APPLE_IAP_PRIVATE_KEY` | conteúdo do `.p8` (com `\n`) |
| `APPLE_IAP_ENV` | `production` (ou `sandbox`) — opcional |
| `GOOGLE_IAP_PACKAGE_NAME` | validação IAP Google (`com.caminare.app`) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | service account com acesso à Play Developer API |
| `GOOGLE_PUBSUB_VERIFICATION_TOKEN` | token na URL do webhook Pub/Sub |

> Sem as vars de IAP, `validate-purchase`/`store-webhook` respondem 503 tratado
> (app não quebra, mas a compra não ativa). Detalhes em `.env.example`.

## ⚠️ Antes de enviar pras lojas — substituir placeholders

O domínio de produção ainda não foi fixado, então os arquivos de deep link usam
placeholders. **Trocar antes do build de release:**

| Placeholder | Onde | Por quê |
|-------------|------|---------|
| `__DOMINIO_PROD__` | `android/app/src/main/AndroidManifest.xml`, `native/ios/App.entitlements` | host dos Universal/App Links (ex.: `caminare.com.br`) |
| `__SHA256_FINGERPRINT_RELEASE__` | `public/.well-known/assetlinks.json` | SHA-256 da chave de release (Play Console › App Integrity, ou `keytool -list -v -keystore`) |
| `__APPLE_TEAM_ID__` | `public/.well-known/apple-app-site-association` | Team ID da Apple (`TEAMID.com.caminare.app`) |

Os arquivos `.well-known/*` são servidos pela Vercel em
`https://__DOMINIO_PROD__/.well-known/...` (já configurado em `vercel.json`).
O login social/reset continua funcionando pelo esquema custom `com.caminare.app://`
mesmo antes disso — os Universal Links são camada extra.

## Passo a passo no Mac / Codemagic (não dá pra fazer no Windows)

O `codemagic.yaml` tem dois workflows. Antes do 1º build, configurar no Codemagic:

**Android (`android` workflow)**
1. Grupo de variáveis `android_signing`: `CM_KEYSTORE` (keystore em base64),
   `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS`, `CM_KEY_PASSWORD`,
   `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` (publicar na Play).
2. Grupo `app_env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. Pegar o **SHA-256** da chave de release e preencher `assetlinks.json` (acima).

**iOS (`ios` workflow)** — gera a pasta `ios/` no Mac da CI:
1. Integração **App Store Connect API key** (`codemagic_asc_api_key`) + certificado
   de distribuição; bundle id `com.caminare.app`.
2. No **Apple Developer**, o App ID `com.caminare.app` precisa das capabilities
   **Sign in with Apple** e **Associated Domains** habilitadas (e no provisioning).
3. O workflow roda `npx cap add ios`, injeta o esquema custom no `Info.plist`
   (PlistBuddy) e copia `native/ios/App.entitlements`. Confirmar no 1º build que o
   Xcode usa o entitlements (build setting `CODE_SIGN_ENTITLEMENTS`); ver
   `native/ios/README.md`.
4. Configurar **Apple Sign in with Apple** no Supabase (Service ID, Team ID, Key ID,
   `.p8`) e adicionar os Redirect URLs nativos — ver `guidelines/native-setup.md`.

**Produtos IAP (já criados nas lojas):** `caminare_basico_mensal`,
`caminare_basico_anual`, `caminare_avancado_mensal`, `caminare_avancado_anual`
(assinaturas auto-renováveis). Os mesmos IDs valem para Apple e Google.

## Documentos de apoio
- `guidelines/native-setup.md` — config externa (Supabase, Apple, Google, deep links).
- `native/ios/README.md` — templates e capabilities do iOS.
