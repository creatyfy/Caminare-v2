import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import {
  getSubscription,
  countEntriesSince,
  type SubPlan,
  type SubStatus,
  type SubTier,
} from '../lib/db';

// Regras da Fase 1
export const TRIAL_LIMIT = 75;
export const TIER_LIMITS: Record<SubTier, number> = { basico: 150, avancado: 250 };

// Override de teste (admin) p/ simular a contagem de registros sem criar N
// registros de verdade. Fica só no localStorage do navegador (Fase 1 é client-side).
const DEV_OVERRIDE_KEY = 'cam_dev_entry_override';
export function getDevOverride(): number | null {
  try {
    const v = window.localStorage.getItem(DEV_OVERRIDE_KEY);
    if (v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
export function setDevOverride(n: number | null) {
  try {
    if (n === null) window.localStorage.removeItem(DEV_OVERRIDE_KEY);
    else window.localStorage.setItem(DEV_OVERRIDE_KEY, String(n));
  } catch {
    // ignore
  }
}

export type AccessLevel = 'full' | 'restricted';
export type WindowKind = 'trial' | 'month' | 'none';

export interface Entitlement {
  loading: boolean;
  status: SubStatus | 'none';
  plan: SubPlan | null;
  tier: SubTier | null;
  access: AccessLevel; // 'full' = pode usar; 'restricted' = mandar pro paywall
  used: number; // registros usados na janela atual
  limit: number; // teto da janela (75 trial; 150/250 plano; 0 restrito)
  remaining: number; // max(0, limit - used)
  canCreate: boolean; // access full E ainda dentro do teto
  windowKind: WindowKind;
  trialEndsAt: string | null;
  refresh: () => Promise<void>;
}

type EntitlementState = Omit<Entitlement, 'refresh'>;

const RESTRICTED: EntitlementState = {
  loading: false,
  status: 'none',
  plan: null,
  tier: null,
  access: 'restricted',
  used: 0,
  limit: 0,
  remaining: 0,
  canCreate: false,
  windowKind: 'none',
  trialEndsAt: null,
};

// Início do mês civil corrente (limite mensal dos planos é por mês civil).
function startOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

const EntitlementContext = createContext<Entitlement | undefined>(undefined);

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<EntitlementState>({ ...RESTRICTED, loading: true });

  const load = useCallback(async () => {
    if (!user) {
      setState(RESTRICTED);
      return;
    }

    const sub = await getSubscription(user.id);
    if (!sub) {
      // Sem linha (deveria existir via trigger) → trata como restrito.
      setState(RESTRICTED);
      return;
    }

    const override = getDevOverride();

    if (sub.status === 'active') {
      const tier: SubTier = sub.tier ?? 'basico';
      const limit = TIER_LIMITS[tier];
      const used = override ?? (await countEntriesSince(user.id, startOfMonthISO()));
      const remaining = Math.max(0, limit - used);
      setState({
        loading: false,
        status: 'active',
        plan: sub.plan,
        tier,
        access: 'full',
        used,
        limit,
        remaining,
        canCreate: remaining > 0,
        windowKind: 'month',
        trialEndsAt: sub.trial_ends_at,
      });
      return;
    }

    if (sub.status === 'trial') {
      const used =
        override ??
        (sub.created_at ? await countEntriesSince(user.id, sub.created_at) : 0);
      const withinDays = sub.trial_ends_at
        ? Date.now() < new Date(sub.trial_ends_at).getTime()
        : false;
      const underCount = used < TRIAL_LIMIT;
      const active = withinDays && underCount;
      const remaining = Math.max(0, TRIAL_LIMIT - used);
      setState({
        loading: false,
        status: 'trial',
        plan: null,
        tier: null,
        access: active ? 'full' : 'restricted',
        used,
        limit: TRIAL_LIMIT,
        remaining,
        canCreate: active && remaining > 0,
        windowKind: 'trial',
        trialEndsAt: sub.trial_ends_at,
      });
      return;
    }

    // past_due / canceled / expired → restrito
    setState({
      ...RESTRICTED,
      status: sub.status,
      plan: sub.plan,
      tier: sub.tier,
      trialEndsAt: sub.trial_ends_at,
    });
  }, [user]);

  useEffect(() => {
    setState((s) => ({ ...s, loading: true }));
    void load();
  }, [load]);

  const value = useMemo<Entitlement>(() => ({ ...state, refresh: load }), [state, load]);

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement(): Entitlement {
  const ctx = useContext(EntitlementContext);
  if (!ctx) throw new Error('useEntitlement must be used within an EntitlementProvider');
  return ctx;
}
