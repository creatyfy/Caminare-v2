// =============================================================================
// Caminare — Camada nativa (Capacitor) — Fase 3
// -----------------------------------------------------------------------------
// Helpers de plataforma + inicialização nativa (status bar, splash) + montagem
// das URLs de redirect de auth (web x app). No browser/Vercel tudo isto é no-op
// ou usa window.location; no app nativo usa os plugins e o deep link.
// =============================================================================

import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'web' | 'ios' | 'android'
export const isIOS = platform === 'ios';
export const isAndroid = platform === 'android';

// Painel de teste de assinatura (admin): só aparece quando a flag está ligada.
// Em produção (build da loja / Vercel sem a env) fica escondido — exigência da
// Apple/Google de não deixar ferramenta de teste visível.
export const showDevTools = import.meta.env.VITE_SHOW_DEV_TOOLS === 'true';

// Esquema de deep link do app (precisa bater com o intent-filter do Android e o
// CFBundleURLSchemes do iOS, e estar na allow-list de Redirect URLs do Supabase).
const APP_SCHEME = 'com.caminare.app';
export const AUTH_CALLBACK_URL = `${APP_SCHEME}://auth-callback`;
export const RESET_CALLBACK_URL = `${APP_SCHEME}://reset-callback`;

/**
 * URL de redirect pós-OAuth (Google/Apple). No web volta pra raiz (a Splash
 * roteia); no app nativo volta pelo deep link, capturado por NativeAuthBridge.
 */
export function getOAuthRedirectUrl(): string {
  if (isNative) return AUTH_CALLBACK_URL;
  return `${window.location.origin}/`;
}

/**
 * URL de redirect do e-mail de redefinição de senha. No web abre /redefinir-senha;
 * no app nativo abre o deep link de reset.
 */
export function getResetRedirectUrl(): string {
  if (isNative) return RESET_CALLBACK_URL;
  return `${window.location.origin}/redefinir-senha`;
}

/**
 * Inicialização nativa: ajusta a status bar e esconde a splash quando o app
 * montou. No web é no-op. Importado dinamicamente p/ não inchar o bundle web.
 */
export async function initNative(): Promise<void> {
  if (!isNative) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });
    if (isAndroid) {
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    }
  } catch (e) {
    console.warn('[native] StatusBar indisponível:', e);
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (e) {
    console.warn('[native] SplashScreen indisponível:', e);
  }
}
