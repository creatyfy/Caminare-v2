// =============================================================================
// App Tracking Transparency (ATT) — iOS.
// -----------------------------------------------------------------------------
// Wrapper fino sobre o plugin nativo de ATT. Fica INERTE (retorna 'unsupported')
// enquanto o plugin não está instalado, então pode ser commitado sem quebrar o
// build. Plugin sugerido: @capacitor-community/app-tracking-transparency.
//
// Quando instalar o plugin, nada aqui precisa mudar: o import dinâmico abaixo
// passa a resolver e as funções começam a responder de verdade no iOS.
// =============================================================================

import { isIOS, isNative } from './native';

export type AttStatus =
  | 'authorized'
  | 'denied'
  | 'restricted'
  | 'notDetermined'
  | 'unsupported';

/** true só no iOS nativo, onde o ATT existe. */
export function attAvailable(): boolean {
  return isNative && isIOS;
}

// Import dinâmico com specifier em variável + @vite-ignore: o bundler não tenta
// resolver o pacote em build (ele ainda não está instalado). Em runtime, se o
// plugin não existir, o import lança e caímos em 'unsupported'.
async function loadPlugin(): Promise<any | null> {
  if (!attAvailable()) return null;
  try {
    const pkg = '@capacitor-community/app-tracking-transparency';
    const mod: any = await import(/* @vite-ignore */ pkg);
    return mod?.AppTrackingTransparency ?? null;
  } catch {
    return null; // plugin ainda não instalado
  }
}

/** Status atual do ATT (sem mostrar diálogo). */
export async function getAttStatus(): Promise<AttStatus> {
  const p = await loadPlugin();
  if (!p) return 'unsupported';
  try {
    const r = await p.getStatus();
    return (r?.status as AttStatus) ?? 'notDetermined';
  } catch {
    return 'unsupported';
  }
}

/** Dispara o diálogo nativo do iOS e retorna a decisão do usuário. */
export async function requestAtt(): Promise<AttStatus> {
  const p = await loadPlugin();
  if (!p) return 'unsupported';
  try {
    const r = await p.requestPermission();
    return (r?.status as AttStatus) ?? 'notDetermined';
  } catch {
    return 'unsupported';
  }
}
