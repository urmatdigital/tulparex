"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card } from "@/components/ui/card"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { UserStatsContainer } from "@/components/dashboard/user-stats"

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        if (!user) {
          toast({
            variant: "destructive",
            title: "Ошибка",
            description: "Пользователь не авторизован",
          })
          router.push('/auth')
          return
        }
        setUserId(user.id)
      } catch (error) {
        console.error("Error:", error)
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные пользователя",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [supabase, toast, router])

  if (isLoading) {
    return (
      <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Панель управления
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Отслеживайте свои посылки, управляйте профилем и подключайте Telegram бота
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 p-6">
          <DashboardTabs />
        </Card>
        <Card className="col-span-3 p-6">
          <Suspense fallback={<StatsLoader />}>
            <UserStatsContainer userId={userId} />
          </Suspense>
        </Card>
      </div>
    </div>
  )
}

function StatsLoader() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  )
}
