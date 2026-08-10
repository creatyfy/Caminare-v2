import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getHomeStats } from '../lib/db';
import { attAvailable, getAttStatus, requestAtt } from '../lib/att';
import { track } from '../lib/analytics';

// Flag local: só pedimos o ATT uma vez por dispositivo.
const ATT_FLAG = 'caminare.att_prompted';

// -----------------------------------------------------------------------------
// Gate: decide QUANDO mostrar a tela de contexto do ATT.
// Regras: só no iOS nativo, uma única vez, e apenas depois que o usuário já usou
// o app (>= 1 registro) — nunca na primeira abertura, como recomenda a Apple e
// como melhora a taxa de aceite. Enquanto o plugin nativo não está instalado,
// attAvailable()/getAttStatus() retornam 'unsupported' e nada aparece.
// -----------------------------------------------------------------------------
export function AttGate() {
  const { session } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    if (!attAvailable()) return;
    let cancelled = false;

    (async () => {
      try {
        if (localStorage.getItem(ATT_FLAG)) return;
      } catch {
        /* localStorage indisponível: segue e tenta mostrar */
      }

      const status = await getAttStatus();
      if (cancelled) return;
      // Já resolvido (autorizado/negado) ou sem suporte: marca e não pergunta.
      if (status !== 'notDetermined') {
        try {
          localStorage.setItem(ATT_FLAG, '1');
        } catch {
          /* noop */
        }
        return;
      }

      // Momento de valor: só depois de pelo menos um registro.
      const stats = await getHomeStats(session.user.id);
      if (cancelled) return;
      if ((stats?.totalEntries ?? 0) < 1) return;

      setShow(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  function finish() {
    try {
      localStorage.setItem(ATT_FLAG, '1');
    } catch {
      /* noop */
    }
    setShow(false);
  }

  if (!show) return null;
  return <AttContext onDone={finish} />;
}

// -----------------------------------------------------------------------------
// Tela de contexto (pre-prompt): explica o pedido ANTES do diálogo nativo do
// iOS. Dispara att_context_shown ao aparecer e att_result após o diálogo.
// -----------------------------------------------------------------------------
function AttContext({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    track('att_context_shown');
  }, []);

  async function handleContinue() {
    if (requesting) return;
    setRequesting(true);
    const status = await requestAtt();
    track('att_result', { status });
    setRequesting(false);
    onDone();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        backgroundColor: 'rgba(20, 16, 32, 0.55)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          backgroundColor: 'var(--cam-bg-page)',
          borderRadius: '24px',
          padding: '28px 24px 22px',
          boxShadow: '0 20px 60px -20px rgba(0,0,0,0.4)',
          animation: 'camPop 300ms ease-out both',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'var(--cam-bg-accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          <ShieldCheck size={32} color="var(--cam-color-accent)" strokeWidth={2.2} />
        </div>

        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            textAlign: 'center',
            margin: '0 0 10px',
            letterSpacing: '-0.3px',
          }}
        >
          {t('att.title')}
        </h2>

        <p
          style={{
            fontSize: '14.5px',
            color: 'var(--cam-text-secondary)',
            textAlign: 'center',
            lineHeight: 1.55,
            margin: '0 0 12px',
          }}
        >
          {t('att.body')}
        </p>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--cam-text-secondary)',
            textAlign: 'center',
            lineHeight: 1.5,
            margin: '0 0 22px',
            fontWeight: 600,
          }}
        >
          {t('att.privacy')}
        </p>

        <button
          type="button"
          onClick={handleContinue}
          disabled={requesting}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 9999,
            backgroundColor: 'var(--cam-color-brand)',
            color: 'var(--cam-text-on-brand)',
            border: 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: requesting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: 'var(--cam-shadow-brand)',
            opacity: requesting ? 0.85 : 1,
          }}
        >
          {requesting ? <Loader2 size={18} className="animate-spin" /> : null}
          {t('att.continue')}
        </button>

        <button
          type="button"
          onClick={onDone}
          disabled={requesting}
          style={{
            width: '100%',
            marginTop: 10,
            background: 'none',
            border: 'none',
            color: 'var(--cam-text-secondary)',
            fontSize: 14,
            fontWeight: 500,
            cursor: requesting ? 'not-allowed' : 'pointer',
            padding: '8px',
          }}
        >
          {t('att.notNow')}
        </button>
      </div>
    </div>
  );
}
