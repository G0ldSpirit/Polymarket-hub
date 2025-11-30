import { Market, Alert } from '@/types/market';

export class AlertSystem {
  private static readonly PRICE_SPIKE_THRESHOLD = 10; // 10% en 1h
  private static readonly VOLUME_SURGE_THRESHOLD = 100; // 100% d'augmentation
  private static previousPrices: Map<string, number> = new Map();
  private static previousVolumes: Map<string, number> = new Map();

  static detectAlerts(markets: Market[]): Alert[] {
    const alerts: Alert[] = [];

    markets.forEach(market => {
      // Vérifier les variations de prix
      const currentPrice = parseFloat(market.outcomePrices[0] || '0.5');
      const previousPrice = this.previousPrices.get(market.id);

      if (previousPrice !== undefined) {
        const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;

        // Alerte spike de prix
        if (Math.abs(priceChange) >= this.PRICE_SPIKE_THRESHOLD) {
          alerts.push({
            id: `alert-${market.id}-${Date.now()}`,
            marketId: market.id,
            marketQuestion: market.question,
            type: priceChange > 0 ? 'price_spike' : 'price_drop',
            message: `Prix ${priceChange > 0 ? 'en hausse' : 'en baisse'} de ${Math.abs(priceChange).toFixed(1)}%`,
            timestamp: Date.now(),
            priceChange,
            severity: Math.abs(priceChange) > 20 ? 'high' : Math.abs(priceChange) > 15 ? 'medium' : 'low',
          });
        }
      }

      // Vérifier les variations de volume
      const currentVolume = market.volume || 0;
      const previousVolume = this.previousVolumes.get(market.id);

      if (previousVolume !== undefined && previousVolume > 0) {
        const volumeChange = ((currentVolume - previousVolume) / previousVolume) * 100;

        // Alerte surge de volume
        if (volumeChange >= this.VOLUME_SURGE_THRESHOLD) {
          alerts.push({
            id: `alert-${market.id}-volume-${Date.now()}`,
            marketId: market.id,
            marketQuestion: market.question,
            type: 'volume_surge',
            message: `Volume en hausse de ${volumeChange.toFixed(0)}%`,
            timestamp: Date.now(),
            volumeChange,
            severity: volumeChange > 300 ? 'high' : volumeChange > 200 ? 'medium' : 'low',
          });
        }
      }

      // Mise à jour des valeurs précédentes
      this.previousPrices.set(market.id, currentPrice);
      this.previousVolumes.set(market.id, currentVolume);

      // Alerte nouveau trending
      if (market.trending && market.volumeChange24h && market.volumeChange24h > 50) {
        alerts.push({
          id: `alert-${market.id}-trending-${Date.now()}`,
          marketId: market.id,
          marketQuestion: market.question,
          type: 'new_trending',
          message: `Nouveau marché trending avec +${market.volumeChange24h.toFixed(0)}% de volume`,
          timestamp: Date.now(),
          severity: 'medium',
        });
      }
    });

    // Trier par sévérité puis par timestamp
    return alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.timestamp - a.timestamp;
    });
  }

  static generateMockAlerts(): Alert[] {
    // Génère des alertes de démonstration
    const mockMarkets = [
      {
        id: '1',
        question: 'Will Bitcoin reach $100k in 2024?',
        priceChange: 15.3,
        type: 'price_spike' as const,
      },
      {
        id: '2',
        question: 'Will Trump win the 2024 election?',
        priceChange: -12.7,
        type: 'price_drop' as const,
      },
      {
        id: '3',
        question: 'Will AI surpass human intelligence by 2030?',
        volumeChange: 250,
        type: 'volume_surge' as const,
      },
    ];

    return mockMarkets.map((market, index) => ({
      id: `mock-alert-${index}`,
      marketId: market.id,
      marketQuestion: market.question,
      type: market.type,
      message:
        market.type === 'volume_surge'
          ? `Volume en hausse de ${market.volumeChange}%`
          : `Prix ${market.type === 'price_spike' ? 'en hausse' : 'en baisse'} de ${Math.abs(market.priceChange || 0).toFixed(1)}%`,
      timestamp: Date.now() - index * 1000 * 60 * 5, // 5 min d'écart
      priceChange: market.priceChange,
      volumeChange: market.volumeChange,
      severity: (Math.abs(market.priceChange || market.volumeChange || 0) > 200
        ? 'high'
        : 'medium') as 'high' | 'medium' | 'low',
    }));
  }
}
