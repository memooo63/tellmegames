// Epic Games Store API integration (fallback)
export interface EpicGame {
  id: string
  title: string
  description: string
  keyImages: Array<{
    type: string
    url: string
  }>
  price: {
    totalPrice: {
      discountPrice: number
      originalPrice: number
      voucherDiscount: number
      discount: number
      currencyCode: string
      currencyInfo: {
        decimals: number
      }
      fmtPrice: {
        originalPrice: string
        discountPrice: string
        intermediatePrice: string
      }
    }
  }
  categories: Array<{
    path: string
  }>
  tags: Array<{
    id: string
  }>
  releaseDate: string
  developer: string
  publisher: string
}

export async function searchEpicGames(params: {
  category?: string
  count?: number
  sortBy?: string
}): Promise<EpicGame[]> {
  try {
    // Epic Games Store has a public catalog API
    const searchParams = new URLSearchParams({
      locale: "de",
      country: "DE",
      allowCountries: "DE",
      count: (params.count || 20).toString(),
      sortBy: params.sortBy || "releaseDate",
      ...params,
    })

    const response = await fetch(
      `https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?${searchParams}`,
      { next: { revalidate: 900 } },
    )

    if (!response.ok) {
      throw new Error(`Epic Games API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data?.Catalog?.searchStore?.elements || []
  } catch (error) {
    console.error("Epic Games API error:", error)
    throw error
  }
}
