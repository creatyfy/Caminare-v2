import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
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
  ChevronDown,
  AlertTriangle,
  Globe,
  Sun,
  Moon,
  Monitor,
  Check,
  FileText,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, type ThemeMode } from '../contexts/ThemeContext';
import { getProfile, deleteAccount, type Profile } from '../lib/db';
import { setLanguage, type Lang } from '../lib/i18n';

export function ProfileScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(false);

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

  const provider = (user?.app_metadata?.provider as string | undefined) ?? 'email';
  const isOAuthUser = provider !== 'email';
  const fullName = profile?.full_name ?? t('profile.noName');
  const initial = (fullName[0] ?? 'U').toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(i18n.language, {
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        paddingBottom: '90px',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ padding: '48px 24px 24px 24px', backgroundColor: 'var(--cam-bg-card)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 8px 0' }}>
          {t('profile.title')}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {t('profile.subtitle')}
        </p>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* User card */}
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: 'var(--cam-shadow-card)',
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
              backgroundColor: 'var(--cam-bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--cam-text-brand)',
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--cam-text-primary)',
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
                color: 'var(--cam-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <Mail size={13} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Info card — collapsible */}
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: 'var(--cam-shadow-card)',
          }}
        >
          <button
            type="button"
            onClick={() => setShowAccountInfo((v) => !v)}
            aria-expanded={showAccountInfo}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span
              style={{
                flex: 1,
                textAlign: 'left',
                fontSize: '13px',
                color: 'var(--cam-text-secondary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('profile.accountSection')}
            </span>
            <ChevronDown
              size={18}
              color="var(--cam-text-secondary)"
              style={{
                transform: showAccountInfo ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>
          {showAccountInfo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              <InfoRow label={t('profile.name')} value={fullName} icon={<UserIcon size={16} color="var(--cam-text-secondary)" />} />
              <InfoRow label={t('profile.email')} value={user?.email ?? '—'} icon={<Mail size={16} color="var(--cam-text-secondary)" />} />
              <InfoRow
                label={t('profile.memberSince')}
                value={memberSince}
                icon={<UserIcon size={16} color="var(--cam-text-secondary)" />}
              />
              <InfoRow
                label={t('profile.loginMethod')}
                value={isOAuthUser ? capitalize(provider) : t('profile.emailPassword')}
                icon={<Lock size={16} color="var(--cam-text-secondary)" />}
              />
            </div>
          )}
        </div>

        {/* Preferences: language + theme */}
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '20px',
            boxShadow: 'var(--cam-shadow-card)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px 8px 20px' }}>
            <SectionLabel text={t('profile.settingsSection')} />
          </div>
          <LanguageRow
            label={t('profile.language')}
            value={i18n.language.startsWith('en') ? t('profile.languageEN') : t('profile.languagePT')}
            expanded={showLangPicker}
            onToggle={() => setShowLangPicker((v) => !v)}
          />
          {showLangPicker && (
            <OptionList
              options={[
                { value: 'pt-BR', label: t('profile.languagePT') },
                { value: 'en', label: t('profile.languageEN') },
              ]}
              selected={i18n.language.startsWith('en') ? 'en' : 'pt-BR'}
              onSelect={(v) => {
                setLanguage(v as Lang);
                setShowLangPicker(false);
              }}
            />
          )}

          <ThemeRow
            label={t('profile.theme')}
            expanded={showThemePicker}
            onToggle={() => setShowThemePicker((v) => !v)}
          />
          {showThemePicker && <ThemePicker onClose={() => setShowThemePicker(false)} />}
        </div>

        {/* Legal documents */}
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '20px',
            boxShadow: 'var(--cam-shadow-card)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px 8px 20px' }}>
            <SectionLabel text={t('profile.legalSection')} />
          </div>
          <ActionRow
            icon={<FileText size={18} color="var(--cam-text-brand)" strokeWidth={2.2} />}
            label={t('legal.termsLink')}
            onClick={() => navigate('/termos')}
          />
          <ActionRow
            icon={<Shield size={18} color="var(--cam-text-brand)" strokeWidth={2.2} />}
            label={t('legal.privacyLink')}
            onClick={() => navigate('/privacidade')}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '20px',
            boxShadow: 'var(--cam-shadow-card)',
            overflow: 'hidden',
          }}
        >
          {!isOAuthUser && (
            <ActionRow
              icon={<Lock size={18} color="var(--cam-text-brand)" strokeWidth={2.2} />}
              label={t('profile.changePassword')}
              onClick={() => setShowPasswordForm((v) => !v)}
              expanded={showPasswordForm}
            />
          )}

          {!isOAuthUser && showPasswordForm && <ChangePasswordForm onClose={() => setShowPasswordForm(false)} />}

          <ActionRow
            icon={<LogOut size={18} color="var(--cam-text-brand)" strokeWidth={2.2} />}
            label={t('profile.signOut')}
            onClick={handleSignOut}
          />
        </div>

        {/* Danger zone */}
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '20px',
            boxShadow: 'var(--cam-shadow-card)',
            overflow: 'hidden',
            border: `1.5px solid var(--cam-bg-error-soft)`,
          }}
        >
          <ActionRow
            icon={<Trash2 size={18} color="var(--cam-text-error)" strokeWidth={2.2} />}
            label={t('profile.deleteAccount')}
            onClick={() => setShowDeleteConfirm(true)}
            destructive
          />
        </div>
      </div>

      {showDeleteConfirm && <DeleteAccountModal onCancel={() => setShowDeleteConfirm(false)} />}
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <h3
      style={{
        fontSize: '13px',
        color: 'var(--cam-text-secondary)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        margin: '0 0 12px 0',
      }}
    >
      {text}
    </h3>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'var(--cam-bg-tint)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: 'var(--cam-text-secondary)', fontWeight: 500, marginBottom: '2px' }}>
          {label}
        </div>
        <div
          style={{
            fontSize: '14px',
            color: 'var(--cam-text-primary)',
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
        borderBottom: expanded ? `1px solid var(--cam-border)` : 'none',
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
          backgroundColor: destructive ? 'var(--cam-bg-error-soft)' : 'var(--cam-bg-muted)',
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
          color: destructive ? 'var(--cam-text-error)' : 'var(--cam-text-primary)',
        }}
      >
        {label}
      </span>
      <ChevronRight size={18} color={destructive ? 'var(--cam-text-error)' : 'var(--cam-text-secondary)'} />
    </button>
  );
}

