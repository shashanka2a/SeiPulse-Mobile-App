import { useState, useEffect, useCallback } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { SEI_CONFIG } from '../lib/seiConfig';

interface WatchedAddress {
  address: string;
  label: string;
  balance?: string;
  lastTx?: string;
  lastUpdated?: number;
}

interface WatchedToken {
  symbol: string;
  contractAddress?: string;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
  lastUpdated?: number;
}

interface Transaction {
  hash: string;
  height: number;
  timestamp: string;
  type: string;
  amount?: string;
  from?: string;
  to?: string;
  status: 'success' | 'failed';
}

interface WatcherState {
  watchedAddresses: WatchedAddress[];
  watchedTokens: WatchedToken[];
  recentTransactions: Transaction[];
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

export const useWatcher = (client: SigningCosmWasmClient | null) => {
  const [watcherState, setWatcherState] = useState<WatcherState>({
    watchedAddresses: [],
    watchedTokens: [],
    recentTransactions: [],
    isConnected: false,
    loading: false,
    error: null,
  });

  const [wsClient, setWsClient] = useState<WebSocket | null>(null);
  const [tmClient, setTmClient] = useState<Tendermint34Client | null>(null);

  // Initialize Tendermint client for queries
  useEffect(() => {
    const initTmClient = async () => {
      try {
        const client = await Tendermint34Client.connect(SEI_CONFIG.rpc);
        setTmClient(client);
      } catch (error) {
        console.error('Failed to connect to Tendermint:', error);
      }
    };

    initTmClient();

    return () => {
      if (tmClient) {
        tmClient.disconnect();
      }
    };
  }, []);

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    if (wsClient?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(SEI_CONFIG.websocket);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setWatcherState(prev => ({ ...prev, isConnected: true, error: null }));
      
      // Subscribe to new blocks
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        method: 'subscribe',
        id: 1,
        params: {
          query: "tm.event='NewBlock'"
        }
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.result?.data?.type === 'tendermint/event/NewBlock') {
          // Handle new block - refresh watched addresses
          refreshWatchedData();
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWatcherState(prev => ({ ...prev, isConnected: false }));
      
      // Reconnect after 5 seconds
      setTimeout(() => connectWebSocket(), 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWatcherState(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: 'WebSocket connection failed' 
      }));
    };

    setWsClient(ws);
  }, []);

  // Load watched items from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedAddresses = localStorage.getItem('seipulse-watched-addresses');
    const savedTokens = localStorage.getItem('seipulse-watched-tokens');

    if (savedAddresses) {
      try {
        const addresses = JSON.parse(savedAddresses);
        setWatcherState(prev => ({ ...prev, watchedAddresses: addresses }));
      } catch (error) {
        console.error('Failed to load watched addresses:', error);
      }
    }

    if (savedTokens) {
      try {
        const tokens = JSON.parse(savedTokens);
        setWatcherState(prev => ({ ...prev, watchedTokens: tokens }));
      } catch (error) {
        console.error('Failed to load watched tokens:', error);
      }
    }
  }, []);

  // Connect WebSocket when client is available
  useEffect(() => {
    if (client) {
      connectWebSocket();
    }

    return () => {
      if (wsClient) {
        wsClient.close();
      }
    };
  }, [client]);

  const addWatchedAddress = useCallback((address: string, label: string) => {
    const newAddress: WatchedAddress = { address, label };
    
    setWatcherState(prev => {
      const updated = [...prev.watchedAddresses, newAddress];
      if (typeof window !== 'undefined') {
        localStorage.setItem('seipulse-watched-addresses', JSON.stringify(updated));
      }
      return { ...prev, watchedAddresses: updated };
    });
  }, []);

  const removeWatchedAddress = useCallback((address: string) => {
    setWatcherState(prev => {
      const updated = prev.watchedAddresses.filter(addr => addr.address !== address);
      if (typeof window !== 'undefined') {
        localStorage.setItem('seipulse-watched-addresses', JSON.stringify(updated));
      }
      return { ...prev, watchedAddresses: updated };
    });
  }, []);

  const addWatchedToken = useCallback((symbol: string, contractAddress?: string) => {
    const newToken: WatchedToken = { symbol, contractAddress };
    
    setWatcherState(prev => {
      const updated = [...prev.watchedTokens, newToken];
      if (typeof window !== 'undefined') {
        localStorage.setItem('seipulse-watched-tokens', JSON.stringify(updated));
      }
      return { ...prev, watchedTokens: updated };
    });
  }, []);

  const removeWatchedToken = useCallback((symbol: string) => {
    setWatcherState(prev => {
      const updated = prev.watchedTokens.filter(token => token.symbol !== symbol);
      if (typeof window !== 'undefined') {
        localStorage.setItem('seipulse-watched-tokens', JSON.stringify(updated));
      }
      return { ...prev, watchedTokens: updated };
    });
  }, []);

  const fetchAddressBalance = useCallback(async (address: string): Promise<string> => {
    if (!client) return '0';

    try {
      const balance = await client.getBalance(address, SEI_CONFIG.coinMinimalDenom);
      return (parseInt(balance.amount) / Math.pow(10, SEI_CONFIG.coinDecimals)).toFixed(6);
    } catch (error) {
      console.error(`Failed to fetch balance for ${address}:`, error);
      return '0';
    }
  }, [client]);

  const fetchRecentTransactions = useCallback(async (address: string): Promise<Transaction[]> => {
    if (!tmClient) return [];

    try {
      // Query recent transactions for the address
      const txs = await tmClient.txSearchAll({
        query: `transfer.recipient='${address}' OR transfer.sender='${address}'`,
        order_by: 'desc',
        per_page: 10,
      });

      return txs.txs.map(tx => ({
        hash: Buffer.from(tx.hash).toString('hex').toUpperCase(),
        height: tx.height,
        timestamp: new Date().toISOString(),
        type: 'transfer',
        status: tx.result.code === 0 ? 'success' : 'failed',
      }));
    } catch (error) {
      console.error(`Failed to fetch transactions for ${address}:`, error);
      return [];
    }
  }, [tmClient]);

  const refreshWatchedData = useCallback(async () => {
    if (!client || watcherState.watchedAddresses.length === 0) return;

    setWatcherState(prev => ({ ...prev, loading: true }));

    try {
      const updatedAddresses = await Promise.all(
        watcherState.watchedAddresses.map(async (addr) => {
          const balance = await fetchAddressBalance(addr.address);
          const transactions = await fetchRecentTransactions(addr.address);
          
          return {
            ...addr,
            balance,
            lastTx: transactions[0]?.hash,
            lastUpdated: Date.now(),
          };
        })
      );

      setWatcherState(prev => ({
        ...prev,
        watchedAddresses: updatedAddresses,
        loading: false,
      }));

    } catch (error) {
      console.error('Failed to refresh watched data:', error);
      setWatcherState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh data',
      }));
    }
  }, [client, watcherState.watchedAddresses, fetchAddressBalance, fetchRecentTransactions]);

  // Refresh watched data every 30 seconds
  useEffect(() => {
    if (watcherState.watchedAddresses.length > 0) {
      const interval = setInterval(() => refreshWatchedData(), 30000);
      return () => clearInterval(interval);
    }
  }, [watcherState.watchedAddresses.length]);

  return {
    ...watcherState,
    addWatchedAddress,
    removeWatchedAddress,
    addWatchedToken,
    removeWatchedToken,
    refreshWatchedData,
  };
};