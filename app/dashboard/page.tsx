import { Package, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserStats } from "@/components/dashboard/user-stats";
import { getServerSession } from "./auth";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await getServerSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Личный кабинет</h1>
          </div>
          <Link href="https://t.me/tulparexpress_bot" target="_blank">
            <Button variant="secondary" className="group">
              Подключить уведомления
              <Bell className="ml-2 h-4 w-4 group-hover:animate-bounce" />
            </Button>
          </Link>
        </div>
        <UserStats />
        <DashboardTabs />
      </div>
    </div>
  );
}