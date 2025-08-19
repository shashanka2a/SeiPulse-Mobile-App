import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Eye, Star, Plus, BarChart3, PieChart, Activity, X, Search, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume: string;
  trending?: boolean;
}

interface NFTCollection {
  id: string;
  name: string;
  floorPrice: number;
  change24h: number;
  volume: string;
  items: number;
}

interface WalletData {
  address: string;
  name: string;
  balance: number;
  change24h: number;
  tokens: number;
  nfts: number;
}

const mockMemecoins: Asset[] = [
  { id: '1', name: 'SeiDoge', symbol: 'SDOGE', price: 0.000234, change24h: 45.2, marketCap: '$2.3M', volume: '$456K', trending: true },
  { id: '2', name: 'PepeToken', symbol: 'PEPE', price: 0.00000123, change24h: -12.5, marketCap: '$1.8M', volume: '$234K' },
  { id: '3', name: 'ShibaInu', symbol: 'SHIB', price: 0.0000087, change24h: 23.1, marketCap: '$4.2M', volume: '$789K', trending: true },
  { id: '4', name: 'DogeKing', symbol: 'DKING', price: 0.00456, change24h: -8.7, marketCap: '$892K', volume: '$123K' },
];

const mockNFTs: NFTCollection[] = [
  { id: '1', name: 'Sei Punks', floorPrice: 2.4, change24h: 15.3, volume: '45.2 SEI', items: 10000 },
  { id: '2', name: 'Space Cats', floorPrice: 1.8, change24h: -5.2, volume: '23.1 SEI', items: 5000 },
  { id: '3', name: 'Cyber Bears', floorPrice: 3.1, change24h: 28.7, volume: '67.8 SEI', items: 7500 },
];

const mockWallets: WalletData[] = [
  { address: 'sei1abc...def', name: 'Main Wallet', balance: 15234.56, change24h: 12.3, tokens: 25, nfts: 12 },
  { address: 'sei1xyz...789', name: 'Trading Wallet', balance: 8967.23, change24h: -3.2, tokens: 18, nfts: 5 },
];

