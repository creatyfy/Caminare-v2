import { Check, X, ArrowLeft, Plus, Loader2, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserBeliefs,
  addBelief,
  setBeliefValidation,
  updateBelief,
  getHomeStats,
  type BeliefFull,
} from '../lib/db';
import { detectPatterns } from '../lib/ai';

// Padrões só são detectados a cada N registros do usuário (não a cada registro).
const PATTERN_EVERY = 30;

export function BeliefValidationScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [beliefs, setBeliefs] = useState<BeliefFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newBelief, setNewBelief] = useState('');
  const [adding, setAdding] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  async function handleContinue() {
    if (!user || continuing) return;
    setContinuing(true);
    // Padrões só rodam a cada PATTERN_EVERY registros (não a cada registro).
    // Só abrimos a tela de padrão quando a IA retorna um padrão novo; caso
    // contrário voltamos direto para a home.
    try {
      const stats = await getHomeStats(user.id);
      const total = stats?.totalEntries ?? 0;
      if (total > 0 && total % PATTERN_EVERY === 0) {
        const res = await detectPatterns(user.id, i18n.language);
        if (res.padroes && res.padroes.length > 0) {
          setContinuing(false);
          navigate('/novo-padrao');
          return;
        }
      }
    } catch (err) {
      console.error('[BeliefValidation] detect-patterns falhou:', err);
    }
    setContinuing(false);
    navigate('/home');
  }

  function startEdit(belief: BeliefFull) {
    setEditingId(belief.id);
    setEditText(belief.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  async function saveEdit(id: string) {
    const trimmed = editText.trim();
    if (!trimmed || savingEdit) return;
    setSavingEdit(true);
    const ok = await updateBelief(id, trimmed);
    setSavingEdit(false);
    if (ok) {
      setBeliefs((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, content: trimmed, validation: 'edited' } : b
        )
      );
      cancelEdit();
    }
  }

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    getUserBeliefs(user.id).then((bs) => {
      if (!active) return;
      setBeliefs(bs);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleValidation(
    id: string,
    validation: 'confirmed' | 'rejected'
  ) {
    setBeliefs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, validation } : b))
    );
    const ok = await setBeliefValidation(id, validation);
    if (!ok) {
      setBeliefs((prev) =>
        prev.map((b) => (b.id === id ? { ...b, validation: 'pending' } : b))
      );
    } else if (validation === 'rejected') {
      // Remove from list after a beat
      setTimeout(() => {
        setBeliefs((prev) => prev.filter((b) => b.id !== id));
      }, 350);
    }
  }

  async function handleAdd() {
    if (!user) return;
    const trimmed = newBelief.trim();
    if (!trimmed || adding) return;
    setAdding(true);
    const created = await addBelief(user.id, trimmed);
    setAdding(false);
    if (created) {
      setBeliefs((prev) => [created, ...prev]);
      setNewBelief('');
      setIsAdding(false);
    }
  }

  const hasAny = beliefs.length > 0;

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
          onClick={() => navigate(-1)}
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
          {hasAny ? t('beliefValidation.subtitle') : t('beliefValidation.subtitleManual')}
        </p>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
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

        {!loading && !hasAny && !isAdding && (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--cam-text-secondary)',
              fontSize: '14px',
              padding: '16px 0 24px',
              lineHeight: 1.6,
            }}
          >
            {t('beliefValidation.empty')}
          </div>
        )}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {beliefs.map((belief) => (
              <div
                key={belief.id}
                style={{
                  backgroundColor: 'var(--cam-bg-card)',
                  borderRadius: '24px',
                  padding: '20px',
                  boxShadow: 'var(--cam-shadow-card)',
                  opacity: belief.validation === 'rejected' ? 0.5 : 1,
                  transition: 'opacity 0.3s ease',
                }}
              >
                {editingId === belief.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      disabled={savingEdit}
                      rows={3}
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
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={cancelEdit}
                        disabled={savingEdit}
                        style={{
                          flex: 1,
                          height: '44px',
                          borderRadius: '9999px',
                          backgroundColor: 'transparent',
                          color: 'var(--cam-text-secondary)',
                          border: `1.5px solid var(--cam-border)`,
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: savingEdit ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={() => saveEdit(belief.id)}
                        disabled={savingEdit || !editText.trim()}
                        style={{
                          flex: 1,
                          height: '44px',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--cam-color-brand)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: savingEdit || !editText.trim() ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          opacity: savingEdit || !editText.trim() ? 0.6 : 1,
                          fontFamily: 'inherit',
                        }}
                      >
                        {savingEdit && <Loader2 size={14} className="animate-spin" />}
                        {t('common.save')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
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
                        {belief.content}
                      </p>
                      {belief.occurrence_count > 1 && (
                        <p
                          style={{
                            fontSize: '12px',
                            color: 'var(--cam-text-secondary)',
                            margin: 0,
                          }}
                        >
                          {belief.occurrence_count}{' '}
                          {belief.occurrence_count === 1
                            ? t('common.occurrence')
                            : t('common.occurrences')}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleValidation(belief.id, 'rejected')}
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
                          backgroundColor:
                            belief.validation === 'rejected'
                              ? 'var(--cam-color-error)'
                              : 'var(--cam-bg-error-soft)',
                          color:
                            belief.validation === 'rejected'
                              ? '#FFFFFF'
                              : 'var(--cam-text-error)',
                        }}
                      >
                        <X size={20} strokeWidth={2.5} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>
                          {t('beliefValidation.discard')}
                        </span>
                      </button>

                      <button
                        onClick={() => handleValidation(belief.id, 'confirmed')}
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
                          backgroundColor:
                            belief.validation === 'confirmed'
                              ? 'var(--cam-color-accent)'
                              : 'var(--cam-bg-accent-soft)',
                          color:
                            belief.validation === 'confirmed'
                              ? '#FFFFFF'
                              : 'var(--cam-text-accent)',
                        }}
                      >
                        <Check size={20} strokeWidth={2.5} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>
                          {t('common.confirm')}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() => startEdit(belief)}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 0',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: 'var(--cam-text-brand)',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      <Pencil size={15} strokeWidth={2.5} />
                      {t('beliefValidation.adjust')}
                    </button>
                  </>
                )}
              </div>
            ))}

            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
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
                {t('beliefValidation.addBelief')}
              </button>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--cam-bg-card)',
                  borderRadius: '24px',
                  padding: '20px',
                  boxShadow: 'var(--cam-shadow-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <textarea
                  value={newBelief}
                  onChange={(e) => setNewBelief(e.target.value)}
                  placeholder={t('beliefValidation.newBeliefPlaceholder')}
                  autoFocus
                  disabled={adding}
                  rows={3}
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
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      setNewBelief('');
                    }}
                    disabled={adding}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '9999px',
                      backgroundColor: 'transparent',
                      color: 'var(--cam-text-secondary)',
                      border: `1.5px solid var(--cam-border)`,
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: adding ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleAdd}
                    disabled={adding || !newBelief.trim()}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--cam-color-brand)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: adding || !newBelief.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: adding || !newBelief.trim() ? 0.6 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    {adding && <Loader2 size={14} className="animate-spin" />}
                    {t('common.add')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
          onClick={handleContinue}
          disabled={continuing || loading}
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            boxShadow: 'var(--cam-shadow-brand)',
            cursor: continuing || loading ? 'not-allowed' : 'pointer',
            opacity: continuing || loading ? 0.7 : 1,
          }}
        >
          {continuing && <Loader2 size={18} className="animate-spin" />}
          {continuing ? t('beliefValidation.analyzingPatterns') : t('common.continue')}
        </button>
      </div>
    </div>
  );
}
