import { Mic, Heart, Brain, TrendingUp, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useNavigate } from 'react-router';

export function HomeScreen() {
  const navigate = useNavigate();

  const stats = [
    { icon: Heart, label: 'Emoções registradas', value: '24', color: '#534AB7' },
    { icon: Brain, label: 'Padrões identificados', value: '7', color: '#1D9E75' },
    { icon: TrendingUp, label: 'Dias seguidos', value: '12', color: '#F59E0B' },
    { icon: BookOpen, label: 'Total de registros', value: '45', color: '#8B5CF6' },
  ];

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="bg-gradient-to-br from-[#534AB7] to-[#7B72D9] text-white px-6 pt-12 pb-8 rounded-b-3xl">
        <h1 className="text-2xl mb-1">Olá, Maria</h1>
        <p className="text-[#E8E6F7] opacity-90">Como você está se sentindo hoje?</p>
      </div>

      <div className="flex-1 px-6 -mt-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-full" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon size={18} style={{ color: stat.color }} strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-2xl font-semibold text-[#2D2A45] mb-1">{stat.value}</div>
              <div className="text-xs text-[#8B87A8]">{stat.label}</div>
            </Card>
          ))}
        </div>

        <Button
          onClick={() => navigate('/gravacao')}
          className="w-full h-14 bg-[#534AB7] hover:bg-[#453EA0] text-white rounded-2xl shadow-lg shadow-[#534AB7]/20 flex items-center justify-center gap-2"
        >
          <Mic size={20} strokeWidth={2.5} />
          Novo Registro
        </Button>

        <div className="mt-6 space-y-3">
          <h3 className="text-sm text-[#8B87A8] px-1">Registros recentes</h3>

          {[
            { emotion: 'Ansiedade', time: 'Há 2 horas', color: '#534AB7' },
            { emotion: 'Gratidão', time: 'Ontem às 18:30', color: '#1D9E75' },
            { emotion: 'Frustração', time: 'Ontem às 14:20', color: '#F59E0B' },
          ].map((record, index) => (
            <Card key={index} className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${record.color}15` }}>
                    <Heart size={18} style={{ color: record.color }} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-medium text-[#2D2A45]">{record.emotion}</div>
                    <div className="text-xs text-[#8B87A8]">{record.time}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
