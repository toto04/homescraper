import fs from "node:fs/promises"
import listings from "../data/processed_listings.json" with { type: "json" }
import { Client, TravelMode } from "@googlemaps/google-maps-services-js"
import { PlacesClient } from "@googlemaps/places"
import type { GeoData } from "../src/types"

if (!process.env["GOOGLE_API_KEY"]) {
  throw new Error("GOOGLE_API_KEY environment variable is not set")
}
const key = process.env["GOOGLE_API_KEY"]

const geoclient = new Client({})
const placesClient = new PlacesClient({
  apiKey: key,
})

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

const geodata: GeoData[] = await Promise.all(
  listings
    .filter(l => l?.indirizzo)
    .map(async l => {
      const address = l!.indirizzo
      const geodataPoint: GeoData = {
        id: l!.id,
        address,
        geocode: null,
        deltaDuomo: null,
        metro: null,
      }

      const res = await geoclient.geocode({ params: { key, address } })
      if (res.data.results.length === 0) {
        console.warn(`No geocode results for address: ${address}`)
        return geodataPoint
      }
      const geocode = res.data.results[0]
      geodataPoint.geocode = geocode

      const deltaDuomo = calcCrow(
        geocode.geometry.location.lat,
        geocode.geometry.location.lng,
        45.46406877289005,
        9.191486284885102
      )
      geodataPoint.deltaDuomo = deltaDuomo

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
        !metro ||
        !metro.location ||
        !metro.location.latitude ||
        !metro.location.longitude
      ) {
        console.warn(`No metro station found near: ${address}`)
        return geodataPoint
      }

      let location = {
        lat: metro.location.latitude,
        lng: metro.location.longitude,
      }

      let metroDistance = await geoclient.distancematrix({
        params: {
          key,
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
        name: metro.displayName?.text || "What is this, a metro station?",
        location,
        distance: metroDistance.data.rows[0].elements[0].duration,
      }

      console.log(`Processed geodata for: ${l!.id} (${l!.indirizzo})`)
      return geodataPoint
    })
    .map((p, i) =>
      p.catch(err => {
        const id = listings[i]?.id || "unknown"
        console.error(`Error processing geodata for listing ${id}:`, err)
        return {
          id,
          address: "ERROR",
          geocode: null,
          deltaDuomo: null,
          metro: null,
        } satisfies GeoData
      })
    )
)

await fs.writeFile(
  "./data/geodata.json",
  JSON.stringify(geodata, null, 2),
  "utf-8"
)

console.log(`Found ${geodata.length} geodata points.`)
