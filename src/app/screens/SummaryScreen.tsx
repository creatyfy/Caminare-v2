import { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Share2, Calendar, ChevronDown, Loader2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getEntriesForSummary, getProfile, type EntryDetail, type Profile } from '../lib/db';
import { formatDate } from '../lib/format';
import { isNative } from '../lib/native';
import { sharePdfNative } from '../lib/pdfShare';
import type { TherapyReportData } from '../lib/pdf/TherapyReportPDF';

type SummaryPeriod = '7days' | '15days' | '30days';
type PdfBusy = 'idle' | 'downloading' | 'sharing';

// Tamanho do preview do relato no card (truncado com reticências).
const PREVIEW_CHARS = 120;

export function SummaryScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [entries, setEntries] = useState<EntryDetail[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<SummaryPeriod>('30days');
  const [pdfBusy, setPdfBusy] = useState<PdfBusy>('idle');
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSuccess, setPdfSuccess] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<EntryDetail | null>(null);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then(setProfile);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    const days = period === '7days' ? 7 : period === '15days' ? 15 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    getEntriesForSummary(user.id, since).then((data) => {
      if (!active) return;
      setEntries(data ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, period]);

  const periodLabel = useMemo(() => {
    if (entries.length === 0) return '—';
    const sorted = [...entries].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const first = formatDate(sorted[0].created_at, i18n.language).date;
    const last = formatDate(sorted[sorted.length - 1].created_at, i18n.language).date;
    return first === last ? first : `${first} - ${last}`;
  }, [entries, i18n.language]);

  const topEmotions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of entries) {
      for (const emotion of entry.emotions) {
        counts[emotion.name] = (counts[emotion.name] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [entries]);

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

  function buildReportData(): TherapyReportData {
    const userName =
      profile?.full_name?.trim() ||
      user?.email ||
      t('admin.feedback.noName');
    const now = new Date();
    const generatedAt = now.toLocaleString(i18n.language, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      title: t('summary.pdfTitle'),
      userName,
      periodLabel,
      generatedLabel: `${t('summary.pdfGeneratedAt')} ${generatedAt}`,
      totalEntries: entries.length,
      totalEntriesLabel: t('summary.pdfRecords'),
      topEmotionsLabel: t('summary.topEmotions'),
      topEmotions,
      eventsHeader: t('summary.pdfEvents'),
      events: entries.map((entry) => {
        const { date, time } = formatDate(entry.created_at, i18n.language);
        return {
          date,
          time,
          text: entry.raw_text,
          emotions: entry.emotions.map((e) => e.name),
        };
      }),
      labels: {
        forLabel: t('summary.pdfFor'),
        periodLabelKey: t('summary.pdfPeriodLabel'),
        generatedLabelKey: t('summary.pdfGeneratedAt'),
        pageLabel: t('summary.pdfPage'),
        emptyEvents: t('summary.empty'),
        confidentialNote: t('summary.pdfConfidential'),
      },
      logoSrc: `${window.location.origin}/logoatualizado.png`,
    };
  }

  async function buildPdfBlob(): Promise<Blob> {
    // Lazy load: @react-pdf/renderer só é baixado quando o usuário
    // clica em Baixar ou Compartilhar
    const [{ pdf }, { TherapyReportPDF }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('../lib/pdf/TherapyReportPDF'),
    ]);
    const data = buildReportData();
    return await pdf(<TherapyReportPDF data={data} />).toBlob();
  }

  function buildFilename(): string {
    const ts = new Date().toISOString().slice(0, 10);
    const base = i18n.language.startsWith('en') ? 'caminare-summary' : 'caminare-resumo';
    return `${base}-${ts}.pdf`;
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  async function handleDownloadPdf() {
    if (pdfBusy !== 'idle' || loading || entries.length === 0) return;
    setPdfBusy('downloading');
    setPdfError(null);
    setPdfSuccess(null);
    try {
      const blob = await buildPdfBlob();
      const filename = buildFilename();
      if (isNative) {
        // Nativo: <a download> não funciona no webview. Salva o arquivo e abre a
        // folha nativa (que inclui "Salvar em Arquivos"/Drive).
        await sharePdfNative(blob, filename, {
          title: t('summary.pdfTitle'),
          text: t('summary.shareText'),
          dialogTitle: t('summary.pdfDialogTitle'),
        });
        setPdfSuccess(t('summary.pdfNativeDone'));
      } else {
        triggerDownload(blob, filename);
      }
    } catch (err) {
      console.error('[pdf.download]', err);
      setPdfError(t('summary.pdfError'));
    } finally {
      setPdfBusy('idle');
    }
  }

  async function handleShare() {
    if (pdfBusy !== 'idle' || loading || entries.length === 0) return;
    setPdfBusy('sharing');
    setPdfError(null);
    setPdfSuccess(null);
    try {
      const blob = await buildPdfBlob();
      const filename = buildFilename();

      // Nativo (Capacitor): navigator.share de arquivos não funciona no webview.
      // Usa Filesystem + Share (folha de compartilhamento nativa).
      if (isNative) {
        await sharePdfNative(blob, filename, {
          title: t('summary.pdfTitle'),
          text: t('summary.shareText'),
          dialogTitle: t('summary.pdfDialogTitle'),
        });
        setPdfSuccess(t('summary.pdfNativeDone'));
        return;
      }

      // Web: Web Share API de arquivos quando disponível, senão download direto.
      const file = new File([blob], filename, { type: 'application/pdf' });
      const canShareFiles =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({
            title: t('summary.pdfTitle'),
            text: t('summary.shareText'),
            files: [file],
          });
        } catch (shareErr) {
          // Usuário cancelou: ignore. Outros erros: cai pro download.
          const name = (shareErr as Error).name;
          if (name === 'AbortError') return;
          triggerDownload(blob, filename);
        }
      } else {
        // Navegador sem suporte a Web Share de arquivos: download direto
        triggerDownload(blob, filename);
      }
    } catch (err) {
      console.error('[pdf.share]', err);
      setPdfError(t('summary.pdfError'));
    } finally {
      setPdfBusy('idle');
    }
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
                value={period}
                onChange={(e) => setPeriod(e.target.value as SummaryPeriod)}
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
                <option value="7days">{t('summary.period7')}</option>
                <option value="15days">{t('summary.period15')}</option>
                <option value="30days">{t('summary.period30')}</option>
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
              <div
                style={{
                  backgroundColor: 'var(--cam-bg-tint)',
                  borderRadius: '16px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-brand)', marginBottom: '4px' }}>
                  {loading ? '—' : entries.length}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--cam-text-secondary)' }}>{t('summary.totalEntries')}</div>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--cam-text-primary)', margin: '0 0 12px 0' }}>
                {t('summary.topEmotions')}
              </h4>
              {loading ? (
                <div style={{ fontSize: '14px', color: 'var(--cam-text-secondary)' }}>—</div>
              ) : topEmotions.length === 0 ? (
                <div style={{ fontSize: '14px', color: 'var(--cam-text-secondary)' }}>{t('summary.empty')}</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {topEmotions.map((e) => (
                    <span
                      key={e.name}
                      style={{
                        backgroundColor: 'var(--cam-bg-muted)',
                        color: 'var(--cam-text-brand)',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {e.name} ({e.count})
                    </span>
                  ))}
                </div>
              )}
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
                        padding: '16px',
                        backgroundColor: 'var(--cam-bg-tint)',
                        borderRadius: '16px',
                        border: `1px solid var(--cam-border-subtle)`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '13px', color: 'var(--cam-text-secondary)', marginBottom: '6px' }}>
                        {date} • {time}
                      </div>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: 400,
                          color: 'var(--cam-text-primary)',
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

          {pdfError && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--cam-bg-error-soft)',
                color: 'var(--cam-text-error)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '12px',
              }}
            >
              {pdfError}
            </div>
          )}

          {pdfSuccess && (
            <div
              role="status"
              style={{
                backgroundColor: 'var(--cam-bg-accent-soft)',
                color: 'var(--cam-text-accent)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '12px',
              }}
            >
              {pdfSuccess}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={loading || entries.length === 0 || pdfBusy !== 'idle'}
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
                cursor: loading || entries.length === 0 || pdfBusy !== 'idle' ? 'not-allowed' : 'pointer',
                opacity: loading || entries.length === 0 || pdfBusy !== 'idle' ? 0.5 : 1,
                fontFamily: 'inherit',
              }}
            >
              {pdfBusy === 'downloading' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Download size={18} strokeWidth={2.5} />
              )}
              {pdfBusy === 'downloading' ? t('summary.generating') : t('summary.downloadPdf')}
            </button>

            <button
              onClick={handleShare}
              disabled={loading || entries.length === 0 || pdfBusy !== 'idle'}
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
                cursor: loading || entries.length === 0 || pdfBusy !== 'idle' ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--cam-shadow-brand)',
                opacity: loading || entries.length === 0 || pdfBusy !== 'idle' ? 0.7 : 1,
                fontFamily: 'inherit',
              }}
            >
              {pdfBusy === 'sharing' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Share2 size={18} strokeWidth={2.5} />
              )}
              {pdfBusy === 'sharing' ? t('summary.generating') : t('summary.share')}
            </button>
          </div>
        </div>
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
