import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BRAND = '#534AB7';
const ACCENT = '#1D9E75';
const BG = '#F8F7FF';
const MUTED = '#8B87A8';
const ERROR = '#DC2626';
const BORDER = 'rgba(83, 74, 183, 0.18)';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
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
      setError('Informe seu email.');
      return;
    }
    setSubmitting(true);
    const { error: err } = await resetPassword(trimmed);
    setSubmitting(false);
    if (err) {
      setError(translateError(err));
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
            textAlign: 'center',
          }}
        >
          Verifique seu email
        </h1>
        <p
          style={{
            fontSize: 15,
            color: MUTED,
            margin: '0 0 32px',
            fontWeight: 500,
            lineHeight: 1.5,
            maxWidth: 280,
            textAlign: 'center',
          }}
        >
          Enviamos um link de recuperação para{' '}
          <strong style={{ color: '#2D2A45' }}>{email}</strong>. Clique no link
          para criar uma nova senha.
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
          Voltar para o login
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
          color: BRAND,
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
        <span>Voltar</span>
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
          alt="Caminare mascote"
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
            color: '#2D2A45',
            margin: '0 0 4px',
            letterSpacing: '-0.5px',
            textAlign: 'center',
          }}
        >
          Esqueceu sua senha?
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: MUTED,
            margin: 0,
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          Informe seu email e enviaremos um link para criar uma nova senha.
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
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `1.5px solid ${BORDER}`,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          <Mail size={18} color={MUTED} strokeWidth={2.2} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
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
        </div>

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
            marginTop: '4px',
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
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar link de recuperação'
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
          Lembrou da senha?{' '}
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
            Voltar ao login
          </button>
        </div>
      </form>
    </div>
  );
}

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('rate limit'))
    return 'Muitas tentativas. Tente novamente em instantes.';
  if (m.includes('invalid email')) return 'Email inválido.';
  return msg;
}
