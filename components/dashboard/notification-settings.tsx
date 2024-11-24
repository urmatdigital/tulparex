"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('telegram_users')
        .select('notifications_enabled')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setEnabled(data.notifications_enabled);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('telegram_users')
        .update({ notifications_enabled: checked })
        .eq('user_id', user.id);

      if (error) throw error;

      setEnabled(checked);
      toast({
        title: "Настройки обновлены",
        description: checked ? "Уведомления включены" : "Уведомления отключены",
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить настройки",
      });
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications" className="text-sm font-medium">
          Уведомления в Telegram
        </Label>
        <Switch
          id="notifications"
          checked={enabled}
          onCheckedChange={handleToggle}
        />
      </div>
    </Card>
  );
}
