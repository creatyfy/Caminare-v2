import { Sparkles, Check, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export function NewPatternScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        paddingBottom: '40px',
      }}
    >
      <div style={{ padding: '48px 24px 24px 24px' }}>
        <button
          onClick={() => navigate('/validacao-crencas')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--cam-text-brand)',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: 500,
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--cam-color-brand-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: 'var(--cam-shadow-brand)',
          }}
        >
          <Sparkles size={36} color="#FFFFFF" strokeWidth={2} />
        </div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            textAlign: 'center',
            margin: '0 0 12px 0',
          }}
        >
          {t('newPattern.title')}
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--cam-text-secondary)',
            textAlign: 'center',
            margin: '0 auto 32px auto',
            maxWidth: '280px',
            lineHeight: 1.4,
          }}
        >
          {t('newPattern.subtitle')}
        </p>

        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'var(--cam-shadow-card)',
            margin: '0 24px 32px 24px',
            width: 'calc(100% - 48px)',
            maxWidth: '400px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--cam-color-brand)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                lineHeight: 1.4,
              }}
            >
              {t('newPattern.badge')}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--cam-text-primary)', margin: '0 0 8px 0' }}>
              {t('newPattern.descriptionLabel')}
            </h4>
            <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {t('newPattern.descriptionText')}
            </p>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--cam-text-primary)', margin: '0 0 8px 0' }}>
              {t('newPattern.triggersLabel')}
            </h4>
            <ul
              style={{
                fontSize: '15px',
                color: 'var(--cam-text-secondary)',
                lineHeight: 1.6,
                margin: 0,
                paddingLeft: '20px',
                listStyleType: 'disc',
                listStylePosition: 'outside',
              }}
            >
              <li style={{ display: 'list-item' }}>Apresentações importantes</li>
              <li style={{ display: 'list-item' }}>Reuniões com superiores</li>
              <li style={{ display: 'list-item' }}>Situações de avaliação</li>
            </ul>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            padding: '0 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '448px',
            boxSizing: 'border-box',
          }}
        >
          <button
            onClick={() => navigate('/home')}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: 'var(--cam-color-accent)',
              color: '#FFFFFF',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--cam-shadow-accent)',
            }}
          >
            <Check size={20} strokeWidth={2.5} />
            {t('newPattern.confirmPattern')}
          </button>

          <button
            onClick={() => navigate('/home')}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: 'transparent',
              color: 'var(--cam-text-error)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 600,
              border: `1px solid var(--cam-text-error)`,
              cursor: 'pointer',
            }}
          >
            <X size={20} strokeWidth={2.5} />
            {t('newPattern.notApplies')}
          </button>
        </div>
      </div>
    </div>
  );
}
