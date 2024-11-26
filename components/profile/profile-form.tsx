import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera } from "lucide-react"

const formSchema = z.object({
  full_name: z.string().min(2, "Минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
})

interface ProfileFormProps {
  onProfileUpdate: () => void
  initialData?: any
}

export function ProfileForm({ onProfileUpdate, initialData }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      phone: "",
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        full_name: initialData.full_name || "",
        phone: initialData.phone || "",
      })
      setAvatarUrl(initialData.avatar_url)
    }
  }, [initialData, form])

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      setIsSaving(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error("Пользователь не авторизован")

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Размер файла не должен превышать 5MB")
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Пожалуйста, загрузите изображение")
      }

      // Create a unique filename with user's folder
      const timestamp = Date.now()
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${timestamp}.${fileExt}`

      // Delete old avatar if exists
      if (avatarUrl) {
        try {
          const oldFileName = avatarUrl.split("/").slice(-2).join("/")
          if (oldFileName) {
            const { error: deleteError } = await supabase.storage
              .from("avatars")
              .remove([oldFileName])
            if (deleteError) {
              console.error("Error deleting old avatar:", deleteError)
            }
          }
        } catch (error) {
          console.error("Error processing old avatar deletion:", error)
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type
        })

      if (uploadError) {
        console.error("Upload error details:", uploadError)
        throw new Error(`Ошибка загрузки: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("Profile update error details:", updateError)
        throw new Error(`Ошибка обновления профиля: ${updateError.message}`)
      }

      setAvatarUrl(publicUrl)
      onProfileUpdate()
      toast({
        title: "Успешно",
        description: "Аватар обновлен",
      })
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обновить аватар",
      })
    } finally {
      setIsSaving(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Пользователь не авторизован")

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: values.full_name,
          phone: values.phone,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "id"
        })

      if (error) throw error

      onProfileUpdate()
      toast({
        title: "Успешно!",
        description: "Профиль обновлен",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обновить профиль",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
          <AvatarImage
            src={avatarUrl || ""}
            alt="Profile"
            className="object-cover"
          />
          <AvatarFallback className="text-2xl">
            {form.getValues("full_name")?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-2 -right-2">
          <label
            htmlFor="avatar-upload"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary/90"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={isSaving}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ФИО</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Иванов Иван Иванович"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+996 XXX XXX XXX"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="min-w-[200px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить изменения"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
