export const LANGUAGE_CONFIG = {
  // Supported Languages
  supportedLanguages: [
    { code: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  ] as const,

  // Default Language
  defaultLanguage: "de" as const,

  // Fallback Language (if translation missing)
  fallbackLanguage: "de" as const,

  // Browser Language Detection
  detectBrowserLanguage: false,

  // Translation File Paths
  translationPath: "/languages",

  // Language Cookie Settings
  cookieName: "gaming-finder-language",

  // Locale Settings
  locales: {
    de: {
      currency: "EUR",
      dateFormat: "dd.MM.yyyy",
      numberFormat: "de-DE",
    },
  },
} as const

export type LanguageConfig = typeof LANGUAGE_CONFIG
export type SupportedLanguage = (typeof LANGUAGE_CONFIG.supportedLanguages)[number]["code"]
