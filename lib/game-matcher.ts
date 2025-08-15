import { calculateGameScore } from "./search-algorithms"

export interface MatchingPreferences {
  preferNewGames?: boolean
  preferPopularGames?: boolean
  preferIndiGames?: boolean
  avoidEarlyAccess?: boolean
  minPlaytime?: number
  maxPlaytime?: number
}

export function matchGamesToPreferences(
  games: any[],
  filters: {
    platforms?: string[]
    stores?: string[]
    genres?: string[]
    maxPrice?: number
    freeToPlay?: boolean
    onlyHighRated?: boolean
  },
  preferences: MatchingPreferences = {},
): any[] {
  return games
    .map((game) => ({
      ...game,
      matchScore: calculateMatchScore(game, filters, preferences),
    }))
    .filter((game) => game.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
}

function calculateMatchScore(game: any, filters: any, preferences: MatchingPreferences): number {
  let score = calculateGameScore(game, filters)

  // Apply preferences
  if (preferences.preferNewGames && game.released) {
    const releaseYear = new Date(game.released).getFullYear()
    const currentYear = new Date().getFullYear()
    if (currentYear - releaseYear <= 2) {
      score += 2
    }
  }

  if (preferences.preferPopularGames && game.rating > 4.2) {
    score += 3
  }

  if (preferences.preferIndiGames) {
    const isIndie = game.genres?.some(
      (g: any) => g.name.toLowerCase().includes("indie") || g.name.toLowerCase().includes("independent"),
    )
    if (isIndie) score += 2
  }

  if (preferences.avoidEarlyAccess) {
    const isEarlyAccess =
      game.name.toLowerCase().includes("early access") ||
      game.tags?.some((t: any) => t.name.toLowerCase().includes("early access"))
    if (isEarlyAccess) score -= 5
  }

  // Playtime preferences
  if (preferences.minPlaytime && game.playtime < preferences.minPlaytime) {
    score -= 2
  }
  if (preferences.maxPlaytime && game.playtime > preferences.maxPlaytime) {
    score -= 1
  }

  return Math.max(0, score)
}

export function validateGameFilters(filters: {
  platforms?: string[]
  stores?: string[]
  genres?: string[]
}): { isValid: boolean; suggestions: string[] } {
  const suggestions: string[] = []
  let isValid = true

  // Check if at least one filter is selected
  const hasFilters =
    (filters.platforms?.length || 0) + (filters.stores?.length || 0) + (filters.genres?.length || 0) > 0

  if (!hasFilters) {
    isValid = false
    suggestions.push("Wähle mindestens eine Plattform, einen Store oder ein Genre aus")
  }

  // Check platform-store compatibility
  if (filters.platforms && filters.stores) {
    const incompatibleCombos = checkPlatformStoreCompatibility(filters.platforms, filters.stores)
    if (incompatibleCombos.length > 0) {
      suggestions.push(`Einige Store-Plattform-Kombinationen sind nicht verfügbar: ${incompatibleCombos.join(", ")}`)
    }
  }

  return { isValid, suggestions }
}

function checkPlatformStoreCompatibility(platforms: string[], stores: string[]): string[] {
  const incompatible: string[] = []

  // Define compatibility rules
  const compatibility = {
    Steam: ["PC"],
    "Epic Games Store": ["PC"],
    GOG: ["PC"],
    "Microsoft Store": ["PC", "Xbox One", "Xbox Series"],
    "PlayStation Store": ["PlayStation 4", "PlayStation 5"],
    "Nintendo eShop": ["Nintendo Switch"],
  }

  for (const store of stores) {
    const supportedPlatforms = compatibility[store as keyof typeof compatibility] || []
    const hasCompatiblePlatform = platforms.some((platform) => supportedPlatforms.includes(platform))

    if (!hasCompatiblePlatform) {
      incompatible.push(`${store} (nicht verfügbar für gewählte Plattformen)`)
    }
  }

  return incompatible
}
