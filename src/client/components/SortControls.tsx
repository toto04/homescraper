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
  ]

  const toggleDirection = () => {
    onSortChange(sortField, sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
      <span className="text-sm font-medium text-gray-700">Ordina per:</span>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select
          value={sortField}
          onValueChange={value =>
            onSortChange(value as SortField, sortDirection)
          }
        >
          <SelectTrigger className="w-full sm:w-48 min-w-[140px]">
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
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 flex-shrink-0"
        >
          {sortDirection === "asc" ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {sortDirection === "asc" ? "Crescente" : "Decrescente"}
          </span>
        </Button>
      </div>
    </div>
  )
}
