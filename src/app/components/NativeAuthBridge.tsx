import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { isNative } from '../lib/native';

// Ponte de deep link (Fase 3, só nativo). No web o supabase-js já trata a sessão
// na URL (detectSessionInUrl). No app nativo o redirect de OAuth (Google/Apple) e
// o link de reset de senha do e-mail chegam por deep link (com.caminare.app://...),
// então capturamos a URL aqui e entregamos a sessão ao Supabase.
export function NativeAuthBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative) return;
    let removed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let listener: { remove: () => void } | null = null;

    async function handleUrl(rawUrl: string) {
      let url: URL;
      try {
        url = new URL(rawUrl);
      } catch {
        return;
      }
      // Só nos interessam os callbacks de auth.
      if (!rawUrl.includes('auth-callback') && !rawUrl.includes('reset-callback')) {
        return;
      }
      const isReset = rawUrl.includes('reset-callback');
      const hash = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const code = url.searchParams.get('code');
      const errorDesc =
        url.searchParams.get('error_description') ?? hashParams.get('error_description');

      // Fecha o browser in-app aberto pro OAuth (se houver).
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();
      } catch {
        // ignore — pode não ter sido aberto via plugin
      }

      if (errorDesc) {
        console.error('[NativeAuthBridge] erro no callback de auth:', errorDesc);
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          console.error('[NativeAuthBridge] setSession falhou:', error.message);
          return;
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error('[NativeAuthBridge] exchangeCodeForSession falhou:', error.message);
          return;
        }
      } else {
        return;
      }

      if (removed) return;
      navigate(isReset ? '/redefinir-senha' : '/', { replace: true });
    }

    (async () => {
      const { App } = await import('@capacitor/app');
      // App aberto a frio por um link (cold start).
      try {
        const launch = await App.getLaunchUrl();
        if (launch?.url) void handleUrl(launch.url);
      } catch {
        // ignore
      }
      listener = await App.addListener('appUrlOpen', ({ url }) => {
        void handleUrl(url);
      });
    })();

    return () => {
      removed = true;
      listener?.remove();
    };
  }, [navigate]);

  return null;
}
