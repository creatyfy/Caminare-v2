import { Check, X, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getEntryEmotions,
  addEntryEmotion,
  setEmotionValidation,
  ignorePendingEmotions,
  getEntryProcessingStatus,
  type EmotionFull,
} from '../lib/db';
import { processEntry, analyzeBeliefs } from '../lib/ai';
import { apiUrl, API_BASE } from '../lib/api';

// [DEBUG TEMPORÁRIO] URL final da função que gera as emoções. No APK precisa ser
// a ABSOLUTA da Vercel; se for só "/api/process-entry" a VITE_API_BASE_URL não
// entrou no build. Remover este bloco e o banner quando o diagnóstico terminar.
const PROCESS_ENTRY_URL = apiUrl('/api/process-entry');

export function EmotionValidationScreen() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('entryId');

  const [emotions, setEmotions] = useState<EmotionFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [continuing, setContinuing] = useState(false);
  const [isAddingEmotion, setIsAddingEmotion] = useState(false);
  const [newEmotion, setNewEmotion] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user || !entryId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setAnalyzeError(null);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      // Se o registro ainda não foi analisado pela IA, chama /api/process-entry.
      const status = await getEntryProcessingStatus(user.id, entryId);
      if (!active) return;
      if (status !== 'done') {
        setAnalyzing(true);
        try {
          const res = await processEntry(entryId, i18n.language);
          // Se outra requisição já reivindicou o registro, o endpoint responde
          // 'processing' (202) — aguardamos a conclusão via polling do status.
          // Se o polling terminar SEM 'done' (ficou 'failed' ou estourou o tempo),
          // surfaceamos o erro em vez de cair em silêncio na lista vazia.
          if (active && res.status === 'processing') {
            let finalStatus = 'processing';
            for (let i = 0; i < 30 && active; i++) {
              await sleep(2000);
              if (!active) return;
              finalStatus = await getEntryProcessingStatus(user.id, entryId);
              if (finalStatus === 'done' || finalStatus === 'failed') break;
            }
            if (active && finalStatus !== 'done') {
              setAnalyzeError(
                `${t('emotionValidation.analyzeError')} — análise não concluiu (status: ${finalStatus}). URL: ${PROCESS_ENTRY_URL}`
              );
            }
          }
        } catch (err) {
          console.error('[EmotionValidation] process-entry falhou:', err);
          // Mostra a mensagem REAL (status + texto da resposta / falha de rede +
          // URL) para diagnosticar — antes o erro só ia pro console (invisível no
          // app nativo) e a tela exibia um texto genérico.
          const detail = err instanceof Error ? err.message : String(err);
          if (active) setAnalyzeError(`${t('emotionValidation.analyzeError')} — ${detail}`);
        }
        if (!active) return;
        setAnalyzing(false);
      }

      const es = await getEntryEmotions(user.id, entryId);
      if (!active) return;
      setEmotions(es);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [user, entryId, i18n.language, t]);

  async function handleContinue() {
    if (!user || !entryId || continuing) return;
    setContinuing(true);
    // Não tocar = IGNORAR: emoções sugeridas que continuam 'pending' são marcadas
    // 'ignored' no banco (flag distinta de 'rejected', para treino) — não entram
    // nos Insights (que filtram 'confirmed'). Só contam as confirmadas (✓); o X
    // marca 'rejected'.
    const emocoesValidadas = emotions
      .filter((e) => e.validation === 'confirmed')
      .map((e) => e.name);
    const emocoesRejeitadas = emotions
      .filter((e) => e.validation === 'rejected')
      .map((e) => e.name);
    try {
      await analyzeBeliefs({
        entryId,
        idioma: i18n.language,
        emocoesValidadas,
        emocoesRejeitadas,
      });
    } catch (err) {
      // Não bloqueia o fluxo: a tela de crenças mostra o que já existir.
      console.error('[EmotionValidation] analyze-beliefs falhou:', err);
    }
    // Sugeridas e não tocadas → 'ignored'. Best-effort: não bloqueia a navegação.
    await ignorePendingEmotions(user.id, entryId);
    setContinuing(false);
    navigate('/validacao-crencas?entryId=' + entryId);
  }

  async function handleEmotionValidation(
    id: string,
    validation: 'confirmed' | 'rejected'
  ) {
    setEmotions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, validation } : e))
    );
    const ok = await setEmotionValidation(id, validation);
    if (!ok) {
      // revert on failure
      setEmotions((prev) =>
        prev.map((e) => (e.id === id ? { ...e, validation: 'pending' } : e))
      );
    }
  }

  async function handleAddEmotion() {
    if (!user || !entryId) return;
    const trimmed = newEmotion.trim();
    if (!trimmed || adding) return;
    setAdding(true);
    const created = await addEntryEmotion(user.id, entryId, trimmed);
    setAdding(false);
    if (created) {
      setEmotions((prev) => [...prev, created]);
      setNewEmotion('');
      setIsAddingEmotion(false);
    }
  }

  if (!entryId) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'var(--cam-bg-page)',
          fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
          padding: '48px 24px',
        }}
      >
        <button
          onClick={() => navigate('/home')}
          style={backButtonStyle}
        >
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>
        <p style={{ color: 'var(--cam-text-primary)', fontSize: '15px', marginTop: '24px' }}>
          {t('emotionValidation.missingEntry')}
        </p>
      </div>
    );
  }

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
      <div style={{ padding: '48px 24px 24px 24px', backgroundColor: 'var(--cam-bg-card)' }}>
        <button onClick={() => navigate('/home')} style={backButtonStyle}>
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--cam-text-primary)', margin: '24px 0 8px 0' }}>
          {t('emotionValidation.title')}
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--cam-text-secondary)', margin: 0, lineHeight: 1.4 }}>
          {emotions.length > 0
            ? t('emotionValidation.subtitle')
            : t('emotionValidation.subtitleManual')}
        </p>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--cam-text-secondary)',
              marginBottom: '16px',
              marginLeft: '4px',
            }}
          >
            {t('emotionValidation.emotionsHeader')}
          </h3>

          {loading && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--cam-text-secondary)',
                fontSize: '14px',
                padding: '24px 0',
              }}
            >
              <Loader2 size={20} className="animate-spin" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
              {analyzing ? <AnalyzingMessages /> : t('common.loading')}
            </div>
          )}

          {/* [DEBUG TEMPORÁRIO] Confirma a URL absoluta no APK. Remover depois. */}
          <div
            style={{
              backgroundColor: 'var(--cam-bg-error-soft)',
              color: 'var(--cam-text-secondary)',
              borderRadius: '12px',
              padding: '10px 12px',
              fontSize: '11px',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
              marginBottom: '16px',
              lineHeight: 1.4,
            }}
          >
            DEBUG · API_BASE="{API_BASE || '(vazio → relativo)'}" · chamando: {PROCESS_ENTRY_URL}
          </div>

          {!loading && analyzeError && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--cam-bg-error-soft)',
                color: 'var(--cam-text-error)',
                borderRadius: '12px',
                padding: '12px 14px',
                fontSize: '13px',
                fontWeight: 500,
                marginBottom: '16px',
                lineHeight: 1.4,
              }}
            >
              {analyzeError}
            </div>
          )}

          {!loading && emotions.length === 0 && !isAddingEmotion && (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--cam-text-secondary)',
                fontSize: '14px',
                padding: '16px 0 24px',
              }}
            >
              {t('emotionValidation.emptyEmotions')}
            </div>
          )}

          {!loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {emotions.map((emotion) => (
                <div
                  key={emotion.id}
                  style={{
                    backgroundColor: 'var(--cam-bg-card)',
                    borderRadius: '24px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: 'var(--cam-shadow-card)',
                    opacity: emotion.validation === 'rejected' ? 0.5 : 1,
                  }}
                >
                  <button
                    onClick={() => handleEmotionValidation(emotion.id, 'rejected')}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor:
                        emotion.validation === 'rejected'
                          ? 'var(--cam-color-error)'
                          : 'var(--cam-bg-error-soft)',
                      color:
                        emotion.validation === 'rejected'
                          ? '#FFFFFF'
                          : 'var(--cam-text-error)',
                    }}
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>

                  <div
                    style={{
                      backgroundColor: 'var(--cam-bg-muted)',
                      color: 'var(--cam-text-brand)',
                      padding: '8px 16px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: 500,
                      flex: 1,
                      textAlign: 'center',
                      margin: '0 12px',
                    }}
                  >
                    {emotion.name}
                  </div>

                  <button
                    onClick={() => handleEmotionValidation(emotion.id, 'confirmed')}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor:
                        emotion.validation === 'confirmed'
                          ? 'var(--cam-color-accent)'
                          : 'var(--cam-bg-accent-soft)',
                      color:
                        emotion.validation === 'confirmed'
                          ? '#FFFFFF'
                          : 'var(--cam-text-accent)',
                    }}
                  >
                    <Check size={18} strokeWidth={2.5} />
                  </button>
                </div>
              ))}

              {!isAddingEmotion ? (
                <button
                  onClick={() => setIsAddingEmotion(true)}
                  style={{
                    backgroundColor: 'transparent',
                    border: `2px dashed var(--cam-border)`,
                    borderRadius: '24px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: 'var(--cam-text-brand)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  {t('emotionValidation.addEmotion')}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    value={newEmotion}
                    onChange={(e) => setNewEmotion(e.target.value)}
                    placeholder={t('emotionValidation.newEmotionPlaceholder')}
                    autoFocus
                    disabled={adding}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '9999px',
                      border: `1px solid var(--cam-border)`,
                      outline: 'none',
                      fontSize: '14px',
                      color: 'var(--cam-text-primary)',
                      backgroundColor: 'var(--cam-bg-input)',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddEmotion();
                      if (e.key === 'Escape') {
                        setIsAddingEmotion(false);
                        setNewEmotion('');
                      }
                    }}
                  />
                  <button
                    onClick={handleAddEmotion}
                    disabled={adding || !newEmotion.trim()}
                    style={{
                      padding: '0 20px',
                      backgroundColor: 'var(--cam-color-brand)',
                      color: '#FFFFFF',
                      borderRadius: '9999px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: adding || !newEmotion.trim() ? 'not-allowed' : 'pointer',
                      opacity: adding || !newEmotion.trim() ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {adding && <Loader2 size={14} className="animate-spin" />}
                    {t('common.add')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={continuing || loading}
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            boxShadow: 'var(--cam-shadow-brand)',
            cursor: continuing || loading ? 'not-allowed' : 'pointer',
            opacity: continuing || loading ? 0.7 : 1,
            marginTop: '16px',
          }}
        >
          {continuing && <Loader2 size={18} className="animate-spin" />}
          {continuing ? (
            <AnalyzingMessages
              stepsKey="emotionValidation.analyzingBeliefsSteps"
              fallbackKey="emotionValidation.analyzingBeliefs"
              color="var(--cam-text-on-brand)"
            />
          ) : (
            t('emotionValidation.continue')
          )}
        </button>
      </div>
    </div>
  );
}

const backButtonStyle: React.CSSProperties = {
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
};

// Mensagens rotativas exibidas durante a análise da IA, trocando a cada 3s com
// transição suave de fade. Tom acolhedor do Caminare. Reaproveitada tanto na
// análise de emoções quanto na de crenças (basta trocar `stepsKey`).
function AnalyzingMessages({
  stepsKey = 'emotionValidation.analyzingSteps',
  fallbackKey = 'emotionValidation.analyzing',
  color = 'var(--cam-text-secondary)',
}: {
  stepsKey?: string;
  fallbackKey?: string;
  color?: string;
}) {
  const { t } = useTranslation();
  const raw = t(stepsKey, { returnObjects: true });
  const steps = Array.isArray(raw)
    ? (raw as string[])
    : [t(fallbackKey)];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (steps.length <= 1) return;
    let fadeTimeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setVisible(false);
      fadeTimeout = setTimeout(() => {
        setIdx((i) => (i + 1) % steps.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout);
    };
  }, [steps.length]);

  return (
    <span
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease',
        color,
      }}
    >
      {steps[idx]}
    </span>
  );
}
