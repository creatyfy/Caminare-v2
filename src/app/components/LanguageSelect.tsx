import { useEffect, useRef, useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../lib/languages';

// Seletor de idioma no estilo do app (substitui o <select> nativo do navegador).
// Botão com globo + idioma atual + chevron; abre um painel rolável com bandeira,
// nome e check no selecionado. Fecha ao selecionar ou clicar fora.
export function LanguageSelect({
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === value);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          height: '56px',
          padding: '0 16px',
          backgroundColor: 'var(--cam-bg-input)',
          borderRadius: '16px',
          border: `1.5px solid var(--cam-border)`,
          boxShadow: 'var(--cam-shadow-card)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Globe size={18} color="var(--cam-text-secondary)" strokeWidth={2.2} />
        <span
          style={{
            flex: 1,
            textAlign: 'left',
            fontSize: '15px',
            color: 'var(--cam-text-primary)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {current ? `${current.flag}  ${current.label}` : value}
        </span>
        <ChevronDown
          size={18}
          color="var(--cam-text-secondary)"
          strokeWidth={2.2}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 60,
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '16px',
            border: `1.5px solid var(--cam-border)`,
            boxShadow: 'var(--cam-shadow-card-strong)',
            padding: '6px',
          }}
        >
          {SUPPORTED_LANGUAGES.map((l) => {
            const selected = l.code === value;
            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(l.code);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: selected ? 'var(--cam-bg-tint)' : 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <span style={{ width: '22px', fontSize: '16px', flexShrink: 0 }}>{l.flag}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: '14.5px',
                    color: 'var(--cam-text-primary)',
                    fontWeight: selected ? 600 : 500,
                  }}
                >
                  {l.label}
                </span>
                {selected && <Check size={16} color="var(--cam-color-brand)" strokeWidth={2.6} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
