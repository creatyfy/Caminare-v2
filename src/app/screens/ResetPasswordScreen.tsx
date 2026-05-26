import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        setInvalidLink(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        setReady(true);
      } else {
        const timer = setTimeout(() => {
          if (!active) return;
          supabase.auth.getSession().then(({ data: d2 }) => {
            if (!active) return;
            if (d2.session) setReady(true);
            else setInvalidLink(true);
          });
        }, 1500);
        return () => clearTimeout(timer);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (password.length < 6) {
      setError(t('resetPassword.errors.shortPassword'));
      return;
    }
    if (password !== confirm) {
      setError(t('resetPassword.errors.mismatch'));
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePassword(password);
    setSubmitting(false);

    if (err) {
      setError(translateError(err, t));
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <CenteredCard
        icon={<CheckCircle2 size={48} color="var(--cam-color-accent)" strokeWidth={2.2} />}
        iconBg="var(--cam-bg-accent-soft)"
        title={t('resetPassword.successTitle')}
        message={t('resetPassword.successMessage')}
        actionLabel={t('resetPassword.goToApp')}
        onAction={() => navigate('/home', { replace: true })}
      />
    );
  }

  if (invalidLink) {
    return (
      <CenteredCard
        title={t('resetPassword.invalidTitle')}
        message={t('resetPassword.invalidMessage')}
        actionLabel={t('resetPassword.requestNew')}
        onAction={() => navigate('/esqueci-senha', { replace: true })}
      />
    );
  }

  if (!ready) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'var(--cam-bg-page)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
          color: 'var(--cam-text-secondary)',
          fontSize: 14,
        }}
      >
        <Loader2 size={20} className="animate-spin" style={{ marginRight: 8 }} />
        {t('common.loading')}
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
          {t('resetPassword.title')}
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
          {t('resetPassword.subtitle')}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <PasswordField
          value={password}
          onChange={setPassword}
          placeholder={t('resetPassword.newPlaceholder')}
          show={showPass}
          onToggleShow={() => setShowPass((v) => !v)}
          showLabel={t('common.showPassword')}
          hideLabel={t('common.hidePassword')}
        />

        <PasswordField
          value={confirm}
          onChange={setConfirm}
          placeholder={t('resetPassword.confirmPlaceholder')}
          show={showPass}
          onToggleShow={() => setShowPass((v) => !v)}
          showLabel={t('common.showPassword')}
          hideLabel={t('common.hidePassword')}
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
              {t('common.saving')}
            </>
          ) : (
            t('resetPassword.submit')
          )}
        </button>
      </form>
    </div>
  );
}

function CenteredCard({
  icon,
  iconBg,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon?: React.ReactNode;
  iconBg?: string;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
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
      {icon && (
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            backgroundColor: iconBg ?? 'var(--cam-bg-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          {icon}
        </div>
      )}
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--cam-text-primary)',
          margin: '0 0 8px',
          letterSpacing: '-0.5px',
        }}
      >
        {title}
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
        {message}
      </p>
      <button
        type="button"
        onClick={onAction}
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
        {actionLabel}
      </button>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
  showLabel,
  hideLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  showLabel: string;
  hideLabel: string;
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
      <Lock size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
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
      <button
        type="button"
        onClick={onToggleShow}
        aria-label={show ? hideLabel : showLabel}
        style={{
          background: 'none',
          border: 'none',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {show ? (
          <EyeOff size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />
        ) : (
          <Eye size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}

function translateError(msg: string, t: (k: string) => string): string {
  const m = msg.toLowerCase();
  if (m.includes('password') && m.includes('short'))
    return t('resetPassword.errors.passwordInvalid');
  if (m.includes('same as the old')) return t('resetPassword.errors.sameAsOld');
  if (m.includes('expired') || m.includes('invalid'))
    return t('resetPassword.errors.expired');
  return msg;
}
