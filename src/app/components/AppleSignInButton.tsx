import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Botão "Continuar com Apple". Sign in with Apple é OBRIGATÓRIO na App Store
// quando há outro login social (Google). Segue o estilo da Apple HIG: botão
// preto, logo + texto brancos.
export function AppleSignInButton({
  label,
  onError,
  disabled = false,
}: {
  label?: string;
  onError?: (msg: string) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const { signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading || disabled) return;
    setLoading(true);
    const { error } = await signInWithApple();
    if (error) {
      setLoading(false);
      onError?.(error);
    }
  }

  const isDisabled = loading || disabled;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        height: '56px',
        width: '100%',
        borderRadius: '9999px',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        border: 'none',
        fontSize: '15px',
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: 'var(--cam-shadow-card)',
        opacity: disabled ? 0.55 : loading ? 0.85 : 1,
        transition: 'transform 0.15s ease, opacity 0.15s ease',
        fontFamily: 'inherit',
      }}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <AppleLogo />}
      {label ?? t('login.apple')}
    </button>
  );
}

function AppleLogo() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="#FFFFFF" aria-hidden="true">
      <path d="M13.3 9.55c-.02-2.06 1.68-3.05 1.76-3.1-.96-1.4-2.45-1.6-2.98-1.62-1.27-.13-2.48.74-3.12.74-.64 0-1.64-.72-2.7-.7-1.39.02-2.67.8-3.38 2.04-1.44 2.5-.37 6.2 1.04 8.23.69.99 1.51 2.1 2.58 2.06 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.7.65 1.12-.02 1.82-1.01 2.5-2 .79-1.15 1.11-2.26 1.13-2.32-.02-.01-2.17-.83-2.2-3.3zM11.24 3.48c.56-.69.94-1.63.84-2.58-.81.03-1.8.54-2.39 1.22-.52.6-.98 1.57-.86 2.49.91.07 1.84-.46 2.41-1.13z" />
    </svg>
  );
}
