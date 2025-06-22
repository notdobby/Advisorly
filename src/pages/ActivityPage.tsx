import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Smartphone, Wallet, Filter } from 'lucide-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useSMS } from '../hooks/useSMS';
import { usePWA } from '../hooks/usePWA';
import { supabase } from '../../frontend/supabaseClient';

interface Transaction {
  id: string;
  user_id: string;
  category?: string;
  amount: number;
  date: string;
  notes?: string;
  wallet_id?: string;
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

const ActivityPage = () => {
  const { user } = useSupabaseAuth();
  const { 
    transactions: bankTransactions, 
    isLoading, 
    syncTransactions, 
    isMobile,
    testParseSMS 
  } = useSMS();
  const { canInstall, installApp } = usePWA();
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'manual' | 'bank'>('all');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [testSMS, setTestSMS] = useState(`Your a/c no. XX2037 is debited for Rs.32.00 on 21-06-2025 13:27:26 and credited to vpa q164592387@ybl (UPI Ref no 106817245599) Your Current Balance is INR 465.88. If not you, give a missed call on 7666339922 - Saraswat Bank`);
  const [parsedResult, setParsedResult] = useState<any>(null);

  const fetchManualTransactions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (!error && data) {
        setManualTransactions(data);
      }
    } catch (error) {
      console.error('Fetch manual transactions error:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchManualTransactions();
    }
  }, [user, fetchManualTransactions]);

  const handleSync = async () => {
    const count = await syncTransactions();
    if (count > 0) {
      setLastSync(new Date());
      alert(`Successfully synced ${count} new transactions!`);
    } else {
      alert('No new transactions found or sync failed.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getFilteredTransactions = () => {
    const allTransactions = [
      ...manualTransactions.map(t => ({ ...t, source: 'manual' as const })),
      ...bankTransactions.map(t => ({ 
        ...t, 
        source: 'bank' as const,
        date: t.transaction_date, // Map transaction_date to date for consistency
        category: t.bank_name,
        notes: t.description
      }))
    ];

    switch (filter) {
      case 'manual':
        return allTransactions.filter(t => t.source === 'manual');
      case 'bank':
        return allTransactions.filter(t => t.source === 'bank');
      default:
        return allTransactions;
    }
  };

  const allTransactions = getFilteredTransactions();

  const handleTestParse = () => {
    const result = testParseSMS(testSMS);
    setParsedResult(result);
  };

  return (
    <div className="min-h-full bg-white text-black dark:bg-[#0D1117] dark:text-white p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Activity</h1>
          <div className="flex items-center gap-2">
            {canInstall && (
              <button
                onClick={installApp}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Install App
              </button>
            )}
          </div>
        </div>
        
        {/* SMS Sync Section */}
        <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                <Smartphone size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Bank Transaction Sync</h3>
                <p className="text-sm text-gray-400">
                  {isMobile 
                    ? 'SMS permissions granted. Sync to capture bank transactions.'
                    : 'Install the app on your mobile device to enable SMS sync.'
                  }
                </p>
                {lastSync && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last synced: {lastSync.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={!isMobile || isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Filter:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('manual')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'manual' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setFilter('bank')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'bank' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Bank
            </button>
          </div>
        </div>
      </header>

      {/* Transactions List */}
      <div className="space-y-4">
        {allTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <Wallet size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
            <p className="text-gray-400">
              {filter === 'all' 
                ? 'Start by adding manual transactions or syncing bank SMS.'
                : filter === 'manual'
                ? 'Add your first manual transaction from the Wallets page.'
                : 'Sync your bank SMS to see automatic transactions.'
              }
            </p>
          </div>
        ) : (
          allTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-[#161B22] rounded-xl p-4 border border-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.source === 'bank' 
                      ? 'bg-blue-900/30' 
                      : 'bg-indigo-900/30'
                  }`}>
                    {transaction.source === 'bank' ? (
                      <Smartphone size={16} className="text-blue-400" />
                    ) : (
                      <Wallet size={16} className="text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">
                        {transaction.source === 'bank' 
                          ? (transaction as BankTransaction).bank_name
                          : (transaction as Transaction).category
                        }
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.source === 'bank'
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-indigo-900/30 text-indigo-400'
                      }`}>
                        {transaction.source === 'bank' ? 'Bank' : 'Manual'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {transaction.source === 'bank' 
                        ? `A/c: ${(transaction as BankTransaction).account_number}`
                        : (transaction as Transaction).notes || 'No description'
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.source === 'bank' 
                        ? (transaction as BankTransaction).transaction_date
                        : (transaction as Transaction).date
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-lg ${
                    transaction.source === 'bank'
                      ? (transaction as BankTransaction).transaction_type === 'credit'
                        ? 'text-green-400'
                        : 'text-red-400'
                      : 'text-white'
                  }`}>
                    {transaction.source === 'bank'
                      ? `${(transaction as BankTransaction).transaction_type === 'credit' ? '+' : '-'}${formatAmount(transaction.amount)}`
                      : formatAmount(transaction.amount)
                    }
                  </div>
                  {transaction.source === 'bank' && (transaction as BankTransaction).balance > 0 && (
                    <p className="text-xs text-gray-400">
                      Bal: {formatAmount((transaction as BankTransaction).balance)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Test Parse SMS Section */}
      <div className="mt-8 bg-[#161B22] rounded-xl p-6 border border-gray-800">
        <h2 className="text-2xl font-bold mb-4">Test Parse SMS</h2>
        <textarea
          value={testSMS}
          onChange={(e) => setTestSMS(e.target.value)}
          className="w-full h-24 p-2 bg-gray-800 text-white rounded-lg mb-4"
          placeholder="Enter Saraswat Bank SMS"
        />
        <button
          onClick={handleTestParse}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Parse SMS
        </button>
        {parsedResult && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Parsed Result</h3>
            <pre className="text-sm text-gray-400">{JSON.stringify(parsedResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;