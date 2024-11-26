"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  clientCode?: string
}

export function DashboardShell({
  children,
  clientCode,
  className,
  ...props
}: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <div
        className={`relative border-r bg-background ${
          sidebarCollapsed ? "w-[60px]" : "w-[240px]"
        } transition-all duration-300`}
      >
        <div className="absolute left-0 top-4 px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/image/tulpar.png"
              alt="Tulpar Logo"
              width={24}
              height={24}
              className="object-contain"
            />
            {!sidebarCollapsed && (
              <Image
                src="/image/tulpar_text_logo.png"
                alt="Tulpar Text Logo"
                width={80}
                height={20}
                className="object-contain"
              />
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-4 z-10"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
        <DashboardNav collapsed={sidebarCollapsed} clientCode={clientCode} />
      </div>
      <div className="flex-1">
        <main className="p-6">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
