import { CombinedListing } from "../types.js"

export function score(listing: CombinedListing): CombinedListing {
  // Implement your scoring logic here
  let score = 100

  // fix the damn price
  if (listing.price > 10000) {
    const p = listing.price.toString()
    let price = parseInt(p.substring(0, 4), 10)
    if (price > 5000) {
      price = parseInt(p.substring(0, 3), 10)
    }
    listing.price = price
  }

  score -= listing.price / 100
  if (!listing.processed.ariaCondizionata) score -= 10
  if (!listing.geo.geocode) score -= 10
  score -= listing.geo.deltaDuomo ? (listing.geo.deltaDuomo - 1000) / 300 : 10
  score -= listing.geo.metro ? listing.geo.metro.distance.value / 100 : 20
  score -= (listing.processed.speseCondominiali ?? 200) / 100
  const nUtenze = Object.values(listing.processed.utenzeIncluse).filter(
    v => v !== true
  ).length
  score -= nUtenze
  score -= listing.processed.livelloArredamento === "nonArredato" ? 30 : 0
  score -=
    listing.processed.livelloArredamento === "parzialmenteArredato" ? 20 : 0
  score -= listing.processed.riscaldamento !== "centralizzato" ? 5 : 0
  score -= (listing.processed.cauzione ?? 0) / 1000
  if (listing.images.length < 10) score -= 3
  if (listing.images.length < 5) score -= 7
  if (listing.processed.tipologia === "stanza_singola") score -= 50
  if (listing.processed.tipologia === "stanze_multiple") score -= 10

  listing.processed.punteggio = Math.max(0, Math.min(100, score))

  return listing
}
