// =============================================================================
// Caminare — Base das funções serverless (/api)
// -----------------------------------------------------------------------------
// No web (Vercel) o app e as rotas /api vivem na MESMA origem, então caminho
// relativo ('/api/...') funciona. No app nativo (Capacitor) a origem é
// `capacitor://localhost` / `https://localhost`, que NÃO tem as rotas /api —
// por isso precisamos de uma base absoluta apontando pro deploy de produção.
//
// VITE_API_BASE_URL:
//   • web:    vazio  -> chamadas relativas (mesma origem)
//   • nativo: ex. "https://caminare.vercel.app" -> chamadas absolutas
// =============================================================================

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/** Monta a URL de uma rota serverless respeitando a base por plataforma. */
export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
