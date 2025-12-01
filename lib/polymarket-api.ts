import axios from 'axios';
import { Market, MarketHistory } from '@/types/market';

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';
const CLOB_API_BASE = 'https://clob.polymarket.com';

export class PolymarketAPI {
  // Données de démonstration
  private static getMockMarkets(): Market[] {
    return [
      {
        id: '1',
        question: 'Will Bitcoin reach $100,000 in 2025?',
        description: 'This market will resolve to "Yes" if Bitcoin (BTC) reaches or exceeds $100,000 at any point in 2025.',
        outcomePrices: ['0.67', '0.33'],
        outcomes: ['Yes', 'No'],
        volume: 2847392,
        liquidity: 456789,
        active: true,
        closed: false,
        endDate: '2025-12-31',
        category: 'Crypto',
        image: '',
        icon: '',
        createdAt: '2024-01-15',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 2.3,
        volumeChange24h: 45.2,
        priceChange24h: 8.7,
        trending: true,
      },
      {
        id: '2',
        question: 'Will Trump win the 2024 US Presidential Election?',
        description: 'Resolves to Yes if Donald Trump wins the 2024 Presidential Election.',
        outcomePrices: ['0.54', '0.46'],
        outcomes: ['Yes', 'No'],
        volume: 8934521,
        liquidity: 1234567,
        active: true,
        closed: false,
        endDate: '2024-11-05',
        category: 'Politics',
        image: '',
        icon: '',
        createdAt: '2023-06-01',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 1.8,
        volumeChange24h: 120.5,
        priceChange24h: -3.2,
        trending: true,
      },
      {
        id: '3',
        question: 'Will Ethereum switch to Proof of Stake by end of 2025?',
        description: 'Market resolves Yes if Ethereum successfully transitions to PoS.',
        outcomePrices: ['0.89', '0.11'],
        outcomes: ['Yes', 'No'],
        volume: 1567234,
        liquidity: 345678,
        active: true,
        closed: false,
        endDate: '2025-12-31',
        category: 'Crypto',
        image: '',
        icon: '',
        createdAt: '2024-03-10',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 3.1,
        volumeChange24h: 23.4,
        priceChange24h: 12.3,
        trending: false,
      },
      {
        id: '4',
        question: 'Will AI surpass human intelligence by 2030?',
        description: 'Resolves Yes if AGI is achieved by experts consensus.',
        outcomePrices: ['0.42', '0.58'],
        outcomes: ['Yes', 'No'],
        volume: 3421890,
        liquidity: 678901,
        active: true,
        closed: false,
        endDate: '2030-12-31',
        category: 'Science',
        image: '',
        icon: '',
        createdAt: '2024-01-20',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 2.7,
        volumeChange24h: 89.3,
        priceChange24h: 15.6,
        trending: true,
      },
      {
        id: '5',
        question: 'Will the Lakers win the 2025 NBA Championship?',
        description: 'Resolves Yes if the LA Lakers win the 2025 NBA Finals.',
        outcomePrices: ['0.28', '0.72'],
        outcomes: ['Yes', 'No'],
        volume: 1234567,
        liquidity: 234567,
        active: true,
        closed: false,
        endDate: '2025-06-30',
        category: 'Sports',
        image: '',
        icon: '',
        createdAt: '2024-10-01',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 2.9,
        volumeChange24h: 34.7,
        priceChange24h: -5.4,
        trending: false,
      },
      {
        id: '6',
        question: 'Will Taylor Swift release a new album in 2025?',
        description: 'Resolves Yes if Taylor Swift officially releases a studio album.',
        outcomePrices: ['0.76', '0.24'],
        outcomes: ['Yes', 'No'],
        volume: 987654,
        liquidity: 187654,
        active: true,
        closed: false,
        endDate: '2025-12-31',
        category: 'Pop Culture',
        image: '',
        icon: '',
        createdAt: '2024-01-05',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 3.4,
        volumeChange24h: 67.8,
        priceChange24h: 9.2,
        trending: true,
      },
      {
        id: '7',
        question: 'Will Tesla stock reach $500 by end of 2025?',
        description: 'Resolves Yes if TSLA closes at or above $500 on any trading day.',
        outcomePrices: ['0.61', '0.39'],
        outcomes: ['Yes', 'No'],
        volume: 2134567,
        liquidity: 456123,
        active: true,
        closed: false,
        endDate: '2025-12-31',
        category: 'Business',
        image: '',
        icon: '',
        createdAt: '2024-02-14',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 2.1,
        volumeChange24h: 156.3,
        priceChange24h: 18.9,
        trending: true,
      },
      {
        id: '8',
        question: 'Will SpaceX land humans on Mars by 2030?',
        description: 'Resolves Yes if SpaceX successfully lands humans on Mars.',
        outcomePrices: ['0.35', '0.65'],
        outcomes: ['Yes', 'No'],
        volume: 5678901,
        liquidity: 987654,
        active: true,
        closed: false,
        endDate: '2030-12-31',
        category: 'Science',
        image: '',
        icon: '',
        createdAt: '2023-12-01',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 2.5,
        volumeChange24h: 234.7,
        priceChange24h: 22.1,
        trending: true,
      },
      {
        id: '9',
        question: 'Will the Fed cut interest rates in Q1 2025?',
        description: 'Resolves Yes if the Federal Reserve cuts rates in first quarter.',
        outcomePrices: ['0.71', '0.29'],
        outcomes: ['Yes', 'No'],
        volume: 4567890,
        liquidity: 789012,
        active: true,
        closed: false,
        endDate: '2025-03-31',
        category: 'Business',
        image: '',
        icon: '',
        createdAt: '2024-11-01',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 1.9,
        volumeChange24h: 45.6,
        priceChange24h: -7.8,
        trending: false,
      },
      {
        id: '10',
        question: 'Will Messi play in the 2026 World Cup?',
        description: 'Resolves Yes if Lionel Messi participates in 2026 FIFA World Cup.',
        outcomePrices: ['0.58', '0.42'],
        outcomes: ['Yes', 'No'],
        volume: 3456789,
        liquidity: 567890,
        active: true,
        closed: false,
        endDate: '2026-07-31',
        category: 'Sports',
        image: '',
        icon: '',
        createdAt: '2024-08-15',
        updatedAt: '2025-11-30',
        enableOrderBook: true,
        spread: 2.6,
        volumeChange24h: 78.9,
        priceChange24h: 6.5,
        trending: false,
      },
    ];
  }

