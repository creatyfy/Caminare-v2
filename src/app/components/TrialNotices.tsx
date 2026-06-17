import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEntitlement } from '../contexts/EntitlementContext';
import { TRIAL_NOTICE_PRICING, formatBRL } from '../lib/pricing';

// Avisos in-app (NÃO push) durante o período de teste. Aparecem 1x e são
// dispensáveis — a dispensa fica no localStorage do navegador.
//  • DIA 7  (≈8 dias restantes): "está gostando? aproveite e assine".
//  • DIA 14 (≈1 dia restante): "seu teste termina amanhã".
// Montado na Home. O dia 15+ (já restrito) cai no paywall (/assinatura), não aqui.
const DISMISS_KEY: Record<NoticeKind, string> = {
  day7: 'cam_trial_notice_day7',
  day14: 'cam_trial_notice_day14',
};

type NoticeKind = 'day7' | 'day14';

function isDismissed(kind: NoticeKind): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY[kind]) === '1';
  } catch {
    return false;
  }
}
function markDismissed(kind: NoticeKind) {
  try {
    window.localStorage.setItem(DISMISS_KEY[kind], '1');
  } catch {
    // ignore
  }
}

/** Dias inteiros restantes até o fim do trial (ceil), ou null se sem data. */
function daysRemaining(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const ms = new Date(trialEndsAt).getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function TrialNotices() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading, status, access, trialEndsAt } = useEntitlement();
  const [closed, setClosed] = useState(false);

  // Qual aviso mostrar (ou null). Só durante o trial ainda ativo.
  const kind = useMemo<NoticeKind | null>(() => {
    if (loading || status !== 'trial' || access !== 'full') return null;
    const left = daysRemaining(trialEndsAt);
    if (left == null) return null;
    if (left <= 1 && !isDismissed('day14')) return 'day14';
    if (left <= 8 && !isDismissed('day7')) return 'day7';
    return null;
  }, [loading, status, access, trialEndsAt]);

  if (!kind || closed) return null;

  const left = daysRemaining(trialEndsAt) ?? 0;
  const prices = {
    monthly: formatBRL(TRIAL_NOTICE_PRICING.monthlyBRL),
    annual: formatBRL(TRIAL_NOTICE_PRICING.annualBRL),
    pct: TRIAL_NOTICE_PRICING.discountPct,
  };
  const title = kind === 'day14' ? t('trialNotices.day14Title') : t('trialNotices.day7Title');
  const body =
    kind === 'day14'
      ? t('trialNotices.day14Body', prices)
      : t('trialNotices.day7Body', { days: left, ...prices });

  function dismiss() {
    markDismissed(kind!);
    setClosed(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--cam-bg-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 90,
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--cam-bg-card)',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: 340,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px',
          boxShadow: 'var(--cam-shadow-card)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--cam-bg-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={26} color="var(--cam-text-brand)" strokeWidth={2.2} />
        </div>

        <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: 0, lineHeight: 1.3 }}>
          {title}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {body}
        </p>

        <button
          type="button"
          onClick={() => {
            dismiss();
            navigate('/assinatura');
          }}
          style={{
            marginTop: '4px',
            width: '100%',
            height: '52px',
            borderRadius: '9999px',
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            border: 'none',
            boxShadow: 'var(--cam-shadow-brand)',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {t('trialNotices.cta')}
        </button>
        <button
          type="button"
          onClick={dismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--cam-text-secondary)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {t('trialNotices.dismiss')}
        </button>
      </div>
    </div>
  );
}
