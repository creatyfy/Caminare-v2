import { Home, History, Brain, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: History, label: 'Histórico', path: '/historico' },
    { icon: Brain, label: 'Padrões', path: '/padroes' },
    { icon: FileText, label: 'Resumo', path: '/resumo' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#534AB7]/10 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive(item.path) ? 'text-[#534AB7]' : 'text-[#8B87A8]'
            }`}
          >
            <item.icon size={24} strokeWidth={2} />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
