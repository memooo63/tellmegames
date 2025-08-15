export const LANGUAGE_CONFIG = {
  // Supported Languages
  supportedLanguages: [
    { code: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
    { code: "en", name: "English", flag: "🇺🇸", dir: "ltr" },
    { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
    { code: "es", name: "Español", flag: "🇪🇸", dir: "ltr" },
    { code: "tr", name: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  ] as const,

  // Default Language
  defaultLanguage: "de" as const,

  // Fallback Language (if translation missing)
  fallbackLanguage: "en" as const,

  // Browser Language Detection
  detectBrowserLanguage: true,

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
    en: {
      currency: "USD",
      dateFormat: "MM/dd/yyyy",
      numberFormat: "en-US",
    },
    fr: {
      currency: "EUR",
      dateFormat: "dd/MM/yyyy",
      numberFormat: "fr-FR",
    },
    es: {
      currency: "EUR",
      dateFormat: "dd/MM/yyyy",
      numberFormat: "es-ES",
    },
    tr: {
      currency: "TRY",
      dateFormat: "dd.MM.yyyy",
      numberFormat: "tr-TR",
    },
  },
} as const

export type LanguageConfig = typeof LANGUAGE_CONFIG
export type SupportedLanguage = (typeof LANGUAGE_CONFIG.supportedLanguages)[number]["code"]
