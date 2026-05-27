import { useCallback, useEffect, useRef, useState } from 'react';
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
  LayoutDashboard,
  UserCircle2,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAdminStats,
  getAdminFeedback,
  updateFeedbackStatus,
  getAdminUsers,
  getProfile,
  type AdminStats,
  type FeedbackItem,
  type FeedbackStatus,
  type AdminUser,
  type Profile,
} from '../lib/db';
import { formatDate } from '../lib/format';

type FeedbackFilter = 'all' | FeedbackStatus;
type AdminSection = 'overview' | 'feedback' | 'users';

const SIDEBAR_WIDTH = 256;

export function AdminScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();

  const [section, setSection] = useState<AdminSection>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<FeedbackFilter>('all');
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Carrega profile uma vez
  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then(setProfile);
  }, [user]);

  // Fecha menu do usuário ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const load = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setLoading(true);
      else setRefreshing(true);
      setError(null);
      const [statsData, fbData] = await Promise.all([
        getAdminStats(),
        getAdminFeedback(feedbackFilter === 'all' ? undefined : feedbackFilter),
      ]);
      if (!statsData) setError(t('admin.errorLoad'));
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

  // Carrega lista de usuários só quando o admin abrir essa seção
  useEffect(() => {
    if (section !== 'users') return;
    if (users !== null) return; // já carregou
    let active = true;
    setUsersLoading(true);
    getAdminUsers().then((u) => {
      if (!active) return;
      setUsers(u);
      setUsersLoading(false);
    });
    return () => {
      active = false;
    };
  }, [section, users]);

  async function handleStatusChange(feedbackId: string, status: FeedbackStatus) {
    const ok = await updateFeedbackStatus(feedbackId, status);
    if (ok) {
      setFeedback((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status } : f))
      );
      const s = await getAdminStats();
      if (s) setStats(s);
    }
  }

  async function handleSignOut() {
    setUserMenuOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  }

  const sectionTitles: Record<AdminSection, string> = {
    overview: t('admin.nav.overview'),
    feedback: t('admin.nav.feedback'),
    users: t('admin.nav.users'),
  };

  const initial = (profile?.full_name?.[0] ?? user?.email?.[0] ?? 'A').toUpperCase();
  const displayName = profile?.full_name ?? user?.email ?? 'Admin';

  function handleNavClick(s: AdminSection) {
    setSection(s);
    setDrawerOpen(false);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--cam-bg-page)',
        zIndex: 50,
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex"
        style={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          backgroundColor: 'var(--cam-bg-card)',
          borderRight: `1px solid var(--cam-border-subtle)`,
          flexDirection: 'column',
          padding: '20px 16px',
        }}
      >
        <SidebarContent
          section={section}
          onNavClick={handleNavClick}
          onViewAsUser={() => navigate('/home')}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Sidebar — mobile (drawer) */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              zIndex: 60,
            }}
          />
          <aside
            className="md:hidden"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: SIDEBAR_WIDTH,
              backgroundColor: 'var(--cam-bg-card)',
              padding: '20px 16px',
              zIndex: 70,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <SidebarContent
              section={section}
              onNavClick={handleNavClick}
              onViewAsUser={() => {
                navigate('/home');
                setDrawerOpen(false);
              }}
              onSignOut={handleSignOut}
              onClose={() => setDrawerOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderBottom: `1px solid var(--cam-border-subtle)`,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="md:hidden"
            aria-label="Menu"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--cam-text-primary)',
            }}
          >
            <Menu size={22} />
          </button>

          <h1
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--cam-text-primary)',
              margin: 0,
              letterSpacing: '-0.3px',
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {sectionTitles[section]}
          </h1>

          <button
            type="button"
            onClick={() => load(false)}
            disabled={refreshing || loading}
            aria-label={t('admin.refresh')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '38px',
              height: '38px',
              background: 'var(--cam-bg-tint)',
              border: 'none',
              borderRadius: '50%',
              cursor: refreshing || loading ? 'wait' : 'pointer',
              fontFamily: 'inherit',
              color: 'var(--cam-text-primary)',
              flexShrink: 0,
            }}
          >
            {refreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </button>

          {/* User menu */}
          <div ref={userMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px 4px 4px',
                background: 'var(--cam-bg-tint)',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  backgroundColor: 'var(--cam-color-brand)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {initial}
              </div>
              <ChevronDown size={14} color="var(--cam-text-secondary)" />
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  minWidth: 220,
                  backgroundColor: 'var(--cam-bg-card)',
                  borderRadius: '14px',
                  boxShadow: 'var(--cam-shadow-card-strong)',
                  border: `1px solid var(--cam-border-subtle)`,
                  overflow: 'hidden',
                  zIndex: 80,
                }}
              >
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: `1px solid var(--cam-border-subtle)`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      color: 'var(--cam-text-brand)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px',
                    }}
                  >
                    <Shield size={11} />
                    {t('admin.adminBadge')}
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--cam-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {displayName}
                  </div>
                  {user?.email && profile?.full_name && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--cam-text-secondary)',
                        marginTop: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.email}
                    </div>
                  )}
                </div>
                <MenuItem
                  icon={<UserCircle2 size={16} />}
                  label={t('admin.menu.viewAsUser')}
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/home');
                  }}
                />
                <MenuItem
                  icon={<LogOut size={16} />}
                  label={t('admin.menu.signOut')}
                  onClick={handleSignOut}
                  destructive
                />
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 20px 40px 20px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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

            {!loading && stats && section === 'overview' && (
              <OverviewView stats={stats} />
            )}
            {!loading && stats && section === 'feedback' && (
              <FeedbackView
                feedback={feedback}
                stats={stats}
                currentFilter={feedbackFilter}
                onFilterChange={setFeedbackFilter}
                onStatusChange={handleStatusChange}
                lang={i18n.language}
              />
            )}
            {!loading && section === 'users' && (
              <UsersView users={users} loading={usersLoading} lang={i18n.language} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function SidebarContent({
  section,
  onNavClick,
  onViewAsUser,
  onSignOut,
  onClose,
}: {
  section: AdminSection;
  onNavClick: (s: AdminSection) => void;
  onViewAsUser: () => void;
  onSignOut: () => void;
  onClose?: () => void;
}) {
  const { t } = useTranslation();
  const navItems: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: t('admin.nav.overview'), icon: LayoutDashboard },
    { id: 'feedback', label: t('admin.nav.feedback'), icon: MessageSquare },
    { id: 'users', label: t('admin.nav.users'), icon: Users },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 10px 18px 10px',
          borderBottom: `1px solid var(--cam-border-subtle)`,
          marginBottom: '12px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              backgroundColor: 'var(--cam-color-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={16} color="#FFFFFF" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--cam-text-primary)',
                lineHeight: 1.1,
              }}
            >
              Caminare
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--cam-text-brand)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                fontWeight: 700,
                marginTop: '2px',
              }}
            >
              {t('admin.adminBadge')}
            </div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            style={{
              background: 'none',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              color: 'var(--cam-text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {navItems.map((item) => {
          const active = section === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavClick(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: active ? 'var(--cam-bg-muted)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--cam-text-brand)' : 'var(--cam-text-primary)',
                textAlign: 'left',
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          paddingTop: '16px',
          marginTop: '16px',
          borderTop: `1px solid var(--cam-border-subtle)`,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={onViewAsUser}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--cam-text-secondary)',
            textAlign: 'left',
          }}
        >
          <ArrowLeft size={18} />
          {t('admin.menu.viewAsUser')}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--cam-text-error)',
            textAlign: 'left',
          }}
        >
          <LogOut size={18} />
          {t('admin.menu.signOut')}
        </button>
      </div>
    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '12px 14px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '14px',
        fontWeight: 500,
        color: destructive ? 'var(--cam-text-error)' : 'var(--cam-text-primary)',
        textAlign: 'left',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Overview ──────────────────────────────────────────────────────────────────

