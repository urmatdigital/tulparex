import { NextResponse } from "next/server";
import { Bot } from "grammy";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const bot = new Bot("8099281651:AAHu6aurpqZV23FRcIKo9o6q6eQjzinOuy8");

export async function POST(request: Request) {
  try {
    const { userId, message } = await request.json();
    const supabase = createServerComponentClient({ cookies });

    // Get user's Telegram chat ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("telegram_chat_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.telegram_chat_id) {
      return NextResponse.json(
        { error: "Telegram not connected" },
        { status: 400 }
      );
    }

    // Send message via Telegram bot
    await bot.api.sendMessage(profile.telegram_chat_id, message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}