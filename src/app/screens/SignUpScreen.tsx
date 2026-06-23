import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Calendar, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleSignInButton, AuthDivider } from '../components/GoogleSignInButton';
import { AppleSignInButton } from '../components/AppleSignInButton';

export function SignUpScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!name.trim() || !email || !birthDate || !password) {
      setError(t('signup.errors.missingFields'));
      return;
    }
    if (password.length < 6) {
      setError(t('signup.errors.shortPassword'));
      return;
    }
    if (calcAge(birthDate) < 18) {
      setError(t('signup.errors.underage'));
      return;
    }

    setSubmitting(true);
    const { error: err } = await signUp(name.trim(), email.trim(), password, birthDate);
    setSubmitting(false);

    if (err) {
      setError(translateSignupError(err, t));
      return;
    }
    setSuccess(true);
  }

  if (success) {
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
          {t('signup.successTitle')}
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
            i18nKey="signup.successMessage"
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
          {t('signup.goLogin')}
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
        paddingTop: '24px',
        paddingRight: '24px',
        paddingBottom: '32px',
        paddingLeft: '24px',
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
        }}
      >
        <img
          src="/logoatualizado.png"
          alt="Caminare"
          style={{ width: 180, height: 'auto', objectFit: 'contain', display: 'block' }}
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
          {t('signup.title')}
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
          {t('signup.subtitle')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <InputField
          icon={<UserIcon size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />}
          type="text"
          placeholder={t('signup.namePlaceholder')}
          value={name}
          onChange={setName}
          autoComplete="name"
        />

        <InputField
          icon={<Mail size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />}
          type="email"
          placeholder={t('signup.emailPlaceholder')}
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />

        <InputField
          icon={<Calendar size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />}
          type="date"
          placeholder={t('signup.birthDatePlaceholder')}
          value={birthDate}
          onChange={setBirthDate}
          autoComplete="bday"
        />

        <InputField
          icon={<Lock size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />}
          type={showPass ? 'text' : 'password'}
          placeholder={t('signup.passwordPlaceholder')}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
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

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            cursor: 'pointer',
            marginTop: '4px',
          }}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={acceptedTerms}
            onClick={() => setAcceptedTerms((v) => !v)}
            style={{
              flexShrink: 0,
              width: '22px',
              height: '22px',
              marginTop: '1px',
              borderRadius: '6px',
              border: acceptedTerms ? 'none' : `1.5px solid var(--cam-border)`,
              backgroundColor: acceptedTerms ? 'var(--cam-color-brand)' : 'var(--cam-bg-input)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {acceptedTerms && <Check size={15} color="#FFFFFF" strokeWidth={3} />}
          </button>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--cam-text-secondary)',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            <Trans
              i18nKey="signup.acceptTerms"
              components={{
                terms: (
                  <a href="/termos" target="_blank" rel="noopener noreferrer" style={legalLinkStyle} />
                ),
                privacy: (
                  <a
                    href="/privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={legalLinkStyle}
                  />
                ),
              }}
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting || !acceptedTerms}
          style={{
            marginTop: '8px',
            height: '56px',
            borderRadius: '9999px',
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: submitting || !acceptedTerms ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: 'var(--cam-shadow-brand)',
            opacity: !acceptedTerms ? 0.55 : submitting ? 0.85 : 1,
            transition: 'transform 0.15s ease, opacity 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('signup.submitting')}
            </>
          ) : (
            t('signup.submit')
          )}
        </button>

        <AuthDivider />

        <GoogleSignInButton
          label={t('signup.google')}
          disabled={!acceptedTerms}
          onError={(msg) => setError(translateSignupError(msg, t))}
        />

        <AppleSignInButton
          label={t('signup.apple')}
          disabled={!acceptedTerms}
          onError={(msg) => setError(translateSignupError(msg, t))}
        />

        <div
          style={{
            marginTop: '8px',
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--cam-text-secondary)',
            fontWeight: 500,
          }}
        >
          {t('signup.hasAccount')}{' '}
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
            {t('signup.goToLogin')}
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

const legalLinkStyle: React.CSSProperties = {
  color: 'var(--cam-text-brand)',
  fontWeight: 700,
  textDecoration: 'underline',
};

function calcAge(birthDate: string): number {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function translateSignupError(msg: string, t: (k: string) => string): string {
  const m = msg.toLowerCase();
  if (m.includes('already registered') || m.includes('user already'))
    return t('signup.errors.alreadyRegistered');
  if (m.includes('invalid email')) return t('signup.errors.invalidEmail');
  if (m.includes('password')) return t('signup.errors.passwordInvalid');
  if (m.includes('rate limit')) return t('signup.errors.rateLimit');
  return msg;
}
