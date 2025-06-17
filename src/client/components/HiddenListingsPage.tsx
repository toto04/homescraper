import { useState, useEffect } from "react"
import { Header } from "./Header"
import { ListingCard } from "./ListingCard"
import { Badge } from "./ui/badge"
import { Loader2, EyeOff } from "lucide-react"
import type { CombinedListing } from "../../types"
import { loadHiddenListings } from "../lib/data"

export function HiddenListingsPage() {
  const [listings, setListings] = useState<CombinedListing[]>([])
  const [loading, setLoading] = useState(true)

  const refreshListings = async () => {
    setLoading(true)
    const data = await loadHiddenListings()
    console.log("Loaded hidden listings:", data)
    setListings(data)
    setLoading(false)
  }

  useEffect(() => {
    refreshListings()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="hidden" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <EyeOff className="w-8 h-8 text-gray-500" />
            <h1 className="text-3xl font-bold">Annunci Nascosti</h1>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {listings.length}
            </Badge>
          </div>
          <p className="text-gray-600">
            Annunci che hai scelto di nascondere dalla ricerca principale. Puoi
            sempre renderli di nuovo visibili.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2 text-lg">
              Caricamento annunci nascosti...
            </span>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <EyeOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Nessun annuncio nascosto
            </h2>
            <p className="text-gray-500">
              Gli annunci che nascondi dalla ricerca principale appariranno qui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onActionUpdate={refreshListings}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
