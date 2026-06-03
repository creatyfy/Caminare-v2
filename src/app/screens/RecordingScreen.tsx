import { useEffect, useRef, useState } from 'react';
import {
  Mic,
  ArrowLeft,
  Square,
  Trash2,
  RotateCcw,
  Loader2,
  Edit3,
  AlertCircle,
  Check,
  Pause,
  Play,
  Globe,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { createTextEntry } from '../lib/db';
import { processEntry } from '../lib/ai';

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

type RecState = 'idle' | 'recording' | 'paused' | 'review' | 'saving';
const MAX_SECONDS = 120;
const LANG_STORAGE_KEY = 'caminare_rec_lang';

interface RecLanguage {
  code: string;
  name: string;
  flag: string;
}

// Lista de idiomas para o seletor (cobre os mais comuns no Web Speech API)
const LANGUAGES: RecLanguage[] = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl-NL', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', name: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
  { code: 'zh-TW', name: '中文 (繁體)', flag: '🇹🇼' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
];

function getInitialRecLang(appLang: string): string {
  if (typeof window !== 'undefined') {
    // 1) Última escolha do usuário
    try {
      const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
    } catch {
      // ignore
    }
    // 2) Idioma do navegador / sistema operacional
    const browserLang = navigator.language;
    if (LANGUAGES.some((l) => l.code === browserLang)) return browserLang;
    const primary = browserLang.split('-')[0];
    const found = LANGUAGES.find((l) => l.code.startsWith(primary + '-'));
    if (found) return found.code;
  }
  // 3) Idioma do app
  return appLang.startsWith('en') ? 'en-US' : 'pt-BR';
}

function getLangByCode(code: string): RecLanguage {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function RecordingScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [state, setState] = useState<RecState>('idle');
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [editedText, setEditedText] = useState(''); // texto editável na revisão
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [recLang, setRecLang] = useState<string>(() =>
    getInitialRecLang(i18n.language)
  );
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accumulatedRef = useRef<string>('');
  const interimRef = useRef<string>('');
  const hasAttemptedStartRef = useRef(false);
  const recLangRef = useRef(recLang);

  useEffect(() => {
    recLangRef.current = recLang;
  }, [recLang]);

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Auto-iniciar gravação ao entrar na tela (sem tela intermediária)
  useEffect(() => {
    if (!isSupported) return;
    if (hasAttemptedStartRef.current) return;
    hasAttemptedStartRef.current = true;
    const id = setTimeout(() => start({ fresh: true }), 80);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function start(opts: { fresh: boolean } = { fresh: true }) {
    setError(null);

    if (opts.fresh) {
      accumulatedRef.current = '';
      interimRef.current = '';
      setFinalText('');
      setInterimText('');
      setEditedText('');
      setSeconds(0);
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError(t('recording.notSupported'));
      setState('idle');
      return;
    }

    // Snapshot do que já tínhamos antes desta sessão (pra modo "resume")
    const beforeText = accumulatedRef.current;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = recLangRef.current;

    recognition.onresult = (event) => {
      let interim = '';
      let newFinal = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newFinal += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      const sep = beforeText && newFinal ? ' ' : '';
      accumulatedRef.current = (beforeText + sep + newFinal).trim();
      setFinalText(accumulatedRef.current);
      interimRef.current = interim.trim();
      setInterimText(interim.trim());
    };

    recognition.onerror = (event) => {
      // eslint-disable-next-line no-console
      console.error('SpeechRecognition error:', event.error);
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      if (
        event.error === 'not-allowed' ||
        event.error === 'service-not-allowed'
      ) {
        setError(t('recording.errorPermission'));
      } else if (event.error === 'network') {
        setError(t('recording.errorNetwork'));
      } else if (event.error === 'language-not-supported') {
        setError(t('recording.errorLangUnsupported'));
      } else {
        setError(t('recording.errorGeneric'));
      }
      cleanupRefs();
      setState('idle');
    };

    recognition.onend = () => {
      // Browser pode encerrar sozinho; o usuário decide retomar ou parar.
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setState('recording');

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS) {
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
      setState('idle');
    }
  }

  function pauseRecording() {
    cleanupRefs();
    setState('paused');
  }

  function resumeRecording() {
    start({ fresh: false });
  }

  function stop() {
    cleanupRefs();
    const captured = (accumulatedRef.current + ' ' + interimRef.current).trim();
    if (captured) {
      accumulatedRef.current = captured;
      interimRef.current = '';
      setFinalText(captured);
      setInterimText('');
      setEditedText(captured);
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
    setEditedText('');
    setSeconds(0);
    setError(null);
    setState('idle');
  }

  function reRecord() {
    discard();
    setTimeout(() => start({ fresh: true }), 100);
  }

  function continueRecording() {
    // Volta a gravar mantendo o texto editado como base
    const base = editedText.trim();
    accumulatedRef.current = base;
    interimRef.current = '';
    setFinalText(base);
    setInterimText('');
    setError(null);
    start({ fresh: false });
  }

  function changeRecLang(lang: string) {
    if (lang === recLang) {
      setLangPickerOpen(false);
      return;
    }
    setRecLang(lang);
    recLangRef.current = lang;
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    setLangPickerOpen(false);

    // Se está gravando, reinicia o reconhecimento com o novo idioma
    // mantendo o que já foi capturado
    if (state === 'recording') {
      cleanupRefs();
      setTimeout(() => start({ fresh: false }), 100);
    }
  }

  async function save() {
    if (!user) return;
    const text = editedText.trim();
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
      // Dispara a análise em background (sem await) para já começar enquanto o
      // usuário navega. A tela de validação aguarda a conclusão via polling.
      void processEntry(entryId, i18n.language).catch((err) =>
        console.error('[Recording] process-entry (background) falhou:', err)
      );
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
  const currentLang = getLangByCode(recLang);

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

      {/* Idle (fallback de erro / permissão negada) */}
      {isSupported && state === 'idle' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            gap: '18px',
            textAlign: 'center',
          }}
        >
          <button
            onClick={() => start({ fresh: true })}
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
            }}
          >
            <Mic size={56} color="#FFFFFF" strokeWidth={2} />
          </button>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--cam-text-primary)',
              fontWeight: 500,
              margin: '4px 0 0 0',
              maxWidth: 320,
              lineHeight: 1.5,
            }}
          >
            {error ?? t('recording.startPrompt')}
          </p>
        </div>
      )}

      {/* Recording / Paused */}
      {isSupported && (state === 'recording' || state === 'paused') && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 24px 24px 24px',
            minHeight: 0,
          }}
        >
          {/* Indicador + idioma + timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              backgroundColor: 'var(--cam-bg-card)',
              borderRadius: '16px',
              boxShadow: 'var(--cam-shadow-card)',
              marginBottom: '14px',
              flexShrink: 0,
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: 0,
              }}
            >
              <span
                className={state === 'recording' ? 'animate-pulse' : ''}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor:
                    state === 'recording'
                      ? 'var(--cam-color-error)'
                      : 'var(--cam-text-secondary)',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--cam-text-primary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {state === 'recording'
                  ? t('recording.recording')
                  : t('recording.paused')}
              </span>
              <button
                type="button"
                onClick={() => setLangPickerOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px 3px 6px',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--cam-bg-tint)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--cam-text-brand)',
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <span style={{ fontSize: '13px' }}>{currentLang.flag}</span>
                {recLang.toUpperCase()}
              </button>
            </div>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: isWarn ? 'var(--cam-text-error)' : 'var(--cam-text-secondary)',
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
              }}
            >
              {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
            </span>
          </div>

          {/* Transcript */}
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

          {/* Botões: Pause/Resume + Stop */}
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            {state === 'recording' ? (
              <button
                onClick={pauseRecording}
                aria-label={t('recording.pause')}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cam-bg-card)',
                  color: 'var(--cam-text-primary)',
                  border: `1.5px solid var(--cam-border)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Pause size={20} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                aria-label={t('recording.resume')}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cam-color-brand)',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: 'var(--cam-shadow-brand)',
                }}
              >
                <Play size={20} strokeWidth={2.5} fill="#FFFFFF" />
              </button>
            )}
            <button
              onClick={stop}
              style={{
                flex: 1,
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
              }}
            >
              <Square size={18} strokeWidth={2.5} fill="#FFFFFF" />
              {t('recording.stop')}
            </button>
          </div>
        </div>
      )}

      {/* Review com textarea editável */}
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

          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            style={{
              flex: 1,
              width: '100%',
              backgroundColor: 'var(--cam-bg-card)',
              border: `1px solid var(--cam-border-subtle)`,
              borderRadius: '20px',
              padding: '20px',
              fontSize: '17px',
              color: 'var(--cam-text-primary)',
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
              boxShadow: 'var(--cam-shadow-card)',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              marginBottom: '16px',
              minHeight: 0,
            }}
          />

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
              onClick={reRecord}
              aria-label={t('recording.rerecord')}
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
              onClick={continueRecording}
              disabled={!editedText.trim()}
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
                border: `1.5px solid var(--cam-color-brand)`,
                cursor: editedText.trim() ? 'pointer' : 'not-allowed',
                opacity: editedText.trim() ? 1 : 0.5,
                fontFamily: 'inherit',
              }}
            >
              <Mic size={18} strokeWidth={2.5} />
              {t('recording.continueRecording')}
            </button>
            <button
              onClick={save}
              disabled={!editedText.trim()}
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
                cursor: editedText.trim() ? 'pointer' : 'not-allowed',
                boxShadow: 'var(--cam-shadow-accent)',
                opacity: editedText.trim() ? 1 : 0.5,
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

      {/* Language picker overlay */}
      {langPickerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLangPickerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--cam-bg-overlay)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--cam-bg-card)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              width: '100%',
              maxWidth: 480,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: `1px solid var(--cam-border-subtle)`,
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="var(--cam-text-brand)" />
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--cam-text-primary)',
                    margin: 0,
                  }}
                >
                  {t('recording.langPickerTitle')}
                </h3>
              </div>
              <button
                onClick={() => setLangPickerOpen(false)}
                aria-label="Fechar"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'var(--cam-text-secondary)',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                overflowY: 'auto',
                padding: '8px 0',
                flex: 1,
              }}
            >
              {LANGUAGES.map((lang) => {
                const active = lang.code === recLang;
                return (
                  <button
                    key={lang.code}
                    onClick={() => changeRecLang(lang.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      width: '100%',
                      padding: '12px 20px',
                      background: active ? 'var(--cam-bg-tint)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      color: 'var(--cam-text-primary)',
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>{lang.flag}</span>
                    <span style={{ flex: 1, fontSize: '15px', fontWeight: 500 }}>
                      {lang.name}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--cam-text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.4px',
                      }}
                    >
                      {lang.code}
                    </span>
                    {active && (
                      <Check size={16} color="var(--cam-color-brand)" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
