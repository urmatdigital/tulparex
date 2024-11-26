"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserNav } from "@/components/auth/user-nav"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Search } from "@/components/search"

export function SiteHeader() {
  const pathname = usePathname()
  const isAuthPage = pathname === "/auth"

  if (isAuthPage) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden w-full flex-1 md:flex md:max-w-xs">
            <Search />
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <UserNav />
          </nav>
        </div>
      </div>
    </header>
  )
}
