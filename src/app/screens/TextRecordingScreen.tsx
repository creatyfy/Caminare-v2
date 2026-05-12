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
      fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header Area (compact to maximize textarea space) */}
      <div style={{ padding: '32px 24px 12px 24px', flexShrink: 0 }}>
        <button
          onClick={() => navigate('/home')}
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
            marginBottom: '12px'
          }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#2D2A45', margin: '0 0 4px 0' }}>
          Novo Registro por Texto
        </h1>
      </div>

      {/* Main Content Area — textarea takes most of the screen */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 24px 24px 24px',
        minHeight: 0
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
            borderRadius: '20px',
            padding: '20px',
            fontSize: '17px',
            color: '#2D2A45',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.03)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            marginBottom: '16px',
            minHeight: 0
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
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          Concluir Registro
        </button>
      </div>
    </div>
  );
}
