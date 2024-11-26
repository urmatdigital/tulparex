"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useClientCode } from "./hooks/useClientCode";

export default function ClientCode() {
  const { user } = useSupabase();
  const { code, isLoading, error, loadCode } = useClientCode();

  useEffect(() => {
    console.log('Current user:', user);
    if (user) {
      console.log('Loading code for user ID:', user.id);
      loadCode(user.id);
    }
  }, [user]);

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ошибка</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-center">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!code) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Код клиента</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center">
            Код клиента не найден
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ваш код клиента</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-4xl font-bold text-center">{code.code}</div>
        {code.description && (
          <div className="text-muted-foreground text-center">
            {code.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
