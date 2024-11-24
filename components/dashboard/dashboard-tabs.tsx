"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CargoList from "./cargo-list";
import ProfileForm from "./profile-form";
import TelegramConnect from "./telegram-connect";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";
import { Package, TrendingUp, Clock } from "lucide-react";

export default function DashboardTabs() {
  const [stats, setStats] = useState({
    totalPackages: 0,
    inTransit: 0,
    delivered: 0,
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: packages } = await supabase
      .from('packages')
      .select('status')
      .eq('user_id', user.id);

    if (packages) {
      setStats({
        totalPackages: packages.length,
        inTransit: packages.filter(p => p.status !== 'Готов к выдаче').length,
        delivered: packages.filter(p => p.status === 'Готов к выдаче').length,
      });
    }
  };

  return (
    <Tabs defaultValue="cargo" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
        <TabsTrigger value="cargo">Мои грузы</TabsTrigger>
        <TabsTrigger value="profile">Профиль</TabsTrigger>
        <TabsTrigger value="telegram">Telegram</TabsTrigger>
      </TabsList>

      <TabsContent value="cargo" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <h3 className="font-semibold">Всего посылок</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.totalPackages}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <h3 className="font-semibold">В пути</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.inTransit}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <h3 className="font-semibold">Доставлено</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.delivered}</p>
          </Card>
        </div>
        <CargoList onUpdate={fetchStats} />
      </TabsContent>

      <TabsContent value="profile">
        <ProfileForm />
      </TabsContent>

      <TabsContent value="telegram">
        <TelegramConnect />
      </TabsContent>
    </Tabs>
  );
}