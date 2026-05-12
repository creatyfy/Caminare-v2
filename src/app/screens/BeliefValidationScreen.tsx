import { Check, X, Edit3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export function BeliefValidationScreen() {
  const navigate = useNavigate();
  const [beliefs, setBeliefs] = useState([
    {
      id: 1,
      text: 'Eu não sou competente o suficiente',
      validated: null as boolean | null,
      contexts: ['Trabalho', 'Apresentações'],
    },
    {
      id: 2,
      text: 'Preciso ser perfeita para ser aceita',
      validated: null as boolean | null,
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
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: '#F8F7FF', 
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif' 
    }}>
      {/* Header */}
      <div style={{ padding: '48px 24px 24px 24px', backgroundColor: '#FFFFFF' }}>
        <button 
          onClick={() => navigate('/validacao-emocoes')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#534AB7', 
            background: 'none', 
            border: 'none', 
            fontSize: '16px', 
            fontWeight: '500', 
            padding: 0, 
            cursor: 'pointer', 
            marginBottom: '24px' 
          }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2D2A45', margin: '0 0 8px 0' }}>
          Crenças Identificadas
        </h1>
        <p style={{ fontSize: '15px', color: '#8B87A8', margin: 0, lineHeight: '1.4' }}>
          Valide as crenças limitantes encontradas
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {beliefs.map((belief) => (
            <div key={belief.id} style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ 
                  color: '#2D2A45', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  lineHeight: '1.5', 
                  margin: '0 0 12px 0' 
                }}>
                  {belief.text}
                </p>
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleValidation(belief.id, 'confirm')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 0',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: belief.validated === true ? '#1D9E75' : '#E8F5F0',
                    color: belief.validated === true ? '#FFFFFF' : '#1D9E75'
                  }}
                >
                  <Check size={20} strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Confirmar</span>
                </button>

                <button
                  onClick={() => handleValidation(belief.id, 'adjust')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 0',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#FEF5E7',
                    color: '#F59E0B'
                  }}
                >
                  <Edit3 size={20} strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Ajustar</span>
                </button>

                <button
                  onClick={() => handleValidation(belief.id, 'reject')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 0',
                    borderRadius: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: belief.validated === false ? '#DC2626' : '#FEF2F2',
                    color: belief.validated === false ? '#FFFFFF' : '#DC2626'
                  }}
                >
                  <X size={20} strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Descartar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          backgroundColor: '#F0EFFF',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '16px' }}>💡</span>
          <p style={{ 
            fontSize: '14px', 
            color: '#534AB7', 
            margin: 0, 
            lineHeight: '1.5' 
          }}>
            Crenças limitantes são pensamentos que podem estar afetando sua autoestima e bem-estar
          </p>
        </div>

        <button
          onClick={() => navigate('/novo-padrao')}
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: '#534AB7',
            color: '#FFFFFF',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            boxShadow: '0px 8px 24px rgba(83, 74, 183, 0.25)',
            cursor: 'pointer'
          }}
        >
          Finalizar Registro
        </button>
      </div>
    </div>
  );
}
