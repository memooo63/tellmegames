export type StoreSlug = "steam" | "epic" | "ea" | "ubisoft"

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildStoreLink(
  title: string,
  stores: Array<{ store: { slug?: string; name: string }; url?: string }> = [],
  preferredStore?: StoreSlug,
): string {
  const encodedTitle = encodeURIComponent(title)
  const slugTitle = slugifyTitle(title)

  const findStore = (slug: StoreSlug) =>
    stores.find((s) =>
      s.store.slug?.toLowerCase() === slug || s.store.name.toLowerCase().includes(slug),
    )

  const buildLink = (slug: StoreSlug, entry?: any): string => {
    switch (slug) {
      case "steam": {
        const appIdMatch = entry?.url?.match(/app\/(\d+)/)
        if (appIdMatch) {
          return `https://store.steampowered.com/app/${appIdMatch[1]}/${slugTitle}/`
        }
        return `https://store.steampowered.com/search/?term=${encodedTitle}`
      }
      case "epic":
        return entry?.url || `https://store.epicgames.com/en-US/browse?q=${encodedTitle}`
      case "ea":
        return entry?.url || `https://www.ea.com/search?q=${encodedTitle}`
      case "ubisoft":
        return entry?.url || `https://store.ubisoft.com/search?q=${encodedTitle}`
      default:
        return `https://store.steampowered.com/search/?term=${encodedTitle}`
    }
  }

  if (preferredStore) {
    const entry = findStore(preferredStore)
    return buildLink(preferredStore, entry)
  }

  for (const slug of ["steam", "epic", "ea", "ubisoft"] as StoreSlug[]) {
    const entry = findStore(slug)
    if (entry) {
      return buildLink(slug, entry)
    }
  }

  return buildLink("steam")
}
