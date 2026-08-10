// =============================================================================
// Camada única de analytics do app.
// -----------------------------------------------------------------------------
// Todos os eventos passam por `track(...)` — nunca chame o SDK direto na tela.
// Hoje é NO-OP (só loga em dev). Quando o projeto Firebase estiver conectado,
// basta preencher o corpo de `track` e `setScreen` com as chamadas do SDK
// (nativo via @capacitor-firebase/analytics + web via firebase/analytics), e
// nenhuma tela precisa mudar.
//
// Convenção: nomes e parâmetros em snake_case, seguindo o Mapa de Eventos.
// Regra de privacidade: só metadados. NENHUM conteúdo escrito pelo usuário
// deve ser passado como parâmetro.
// =============================================================================

export type EventName =
  // Conversões de marketing (FB + Ads + Meta)
  | 'sign_up'
  | 'login'
  | 'trial_started'
  | 'view_plans'
  | 'subscribe'
  // Produto (só FB)
  | 'record_created'
  | 'milestone_reached'
  | 'belief_validated'
  | 'pattern_detected'
  | 'pattern_validated'
  | 'view_history'
  | 'view_insights'
  | 'view_summary'
  | 'share_summary'
  | 'download_summary'
  | 'microphone_permission'
  // Erros e falhas (só FB)
  | 'record_creation_failed'
  | 'voice_transcription_failed'
  | 'subscription_failed'
  // Prompts da IA (só FB) — normalmente disparado no backend
  | 'analysis_prompt_run'
  // iOS ATT
  | 'att_context_shown'
  | 'att_result';

export type EventParams = Record<string, string | number | boolean | null | undefined>;

/**
 * Registra um evento de analytics.
 * NO-OP por enquanto: quando o SDK do Firebase estiver conectado, encaminhar
 * aqui (e, para as conversões de marketing, também pro Meta).
 */
export async function track(name: EventName, params: EventParams = {}): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', name, params);
    }
    // TODO(analytics): encaminhar para Firebase (nativo + web).
    //   nativo: FirebaseAnalytics.logEvent({ name, params })
    //   web:    logEvent(getAnalytics(), name, params)
    // TODO(analytics): para conversões de marketing (sign_up, login,
    //   trial_started, view_plans, subscribe) espelhar no Meta.
  } catch {
    // Analytics nunca deve quebrar o fluxo do usuário.
  }
}

/**
 * Registra a tela atual (screen_view). Chamado pelo hook de rota em App.tsx.
 * `screenName` é o nome legível de negócio (ex.: 'Insights'), não o path.
 */
export async function setScreen(screenName: string): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics] screen_view', screenName);
    }
    // TODO(analytics): FirebaseAnalytics.setCurrentScreen / logEvent('screen_view', ...)
  } catch {
    // silencioso de propósito
  }
}

/**
 * Mapa de path -> nome de tela legível, para o screen_view automático.
 * Slugs em português (react-router). Paths não listados caem no próprio path.
 */
export const SCREEN_NAMES: Record<string, string> = {
  '/': 'Splash',
  '/login': 'Login',
  '/cadastro': 'Cadastro',
  '/home': 'Home',
  '/registro-texto': 'Registro',
  '/validacao-emocoes': 'ValidacaoEmocoes',
  '/validacao-crencas': 'ValidacaoCrencas',
  '/novo-padrao': 'NovoPadrao',
  '/registro-concluido': 'RegistroConcluido',
  '/historico': 'Historico',
  '/padroes': 'Insights',
  '/resumo': 'Resumo',
  '/assinatura': 'Planos',
  '/perfil': 'Perfil',
  '/admin': 'Admin',
};

/** Resolve o nome de tela a partir do pathname (trata rotas com :id). */
export function screenNameFromPath(pathname: string): string {
  if (SCREEN_NAMES[pathname]) return SCREEN_NAMES[pathname];
  if (pathname.startsWith('/registro/')) return 'DetalheRegistro';
  return pathname;
}
