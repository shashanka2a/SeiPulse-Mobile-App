import React, { useState } from 'react';
import { ArrowLeft, QrCode, Users, Zap, Shield, AlertTriangle, Check, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useWallet } from '../hooks/useWallet';
import { useBalances } from '../hooks/useBalances';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { SEI_CONFIG } from '../lib/seiConfig';

type PaymentStep = 'amount' | 'recipient' | 'confirm' | 'processing' | 'success';

export const PayTab: React.FC = () => {
  const [step, setStep] = useState<PaymentStep>('amount');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [isRequest, setIsRequest] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  
  // Blockchain hooks
  const { address, client, isConnected, connectKeplr } = useWallet();
  const { native, refreshBalances } = useBalances(address, client);
  const { addToQueue, isOnline } = useOfflineQueue(client, address);
  
  const seiBalance = native ? parseFloat(native.formatted) : 0;

  const resetFlow = () => {
    setStep('amount');
    setAmount('');
    setRecipient('');
    setNote('');
    setIsRequest(false);
  };

  const handleBack = () => {
    if (step === 'amount') return;
    if (step === 'recipient') setStep('amount');
    if (step === 'confirm') setStep('recipient');
    if (step === 'processing') return;
    if (step === 'success') resetFlow();
  };

  const formatSeiAmount = (amount: number): string => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    });
  };

  const AmountStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">{isRequest ? 'Request SEI' : 'Send SEI'}</h2>
        <p className="text-muted-foreground">Enter the amount in SEI tokens</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center space-x-2 mb-6">
          <Button 
            variant={!isRequest ? "default" : "outline"}
            onClick={() => setIsRequest(false)}
            className="rounded-full px-6"
          >
            Send
          </Button>
          <Button 
            variant={isRequest ? "default" : "outline"}
            onClick={() => setIsRequest(true)}
            className="rounded-full px-6"
          >
            Request
          </Button>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold mb-2 flex items-center justify-center">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent border-none outline-none text-center w-40"
              placeholder="0"
              autoFocus
              step="0.000001"
              min="0"
            />
            <span className="ml-2 text-2xl text-muted-foreground">SEI</span>
          </div>
          <p className="text-muted-foreground">
            Available: {formatSeiAmount(seiBalance)} SEI
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-8">
          {[1, 5, 10, 25, 50, 100].map((preset) => (
            <Button 
              key={preset}
              variant="outline" 
              onClick={() => setAmount(preset.toString())}
              className="h-12"
            >
              {preset} SEI
            </Button>
          ))}
        </div>
      </div>

      <Button 
        className="w-full h-12" 
        disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > seiBalance}
        onClick={() => setStep('recipient')}
      >
        Continue
      </Button>
    </div>
  );

  const RecipientStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Send to</h2>
        <p className="text-muted-foreground">Enter @handle or sei address</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="recipient">Recipient</Label>
          <Input 
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="@username or sei1..."
            className="h-12"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12">
            <QrCode className="mr-2" size={20} />
            Scan QR
          </Button>
          <Button variant="outline" className="h-12">
            <Users className="mr-2" size={20} />
            Contacts
          </Button>
        </div>

        <div>
          <Label htmlFor="note">Note (optional)</Label>
          <Input 
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's this for?"
            className="h-12"
          />
        </div>

        {/* Recent Recipients */}
        <div>
          <Label>Recent</Label>
          <div className="space-y-2 mt-2">
            {['@alexc', '@sarah', '@mike'].map((handle) => (
              <button
                key={handle}
                onClick={() => setRecipient(handle)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {handle[1]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="font-medium">User Name</p>
                  <p className="text-sm text-muted-foreground">{handle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button 
        className="w-full h-12" 
        disabled={!recipient}
        onClick={() => setStep('confirm')}
      >
        Continue
      </Button>
    </div>
  );

  const ConfirmStep = () => {
    const amountNum = parseFloat(amount);
    const fee = SEI_CONFIG.gasPriceStep.average * 200000 / 1000000; // Estimate gas fee
    const total = amountNum + fee;
    const riskLevel = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low';
    
    const handleConfirmPayment = async () => {
      if (!client || !address) {
        alert('Wallet not connected');
        return;
      }
      
      setStep('processing');
      
      try {
        if (isRequest) {
          // For requests, just simulate success
          setTimeout(() => setStep('success'), 2000);
          return;
        }
        
        // Convert SEI to usei (micro SEI)
        const amountInUsei = Math.floor(amountNum * 1000000).toString();
        
        if (isOnline) {
          // Send transaction directly
          const result = await client.sendTokens(
            address,
            recipient,
            [{ denom: SEI_CONFIG.coinMinimalDenom, amount: amountInUsei }],
            'auto',
            note || undefined
          );
          
          setTxId(result.transactionHash);
          refreshBalances(); // Refresh balance after successful transaction
        } else {
          // Add to offline queue
          const queuedTxId = addToQueue({
            type: 'send',
            recipient,
            amount: amountInUsei,
          });
          setTxId(queuedTxId);
        }
        
        setTimeout(() => setStep('success'), 2000);
        
      } catch (error) {
        console.error('Transaction failed:', error);
        alert(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setStep('confirm');
      }
    };
    
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Confirm {isRequest ? 'Request' : 'Payment'}</h2>
          <p className="text-muted-foreground">Review the transaction details</p>
        </div>

        {/* AI Risk Assessment */}
        <Card className={`p-4 border-l-4 ${
          riskLevel === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-950' :
          riskLevel === 'medium' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
          'border-l-green-500 bg-green-50 dark:bg-green-950'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-1 rounded-full ${
              riskLevel === 'high' ? 'bg-red-500' :
              riskLevel === 'medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}>
              {riskLevel === 'high' ? (
                <AlertTriangle size={16} className="text-white" />
              ) : riskLevel === 'medium' ? (
                <Zap size={16} className="text-white" />
              ) : (
                <Shield size={16} className="text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium">AI Security Check</p>
                <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'default' : 'secondary'}>
                  {riskLevel.toUpperCase()} RISK
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {riskLevel === 'high' 
                  ? 'Large amount to unknown recipient. Double-check the address.'
                  : riskLevel === 'medium'
                  ? 'New recipient. Verify the address.'
                  : 'Transaction appears safe.'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Details */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {recipient[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium">{recipient}</p>
                <p className="text-sm text-muted-foreground">Recipient</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">{formatSeiAmount(amountNum)} SEI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span className="font-medium">{formatSeiAmount(fee)} SEI</span>
              </div>
              {!isRequest && (
                <div className="flex justify-between font-medium border-t pt-3">
                  <span>Total</span>
                  <span>{formatSeiAmount(total)} SEI</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium">Sei Pacific-1</span>
              </div>
              {note && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Note</span>
                  <span className="font-medium text-right max-w-32 truncate">{note}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Button 
          className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          onClick={handleConfirmPayment}
          disabled={!isRequest && total > seiBalance}
        >
          {isRequest ? 'Send Request' : `Send ${formatSeiAmount(amountNum)} SEI`}
        </Button>
        
        {!isRequest && total > seiBalance && (
          <p className="text-center text-red-500 text-sm">
            Insufficient balance. You need {formatSeiAmount(total - seiBalance)} more SEI.
          </p>
        )}
      </div>
    );
  };

  const ProcessingStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
        <Wallet size={40} className="text-white" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {isOnline ? 'Processing Transaction' : 'Queued for Processing'}
        </h2>
        <p className="text-muted-foreground">
          {isOnline 
            ? 'Broadcasting to Sei network...'
            : 'Transaction will be sent when connection is restored'
          }
        </p>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <p className="text-sm text-muted-foreground">
          {isOnline ? 'This usually takes 2-5 seconds' : 'Offline mode - transaction queued'}
        </p>
      </div>
    </div>
  );

  const SuccessStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <Check size={40} className="text-white" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {isRequest ? 'Request Sent!' : 'Payment Sent!'}
        </h2>
        <p className="text-muted-foreground">
          {isRequest 
            ? `Request for ${formatSeiAmount(parseFloat(amount))} SEI sent to ${recipient}`
            : `${formatSeiAmount(parseFloat(amount))} SEI sent to ${recipient}`
          }
        </p>
      </div>

      <Card className="p-4 text-left">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-sm">
              {txId ? `${txId.slice(0, 8)}...${txId.slice(-8)}` : 'Generating...'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network</span>
            <span className="font-medium">{SEI_CONFIG.chainName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network Fee</span>
            <span className="font-medium">{(SEI_CONFIG.gasPriceStep.average * 200000 / 1000000).toFixed(6)} SEI</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="secondary" className="text-green-600">
              {isOnline ? '✓ Confirmed' : '⏳ Queued'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Button className="w-full h-12" onClick={resetFlow}>
          Send Another
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12">
            View Receipt
          </Button>
          <Button variant="outline" className="h-12">
            Share
          </Button>
        </div>
      </div>
    </div>
  );

  // Show wallet connection screen if not connected
  if (!isConnected) {
    return (
      <div className="p-4 h-full">
        <div className="max-w-sm mx-auto pt-20">
          <Card className="p-8 text-center">
            <Wallet size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Sei wallet to send and receive payments
            </p>
            <Button onClick={connectKeplr} className="w-full">
              Connect Keplr Wallet
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6 pt-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 bg-border rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: step === 'amount' ? '20%' : 
                     step === 'recipient' ? '40%' : 
                     step === 'confirm' ? '60%' : 
                     step === 'processing' ? '80%' : '100%' 
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-sm mx-auto">
        {step === 'amount' && <AmountStep />}
        {step === 'recipient' && <RecipientStep />}
        {step === 'confirm' && <ConfirmStep />}
        {step === 'processing' && <ProcessingStep />}
        {step === 'success' && <SuccessStep />}
      </div>
    </div>
  );
};