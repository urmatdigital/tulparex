import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { SupabaseProvider } from "@/components/providers/supabase-provider";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "TULPAR EXPRESS - Отслеживание посылок",
  description: "Сервис отслеживания посылок TULPAR EXPRESS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen flex flex-col")}>
        <SupabaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}