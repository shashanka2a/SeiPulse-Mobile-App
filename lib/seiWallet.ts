// Browser-compatible Sei Wallet Integration

export interface SeiWallet {
  address: string;
  mnemonic: string[];
  privateKey: string;
  publicKey: string;
}

// Sei address prefix
const SEI_ADDRESS_PREFIX = 'sei';

/**
 * Generate a Sei wallet using browser-compatible crypto
 */
export function generateSeiWallet(): SeiWallet {
  try {
    // For now, use enhanced mock wallet with better randomness
    return generateEnhancedMockWallet();
  } catch (error) {
    console.error('Error generating Sei wallet:', error);
    return generateMockWallet();
  }
}

/**
 * Generate enhanced mock wallet with better randomness
 */
function generateEnhancedMockWallet(): SeiWallet {
  // Enhanced word list for more realistic mnemonic
  const wordList = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'agent', 'agree',
    'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol'
  ];
  
  // Generate 12 random words
  const mnemonic: string[] = [];
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    mnemonic.push(wordList[randomIndex]);
  }
  
  // Generate realistic Sei address
  const addressSuffix = Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('');
  const address = 'sei1' + addressSuffix.substring(0, 39);
  
  // Generate realistic private key (64 hex characters)
  const privateKey = Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  // Generate realistic public key (64 hex characters)
  const publicKey = Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  
  return {
    address,
    mnemonic,
    privateKey: '0x' + privateKey,
    publicKey: '0x' + publicKey
  };
}

/**
 * Mock wallet for development/testing
 */
function generateMockWallet(): SeiWallet {
  const mockMnemonic = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent',
    'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
  ];
  
  const mockAddress = 'sei1' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const mockPrivateKey = '0x' + Math.random().toString(16).substring(2, 66);
  const mockPublicKey = '0x' + Math.random().toString(16).substring(2, 66);
  
  return {
    address: mockAddress,
    mnemonic: mockMnemonic,
    privateKey: mockPrivateKey,
    publicKey: mockPublicKey
  };
}

/**
 * Generate mock Sei address
 */
function generateMockAddress(): string {
  return 'sei1' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Validate Sei address format
 */
export function validateSeiAddress(address: string): boolean {
  return address.startsWith('sei1') && address.length >= 39 && address.length <= 45;
}

/**
 * Import wallet from mnemonic (mock implementation)
 */
export function importSeiWallet(mnemonic: string): SeiWallet | null {
  try {
    const mnemonicWords = mnemonic.trim().split(' ');
    
    if (mnemonicWords.length !== 12) {
      throw new Error('Invalid mnemonic: must be 12 words');
    }
    
    // For now, generate a deterministic wallet based on mnemonic
    const seed = mnemonicWords.join('').length;
    const addressSuffix = (seed * 12345).toString(36).padStart(39, '0');
    const address = 'sei1' + addressSuffix.substring(0, 39);
    
    return {
      address,
      mnemonic: mnemonicWords,
      privateKey: '0x' + (seed * 67890).toString(16).padStart(64, '0'),
      publicKey: '0x' + (seed * 54321).toString(16).padStart(64, '0')
    };
  } catch (error) {
    console.error('Error importing Sei wallet:', error);
    return null;
  }
}

/**
 * Get wallet balance (mock for now - would connect to Sei RPC)
 */
export async function getSeiBalance(address: string): Promise<number> {
  try {
    // In production, this would call Sei RPC:
    // const response = await fetch(`https://rpc.sei-apis.com/cosmos/bank/v1beta1/balances/${address}`);
    // const data = await response.json();
    // return parseFloat(data.balances.find(b => b.denom === 'usei')?.amount || '0') / 1000000;
    
    // Mock balance for development
    return Math.random() * 10000;
  } catch (error) {
    console.error('Error fetching Sei balance:', error);
    return 0;
  }
}

/**
 * Send Sei transaction (mock for now - would use Sei SDK)
 */
export async function sendSeiTransaction(
  fromAddress: string,
  toAddress: string,
  amount: number,
  privateKey: string,
  memo?: string
): Promise<{ txHash: string; success: boolean }> {
  try {
    // In production, this would:
    // 1. Create transaction using @sei-js/core
    // 2. Sign with private key
    // 3. Broadcast to Sei network
    // 4. Return real transaction hash
    
    // Mock transaction for development
    const txHash = 'sei' + Math.random().toString(36).substring(2, 15).toUpperCase();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      txHash,
      success: true
    };
  } catch (error) {
    console.error('Error sending Sei transaction:', error);
    return {
      txHash: '',
      success: false
    };
  }
}