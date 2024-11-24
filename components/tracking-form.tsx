"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import TrackingResult from "@/components/tracking-result";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const formSchema = z.object({
  trackingNumber: z
    .string()
    .min(1, "Введите трек-номер")
    .regex(/^TE-\d{4}$/, "Неверный формат. Пример: TE-6507"),
});

const PACKAGE_STATUSES = {
  IN_CHINA: "На складе в Китае",
  IN_TRANSIT: "В пути со склада Китай в Бишкек",
  AT_BORDER: "На границе",
  IN_CUSTOMS: "В терминале Таможни",
  IN_BISHKEK: "На складе в Бишкеке",
  READY: "Готов к выдаче",
};

export default function TrackingForm() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingNumber: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Необходима авторизация",
          description: "Для отслеживания посылок, пожалуйста, войдите в систему",
        });
        router.push("/auth");
        return;
      }

      // Поиск посылки в базе данных
      const { data: package_data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('tracking_number', values.trackingNumber)
        .single();

      if (error || !package_data) {
        toast({
          title: "Посылка не найдена",
          description: "Под таким номером нет посылок",
          variant: "destructive",
        });
        setTrackingResult(null);
        return;
      }

      setTrackingResult({
        code: package_data.tracking_number,
        status: package_data.status,
        timestamp: new Date(package_data.updated_at).toLocaleString(),
        client: package_data.client_name,
      });

      toast({
        title: "Посылка найдена",
        description: `Статус: ${package_data.status}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при отслеживании посылки",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Введите трек номер (Например: TE-6507)"
            {...form.register("trackingNumber")}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Search className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2">Отследить</span>
          </Button>
        </div>
        {form.formState.errors.trackingNumber && (
          <p className="text-sm text-destructive">
            {form.formState.errors.trackingNumber.message}
          </p>
        )}
      </form>

      {trackingResult && <TrackingResult data={trackingResult} />}
    </div>
  );
}