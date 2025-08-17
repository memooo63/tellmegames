import { type NextRequest, NextResponse } from "next/server"
import { getGameStores } from "@/lib/api/rawg"
import { LRUCache } from "lru-cache"
import { validateAndMapParams } from "@/lib/mapping"
import { isPriceInRange } from "@/lib/price"
import fallbackGames from "@/data/games-fallback.json"
import crypto from "crypto"

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

async function fetchRawg(params: any, rid: string, trace: (p: string, e?: any) => void) {
  const firstParams = { ...params, page_size: 40, ordering: "-rating,-metacritic", page: 1 }
  const url1 = `https://api.rawg.io/api/games?${new URLSearchParams({
    key: process.env.RAWG_KEY || "",
    ...firstParams,
  })}`
  trace(`[${rid}] RAWG request`, { url: url1, page: 1, page_size: 40, filters: params })
  const res1 = await fetch(url1)
  const data1 = await res1.json().catch(() => ({}))
  trace(`[${rid}] RAWG response`, {
    status: res1.status,
    count: data1?.count,
    results: data1?.results?.length,
  })
  let games = data1.results || []
  if (games.length < 10) {
    const secondParams = { ...params, page_size: 40, ordering: "-rating,-metacritic", page: 2 }
    const url2 = `https://api.rawg.io/api/games?${new URLSearchParams({
      key: process.env.RAWG_KEY || "",
      ...secondParams,
    })}`
    trace(`[${rid}] RAWG request`, { url: url2, page: 2, page_size: 40, filters: params })
    const res2 = await fetch(url2)
    const data2 = await res2.json().catch(() => ({}))
    trace(`[${rid}] RAWG response`, {
      status: res2.status,
      count: data2?.count,
      results: data2?.results?.length,
    })
    games = [...games, ...(data2.results || [])]
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

async function enrichSteamIds(games: any[], rid: string, trace: (p: string, e?: any) => void) {
  await Promise.all(
    games.map(async (g) => {
      const steamStore = g.stores?.find((s: any) => s.store?.slug === "steam")
      if (steamStore) {
        const match = steamStore.url?.match(/\/app\/(\d+)/)
        if (match) {
          g.steamAppId = Number(match[1])
        } else {
          trace(`[${rid}] steam resolve`, { id: g.id })
          try {
            const details = await getGameStores(g.id)
            const steam = details.find((s: any) => s.store?.slug === "steam")
            if (steam?.url) {
              trace(`[${rid}] steam hit`, { id: g.id })
              steamStore.url = steam.url
              const m = steam.url.match(/\/app\/(\d+)/)
              if (m) g.steamAppId = Number(m[1])
            } else {
              trace(`[${rid}] steam miss`, { id: g.id })
            }
          } catch {
            trace(`[${rid}] steam fail`, { id: g.id })
          }
        }
      }
    }),
  )
}

export async function GET(req: NextRequest) {
  const T0 = Date.now()
  const trace = (prefix: string, extra?: any) =>
    console.log(`[TRACE] ${prefix} t+${Date.now() - T0}ms`, extra ?? "")
  const rid = crypto.randomUUID()

  trace(`[${rid}] RAWG_KEY ${process.env.RAWG_KEY ? "present" : "MISSING"}`)

  const q = Object.fromEntries(req.nextUrl.searchParams.entries())
  trace(`[${rid}] IN params`, q)
  const { api, filters } = validateAndMapParams(q)
  trace(`[${rid}] map`, {
    platforms: api.platforms,
    stores: api.stores,
    genres: api.genres,
    dates: api.dates,
    priceMax: api.priceMax,
  })

  const cacheKey = keyFromObj(req.nextUrl.searchParams)

  try {
    let storeFilterActive = Boolean(api.stores)
    let games = await fetchRawg(api, rid, trace)
    if (games.length === 0 && api.stores) {
      trace(`[${rid}] retry without store filter`)
      const paramsNoStore = { ...api }
      delete paramsNoStore.stores
      games = await fetchRawg(paramsNoStore, rid, trace)
      storeFilterActive = false
    }
    if (games.length < 10) {
      games = [...games, ...fallbackGames]
    }

    let filteredGames = filterGames(games, {
      platforms: filters.platforms,
      stores: storeFilterActive ? filters.stores : [],
      genres: filters.genres,
      maxPrice: filters.priceMax,
      freeToPlay: q.freeToPlay === "true",
      onlyHighRated: q.onlyHighRated === "true",
      minRating: 3.0,
    })

    if (filteredGames.length === 0 && q.freeToPlay === "true") {
      const retryParams = { ...api }
      delete retryParams.genres
      delete retryParams.priceMax
      let retryGames = await fetchRawg(retryParams, rid, trace)
      if (retryGames.length < 10) {
        retryGames = [...retryGames, ...fallbackGames]
      }
      filteredGames = filterGames(retryGames, {
        platforms: filters.platforms,
        stores: storeFilterActive ? filters.stores : [],
        genres: [],
        maxPrice: undefined,
        freeToPlay: true,
        onlyHighRated: q.onlyHighRated === "true",
        minRating: 3.0,
      })
    }

    if (filteredGames.length === 0) {
      return NextResponse.json(
        { error: "Keine Spiele gefunden. Versuche weniger spezifische Filter.", games: [], total: 0, fallback: false },
        { headers: { "x-trace-id": rid } },
      )
    }

    await enrichSteamIds(filteredGames, rid, trace)

    memoryCache.set(cacheKey, { games: filteredGames, fallback: false })
    if (redis) {
      redis.set(cacheKey, JSON.stringify({ games: filteredGames, fallback: false }), "EX", 900).catch(() => {})
    }

    return NextResponse.json(
      { games: filteredGames, total: filteredGames.length, fallback: false },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
          "x-cache": "live",
          "x-trace-id": rid,
        },
      },
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
        {
          headers: {
            "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
            "x-cache": "fallback",
            "x-trace-id": rid,
          },
        },
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
        {
          headers: {
            "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
            "x-cache": "cache",
            "x-trace-id": rid,
          },
        },
      )
    }

    console.error("Games API error:", error)
    return NextResponse.json(
      { error: "Fehler beim Laden der Spiele. Bitte versuche es später erneut.", games: [], total: 0 },
      { status: 500, headers: { "x-cache": "error", "x-trace-id": rid } },
    )
  }
}

