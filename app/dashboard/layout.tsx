import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Личный кабинет | Tulpar Express",
  description: "Управление посылками и отслеживание доставок",
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex-1">
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
