export const API_CONFIG = {
  // Primary APIs
  rawg: {
    baseUrl: "https://api.rawg.io/api",
    key: process.env.RAWG_API_KEY || "",
    endpoints: {
      games: "/games",
      genres: "/genres",
      platforms: "/platforms",
      stores: "/stores",
    },
    rateLimit: {
      requestsPerSecond: 5,
      requestsPerMonth: 20000,
    },
  },

  // Fallback APIs
  steam: {
    baseUrl: "https://store.steampowered.com/api",
    key: process.env.STEAM_API_KEY || "",
    endpoints: {
      appDetails: "/appdetails",
      search: "/storesearch",
    },
  },

  epic: {
    baseUrl: "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions",
    endpoints: {
      freeGames: "",
    },
  },

  // Store URLs for game links
  storeUrls: {
    steam: "https://store.steampowered.com/search/?term=",
    epic: "https://store.epicgames.com/en-US/browse?q=",
    gog: "https://www.gog.com/games?search=",
    microsoft: "https://www.microsoft.com/store/search?q=",
    playstation: "https://store.playstation.com/search/",
    nintendo: "https://www.nintendo.com/search/?q=",
    fallback: "https://www.google.com/search?q=",
  },

  // Request Configuration
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // 1 second

  // Cache Settings
  cache: {
    games: 60 * 60 * 1000, // 1 hour
    genres: 24 * 60 * 60 * 1000, // 24 hours
    platforms: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const

export type ApiConfig = typeof API_CONFIG
