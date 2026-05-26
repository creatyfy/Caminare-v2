import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  RefreshCw,
  Loader2,
  Users,
  Activity,
  Heart,
  Brain,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Check,
  Eye,
  CircleDot,
} from 'lucide-react';
import {
  getAdminStats,
  getAdminFeedback,
  updateFeedbackStatus,
  type AdminStats,
  type FeedbackItem,
  type FeedbackStatus,
} from '../lib/db';
import { formatDate } from '../lib/format';

type FeedbackFilter = 'all' | FeedbackStatus;

export function AdminScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const [statsData, fbData] = await Promise.all([
        getAdminStats(),
        getAdminFeedback(feedbackFilter === 'all' ? undefined : feedbackFilter),
      ]);
      if (!statsData) {
        setError(t('admin.errorLoad'));
      }
      setStats(statsData);
      setFeedback(fbData);
      setLoading(false);
      setRefreshing(false);
    },
    [feedbackFilter, t]
  );

  useEffect(() => {
    load(true);
  }, [load]);

  async function handleStatusChange(feedbackId: string, status: FeedbackStatus) {
    const ok = await updateFeedbackStatus(feedbackId, status);
    if (ok) {
      setFeedback((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status } : f))
      );
      // refresh stats counters
      const s = await getAdminStats();
      if (s) setStats(s);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--cam-bg-page)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        zIndex: 50,
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: 'var(--cam-bg-card)',
          borderBottom: `1px solid var(--cam-border-subtle)`,
          padding: '16px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--cam-text-brand)',
              fontSize: '14px',
              fontWeight: 600,
              padding: '6px 8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              borderRadius: '8px',
            }}
          >
            <ArrowLeft size={18} />
            <span>{t('admin.backToApp')}</span>
          </button>
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--cam-text-primary)',
              margin: 0,
              letterSpacing: '-0.3px',
              textAlign: 'center',
              flex: 1,
            }}
          >
            {t('admin.title')}
          </h1>
          <button
            type="button"
            onClick={() => load(false)}
            disabled={refreshing || loading}
            aria-label={t('admin.refresh')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--cam-bg-tint)',
              border: 'none',
              borderRadius: '9999px',
              padding: '8px 14px',
              cursor: refreshing || loading ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              color: 'var(--cam-text-primary)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {refreshing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            <span style={{ display: 'none' }} className="md-show">
              {t('admin.refresh')}
            </span>
          </button>
        </div>
      </header>

      {/* Body */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px' }}>
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              gap: '12px',
              color: 'var(--cam-text-secondary)',
            }}
          >
            <Loader2 size={20} className="animate-spin" />
            <span style={{ fontSize: '14px' }}>{t('common.loading')}</span>
          </div>
        )}

        {error && !loading && (
          <div
            role="alert"
            style={{
              backgroundColor: 'var(--cam-bg-error-soft)',
              color: 'var(--cam-text-error)',
              borderRadius: '12px',
              padding: '14px 18px',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {!loading && stats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Section
              icon={<Users size={18} color="var(--cam-text-brand)" />}
              title={t('admin.sections.users')}
            >
              <MetricCard label={t('admin.metrics.totalUsers')} value={stats.total_users} />
              <MetricCard
                label={t('admin.metrics.usersTrial')}
                value={stats.users_trial}
                hint={t('admin.hints.requiresSubscriptions')}
                muted
              />
              <MetricCard
                label={t('admin.metrics.usersActive')}
                value={stats.users_active}
                hint={t('admin.hints.requiresSubscriptions')}
                muted
              />
              <MetricCard
                label={t('admin.metrics.subsAnnual')}
                value={stats.subs_annual_active}
                hint={t('admin.hints.requiresSubscriptions')}
                muted
              />
              <MetricCard
                label={t('admin.metrics.subsMonthly')}
                value={stats.subs_monthly_active}
                hint={t('admin.hints.requiresSubscriptions')}
                muted
              />
              <MetricCard
                label={t('admin.metrics.usersApple')}
                value={stats.users_apple}
                hint={t('admin.hints.requiresStoreData')}
                muted
              />
              <MetricCard
                label={t('admin.metrics.usersGoogle')}
                value={stats.users_google}
                hint={t('admin.hints.requiresStoreData')}
                muted
              />
            </Section>

            <Section
              icon={<Activity size={18} color="var(--cam-text-brand)" />}
              title={t('admin.sections.engagement')}
            >
              <MetricCard
                label={t('admin.metrics.totalEntries')}
                value={stats.total_entries}
              />
              <MetricCard
                label={t('admin.metrics.avgWeekly')}
                value={formatDecimal(stats.avg_weekly_entries_per_user)}
              />
            </Section>

            <Section
              icon={<Heart size={18} color="var(--cam-text-brand)" />}
              title={t('admin.sections.emotions')}
            >
              <MetricCard
                label={t('admin.metrics.suggested')}
                value={stats.emotions_total}
              />
              <MetricCard
                label={t('admin.metrics.validated')}
                value={stats.emotions_confirmed}
                accent="accent"
              />
              <MetricCard
                label={t('admin.metrics.rejected')}
                value={stats.emotions_rejected}
                accent="error"
              />
              <MetricCard
                label={t('admin.metrics.edited')}
                value={stats.emotions_adjusted}
                accent="warning"
              />
            </Section>

            <Section
              icon={<Sparkles size={18} color="var(--cam-text-brand)" />}
              title={t('admin.sections.thoughts')}
            >
              <MetricCard
                label={t('admin.metrics.suggested')}
                value={stats.thoughts_total}
                hint={t('admin.hints.requiresThoughtsValidation')}
                muted
              />
              <MetricCard
                label={t('admin.metrics.validated')}
                value={stats.thoughts_confirmed}
                hint={t('admin.hints.requiresThoughtsValidation')}
                muted
              />
              <MetricCard
                label={t('admin.metrics.rejected')}
                value={stats.thoughts_rejected}
                hint={t('admin.hints.requiresThoughtsValidation')}
                muted
              />
              <MetricCard
                label={t('admin.metrics.edited')}
                value={stats.thoughts_adjusted}
                hint={t('admin.hints.requiresThoughtsValidation')}
                muted
              />
            </Section>

            <Section
              icon={<Brain size={18} color="var(--cam-text-brand)" />}
              title={t('admin.sections.beliefs')}
            >
              <MetricCard
                label={t('admin.metrics.suggested')}
                value={stats.beliefs_total}
              />
              <MetricCard
                label={t('admin.metrics.validated')}
                value={stats.beliefs_confirmed}
                accent="accent"
              />
              <MetricCard
                label={t('admin.metrics.rejected')}
                value={stats.beliefs_rejected}
                accent="error"
              />
              <MetricCard
                label={t('admin.metrics.edited')}
                value={stats.beliefs_adjusted}
                accent="warning"
              />
            </Section>

            <Section
              icon={<TrendingUp size={18} color="var(--cam-text-brand)" />}
              title={t('admin.sections.patterns')}
            >
              <MetricCard
                label={t('admin.metrics.suggested')}
                value={stats.patterns_total}
              />
              <MetricCard
                label={t('admin.metrics.validated')}
                value={stats.patterns_confirmed}
                accent="accent"
              />
              <MetricCard
                label={t('admin.metrics.rejected')}
                value={stats.patterns_rejected}
                accent="error"
              />
              <MetricCard
                label={t('admin.metrics.edited')}
                value={stats.patterns_adjusted}
                accent="warning"
              />
            </Section>

            <FeedbackSection
              feedback={feedback}
              stats={stats}
              currentFilter={feedbackFilter}
              onFilterChange={setFeedbackFilter}
              onStatusChange={handleStatusChange}
              lang={i18n.language}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--cam-text-primary)',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
        }}
      >
        {icon}
        {title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {children}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  hint,
  accent,
  muted,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: 'accent' | 'error' | 'warning';
  muted?: boolean;
}) {
  const valueColor =
    accent === 'accent'
      ? 'var(--cam-text-accent)'
      : accent === 'error'
        ? 'var(--cam-text-error)'
        : accent === 'warning'
          ? 'var(--cam-text-warning)'
          : 'var(--cam-text-primary)';

  return (
    <div
      style={{
        backgroundColor: 'var(--cam-bg-card)',
        borderRadius: '16px',
        padding: '18px 20px',
        boxShadow: 'var(--cam-shadow-card)',
        opacity: muted ? 0.72 : 1,
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: 'var(--cam-text-secondary)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: valueColor,
          letterSpacing: '-0.5px',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontSize: '11px',
            color: 'var(--cam-text-secondary)',
            marginTop: '6px',
            fontStyle: 'italic',
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function FeedbackSection({
  feedback,
  stats,
  currentFilter,
  onFilterChange,
  onStatusChange,
  lang,
}: {
  feedback: FeedbackItem[];
  stats: AdminStats;
  currentFilter: FeedbackFilter;
  onFilterChange: (f: FeedbackFilter) => void;
  onStatusChange: (id: string, status: FeedbackStatus) => void;
  lang: string;
}) {
  const { t } = useTranslation();

  const filters: { value: FeedbackFilter; label: string; count: number }[] = [
    { value: 'all', label: t('admin.feedback.filterAll'), count: stats.feedback_total },
    { value: 'new', label: t('admin.feedback.filterNew'), count: stats.feedback_new },
    { value: 'read', label: t('admin.feedback.filterRead'), count: stats.feedback_read },
    {
      value: 'resolved',
      label: t('admin.feedback.filterResolved'),
      count: stats.feedback_resolved,
    },
  ];

  return (
    <section>
      <h2
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--cam-text-primary)',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
        }}
      >
        <MessageSquare size={18} color="var(--cam-text-brand)" />
        {t('admin.sections.feedback')}
      </h2>

      {/* Filter chips */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '14px',
        }}
      >
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onFilterChange(f.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '9999px',
              border:
                currentFilter === f.value ? 'none' : `1.5px solid var(--cam-border)`,
              backgroundColor:
                currentFilter === f.value
                  ? 'var(--cam-color-brand)'
                  : 'var(--cam-bg-card)',
              color:
                currentFilter === f.value ? '#FFFFFF' : 'var(--cam-text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {f.label} · {f.count}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {feedback.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '16px',
            padding: '32px 20px',
            textAlign: 'center',
            color: 'var(--cam-text-secondary)',
            fontSize: '14px',
            boxShadow: 'var(--cam-shadow-card)',
          }}
        >
          {t('admin.feedback.empty')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {feedback.map((item) => (
            <FeedbackRow
              key={item.id}
              item={item}
              onStatusChange={onStatusChange}
              lang={lang}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FeedbackRow({
  item,
  onStatusChange,
  lang,
}: {
  item: FeedbackItem;
  onStatusChange: (id: string, status: FeedbackStatus) => void;
  lang: string;
}) {
  const { t } = useTranslation();
  const { date, time } = formatDate(item.created_at, lang);
  const statusConfig: Record<FeedbackStatus, { color: string; bg: string; label: string; Icon: typeof Check }> = {
    new: {
      color: 'var(--cam-text-brand)',
      bg: 'var(--cam-bg-muted)',
      label: t('admin.feedback.statusNew'),
      Icon: CircleDot,
    },
    read: {
      color: 'var(--cam-text-warning)',
      bg: 'var(--cam-bg-warning-soft)',
      label: t('admin.feedback.statusRead'),
      Icon: Eye,
    },
    resolved: {
      color: 'var(--cam-text-accent)',
      bg: 'var(--cam-bg-accent-soft)',
      label: t('admin.feedback.statusResolved'),
      Icon: Check,
    },
  };
  const cfg = statusConfig[item.status];
  const Icon = cfg.Icon;

  return (
    <div
      style={{
        backgroundColor: 'var(--cam-bg-card)',
        borderRadius: '16px',
        padding: '16px 18px',
        boxShadow: 'var(--cam-shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--cam-text-primary)',
              marginBottom: '2px',
            }}
          >
            {item.user_name || t('admin.feedback.noName')}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--cam-text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.user_email || '—'} · {date} · {time}
          </div>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            backgroundColor: cfg.bg,
            color: cfg.color,
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            flexShrink: 0,
          }}
        >
          <Icon size={12} strokeWidth={2.5} />
          {cfg.label}
        </div>
      </div>

      <p
        style={{
          fontSize: '14px',
          color: 'var(--cam-text-primary)',
          lineHeight: 1.5,
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}
      >
        {item.message}
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(['new', 'read', 'resolved'] as FeedbackStatus[])
          .filter((s) => s !== item.status)
          .map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusChange(item.id, s)}
              style={{
                padding: '6px 12px',
                borderRadius: '9999px',
                border: `1px solid var(--cam-border)`,
                backgroundColor: 'transparent',
                color: 'var(--cam-text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {t('admin.feedback.markAs')} {statusConfig[s].label.toLowerCase()}
            </button>
          ))}
      </div>
    </div>
  );
}

function formatDecimal(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return n.toFixed(1).replace('.', ',');
}
