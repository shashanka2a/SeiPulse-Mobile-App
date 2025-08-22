import { useState, useEffect, useCallback } from 'react';
import { DEXSCREENER_API } from '../lib/seiConfig';

interface TokenPrice {
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap?: number;
  liquidity?: number;
  lastUpdated: number;
}

interface PriceState {
  prices: Record<string, TokenPrice>;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Popular Sei ecosystem tokens to track
const TRACKED_TOKENS = [
  'SEI',
  'USDC',
  'USDT',
  // Add more tokens as they become available
];

export const usePrices = () => {
  const [priceState, setPriceState] = useState<PriceState>({
    prices: {},
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchSeiPrice = useCallback(async (): Promise<TokenPrice | null> => {
    try {
      // Fetch SEI price from multiple sources and average
      const responses = await Promise.allSettled([
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=sei-network&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true'),
        fetch('https://api.coinmarketcap.com/data-api/v3/cryptocurrency/market-pairs/latest?slug=sei&start=1&limit=1'),
      ]);

      let price = 0;
      let priceChange24h = 0;
      let volume24h = 0;

      // Parse CoinGecko response
      if (responses[0].status === 'fulfilled') {
        const cgData = await responses[0].value.json();
        if (cgData['sei-network']) {
          price = cgData['sei-network'].usd || 0;
          priceChange24h = cgData['sei-network'].usd_24h_change || 0;
          volume24h = cgData['sei-network'].usd_24h_vol || 0;
        }
      }

      return {
        symbol: 'SEI',
        price,
        priceChange24h,
        volume24h,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      console.error('Failed to fetch SEI price:', error);
      return null;
    }
  }, []);

  const fetchDexScreenerPrices = useCallback(async (): Promise<TokenPrice[]> => {
    try {
      // Search for Sei ecosystem tokens on DEX Screener
      const response = await fetch(`${DEXSCREENER_API}/search/?q=sei`);
      const data = await response.json();

      if (!data.pairs) return [];

      return data.pairs
        .filter((pair: any) => pair.chainId === 'sei')
        .slice(0, 20) // Limit to top 20
        .map((pair: any) => ({
          symbol: pair.baseToken.symbol,
          price: parseFloat(pair.priceUsd || '0'),
          priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
          volume24h: parseFloat(pair.volume?.h24 || '0'),
          liquidity: parseFloat(pair.liquidity?.usd || '0'),
          lastUpdated: Date.now(),
        }));
    } catch (error) {
      console.error('Failed to fetch DEX Screener prices:', error);
      return [];
    }
  }, []);

  const fetchAllPrices = useCallback(async () => {
    setPriceState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [seiPrice, dexPrices] = await Promise.all([
        fetchSeiPrice(),
        fetchDexScreenerPrices(),
      ]);

      const pricesMap: Record<string, TokenPrice> = {};

      // Add SEI price
      if (seiPrice) {
        pricesMap['SEI'] = seiPrice;
      }

      // Add DEX prices
      dexPrices.forEach(price => {
        pricesMap[price.symbol] = price;
      });

      setPriceState({
        prices: pricesMap,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });

    } catch (error) {
      console.error('Failed to fetch prices:', error);
      setPriceState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prices',
      }));
    }
  }, [fetchSeiPrice, fetchDexScreenerPrices]);

  // Initial fetch
  useEffect(() => {
    fetchAllPrices();
  }, [fetchAllPrices]);

  // Refresh prices every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAllPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchAllPrices]);

  const refreshPrices = useCallback(() => {
    fetchAllPrices();
  }, [fetchAllPrices]);

  const getPrice = useCallback((symbol: string): TokenPrice | null => {
    return priceState.prices[symbol] || null;
  }, [priceState.prices]);

  return {
    ...priceState,
    refreshPrices,
    getPrice,
  };
};