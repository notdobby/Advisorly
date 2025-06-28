import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../frontend/supabaseClient';

interface BankTransaction {
  id: number;
  amount: number;
  currency: string;
  date: string;
  vpa: string;
  reference: string;
  type: 'credit' | 'debit';
  category: string;
  status: string;
}

interface APIResponse {
  user: {
    apiKey: string;
    totalTransactions: number;
    lastUpdated: string;
    keyCreated: string;
  };
  transactions: BankTransaction[];
  metadata: {
    source: string;
    version: string;
    generatedAt: string;
  };
}

export function useSMS() {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  // Check if running on mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('bank_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const saveApiKey = useCallback((key: string) => {
    localStorage.setItem('bank_api_key', key);
    setApiKey(key);
  }, []);

  const fetchBankTransactions = useCallback(async () => {
    if (!apiKey) {
      setError('API key not configured');
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://sms-parsing-906i.onrender.com/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: APIResponse = await response.json();
      setTransactions(data.transactions);
      return data.transactions;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Bank transaction fetch error:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [apiKey]);

  const syncTransactions = useCallback(async () => {
    const transactions = await fetchBankTransactions();
    return transactions.length;
  }, [fetchBankTransactions]);

  const requestSMSPermission = useCallback(async () => {
    if (!isMobile) {
      alert('SMS permissions are only available on mobile devices');
      return;
    }

    try {
      // This would be implemented with Capacitor SMS plugin on mobile
      // For now, we'll simulate permission request
      setHasPermission(true);
      alert('SMS permissions granted (simulated)');
    } catch (error) {
      console.error('SMS permission error:', error);
      alert('Failed to request SMS permissions');
    }
  }, [isMobile]);

  const testParseSMS = useCallback((smsText: string) => {
    // Mock SMS parsing for testing
    const mockTransaction = {
      id: Date.now(),
      amount: Math.floor(Math.random() * 1000) + 1,
      currency: 'INR',
      date: new Date().toLocaleString('en-IN'),
      vpa: 'test@upi',
      reference: Math.random().toString(36).substring(7),
      type: Math.random() > 0.5 ? 'credit' : 'debit' as 'credit' | 'debit',
      category: 'bank_transfer',
      status: 'completed'
    };
    return mockTransaction;
  }, []);

  return {
    transactions,
    isLoading,
    error,
    isMobile,
    hasPermission,
    apiKey,
    saveApiKey,
    fetchBankTransactions,
    syncTransactions,
    requestSMSPermission,
    testParseSMS
  };
} 