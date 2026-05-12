import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { OwlMascot, CaminareText } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

const BRAND = '#534AB7';
const BRAND_DARK = '#3D2E5E';
const BG = '#F8F7FF';
const MUTED = '#8B87A8';
const ERROR = '#DC2626';
const BORDER = 'rgba(83, 74, 183, 0.18)';

export function LoginScreen() {
  const navigate = useNavigate();
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
      setError('Preencha email e senha.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(translateError(err));
      return;
    }
    navigate('/home', { replace: true });
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 24px 32px',
        overflow: 'auto',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '24px',
          marginBottom: '40px',
        }}
      >
        <OwlMascot size={92} color={BRAND_DARK} />
        <div style={{ marginTop: '12px' }}>
          <CaminareText height={34} color={BRAND_DARK} />
        </div>
      </div>

      <h1
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#2D2A45',
          margin: 0,
          marginBottom: '6px',
          letterSpacing: '-0.5px',
        }}
      >
        Bem-vindo de volta
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: MUTED,
          margin: 0,
          marginBottom: '28px',
          fontWeight: 500,
        }}
      >
        Continue sua jornada de autoconhecimento.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <InputField
          icon={<Mail size={18} color={MUTED} strokeWidth={2.2} />}
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />

        <InputField
          icon={<Lock size={18} color={MUTED} strokeWidth={2.2} />}
          type={showPass ? 'text' : 'password'}
          placeholder="Senha"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          trailing={
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              style={trailingButtonStyle}
            >
              {showPass ? (
                <EyeOff size={18} color={MUTED} strokeWidth={2.2} />
              ) : (
                <Eye size={18} color={MUTED} strokeWidth={2.2} />
              )}
            </button>
          }
        />

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: 'rgba(220, 38, 38, 0.08)',
              color: ERROR,
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
            marginTop: '8px',
            height: '56px',
            borderRadius: '9999px',
            backgroundColor: BRAND,
            color: '#FFFFFF',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0px 8px 24px rgba(83, 74, 183, 0.25)',
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
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: '32px',
          textAlign: 'center',
          fontSize: '14px',
          color: MUTED,
          fontWeight: 500,
        }}
      >
        Não tem conta?{' '}
        <button
          type="button"
          onClick={() => navigate('/cadastro')}
          style={{
            background: 'none',
            border: 'none',
            color: BRAND,
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            fontSize: '14px',
          }}
        >
          Criar conta
        </button>
      </div>
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
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: `1.5px solid ${BORDER}`,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.02)',
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
          color: '#2D2A45',
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

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials'))
    return 'Email ou senha incorretos.';
  if (m.includes('email not confirmed'))
    return 'Confirme seu email antes de entrar.';
  if (m.includes('rate limit')) return 'Muitas tentativas. Tente novamente em instantes.';
  return msg;
}
