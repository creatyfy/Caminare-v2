import { useEffect, useRef, useState } from 'react';
import { Mic, ArrowLeft, Square, Trash2, RotateCcw, Loader2, Edit3, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { createTextEntry } from '../lib/db';

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};

type SpeechRecognitionErrorEventLike = { error: string };

type RecState = 'idle' | 'recording' | 'review' | 'saving';
type RecLang = 'pt-BR' | 'en-US';
const MAX_SECONDS = 120;
const LANG_STORAGE_KEY = 'caminare_rec_lang';

function getInitialRecLang(appLang: string): RecLang {
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'pt-BR' || saved === 'en-US') return saved;
    } catch {
      // ignore
    }
  }
  return appLang.startsWith('en') ? 'en-US' : 'pt-BR';
}

function langChipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '10px 16px',
    borderRadius: '9999px',
    border: active ? 'none' : `1.5px solid var(--cam-border)`,
    backgroundColor: active ? 'var(--cam-color-brand)' : 'var(--cam-bg-card)',
    color: active ? '#FFFFFF' : 'var(--cam-text-primary)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'inherit',
    boxShadow: active ? 'var(--cam-shadow-brand)' : 'none',
  };
}

export function RecordingScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [state, setState] = useState<RecState>('idle');
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [recLang, setRecLang] = useState<RecLang>(() => getInitialRecLang(i18n.language));

  function changeRecLang(lang: RecLang) {
    setRecLang(lang);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulatedRef = useRef<string>('');
  const interimRef = useRef<string>('');

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => cleanupRefs();
  }, []);

  function cleanupRefs() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }

  function start() {
    if (state === 'recording') return;
    setError(null);
    setFinalText('');
    setInterimText('');
    setSeconds(0);
    accumulatedRef.current = '';
    interimRef.current = '';

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError(t('recording.notSupported'));
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = recLang;

    recognition.onresult = (event) => {
      // Reconstrói o texto completo a partir do estado atual de TODOS os
      // resultados, em vez de anexar. Evita duplicação quando o engine
      // emite o mesmo final mais de uma vez (acontece no Safari iOS).
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      accumulatedRef.current = final.trim();
      setFinalText(accumulatedRef.current);
      interimRef.current = interim.trim();
      setInterimText(interim.trim());
    };

    recognition.onerror = (event) => {
      // eslint-disable-next-line no-console
      console.error('SpeechRecognition error:', event.error);
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError(t('recording.errorPermission'));
      } else if (event.error === 'network') {
        setError(t('recording.errorNetwork'));
      } else {
        setError(t('recording.errorGeneric'));
      }
      cleanupRefs();
      setState('idle');
    };

    recognition.onend = () => {
      // Browser pode encerrar sozinho; nesse caso, mantém o que foi capturado
      // e deixa o usuário decidir o que fazer.
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setState('recording');

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS) {
            // Auto-stop quando bater 2 min
            setTimeout(() => stop(), 0);
            return MAX_SECONDS;
          }
          return next;
        });
      }, 1000);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError(t('recording.errorGeneric'));
    }
  }

  function stop() {
    cleanupRefs();
    const captured = (accumulatedRef.current + ' ' + interimRef.current).trim();
    if (captured) {
      accumulatedRef.current = captured;
      interimRef.current = '';
      setFinalText(captured);
      setInterimText('');
      setState('review');
    } else {
      setError(t('recording.errorEmpty'));
      setState('idle');
    }
  }

  function discard() {
    accumulatedRef.current = '';
    interimRef.current = '';
    setFinalText('');
    setInterimText('');
    setSeconds(0);
    setError(null);
    setState('idle');
  }

  async function save() {
    if (!user) return;
    const text = finalText.trim();
    if (!text) return;
    setState('saving');
    setError(null);
    try {
      const entryId = await createTextEntry(user.id, text);
      if (!entryId) {
        setError(t('recording.errorSave'));
        setState('review');
        return;
      }
      navigate(`/validacao-emocoes?entryId=${entryId}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setError(t('recording.errorSave'));
      setState('review');
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  const remaining = MAX_SECONDS - seconds;
  const isWarn = remaining <= 20;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '32px 24px 12px 24px', flexShrink: 0 }}>
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
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            margin: '0 0 4px 0',
          }}
        >
          {t('recording.title')}
        </h1>
      </div>

      {/* Unsupported browser */}
      {!isSupported && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              backgroundColor: 'var(--cam-bg-warning-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={40} color="var(--cam-text-warning)" strokeWidth={2} />
          </div>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--cam-text-secondary)',
              margin: 0,
              maxWidth: 320,
              lineHeight: 1.5,
            }}
          >
            {t('recording.notSupported')}
          </p>
          <button
            onClick={() => navigate('/registro-texto')}
            style={{
              marginTop: '12px',
              width: '100%',
              maxWidth: 320,
              height: '56px',
              backgroundColor: 'var(--cam-color-brand)',
              color: 'var(--cam-text-on-brand)',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--cam-shadow-brand)',
            }}
          >
            <Edit3 size={20} strokeWidth={2.5} />
            {t('recording.useTextInstead')}
          </button>
        </div>
      )}

      {/* Idle */}
      {isSupported && state === 'idle' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '20px',
            textAlign: 'center',
          }}
        >
          <button
            onClick={start}
            aria-label={t('recording.startPrompt')}
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              backgroundColor: 'var(--cam-color-brand)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--cam-shadow-brand)',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Mic size={56} color="#FFFFFF" strokeWidth={2} />
          </button>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--cam-text-primary)',
              fontWeight: 500,
              margin: '8px 0 0 0',
              maxWidth: 280,
              lineHeight: 1.5,
            }}
          >
            {t('recording.startPrompt')}
          </p>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => changeRecLang('pt-BR')}
              aria-pressed={recLang === 'pt-BR'}
              style={langChipStyle(recLang === 'pt-BR')}
            >
              🇧🇷 Português
            </button>
            <button
              type="button"
              onClick={() => changeRecLang('en-US')}
              aria-pressed={recLang === 'en-US'}
              style={langChipStyle(recLang === 'en-US')}
            >
              🇺🇸 English
            </button>
          </div>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--cam-text-secondary)',
              margin: 0,
            }}
          >
            {t('recording.limitNote')}
          </p>

          {error && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--cam-bg-error-soft)',
                color: 'var(--cam-text-error)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 500,
                marginTop: '8px',
                maxWidth: 320,
                textAlign: 'left',
              }}
            >
              {error}
            </div>
          )}
        </div>
      )}

      {/* Recording */}
      {isSupported && state === 'recording' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 24px 24px 24px',
            minHeight: 0,
          }}
        >
          {/* Recording indicator + timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              backgroundColor: 'var(--cam-bg-card)',
              borderRadius: '16px',
              boxShadow: 'var(--cam-shadow-card)',
              marginBottom: '14px',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                className="animate-pulse"
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cam-color-error)',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--cam-text-primary)',
                }}
              >
                {t('recording.recording')}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--cam-text-secondary)',
                  backgroundColor: 'var(--cam-bg-muted)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {recLang === 'pt-BR' ? 'PT' : 'EN'}
              </span>
            </div>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: isWarn ? 'var(--cam-text-error)' : 'var(--cam-text-secondary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
            </span>
          </div>

          {/* Transcript area */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--cam-bg-card)',
              border: `1px solid var(--cam-border-subtle)`,
              borderRadius: '20px',
              padding: '20px',
              overflowY: 'auto',
              boxShadow: 'var(--cam-shadow-card)',
              marginBottom: '16px',
              minHeight: 0,
            }}
          >
            {!finalText && !interimText && (
              <p
                style={{
                  color: 'var(--cam-text-secondary)',
                  fontSize: '15px',
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                {t('recording.placeholderRecording')}
              </p>
            )}
            {finalText && (
              <span
                style={{
                  fontSize: '17px',
                  color: 'var(--cam-text-primary)',
                  lineHeight: 1.6,
                }}
              >
                {finalText}
              </span>
            )}
            {interimText && (
              <span
                style={{
                  fontSize: '17px',
                  color: 'var(--cam-text-secondary)',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                }}
              >
                {finalText ? ' ' : ''}
                {interimText}
              </span>
            )}
          </div>

          {/* Stop button */}
          <button
            onClick={stop}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: 'var(--cam-color-error)',
              color: '#FFFFFF',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--cam-shadow-error)',
              flexShrink: 0,
            }}
          >
            <Square size={18} strokeWidth={2.5} fill="#FFFFFF" />
            {t('recording.stop')}
          </button>
        </div>
      )}

      {/* Review */}
      {isSupported && state === 'review' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 24px 24px 24px',
            minHeight: 0,
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: 'var(--cam-text-secondary)',
              margin: '0 0 12px 0',
              fontWeight: 500,
            }}
          >
            {t('recording.reviewSubtitle')}
          </p>

          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--cam-bg-card)',
              border: `1px solid var(--cam-border-subtle)`,
              borderRadius: '20px',
              padding: '20px',
              overflowY: 'auto',
              boxShadow: 'var(--cam-shadow-card)',
              marginBottom: '16px',
              minHeight: 0,
            }}
          >
            <p
              style={{
                fontSize: '17px',
                color: 'var(--cam-text-primary)',
                lineHeight: 1.6,
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}
            >
              {finalText}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--cam-bg-error-soft)',
                color: 'var(--cam-text-error)',
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '12px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={discard}
              aria-label={t('recording.discard')}
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: 'transparent',
                color: 'var(--cam-text-error)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid var(--cam-bg-error-soft)`,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Trash2 size={20} strokeWidth={2.2} />
            </button>
            <button
              onClick={() => {
                discard();
                setTimeout(start, 60);
              }}
              style={{
                flex: 1,
                height: '56px',
                backgroundColor: 'transparent',
                color: 'var(--cam-text-brand)',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 600,
                border: `1.5px solid var(--cam-border)`,
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={18} strokeWidth={2.5} />
              {t('recording.rerecord')}
            </button>
            <button
              onClick={save}
              style={{
                flex: 1,
                height: '56px',
                backgroundColor: 'var(--cam-color-accent)',
                color: '#FFFFFF',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--cam-shadow-accent)',
              }}
            >
              <Check size={18} strokeWidth={2.5} />
              {t('recording.save')}
            </button>
          </div>
        </div>
      )}

      {/* Saving */}
      {isSupported && state === 'saving' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          <Loader2
            size={36}
            color="var(--cam-text-brand)"
            className="animate-spin"
            strokeWidth={2}
          />
          <p
            style={{
              fontSize: '15px',
              color: 'var(--cam-text-secondary)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            {t('recording.saving')}
          </p>
        </div>
      )}
    </div>
  );
}
