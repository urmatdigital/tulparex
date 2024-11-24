import { NextRequest, NextResponse } from "next/server";

const MOYSKLAD_API_URL = "https://api.moysklad.ru/api/remap/1.2";
const MOYSKLAD_LOGIN = "admin@tulparexpress";
const MOYSKLAD_PASSWORD = "Tulpar321654987*";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Название организации обязательно" },
        { status: 400 }
      );
    }

    // Get token
    const credentials = Buffer.from(`${MOYSKLAD_LOGIN}:${MOYSKLAD_PASSWORD}`).toString('base64');
    const tokenResponse = await fetch(`${MOYSKLAD_API_URL}/security/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept-Encoding': 'gzip'
      }
    });

    if (!tokenResponse.ok) {
      console.error('Token response:', await tokenResponse.text());
      throw new Error('Ошибка получения токена');
    }

    const { access_token } = await tokenResponse.json();

    // Create counterparty
    const response = await fetch(`${MOYSKLAD_API_URL}/entity/counterparty`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        companyType: "legal",
        description: "Создано через веб-сайт"
      })
    });

    if (!response.ok) {
      console.error('Counterparty response:', await response.text());
      throw new Error('Ошибка создания организации');
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error("MoySklad API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Ошибка при создании организации" 
      },
      { status: 500 }
    );
  }
}