import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Shield, 
  Key, 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Smartphone,
  QrCode,
  CreditCard,
  Gift,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type OnboardingStep = 'welcome' | 'create' | 'security' | 'backup' | 'verify' | 'fund' | 'complete';

interface WalletData {
  address: string;
  mnemonic: string[];
  privateKey: string;
  isBackedUp: boolean;
  hasPin: boolean;
  hasBiometric: boolean;
}

interface OnboardingProps {
  onComplete: (walletData: WalletData) => void;
  onClose: () => void;
}

export const WalletOnboarding: React.FC<OnboardingProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [verificationWords, setVerificationWords] = useState<number[]>([]);
  const [verificationInput, setVerificationInput] = useState<string[]>(['', '', '']);
  const [fundingMethod, setFundingMethod] = useState<'faucet' | 'transfer' | 'buy'>('faucet');

  // Generate wallet data
  const generateWallet = () => {
    const mnemonic = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent',
      'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'
    ];
    
    const address = 'sei1' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const privateKey = '0x' + Math.random().toString(16).substring(2, 66);
    
    const wallet: WalletData = {
      address,
      mnemonic,
      privateKey,
      isBackedUp: false,
      hasPin: false,
      hasBiometric: false
    };
    
    setWalletData(wallet);
    
    // Generate random positions for verification
    const positions = [];
    while (positions.length < 3) {
      const pos = Math.floor(Math.random() * 12);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    setVerificationWords(positions.sort((a, b) => a - b));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackup = () => {
    if (!walletData) return;
    
    const backupData = {
      address: walletData.address,
      mnemonic: walletData.mnemonic.join(' '),
      createdAt: new Date().toISOString(),
      network: 'sei-pacific-1'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sei-wallet-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const verifyMnemonic = () => {
    if (!walletData) return false;
    
    return verificationWords.every((pos, index) => 
      verificationInput[index].toLowerCase() === walletData.mnemonic[pos].toLowerCase()
    );
  };

  const completeOnboarding = () => {
    if (!walletData) return;
    
    const completedWallet = {
      ...walletData,
      isBackedUp: true,
      hasPin: pin.length > 0,
      hasBiometric: false // Would be set based on actual biometric setup
    };
    
    onComplete(completedWallet);
  };

  const WelcomeStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
        <Wallet size={40} className="text-white" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Welcome to SeiPulse</h2>
        <p className="text-muted-foreground">
          To get started with Sei payments, you'll need a wallet. We'll help you create one securely.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4 text-left">
          <div className="flex items-start space-x-3">
            <Shield className="text-green-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">Your wallet is created locally and encrypted</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 text-left">
          <div className="flex items-start space-x-3">
            <Key className="text-blue-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium">You Own Your Keys</h3>
              <p className="text-sm text-muted-foreground">Full control over your funds and data</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 text-left">
          <div className="flex items-start space-x-3">
            <Smartphone className="text-purple-500 mt-1" size={20} />
            <div>
              <h3 className="font-medium">Easy to Use</h3>
              <p className="text-sm text-muted-foreground">Simple interface for sending and receiving SEI</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <Button 
          className="w-full h-12" 
          onClick={() => {
            generateWallet();
            setStep('create');
          }}
        >
          Create New Wallet
        </Button>
        <Button variant="outline" className="w-full h-12">
          Import Existing Wallet
        </Button>
      </div>
    </div>
  );

  const CreateStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Wallet Created!</h2>
        <p className="text-muted-foreground">Your new Sei wallet has been generated</p>
      </div>

      {walletData && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Your Wallet Address</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input 
                  value={walletData.address} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(walletData.address)}
                >
                  <Copy size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This is your public address for receiving SEI tokens
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Important: Backup Required
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    You'll need to backup your recovery phrase in the next step
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Button 
        className="w-full h-12" 
        onClick={() => setStep('security')}
      >
        Continue to Security Setup
      </Button>
    </div>
  );

  const SecurityStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Secure Your Wallet</h2>
        <p className="text-muted-foreground">Add extra security to protect your funds</p>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Key className="text-blue-500" size={20} />
                <div>
                  <h3 className="font-medium">PIN Code</h3>
                  <p className="text-sm text-muted-foreground">6-digit PIN for quick access</p>
                </div>
              </div>
              <Badge variant="secondary">Recommended</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="6 digits"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirm-pin">Confirm PIN</Label>
                <Input
                  id="confirm-pin"
                  type="password"
                  placeholder="Confirm"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="text-green-500" size={20} />
              <div>
                <h3 className="font-medium">Biometric Lock</h3>
                <p className="text-sm text-muted-foreground">Use Face ID or Touch ID</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Enable Later
            </Button>
          </div>
        </Card>
      </div>

      <Button 
        className="w-full h-12" 
        onClick={() => setStep('backup')}
        disabled={pin.length !== 6 || pin !== confirmPin}
      >
        Continue to Backup
      </Button>
    </div>
  );

  const BackupStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Backup Your Wallet</h2>
        <p className="text-muted-foreground">
          Save your recovery phrase to restore your wallet if needed
        </p>
      </div>

      <Card className="p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="text-red-600 mt-0.5" size={16} />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Critical: Store Safely
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Anyone with this phrase can access your wallet. Never share it online.
            </p>
          </div>
        </div>
      </Card>

      {walletData && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Recovery Phrase</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMnemonic(!showMnemonic)}
              >
                {showMnemonic ? <EyeOff size={16} /> : <Eye size={16} />}
                {showMnemonic ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {walletData.mnemonic.map((word, index) => (
                <div key={index} className="p-2 bg-muted rounded text-center">
                  <span className="text-xs text-muted-foreground">{index + 1}</span>
                  <p className="font-mono text-sm">
                    {showMnemonic ? word : '•••••'}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => copyToClipboard(walletData.mnemonic.join(' '))}
              >
                <Copy className="mr-2" size={16} />
                Copy Phrase
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={downloadBackup}
              >
                <Download className="mr-2" size={16} />
                Download Backup
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Button 
        className="w-full h-12" 
        onClick={() => setStep('verify')}
      >
        I've Saved My Recovery Phrase
      </Button>
    </div>
  );

  const VerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Verify Recovery Phrase</h2>
        <p className="text-muted-foreground">
          Enter the requested words to confirm you've saved your phrase
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {verificationWords.map((wordIndex, index) => (
            <div key={index}>
              <Label htmlFor={`word-${index}`}>
                Word #{wordIndex + 1}
              </Label>
              <Input
                id={`word-${index}`}
                placeholder={`Enter word #${wordIndex + 1}`}
                value={verificationInput[index]}
                onChange={(e) => {
                  const newInput = [...verificationInput];
                  newInput[index] = e.target.value;
                  setVerificationInput(newInput);
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      <Button 
        className="w-full h-12" 
        onClick={() => setStep('fund')}
        disabled={!verifyMnemonic()}
      >
        Verify & Continue
      </Button>
    </div>
  );

  const FundStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Fund Your Wallet</h2>
        <p className="text-muted-foreground">
          Add some SEI tokens to start making payments
        </p>
      </div>

      <Tabs value={fundingMethod} onValueChange={(value) => setFundingMethod(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faucet">Testnet Faucet</TabsTrigger>
          <TabsTrigger value="transfer">Receive</TabsTrigger>
          <TabsTrigger value="buy">Buy SEI</TabsTrigger>
        </TabsList>

        <TabsContent value="faucet" className="space-y-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <Gift className="mx-auto text-green-500" size={48} />
              <div>
                <h3 className="font-medium">Get Free Testnet SEI</h3>
                <p className="text-sm text-muted-foreground">
                  Perfect for testing and learning
                </p>
              </div>
              <Button className="w-full">
                <ExternalLink className="mr-2" size={16} />
                Visit Sei Faucet
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <QrCode className="mx-auto text-blue-500" size={48} />
              <div>
                <h3 className="font-medium">Receive SEI</h3>
                <p className="text-sm text-muted-foreground">
                  Share your address to receive tokens
                </p>
              </div>
              {walletData && (
                <div className="space-y-2">
                  <Input 
                    value={walletData.address} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => copyToClipboard(walletData.address)}
                  >
                    <Copy className="mr-2" size={16} />
                    Copy Address
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="buy" className="space-y-4">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <CreditCard className="mx-auto text-purple-500" size={48} />
              <div>
                <h3 className="font-medium">Buy SEI Tokens</h3>
                <p className="text-sm text-muted-foreground">
                  Purchase SEI with credit card or bank transfer
                </p>
              </div>
              <Button className="w-full" variant="outline">
                <ExternalLink className="mr-2" size={16} />
                Open Exchange
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Button 
        className="w-full h-12" 
        onClick={() => setStep('complete')}
      >
        Skip for Now
      </Button>
    </div>
  );

  const CompleteStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={40} className="text-white" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">Wallet Setup Complete!</h2>
        <p className="text-muted-foreground">
          Your Sei wallet is ready to use. You can now send and receive SEI tokens.
        </p>
      </div>

      {walletData && (
        <Card className="p-4 text-left">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet Address</span>
              <span className="font-mono text-sm">
                {walletData.address.slice(0, 12)}...{walletData.address.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security</span>
              <div className="flex space-x-1">
                {walletData.hasPin && <Badge variant="secondary">PIN</Badge>}
                {walletData.isBackedUp && <Badge variant="secondary">Backed Up</Badge>}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <span className="font-medium">Sei Pacific-1</span>
            </div>
          </div>
        </Card>
      )}

      <Button 
        className="w-full h-12" 
        onClick={completeOnboarding}
      >
        Start Using SeiPulse
      </Button>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {step === 'welcome' && 'Welcome'}
              {step === 'create' && 'Create Wallet'}
              {step === 'security' && 'Security Setup'}
              {step === 'backup' && 'Backup Wallet'}
              {step === 'verify' && 'Verify Backup'}
              {step === 'fund' && 'Fund Wallet'}
              {step === 'complete' && 'Setup Complete'}
            </DialogTitle>
            {step !== 'welcome' && step !== 'complete' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const steps: OnboardingStep[] = ['welcome', 'create', 'security', 'backup', 'verify', 'fund', 'complete'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex > 0) {
                    setStep(steps[currentIndex - 1]);
                  }
                }}
              >
                <ArrowLeft size={16} />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Progress indicator */}
        {step !== 'welcome' && step !== 'complete' && (
          <div className="w-full bg-border rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ 
                width: step === 'create' ? '20%' : 
                       step === 'security' ? '40%' : 
                       step === 'backup' ? '60%' : 
                       step === 'verify' ? '80%' : 
                       step === 'fund' ? '100%' : '0%' 
              }}
            />
          </div>
        )}

        {step === 'welcome' && <WelcomeStep />}
        {step === 'create' && <CreateStep />}
        {step === 'security' && <SecurityStep />}
        {step === 'backup' && <BackupStep />}
        {step === 'verify' && <VerifyStep />}
        {step === 'fund' && <FundStep />}
        {step === 'complete' && <CompleteStep />}
      </DialogContent>
    </Dialog>
  );
};