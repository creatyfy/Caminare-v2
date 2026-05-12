import { FileText, Download, Share2, Calendar, ChevronDown } from 'lucide-react';

export function SummaryScreen() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: '#F8F7FF', 
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif' 
    }}>
      {/* Header */}
      <div style={{ padding: '48px 24px 24px 24px', backgroundColor: '#FFFFFF' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2D2A45', margin: '0 0 8px 0' }}>
          Resumo para Terapia
        </h1>
        <p style={{ fontSize: '15px', color: '#8B87A8', margin: 0, lineHeight: '1.4' }}>
          Compartilhe seus insights com seu terapeuta
        </p>
      </div>

      {/* Date Selector */}
      <div style={{ 
        padding: '0 24px 24px 24px', 
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(83, 74, 183, 0.05)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          position: 'relative'
        }}>
          <Calendar size={20} color="#534AB7" />
          <div style={{ flex: 1, position: 'relative' }}>
            <select style={{
              width: '100%',
              height: '44px',
              backgroundColor: '#F8F7FF',
              border: 'none',
              borderRadius: '12px',
              padding: '0 36px 0 16px',
              fontSize: '15px',
              color: '#2D2A45',
              fontWeight: '500',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none'
            }}>
              <option value="30days">Últimos 30 dias</option>
              <option value="7days">Últimos 7 dias</option>
              <option value="90days">Últimos 3 meses</option>
            </select>
            <ChevronDown size={16} color="#8B87A8" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '24px', 
        paddingBottom: '100px' // Space for bottom nav
      }}>
        
        {/* Main Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
          marginBottom: '24px'
        }}>
          
          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#F0EFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={24} color="#534AB7" strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2D2A45', margin: '0 0 4px 0' }}>
                Resumo do Período
              </h3>
              <p style={{ fontSize: '14px', color: '#8B87A8', margin: 0 }}>
                01 Abr - 08 Mai, 2026
              </p>
            </div>
          </div>

          {/* Estatísticas Gerais */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#2D2A45', margin: '0 0 16px 0' }}>
              Estatísticas Gerais
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: '#F8F7FF', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#534AB7', marginBottom: '4px' }}>45</div>
                <div style={{ fontSize: '13px', color: '#8B87A8' }}>Registros totais</div>
              </div>
              <div style={{ backgroundColor: '#F8F7FF', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1D9E75', marginBottom: '4px' }}>28</div>
                <div style={{ fontSize: '13px', color: '#8B87A8' }}>Dias ativos</div>
              </div>
            </div>
          </div>

          {/* Resumo dos Acontecimentos */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#2D2A45', margin: '0 0 16px 0' }}>
              Acontecimentos para abordar na terapia
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '16px', backgroundColor: '#F8F7FF', borderRadius: '16px', border: '1px solid rgba(83, 74, 183, 0.1)' }}>
                <div style={{ fontSize: '13px', color: '#8B87A8', marginBottom: '4px' }}>08 Mai, 2026</div>
                <p style={{ fontSize: '15px', color: '#2D2A45', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
                  Briga com Fulano
                </p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F8F7FF', borderRadius: '16px', border: '1px solid rgba(83, 74, 183, 0.1)' }}>
                <div style={{ fontSize: '13px', color: '#8B87A8', marginBottom: '4px' }}>07 Mai, 2026</div>
                <p style={{ fontSize: '15px', color: '#2D2A45', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
                  Acesso de raiva no trabalho
                </p>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F8F7FF', borderRadius: '16px', border: '1px solid rgba(83, 74, 183, 0.1)' }}>
                <div style={{ fontSize: '13px', color: '#8B87A8', marginBottom: '4px' }}>05 Mai, 2026</div>
                <p style={{ fontSize: '15px', color: '#2D2A45', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
                  Sentimento de desesperança à noite
                </p>
              </div>
            </div>
          </div>

          {/* Síntese (Menor destaque) */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', margin: '0 0 12px 0' }}>
              Síntese do Período
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '16px' }}>
               <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
                 <strong style={{ color: '#4B5563' }}>Emoções principais:</strong> Ansiedade, Frustração, Gratidão
               </div>
               <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
                 <strong style={{ color: '#4B5563' }}>Crenças identificadas:</strong> "Não sou competente", "Preciso ser perfeita"
               </div>
               <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>
                 <strong style={{ color: '#4B5563' }}>Padrões:</strong> Autossabotagem antes de desafios
               </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            flex: 1,
            height: '56px',
            backgroundColor: 'transparent',
            color: '#534AB7',
            border: '1px solid rgba(83, 74, 183, 0.2)',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            <Download size={18} strokeWidth={2.5} />
            Baixar PDF
          </button>

          <button style={{
            flex: 1,
            height: '56px',
            backgroundColor: '#534AB7',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0px 4px 12px rgba(83, 74, 183, 0.2)'
          }}>
            <Share2 size={18} strokeWidth={2.5} />
            Compartilhar
          </button>
        </div>

      </div>
    </div>
  );
}
