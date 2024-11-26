import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"

export default function StatisticsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Статистика"
        text="Просмотр статистики и аналитики"
      />
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Общая статистика</h2>
          {/* Add statistics content here */}
        </Card>
      </div>
    </DashboardShell>
  )
}
