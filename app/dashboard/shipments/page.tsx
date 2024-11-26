import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const sampleShipments = [
  {
    id: "TRK-001",
    status: "В пути",
    origin: "Москва",
    destination: "Санкт-Петербург",
    date: "2024-03-26",
  },
  {
    id: "TRK-002",
    status: "Доставлено",
    origin: "Казань",
    destination: "Москва",
    date: "2024-03-25",
  },
  {
    id: "TRK-003",
    status: "Обработка",
    origin: "Екатеринбург",
    destination: "Казань",
    date: "2024-03-26",
  },
]

function getStatusColor(status: string) {
  switch (status) {
    case "В пути":
      return "blue"
    case "Доставлено":
      return "green"
    case "Обработка":
      return "yellow"
    default:
      return "gray"
  }
}

export default function ShipmentsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Отправления"
        text="Управление и отслеживание отправлений"
      />
      <div className="grid gap-6">
        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Трек номер</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Откуда</TableHead>
                <TableHead>Куда</TableHead>
                <TableHead>Дата</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.id}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(shipment.status)}>
                      {shipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{shipment.origin}</TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                  <TableCell>{shipment.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </DashboardShell>
  )
}
