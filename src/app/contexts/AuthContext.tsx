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
        const redirectTo = `${window.location.origin}/redefinir-senha`;
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
        // Redirecionando para '/' para que a SplashScreen faça o roteamento
        // baseado em admin/usuário após a autenticação OAuth.
        const redirectTo = `${window.location.origin}/`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
        return { error: error?.message ?? null };
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
