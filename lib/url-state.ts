import { encodeSeed, decodeSeed } from "./random"

export interface UrlState {
  platforms: string[]
  stores: string[]
  genres: string[]
  maxPrice: number
  freeToPlay: boolean
  onlyHighRated: boolean
  years: [number, number]
  seed?: number
  gameId?: number
  strategy?: string
}

export function encodeUrlState(state: UrlState): string {
  const params = new URLSearchParams()

  if (state.platforms.length > 0) {
    params.set("p", state.platforms.join(","))
  }

  if (state.stores.length > 0) {
    params.set("s", state.stores.join(","))
  }

  if (state.genres.length > 0) {
    params.set("g", state.genres.join(","))
  }

  if (state.maxPrice !== 60) {
    params.set("mp", state.maxPrice.toString())
  }

  if (state.freeToPlay) {
    params.set("f", "1")
  }

  if (state.onlyHighRated) {
    params.set("hr", "1")
  }

  if (state.years && (state.years[0] !== 2000 || state.years[1] !== 2025)) {
    params.set("ys", state.years[0].toString())
    params.set("ye", state.years[1].toString())
  }

  if (state.seed) {
    params.set("seed", encodeSeed(state.seed))
  }

  if (state.gameId) {
    params.set("game", state.gameId.toString())
  }

  if (state.strategy && state.strategy !== "balanced") {
    params.set("st", state.strategy)
  }

  return params.toString()
}

export function decodeUrlState(searchParams: URLSearchParams): Partial<UrlState> {
  const state: Partial<UrlState> = {}

  const platforms = searchParams.get("p")
  if (platforms) {
    state.platforms = platforms.split(",").filter(Boolean)
  }

  const stores = searchParams.get("s")
  if (stores) {
    state.stores = stores.split(",").filter(Boolean)
  }

  const genres = searchParams.get("g")
  if (genres) {
    state.genres = genres.split(",").filter(Boolean)
  }

  const maxPrice = searchParams.get("mp")
  if (maxPrice) {
    state.maxPrice = Number.parseInt(maxPrice, 10)
  }

  if (searchParams.get("f") === "1") {
    state.freeToPlay = true
  }

  if (searchParams.get("hr") === "1") {
    state.onlyHighRated = true
  }

  const ys = searchParams.get("ys")
  const ye = searchParams.get("ye")
  if (ys && ye) {
    state.years = [Number.parseInt(ys, 10), Number.parseInt(ye, 10)]
  }

  const seed = searchParams.get("seed")
  if (seed) {
    state.seed = decodeSeed(seed)
  }

  const gameId = searchParams.get("game")
  if (gameId) {
    state.gameId = Number.parseInt(gameId, 10)
  }

  const strategy = searchParams.get("st")
  if (strategy) {
    state.strategy = strategy
  }

  return state
}

export function createShareableUrl(baseUrl: string, state: UrlState): string {
  const params = encodeUrlState(state)
  return params ? `${baseUrl}?${params}` : baseUrl
}

export function createPermalink(game: any, seed: number, filters: any, strategy?: string): string {
  const state: UrlState = {
    ...filters,
    seed,
    gameId: game.id,
    strategy,
  }

  return createShareableUrl(window.location.origin, state)
}
