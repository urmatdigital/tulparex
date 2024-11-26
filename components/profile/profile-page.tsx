"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ProfileForm } from "./profile-form"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera, ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      if (!user) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Пользователь не авторизован",
        })
        router.push('/auth')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setUserData({ ...user, profile })
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные профиля",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <Card className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Профиль</h2>
          <div className="flex items-center gap-2">
            <Switch
              checked={isEditing}
              onCheckedChange={setIsEditing}
              id="edit-mode"
            />
            <Label htmlFor="edit-mode">Режим редактирования</Label>
          </div>
        </div>

        <div className="mx-auto max-w-2xl">
          {isEditing ? (
            <ProfileForm
              initialData={userData}
              isEditing={isEditing}
              onSave={fetchUserData}
            />
          ) : (
            <div className="flex flex-col items-center space-y-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage
                  src={userData?.avatar_url || ""}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl">
                  {userData?.full_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h2 className="text-2xl font-semibold">
                  {userData?.full_name || "Имя не указано"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {userData?.phone || "Телефон не указан"}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
