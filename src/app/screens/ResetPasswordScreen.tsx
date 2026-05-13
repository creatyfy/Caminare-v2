import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const BRAND = '#534AB7';
const ACCENT = '#1D9E75';
const BG = '#F8F7FF';
const MUTED = '#8B87A8';
const ERROR = '#DC2626';
const BORDER = 'rgba(83, 74, 183, 0.18)';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
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
      setError('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePassword(password);
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
          Senha atualizada!
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
          Sua senha foi alterada com sucesso. Já pode entrar com a nova senha.
        </p>
        <button
          type="button"
          onClick={() => navigate('/home', { replace: true })}
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
          Ir para o app
        </button>
      </div>
    );
  }

  if (invalidLink) {
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
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#2D2A45',
            margin: '0 0 8px',
            letterSpacing: '-0.5px',
          }}
        >
          Link inválido ou expirado
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
          O link de recuperação não é válido ou já expirou. Solicite um novo.
        </p>
        <button
          type="button"
          onClick={() => navigate('/esqueci-senha', { replace: true })}
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
          Solicitar novo link
        </button>
      </div>
    );
  }

  if (!ready) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
          color: MUTED,
          fontSize: 14,
        }}
      >
        <Loader2 size={20} className="animate-spin" style={{ marginRight: 8 }} />
        Carregando...
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
          Criar nova senha
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
          Defina uma senha segura para sua conta.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <PasswordField
          value={password}
          onChange={setPassword}
          placeholder="Nova senha (mín. 6 caracteres)"
          show={showPass}
          onToggleShow={() => setShowPass((v) => !v)}
        />

        <PasswordField
          value={confirm}
          onChange={setConfirm}
          placeholder="Confirmar nova senha"
          show={showPass}
          onToggleShow={() => setShowPass((v) => !v)}
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
              Salvando...
            </>
          ) : (
            'Salvar nova senha'
          )}
        </button>
      </form>
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
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
      <Lock size={18} color={MUTED} strokeWidth={2.2} />
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
          color: '#2D2A45',
          fontWeight: 500,
          fontFamily: 'inherit',
        }}
      />
      <button
        type="button"
        onClick={onToggleShow}
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
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
          <EyeOff size={18} color={MUTED} strokeWidth={2.2} />
        ) : (
          <Eye size={18} color={MUTED} strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}

function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('password')) return 'Senha inválida — mínimo 6 caracteres.';
  if (m.includes('same as the old')) return 'A nova senha não pode ser igual à atual.';
  if (m.includes('expired') || m.includes('invalid'))
    return 'Link expirado ou inválido. Solicite um novo.';
  return msg;
}
