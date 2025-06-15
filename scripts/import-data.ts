import { readFile } from "fs/promises"
import { resolve } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import { db } from "../src/lib/database"
import type { RawListing, ProcessedListing, GeoData } from "../src/types"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function loadJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    const fullPath = resolve(__dirname, "..", filePath)
    const content = await readFile(fullPath, "utf-8")
    return JSON.parse(content) as T[]
  } catch (error) {
    console.error(`Failed to load ${filePath}:`, error)
    return []
  }
}

async function importData() {
  console.log("🚀 Starting data import...")

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await db.clearAllData()

    // Load data from JSON files
    console.log("📚 Loading data from JSON files...")
    const [rawListings, processedListings, geoData] = await Promise.all([
      loadJsonFile<RawListing>("data/listings.json"),
      loadJsonFile<ProcessedListing>("data/processed_listings.json"),
      loadJsonFile<GeoData>("data/geodata.json"),
    ])

    console.log(`📊 Loaded data:`)
    console.log(`  - Raw listings: ${rawListings.length}`)
    console.log(`  - Processed listings: ${processedListings.length}`)
    console.log(`  - Geo data: ${geoData.length}`)

    // Import data into database
    console.log("💾 Importing data into database...")

    if (rawListings.length > 0) {
      console.log("📝 Importing raw listings...")
      await db.insertRawListings(rawListings)
      console.log(`✅ Imported ${rawListings.length} raw listings`)
    }

    if (processedListings.length > 0) {
      console.log("🔄 Importing processed listings...")
      // Filter out any null/undefined entries
      const validProcessedListings = processedListings.filter(Boolean)
      await db.insertProcessedListings(validProcessedListings)
      console.log(
        `✅ Imported ${validProcessedListings.length} processed listings`
      )
    }

    if (geoData.length > 0) {
      console.log("🌍 Importing geo data...")
      await db.insertGeoDataBatch(geoData)
      console.log(`✅ Imported ${geoData.length} geo data entries`)
    }

    // Get final stats
    console.log("📈 Getting final statistics...")
    const stats = await db.getStats()
    console.log(`\n📊 Final database statistics:`)
    console.log(`  - Raw listings: ${stats.rawListings}`)
    console.log(`  - Processed listings: ${stats.processedListings}`)
    console.log(`  - Geo data: ${stats.geoData}`)
    console.log(`  - Combined listings: ${stats.combinedListings}`)

    console.log("\n🎉 Data import completed successfully!")
  } catch (error) {
    console.error("❌ Data import failed:", error)
    process.exit(1)
  }
}

// Run the import if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importData()
    .then(() => {
      console.log("👋 Import script finished")
      process.exit(0)
    })
    .catch(error => {
      console.error("💥 Import script failed:", error)
      process.exit(1)
    })
}

export { importData }
