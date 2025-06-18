import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a shareable URL for a specific listing
 * @param listingId - The ID of the listing
 * @param path - Optional path (defaults to current path)
 * @returns The shareable URL
 */
export function generateListingUrl(listingId: string, path?: string): string {
  const url = new URL(window.location.href)
  if (path) {
    url.pathname = path
  }
  url.searchParams.set("listing", listingId)
  return url.toString()
}

/**
 * Extract listing ID from current URL
 * @returns The listing ID if present, null otherwise
 */
export function getListingIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get("listing")
}

/**
 * Update URL with listing parameter using soft navigation
 * @param listingId - The listing ID to add to URL
 */
export function updateUrlWithListing(listingId: string): void {
  const url = new URL(window.location.href)
  url.searchParams.set("listing", listingId)
  window.history.pushState({}, "", url.toString())
}

/**
 * Remove listing parameter from URL using soft navigation
 */
export function removeListingFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete("listing")
  window.history.pushState({}, "", url.toString())
}

/**
 * Check if a listing should be opened based on URL parameters
 * Used when loading a page to auto-open listing dialogs from shared URLs
 * @param listingId - The listing ID to check
 * @returns Whether this listing should be opened
 */
export function shouldOpenListingFromUrl(listingId: string): boolean {
  const urlListingId = getListingIdFromUrl()
  return urlListingId === listingId
}
