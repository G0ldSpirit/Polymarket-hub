import { NextRequest, NextResponse } from 'next/server';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
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
  // Parser outcomePrices - c'est souvent une string JSON comme "[\"0.65\", \"0.35\"]"
  let outcomePrices = ['0.5', '0.5'];
  if (typeof market.outcomePrices === 'string') {
    try {
      outcomePrices = JSON.parse(market.outcomePrices);
    } catch (e) {
      console.warn('Failed to parse outcomePrices:', market.outcomePrices);
    }
  } else if (Array.isArray(market.outcomePrices)) {
    outcomePrices = market.outcomePrices.map((price: any) => {
      if (typeof price === 'string') return price;
      if (typeof price === 'number') return String(price);
      return '0.5';
    });
  }

  // Parser outcomes - c'est souvent une string JSON comme "[\"Yes\", \"No\"]"
  let outcomes = ['Yes', 'No'];
  if (typeof market.outcomes === 'string') {
    try {
      outcomes = JSON.parse(market.outcomes);
    } catch (e) {
      console.warn('Failed to parse outcomes:', market.outcomes);
    }
  } else if (Array.isArray(market.outcomes)) {
    outcomes = market.outcomes;
  }

  // Parser volume et liquidity - ce sont des strings comme "123456.78"
  let volume = 0;
  if (typeof market.volume === 'string') {
    volume = parseFloat(market.volume) || 0;
  } else if (typeof market.volume === 'number') {
    volume = market.volume;
  }

  let liquidity = 0;
  if (typeof market.liquidity === 'string') {
    liquidity = parseFloat(market.liquidity) || 0;
  } else if (typeof market.liquidity === 'number') {
    liquidity = market.liquidity;
  }

  return {
    ...market,
    outcomePrices,
    outcomes,
    volume,
    liquidity,
    spread: market.spread || 0,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const url = `${GAMMA_API_BASE}/markets/${id}`;

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

    // Parser clobTokenIds - c'est souvent une string JSON comme "[\"123\", \"456\"]"
    let clobTokenIds: string[] = [];
    if (typeof data.clobTokenIds === 'string') {
      try {
        clobTokenIds = JSON.parse(data.clobTokenIds);
      } catch (e) {
        console.warn('Failed to parse clobTokenIds:', data.clobTokenIds);
      }
    } else if (Array.isArray(data.clobTokenIds)) {
      clobTokenIds = data.clobTokenIds;
    }

    // Enrichir avec les prix en temps réel depuis CLOB
    if (clobTokenIds.length > 0) {
      const realPrices = await fetchPricesForMarket(clobTokenIds);
      // Ne remplacer que si on a obtenu des prix valides (pas 0.5)
      if (realPrices.some(p => p !== '0.5')) {
        data.outcomePrices = realPrices;
      }
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
