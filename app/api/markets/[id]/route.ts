import { NextRequest, NextResponse } from 'next/server';

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';

// Fonction pour normaliser les données Polymarket
function normalizeMarketData(market: any): any {
  // L'API Polymarket peut avoir différents formats
  let outcomePrices = market.outcomePrices;

  // Si outcomePrices n'existe pas ou n'est pas dans le bon format
  if (!outcomePrices || !Array.isArray(outcomePrices)) {
    // Essayer d'autres champs possibles de l'API
    if (market.outcomes && Array.isArray(market.outcomes)) {
      outcomePrices = market.outcomes.map((outcome: any) => {
        if (outcome.price !== undefined) {
          const price = typeof outcome.price === 'number' ? outcome.price : parseFloat(outcome.price || '0.5');
          return String(price);
        }
        return '0.5';
      });
    } else {
      // Fallback : utiliser les prix par défaut
      outcomePrices = ['0.5', '0.5'];
    }
  } else {
    // S'assurer que outcomePrices contient des strings
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
    // Si outcomes est un tableau d'objets, extraire les noms
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

    const url = `${POLYMARKET_API_BASE}/markets/${id}`;

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

    console.log('📊 Polymarket API raw market data:', JSON.stringify(data, null, 2));

    // Normaliser les données
    const normalizedData = normalizeMarketData(data);

    console.log('✅ Normalized market data:', JSON.stringify(normalizedData, null, 2));

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
