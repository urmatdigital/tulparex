"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, AlertCircle, Eye } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import Link from "next/link"

interface Package {
  id: string
  tracking_number: string
  status: string
  description: string
  created_at: string
  updated_at: string
}

interface CargoListProps {
  userId: string
}

const statusConfig = {
  pending: {
    label: "Ожидается",
    variant: "warning" as const,
  },
  in_transit: {
    label: "В пути",
    variant: "default" as const,
  },
  delivered: {
    label: "Доставлен",
    variant: "success" as const,
  },
  cancelled: {
    label: "Отменен",
    variant: "destructive" as const,
  },
}

export function CargoList({ userId }: CargoListProps) {
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from("packages")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) throw error
        setPackages(data)
      } catch (error) {
        console.error("Error:", error)
        setError("Не удалось загрузить список посылок")
      } finally {
        setIsLoading(false)
      }
    }

    const subscription = supabase
      .channel("packages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "packages",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPackages((current) => [payload.new as Package, ...current])
          } else if (payload.eventType === "DELETE") {
            setPackages((current) =>
              current.filter((pkg) => pkg.id !== payload.old.id)
            )
          } else if (payload.eventType === "UPDATE") {
            setPackages((current) =>
              current.map((pkg) =>
                pkg.id === payload.new.id ? (payload.new as Package) : pkg
              )
            )
          }
        }
      )
      .subscribe()

    fetchPackages()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <p>{error}</p>
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
        <Package className="h-8 w-8" />
        <p>У вас пока нет посылок</p>
      </div>
    )
  }

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Трек номер</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell className="font-medium">{pkg.tracking_number}</TableCell>
              <TableCell>
                <Badge variant={statusConfig[pkg.status as keyof typeof statusConfig].variant}>
                  {statusConfig[pkg.status as keyof typeof statusConfig].label}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(pkg.created_at), "PPp", { locale: ru })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <Link href={`/dashboard/tracking/${pkg.tracking_number}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Просмотреть детали</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}