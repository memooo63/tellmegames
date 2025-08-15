// Central configuration export
import { APP_CONFIG } from "./app.config"
import { API_CONFIG } from "./api.config"
import { LANGUAGE_CONFIG } from "./language.config"
import { THEME_CONFIG } from "./theme.config"
import { GAME_CONFIG } from "./game.config"

export type {
  AppConfig,
  ApiConfig,
  LanguageConfig,
  ThemeConfig,
  GameConfig,
  SupportedLanguage,
  Theme,
  GameStrategy,
} from "./app.config"

// Environment validation
export const validateEnvironment = () => {
  const required = ["RAWG_API_KEY"]
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(", ")}`)
  }

  return missing.length === 0
}

// Configuration helper functions
export const getConfig = () => ({
  app: APP_CONFIG,
  api: API_CONFIG,
  language: LANGUAGE_CONFIG,
  theme: THEME_CONFIG,
  game: GAME_CONFIG,
})

export const isDevelopment = () => process.env.NODE_ENV === "development"
export const isProduction = () => process.env.NODE_ENV === "production"
