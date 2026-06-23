# Empacotamento nativo (Capacitor) — Fase 3

O app web (Vercel) continua sendo a fonte da verdade. O Capacitor embrulha o build
web (`dist/`) em apps iOS/Android. Bundle id / package name: **`com.caminare.app`**.

## O que já está no repo

- `capacitor.config.ts` — config do app (appId, appName, plugins).
- `android/` — projeto Android versionado (compilável). As assets web copiadas e
  configs geradas ficam fora do git (ver `android/.gitignore`).
- `src/app/lib/native.ts` — helpers de plataforma, flag de dev tools, URLs de
  redirect de auth, init nativo (status bar / splash).
- `src/app/components/NativeAuthBridge.tsx` — captura o deep link de auth e entrega
  a sessão ao Supabase (OAuth + reset de senha no app nativo).
- `src/app/components/AppleSignInButton.tsx` + `signInWithApple` no `AuthContext`.
- `codemagic.yaml` — workflows de build Android e iOS.

iOS **não** foi scaffoldado (ambiente Windows). A pasta `ios/` é gerada no Mac /
Codemagic com `npx cap add ios` (o workflow iOS já faz isso).

## Comandos

```bash
npm run native:build      # vite build + cap sync (copia o web pros nativos)
npm run cap -- open android
npx cap run android       # roda em device/emulador (precisa Android Studio/SDK)
```

No Mac, para iOS: `npx cap add ios && npx cap sync ios && npx cap open ios`.

## Deep links

Esquema custom: `com.caminare.app://`
- `com.caminare.app://auth-callback` — retorno do OAuth (Google/Apple)
- `com.caminare.app://reset-callback` — retorno do link de reset de senha

Android: intent-filter já adicionado em `android/app/src/main/AndroidManifest.xml`.
iOS (TODO no Mac): adicionar em `ios/App/App/Info.plist` o `CFBundleURLTypes` com o
scheme `com.caminare.app`.

## ⚠️ Configuração externa pendente (sem isto o login social não funciona no app)

### 1. Supabase — Redirect URLs
Em **Authentication → URL Configuration → Redirect URLs**, adicionar:
- `com.caminare.app://auth-callback`
- `com.caminare.app://reset-callback`
(Manter também as URLs web atuais da Vercel.)

### 2. Sign in with Apple
- **Apple Developer**: criar um **App ID** `com.caminare.app` com "Sign In with Apple"
  habilitado; criar um **Service ID** + **Key** (Sign in with Apple) e anotar o Key ID
  e Team ID.
- **Supabase**: em **Authentication → Providers → Apple**, habilitar e preencher o
  Service ID (client id), Team ID, Key ID e a chave `.p8`. Adicionar
  `com.caminare.app` como client id permitido (audience) p/ o fluxo nativo
  (`signInWithIdToken`).
- iOS: habilitar a capability "Sign in with Apple" no target do Xcode (o workflow de
  signing cuida do provisioning; confirmar no portal).

### 3. Google OAuth no app nativo
- **Google Cloud Console**: o client OAuth web do Supabase continua valendo (o fluxo
  nativo abre o browser e volta pelo deep link). Garantir que a tela de consentimento
  está publicada e o domínio do Supabase autorizado.
- Confirmar que o redirect do Supabase está na allow-list (item 1).

### 4. Permissão de microfone (ditado)
A voz agora usa o **ditado do teclado nativo** (não há plugin de microfone do app),
então o app **não** pede permissão de microfone. Se no futuro entrar um plugin de
speech-to-text dedicado, declarar:
- iOS: `NSMicrophoneUsageDescription` e `NSSpeechRecognitionUsageDescription` no Info.plist.
- Android: `RECORD_AUDIO` no AndroidManifest.

### 5. Codemagic (build/assinatura)
- Android: grupo `android_signing` com keystore (`CM_KEYSTORE` em base64,
  `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS`, `CM_KEY_PASSWORD`) e
  `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` p/ publicar na Play.
- iOS: integração "App Store Connect API key" (`codemagic_asc_api_key`) + certificado
  de distribuição.
- Grupo `app_env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. **Não** definir
  `VITE_SHOW_DEV_TOOLS` (mantém o painel de teste escondido em produção).

## Pendente p/ Fase 4 (IAP)

`src/app/lib/iap.ts` tem `startPurchase`/`restorePurchases` como STUB. A Fase 4 liga o
plugin de compras (StoreKit/Billing) e chama `validatePurchase` com o token real.
Sem o IAP real, **não** enviar pra revisão (a tela de planos não pode ir com botão stub).
