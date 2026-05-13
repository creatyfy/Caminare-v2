import { useState, useEffect } from 'react';
import { Mic, Square, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export function RecordingScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcription, setTranscription] = useState('');

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ padding: '32px 24px 12px 24px' }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--cam-text-brand)',
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: 500,
            padding: 0,
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 4px 0' }}>
          {t('recording.title')}
        </h1>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 24px 24px 24px',
          minHeight: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--cam-bg-card)',
            borderRadius: '20px',
            boxShadow: 'var(--cam-shadow-card-strong)',
            padding: '20px',
            overflowY: 'auto',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <div
            style={{
              fontSize: '13px',
              color: 'var(--cam-text-secondary)',
              marginBottom: '12px',
              fontWeight: 500,
            }}
          >
            {t('recording.transcriptionLabel')}
          </div>
          {transcription ? (
            <p
              style={{
                color: 'var(--cam-text-primary)',
                lineHeight: 1.6,
                margin: 0,
                fontSize: '17px',
                flex: 1,
              }}
            >
              {transcription}
            </p>
          ) : (
            <p
              style={{
                color: 'var(--cam-text-secondary)',
                lineHeight: 1.5,
                margin: 0,
                fontSize: '15px',
                fontStyle: 'italic',
              }}
            >
              {isRecording ? t('recording.placeholderRecording') : t('recording.placeholderIdle')}
            </p>
          )}
        </div>

        {isRecording && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '20px' }}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: '2px',
                    backgroundColor: 'var(--cam-color-brand)',
                    borderRadius: '9999px',
                    height: `${Math.random() * 14 + 6}px`,
                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cam-text-brand)' }}>
              {formatTime(duration)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={toggleRecording}
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              backgroundColor: isRecording ? 'var(--cam-color-error)' : 'var(--cam-color-brand)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isRecording ? 'var(--cam-shadow-error)' : 'var(--cam-shadow-brand)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
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
