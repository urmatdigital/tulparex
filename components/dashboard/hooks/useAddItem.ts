"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";

interface AddItemOptions<T> {
  table: string;
  successMessage: string;
  errorMessage: string;
  transformData?: (data: T, userId: string) => any;
}

export const useAddItem = <T>({
  table,
  successMessage,
  errorMessage,
  transformData,
}: AddItemOptions<T>) => {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const addItem = async (values: T, onSuccess?: () => void) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Пользователь не авторизован");

      const now = new Date().toISOString();
      const baseData = {
        user_id: user.id,
        created_at: now,
        updated_at: now,
      };

      const itemData = transformData 
        ? { ...baseData, ...transformData(values, user.id) }
        : { ...baseData, ...values };

      console.log('Attempting to insert data:', {
        table,
        data: itemData,
      });

      const { data, error } = await supabase
        .from(table)
        .insert(itemData)
        .select()
        .single();

      if (error) {
        console.error(`Database error for ${table}:`, {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(error.message);
      }

      console.log(`Successfully added ${table}:`, data);

      toast({
        title: "Успешно",
        description: successMessage,
      });

      onSuccess?.();
    } catch (error: any) {
      console.error(`Failed to add ${table}:`, {
        error: error?.message || error,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error?.message || errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addItem,
  };
};
