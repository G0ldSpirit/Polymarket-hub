export interface Market {
  id: string;
  question: string;
  description: string;
  outcomePrices: string[];
  outcomes: string[];
  volume: number;
  liquidity: number;
  active: boolean;
  closed: boolean;
  endDate: string | null;
  category: string;
  image: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  enableOrderBook: boolean;
  spread: number;
  volumeChange24h?: number;
  priceChange24h?: number;
  trending?: boolean;
  volatility?: number;
}

export interface MarketHistory {
  timestamp: number;
  price: number;
  volume: number;
}

export interface Alert {
  id: string;
  marketId: string;
  marketQuestion: string;
  type: 'price_spike' | 'price_drop' | 'volume_surge' | 'new_trending';
  message: string;
  timestamp: number;
  priceChange?: number;
  volumeChange?: number;
  severity: 'low' | 'medium' | 'high';
}

export interface MarketFilter {
  category?: string;
  minVolume?: number;
  minLiquidity?: number;
  active?: boolean;
  search?: string;
  sortBy?: 'volume' | 'liquidity' | 'recent' | 'trending';
}

export type Category =
  | 'All'
  | 'Politics'
  | 'Sports'
  | 'Crypto'
  | 'Pop Culture'
  | 'Science'
  | 'Business';
