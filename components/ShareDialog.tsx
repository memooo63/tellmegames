"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Copy, Share2, Link, MessageCircle, Mail, Check } from "lucide-react"
import { generateShareText, copyToClipboard } from "@/lib/sharing"
import type { Game } from "./GameCard"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: Game | null
  shareUrl: string
}

export function ShareDialog({ open, onOpenChange, game, shareUrl }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareText = generateShareText(game)

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(shareUrl)
    if (success) {
      setCopied(true)
      toast({
        title: "Link kopiert!",
        description: "Der Link wurde in die Zwischenablage kopiert.",
      })
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast({
        title: "Fehler",
        description: "Link konnte nicht kopiert werden.",
        variant: "destructive",
      })
    }
  }

  const handleCopyText = async () => {
    const success = await copyToClipboard(`${shareText}\n\n${shareUrl}`)
    if (success) {
      toast({
        title: "Text kopiert!",
        description: "Der Teilen-Text wurde in die Zwischenablage kopiert.",
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${game?.name || "Spielvorschlag"} - Spielvorschlag`,
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Native sharing failed:", error)
        }
      }
    }
  }

  const openWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n\n${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  const openEmail = () => {
    const subject = encodeURIComponent(`Spielvorschlag: ${game?.name || "Zufälliger Spielvorschlag"}`)
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Share2 className="h-5 w-5" />
            </motion.div>
            Spiel teilen
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Game Info */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="text-center p-4 bg-muted rounded-lg"
          >
            <h3 className="font-semibold">{game?.name || "Unbekanntes Spiel"}</h3>
            <p className="text-sm text-muted-foreground">
              {game?.genres
                ?.slice(0, 2)
                ?.map((g) => g.name)
                ?.join(", ") || "Keine Genres verfügbar"}
            </p>
          </motion.div>

          {/* Share URL */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="share-url">Link</Label>
            <div className="flex gap-2">
              <Input id="share-url" value={shareUrl} readOnly className="font-mono text-sm" />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleCopyUrl} size="sm" variant="outline">
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="ml-2">{copied ? "Kopiert!" : "Kopieren"}</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Share Text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-2"
          >
            <Label htmlFor="share-text">Nachricht</Label>
            <Textarea id="share-text" value={shareText} readOnly rows={3} className="text-sm" />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleCopyText} size="sm" variant="outline" className="w-full bg-transparent">
                <Copy className="h-4 w-4 mr-2" />
                Text kopieren
              </Button>
            </motion.div>
          </motion.div>

          <Separator />

          {/* Share Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="space-y-2"
          >
            <Label>Teilen über</Label>
            <div className="grid grid-cols-2 gap-2">
              {navigator.share && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleNativeShare} variant="outline" size="sm" className="w-full bg-transparent">
                    <Share2 className="h-4 w-4 mr-2" />
                    System
                  </Button>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={openWhatsApp} variant="outline" size="sm" className="w-full bg-transparent">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={openEmail} variant="outline" size="sm" className="w-full bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  E-Mail
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleCopyUrl} variant="outline" size="sm" className="w-full bg-transparent">
                  <Link className="h-4 w-4 mr-2" />
                  Link
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