  private static async fetchMarkets(): Promise<Market[]> {
    try {
      // Appeler notre API Next.js qui fait le proxy vers Polymarket
      const response = await axios.get('/api/markets', {
        params: {
          closed: false,
          active: true,
          limit: 100,
        },
      });

      // Si l'API retourne des données, les utiliser
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log('✅ Using real Polymarket data:', response.data.length, 'markets');
        return response.data;
      }

      // Sinon, utiliser les données de démonstration
      console.log('⚠️ API returned no results, using mock data');
      return this.getMockMarkets();
    } catch (error) {
      console.error('❌ Error fetching markets, using mock data:', error);
      // En cas d'erreur, utiliser les données de démonstration
      return this.getMockMarkets();
    }
  }

  static async getAllMarkets(): Promise<Market[]> {
    return this.fetchMarkets();
  }

  static async getTrendingMarkets(limit = 20): Promise<Market[]> {
    const markets = await this.fetchMarkets();

    // Simuler le calcul de trending basé sur volume et changements récents
    return markets
      .map(market => ({
        ...market,
        trending: (market.volume > 100000 || market.volumeChange24h! > 50),
        volumeChange24h: market.volumeChange24h || Math.random() * 100 - 25,
        priceChange24h: market.priceChange24h || Math.random() * 20 - 10,
      }))
      .sort((a, b) => {
        const aScore = (a.volumeChange24h || 0) + (Math.abs(a.priceChange24h || 0) * 2);
        const bScore = (b.volumeChange24h || 0) + (Math.abs(b.priceChange24h || 0) * 2);
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  static async getBestMarkets(limit = 20): Promise<Market[]> {
    const markets = await this.fetchMarkets();

    return markets
      .sort((a, b) => {
        // Score basé sur volume et liquidité
        const aScore = (a.volume || 0) * 0.7 + (a.liquidity || 0) * 0.3;
        const bScore = (b.volume || 0) * 0.7 + (b.liquidity || 0) * 0.3;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  static async getMarketsByCategory(category: string): Promise<Market[]> {
    const markets = await this.fetchMarkets();

    if (category === 'All') {
      return markets;
    }

    return markets.filter(
      market => market.category?.toLowerCase() === category.toLowerCase()
    );
  }

  static async getMarketById(id: string): Promise<Market | null> {
    try {
      // Appeler notre API Next.js qui fait le proxy vers Polymarket
      const response = await axios.get(`/api/markets/${id}`);
      if (response.data) {
        console.log('✅ Using real Polymarket data for market:', id);
        return response.data;
      }
    } catch (error) {
      console.error('❌ Error fetching market, using mock data:', error);
    }

    // Fallback sur les données mock
    const mockMarkets = this.getMockMarkets();
    return mockMarkets.find(m => m.id === id) || mockMarkets[0];
  }

  static async getMarketHistory(marketId: string, days = 7): Promise<MarketHistory[]> {
    try {
      // Récupérer le marché pour obtenir les CLOB token IDs
      const response = await axios.get(`/api/markets/${marketId}`);
      const market = response.data;

      if (!market || !market.clobTokenIds) {
        console.warn('No CLOB token IDs available for market history');
        return this.getFallbackHistory(days);
      }

      // Parser les clobTokenIds (peut être string ou array)
      let clobTokenIds: string[] = [];
      if (typeof market.clobTokenIds === 'string') {
        try {
          clobTokenIds = JSON.parse(market.clobTokenIds);
        } catch (e) {
          clobTokenIds = [market.clobTokenIds];
        }
      } else if (Array.isArray(market.clobTokenIds)) {
        clobTokenIds = market.clobTokenIds;
      }

      if (clobTokenIds.length === 0) {
        console.warn('Empty CLOB token IDs array');
        return this.getFallbackHistory(days);
      }

      // Utiliser le premier token (généralement "Yes" pour les marchés binaires)
      const tokenId = clobTokenIds[0];

      // Configurer les paramètres selon la durée demandée
      const interval = days <= 1 ? '1d' : days <= 7 ? '1w' : 'max';
      const fidelity = days <= 1 ? 60 : 1440; // hourly vs daily

      // Appeler l'API CLOB pour l'historique des prix
      const historyUrl = `https://clob.polymarket.com/prices-history?market=${tokenId}&interval=${interval}&fidelity=${fidelity}`;
      const historyResponse = await axios.get(historyUrl);

      if (!historyResponse.data || !historyResponse.data.history) {
        console.warn('No history data returned from API');
        return this.getFallbackHistory(days);
      }

      // Transformer la réponse en MarketHistory[]
      // Format API: [{t: timestamp_seconds, p: price_0_to_1}]
      return historyResponse.data.history.map((point: { t: number; p: number }) => ({
        timestamp: point.t * 1000, // Convertir secondes en millisecondes
        price: point.p,             // Déjà normalisé entre 0 et 1
        volume: 0,                  // L'endpoint prices-history ne fournit pas le volume
      }));

    } catch (error) {
      console.error('Error fetching market history:', error);
      return this.getFallbackHistory(days);
    }
  }

  // Fonction de fallback pour générer un historique basique
  private static getFallbackHistory(days: number): MarketHistory[] {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const history: MarketHistory[] = [];

    for (let i = days; i >= 0; i--) {
      const timestamp = now - (i * dayMs);
      history.push({
        timestamp,
        price: 0.5,
        volume: 0,
      });
    }

    return history;
  }

  static async searchMarkets(query: string): Promise<Market[]> {
    const markets = await this.fetchMarkets();

    const lowerQuery = query.toLowerCase();
    return markets.filter(market =>
      market.question.toLowerCase().includes(lowerQuery) ||
      market.description?.toLowerCase().includes(lowerQuery)
    );
  }

  static calculateVolatility(history: MarketHistory[]): number {
    if (history.length < 2) return 0;

    const prices = history.map(h => h.price);
    const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;

    return Math.sqrt(variance) * 100; // Volatilité en pourcentage
  }
}
