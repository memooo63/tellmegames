export const PLATFORM_MAPPING = {
  PC: { rawg: "4", steam: true, epic: true, gog: true },
  "Xbox One": { rawg: "11", microsoft: true },
  "Xbox Series": { rawg: "186", microsoft: true },
  "PlayStation 4": { rawg: "18", playstation: true },
  "PlayStation 5": { rawg: "187", playstation: true },
  "Nintendo Switch": { rawg: "7", nintendo: true },
} as const

export const STORE_MAPPING = {
  Steam: { rawg: "1", platform_support: ["PC"] },
  "Epic Games Store": { rawg: "11", platform_support: ["PC"] },
  GOG: { rawg: "5", platform_support: ["PC"] },
  "Microsoft Store": { rawg: "3", platform_support: ["PC", "Xbox One", "Xbox Series"] },
  "PlayStation Store": { rawg: "2", platform_support: ["PlayStation 4", "PlayStation 5"] },
  "Nintendo eShop": { rawg: "6", platform_support: ["Nintendo Switch"] },
} as const

export const GENRE_MAPPING = {
  Action: { rawg: "4" },
  Adventure: { rawg: "3" },
  RPG: { rawg: "5" },
  Shooter: { rawg: "2" },
  Strategy: { rawg: "10" },
  Simulation: { rawg: "14" },
  Sports: { rawg: "15" },
  Racing: { rawg: "1" },
  Indie: { rawg: "51" },
  Puzzle: { rawg: "7" },
  Horror: { rawg: "19" },
  Casual: { rawg: "40" },
  Platformer: { rawg: "83" },
} as const

export type Platform = keyof typeof PLATFORM_MAPPING
export type Store = keyof typeof STORE_MAPPING
export type Genre = keyof typeof GENRE_MAPPING

export function getCompatibleStores(platform: Platform): Store[] {
  return Object.entries(STORE_MAPPING)
    .filter(([_, config]) => config.platform_support.includes(platform))
    .map(([store]) => store as Store)
}

export function getRawgPlatformIds(platforms: Platform[]): string {
  return platforms.map((platform) => PLATFORM_MAPPING[platform].rawg).join(",")
}

export function getRawgStoreIds(stores: Store[]): string {
  return stores.map((store) => STORE_MAPPING[store].rawg).join(",")
}

export function getRawgGenreIds(genres: Genre[]): string {
  return genres.map((genre) => GENRE_MAPPING[genre].rawg).join(",")
}

export function validateAndMapParams(q: Record<string, any>) {
  const platformMap: Record<string, string> = {
    PC: "4",
    "Xbox One": "11",
    "Xbox Series X|S": "186",
    "PS4": "18",
    "PS5": "187",
  }

  const allowedStores = [
    "steam",
    "epic-games",
    "gog",
    "playstation-store",
    "microsoft-store",
    "ea-app",
    "ubisoft-store",
    "nintendo",
  ]

  const genreMap: Record<string, string> = {}
  Object.entries(GENRE_MAPPING).forEach(([name, { rawg }]) => {
    genreMap[name.toLowerCase()] = rawg
  })

  const api: Record<string, any> = {}
  const filters: Record<string, any> = {
    platforms: [] as string[],
    stores: [] as string[],
    genres: [] as string[],
    priceMax: undefined as number | undefined,
    dates: undefined as string | undefined,
  }

  if (q.platforms) {
    const vals = String(q.platforms).split(",")
    const ids: string[] = []
    vals.forEach((p) => {
      const id = platformMap[p]
      if (id) {
        ids.push(id)
        filters.platforms.push(p)
      } else {
        console.warn("[WARN] invalid platform", p)
      }
    })
    if (ids.length > 0) api.platforms = ids.join(",")
  }

  if (q.stores) {
    const vals = String(q.stores).split(",")
    const valid = vals.filter((s) => {
      const ok = allowedStores.includes(s)
      if (!ok) console.warn("[WARN] invalid store", s)
      return ok
    })
    if (valid.length > 0) {
      api.stores = valid.join(",")
      filters.stores = valid
    }
  }

  if (q.genres) {
    const vals = String(q.genres).split(",")
    const ids: string[] = []
    vals.forEach((g) => {
      const id = genreMap[g.toLowerCase()]
      if (id) {
        ids.push(id)
        filters.genres.push(g)
      } else {
        console.warn("[WARN] invalid genre", g)
      }
    })
    if (ids.length > 0) api.genres = ids.join(",")
  }

  if (q.startYear && q.endYear) {
    filters.dates = `${q.startYear}-01-01,${q.endYear}-12-31`
    api.dates = filters.dates
  }

  if (q.maxPrice) {
    const price = Math.min(Number.parseFloat(q.maxPrice), 125)
    if (!Number.isNaN(price)) {
      filters.priceMax = price
      api.priceMax = price
    }
  }

  if (q.freeToPlay === "true") {
    api.tags = "free-to-play"
  }

  return { api, filters }
}
