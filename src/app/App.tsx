import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { useEffect, useState, lazy, Suspense, type ReactNode } from 'react';
import './lib/i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PendingPatternProvider } from './contexts/PendingPatternContext';
import { EntitlementProvider, useEntitlement } from './contexts/EntitlementContext';
import { BottomNav } from './components/BottomNav';
import { NativeAuthBridge } from './components/NativeAuthBridge';
import { NameGate } from './components/NameGate';
import { AttGate } from './components/AttGate';
import { SplashScreen } from './screens/SplashScreen';
import { LandingScreen } from './screens/LandingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';
import { HomeScreen } from './screens/HomeScreen';
import { TextRecordingScreen } from './screens/TextRecordingScreen';
import { EmotionValidationScreen } from './screens/EmotionValidationScreen';
import { BeliefValidationScreen } from './screens/BeliefValidationScreen';
import { EntryDoneScreen } from './screens/EntryDoneScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { EntryDetailScreen } from './screens/EntryDetailScreen';
import { PatternsScreen } from './screens/PatternsScreen';
import { NewPatternScreen } from './screens/NewPatternScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PaywallScreen } from './screens/PaywallScreen';
import { getProfile } from './lib/db';
import { isNative } from './lib/native';
import { setScreen, screenNameFromPath } from './lib/analytics';

// Telas pesadas carregadas sob demanda (code splitting):
// - LegalScreen tem o conteúdo completo dos Termos e Política em PT e EN
// - AdminScreen tem todo o painel administrativo + queries
const LegalScreen = lazy(() =>
  import('./screens/LegalScreen').then((m) => ({ default: m.LegalScreen }))
);
const DeleteAccountScreen = lazy(() =>
  import('./screens/DeleteAccountScreen').then((m) => ({ default: m.DeleteAccountScreen }))
);
const AdminScreen = lazy(() =>
  import('./screens/AdminScreen').then((m) => ({ default: m.AdminScreen }))
);

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}

// Gating de acesso (Fase 1): usuário restrito (trial expirado por dias/75 ou
// sem assinatura) é mandado pro paywall. Rotas liberadas mesmo restrito:
// /historico e /padroes (insights).
function RequireAccess({ children }: { children: ReactNode }) {
  const { loading, access } = useEntitlement();
  if (loading) return null;
  if (access === 'restricted') return <Navigate to="/assinatura" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    if (!session?.user) {
      setChecking(false);
      return;
    }
    setChecking(true);
    getProfile(session.user.id).then((p) => {
      if (!active) return;
      setIsAdmin(!!p?.is_admin);
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [session]);

  if (loading || checking) return null;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/home" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/cadastro" element={<SignUpScreen />} />
        <Route path="/esqueci-senha" element={<ForgotPasswordScreen />} />
        <Route path="/redefinir-senha" element={<ResetPasswordScreen />} />
        <Route
          path="/termos"
          element={
            <Suspense fallback={null}>
              <LegalScreen kind="terms" />
            </Suspense>
          }
        />
        <Route
          path="/privacidade"
          element={
            <Suspense fallback={null}>
              <LegalScreen kind="privacy" />
            </Suspense>
          }
        />
        <Route
          path="/excluir-conta"
          element={
            <Suspense fallback={null}>
              <DeleteAccountScreen />
            </Suspense>
          }
        />

        <Route path="/home" element={<RequireAuth><HomeScreen /></RequireAuth>} />
        <Route path="/registro-texto" element={<RequireAuth><RequireAccess><TextRecordingScreen /></RequireAccess></RequireAuth>} />
        <Route path="/validacao-emocoes" element={<RequireAuth><EmotionValidationScreen /></RequireAuth>} />
        <Route path="/validacao-crencas" element={<RequireAuth><BeliefValidationScreen /></RequireAuth>} />
        <Route path="/registro-concluido" element={<RequireAuth><EntryDoneScreen /></RequireAuth>} />
        <Route path="/historico" element={<RequireAuth><HistoryScreen /></RequireAuth>} />
        <Route path="/registro/:id" element={<RequireAuth><EntryDetailScreen /></RequireAuth>} />
        <Route path="/padroes" element={<RequireAuth><PatternsScreen /></RequireAuth>} />
        <Route path="/novo-padrao" element={<RequireAuth><NewPatternScreen /></RequireAuth>} />
        <Route path="/resumo" element={<RequireAuth><RequireAccess><SummaryScreen /></RequireAccess></RequireAuth>} />
        <Route path="/assinatura" element={<RequireAuth><PaywallScreen /></RequireAuth>} />
        <Route path="/perfil" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Suspense fallback={null}>
                <AdminScreen />
              </Suspense>
            </RequireAdmin>
          }
        />
      </Routes>

      <Routes>
        <Route path="/home" element={<BottomNav />} />
        <Route path="/historico" element={<BottomNav />} />
        <Route path="/padroes" element={<BottomNav />} />
        <Route path="/resumo" element={<BottomNav />} />
        <Route path="/perfil" element={<BottomNav />} />
      </Routes>
    </>
  );
}

// Casca raiz: decide o que renderizar em "/". No app WEB, "/" é a landing de
// marketing (página inicial exclusiva do web) — em tela cheia, fora do container
// de 375px do app. No nativo (ou em qualquer outra rota), renderiza o app normal
// dentro do container.
const FULL_WIDTH_WEB_ROUTES = ['/termos', '/privacidade', '/excluir-conta'];

function RootShell() {
  const location = useLocation();
  const path = location.pathname;

  // screen_view automático: dispara a cada mudança de rota. NO-OP até o SDK de
  // analytics estar conectado (ver src/app/lib/analytics.ts).
  useEffect(() => {
    setScreen(screenNameFromPath(path));
  }, [path]);

  if (!isNative && path === '/') return <LandingScreen />;
  // Página pública de planos/preços (link estável p/ citar nos Termos): abre a
  // landing já na seção de Planos.
  if (!isNative && path === '/planos') {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#F8F7FF' }}>
        <iframe
          src="/landing.html#planos"
          title="Planos Caminare"
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        />
      </div>
    );
  }
  // Páginas públicas (jurídicas/informativas) abrem em largura cheia no web,
  // como páginas de site normais — não na coluna de 375px do app. No nativo
  // seguem no layout do app.
  if (!isNative && FULL_WIDTH_WEB_ROUTES.includes(path)) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100dvh',
          overflow: 'hidden',
          backgroundColor: 'var(--cam-bg-page)',
        }}
      >
        <AppRoutes />
      </div>
    );
  }
  return (
    <div
      className={`w-full ${isNative ? '' : 'max-w-[375px]'} mx-auto relative overflow-hidden`}
      style={{
        backgroundColor: 'var(--cam-bg-page)',
        height: '100dvh',
        boxSizing: 'border-box',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <AppRoutes />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EntitlementProvider>
          <BrowserRouter>
            <PendingPatternProvider>
              <NativeAuthBridge />
              <NameGate />
              <AttGate />
              {/* Container raiz do app (375px no web, edge-to-edge no nativo) fica
                  encapsulado no RootShell — que também decide mostrar a landing de
                  marketing em "/" quando é web. */}
              <RootShell />
            </PendingPatternProvider>
          </BrowserRouter>
        </EntitlementProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
