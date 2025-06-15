import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import {
  ExternalLink,
  MapPin,
  Star,
  AirVent,
  Thermometer,
  Home,
} from "lucide-react"
import type { CombinedListing } from "../../types"
import {
  formatPrice,
  formatDistance,
  getTipologiaLabel,
  getRiscaldamentoLabel,
  getArredamentoLabel,
} from "../lib/data"
import { ListingDialog } from "./ListingDialog"

interface ListingCardProps {
  listing: CombinedListing
}

export function ListingCard({ listing }: ListingCardProps) {
  const { processed, geo } = listing

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {listing.images.length > 0 && (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge variant="secondary" className="bg-white/90">
            {formatPrice(listing.price)}/mese
          </Badge>
          <Badge className={`${getScoreColor(processed.punteggio)} text-white`}>
            <Star className="w-3 h-3 mr-1" />
            {processed.punteggio}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          {processed.indirizzo}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Features */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <Home className="w-4 h-4 mr-2 text-muted-foreground" />
            {getTipologiaLabel(processed.tipologia)}
          </div>
          <div className="flex items-center">
            <Thermometer className="w-4 h-4 mr-2 text-muted-foreground" />
            {getRiscaldamentoLabel(processed.riscaldamento)}
          </div>
          {processed.ariaCondizionata && (
            <div className="flex items-center">
              <AirVent className="w-4 h-4 mr-2 text-blue-500" />
              Aria Condizionata
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Arredamento:</span>
            <br />
            {getArredamentoLabel(processed.livelloArredamento)}
          </div>
        </div>

        {/* Location Info */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duomo:</span>
            <span className="font-medium">
              {geo.deltaDuomo ? formatDistance(geo.deltaDuomo) : "N/A"}
            </span>
          </div>
          {geo.metro && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Metro più vicina:</span>
              <span className="font-medium">
                {geo.metro.name} (
                {formatDistance(geo.metro.distance.value / 1000)})
              </span>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Costo stimato:</span>
            <span className="font-medium">
              {formatPrice(processed.costoMensileStimato)}/mese
            </span>
          </div>
          {processed.cauzione && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cauzione:</span>
              <span className="font-medium">
                {formatPrice(processed.cauzione)}
              </span>
            </div>
          )}
          {processed.speseCondominiali && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spese cond.:</span>
              <span className="font-medium">
                {formatPrice(processed.speseCondominiali)}/mese
              </span>
            </div>
          )}
        </div>

        {/* Utilities */}
        {Object.values(processed.utenzeIncluse).some(Boolean) && (
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground mb-2">
              Utenze incluse:
            </div>
            <div className="flex flex-wrap gap-1">
              {processed.utenzeIncluse.elettricita && (
                <Badge variant="outline" className="text-xs">
                  Elettricità
                </Badge>
              )}
              {processed.utenzeIncluse.gas && (
                <Badge variant="outline" className="text-xs">
                  Gas
                </Badge>
              )}
              {processed.utenzeIncluse.TARI && (
                <Badge variant="outline" className="text-xs">
                  TARI
                </Badge>
              )}
              {processed.utenzeIncluse.internet && (
                <Badge variant="outline" className="text-xs">
                  Internet
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Constraints */}
        {processed.vincoli.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground mb-2">Vincoli:</div>
            <div className="flex flex-wrap gap-1">
              {processed.vincoli.map((vincolo, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {vincolo}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t space-y-2">
          <ListingDialog listing={listing}>
            <Button variant="outline" className="w-full">
              Vedi Dettagli
            </Button>
          </ListingDialog>
          <Button asChild className="w-full">
            <a href={listing.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Vedi Annuncio
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
