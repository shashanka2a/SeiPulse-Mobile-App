// Sei Network Configuration
export const SEI_CONFIG = {
  chainId: 'pacific-1',
  chainName: 'Sei Network',
  rpc: 'https://rpc.sei-apis.com',
  rest: 'https://rest.sei-apis.com',
  websocket: 'wss://rpc.sei-apis.com/websocket',
  bech32Prefix: 'sei',
  coinDenom: 'SEI',
  coinMinimalDenom: 'usei',
  coinDecimals: 6,
  gasPriceStep: {
    low: 0.02,
    average: 0.025,
    high: 0.03,
  },
  features: ['cosmwasm', 'ibc-transfer'],
};

export const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// Common CW20 token contracts on Sei
export const COMMON_TOKENS = {
  USDC: 'sei1hjz5k6h3qpe2ql4nq8j8e8l8j8j8j8j8j8j8j8',
  USDT: 'sei1hjz5k6h3qpe2ql4nq8j8e8l8j8j8j8j8j8j8j9',
  // Add more as needed
};

// NFT collection contracts
export const NFT_COLLECTIONS = {
  'Sei Punks': 'sei1nftcontract1...',
  'Sei Apes': 'sei1nftcontract2...',
  // Add more collections
};