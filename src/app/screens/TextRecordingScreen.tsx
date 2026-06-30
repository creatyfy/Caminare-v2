import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, Mic, Square, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useEntitlement } from '../contexts/EntitlementContext';
import { createTextEntry } from '../lib/db';
import { useSpeechToText, type SpeechErrorKind } from '../lib/speech';

// Equivalente a aproximadamente 2 min de fala (150 wpm × ~6 chars por palavra)
const MAX_CHARS = 1800;
const MAX_SECONDS = 120;

export function TextRecordingScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const entitlement = useEntitlement();
  const [searchParams] = useSearchParams();

  // Chega pelo botão "Novo Registro por Voz" (?dica=voz) -> modo voz (gravação
  // real). Sem o parâmetro é o registro por texto puro.
  const voiceMode = searchParams.get('dica') === 'voz';

  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  // Erro específico do microfone/transcrição (separado do erro de salvar).
  const [voiceError, setVoiceError] = useState<string | null>(null);
  // Quando a voz não rola (permissão negada / sem suporte), caímos pro texto e
  // só aí mostramos a dica do teclado.
  const [showVoiceHint, setShowVoiceHint] = useState(false);
  const [fellBackToText, setFellBackToText] = useState(false);

  const { listening, start, stop } = useSpeechToText();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const baseTextRef = useRef(''); // texto já no campo antes da sessão atual de fala
  const autoStartedRef = useRef(false);

  const lang = i18n.language?.startsWith('en') ? 'en-US' : 'pt-BR';
  // No modo voz só viramos um campo de texto comum depois de uma falha de voz.
  const asTextField = !voiceMode || fellBackToText;

  // ----- Foco do textarea (só quando é campo de texto) -----------------------
  useLayoutEffect(() => {
    if (asTextField) textareaRef.current?.focus({ preventScroll: true });
  }, [asTextField]);

  useEffect(() => {
    if (!asTextField) return;
    const id = setTimeout(() => {
      if (document.activeElement !== textareaRef.current) {
        textareaRef.current?.focus({ preventScroll: true });
      }
    }, 100);
    return () => clearTimeout(id);
  }, [asTextField]);

  // ----- Gravação por voz ----------------------------------------------------
  function handleVoiceError(kind: SpeechErrorKind) {
    const map: Record<SpeechErrorKind, string> = {
      permission: t('recording.errorPermission'),
      unsupported: t('recording.notSupported'),
      'no-speech': t('recording.errorEmpty'),
      network: t('recording.errorNetwork'),
      generic: t('recording.errorGeneric'),
    };
    setVoiceError(map[kind]);
    // Permissão negada ou device/navegador sem suporte: cai pro texto + dica.
    if (kind === 'permission' || kind === 'unsupported') {
      setFellBackToText(true);
      setShowVoiceHint(true);
    }
  }

  async function startRecording() {
    setVoiceError(null);
    setSeconds(0);
    baseTextRef.current = text;
    await start({
      lang,
      onResult: (session) => {
        const base = baseTextRef.current;
        const joined = base ? `${base} ${session}` : session;
        setText(joined.slice(0, MAX_CHARS));
      },
      onError: handleVoiceError,
    });
  }

  async function stopRecording() {
    await stop();
    baseTextRef.current = text; // consolida o que já foi transcrito
    textareaRef.current?.focus({ preventScroll: true });
  }

  function toggleRecording() {
    if (listening) void stopRecording();
    else void startRecording();
  }

  // Auto-inicia a gravação ao abrir no modo voz (o "tap" veio da Home).
  useEffect(() => {
    if (voiceMode && !autoStartedRef.current) {
      autoStartedRef.current = true;
      void startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMode]);

  // Para a gravação ao sair da tela.
  useEffect(() => {
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer + auto-stop em 2 min.
  useEffect(() => {
    if (!listening) return;
    const id = setInterval(() => {
      setSeconds((prev) => {
        if (prev + 1 >= MAX_SECONDS) {
          setTimeout(() => void stopRecording(), 0); // auto-stop em 2 min (fora do updater)
          return MAX_SECONDS;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  async function handleSubmit() {
    if (!text.trim() || submitting || !user) return;
    if (listening) await stopRecording();
    // Barra se estourou o limite do período (75 trial; 150/250 plano).
    if (!entitlement.canCreate) {
      setError(t('entitlement.limitReached', { limit: entitlement.limit }));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const entryId = await createTextEntry(user.id, text.trim());
      if (!entryId) {
        setError(t('textRecording.errorSave'));
        return;
      }
      void entitlement.refresh();
      // NÃO disparamos a análise aqui em background. Antes era um fire-and-forget
      // (`void processEntry().catch(console.error)`) que ENGOLIA qualquer falha da
      // IA (CORS/rede/500) e ainda reivindicava o registro → a tela de validação
      // recebia 202 'processing' e só fazia polling, sem nunca ver o erro real.
      // Agora a EmotionValidationScreen é a ÚNICA a chamar process-entry: ela
      // aguarda (await) e mostra a mensagem de erro real na tela.
      navigate(`/validacao-emocoes?entryId=${entryId}`);
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
      setError(t('textRecording.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = text.trim().length === 0 || submitting || listening;
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

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '0 0 4px 0' }}>
          {voiceMode ? t('recording.title') : t('textRecording.title')}
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
        {/* Indicador de gravação ao vivo (modo voz) */}
        {voiceMode && !fellBackToText && listening && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: 'var(--cam-bg-card)',
              borderRadius: '14px',
              boxShadow: 'var(--cam-shadow-card)',
              marginBottom: '12px',
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
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cam-text-primary)' }}>
                {t('recording.recording')}
              </span>
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: isWarn ? 'var(--cam-text-error)' : 'var(--cam-text-secondary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTime(seconds)} / {formatTime(MAX_SECONDS)}
            </span>
          </div>
        )}

        {/* Dica do teclado: só no fallback de texto (voz indisponível) */}
        {showVoiceHint && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: 'var(--cam-bg-tint)',
              borderRadius: '14px',
              padding: '12px 14px',
              marginBottom: '12px',
              flexShrink: 0,
            }}
          >
            <Mic size={18} color="var(--cam-text-brand)" strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span
              style={{
                flex: 1,
                fontSize: '13px',
                color: 'var(--cam-text-primary)',
                fontWeight: 500,
                lineHeight: 1.45,
              }}
            >
              {t('textRecording.voiceHint')}
            </span>
            <button
              type="button"
              onClick={() => setShowVoiceHint(false)}
              aria-label={t('common.cancel')}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: 'var(--cam-text-secondary)',
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          autoFocus={asTextField}
          readOnly={listening}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder={
            voiceMode && !fellBackToText
              ? t('recording.placeholderRecording')
              : t('textRecording.placeholder')
          }
          disabled={submitting}
          maxLength={MAX_CHARS}
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
            marginBottom: '8px',
            minHeight: 0,
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '12px',
            fontSize: '12px',
            fontWeight: 600,
            color:
              text.length >= MAX_CHARS
                ? 'var(--cam-text-error)'
                : text.length >= MAX_CHARS * 0.9
                  ? 'var(--cam-text-warning)'
                  : 'var(--cam-text-secondary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {text.length} / {MAX_CHARS}
        </div>

        {/* Botão de gravar/parar (modo voz, enquanto a voz estiver disponível) */}
        {voiceMode && !fellBackToText && (
          <button
            type="button"
            onClick={toggleRecording}
            disabled={submitting}
            style={{
              width: '100%',
              height: '56px',
              backgroundColor: listening ? 'var(--cam-color-error)' : 'var(--cam-color-brand)',
              color: '#FFFFFF',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              boxShadow: listening ? 'var(--cam-shadow-error)' : 'var(--cam-shadow-brand)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              marginBottom: '12px',
            }}
          >
            {listening ? (
              <>
                <Square size={18} strokeWidth={2.5} fill="#FFFFFF" />
                {t('recording.stop')}
              </>
            ) : (
              <>
                <Mic size={20} strokeWidth={2.5} />
                {text.trim() ? t('recording.continueRecording') : t('recording.startPrompt')}
              </>
            )}
          </button>
        )}

        {voiceError && (
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
            {voiceError}
          </div>
        )}

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

        <button
          onClick={handleSubmit}
          disabled={disabled}
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: disabled ? 'var(--cam-bg-muted)' : 'var(--cam-color-accent)',
            color: disabled ? 'var(--cam-text-secondary)' : '#FFFFFF',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            boxShadow: disabled ? 'none' : 'var(--cam-shadow-accent)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          {submitting ? t('textRecording.submitting') : t('textRecording.submit')}
        </button>
      </div>
    </div>
  );
}
