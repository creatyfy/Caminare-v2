import { useEffect, useMemo, useState } from 'react';
import { Calendar, Heart, Search, ChevronDown, X, Pencil, Trash2, Plus, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getEntries,
  deleteEntry,
  updateEntry,
  updateEntryEmotion,
  addEntryEmotion,
  setEmotionValidation,
  type EntryWithEmotions,
  type EmotionRow,
} from '../lib/db';
import { formatDate } from '../lib/format';
import { ConfirmDialog } from '../components/ConfirmDialog';

type FilterValue = '7days' | '15days' | '30days' | 'all';

// Tamanho do preview do relato no card (truncado com reticências).
const PREVIEW_CHARS = 120;

export function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<EntryWithEmotions[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [selectedEntry, setSelectedEntry] = useState<EntryWithEmotions | null>(null);

  // Edição do registro no modal (texto + emoções). Nenhuma ação chama /api/*.
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [savingEntry, setSavingEntry] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingEmotionId, setEditingEmotionId] = useState<string | null>(null);
  const [emotionDraft, setEmotionDraft] = useState('');
  const [isAddingEmotion, setIsAddingEmotion] = useState(false);
  const [newEmotion, setNewEmotion] = useState('');

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    getEntries(user.id, filter).then((data) => {
      if (!active) return;
      setEntries(data ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, filter]);

  function openEntry(entry: EntryWithEmotions) {
    setSelectedEntry(entry);
    setEditing(false);
    setEditText(entry.raw_text);
    setEditingEmotionId(null);
    setIsAddingEmotion(false);
    setNewEmotion('');
  }

  function closeModal() {
    setSelectedEntry(null);
    setEditing(false);
    setEditingEmotionId(null);
    setIsAddingEmotion(false);
    setNewEmotion('');
  }

  // Atualiza um registro tanto no modal quanto na lista (mantém a UI coerente).
  function patchSelected(patch: Partial<EntryWithEmotions>) {
    setSelectedEntry((prev) => (prev ? { ...prev, ...patch } : prev));
    setEntries((prev) =>
      prev.map((e) => (selectedEntry && e.id === selectedEntry.id ? { ...e, ...patch } : e))
    );
  }

  async function handleSaveText() {
    if (!selectedEntry || savingEntry) return;
    const trimmed = editText.trim();
    if (!trimmed) return;
    setSavingEntry(true);
    const ok = await updateEntry(selectedEntry.id, trimmed);
    setSavingEntry(false);
    if (ok) {
      patchSelected({ raw_text: trimmed });
      setEditing(false);
    }
  }

  async function confirmDeleteEntry() {
    if (!user || !pendingDeleteId || deleting) return;
    setDeleting(true);
    const ok = await deleteEntry(user.id, pendingDeleteId);
    setDeleting(false);
    if (ok) {
      const id = pendingDeleteId;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setPendingDeleteId(null);
      closeModal();
    }
  }

  async function handleRenameEmotion(emotionId: string) {
    if (!selectedEntry) return;
    const trimmed = emotionDraft.trim();
    if (!trimmed) return;
    const ok = await updateEntryEmotion(emotionId, trimmed);
    if (ok) {
      const next = selectedEntry.emotions.map((e) =>
        e.id === emotionId ? { ...e, name: trimmed, validation: 'edited' as const } : e
      );
      patchSelected({ emotions: next });
    }
    setEditingEmotionId(null);
    setEmotionDraft('');
  }

  async function handleRemoveEmotion(emotionId: string) {
    if (!selectedEntry) return;
    const ok = await setEmotionValidation(emotionId, 'rejected');
    if (ok) {
      const next = selectedEntry.emotions.filter((e) => e.id !== emotionId);
      patchSelected({ emotions: next });
    }
  }

  async function handleAddEmotion() {
    if (!user || !selectedEntry) return;
    const trimmed = newEmotion.trim();
    if (!trimmed) return;
    const created = await addEntryEmotion(user.id, selectedEntry.id, trimmed);
    if (created) {
      const row: EmotionRow = {
        id: created.id,
        name: created.name,
        validation: created.validation,
      };
      patchSelected({ emotions: [...selectedEntry.emotions, row] });
      setNewEmotion('');
      setIsAddingEmotion(false);
    }
  }

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((e) => e.raw_text.toLowerCase().includes(term));
  }, [entries, search]);

  // Fecha o modal com a tecla Escape.
  useEffect(() => {
    if (!selectedEntry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEntry]);

  const selectedDateTime = selectedEntry
    ? formatDate(selectedEntry.created_at, i18n.language)
    : null;

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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 8px 0' }}>
          {t('history.title')}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {t('history.subtitle')}
        </p>
      </div>

      <div
        style={{
          padding: '0 24px 24px 24px',
          backgroundColor: 'var(--cam-bg-card)',
          display: 'flex',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search
            size={18}
            color="var(--cam-text-secondary)"
            style={{ position: 'absolute', left: '16px' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('history.searchPlaceholder')}
            style={{
              width: '100%',
              height: '44px',
              backgroundColor: 'var(--cam-bg-tint)',
              border: 'none',
              borderRadius: '9999px',
              padding: '0 16px 0 44px',
              fontSize: '15px',
              color: 'var(--cam-text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterValue)}
            style={{
              appearance: 'none',
              height: '44px',
              backgroundColor: 'var(--cam-bg-tint)',
              border: 'none',
              borderRadius: '9999px',
              padding: '0 36px 0 20px',
              fontSize: '15px',
              color: 'var(--cam-text-primary)',
              fontWeight: 500,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">{t('history.filterAll')}</option>
            <option value="7days">{t('history.filter7')}</option>
            <option value="15days">{t('history.filter15')}</option>
            <option value="30days">{t('history.filter30')}</option>
          </select>
          <ChevronDown
            size={16}
            color="var(--cam-text-secondary)"
            style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }}
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: '100px',
        }}
      >
        {loading && (
          <div style={{ textAlign: 'center', color: 'var(--cam-text-secondary)', fontSize: '14px', padding: '32px 0' }}>
            {t('common.loading')}
          </div>
        )}

        {!loading && filteredEntries.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--cam-text-secondary)',
              fontSize: '14px',
              padding: '32px 0',
              lineHeight: 1.5,
            }}
          >
            {search.trim() ? t('history.emptySearch') : t('history.empty')}
          </div>
        )}

        {!loading &&
          filteredEntries.map((entry) => {
            const { date, time } = formatDate(entry.created_at, i18n.language);
            const summary =
              entry.raw_text.length > PREVIEW_CHARS
                ? entry.raw_text.slice(0, PREVIEW_CHARS).trimEnd() + '…'
                : entry.raw_text;
            return (
              <div
                key={entry.id}
                onClick={() => openEntry(entry)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openEntry(entry);
                  }
                }}
                style={{
                  backgroundColor: 'var(--cam-bg-card)',
                  borderRadius: '24px',
                  padding: '20px',
                  boxShadow: 'var(--cam-shadow-card)',
                  display: 'flex',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--cam-bg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Heart size={20} color="var(--cam-text-brand)" strokeWidth={2.5} />
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '8px',
                      color: 'var(--cam-text-secondary)',
                      fontSize: '13px',
                    }}
                  >
                    <Calendar size={14} />
                    <span>{date}</span>
                    <span>•</span>
                    <span>{time}</span>
                  </div>

                  <p
                    style={{
                      color: 'var(--cam-text-primary)',
                      fontSize: '15px',
                      fontWeight: 400,
                      lineHeight: 1.5,
                      margin: '0 0 12px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {summary}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {entry.emotions.map((emotion) => (
                      <span
                        key={emotion.id}
                        style={{
                          backgroundColor: 'var(--cam-bg-muted)',
                          color: 'var(--cam-text-brand)',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {emotion.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal expansivo do registro */}
      {selectedEntry && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--cam-bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--cam-bg-card)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: 440,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: 'var(--cam-shadow-card)',
            }}
          >
            {/* Header: data/hora + ações (editar / excluir / fechar) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 20px 16px 20px',
                borderBottom: `1px solid var(--cam-border-subtle)`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--cam-text-secondary)',
                  fontSize: '13px',
                }}
              >
                <Calendar size={14} />
                <span>{selectedDateTime?.date}</span>
                <span>•</span>
                <span>{selectedDateTime?.time}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {!editing && (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      aria-label={t('history.edit')}
                      title={t('history.edit')}
                      style={modalIconButtonStyle}
                    >
                      <Pencil size={18} color="var(--cam-text-brand)" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => selectedEntry && setPendingDeleteId(selectedEntry.id)}
                      disabled={deleting}
                      aria-label={t('history.delete')}
                      title={t('history.delete')}
                      style={modalIconButtonStyle}
                    >
                      {deleting ? (
                        <Loader2 size={18} className="animate-spin" color="var(--cam-text-error)" />
                      ) : (
                        <Trash2 size={18} color="var(--cam-text-error)" strokeWidth={2.5} />
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={closeModal}
                  aria-label={t('common.back')}
                  style={modalIconButtonStyle}
                >
                  <X size={20} color="var(--cam-text-secondary)" />
                </button>
              </div>
            </div>

            {/* Corpo: relato completo + emoções (modo leitura ou edição) */}
            <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
              {editing ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={6}
                  disabled={savingEntry}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: `1px solid var(--cam-border)`,
                    outline: 'none',
                    fontSize: '16px',
                    color: 'var(--cam-text-primary)',
                    backgroundColor: 'var(--cam-bg-input)',
                    lineHeight: 1.6,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    margin: '0 0 24px 0',
                  }}
                />
              ) : (
                <p
                  style={{
                    color: 'var(--cam-text-primary)',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: 1.6,
                    margin: '0 0 24px 0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedEntry.raw_text}
                </p>
              )}

              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--cam-text-secondary)',
                  margin: '0 0 12px 0',
                }}
              >
                {t('entryDetail.emotionsTitle')}
              </h3>

              {selectedEntry.emotions.length === 0 && !editing && (
                <p style={{ fontSize: '14px', color: 'var(--cam-text-secondary)', margin: 0 }}>
                  {t('entryDetail.emotionsEmpty')}
                </p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {selectedEntry.emotions.map((emotion) =>
                  editing && editingEmotionId === emotion.id ? (
                    <input
                      key={emotion.id}
                      value={emotionDraft}
                      onChange={(e) => setEmotionDraft(e.target.value)}
                      autoFocus
                      onBlur={() => handleRenameEmotion(emotion.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameEmotion(emotion.id);
                        if (e.key === 'Escape') {
                          setEditingEmotionId(null);
                          setEmotionDraft('');
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        border: `1px solid var(--cam-border)`,
                        outline: 'none',
                        fontSize: '12px',
                        color: 'var(--cam-text-primary)',
                        backgroundColor: 'var(--cam-bg-input)',
                        maxWidth: '160px',
                      }}
                    />
                  ) : (
                    <span
                      key={emotion.id}
                      style={{
                        backgroundColor: 'var(--cam-bg-muted)',
                        color: 'var(--cam-text-brand)',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {editing ? (
                        <button
                          onClick={() => {
                            setEditingEmotionId(emotion.id);
                            setEmotionDraft(emotion.name);
                          }}
                          style={chipTextButtonStyle}
                        >
                          {emotion.name}
                        </button>
                      ) : (
                        emotion.name
                      )}
                      {editing && (
                        <button
                          onClick={() => handleRemoveEmotion(emotion.id)}
                          aria-label={t('history.removeEmotion')}
                          style={chipRemoveButtonStyle}
                        >
                          <X size={13} strokeWidth={2.5} />
                        </button>
                      )}
                    </span>
                  )
                )}

                {editing &&
                  (isAddingEmotion ? (
                    <input
                      value={newEmotion}
                      onChange={(e) => setNewEmotion(e.target.value)}
                      placeholder={t('history.emotionPlaceholder')}
                      autoFocus
                      onBlur={() => {
                        if (newEmotion.trim()) handleAddEmotion();
                        else setIsAddingEmotion(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddEmotion();
                        if (e.key === 'Escape') {
                          setIsAddingEmotion(false);
                          setNewEmotion('');
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        border: `1px solid var(--cam-border)`,
                        outline: 'none',
                        fontSize: '12px',
                        color: 'var(--cam-text-primary)',
                        backgroundColor: 'var(--cam-bg-input)',
                        maxWidth: '160px',
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setIsAddingEmotion(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        border: `1px dashed var(--cam-border)`,
                        background: 'none',
                        cursor: 'pointer',
                        color: 'var(--cam-text-brand)',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      <Plus size={14} strokeWidth={2.5} />
                      {t('history.addEmotion')}
                    </button>
                  ))}
              </div>

              {editing && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setEditText(selectedEntry.raw_text);
                      setEditingEmotionId(null);
                      setIsAddingEmotion(false);
                      setNewEmotion('');
                    }}
                    disabled={savingEntry}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '9999px',
                      backgroundColor: 'transparent',
                      color: 'var(--cam-text-secondary)',
                      border: `1.5px solid var(--cam-border)`,
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: savingEntry ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveText}
                    disabled={savingEntry || !editText.trim()}
                    style={{
                      flex: 1,
                      height: '44px',
                      borderRadius: '9999px',
                      backgroundColor: 'var(--cam-color-brand)',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: savingEntry || !editText.trim() ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      opacity: savingEntry || !editText.trim() ? 0.6 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    {savingEntry ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={2.5} />}
                    {t('common.save')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeleteId}
        title={t('history.delete')}
        message={t('history.deleteConfirm')}
        confirmLabel={t('common.delete')}
        destructive
        onConfirm={confirmDeleteEntry}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}

const modalIconButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const chipTextButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'var(--cam-text-brand)',
  fontSize: '12px',
  fontWeight: 500,
  fontFamily: 'inherit',
};

const chipRemoveButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'var(--cam-text-error)',
  display: 'flex',
  alignItems: 'center',
};
