import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Settings, Bell, Sun, Moon, Wallet, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useTheme } from '../pages/index';
import { useWallet } from '../hooks/useWallet';
import { useBalances } from '../hooks/useBalances';

interface Transaction {
  id: string;
  type: 'sent' | 'received';
  amount: number;
  user: string;
  handle: string;
  timestamp: string;
  status: 'completed' | 'pending';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'received',
    amount: 250.00,
    user: 'Alex Chen',
    handle: '@alexc',
    timestamp: '2 hours ago',
    status: 'completed'
  },
  {
    id: '2', 
    type: 'sent',
    amount: 75.50,
    user: 'Sarah Kim',
    handle: '@sarahk',
    timestamp: '1 day ago',
    status: 'completed'
  },
  {
    id: '3',
    type: 'received',
    amount: 1000.00,
    user: 'Michael Wang',
    handle: '@mwang',
    timestamp: '2 days ago',
    status: 'pending'
  }
];

export const HomeTab: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [showBalance, setShowBalance] = useState(true);
  
  // Blockchain hooks
  const { address, isConnected, connectKeplr, client } = useWallet();
  const { native, tokens, loading: balancesLoading, refreshBalances } = useBalances(address, client);
  
  const totalBalance = native ? parseFloat(native.formatted) : 0;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SeiPulse
          </h1>
          <p className="text-muted-foreground text-sm">
            {isConnected ? `Connected: ${address?.slice(0, 8)}...${address?.slice(-6)}` : 'Welcome! 👋'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={refreshBalances}
              disabled={balancesLoading}
            >
              <RefreshCw size={20} className={balancesLoading ? 'animate-spin' : ''} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <Button variant="ghost" size="icon">
            <Bell size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings size={20} />
          </Button>
        </div>
      </div>

      {/* Wallet Connection / Balance Card */}
      {!isConnected ? (
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border-0 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <Wallet size={48} className="mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Connect your Sei wallet to view your balance and make transactions
              </p>
              <Button onClick={connectKeplr} className="w-full">
                Connect Keplr Wallet
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border-0 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-muted-foreground">SEI Balance</p>
                <Badge variant="secondary" className="text-xs">Live</Badge>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="h-8 w-8"
              >
                {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-bold">
                {balancesLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw size={24} className="animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : showBalance ? (
                  `${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} SEI`
                ) : (
                  '••••••'
                )}
              </h2>
              {native && (
                <p className="text-muted-foreground text-sm">
                  Raw: {native.amount} usei
                </p>
              )}
            </div>
            
            {/* Token Balances */}
            {tokens.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium">Other Tokens</p>
                <div className="space-y-1">
                  {tokens.map((token) => (
                    <div key={token.denom} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{token.symbol}</span>
                      <span className="font-medium">{token.formatted}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
          size="lg"
          disabled={!isConnected}
        >
          <ArrowUpRight className="mr-2" size={20} />
          Pay
        </Button>
        <Button 
          className="h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
          size="lg"
          disabled={!isConnected}
        >
          <ArrowDownLeft className="mr-2" size={20} />
          Request
        </Button>
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3>Quick Actions</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus size={16} />
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {['@alexc', '@sarah', '@mike', '@jenny'].map((handle) => (
            <div key={handle} className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-1"></div>
              <span className="text-xs text-muted-foreground">{handle}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3>Recent Activity</h3>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {mockTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'received' 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                {transaction.type === 'received' ? (
                  <ArrowDownLeft size={16} className="text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowUpRight size={16} className="text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{transaction.user}</p>
                    <p className="text-sm text-muted-foreground">{transaction.handle}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'received' ? 'text-green-600' : 'text-foreground'
                    }`}>
                      {transaction.type === 'received' ? '+' : '-'}{transaction.amount.toFixed(2)} SEI
                    </p>
                    <p className="text-xs text-muted-foreground">{transaction.timestamp}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};