import { useState } from "react"
import { Home, Heart, EyeOff, Menu } from "lucide-react"
import { Button } from "./ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "./ui/sheet"
import { cn } from "../lib/utils"

interface HeaderProps {
  currentPage?: "home" | "saved" | "hidden"
  onNavigate?: (path: string) => void
}

export function Header({ currentPage = "home", onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      window.history.pushState({}, "", path)
      window.dispatchEvent(new PopStateEvent("popstate"))
    }
    setMobileMenuOpen(false) // Close mobile menu after navigation
  }

  const navigationItems = [
    {
      id: "home",
      label: "Tutti gli Annunci",
      path: "/",
      icon: Home,
      description: "Visualizza tutti gli annunci disponibili",
    },
    {
      id: "saved",
      label: "Salvati",
      path: "/saved",
      icon: Heart,
      description: "I tuoi annunci preferiti salvati",
    },
    {
      id: "hidden",
      label: "Nascosti",
      path: "/hidden",
      icon: EyeOff,
      description: "Annunci che hai nascosto",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">HomeScraper</h1>
              <p className="text-xs text-muted-foreground">
                Trova il tuo prossimo appartamento
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-foreground">
                HomeScraper
              </h1>
            </div>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    {
                      navigationItems.find(item => item.id === currentPage)
                        ?.label
                    }
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px]">
                      {navigationItems.map(item => {
                        const Icon = item.icon
                        return (
                          <NavigationMenuLink
                            key={item.id}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer",
                              currentPage === item.id &&
                                "bg-accent text-accent-foreground"
                            )}
                            onClick={() => navigate(item.path)}
                          >
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4" />
                              <div className="text-sm font-medium leading-none">
                                {item.label}
                              </div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </NavigationMenuLink>
                        )
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Apri menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] pt-4">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <Home className="h-5 w-5" />
                  <span>HomeScraper</span>
                </SheetTitle>
                <SheetDescription>
                  Naviga tra le diverse sezioni dell'app
                </SheetDescription>
              </SheetHeader>

              <div className="grid gap-4 p-3">
                {navigationItems.map(item => {
                  const Icon = item.icon
                  return (
                    <SheetClose asChild key={item.id}>
                      <Button
                        variant={currentPage === item.id ? "default" : "ghost"}
                        className="w-full justify-start space-x-2 h-auto p-4"
                        onClick={() => navigate(item.path)}
                      >
                        <Icon className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        </div>
                      </Button>
                    </SheetClose>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
