import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateFullName } from '../lib/db';

// Considera o nome "ruim" (derivado do email / ausente) quando: está vazio, contém
// '@' (é um email), ou é igual à parte local do email (ex.: login social sem nome,
// que acaba usando o começo do email). Nesses casos pedimos o nome de verdade.
function looksLikeEmailName(
  name: string | null | undefined,
  email: string | null | undefined
): boolean {
  if (!name || !name.trim()) return true;
  const n = name.trim();
  if (n.includes('@')) return true;
  const local = (email ?? '').split('@')[0]?.trim().toLowerCase() ?? '';
  if (local && n.toLowerCase() === local) return true;
  return false;
}

/**
 * Portão de nome: quando o usuário entra (em especial via Apple/Google) sem um
 * nome de verdade, exibe um passo obrigatório pedindo o nome. Depois de definido,
 * a flag `name_set_by_user` (nos metadados do auth) evita pedir novamente.
 */
export function NameGate() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [needed, setNeeded] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setNeeded(false);
      return;
    }
    // Já definiu o nome explicitamente antes → nunca mais pergunta.
    if (user.user_metadata?.name_set_by_user) {
      setNeeded(false);
      return;
    }
    let active = true;
    setChecking(true);
    getProfile(user.id).then((p) => {
      if (!active) return;
      setNeeded(looksLikeEmailName(p?.full_name, user.email));
      setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (!user || checking || !needed) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting || !user) return;
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError(t('nameGate.error'));
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await updateFullName(user.id, trimmed);
    setSubmitting(false);
    if (err) {
      setError(t('nameGate.error'));
      return;
    }
    setNeeded(false);
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
        zIndex: 200,
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'var(--cam-bg-card)',
          borderRadius: '24px',
          padding: '24px',
          maxWidth: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--cam-shadow-card)',
        }}
      >
        <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: 0 }}>
          {t('nameGate.title')}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {t('nameGate.subtitle')}
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('nameGate.placeholder')}
          autoFocus
          style={{
            width: '100%',
            height: '50px',
            padding: '0 16px',
            borderRadius: '12px',
            border: `1.5px solid var(--cam-border)`,
            backgroundColor: 'var(--cam-bg-input)',
            fontSize: '15px',
            color: 'var(--cam-text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            fontWeight: 500,
          }}
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
            width: '100%',
            height: '50px',
            borderRadius: '9999px',
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            border: 'none',
            fontSize: '15px',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: 'var(--cam-shadow-brand)',
            opacity: submitting ? 0.85 : 1,
            fontFamily: 'inherit',
          }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {t('common.save')}
        </button>
      </form>
    </div>
  );
}
