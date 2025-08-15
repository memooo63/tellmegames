export type Language = "de" | "en" | "fr" | "es" | "tr"

export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
  flag: string
}

export interface TranslationKeys {
  [key: string]: string | TranslationKeys
}

export interface Settings {
  language: Language
  theme: "light" | "dark" | "system"
  filters: {
    platform?: string
    store?: string
    genre?: string
    priceMax?: number
    freeToPlay?: boolean
    qualityFilter?: boolean
  }
}
