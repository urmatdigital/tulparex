"use client";

import { Card } from "@/components/ui/card";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";

interface Stats {
  totalPackages: number;
  inTransit: number;
  delivered: number;
  pending: number;
}

export function UserStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<Stats>({
    totalPackages: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: packages, error } = await supabase
          .from("packages")
          .select("status")
          .eq("user_id", userId);

        if (error) throw error;

        const stats = packages.reduce(
          (acc, pkg) => {
            acc.totalPackages++;
            switch (pkg.status) {
              case "in_transit":
                acc.inTransit++;
                break;
              case "delivered":
                acc.delivered++;
                break;
              case "pending":
                acc.pending++;
                break;
            }
            return acc;
          },
          { totalPackages: 0, inTransit: 0, delivered: 0, pending: 0 }
        );

        setStats(stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId, supabase]);

  const statItems = [
    {
      title: "Всего посылок",
      value: stats.totalPackages,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100/50 dark:bg-blue-400/10",
    },
    {
      title: "В пути",
      value: stats.inTransit,
      icon: Truck,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100/50 dark:bg-yellow-400/10",
    },
    {
      title: "Доставлено",
      value: stats.delivered,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100/50 dark:bg-green-400/10",
    },
    {
      title: "Ожидается",
      value: stats.pending,
      icon: Clock,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100/50 dark:bg-purple-400/10",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Статистика</h2>
      <div className="grid gap-4">
        {statItems.map((item) => (
          <Card key={item.title} className="p-4">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-2 ${item.bgColor}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </p>
                <h3 className="text-2xl font-bold">{item.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function UserStatsContainer() {
  const supabase = createClientComponentClient();
  const { data: { user } } = supabase.auth.getUser();

  if (!user) return null;

  return <UserStats userId={user.id} />;
}
