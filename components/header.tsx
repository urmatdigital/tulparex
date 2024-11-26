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
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
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
                {user && (
                  <li>
                    <Link
                      href="/dashboard"
                      className="hover:text-primary transition-colors"
                    >
                      Панель управления
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              {!isLoading && (
                <>
                  {user ? (
                    <UserNav user={user} />
                  ) : (
                    <Link href="/auth">
                      <Button variant="outline" size="sm">
                        Войти
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>

            <button
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="hover:text-primary transition-colors"
                onClick={toggleMenu}
              >
                Главная
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="hover:text-primary transition-colors"
                  onClick={toggleMenu}
                >
                  Панель управления
                </Link>
              )}
              {!user && (
                <Link
                  href="/auth"
                  className="hover:text-primary transition-colors"
                  onClick={toggleMenu}
                >
                  Войти
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}