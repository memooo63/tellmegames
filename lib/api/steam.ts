// Steam Web API integration (fallback)
export interface SteamGame {
  appid: number
  name: string
  header_image: string
  short_description: string
  price_overview?: {
    currency: string
    initial: number
    final: number
    discount_percent: number
    initial_formatted: string
    final_formatted: string
  }
  genres?: Array<{ id: string; description: string }>
  categories?: Array<{ id: number; description: string }>
  release_date?: {
    coming_soon: boolean
    date: string
  }
  metacritic?: {
    score: number
    url: string
  }
}

const STEAM_API_KEY = process.env.STEAM_API_KEY

export async function searchSteamGames(query: string): Promise<SteamGame[]> {
  if (!STEAM_API_KEY) {
    throw new Error("Steam API key not configured")
  }

  try {
    // Note: Steam's search API is limited, this is a simplified implementation
    const response = await fetch(
      `https://api.steampowered.com/ISteamApps/GetAppList/v2/?key=${STEAM_API_KEY}&format=json`,
      { next: { revalidate: 3600 } },
    )

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`)
    }

    const data = await response.json()

    // This would need more sophisticated filtering in a real implementation
    return data.applist?.apps?.slice(0, 20) || []
  } catch (error) {
    console.error("Steam API error:", error)
    throw error
  }
}

export async function getSteamGameDetails(appId: number): Promise<SteamGame> {
  if (!STEAM_API_KEY) {
    throw new Error("Steam API key not configured")
  }

  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&key=${STEAM_API_KEY}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`)
    }

    const data = await response.json()
    return data[appId]?.data
  } catch (error) {
    console.error("Steam API error:", error)
    throw error
  }
}
