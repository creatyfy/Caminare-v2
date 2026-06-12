import { Sparkles, Check, X, ArrowLeft, Loader2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { usePendingPattern } from '../contexts/PendingPatternContext';
import {
  getPendingPattern,
  setPatternValidation,
  updatePattern,
  type PatternFull,
} from '../lib/db';

export function NewPatternScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { refresh: refreshPendingPattern } = usePendingPattern();
  const [pattern, setPattern] = useState<PatternFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    getPendingPattern(user.id).then((p) => {
      if (!active) return;
      setPattern(p);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleValidation(validation: 'confirmed' | 'rejected') {
    if (!pattern || submitting) return;
    setSubmitting(true);
    const ok = await setPatternValidation(pattern.id, validation);
    setSubmitting(false);
    if (ok) {
      await refreshPendingPattern();
      navigate('/home');
    }
  }

  function startEdit() {
    if (!pattern) return;
    setEditText(pattern.description);
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!pattern || submitting) return;
    const trimmed = editText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    const ok = await updatePattern(pattern.id, trimmed);
    setSubmitting(false);
    if (ok) {
      await refreshPendingPattern();
      navigate('/home');
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'var(--cam-bg-page)',
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

  if (!pattern) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'var(--cam-bg-page)',
          fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
          padding: '48px 24px',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={backButtonStyle}
        >
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 16px',
            gap: '20px',
          }}
        >
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              backgroundColor: 'var(--cam-bg-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={40} color="var(--cam-text-brand)" strokeWidth={2} />
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--cam-text-primary)',
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            {t('newPattern.noneTitle')}
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--cam-text-secondary)',
              margin: 0,
              maxWidth: 320,
              lineHeight: 1.5,
            }}
          >
            {t('newPattern.noneMessage')}
          </p>

          <button
            onClick={() => navigate('/home')}
            style={{
              marginTop: '12px',
              width: '100%',
              maxWidth: 320,
              height: '56px',
              backgroundColor: 'var(--cam-color-brand)',
              color: 'var(--cam-text-on-brand)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--cam-shadow-brand)',
            }}
          >
            {t('newPattern.finish')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        paddingBottom: '40px',
      }}
    >
      <div style={{ padding: '48px 24px 24px 24px' }}>
        <button onClick={() => navigate(-1)} style={backButtonStyle}>
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--cam-color-brand-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: 'var(--cam-shadow-brand)',
          }}
        >
          <Sparkles size={36} color="#FFFFFF" strokeWidth={2} />
        </div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            textAlign: 'center',
            margin: '0 0 12px 0',
          }}
        >
          {t('newPattern.title')}
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--cam-text-secondary)',
            textAlign: 'center',
            margin: '0 auto 32px auto',
            maxWidth: '280px',
            lineHeight: 1.4,
          }}
        >
          {t('newPattern.subtitle')}
        </p>

        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: 'var(--cam-shadow-card)',
            margin: '0 24px 32px 24px',
            width: 'calc(100% - 48px)',
            maxWidth: '400px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--cam-color-brand)',
              borderRadius: '16px',
              padding: '14px 16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                lineHeight: 1.4,
              }}
            >
              {t('newPattern.badge')}
            </div>
          </div>

          <div style={{ marginBottom: pattern.triggers && pattern.triggers.length > 0 ? '20px' : 0 }}>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--cam-text-primary)',
                margin: '0 0 8px 0',
              }}
            >
              {t('newPattern.descriptionLabel')}
            </h4>
            {editing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                disabled={submitting}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: `1px solid var(--cam-border)`,
                  outline: 'none',
                  fontSize: '15px',
                  color: 'var(--cam-text-primary)',
                  backgroundColor: 'var(--cam-bg-input)',
                  resize: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  lineHeight: 1.5,
                }}
              />
            ) : (
              <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {pattern.description}
              </p>
            )}
          </div>

          {pattern.triggers && pattern.triggers.length > 0 && (
            <div>
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--cam-text-primary)',
                  margin: '0 0 8px 0',
                }}
              >
                {t('newPattern.triggersLabel')}
              </h4>
              <ul
                style={{
                  fontSize: '15px',
                  color: 'var(--cam-text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                  paddingLeft: '20px',
                  listStyleType: 'disc',
                  listStylePosition: 'outside',
                }}
              >
                {pattern.triggers.map((trigger, idx) => (
                  <li key={idx} style={{ display: 'list-item' }}>
                    {trigger}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div
          style={{
            width: '100%',
            padding: '0 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '448px',
            boxSizing: 'border-box',
          }}
        >
          {editing ? (
            <>
              <button
                onClick={handleSaveEdit}
                disabled={submitting || !editText.trim()}
                style={{
                  width: '100%',
                  height: '56px',
                  backgroundColor: 'var(--cam-color-brand)',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: submitting || !editText.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--cam-shadow-brand)',
                  opacity: submitting || !editText.trim() ? 0.7 : 1,
                }}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} strokeWidth={2.5} />}
                {t('common.save')}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '56px',
                  backgroundColor: 'transparent',
                  color: 'var(--cam-text-secondary)',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: `1.5px solid var(--cam-border)`,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {t('common.cancel')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleValidation('confirmed')}
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '56px',
                  backgroundColor: 'var(--cam-color-accent)',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--cam-shadow-accent)',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} strokeWidth={2.5} />}
                {t('newPattern.confirmPattern')}
              </button>

              <button
                onClick={startEdit}
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '56px',
                  backgroundColor: 'var(--cam-bg-muted)',
                  color: 'var(--cam-text-brand)',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <Pencil size={20} strokeWidth={2.5} />
                {t('newPattern.edit')}
              </button>

              <button
                onClick={() => handleValidation('rejected')}
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '56px',
                  backgroundColor: 'transparent',
                  color: 'var(--cam-text-error)',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: `1px solid var(--cam-text-error)`,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <X size={20} strokeWidth={2.5} />
                {t('newPattern.notApplies')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const backButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--cam-text-brand)',
  background: 'none',
  border: 'none',
  fontSize: '16px',
  fontWeight: 500,
  padding: 0,
  cursor: 'pointer',
};
