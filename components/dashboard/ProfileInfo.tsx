"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  updated_at: string;
}

interface ProfileInfoProps {
  userId: string;
}

export function ProfileInfo({ userId }: ProfileInfoProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, supabase]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-4 w-[250px] mb-4" />
        <Skeleton className="h-4 w-[200px]" />
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="p-6">
        <p className="text-red-500">Профиль не найден</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Информация о профиле</h3>
        <p className="text-sm text-gray-500">Email: {profile.email}</p>
        {profile.full_name && (
          <p className="text-sm text-gray-500">Имя: {profile.full_name}</p>
        )}
        <p className="text-xs text-gray-400">
          Обновлено: {new Date(profile.updated_at).toLocaleString()}
        </p>
      </div>
    </Card>
  );
}
