"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";
import { TrackingForm } from "./tracking-form";
import { CargoList } from "./cargo-list";
import { ProfileInfo } from "@/components/dashboard/profile-info";
import { TelegramConnect } from "./telegram-connect";

export function DashboardTabs() {
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    loadUser();
  }, [supabase.auth]);

  if (!userId) {
    return null;
  }

  return (
    <Tabs defaultValue="tracking" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
        <TabsTrigger value="tracking" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span>Трек-номера</span>
        </TabsTrigger>
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Профиль</span>
        </TabsTrigger>
        <TabsTrigger value="telegram" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>Telegram</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tracking" className="space-y-4">
        <div className="grid gap-4">
          <TrackingForm userId={userId} />
          <CargoList userId={userId} />
        </div>
      </TabsContent>

      <TabsContent value="profile" className="space-y-4">
        <ProfileInfo userId={userId} />
      </TabsContent>

      <TabsContent value="telegram">
        <Card className="p-6">
          <TelegramConnect userId={userId} />
        </Card>
      </TabsContent>
    </Tabs>
  );
}