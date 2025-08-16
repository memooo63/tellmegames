import { type NextRequest, NextResponse } from "next/server"
import { searchGames, getGameStores } from "@/lib/api/rawg"
import { LRUCache } from "lru-cache"
import { getRawgPlatformIds, getRawgStoreIds, getRawgGenreIds } from "@/lib/mapping"
import { isPriceInRange } from "@/lib/price"
import fallbackGames from "@/data/games-fallback.json"

const memoryCache = new LRUCache<string, { games: any[]; fallback: boolean }>({
  max: 100,
  ttl: 1000 * 60 * 15,
  allowStale: true,
})

let Redis: any
if (process.env.REDIS_URL) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Redis = require("ioredis")
}
const redis = process.env.REDIS_URL && Redis ? new Redis(process.env.REDIS_URL) : null

function keyFromObj(searchParams: URLSearchParams) {
  const obj = Object.fromEntries([...searchParams.entries()].sort()) as Record<string, any>
  return JSON.stringify(obj)
}

async function fetchRawg(params: any) {
  const response = await searchGames({
    ...params,
    page_size: 40,
    ordering: "-rating,-metacritic",
    page: 1,
  })
  let games = response.results || []
  if (games.length < 10) {
    const second = await searchGames({
      ...params,
      page_size: 40,
      ordering: "-rating,-metacritic",
      page: 2,
    })
    games = [...games, ...(second.results || [])]
  }
  return games
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

    if (filters.stores && filters.stores.length > 0) {
      const gameStores = game.stores?.map((s: any) => s.store.name.toLowerCase()) || []
      const hasMatchingStore = filters.stores.some((store) =>
        gameStores.some((gameStore) => gameStore.includes(store.toLowerCase()) || store.toLowerCase().includes(gameStore)),
      )
      if (!hasMatchingStore) return false
    }

    if (filters.genres && filters.genres.length > 0) {
      const gameGenres = game.genres?.map((g: any) => g.name.toLowerCase()) || []
      const hasMatchingGenre = filters.genres.some((genre) =>
        gameGenres.some((gameGenre) => gameGenre.includes(genre.toLowerCase()) || genre.toLowerCase().includes(gameGenre)),
      )
      if (!hasMatchingGenre) return false
    }

    if (filters.freeToPlay) {
      if (!game.free_to_play && game.price !== 0) return false
    } else if (filters.maxPrice !== undefined) {
      if (game.price && !isPriceInRange(game.price, filters.maxPrice, game.currency)) {
        return false
      }
    }

    if (filters.minRating && game.rating < filters.minRating) {
      return false
    }

    if (filters.onlyHighRated && (game.rating < 4.0 || (game.metacritic && game.metacritic < 75))) {
      return false
    }

    return true
  })
}

async function enrichSteamIds(games: any[]) {
  await Promise.all(
    games.map(async (g) => {
      const steamStore = g.stores?.find((s: any) => s.store?.slug === "steam")
      if (steamStore) {
        const match = steamStore.url?.match(/\/app\/(\d+)/)
        if (match) {
          g.steamAppId = Number(match[1])
        } else {
          try {
            const details = await getGameStores(g.id)
            const steam = details.find((s: any) => s.store?.slug === "steam")
            if (steam?.url) {
              steamStore.url = steam.url
              const m = steam.url.match(/\/app\/(\d+)/)
              if (m) g.steamAppId = Number(m[1])
            }
          } catch {
            // ignore
          }
        }
      }
    }),
  )
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const platforms = searchParams.get("platforms")?.split(",") || []
  const stores = searchParams.get("stores")?.split(",") || []
  const genres = searchParams.get("genres")?.split(",") || []
  const maxPrice = searchParams.get("maxPrice")
  const freeToPlay = searchParams.get("freeToPlay") === "true"
  const onlyHighRated = searchParams.get("onlyHighRated") === "true"
  const startYear = searchParams.get("startYear")
  const endYear = searchParams.get("endYear")

  const cacheKey = keyFromObj(searchParams)

  try {
    const apiParams: any = {}
    if (platforms.length > 0) apiParams.platforms = getRawgPlatformIds(platforms as any)
    if (stores.length > 0) apiParams.stores = getRawgStoreIds(stores as any)
    if (genres.length > 0) apiParams.genres = getRawgGenreIds(genres as any)
    if (startYear && endYear) apiParams.dates = `${startYear}-01-01,${endYear}-12-31`
    if (freeToPlay) apiParams.tags = "free-to-play"

    let storeFilterActive = true
    let games = await fetchRawg(apiParams)
    if (games.length < 10) {
      games = [...games, ...fallbackGames]
    }
    if (games.length === 0 && stores.length > 0) {
      const paramsNoStore = { ...apiParams }
      delete paramsNoStore.stores
      games = await fetchRawg(paramsNoStore)
      if (games.length < 10) {
        games = [...games, ...fallbackGames]
      }
      storeFilterActive = false
    }

    let filteredGames = filterGames(games, {
      platforms,
      stores: storeFilterActive ? stores : [],
      genres,
      maxPrice: maxPrice ? Math.min(Number.parseFloat(maxPrice), 125) : undefined,
      freeToPlay,
      onlyHighRated,
      minRating: 3.0,
    })

    if (filteredGames.length === 0 && freeToPlay) {
      const retryParams = { ...apiParams }
      delete retryParams.genres
      delete retryParams.maxPrice
      let retryGames = await fetchRawg(retryParams)
      if (retryGames.length < 10) {
        retryGames = [...retryGames, ...fallbackGames]
      }
      filteredGames = filterGames(retryGames, {
        platforms,
        stores: storeFilterActive ? stores : [],
        genres: [],
        maxPrice: undefined,
        freeToPlay: true,
        onlyHighRated,
        minRating: 3.0,
      })
    }

    if (filteredGames.length === 0) {
      return NextResponse.json(
        { error: "Keine Spiele gefunden. Versuche weniger spezifische Filter.", games: [], total: 0, fallback: false },
        { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600", "x-cache": "live" } },
      )
    }

    await enrichSteamIds(filteredGames)

    memoryCache.set(cacheKey, { games: filteredGames, fallback: false })
    if (redis) {
      redis.set(cacheKey, JSON.stringify({ games: filteredGames, fallback: false }), "EX", 900).catch(() => {})
    }

    return NextResponse.json(
      { games: filteredGames, total: filteredGames.length, fallback: false },
      { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600", "x-cache": "live" } },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.includes("401") || !process.env.RAWG_KEY) {
      const games = [...(fallbackGames as any[])]
      memoryCache.set(cacheKey, { games, fallback: true })
      if (redis) {
        redis.set(cacheKey, JSON.stringify({ games, fallback: true }), "EX", 900).catch(() => {})
      }
      return NextResponse.json(
        { games, total: games.length, fallback: true },
        { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600", "x-cache": "fallback" } },
      )
    }

    let cached = memoryCache.get(cacheKey)
    if (!cached && redis) {
      const redisValue = await redis.get(cacheKey)
      if (redisValue) cached = JSON.parse(redisValue)
    }
    if (cached) {
      return NextResponse.json(
        { games: cached.games, total: cached.games.length, fallback: cached.fallback },
        { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600", "x-cache": "cache" } },
      )
    }

    console.error("Games API error:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden der Spiele. Bitte versuche es später erneut.", games: [], total: 0 },
      { status: 500, headers: { "x-cache": "error" } },
    )
  }
}

