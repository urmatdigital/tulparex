"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface ProfileInfoProps {
  userId: string
}

export function ProfileInfo({ userId }: ProfileInfoProps) {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить профиль",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, userId, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={profile?.avatar_url}
            alt={profile?.full_name || "Profile"}
          />
          <AvatarFallback>
            {profile?.full_name?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {profile?.full_name || "Имя не указано"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {profile?.phone || "Телефон не указан"}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/profile">Редактировать профиль</Link>
        </Button>
      </div>
    </div>
  )
}
