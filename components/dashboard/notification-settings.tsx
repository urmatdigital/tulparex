"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";

interface NotificationSettings {
  notifications_enabled: boolean;
  user_id: string;
}

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('Ошибка аутентификации');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('telegram_users')
        .select('notifications_enabled')
        .eq('user_id', user.id)
        .single();

      // Если записи нет, создаем новую
      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabase
          .from('telegram_users')
          .insert({
            user_id: user.id,
            notifications_enabled: true
          })
          .select()
          .single();

        if (insertError) {
          setError('Не удалось создать настройки');
          return;
        }

        setEnabled(true);
        toast({
          title: "Настройки созданы",
          description: "Уведомления включены по умолчанию",
        });
        return;
      }

      // Если возникла другая ошибка при получении данных
      if (fetchError) {
        setError('Не удалось загрузить настройки');
        return;
      }

      // Успешно получили данные
      setEnabled(data?.notifications_enabled ?? true);

    } catch (error) {
      setError('Произошла неизвестная ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Ошибка аутентификации');
      }

      const newValue = !enabled;
      setIsLoading(true);

      const { error: updateError } = await supabase
        .from('telegram_users')
        .update({ notifications_enabled: newValue })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Ошибка при обновлении настроек');
      }

      setEnabled(newValue);
      toast({
        title: "Настройки обновлены",
        description: `Уведомления ${newValue ? 'включены' : 'отключены'}`,
      });
    } catch (error) {
      console.error('Toggle error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Произошла неизвестная ошибка';
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-red-500 text-center">{error}</div>
      </Card>
    );
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
          onCheckedChange={toggleNotifications}
          disabled={isLoading}
        />
      </div>
    </Card>
  );
}
