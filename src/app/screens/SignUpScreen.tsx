import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BRAND = '#534AB7';
const ACCENT = '#1D9E75';
const BG = '#F8F7FF';
const MUTED = '#8B87A8';
const ERROR = '#DC2626';
const BORDER = 'rgba(83, 74, 183, 0.18)';

export function SignUpScreen() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (!name.trim() || !email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await signUp(name.trim(), email.trim(), password);
    setSubmitting(false);

    if (err) {
      setError(translateError(err));
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
          backgroundColor: BG,
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
            backgroundColor: 'rgba(29, 158, 117, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <CheckCircle2 size={48} color={ACCENT} strokeWidth={2.2} />
        </div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#2D2A45',
            margin: '0 0 8px',
            letterSpacing: '-0.5px',
          }}
        >
          Conta criada!
        </h1>
        <p
          style={{
            fontSize: 15,
            color: MUTED,
            margin: '0 0 32px',
            fontWeight: 500,
            lineHeight: 1.5,
            maxWidth: 280,
          }}
        >
          Enviamos um link de confirmação para <strong style={{ color: '#2D2A45' }}>{email}</strong>.
          Verifique sua caixa de entrada para continuar.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          style={{
            width: '100%',
            maxWidth: 320,
            height: 56,
            borderRadius: 9999,
            backgroundColor: BRAND,
            color: '#FFFFFF',
            border: 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0px 8px 24px rgba(83, 74, 183, 0.25)',
          }}
        >
          Ir para o login
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: BG,
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '10vh',
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
          gap: '4px',
        }}
      >
        <img
          src="/alinhadapng.png"
          alt="Caminare mascote"
          style={{
            display: 'block',
            width: 96,
            height: 96,
            objectFit: 'contain',
          }}
        />
        <img
          src="/caminarecomp.png"
          alt="Caminare"
          style={{
            display: 'block',
            width: 160,
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </div>

      <div style={{ marginTop: '24px', textAlign: 'left' }}>
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
          Criar sua conta
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: MUTED,
            margin: 0,
            fontWeight: 500,
          }}
        >
          Comece a registrar suas emoções hoje.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <InputField
          icon={<UserIcon size={18} color={MUTED} strokeWidth={2.2} />}
          type="text"
          placeholder="Nome"
          value={name}
          onChange={setName}
          autoComplete="name"
        />

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
          placeholder="Senha (mín. 6 caracteres)"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
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
              Criando...
            </>
          ) : (
            'Criar conta'
          )}
        </button>

        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '14px',
            color: MUTED,
            fontWeight: 500,
          }}
        >
          Já tem conta?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
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
            Já tenho conta
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
  if (m.includes('already registered') || m.includes('user already'))
    return 'Este email já está cadastrado.';
  if (m.includes('invalid email')) return 'Email inválido.';
  if (m.includes('password')) return 'Senha inválida — mínimo 6 caracteres.';
  if (m.includes('rate limit')) return 'Muitas tentativas. Tente novamente em instantes.';
  return msg;
}
