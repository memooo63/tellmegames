"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, X, Clock } from "lucide-react"
import Image from "next/image"
import type { Game } from "./GameCard"

interface HistoryStripProps {
  onSelectGame?: (game: Game) => void
}

export function HistoryStrip({ onSelectGame }: HistoryStripProps) {
  const [history, setHistory] = useState<Game[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const savedHistory = localStorage.getItem("game-history")
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory)
        setHistory(parsedHistory)
        setIsVisible(parsedHistory.length > 0)
      } catch (error) {
        console.error("Failed to load history:", error)
      }
    }
  }, [])

  const clearHistory = () => {
    setHistory([])
    setIsVisible(false)
    localStorage.removeItem("game-history")
  }

  if (!isVisible) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="mt-8 backdrop-blur-sm bg-card/95 border-border/50">
        <CardHeader className="pb-4">
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <CardTitle className="flex items-center gap-2 text-lg">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 4,
                  ease: "easeInOut",
                }}
              >
                <Clock className="h-5 w-5 text-muted-foreground" />
              </motion.div>
              Letzte Vorschläge
            </CardTitle>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <X className="h-4 w-4 mr-1" />
                Löschen
              </Button>
            </motion.div>
          </motion.div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {history.map((game, index) => (
                <motion.div
                  key={`${game.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    duration: 0.4,
                    type: "spring",
                    stiffness: 300,
                  }}
                  className="group cursor-pointer"
                  onClick={() => onSelectGame?.(game)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="relative aspect-video rounded-lg overflow-hidden mb-2 shadow-md"
                    whileHover={{
                      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                      scale: 1.02,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={game.background_image || "/placeholder.svg?height=200&width=300&query=retro gaming"}
                      alt={game.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <motion.div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />

                    {/* Hover overlay */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1 }}
                    >
                      <motion.div
                        className="bg-white/90 backdrop-blur-sm rounded-full p-2"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <History className="h-4 w-4 text-primary" />
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <motion.h4
                    className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors duration-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {game.name}
                  </motion.h4>

                  <motion.div
                    className="flex flex-wrap gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    {game.genres.slice(0, 2).map((genre, genreIndex) => (
                      <motion.div
                        key={genre.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.8 + index * 0.1 + genreIndex * 0.05,
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function addToHistory(game: Game) {
  try {
    const savedHistory = localStorage.getItem("game-history")
    let history: Game[] = savedHistory ? JSON.parse(savedHistory) : []

    history = history.filter((h) => h.id !== game.id)
    history.unshift(game)
    history = history.slice(0, 5)

    localStorage.setItem("game-history", JSON.stringify(history))
  } catch (error) {
    console.error("Failed to save to history:", error)
  }
}
