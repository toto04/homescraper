import { useState } from "react"
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
import {
  ExternalLink,
  MapPin,
  Star,
  Euro,
  Building,
  Share2,
  Check,
  StickyNote,
  Eye,
  EyeOff,
  HeartOff,
  Heart,
} from "lucide-react"
import type { CombinedListing } from "../../types"
import {
  formatPrice,
  formatDistance,
  getTipologiaLabel,
  getRiscaldamentoLabel,
  getArredamentoLabel,
  updateListingAction,
} from "../lib/data"
import { generateListingUrl } from "../lib/utils"
import { NotesEditor } from "./NotesEditor"

interface ListingDialogProps {
  listing: CombinedListing
  children: React.ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ListingDialog({
  listing,
  children,
  isOpen,
  onOpenChange,
}: ListingDialogProps) {
  const { processed, geo, userActions } = listing
  const [internalOpen, setInternalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const dialogOpen = isOpen !== undefined ? isOpen : internalOpen

  const handleAction = async (
    action: "save" | "hide" | "unsave" | "unhide"
  ) => {
    setIsUpdating(true)
    await updateListingAction(listing.id, action)
    setIsUpdating(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open)
    } else {
      setInternalOpen(open)
    }

    // Update URL when dialog opens/closes for shareable links
    const url = new URL(window.location.href)
    if (open) {
      url.searchParams.set("listing", listing.id)
      // Use pushState for soft navigation (easy sharing)
      window.history.pushState({}, "", url.toString())
    } else {
      url.searchParams.delete("listing")
      // Use pushState for soft navigation when closing
      window.history.pushState({}, "", url.toString())
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const handleCopyLink = async () => {
    try {
      const shareableUrl = generateListingUrl(listing.id)
      await navigator.clipboard.writeText(shareableUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
      // Fallback for browsers without clipboard API
      const shareableUrl = generateListingUrl(listing.id)
      const textArea = document.createElement("textarea")
      textArea.value = shareableUrl
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
                className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(processed.punteggio)}`}
              />
              <div className="font-bold text-lg">
                {processed.punteggio.toFixed(1)}
              </div>
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

          {/* Action Buttons */}
          <div className="pt-4 border-t space-y-3">
            {/* User Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant={userActions?.isSaved ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() =>
                  handleAction(userActions?.isSaved ? "unsave" : "save")
                }
                disabled={isUpdating}
              >
                {userActions?.isSaved ? (
                  <HeartOff className="w-4 h-4 mr-2" />
                ) : (
                  <Heart className="w-4 h-4 mr-2" />
                )}
                {userActions?.isSaved ? "Un-Salva" : "Salva"}
              </Button>

              <Button
                variant={userActions?.isHidden ? "secondary" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() =>
                  handleAction(userActions?.isHidden ? "unhide" : "hide")
                }
                disabled={isUpdating}
              >
                {userActions?.isHidden ? (
                  <Eye className="w-4 h-4 mr-2" />
                ) : (
                  <EyeOff className="w-4 h-4 mr-2" />
                )}
                {userActions?.isHidden ? "Mostra" : "Nascondi"}
              </Button>
            </div>

            {/* Notes indicator */}
            {userActions?.notes && (
              <div className="flex items-center text-sm text-muted-foreground bg-muted p-2 rounded">
                <StickyNote className="w-4 h-4 mr-2" />
                <span className="flex-1">
                  {userActions.notes.split("\n").map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < userActions.notes.split("\n").length - 1 && (
                        <br />
                      )}
                    </span>
                  ))}
                </span>
              </div>
            )}

            {/* Notes Editor Button */}
            <NotesEditor listing={listing}>
              <Button variant="outline" size="sm" className="w-full">
                <StickyNote className="w-4 h-4 mr-2" />
                {userActions?.notes ? "Modifica Note" : "Aggiungi Note"}
              </Button>
            </NotesEditor>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className={`flex-1 transition-all duration-200 ${copied ? "bg-green-50 border-green-500 text-green-700" : ""}`}
                size="lg"
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Link Copiato!
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5 mr-2" />
                    Condividi Link
                  </>
                )}
              </Button>
              <Button asChild className="flex-1" size="lg">
                <a href={listing.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Vedi Annuncio
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
