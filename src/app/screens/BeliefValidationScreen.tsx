import { Check, X, Edit3, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export function BeliefValidationScreen() {
  const navigate = useNavigate();
  const [beliefs, setBeliefs] = useState([
    {
      id: 1,
      text: 'Eu não sou competente o suficiente',
      validated: null,
      contexts: ['Trabalho', 'Apresentações'],
    },
    {
      id: 2,
      text: 'Preciso ser perfeita para ser aceita',
      validated: null,
      contexts: ['Relacionamentos', 'Trabalho'],
    },
  ]);

  const handleValidation = (id: number, action: 'confirm' | 'reject' | 'adjust') => {
    if (action === 'adjust') {
      return;
    }
    setBeliefs(beliefs.map(b =>
      b.id === id ? { ...b, validated: action === 'confirm' } : b
    ));
  };

  return (
    <div className="flex flex-col h-full pb-20 bg-[#F8F7FF]">
      <div className="px-6 pt-12 pb-6 bg-white">
        <button onClick={() => navigate('/validacao-emocoes')} className="text-[#534AB7] flex items-center gap-2 mb-6">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <h1 className="text-2xl text-[#2D2A45] mb-2">Crenças Identificadas</h1>
        <p className="text-[#8B87A8]">Valide as crenças limitantes encontradas</p>
      </div>

      <div className="flex-1 px-6 py-6 overflow-auto">
        <div className="space-y-4">
          {beliefs.map((belief) => (
            <Card key={belief.id} className="p-5 bg-white shadow-sm border border-[#534AB7]/5">
              <div className="mb-4">
                <p className="text-[#2D2A45] font-medium mb-3 leading-relaxed">{belief.text}</p>
                <div className="flex flex-wrap gap-2">
                  {belief.contexts.map((context, idx) => (
                    <span key={idx} className="text-xs bg-[#E8E6F7] text-[#534AB7] px-3 py-1 rounded-full">
                      {context}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleValidation(belief.id, 'confirm')}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                    belief.validated === true
                      ? 'bg-[#1D9E75] text-white shadow-md'
                      : 'bg-[#1D9E75]/10 text-[#1D9E75] hover:bg-[#1D9E75]/20'
                  }`}
                >
                  <Check size={18} strokeWidth={2.5} />
                  <span className="text-xs font-medium">Confirmar</span>
                </button>

                <button
                  onClick={() => handleValidation(belief.id, 'adjust')}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-all"
                >
                  <Edit3 size={18} strokeWidth={2.5} />
                  <span className="text-xs font-medium">Ajustar</span>
                </button>

                <button
                  onClick={() => handleValidation(belief.id, 'reject')}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                    belief.validated === false
                      ? 'bg-[#DC2626] text-white shadow-md'
                      : 'bg-[#DC2626]/10 text-[#DC2626] hover:bg-[#DC2626]/20'
                  }`}
                >
                  <X size={18} strokeWidth={2.5} />
                  <span className="text-xs font-medium">Descartar</span>
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-[#534AB7]/5 rounded-2xl border border-[#534AB7]/10">
          <p className="text-sm text-[#534AB7]">
            💡 Crenças limitantes são pensamentos que podem estar afetando sua autoestima e bem-estar
          </p>
        </div>

        <Button
          onClick={() => navigate('/novo-padrao')}
          className="w-full h-12 bg-[#534AB7] hover:bg-[#453EA0] text-white rounded-full mt-6"
        >
          Finalizar Registro
        </Button>
      </div>
    </div>
  );
}
