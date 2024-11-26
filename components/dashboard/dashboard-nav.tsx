"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Package,
  Settings,
  Users,
  Building2,
  FileText,
  Home,
  BarChart3,
} from "lucide-react"

interface DashboardNavProps {
  clientCode?: string
  collapsed?: boolean
}

export function DashboardNav({ clientCode, collapsed }: DashboardNavProps) {
  const path = usePathname()

  const items = [
    {
      title: "Главная",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Статистика",
      href: "/dashboard/statistics",
      icon: BarChart3,
    },
    {
      title: "Отправления",
      href: "/dashboard/shipments",
      icon: Package,
    },
    {
      title: "Клиенты",
      href: "/dashboard/clients",
      icon: Users,
    },
    {
      title: "Филиалы",
      href: "/dashboard/branches",
      icon: Building2,
    },
    {
      title: "Документы",
      href: "/dashboard/documents",
      icon: FileText,
    },
    {
      title: "Настройки",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="flex h-full flex-col p-4">
      <div className="h-12" /> {/* Spacer for logo */}
      <div className="flex-1 space-y-1 pt-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start",
                path === item.href
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "my-1",
                collapsed ? "px-2" : "px-4"
              )}
            >
              <Icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </div>
      
      {clientCode && (
        <div className={cn(
          "mt-auto rounded-md bg-muted",
          collapsed ? "p-2" : "p-4"
        )}>
          {!collapsed && (
            <div className="text-sm font-medium mb-1">Ваш код клиента:</div>
          )}
          <div className={cn(
            "font-bold",
            collapsed ? "text-xs" : "text-lg"
          )}>{clientCode}</div>
        </div>
      )}
    </nav>
  )
}
