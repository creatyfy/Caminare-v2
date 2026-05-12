import { useState, useEffect } from 'react';
import { Mic, Square, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function RecordingScreen() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcription, setTranscription] = useState('');

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setDuration(d => d + 1);
        if (duration === 3) {
          setTranscription('Eu me sinto muito ansiosa hoje...');
        } else if (duration === 6) {
          setTranscription('Eu me sinto muito ansiosa hoje... Tenho uma apresentação importante amanhã e continuo achando que não vou conseguir.');
        } else if (duration === 9) {
          setTranscription('Eu me sinto muito ansiosa hoje... Tenho uma apresentação importante amanhã e continuo achando que não vou conseguir. Esse pensamento de "nunca sou boa o suficiente" volta sempre.');
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    if (isRecording) {
      navigate('/validacao-emocoes');
    } else {
      setIsRecording(true);
      setDuration(0);
      setTranscription('');
    }
  };

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
            marginBottom: '24px' 
          }}
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#2D2A45', margin: '0 0 8px 0' }}>
          Novo Registro
        </h1>
        <p style={{ fontSize: '15px', color: '#8B87A8', margin: 0 }}>
          Compartilhe seus pensamentos e emoções
        </p>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '32px 24px'
      }}>
        
        {/* Transcription Box */}
        {transcription && (
          <div style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0px 8px 24px rgba(0,0,0,0.06)', width: '100%', maxWidth: '320px', marginBottom: '32px' }}>
            <div style={{ fontSize: '14px', color: '#8B87A8', marginBottom: '8px' }}>Transcrição em tempo real:</div>
            <p style={{ color: '#2D2A45', lineHeight: '1.6', margin: 0 }}>{transcription}</p>
          </div>
        )}

        {/* Animated Audio Waves */}
        {isRecording && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', height: '60px', marginBottom: '16px' }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  backgroundColor: '#534AB7',
                  borderRadius: '9999px',
                  height: `${Math.random() * 40 + 20}px`,
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Timer */}
        {isRecording && (
          <div style={{ fontSize: '30px', fontWeight: '600', color: '#534AB7', marginBottom: '48px' }}>
            {formatTime(duration)}
          </div>
        )}

        {/* Record / Stop Button */}
        <div style={{ position: 'relative', marginBottom: '32px' }}>
          <button
            onClick={toggleRecording}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: isRecording ? '#DC2626' : '#534AB7',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isRecording ? '0px 12px 32px rgba(220, 38, 38, 0.3)' : '0px 12px 32px rgba(83, 74, 183, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isRecording ? (
              <Square size={40} color="white" fill="white" />
            ) : (
              <Mic size={40} color="white" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Helper Text when not recording */}
        {!isRecording && !transcription && (
          <p style={{ 
            textAlign: 'center', 
            color: '#8B87A8', 
            fontSize: '15px', 
            lineHeight: '1.5', 
            maxWidth: '260px', 
            margin: 0 
          }}>
            Toque no botão para começar a gravar seus pensamentos e emoções
          </p>
        )}
      </div>
    </div>
  );
}
