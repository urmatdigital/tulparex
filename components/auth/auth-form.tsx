"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "./hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export default function AuthForm() {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const { isLoading, signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "no_profile") {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Профиль не найден. Пожалуйста, зарегистрируйтесь.",
      });
      setIsLogin(false);
    }
  }, [searchParams, toast]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isLogin) {
        await signIn(values);
        toast({
          title: "Успешно!",
          description: "Вы успешно вошли в систему",
        });
      } else {
        await signUp(values);
        toast({
          title: "Успешно!",
          description: "Регистрация завершена",
        });
      }
      router.push("/dashboard");
      router.refresh();
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
    }
  };

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
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Загрузка...
              </span>
            ) : isLogin ? (
              "Войти"
            ) : (
              "Зарегистрироваться"
            )}
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