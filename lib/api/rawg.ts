export interface RAWGGame {
  id: number
  name: string
  background_image: string
  rating: number
  released: string
  genres: Array<{ id: number; name: string }>
  platforms: Array<{ platform: { id: number; name: string } }>
  stores: Array<{ store: { id: number; name: string } }>
  metacritic: number
  playtime: number
  short_screenshots: Array<{ image: string }>
}

export interface RAWGResponse {
  count: number
  results: RAWGGame[]
}

const RAWG_API_KEY = process.env.RAWG_API_KEY || "demo-key"
const BASE_URL = "https://api.rawg.io/api"

export async function searchGames(params: {
  platforms?: string
  genres?: string
  stores?: string
  page_size?: number
  page?: number
  ordering?: string
  search?: string
}): Promise<RAWGResponse> {
  const searchParams = new URLSearchParams({
    key: RAWG_API_KEY,
    page_size: "40",
    ...params,
  })

  try {
    const response = await fetch(`${BASE_URL}/games?${searchParams}`, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    })

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
  try {
    const response = await fetch(`${BASE_URL}/games/${id}?key=${RAWG_API_KEY}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("RAWG API error:", error)
    throw error
  }
}
