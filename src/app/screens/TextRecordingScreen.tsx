import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function TextRecordingScreen() {
  const navigate = useNavigate();
  const [text, setText] = useState('');

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: '#F8F7FF', 
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif' 
    }}>
      {/* Header Area */}
      <div style={{ padding: '48px 24px 32px 24px' }}>
        <button 
          onClick={() => navigate('/')} 
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
          Escrever Registro
        </h1>
        <p style={{ fontSize: '15px', color: '#8B87A8', margin: 0 }}>
          Descreva seus pensamentos e emoções
        </p>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '0 24px 32px 24px'
      }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Como você está se sentindo hoje? O que aconteceu?"
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(83, 74, 183, 0.1)',
            borderRadius: '24px',
            padding: '20px',
            fontSize: '16px',
            color: '#2D2A45',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            marginBottom: '24px'
          }}
        />

        <button
          onClick={() => navigate('/validacao-emocoes')}
          disabled={text.trim().length === 0}
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: text.trim().length === 0 ? '#E8E6F7' : '#1D9E75',
            color: text.trim().length === 0 ? '#8B87A8' : '#FFFFFF',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            border: 'none',
            boxShadow: text.trim().length === 0 ? 'none' : '0px 4px 12px rgba(29, 158, 117, 0.2)',
            cursor: text.trim().length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Concluir Registro
        </button>
      </div>
    </div>
  );
}
