import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleSignInButton, AuthDivider } from '../components/GoogleSignInButton';
import { getProfile } from '../lib/db';

export function LoginScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!email || !password) {
      setError(t('login.errors.missingFields'));
      return;
    }
    setSubmitting(true);
    const { error: err, userId } = await signIn(email.trim(), password);
    if (err) {
      setSubmitting(false);
      setError(translateLoginError(err, t));
      return;
    }
    // Admin vai direto pro painel; usuário comum, pro home
    let target = '/home';
    if (userId) {
      const profile = await getProfile(userId);
      if (profile?.is_admin) target = '/admin';
    }
    setSubmitting(false);
    navigate(target, { replace: true });
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--cam-bg-login)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 24px 40px',
        overflow: 'auto',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
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
          src="/logoatualizado.png"
          alt="Caminare"
          style={{ width: 160, height: 'auto', objectFit: 'contain', display: 'block' }}
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
          {t('login.title')}
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
          {t('login.subtitle')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <InputField
          icon={<Mail size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />}
          type="email"
          placeholder={t('login.emailPlaceholder')}
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />

        <InputField
          icon={<Lock size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />}
          type={showPass ? 'text' : 'password'}
          placeholder={t('login.passwordPlaceholder')}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? t('common.hidePassword') : t('common.showPassword')}
              style={trailingButtonStyle}
            >
              {showPass ? (
                <EyeOff size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />
              ) : (
                <Eye size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />
              )}
            </button>
          }
        />

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

        <div style={{ textAlign: 'right', marginTop: '-4px' }}>
          <button
            type="button"
            onClick={() => navigate('/esqueci-senha')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--cam-text-brand)',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              fontSize: '13px',
            }}
          >
            {t('login.forgotPassword')}
          </button>
        </div>

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
            transition: 'transform 0.15s ease, opacity 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('login.submitting')}
            </>
          ) : (
            t('login.submit')
          )}
        </button>

        <AuthDivider />

        <GoogleSignInButton onError={(msg) => setError(translateLoginError(msg, t))} />

        <div
          style={{
            marginTop: '8px',
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--cam-text-secondary)',
            fontWeight: 500,
          }}
        >
          {t('login.noAccount')}{' '}
          <button
            type="button"
            onClick={() => navigate('/cadastro')}
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
            {t('login.createAccount')}
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  trailing,
  autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
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
      {icon}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
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
      {trailing}
    </div>
  );
}

const trailingButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

function translateLoginError(msg: string, t: (k: string) => string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials'))
    return t('login.errors.invalidCredentials');
  if (m.includes('email not confirmed'))
    return t('login.errors.emailNotConfirmed');
  if (m.includes('rate limit')) return t('login.errors.rateLimit');
  return msg;
}
