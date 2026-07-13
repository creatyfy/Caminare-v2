import { Home, History, Brain, FileText, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { usePendingPattern } from '../contexts/PendingPatternContext';

export function BottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const { pattern } = usePendingPattern();
  const hasPendingPattern = !!pattern;

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
        // Barra FLUTUANTE (padrão iOS novo): descolada da borda de baixo
        // (safe area + folga) e centralizada, sem ocupar a largura toda. O
        // container transparente não captura toque — só a "pílula" é clicável
        // (pointerEvents), então o conteúdo atrás das margens continua rolável.
        bottom: 'calc(env(safe-area-inset-bottom) + 12px)',
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        paddingLeft: 'calc(env(safe-area-inset-left) + 16px)',
        paddingRight: 'calc(env(safe-area-inset-right) + 16px)',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '64px',
          width: '100%',
          maxWidth: '360px',
          padding: '0 6px',
          backgroundColor: 'var(--cam-bg-card)',
          border: '1px solid var(--cam-border-subtle)',
          borderRadius: '26px',
          boxShadow: 'var(--cam-shadow-card, 0 8px 28px rgba(0, 0, 0, 0.14))',
          pointerEvents: 'auto',
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          // Pulso roxo no Insights enquanto houver padrão pendente de validação.
          const pulsing = item.path === '/padroes' && hasPendingPattern;
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
              <span
                className={pulsing ? 'cam-pattern-pulse' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  color: pulsing ? 'var(--cam-text-brand)' : 'inherit',
                }}
              >
                <item.icon size={24} strokeWidth={active || pulsing ? 2.5 : 2} />
              </span>
              <span style={{ fontSize: '10px', fontWeight: 500, lineHeight: 1 }}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
