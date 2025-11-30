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
  // Utiliser outcomePrices du marché (ils seront enrichis plus tard)
  let outcomePrices = market.outcomePrices || ['0.5', '0.5'];

  // S'assurer que outcomePrices contient des strings
  if (Array.isArray(outcomePrices)) {
    outcomePrices = outcomePrices.map((price: any) => {
      if (typeof price === 'string') return price;
      if (typeof price === 'number') return String(price);
      return '0.5';
    });
  }

  // S'assurer que outcomes existe
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
        // Essayer de récupérer les vrais prix depuis CLOB
        if (market.clobTokenIds && market.clobTokenIds.length > 0) {
          const realPrices = await fetchPricesForMarket(market.clobTokenIds);
          market.outcomePrices = realPrices;
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
