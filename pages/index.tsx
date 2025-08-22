'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { Home, CreditCard, TrendingUp, User } from 'lucide-react';
import { HomeTab } from '../components/HomeTab';
import { PayTab } from '../components/PayTab';
import { WatchTab } from '../components/WatchTab';
import { ProfileTab } from '../components/ProfileTab';
import { BlockchainStatus } from '../components/BlockchainStatus';


interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', newValue);
      }
      return newValue;
    });
  }, []);

  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

const tabs = [
  { id: 'home', label: 'Home', icon: Home, component: HomeTab },
  { id: 'pay', label: 'Pay', icon: CreditCard, component: PayTab },
  { id: 'watch', label: 'Watch', icon: TrendingUp, component: WatchTab },
  { id: 'profile', label: 'Profile', icon: User, component: ProfileTab },
];

function HomePage() {
  const [activeTab, setActiveTab] = useState('home');

  const renderActiveComponent = useCallback(() => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'pay':
        return <PayTab />;
      case 'watch':
        return <WatchTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  }, [activeTab]);

  return (
    <>
      <Head>
        <title>SeiPulse - Modern Payment App</title>
        <meta name="description" content="SeiPulse - Modern payment app for the Sei ecosystem" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 min-h-screen flex flex-col">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-20">
              {renderActiveComponent()}
            </div>
            
            {/* Blockchain Status */}
            <BlockchainStatus />

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-around py-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'scale-110' : ''} />
                      <span className="text-xs mt-1">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </>
  );
}

export default React.memo(HomePage);