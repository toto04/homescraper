import { useState, useEffect, useMemo, useCallback } from "react"
import { Header } from "./Header"
import { StatsOverview } from "./StatsOverview"
import { Filters } from "./Filters"
import { ListingCard } from "./ListingCard"
import { SortControls } from "./SortControls"
import { Badge } from "./ui/badge"
import { Loader2 } from "lucide-react"
import type {
  CombinedListing,
  FilterState,
  SortField,
  SortDirection,
} from "../../types"
import { loadListings } from "../lib/data"

let timeout: NodeJS.Timeout | null = null

export function ListingsPage() {
  const [listings, setListings] = useState<CombinedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>("punteggio")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [filters, setFilters] = useState<FilterState>({
    tipologia: [],
    priceRange: [0, 5000],
    ariaCondizionata: null,
    riscaldamento: [],
    livelloArredamento: [],
    maxDuomoDistance: 50,
    maxMetroDistance: 5,
    minPunteggio: 0,
  })

  const refreshListings = async () => {
    setLoading(true)
    const data = await loadListings()
    console.log("Loaded listings:", data)
    setListings(data)

    // Set initial filter ranges based on data
    const maxPrice = Math.max(...data.map(l => l.price))
    const maxDuomoDistance = Math.min(
      Math.max(...listings.map(l => l.geo.deltaDuomo || 0), 0),
      20000
    )
    const maxMetroDistance = Math.max(
      ...data.map(l =>
        l.geo.metro?.distance.value ? l.geo.metro.distance.value / 1000 : 0
      )
    )

    setFilters(prev => ({
      ...prev,
      priceRange: [0, maxPrice],
      maxDuomoDistance,
      maxMetroDistance,
    }))
    setLoading(false)
  }

  useEffect(() => {
    refreshListings()
  }, [])

  const sorted = useMemo(() => {
    console.log("Sorting listings by:", sortField, sortDirection)
    return [...listings].sort((a, b) => {
      let valueA: number
      let valueB: number

      switch (sortField) {
        case "price":
          valueA = a.price
          valueB = b.price
          break
        case "punteggio":
          valueA = a.processed.punteggio
          valueB = b.processed.punteggio
          break
        case "duomoDistance":
          valueA = a.geo.deltaDuomo || Infinity
          valueB = b.geo.deltaDuomo || Infinity
          break
        case "metroDistance":
          valueA = a.geo.metro?.distance.value || Infinity
          valueB = b.geo.metro?.distance.value || Infinity
          break
        default:
          return 0
      }

      if (sortDirection === "asc") {
        return valueA - valueB
      } else {
        return valueB - valueA
      }
    })
  }, [listings, sortField, sortDirection])

  const filterFunction = useCallback(
    (listing: CombinedListing) => {
      const theWholeBooleanThing =
        (filters.tipologia.length > 0 &&
          !filters.tipologia.includes(listing.processed.tipologia)) ||
        listing.price < filters.priceRange[0] ||
        listing.price > filters.priceRange[1] ||
        (filters.ariaCondizionata !== null &&
          listing.processed.ariaCondizionata !== filters.ariaCondizionata) ||
        (filters.riscaldamento.length > 0 &&
          !filters.riscaldamento.includes(listing.processed.riscaldamento)) ||
        (filters.livelloArredamento.length > 0 &&
          !filters.livelloArredamento.includes(
            listing.processed.livelloArredamento
          )) ||
        (listing.geo.deltaDuomo &&
          listing.geo.deltaDuomo > filters.maxDuomoDistance) ||
        (listing.geo.metro?.distance.value &&
          listing.geo.metro.distance.value / 1000 > filters.maxMetroDistance) ||
        listing.processed.punteggio < filters.minPunteggio
      return !theWholeBooleanThing
    },
    [filters]
  )

  const filteredAndSortedListings = useMemo(
    () => sorted.filter(filterFunction),
    [listings, filterFunction, sorted]
  )

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field)
    setSortDirection(direction)
  }

  const onFiltersChange = useCallback((f: FilterState) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      console.log("Applying filters:", f)
      setFilters(f)
      timeout = null
    }, 500)
  }, [])

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Caricamento annunci...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="home" />

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Overview */}
        <StatsOverview
          listings={listings}
          filteredListings={filteredAndSortedListings}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <Filters listings={listings} onFiltersChange={onFiltersChange} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {filteredAndSortedListings.length} risultati
                  </Badge>
                  <span className="text-sm text-gray-500">
                    su {listings.length} totali
                  </span>
                </div>
                <SortControls
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSortChange={handleSortChange}
                />
              </div>
            </div>

            {/* Results Grid */}
            {filteredAndSortedListings.length === 0 ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Nessun annuncio trovato con i filtri selezionati
                </p>
                <p className="text-gray-400 mt-2">
                  Prova a modificare i filtri per vedere più risultati
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onActionUpdate={() => {
                      const updatedListings = [...listings]
                      const index = updatedListings.findIndex(
                        l => l.id === listing.id
                      )
                      if (index !== -1) updatedListings.splice(index, 1)
                      setListings(updatedListings)
                      refreshListings()
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
