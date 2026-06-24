// =============================================================================
// Caminare — hook de IAP pra UI (PaywallScreen)
// -----------------------------------------------------------------------------
// Inicializa o plugin, reflete o offering da loja (preços localizados) e expõe
// comprar/restaurar. No web tudo fica "indisponível" e a tela usa o fallback.
// =============================================================================

import { useCallback, useEffect, useState } from 'react';
import {
  initIap,
  onIapChange,
  getOfferings,
  isIapAvailable,
  startPurchase,
  restorePurchases,
  PurchaseCancelledError,
  type IapOffering,
} from './iap';
import { isNative } from './native';
import type { Cadence, Tier } from './pricing';

export interface UseIap {
  /** true enquanto o plugin carrega o offering (só nativo). */
  loading: boolean;
  /** true quando há preços de loja pra exibir (app nativo configurado). */
  available: boolean;
  /** Offering por productId → preço localizado. */
  offerings: Map<string, IapOffering>;
  /** Compra em andamento (qualquer plano). */
  purchasing: boolean;
  /** Restauração em andamento. */
  restoring: boolean;
  purchase: (tier: Tier, cadence: Cadence) => Promise<'ok' | 'cancelled'>;
  restore: () => Promise<void>;
}

export function useIap(): UseIap {
  const [loading, setLoading] = useState(isNative);
  const [offerings, setOfferings] = useState<Map<string, IapOffering>>(new Map());
  const [available, setAvailable] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let alive = true;
    const sync = () => {
      if (!alive) return;
      const list = getOfferings();
      setOfferings(new Map(list.map((o) => [o.productId, o])));
      setAvailable(isIapAvailable());
    };
    const off = onIapChange(sync);
    void initIap().finally(() => {
      if (!alive) return;
      sync();
      setLoading(false);
    });
    return () => {
      alive = false;
      off();
    };
  }, []);

  const purchase = useCallback(async (tier: Tier, cadence: Cadence) => {
    setPurchasing(true);
    try {
      await startPurchase(tier, cadence);
      return 'ok' as const;
    } catch (e) {
      if (e instanceof PurchaseCancelledError) return 'cancelled' as const;
      throw e;
    } finally {
      setPurchasing(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setRestoring(true);
    try {
      await restorePurchases();
    } finally {
      setRestoring(false);
    }
  }, []);

  return { loading, available, offerings, purchasing, restoring, purchase, restore };
}
