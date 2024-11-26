"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";

interface ClientCode {
  code: string;
  description: string;
  is_active: boolean;
}

export const useClientCode = () => {
  const [code, setCode] = useState<ClientCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const loadCode = async (userId: string) => {
    try {
      if (!userId) {
        throw new Error('ID пользователя не указан');
      }

      setIsLoading(true);
      setError(null);

      // Проверяем существование профиля
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error('Профиль пользователя не найден');
      }

      // Получаем код клиента
      const { data: existingCode, error: fetchError } = await supabase
        .from('client_codes')
        .select('code, description, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existingCode) {
        setCode(existingCode);
        return;
      }

      // Создаем новый код через trigger
      const { data: insertedData, error: insertError } = await supabase
        .from('client_codes')
        .insert({ 
          user_id: userId,
          description: 'Новый клиент',
          is_active: true
        })
        .select('code, description, is_active')
        .single();

      if (insertError) {
        throw insertError;
      }

      setCode(insertedData);
      toast({ 
        title: "Код создан", 
        description: `Ваш код: ${insertedData.code}`,
        duration: 5000,
      });

    } catch (error: any) {
      console.error('Error in loadCode:', error);
      
      const errorMessage = error?.message || 'Не удалось загрузить код клиента';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    code,
    isLoading,
    error,
    loadCode,
  };
};
