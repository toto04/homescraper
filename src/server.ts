import Fastify from "fastify"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"
import { db } from "./lib/database"
import type { RawListing, ProcessedListing, GeoData } from "./types"
import { processListing } from "./lib/scrape"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const fastify = Fastify({
  logger: true,
})

// Register CORS for client requests
await fastify.register(import("@fastify/cors"), {
  origin: true,
})

// Serve static files from the client build
await fastify.register(import("@fastify/static"), {
  root: resolve(__dirname, "../dist/client"),
  prefix: "/",
})

// API Routes
fastify.get("/api/listings", async (_request, reply) => {
  try {
    const listings = await db.getCombinedListings()
    return { data: listings, count: listings.length }
  } catch (error) {
    fastify.log.error(error)
    reply.status(500).send({ error: "Failed to fetch listings" })
  }
})

fastify.get<{ Params: { id: string } }>(
  "/api/listings/:id",
  async (request, reply) => {
    try {
      const { id } = request.params
      const listing = await db.getCombinedListingById(id)

      if (!listing) {
        reply.status(404).send({ error: "Listing not found" })
        return
      }

      return { data: listing }
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ error: "Failed to fetch listing" })
    }
  }
)

fastify.get("/api/raw-listings", async (_request, reply) => {
  try {
    const listings = await db.getRawListings()
    return { data: listings, count: listings.length }
  } catch (error) {
    fastify.log.error(error)
    reply.status(500).send({ error: "Failed to fetch raw listings" })
  }
})

fastify.get("/api/processed-listings", async (_request, reply) => {
  try {
    const listings = await db.getProcessedListings()
    return { data: listings, count: listings.length }
  } catch (error) {
    fastify.log.error(error)
    reply.status(500).send({ error: "Failed to fetch processed listings" })
  }
})

fastify.get("/api/geodata", async (_request, reply) => {
  try {
    const geoData = await db.getGeoData()
    return { data: geoData, count: geoData.length }
  } catch (error) {
    fastify.log.error(error)
    reply.status(500).send({ error: "Failed to fetch geodata" })
  }
})

fastify.get("/api/stats", async (_request, reply) => {
  try {
    const stats = await db.getStats()
    return { data: stats }
  } catch (error) {
    fastify.log.error(error)
    reply.status(500).send({ error: "Failed to fetch stats" })
  }
})

// Health check endpoint
fastify.get("/api/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() }
})

fastify.post<{ Body: { html: string; url: string } }>(
  "/api/parse",
  async (request, reply) => {
    try {
      const { html, url } = request.body
      if (!html || typeof html !== "string") {
        reply.status(400).send({ success: false, error: "Invalid HTML input" })
        return
      }
      if (!url || typeof url !== "string" || !url.includes("immobiliare.it")) {
        reply.status(400).send({ success: false, error: "Invalid URL input" })
        return
      }

      const data = await processListing({ html, url })

      return reply.send({ success: data !== null, data })
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ success: false, error: "Failed to parse HTML" })
    }
  }
)

// Data import endpoints (for administrative use)
fastify.post<{ Body: { listings: RawListing[] } }>(
  "/api/import/raw-listings",
  async (request, reply) => {
    try {
      const { listings } = request.body

      if (!Array.isArray(listings)) {
        reply.status(400).send({ error: "Expected array of listings" })
        return
      }

      await db.insertRawListings(listings)
      return { success: true, imported: listings.length }
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ error: "Failed to import raw listings" })
    }
  }
)

fastify.post<{ Body: { listings: ProcessedListing[] } }>(
  "/api/import/processed-listings",
  async (request, reply) => {
    try {
      const { listings } = request.body

      if (!Array.isArray(listings)) {
        reply
          .status(400)
          .send({ error: "Expected array of processed listings" })
        return
      }

      await db.insertProcessedListings(listings)
      return { success: true, imported: listings.length }
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ error: "Failed to import processed listings" })
    }
  }
)

fastify.post<{ Body: { geoData: GeoData[] } }>(
  "/api/import/geodata",
  async (request, reply) => {
    try {
      const { geoData } = request.body

      if (!Array.isArray(geoData)) {
        reply.status(400).send({ error: "Expected array of geodata" })
        return
      }

      await db.insertGeoDataBatch(geoData)
      return { success: true, imported: geoData.length }
    } catch (error) {
      fastify.log.error(error)
      reply.status(500).send({ error: "Failed to import geodata" })
    }
  }
)

// Clear data endpoint (for administrative use)
fastify.delete("/api/data", async (_request, reply) => {
  try {
    await db.clearAllData()
    return { success: true, message: "All data cleared" }
  } catch (error) {
    fastify.log.error(error)
    reply.status(500).send({ error: "Failed to clear data" })
  }
})

// Catch-all route for SPA
fastify.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith("/api")) {
    reply.status(404).send({ error: "API endpoint not found" })
    return
  }

  // Serve index.html for all non-API routes (SPA routing)
  reply.sendFile("index.html")
})

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    const host = process.env.HOST || "localhost"

    await fastify.listen({ port, host })
    fastify.log.info(`Server listening on http://${host}:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

export { fastify, start }
