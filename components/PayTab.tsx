import React, { useState, useEffect } from 'react';
import { ArrowLeft, QrCode, Users, Zap, Shield, AlertTriangle, Check, Copy, ExternalLink, Plus, Trash2, Edit, Camera, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

type PaymentStep = 'amount' | 'recipient' | 'confirm' | 'processing' | 'success';

interface Contact {
  id: string;
  name: string;
  handle: string;
  address: string;
  avatar?: string;
  lastUsed?: Date;
  isFavorite?: boolean;
}

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'request_sent' | 'request_received';
  amount: number;
  recipient: string;
  recipientAddress: string;
  sender?: string;
  senderAddress?: string;
  note?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  fee: number;
  blockHeight?: number;
}

export const PayTab: React.FC = () => {
  // Core payment flow state
  const [step, setStep] = useState<PaymentStep>('amount');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [note, setNote] = useState('');
  const [isRequest, setIsRequest] = useState(false);

  // Wallet state
  const [seiBalance, setSeiBalance] = useState(0);
  const [userAddress, setUserAddress] = useState('');
  const [hasWallet, setHasWallet] = useState(false);

  // Contacts and transactions
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  // UI state
  const [showAddContact, setShowAddContact] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  // Form states
  const [contactForm, setContactForm] = useState({ name: '', handle: '', address: '' });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('seipulse-wallet');
    const savedBalance = localStorage.getItem('seipulse-sei-balance');
    const savedContacts = localStorage.getItem('seipulse-contacts');
    const savedTransactions = localStorage.getItem('seipulse-transactions');

    if (savedWallet) {
      const wallet = JSON.parse(savedWallet);
      setUserAddress(wallet.address);
      setHasWallet(true);
    }

    if (savedBalance) setSeiBalance(parseFloat(savedBalance));
    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedTransactions) {
      const txs = JSON.parse(savedTransactions).map((tx: Transaction & { timestamp: string }) => ({
        ...tx,
        timestamp: new Date(tx.timestamp)
      }));
      setTransactions(txs);
      setRecentTransactions(txs.slice(0, 5));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('seipulse-sei-balance', seiBalance.toString());
  }, [seiBalance]);

  useEffect(() => {
    localStorage.setItem('seipulse-contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('seipulse-transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Utility functions
  const validateSeiAddress = (address: string): boolean => {
    return address.startsWith('sei1') && address.length >= 39 && address.length <= 45;
  };

  const generateTxHash = (): string => {
    return 'sei' + Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  const calculateNetworkFee = (amount: number): number => {
    // Sei network fees are typically very low, around 0.001-0.01 SEI
    return Math.max(0.001, amount * 0.0001);
  };

  const formatSeiAmount = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  // Contact management
  const addContact = () => {
    if (!contactForm.name || !contactForm.address) return;
    if (!validateSeiAddress(contactForm.address)) return;

    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: contactForm.name,
      handle: contactForm.handle || `@${contactForm.name.toLowerCase().replace(/\s+/g, '')}`,
      address: contactForm.address,
      lastUsed: new Date(),
      isFavorite: false
    };

    setContacts(prev => [...prev, newContact]);
    setContactForm({ name: '', handle: '', address: '' });
    setShowAddContact(false);
  };

  const removeContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const selectContact = (contact: Contact) => {
    setRecipient(contact.handle);
    setRecipientAddress(contact.address);
    setShowContacts(false);

    // Update last used
    setContacts(prev => prev.map(c =>
      c.id === contact.id ? { ...c, lastUsed: new Date() } : c
    ));
  };

  // Transaction processing
  const processTransaction = async () => {
    if (!amount || !recipientAddress) return;

    const amountNum = parseFloat(amount);
    const fee = calculateNetworkFee(amountNum);
    const total = amountNum + fee;

    if (total > seiBalance) {
      alert('Insufficient balance');
      return;
    }

    setStep('processing');

    const transaction: Transaction = {
      id: generateTxHash(),
      type: isRequest ? 'request_sent' : 'sent',
      amount: amountNum,
      recipient: recipient,
      recipientAddress: recipientAddress,
      senderAddress: userAddress,
      note: note,
      timestamp: new Date(),
      status: 'pending',
      txHash: generateTxHash(),
      fee: fee,
      blockHeight: Math.floor(Math.random() * 1000000) + 5000000
    };

    setCurrentTransaction(transaction);

    // Simulate network processing
    setTimeout(() => {
      if (!isRequest) {
        setSeiBalance(prev => prev - total);
      }

      const confirmedTx = { ...transaction, status: 'confirmed' as const };
      setTransactions(prev => [confirmedTx, ...prev]);
      setRecentTransactions(prev => [confirmedTx, ...prev.slice(0, 4)]);
      setStep('success');
    }, 2000);
  };

  const resetFlow = () => {
    setStep('amount');
    setAmount('');
    setRecipient('');
    setRecipientAddress('');
    setNote('');
    setCurrentTransaction(null);
    setIsRequest(false);
  };

  const handleBack = () => {
    if (step === 'amount') return;
    if (step === 'recipient') setStep('amount');
    if (step === 'confirm') setStep('recipient');
    if (step === 'processing') return; // Can't go back during processing
    if (step === 'success') resetFlow();
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
          {amount && parseFloat(amount) > 0 && (
            <p className="text-sm text-muted-foreground">
              Network fee: ~{formatSeiAmount(calculateNetworkFee(parseFloat(amount)))} SEI
            </p>
          )}
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

        {/* Quick percentage buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '25%', value: seiBalance * 0.25 },
            { label: '50%', value: seiBalance * 0.5 },
            { label: '75%', value: seiBalance * 0.75 },
            { label: 'Max', value: seiBalance * 0.99 } // Leave some for fees
          ].map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => setAmount(preset.value.toFixed(6))}
              className="h-10"
            >
              {preset.label}
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

  const RecipientStep = () => {
    const handleRecipientChange = (value: string) => {
      setRecipient(value);

      // Auto-detect if it's a Sei address
      if (validateSeiAddress(value)) {
        setRecipientAddress(value);
      } else {
        // Try to find in contacts
        const contact = contacts.find(c =>
          c.handle.toLowerCase() === value.toLowerCase() ||
          c.name.toLowerCase().includes(value.toLowerCase())
        );
        if (contact) {
          setRecipientAddress(contact.address);
        } else {
          setRecipientAddress('');
        }
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Send to</h2>
          <p className="text-muted-foreground">Enter @handle, address, or select contact</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => handleRecipientChange(e.target.value)}
              placeholder="@username or sei1..."
              className="h-12"
            />
            {recipientAddress && recipientAddress !== recipient && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Address: {recipientAddress.slice(0, 20)}...{recipientAddress.slice(-10)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12">
                  <QrCode className="mr-2" size={20} />
                  Scan QR
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Scan QR Code</DialogTitle>
                </DialogHeader>
                <div className="p-8 text-center">
                  <Camera size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">QR Scanner would open here</p>
                  <Button onClick={() => {
                    // Mock QR scan result
                    const mockAddress = 'sei1qr' + Math.random().toString(36).substring(2, 15) + 'scan';
                    setRecipient(mockAddress);
                    setRecipientAddress(mockAddress);
                    setShowQRScanner(false);
                  }}>
                    Simulate Scan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showContacts} onOpenChange={setShowContacts}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-12">
                  <Users className="mr-2" size={20} />
                  Contacts
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Contact</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="contacts">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="contacts">Contacts</TabsTrigger>
                    <TabsTrigger value="add">Add New</TabsTrigger>
                  </TabsList>

                  <TabsContent value="contacts" className="space-y-3">
                    {contacts.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No contacts yet. Add some to get started!
                      </p>
                    ) : (
                      contacts
                        .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
                        .map((contact) => (
                          <button
                            key={contact.id}
                            onClick={() => selectContact(contact)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {contact.name[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="text-left">
                                <p className="font-medium">{contact.name}</p>
                                <p className="text-sm text-muted-foreground">{contact.handle}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeContact(contact.id);
                              }}
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </button>
                        ))
                    )}
                  </TabsContent>

                  <TabsContent value="add" className="space-y-4">
                    <div>
                      <Label htmlFor="contact-name">Name</Label>
                      <Input
                        id="contact-name"
                        placeholder="Contact name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-handle">Handle (optional)</Label>
                      <Input
                        id="contact-handle"
                        placeholder="@username"
                        value={contactForm.handle}
                        onChange={(e) => setContactForm(prev => ({ ...prev, handle: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-address">Sei Address</Label>
                      <Input
                        id="contact-address"
                        placeholder="sei1..."
                        value={contactForm.address}
                        onChange={(e) => setContactForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                      {contactForm.address && !validateSeiAddress(contactForm.address) && (
                        <p className="text-xs text-red-500 mt-1">Invalid Sei address format</p>
                      )}
                    </div>
                    <Button
                      onClick={addContact}
                      className="w-full"
                      disabled={!contactForm.name || !contactForm.address || !validateSeiAddress(contactForm.address)}
                    >
                      Add Contact
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
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
          {recentTransactions.length > 0 && (
            <div>
              <Label>Recent</Label>
              <div className="space-y-2 mt-2">
                {recentTransactions.slice(0, 3).map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => {
                      setRecipient(tx.recipient);
                      setRecipientAddress(tx.recipientAddress);
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {tx.recipient[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium">{tx.recipient}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatSeiAmount(tx.amount)} SEI</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          className="w-full h-12"
          disabled={!recipient || !recipientAddress || !validateSeiAddress(recipientAddress)}
          onClick={() => setStep('confirm')}
        >
          Continue
        </Button>
      </div>
    );
  };

  const ConfirmStep = () => {
    const amountNum = parseFloat(amount);
    const fee = calculateNetworkFee(amountNum);
    const total = amountNum + fee;

    // Enhanced risk assessment based on amount and recipient
    const isKnownContact = contacts.some(c => c.address === recipientAddress);
    const isLargeAmount = amountNum > seiBalance * 0.1; // More than 10% of balance
    const hasRecentTx = recentTransactions.some(tx => tx.recipientAddress === recipientAddress);

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (!isKnownContact && isLargeAmount) riskLevel = 'high';
    else if (!isKnownContact || isLargeAmount) riskLevel = 'medium';

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Confirm {isRequest ? 'Request' : 'Payment'}</h2>
          <p className="text-muted-foreground">Review the transaction details</p>
        </div>

        {/* AI Risk Assessment */}
        <Card className={`p-4 border-l-4 ${riskLevel === 'high' ? 'border-l-red-500 bg-red-50 dark:bg-red-950' :
          riskLevel === 'medium' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
            'border-l-green-500 bg-green-50 dark:bg-green-950'
          }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-1 rounded-full ${riskLevel === 'high' ? 'bg-red-500' :
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
                    ? isKnownContact ? 'Large transaction amount detected.' : 'New recipient. Verify the address.'
                    : isKnownContact ? 'Trusted contact in your address book.' : 'Transaction appears safe.'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Details */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {recipient[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{recipient}</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {recipientAddress.slice(0, 12)}...{recipientAddress.slice(-8)}
                  </p>
                  {isKnownContact && (
                    <Badge variant="secondary" className="text-xs mt-1">Saved Contact</Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(recipientAddress)}
                className="h-8 w-8"
              >
                <Copy size={16} />
              </Button>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Time</span>
                <span className="font-medium">~3 seconds</span>
              </div>
              {note && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Note</span>
                  <span className="font-medium text-right max-w-32 truncate">{note}</span>
                </div>
              )}
            </div>

            {!isRequest && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Balance after transaction:</span>
                  <span className="font-medium">
                    {formatSeiAmount(seiBalance - total)} SEI
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Button
          className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          onClick={processTransaction}
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
        <h2 className="text-2xl font-bold mb-2">Processing Transaction</h2>
        <p className="text-muted-foreground">
          Broadcasting to Sei network...
        </p>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
        <p className="text-sm text-muted-foreground">
          This usually takes 2-5 seconds
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
            ? `Request for $${amount} sent to ${recipient}`
            : `$${amount} sent to ${recipient}`
          }
        </p>
      </div>

      <Card className="p-4 text-left">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-sm">TXN-2024-001234</span>
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
        <Button variant="outline" className="w-full h-12">
          View Receipt
        </Button>
      </div>
    </div>
  );

  // If no wallet, show setup prompt
  if (!hasWallet) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <Card className="p-8 text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <Wallet size={32} className="text-white" />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Wallet Required</h2>
            <p className="text-muted-foreground text-sm">
              You need a Sei wallet to send and receive payments. Go to the Home tab to create one.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              // This would typically navigate to home tab
              // For now, we'll just show a message
              alert('Please go to the Home tab to create your wallet first!');
            }}
          >
            Create Wallet
          </Button>
        </Card>
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