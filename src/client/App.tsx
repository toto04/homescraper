import { useState, useEffect } from "react"
import { ListingsPage } from "./components/ListingsPage"
import { SavedListingsPage } from "./components/SavedListingsPage"
import { HiddenListingsPage } from "./components/HiddenListingsPage"

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Simple client-side routing
  const renderPage = () => {
    switch (currentPath) {
      case "/saved":
        return <SavedListingsPage />
      case "/hidden":
        return <HiddenListingsPage />
      default:
        return <ListingsPage />
    }
  }

  return renderPage()
}
