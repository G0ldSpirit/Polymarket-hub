'use client';

import { useState, useEffect } from 'react';
import { Market, Category } from '@/types/market';
import { PolymarketAPI } from '@/lib/polymarket-api';
import MarketCard from '@/components/MarketCard';
import { Search, Filter, TrendingUp, Award, Loader2 } from 'lucide-react';

const CATEGORIES: Category[] = [
  'All',
  'Politics',
  'Sports',
  'Crypto',
  'Pop Culture',
  'Science',
  'Business',
];

export default function ComparatorPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'best' | 'trending'>('best');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMarkets();
  }, [activeTab, selectedCategory]);

  const loadMarkets = async () => {
    setLoading(true);
    try {
      let data: Market[];

      if (activeTab === 'trending') {
        data = await PolymarketAPI.getTrendingMarkets(50);
      } else {
        data = await PolymarketAPI.getBestMarkets(50);
      }

      if (selectedCategory !== 'All') {
        data = data.filter(
          (m) => m.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
      }

      setMarkets(data);
      setFilteredMarkets(data);
    } catch (error) {
      console.error('Error loading markets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMarkets(markets);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = markets.filter(
        (market) =>
          market.question.toLowerCase().includes(query) ||
          market.description?.toLowerCase().includes(query)
      );
      setFilteredMarkets(filtered);
    }
  }, [searchQuery, markets]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Comparateur de Marchés
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Découvrez les meilleurs marchés et les plus populaires sur Polymarket
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('best')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'best'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Award className="w-5 h-5" />
          Meilleurs Marchés
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === 'trending'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Trending
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtres
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un marché..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredMarkets.length} marché{filteredMarkets.length > 1 ? 's' : ''} trouvé
              {filteredMarkets.length > 1 ? 's' : ''}
            </p>
          </div>

          {filteredMarkets.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Aucun marché trouvé avec ces filtres
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  showTrending={activeTab === 'trending'}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
