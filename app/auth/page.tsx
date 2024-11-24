import AuthForm from "@/components/auth/auth-form";
import { Package } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] hero-pattern flex items-center">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/5" />
      
      <div className="container mx-auto px-4 py-12 relative">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-primary/10 mb-4 dark:bg-primary/20">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-transparent bg-clip-text">
              Добро пожаловать
            </h1>
            <p className="text-muted-foreground mt-2">
              Войдите в систему для отслеживания посылок
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-lg shadow-lg bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/50">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}