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
      <div style={{ padding: '32px 24px 12px 24px' }}>
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
          Novo Registro por Voz
        </h1>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 24px 24px 24px',
        minHeight: 0
      }}>

        {/* Transcription Box — occupies most of the screen */}
        <div style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0px 8px 24px rgba(0,0,0,0.06)',
          padding: '20px',
          overflowY: 'auto',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          <div style={{ fontSize: '13px', color: '#8B87A8', marginBottom: '12px', fontWeight: '500' }}>
            Transcrição em tempo real
          </div>
          {transcription ? (
            <p style={{
              color: '#2D2A45',
              lineHeight: '1.6',
              margin: 0,
              fontSize: '17px',
              flex: 1
            }}>
              {transcription}
            </p>
          ) : (
            <p style={{
              color: '#8B87A8',
              lineHeight: '1.5',
              margin: 0,
              fontSize: '15px',
              fontStyle: 'italic'
            }}>
              {isRecording
                ? 'Comece a falar...'
                : 'Toque no botão abaixo para começar a gravar seus pensamentos e emoções.'}
            </p>
          )}
        </div>

        {/* Compact controls row: small wave + small timer */}
        {isRecording && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '20px' }}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '2px',
                    backgroundColor: '#534AB7',
                    borderRadius: '9999px',
                    height: `${Math.random() * 14 + 6}px`,
                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#534AB7' }}>
              {formatTime(duration)}
            </div>
          </div>
        )}

        {/* Stop / Record Button — below the transcription box */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={toggleRecording}
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              backgroundColor: isRecording ? '#DC2626' : '#534AB7',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isRecording
                ? '0px 12px 32px rgba(220, 38, 38, 0.3)'
                : '0px 12px 32px rgba(83, 74, 183, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isRecording ? (
              <Square size={32} color="white" fill="white" />
            ) : (
              <Mic size={32} color="white" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
