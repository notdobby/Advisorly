import { useState, useEffect } from 'react';
import { supabase } from '../../frontend/supabaseClient';
import { useSupabaseAuth } from './useSupabaseAuth';

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

export function useSMS() {
  const { user } = useSupabaseAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);

  // Simple mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    if (user) {
      fetchBankTransactions();
    }
  }, [user]);

  const requestSMSPermission = async () => {
    if (!isMobile) {
      alert('SMS functionality is only available on mobile devices. Please install the app on your phone.');
      return false;
    }

    try {
      setIsLoading(true);
      // For now, simulate permission request
      // In a real mobile app, this would use the actual SMS plugin
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('SMS permission error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const parseBankSMS = (smsText: string): BankTransaction | null => {
    // Common Indian bank SMS patterns
    const patterns = [
      // HDFC Bank
      {
        bank: 'HDFC Bank',
        pattern: /Rs\.(\d+(?:,\d+)*(?:\.\d{2})?)\s+(credited|debited)\s+to\s+A\/c\s+(\w+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
        extract: (matches: RegExpMatchArray) => ({
          amount: parseFloat(matches[1].replace(/,/g, '')),
          type: matches[2].toLowerCase() as 'credit' | 'debit',
          account: matches[3],
          date: matches[4]
        })
      },
      // SBI Bank
      {
        bank: 'State Bank of India',
        pattern: /Rs\.(\d+(?:,\d+)*(?:\.\d{2})?)\s+(credited|debited)\s+from\s+A\/c\s+(\w+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
        extract: (matches: RegExpMatchArray) => ({
          amount: parseFloat(matches[1].replace(/,/g, '')),
          type: matches[2].toLowerCase() as 'credit' | 'debit',
          account: matches[3],
          date: matches[4]
        })
      },
      // ICICI Bank
      {
        bank: 'ICICI Bank',
        pattern: /Rs\.(\d+(?:,\d+)*(?:\.\d{2})?)\s+(credited|debited)\s+to\s+A\/c\s+(\w+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
        extract: (matches: RegExpMatchArray) => ({
          amount: parseFloat(matches[1].replace(/,/g, '')),
          type: matches[2].toLowerCase() as 'credit' | 'debit',
          account: matches[3],
          date: matches[4]
        })
      },
      // Axis Bank
      {
        bank: 'Axis Bank',
        pattern: /Rs\.(\d+(?:,\d+)*(?:\.\d{2})?)\s+(credited|debited)\s+to\s+A\/c\s+(\w+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
        extract: (matches: RegExpMatchArray) => ({
          amount: parseFloat(matches[1].replace(/,/g, '')),
          type: matches[2].toLowerCase() as 'credit' | 'debit',
          account: matches[3],
          date: matches[4]
        })
      }
    ];

    for (const pattern of patterns) {
      const matches = smsText.match(pattern.pattern);
      if (matches) {
        const extracted = pattern.extract(matches);
        return {
          id: '',
          user_id: user?.id || '',
          bank_name: pattern.bank,
          account_number: extracted.account,
          transaction_type: extracted.type,
          amount: extracted.amount,
          balance: 0, // Will be updated if available in SMS
          transaction_date: extracted.date,
          reference_number: '',
          description: '',
          sms_text: smsText,
          created_at: new Date().toISOString()
        };
      }
    }

    return null;
  };

  const readAndParseSMS = async () => {
    if (!hasPermission || !user) return 0;

    try {
      setIsLoading(true);
      
      // For web development, we'll simulate SMS reading
      // In a real mobile app, this would use the actual SMS plugin
      const mockSMS = [
        "Rs.5000.00 credited to A/c XX1234 on 15/12/2023. UPI Ref: 123456789",
        "Rs.1000.00 debited from A/c XX5678 on 16/12/2023. Available Bal: Rs.25000.00",
        "Rs.2500.00 credited to A/c XX9012 on 17/12/2023. UPI Ref: 987654321"
      ];

      const parsedTransactions: BankTransaction[] = [];

      for (const sms of mockSMS) {
        const parsed = parseBankSMS(sms);
        if (parsed) {
          parsedTransactions.push(parsed);
        }
      }

      // Save to Supabase
      if (parsedTransactions.length > 0) {
        const { error } = await supabase
          .from('bank_transactions')
          .insert(parsedTransactions);

        if (!error) {
          await fetchBankTransactions();
        }
      }

      return parsedTransactions.length;
    } catch (error) {
      console.error('SMS reading error:', error);
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBankTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bank_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (!error && data) {
        setTransactions(data);
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  };

  const syncTransactions = async () => {
    if (!hasPermission) {
      const granted = await requestSMSPermission();
      if (!granted) return 0;
    }

    return await readAndParseSMS();
  };

  return {
    hasPermission,
    isLoading,
    transactions,
    isMobile,
    requestSMSPermission,
    syncTransactions,
    fetchBankTransactions
  };
} 