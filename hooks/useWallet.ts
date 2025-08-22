import { useState, useEffect, useCallback } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import { SEI_CONFIG } from '../lib/seiConfig';

declare global {
  interface Window extends KeplrWindow {}
}

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  client: SigningCosmWasmClient | null;
  error: string | null;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    client: null,
    error: null,
  });

  const connectKeplr = useCallback(async () => {
    if (!window.keplr) {
      console.log('🦊 Keplr wallet extension not found. Please install it from https://www.keplr.app/download');
      setWallet(prev => ({ ...prev, error: 'Keplr wallet extension not installed. Please install it from keplr.app' }));
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Suggest chain if not added
      await window.keplr.experimentalSuggestChain({
        chainId: SEI_CONFIG.chainId,
        chainName: SEI_CONFIG.chainName,
        rpc: SEI_CONFIG.rpc,
        rest: SEI_CONFIG.rest,
        bip44: { coinType: 118 },
        bech32Config: {
          bech32PrefixAccAddr: SEI_CONFIG.bech32Prefix,
          bech32PrefixAccPub: `${SEI_CONFIG.bech32Prefix}pub`,
          bech32PrefixValAddr: `${SEI_CONFIG.bech32Prefix}valoper`,
          bech32PrefixValPub: `${SEI_CONFIG.bech32Prefix}valoperpub`,
          bech32PrefixConsAddr: `${SEI_CONFIG.bech32Prefix}valcons`,
          bech32PrefixConsPub: `${SEI_CONFIG.bech32Prefix}valconspub`,
        },
        currencies: [{
          coinDenom: SEI_CONFIG.coinDenom,
          coinMinimalDenom: SEI_CONFIG.coinMinimalDenom,
          coinDecimals: SEI_CONFIG.coinDecimals,
        }],
        feeCurrencies: [{
          coinDenom: SEI_CONFIG.coinDenom,
          coinMinimalDenom: SEI_CONFIG.coinMinimalDenom,
          coinDecimals: SEI_CONFIG.coinDecimals,
          gasPriceStep: SEI_CONFIG.gasPriceStep,
        }],
        stakeCurrency: {
          coinDenom: SEI_CONFIG.coinDenom,
          coinMinimalDenom: SEI_CONFIG.coinMinimalDenom,
          coinDecimals: SEI_CONFIG.coinDecimals,
        },
        features: SEI_CONFIG.features,
      });

      await window.keplr.enable(SEI_CONFIG.chainId);
      
      const offlineSigner = window.keplr.getOfflineSigner(SEI_CONFIG.chainId);
      const accounts = await offlineSigner.getAccounts();
      
      const client = await SigningCosmWasmClient.connectWithSigner(
        SEI_CONFIG.rpc,
        offlineSigner
      );

      setWallet({
        address: accounts[0].address,
        isConnected: true,
        isConnecting: false,
        client,
        error: null,
      });

      // Store connection state
      if (typeof window !== 'undefined') {
        localStorage.setItem('seipulse-wallet-connected', 'true');
        localStorage.setItem('seipulse-wallet-address', accounts[0].address);
      }

    } catch (error) {
      console.error('Wallet connection failed:', error);
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }, []);

  const connectLeap = useCallback(async () => {
    // @ts-ignore - Leap wallet
    if (!window.leap) {
      setWallet(prev => ({ ...prev, error: 'Leap wallet not found' }));
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // @ts-ignore
      await window.leap.enable(SEI_CONFIG.chainId);
      // @ts-ignore
      const offlineSigner = window.leap.getOfflineSigner(SEI_CONFIG.chainId);
      const accounts = await offlineSigner.getAccounts();
      
      const client = await SigningCosmWasmClient.connectWithSigner(
        SEI_CONFIG.rpc,
        offlineSigner
      );

      setWallet({
        address: accounts[0].address,
        isConnected: true,
        isConnecting: false,
        client,
        error: null,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('seipulse-wallet-connected', 'true');
        localStorage.setItem('seipulse-wallet-address', accounts[0].address);
      }

    } catch (error) {
      console.error('Leap connection failed:', error);
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      client: null,
      error: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('seipulse-wallet-connected');
      localStorage.removeItem('seipulse-wallet-address');
    }
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const wasConnected = localStorage.getItem('seipulse-wallet-connected');
    if (wasConnected === 'true' && window.keplr) {
      connectKeplr();
    }
  }, [connectKeplr]);

  return {
    ...wallet,
    connectKeplr,
    connectLeap,
    disconnect,
  };
};