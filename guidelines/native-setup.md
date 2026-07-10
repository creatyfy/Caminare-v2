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
iOS: o `codemagic.yaml` injeta o `CFBundleURLTypes` (scheme `com.caminare.app`) no
`Info.plist` via PlistBuddy após `npx cap add ios` — não precisa fazer à mão.

## ⚠️ Configuração externa pendente (sem isto o login social não funciona no app)

### 1. Supabase — Redirect URLs
Em **Authentication → URL Configuration → Redirect URLs**, adicionar:
- `com.caminare.app://auth-callback`
- `com.caminare.app://reset-callback`
(Manter também as URLs web atuais da Vercel.)

### 2. Sign in with Apple
> ⚠️ **Causa da reprovação 2.1a (ASAuthorizationError 1000):** o IPA saía SEM a
> entitlement `com.apple.developer.applesignin`. Duas coisas precisam estar certas —
> a #A já foi corrigida no CI; a #B e #C dependem de config externa (portal/Supabase).

**A. Entitlement no build (CORRIGIDO no `codemagic.yaml`).** Copiar
`native/ios/App.entitlements` não basta: o template iOS do Capacitor não seta
`CODE_SIGN_ENTITLEMENTS`, então o Xcode ignorava o arquivo e o app assinado não tinha
a capability → erro 1000 em runtime (iPhone e iPad). O passo "Configurar iOS" agora
aponta `CODE_SIGN_ENTITLEMENTS = App/App.entitlements` no target `App` (via gem
`xcodeproj`) antes de assinar. Se rodar `npx cap add ios` à mão, faça o mesmo no Xcode
(target App → Build Settings → Code Signing Entitlements).

**B. Apple Developer (App ID).** O **App ID** `com.caminare.app` PRECISA ter
"Sign In with Apple" habilitado. Sem isso, o provisioning profile gerado pelo Codemagic
não inclui a entitlement e o build passa a FALHAR na assinatura (após o fix A). Depois
de habilitar, deixe o Codemagic regenerar o profile (o `fetch-signing-files --create`
baixa o profile atualizado). Também: criar **Service ID** + **Key** (Sign in with Apple)
e anotar Key ID e Team ID (usados no Supabase).

**C. Supabase (Apple provider).** Em **Authentication → Providers → Apple**, habilitar e
preencher Service ID (client id), Team ID, Key ID e a chave `.p8`. **Confirmar que
`com.caminare.app` (bundle id nativo) está na lista de Client IDs / "Authorized Client
IDs"** — é a audience que o Supabase valida no `signInWithIdToken` do fluxo nativo. Sem
isso o prompt da Apple até abre, mas o `signInWithIdToken` rejeita o token (não é o erro
1000, é um erro depois do prompt).

### 3. Google OAuth no app nativo
- **Google Cloud Console**: o client OAuth web do Supabase continua valendo (o fluxo
  nativo abre o browser e volta pelo deep link). Garantir que a tela de consentimento
  está publicada e o domínio do Supabase autorizado.
- Confirmar que o redirect do Supabase está na allow-list (item 1).

### 4. Gravação por voz com transcrição nativa
"Novo Registro por Voz" usa **transcrição nativa em tempo real** via
`@capacitor-community/speech-recognition` (SFSpeechRecognizer no iOS,
SpeechRecognizer no Android). No **web** o motor é a **Web Speech API**
(`webkitSpeechRecognition`). A escolha é por plataforma (`isNative`) em
`src/app/lib/speech.ts`; a UI (`TextRecordingScreen`) é a mesma nos dois.
**Nenhum áudio é gravado/armazenado** — o sistema do aparelho transcreve e o app só
guarda o texto.

Permissões/strings que entram no build nativo (já configuradas no repo):
- **iOS** (`Info.plist`): `NSMicrophoneUsageDescription` e
  `NSSpeechRecognitionUsageDescription`, ambas com
  _"O Caminare usa o microfone para transcrever sua fala em texto no seu registro."_
  → injetadas via PlistBuddy no `codemagic.yaml` (passo "Configurar iOS"), porque a
  pasta `ios/` é gerada no Mac. Se rodar `npx cap add ios` manualmente, rode também
  esse passo (ou adicione as duas chaves à mão no Xcode).
- **Android** (`AndroidManifest.xml`): `RECORD_AUDIO` + `<queries>` com
  `android.speech.RecognitionService` (visibilidade de pacote no Android 11+) — já no
  manifesto versionado.
- Rodar `npm run native:build` (faz `cap sync`) depois de instalar o plugin para
  registrar o nativo no Android/iOS.

### 5. Codemagic (build/assinatura)
- Android: grupo `android_signing` com keystore (`CM_KEYSTORE` em base64,
  `CM_KEYSTORE_PASSWORD`, `CM_KEY_ALIAS`, `CM_KEY_PASSWORD`) e
  `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` p/ publicar na Play.
- iOS: integração "App Store Connect API key" (`codemagic_asc_api_key`) + certificado
  de distribuição.
- Grupo `app_env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. **Não** definir
  `VITE_SHOW_DEV_TOOLS` (mantém o painel de teste escondido em produção).

## IAP (compras) — LIGADO

`src/app/lib/iap.ts` usa **cordova-plugin-purchase (CdvPurchase v13)** — DIY, sem
RevenueCat. O `PaywallScreen` lê o *offering* da loja (preço já localizado),
dispara a compra nativa, e ao aprovar envia o recibo/token p/ `/api/validate-purchase`
validar e ativar a assinatura. "Restaurar compras" usa `store.restorePurchases()`.
Os 4 product IDs (assinatura auto-renovável) já estão criados nas lojas.

Backend de validação precisa das env vars de loja (Vercel) — ver `.env.example` e o
README (`APPLE_IAP_*`, `GOOGLE_*`). Sem elas, a validação responde 503 tratado.

## Universal Links / App Links (camada extra ao esquema custom)

Além do `com.caminare.app://`, há suporte a links **https** abrindo o app:
- `public/.well-known/assetlinks.json` (Android) e `apple-app-site-association` (iOS),
  servidos pela Vercel (ver `vercel.json`).
- AndroidManifest tem um intent-filter `autoVerify=true`; iOS usa Associated Domains
  em `native/ios/App.entitlements`.
- ⚠️ Trocar `__DOMINIO_PROD__`, `__SHA256_FINGERPRINT_RELEASE__` e `__APPLE_TEAM_ID__`
  antes do release (ver README). A `NativeAuthBridge` já trata ambos os formatos.
