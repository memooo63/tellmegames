// Seeded random number generator (Mulberry32)
export class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    let t = (this.seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  weightedSelect<T>(items: Array<{ item: T; weight: number }>): T | null {
    if (items.length === 0) return null

    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    if (totalWeight <= 0) return items[0]?.item || null

    let random = this.next() * totalWeight

    for (const { item, weight } of items) {
      random -= weight
      if (random <= 0) {
        return item
      }
    }

    return items[items.length - 1]?.item || null
  }

  pickMultiple<T>(array: T[], count: number): T[] {
    if (count >= array.length) return this.shuffle(array)

    const shuffled = this.shuffle(array)
    return shuffled.slice(0, count)
  }

  nextGaussian(mean = 0, stdDev = 1): number {
    let u = 0,
      v = 0
    while (u === 0) u = this.next() // Converting [0,1) to (0,1)
    while (v === 0) v = this.next()

    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    return z * stdDev + mean
  }

  biasedSelect<T>(items: T[], getBias: (item: T) => number, strength = 1): T | null {
    if (items.length === 0) return null

    const weightedItems = items.map((item) => ({
      item,
      weight: Math.pow(getBias(item), strength),
    }))

    return this.weightedSelect(weightedItems)
  }
}

export function generateSeed(): number {
  return Math.floor(Math.random() * 2147483647)
}

export function createSeededRandom(seed?: number): SeededRandom {
  return new SeededRandom(seed || generateSeed())
}

export function encodeSeed(seed: number): string {
  return seed.toString(36)
}

export function decodeSeed(encoded: string): number {
  const decoded = Number.parseInt(encoded, 36)
  return isNaN(decoded) ? generateSeed() : decoded
}

export interface GameSelectionStrategy {
  name: string
  description: string
  selectGame: (games: any[], random: SeededRandom) => any | null
}

export const SELECTION_STRATEGIES: Record<string, GameSelectionStrategy> = {
  pure_random: {
    name: "Völlig zufällig",
    description: "Jedes Spiel hat die gleiche Chance",
    selectGame: (games, random) => {
      if (games.length === 0) return null
      const index = Math.floor(random.next() * games.length)
      return games[index]
    },
  },

  quality_biased: {
    name: "Qualitätsorientiert",
    description: "Bevorzugt höher bewertete Spiele",
    selectGame: (games, random) => {
      return random.biasedSelect(
        games,
        (game) => {
          const rating = game.rating || 3
          const metacritic = game.metacritic ? game.metacritic / 100 : 0.5
          return (rating / 5) * 0.7 + metacritic * 0.3
        },
        2,
      )
    },
  },

  popularity_biased: {
    name: "Beliebtheitsorientiert",
    description: "Bevorzugt beliebte und bekannte Spiele",
    selectGame: (games, random) => {
      return random.biasedSelect(
        games,
        (game) => {
          const rating = game.rating || 3
          const playtime = Math.min(game.playtime || 0, 100) / 100
          return (rating / 5) * 0.5 + playtime * 0.5
        },
        1.5,
      )
    },
  },

  discovery: {
    name: "Entdeckermodus",
    description: "Bevorzugt weniger bekannte Perlen",
    selectGame: (games, random) => {
      return random.biasedSelect(
        games,
        (game) => {
          const rating = game.rating || 3
          const popularity = Math.min(game.playtime || 0, 100) / 100
          // Invert popularity - less popular games get higher weight
          const discoveryScore = (rating / 5) * 0.7 + (1 - popularity) * 0.3
          return Math.max(0.1, discoveryScore)
        },
        1.2,
      )
    },
  },

  balanced: {
    name: "Ausgewogen",
    description: "Gute Balance zwischen Qualität und Überraschung",
    selectGame: (games, random) => {
      // Mix of quality bias and some randomness
      if (random.next() < 0.7) {
        return SELECTION_STRATEGIES.quality_biased.selectGame(games, random)
      } else {
        return SELECTION_STRATEGIES.pure_random.selectGame(games, random)
      }
    },
  },
}

export function selectGameWithStrategy(
  games: any[],
  seed: number,
  strategy = "balanced",
): { game: any | null; usedSeed: number; strategy: string } {
  const random = createSeededRandom(seed)
  const selectedStrategy = SELECTION_STRATEGIES[strategy] || SELECTION_STRATEGIES.balanced

  const game = selectedStrategy.selectGame(games, random)

  return {
    game,
    usedSeed: seed,
    strategy: selectedStrategy.name,
  }
}

export function injectDiversity<T>(items: T[], random: SeededRandom, diversityFactor = 0.3): T[] {
  if (items.length <= 3) return items

  const result: T[] = []
  const remaining = [...items]

  // Always include top item
  result.push(remaining.shift()!)

  while (remaining.length > 0 && result.length < items.length) {
    if (random.next() < diversityFactor) {
      // Pick randomly from remaining items for diversity
      const randomIndex = Math.floor(random.next() * remaining.length)
      result.push(remaining.splice(randomIndex, 1)[0])
    } else {
      // Pick next best item
      result.push(remaining.shift()!)
    }
  }

  return result
}

export function generateAlternatives(games: any[], currentGame: any, seed: number, count = 3): any[] {
  if (games.length <= 1) return []

  const random = createSeededRandom(seed + 1) // Offset seed for alternatives
  const filteredGames = games.filter((game) => game.id !== currentGame?.id)

  return random.pickMultiple(filteredGames, count)
}
