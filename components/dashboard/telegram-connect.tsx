"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MessageSquare, Loader2 } from "lucide-react";

export default function TelegramConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkTelegramConnection();
  }, []);

  const checkTelegramConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("telegram_chat_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setIsConnected(!!data?.telegram_chat_id);
    } catch (error) {
      console.error("Error checking Telegram connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    window.open("https://t.me/tulparexpress_bot", "_blank");
    toast({
      title: "Подключение Telegram",
      description: "Перейдите в бот и отправьте команду /start",
    });
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-md mx-auto text-center">
      <MessageSquare className="h-16 w-16 mx-auto mb-4 text-primary" />
      <h3 className="text-2xl font-semibold mb-4">
        {isConnected ? "Telegram подключен" : "Подключите Telegram"}
      </h3>
      <p className="text-muted-foreground mb-6">
        {isConnected
          ? "Вы будете получать уведомления о статусе ваших грузов в Telegram"
          : "Подключите бота для получения уведомлений о статусе ваших грузов"}
      </p>
      <Button
        onClick={handleConnect}
        className="w-full"
        variant={isConnected ? "outline" : "default"}
      >
        {isConnected ? "Перейти в бот" : "Подключить Telegram"}
      </Button>
    </Card>
  );
}