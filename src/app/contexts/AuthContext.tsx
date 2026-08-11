import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { TERMS_VERSION } from '../content/termsVersion';
import { track } from '../lib/analytics';
import {
  isNative,
  isIOS,
  getOAuthRedirectUrl,
  getResetRedirectUrl,
  AUTH_CALLBACK_URL,
} from '../lib/native';

// Nonce p/ o fluxo nativo do Sign in with Apple: o app envia o SHA-256 do nonce
// pra Apple e o nonce cru pro Supabase (signInWithIdToken) — Supabase confere.
function generateRawNonce(length = 32): string {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => ('0' + b.toString(16)).slice(-2)).join('');
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => ('0' + b.toString(16)).slice(-2)).join('');
}

// Traduz o erro nativo do Sign in with Apple (ASAuthorizationError) numa mensagem
// amigável. O plugin rejeita com o localizedDescription cru — algo como
// "...AuthorizationError error 1000.)" — que não serve pro usuário. Devolver:
//   { cancelled }  → usuário fechou o prompt; não é erro pra mostrar.
//   { message }    → texto pronto pra tela.
// Códigos: 1000 unknown · 1001 canceled · 1002 invalidResponse · 1003 notHandled
//          1004 failed · 1005 notInteractive.
function describeAppleError(raw: string): { cancelled: boolean; message: string } {
  const codeMatch = raw.match(/error\s+(100[0-9])/i);
  const code = codeMatch ? Number(codeMatch[1]) : null;

  // Cancelamento: usuário fechou o prompt. Silencioso.
  if (code === 1001 || /cancel/i.test(raw)) {
    return { cancelled: true, message: '' };
  }

  // 1000 (unknown) em device real é quase sempre configuração de assinatura:
  // a entitlement "Sign in with Apple" não está no build/provisioning. Damos uma
  // mensagem acionável em vez do texto técnico da Apple.
  if (code === 1000) {
    return {
      cancelled: false,
      message:
        'Não foi possível iniciar o Sign in with Apple. Tente novamente ou use outra forma de entrar.',
    };
  }

  if (code === 1004 || code === 1002) {
    return {
      cancelled: false,
      message: 'A Apple não conseguiu concluir o login. Tente novamente em instantes.',
    };
  }

  return {
    cancelled: false,
    message: 'Não foi possível entrar com a Apple. Tente novamente ou use outra forma de entrar.',
  };
}

// Abre um provedor OAuth (web: redirect normal; nativo: browser in-app + deep link).
async function startOAuth(provider: 'google' | 'apple'): Promise<{ error: string | null }> {
  const redirectTo = getOAuthRedirectUrl();
  if (isNative) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return { error: error.message };
    if (data?.url) {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: data.url });
    }
    return { error: null };
  }
  const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
  return { error: error?.message ?? null };
}

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; userId: string | null }>;
  signUp: (
    name: string,
    email: string,
    password: string,
    birthDate: string,
    nativeLanguage: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // IDs de usuário que já tiveram o evento de auth disparado nesta sessão do app,
  // pra o SIGNED_IN (que pode reemitir em refresh/restore) não duplicar contagem.
  const authTrackedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      // Eventos de OAuth (Google/Apple) são disparados aqui, no ponto central,
      // porque o sucesso é assíncrono (redirect). Login/cadastro por EMAIL já
      // disparam nas telas, então filtramos só provedores OAuth pra não duplicar.
      const user = newSession?.user;
      if (event === 'SIGNED_IN' && user) {
        const provider = user.app_metadata?.provider;
        const isOAuth = provider === 'google' || provider === 'apple';
        if (isOAuth && !authTrackedRef.current.has(user.id)) {
          authTrackedRef.current.add(user.id);
          // Novo usuário: conta criada há pouco (janela de 2 min) = cadastro.
          const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
          const isNew = createdAt > 0 && Date.now() - createdAt < 120_000;
          track(isNew ? 'sign_up' : 'login', { method: provider });
          if (isNew) track('trial_started', { trial_days: 15 });
        }
      }
      if (event === 'SIGNED_OUT') {
        authTrackedRef.current.clear();
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        return {
          error: error?.message ?? null,
          userId: data?.user?.id ?? null,
        };
      },
      async signUp(name, email, password, birthDate, nativeLanguage) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              birth_date: birthDate,
              terms_accepted_at: new Date().toISOString(),
              terms_version: TERMS_VERSION,
              // Afirmacao explicita de maioridade exigida no cadastro (juridico).
              age_confirmed_at: new Date().toISOString(),
              // Idioma nativo: padrao da transcricao por voz e dos insights.
              native_language: nativeLanguage,
            },
          },
        });
        return { error: error?.message ?? null };
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async resetPassword(email) {
        const redirectTo = getResetRedirectUrl();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        return { error: error?.message ?? null };
      },
      async updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error: error?.message ?? null };
      },
      async changePassword(currentPassword, newPassword) {
        const email = session?.user?.email;
        if (!email) return { error: 'Sessão inválida. Faça login novamente.' };
        if (currentPassword === newPassword)
          return { error: 'A nova senha deve ser diferente da atual.' };
        if (newPassword.length < 6)
          return { error: 'A nova senha deve ter ao menos 6 caracteres.' };

        const { error: verifyErr } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });
        if (verifyErr) return { error: 'Senha atual incorreta.' };

        const { error: updateErr } = await supabase.auth.updateUser({
          password: newPassword,
        });
        return { error: updateErr?.message ?? null };
      },
      async signInWithGoogle() {
        // Web: redirect pra '/' (a Splash roteia). Nativo: browser in-app e o
        // retorno chega por deep link (NativeAuthBridge).
        return startOAuth('google');
      },
      async signInWithApple() {
        // iOS nativo: fluxo nativo da Apple (plugin) + signInWithIdToken.
        if (isNative && isIOS) {
          try {
            const rawNonce = generateRawNonce();
            const hashedNonce = await sha256Hex(rawNonce);
            const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
            // clientId/redirectURI só valem no fallback web/Android do plugin; no iOS
            // nativo o ASAuthorizationAppleIDProvider usa o bundle id do app. Mantidos
            // por compatibilidade da assinatura do método.
            const result = await SignInWithApple.authorize({
              clientId: 'com.caminare.app',
              redirectURI: AUTH_CALLBACK_URL,
              scopes: 'name email',
              nonce: hashedNonce,
            });
            const identityToken = result.response?.identityToken;
            if (!identityToken) {
              return { error: 'A Apple não retornou um token válido. Tente novamente.' };
            }
            // Supabase confere sha256(rawNonce) contra a claim nonce do token e valida
            // a audience (bundle id) contra a lista de Client IDs do provider Apple.
            // Passar o nonce CRU é obrigatório: sem ele o token não valida e o fluxo
            // fica travado (a promise resolve com erro, mas antes ficava girando).
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'apple',
              token: identityToken,
              nonce: rawNonce,
            });
            if (error) {
              console.warn('[apple-signin] signInWithIdToken falhou:', error.message);
              return { error: error.message };
            }
            console.info('[apple-signin] sessão criada:', !!data?.session);
            return { error: null };
          } catch (e) {
            const raw = e instanceof Error ? e.message : String(e);
            const { cancelled, message } = describeAppleError(raw);
            // Cancelamento não vira erro na tela; loga o cru p/ diagnóstico.
            if (cancelled) return { error: null };
            console.warn('[apple-signin] falha nativa:', raw);
            return { error: message };
          }
        }
        // Web e Android: OAuth da Apple via Supabase (redirect/browser).
        return startOAuth('apple');
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
