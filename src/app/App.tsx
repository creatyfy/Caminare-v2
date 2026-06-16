import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { useEffect, useState, lazy, Suspense, type ReactNode } from 'react';
import './lib/i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PendingPatternProvider } from './contexts/PendingPatternContext';
import { EntitlementProvider, useEntitlement } from './contexts/EntitlementContext';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RecordingScreen } from './screens/RecordingScreen';
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

// Telas pesadas carregadas sob demanda (code splitting):
// - LegalScreen tem o conteúdo completo dos Termos e Política em PT e EN
// - AdminScreen tem todo o painel administrativo + queries
const LegalScreen = lazy(() =>
  import('./screens/LegalScreen').then((m) => ({ default: m.LegalScreen }))
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

        <Route path="/home" element={<RequireAuth><HomeScreen /></RequireAuth>} />
        <Route path="/gravacao" element={<RequireAuth><RequireAccess><RecordingScreen /></RequireAccess></RequireAuth>} />
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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EntitlementProvider>
          <BrowserRouter>
            <PendingPatternProvider>
              <div
                className="h-screen w-full max-w-[375px] mx-auto relative overflow-hidden"
                style={{ backgroundColor: 'var(--cam-bg-page)' }}
              >
                <AppRoutes />
              </div>
            </PendingPatternProvider>
          </BrowserRouter>
        </EntitlementProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
