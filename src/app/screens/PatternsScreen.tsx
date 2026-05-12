import { Brain, TrendingUp, TrendingDown } from 'lucide-react';

export function PatternsScreen() {
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
  ];

  const patterns = [
    {
      id: 1,
      title: 'Autossabotagem antes de desafios',
      description: 'Tendência a experimentar ansiedade intensa e pensamentos de incompetência antes de apresentações ou situações de exposição profissional.',
      triggers: ['Apresentações', 'Reuniões com superiores']
    }
  ];

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
          Insights
        </h1>
        <p style={{ fontSize: '15px', color: '#8B87A8', margin: 0, lineHeight: '1.4' }}>
          Suas emoções, pensamentos, crenças e padrões
        </p>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        paddingBottom: '100px' // Space for bottom nav
      }}>
        
        {/* Nuvem de Emoções */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', marginBottom: '16px', marginLeft: '4px' }}>
            Minhas principais emoções
          </h3>
          
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px 24px',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <span style={{ fontSize: '32px', fontWeight: '600', color: '#534AB7' }}>Ansiedade</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '24px', fontWeight: '600', color: '#534AB7', opacity: 0.9 }}>Gratidão</span>
              <span style={{ fontSize: '22px', fontWeight: '600', color: '#534AB7', opacity: 0.85 }}>Frustração</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#534AB7', opacity: 0.8 }}>Alegria</span>
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#534AB7', opacity: 0.8 }}>Preocupação</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#534AB7', opacity: 0.7 }}>Confiança</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#534AB7', opacity: 0.7 }}>Medo</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#534AB7', opacity: 0.7 }}>Esperança</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', width: '100%' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#534AB7', opacity: 0.6 }}>Tristeza</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#534AB7', opacity: 0.6 }}>Orgulho</span>
            </div>
          </div>
        </div>

        {/* Crenças Recorrentes */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', marginBottom: '16px', marginLeft: '4px' }}>
            Crenças Recorrentes
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {beliefs.map((belief) => (
              <div key={belief.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '20px',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
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
                    <Brain size={24} color="#534AB7" strokeWidth={2} />
                  </div>
                  
                  <div>
                    <h4 style={{ 
                      color: '#2D2A45', 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      lineHeight: '1.4', 
                      margin: '0 0 8px 0' 
                    }}>
                      {belief.text}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#8B87A8' }}>
                      <span>{belief.frequency} ocorrências</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {belief.trend === 'up' ? (
                          <TrendingUp size={14} color="#DC2626" />
                        ) : (
                          <TrendingDown size={14} color="#1D9E75" />
                        )}
                        <span style={{ color: '#8B87A8' }}>
                          {belief.trend === 'up' ? 'Aumentando' : 'Diminuindo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {belief.contexts.map((context, idx) => (
                    <span key={idx} style={{
                      backgroundColor: '#F0EFFF',
                      color: '#534AB7',
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {context}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Padrões Comportamentais */}
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#8B87A8', marginBottom: '16px', marginLeft: '4px' }}>
            Padrões Comportamentais
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {patterns.map((pattern) => (
              <div key={pattern.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '20px',
                boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ 
                    color: '#4B5563', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px'
                  }}>
                    PADRÃO: {pattern.title.toUpperCase()}
                  </div>
                </div>
                
                <p style={{ fontSize: '14px', color: '#2D2A45', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                  {pattern.description}
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {pattern.triggers.map((trigger, idx) => (
                    <span key={idx} style={{
                      backgroundColor: '#F0EFFF',
                      color: '#534AB7',
                      padding: '6px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
