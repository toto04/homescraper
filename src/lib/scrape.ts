import OpenAI from "openai"
import { zodTextFormat } from "openai/helpers/zod"
import { Client, TravelMode } from "@googlemaps/google-maps-services-js"
import { PlacesClient } from "@googlemaps/places"
import type { ResponseInputImage } from "openai/resources/responses/responses"
import * as cheerio from "cheerio"

import {
  AIExtractedFieldsSchema,
  type RawListing,
  type ProcessedListing,
  type GeoData,
} from "../types.js"
import { db } from "./database.js"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

const geoclient = new Client({})
const placesClient = new PlacesClient({
  apiKey: process.env.GOOGLE_API_KEY || "",
})

export async function processListing(listing: {
  url: string
  html: string
}): Promise<{
  raw: RawListing
  processed: ProcessedListing
  geo: GeoData
} | null> {
  // Step 1: Get listing ID from URL
  const listingId = listing.url.match(/\/(\d+)\//)?.[1]
  if (!listingId) {
    console.error(`Listing ID not found in URL: ${listing.url}`)
    return null
  }

  try {
    // Step 2: Parse HTML to extract RawListing data
    console.log(`📝 Parsing HTML for listing ${listingId}...`)
    const rawListing = await parseHtmlToRawListing(
      listing.html,
      listingId,
      listing.url
    )
    if (!rawListing) {
      console.error(`Failed to parse HTML for listing ${listingId}`)
      return null
    }

    // Step 3: Process with OpenAI
    console.log(`🤖 Processing with AI for listing ${listingId}...`)
    const processedListing = await processWithOpenAI(rawListing)
    if (!processedListing) {
      console.error(`Failed to process with OpenAI for listing ${listingId}`)
      return null
    }

    // Step 4: Get geodata from Google Maps
    console.log(`🗺️ Getting geodata for listing ${listingId}...`)
    const geoData = await getGeoData(listingId, processedListing.indirizzo)
    if (!geoData) {
      console.error(`Failed to get geodata for listing ${listingId}`)
      return null
    }

    // Step 5: Save to database
    console.log(`💾 Saving to database for listing ${listingId}...`)
    try {
      await db.insertRawListing(rawListing)
      console.log(`✅ Saved raw listing to database`)
    } catch (error) {
      console.warn(`Failed to save raw listing to database:`, error)
    }

    try {
      await db.insertProcessedListing(processedListing)
      console.log(`✅ Saved processed listing to database`)
    } catch (error) {
      console.warn(`Failed to save processed listing to database:`, error)
    }

    try {
      await db.insertGeoData(geoData)
      console.log(`✅ Saved geo data to database`)
    } catch (error) {
      console.warn(`Failed to save geo data to database:`, error)
    }

    console.log(`✅ Successfully processed listing ${listingId}`)
    return { raw: rawListing, processed: processedListing, geo: geoData }
  } catch (error) {
    console.error(`Error processing listing ${listingId}:`, error)
    return null
  }
}

// async function scrapeListingData(
//   listingId: string
// ): Promise<{ html_content: string; url: string } | null> {
//   try {
//     const response = await fetch(`http://localhost:8000/scrape/${listingId}`)
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`)
//     }
//     const data = (await response.json()) as {
//       html_content: string
//       url: string
//       listing_id: string
//     }
//     return {
//       html_content: data.html_content,
//       url: data.url,
//     }
//   } catch (error) {
//     console.error(`Error scraping listing ${listingId}:`, error)
//     return null
//   }
// }

async function parseHtmlToRawListing(
  htmlContent: string,
  id: string,
  url: string
): Promise<RawListing | null> {
  try {
    const $ = cheerio.load(htmlContent)

    // Extract title
    const title = $("h1").first().text().trim()
    // Extract price
    const priceText = $('[class*="styles_ld-overview__price"] span')
      .first()
      .text()
    const price = parseInt(priceText.replace(/\D/g, ""), 10) || 0

    // Extract description
    const description = $('[class*="styles_in-readAll__"]')
      .first()
      .text()
      .trim()

    // Extract features using sitemap selectors
    const featuresElement = $(
      'div[data-tracking-key="primary-data"] dl[class*="styles_ld-featuresGrid__list"]'
    ).first()
    const featuresText = featuresElement.text()
    const features = parseFeatures(featuresText)

    // Extract others
    const othersElement = $(
      'div[data-tracking-key="primary-data"] [class*="styles_ld-featuresBadges__list"]'
    ).first()
    const othersText = othersElement.text()
    const others = parseOthers(othersText)

    // Extract costs
    const costsElement = $(
      'div[data-tracking-key="price-information"] dl[class*="styles_ld-featuresGrid__list"]'
    ).first()
    const addCostsElement = $(
      'div[data-tracking-key="costs"] dl[class*="styles_ld-featuresGrid__list"]'
    ).first()
    const costsText = costsElement.text()
    const addCostsText = addCostsElement.text()
    const costs = parseCosts(costsText)
    const addCosts = parseCosts(addCostsText)
    // Merge costs and addCosts
    for (const [key, value] of Object.entries(addCosts)) costs[key] = value

    // Extract images
    const imageSelector = "div.nd-slideshow__content img"
    const images: string[] = []
    $(imageSelector).each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src")
      if (src && (src.startsWith("http") || src.startsWith("//"))) {
        images.push(src.startsWith("//") ? `https:${src}` : src)
      }
    })

    const rawListing: RawListing = {
      id,
      title,
      url,
      price,
      description,
      features,
      others,
      costs,
      images: images.slice(0, 10), // Limit to first 10 images
    }

    return rawListing
  } catch (error) {
    console.error(`Error parsing HTML for listing ${id}:`, error)
    return null
  }
}

function parseFeatures(text: string): Record<string, string> {
  const features: Record<string, string> = {}
  const splitter = /(?<![\sA-Z])(?=[A-Z€])|(?<![\s\d\+\.\-\(])(?=\d)/gm
  const parts = text.split(splitter)

  for (let i = 0; i < parts.length; i += 2) {
    const key = parts[i]?.trim()
    const value = parts[i + 1]?.trim() || ""
    if (key) {
      features[key] = value
    }
  }

  return features
}

function parseOthers(text: string): string[] {
  const splitter = /(?<![\sA-Z])(?=[A-Z€])|(?<![\s\d\+\.\-\(])(?=\d)/gm
  return text
    .split(splitter)
    .map(o => o.trim())
    .filter(Boolean)
}

function parseCosts(text: string): Record<string, string> {
  const costs: Record<string, string> = {}
  const splitter = /(?<![\sA-Z])(?=[A-Z€])|(?<![\s\d\+\.\-\(])(?=\d)/gm
  const parts = text.split(splitter)

  for (let i = 0; i < parts.length; i += 2) {
    const key = parts[i]?.trim()
    const value = parts[i + 1]?.trim() || ""
    if (key) {
      costs[key] = value
    }
  }

  return costs
}

async function processWithOpenAI(
  rawListing: RawListing
): Promise<ProcessedListing | null> {
  try {
    const images: ResponseInputImage[] = rawListing.images
      .slice(0, 5)
      .filter(img => /https?:\/\/[^\s]+/.test(img))
      .map(img => ({
        type: "input_image",
        image_url: img,
        detail: "low",
      }))

    const response = await openai.responses.parse({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "Sei un estrattore di dati da annunci di affitto. Estrai i campi richiesti.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Di seguito trovi la descrizione in italiano di un annuncio di affitto, accompagnata da immagini dell'appartamento. 
Esegui il parsing di questi dati e restituisci le informazioni richieste. Non includere altri campi o informazioni non richieste.

Presta particolare attenzione al campo "description" dell'input, che contiene la descrizione dell'annuncio.
Ecco la definizione JSON:

Titolo: ${rawListing.title}
Costo affitto: ${rawListing.price} euro/mese
Altri costi: ${Object.entries(rawListing.costs)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}
Descrizione: ${rawListing.description}
Caratteristiche: ${Object.entries(rawListing.features)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}
Altre informazioni: ${rawListing.others.join(", ")}

Valuta i seguenti punti:
- Cerca di capire se l'annuncio riguarda l'intero appartamento ("intero"), o eccezionalmente almeno due stanze singole ("stanze_multiple"). Se l'annuncio riguarda una sola camera inserisci "stanza_singola".
- Estrai l'indirizzo completo con più precisione possibile, includendo **SOLO DOVE PUÒ ESSERE DETERMINATO CON CERTEZZA** numero civico, via, cap, etc.
- Determina, se possibile, il costo mensile delle spese condominiali, altrimenti null. Se fosse specificato espressamente come incluso nell'affitto, metti 0.
- Per ogni utenza (elettricità, gas, Tassa Rifiuti [TARI], internet), specifica se è inclusa (true/false), se non sei sicuro, lascia null.
- Controlla se l'appartamento ha l'aria condizionata (true/false), se non specificato, metti false.
- Di che tipo è il riscaldamento? "centralizzato" o "autonomo" (o "nonSpecificato" se non appare o non è chiaro).
- Stima un costo mensile totale (numero). Somma prezzo + condominio + utenze escluse se necessario. (per le utenze, usa una media di 100 euro al mese per elettricità, 10 euro per il gas in caso il riscaldamento fosse centralizzato, 50 altrimenti).
- Determina (sia dalla descrizione che dalle foto) un livello di arredamento: "nonArredato", "parzialmenteArredato" o "completamenteArredato" (oppure "nonSpecificato" se manca).
- Se nel testo compare la durata del contratto, mettila (es. "12 mesi", "18 mesi", "4+4"). Altrimenti null.
- Se nel testo compare una cauzione, metti il costo in euro, eventualmente calcolata (es. se appare "2 mensilità" metti il prezzo dell affitto raddoppiato, se appare "3000 euro" metti 3000). Altrimenti null.
- Se ci sono eventuali vincoli speciali ("no studenti", "solo ragazze", ecc.), mettili in un array di stringhe. Se non ci sono vincoli, lascia l'array vuoto.
- Infine, assegna un punteggio da 0 a 100 in base alla qualità dell'immobile, considerando prezzo, posizione, arredamento, etc. 100 è il massimo punteggio possibile, 0 il minimo. Non usare mai punteggi negativi o superiori a 100.
`,
            },
            ...images,
          ],
        },
      ],
      text: {
        format: zodTextFormat(AIExtractedFieldsSchema, "informazioni"),
      },
    })

    if (!response.output_parsed) {
      console.error(`No parsed output for listing ${rawListing.id}:`, response)
      return null
    }

    return { id: rawListing.id, ...response.output_parsed }
  } catch (error) {
    console.error(
      `Error processing with OpenAI for listing ${rawListing.id}:`,
      error
    )
    return null
  }
}

