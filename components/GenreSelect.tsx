"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tag, ChevronDown } from "lucide-react"
import { GENRE_MAPPING, type Genre } from "@/lib/mapping"

interface GenreSelectProps {
  value: string[]
  onChange: (genres: string[]) => void
}

export function GenreSelect({ value, onChange }: GenreSelectProps) {
  const [open, setOpen] = useState(false)

  const genres = Object.keys(GENRE_MAPPING) as Genre[]

  const handleToggle = (genre: string) => {
    const newValue = value.includes(genre) ? value.filter((g) => g !== genre) : [...value, genre]
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Genre</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-10 bg-transparent">
            <span className="truncate">{value.length === 0 ? "Genre wählen" : `${value.length} ausgewählt`}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 max-h-80 overflow-y-auto">
          <div className="space-y-3">
            {genres.map((genre) => (
              <div key={genre} className="flex items-center space-x-2">
                <Checkbox id={genre} checked={value.includes(genre)} onCheckedChange={() => handleToggle(genre)} />
                <label htmlFor={genre} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Tag className="h-4 w-4" />
                  {genre}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((genre) => (
            <Badge key={genre} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
