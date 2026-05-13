import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BORDER = 'rgba(83, 74, 183, 0.18)';
const TEXT = '#2D2A45';

export function GoogleSignInButton({
  label = 'Continuar com Google',
  onError,
}: {
  label?: string;
  onError?: (msg: string) => void;
}) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setLoading(false);
      onError?.(error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        height: '56px',
        width: '100%',
        borderRadius: '9999px',
        backgroundColor: '#FFFFFF',
        color: TEXT,
        border: `1.5px solid ${BORDER}`,
        fontSize: '15px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.02)',
        opacity: loading ? 0.85 : 1,
        transition: 'transform 0.15s ease, opacity 0.15s ease',
        fontFamily: 'inherit',
      }}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <GoogleLogo />
      )}
      {label}
    </button>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthDivider({ label = 'ou' }: { label?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '4px 0',
      }}
    >
      <div style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
      <span
        style={{
          fontSize: '12px',
          color: '#8B87A8',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
    </div>
  );
}
