import { NextRequest, NextResponse } from 'next/server';

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const closed = searchParams.get('closed') || 'false';
    const active = searchParams.get('active') || 'true';
    const limit = searchParams.get('limit') || '100';

    const url = `${POLYMARKET_API_BASE}/markets?closed=${closed}&active=${active}&limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Polymarket API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch markets from Polymarket' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
