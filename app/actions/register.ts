"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

async function getLastTrackingNumber() {
  const supabase = createServerComponentClient({ cookies });
  
  // Получаем последний использованный трек-номер
  const { data, error } = await supabase
    .from("profiles")
    .select("tracking_number")
    .order("tracking_number", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching last tracking number:", error);
    return "TE-6766"; // Начальный номер, если нет предыдущих
  }

  if (!data?.tracking_number) {
    return "TE-6766";
  }

  // Извлекаем номер и увеличиваем его на 1
  const currentNumber = parseInt(data.tracking_number.split("-")[1]);
  const nextNumber = currentNumber + 1;
  return `TE-${nextNumber.toString().padStart(4, "0")}`;
}

export async function registerUser(formData: {
  email: string;
  password: string;
  name: string;
}) {
  const supabase = createServerComponentClient({ cookies });

  try {
    // Регистрация пользователя
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (signUpError || !user) {
      throw signUpError || new Error("Failed to create user");
    }

    // Генерация нового трек-номера
    const trackingNumber = await getLastTrackingNumber();

    // Создание профиля пользователя
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        name: formData.name,
        tracking_number: trackingNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      throw profileError;
    }

    return { success: true, trackingNumber };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Ошибка при регистрации" };
  }
}
