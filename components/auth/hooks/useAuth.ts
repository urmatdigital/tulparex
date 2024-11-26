"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface AuthCredentials {
  email: string;
  password: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();

  const handleError = (error: any) => {
    let errorMessage = "Произошла ошибка";
    
    if (error.message) {
      switch (error.message) {
        case "Email not confirmed":
          errorMessage = "Email не подтвержден. Проверьте вашу почту.";
          break;
        case "Invalid login credentials":
          errorMessage = "Неверный email или пароль";
          break;
        case "User already registered":
          errorMessage = "Пользователь с таким email уже существует";
          break;
        default:
          errorMessage = error.message;
      }
    }

    toast({
      variant: "destructive",
      title: "Ошибка",
      description: errorMessage,
    });
  };

  const createProfile = async (userId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{ 
          id: userId,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return false;
    }
  };

  const signIn = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;

      if (session) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw new Error('Ошибка при проверке профиля');
        }

        if (!profile) {
          throw new Error('Профиль не найден');
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (credentials: AuthCredentials) => {
    setIsLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.signUp({
        ...credentials,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (session) {
        const profileCreated = await createProfile(session.user.id, session.user.email || credentials.email);
        
        if (!profileCreated) {
          throw new Error('Ошибка при создании профиля');
        }

        router.push("/dashboard");
        router.refresh();
      } else {
        toast({
          title: "Проверьте почту",
          description: "Мы отправили ссылку для подтверждения на ваш email",
        });
      }
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, signIn, signUp };
};
