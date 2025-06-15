import { Home, MapPin, Filter } from "lucide-react"

export function Header() {
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
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
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
