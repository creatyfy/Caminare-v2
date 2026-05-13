import { Check, X, Edit3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function BeliefValidationScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [beliefs, setBeliefs] = useState([
    {
      id: 1,
      text: 'Eu não sou competente o suficiente',
      validated: null as boolean | null,
      contexts: ['Trabalho', 'Apresentações'],
    },
    {
      id: 2,
      text: 'Preciso ser perfeita para ser aceita',
      validated: null as boolean | null,
      contexts: ['Relacionamentos', 'Trabalho'],
    },
  ]);

  const handleValidation = (id: number, action: 'confirm' | 'reject' | 'adjust') => {
    if (action === 'adjust') return;
    setBeliefs(beliefs.map((b) => (b.id === id ? { ...b, validated: action === 'confirm' } : b)));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ padding: '48px 24px 24px 24px', backgroundColor: 'var(--cam-bg-card)' }}>
        <button
          onClick={() => navigate('/validacao-emocoes')}
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
            marginBottom: '24px',
          }}
        >
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 8px 0' }}>
          {t('beliefValidation.title')}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {t('beliefValidation.subtitle')}
        </p>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {beliefs.map((belief) => (
            <div
              key={belief.id}
              style={{
                backgroundColor: 'var(--cam-bg-card)',
                borderRadius: '24px',
                padding: '20px',
                boxShadow: 'var(--cam-shadow-card)',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <p
                  style={{
                    color: 'var(--cam-text-primary)',
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: 1.5,
                    margin: '0 0 12px 0',
                  }}
                >
                  {belief.text}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {belief.contexts.map((context, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: 'var(--cam-bg-muted)',
                        color: 'var(--cam-text-brand)',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {context}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleValidation(belief.id, 'confirm')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 0',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: belief.validated === true ? 'var(--cam-color-accent)' : 'var(--cam-bg-accent-soft)',
                    color: belief.validated === true ? '#FFFFFF' : 'var(--cam-text-accent)',
                  }}
                >
                  <Check size={20} strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('common.confirm')}</span>
                </button>

                <button
                  onClick={() => handleValidation(belief.id, 'adjust')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 0',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'var(--cam-bg-warning-soft)',
                    color: 'var(--cam-text-warning)',
                  }}
                >
                  <Edit3 size={20} strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('beliefValidation.adjust')}</span>
                </button>

                <button
                  onClick={() => handleValidation(belief.id, 'reject')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 0',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: belief.validated === false ? 'var(--cam-color-error)' : 'var(--cam-bg-error-soft)',
                    color: belief.validated === false ? '#FFFFFF' : 'var(--cam-text-error)',
                  }}
                >
                  <X size={20} strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('beliefValidation.discard')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            backgroundColor: 'var(--cam-bg-muted)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '16px' }}>💡</span>
          <p style={{ fontSize: '14px', color: 'var(--cam-text-brand)', margin: 0, lineHeight: 1.5 }}>
            {t('beliefValidation.hint')}
          </p>
        </div>

        <button
          onClick={() => navigate('/novo-padrao')}
          style={{
            width: '100%',
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
            boxShadow: 'var(--cam-shadow-brand)',
            cursor: 'pointer',
          }}
        >
          {t('beliefValidation.finish')}
        </button>
      </div>
    </div>
  );
}
