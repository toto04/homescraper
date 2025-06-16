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
