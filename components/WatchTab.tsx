import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Eye, Star, Plus, BarChart3, Activity, RefreshCw, Wallet, Coins, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useWallet } from '../hooks/useWallet';
import { usePrices } from '../hooks/usePrices';
import { useWatcher } from '../hooks/useWatcher';
import { useNFTs } from '../hooks/useNFTs';

export const WatchTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tokens');
  
  // Blockchain hooks
  const { client, address, isConnected, connectKeplr } = useWallet();
  const { prices, loading: pricesLoading, refreshPrices, getPrice } = usePrices();
  const { 
    watchedAddresses, 
    watchedTokens, 
    isConnected: watcherConnected,
    loading: watcherLoading,
    addWatchedAddress,
    removeWatchedAddress,
    addWatchedToken,
    removeWatchedToken,
    refreshWatchedData
  } = useWatcher(client);
  const { nfts, loading: nftsLoading, refreshNFTs } = useNFTs(address, client);
  
  // Dialog states
  const [showAddToken, setShowAddToken] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  
  // Form states
  const [tokenForm, setTokenForm] = useState({ symbol: '', contractAddress: '' });
  const [walletForm, setWalletForm] = useState({ name: '', address: '' });

  // Auto-refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshPrices();
      refreshWatchedData();
      if (address && client) {
        refreshNFTs();
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [refreshPrices, refreshWatchedData, refreshNFTs, address, client]);

  const handleAddToken = () => {
    if (!tokenForm.symbol) return;
    
    addWatchedToken(tokenForm.symbol.toUpperCase(), tokenForm.contractAddress || undefined);
    setTokenForm({ symbol: '', contractAddress: '' });
    setShowAddToken(false);
  };

  const handleAddWallet = () => {
    if (!walletForm.address) return;
    
    addWatchedAddress(walletForm.address, walletForm.name || 'Custom Wallet');
    setWalletForm({ name: '', address: '' });
    setShowAddWallet(false);
  };

  const handleRefreshAll = () => {
    refreshPrices();
    refreshWatchedData();
    if (address && client) {
      refreshNFTs();
    }
  };

  const TokenCard = ({ token }: { token: any }) => {
    const priceData = getPrice(token.symbol);
    
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <Coins size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium">{token.symbol}</p>
              {token.contractAddress && (
                <p className="text-xs text-muted-foreground font-mono">
                  {token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-6)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeWatchedToken(token.symbol)}
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          {priceData ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">${priceData.price.toFixed(6)}</span>
                <div className={`flex items-center space-x-1 ${priceData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceData.priceChange24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="font-medium">{Math.abs(priceData.priceChange24h).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Volume 24h</p>
                  <p className="font-medium">${priceData.volume24h.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{new Date(priceData.lastUpdated).toLocaleTimeString()}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Price data not available</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const WalletCard = ({ wallet }: { wallet: any }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Wallet size={20} className="text-blue-500" />
            <p className="font-medium">{wallet.label}</p>
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => removeWatchedAddress(wallet.address)}
            className="h-8 w-8 text-red-500 hover:text-red-700"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">
            {wallet.balance ? `${parseFloat(wallet.balance).toFixed(4)} SEI` : 'Loading...'}
          </span>
        </div>
        
        {wallet.lastUpdated && (
          <div className="text-sm">
            <p className="text-muted-foreground">
              Last updated: {new Date(wallet.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </Card>
  );

  const NFTCard = ({ nft }: { nft: any }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
            <ImageIcon size={20} className="text-white" />
          </div>
          <div>
            <p className="font-medium">{nft.name}</p>
            <p className="text-sm text-muted-foreground">{nft.collection}</p>
            <p className="text-xs text-muted-foreground font-mono">
              #{nft.tokenId}
            </p>
          </div>
        </div>
      </div>
      
      {nft.image && (
        <div className="mt-3">
          <img 
            src={nft.image} 
            alt={nft.name}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {nft.attributes && nft.attributes.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium">Attributes:</p>
          <div className="flex flex-wrap gap-1">
            {nft.attributes.slice(0, 3).map((attr: any, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {attr.trait_type}: {attr.value}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  // Watch functionality is now independent of wallet connection

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Watch</h1>
            <p className="text-muted-foreground">Track real-time blockchain data</p>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefreshAll}
            disabled={pricesLoading || watcherLoading}
          >
            <RefreshCw size={20} className={pricesLoading || watcherLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Market Status */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-0">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1">Market Data</h3>
            <p className="text-sm text-muted-foreground">
              Live prices and data from Sei ecosystem • No wallet required
            </p>
          </div>
          {isConnected && (
            <Badge variant="secondary" className="text-xs">
              Wallet Connected
            </Badge>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Watched Tokens ({watchedTokens.length})</h3>
            <Dialog open={showAddToken} onOpenChange={setShowAddToken}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Token
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Add Token to Watch
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="token-symbol">
                      Token Symbol
                    </Label>
                    <Input
                      id="token-symbol"
                      placeholder="e.g., SEI, USDC"
                      value={tokenForm.symbol}
                      onChange={(e) => setTokenForm(prev => ({ ...prev, symbol: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="token-contract">
                      Contract Address (Optional)
                    </Label>
                    <Input
                      id="token-contract"
                      placeholder="sei1..."
                      value={tokenForm.contractAddress}
                      onChange={(e) => setTokenForm(prev => ({ ...prev, contractAddress: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleAddToken} className="flex-1" disabled={!tokenForm.symbol}>
                      Add Token
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddToken(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-3">
            {watchedTokens.length === 0 ? (
              <Card className="p-8 text-center">
                <Coins size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No tokens being watched</p>
                <p className="text-sm text-muted-foreground mt-1">Add tokens to track their prices</p>
              </Card>
            ) : (
              watchedTokens.map((token) => (
                <TokenCard key={token.symbol} token={token} />
              ))
            )}
          </div>

          {/* Popular tokens suggestion */}
          <div className="space-y-3">
            <h3 className="font-medium">Popular Tokens</h3>
            <div className="grid grid-cols-2 gap-2">
              {['SEI', 'USDC', 'USDT'].map((symbol) => (
                <Button
                  key={symbol}
                  variant="outline"
                  size="sm"
                  onClick={() => addWatchedToken(symbol)}
                  disabled={watchedTokens.some(t => t.symbol === symbol)}
                >
                  <Plus size={14} className="mr-1" />
                  {symbol}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nfts" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">NFT Collections</h3>
            {isConnected && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshNFTs}
                disabled={nftsLoading}
              >
                <RefreshCw size={16} className={`mr-2 ${nftsLoading ? 'animate-spin' : ''}`} />
                Your NFTs
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            {/* Popular NFT Collections - Always visible */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Popular Collections</h4>
              {[
                { name: 'Sei Punks', floor: '2.4 SEI', volume: '45.2 SEI', change: '+15.3%', items: '10,000' },
                { name: 'Space Cats', floor: '1.8 SEI', volume: '23.1 SEI', change: '-5.2%', items: '5,000' },
                { name: 'Cyber Bears', floor: '3.1 SEI', volume: '67.8 SEI', change: '+28.7%', items: '7,500' },
                { name: 'Sei Apes', floor: '4.2 SEI', volume: '89.3 SEI', change: '+42.1%', items: '8,888' },
              ].map((collection, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <ImageIcon size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{collection.name}</p>
                        <p className="text-sm text-muted-foreground">{collection.items} items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{collection.floor}</p>
                      <p className={`text-xs ${collection.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {collection.change}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Volume 24h: {collection.volume}
                  </div>
                </Card>
              ))}
            </div>

            {/* Personal NFTs Section */}
            {isConnected ? (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-medium text-muted-foreground">Your NFTs ({nfts.length})</h4>
                {nftsLoading ? (
                  <Card className="p-8 text-center">
                    <RefreshCw size={48} className="mx-auto mb-4 text-muted-foreground animate-spin" />
                    <p className="text-muted-foreground">Loading your NFTs...</p>
                  </Card>
                ) : nfts.length === 0 ? (
                  <Card className="p-8 text-center">
                    <ImageIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No NFTs found</p>
                    <p className="text-sm text-muted-foreground mt-1">NFTs you own will appear here</p>
                  </Card>
                ) : (
                  nfts.map((nft) => (
                    <NFTCard key={`${nft.contractAddress}-${nft.tokenId}`} nft={nft} />
                  ))
                )}
              </div>
            ) : (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 mt-4">
                <div className="text-center">
                  <Wallet size={24} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    Connect your wallet to view your NFT collection
                  </p>
                  <Button 
                    onClick={connectKeplr} 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Watched Wallets ({watchedAddresses.length})</h3>
            <Dialog open={showAddWallet} onOpenChange={setShowAddWallet}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Add Wallet to Watch
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet-name">
                      Wallet Name (Optional)
                    </Label>
                    <Input
                      id="wallet-name"
                      placeholder="e.g., Trading Wallet"
                      value={walletForm.name}
                      onChange={(e) => setWalletForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wallet-address">
                      Wallet Address
                    </Label>
                    <Input
                      id="wallet-address"
                      placeholder="sei1..."
                      value={walletForm.address}
                      onChange={(e) => setWalletForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={handleAddWallet} className="flex-1" disabled={!walletForm.address}>
                      Add Wallet
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddWallet(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-3">
            {watchedAddresses.length === 0 ? (
              <Card className="p-8 text-center">
                <Wallet size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No wallets being watched</p>
                <p className="text-sm text-muted-foreground mt-1">Add wallet addresses to track their balances</p>
              </Card>
            ) : (
              watchedAddresses.map((wallet) => (
                <WalletCard key={wallet.address} wallet={wallet} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};