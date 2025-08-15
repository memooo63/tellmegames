export const PLATFORM_MAPPING = {
  PC: { rawg: "4", steam: true, epic: true, gog: true },
  "Xbox One": { rawg: "1", microsoft: true },
  "Xbox Series": { rawg: "186,187", microsoft: true },
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
