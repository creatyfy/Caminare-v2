import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
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
      </Routes>

      <Routes>
        <Route path="/home" element={<BottomNav />} />
        <Route path="/historico" element={<BottomNav />} />
        <Route path="/padroes" element={<BottomNav />} />
        <Route path="/resumo" element={<BottomNav />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="h-screen w-full max-w-[375px] mx-auto bg-[#F8F7FF] relative overflow-hidden">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
