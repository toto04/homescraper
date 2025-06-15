import fs from "fs/promises"

import OpenAI from "openai"
import { zodTextFormat } from "openai/helpers/zod"
import type { ResponseInputImage } from "openai/resources/responses/responses"

import { AIExtractedFieldsSchema, type ProcessedListing } from "../src/types"

import listings from "../data/listings.json" with { type: "json" }

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"] || "",
})

const imageURL = /https?:\/\/[^\s]+/

async function wait(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const processedListings: (ProcessedListing | null)[] = await Promise.all(
  listings
    .map(async (l, i) => {
      await wait(i * 500) // Stagger requests to avoid rate limiting
      const images: ResponseInputImage[] = l.images
        .slice(0, 5)
        .filter(img => imageURL.test(img))
        .map(img => ({
          type: "input_image",
          image_url: img,
          detail: "low",
        }))

      console.log(`Processing listing ${l.id} (${i + 1}/${listings.length})`)
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

Titolo: ${l.title}
Costo affitto: ${l.price} euro/mese
Altri costi: ${Object.entries(l.costs)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}
Descrizione: ${l.description}
Caratteristiche: ${Object.entries(l.features)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}
Altre informazioni: ${l.others.join(", ")}

Valuta i seguenti punti:
- Cerca di capire se l'annuncio riguarda l'intero appartamento ("intero"), o eccezionalmente almeno due stanze singole ("stanze_multiple"). Se l'annuncio riguarda una sola camera inserisci "stanza_singola".
- Estrai l'indirizzo completo con più precisione possibile, includendo **SOLO DOVE PUÒ ESSERE DETERMINATO CON CERTEZZA** numero civico, via, cap, etc.
- Determina, se possibile, il costo mensile delle spese condominiali, altrimenti null. Se fosse specificato espressamente come incluso nell'affitto, metti 0.
- Per ogni utenza (elettricità, gas, Tassa Rifiuti [TARI], internet), specifica se è inclusa (true/false), se non sei sicuro, lascia null.
- Controlla se l'appartamento ha l'aria condizionata (true/false), se non specificato, metti false.
- Di che tipo è il riscaldamento? “centralizzato” o “autonomo” (o “nonSpecificato” se non appare o non è chiaro).
- Stima un costo mensile totale (numero). Somma prezzo + condominio + utenze escluse se necessario. (per le utenze, usa una media di 100 euro al mese per elettricità, 10 euro per il gas in caso il riscaldamento fosse centralizzato, 50 altrimenti).
- Determina (sia dalla descrizione che dalle foto) un livello di arredamento: “nonArredato”, “parzialmenteArredato” o “completamenteArredato” (oppure “nonSpecificato” se manca).
- Se nel testo compare la durata del contratto, mettila (es. “12 mesi”, "18 mesi", “4+4”). Altrimenti null.
- Se nel testo compare una cauzione, metti il costo in euro, eventualmente calcolata (es. se appare “2 mensilità” metti il prezzo dell affitto raddoppiato, se appare "3000 euro" metti 3000). Altrimenti null.
- Se ci sono eventuali vincoli speciali (“no studenti”, “solo ragazze”, ecc.), mettili in un array di stringhe. Se non ci sono vincoli, lascia l'array vuoto.
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
        console.error(`No parsed output for listing ${l.id}:`, response)
        return null
      }

      return { id: l.id, ...response.output_parsed }
    })
    .map(p =>
      p.catch(err => {
        console.error(err)
        return null
      })
    )
)

await fs.writeFile(
  "./data/processed_listings.json",
  JSON.stringify(processedListings, null, 2),
  "utf-8"
)
