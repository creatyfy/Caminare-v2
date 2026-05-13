import { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Share2, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getEntriesForSummary, type EntryDetail } from '../lib/db';
import { formatDate } from '../lib/format';

export function SummaryScreen() {
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
    const sorted = [...entries].sort((a, b) =>
      a.created_at.localeCompare(b.created_at)
    );
    const first = formatDate(sorted[0].created_at).date;
    const last = formatDate(sorted[sorted.length - 1].created_at).date;
    return first === last ? first : `${first} - ${last}`;
  }, [entries]);

  const activeDays = useMemo(() => {
    const set = new Set(
      entries.map((e) => new Date(e.created_at).toISOString().slice(0, 10))
    );
    return set.size;
  }, [entries]);

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const escapeHtml = (value: string) =>
      value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const eventsHtml = entries
      .map((entry) => {
        const { date, time } = formatDate(entry.created_at);
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
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Resumo para Terapia — ${escapeHtml(periodLabel)}</title>
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
  @media print {
    body { margin: 16mm; }
    .event { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <h1>Resumo para Terapia</h1>
  <div class="period">${escapeHtml(periodLabel)}</div>

  <h2>Estatísticas gerais</h2>
  <div class="stats">
    <div class="stat"><strong>${entries.length}</strong> registros no período</div>
    <div class="stat"><strong>${activeDays}</strong> dias ativos</div>
  </div>

  <h2>Acontecimentos para abordar na terapia</h2>
  ${eventsHtml}

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => { window.print(); }, 200);
    });
  </script>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(doc);
    printWindow.document.close();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#F8F7FF',
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Scrollable single-page content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '100px'
      }}>
        {/* Header */}
        <div style={{ padding: '48px 24px 24px 24px', backgroundColor: '#FFFFFF' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2D2A45', margin: '0 0 8px 0' }}>
            Resumo para Terapia
          </h1>
          <p style={{ fontSize: '15px', color: '#8B87A8', margin: 0, lineHeight: '1.4' }}>
            Compartilhe seus insights com seu terapeuta
          </p>
        </div>

        {/* Date Selector */}
        <div style={{
          padding: '0 24px 24px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(83, 74, 183, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            position: 'relative'
          }}>
            <Calendar size={20} color="#534AB7" />
            <div style={{ flex: 1, position: 'relative' }}>
              <select style={{
                width: '100%',
                height: '44px',
                backgroundColor: '#F8F7FF',
                border: 'none',
                borderRadius: '12px',
                padding: '0 36px 0 16px',
                fontSize: '15px',
                color: '#2D2A45',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none'
              }}>
                <option value="30days">Últimos 30 dias</option>
                <option value="7days">Últimos 7 dias</option>
                <option value="90days">Últimos 3 meses</option>
              </select>
              <ChevronDown size={16} color="#8B87A8" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>

          {/* Header Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#F0EFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={24} color="#534AB7" strokeWidth={2} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2D2A45', margin: '0 0 4px 0' }}>
                  Resumo do Período
                </h3>
                <p style={{ fontSize: '14px', color: '#8B87A8', margin: 0 }}>
                  {periodLabel}
                </p>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#2D2A45', margin: '0 0 16px 0' }}>
                Estatísticas Gerais
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: '#F8F7FF', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#534AB7', marginBottom: '4px' }}>
                    {loading ? '—' : entries.length}
                  </div>
                  <div style={{ fontSize: '13px', color: '#8B87A8' }}>Registros totais</div>
                </div>
                <div style={{ backgroundColor: '#F8F7FF', borderRadius: '16px', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1D9E75', marginBottom: '4px' }}>
                    {loading ? '—' : activeDays}
                  </div>
                  <div style={{ fontSize: '13px', color: '#8B87A8' }}>Dias ativos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Events list with full text inline */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
            marginBottom: '20px'
          }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#2D2A45', margin: '0 0 16px 0' }}>
              Acontecimentos para abordar na terapia
            </h4>

            {loading && (
              <div style={{ textAlign: 'center', color: '#8B87A8', fontSize: '14px', padding: '16px 0' }}>
                Carregando...
              </div>
            )}

            {!loading && entries.length === 0 && (
              <div style={{ textAlign: 'center', color: '#8B87A8', fontSize: '14px', padding: '16px 0' }}>
                Nenhum registro no período.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!loading && entries.map((entry) => {
                const { date, time } = formatDate(entry.created_at);
                const summary =
                  entry.raw_text.length > 120
                    ? entry.raw_text.slice(0, 120).trimEnd() + '…'
                    : entry.raw_text;
                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#F8F7FF',
                      borderRadius: '16px',
                      border: '1px solid rgba(83, 74, 183, 0.1)'
                    }}
                  >
                    <div style={{ fontSize: '13px', color: '#8B87A8', marginBottom: '6px' }}>
                      {date} • {time}
                    </div>
                    <h5 style={{
                      fontSize: '15px',
                      color: '#2D2A45',
                      margin: '0 0 10px 0',
                      fontWeight: '600'
                    }}>
                      {summary}
                    </h5>
                    <p style={{
                      fontSize: '14px',
                      color: '#2D2A45',
                      lineHeight: '1.6',
                      margin: '0 0 12px 0',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {entry.raw_text}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {entry.emotions.map((emotion) => (
                        <span key={emotion.id} style={{
                          backgroundColor: '#F0EFFF',
                          color: '#534AB7',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {emotion.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={loading || entries.length === 0}
              style={{
                flex: 1,
                height: '56px',
                backgroundColor: 'transparent',
                color: '#534AB7',
                border: '1px solid rgba(83, 74, 183, 0.2)',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading || entries.length === 0 ? 'not-allowed' : 'pointer',
                opacity: loading || entries.length === 0 ? 0.5 : 1
              }}
            >
              <Download size={18} strokeWidth={2.5} />
              Baixar PDF
            </button>

            <button style={{
              flex: 1,
              height: '56px',
              backgroundColor: '#534AB7',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0px 4px 12px rgba(83, 74, 183, 0.2)'
            }}>
              <Share2 size={18} strokeWidth={2.5} />
              Compartilhar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
