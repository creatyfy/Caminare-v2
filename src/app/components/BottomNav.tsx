import { Home, History, Brain, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: History, label: 'Histórico', path: '/historico' },
    { icon: Brain, label: 'Insights', path: '/padroes' },
    { icon: FileText, label: 'Resumo', path: '/resumo' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#534AB7]/10 safe-area-inset-bottom z-50"
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'white', 
        borderTop: '1px solid rgba(83, 74, 183, 0.1)', 
        zIndex: 50 
      }}
    >
      <div 
        className="flex flex-row justify-around items-center h-[68px] w-full max-w-md mx-auto px-2"
        style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          alignItems: 'center', 
          height: '68px', 
          width: '100%', 
          maxWidth: '448px', 
          margin: '0 auto', 
          padding: '0 8px' 
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive(item.path) ? 'text-[#534AB7]' : 'text-[#8B87A8]'
            }`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              flex: 1,
              height: '100%',
              textDecoration: 'none',
              color: isActive(item.path) ? '#534AB7' : '#8B87A8'
            }}
          >
            <item.icon 
              size={24} 
              strokeWidth={isActive(item.path) ? 2.5 : 2} 
            />
            <span 
              className="text-[10px] font-medium leading-none"
              style={{ fontSize: '10px', fontWeight: 500, lineHeight: 1 }}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
