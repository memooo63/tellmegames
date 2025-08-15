"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Star, Calendar, ExternalLink, Shuffle, Share2, Dice6 } from "lucide-react"
import { useLanguage } from "@/hooks/useLanguage"
import Image from "next/image"

export interface Game {
  id: number
  name: string
  background_image: string
  rating: number
  released: string
  genres: Array<{ id: number; name: string }>
  platforms: Array<{ platform: { id: number; name: string } }>
  stores: Array<{ store: { id: number; name: string } }>
  metacritic?: number
  price?: number
  currency?: string
  free_to_play?: boolean
  weight?: number
}

interface GameCardProps {
  game: Game
  seed?: number
  strategy?: string
  onReroll?: () => void
  onAlternative?: () => void
  onShare?: (game: Game, seed?: number) => void
  onOpenStore?: (game: Game) => void
}

export function GameCard({ game, seed, strategy, onReroll, onAlternative, onShare, onOpenStore }: GameCardProps) {
  const { t, language } = useLanguage()
  const [isSharing, setIsSharing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const formatPrice = (price?: number, currency = "EUR") => {
    if (!price || price === 0) return t("game.price.free")

    const locale =
      language === "en"
        ? "en-US"
        : language === "fr"
          ? "fr-FR"
          : language === "es"
            ? "es-ES"
            : language === "tr"
              ? "tr-TR"
              : "de-DE"
    const currencyCode = language === "en" ? "USD" : language === "tr" ? "TRY" : "EUR"

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(price)
  }

  const formatReleaseYear = (dateString: string) => {
    return new Date(dateString).getFullYear()
  }

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await onShare?.(game, seed)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.6,
      }}
      layout
    >
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-video overflow-hidden">
          <AnimatePresence>
            {!imageLoaded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-muted animate-pulse"
              />
            )}
          </AnimatePresence>

          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{
              scale: imageLoaded ? 1 : 1.1,
              opacity: imageLoaded ? 1 : 0,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Image
              src={game.background_image || "/placeholder.svg?height=400&width=600&query=gaming"}
              alt={game.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <motion.div
            className="absolute bottom-4 left-4 right-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.h3
              className="text-xl font-bold text-white mb-2 line-clamp-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {game.name}
            </motion.h3>

            <motion.div
              className="flex items-center gap-4 text-white/90 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {game.rating > 0 && (
                <motion.div
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{game.rating.toFixed(1)}</span>
                </motion.div>
              )}
              {game.metacritic && (
                <motion.div
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="text-xs">MC:</span>
                  <span>{game.metacritic}</span>
                </motion.div>
              )}
              <motion.div
                className="flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Calendar className="h-4 w-4" />
                <span>{formatReleaseYear(game.released)}</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {strategy && (
            <motion.div
              className="absolute top-4 right-4"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="bg-black/50 text-white border-white/20 backdrop-blur-sm">
                      <Dice6 className="h-3 w-3 mr-1" />
                      {strategy}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("game.tooltips.strategy").replace("{{strategy}}", strategy)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </div>

        <CardContent className="p-6 space-y-4">
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {game.genres.slice(0, 3).map((genre, index) => (
              <motion.div
                key={genre.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.7 + index * 0.1,
                  type: "spring",
                  stiffness: 300,
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Badge variant="secondary" className="text-xs">
                  {genre.name}
                </Badge>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <p className="text-sm text-muted-foreground mb-2">{t("game.availableOn")}</p>
            <div className="flex flex-wrap gap-1">
              {game.platforms.slice(0, 4).map((platform, index) => (
                <motion.div
                  key={platform.platform.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.9 + index * 0.05,
                    type: "spring",
                    stiffness: 300,
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="outline" className="text-xs">
                    {platform.platform.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.3 }}>
            <Separator />
          </motion.div>

          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
              <p className="text-lg font-semibold">
                {game.free_to_play ? t("game.price.freeToPlay") : formatPrice(game.price, game.currency)}
              </p>
            </motion.div>

            <div className="flex gap-2">
              {onAlternative && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Button variant="outline" size="sm" onClick={onAlternative}>
                          <Dice6 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("game.tooltips.alternative")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onShare && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Button variant="outline" size="sm" onClick={handleShare} disabled={isSharing}>
                          <motion.div
                            animate={isSharing ? { rotate: 360 } : { rotate: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                          >
                            <Share2 className="h-4 w-4" />
                          </motion.div>
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("game.tooltips.share")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {onReroll && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Button variant="outline" size="sm" onClick={onReroll}>
                    <Shuffle className="h-4 w-4 mr-1" />
                    {t("game.actions.reroll")}
                  </Button>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button size="sm" onClick={() => onOpenStore?.(game)}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  {t("game.actions.openStore")}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
