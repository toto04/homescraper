import { useState } from "react"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import {
  ExternalLink,
  Star,
  AirVent,
  Thermometer,
  Home,
  Heart,
  EyeOff,
  Eye,
  HeartOff,
  StickyNote,
  Share2,
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
import { ListingDialog } from "./ListingDialog"
import { NotesEditor } from "./NotesEditor"
import { GeoAddress } from "./ListingCard/GeoAddress"

interface ListingCardProps {
  listing: CombinedListing
  onActionUpdate?: () => void
  isDialogOpen?: boolean
  onDialogOpenChange?: (open: boolean) => void
}

export function ListingCard({
  listing,
  onActionUpdate,
  isDialogOpen,
  onDialogOpenChange,
}: ListingCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  const { processed, geo, userActions } = listing

  const handleAction = async (
    action: "save" | "hide" | "unsave" | "unhide"
  ) => {
    setIsUpdating(true)
    const success = await updateListingAction(listing.id, action)
    if (success && onActionUpdate) {
      onActionUpdate()
    }
    setIsUpdating(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const shareableUrl = generateListingUrl(listing.id)
      await navigator.clipboard.writeText(shareableUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow pt-0">
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
            {processed.punteggio.toFixed(1)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
        <GeoAddress geo={geo} />
      </CardHeader>

      <CardContent className="space-y-4 flex flex-col h-full">
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
                {formatDistance(geo.metro.distance.value / 1000)} -{" "}
                {geo.metro.distance.text})
              </span>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Affitto:</span>
            <span className="font-medium">
              {formatPrice(listing.price)}/mese
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Costo stimato da GPT:</span>
            <span className="font-medium">
              {formatPrice(processed.costoMensileStimato)}/mese
            </span>
          </div>
          {processed.cauzione !== null ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cauzione:</span>
              <span className="font-medium">
                {formatPrice(processed.cauzione)}
              </span>
            </div>
          ) : null}
          {processed.speseCondominiali !== null ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Spese cond.:</span>
              <span className="font-medium">
                {formatPrice(processed.speseCondominiali)}/mese
              </span>
            </div>
          ) : null}
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
                <Badge
                  key={index}
                  variant="destructive"
                  className="text-xs inline truncate max-w-full"
                >
                  {vincolo}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t mt-auto space-y-2">
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
                    {index < userActions.notes.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </span>
            </div>
          )}

          {/* Notes Editor Button */}
          <NotesEditor listing={listing} onNotesUpdate={onActionUpdate}>
            <Button variant="outline" size="sm" className="w-full">
              <StickyNote className="w-4 h-4 mr-2" />
              {userActions?.notes ? "Modifica Note" : "Aggiungi Note"}
            </Button>
          </NotesEditor>

          <ListingDialog
            listing={listing}
            isOpen={isDialogOpen}
            onOpenChange={onDialogOpenChange}
          >
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
          {/* Copy Link Button */}
          <Button
            variant="outline"
            size="sm"
            className={`w-full transition-all duration-200 ${copied ? "bg-green-50 border-green-500 text-green-700" : ""}`}
            onClick={handleCopyLink}
            disabled={copied}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {copied ? "Link Copiato!" : "Condividi Link"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
