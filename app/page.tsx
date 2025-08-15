"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import { FilterBar } from "@/components/FilterBar"
import { GameCard, type Game } from "@/components/GameCard"
import { HistoryStrip, addToHistory } from "@/components/HistoryStrip"
import { ShareDialog } from "@/components/ShareDialog"
import { EmptyState } from "@/components/EmptyState"
import { ErrorState } from "@/components/ErrorState"
import { GameCardSkeleton } from "@/components/Skeletons"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/hooks/useLanguage"
import { decodeUrlState, createPermalink } from "@/lib/url-state"
import { generateSeed } from "@/lib/random"

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { t, isLoading: isLangLoading } = useLanguage()

  const [currentGame, setCurrentGame] = useState<Game | null>(null)
  const [currentSeed, setCurrentSeed] = useState<number | null>(null)
  const [currentStrategy, setCurrentStrategy] = useState<string>("balanced")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyKey, setHistoryKey] = useState(0)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  const [filters, setFilters] = useState({
    platforms: [] as string[],
    stores: [] as string[],
    genres: [] as string[],
    maxPrice: 60,
    freeToPlay: false,
    onlyHighRated: false,
  })

  useEffect(() => {
    const urlState = decodeUrlState(searchParams)

    if (Object.keys(urlState).length > 0) {
      setFilters((prev) => ({
        ...prev,
        platforms: urlState.platforms || prev.platforms,
        stores: urlState.stores || prev.stores,
        genres: urlState.genres || prev.genres,
        maxPrice: urlState.maxPrice || prev.maxPrice,
        freeToPlay: urlState.freeToPlay || prev.freeToPlay,
        onlyHighRated: urlState.onlyHighRated || prev.onlyHighRated,
      }))

      if (urlState.seed && urlState.gameId) {
        loadGameFromUrl(urlState.seed, urlState.gameId, urlState.strategy)
      }
    }
  }, [searchParams])

  const loadGameFromUrl = async (seed: number, gameId: number, strategy?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        seed: seed.toString(),
        strategy: strategy || "balanced",
      })

      if (filters.platforms.length > 0) params.append("platforms", filters.platforms.join(","))
      if (filters.stores.length > 0) params.append("stores", filters.stores.join(","))
      if (filters.genres.length > 0) params.append("genres", filters.genres.join(","))
      if (filters.freeToPlay) params.append("freeToPlay", "true")
      else params.append("maxPrice", filters.maxPrice.toString())
      if (filters.onlyHighRated) params.append("onlyHighRated", "true")

      const response = await fetch(`/api/games?${params}`)
      const data = await response.json()

      if (data.game && data.game.id === gameId) {
        setCurrentGame(data.game)
        setCurrentSeed(seed)
        setCurrentStrategy(data.strategy || strategy || "balanced")
        addToHistory(data.game)
        setHistoryKey((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Failed to load game from URL:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGameFound = (game: Game, seed: number, strategy?: string) => {
    setCurrentGame(game)
    setCurrentSeed(seed)
    setCurrentStrategy(strategy || "balanced")
    setError(null)

    addToHistory(game)
    setHistoryKey((prev) => prev + 1)

    const permalink = createPermalink(game, seed, filters, strategy)
    const url = new URL(permalink)
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setCurrentGame(null)
  }

  const handleReroll = async () => {
    if (!filters.platforms.length && !filters.stores.length && !filters.genres.length) {
      toast({
        title: t("errors.generic"),
        description: t("filters.button.noFilters"),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const seed = generateSeed()
      const params = new URLSearchParams({
        seed: seed.toString(),
        strategy: currentStrategy,
      })

      if (filters.platforms.length > 0) params.append("platforms", filters.platforms.join(","))
      if (filters.stores.length > 0) params.append("stores", filters.stores.join(","))
      if (filters.genres.length > 0) params.append("genres", filters.genres.join(","))
      if (filters.freeToPlay) params.append("freeToPlay", "true")
      else params.append("maxPrice", filters.maxPrice.toString())
      if (filters.onlyHighRated) params.append("onlyHighRated", "true")

      const response = await fetch(`/api/games?${params}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.game) {
        handleGameFound(data.game, seed, data.strategy)
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : t("errors.apiError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAlternative = async () => {
    if (!currentSeed) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        seed: (currentSeed + 1).toString(),
        strategy: currentStrategy,
      })

      if (filters.platforms.length > 0) params.append("platforms", filters.platforms.join(","))
      if (filters.stores.length > 0) params.append("stores", filters.stores.join(","))
      if (filters.genres.length > 0) params.append("genres", filters.genres.join(","))
      if (filters.freeToPlay) params.append("freeToPlay", "true")
      else params.append("maxPrice", filters.maxPrice.toString())
      if (filters.onlyHighRated) params.append("onlyHighRated", "true")

      const response = await fetch(`/api/games?${params}`)
      const data = await response.json()

      if (data.game) {
        handleGameFound(data.game, currentSeed + 1, data.strategy)
      }
    } catch (error) {
      handleError(t("errors.apiError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (game: Game, seed?: number) => {
    if (!seed) seed = currentSeed || generateSeed()

    const permalink = createPermalink(game, seed, filters, currentStrategy)
    setShareUrl(permalink)
    setShareDialogOpen(true)
  }

  const handleOpenStore = (game: Game) => {
    if (game.stores && game.stores.length > 0) {
      const store = game.stores[0].store
      let storeUrl = ""

      switch (store.name.toLowerCase()) {
        case "steam":
          storeUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`
          break
        case "epic games store":
          storeUrl = `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(game.name)}`
          break
        case "gog":
          storeUrl = `https://www.gog.com/games?search=${encodeURIComponent(game.name)}`
          break
        case "microsoft store":
          storeUrl = `https://www.microsoft.com/store/search?q=${encodeURIComponent(game.name)}`
          break
        case "playstation store":
          storeUrl = `https://store.playstation.com/search/${encodeURIComponent(game.name)}`
          break
        case "nintendo eshop":
          storeUrl = `https://www.nintendo.com/search/?q=${encodeURIComponent(game.name)}`
          break
        default:
          storeUrl = `https://www.google.com/search?q=${encodeURIComponent(game.name + " buy game")}`
      }

      window.open(storeUrl, "_blank", "noopener,noreferrer")
    }
  }

  const handleSelectFromHistory = (game: Game) => {
    setCurrentGame(game)
    setError(null)
    const newSeed = generateSeed()
    setCurrentSeed(newSeed)

    const permalink = createPermalink(game, newSeed, filters, currentStrategy)
    const url = new URL(permalink)
    router.push(url.pathname + url.search, { scroll: false })
  }

  const handleRetry = () => {
    setError(null)
  }

  if (isLangLoading) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div
          className="container mx-auto px-4 py-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t("nav.title")} – {t("nav.subtitle")}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {t("empty.description")}
          </motion.p>
        </motion.div>

        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-2 h-2 bg-primary/20 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-32 right-20 w-3 h-3 bg-primary/30 rounded-full"
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.9, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <FilterBar
          initialFilters={filters}
          onFiltersChange={setFilters}
          onGameFound={handleGameFound}
          onError={handleError}
          onLoading={setIsLoading}
        />

        <motion.div className="mt-8" layout>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GameCardSkeleton />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ErrorState message={error} onRetry={handleRetry} />
              </motion.div>
            ) : currentGame ? (
              <GameCard
                key={currentGame.id}
                game={currentGame}
                seed={currentSeed || undefined}
                strategy={currentStrategy}
                onReroll={handleReroll}
                onAlternative={handleAlternative}
                onShare={handleShare}
                onOpenStore={handleOpenStore}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <EmptyState />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <HistoryStrip key={historyKey} onSelectGame={handleSelectFromHistory} />
      </main>

      {/* Footer */}
      <motion.footer
        className="border-t mt-16 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <motion.p
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            {t("footer.disclaimer")}
          </motion.p>
          <motion.div
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <motion.a
              href="/legal/imprint"
              className="hover:text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("footer.legal.imprint")}
            </motion.a>
            <motion.a
              href="/legal/privacy"
              className="hover:text-foreground transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t("footer.legal.privacy")}
            </motion.a>
          </motion.div>
        </div>
      </motion.footer>

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} game={currentGame!} shareUrl={shareUrl} />
    </div>
  )
}
