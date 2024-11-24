import { Package } from "lucide-react";
import TrackingForm from "@/components/tracking-form";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] hero-pattern">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent" />
      
      <div className="container mx-auto px-4 py-12 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-block p-4 rounded-full bg-primary/10 mb-6">
            <Package className="h-12 w-12 text-primary" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 text-transparent bg-clip-text">
            TULPAR EXPRESS
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            Быстрое и надежное отслеживание ваших посылок
          </p>

          <div className="space-y-8">
            <TrackingForm />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg bg-card shadow-sm">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                🚀
              </div>
              <h3 className="font-semibold mb-2">Быстрое отслеживание</h3>
              <p className="text-muted-foreground">
                Мгновенный доступ к информации о статусе вашей посылки
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card shadow-sm">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                📱
              </div>
              <h3 className="font-semibold mb-2">Уведомления</h3>
              <p className="text-muted-foreground">
                Получайте обновления о статусе посылки в Telegram
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card shadow-sm">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                🔒
              </div>
              <h3 className="font-semibold mb-2">Личный кабинет</h3>
              <p className="text-muted-foreground">
                Управляйте всеми вашими посылками в одном месте
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}