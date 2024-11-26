import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"

export default function DocumentsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Документы"
        text="Управление документами и отчетами"
      />
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Список документов</h2>
          {/* Add documents list here */}
        </Card>
      </div>
    </DashboardShell>
  )
}
