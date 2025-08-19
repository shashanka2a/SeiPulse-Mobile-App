import React from 'react';
import { User, Settings, Shield, CreditCard, Bell, HelpCircle, LogOut, Moon, Sun, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { useTheme } from '../pages/index';

export const ProfileTab: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const ProfileSection = () => (
    <Card className="p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <User size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Alex Johnson</h2>
          <p className="text-muted-foreground">@alexj</p>
          <Badge variant="secondary" className="mt-1">Verified</Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-xl font-bold">$2,847</p>
          <p className="text-sm text-muted-foreground">Balance</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">156</p>
          <p className="text-sm text-muted-foreground">Transactions</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">23</p>
          <p className="text-sm text-muted-foreground">Friends</p>
        </div>
      </div>
    </Card>
  );

  const SettingsSection = () => (
    <div className="space-y-3">
      <h3 className="font-medium px-2">Settings</h3>
      
      <Card className="divide-y">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Moon size={20} className="text-muted-foreground" />
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle dark theme</p>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={toggleTheme} />
        </div>
        
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell size={20} className="text-muted-foreground" />
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-muted-foreground">Payment alerts & updates</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone size={20} className="text-muted-foreground" />
            <div>
              <p className="font-medium">Biometric Lock</p>
              <p className="text-sm text-muted-foreground">Use Face ID/Touch ID</p>
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </Card>
    </div>
  );

  const AccountSection = () => (
    <div className="space-y-3">
      <h3 className="font-medium px-2">Account</h3>
      
      <Card className="divide-y">
        <button className="p-4 flex items-center space-x-3 w-full text-left hover:bg-accent transition-colors">
          <CreditCard size={20} className="text-muted-foreground" />
          <div>
            <p className="font-medium">Payment Methods</p>
            <p className="text-sm text-muted-foreground">Manage cards & banks</p>
          </div>
        </button>
        
        <button className="p-4 flex items-center space-x-3 w-full text-left hover:bg-accent transition-colors">
          <Shield size={20} className="text-muted-foreground" />
          <div>
            <p className="font-medium">Security</p>
            <p className="text-sm text-muted-foreground">Password & 2FA</p>
          </div>
        </button>
        
        <button className="p-4 flex items-center space-x-3 w-full text-left hover:bg-accent transition-colors">
          <Settings size={20} className="text-muted-foreground" />
          <div>
            <p className="font-medium">Privacy</p>
            <p className="text-sm text-muted-foreground">Data & permissions</p>
          </div>
        </button>
      </Card>
    </div>
  );

  const SupportSection = () => (
    <div className="space-y-3">
      <h3 className="font-medium px-2">Support</h3>
      
      <Card className="divide-y">
        <button className="p-4 flex items-center space-x-3 w-full text-left hover:bg-accent transition-colors">
          <HelpCircle size={20} className="text-muted-foreground" />
          <div>
            <p className="font-medium">Help Center</p>
            <p className="text-sm text-muted-foreground">FAQs & guides</p>
          </div>
        </button>
        
        <button className="p-4 flex items-center space-x-3 w-full text-left hover:bg-accent transition-colors">
          <User size={20} className="text-muted-foreground" />
          <div>
            <p className="font-medium">Contact Support</p>
            <p className="text-sm text-muted-foreground">Get help from our team</p>
          </div>
        </button>
      </Card>
    </div>
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account and settings</p>
      </div>

      <ProfileSection />
      <SettingsSection />
      <AccountSection />
      <SupportSection />

      {/* Logout */}
      <Card>
        <button className="p-4 flex items-center space-x-3 w-full text-left hover:bg-accent transition-colors text-destructive">
          <LogOut size={20} />
          <div>
            <p className="font-medium">Sign Out</p>
            <p className="text-sm text-muted-foreground">Log out of your account</p>
          </div>
        </button>
      </Card>

      {/* App Info */}
      <div className="text-center pt-4">
        <p className="text-sm text-muted-foreground">SeiPulse v1.0.0</p>
        <p className="text-xs text-muted-foreground mt-1">Built with ❤️ for the Sei ecosystem</p>
      </div>
    </div>
  );
};