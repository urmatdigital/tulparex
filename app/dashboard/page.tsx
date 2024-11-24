"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import ClientCode from "@/components/dashboard/client-code";
import NotificationSettings from "@/components/dashboard/notification-settings";
import { Card } from "@/components/ui/card";
import { Package, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserStats } from "@/components/dashboard/user-stats";
import { getServerSession } from "./auth";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
          };
        };
      };
    };
  }
}

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const initTelegram = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Проверяем, пришли ли мы из Telegram Mini Apps
        const tg = window.Telegram?.WebApp;
        if (tg?.initData) {
          const telegramUser = tg.initDataUnsafe.user;
          if (telegramUser) {
            // Сохраняем данные пользователя Telegram
            const { error } = await supabase
              .from('telegram_users')
              .upsert({
                id: telegramUser.id,
                user_id: user.id,
                username: telegramUser.username,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                language_code: telegramUser.language_code,
                is_premium: telegramUser.is_premium,
              }, {
                onConflict: 'id'
              });

            if (error) throw error;

            // Отправляем приветственное сообщение
            const { error: msgError } = await supabase
              .from('chat_messages')
              .insert({
                user_id: user.id,
                telegram_user_id: telegramUser.id,
                message: `Добро пожаловать, ${telegramUser.first_name}! Мы рады видеть вас в нашей системе.`,
                direction: 'outgoing'
              });

            if (msgError) throw msgError;

            toast({
              title: "Успешно!",
              description: "Ваш Telegram аккаунт подключен к системе",
            });
          }
        }
      } catch (error) {
        console.error('Error initializing Telegram:', error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось подключить Telegram",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initTelegram();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Личный кабинет</h1>
          </div>
          <Link href="https://t.me/tulparexpress_bot" target="_blank">
            <Button variant="secondary" className="group">
              Подключить уведомления
              <Bell className="ml-2 h-4 w-4 group-hover:animate-bounce" />
            </Button>
          </Link>
        </div>
        <UserStats />
        <DashboardTabs />
        <div className="grid gap-6 md:grid-cols-2">
          <ClientCode />
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
}