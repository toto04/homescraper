import { FaApple, FaGoogle } from "react-icons/fa6"
import { ExternalLink, MapPin } from "lucide-react"
import type { GeoData } from "src/types"
import { Button } from "../ui/button"

interface GeoAddressProps {
  geo: GeoData
}

export function GeoAddress({ geo }: GeoAddressProps) {
  return (
    <div className="flex flex-col gap-1 text-sm text-muted-foreground w-full">
      <span className="flex items-center gap-0.5">
        <MapPin className="w-4 h-4 mr-1" />
        <span className="flex-1">{geo.address}</span>
      </span>
      <div className="flex items-center gap-2 w-full">
        <Button
          asChild
          variant={"outline"}
          className="flex-1 justify-between gap-0"
        >
          <a
            href={
              geo.geocode
                ? `https://www.google.com/maps/place/?ll=${geo.geocode.geometry.location.lat},${geo.geocode.geometry.location.lng}`
                : `https://www.google.com/maps/place/?q=${geo.address}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGoogle />
            Google Maps
            <ExternalLink />
          </a>
        </Button>
        <Button
          asChild
          variant={"outline"}
          className="flex-1 justify-between gap-0"
        >
          <a
            href={
              geo.geocode
                ? `https://maps.apple.com/?ll=${geo.geocode.geometry.location.lat},${geo.geocode.geometry.location.lng}`
                : `https://maps.apple.com/?q=${geo.address}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaApple />
            Apple Maps
            <ExternalLink />
          </a>
        </Button>
      </div>
    </div>
  )
}
