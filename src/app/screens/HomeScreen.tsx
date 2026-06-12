import { useEffect, useState } from 'react';
import { Mic, Heart, Brain, TrendingUp, BookOpen, Edit3, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { usePendingPattern } from '../contexts/PendingPatternContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getProfile, getHomeStats, type Profile, type HomeStats } from '../lib/db';

export function HomeScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pattern, refresh: refreshPendingPattern } = usePendingPattern();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Modal do padrão: mostra uma vez por abertura da home. "Deixar pra depois"
  // só dispensa nesta sessão da tela — reabre numa próxima abertura enquanto
  // houver padrão pendente.
  const [patternDismissed, setPatternDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    Promise.all([getProfile(user.id), getHomeStats(user.id)]).then(([p, s]) => {
      if (!active) return;
      setProfile(p);
      setStats(s);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  // Revalida o padrão pendente sempre que a home é aberta (pega um padrão
  // recém-detectado ao concluir um registro).
  useEffect(() => {
    void refreshPendingPattern();
  }, [refreshPendingPattern]);

  const firstName = profile?.full_name?.split(' ')[0] ?? t('home.greetingFallback');
  const showPatternModal = !!pattern && !patternDismissed;
  const statValue = (n: number | undefined) =>
    loading || n === undefined ? '—' : String(n);

  const statsCards = [
    { icon: Heart, label: t('home.stats.emotions'), value: statValue(stats?.totalEmotions) },
    { icon: Brain, label: t('home.stats.patterns'), value: statValue(stats?.totalPatterns) },
    { icon: TrendingUp, label: t('home.stats.days'), value: statValue(stats?.activeDays) },
    { icon: BookOpen, label: t('home.stats.entries'), value: statValue(stats?.totalEntries) },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        paddingBottom: '90px',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--cam-color-brand-strong)',
          padding: '64px 24px 80px 24px',
          borderBottomLeftRadius: '32px',
          borderBottomRightRadius: '32px',
          color: 'var(--cam-text-on-brand)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 700,
                margin: '0 0 6px 0',
                letterSpacing: '-0.5px',
                color: 'var(--cam-text-on-brand)',
              }}
            >
              {t('home.greeting', { name: firstName })}
            </h1>
            <p style={{ fontSize: '15px', margin: 0, opacity: 0.9, fontWeight: 400 }}>
              {t('home.prompt')}
            </p>
          </div>

          {profile?.is_admin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              aria-label={t('admin.title')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
                marginTop: '2px',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <Shield size={13} strokeWidth={2.5} />
              Admin
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          padding: '0 24px',
          marginTop: '-54px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          {statsCards.map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'var(--cam-bg-card)',
                borderRadius: '16px',
                padding: '12px 4px',
                boxShadow: 'var(--cam-shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cam-bg-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                }}
              >
                <stat.icon size={14} color="var(--cam-text-brand)" strokeWidth={2.5} />
              </div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--cam-text-primary)',
                  lineHeight: 1,
                  marginBottom: '4px',
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--cam-text-secondary)',
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '16px',
            paddingTop: '32px',
            paddingBottom: '32px',
          }}
        >
          <button
            onClick={() => navigate('/gravacao')}
            style={{
              width: '100%',
              height: '72px',
              backgroundColor: 'var(--cam-color-brand)',
              color: 'var(--cam-text-on-brand)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '18px',
              fontWeight: 600,
              border: 'none',
              boxShadow: 'var(--cam-shadow-brand)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Mic size={24} strokeWidth={2.5} />
            {t('home.voiceButton')}
          </button>

          <button
            onClick={() => navigate('/registro-texto')}
            style={{
              width: '100%',
              height: '72px',
              backgroundColor: 'var(--cam-bg-card)',
              color: 'var(--cam-text-brand)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '18px',
              fontWeight: 600,
              border: `2px solid var(--cam-color-brand)`,
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Edit3 size={24} strokeWidth={2.5} />
            {t('home.textButton')}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showPatternModal}
        title={t('home.patternModalTitle', { name: firstName })}
        message={t('home.patternModalMessage')}
        confirmLabel={t('home.patternModalAnalyze')}
        cancelLabel={t('home.patternModalLater')}
        onConfirm={() => navigate('/novo-padrao')}
        onCancel={() => setPatternDismissed(true)}
      />
    </div>
  );
}
