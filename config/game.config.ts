export const GAME_CONFIG = {
  // Randomization Strategies
  strategies: {
    random: {
      name: "Zufällig",
      description: "Komplett zufällige Auswahl",
      weight: 1,
    },
    quality: {
      name: "Qualität",
      description: "Bevorzugt hochbewertete Spiele",
      weight: 0.8,
    },
    popularity: {
      name: "Beliebtheit",
      description: "Bevorzugt beliebte Spiele",
      weight: 0.7,
    },
    discovery: {
      name: "Entdeckung",
      description: "Bevorzugt weniger bekannte Spiele",
      weight: 0.6,
    },
    balanced: {
      name: "Ausgewogen",
      description: "Ausgewogene Mischung aller Faktoren",
      weight: 0.75,
    },
  } as const,

  // Default Strategy
  defaultStrategy: "balanced" as const,

  // Filter Defaults
  filters: {
    maxPrice: 60,
    minRating: 3.0,
    maxResults: 100,
    platforms: [] as string[],
    genres: [] as string[],
    stores: [] as string[],
  },

  // Game Rating Thresholds
  ratings: {
    excellent: 4.5,
    good: 4.0,
    average: 3.0,
    poor: 2.0,
  },

  // Price Categories
  priceCategories: {
    free: { min: 0, max: 0, label: "Kostenlos" },
    budget: { min: 0.01, max: 15, label: "Budget" },
    mid: { min: 15.01, max: 40, label: "Mittelklasse" },
    premium: { min: 40.01, max: 70, label: "Premium" },
    luxury: { min: 70.01, max: 999, label: "Luxus" },
  },

  // Supported Platforms
  platforms: [
    { id: "pc", name: "PC", icon: "💻" },
    { id: "playstation", name: "PlayStation", icon: "🎮" },
    { id: "xbox", name: "Xbox", icon: "🎮" },
    { id: "nintendo", name: "Nintendo", icon: "🎮" },
    { id: "mobile", name: "Mobile", icon: "📱" },
  ],

  // Popular Genres
  genres: [
    { id: "action", name: "Action", icon: "⚔️" },
    { id: "adventure", name: "Adventure", icon: "🗺️" },
    { id: "rpg", name: "RPG", icon: "🧙" },
    { id: "strategy", name: "Strategy", icon: "♟️" },
    { id: "simulation", name: "Simulation", icon: "🏗️" },
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "racing", name: "Racing", icon: "🏎️" },
    { id: "puzzle", name: "Puzzle", icon: "🧩" },
  ],
} as const

export type GameConfig = typeof GAME_CONFIG
export type GameStrategy = keyof typeof GAME_CONFIG.strategies
