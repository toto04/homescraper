import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  Euro,
  Star,
  MapPin,
  Building2,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import type { CombinedListing } from "../../types"
import { formatPrice, formatDistance } from "../lib/data"

interface StatsOverviewProps {
  listings: CombinedListing[]
  filteredListings: CombinedListing[]
}

export function StatsOverview({
  listings,
  filteredListings,
}: StatsOverviewProps) {
  // Calculate statistics
  const totalListings = listings.length
  const filteredCount = filteredListings.length

  const avgPrice =
    filteredListings.length > 0
      ? filteredListings.reduce((sum, l) => sum + l.price, 0) /
        filteredListings.length
      : 0

  const avgScore =
    filteredListings.length > 0
      ? filteredListings.reduce((sum, l) => sum + l.processed.punteggio, 0) /
        filteredListings.length
      : 0

  const avgDuomoDistance =
    filteredListings.length > 0
      ? filteredListings
          .filter(l => l.geo.deltaDuomo)
          .reduce((sum, l) => sum + (l.geo.deltaDuomo || 0), 0) /
        filteredListings.filter(l => l.geo.deltaDuomo).length
      : 0

  const tipologiaCounts = filteredListings.reduce(
    (acc, listing) => {
      acc[listing.processed.tipologia] =
        (acc[listing.processed.tipologia] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const mostCommonTipologia = Object.entries(tipologiaCounts).sort(
    ([, a], [, b]) => b - a
  )[0]

  const priceRange =
    filteredListings.length > 0
      ? {
          min: Math.min(...filteredListings.map(l => l.price)),
          max: Math.max(...filteredListings.map(l => l.price)),
        }
      : { min: 0, max: 0 }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Annunci Trovati</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filteredCount}</div>
          <p className="text-xs text-muted-foreground">
            su {totalListings} totali
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prezzo Medio</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(Math.round(avgPrice))}
          </div>
          <p className="text-xs text-muted-foreground">
            Range: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Punteggio Medio</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgScore.toFixed(1)}</div>
          <div className="flex items-center">
            {avgScore >= 70 ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <p className="text-xs text-muted-foreground">
              {avgScore >= 70 ? "Buona qualità" : "Qualità media"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Distanza Media</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {avgDuomoDistance > 0 ? formatDistance(avgDuomoDistance) : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">dal Duomo di Milano</p>
        </CardContent>
      </Card>

      {/* Additional insights row */}
      {mostCommonTipologia && (
        <Card className="sm:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                Tipologia più comune: {mostCommonTipologia[0]} (
                {mostCommonTipologia[1]} annunci)
              </Badge>
              {filteredListings.filter(l => l.processed.ariaCondizionata)
                .length > 0 && (
                <Badge variant="secondary">
                  Con A/C:{" "}
                  {
                    filteredListings.filter(l => l.processed.ariaCondizionata)
                      .length
                  }
                </Badge>
              )}
              {filteredListings.filter(
                l => l.processed.livelloArredamento === "completamenteArredato"
              ).length > 0 && (
                <Badge variant="secondary">
                  Arredati:{" "}
                  {
                    filteredListings.filter(
                      l =>
                        l.processed.livelloArredamento ===
                        "completamenteArredato"
                    ).length
                  }
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
