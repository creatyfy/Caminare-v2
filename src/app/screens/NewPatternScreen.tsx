import { Sparkles, Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useNavigate } from 'react-router';

export function NewPatternScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full pb-20 bg-gradient-to-b from-[#534AB7]/5 to-[#F8F7FF]">
      <div className="px-6 pt-12 pb-6">
        <button onClick={() => navigate('/validacao-crencas')} className="text-[#534AB7] flex items-center gap-2 mb-6">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      <div className="flex-1 px-6 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#534AB7] to-[#7B72D9] flex items-center justify-center mb-6 shadow-lg shadow-[#534AB7]/20">
          <Sparkles size={36} className="text-white" strokeWidth={2} />
        </div>

        <h1 className="text-2xl text-[#2D2A45] mb-2 text-center">Novo Padrão Identificado</h1>
        <p className="text-[#8B87A8] text-center mb-8 max-w-xs">
          A IA identificou um padrão comportamental nos seus registros
        </p>

        <Card className="p-6 bg-white shadow-lg w-full max-w-sm mb-6">
          <div className="mb-4 p-4 bg-[#534AB7]/5 rounded-xl">
            <div className="text-xs font-medium text-[#534AB7] mb-2 uppercase tracking-wide">
              Padrão: Autossabotagem antes de desafios
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-[#2D2A45] mb-2">Observação:</h4>
              <p className="text-sm text-[#8B87A8] leading-relaxed">
                Você tende a experimentar ansiedade intensa e pensamentos de incompetência antes de apresentações ou situações de exposição profissional.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#2D2A45] mb-2">Gatilhos comuns:</h4>
              <ul className="text-sm text-[#8B87A8] space-y-1 list-disc list-inside">
                <li>Apresentações importantes</li>
                <li>Reuniões com superiores</li>
                <li>Situações de avaliação</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#2D2A45] mb-2">Sugestão:</h4>
              <p className="text-sm text-[#1D9E75] leading-relaxed">
                Considere explorar técnicas de respiração e preparação mental antes dessas situações. Converse com seu terapeuta sobre estratégias de manejo.
              </p>
            </div>
          </div>
        </Card>

        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={() => navigate('/')}
            className="w-full h-12 bg-[#1D9E75] hover:bg-[#188A64] text-white rounded-full flex items-center justify-center gap-2"
          >
            <Check size={18} strokeWidth={2.5} />
            Confirmar Padrão
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full h-12 border-[#DC2626]/20 text-[#DC2626] hover:bg-[#DC2626]/5 rounded-full flex items-center justify-center gap-2"
          >
            <X size={18} strokeWidth={2.5} />
            Não se Aplica
          </Button>
        </div>
      </div>
    </div>
  );
}
