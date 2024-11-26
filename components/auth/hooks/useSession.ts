"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export const useSession = () => {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось выйти из системы",
      });
    }
  };

  return { signOut };
};
