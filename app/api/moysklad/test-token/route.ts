import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const login = "admin@tulparexpress";
    const password = "Tulpar321654987*";
    const credentials = Buffer.from(`${login}:${password}`).toString('base64');
    
    const response = await fetch('https://api.moysklad.ru/api/remap/1.2/security/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept-Encoding': 'gzip'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.error || 'Failed to get token');
    }

    const data = await response.json();
    return NextResponse.json({ 
      success: true, 
      token: data.access_token 
    });

  } catch (error) {
    console.error('Error getting token:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get token'
      }, 
      { status: 500 }
    );
  }
}