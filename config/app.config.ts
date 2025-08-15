export const APP_CONFIG = {
  // App Information
  name: "Gaming Finder",
  version: "1.0.0",
  description: "Entdecke dein nächstes Lieblingsspiel",

  // URLs and Domains
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",

  // Default Settings
  defaults: {
    language: "de" as const,
    theme: "dark" as const,
    maxPrice: 60,
    pageSize: 20,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  },

  // Feature Flags
  features: {
    sharing: true,
    history: true,
    cookieConsent: true,
    analytics: false,
    darkMode: true,
    multiLanguage: true,
  },

  // Limits and Constraints
  limits: {
    maxHistoryItems: 50,
    maxSearchResults: 100,
    maxRetries: 3,
    rateLimitPerMinute: 60,
  },

  // Cookie Settings
  cookies: {
    maxAge: 365 * 24 * 60 * 60, // 1 year in seconds
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // Client-side access needed
  },

  // SEO and Meta
  seo: {
    keywords: ["Spiele", "Gaming", "Zufallsgenerator", "Spielefinder", "kostenlos"],
    author: "Gaming Finder Team",
    robots: "index, follow",
  },
} as const

export type AppConfig = typeof APP_CONFIG