function LanguageRow({
  label,
  value,
  expanded,
  onToggle,
}: {
  label: string;
  value: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '16px 20px',
        background: 'none',
        border: 'none',
        borderBottom: expanded ? `1px solid var(--cam-border)` : 'none',
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
          backgroundColor: 'var(--cam-bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Globe size={18} color="var(--cam-text-brand)" strokeWidth={2.2} />
      </div>
      <span style={{ flex: 1, fontSize: '15px', fontWeight: 600, color: 'var(--cam-text-primary)' }}>{label}</span>
      <span style={{ fontSize: '13px', color: 'var(--cam-text-secondary)', fontWeight: 500 }}>{value}</span>
      <ChevronRight size={18} color="var(--cam-text-secondary)" />
    </button>
  );
}

function ThemeRow({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const valueLabel =
    mode === 'light' ? t('profile.themeLight') : mode === 'dark' ? t('profile.themeDark') : t('profile.themeSystem');
  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor;
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '16px 20px',
        background: 'none',
        border: 'none',
        borderTop: `1px solid var(--cam-border-subtle)`,
        borderBottom: expanded ? `1px solid var(--cam-border)` : 'none',
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
          backgroundColor: 'var(--cam-bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color="var(--cam-text-brand)" strokeWidth={2.2} />
      </div>
      <span style={{ flex: 1, fontSize: '15px', fontWeight: 600, color: 'var(--cam-text-primary)' }}>{label}</span>
      <span style={{ fontSize: '13px', color: 'var(--cam-text-secondary)', fontWeight: 500 }}>{valueLabel}</span>
      <ChevronRight size={18} color="var(--cam-text-secondary)" />
    </button>
  );
}

function ThemePicker({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { mode, setMode } = useTheme();
  const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: t('profile.themeLight'), icon: Sun },
    { value: 'dark', label: t('profile.themeDark'), icon: Moon },
    { value: 'system', label: t('profile.themeSystem'), icon: Monitor },
  ];
  return (
    <div>
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => {
            setMode(opt.value);
            onClose();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '14px 20px 14px 56px',
            background: mode === opt.value ? 'var(--cam-bg-tint)' : 'transparent',
            border: 'none',
            borderBottom: idx < options.length - 1 ? `1px solid var(--cam-border-subtle)` : 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
          }}
        >
          <opt.icon size={16} color="var(--cam-text-secondary)" />
          <span style={{ flex: 1, fontSize: '14px', color: 'var(--cam-text-primary)', fontWeight: 500 }}>{opt.label}</span>
          {mode === opt.value && <Check size={16} color="var(--cam-color-brand)" strokeWidth={2.5} />}
        </button>
      ))}
    </div>
  );
}

function OptionList({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '14px 20px 14px 56px',
            background: selected === opt.value ? 'var(--cam-bg-tint)' : 'transparent',
            border: 'none',
            borderBottom: idx < options.length - 1 ? `1px solid var(--cam-border-subtle)` : 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
          }}
        >
          <span style={{ flex: 1, fontSize: '14px', color: 'var(--cam-text-primary)', fontWeight: 500 }}>{opt.label}</span>
          {selected === opt.value && <Check size={16} color="var(--cam-color-brand)" strokeWidth={2.5} />}
        </button>
      ))}
    </div>
  );
}

function ChangePasswordForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
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
      setError(t('profile.errors.missingFields'));
      return;
    }
    if (newPass !== confirmPass) {
      setError(t('profile.errors.mismatch'));
      return;
    }

    setSubmitting(true);
    const { error: err } = await changePassword(currentPass, newPass);
    setSubmitting(false);

    if (err) {
      setError(translateProfileError(err, t));
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
        borderBottom: `1px solid var(--cam-border)`,
      }}
    >
      <PasswordField
        value={currentPass}
        onChange={setCurrentPass}
        placeholder={t('profile.currentPwdPlaceholder')}
        show={showCurrent}
        onToggleShow={() => setShowCurrent((v) => !v)}
        autoComplete="current-password"
        showLabel={t('common.showPassword')}
        hideLabel={t('common.hidePassword')}
      />
      <PasswordField
        value={newPass}
        onChange={setNewPass}
        placeholder={t('profile.newPwdPlaceholder')}
        show={showNew}
        onToggleShow={() => setShowNew((v) => !v)}
        autoComplete="new-password"
        showLabel={t('common.showPassword')}
        hideLabel={t('common.hidePassword')}
      />
      <PasswordField
        value={confirmPass}
        onChange={setConfirmPass}
        placeholder={t('profile.confirmPwdPlaceholder')}
        show={showNew}
        onToggleShow={() => setShowNew((v) => !v)}
        autoComplete="new-password"
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

      {success && (
        <div
          style={{
            backgroundColor: 'var(--cam-bg-accent-soft)',
            color: 'var(--cam-text-accent)',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {t('profile.pwdSuccess')}
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
            color: 'var(--cam-text-secondary)',
            border: `1.5px solid var(--cam-border)`,
            fontSize: '14px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: 1,
            height: '44px',
            borderRadius: '9999px',
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
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
          {submitting ? t('common.saving') : t('common.save')}
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
  showLabel,
  hideLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        height: '52px',
        padding: '0 14px',
        backgroundColor: 'var(--cam-bg-input)',
        borderRadius: '14px',
        border: `1.5px solid var(--cam-border)`,
      }}
    >
      <Lock size={16} color="var(--cam-text-secondary)" strokeWidth={2.2} />
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
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        {show ? (
          <EyeOff size={16} color="var(--cam-text-secondary)" strokeWidth={2.2} />
        ) : (
          <Eye size={16} color="var(--cam-text-secondary)" strokeWidth={2.2} />
        )}
      </button>
    </div>
  );
}

function DeleteAccountModal({ onCancel }: { onCancel: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmWord = t('profile.deleteModal.confirmWord');
  const canDelete = confirmText.trim().toUpperCase() === confirmWord;

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
        backgroundColor: 'var(--cam-bg-overlay)',
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
          backgroundColor: 'var(--cam-bg-card)',
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
            backgroundColor: 'var(--cam-bg-error-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          <AlertTriangle size={28} color="var(--cam-text-error)" strokeWidth={2.2} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 8px 0' }}>
            {t('profile.deleteModal.title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {t('profile.deleteModal.message')}
          </p>
        </div>

        <div>
          <label
            style={{
              fontSize: '12px',
              color: 'var(--cam-text-secondary)',
              fontWeight: 500,
              marginBottom: '6px',
              display: 'block',
            }}
          >
            <Trans
              i18nKey="profile.deleteModal.confirmLabel"
              components={{ strong: <strong style={{ color: 'var(--cam-text-error)' }} /> }}
            />
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={confirmWord}
            autoCapitalize="characters"
            style={{
              width: '100%',
              height: '48px',
              padding: '0 14px',
              borderRadius: '12px',
              border: `1.5px solid var(--cam-border)`,
              backgroundColor: 'var(--cam-bg-input)',
              fontSize: '14px',
              color: 'var(--cam-text-primary)',
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
              color: 'var(--cam-text-primary)',
              border: `1.5px solid var(--cam-border)`,
              fontSize: '14px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canDelete || submitting}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '9999px',
              backgroundColor: canDelete ? 'var(--cam-color-error)' : 'var(--cam-bg-error-soft)',
              color: canDelete ? '#FFFFFF' : 'var(--cam-text-error)',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: !canDelete || submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'inherit',
              opacity: !canDelete ? 0.7 : 1,
            }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? t('profile.deleteModal.submitting') : t('profile.deleteModal.submit')}
          </button>
        </div>
      </div>
    </div>
  );
}

function translateProfileError(msg: string, t: (k: string) => string): string {
  const m = msg.toLowerCase();
  if (m.includes('senha atual incorreta') || m.includes('current')) return t('profile.errors.wrongCurrent');
  if (m.includes('mínimo') || m.includes('at least') || m.includes('short')) return t('profile.errors.shortPassword');
  if (m.includes('diferente') || m.includes('different')) return t('profile.errors.sameAsOld');
  if (m.includes('sessão') || m.includes('session')) return t('profile.errors.invalidSession');
  return msg;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}
