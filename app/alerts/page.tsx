'use client';

import { useState, useEffect } from 'react';
import { Alert, Market } from '@/types/market';
import { AlertSystem } from '@/lib/alerts';
import { PolymarketAPI } from '@/lib/polymarket-api';
import AlertCard from '@/components/AlertCard';
import { Bell, RefreshCw, Loader2, Filter } from 'lucide-react';

type AlertFilter = 'all' | 'high' | 'medium' | 'low';
type AlertType = 'all' | 'price_spike' | 'price_drop' | 'volume_surge' | 'new_trending';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<AlertFilter>('all');
  const [typeFilter, setTypeFilter] = useState<AlertType>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAlerts(true);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadAlerts = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      // Charger les marchés et détecter les alertes
      const markets = await PolymarketAPI.getTrendingMarkets(50);
      const detectedAlerts = AlertSystem.detectAlerts(markets);

      // Pour la démo, ajouter aussi des alertes mockées
      const mockAlerts = AlertSystem.generateMockAlerts();

      setAlerts([...detectedAlerts, ...mockAlerts]);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) {
      return false;
    }
    if (typeFilter !== 'all' && alert.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const alertCounts = {
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
    low: alerts.filter((a) => a.severity === 'low').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Alertes & Notifications
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => loadAlerts()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-refresh (30s)
              </span>
            </label>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Suivez les mouvements importants du marché en temps réel
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                Alertes Critiques
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                {alertCounts.high}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                Alertes Moyennes
              </p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {alertCounts.medium}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                Alertes Mineures
              </p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                {alertCounts.low}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtres
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sévérité
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'high', 'medium', 'low'] as AlertFilter[]).map((severity) => (
                <button
                  key={severity}
                  onClick={() => setSeverityFilter(severity)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    severityFilter === severity
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {severity === 'all'
                    ? 'Toutes'
                    : severity === 'high'
                    ? 'Critiques'
                    : severity === 'medium'
                    ? 'Moyennes'
                    : 'Mineures'}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type d&apos;alerte
            </label>
            <div className="flex flex-wrap gap-2">
              {(['all', 'price_spike', 'price_drop', 'volume_surge', 'new_trending'] as AlertType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                      typeFilter === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type === 'all'
                      ? 'Tous'
                      : type === 'price_spike'
                      ? '📈 Hausse'
                      : type === 'price_drop'
                      ? '📉 Baisse'
                      : type === 'volume_surge'
                      ? '💰 Volume'
                      : '🔥 Trending'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredAlerts.length} alerte{filteredAlerts.length > 1 ? 's' : ''} trouvée
              {filteredAlerts.length > 1 ? 's' : ''}
            </p>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Aucune alerte avec ces filtres
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
