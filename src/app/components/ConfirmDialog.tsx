import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

// Modal de confirmação no estilo do app (substitui o window.confirm nativo).
// Overlay escuro semitransparente + card centralizado; fecha no overlay/Cancelar.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  // Fecha com Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--cam-bg-card)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: 360,
          padding: '24px',
          boxShadow: 'var(--cam-shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--cam-text-secondary)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '9999px',
              backgroundColor: 'transparent',
              color: 'var(--cam-text-secondary)',
              border: `1.5px solid var(--cam-border)`,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {cancelLabel ?? t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '9999px',
              backgroundColor: destructive
                ? 'var(--cam-color-error)'
                : 'var(--cam-color-brand)',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
