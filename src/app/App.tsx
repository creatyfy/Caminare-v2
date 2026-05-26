import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import { useEffect, useState, type ReactNode } from 'react';
import './lib/i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
import { HistoryScreen } from './screens/HistoryScreen';
import { EntryDetailScreen } from './screens/EntryDetailScreen';
import { PatternsScreen } from './screens/PatternsScreen';
import { NewPatternScreen } from './screens/NewPatternScreen';
import { SummaryScreen } from './screens/SummaryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { LegalScreen } from './screens/LegalScreen';
import { AdminScreen } from './screens/AdminScreen';
import { getProfile } from './lib/db';

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
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
        <Route path="/termos" element={<LegalScreen kind="terms" />} />
        <Route path="/privacidade" element={<LegalScreen kind="privacy" />} />

        <Route path="/home" element={<RequireAuth><HomeScreen /></RequireAuth>} />
        <Route path="/gravacao" element={<RequireAuth><RecordingScreen /></RequireAuth>} />
        <Route path="/registro-texto" element={<RequireAuth><TextRecordingScreen /></RequireAuth>} />
        <Route path="/validacao-emocoes" element={<RequireAuth><EmotionValidationScreen /></RequireAuth>} />
        <Route path="/validacao-crencas" element={<RequireAuth><BeliefValidationScreen /></RequireAuth>} />
        <Route path="/historico" element={<RequireAuth><HistoryScreen /></RequireAuth>} />
        <Route path="/registro/:id" element={<RequireAuth><EntryDetailScreen /></RequireAuth>} />
        <Route path="/padroes" element={<RequireAuth><PatternsScreen /></RequireAuth>} />
        <Route path="/novo-padrao" element={<RequireAuth><NewPatternScreen /></RequireAuth>} />
        <Route path="/resumo" element={<RequireAuth><SummaryScreen /></RequireAuth>} />
        <Route path="/perfil" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminScreen /></RequireAdmin>} />
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
        <BrowserRouter>
          <div
            className="h-screen w-full max-w-[375px] mx-auto relative overflow-hidden"
            style={{ backgroundColor: 'var(--cam-bg-page)' }}
          >
            <AppRoutes />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
