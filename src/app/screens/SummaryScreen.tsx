import { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Share2, Calendar, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getEntriesForSummary, type EntryDetail } from '../lib/db';
import { formatDate } from '../lib/format';

export function SummaryScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<EntryDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    getEntriesForSummary(user.id).then((data) => {
      if (!active) return;
      setEntries(data ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const periodLabel = useMemo(() => {
    if (entries.length === 0) return '—';
    const sorted = [...entries].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const first = formatDate(sorted[0].created_at, i18n.language).date;
    const last = formatDate(sorted[sorted.length - 1].created_at, i18n.language).date;
    return first === last ? first : `${first} - ${last}`;
  }, [entries, i18n.language]);

  const activeDays = useMemo(() => {
    const set = new Set(entries.map((e) => new Date(e.created_at).toISOString().slice(0, 10)));
    return set.size;
  }, [entries]);

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const escapeHtml = (value: string) =>
      value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const eventsHtml = entries
      .map((entry) => {
        const { date, time } = formatDate(entry.created_at, i18n.language);
        const summary =
          entry.raw_text.length > 120
            ? entry.raw_text.slice(0, 120).trimEnd() + '…'
            : entry.raw_text;
        const emotionNames = entry.emotions.map((e) => e.name);
        return `
          <section class="event">
            <div class="event-meta">${escapeHtml(date)} • ${escapeHtml(time)}</div>
            <h3 class="event-title">${escapeHtml(summary)}</h3>
            <p class="event-text">${escapeHtml(entry.raw_text)}</p>
            <div class="tags">
              ${emotionNames.map((e) => `<span class="tag">${escapeHtml(e)}</span>`).join('')}
            </div>
          </section>
        `;
      })
      .join('');

    const doc = `<!doctype html>
<html lang="${i18n.language.startsWith('en') ? 'en' : 'pt-BR'}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(t('summary.pdfTitle'))} — ${escapeHtml(periodLabel)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #2D2A45;
    margin: 32px;
    line-height: 1.5;
  }
  h1 { font-size: 24px; margin: 0 0 4px 0; color: #2D2A45; }
  .period { font-size: 14px; color: #6B7280; margin-bottom: 24px; }
  h2 { font-size: 18px; margin: 24px 0 12px 0; color: #534AB7; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; }
  .stats { display: flex; gap: 24px; margin-bottom: 16px; }
  .stat { font-size: 14px; }
  .stat strong { color: #534AB7; }
  .event { padding: 16px 0; border-bottom: 1px solid #E5E7EB; page-break-inside: avoid; }
  .event:last-child { border-bottom: none; }
  .event-meta { font-size: 12px; color: #8B87A8; margin-bottom: 4px; }
  .event-title { font-size: 15px; font-weight: 600; margin: 0 0 8px 0; color: #2D2A45; }
  .event-text { font-size: 14px; color: #2D2A45; margin: 0 0 12px 0; white-space: pre-wrap; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { background: #F0EFFF; color: #534AB7; padding: 4px 10px; border-radius: 9999px; font-size: 12px; }
  @media print { body { margin: 16mm; } .event { page-break-inside: avoid; } }
</style>
</head>
<body>
  <h1>${escapeHtml(t('summary.pdfTitle'))}</h1>
  <div class="period">${escapeHtml(periodLabel)}</div>

  <h2>${escapeHtml(t('summary.pdfStats'))}</h2>
  <div class="stats">
    <div class="stat"><strong>${entries.length}</strong> ${escapeHtml(t('summary.pdfRecords'))}</div>
    <div class="stat"><strong>${activeDays}</strong> ${escapeHtml(t('summary.pdfDays'))}</div>
  </div>

  <h2>${escapeHtml(t('summary.pdfEvents'))}</h2>
  ${eventsHtml}

  <script>
    window.addEventListener('load', () => { setTimeout(() => { window.print(); }, 200); });
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(doc);
    printWindow.document.close();
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
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '100px' }}>
        <div style={{ padding: '48px 24px 24px 24px', backgroundColor: 'var(--cam-bg-card)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 8px 0' }}>
            {t('summary.title')}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.4 }}>
            {t('summary.subtitle')}
          </p>
        </div>

        <div
          style={{
            padding: '0 24px 24px 24px',
            backgroundColor: 'var(--cam-bg-card)',
            borderBottom: `1px solid var(--cam-border-subtle)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <Calendar size={20} color="var(--cam-text-brand)" />
            <div style={{ flex: 1, position: 'relative' }}>
              <select
                style={{
                  width: '100%',
                  height: '44px',
                  backgroundColor: 'var(--cam-bg-tint)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0 36px 0 16px',
                  fontSize: '15px',
                  color: 'var(--cam-text-primary)',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none',
                }}
              >
                <option value="30days">{t('summary.period30')}</option>
                <option value="7days">{t('summary.period7')}</option>
                <option value="90days">{t('summary.period90')}</option>
              </select>
              <ChevronDown
                size={16}
                color="var(--cam-text-secondary)"
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          <div
            style={{
              backgroundColor: 'var(--cam-bg-card)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: 'var(--cam-shadow-card)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
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
                <FileText size={24} color="var(--cam-text-brand)" strokeWidth={2} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cam-text-primary)', margin: '0 0 4px 0' }}>
                  {t('summary.headerCardTitle')}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--cam-text-secondary)', margin: 0 }}>{periodLabel}</p>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--cam-text-primary)', margin: '0 0 16px 0' }}>
                {t('summary.statsHeader')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: 'var(--cam-bg-tint)', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-brand)', marginBottom: '4px' }}>
                    {loading ? '—' : entries.length}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--cam-text-secondary)' }}>{t('summary.totalEntries')}</div>
                </div>
                <div style={{ backgroundColor: 'var(--cam-bg-tint)', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-accent)', marginBottom: '4px' }}>
                    {loading ? '—' : activeDays}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--cam-text-secondary)' }}>{t('summary.activeDays')}</div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--cam-bg-card)',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: 'var(--cam-shadow-card)',
              marginBottom: '20px',
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--cam-text-primary)', margin: '0 0 16px 0' }}>
              {t('summary.eventsHeader')}
            </h4>

            {loading && (
              <div style={{ textAlign: 'center', color: 'var(--cam-text-secondary)', fontSize: '14px', padding: '16px 0' }}>
                {t('common.loading')}
              </div>
            )}

            {!loading && entries.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--cam-text-secondary)', fontSize: '14px', padding: '16px 0' }}>
                {t('summary.empty')}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!loading &&
                entries.map((entry) => {
                  const { date, time } = formatDate(entry.created_at, i18n.language);
                  const summary =
                    entry.raw_text.length > 120
                      ? entry.raw_text.slice(0, 120).trimEnd() + '…'
                      : entry.raw_text;
                  return (
                    <div
                      key={entry.id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'var(--cam-bg-tint)',
                        borderRadius: '16px',
                        border: `1px solid var(--cam-border-subtle)`,
                      }}
                    >
                      <div style={{ fontSize: '13px', color: 'var(--cam-text-secondary)', marginBottom: '6px' }}>
                        {date} • {time}
                      </div>
                      <h5 style={{ fontSize: '15px', color: 'var(--cam-text-primary)', margin: '0 0 10px 0', fontWeight: 600 }}>
                        {summary}
                      </h5>
                      <p
                        style={{
                          fontSize: '14px',
                          color: 'var(--cam-text-primary)',
                          lineHeight: 1.6,
                          margin: '0 0 12px 0',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {entry.raw_text}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {entry.emotions.map((emotion) => (
                          <span
                            key={emotion.id}
                            style={{
                              backgroundColor: 'var(--cam-bg-muted)',
                              color: 'var(--cam-text-brand)',
                              padding: '4px 10px',
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
                  );
                })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={loading || entries.length === 0}
              style={{
                flex: 1,
                height: '56px',
                backgroundColor: 'transparent',
                color: 'var(--cam-text-brand)',
                border: `1px solid var(--cam-border)`,
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading || entries.length === 0 ? 'not-allowed' : 'pointer',
                opacity: loading || entries.length === 0 ? 0.5 : 1,
              }}
            >
              <Download size={18} strokeWidth={2.5} />
              {t('summary.downloadPdf')}
            </button>

            <button
              style={{
                flex: 1,
                height: '56px',
                backgroundColor: 'var(--cam-color-brand)',
                color: 'var(--cam-text-on-brand)',
                border: 'none',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--cam-shadow-brand)',
              }}
            >
              <Share2 size={18} strokeWidth={2.5} />
              {t('summary.share')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
