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
  "EA App": { rawg: "8", platform_support: ["PC"] },
  "Ubisoft Store": { rawg: "13", platform_support: ["PC"] },
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
  const platformMap: Record<string, { id: string; name: string }> = {
    pc: { id: "4", name: "PC" },
    "xbox one": { id: "11", name: "Xbox One" },
    "xbox series": { id: "186", name: "Xbox Series X|S" },
    "xbox series x|s": { id: "186", name: "Xbox Series X|S" },
    ps4: { id: "18", name: "PlayStation 4" },
    "playstation 4": { id: "18", name: "PlayStation 4" },
    ps5: { id: "187", name: "PlayStation 5" },
    "playstation 5": { id: "187", name: "PlayStation 5" },
    "nintendo switch": { id: "7", name: "Nintendo Switch" },
  }

  const storeMap: Record<string, { slug: string; name: string }> = {
    steam: { slug: "steam", name: "Steam" },
    "epic games store": { slug: "epic-games", name: "Epic Games Store" },
    "epic-games": { slug: "epic-games", name: "Epic Games Store" },
    gog: { slug: "gog", name: "GOG" },
    "microsoft store": { slug: "microsoft-store", name: "Microsoft Store" },
    "microsoft-store": { slug: "microsoft-store", name: "Microsoft Store" },
    "xbox store": { slug: "microsoft-store", name: "Microsoft Store" },
    "playstation store": { slug: "playstation-store", name: "PlayStation Store" },
    "playstation-store": { slug: "playstation-store", name: "PlayStation Store" },
    "ps store": { slug: "playstation-store", name: "PlayStation Store" },
    "nintendo eshop": { slug: "nintendo", name: "Nintendo eShop" },
    nintendo: { slug: "nintendo", name: "Nintendo eShop" },
    "ea app": { slug: "ea-app", name: "EA App" },
    "ea-app": { slug: "ea-app", name: "EA App" },
    origin: { slug: "ea-app", name: "EA App" },
    "ubisoft store": { slug: "ubisoft-store", name: "Ubisoft Store" },
    "ubisoft-store": { slug: "ubisoft-store", name: "Ubisoft Store" },
    uplay: { slug: "ubisoft-store", name: "Ubisoft Store" },
  }

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
      const m = platformMap[p.toLowerCase()]
      if (m) {
        ids.push(m.id)
        filters.platforms.push(m.name)
      } else {
        console.warn("[WARN] invalid platform", p)
      }
    })
    if (ids.length > 0) api.platforms = ids.join(",")
  }

  if (q.stores) {
    const vals = String(q.stores).split(",")
    const slugs: string[] = []
    vals.forEach((s) => {
      const m = storeMap[s.toLowerCase()]
      if (m) {
        slugs.push(m.slug)
        filters.stores.push(m.name)
      } else {
        console.warn("[WARN] invalid store", s)
      }
    })
    if (slugs.length > 0) api.stores = slugs.join(",")
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
