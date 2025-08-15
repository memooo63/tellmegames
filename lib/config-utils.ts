import { APP_CONFIG, API_CONFIG, LANGUAGE_CONFIG, THEME_CONFIG, GAME_CONFIG } from "@/config"

// Configuration getter with type safety
export const getAppConfig = () => APP_CONFIG
export const getApiConfig = () => API_CONFIG
export const getLanguageConfig = () => LANGUAGE_CONFIG
export const getThemeConfig = () => THEME_CONFIG
export const getGameConfig = () => GAME_CONFIG

// Environment helpers
export const getBaseUrl = () => APP_CONFIG.baseUrl
export const isFeatureEnabled = (feature: keyof typeof APP_CONFIG.features) => APP_CONFIG.features[feature]

// API helpers
export const getApiUrl = (service: keyof typeof API_CONFIG, endpoint?: string) => {
  const config = API_CONFIG[service]
  if (!config || typeof config !== "object" || !("baseUrl" in config)) {
    throw new Error(`Invalid API service: ${service}`)
  }

  const baseUrl = config.baseUrl
  return endpoint ? `${baseUrl}${endpoint}` : baseUrl
}

export const getStoreUrl = (store: keyof typeof API_CONFIG.storeUrls, query: string) => {
  const baseUrl = API_CONFIG.storeUrls[store] || API_CONFIG.storeUrls.fallback
  return `${baseUrl}${encodeURIComponent(query)}`
}

// Language helpers
export const getSupportedLanguages = () => LANGUAGE_CONFIG.supportedLanguages
export const getDefaultLanguage = () => LANGUAGE_CONFIG.defaultLanguage
export const isLanguageSupported = (lang: string) => LANGUAGE_CONFIG.supportedLanguages.some((l) => l.code === lang)

// Theme helpers
export const getSupportedThemes = () => THEME_CONFIG.themes
export const getDefaultTheme = () => THEME_CONFIG.defaultTheme

// Game helpers
export const getGameStrategies = () => GAME_CONFIG.strategies
export const getDefaultStrategy = () => GAME_CONFIG.defaultStrategy
export const getPlatforms = () => GAME_CONFIG.platforms
export const getGenres = () => GAME_CONFIG.genres

// Validation helpers
export const validateConfig = () => {
  const errors: string[] = []

  // Check required environment variables
  if (!API_CONFIG.rawg.key) {
    errors.push("RAWG_API_KEY is required")
  }

  // Check base URL format
  try {
    new URL(APP_CONFIG.baseUrl)
  } catch {
    errors.push("NEXT_PUBLIC_BASE_URL must be a valid URL")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
