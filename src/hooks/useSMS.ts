import { useState, useEffect, useCallback } from 'react';

interface BankTransaction {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  balance: number;
  transaction_date: string;
  reference_number: string;
  description: string;
  sms_text: string;
  created_at: string;
}

export function useSMS(userId: string | null) {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBankTransactions = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/bank-transactions?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBankTransactions();
  }, [fetchBankTransactions]);

  return { transactions, isLoading, error, refetch: fetchBankTransactions };
} 