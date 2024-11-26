import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"

export default function ClientsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Клиенты"
        text="Управление клиентами и их данными"
      />
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Список клиентов</h2>
          {/* Add clients list here */}
        </Card>
      </div>
    </DashboardShell>
  )
}