function OverviewView({ stats }: { stats: AdminStats }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Section icon={<Users size={18} />} title={t('admin.sections.users')}>
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

      <Section icon={<Activity size={18} />} title={t('admin.sections.engagement')}>
        <MetricCard label={t('admin.metrics.totalEntries')} value={stats.total_entries} />
        <MetricCard
          label={t('admin.metrics.avgWeekly')}
          value={formatDecimal(stats.avg_weekly_entries_per_user)}
        />
      </Section>

      <Section icon={<Heart size={18} />} title={t('admin.sections.emotions')}>
        <MetricCard label={t('admin.metrics.suggested')} value={stats.emotions_total} />
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

      <Section icon={<Sparkles size={18} />} title={t('admin.sections.thoughts')}>
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

      <Section icon={<Brain size={18} />} title={t('admin.sections.beliefs')}>
        <MetricCard label={t('admin.metrics.suggested')} value={stats.beliefs_total} />
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

      <Section icon={<TrendingUp size={18} />} title={t('admin.sections.patterns')}>
        <MetricCard label={t('admin.metrics.suggested')} value={stats.patterns_total} />
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
    </div>
  );
}

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
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--cam-text-secondary)',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
        }}
      >
        <span style={{ color: 'var(--cam-text-brand)' }}>{icon}</span>
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

