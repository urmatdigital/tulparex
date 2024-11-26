"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Camera } from "lucide-react";

const formSchema = z.object({
  full_name: z.string().min(2, "Минимум 2 символа"),
  phone: z.string().min(10, "Введите корректный номер телефона"),
});

export default function ProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      phone: "",
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          full_name: data.full_name || "",
          phone: data.phone || "",
        });
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить профиль",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: values.full_name,
          phone: values.phone,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: "id"
        });

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Профиль обновлен",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обновить профиль",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsSaving(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Пользователь не авторизован");

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Размер файла не должен превышать 5MB");
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        throw new Error("Пожалуйста, загрузите изображение");
      }

      // Create a unique filename with user's folder
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${timestamp}.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl) {
        try {
          const oldFileName = avatarUrl.split("/").slice(-2).join("/");
          if (oldFileName) {
            const { error: deleteError } = await supabase.storage
              .from("avatars")
              .remove([oldFileName]);
            if (deleteError) {
              console.error("Error deleting old avatar:", deleteError);
            }
          }
        } catch (error) {
          console.error("Error processing old avatar deletion:", error);
        }
      }

      // Upload new avatar
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          upsert: true,
          cacheControl: "3600",
          contentType: file.type
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw new Error(`Ошибка загрузки: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile update error details:", updateError);
        throw new Error(`Ошибка обновления профиля: ${updateError.message}`);
      }

      setAvatarUrl(publicUrl);
      toast({
        title: "Успешно",
        description: "Аватар обновлен",
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обновить аватар",
      });
    } finally {
      setIsSaving(false);
      // Reset file input
      event.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="flex flex-col items-center space-y-6 p-8">
          {/* Avatar Section */}
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

          {/* Profile Info */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Профиль пользователя
            </h2>
            <p className="text-sm text-muted-foreground">
              Управление личной информацией
            </p>
          </div>

          {/* Form */}
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
      </Card>
    </div>
  );
}