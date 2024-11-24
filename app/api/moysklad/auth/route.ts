import { NextResponse } from 'next/server';

const MOYSKLAD_LOGIN = "admin@tulparexpress";
const MOYSKLAD_PASSWORD = "Tulpar321654987*";

export async function POST() {
  try {
    const credentials = Buffer.from(`${MOYSKLAD_LOGIN}:${MOYSKLAD_PASSWORD}`).toString('base64');
    
    const response = await fetch('https://api.moysklad.ru/api/remap/1.2/security/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.error || 'Failed to get token');
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      access_token: data.access_token 
    });

  } catch (error) {
    console.error('MoySklad token error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get access token'
      }, 
      { status: 500 }
    );
  }
}