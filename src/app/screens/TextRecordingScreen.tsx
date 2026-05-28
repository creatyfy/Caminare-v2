import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { createTextEntry } from '../lib/db';

// Equivalente a aproximadamente 2 min de fala (150 wpm × ~5 chars por palavra)
const MAX_CHARS = 1500;

export function TextRecordingScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Foca o textarea ao entrar na tela pra que o teclado suba imediatamente
  useEffect(() => {
    const id = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, []);

  async function handleSubmit() {
    if (!text.trim() || submitting || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      const entryId = await createTextEntry(user.id, text.trim());
      if (!entryId) {
        setError(t('textRecording.errorSave'));
        return;
      }
      navigate(`/validacao-emocoes?entryId=${entryId}`);
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
      setError(t('textRecording.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = text.trim().length === 0 || submitting;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '32px 24px 12px 24px', flexShrink: 0 }}>
        <button
          onClick={() => navigate('/home')}
          style={{
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
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 4px 0' }}>
          {t('textRecording.title')}
        </h1>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 24px 24px 24px',
          minHeight: 0,
        }}
      >
        <textarea
          ref={textareaRef}
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder={t('textRecording.placeholder')}
          disabled={submitting}
          maxLength={MAX_CHARS}
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: 'var(--cam-bg-card)',
            border: `1px solid var(--cam-border-subtle)`,
            borderRadius: '20px',
            padding: '20px',
            fontSize: '17px',
            color: 'var(--cam-text-primary)',
            lineHeight: 1.6,
            resize: 'none',
            outline: 'none',
            boxShadow: 'var(--cam-shadow-card)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            marginBottom: '8px',
            minHeight: 0,
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '12px',
            fontSize: '12px',
            fontWeight: 600,
            color:
              text.length >= MAX_CHARS
                ? 'var(--cam-text-error)'
                : text.length >= MAX_CHARS * 0.9
                  ? 'var(--cam-text-warning)'
                  : 'var(--cam-text-secondary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {text.length} / {MAX_CHARS}
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
              marginBottom: '12px',
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={disabled}
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: disabled ? 'var(--cam-bg-muted)' : 'var(--cam-color-accent)',
            color: disabled ? 'var(--cam-text-secondary)' : '#FFFFFF',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            boxShadow: disabled ? 'none' : 'var(--cam-shadow-accent)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          {submitting ? t('textRecording.submitting') : t('textRecording.submit')}
        </button>
      </div>
    </div>
  );
}
