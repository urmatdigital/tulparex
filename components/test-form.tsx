"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

export default function TestForm() {
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      // First, test token generation
      const tokenResponse = await fetch("/api/moysklad/test-token");
      const tokenData = await tokenResponse.json();

      if (!tokenData.success) {
        throw new Error(tokenData.error || "Ошибка получения токена");
      }

      setResult({ token: tokenData.token });

      // Then try to create a company if token was successful
      if (companyName) {
        const response = await fetch("/api/moysklad/counterparty", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: companyName }),
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Ошибка создания организации");
        }

        setResult(prev => ({ ...prev, company: data.data }));
        
        toast({
          title: "Успешно!",
          description: "Организация успешно создана в МойСклад",
        });
      }
    } catch (error) {
      console.error("Test error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла ошибка",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Название организации</label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="ООО Тест"
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Проверка..." : "Проверить подключение"}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
            <h3 className="font-medium">Результат:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </Card>
  );
}