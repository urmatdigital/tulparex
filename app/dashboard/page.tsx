"use server"

import { Suspense } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TrackingForm } from "@/components/dashboard/tracking-form"
import { CargoList } from "@/components/dashboard/cargo-list"
import { UserStats } from "@/components/dashboard/user-stats"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({
    cookies: () => cookieStore
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Check if user profile exists
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error fetching profile:", profileError)
    redirect("/auth")
  }

  if (!profile) {
    redirect("/auth?error=no_profile")
  }

  return (
    <DashboardShell clientCode={profile?.client_code}>
      <DashboardHeader
        heading="Панель управления"
        text="Отслеживайте посылки и управляйте доставками"
      />
      <div className="grid gap-6">
        <Card className="p-6">
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            }
          >
            <UserStats userId={user.id} />
          </Suspense>
        </Card>
        <Card className="p-6">
          <div className="space-y-8">
            <TrackingForm userId={user.id} />
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              }
            >
              <CargoList userId={user.id} />
            </Suspense>
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
}