import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Slider } from "./ui/slider"
import { Button } from "./ui/button"
import type { FilterState, CombinedListing } from "../../types"
import {
  getTipologiaLabel,
  getRiscaldamentoLabel,
  getArredamentoLabel,
} from "../lib/data"

interface FiltersProps {
  listings: CombinedListing[]
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

export function Filters({ listings, filters, onFiltersChange }: FiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>(
    filters.priceRange
  )

  // Get unique values for filter options
  const tipologiaOptions = [
    ...new Set(listings.map(l => l.processed.tipologia)),
  ]
  const riscaldamentoOptions = [
    ...new Set(listings.map(l => l.processed.riscaldamento)),
  ]
  const arredamentoOptions = [
    ...new Set(listings.map(l => l.processed.livelloArredamento)),
  ]

  const maxPrice = Math.max(...listings.map(l => l.price))
  const maxDuomoDistance = Math.max(...listings.map(l => l.geo.deltaDuomo || 0))
  const maxMetroDistance = Math.max(
    ...listings.map(l =>
      l.geo.metro?.distance.value ? l.geo.metro.distance.value / 1000 : 0
    )
  )

  const handleTipologiaChange = (tipologia: string, checked: boolean) => {
    const newTipologia = checked
      ? [...filters.tipologia, tipologia]
      : filters.tipologia.filter(t => t !== tipologia)

    onFiltersChange({ ...filters, tipologia: newTipologia })
  }

  const handleRiscaldamentoChange = (
    riscaldamento: string,
    checked: boolean
  ) => {
    const newRiscaldamento = checked
      ? [...filters.riscaldamento, riscaldamento]
      : filters.riscaldamento.filter(r => r !== riscaldamento)

    onFiltersChange({ ...filters, riscaldamento: newRiscaldamento })
  }

  const handleArredamentoChange = (arredamento: string, checked: boolean) => {
    const newArredamento = checked
      ? [...filters.livelloArredamento, arredamento]
      : filters.livelloArredamento.filter(a => a !== arredamento)

    onFiltersChange({ ...filters, livelloArredamento: newArredamento })
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      tipologia: [],
      priceRange: [0, maxPrice],
      ariaCondizionata: null,
      riscaldamento: [],
      livelloArredamento: [],
      maxDuomoDistance: maxDuomoDistance,
      maxMetroDistance: maxMetroDistance,
      minPunteggio: 0,
    }
    setPriceRange(defaultFilters.priceRange)
    onFiltersChange(defaultFilters)
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Filtri
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipologia */}
        <div>
          <Label className="text-sm font-medium">Tipologia</Label>
          <div className="space-y-2 mt-2">
            {tipologiaOptions.map(tipologia => (
              <div key={tipologia} className="flex items-center space-x-2">
                <Checkbox
                  id={`tipologia-${tipologia}`}
                  checked={filters.tipologia.includes(tipologia)}
                  onCheckedChange={checked =>
                    handleTipologiaChange(tipologia, checked as boolean)
                  }
                />
                <Label htmlFor={`tipologia-${tipologia}`} className="text-sm">
                  {getTipologiaLabel(tipologia)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium">
            Prezzo: €{priceRange[0]} - €{priceRange[1]}
          </Label>
          <Slider
            value={priceRange}
            onValueChange={value => setPriceRange(value as [number, number])}
            onValueCommit={value =>
              onFiltersChange({
                ...filters,
                priceRange: value as [number, number],
              })
            }
            min={0}
            max={maxPrice}
            step={50}
            className="mt-2"
          />
        </div>

        {/* Aria Condizionata */}
        <div>
          <Label className="text-sm font-medium">Aria Condizionata</Label>
          <Select
            value={
              filters.ariaCondizionata === null
                ? "all"
                : filters.ariaCondizionata.toString()
            }
            onValueChange={value => {
              const newValue = value === "all" ? null : value === "true"
              onFiltersChange({ ...filters, ariaCondizionata: newValue })
            }}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti</SelectItem>
              <SelectItem value="true">Sì</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Riscaldamento */}
        <div>
          <Label className="text-sm font-medium">Riscaldamento</Label>
          <div className="space-y-2 mt-2">
            {riscaldamentoOptions.map(riscaldamento => (
              <div key={riscaldamento} className="flex items-center space-x-2">
                <Checkbox
                  id={`riscaldamento-${riscaldamento}`}
                  checked={filters.riscaldamento.includes(riscaldamento)}
                  onCheckedChange={checked =>
                    handleRiscaldamentoChange(riscaldamento, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`riscaldamento-${riscaldamento}`}
                  className="text-sm"
                >
                  {getRiscaldamentoLabel(riscaldamento)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Arredamento */}
        <div>
          <Label className="text-sm font-medium">Arredamento</Label>
          <div className="space-y-2 mt-2">
            {arredamentoOptions.map(arredamento => (
              <div key={arredamento} className="flex items-center space-x-2">
                <Checkbox
                  id={`arredamento-${arredamento}`}
                  checked={filters.livelloArredamento.includes(arredamento)}
                  onCheckedChange={checked =>
                    handleArredamentoChange(arredamento, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`arredamento-${arredamento}`}
                  className="text-sm"
                >
                  {getArredamentoLabel(arredamento)}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Distanza dal Duomo */}
        <div>
          <Label className="text-sm font-medium">
            Max Distanza dal Duomo: {filters.maxDuomoDistance.toFixed(1)}km
          </Label>
          <Slider
            value={[filters.maxDuomoDistance]}
            onValueChange={value =>
              onFiltersChange({ ...filters, maxDuomoDistance: value[0] })
            }
            min={0}
            max={maxDuomoDistance}
            step={0.5}
            className="mt-2"
          />
        </div>

        {/* Distanza dalla Metro */}
        <div>
          <Label className="text-sm font-medium">
            Max Distanza dalla Metro: {filters.maxMetroDistance.toFixed(1)}km
          </Label>
          <Slider
            value={[filters.maxMetroDistance]}
            onValueChange={value =>
              onFiltersChange({ ...filters, maxMetroDistance: value[0] })
            }
            min={0}
            max={maxMetroDistance}
            step={0.1}
            className="mt-2"
          />
        </div>

        {/* Punteggio Minimo */}
        <div>
          <Label className="text-sm font-medium">
            Punteggio Minimo: {filters.minPunteggio}
          </Label>
          <Slider
            value={[filters.minPunteggio]}
            onValueChange={value =>
              onFiltersChange({ ...filters, minPunteggio: value[0] })
            }
            min={0}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}
