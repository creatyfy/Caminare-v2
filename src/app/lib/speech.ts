// =============================================================================
// Caminare — Reconhecimento de fala (Speech-to-Text) — motor por plataforma
// -----------------------------------------------------------------------------
// Requisito do app: transcrição NATIVA da fala em texto, em tempo real.
//
//   • App nativo (iOS/Android): @capacitor-community/speech-recognition
//     (SFSpeechRecognizer no iOS, SpeechRecognizer no Android). A transcrição
//     é feita pelo PRÓPRIO sistema do aparelho — nenhum áudio é gravado nem
//     enviado/armazenado por nós; recebemos só o texto.
//   • Web: Web Speech API (webkitSpeechRecognition) — o que já funcionava antes
//     no Chrome/Edge.
//
// O motor é escolhido por plataforma (isNative). A UI consome sempre a MESMA
// interface (`start`/`stop` + callbacks), então a tela de registro não sabe
// qual motor está rodando.
// =============================================================================

import { useCallback, useRef, useState } from 'react';
import { isNative } from './native';

export type SpeechErrorKind =
  | 'permission' // microfone/fala negado pelo usuário
  | 'unsupported' // engine indisponível (navegador antigo / device sem STT)
  | 'no-speech' // nada foi captado
  | 'network' // erro de rede no reconhecimento (Web Speech usa serviço online)
  | 'generic';

export interface StartOptions {
  /** Idioma do reconhecimento, ex.: 'pt-BR' | 'en-US'. */
  lang: string;
  /**
   * Chamado a cada atualização com o texto COMPLETO transcrito desde o último
   * `start()` (final + parcial). A tela faz: campo = textoAntes + ' ' + result.
   */
  onResult: (fullSessionText: string) => void;
  onError: (kind: SpeechErrorKind) => void;
}

// ---- Tipos mínimos da Web Speech API (não há lib DOM garantida) --------------
interface WebSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: WebSpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}
interface WebSpeechEvent {
  resultIndex: number;
  results: {
    length: number;
    [i: number]: { isFinal: boolean; [j: number]: { transcript: string } };
  };
}
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => WebSpeechRecognition;
    SpeechRecognition?: new () => WebSpeechRecognition;
  }
}

export interface SpeechToText {
  listening: boolean;
  start: (opts: StartOptions) => Promise<void>;
  stop: () => Promise<void>;
}

