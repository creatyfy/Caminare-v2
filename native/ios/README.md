# Configuração nativa do iOS (templates)

A pasta `ios/` **não** é versionada — é gerada no Mac/Codemagic com `npx cap add ios`.
Estes arquivos são os pedaços de configuração que o CI (ou você, no Mac) aplica em
cima do projeto gerado. Ver `codemagic.yaml` (workflow `ios`) e
`guidelines/native-setup.md`.

## Arquivos

- **`App.entitlements`** — copiado para `ios/App/App/App.entitlements`. Habilita
  *Sign in with Apple* e *Associated Domains* (Universal Links). Antes do release,
  trocar `__DOMINIO_PROD__` pelo domínio real.

## Info.plist — adições (feitas via PlistBuddy no CI)

O `Info.plist` gerado pelo Capacitor **não** traz o esquema custom de deep link.
O CI adiciona via PlistBuddy (ver codemagic.yaml). Equivalente manual no Xcode:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.caminare.app</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.caminare.app</string>
    </array>
  </dict>
</array>
```

> Microfone: a voz usa o ditado do teclado nativo (sem plugin de microfone do app),
> então **não** declaramos `NSMicrophoneUsageDescription`. Só será necessário se
> entrar um plugin de speech-to-text dedicado no futuro.

## Capabilities que precisam estar no App ID / provisioning (Apple Developer)

Automatizar a edição do `project.pbxproj` é frágil; por isso estas duas capabilities
devem estar habilitadas no **App ID `com.caminare.app`** e no perfil de
provisionamento de distribuição usado pelo Codemagic:

1. **Sign in with Apple**
2. **Associated Domains**

O `xcode-project use-profiles` do Codemagic aplica o perfil; o `App.entitlements`
copiado declara as duas chaves. Se o build reclamar de entitlement não suportado
pelo perfil, é porque a capability não está no App ID — habilitar no portal.
