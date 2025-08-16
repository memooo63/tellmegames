import { type NextRequest, NextResponse } from "next/server"
import { searchGames } from "@/lib/api/rawg"
import { selectGameWithStrategy, generateAlternatives, decodeSeed, generateSeed } from "@/lib/random"
import { LRUCache } from "lru-cache"

const cache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 10,
  allowStale: true,
})
import { getRawgPlatformIds, getRawgStoreIds, getRawgGenreIds } from "@/lib/mapping"
import { isPriceInRange } from "@/lib/price"
import { matchGamesToPreferences } from "@/lib/game-matcher"
import fallbackGames from "@/lib/fallback-games.json"

function revalidate(key: string, params: any) {
  searchGamesWithFallbacks(params)
    .then(({ games }) => cache.set(key, games))
    .catch((err) => console.error("revalidate failed", err))
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

async function searchGamesWithFallbacks(params: any): Promise<{ games: any[]; fallback: boolean }> {
  let games: any[] = []
  let fallback = false

  if (!process.env.RAWG_KEY) {
    console.error("RAWG API key missing - using fallback dataset")
    games = [...fallbackGames]
    fallback = true
  } else {
    try {
      // Primary: RAWG API
      const response = await searchGames({
        ...params,
        page_size: "100", // Get more results for better filtering
        ordering: "-rating,-metacritic", // Prioritize highly rated games
      })
      games = response.results || []
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (message.includes("401")) {
        console.error("RAWG API unauthorized - using fallback dataset")
        games = [...fallbackGames]
        fallback = true
      } else {
        console.error("RAWG API failed, trying fallbacks:", error)
      }
    }
  }

  // If RAWG returns few results, supplement with fallback data
  if (!fallback && games.length < 10) {
    console.log("Using fallback games due to insufficient results")
    games = [...games, ...fallbackGames]
  }

  games = games.map((g) => ({
    ...g,
    steamAppId:
      g.stores &&
      (() => {
        const url = g.stores.find((s: any) => s.store?.slug === "steam")?.url
        const match = url?.match(/\/app\/(\d+)/)
        return match ? Number(match[1]) : undefined
      })(),
  }))

  return { games, fallback }
}

export async function GET(request: NextRequest) {
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

    // Check cache first
    let gamesData = cache.get(cacheKey, { allowStale: true }) as any[] | undefined
    let fallbackUsed = false

    if (gamesData) {
      if (cache.getRemainingTTL(cacheKey) <= 0) {
        revalidate(cacheKey, apiParams)
      }
    } else {
      const result = await searchGamesWithFallbacks(apiParams)
      gamesData = result.games
      fallbackUsed = result.fallback
      cache.set(cacheKey, gamesData)
    }

    // Retry without store filter if no results
    if (gamesData.length === 0 && stores.length > 0) {
      const retry = await searchGamesWithFallbacks({ ...apiParams, stores: undefined })
      gamesData = retry.games
      fallbackUsed = fallbackUsed || retry.fallback
    }

    const activeStores = gamesData.length === 0 ? [] : stores

    const filteredGames = filterGames(gamesData, {
      platforms,
      stores: activeStores,
      genres,
      maxPrice: maxPrice ? Math.min(Number.parseFloat(maxPrice), 125) : undefined,
      freeToPlay,
      onlyHighRated,
      minRating: 3.0,
    })

    if (filteredGames.length === 0) {
      if (freeToPlay) {
        const f2pAll = filterGames((await searchGamesWithFallbacks({})).games, {
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
        fallback: fallbackUsed,
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
      fallback: fallbackUsed,
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
