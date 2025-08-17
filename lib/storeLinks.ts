export type StoreSlug = "steam"|"epic-games"|"gog"|"playstation-store"|"xbox-store"|"nintendo"|"ea-app"|"ubisoft-store"|"microsoft-store";

export type GameStore = { store:{slug?:string,name:string}, url?:string|null }
export function buildStoreLink(title:string, stores?:GameStore[], preferred?:StoreSlug, steamAppId?:number){
  const q = encodeURIComponent(title)
  const toSlug = (s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$|/g,"")
  const find = (s?:StoreSlug)=>stores?.find(x => normalizeSlug(x.store.slug??toSlug(x.store.name))===s)
  const id = steamAppId || extractSteamAppId(stores)
  let usedFallback = false
  if ((preferred==="steam" || (!preferred && id)) && id) {
    return { url: `https://store.steampowered.com/app/${id}/${slugify(title)}/`, usedFallback }
  }
  const s = preferred && find(preferred) || stores?.find(x=>x.url)
  if (s?.url) return { url: s.url, usedFallback }
  if (preferred) {
    usedFallback = true
    return { url: search(preferred,q), usedFallback }
  }
  if (id) return { url: `https://store.steampowered.com/app/${id}/${slugify(title)}/`, usedFallback }
  usedFallback = true
  return { url: search("steam",q), usedFallback }

  function extractSteamAppId(arr?:GameStore[]){
    const u = arr?.find(x=>normalizeSlug(x.store.slug??toSlug(x.store.name))==="steam")?.url || ""
    const m = u.match(/\/app\/(\d+)/); return m?Number(m[1]):undefined
  }
  function normalizeSlug(x:string):StoreSlug {
    if (x==="xbox-store"||x==="microsoft-store") return "microsoft-store"
    if (x==="epic-games-store") return "epic-games"
    return x as StoreSlug
  }
  function search(slug:StoreSlug,q:string){
    switch(slug){
      case "steam": return `https://store.steampowered.com/search/?term=${q}`
      case "epic-games": return `https://store.epicgames.com/en-US/browse?q=${q}`
      case "gog": return `https://www.gog.com/en/games?query=${q}`
      case "playstation-store": return `https://store.playstation.com/en-us/search/${q}`
      case "microsoft-store": return `https://www.xbox.com/en-US/search?q=${q}`
      case "nintendo": return `https://www.nintendo.com/search/#q=${q}`
      case "ea-app": return `https://www.ea.com/search?q=${q}`
      case "ubisoft-store": return `https://store.ubisoft.com/search?q=${q}`
    }
  }
  function slugify(s:string){return s.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"")}
}
