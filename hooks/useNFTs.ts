import { useState, useEffect, useCallback } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { NFT_COLLECTIONS } from '../lib/seiConfig';

interface NFTToken {
  tokenId: string;
  name: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  collection: string;
  contractAddress: string;
}

interface NFTState {
  nfts: NFTToken[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export const useNFTs = (address: string | null, client: SigningCosmWasmClient | null) => {
  const [nftState, setNftState] = useState<NFTState>({
    nfts: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchNFTsFromCollection = useCallback(async (
    contractAddress: string, 
    collectionName: string
  ): Promise<NFTToken[]> => {
    if (!address || !client) return [];

    try {
      // Get tokens owned by address
      const tokensResult = await client.queryContractSmart(contractAddress, {
        tokens: {
          owner: address,
          limit: 100,
        }
      });

      const tokenIds = tokensResult.tokens || [];
      
      // Fetch metadata for each token
      const nftPromises = tokenIds.map(async (tokenId: string) => {
        try {
          const tokenInfo = await client.queryContractSmart(contractAddress, {
            nft_info: { token_id: tokenId }
          });

          // Parse metadata if it's a URI
          let metadata = tokenInfo.extension;
          if (typeof tokenInfo.extension === 'string' && tokenInfo.extension.startsWith('http')) {
            try {
              const response = await fetch(tokenInfo.extension);
              metadata = await response.json();
            } catch {
              metadata = { name: `Token #${tokenId}` };
            }
          }

          return {
            tokenId,
            name: metadata?.name || `${collectionName} #${tokenId}`,
            description: metadata?.description,
            image: metadata?.image,
            attributes: metadata?.attributes,
            collection: collectionName,
            contractAddress,
          };
        } catch (error) {
          console.error(`Failed to fetch NFT ${tokenId}:`, error);
          return {
            tokenId,
            name: `${collectionName} #${tokenId}`,
            collection: collectionName,
            contractAddress,
          };
        }
      });

      return await Promise.all(nftPromises);
    } catch (error) {
      console.error(`Failed to fetch NFTs from ${collectionName}:`, error);
      return [];
    }
  }, [address, client]);

  const fetchAllNFTs = useCallback(async () => {
    if (!address || !client) return;

    setNftState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const collectionPromises = Object.entries(NFT_COLLECTIONS).map(([name, contract]) =>
        fetchNFTsFromCollection(contract, name)
      );

      const collectionResults = await Promise.all(collectionPromises);
      const allNFTs = collectionResults.flat();

      setNftState({
        nfts: allNFTs,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });

    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      setNftState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch NFTs',
      }));
    }
  }, [address, client, fetchNFTsFromCollection]);

  // Auto-fetch NFTs when wallet connects
  useEffect(() => {
    if (address && client) {
      fetchAllNFTs();
    }
  }, [address, client, fetchAllNFTs]);

  const refreshNFTs = useCallback(() => {
    fetchAllNFTs();
  }, [fetchAllNFTs]);

  return {
    ...nftState,
    refreshNFTs,
  };
};