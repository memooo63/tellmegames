export interface RAWGGame {
  id: number
  name: string
  background_image: string
  rating: number
  released: string
  genres: Array<{ id: number; name: string }>
  platforms: Array<{ platform: { id: number; name: string } }>
  stores: Array<{ store: { id: number; name: string; slug: string }; url?: string }>
  metacritic: number
  playtime: number
  short_screenshots: Array<{ image: string }>
}

export interface RAWGResponse {
  count: number
  results: RAWGGame[]
}

import Bottleneck from "bottleneck"

const RAWG_API_KEY = process.env.RAWG_KEY || ""
const API_KEY_MISSING_ERROR = "RAWG API key is not configured"
const BASE_URL = "https://api.rawg.io/api"

const REQUESTS_PER_MINUTE = Number(process.env.RAWG_RPM || 20)
const limiter = new Bottleneck({
  reservoir: REQUESTS_PER_MINUTE,
  reservoirRefreshAmount: REQUESTS_PER_MINUTE,
  reservoirRefreshInterval: 60 * 1000,
})

export async function searchGames(params: {
  platforms?: string
  genres?: string
  stores?: string
  page_size?: number
  page?: number
  ordering?: string
  search?: string
}): Promise<RAWGResponse> {
  if (!RAWG_API_KEY) {
    throw new Error(API_KEY_MISSING_ERROR)
  }

  const searchParams = new URLSearchParams({
    key: RAWG_API_KEY,
    page_size: "40",
    ...params,
  })

  try {
    const response = await limiter.schedule(() => fetch(`${BASE_URL}/games?${searchParams}`))

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("RAWG API error:", error)
    throw error
  }
}

export async function getGameDetails(id: number): Promise<RAWGGame> {
  if (!RAWG_API_KEY) {
    throw new Error(API_KEY_MISSING_ERROR)
  }

  try {
    const response = await limiter.schedule(() => fetch(`${BASE_URL}/games/${id}?key=${RAWG_API_KEY}`))

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("RAWG API error:", error)
    throw error
  }
}

export async function getGameStores(
  id: number,
): Promise<Array<{ store: { id: number; name: string; slug: string }; url?: string }>> {
  if (!RAWG_API_KEY) {
    throw new Error(API_KEY_MISSING_ERROR)
  }

  try {
    const response = await limiter.schedule(() =>
      fetch(`${BASE_URL}/games/${id}/stores?key=${RAWG_API_KEY}`),
    )

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`)
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("RAWG API error:", error)
    throw error
  }
}
