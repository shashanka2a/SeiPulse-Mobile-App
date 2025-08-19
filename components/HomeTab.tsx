import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Settings, Bell, Sun, Moon, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useTheme } from '../pages/index';
import { WalletOnboarding } from './WalletOnboarding';

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

interface WalletData {
  address: string;
  mnemonic: string[];
  privateKey: string;
  isBackedUp: boolean;
  hasPin: boolean;
  hasBiometric: boolean;
}

export const HomeTab: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [showBalance, setShowBalance] = useState(true);
  const [hasWallet, setHasWallet] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState(0);

  // Check if user has a wallet on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('seipulse-wallet');
    const savedBalance = localStorage.getItem('seipulse-sei-balance');
    
    if (savedWallet) {
      setWalletData(JSON.parse(savedWallet));
      setHasWallet(true);
      setBalance(savedBalance ? parseFloat(savedBalance) : 2847.32);
    } else {
      // Show onboarding for new users
      setShowOnboarding(true);
    }
  }, []);

  const handleWalletCreated = (newWalletData: WalletData) => {
    setWalletData(newWalletData);
    setHasWallet(true);
    setShowOnboarding(false);
    setBalance(2847.32); // Give new users some starting balance
    
    // Save wallet data
    localStorage.setItem('seipulse-wallet', JSON.stringify(newWalletData));
    localStorage.setItem('seipulse-sei-balance', '2847.32');
  };

  // If no wallet, show onboarding
  if (!hasWallet && showOnboarding) {
    return (
      <WalletOnboarding
        onComplete={handleWalletCreated}
        onClose={() => setShowOnboarding(false)}
      />
    );
  }

  // If no wallet and onboarding was closed, show wallet setup prompt
  if (!hasWallet && !showOnboarding) {
    return (
      <div className="p-4 space-y-6">
        <div className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                SeiPulse
              </h1>
              <p className="text-muted-foreground text-sm">Welcome! 👋</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
            </div>
          </div>
        </div>

        <Card className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
            <Wallet size={40} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-2">No Wallet Found</h2>
            <p className="text-muted-foreground">
              To use SeiPulse, you need a Sei wallet. We'll help you create one securely in just a few steps.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full h-12" 
              onClick={() => setShowOnboarding(true)}
            >
              Create Sei Wallet
            </Button>
            <Button variant="outline" className="w-full h-12">
              Import Existing Wallet
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Your wallet is created locally and encrypted. We never store your private keys.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SeiPulse
          </h1>
          <p className="text-muted-foreground text-sm">Good morning! 👋</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Balance Card */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border-0 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Total Balance</p>
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
              {showBalance ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••'}
            </h2>
            <p className="text-green-500 text-sm">+$124.50 this week</p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
          size="lg"
        >
          <ArrowUpRight className="mr-2" size={20} />
          Pay
        </Button>
        <Button 
          className="h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
          size="lg"
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
                      {transaction.type === 'received' ? '+' : '-'}${transaction.amount.toFixed(2)}
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