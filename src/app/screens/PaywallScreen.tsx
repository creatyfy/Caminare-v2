import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEntitlement } from '../contexts/EntitlementContext';

// Stub da Fase 2 (paywall). Por enquanto só explica que o acesso está restrito
// e oferece voltar pro início. As rotas restritas redirecionam pra cá.
export function PaywallScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { status } = useEntitlement();

  const body =
    status === 'trial'
      ? t('entitlement.paywallBodyTrialDone')
      : t('entitlement.paywallBodyGeneric');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '20px',
        padding: '24px',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          backgroundColor: 'var(--cam-bg-tint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Lock size={40} color="var(--cam-text-brand)" strokeWidth={2} />
      </div>

      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: 0 }}>
        {t('entitlement.paywallTitle')}
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: 'var(--cam-text-secondary)',
          margin: 0,
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        {body}
      </p>

      <button
        onClick={() => navigate('/historico')}
        style={{
          marginTop: '8px',
          width: '100%',
          maxWidth: 320,
          height: '56px',
          backgroundColor: 'var(--cam-color-brand)',
          color: 'var(--cam-text-on-brand)',
          borderRadius: '9999px',
          fontSize: '16px',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          boxShadow: 'var(--cam-shadow-brand)',
        }}
      >
        {t('entitlement.paywallSeeInsights')}
      </button>
      <button
        onClick={() => navigate('/home')}
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
        {t('entitlement.backHome')}
      </button>
    </div>
  );
}
