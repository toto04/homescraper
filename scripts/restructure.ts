import fs from "node:fs/promises"
import neatCsv from "neat-csv"
import type { RawListing, Row } from "../src/types"

const csv = await fs.readFile("./data/input.csv", "utf-8")

const splitter = /(?<![\sA-Z])(?=[A-Z€])|(?<![\s\d\+\.\-\(])(?=\d)/gm

const rows = await neatCsv<Row>(csv)
const listings = rows.reduce<Record<string, RawListing>>((acc, row) => {
  const id = row["url-href"].match(/\/(\d+)\//)?.[1]
  if (!id) {
    console.warn(`No ID found for row: ${JSON.stringify(row)}`)
    return acc
  }

  if (acc[id]) {
    acc[id].images.push(row["images-src"])
    return acc
  }

  const rawparts = row.features.split(splitter)
  const features: Record<string, string> = {}
  for (let i = 0; i < rawparts.length; i += 2) {
    const key = rawparts[i].trim()
    const value = rawparts[i + 1]?.trim() || ""
    features[key] = value
  }

  const rawcosts = row.costs
    .split(splitter)
    .concat(row.addcosts.split(splitter))
  const costs: Record<string, string> = {}
  for (let i = 0; i < rawcosts.length; i += 2) {
    const key = rawcosts[i].trim()
    const value = rawcosts[i + 1]?.trim() || ""
    costs[key] = value
  }

  const others = row.others
    .split(splitter)
    .map(o => o.trim())
    .filter(Boolean)

  acc[id] = {
    id,
    title: row.title,
    url: row["url-href"],
    price: parseInt(row.price.replace(/\D/g, ""), 10),
    description: row.description,
    features,
    others,
    costs,
    images: row["images-src"] ? [row["images-src"]] : [],
  }

  return acc
}, {})

const ls = Object.values(listings)
console.log(`Found ${ls.length} unique listings.`)

await fs.writeFile("./data/listings.json", JSON.stringify(ls, null, 2), "utf-8")
