import { Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

// Tempo que a tela fica visível antes de iniciar o fade-out, e duração do
// fade-out em si (mantém em sincronia com a animação CSS camFadeOut).
const HOLD_MS = 2600;
const FADE_MS = 400;

// Tela de conclusão exibida ao fim de um registro (depois das crenças). Aparece
// animada (pop do check), segura ~3s e volta sozinha para a home com fade-out —
// evita o "corte seco" e o usuário não consegue "voltar" para cá (replace).
export function EntryDoneScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [leaving, setLeaving] = useState(false);
  // Garante que o redirecionamento aconteça uma única vez (timeout + clique no
  // atalho não disparam navigate duas vezes).
  const doneRef = useRef(false);

  function goHome() {
    if (doneRef.current) return;
    doneRef.current = true;
    navigate('/home', { replace: true });
  }

  useEffect(() => {
    // Após o "hold", inicia o fade-out; ao fim do fade, volta para a home.
    const holdTimer = setTimeout(() => setLeaving(true), HOLD_MS);
    const navTimer = setTimeout(goHome, HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(navTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--cam-bg-page)',
        fontFamily: 'Satoshi, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '48px 24px',
        animation: leaving ? `camFadeOut ${FADE_MS}ms ease forwards` : undefined,
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '0 16px',
          gap: '20px',
        }}
      >
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            backgroundColor: 'var(--cam-color-brand-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--cam-shadow-brand)',
            animation: 'camPop 400ms ease-out both',
          }}
        >
          <Check size={44} color="#FFFFFF" strokeWidth={2.5} />
        </div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--cam-text-primary)',
            margin: 0,
            letterSpacing: '-0.3px',
            animation: 'camFadeIn 400ms ease-out 120ms both',
          }}
        >
          {t('entryDone.title')}
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--cam-text-secondary)',
            margin: 0,
            maxWidth: 320,
            lineHeight: 1.5,
            animation: 'camFadeIn 400ms ease-out 200ms both',
          }}
        >
          {t('entryDone.message')}
        </p>

        <button
          onClick={goHome}
          style={{
            marginTop: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--cam-text-secondary)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            animation: 'camFadeIn 400ms ease-out 320ms both',
          }}
        >
          {t('entryDone.backNow')}
        </button>
      </div>
    </div>
  );
}
