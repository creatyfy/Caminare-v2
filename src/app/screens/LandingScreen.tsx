import { useNavigate } from 'react-router';

// Página inicial EXCLUSIVA do app web (no nativo, "/" continua na Splash).
// Mostra a landing de marketing que construímos (deploy em caminare-landing.vercel.app)
// dentro de um iframe em tela cheia, com um botão flutuante "Entrar" que leva o
// visitante web para o login do app (/login).
//
// O conteúdo é servido do próprio app: public/landing.html → /landing.html
// (mesmo domínio, mesmo deploy). O iframe isola o CSS/JS da landing do resto do
// app, evitando conflitos de estilo global.
const LANDING_URL = '/landing.html';

export function LandingScreen() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#F8F7FF' }}>
      <iframe
        src={LANDING_URL}
        title="Caminare"
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
      />
      <button
        type="button"
        onClick={() => navigate('/login')}
        style={{
          position: 'fixed',
          top: 'max(16px, env(safe-area-inset-top))',
          right: 'max(16px, env(safe-area-inset-right))',
          zIndex: 10,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '11px 22px',
          borderRadius: '9999px',
          border: 'none',
          backgroundColor: '#534AB7',
          color: '#FFFFFF',
          fontFamily: 'inherit',
          fontSize: '15px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 12px 28px rgba(83,74,183,0.32)',
        }}
      >
        Entrar
      </button>
    </div>
  );
}
