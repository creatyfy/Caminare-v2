import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  User as UserIcon,
  Mail,
  Lock,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, deleteAccount, type Profile } from '../lib/db';

const BRAND = '#534AB7';
const BG = '#F8F7FF';
const MUTED = '#8B87A8';
const TEXT = '#2D2A45';
const ERROR = '#DC2626';
const SUCCESS = '#1D9E75';
const BORDER = 'rgba(83, 74, 183, 0.18)';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getProfile(user.id).then((p) => {
      if (!active) return;
      setProfile(p);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  const provider =
    (user?.app_metadata?.provider as string | undefined) ?? 'email';
  const isOAuthUser = provider !== 'email';
  const fullName = profile?.full_name ?? 'Sem nome';
  const initial = (fullName[0] ?? 'U').toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        paddingBottom: '90px',
        backgroundColor: BG,
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ padding: '48px 24px 24px 24px', backgroundColor: '#FFFFFF' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: TEXT,
            margin: '0 0 8px 0',
          }}
        >
          Perfil
        </h1>
        <p style={{ fontSize: '15px', color: MUTED, margin: 0, lineHeight: 1.4 }}>
          Suas informações e configurações
        </p>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* User card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#F0EFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 22,
              fontWeight: 700,
              color: BRAND,
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: TEXT,
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? '—' : fullName}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: MUTED,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <Mail size={13} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email ?? '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
          }}
        >
          <h3
            style={{
              fontSize: '13px',
              color: MUTED,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 12px 0',
            }}
          >
            Conta
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <InfoRow label="Nome" value={fullName} icon={<UserIcon size={16} color={MUTED} />} />
            <InfoRow label="Email" value={user?.email ?? '—'} icon={<Mail size={16} color={MUTED} />} />
            <InfoRow
              label="Conta criada em"
              value={memberSince}
              icon={<UserIcon size={16} color={MUTED} />}
            />
            <InfoRow
              label="Método de login"
              value={isOAuthUser ? capitalize(provider) : 'Email e senha'}
              icon={<Lock size={16} color={MUTED} />}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden',
          }}
        >
          {!isOAuthUser && (
            <ActionRow
              icon={<Lock size={18} color={BRAND} strokeWidth={2.2} />}
              label="Alterar senha"
              onClick={() => setShowPasswordForm((v) => !v)}
              expanded={showPasswordForm}
            />
          )}

          {!isOAuthUser && showPasswordForm && (
            <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />
          )}

          <ActionRow
            icon={<LogOut size={18} color={BRAND} strokeWidth={2.2} />}
            label="Sair da conta"
            onClick={handleSignOut}
          />
        </div>

        {/* Danger zone */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
            overflow: 'hidden',
            border: `1.5px solid rgba(220, 38, 38, 0.15)`,
          }}
        >
          <ActionRow
            icon={<Trash2 size={18} color={ERROR} strokeWidth={2.2} />}
            label="Excluir conta"
            onClick={() => setShowDeleteConfirm(true)}
            destructive
          />
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteAccountModal onCancel={() => setShowDeleteConfirm(false)} />
      )}
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 0',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: '#F8F7FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '12px',
            color: MUTED,
            fontWeight: 500,
            marginBottom: '2px',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: '14px',
            color: TEXT,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
  expanded,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  expanded?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '16px 20px',
        background: 'none',
        border: 'none',
        borderBottom: expanded ? `1px solid ${BORDER}` : 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          backgroundColor: destructive ? 'rgba(220, 38, 38, 0.08)' : '#F0EFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          flex: 1,
          fontSize: '15px',
          fontWeight: 600,
          color: destructive ? ERROR : TEXT,
        }}
      >
        {label}
      </span>
      <ChevronRight size={18} color={destructive ? ERROR : MUTED} />
    </button>
  );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const { changePassword } = useAuth();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(false);

    if (!currentPass || !newPass || !confirmPass) {
      setError('Preencha todos os campos.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('A confirmação não coincide com a nova senha.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await changePassword(currentPass, newPass);
    setSubmitting(false);

    if (err) {
      setError(err);
      return;
    }
    setSuccess(true);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '16px 20px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <PasswordField
        value={currentPass}
        onChange={setCurrentPass}
        placeholder="Senha atual"
        show={showCurrent}
        onToggleShow={() => setShowCurrent((v) => !v)}
        autoComplete="current-password"
      />
      <PasswordField
        value={newPass}
        onChange={setNewPass}
        placeholder="Nova senha (mín. 6 caracteres)"
        show={showNew}
        onToggleShow={() => setShowNew((v) => !v)}
        autoComplete="new-password"
      />
      <PasswordField
        value={confirmPass}
        onChange={setConfirmPass}
        placeholder="Confirmar nova senha"
        show={showNew}
        onToggleShow={() => setShowNew((v) => !v)}
        autoComplete="new-password"
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

      {success && (
        <div
          style={{
            backgroundColor: 'rgba(29, 158, 117, 0.1)',
            color: SUCCESS,
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Senha alterada com sucesso!
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          style={{
            flex: 1,
            height: '44px',
            borderRadius: '9999px',
            backgroundColor: 'transparent',
            color: MUTED,
            border: `1.5px solid ${BORDER}`,
            fontSize: '14px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: 1,
            height: '44px',
            borderRadius: '9999px',
            backgroundColor: BRAND,
            color: '#FFFFFF',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: submitting ? 0.85 : 1,
            fontFamily: 'inherit',
          }}
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? 'Salvando' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        height: '52px',
        padding: '0 14px',
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: `1.5px solid ${BORDER}`,
      }}
    >
      <Lock size={16} color={MUTED} strokeWidth={2.2} />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: '14px',
          color: TEXT,
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
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        {show ? (
          <EyeOff size={16} color={MUTED} strokeWidth={2.2} />
        ) : (
          <Eye size={16} color={MUTED} strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}

function DeleteAccountModal({ onCancel }: { onCancel: () => void }) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim().toUpperCase() === 'EXCLUIR';

  async function handleDelete() {
    if (!canDelete || submitting) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await deleteAccount();
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(45, 42, 69, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 100,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'rgba(220, 38, 38, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          <AlertTriangle size={28} color={ERROR} strokeWidth={2.2} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: TEXT,
              margin: '0 0 8px 0',
            }}
          >
            Excluir sua conta?
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: MUTED,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Esta ação é permanente. Todos os seus registros, emoções, crenças e
            padrões serão apagados. Não é possível desfazer.
          </p>
        </div>

        <div>
          <label
            style={{
              fontSize: '12px',
              color: MUTED,
              fontWeight: 500,
              marginBottom: '6px',
              display: 'block',
            }}
          >
            Digite <strong style={{ color: ERROR }}>EXCLUIR</strong> para confirmar
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="EXCLUIR"
            autoCapitalize="characters"
            style={{
              width: '100%',
              height: '48px',
              padding: '0 14px',
              borderRadius: '12px',
              border: `1.5px solid ${BORDER}`,
              backgroundColor: '#FFFFFF',
              fontSize: '14px',
              color: TEXT,
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              fontWeight: 600,
              letterSpacing: '1px',
              textAlign: 'center',
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

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '9999px',
              backgroundColor: 'transparent',
              color: TEXT,
              border: `1.5px solid ${BORDER}`,
              fontSize: '14px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || submitting}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '9999px',
              backgroundColor: canDelete ? ERROR : 'rgba(220, 38, 38, 0.3)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: !canDelete || submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'inherit',
            }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Excluindo' : 'Excluir conta'}
          </button>
        </div>
      </div>
    </div>
  );
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}
