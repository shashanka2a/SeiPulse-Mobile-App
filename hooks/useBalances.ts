import { useState, useEffect, useCallback } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { SEI_CONFIG, COMMON_TOKENS } from '../lib/seiConfig';

interface TokenBalance {
  denom: string;
  amount: string;
  symbol: string;
  decimals: number;
  formatted: string;
}

interface BalanceState {
  native: TokenBalance | null;
  tokens: TokenBalance[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export const useBalances = (address: string | null, client: SigningCosmWasmClient | null) => {
  const [balances, setBalances] = useState<BalanceState>({
    native: null,
    tokens: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchNativeBalance = useCallback(async () => {
    if (!address || !client) return null;

    try {
      const balance = await client.getBalance(address, SEI_CONFIG.coinMinimalDenom);
      const formatted = (parseInt(balance.amount) / Math.pow(10, SEI_CONFIG.coinDecimals)).toFixed(6);
      
      return {
        denom: SEI_CONFIG.coinMinimalDenom,
        amount: balance.amount,
        symbol: SEI_CONFIG.coinDenom,
        decimals: SEI_CONFIG.coinDecimals,
        formatted,
      };
    } catch (error) {
      console.error('Failed to fetch native balance:', error);
      return null;
    }
  }, [address, client]);

  const fetchTokenBalance = useCallback(async (contractAddress: string, symbol: string) => {
    if (!address || !client) return null;

    try {
      const result = await client.queryContractSmart(contractAddress, {
        balance: { address }
      });

      // Get token info for decimals
      const tokenInfo = await client.queryContractSmart(contractAddress, {
        token_info: {}
      });

      const decimals = tokenInfo.decimals || 6;
      const formatted = (parseInt(result.balance) / Math.pow(10, decimals)).toFixed(decimals);

      return {
        denom: contractAddress,
        amount: result.balance,
        symbol,
        decimals,
        formatted,
      };
    } catch (error) {
      console.error(`Failed to fetch ${symbol} balance:`, error);
      return null;
    }
  }, [address, client]);

  const fetchAllBalances = useCallback(async () => {
    if (!address || !client) return;

    setBalances(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch native SEI balance
      const nativeBalance = await fetchNativeBalance();

      // Fetch common token balances
      const tokenPromises = Object.entries(COMMON_TOKENS).map(([symbol, contract]) =>
        fetchTokenBalance(contract, symbol)
      );

      const tokenBalances = await Promise.all(tokenPromises);
      const validTokenBalances = tokenBalances.filter(Boolean) as TokenBalance[];

      setBalances({
        native: nativeBalance,
        tokens: validTokenBalances,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });

    } catch (error) {
      console.error('Failed to fetch balances:', error);
      setBalances(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balances',
      }));
    }
  }, [address, client, fetchNativeBalance, fetchTokenBalance]);

  // Auto-fetch balances when wallet connects
  useEffect(() => {
    if (address && client) {
      fetchAllBalances();
    }
  }, [address, client, fetchAllBalances]);

  // Refresh balances every 30 seconds
  useEffect(() => {
    if (!address || !client) return;

    const interval = setInterval(fetchAllBalances, 30000);
    return () => clearInterval(interval);
  }, [address, client, fetchAllBalances]);

  const refreshBalances = useCallback(() => {
    fetchAllBalances();
  }, [fetchAllBalances]);

  return {
    ...balances,
    refreshBalances,
  };
};