import type { CombinedListing } from "../../types"

export async function loadListings(): Promise<CombinedListing[]> {
  try {
    const listings = await fetch("/api/listings")
    return (await listings.json()).data as CombinedListing[]
  } catch (error) {
    console.error("Failed to load listings:", error)
    return []
  }
}

export async function loadSavedListings(): Promise<CombinedListing[]> {
  try {
    const response = await fetch("/api/listings/saved")
    return (await response.json()).data as CombinedListing[]
  } catch (error) {
    console.error("Failed to load saved listings:", error)
    return []
  }
}

export async function loadHiddenListings(): Promise<CombinedListing[]> {
  try {
    const response = await fetch("/api/listings/hidden")
    return (await response.json()).data as CombinedListing[]
  } catch (error) {
    console.error("Failed to load hidden listings:", error)
    return []
  }
}

export async function updateListingAction(
  listingId: string,
  action: "save" | "hide" | "unsave" | "unhide",
  notes?: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/listings/${listingId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes }),
    })
    return response.ok
  } catch (error) {
    console.error("Failed to update listing action:", error)
    return false
  }
}

export async function updateListingNotes(
  listingId: string,
  notes: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/listings/${listingId}/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    })
    return response.ok
  } catch (error) {
    console.error("Failed to update listing notes:", error)
    return false
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
