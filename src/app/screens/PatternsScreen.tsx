import { Brain, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function PatternsScreen() {
  const emotionCloud = [
    { emotion: 'Ansiedade', count: 24, size: 32, color: '#534AB7' },
    { emotion: 'Gratidão', count: 18, size: 28, color: '#1D9E75' },
    { emotion: 'Frustração', count: 15, size: 24, color: '#F59E0B' },
    { emotion: 'Alegria', count: 14, size: 22, color: '#1D9E75' },
    { emotion: 'Preocupação', count: 12, size: 20, color: '#534AB7' },
    { emotion: 'Confiança', count: 10, size: 18, color: '#1D9E75' },
    { emotion: 'Medo', count: 8, size: 16, color: '#DC2626' },
    { emotion: 'Esperança', count: 7, size: 15, color: '#1D9E75' },
    { emotion: 'Tristeza', count: 6, size: 14, color: '#8B5CF6' },
    { emotion: 'Orgulho', count: 5, size: 14, color: '#F59E0B' },
  ];

  const beliefs = [
    {
      id: 1,
      text: 'Eu não sou competente o suficiente',
      frequency: 12,
      contexts: ['Trabalho', 'Apresentações'],
      trend: 'up',
    },
    {
      id: 2,
      text: 'Preciso ser perfeita para ser aceita',
      frequency: 8,
      contexts: ['Relacionamentos', 'Trabalho'],
      trend: 'down',
    },
    {
      id: 3,
      text: 'Minha opinião não é importante',
      frequency: 6,
      contexts: ['Reuniões', 'Social'],
      trend: 'stable',
    },
  ];

  return (
    <div className="flex flex-col h-full pb-20 bg-[#F8F7FF]">
      <div className="px-6 pt-12 pb-6 bg-white">
        <h1 className="text-2xl text-[#2D2A45] mb-2">Padrões</h1>
        <p className="text-[#8B87A8]">Seus padrões emocionais e crenças</p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#8B87A8] mb-4 px-1">Nuvem de Emoções</h3>
          <Card className="p-6 bg-white shadow-sm">
            <div className="flex flex-wrap gap-4 justify-center items-center min-h-[200px]">
              {emotionCloud.map((item, index) => (
                <span
                  key={index}
                  className="font-medium cursor-pointer hover:opacity-70 transition-opacity"
                  style={{
                    fontSize: `${item.size}px`,
                    color: item.color,
                  }}
                >
                  {item.emotion}
                </span>
              ))}
            </div>
          </Card>

          <div className="mt-3 flex justify-center gap-4 text-xs text-[#8B87A8]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#534AB7]" />
              <span>Desconforto</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#1D9E75]" />
              <span>Bem-estar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <span>Alerta</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[#8B87A8] mb-3 px-1">Crenças Recorrentes</h3>
          <div className="space-y-3">
            {beliefs.map((belief) => (
              <Card key={belief.id} className="p-4 bg-white shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#534AB7]/10 flex items-center justify-center flex-shrink-0">
                    <Brain size={18} className="text-[#534AB7]" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#2D2A45] font-medium mb-2 leading-relaxed">
                      {belief.text}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[#8B87A8]">
                      <span>{belief.frequency} ocorrências</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp
                          size={12}
                          className={
                            belief.trend === 'up' ? 'text-[#DC2626]' :
                            belief.trend === 'down' ? 'text-[#1D9E75]' :
                            'text-[#8B87A8]'
                          }
                        />
                        <span>
                          {belief.trend === 'up' ? 'Aumentando' :
                           belief.trend === 'down' ? 'Diminuindo' :
                           'Estável'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {belief.contexts.map((context, idx) => (
                    <Badge
                      key={idx}
                      className="bg-[#E8E6F7] text-[#534AB7] border-0 text-xs px-3 py-0.5"
                    >
                      {context}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