export const WatchTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('memecoins');
  const [watchlist, setWatchlist] = useState<string[]>(['1', '3']);
  const [watchedNFTs, setWatchedNFTs] = useState<string[]>(['1']);
  const [watchedWallets, setWatchedWallets] = useState<string[]>(['sei1abc...def']);
  
  // Custom added items
  const [customMemecoins, setCustomMemecoins] = useState<Asset[]>([]);
  const [customNFTs, setCustomNFTs] = useState<NFTCollection[]>([]);
  const [customWallets, setCustomWallets] = useState<WalletData[]>([]);
  
  // Dialog states
  const [showAddToken, setShowAddToken] = useState(false);
  const [showAddNFT, setShowAddNFT] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  
  // Form states
  const [tokenForm, setTokenForm] = useState({ name: '', symbol: '', address: '' });
  const [nftForm, setNftForm] = useState({ name: '', address: '' });
  const [walletForm, setWalletForm] = useState({ name: '', address: '' });

  // Load from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('seipulse-watchlist');
    const savedNFTs = localStorage.getItem('seipulse-watched-nfts');
    const savedWallets = localStorage.getItem('seipulse-watched-wallets');
    const savedCustomMemecoins = localStorage.getItem('seipulse-custom-memecoins');
    const savedCustomNFTs = localStorage.getItem('seipulse-custom-nfts');
    const savedCustomWallets = localStorage.getItem('seipulse-custom-wallets');
    
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    if (savedNFTs) setWatchedNFTs(JSON.parse(savedNFTs));
    if (savedWallets) setWatchedWallets(JSON.parse(savedWallets));
    if (savedCustomMemecoins) setCustomMemecoins(JSON.parse(savedCustomMemecoins));
    if (savedCustomNFTs) setCustomNFTs(JSON.parse(savedCustomNFTs));
    if (savedCustomWallets) setCustomWallets(JSON.parse(savedCustomWallets));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('seipulse-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('seipulse-watched-nfts', JSON.stringify(watchedNFTs));
  }, [watchedNFTs]);

  useEffect(() => {
    localStorage.setItem('seipulse-watched-wallets', JSON.stringify(watchedWallets));
  }, [watchedWallets]);

  useEffect(() => {
    localStorage.setItem('seipulse-custom-memecoins', JSON.stringify(customMemecoins));
  }, [customMemecoins]);

  useEffect(() => {
    localStorage.setItem('seipulse-custom-nfts', JSON.stringify(customNFTs));
  }, [customNFTs]);

  useEffect(() => {
    localStorage.setItem('seipulse-custom-wallets', JSON.stringify(customWallets));
  }, [customWallets]);

  const toggleWatchlist = (id: string) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleNFTWatch = (id: string) => {
    setWatchedNFTs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleWalletWatch = (address: string) => {
    setWatchedWallets(prev => 
      prev.includes(address) ? prev.filter(i => i !== address) : [...prev, address]
    );
  };

  const addCustomToken = () => {
    if (!tokenForm.name || !tokenForm.symbol) return;
    
    const newToken: Asset = {
      id: `custom-${Date.now()}`,
      name: tokenForm.name,
      symbol: tokenForm.symbol.toUpperCase(),
      price: Math.random() * 0.01, // Mock price
      change24h: (Math.random() - 0.5) * 100,
      marketCap: `$${(Math.random() * 10).toFixed(1)}M`,
      volume: `$${(Math.random() * 1000).toFixed(0)}K`,
      trending: Math.random() > 0.7
    };
    
    setCustomMemecoins(prev => [...prev, newToken]);
    setWatchlist(prev => [...prev, newToken.id]);
    setTokenForm({ name: '', symbol: '', address: '' });
    setShowAddToken(false);
  };

  const addCustomNFT = () => {
    if (!nftForm.name) return;
    
    const newNFT: NFTCollection = {
      id: `custom-nft-${Date.now()}`,
      name: nftForm.name,
      floorPrice: Math.random() * 10,
      change24h: (Math.random() - 0.5) * 50,
      volume: `${(Math.random() * 100).toFixed(1)} SEI`,
      items: Math.floor(Math.random() * 10000) + 1000
    };
    
    setCustomNFTs(prev => [...prev, newNFT]);
    setWatchedNFTs(prev => [...prev, newNFT.id]);
    setNftForm({ name: '', address: '' });
    setShowAddNFT(false);
  };

  const addCustomWallet = () => {
    if (!walletForm.address) return;
    
    const newWallet: WalletData = {
      address: walletForm.address,
      name: walletForm.name || 'Custom Wallet',
      balance: Math.random() * 50000,
      change24h: (Math.random() - 0.5) * 20,
      tokens: Math.floor(Math.random() * 50),
      nfts: Math.floor(Math.random() * 20)
    };
    
    setCustomWallets(prev => [...prev, newWallet]);
    setWatchedWallets(prev => [...prev, newWallet.address]);
    setWalletForm({ name: '', address: '' });
    setShowAddWallet(false);
  };

  const removeCustomToken = (id: string) => {
    setCustomMemecoins(prev => prev.filter(token => token.id !== id));
    setWatchlist(prev => prev.filter(tokenId => tokenId !== id));
  };

  const removeCustomNFT = (id: string) => {
    setCustomNFTs(prev => prev.filter(nft => nft.id !== id));
    setWatchedNFTs(prev => prev.filter(nftId => nftId !== id));
  };

  const removeCustomWallet = (address: string) => {
    setCustomWallets(prev => prev.filter(wallet => wallet.address !== address));
    setWatchedWallets(prev => prev.filter(addr => addr !== address));
  };

  // Combine mock and custom data
  const allMemecoins = [...mockMemecoins, ...customMemecoins];
  const allNFTs = [...mockNFTs, ...customNFTs];
  const allWallets = [...mockWallets, ...customWallets];

  const MemecoinCard = ({ asset, showRemove = false }: { asset: Asset; showRemove?: boolean }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{asset.symbol[0]}</span>
          </div>
          <div>
            <p className="font-medium">{asset.name}</p>
            <p className="text-sm text-muted-foreground">{asset.symbol}</p>
            {asset.id.startsWith('custom-') && (
              <Badge variant="outline" className="text-xs mt-1">Custom</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {asset.trending && (
            <Badge variant="secondary" className="text-xs">
              🔥 Trending
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => toggleWatchlist(asset.id)}
            className="h-8 w-8"
          >
            <Star 
              size={16} 
              className={watchlist.includes(asset.id) ? 'fill-yellow-400 text-yellow-400' : ''} 
            />
          </Button>
          {showRemove && asset.id.startsWith('custom-') && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeCustomToken(asset.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">${asset.price.toFixed(6)}</span>
          <div className={`flex items-center space-x-1 ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {asset.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-medium">{Math.abs(asset.change24h).toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Market Cap</p>
            <p className="font-medium">{asset.marketCap}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Volume 24h</p>
            <p className="font-medium">{asset.volume}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  const NFTCard = ({ collection, showRemove = false }: { collection: NFTCollection; showRemove?: boolean }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg"></div>
          <div>
            <p className="font-medium">{collection.name}</p>
            <p className="text-sm text-muted-foreground">{collection.items.toLocaleString()} items</p>
            {collection.id.startsWith('custom-') && (
              <Badge variant="outline" className="text-xs mt-1">Custom</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => toggleNFTWatch(collection.id)}
          >
            <Eye 
              size={16} 
              className={watchedNFTs.includes(collection.id) ? 'text-blue-500' : ''} 
            />
          </Button>
          {showRemove && collection.id.startsWith('custom-') && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeCustomNFT(collection.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{collection.floorPrice.toFixed(2)} SEI</span>
          <div className={`flex items-center space-x-1 ${collection.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {collection.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-medium">{Math.abs(collection.change24h).toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="text-sm">
          <p className="text-muted-foreground">Volume 24h: {collection.volume}</p>
        </div>
      </div>
    </Card>
  );

  const WalletCard = ({ wallet, showRemove = false }: { wallet: WalletData; showRemove?: boolean }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <p className="font-medium">{wallet.name}</p>
            {customWallets.some(w => w.address === wallet.address) && (
              <Badge variant="outline" className="text-xs">Custom</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => toggleWalletWatch(wallet.address)}
          >
            <BarChart3 
              size={16} 
              className={watchedWallets.includes(wallet.address) ? 'text-blue-500' : ''} 
            />
          </Button>
          {showRemove && customWallets.some(w => w.address === wallet.address) && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => removeCustomWallet(wallet.address)}
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">${wallet.balance.toLocaleString()}</span>
          <div className={`flex items-center space-x-1 ${wallet.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {wallet.change24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-medium">{Math.abs(wallet.change24h).toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Tokens</p>
            <p className="font-medium">{wallet.tokens}</p>
          </div>
          <div>
            <p className="text-muted-foreground">NFTs</p>
            <p className="font-medium">{wallet.nfts}</p>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold mb-2">Watch</h1>
        <p className="text-muted-foreground">Track your favorite assets and wallets</p>
      </div>

      {/* AI Market Insights */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1">AI Market Insights</h3>
            <p className="text-sm text-muted-foreground">
              Memecoin sector showing +23% growth. SeiDoge trending due to community events. 
              NFT floor prices recovering across major collections.
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="memecoins">Memecoins</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="memecoins" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Trending Memecoins</h3>
            <Dialog open={showAddToken} onOpenChange={setShowAddToken}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Token
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Token</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="token-name">Token Name</Label>
                    <Input
                      id="token-name"
                      placeholder="e.g., SeiDoge"
                      value={tokenForm.name}
                      onChange={(e) => setTokenForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="token-symbol">Symbol</Label>
                    <Input
                      id="token-symbol"
                      placeholder="e.g., SDOGE"
                      value={tokenForm.symbol}
                      onChange={(e) => setTokenForm(prev => ({ ...prev, symbol: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="token-address">Contract Address (Optional)</Label>
                    <Input
                      id="token-address"
                      placeholder="sei1..."
                      value={tokenForm.address}
                      onChange={(e) => setTokenForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={addCustomToken} className="flex-1">
                      Add Token
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddToken(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-3">
            {allMemecoins.map((asset) => (
              <MemecoinCard key={asset.id} asset={asset} showRemove />
            ))}
          </div>

          {watchlist.length > 0 && (
            <>
              <h3 className="font-medium pt-4">Your Watchlist ({watchlist.length})</h3>
              <div className="space-y-3">
                {allMemecoins
                  .filter(asset => watchlist.includes(asset.id))
                  .map((asset) => (
                    <MemecoinCard key={asset.id} asset={asset} showRemove />
                  ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="nfts" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Popular Collections</h3>
            <Dialog open={showAddNFT} onOpenChange={setShowAddNFT}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add NFT Collection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nft-name">Collection Name</Label>
                    <Input
                      id="nft-name"
                      placeholder="e.g., Sei Punks"
                      value={nftForm.name}
                      onChange={(e) => setNftForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nft-address">Contract Address (Optional)</Label>
                    <Input
                      id="nft-address"
                      placeholder="sei1..."
                      value={nftForm.address}
                      onChange={(e) => setNftForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={addCustomNFT} className="flex-1">
                      Add Collection
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddNFT(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-3">
            {allNFTs.map((collection) => (
              <NFTCard key={collection.id} collection={collection} showRemove />
            ))}
          </div>

          {watchedNFTs.length > 0 && (
            <>
              <h3 className="font-medium pt-4">Watched Collections ({watchedNFTs.length})</h3>
              <div className="space-y-3">
                {allNFTs
                  .filter(collection => watchedNFTs.includes(collection.id))
                  .map((collection) => (
                    <NFTCard key={collection.id} collection={collection} showRemove />
                  ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Tracked Wallets</h3>
            <Dialog open={showAddWallet} onOpenChange={setShowAddWallet}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Wallet to Track</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="wallet-name">Wallet Name (Optional)</Label>
                    <Input
                      id="wallet-name"
                      placeholder="e.g., Trading Wallet"
                      value={walletForm.name}
                      onChange={(e) => setWalletForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="wallet-address">Wallet Address</Label>
                    <Input
                      id="wallet-address"
                      placeholder="sei1..."
                      value={walletForm.address}
                      onChange={(e) => setWalletForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={addCustomWallet} className="flex-1">
                      Add Wallet
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddWallet(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-3">
            {allWallets.map((wallet) => (
              <WalletCard key={wallet.address} wallet={wallet} showRemove />
            ))}
          </div>

          {watchedWallets.length > 0 && (
            <>
              <h3 className="font-medium pt-4">Watched Wallets ({watchedWallets.length})</h3>
              <div className="space-y-3">
                {allWallets
                  .filter(wallet => watchedWallets.includes(wallet.address))
                  .map((wallet) => (
                    <WalletCard key={wallet.address} wallet={wallet} showRemove />
                  ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};