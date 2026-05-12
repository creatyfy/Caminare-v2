import { BrowserRouter, Routes, Route } from 'react-router';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { RecordingScreen } from './screens/RecordingScreen';
import { EmotionValidationScreen } from './screens/EmotionValidationScreen';
import { BeliefValidationScreen } from './screens/BeliefValidationScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { PatternsScreen } from './screens/PatternsScreen';
import { NewPatternScreen } from './screens/NewPatternScreen';
import { SummaryScreen } from './screens/SummaryScreen';

export default function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-full max-w-[375px] mx-auto bg-[#F8F7FF] relative overflow-hidden">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/gravacao" element={<RecordingScreen />} />
          <Route path="/validacao-emocoes" element={<EmotionValidationScreen />} />
          <Route path="/validacao-crencas" element={<BeliefValidationScreen />} />
          <Route path="/historico" element={<HistoryScreen />} />
          <Route path="/padroes" element={<PatternsScreen />} />
          <Route path="/novo-padrao" element={<NewPatternScreen />} />
          <Route path="/resumo" element={<SummaryScreen />} />
        </Routes>

        <Routes>
          <Route
            path="/"
            element={<BottomNav />}
          />
          <Route
            path="/historico"
            element={<BottomNav />}
          />
          <Route
            path="/padroes"
            element={<BottomNav />}
          />
          <Route
            path="/resumo"
            element={<BottomNav />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}