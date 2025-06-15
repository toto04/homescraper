import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Button } from "./ui/button"
import { ArrowUp, ArrowDown } from "lucide-react"
import type { SortField, SortDirection } from "../../types"

interface SortControlsProps {
  sortField: SortField
  sortDirection: SortDirection
  onSortChange: (field: SortField, direction: SortDirection) => void
}

export function SortControls({
  sortField,
  sortDirection,
  onSortChange,
}: SortControlsProps) {
  const sortOptions: { value: SortField; label: string }[] = [
    { value: "price", label: "Prezzo" },
    { value: "punteggio", label: "Punteggio" },
    { value: "duomoDistance", label: "Distanza dal Duomo" },
    { value: "metroDistance", label: "Distanza dalla Metro" },
    { value: "superficie", label: "Superficie" },
  ]

  const toggleDirection = () => {
    onSortChange(sortField, sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">Ordina per:</span>
      <Select
        value={sortField}
        onValueChange={value => onSortChange(value as SortField, sortDirection)}
      >
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleDirection}
        className="flex items-center gap-2"
      >
        {sortDirection === "asc" ? (
          <ArrowUp className="w-4 h-4" />
        ) : (
          <ArrowDown className="w-4 h-4" />
        )}
        {sortDirection === "asc" ? "Crescente" : "Decrescente"}
      </Button>
    </div>
  )
}
