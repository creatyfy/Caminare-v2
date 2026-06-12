import { Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

// Tela de conclusão exibida ao fim de um registro (depois das crenças), para
// evitar o "corte seco" de voltar direto para a home.
export function EntryDoneScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 16px',
          gap: '20px',
        }}
      >
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            backgroundColor: 'var(--cam-color-brand-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--cam-shadow-brand)',
          }}
        >
          <Check size={44} color="#FFFFFF" strokeWidth={2.5} />
        </div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            margin: 0,
            letterSpacing: '-0.3px',
          }}
        >
          {t('entryDone.title')}
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
          {t('entryDone.message')}
        </p>

        <button
          onClick={() => navigate('/home')}
          style={{
            marginTop: '12px',
            width: '100%',
            maxWidth: 320,
            height: '56px',
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--cam-shadow-brand)',
          }}
        >
          {t('entryDone.backHome')}
        </button>
      </div>
    </div>
  );
}
