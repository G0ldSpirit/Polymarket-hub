import { NextRequest, NextResponse } from 'next/server';

const POLYMARKET_STRAPI_API = 'https://strapi-matic.poly.market';
const CLOB_API_BASE = 'https://clob.polymarket.com';

// Fonction pour récupérer les prix en temps réel depuis CLOB
async function fetchPricesForMarket(clobTokenIds: string[]): Promise<string[]> {
  if (!clobTokenIds || clobTokenIds.length === 0) {
    return ['0.5', '0.5'];
  }

  try {
    const pricePromises = clobTokenIds.map(async (tokenId) => {
      try {
        const response = await fetch(`${CLOB_API_BASE}/midpoint?token_id=${tokenId}`);
        if (response.ok) {
          const data = await response.json();
          return data.mid || '0.5';
        }
      } catch (err) {
        console.error(`Error fetching price for token ${tokenId}:`, err);
      }
      return '0.5';
    });

    const prices = await Promise.all(pricePromises);
    return prices.map(p => String(p));
  } catch (error) {
    console.error('Error fetching prices:', error);
    return ['0.5', '0.5'];
  }
}

// Fonction pour normaliser les données Polymarket
function normalizeMarketData(market: any): any {
  let outcomePrices = market.outcomePrices || ['0.5', '0.5'];

  if (Array.isArray(outcomePrices)) {
    outcomePrices = outcomePrices.map((price: any) => {
      if (typeof price === 'string') return price;
      if (typeof price === 'number') return String(price);
      return '0.5';
    });
  }

  let outcomes = market.outcomes;
  if (!outcomes || !Array.isArray(outcomes)) {
    outcomes = ['Yes', 'No'];
  } else if (typeof outcomes[0] !== 'string') {
    outcomes = outcomes.map((o: any) => o.name || o.title || 'Yes');
  }

  return {
    ...market,
    outcomePrices,
    outcomes,
    volume: market.volume || 0,
    liquidity: market.liquidity || 0,
    spread: market.spread || 0,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const url = `${POLYMARKET_STRAPI_API}/markets/${id}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Polymarket API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch market from Polymarket' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('📊 Polymarket API raw market data');

    // Enrichir avec les prix en temps réel depuis CLOB
    if (data.clobTokenIds && data.clobTokenIds.length > 0) {
      const realPrices = await fetchPricesForMarket(data.clobTokenIds);
      data.outcomePrices = realPrices;
    }

    // Normaliser les données
    const normalizedData = normalizeMarketData(data);

    console.log('✅ Normalized and enriched market data');

    return NextResponse.json(normalizedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15',
      },
    });
  } catch (error) {
    console.error('Error fetching market:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
