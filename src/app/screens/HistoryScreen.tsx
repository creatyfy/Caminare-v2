import { Calendar, Heart, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export function HistoryScreen() {
  const records = [
    {
      id: 1,
      date: '08 Mai, 2026',
      time: '14:30',
      emotions: ['Ansiedade', 'Preocupação'],
      summary: 'Apresentação importante gerando ansiedade...',
      color: '#534AB7',
    },
    {
      id: 2,
      date: '07 Mai, 2026',
      time: '18:30',
      emotions: ['Gratidão', 'Alegria'],
      summary: 'Feedback positivo da equipe sobre o projeto...',
      color: '#1D9E75',
    },
    {
      id: 3,
      date: '07 Mai, 2026',
      time: '14:20',
      emotions: ['Frustração'],
      summary: 'Dificuldade em me comunicar na reunião...',
      color: '#F59E0B',
    },
    {
      id: 4,
      date: '06 Mai, 2026',
      time: '20:15',
      emotions: ['Cansaço', 'Estresse'],
      summary: 'Dia intenso de trabalho, muitas demandas...',
      color: '#8B5CF6',
    },
    {
      id: 5,
      date: '05 Mai, 2026',
      time: '16:45',
      emotions: ['Confiança'],
      summary: 'Consegui resolver um problema complexo...',
      color: '#1D9E75',
    },
  ];

  return (
    <div className="flex flex-col h-full pb-20 bg-[#F8F7FF]">
      <div className="px-6 pt-12 pb-6 bg-white">
        <h1 className="text-2xl text-[#2D2A45] mb-2">Histórico</h1>
        <p className="text-[#8B87A8]">Seus registros de emoções e pensamentos</p>
      </div>

      <div className="px-6 py-4 bg-white border-b border-[#534AB7]/10">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B87A8]" size={18} />
            <Input
              placeholder="Buscar registros..."
              className="pl-10 bg-[#F8F7FF] border-0 h-10 rounded-xl"
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-32 h-10 border-0 bg-[#F8F7FF] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="week">7 dias</SelectItem>
              <SelectItem value="month">30 dias</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id} className="p-4 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${record.color}15` }}
                >
                  <Heart size={20} style={{ color: record.color }} strokeWidth={2.5} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs text-[#8B87A8]">
                      <Calendar size={14} />
                      <span>{record.date}</span>
                      <span>•</span>
                      <span>{record.time}</span>
                    </div>
                  </div>

                  <p className="text-[#2D2A45] text-sm mb-3 leading-relaxed line-clamp-2">
                    {record.summary}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {record.emotions.map((emotion, idx) => (
                      <Badge
                        key={idx}
                        className="bg-[#E8E6F7] text-[#534AB7] border-0 text-xs px-3 py-0.5"
                      >
                        {emotion}
                      </Badge>
                    ))}
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
