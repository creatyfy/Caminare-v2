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
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--cam-bg-card)',
        borderTop: `1px solid var(--cam-border-subtle)`,
        zIndex: 50,
        // Edge-to-edge: a barra é fixa na viewport (ignora o padding do shell),
        // então some o inset da base aqui — a linha de ícones sobe acima da barra
        // de navegação do sistema e o fundo do card preenche atrás dela.
        paddingBottom: 'env(safe-area-inset-bottom)',
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
