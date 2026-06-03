import { useEffect, useMemo, useState } from 'react';
import { Calendar, Heart, Search, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getEntries, type EntryWithEmotions } from '../lib/db';
import { formatDate } from '../lib/format';

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

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((e) => e.raw_text.toLowerCase().includes(term));
  }, [entries, search]);

  // Fecha o modal com a tecla Escape.
  useEffect(() => {
    if (!selectedEntry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedEntry(null);
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
                onClick={() => setSelectedEntry(entry)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedEntry(entry);
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
          onClick={() => setSelectedEntry(null)}
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
            {/* Header: data/hora + fechar */}
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
              <button
                onClick={() => setSelectedEntry(null)}
                aria-label={t('common.back')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--cam-text-secondary)',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo: relato completo + emoções */}
            <div style={{ overflowY: 'auto', padding: '20px', flex: 1 }}>
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
              {selectedEntry.emotions.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedEntry.emotions.map((emotion) => (
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
              ) : (
                <p style={{ fontSize: '14px', color: 'var(--cam-text-secondary)', margin: 0 }}>
                  {t('entryDetail.emotionsEmpty')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
