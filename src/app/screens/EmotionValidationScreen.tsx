import { Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export function EmotionValidationScreen() {
  const navigate = useNavigate();
  const [emotions, setEmotions] = useState([
    { id: 1, label: 'Ansiedade', validated: null },
    { id: 2, label: 'Preocupação', validated: null },
    { id: 3, label: 'Insegurança', validated: null },
  ]);

  const [thoughts, setThoughts] = useState([
    { id: 1, text: 'Não vou conseguir fazer a apresentação', validated: null },
    { id: 2, text: 'Nunca sou boa o suficiente', validated: null },
  ]);

  const handleEmotionValidation = (id: number, isValid: boolean) => {
    setEmotions(emotions.map(e => e.id === id ? { ...e, validated: isValid } : e));
  };

  const handleThoughtValidation = (id: number, isValid: boolean) => {
    setThoughts(thoughts.map(t => t.id === id ? { ...t, validated: isValid } : t));
  };

  return (
    <div className="flex flex-col h-full pb-20 bg-[#F8F7FF]">
      <div className="px-6 pt-12 pb-6 bg-white">
        <button onClick={() => navigate('/gravacao')} className="text-[#534AB7] flex items-center gap-2 mb-6">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <h1 className="text-2xl text-[#2D2A45] mb-2">Validação</h1>
        <p className="text-[#8B87A8]">Confirme as emoções e pensamentos identificados</p>
      </div>

      <div className="flex-1 px-6 py-6 overflow-auto">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#8B87A8] mb-3 px-1">Emoções identificadas</h3>
          <div className="space-y-2">
            {emotions.map((emotion) => (
              <Card key={emotion.id} className="p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <Badge className="bg-[#534AB7]/10 text-[#534AB7] border-0 px-4 py-1.5">
                    {emotion.label}
                  </Badge>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEmotionValidation(emotion.id, true)}
                      className={`p-2 rounded-full transition-colors ${
                        emotion.validated === true
                          ? 'bg-[#1D9E75] text-white'
                          : 'bg-[#1D9E75]/10 text-[#1D9E75] hover:bg-[#1D9E75]/20'
                      }`}
                    >
                      <Check size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleEmotionValidation(emotion.id, false)}
                      className={`p-2 rounded-full transition-colors ${
                        emotion.validated === false
                          ? 'bg-[#DC2626] text-white'
                          : 'bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20'
                      }`}
                    >
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[#8B87A8] mb-3 px-1">Pensamentos identificados</h3>
          <div className="space-y-2">
            {thoughts.map((thought) => (
              <Card key={thought.id} className="p-4 bg-white shadow-sm">
                <p className="text-[#2D2A45] mb-3 text-sm leading-relaxed">{thought.text}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleThoughtValidation(thought.id, true)}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                      thought.validated === true
                        ? 'bg-[#1D9E75] text-white'
                        : 'bg-[#1D9E75]/10 text-[#1D9E75] hover:bg-[#1D9E75]/20'
                    }`}
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleThoughtValidation(thought.id, false)}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                      thought.validated === false
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20'
                    }`}
                  >
                    Rejeitar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button
          onClick={() => navigate('/validacao-crencas')}
          className="w-full h-12 bg-[#534AB7] hover:bg-[#453EA0] text-white rounded-full mt-6"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
