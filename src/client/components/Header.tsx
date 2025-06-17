import { Home, MapPin, Filter, Heart, EyeOff } from "lucide-react"
import { Button } from "./ui/button"

interface HeaderProps {
  currentPage?: "home" | "saved" | "hidden"
  onNavigate?: (path: string) => void
}

export function Header({ currentPage = "home", onNavigate }: HeaderProps) {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      window.history.pushState({}, "", path)
      window.dispatchEvent(new PopStateEvent("popstate"))
    }
  }
  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Milano Home Finder
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Trova il tuo prossimo appartamento a Milano
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant={currentPage === "home" ? "default" : "outline"}
              size="sm"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Tutti gli Annunci
            </Button>

            <Button
              variant={currentPage === "saved" ? "default" : "outline"}
              size="sm"
              onClick={() => navigate("/saved")}
            >
              <Heart className="w-4 h-4 mr-2" />
              Salvati
            </Button>

            <Button
              variant={currentPage === "hidden" ? "secondary" : "outline"}
              size="sm"
              onClick={() => navigate("/hidden")}
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Nascosti
            </Button>
          </div>

          <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Milano</span>
            </div>
            <div className="flex items-center space-x-1">
              <Filter className="w-4 h-4" />
              <span>Filtri avanzati</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
