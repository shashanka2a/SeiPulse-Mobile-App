import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export const KeplrStatus: React.FC = () => {
  const [hasKeplr, setHasKeplr] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkKeplr = () => {
      if (typeof window !== 'undefined') {
        setHasKeplr(!!window.keplr);
        setIsChecking(false);
      }
    };

    // Check immediately
    checkKeplr();

    // Check again after a short delay (in case extension is still loading)
    const timer = setTimeout(checkKeplr, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return (
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Checking for Keplr wallet...
          </p>
        </div>
      </Card>
    );
  }

  if (hasKeplr) {
    return (
      <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-3">
          <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Keplr wallet detected! Ready to connect.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Keplr Extension Required
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Install the Keplr browser extension to connect your wallet
            </p>
          </div>
        </div>
        <Button 
          onClick={() => window.open('https://www.keplr.app/download', '_blank')} 
          size="sm"
          variant="outline"
          className="w-full border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
        >
          <Download size={16} className="mr-2" />
          Install Keplr Extension
        </Button>
      </div>
    </Card>
  );
};