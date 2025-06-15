import type {
  RawListing,
  ProcessedListing,
  GeoData,
  CombinedListing,
} from "../types"

export async function loadListings(): Promise<CombinedListing[]> {
  try {
    const [listingsRes, processedRes, geoRes] = await Promise.all([
      fetch("/data/listings.json"),
      fetch("/data/processed_listings.json"),
      fetch("/data/geodata.json"),
    ])

    const listings = (await listingsRes.json()) as RawListing[]
    const processed = (await processedRes.json()) as ProcessedListing[]
    const geo = (await geoRes.json()) as GeoData[]

    // Create lookup maps for better performance
    const processedMap = new Map(processed.map(p => [p.id, p]))
    const geoMap = new Map(geo.map(g => [g.id, g]))

    // Combine the data
    const combined: CombinedListing[] = listings
      .map(listing => {
        const processedData = processedMap.get(listing.id)
        const geoData = geoMap.get(listing.id)

        if (!processedData || !geoData) {
          return null
        }

        return {
          ...listing,
          processed: processedData,
          geo: geoData,
        }
      })
      .filter((listing): listing is CombinedListing => listing !== null)

    return combined
  } catch (error) {
    console.error("Failed to load listings:", error)
    return []
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`
  }
  return `${km.toFixed(1)}km`
}

export function getTipologiaLabel(tipologia: string): string {
  const labels: Record<string, string> = {
    intero: "Intero Appartamento",
    stanze_multiple: "Stanze Multiple",
    stanza_singola: "Stanza Singola",
  }
  return labels[tipologia] || tipologia
}

export function getRiscaldamentoLabel(riscaldamento: string): string {
  const labels: Record<string, string> = {
    centralizzato: "Centralizzato",
    autonomo: "Autonomo",
    nonSpecificato: "Non Specificato",
  }
  return labels[riscaldamento] || riscaldamento
}

export function getArredamentoLabel(arredamento: string): string {
  const labels: Record<string, string> = {
    nonArredato: "Non Arredato",
    parzialmenteArredato: "Parzialmente Arredato",
    completamenteArredato: "Completamente Arredato",
    nonSpecificato: "Non Specificato",
  }
  return labels[arredamento] || arredamento
}
