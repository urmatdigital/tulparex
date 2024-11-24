"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export default function AuthForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) throw error;

        toast({
          title: "Успешно!",
          description: "Вы успешно вошли в систему",
        });

        router.push("/dashboard");
        router.refresh();
      } else {
        // Сначала проверяем, существует ли пользователь
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', values.email)
          .single();

        if (existingUser) {
          throw new Error("Пользователь с таким email уже существует");
        }

        // Пытаемся создать нового пользователя
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              email_confirm: true
            }
          },
        });

        if (error) {
          // Если ошибка содержит "User already registered", значит пользователь существует в Auth
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Ошибка",
              description: "Пользователь с таким email уже существует",
            });
            return;
          }
          throw error;
        }

        toast({
          title: "Успешно!",
          description: "Регистрация завершена",
        });

        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      let errorMessage = "Произошла ошибка";
      
      if (error.message) {
        switch (error.message) {
          case "Email not confirmed":
            errorMessage = "Email не подтвержден. Проверьте вашу почту.";
            break;
          case "Invalid login credentials":
            errorMessage = "Неверный email или пароль";
            break;
          case "User already registered":
            errorMessage = "Пользователь с таким email уже существует. Проверьте почту для подтверждения.";
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  disabled={isLoading}
                  className="bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  disabled={isLoading}
                  className="bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Button 
            type="submit" 
            className="w-full font-semibold" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading
              ? "Загрузка..."
              : isLogin
              ? "Войти"
              : "Зарегистрироваться"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full hover:bg-primary/5"
            onClick={() => {
              setIsLogin(!isLogin);
              form.reset();
            }}
            disabled={isLoading}
          >
            {isLogin
              ? "Нет аккаунта? Зарегистрироваться"
              : "Уже есть аккаунт? Войти"}
          </Button>
        </div>
      </form>
    </Form>
  );
}