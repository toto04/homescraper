import Datastore from "nedb-promises"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import type {
  RawListing,
  ProcessedListing,
  GeoData,
  CombinedListing,
  UserActions,
} from "../types.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class Database {
  private rawListingsDb: Datastore<RawListing>
  private processedListingsDb: Datastore<ProcessedListing>
  private geoDataDb: Datastore<GeoData>
  private userActionsDb: Datastore<UserActions>

  constructor() {
    const dbPath = resolve(
      __dirname,
      process.env.NODE_ENV === "development" ? "../" : "../../",
      "../data/db"
    )

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

    this.userActionsDb = Datastore.create({
      filename: resolve(dbPath, "user_actions.db"),
      autoload: true,
    })

    // Create indexes for better performance
    this.rawListingsDb.ensureIndex({ fieldName: "id", unique: true })
    this.processedListingsDb.ensureIndex({ fieldName: "id", unique: true })
    this.geoDataDb.ensureIndex({ fieldName: "id", unique: true })
    this.userActionsDb.ensureIndex({ fieldName: "id", unique: true })
  }

  // Raw Listings methods
  async insertRawListing(listing: RawListing): Promise<void> {
    await this.rawListingsDb.update({ id: listing.id }, listing, {
      upsert: true,
    })
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
  async insertProcessedListing(listing: ProcessedListing): Promise<void> {
    await this.processedListingsDb.update({ id: listing.id }, listing, {
      upsert: true,
    })
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
  async insertGeoData(geoData: GeoData): Promise<void> {
    await this.geoDataDb.update({ id: geoData.id }, geoData, { upsert: true })
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

  // User Actions methods
  async getUserAction(listingId: string): Promise<UserActions | null> {
    return await this.userActionsDb.findOne({ id: listingId })
  }

  async upsertUserAction(
    userAction: Partial<UserActions> & { id: string }
  ): Promise<UserActions> {
    const now = new Date()
    const existing = await this.getUserAction(userAction.id)

    const updatedAction: UserActions = {
      id: userAction.id,
      isHidden: userAction.isHidden ?? existing?.isHidden ?? false,
      isSaved: userAction.isSaved ?? existing?.isSaved ?? false,
      notes: userAction.notes ?? existing?.notes ?? "",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    await this.userActionsDb.update({ id: userAction.id }, updatedAction, {
      upsert: true,
    })
    return updatedAction
  }

  async getAllUserActions(): Promise<UserActions[]> {
    return await this.userActionsDb.find({})
  }

  async getSavedListings(): Promise<UserActions[]> {
    return await this.userActionsDb.find({ isSaved: true })
  }

  async getHiddenListings(): Promise<UserActions[]> {
    return await this.userActionsDb.find({ isHidden: true })
  }

  async getCombinedSavedListings(): Promise<CombinedListing[]> {
    const savedActions = await this.getSavedListings()
    const savedIds = savedActions.map(a => a.id)

    if (savedIds.length === 0) return []

    const allListings = await this.getCombinedListings(true) // include hidden
    return allListings.filter(listing => savedIds.includes(listing.id))
  }

  async getCombinedHiddenListings(): Promise<CombinedListing[]> {
    const hiddenActions = await this.getHiddenListings()
    const hiddenIds = hiddenActions.map(a => a.id)

    if (hiddenIds.length === 0) return []

    const allListings = await this.getCombinedListings(true) // include hidden
    return allListings.filter(listing => hiddenIds.includes(listing.id))
  }

  // Combined data methods
  async getCombinedListings(
    includeHidden: boolean = false
  ): Promise<CombinedListing[]> {
    const [rawListings, processedListings, geoData, userActions] =
      await Promise.all([
        this.getRawListings(),
        this.getProcessedListings(),
        this.getGeoData(),
        this.getAllUserActions(),
      ])

    // Create lookup maps for better performance
    const processedMap = new Map(
      processedListings.filter(Boolean).map(p => [p.id, p])
    )
    const geoMap = new Map(geoData.map(g => [g.id, g]))
    const userActionsMap = new Map(userActions.map(u => [u.id, u]))

    // Combine the data
    const combined: CombinedListing[] = rawListings
      .map(listing => {
        const processedData = processedMap.get(listing.id)
        const geoDataItem = geoMap.get(listing.id)
        const userAction = userActionsMap.get(listing.id)

        if (!processedData || !geoDataItem) {
          return null
        }

        // Filter out hidden listings unless explicitly requested
        if (!includeHidden && userAction?.isHidden) {
          return null
        }

        const combinedListing: CombinedListing = {
          ...listing,
          processed: processedData,
          geo: geoDataItem,
          userActions: userAction || undefined,
        }

        return combinedListing
      })
      .filter((listing): listing is CombinedListing => listing !== null)

    return combined
  }

  async getCombinedListingById(id: string): Promise<CombinedListing | null> {
    const [rawListing, processedListing, geoDataItem, userAction] =
      await Promise.all([
        this.getRawListingById(id),
        this.getProcessedListingById(id),
        this.getGeoDataById(id),
        this.getUserAction(id),
      ])

    if (!rawListing || !processedListing || !geoDataItem) {
      return null
    }

    return {
      ...rawListing,
      processed: processedListing,
      geo: geoDataItem,
      userActions: userAction || undefined,
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await Promise.all([
      this.rawListingsDb.remove({}, { multi: true }),
      this.processedListingsDb.remove({}, { multi: true }),
      this.geoDataDb.remove({}, { multi: true }),
      this.userActionsDb.remove({}, { multi: true }),
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
