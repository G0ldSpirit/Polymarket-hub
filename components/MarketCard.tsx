'use client';

import { Market } from '@/types/market';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import Link from 'next/link';

interface MarketCardProps {
  market: Market;
  showTrending?: boolean;
}

export default function MarketCard({ market, showTrending = false }: MarketCardProps) {
  const currentPrice = parseFloat(market.outcomePrices[0] || '0.5');
  const pricePercentage = (currentPrice * 100).toFixed(1);
  const priceChange = market.priceChange24h || 0;
  const volumeChange = market.volumeChange24h || 0;

  return (
    <Link href={`/analysis/${market.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {market.question}
            </h3>
            {market.category && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {market.category}
              </span>
            )}
          </div>
          {showTrending && market.trending && (
            <div className="ml-2 flex items-center gap-1 text-orange-500">
              <Activity className="w-5 h-5" />
              <span className="text-xs font-bold">HOT</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Prix actuel</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pricePercentage}%
              </p>
              {priceChange !== 0 && (
                <div className={`flex items-center gap-1 ${priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceChange > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {Math.abs(priceChange).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              ${(market.volume / 1000).toFixed(0)}K
            </p>
            {volumeChange !== 0 && (
              <p className={`text-xs ${volumeChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {volumeChange > 0 ? '+' : ''}{volumeChange.toFixed(0)}% 24h
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Liquidité</p>
            <p className="font-medium text-gray-900 dark:text-white">
              ${(market.liquidity / 1000).toFixed(0)}K
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Spread</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {market.spread ? `${market.spread.toFixed(2)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
