import Datastore from "nedb-promises"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import type {
  RawListing,
  ProcessedListing,
  GeoData,
  CombinedListing,
} from "../types"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class Database {
  private rawListingsDb: Datastore<RawListing>
  private processedListingsDb: Datastore<ProcessedListing>
  private geoDataDb: Datastore<GeoData>

  constructor() {
    const dbPath = resolve(__dirname, "../../data/db")

    this.rawListingsDb = Datastore.create({
      filename: resolve(dbPath, "raw_listings.db"),
      autoload: true,
    })

    this.processedListingsDb = Datastore.create({
      filename: resolve(dbPath, "processed_listings.db"),
      autoload: true,
    })

    this.geoDataDb = Datastore.create({
      filename: resolve(dbPath, "geodata.db"),
      autoload: true,
    })

    // Create indexes for better performance
    this.rawListingsDb.ensureIndex({ fieldName: "id", unique: true })
    this.processedListingsDb.ensureIndex({ fieldName: "id", unique: true })
    this.geoDataDb.ensureIndex({ fieldName: "id", unique: true })
  }

  // Raw Listings methods
  async insertRawListing(listing: RawListing): Promise<RawListing> {
    return await this.rawListingsDb.insert(listing)
  }

  async insertRawListings(listings: RawListing[]): Promise<RawListing[]> {
    return await this.rawListingsDb.insert(listings)
  }

  async getRawListings(): Promise<RawListing[]> {
    return await this.rawListingsDb.find({})
  }

  async getRawListingById(id: string): Promise<RawListing | null> {
    return await this.rawListingsDb.findOne({ id })
  }

  // Processed Listings methods
  async insertProcessedListing(
    listing: ProcessedListing
  ): Promise<ProcessedListing> {
    return await this.processedListingsDb.insert(listing)
  }

  async insertProcessedListings(
    listings: ProcessedListing[]
  ): Promise<ProcessedListing[]> {
    return await this.processedListingsDb.insert(listings)
  }

  async getProcessedListings(): Promise<ProcessedListing[]> {
    return await this.processedListingsDb.find({})
  }

  async getProcessedListingById(id: string): Promise<ProcessedListing | null> {
    return await this.processedListingsDb.findOne({ id })
  }

  // GeoData methods
  async insertGeoData(geoData: GeoData): Promise<GeoData> {
    return await this.geoDataDb.insert(geoData)
  }

  async insertGeoDataBatch(geoData: GeoData[]): Promise<GeoData[]> {
    return await this.geoDataDb.insert(geoData)
  }

  async getGeoData(): Promise<GeoData[]> {
    return await this.geoDataDb.find({})
  }

  async getGeoDataById(id: string): Promise<GeoData | null> {
    return await this.geoDataDb.findOne({ id })
  }

  // Combined data methods
  async getCombinedListings(): Promise<CombinedListing[]> {
    const [rawListings, processedListings, geoData] = await Promise.all([
      this.getRawListings(),
      this.getProcessedListings(),
      this.getGeoData(),
    ])

    // Create lookup maps for better performance
    const processedMap = new Map(
      processedListings.filter(Boolean).map(p => [p.id, p])
    )
    const geoMap = new Map(geoData.map(g => [g.id, g]))

    // Combine the data
    const combined: CombinedListing[] = rawListings
      .map(listing => {
        const processedData = processedMap.get(listing.id)
        const geoDataItem = geoMap.get(listing.id)

        if (!processedData || !geoDataItem) {
          return null
        }

        return {
          ...listing,
          processed: processedData,
          geo: geoDataItem,
        }
      })
      .filter((listing): listing is CombinedListing => listing !== null)

    return combined
  }

  async getCombinedListingById(id: string): Promise<CombinedListing | null> {
    const [rawListing, processedListing, geoDataItem] = await Promise.all([
      this.getRawListingById(id),
      this.getProcessedListingById(id),
      this.getGeoDataById(id),
    ])

    if (!rawListing || !processedListing || !geoDataItem) {
      return null
    }

    return {
      ...rawListing,
      processed: processedListing,
      geo: geoDataItem,
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.rawListingsDb.remove({}, { multi: true }),
      this.processedListingsDb.remove({}, { multi: true }),
      this.geoDataDb.remove({}, { multi: true }),
    ])
  }

  async getStats(): Promise<{
    rawListings: number
    processedListings: number
    geoData: number
    combinedListings: number
  }> {
    const [rawCount, processedCount, geoCount] = await Promise.all([
      this.rawListingsDb.count({}),
      this.processedListingsDb.count({}),
      this.geoDataDb.count({}),
    ])

    const combinedListings = await this.getCombinedListings()

    return {
      rawListings: rawCount,
      processedListings: processedCount,
      geoData: geoCount,
      combinedListings: combinedListings.length,
    }
  }
}

// Singleton instance
export const db = new Database()
