import type { CapacitorConfig } from '@capacitor/cli';

// Configuração do empacotamento nativo (Capacitor) — Fase 3.
// O app web (Vercel) continua intacto; aqui só descrevemos como o build web
// (pasta `dist`) é embrulhado em iOS/Android.
const config: CapacitorConfig = {
  appId: 'com.caminare.app',
  appName: 'Caminare',
  webDir: 'dist',
  // android usa esquema https no WebView (cookies/secure context p/ crypto.subtle,
  // necessário no fluxo de nonce do Sign in with Apple).
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      // Escondemos manualmente quando o React monta (ver lib/native.ts),
      // pra não mostrar tela branca entre a splash nativa e o app.
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
    Keyboard: {
      // Empurra o conteúdo ao abrir o teclado (melhor pra ditado no registro de texto).
      resize: 'native',
    },
  },
};

export default config;
