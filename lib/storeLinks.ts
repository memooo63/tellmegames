import type { Game } from "@/components/GameCard"

export type StoreSlug = "steam" | "epic" | "ea" | "ubisoft"

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildStoreLink(game: Game, preferred?: StoreSlug): string {
  const stores = game.stores || []
  const title = encodeURIComponent(game.name)
  const slugTitle = slugifyTitle(game.name)

  const findStore = (slug: StoreSlug) =>
    stores.find((s) =>
      s.store.slug?.toLowerCase() === slug || s.store.name.toLowerCase().includes(slug),
    )

  const steamFallback = `https://store.steampowered.com/search/?term=${title}`

  const tryBuild = (entry: any, slug: StoreSlug): string | null => {
    if (!entry) return null
    switch (slug) {
      case "steam": {
        const appIdMatch = entry.url?.match(/app\/(\d+)/)
        if (appIdMatch) {
          return `https://store.steampowered.com/app/${appIdMatch[1]}/${slugTitle}/`
        }
        return steamFallback
      }
      case "epic":
        return entry.url || `https://store.epicgames.com/en-US/browse?q=${title}`
      case "ea":
        return entry.url || `https://www.ea.com/search?q=${title}`
      case "ubisoft":
        return entry.url || `https://store.ubisoft.com/search?q=${title}`
      default:
        return null
    }
  }

  if (preferred) {
    const preferredEntry = findStore(preferred)
    const link = tryBuild(preferredEntry, preferred)
    if (link) return link
  }

  const steamEntry = findStore("steam")
  const link = tryBuild(steamEntry, "steam")
  if (link) return link

  // final fallback
  return steamFallback
}
