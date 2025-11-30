import { NextRequest, NextResponse } from 'next/server';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
const CLOB_API_BASE = 'https://clob.polymarket.com';

// Fonction pour récupérer les prix en temps réel depuis CLOB
async function fetchPricesForMarket(clobTokenIds: string[]): Promise<string[]> {
  if (!clobTokenIds || clobTokenIds.length === 0) {
    return ['0.5', '0.5'];
  }

  try {
    // Pour chaque token, récupérer le prix midpoint
    const pricePromises = clobTokenIds.map(async (tokenId) => {
      try {
        const response = await fetch(`${CLOB_API_BASE}/midpoint?token_id=${tokenId}`);
        if (response.ok) {
          const data = await response.json();
          // Le midpoint est le prix moyen entre bid et ask
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');

    // Utiliser l'API Gamma de Polymarket
    const url = `${GAMMA_API_BASE}/markets?closed=false&active=true&limit=${limit}`;

    console.log('🔍 Fetching from Polymarket Gamma API:', url);

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

    if (!data || data.length === 0) {
      console.log('⚠️ No markets returned from Gamma API');
      return NextResponse.json([]);
    }

    console.log(`📊 Received ${data.length} markets from Gamma API`);

    // Filtrer les marchés passés (dont la date de fin est dépassée)
    const now = new Date();
    const activeMarkets = data.filter((market: any) => {
      // Si pas de date de fin, garder le marché
      if (!market.endDate) return true;

      // Vérifier si la date de fin est dans le futur
      const endDate = new Date(market.endDate);
      return endDate > now;
    });

    console.log(`✅ Filtered to ${activeMarkets.length} active markets (removed ${data.length - activeMarkets.length} past markets)`);
    if (activeMarkets.length > 0) {
      console.log('Sample market:', JSON.stringify(activeMarkets[0], null, 2));
    }

    // Enrichir avec les prix en temps réel depuis CLOB
    const enrichedMarkets = await Promise.all(
      activeMarkets.slice(0, limit).map(async (market: any) => {
        // Parser clobTokenIds - c'est souvent une string JSON comme "[\"123\", \"456\"]"
        let clobTokenIds: string[] = [];
        if (typeof market.clobTokenIds === 'string') {
          try {
            clobTokenIds = JSON.parse(market.clobTokenIds);
          } catch (e) {
            console.warn('Failed to parse clobTokenIds:', market.clobTokenIds);
          }
        } else if (Array.isArray(market.clobTokenIds)) {
          clobTokenIds = market.clobTokenIds;
        }

        // Essayer de récupérer les vrais prix depuis CLOB
        if (clobTokenIds.length > 0) {
          const realPrices = await fetchPricesForMarket(clobTokenIds);
          // Ne remplacer que si on a obtenu des prix valides (pas 0.5)
          if (realPrices.some(p => p !== '0.5')) {
            market.outcomePrices = realPrices;
          }
        }

        return normalizeMarketData(market);
      })
    );

    console.log('✅ Enriched markets with real prices');
    if (enrichedMarkets.length > 0) {
      console.log('Sample enriched market:', JSON.stringify(enrichedMarkets[0], null, 2));
    }

    return NextResponse.json(enrichedMarkets, {
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