function calcCrow(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  lat1 = toRad(lat1)
  lat2 = toRad(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}

function toRad(value: number): number {
  return (value * Math.PI) / 180
}

async function getGeoData(
  id: string,
  address: string
): Promise<GeoData | null> {
  try {
    const geodataPoint: GeoData = {
      id,
      address,
      geocode: null,
      deltaDuomo: null,
      metro: null,
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.warn("GOOGLE_API_KEY not set, skipping geocoding")
      return geodataPoint
    }

    const res = await geoclient.geocode({
      params: {
        key: process.env.GOOGLE_API_KEY,
        address,
      },
    })

    if (res.data.results.length === 0) {
      console.warn(`No geocode results for address: ${address}`)
      return geodataPoint
    }

    const geocode = res.data.results[0]
    geodataPoint.geocode = geocode

    // Calculate distance to Duomo
    const deltaDuomo = calcCrow(
      geocode.geometry.location.lat,
      geocode.geometry.location.lng,
      45.46406877289005,
      9.191486284885102
    )
    geodataPoint.deltaDuomo = deltaDuomo

    // Find nearest metro station
    try {
      const [metroResult] = await placesClient.searchNearby(
        {
          includedTypes: ["subway_station"],
          rankPreference: "DISTANCE",
          maxResultCount: 1,
          locationRestriction: {
            circle: {
              center: {
                latitude: geocode.geometry.location.lat,
                longitude: geocode.geometry.location.lng,
              },
              radius: 1500, // 1.5 km
            },
          },
        },
        {
          otherArgs: {
            headers: {
              "X-Goog-FieldMask": "*",
            },
          },
        }
      )

      const metro = metroResult?.places?.[0]
      if (
        metro &&
        metro.location &&
        metro.location.latitude &&
        metro.location.longitude
      ) {
        const location = {
          lat: metro.location.latitude,
          lng: metro.location.longitude,
        }

        const metroDistance = await geoclient.distancematrix({
          params: {
            key: process.env.GOOGLE_API_KEY,
            origins: [
              {
                lat: geocode.geometry.location.lat,
                lng: geocode.geometry.location.lng,
              },
            ],
            destinations: [location],
            mode: TravelMode.walking,
          },
        })

        geodataPoint.metro = {
          name: metro.displayName?.text || "Metro Station",
          location,
          distance: metroDistance.data.rows[0].elements[0].duration,
        }
      } else {
        console.warn(`No metro station found near: ${address}`)
      }
    } catch (metroError) {
      console.warn(`Error finding metro station for ${address}:`, metroError)
    }

    console.log(`Processed geodata for: ${id} (${address})`)
    return geodataPoint
  } catch (error) {
    console.error(`Error getting geodata for listing ${id}:`, error)
    return {
      id,
      address: "ERROR",
      geocode: null,
      deltaDuomo: null,
      metro: null,
    }
  }
}
