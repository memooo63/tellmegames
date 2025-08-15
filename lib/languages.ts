import type { Language, LanguageConfig } from "@/types/language"

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "de",
    name: "Deutsch",
    nativeName: "Deutsch",
    flag: "🇩🇪",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "fr",
    name: "Français",
    nativeName: "Français",
    flag: "🇫🇷",
  },
  {
    code: "es",
    name: "Español",
    nativeName: "Español",
    flag: "🇪🇸",
  },
  {
    code: "tr",
    name: "Türkçe",
    nativeName: "Türkçe",
    flag: "🇹🇷",
  },
]

export const DEFAULT_LANGUAGE: Language = "de"

export function getLanguageConfig(code: Language): LanguageConfig {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) || SUPPORTED_LANGUAGES[0]
}

export function detectBrowserLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE

  const browserLang = navigator.language.split("-")[0] as Language
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === browserLang) ? browserLang : DEFAULT_LANGUAGE
}
