import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t('forgotPassword.errors.missingEmail'));
      return;
    }
    setSubmitting(true);
    const { error: err } = await resetPassword(trimmed);
    setSubmitting(false);
    if (err) {
      setError(translateError(err, t));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'var(--cam-bg-page)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            backgroundColor: 'var(--cam-bg-accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <CheckCircle2 size={48} color="var(--cam-color-accent)" strokeWidth={2.2} />
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            margin: '0 0 8px',
            letterSpacing: '-0.5px',
          }}
        >
          {t('forgotPassword.sentTitle')}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: 'var(--cam-text-secondary)',
            margin: '0 0 32px',
            fontWeight: 500,
            lineHeight: 1.5,
            maxWidth: 280,
          }}
        >
          <Trans
            i18nKey="forgotPassword.sentMessage"
            values={{ email }}
            components={{ strong: <strong style={{ color: 'var(--cam-text-primary)' }} /> }}
          />
        </p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          style={{
            width: '100%',
            maxWidth: 320,
            height: 56,
            borderRadius: 9999,
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            border: 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--cam-shadow-brand)',
          }}
        >
          {t('forgotPassword.backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--cam-bg-page)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 24px 40px',
        overflow: 'auto',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <button
        type="button"
        onClick={() => navigate('/login')}
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
          marginBottom: '24px',
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={20} />
        <span>{t('common.back')}</span>
      </button>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '6px',
        }}
      >
        <img
          src="/owl_cropped.png"
          alt="Caminare"
          style={{ width: 72, height: 'auto', objectFit: 'contain', display: 'block' }}
        />
        <img
          src="/text_cropped.png"
          alt="Caminare"
          style={{ width: 140, height: 'auto', objectFit: 'contain', display: 'block' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            margin: '0 0 4px',
            letterSpacing: '-0.5px',
            textAlign: 'center',
          }}
        >
          {t('forgotPassword.title')}
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--cam-text-secondary)',
            margin: 0,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {t('forgotPassword.subtitle')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            height: '56px',
            padding: '0 16px',
            backgroundColor: 'var(--cam-bg-input)',
            borderRadius: '16px',
            border: `1.5px solid var(--cam-border)`,
            boxShadow: 'var(--cam-shadow-card)',
          }}
        >
          <Mail size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('forgotPassword.emailPlaceholder')}
            autoComplete="email"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '15px',
              color: 'var(--cam-text-primary)',
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          />
        </div>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: 'var(--cam-bg-error-soft)',
              color: 'var(--cam-text-error)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: '4px',
            height: '56px',
            borderRadius: '9999px',
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: 'var(--cam-shadow-brand)',
            opacity: submitting ? 0.85 : 1,
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('forgotPassword.submitting')}
            </>
          ) : (
            t('forgotPassword.submit')
          )}
        </button>

        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--cam-text-secondary)',
            fontWeight: 500,
          }}
        >
          {t('forgotPassword.remembered')}{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cam-text-brand)',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
              fontSize: '14px',
            }}
          >
            {t('forgotPassword.goBack')}
          </button>
        </div>
      </form>
    </div>
  );
}

function translateError(msg: string, t: (k: string) => string): string {
  const m = msg.toLowerCase();
  if (m.includes('rate limit')) return t('forgotPassword.errors.rateLimit');
  if (m.includes('invalid email')) return t('forgotPassword.errors.invalidEmail');
  return msg;
}
