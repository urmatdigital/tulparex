"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Package } from "lucide-react"

interface TrackingFormProps {
  userId: string
}

export function TrackingForm({ userId }: TrackingFormProps) {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Введите трек номер",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("cargo")
        .insert([
          {
            tracking_number: trackingNumber.trim(),
            user_id: userId,
            status: "pending",
          },
        ])

      if (error) throw error

      toast({
        title: "Успешно",
        description: "Трек номер добавлен",
      })
      setTrackingNumber("")
    } catch (error) {
      console.error("Error adding tracking number:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить трек номер",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-lg font-semibold">Добавить трек номер</h3>
          <p className="text-sm text-muted-foreground">
            Введите трек номер для отслеживания
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Введите трек номер"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            <Package className="mr-2 h-4 w-4" />
            Добавить
          </Button>
        </div>
      </form>
    </Card>
  )
}
