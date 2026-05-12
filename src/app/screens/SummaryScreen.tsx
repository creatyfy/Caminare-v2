import { FileText, Download, Share2, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

export function SummaryScreen() {
  return (
    <div className="flex flex-col h-full pb-20 bg-[#F8F7FF]">
      <div className="px-6 pt-12 pb-6 bg-white">
        <h1 className="text-2xl text-[#2D2A45] mb-2">Resumo para Terapia</h1>
        <p className="text-[#8B87A8]">Compartilhe seus insights com seu terapeuta</p>
      </div>

      <div className="px-6 py-4 bg-white border-b border-[#534AB7]/10">
        <div className="flex items-center gap-3">
          <Calendar className="text-[#534AB7]" size={18} />
          <Select defaultValue="30days">
            <SelectTrigger className="flex-1 h-10 border-0 bg-[#F8F7FF] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 3 meses</SelectItem>
              <SelectItem value="custom">Período personalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <Card className="p-6 bg-white shadow-sm mb-4">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#534AB7]/10 flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-[#534AB7]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-medium text-[#2D2A45] mb-1">Resumo do Período</h3>
              <p className="text-sm text-[#8B87A8]">01 Abr - 08 Mai, 2026</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-medium text-[#2D2A45] mb-3">Estatísticas Gerais</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8F7FF] rounded-xl">
                  <div className="text-2xl font-semibold text-[#534AB7] mb-1">45</div>
                  <div className="text-xs text-[#8B87A8]">Registros totais</div>
                </div>
                <div className="p-3 bg-[#F8F7FF] rounded-xl">
                  <div className="text-2xl font-semibold text-[#1D9E75] mb-1">28</div>
                  <div className="text-xs text-[#8B87A8]">Dias ativos</div>
                </div>
                <div className="p-3 bg-[#F8F7FF] rounded-xl">
                  <div className="text-2xl font-semibold text-[#F59E0B] mb-1">7</div>
                  <div className="text-xs text-[#8B87A8]">Padrões identificados</div>
                </div>
                <div className="p-3 bg-[#F8F7FF] rounded-xl">
                  <div className="text-2xl font-semibold text-[#8B5CF6] mb-1">12</div>
                  <div className="text-xs text-[#8B87A8]">Crenças mapeadas</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#2D2A45] mb-3">Emoções Predominantes</h4>
              <div className="space-y-2">
                {[
                  { emotion: 'Ansiedade', percentage: 35, color: '#534AB7' },
                  { emotion: 'Gratidão', percentage: 28, color: '#1D9E75' },
                  { emotion: 'Frustração', percentage: 22, color: '#F59E0B' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#2D2A45]">{item.emotion}</span>
                      <span className="text-[#8B87A8]">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-[#E8E6F7] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#2D2A45] mb-3">Principais Insights</h4>
              <div className="space-y-3">
                <div className="p-4 bg-[#534AB7]/5 rounded-xl border border-[#534AB7]/10">
                  <Badge className="bg-[#534AB7] text-white border-0 mb-2 text-xs">
                    Padrão Recorrente
                  </Badge>
                  <p className="text-sm text-[#2D2A45] leading-relaxed">
                    Autossabotagem antes de situações de exposição profissional, especialmente apresentações
                  </p>
                </div>

                <div className="p-4 bg-[#1D9E75]/5 rounded-xl border border-[#1D9E75]/10">
                  <Badge className="bg-[#1D9E75] text-white border-0 mb-2 text-xs">
                    Progresso
                  </Badge>
                  <p className="text-sm text-[#2D2A45] leading-relaxed">
                    Aumento de 40% em emoções positivas comparado ao mês anterior
                  </p>
                </div>

                <div className="p-4 bg-[#F59E0B]/5 rounded-xl border border-[#F59E0B]/10">
                  <Badge className="bg-[#F59E0B] text-white border-0 mb-2 text-xs">
                    Atenção
                  </Badge>
                  <p className="text-sm text-[#2D2A45] leading-relaxed">
                    Crença "não sou competente" apareceu em 12 registros diferentes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-12 border-[#534AB7]/20 text-[#534AB7] hover:bg-[#534AB7]/5 rounded-full flex items-center justify-center gap-2"
          >
            <Download size={18} strokeWidth={2.5} />
            Baixar PDF
          </Button>

          <Button
            className="h-12 bg-[#534AB7] hover:bg-[#453EA0] text-white rounded-full flex items-center justify-center gap-2"
          >
            <Share2 size={18} strokeWidth={2.5} />
            Compartilhar
          </Button>
        </div>
      </div>
    </div>
  );
}
