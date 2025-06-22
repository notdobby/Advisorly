import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../frontend/supabaseClient';
import { useSupabaseAuth } from './useSupabaseAuth';
import { Capacitor } from '@capacitor/core';

// Try to import Capacitor SMS reader, fallback for web development
let SmsReader: any = null;

try {
  const smsModule = require('@solimanware/capacitor-sms-reader');
  SmsReader = smsModule.SmsReader;
} catch (error) {
  console.log('SMS reader not available in web environment');
}

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

// Common bank sender IDs in India. This helps in filtering.
// Note: These are examples and might need to be expanded.
const BANK_SENDER_IDS = [
  'HDFCBK', 'ICICIB', 'SBIBNK', 'AXISBK', 'KOTAKB', 
  // These are often used for UPI transactions from various banks
  'UPI', 
  // Add more specific sender IDs like 'VM-HDFCBK', 'BP-ICICIB' etc.
  'SARASWAT', // Saraswat Bank
];

export function useSMS() {
  const { user } = useSupabaseAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);

  // Check if running on a native platform
  const isNativePlatform = Capacitor.isNativePlatform();

  const fetchBankTransactions = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    const checkInitialPermission = async () => {
      if (isNativePlatform && SmsReader) {
        try {
          const status = await SmsReader.checkPermissions();
          setHasPermission((status as any).sms === 'granted');
        } catch (error) {
          console.log('SMS permission check failed:', error);
          setHasPermission(false);
        }
      }
    };

    if (user) {
      fetchBankTransactions();
      checkInitialPermission();
    }
  }, [user, fetchBankTransactions, isNativePlatform]);

  const requestSMSPermission = async (): Promise<boolean> => {
    if (!isNativePlatform || !SmsReader) {
      alert('SMS functionality is only available on the native mobile app.');
      return false;
    }

    try {
      setIsLoading(true);
      const status = await SmsReader.requestPermissions();
      const permissionGranted = (status as any).sms === 'granted';
      setHasPermission(permissionGranted);
      return permissionGranted;
    } catch (error) {
      console.error('SMS permission error:', error);
      setHasPermission(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const parseBankSMS = (smsText: string): Omit<BankTransaction, 'id' | 'user_id' | 'created_at'> | null => {
    // Common Indian bank SMS patterns
    const patterns = [
      // Saraswat Bank UPI Transaction
      {
        bank: 'Saraswat Bank',
        pattern: /Your a\/c no\. (\w+) is (debited|credited) for Rs\.(\d+(?:,\d+)*(?:\.\d{2})?) on (\d{1,2}-\d{1,2}-\d{4}) (\d{1,2}:\d{1,2}:\d{1,2}) and (?:credited to|debited from) vpa (\S+) \(UPI Ref no (\d+)\) Your Current Balance is INR (\d+(?:,\d+)*(?:\.\d{2})?)/i,
        extract: (matches: RegExpMatchArray) => ({
          account: matches[1],
          type: matches[2].toLowerCase() as 'credit' | 'debit',
          amount: parseFloat(matches[3].replace(/,/g, '')),
          date: new Date(matches[4].split('-').reverse().join('-') + 'T' + matches[5]).toISOString(),
          vpa: matches[6],
          refNumber: matches[7],
          balance: parseFloat(matches[8].replace(/,/g, ''))
        })
      },
      // HDFC Bank
      {
        bank: 'HDFC Bank',
        pattern: /Rs\.(\d+(?:,\d+)*(?:\.\d{2})?)\s+(credited|debited)\s+to\s+A\/c\s+(\w+)\s+on\s+(\d{1,2}\/\d{1,2}\/\d{4})/i,
        extract: (matches: RegExpMatchArray) => ({
          amount: parseFloat(matches[1].replace(/,/g, '')),
          type: matches[2].toLowerCase() as 'credit' | 'debit',
          account: matches[3],
          date: new Date(matches[4].split('/').reverse().join('-')).toISOString()
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
          date: new Date(matches[4].split('/').reverse().join('-')).toISOString()
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
          date: new Date(matches[4].split('/').reverse().join('-')).toISOString()
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
          date: new Date(matches[4].split('/').reverse().join('-')).toISOString()
        })
      }
    ];

    for (const p of patterns) {
      const match = smsText.match(p.pattern);
      if (match) {
        const extracted = p.extract(match);
        
        // Handle different pattern types
        if (p.bank === 'Saraswat Bank') {
          const saraswatExtracted = extracted as any; // Type assertion for Saraswat Bank specific fields
          return {
            bank_name: p.bank,
            account_number: saraswatExtracted.account,
            transaction_type: saraswatExtracted.type,
            amount: saraswatExtracted.amount,
            balance: saraswatExtracted.balance,
            transaction_date: saraswatExtracted.date,
            reference_number: saraswatExtracted.refNumber,
            description: `UPI Transaction to ${saraswatExtracted.vpa}`,
            sms_text: smsText,
          };
        } else {
          return {
            bank_name: p.bank,
            account_number: extracted.account,
            transaction_type: extracted.type,
            amount: extracted.amount,
            balance: 0, // Placeholder, as it's not consistently available
            transaction_date: extracted.date,
            reference_number: '', // Placeholder
            description: smsText.substring(0, 100), // Truncate for description
            sms_text: smsText,
          };
        }
      }
    }

    return null;
  };

  const readAndParseSMS = async () => {
    if (!hasPermission || !user || !isNativePlatform || !SmsReader) return 0;

    try {
      setIsLoading(true);
      
      const { messages } = await SmsReader.getMessages({
        // Filter by bank sender IDs. The 'address' field in the plugin corresponds to the sender.
        addressRegex: `(${BANK_SENDER_IDS.join('|')})`,
        maxCount: 100, // Limit to the last 100 messages to avoid performance issues
      });

      if (!messages || messages.length === 0) {
        return 0;
      }

      const parsedTransactions: Omit<BankTransaction, 'id' | 'created_at'>[] = [];

      for (const sms of messages) {
        const parsed = parseBankSMS(sms.body);
        if (parsed) {
          parsedTransactions.push({ ...parsed, user_id: user.id });
        }
      }

      // Avoid inserting duplicate transactions
      const { data: existingTransactions, error: existingError } = await supabase
        .from('bank_transactions')
        .select('sms_text')
        .in('sms_text', parsedTransactions.map(t => t.sms_text));

      if (existingError) {
        console.error('Error fetching existing transactions:', existingError);
        return 0;
      }

      const existingSmsTexts = new Set(existingTransactions.map(t => t.sms_text));
      const newTransactions = parsedTransactions.filter(t => !existingSmsTexts.has(t.sms_text));


      if (newTransactions.length > 0) {
        const { error } = await supabase
          .from('bank_transactions')
          .insert(newTransactions);

        if (error) {
          console.error('Error saving new transactions:', error);
        } else {
          await fetchBankTransactions();
        }
        return newTransactions.length;
      }

      return 0;
    } catch (error) {
      console.error('SMS reading error:', error);
      return 0;
    } finally {
      setIsLoading(false);
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
    isMobile: isNativePlatform, // Use isNativePlatform instead of isMobile
    requestSMSPermission,
    syncTransactions,
    fetchBankTransactions,
    // Test function for development
    testParseSMS: (smsText: string) => parseBankSMS(smsText)
  };
} 