// ── Feedback ──────────────────────────────────────────────────────────────────

function FeedbackView({
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
    <div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '20px',
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

      {feedback.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '16px',
            padding: '40px 20px',
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
    </div>
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
  const statusConfig: Record<
    FeedbackStatus,
    { color: string; bg: string; label: string; Icon: typeof Check }
  > = {
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

// ── Users ─────────────────────────────────────────────────────────────────────

function UsersView({
  users,
  loading,
  lang,
}: {
  users: AdminUser[] | null;
  loading: boolean;
  lang: string;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  if (loading || users === null) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          gap: '10px',
          color: 'var(--cam-text-secondary)',
        }}
      >
        <Loader2 size={18} className="animate-spin" />
        <span style={{ fontSize: '14px' }}>{t('common.loading')}</span>
      </div>
    );
  }

  const filtered = search.trim()
    ? users.filter((u) => {
        const term = search.toLowerCase();
        return (
          (u.email ?? '').toLowerCase().includes(term) ||
          (u.full_name ?? '').toLowerCase().includes(term)
        );
      })
    : users;

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.users.searchPlaceholder')}
          style={{
            width: '100%',
            height: '44px',
            padding: '0 16px',
            borderRadius: '12px',
            border: `1px solid var(--cam-border-subtle)`,
            backgroundColor: 'var(--cam-bg-card)',
            fontSize: '14px',
            color: 'var(--cam-text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Count */}
      <div
        style={{
          fontSize: '12px',
          color: 'var(--cam-text-secondary)',
          marginBottom: '12px',
          fontWeight: 600,
        }}
      >
        {t('admin.users.count', { count: filtered.length })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            color: 'var(--cam-text-secondary)',
            fontSize: '14px',
            boxShadow: 'var(--cam-shadow-card)',
          }}
        >
          {search.trim()
            ? t('admin.users.emptySearch')
            : t('admin.users.emptyAll')}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '16px',
            boxShadow: 'var(--cam-shadow-card)',
            overflow: 'hidden',
          }}
        >
          {filtered.map((u, i) => (
            <UserRow
              key={u.id}
              user={u}
              lang={lang}
              isLast={i === filtered.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  lang,
  isLast,
}: {
  user: AdminUser;
  lang: string;
  isLast: boolean;
}) {
  const { t } = useTranslation();
  const initial = (user.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase();
  const signupDate = new Date(user.created_at).toLocaleDateString(lang, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 18px',
        borderBottom: isLast ? 'none' : `1px solid var(--cam-border-subtle)`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'var(--cam-bg-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '15px',
          fontWeight: 700,
          color: 'var(--cam-text-brand)',
        }}
      >
        {initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '2px',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--cam-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {user.full_name || t('admin.feedback.noName')}
          </span>
          {user.is_admin && (
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#FFFFFF',
                backgroundColor: 'var(--cam-color-brand)',
                padding: '2px 6px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                flexShrink: 0,
              }}
            >
              Admin
            </span>
          )}
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
          {user.email || '—'}
        </div>
      </div>
      <div
        style={{
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {user.entries_count}
        </div>
        <div
          style={{
            fontSize: '10px',
            color: 'var(--cam-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
            fontWeight: 600,
            marginTop: '1px',
          }}
        >
          {t('admin.users.entries')}
        </div>
      </div>
      <div
        style={{
          fontSize: '11px',
          color: 'var(--cam-text-secondary)',
          minWidth: '70px',
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {signupDate}
      </div>
    </div>
  );
}

function formatDecimal(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return n.toFixed(1).replace('.', ',');
}
