// Página inicial EXCLUSIVA do app web (no nativo, "/" continua na Splash).
// Mostra a landing de marketing (public/landing.html → /landing.html) em tela
// cheia. O botão "Entrar" do menu da landing usa target="_top" para levar o
// visitante ao login do app (/login). O iframe isola o CSS/JS da landing do
// resto do app, evitando conflitos de estilo global.
const LANDING_URL = '/landing.html';

export function LandingScreen() {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: '#F8F7FF' }}>
      <iframe
        src={LANDING_URL}
        title="Caminare"
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
      />
    </div>
  );
}
