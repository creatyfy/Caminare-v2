import { Sparkles, Check, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function NewPatternScreen() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100%', 
      backgroundColor: '#F8F7FF', 
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      paddingBottom: '40px'
    }}>
      {/* Header */}
      <div style={{ padding: '48px 24px 24px 24px' }}>
        <button 
          onClick={() => navigate('/validacao-crencas')} 
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
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#6558D3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0px 8px 24px rgba(101, 88, 211, 0.25)'
        }}>
          <Sparkles size={36} color="#FFFFFF" strokeWidth={2} />
        </div>

        {/* Titles */}
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#2D2A45', 
          textAlign: 'center', 
          margin: '0 0 12px 0' 
        }}>
          Novo Padrão Identificado
        </h1>
        <p style={{ 
          fontSize: '15px', 
          color: '#8B87A8', 
          textAlign: 'center', 
          margin: '0 auto 32px auto',
          maxWidth: '280px',
          lineHeight: '1.4'
        }}>
          Identificamos um possível novo padrão. Analise se ele faz sentido.
        </p>

        {/* Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
          margin: '0 24px 32px 24px',
          width: 'calc(100% - 48px)',
          maxWidth: '400px',
          boxSizing: 'border-box'
        }}>
          {/* Badge */}
          <div style={{
            backgroundColor: '#F3F4F6',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ 
              color: '#4B5563', 
              fontSize: '13px', 
              fontWeight: '600', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px',
              lineHeight: '1.4'
            }}>
              PADRÃO: AUTOSSABOTAGEM ANTES DE DESAFIOS
            </div>
          </div>

          {/* Descrição do padrão */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#2D2A45', margin: '0 0 8px 0' }}>
              Descrição do padrão:
            </h4>
            <p style={{ fontSize: '15px', color: '#8B87A8', lineHeight: '1.5', margin: 0 }}>
              Eu tendo a experimentar ansiedade intensa e pensamentos de incompetência antes de apresentações ou situações de exposição profissional.
            </p>
          </div>

          {/* Gatilhos */}
          <div style={{ marginBottom: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#2D2A45', margin: '0 0 8px 0' }}>
              Gatilhos comuns:
            </h4>
            <ul style={{ 
              fontSize: '15px', 
              color: '#8B87A8', 
              lineHeight: '1.6', 
              margin: 0, 
              paddingLeft: '20px' 
            }}>
              <li>Apresentações importantes</li>
              <li>Reuniões com superiores</li>
              <li>Situações de avaliação</li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ 
          width: '100%', 
          padding: '0 24px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px',
          maxWidth: '448px',
          boxSizing: 'border-box'
        }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: '#1D9E75',
              color: '#FFFFFF',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0px 4px 12px rgba(29, 158, 117, 0.2)'
            }}
          >
            <Check size={20} strokeWidth={2.5} />
            Confirmar Padrão
          </button>

          <button
            onClick={() => navigate('/home')}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: 'transparent',
              color: '#DC2626',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: '600',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              cursor: 'pointer'
            }}
          >
            <X size={20} strokeWidth={2.5} />
            Não se Aplica
          </button>
        </div>
      </div>
    </div>
  );
}
