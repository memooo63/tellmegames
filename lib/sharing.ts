export interface ShareData {
  title: string
  text: string
  url: string
}

export async function shareGame(game: any, url: string): Promise<boolean> {
  if (!game) {
    console.error("Cannot share: game is null or undefined")
    return false
  }

  const shareData: ShareData = {
    title: `${game.name} - Zufälliger Spielvorschlag`,
    text: `Schau dir diesen Spielvorschlag an: ${game.name}`,
    url,
  }

  // Try native sharing first (mobile devices)
  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData)
      return true
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Native sharing failed:", error)
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch (error) {
    console.error("Clipboard sharing failed:", error)
  }

  return false
}

export function generateShareText(game: any, strategy?: string): string {
  if (!game) {
    return "🎮 Zufälliger Spielvorschlag\n\nGefunden mit dem Zufalls-Spielfinder!"
  }

  const strategyText = strategy ? ` (${strategy})` : ""
  const rating = game.rating && typeof game.rating === "number" ? ` ⭐ ${game.rating.toFixed(1)}` : ""
  const year = game.released ? ` (${new Date(game.released).getFullYear()})` : ""
  const gameName = game.name || "Unbekanntes Spiel"

  return `🎮 ${gameName}${year}${rating}${strategyText}\n\nGefunden mit dem Zufalls-Spielfinder!`
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      return true
    } catch (fallbackError) {
      console.error("Clipboard fallback failed:", fallbackError)
      return false
    }
  }
}
