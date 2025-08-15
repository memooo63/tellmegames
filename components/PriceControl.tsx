"use client"

import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Euro } from "lucide-react"

interface PriceControlProps {
  maxPrice: number
  freeToPlay: boolean
  onMaxPriceChange: (price: number) => void
  onFreeToPlayChange: (free: boolean) => void
}

export function PriceControl({ maxPrice, freeToPlay, onMaxPriceChange, onFreeToPlayChange }: PriceControlProps) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-muted-foreground">Preis</label>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="free-to-play" checked={freeToPlay} onCheckedChange={onFreeToPlayChange} />
          <Label htmlFor="free-to-play" className="text-sm">
            Nur Free-to-Play
          </Label>
        </div>

        {!freeToPlay && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Maximaler Preis</span>
              <div className="flex items-center gap-1">
                <Euro className="h-4 w-4" />
                <span className="text-sm font-medium">{maxPrice}</span>
              </div>
            </div>
            <Slider
              value={[maxPrice]}
              onValueChange={(value) => onMaxPriceChange(value[0])}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}
