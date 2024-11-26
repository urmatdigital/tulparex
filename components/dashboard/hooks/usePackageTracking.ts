"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export const PACKAGE_STATUSES = {
  IN_CHINA: "На складе в Китае",
  IN_TRANSIT: "В пути со склада Китай в Бишкек",
  AT_BORDER: "На границе",
  IN_CUSTOMS: "В терминале Таможни",
  IN_BISHKEK: "На складе в Бишкеке",
  READY: "Готов к выдаче",
} as const;

type PackageStatus = keyof typeof PACKAGE_STATUSES;

interface TrackingResult {
  code: string;
  status: string;
  timestamp: string;
  client: string;
}

export const usePackageTracking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const trackPackage = async (trackingNumber: string) => {
    setIsLoading(true);
    setTrackingResult(null);

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (!session || authError) {
        toast({
          title: "Необходима авторизация",
          description: "Для отслеживания посылок, войдите в систему",
          variant: "destructive",
        });
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();

      if (error?.code === 'PGRST116') {
        toast({
          title: "Посылка не найдена",
          description: "Посылка с указанным номером не найдена",
          variant: "destructive",
        });
        return;
      }

      if (error || !data) {
        toast({
          title: "Ошибка поиска",
          description: "Не удалось найти информацию о посылке",
          variant: "destructive",
        });
        return;
      }

      const status = PACKAGE_STATUSES[data.status as PackageStatus] || data.status;
      
      setTrackingResult({
        code: data.tracking_number,
        status,
        timestamp: formatDate(data.updated_at),
        client: data.client_name,
      });

      toast({
        title: "Посылка найдена",
        description: `Статус: ${status}`,
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при поиске",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, trackingResult, trackPackage };
};
