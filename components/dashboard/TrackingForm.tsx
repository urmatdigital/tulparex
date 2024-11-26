"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TrackingFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function TrackingForm({ userId, onSuccess }: TrackingFormProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, введите трек-номер",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Проверяем, существует ли уже такой трек-номер
      const { data: existingPackage } = await supabase
        .from('packages')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .maybeSingle();

      if (existingPackage) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Этот трек-номер уже существует в системе",
        });
        return;
      }

      // Добавляем новый пакет
      const { error: insertError } = await supabase
        .from('packages')
        .insert({
          user_id: userId,
          tracking_number: trackingNumber,
          description: description || 'Новая посылка',
          status: 'pending'
        });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Успешно",
        description: "Трек-номер добавлен",
      });

      // Очищаем форму
      setTrackingNumber("");
      setDescription("");

      // Вызываем callback для обновления списка
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Error adding tracking number:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось добавить трек-номер",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tracking-number">Трек-номер посылки</Label>
          <Input
            id="tracking-number"
            placeholder="Введите трек-номер"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Описание (необязательно)</Label>
          <Input
            id="description"
            placeholder="Описание посылки"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Добавление...
            </>
          ) : (
            "Добавить трек-номер"
          )}
        </Button>
      </form>
    </Card>
  );
}
