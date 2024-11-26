import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Настройки"
        text="Управление настройками аккаунта"
      />
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Настройки профиля</h2>
          {/* Add settings form here */}
        </Card>
      </div>
    </DashboardShell>
  )
}
