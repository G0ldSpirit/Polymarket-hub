'use client';

import { Alert } from '@/types/market';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AlertCardProps {
  alert: Alert;
}

export default function AlertCard({ alert }: AlertCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'low':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getIcon = () => {
    switch (alert.type) {
      case 'price_spike':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'price_drop':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'volume_surge':
        return <Activity className="w-5 h-5 text-blue-500" />;
      case 'new_trending':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (alert.type) {
      case 'price_spike':
        return 'Hausse de prix';
      case 'price_drop':
        return 'Baisse de prix';
      case 'volume_surge':
        return 'Surge de volume';
      case 'new_trending':
        return 'Nouveau trending';
      default:
        return 'Alerte';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
              {getTypeLabel()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: fr })}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {alert.marketQuestion}
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {alert.message}
          </p>
        </div>
      </div>
    </div>
  );
}
