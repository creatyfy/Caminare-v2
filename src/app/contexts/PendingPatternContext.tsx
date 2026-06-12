import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { getPendingPattern, type PatternFull } from '../lib/db';

// Estado compartilhado do "padrão pendente" do usuário. Evita consultar o banco
// em loop: busca quando o usuário muda e expõe refresh() para revalidar após
// terminar um registro (detecção) ou após confirmar/descartar/editar o padrão.
interface PendingPatternValue {
  pattern: PatternFull | null;
  loading: boolean;
  refresh: () => Promise<void>;
  clear: () => void;
}

const PendingPatternContext = createContext<PendingPatternValue>({
  pattern: null,
  loading: false,
  refresh: async () => {},
  clear: () => {},
});

export function PendingPatternProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pattern, setPattern] = useState<PatternFull | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setPattern(null);
      return;
    }
    setLoading(true);
    const p = await getPendingPattern(user.id);
    setPattern(p);
    setLoading(false);
  }, [user]);

  const clear = useCallback(() => setPattern(null), []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <PendingPatternContext.Provider value={{ pattern, loading, refresh, clear }}>
      {children}
    </PendingPatternContext.Provider>
  );
}

export function usePendingPattern() {
  return useContext(PendingPatternContext);
}
