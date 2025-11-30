'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Market, MarketHistory } from '@/types/market';
import { PolymarketAPI } from '@/lib/polymarket-api';
import PriceChart from '@/components/PriceChart';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function MarketAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = params.id as string;

  const [market, setMarket] = useState<Market | null>(null);
  const [history, setHistory] = useState<MarketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [volatility, setVolatility] = useState(0);

  useEffect(() => {
    loadMarketData();
  }, [marketId]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [marketData, historyData] = await Promise.all([
        PolymarketAPI.getMarketById(marketId),
        PolymarketAPI.getMarketHistory(marketId, 7),
      ]);

      setMarket(marketData);
      setHistory(historyData);

      if (historyData.length > 0) {
        const vol = PolymarketAPI.calculateVolatility(historyData);
        setVolatility(vol);
      }
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-center text-gray-500">Marché non trouvé</p>
      </div>
    );
  }

  const currentPrice = parseFloat(market.outcomePrices[0] || '0.5');
  // Arrondir comme Polymarket (au pourcent entier)
  const pricePercentage = Math.round(currentPrice * 100);
  const priceChange = market.priceChange24h || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour
      </button>

      {/* Market Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {market.question}
            </h1>
            {market.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {market.description}
              </p>
            )}
          </div>
          {market.category && (
            <span className="ml-4 px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
              {market.category}
            </span>
          )}
        </div>

        {/* Current Price */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Prix actuel
            </p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {pricePercentage}%
              </p>
              {priceChange !== 0 && (
                <div
                  className={`flex items-center gap-1 ${
                    priceChange > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {priceChange > 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(priceChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Volume 24h
            </p>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(market.volume / 1000).toFixed(0)}K
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Liquidité
            </p>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${(market.liquidity / 1000).toFixed(0)}K
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Volatilité
            </p>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {volatility.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Historique des prix (7 derniers jours)
        </h2>
        <PriceChart data={history} showVolume />
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow-lg p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Insights IA
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              📊 Analyse de tendance
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {priceChange > 5
                ? `Le marché connaît une forte hausse de ${priceChange.toFixed(1)}%. Intérêt croissant des participants.`
                : priceChange < -5
                ? `Le marché est en baisse de ${Math.abs(priceChange).toFixed(1)}%. Sentiment bearish dominant.`
                : `Le marché reste stable autour de ${pricePercentage}%. Faible volatilité observée.`}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              💰 Analyse du volume
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {market.volume > 500000
                ? `Volume très élevé (${(market.volume / 1000).toFixed(0)}K$), indiquant un fort engagement du marché.`
                : market.volume > 100000
                ? `Volume modéré (${(market.volume / 1000).toFixed(0)}K$), marché actif.`
                : `Volume faible (${(market.volume / 1000).toFixed(0)}K$), moins d'activité de trading.`}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              🎯 Niveau de confiance
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {currentPrice > 0.7
                ? `Forte probabilité (${pricePercentage}%) - Le marché anticipe fortement l'événement "Oui".`
                : currentPrice < 0.3
                ? `Faible probabilité (${pricePercentage}%) - Le marché anticipe fortement l'événement "Non".`
                : `Probabilité équilibrée (${pricePercentage}%) - Incertitude élevée, marché divisé.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
