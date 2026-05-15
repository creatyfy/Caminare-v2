import { Mic, ArrowLeft, Edit3, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export function RecordingScreen() {
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
      }}
    >
      <div style={{ padding: '32px 24px 12px 24px' }}>
        <button
          onClick={() => navigate('/home')}
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
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 4px 0' }}>
          {t('recording.title')}
        </h1>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'var(--cam-bg-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mic size={56} color="var(--cam-text-brand)" strokeWidth={2} />
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--cam-color-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid var(--cam-bg-page)`,
            }}
          >
            <Sparkles size={16} color="#FFFFFF" strokeWidth={2.5} />
          </div>
        </div>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            margin: 0,
            letterSpacing: '-0.3px',
          }}
        >
          {t('recording.comingSoonTitle')}
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--cam-text-secondary)',
            margin: 0,
            maxWidth: 320,
            lineHeight: 1.5,
          }}
        >
          {t('recording.comingSoonMessage')}
        </p>

        <button
          onClick={() => navigate('/registro-texto')}
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
            gap: '10px',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--cam-shadow-brand)',
          }}
        >
          <Edit3 size={20} strokeWidth={2.5} />
          {t('recording.useTextInstead')}
        </button>
      </div>
    </div>
  );
}
