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
//
// WEB: envia via gtag do GA4 (fluxo Web). NATIVO: fica no-op até o SDK do
// Firebase entrar no build nativo.
// =============================================================================

import { isNative } from './native';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

// ID de medição do GA4 (fluxo Web).
const GA_MEASUREMENT_ID = 'G-NGNBB1JBDL';

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

/** Acesso ao gtag global (existe só no web, após initAnalytics). */
function gtag(): ((...args: unknown[]) => void) | null {
  if (typeof window === 'undefined') return null;
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  return g ?? null;
}

// --- Firebase Analytics (nativo) -------------------------------------------
// Import ESTÁTICO do plugin. Antes era import() dinâmico "só no nativo", mas no
// build nativo esse chunk dinâmico não estava sendo carregado, então os eventos
// personalizados (logEvent / setCurrentScreen) nunca chegavam ao Firebase — só
// os automáticos (first_open, session_start, screen_view) apareciam. O import
// direto garante o plugin no bundle. No web nunca é chamado (guardado por
// isNative), e a implementação web do plugin é inócua.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getFirebaseAnalytics(): Promise<any> {
  return isNative ? FirebaseAnalytics : null;
}

/** Firebase só aceita string/number nos params: remove null/undefined e
 *  converte boolean pra 0/1. */
function sanitizeParams(params: EventParams): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue;
    out[k] = typeof v === 'boolean' ? (v ? 1 : 0) : v;
  }
  return out;
}

let inited = false;

/**
 * Inicializa o analytics. No WEB, injeta o gtag do GA4 (fluxo Web) com o
 * page_view automático DESLIGADO (o page_view é disparado por rota em setScreen,
 * e a landing tem o próprio gtag — assim não conta duplicado). No NATIVO não faz
 * nada: os eventos vão pro Firebase, cujo SDK entra no build nativo. Idempotente.
 */
export function initAnalytics(): void {
  if (inited) return;
  inited = true;
  if (isNative) {
    // Nativo: o SDK do Firebase se auto-inicializa (google-services.json no
    // Android / GoogleService-Info.plist no iOS). Só garantimos a coleta ligada.
    getFirebaseAnalytics().then((FA) => {
      if (FA) FA.setEnabled({ enabled: true }).catch(() => {});
    });
    return;
  }
  if (typeof document === 'undefined') return;
  try {
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function () {
      w.dataLayer!.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(s);
  } catch {
    // analytics nunca deve quebrar o app
  }
}

/**
 * Registra um evento de analytics. No web envia via gtag (GA4); no nativo é
 * no-op até o Firebase entrar no build nativo.
 */
export async function track(name: EventName, params: EventParams = {}): Promise<void> {
  try {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', name, params);
    }
    if (isNative) {
      const FA = await getFirebaseAnalytics();
      if (FA) await FA.logEvent({ name, params: sanitizeParams(params) });
      return;
    }
    const g = gtag();
    if (g) g('event', name, params);
    // TODO(marketing): espelhar as conversões de marketing no Meta.
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
      console.debug('[analytics] page_view', screenName);
    }
    if (isNative) {
      const FA = await getFirebaseAnalytics();
      if (FA) await FA.setCurrentScreen({ screenName });
      return;
    }
    const g = gtag();
    if (g) g('event', 'page_view', { page_title: screenName });
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
