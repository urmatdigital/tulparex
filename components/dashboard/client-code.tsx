"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";

export default function ClientCode() {
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadClientCode();
  }, []);

  const loadClientCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Проверяем существующий код
      const { data: existingCode, error: fetchError } = await supabase
        .from('client_codes')
        .select('code')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingCode) {
        setCode(existingCode.code);
      } else {
        // Генерируем новый код
        const newCode = generateCode();
        const { error: insertError } = await supabase
          .from('client_codes')
          .insert({
            user_id: user.id,
            code: newCode
          });

        if (insertError) throw insertError;
        setCode(newCode);
      }
    } catch (error) {
      console.error('Error loading client code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    const prefix = 'TE';
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${number}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ваш код клиента</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ваш код клиента</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-center">{code}</div>
      </CardContent>
    </Card>
  );
}
