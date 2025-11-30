'use client';

import { useState, useEffect } from 'react';
import { Market } from '@/types/market';
import { PolymarketAPI } from '@/lib/polymarket-api';
import MarketCard from '@/components/MarketCard';
import { TrendingUp, Loader2 } from 'lucide-react';

export default function AnalysisPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    setLoading(true);
    try {
      const data = await PolymarketAPI.getTrendingMarkets(20);
      setMarkets(data);
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analyse & Insights
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Analysez en profondeur les marchés avec graphiques et prédictions
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-blue-800 dark:text-blue-200">
          💡 <strong>Astuce:</strong> Cliquez sur un marché pour voir son analyse détaillée avec graphiques de prix, historique et métriques avancées.
        </p>
      </div>

      {/* Markets List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} showTrending />
          ))}
        </div>
      )}
    </div>
  );
}
