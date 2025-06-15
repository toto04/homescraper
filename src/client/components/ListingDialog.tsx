import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { ExternalLink, MapPin, Star, Euro, Building } from "lucide-react"
import type { CombinedListing } from "../../types"
import {
  formatPrice,
  formatDistance,
  getTipologiaLabel,
  getRiscaldamentoLabel,
  getArredamentoLabel,
} from "../lib/data"

interface ListingDialogProps {
  listing: CombinedListing
  children: React.ReactNode
}

export function ListingDialog({ listing, children }: ListingDialogProps) {
  const { processed, geo } = listing

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl line-clamp-2 pr-8">
            {listing.title}
          </DialogTitle>
          <DialogDescription className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {processed.indirizzo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          {listing.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listing.images.slice(0, 6).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Foto ${index + 1} di ${listing.title}`}
                  className="w-full h-48 object-cover rounded-lg"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Euro className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="font-bold text-lg">
                {formatPrice(listing.price)}
              </div>
              <div className="text-sm text-gray-500">al mese</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Star
                className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(processed.punteggio).replace("bg-", "text-")}`}
              />
              <div className="font-bold text-lg">{processed.punteggio}</div>
              <div className="text-sm text-gray-500">punteggio</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="font-bold text-lg">
                {geo.deltaDuomo ? formatDistance(geo.deltaDuomo) : "N/A"}
              </div>
              <div className="text-sm text-gray-500">dal Duomo</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Building className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="font-bold text-lg">
                {geo.metro
                  ? formatDistance(geo.metro.distance.value / 1000)
                  : "N/A"}
              </div>
              <div className="text-sm text-gray-500">dalla metro</div>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dettagli Proprietà</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipologia:</span>
                  <span className="font-medium">
                    {getTipologiaLabel(processed.tipologia)}
                  </span>
                </div>

                {listing.features.Superficie && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Superficie:</span>
                    <span className="font-medium">
                      {listing.features.Superficie}
                    </span>
                  </div>
                )}

                {listing.features.Locali && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Locali:</span>
                    <span className="font-medium">
                      {listing.features.Locali}
                    </span>
                  </div>
                )}

                {listing.features["Camere da letto"] && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Camere:</span>
                    <span className="font-medium">
                      {listing.features["Camere da letto"]}
                    </span>
                  </div>
                )}

                {listing.features.Bagni && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bagni:</span>
                    <span className="font-medium">
                      {listing.features.Bagni}
                    </span>
                  </div>
                )}

                {listing.features.Piano && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Piano:</span>
                    <span className="font-medium">
                      {listing.features.Piano}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Caratteristiche</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Riscaldamento:</span>
                  <span className="font-medium">
                    {getRiscaldamentoLabel(processed.riscaldamento)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Arredamento:</span>
                  <span className="font-medium">
                    {getArredamentoLabel(processed.livelloArredamento)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Aria Condizionata:</span>
                  <span className="font-medium">
                    {processed.ariaCondizionata ? "Sì" : "No"}
                  </span>
                </div>

                {listing.features.Ascensore && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ascensore:</span>
                    <span className="font-medium">
                      {listing.features.Ascensore}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Costi</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-lg font-medium">
                <span>Affitto mensile:</span>
                <span>{formatPrice(listing.price)}</span>
              </div>

              {processed.speseCondominiali && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Spese condominiali:</span>
                  <span>{formatPrice(processed.speseCondominiali)}/mese</span>
                </div>
              )}

              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>Costo totale stimato:</span>
                <span>{formatPrice(processed.costoMensileStimato)}/mese</span>
              </div>

              {processed.cauzione && (
                <div className="flex justify-between text-orange-600">
                  <span>Cauzione:</span>
                  <span>{formatPrice(processed.cauzione)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Utilities and Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(processed.utenzeIncluse).some(Boolean) && (
              <div className="space-y-3">
                <h4 className="font-medium">Utenze incluse:</h4>
                <div className="flex flex-wrap gap-2">
                  {processed.utenzeIncluse.elettricita && (
                    <Badge variant="outline">Elettricità</Badge>
                  )}
                  {processed.utenzeIncluse.gas && (
                    <Badge variant="outline">Gas</Badge>
                  )}
                  {processed.utenzeIncluse.TARI && (
                    <Badge variant="outline">TARI</Badge>
                  )}
                  {processed.utenzeIncluse.internet && (
                    <Badge variant="outline">Internet</Badge>
                  )}
                </div>
              </div>
            )}

            {processed.vincoli.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-red-600">Vincoli:</h4>
                <div className="flex flex-wrap gap-2">
                  {processed.vincoli.map((vincolo, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="text-xs"
                    >
                      {vincolo}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Details */}
          {geo.metro && (
            <div className="space-y-3">
              <h4 className="font-medium">Trasporti</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span>
                    Metro più vicina: <strong>{geo.metro.name}</strong>
                  </span>
                  <span className="text-blue-600 font-medium">
                    {geo.metro.distance.text} (
                    {formatDistance(geo.metro.distance.value / 1000)})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <div className="space-y-3">
              <h4 className="font-medium">Descrizione</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm whitespace-pre-line text-gray-700">
                  {listing.description.slice(0, 500)}
                  {listing.description.length > 500 && "..."}
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t">
            <Button asChild className="w-full" size="lg">
              <a href={listing.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5 mr-2" />
                Vedi Annuncio Completo
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
