import { useState, useEffect, useMemo, useCallback } from "react"
import { Header } from "./Header"
import { StatsOverview } from "./StatsOverview"
import { defaultFilters, Filters } from "./Filters"
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

interface ListingsPageProps {
  openListingId?: string | null
}

export function ListingsPage({ openListingId }: ListingsPageProps) {
  const [listings, setListings] = useState<CombinedListing[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>("punteggio")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [openDialogListingId, setOpenDialogListingId] = useState<string | null>(
    openListingId || null
  )
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  const refreshListings = useCallback(async () => {
    setLoading(true)
    const data = await loadListings()
    console.log("Loaded listings:", data)
    setListings(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    refreshListings()
  }, [refreshListings])

  // Update dialog state when openListingId prop changes
  useEffect(() => {
    setOpenDialogListingId(openListingId || null)
  }, [openListingId])

  const handleDialogOpenChange = (listingId: string) => (open: boolean) => {
    if (open) {
      setOpenDialogListingId(listingId)
      // Update URL for sharing when opening dialog
      const url = new URL(window.location.href)
      url.searchParams.set("listing", listingId)
      window.history.pushState({}, "", url.toString())
    } else {
      setOpenDialogListingId(null)
      // Remove listing parameter from URL when closing
      const url = new URL(window.location.href)
      url.searchParams.delete("listing")
      window.history.pushState({}, "", url.toString())
    }
  }

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

  const [fnsListings, setFnsListings] = useState<CombinedListing[]>(listings)
  useEffect(() => {
    setFnsListings(sorted.filter(filterFunction))
  }, [filterFunction, sorted])

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field)
    setSortDirection(direction)
  }

  const onFiltersChange = useCallback((f: FilterState) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      setFilters(f)
      timeout = null
    }, 500)
  }, [])

  if (loading && (!fnsListings || fnsListings.length === 0)) {
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

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Statistics Overview */}
        <StatsOverview listings={listings} filteredListings={fnsListings} />

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <Filters onFiltersChange={onFiltersChange} />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg border p-3 sm:p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-3">
                  <div className="flex flex-row items-center gap-2 xs:gap-3">
                    <Badge
                      variant="outline"
                      className="text-base sm:text-lg px-2 sm:px-3 py-1 w-fit"
                    >
                      {fnsListings.length} risultat
                      {fnsListings.length === 1 ? "o" : "i"}
                    </Badge>
                    <span className="text-xs sm:text-sm text-gray-500">
                      su {listings.length} totali
                    </span>
                  </div>
                </div>
                <div className="border-t pt-3 sm:hidden">
                  <SortControls
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                  />
                </div>
                <div className="hidden sm:block">
                  <SortControls
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                  />
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {fnsListings.length === 0 ? (
              <div className="bg-white rounded-lg border p-6 sm:p-12 text-center">
                <p className="text-gray-500 text-base sm:text-lg">
                  Nessun annuncio trovato con i filtri selezionati
                </p>
                <p className="text-gray-400 mt-2 text-sm sm:text-base">
                  Prova a modificare i filtri per vedere più risultati
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {fnsListings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isDialogOpen={openDialogListingId === listing.id}
                    onDialogOpenChange={handleDialogOpenChange(listing.id)}
                    onActionUpdate={() => refreshListings()}
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
