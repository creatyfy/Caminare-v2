import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { TERMS_VERSION } from '../content/termsVersion';
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
    birthDate: string
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

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
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
      async signUp(name, email, password, birthDate) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              birth_date: birthDate,
              terms_accepted_at: new Date().toISOString(),
              terms_version: TERMS_VERSION,
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
            const result = await SignInWithApple.authorize({
              clientId: 'com.caminare.app',
              redirectURI: AUTH_CALLBACK_URL,
              scopes: 'name email',
              nonce: hashedNonce,
            });
            const identityToken = result.response?.identityToken;
            if (!identityToken) return { error: 'Apple não retornou um token válido.' };
            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'apple',
              token: identityToken,
              nonce: rawNonce,
            });
            return { error: error?.message ?? null };
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            // Usuário cancelou o prompt da Apple → não é erro pra mostrar.
            if (/cancel/i.test(msg) || /1001/.test(msg)) return { error: null };
            return { error: msg };
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
