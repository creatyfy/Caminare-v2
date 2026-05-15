import { Check, X, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getEntryEmotions,
  addEntryEmotion,
  setEmotionValidation,
  getEntryThoughts,
  type EmotionFull,
} from '../lib/db';

export function EmotionValidationScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('entryId');

  const [emotions, setEmotions] = useState<EmotionFull[]>([]);
  const [thoughts, setThoughts] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingEmotion, setIsAddingEmotion] = useState(false);
  const [newEmotion, setNewEmotion] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user || !entryId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([
      getEntryEmotions(user.id, entryId),
      getEntryThoughts(user.id, entryId),
    ]).then(([es, ts]) => {
      if (!active) return;
      setEmotions(es);
      setThoughts(ts);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, entryId]);

  async function handleEmotionValidation(
    id: string,
    validation: 'confirmed' | 'rejected'
  ) {
    setEmotions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, validation } : e))
    );
    const ok = await setEmotionValidation(id, validation);
    if (!ok) {
      // revert on failure
      setEmotions((prev) =>
        prev.map((e) => (e.id === id ? { ...e, validation: 'pending' } : e))
      );
    }
  }

  async function handleAddEmotion() {
    if (!user || !entryId) return;
    const trimmed = newEmotion.trim();
    if (!trimmed || adding) return;
    setAdding(true);
    const created = await addEntryEmotion(user.id, entryId, trimmed);
    setAdding(false);
    if (created) {
      setEmotions((prev) => [...prev, created]);
      setNewEmotion('');
      setIsAddingEmotion(false);
    }
  }

  if (!entryId) {
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
          onClick={() => navigate('/home')}
          style={backButtonStyle}
        >
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>
        <p style={{ color: 'var(--cam-text-primary)', fontSize: '15px', marginTop: '24px' }}>
          {t('emotionValidation.missingEntry')}
        </p>
      </div>
    );
  }

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
        <button onClick={() => navigate('/home')} style={backButtonStyle}>
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '24px 0 8px 0' }}>
          {t('emotionValidation.title')}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {emotions.length > 0
            ? t('emotionValidation.subtitle')
            : t('emotionValidation.subtitleManual')}
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

          {loading && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--cam-text-secondary)',
                fontSize: '14px',
                padding: '24px 0',
              }}
            >
              <Loader2 size={20} className="animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
              {t('common.loading')}
            </div>
          )}

          {!loading && emotions.length === 0 && !isAddingEmotion && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--cam-text-secondary)',
                fontSize: '14px',
                padding: '16px 0 24px',
              }}
            >
              {t('emotionValidation.emptyEmotions')}
            </div>
          )}

          {!loading && (
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
                    opacity: emotion.validation === 'rejected' ? 0.5 : 1,
                  }}
                >
                  <button
                    onClick={() => handleEmotionValidation(emotion.id, 'rejected')}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor:
                        emotion.validation === 'rejected'
                          ? 'var(--cam-color-error)'
                          : 'var(--cam-bg-error-soft)',
                      color:
                        emotion.validation === 'rejected'
                          ? '#FFFFFF'
                          : 'var(--cam-text-error)',
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
                    {emotion.name}
                  </div>

                  <button
                    onClick={() => handleEmotionValidation(emotion.id, 'confirmed')}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor:
                        emotion.validation === 'confirmed'
                          ? 'var(--cam-color-accent)'
                          : 'var(--cam-bg-accent-soft)',
                      color:
                        emotion.validation === 'confirmed'
                          ? '#FFFFFF'
                          : 'var(--cam-text-accent)',
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
                    disabled={adding}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEmotion();
                      if (e.key === 'Escape') {
                        setIsAddingEmotion(false);
                        setNewEmotion('');
                      }
                    }}
                  />
                  <button
                    onClick={handleAddEmotion}
                    disabled={adding || !newEmotion.trim()}
                    style={{
                      padding: '0 20px',
                      backgroundColor: 'var(--cam-color-brand)',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: adding || !newEmotion.trim() ? 'not-allowed' : 'pointer',
                      opacity: adding || !newEmotion.trim() ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {adding && <Loader2 size={14} className="animate-spin" />}
                    {t('common.add')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thoughts section: only shown if there's an analysis log */}
        {!loading && thoughts && thoughts.length > 0 && (
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
              {thoughts.map((thought, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--cam-bg-card)',
                    borderRadius: '20px',
                    padding: '20px',
                    boxShadow: 'var(--cam-shadow-card)',
                  }}
                >
                  <p
                    style={{
                      color: 'var(--cam-text-primary)',
                      fontSize: '15px',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    "{thought}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
