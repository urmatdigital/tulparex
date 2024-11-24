import { NextResponse } from 'next/server';

const MOYSKLAD_TOKEN = "b82f6b0224c7f3394afadd89faf2d3df22e3c8c0";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const response = await fetch("https://api.moysklad.ru/api/remap/1.2/entity/counterparty", {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(MOYSKLAD_TOKEN + ':').toString('base64')}`,
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: body.name
      })
    });

    if (!response.ok) {
      throw new Error('Ошибка при создании контрагента');
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('MoySklad API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании контрагента в МойСклад' },
      { status: 500 }
    );
  }
}