"use client"

import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Loader2, Menu, X, ChevronDown } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  showStats?: boolean
  isLoading?: boolean
}

interface MenuItem {
  title: string
  href?: string
  submenu?: {
    title: string
    href: string
  }[]
}

const navMenu: MenuItem[] = [
  {
    title: "Головна",
    href: "/"
  },
  {
    title: "Статистика",
    href: "/dashboard"
  },
  {
    title: "Погода",
    href: "/weather"
  },
  {
    title: "Звіти",
    submenu: [
      {
        title: "+ Новий звіт FPV",
        href: "/reports/new"
      }
    ]
  },
  // {
  //   title: "Наші котики",
  //   href: "/birthdays"
  // }
]

export default function Header({ showStats = true, isLoading = false }: HeaderProps) {
  const [isLoaded] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setOpenSubmenu(null)
  }

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title)
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-neutral-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70 transition-all duration-1000",
      isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
    )}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-amber-500/20">
              <span className="text-xl md:text-2xl font-black">R</span>
            </div>
            <div className="block">
              <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                KABUR18
              </h1>
              <p className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider">
                Tactical AirForce
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navMenu.map((item, index) => (
              <div key={index} className="relative group">
                {item.submenu ? (
                  <>
                    <button
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
                      onMouseEnter={() => setOpenSubmenu(item.title)}
                    >
                      {item.title}
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </button>
                    {/* Dropdown */}
                    <div
                      className="absolute top-full left-0 mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                      onMouseLeave={() => setOpenSubmenu(null)}
                    >
                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl shadow-black/20 overflow-hidden">
                        {item.submenu.map((subitem, subindex) => (
                          <Link
                            key={subindex}
                            href={subitem.href}
                            className="block px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors border-b border-zinc-800 last:border-0"
                          >
                            {subitem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href!}
                    className="block px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {showStats && !isMobile && (
              <>
                <span className="hidden lg:block text-xs text-zinc-500">
                  {new Intl.DateTimeFormat("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: 'numeric'
                  }).format(new Date())}
                </span>
                <div className="flex items-center gap-2">
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
                  <div className="hidden lg:block w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                </div>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/50"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-800 py-4 animate-in slide-in-from-top-5 duration-200">
            <nav className="flex flex-col space-y-1">
              {navMenu.map((item, index) => (
                <div key={index}>
                  {item.submenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.title)}
                        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors rounded-lg"
                      >
                        {item.title}
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform",
                            openSubmenu === item.title && "rotate-180"
                          )}
                        />
                      </button>
                      {openSubmenu === item.title && (
                        <div className="mt-1 ml-4 space-y-1 animate-in slide-in-from-top-2 duration-150">
                          {item.submenu.map((subitem, subindex) => (
                            <Link
                              key={subindex}
                              href={subitem.href}
                              onClick={toggleMobileMenu}
                              className="block px-4 py-2 text-sm text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-colors rounded-lg"
                            >
                              {subitem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={toggleMobileMenu}
                      className="block px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors rounded-lg"
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile stats */}
            {showStats && (
              <div className="flex items-center justify-between px-4 py-3 mt-4 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">
                  {new Intl.DateTimeFormat("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  }).format(new Date())}
                </span>
                <div className="flex items-center gap-2">
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                  <span className="text-xs text-green-500 font-medium">Online</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}