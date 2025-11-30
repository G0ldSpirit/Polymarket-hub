import axios from 'axios';
import { Market, MarketHistory } from '@/types/market';

const POLYMARKET_API_BASE = 'https://gamma-api.polymarket.com';
const CLOB_API_BASE = 'https://clob.polymarket.com';

export class PolymarketAPI {
  private static async fetchMarkets(): Promise<Market[]> {
    try {
      const response = await axios.get(`${POLYMARKET_API_BASE}/markets`, {
        params: {
          closed: false,
          active: true,
          limit: 100,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching markets:', error);
      return [];
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
      const response = await axios.get(`${POLYMARKET_API_BASE}/markets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market:', error);
      return null;
    }
  }

  static async getMarketHistory(marketId: string, days = 7): Promise<MarketHistory[]> {
    try {
      // Simuler l'historique pour la démo
      // En production, utiliser l'API de prix historiques de Polymarket
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const history: MarketHistory[] = [];

      for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * dayMs);
        const basePrice = 0.5;
        const variation = Math.sin(i / 2) * 0.2 + Math.random() * 0.1;
        const price = Math.max(0.01, Math.min(0.99, basePrice + variation));
        const volume = Math.random() * 100000 + 50000;

        history.push({
          timestamp,
          price,
          volume,
        });
      }

      return history;
    } catch (error) {
      console.error('Error fetching market history:', error);
      return [];
    }
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
