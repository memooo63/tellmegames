"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PlatformSelect } from "./PlatformSelect"
import { StoreSelect } from "./StoreSelect"
import { GenreSelect } from "./GenreSelect"
import { PriceControl } from "./PriceControl"
import { YearControl } from "./YearControl"
import { Gamepad2, Shuffle, Star, Sparkles } from "lucide-react"
import { generateSeed } from "@/lib/random"
import { useLanguage } from "@/hooks/useLanguage"
import type { Game } from "./GameCard"

export interface FilterState {
  platforms: string[]
  stores: string[]
  genres: string[]
  maxPrice: number
  freeToPlay: boolean
  onlyHighRated: boolean
  years: [number, number]
}

interface FilterBarProps {
  initialFilters?: Partial<FilterState>
  onFiltersChange?: (filters: FilterState) => void
  onGameFound?: (game: Game, seed: number, strategy?: string) => void
  onError?: (error: string) => void
  onLoading?: (loading: boolean) => void
}

export function FilterBar({ initialFilters, onFiltersChange, onGameFound, onError, onLoading }: FilterBarProps) {
  const { t } = useLanguage()

  const [filters, setFilters] = useState<FilterState>({
    platforms: [],
    stores: [],
    genres: [],
    maxPrice: 60,
    freeToPlay: false,
    onlyHighRated: false,
    years: [2000, 2025],
    ...initialFilters,
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialFilters) {
      setFilters((prev) => ({ ...prev, ...initialFilters }))
    }
  }, [initialFilters])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleFindGame = async () => {
    setIsLoading(true)
    onLoading?.(true)

    try {
      const seed = generateSeed()

      const params = new URLSearchParams()

      if (filters.platforms.length > 0) {
        params.append("platforms", filters.platforms.join(","))
      }

      if (filters.stores.length > 0) {
        params.append("stores", filters.stores.join(","))
      }

      if (filters.genres.length > 0) {
        params.append("genres", filters.genres.join(","))
      }

      if (filters.freeToPlay) {
        params.append("freeToPlay", "true")
      } else {
        params.append("maxPrice", filters.maxPrice.toString())
      }

      if (filters.years) {
        params.append("startYear", filters.years[0].toString())
        params.append("endYear", filters.years[1].toString())
      }

      if (filters.onlyHighRated) {
        params.append("onlyHighRated", "true")
      }

      params.append("seed", seed.toString())
      params.append("strategy", "balanced")

      const response = await fetch(`/api/games?${params}`)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

        if (data.error) {
          onError?.(data.error)
          return
        }

        if (!data.game) {
          onError?.(t("errors.noGames"))
          return
        }

        onGameFound?.(data.game, seed, data.strategy)
    } catch (error) {
      console.error("Game search error:", error)
      onError?.(error instanceof Error ? error.message : t("errors.apiError"))
    } finally {
      setIsLoading(false)
      onLoading?.(false)
    }
  }

  const hasFilters =
    filters.platforms.length > 0 ||
    filters.stores.length > 0 ||
    filters.genres.length > 0 ||
    filters.years[0] !== 2000 ||
    filters.years[1] !== 2025

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="p-6 space-y-6 backdrop-blur-sm bg-card/95 border-border/50">
        <motion.div
          className="flex items-center gap-2 mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          >
            <Gamepad2 className="h-5 w-5 text-primary" />
          </motion.div>
          <h2 className="text-lg font-semibold">{t("filters.title")}</h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <PlatformSelect
              value={filters.platforms}
              onChange={(platforms) => handleFilterChange("platforms", platforms)}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <StoreSelect
              value={filters.stores}
              onChange={(stores) => handleFilterChange("stores", stores)}
              selectedPlatforms={filters.platforms}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <GenreSelect value={filters.genres} onChange={(genres) => handleFilterChange("genres", genres)} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <PriceControl
              maxPrice={filters.maxPrice}
              freeToPlay={filters.freeToPlay}
              onMaxPriceChange={(price) => handleFilterChange("maxPrice", price)}
              onFreeToPlayChange={(free) => handleFilterChange("freeToPlay", free)}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <YearControl
              years={filters.years}
              onChange={(years) => handleFilterChange("years", years)}
            />
          </motion.div>
        </motion.div>

          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Switch
              id="high-rated"
              checked={filters.onlyHighRated}
              onCheckedChange={(checked) => handleFilterChange("onlyHighRated", checked)}
            />
            <Label htmlFor="high-rated" className="flex items-center gap-2 text-sm cursor-pointer">
              <motion.div
                animate={
                  filters.onlyHighRated
                    ? {
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                <Star className="h-4 w-4 text-yellow-500" />
              </motion.div>
              {t("filters.quality.label")}
            </Label>
          </motion.div>
        </motion.div>

          <motion.div
            className="flex justify-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.4 }}
          >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Button
              onClick={handleFindGame}
              disabled={isLoading || !hasFilters}
              size="lg"
              className="min-w-48 h-12 text-base font-medium relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Shuffle className="mr-2 h-4 w-4" />
                    </motion.div>
                    {t("filters.button.loading")}
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center"
                  >
                    <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Sparkles className="mr-2 h-4 w-4" />
                    </motion.div>
                    {t("filters.button.find")}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  )
}
