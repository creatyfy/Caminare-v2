import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, Heart, Brain } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getEntryById, type EntryDetail } from '../lib/db';
import { formatDate } from '../lib/format';

export function EntryDetailScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    let active = true;
    setLoading(true);
    getEntryById(user.id, id).then((data) => {
      if (!active) return;
      setEntry(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, id]);

  if (loading) {
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
        <BackButton onClick={() => navigate('/historico')} label={t('common.back')} />
        <p style={{ color: 'var(--cam-text-secondary)', fontSize: '15px' }}>{t('common.loading')}</p>
      </div>
    );
  }

  if (!entry) {
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
        <BackButton onClick={() => navigate('/historico')} label={t('common.back')} />
        <p style={{ color: 'var(--cam-text-primary)', fontSize: '16px' }}>{t('common.notFound')}</p>
      </div>
    );
  }

  const { date, time } = formatDate(entry.created_at, i18n.language);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: '48px 24px 16px 24px', backgroundColor: 'var(--cam-bg-card)' }}>
        <BackButton onClick={() => navigate('/historico')} label={t('common.back')} />

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 12px 0' }}>
          {t('entryDetail.title')}
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--cam-text-secondary)',
            fontSize: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} />
            <span>{date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} />
            <span>{time}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Card>
          <h3
            style={{
              fontSize: '13px',
              color: 'var(--cam-text-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              margin: '0 0 12px 0',
            }}
          >
            {t('entryDetail.fullText')}
          </h3>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--cam-text-primary)',
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {entry.raw_text}
          </p>
        </Card>

        <Card>
          <SectionHeader icon={<Heart size={18} color="var(--cam-text-brand)" strokeWidth={2.5} />} title={t('entryDetail.emotionsTitle')} />
          {entry.emotions.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--cam-text-secondary)', margin: 0 }}>
              {t('entryDetail.emotionsEmpty')}
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {entry.emotions.map((emotion) => (
                <span
                  key={emotion.id}
                  style={{
                    backgroundColor: 'var(--cam-bg-muted)',
                    color: 'var(--cam-text-brand)',
                    padding: '8px 14px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                >
                  {emotion.name}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ marginBottom: '24px' }}>
          <SectionHeader icon={<Brain size={18} color="var(--cam-text-brand)" strokeWidth={2.5} />} title={t('entryDetail.thoughtsTitle')} />
          {entry.parsed_thoughts.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--cam-text-secondary)', margin: 0 }}>
              {t('entryDetail.thoughtsEmpty')}
            </p>
          ) : (
            <ul
              style={{
                margin: 0,
                paddingLeft: '20px',
                listStyleType: 'disc',
                listStylePosition: 'outside',
                color: 'var(--cam-text-primary)',
                fontSize: '15px',
                lineHeight: 1.6,
              }}
            >
              {entry.parsed_thoughts.map((thought, idx) => (
                <li key={idx} style={{ display: 'list-item', marginBottom: '4px' }}>
                  "{thought}"
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
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
        marginBottom: '16px',
      }}
    >
      <ArrowLeft size={20} />
      <span>{label}</span>
    </button>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--cam-bg-card)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: 'var(--cam-shadow-card)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      {icon}
      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--cam-text-primary)', margin: 0 }}>
        {title}
      </h3>
    </div>
  );
}
