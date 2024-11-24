import { NextResponse } from "next/server";
import { Bot } from "grammy";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const bot = new Bot("8099281651:AAHu6aurpqZV23FRcIKo9o6q6eQjzinOuy8");

export async function POST(request: Request) {
  try {
    const update = await request.json();
    const supabase = createServerComponentClient({ cookies });

    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;
      const username = update.message.from.username;

      await bot.api.sendMessage(
        chatId,
        `👋 Добро пожаловать в систему отслеживания TULPAR EXPRESS!

Ваш Chat ID: ${chatId}

Для привязки аккаунта, пожалуйста, войдите в личный кабинет на сайте и введите этот код в разделе "Telegram".`
      );

      // Update or create profile with Telegram info
      const { error } = await supabase
        .from("profiles")
        .update({
          telegram_chat_id: chatId,
          telegram_username: username,
        })
        .eq("telegram_verification_code", chatId.toString());

      if (error) {
        console.error("Error updating profile:", error);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}