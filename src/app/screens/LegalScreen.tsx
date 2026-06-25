import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { legalDocs, type LegalKind, type LegalBlock, type LegalDoc } from '../content/legal';

export function LegalScreen({ kind }: { kind: LegalKind }) {
  const { i18n } = useTranslation();
  const lang = i18n.language.startsWith('en') ? 'en' : 'pt-BR';
  return <LegalView doc={legalDocs[kind][lang]} />;
}

// Layout reutilizável de página jurídica/informativa pública (Termos,
// Privacidade, Exclusão de Conta). Recebe um LegalDoc já resolvido no idioma.
export function LegalView({ doc }: { doc: LegalDoc }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '48px 20px 16px 20px',
          backgroundColor: 'var(--cam-bg-card)',
          borderBottom: `1px solid var(--cam-border-subtle)`,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={goBack}
          aria-label={t('common.back')}
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
          <ArrowLeft size={22} color="var(--cam-text-primary)" strokeWidth={2.2} />
        </button>
        <h1
          style={{
            fontSize: '19px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            margin: 0,
            letterSpacing: '-0.3px',
          }}
        >
          {doc.title}
        </h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 48px 24px' }}>
        {doc.updated && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--cam-text-secondary)',
              fontWeight: 500,
              margin: '0 0 20px 0',
            }}
          >
            {doc.updated}
          </p>
        )}
        {doc.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </div>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.t === 'h') {
    return (
      <h2
        style={{
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--cam-text-primary)',
          margin: '24px 0 8px 0',
          letterSpacing: '0.2px',
        }}
      >
        {block.s}
      </h2>
    );
  }
  if (block.t === 'h2') {
    return (
      <h3
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--cam-text-primary)',
          margin: '16px 0 6px 0',
        }}
      >
        {block.s}
      </h3>
    );
  }
  if (block.t === 'li') {
    return (
      <div style={{ display: 'flex', gap: '10px', margin: '0 0 6px 0', paddingLeft: '4px' }}>
        <span
          style={{
            color: 'var(--cam-text-brand)',
            fontSize: '13px',
            lineHeight: 1.7,
            flexShrink: 0,
          }}
        >
          •
        </span>
        <span style={{ fontSize: '13.5px', color: 'var(--cam-text-primary)', lineHeight: 1.7 }}>
          {block.s}
        </span>
      </div>
    );
  }
  return (
    <p
      style={{
        fontSize: '13.5px',
        color: 'var(--cam-text-primary)',
        lineHeight: 1.7,
        margin: '0 0 10px 0',
      }}
    >
      {block.s}
    </p>
  );
}
