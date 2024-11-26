"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const navigation = [
  {
    name: "Главная",
    href: "/",
  },
  {
    name: "Отслеживание",
    href: "/dashboard",
  },
  {
    name: "О нас",
    href: "/about",
  },
  {
    name: "Контакты",
    href: "/contact",
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Image src="/logo.svg" alt="Tulpar Express" width={32} height={32} />
        <span className="hidden font-bold sm:inline-block">
          Tulpar Express
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === item.href
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
