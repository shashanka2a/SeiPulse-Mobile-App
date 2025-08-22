import { useState, useEffect, useCallback } from 'react';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

interface QueuedTransaction {
  id: string;
  type: 'send' | 'contract_execute';
  recipient?: string;
  amount?: string;
  contractAddress?: string;
  msg?: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  error?: string;
  txHash?: string;
  retryCount: number;
}

interface OfflineQueueState {
  queue: QueuedTransaction[];
  isProcessing: boolean;
  isOnline: boolean;
}

export const useOfflineQueue = (client: SigningCosmWasmClient | null, address: string | null) => {
  const [queueState, setQueueState] = useState<OfflineQueueState>({
    queue: [],
    isProcessing: false,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  });

  // Load queue from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedQueue = localStorage.getItem('seipulse-tx-queue');
    if (savedQueue) {
      try {
        const queue = JSON.parse(savedQueue);
        setQueueState(prev => ({ ...prev, queue }));
      } catch (error) {
        console.error('Failed to load transaction queue:', error);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('seipulse-tx-queue', JSON.stringify(queueState.queue));
  }, [queueState.queue]);

  // Monitor online status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setQueueState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setQueueState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processTransaction = useCallback(async (transaction: QueuedTransaction) => {
    if (!client || !address) return;

    // Update status to processing
    setQueueState(prev => ({
      ...prev,
      queue: prev.queue.map(tx => 
        tx.id === transaction.id 
          ? { ...tx, status: 'processing' as const }
          : tx
      ),
    }));

    try {
      let result;

      if (transaction.type === 'send' && transaction.recipient && transaction.amount) {
        // Send native tokens
        result = await client.sendTokens(
          address,
          transaction.recipient,
          [{ denom: 'usei', amount: transaction.amount }],
          'auto'
        );
      } else if (transaction.type === 'contract_execute' && transaction.contractAddress && transaction.msg) {
        // Execute contract
        result = await client.execute(
          address,
          transaction.contractAddress,
          transaction.msg,
          'auto'
        );
      } else {
        throw new Error('Invalid transaction type or missing parameters');
      }

      // Update status to success
      setQueueState(prev => ({
        ...prev,
        queue: prev.queue.map(tx => 
          tx.id === transaction.id 
            ? { 
                ...tx, 
                status: 'success' as const, 
                txHash: result.transactionHash 
              }
            : tx
        ),
      }));

    } catch (error) {
      console.error(`Transaction ${transaction.id} failed:`, error);
      
      const shouldRetry = transaction.retryCount < 3;
      
      setQueueState(prev => ({
        ...prev,
        queue: prev.queue.map(tx => 
          tx.id === transaction.id 
            ? { 
                ...tx, 
                status: shouldRetry ? 'pending' as const : 'failed' as const,
                error: error instanceof Error ? error.message : 'Transaction failed',
                retryCount: tx.retryCount + 1,
              }
            : tx
        ),
      }));

      // Retry after delay if not exceeded retry limit
      if (shouldRetry) {
        setTimeout(() => processTransaction(transaction), 5000 * (transaction.retryCount + 1));
      }
    }
  }, [client, address]);

  const addToQueue = useCallback((transaction: Omit<QueuedTransaction, 'id' | 'timestamp' | 'status' | 'retryCount'>) => {
    const queuedTx: QueuedTransaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    setQueueState(prev => ({
      ...prev,
      queue: [...prev.queue, queuedTx],
    }));

    // If online, try to process immediately
    if (queueState.isOnline && client && address) {
      processTransaction(queuedTx);
    }

    return queuedTx.id;
  }, [queueState.isOnline, client, address, processTransaction]);

  const processQueue = useCallback(async () => {
    if (!client || !address || queueState.isProcessing || !queueState.isOnline) return;

    const pendingTransactions = queueState.queue.filter(tx => tx.status === 'pending');
    if (pendingTransactions.length === 0) return;

    setQueueState(prev => ({ ...prev, isProcessing: true }));

    // Process transactions sequentially to avoid nonce issues
    for (const transaction of pendingTransactions) {
      await processTransaction(transaction);
      // Small delay between transactions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setQueueState(prev => ({ ...prev, isProcessing: false }));
  }, [client, address, queueState.isProcessing, queueState.isOnline, queueState.queue, processTransaction]);

  const removeFromQueue = useCallback((transactionId: string) => {
    setQueueState(prev => ({
      ...prev,
      queue: prev.queue.filter(tx => tx.id !== transactionId),
    }));
  }, []);

  const clearCompletedTransactions = useCallback(() => {
    setQueueState(prev => ({
      ...prev,
      queue: prev.queue.filter(tx => tx.status === 'pending' || tx.status === 'processing'),
    }));
  }, []);

  const retryFailedTransaction = useCallback((transactionId: string) => {
    const transaction = queueState.queue.find(tx => tx.id === transactionId);
    if (transaction && transaction.status === 'failed') {
      setQueueState(prev => ({
        ...prev,
        queue: prev.queue.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: 'pending' as const, retryCount: 0, error: undefined }
            : tx
        ),
      }));

      if (queueState.isOnline && client && address) {
        processTransaction({ ...transaction, status: 'pending', retryCount: 0 });
      }
    }
  }, [queueState.queue, queueState.isOnline, client, address, processTransaction]);

  // Auto-process queue when conditions are met
  useEffect(() => {
    if (queueState.isOnline && client && address && !queueState.isProcessing) {
      const hasPending = queueState.queue.some(tx => tx.status === 'pending');
      if (hasPending) {
        processQueue();
      }
    }
  }, [queueState.isOnline, client, address, queueState.isProcessing, queueState.queue.length]);

  return {
    ...queueState,
    addToQueue,
    removeFromQueue,
    clearCompletedTransactions,
    retryFailedTransaction,
    processQueue,
  };
};