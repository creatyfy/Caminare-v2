import { Check, X, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function EmotionValidationScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [emotions, setEmotions] = useState([
    { id: 1, label: 'Ansiedade', validated: null as boolean | null },
    { id: 2, label: 'Preocupação', validated: null as boolean | null },
    { id: 3, label: 'Insegurança', validated: null as boolean | null },
  ]);

  const [thoughts, setThoughts] = useState([
    { id: 1, text: 'Não vou conseguir fazer a apresentação', validated: null as boolean | null, isEditing: false },
    { id: 2, text: 'Nunca sou boa o suficiente', validated: null as boolean | null, isEditing: false },
  ]);

  const [isAddingEmotion, setIsAddingEmotion] = useState(false);
  const [newEmotion, setNewEmotion] = useState('');

  const handleEmotionValidation = (id: number, isValid: boolean) => {
    setEmotions(emotions.map((e) => (e.id === id ? { ...e, validated: isValid } : e)));
  };

  const handleAddEmotion = () => {
    if (newEmotion.trim()) {
      setEmotions([...emotions, { id: Date.now(), label: newEmotion.trim(), validated: true }]);
      setNewEmotion('');
      setIsAddingEmotion(false);
    }
  };

  const handleThoughtValidation = (id: number, isValid: boolean) => {
    setThoughts(thoughts.map((th) => (th.id === id ? { ...th, validated: isValid, isEditing: false } : th)));
  };

  const toggleThoughtEdit = (id: number) => {
    setThoughts(thoughts.map((th) => (th.id === id ? { ...th, isEditing: !th.isEditing } : th)));
  };

  const handleThoughtTextChange = (id: number, newText: string) => {
    setThoughts(thoughts.map((th) => (th.id === id ? { ...th, text: newText } : th)));
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
          onClick={() => navigate('/gravacao')}
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
          {t('emotionValidation.title')}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {t('emotionValidation.subtitle')}
        </p>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--cam-text-secondary)',
              marginBottom: '16px',
              marginLeft: '4px',
            }}
          >
            {t('emotionValidation.emotionsHeader')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {emotions.map((emotion) => (
              <div
                key={emotion.id}
                style={{
                  backgroundColor: 'var(--cam-bg-card)',
                  borderRadius: '24px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: 'var(--cam-shadow-card)',
                }}
              >
                <button
                  onClick={() => handleEmotionValidation(emotion.id, false)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: emotion.validated === false ? 'var(--cam-color-error)' : 'var(--cam-bg-error-soft)',
                    color: emotion.validated === false ? '#FFFFFF' : 'var(--cam-text-error)',
                  }}
                >
                  <X size={18} strokeWidth={2.5} />
                </button>

                <div
                  style={{
                    backgroundColor: 'var(--cam-bg-muted)',
                    color: 'var(--cam-text-brand)',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: 500,
                    flex: 1,
                    textAlign: 'center',
                    margin: '0 12px',
                  }}
                >
                  {emotion.label}
                </div>

                <button
                  onClick={() => handleEmotionValidation(emotion.id, true)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: emotion.validated === true ? 'var(--cam-color-accent)' : 'var(--cam-bg-accent-soft)',
                    color: emotion.validated === true ? '#FFFFFF' : 'var(--cam-text-accent)',
                  }}
                >
                  <Check size={18} strokeWidth={2.5} />
                </button>
              </div>
            ))}

            {!isAddingEmotion ? (
              <button
                onClick={() => setIsAddingEmotion(true)}
                style={{
                  backgroundColor: 'transparent',
                  border: `2px dashed var(--cam-border)`,
                  borderRadius: '24px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--cam-text-brand)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '4px',
                }}
              >
                <Plus size={18} strokeWidth={2.5} />
                {t('emotionValidation.addEmotion')}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  value={newEmotion}
                  onChange={(e) => setNewEmotion(e.target.value)}
                  placeholder={t('emotionValidation.newEmotionPlaceholder')}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '9999px',
                    border: `1px solid var(--cam-border)`,
                    outline: 'none',
                    fontSize: '14px',
                    color: 'var(--cam-text-primary)',
                    backgroundColor: 'var(--cam-bg-input)',
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEmotion()}
                />
                <button
                  onClick={handleAddEmotion}
                  style={{
                    padding: '0 20px',
                    backgroundColor: 'var(--cam-color-brand)',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  {t('common.add')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--cam-text-secondary)',
              marginBottom: '16px',
              marginLeft: '4px',
            }}
          >
            {t('emotionValidation.thoughtsHeader')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {thoughts.map((thought) => (
              <div
                key={thought.id}
                style={{
                  backgroundColor: 'var(--cam-bg-card)',
                  borderRadius: '24px',
                  padding: '20px',
                  boxShadow: 'var(--cam-shadow-card)',
                }}
              >
                {thought.isEditing ? (
                  <textarea
                    value={thought.text}
                    onChange={(e) => handleThoughtTextChange(thought.id, e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      color: 'var(--cam-text-primary)',
                      fontSize: '15px',
                      lineHeight: 1.5,
                      marginBottom: '20px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: `1px solid var(--cam-border)`,
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--cam-bg-input)',
                    }}
                  />
                ) : (
                  <p
                    style={{
                      color: 'var(--cam-text-primary)',
                      fontSize: '15px',
                      lineHeight: 1.5,
                      margin: '0 0 20px 0',
                    }}
                  >
                    {thought.text}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleThoughtValidation(thought.id, false)}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: '9999px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      backgroundColor: thought.validated === false ? 'var(--cam-color-error)' : 'var(--cam-bg-error-soft)',
                      color: thought.validated === false ? '#FFFFFF' : 'var(--cam-text-error)',
                    }}
                  >
                    {t('common.reject')}
                  </button>

                  <button
                    onClick={() => toggleThoughtEdit(thought.id)}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: '9999px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      backgroundColor: thought.isEditing ? 'var(--cam-color-brand)' : 'var(--cam-bg-muted)',
                      color: thought.isEditing ? '#FFFFFF' : 'var(--cam-text-brand)',
                    }}
                  >
                    {thought.isEditing ? t('common.save') : t('common.edit')}
                  </button>

                  <button
                    onClick={() => handleThoughtValidation(thought.id, true)}
                    style={{
                      flex: 1,
                      padding: '12px 0',
                      borderRadius: '9999px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      backgroundColor: thought.validated === true ? 'var(--cam-color-accent)' : 'var(--cam-bg-accent-soft)',
                      color: thought.validated === true ? '#FFFFFF' : 'var(--cam-text-accent)',
                    }}
                  >
                    {t('common.confirm')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/validacao-crencas')}
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
            marginTop: '16px',
          }}
        >
          {t('emotionValidation.continue')}
        </button>
      </div>
    </div>
  );
}
