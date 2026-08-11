// =============================================================================
// Idiomas de registro (transcrição por voz + geração dos insights).
// -----------------------------------------------------------------------------
// A INTERFACE do app é só PT/EN. Mas o REGISTRO (o que a pessoa fala/escreve) e
// tudo que a IA gera a partir dele (emoções, crenças, padrões, insights) podem
// ser em vários idiomas — este é o app "mundial".
//
// O `code` é BCP-47: serve tanto pro motor de voz do celular quanto pra dizer
// à IA em que idioma responder. A disponibilidade da transcrição depende do
// pacote de voz instalado no aparelho; a IA cobre todos.
// =============================================================================

export interface AppLanguage {
  code: string; // BCP-47, ex.: 'pt-BR'
  label: string; // nome no idioma nativo, pro seletor
}

export const SUPPORTED_LANGUAGES: AppLanguage[] = [
  // Mais comuns primeiro
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Español (España)' },
  { code: 'es-MX', label: 'Español (Latinoamérica)' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'nl-NL', label: 'Nederlands' },
  // Europa
  { code: 'sv-SE', label: 'Svenska' },
  { code: 'nb-NO', label: 'Norsk' },
  { code: 'da-DK', label: 'Dansk' },
  { code: 'fi-FI', label: 'Suomi' },
  { code: 'pl-PL', label: 'Polski' },
  { code: 'cs-CZ', label: 'Čeština' },
  { code: 'sk-SK', label: 'Slovenčina' },
  { code: 'hu-HU', label: 'Magyar' },
  { code: 'ro-RO', label: 'Română' },
  { code: 'el-GR', label: 'Ελληνικά' },
  { code: 'bg-BG', label: 'Български' },
  { code: 'hr-HR', label: 'Hrvatski' },
  { code: 'sr-RS', label: 'Српски' },
  { code: 'uk-UA', label: 'Українська' },
  { code: 'ru-RU', label: 'Русский' },
  { code: 'ca-ES', label: 'Català' },
  // Oriente Médio / África
  { code: 'tr-TR', label: 'Türkçe' },
  { code: 'ar-SA', label: 'العربية' },
  { code: 'he-IL', label: 'עברית' },
  { code: 'fa-IR', label: 'فارسی' },
  { code: 'sw-KE', label: 'Kiswahili' },
  { code: 'af-ZA', label: 'Afrikaans' },
  // Ásia do Sul
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'bn-IN', label: 'বাংলা' },
  { code: 'ur-PK', label: 'اردو' },
  { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'te-IN', label: 'తెలుగు' },
  { code: 'mr-IN', label: 'मराठी' },
  { code: 'gu-IN', label: 'ગુજરાતી' },
  { code: 'ml-IN', label: 'മലയാളം' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ' },
  // Leste / Sudeste Asiático
  { code: 'zh-CN', label: '中文 (简体)' },
  { code: 'zh-TW', label: '中文 (繁體)' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ko-KR', label: '한국어' },
  { code: 'th-TH', label: 'ไทย' },
  { code: 'vi-VN', label: 'Tiếng Việt' },
  { code: 'id-ID', label: 'Bahasa Indonesia' },
  { code: 'ms-MY', label: 'Bahasa Melayu' },
  { code: 'fil-PH', label: 'Filipino' },
];

/** Idioma padrão derivado da interface (fallback quando não há nativo definido). */
export function defaultLanguageFromInterface(i18nLang?: string): string {
  return i18nLang?.startsWith('en') ? 'en-US' : 'pt-BR';
}

/** Normaliza um code contra a lista suportada (ex.: 'en' -> 'en-US'); null se não achar. */
export function normalizeLanguage(code?: string | null): string | null {
  if (!code) return null;
  const exact = SUPPORTED_LANGUAGES.find((l) => l.code === code);
  if (exact) return exact.code;
  const base = code.split('-')[0].toLowerCase();
  const byBase = SUPPORTED_LANGUAGES.find((l) => l.code.split('-')[0] === base);
  return byBase?.code ?? null;
}

/**
 * Idioma efetivo de um registro. Prioridade:
 *   1) explícito (idioma escolhido naquele registro / salvo na entrada)
 *   2) idioma nativo do usuário
 *   3) idioma da interface (fallback)
 */
export function resolveRecordLanguage(opts: {
  explicit?: string | null;
  native?: string | null;
  i18nLang?: string;
}): string {
  return (
    normalizeLanguage(opts.explicit) ||
    normalizeLanguage(opts.native) ||
    defaultLanguageFromInterface(opts.i18nLang)
  );
}

/** Rótulo de um code pro seletor. */
export function labelForLanguage(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.label ?? code;
}
