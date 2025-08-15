"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Monitor, Gamepad2, ChevronDown } from "lucide-react"
import { PLATFORM_MAPPING, type Platform } from "@/lib/mapping"

interface PlatformSelectProps {
  value: string[]
  onChange: (platforms: string[]) => void
}

export function PlatformSelect({ value, onChange }: PlatformSelectProps) {
  const [open, setOpen] = useState(false)

  const platforms = Object.keys(PLATFORM_MAPPING) as Platform[]

  const handleToggle = (platform: string) => {
    const newValue = value.includes(platform) ? value.filter((p) => p !== platform) : [...value, platform]
    onChange(newValue)
  }

  const getIcon = (platform: Platform) => {
    if (platform === "PC") return <Monitor className="h-4 w-4" />
    return <Gamepad2 className="h-4 w-4" />
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Spielestation</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-10 bg-transparent">
            <span className="truncate">{value.length === 0 ? "Plattform wählen" : `${value.length} ausgewählt`}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform} className="flex items-center space-x-2">
                <Checkbox
                  id={platform}
                  checked={value.includes(platform)}
                  onCheckedChange={() => handleToggle(platform)}
                />
                <label htmlFor={platform} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  {getIcon(platform)}
                  {platform}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((platform) => (
            <Badge key={platform} variant="secondary" className="text-xs">
              {platform}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