export function useSpeechToText(): SpeechToText {
  const [listening, setListening] = useState(false);

  // Estado de sessão compartilhado entre os dois motores.
  const activeRef = useRef(false); // queremos estar ouvindo?
  const manualStopRef = useRef(false); // o usuário pediu pra parar?

  // Web
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const accumulatedRef = useRef(''); // finais já confirmados nesta sessão
  // Nativo
  const committedRef = useRef(''); // utterances já fechadas (Android fecha a cada pausa)
  const lastPartialRef = useRef('');
  const restartingRef = useRef(false); // evita reinícios concorrentes (BUSY)
  const watchdogRef = useRef<ReturnType<typeof setInterval> | null>(null); // detecta morte sem evento 'stopped'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nativeRef = useRef<any>(null);

  const stop = useCallback(async () => {
    manualStopRef.current = true;
    activeRef.current = false;
    setListening(false);
    if (watchdogRef.current) {
      clearInterval(watchdogRef.current);
      watchdogRef.current = null;
    }
    if (isNative) {
      try {
        if (nativeRef.current) {
          await nativeRef.current.stop();
          await nativeRef.current.removeAllListeners();
        }
      } catch {
        // ignore
      }
    } else {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  const start = useCallback(async (opts: StartOptions) => {
    if (activeRef.current) return;
    manualStopRef.current = false;
    activeRef.current = true;
    accumulatedRef.current = '';
    committedRef.current = '';
    lastPartialRef.current = '';

    if (isNative) {
      await startNative(opts);
    } else {
      startWeb(opts);
    }
  }, []);

  // --------------------------------------------------------------------- WEB
  function startWeb(opts: StartOptions) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      activeRef.current = false;
      opts.onError('unsupported');
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = opts.lang;

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          accumulatedRef.current = (accumulatedRef.current + ' ' + r[0].transcript).trim();
        } else {
          interim += r[0].transcript;
        }
      }
      opts.onResult((accumulatedRef.current + ' ' + interim).trim());
    };

    rec.onerror = (event) => {
      const e = event.error;
      if (e === 'aborted' || e === 'no-speech') return; // transitório: o onend re-inicia
      if (e === 'not-allowed' || e === 'service-not-allowed') {
        activeRef.current = false;
        opts.onError('permission');
      } else if (e === 'network') {
        opts.onError('network');
      } else if (e === 'audio-capture') {
        activeRef.current = false;
        opts.onError('generic');
      } else {
        opts.onError('generic');
      }
    };

    rec.onend = () => {
      // O Chrome encerra sozinho em pausas; mantemos contínuo re-iniciando
      // enquanto o usuário não tiver mandado parar.
      if (activeRef.current && !manualStopRef.current) {
        try {
          rec.start();
          return;
        } catch {
          // já parado / erro — cai pra setListening(false)
        }
      }
      setListening(false);
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
    } catch {
      activeRef.current = false;
      opts.onError('generic');
    }
  }

  // ------------------------------------------------------------------- NATIVO
  // Fecha o trecho parcial atual no texto acumulado (chamado antes de reiniciar).
  function commitPartial() {
    if (lastPartialRef.current) {
      committedRef.current = (
        committedRef.current ? committedRef.current + ' ' + lastPartialRef.current : lastPartialRef.current
      ).trim();
      lastPartialRef.current = '';
    }
  }

  // Reinício contínuo do reconhecimento. O Android encerra a cada pausa/silêncio
  // (onEndOfSpeech → 'stopped') E também em erros como ERROR_NO_MATCH/
  // ERROR_SPEECH_TIMEOUT — mas nesse último caso o plugin NÃO emite 'stopped'
  // (só chama stopListening internamente). Por isso reiniciamos tanto pelo evento
  // 'stopped' quanto por um watchdog que checa isListening(). A guarda
  // `restartingRef` + a pequena espera evitam ERROR_RECOGNIZER_BUSY (recognizer
  // ainda não liberado) e reinícios concorrentes que duplicariam/perderiam texto.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function restartNative(SpeechRecognition: any, opts: StartOptions) {
    if (!activeRef.current || manualStopRef.current) return;
    if (restartingRef.current) return;
    restartingRef.current = true;
    commitPartial();
    await new Promise((r) => setTimeout(r, 320)); // deixa o recognizer liberar
    if (!activeRef.current || manualStopRef.current) {
      restartingRef.current = false;
      return;
    }
    try {
      await SpeechRecognition.start({ language: opts.lang, partialResults: true, popup: false });
      setListening(true);
    } catch {
      // Falhou (provável BUSY) — o watchdog tenta de novo no próximo ciclo.
    } finally {
      restartingRef.current = false;
    }
  }

  async function startNative(opts: StartOptions) {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      nativeRef.current = SpeechRecognition;

      const { available } = await SpeechRecognition.available();
      if (!available) {
        activeRef.current = false;
        opts.onError('unsupported');
        return;
      }

      // Permissão (microfone + reconhecimento de fala). 1ª vez mostra o diálogo
      // do sistema; depois é só checagem.
      let perm = await SpeechRecognition.checkPermissions();
      if (perm.speechRecognition !== 'granted') {
        perm = await SpeechRecognition.requestPermissions();
      }
      if (perm.speechRecognition !== 'granted') {
        activeRef.current = false;
        opts.onError('permission');
        return;
      }

      await SpeechRecognition.removeAllListeners();

      await SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
        const m = data?.matches?.[0] ?? '';
        lastPartialRef.current = m;
        const joined = committedRef.current ? committedRef.current + ' ' + m : m;
        opts.onResult(joined.trim());
      });

      // O Android fecha o reconhecimento a cada pausa de fala; pra ficar contínuo
      // (como no web), comitamos o trecho e reiniciamos enquanto estiver ativo.
      await SpeechRecognition.addListener(
        'listeningState',
        (data: { status: 'started' | 'stopped' }) => {
          if (data.status === 'started') {
            setListening(true);
            return;
          }
          // status === 'stopped' (fim de fala natural)
          if (activeRef.current && !manualStopRef.current) {
            void restartNative(SpeechRecognition, opts);
          } else {
            setListening(false);
          }
        }
      );

      // Watchdog: cobre o caso em que o recognizer morreu por ERRO (NO_MATCH/
      // SPEECH_TIMEOUT etc.) SEM emitir 'stopped'. Se ainda queremos ouvir mas o
      // motor parou, reinicia. Só age quando não há um reinício já em andamento.
      if (watchdogRef.current) clearInterval(watchdogRef.current);
      watchdogRef.current = setInterval(async () => {
        if (!activeRef.current || manualStopRef.current || restartingRef.current) return;
        try {
          const { listening: isL } = await SpeechRecognition.isListening();
          if (!isL) await restartNative(SpeechRecognition, opts);
        } catch {
          // ignore — tenta de novo no próximo ciclo
        }
      }, 1200);

      await SpeechRecognition.start({ language: opts.lang, partialResults: true, popup: false });
      setListening(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[speech] erro ao iniciar reconhecimento nativo:', err);
      activeRef.current = false;
      opts.onError('generic');
    }
  }

  return { listening, start, stop };
}
