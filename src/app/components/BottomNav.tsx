import { Home, History, Brain, FileText, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: t('nav.home'), path: '/home' },
    { icon: History, label: t('nav.history'), path: '/historico' },
    { icon: Brain, label: t('nav.insights'), path: '/padroes' },
    { icon: FileText, label: t('nav.summary'), path: '/resumo' },
    { icon: User, label: t('nav.profile'), path: '/perfil' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--cam-bg-card)',
        borderTop: `1px solid var(--cam-border-subtle)`,
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '68px',
          width: '100%',
          maxWidth: '448px',
          margin: '0 auto',
          padding: '0 8px',
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                flex: 1,
                height: '100%',
                textDecoration: 'none',
                color: active ? 'var(--cam-text-brand)' : 'var(--cam-text-secondary)',
              }}
            >
              <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span style={{ fontSize: '10px', fontWeight: 500, lineHeight: 1 }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
