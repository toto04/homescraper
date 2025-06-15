import { z } from "zod"

import type {
  Distance,
  GeocodeResult,
} from "@googlemaps/google-maps-services-js"

export interface Row {
  "web-scraper-order": string
  "web-scraper-start-url": string
  title: string
  url: string
  "url-href": string
  price: string
  description: string
  features: string
  others: string
  costs: string
  addcosts: string
  "images-src": string
}

export interface RawListing {
  id: string
  title: string
  url: string
  price: number
  description: string
  features: Record<string, string>
  others: string[]
  costs: Record<string, string>
  images: string[]
}

export interface GeoData {
  id: string
  address: string
  geocode: null | Omit<GeocodeResult, "postcode_localities">
  deltaDuomo: null | number
  metro: null | {
    name: string
    location: {
      lat: number
      lng: number
    }
    distance: Distance
  }
}

export const AIExtractedFieldsSchema = z.object({
  tipologia: z.enum(["intero", "stanze_multiple", "stanza_singola"]),
  indirizzo: z.string(),
  speseCondominiali: z.number().nullable(),
  utenzeIncluse: z.object({
    elettricita: z.boolean().nullable(),
    gas: z.boolean().nullable(),
    TARI: z.boolean().nullable(),
    internet: z.boolean().nullable(),
  }),
  ariaCondizionata: z.boolean().default(false),
  riscaldamento: z.enum(["centralizzato", "autonomo", "nonSpecificato"]),
  costoMensileStimato: z.number(),
  livelloArredamento: z.enum([
    "nonArredato",
    "parzialmenteArredato",
    "completamenteArredato",
    "nonSpecificato",
  ]),
  durataContratto: z.string().nullable(),
  cauzione: z.number().nullable(),
  vincoli: z.array(z.string()),
  punteggio: z.number().min(0).max(100),
})

export type ProcessedListing = z.infer<typeof AIExtractedFieldsSchema> & {
  id: string
}

export interface CombinedListing extends RawListing {
  processed: ProcessedListing
  geo: GeoData
}

export interface FilterState {
  tipologia: string[]
  priceRange: [number, number]
  ariaCondizionata: boolean | null
  riscaldamento: string[]
  livelloArredamento: string[]
  maxDuomoDistance: number
  maxMetroDistance: number
  minPunteggio: number
}

export type SortField =
  | "price"
  | "punteggio"
  | "duomoDistance"
  | "metroDistance"
  | "superficie"
export type SortDirection = "asc" | "desc"
