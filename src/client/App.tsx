import { useState, useEffect } from "react"
import { ListingsPage } from "./components/ListingsPage"
import { SavedListingsPage } from "./components/SavedListingsPage"
import { HiddenListingsPage } from "./components/HiddenListingsPage"

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [currentSearch, setCurrentSearch] = useState(window.location.search)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
      setCurrentSearch(window.location.search)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Get listing ID from URL parameters
  const urlParams = new URLSearchParams(currentSearch)
  const openListingId = urlParams.get("listing")

  // Simple client-side routing
  const renderPage = () => {
    switch (currentPath) {
      case "/saved":
        return <SavedListingsPage openListingId={openListingId} />
      case "/hidden":
        return <HiddenListingsPage openListingId={openListingId} />
      default:
        return <ListingsPage openListingId={openListingId} />
    }
  }

  return renderPage()
}
