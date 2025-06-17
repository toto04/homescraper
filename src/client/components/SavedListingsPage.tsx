import { useState, useEffect } from "react"
import { Header } from "./Header"
import { ListingCard } from "./ListingCard"
import { Badge } from "./ui/badge"
import { Loader2, Heart } from "lucide-react"
import type { CombinedListing } from "../../types"
import { loadSavedListings } from "../lib/data"

export function SavedListingsPage() {
  const [listings, setListings] = useState<CombinedListing[]>([])
  const [loading, setLoading] = useState(true)

  const refreshListings = async () => {
    setLoading(true)
    const data = await loadSavedListings()
    console.log("Loaded saved listings:", data)
    setListings(data)
    setLoading(false)
  }

  useEffect(() => {
    refreshListings()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="saved" />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold">Annunci Salvati</h1>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {listings.length}
            </Badge>
          </div>
          <p className="text-gray-600">
            I tuoi annunci salvati per dopo. Puoi sempre rimuoverli dai salvati
            quando vuoi.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2 text-lg">Caricamento annunci salvati...</span>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Nessun annuncio salvato
            </h2>
            <p className="text-gray-500">
              Salva gli annunci che ti interessano per trovarli facilmente qui.
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
