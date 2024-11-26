import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"

export default function BranchesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Филиалы"
        text="Управление филиалами компании"
      />
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Список филиалов</h2>
          {/* Add branches list here */}
        </Card>
      </div>
    </DashboardShell>
  )
}
