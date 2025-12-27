"use client"

import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  showStats?: boolean;
  isLoading?: boolean;
}

const navMenu = [
  {
    title: "Головна",
    href: "/"
  },
  {
    title: "Статистика",
    href: "/dashboard"
  },
  {
    title: "+Новий звіт",
    href: "/reports/new"
  },
  {
    title: "Наші котики",
    href: "/birthdays"
  }
]

export default function Header({ showStats = true, isLoading = false }: HeaderProps) {
  const [isLoaded] = useState(true);
  const isMobile = useIsMobile()

  return (
    <header className={`relative top-0 z-40 border-b border-zinc-800/50 backdrop-blur-sm transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-linear-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
            <span className="text-2xl font-black">R</span>
          </div>
          <div className="shrink-none">
            <h1 className="text-2xl font-black tracking-tight bg-linear-to-r from-yellow-500 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">RUBAK</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Tactical AirForce</p>
          </div>
        </Link>
        <nav className="grow">
          <ul className={cn("w-full flex items-center justify-center gap-3 font-medium", isMobile && 'flex-col')}>
            {navMenu.map((item, index) => (
              <li key={index}>
                <Link href={item.href} className="inline-block px-6 py-4 text-sm text-neutral-200 hover:text-white transition-color">{item.title}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          {showStats && (
            <>
              <span className="text-sm text-zinc-400">
                {new Intl.DateTimeFormat("uk-UA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }).format(new Date())}
              </span>
              <div className="flex items-center gap-2">
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
