export interface SearchWeights {
  exactMatch: number
  partialMatch: number
  genreMatch: number
  platformMatch: number
  ratingBonus: number
  metacriticBonus: number
}

export const DEFAULT_WEIGHTS: SearchWeights = {
  exactMatch: 10,
  partialMatch: 5,
  genreMatch: 3,
  platformMatch: 2,
  ratingBonus: 1,
  metacriticBonus: 0.5,
}

export function calculateGameScore(
  game: any,
  filters: {
    platforms?: string[]
    stores?: string[]
    genres?: string[]
    searchTerm?: string
  },
  weights: SearchWeights = DEFAULT_WEIGHTS,
): number {
  let score = 0

  // Base rating score
  score += (game.rating || 0) * weights.ratingBonus
  score += ((game.metacritic || 0) / 100) * weights.metacriticBonus

  // Platform matching
  if (filters.platforms && filters.platforms.length > 0) {
    const gamePlatforms = game.platforms?.map((p: any) => p.platform.name.toLowerCase()) || []
    const platformMatches = filters.platforms.filter((platform) =>
      gamePlatforms.some(
        (gamePlatform) =>
          gamePlatform.includes(platform.toLowerCase()) || platform.toLowerCase().includes(gamePlatform),
      ),
    ).length
    score += platformMatches * weights.platformMatch
  }

  // Genre matching
  if (filters.genres && filters.genres.length > 0) {
    const gameGenres = game.genres?.map((g: any) => g.name.toLowerCase()) || []
    const genreMatches = filters.genres.filter((genre) =>
      gameGenres.some(
        (gameGenre) => gameGenre.includes(genre.toLowerCase()) || genre.toLowerCase().includes(gameGenre),
      ),
    ).length
    score += genreMatches * weights.genreMatch
  }

  // Search term matching
  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase()
    const gameName = game.name.toLowerCase()

    if (gameName === searchTerm) {
      score += weights.exactMatch
    } else if (gameName.includes(searchTerm) || searchTerm.includes(gameName)) {
      score += weights.partialMatch
    }
  }

  return score
}

export function fuzzyMatch(text1: string, text2: string, threshold = 0.6): boolean {
  const longer = text1.length > text2.length ? text1 : text2
  const shorter = text1.length > text2.length ? text2 : text1

  if (longer.length === 0) return true

  const distance = levenshteinDistance(longer, shorter)
  const similarity = (longer.length - distance) / longer.length

  return similarity >= threshold
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

export function diversifyResults<T>(items: T[], diversityFactor = 0.3): T[] {
  if (items.length <= 1) return items

  const result: T[] = [items[0]] // Always include the top result
  const remaining = items.slice(1)

  for (let i = 0; i < remaining.length && result.length < items.length; i++) {
    const shouldInclude = Math.random() < diversityFactor || result.length < 3
    if (shouldInclude) {
      result.push(remaining[i])
    }
  }

  return result
}
