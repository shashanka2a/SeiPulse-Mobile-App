import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export const SimpleHome: React.FC = () => {
  return (
    <div className="p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          SeiPulse
        </h1>
        <p className="text-gray-600 text-sm">Welcome! 👋</p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Total Balance</p>
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold">2,847.32 SEI</h2>
            <p className="text-green-500 text-sm">+124.50 this week</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button className="h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0">
          Pay
        </Button>
        <Button className="h-14 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0">
          Request
        </Button>
      </div>

      <Card className="p-4">
        <h3 className="mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-3">
          {['@alex', '@sarah', '@mike', '@jenny'].map((handle) => (
            <div key={handle} className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-1"></div>
              <span className="text-xs text-gray-600">{handle}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};