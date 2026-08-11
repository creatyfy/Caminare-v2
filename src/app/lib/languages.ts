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
  flag: string; // emoji de bandeira (renderiza no mobile/Mac; no Windows vira letras)
}

export const SUPPORTED_LANGUAGES: AppLanguage[] = [
  // Mais comuns primeiro
  { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', label: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', label: 'Español (España)', flag: '🇪🇸' },
  { code: 'es-MX', label: 'Español (Latinoamérica)', flag: '🇲🇽' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl-NL', label: 'Nederlands', flag: '🇳🇱' },
  // Europa
  { code: 'sv-SE', label: 'Svenska', flag: '🇸🇪' },
  { code: 'nb-NO', label: 'Norsk', flag: '🇳🇴' },
  { code: 'da-DK', label: 'Dansk', flag: '🇩🇰' },
  { code: 'fi-FI', label: 'Suomi', flag: '🇫🇮' },
  { code: 'pl-PL', label: 'Polski', flag: '🇵🇱' },
  { code: 'cs-CZ', label: 'Čeština', flag: '🇨🇿' },
  { code: 'sk-SK', label: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu-HU', label: 'Magyar', flag: '🇭🇺' },
  { code: 'ro-RO', label: 'Română', flag: '🇷🇴' },
  { code: 'el-GR', label: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'bg-BG', label: 'Български', flag: '🇧🇬' },
  { code: 'hr-HR', label: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr-RS', label: 'Српски', flag: '🇷🇸' },
  { code: 'uk-UA', label: 'Українська', flag: '🇺🇦' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'ca-ES', label: 'Català', flag: '🇪🇸' },
  // Oriente Médio / África
  { code: 'tr-TR', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar-SA', label: 'العربية', flag: '🇸🇦' },
  { code: 'he-IL', label: 'עברית', flag: '🇮🇱' },
  { code: 'fa-IR', label: 'فارسی', flag: '🇮🇷' },
  { code: 'sw-KE', label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'af-ZA', label: 'Afrikaans', flag: '🇿🇦' },
  // Ásia do Sul
  { code: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn-IN', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'ur-PK', label: 'اردو', flag: '🇵🇰' },
  { code: 'ta-IN', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr-IN', label: 'मराठी', flag: '🇮🇳' },
  { code: 'gu-IN', label: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ml-IN', label: 'മലയാളം', flag: '🇮🇳' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
  // Leste / Sudeste Asiático
  { code: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳' },
  { code: 'zh-TW', label: '中文 (繁體)', flag: '🇹🇼' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  { code: 'th-TH', label: 'ไทย', flag: '🇹🇭' },
  { code: 'vi-VN', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms-MY', label: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'fil-PH', label: 'Filipino', flag: '🇵🇭' },
];

/** Emoji de bandeira de um code (vazio se não achar). */
export function flagForLanguage(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.flag ?? '';
}

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
