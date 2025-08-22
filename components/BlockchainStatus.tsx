import React from 'react';
import { Wifi, WifiOff, Activity, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { useWallet } from '../hooks/useWallet';
import { useWatcher } from '../hooks/useWatcher';

export const BlockchainStatus: React.FC = () => {
  const { isConnected, address, client } = useWallet();
  const { isConnected: watcherConnected } = useWatcher(client);
  const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;

  if (!isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-background/80 backdrop-blur-sm border rounded-full px-3 py-2 shadow-lg">
        {/* Network Status */}
        <div className="flex items-center space-x-1">
          {isOnline ? (
            <Wifi size={14} className="text-green-500" />
          ) : (
            <WifiOff size={14} className="text-red-500" />
          )}
          <Badge variant={isOnline ? "secondary" : "destructive"} className="text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Blockchain Connection */}
        <div className="flex items-center space-x-1">
          {watcherConnected ? (
            <Activity size={14} className="text-blue-500" />
          ) : (
            <AlertCircle size={14} className="text-yellow-500" />
          )}
          <Badge variant={watcherConnected ? "secondary" : "outline"} className="text-xs">
            {watcherConnected ? 'Live' : 'Connecting'}
          </Badge>
        </div>

        {/* Wallet Address */}
        <Badge variant="outline" className="text-xs font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Badge>
      </div>
    </div>
  );
};