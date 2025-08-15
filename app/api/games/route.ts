import { type NextRequest, NextResponse } from "next/server"
import { searchGames } from "@/lib/api/rawg"
import { gameCache } from "@/lib/cache"
import { selectGameWithStrategy, generateAlternatives, decodeSeed, generateSeed } from "@/lib/random"
import { getRawgPlatformIds, getRawgStoreIds, getRawgGenreIds } from "@/lib/mapping"
import { isPriceInRange } from "@/lib/price"
import { matchGamesToPreferences } from "@/lib/game-matcher"
import fallbackGames from "@/lib/fallback-games.json"

// Rate limiting (simple in-memory store)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 30

  const current = rateLimitMap.get(ip)

  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

function filterGames(
  games: any[],
  filters: {
    platforms?: string[]
    stores?: string[]
    genres?: string[]
    maxPrice?: number
    freeToPlay?: boolean
    minRating?: number
    onlyHighRated?: boolean
  },
) {
  return games.filter((game) => {
    // Platform filtering
    if (filters.platforms && filters.platforms.length > 0) {
      const gamePlatforms = game.platforms?.map((p: any) => p.platform.name.toLowerCase()) || []
      const hasMatchingPlatform = filters.platforms.some((platform) =>
        gamePlatforms.some(
          (gamePlatform) =>
            gamePlatform.includes(platform.toLowerCase()) || platform.toLowerCase().includes(gamePlatform),
        ),
      )
      if (!hasMatchingPlatform) return false
    }

    // Store filtering
    if (filters.stores && filters.stores.length > 0) {
      const gameStores = game.stores?.map((s: any) => s.store.name.toLowerCase()) || []
      const hasMatchingStore = filters.stores.some((store) =>
        gameStores.some(
          (gameStore) => gameStore.includes(store.toLowerCase()) || store.toLowerCase().includes(gameStore),
        ),
      )
      if (!hasMatchingStore) return false
    }

    // Genre filtering
    if (filters.genres && filters.genres.length > 0) {
      const gameGenres = game.genres?.map((g: any) => g.name.toLowerCase()) || []
      const hasMatchingGenre = filters.genres.some((genre) =>
        gameGenres.some(
          (gameGenre) => gameGenre.includes(genre.toLowerCase()) || genre.toLowerCase().includes(gameGenre),
        ),
      )
      if (!hasMatchingGenre) return false
    }

    // Price filtering
    if (filters.freeToPlay) {
      if (!game.free_to_play && game.price !== 0) return false
    } else if (filters.maxPrice !== undefined) {
      if (game.price && !isPriceInRange(game.price, filters.maxPrice, game.currency)) {
        return false
      }
    }

    // Rating filtering
    if (filters.minRating && game.rating < filters.minRating) {
      return false
    }

    // High-rated only filter
    if (filters.onlyHighRated && (game.rating < 4.0 || (game.metacritic && game.metacritic < 75))) {
      return false
    }

    return true
  })
}

async function searchGamesWithFallbacks(params: any): Promise<any[]> {
  let games: any[] = []

  try {
    // Primary: RAWG API
    const response = await searchGames({
      ...params,
      page_size: "100", // Get more results for better filtering
      ordering: "-rating,-metacritic", // Prioritize highly rated games
    })
    games = response.results || []
  } catch (error) {
    console.error("RAWG API failed, trying fallbacks:", error)
  }

  // If RAWG fails or returns few results, try fallback data
  if (games.length < 10) {
    console.log("Using fallback games due to insufficient results")
    games = [...games, ...fallbackGames]
  }

  return games
}

export async function GET(request: NextRequest) {
  const ip = request.ip || "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const platforms = searchParams.get("platforms")?.split(",") || []
  const stores = searchParams.get("stores")?.split(",") || []
  const genres = searchParams.get("genres")?.split(",") || []
  const maxPrice = searchParams.get("maxPrice")
  const freeToPlay = searchParams.get("freeToPlay") === "true"
  const onlyHighRated = searchParams.get("onlyHighRated") === "true"
  const seedParam = searchParams.get("seed")
  const strategy = searchParams.get("strategy") || "balanced"
  const getAlternatives = searchParams.get("alternatives") === "true"
  const startYear = searchParams.get("startYear")
  const endYear = searchParams.get("endYear")

  try {
    const seed = seedParam ? decodeSeed(seedParam) : generateSeed()

    const cacheKey = `games:${platforms.join(",")}:${stores.join(",")}:${genres.join(",")}:${maxPrice}:${freeToPlay}:${onlyHighRated}:${startYear}:${endYear}`

    // Check cache first
    let games = gameCache.get(cacheKey)

    if (!games) {
      // Build RAWG API parameters
      const apiParams: any = {}

      if (platforms.length > 0) {
        apiParams.platforms = getRawgPlatformIds(platforms as any)
      }

      if (stores.length > 0) {
        apiParams.stores = getRawgStoreIds(stores as any)
      }

      if (genres.length > 0) {
        apiParams.genres = getRawgGenreIds(genres as any)
      }

      if (startYear && endYear) {
        apiParams.dates = `${startYear}-01-01,${endYear}-12-31`
      }

      games = await searchGamesWithFallbacks(apiParams)
      gameCache.set(cacheKey, games, 15)
    }

    const filteredGames = filterGames(games, {
      platforms,
      stores,
      genres,
      maxPrice: maxPrice ? Math.min(Number.parseFloat(maxPrice), 125) : undefined,
      freeToPlay,
      onlyHighRated,
      minRating: 3.0,
    })

    if (filteredGames.length === 0) {
      if (freeToPlay) {
        const f2pAll = filterGames(await searchGamesWithFallbacks({}), {
          freeToPlay: true,
          stores,
        })
        if (f2pAll.length > 0) {
          const fallback = selectGameWithStrategy(f2pAll, seed, strategy)
          return NextResponse.json({
            game: fallback.game,
            seed: fallback.usedSeed,
            strategy: fallback.strategy,
            total: f2pAll.length,
          })
        }
      }
      return NextResponse.json({
        error: "Keine Spiele gefunden. Versuche weniger spezifische Filter.",
        games: [],
        total: 0,
      })
    }

    const matchedGames = matchGamesToPreferences(filteredGames, {
      platforms,
      stores,
      genres,
      maxPrice: maxPrice ? Math.min(Number.parseFloat(maxPrice), 125) : undefined,
      freeToPlay,
      onlyHighRated,
    })

    const selection = selectGameWithStrategy(matchedGames, seed, strategy)

    const result: any = {
      game: selection.game,
      seed: selection.usedSeed,
      strategy: selection.strategy,
      total: filteredGames.length,
    }

    if (getAlternatives && selection.game) {
      const alternatives = generateAlternatives(matchedGames, selection.game, seed, 3)
      result.alternatives = alternatives
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Games API error:", error)
    return NextResponse.json(
      {
        error: "Fehler beim Laden der Spiele. Bitte versuche es später erneut.",
        games: [],
        total: 0,
      },
      { status: 500 },
    )
  }
}
