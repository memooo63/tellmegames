"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingBag, ChevronDown } from "lucide-react"
import { STORE_MAPPING, getCompatibleStores, type Store } from "@/lib/mapping"

interface StoreSelectProps {
  value: string[]
  onChange: (stores: string[]) => void
  selectedPlatforms: string[]
}

export function StoreSelect({ value, onChange, selectedPlatforms }: StoreSelectProps) {
  const [open, setOpen] = useState(false)
  const [availableStores, setAvailableStores] = useState<Store[]>(Object.keys(STORE_MAPPING) as Store[])

  useEffect(() => {
    if (selectedPlatforms.length === 0) {
      setAvailableStores(Object.keys(STORE_MAPPING) as Store[])
    } else {
      const compatible = selectedPlatforms.flatMap((platform) => getCompatibleStores(platform as any))
      setAvailableStores([...new Set(compatible)])

      // Remove incompatible stores from selection
      const filteredValue = value.filter((store) => compatible.includes(store as Store))
      if (filteredValue.length !== value.length) {
        onChange(filteredValue)
      }
    }
  }, [selectedPlatforms, value, onChange])

  const handleToggle = (store: string) => {
    const newValue = value.includes(store) ? value.filter((s) => s !== store) : [...value, store]
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Store</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between h-10 bg-transparent">
            <span className="truncate">{value.length === 0 ? "Store wählen" : `${value.length} ausgewählt`}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            {availableStores.map((store) => (
              <div key={store} className="flex items-center space-x-2">
                <Checkbox id={store} checked={value.includes(store)} onCheckedChange={() => handleToggle(store)} />
                <label htmlFor={store} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <ShoppingBag className="h-4 w-4" />
                  {store}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((store) => (
            <Badge key={store} variant="secondary" className="text-xs">
              {store}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
