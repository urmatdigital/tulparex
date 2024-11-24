"use client";

import { Package, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import UserNav from "./auth/user-nav";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="font-bold text-xl">TULPAR EXPRESS</span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:block">
              <ul className="flex items-center gap-6">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Главная
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    О нас
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary transition-colors">
                    Контакты
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              {!user ? (
                <Button asChild variant="default">
                  <Link href="/auth">
                    Войти
                  </Link>
                </Button>
              ) : (
                <UserNav user={user} />
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav
          className={cn(
            "md:hidden",
            isMenuOpen ? "block" : "hidden"
          )}
        >
          <ul className="py-4 space-y-4">
            <li>
              <Link
                href="/"
                className="block hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Главная
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                О нас
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="block hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Контакты
              </Link>
            </li>
            {!user && (
              <li>
                <Button asChild variant="default" className="w-full">
                  <Link
                    href="/auth"
                    onClick={toggleMenu}
                  >
                    Войти
                  </Link>
                </Button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}