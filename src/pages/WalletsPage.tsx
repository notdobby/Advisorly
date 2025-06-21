import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { supabase } from '../../frontend/supabaseClient';

type Wallet = {
  id: string;
  user_id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  allocated_percent: number;
};

type Transaction = {
  id: string;
  user_id: string;
  wallet_id: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
};

const WalletsPage = () => {
  const { user } = useSupabaseAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionForms, setTransactionForms] = useState<{ [walletId: string]: { amount: string, date: string, notes: string, loading: boolean } }>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [globalForm, setGlobalForm] = useState({ walletId: '', amount: '', date: '', notes: '', loading: false });

  const defaultDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;

    const fetchWallets = async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id);
      if (error) console.error('Wallet fetch error:', error);
      else setWallets(data || []);
    };

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);
      if (error) console.error('Transaction fetch error:', error);
      else setTransactions(data || []);
    };

    fetchWallets();
    fetchTransactions();
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    const { data: walletData } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id);
    setWallets(walletData || []);
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);
    setTransactions(txData || []);
  };

  const handleFormChange = (walletId: string, field: string, value: string | boolean) => {
    setTransactionForms(prev => ({
      ...prev,
      [walletId]: {
        ...prev[walletId],
        [field]: value
      }
    }));
  };

  const addTransaction = async (e: React.FormEvent, wallet: Wallet) => {
    e.preventDefault();
    const form = transactionForms[wallet.id] || { amount: '', date: defaultDate, notes: '', loading: false };
    if (!user || !form.amount) return;
    const amount = Number(form.amount);
    const currentSpent = Number(wallet.spent_amount) || 0;
    const available = wallet.allocated_amount - currentSpent;
    if (amount > available) {
      alert("You don't have enough balance in this wallet.");
      return;
    }
    handleFormChange(wallet.id, 'loading', true);
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      wallet_id: wallet.id,
      category: wallet.category,
      amount,
      date: form.date,
      notes: form.notes
    });
    if (txError) {
      alert("Failed to add transaction.");
      handleFormChange(wallet.id, 'loading', false);
      return;
    }
    await supabase.from('wallets').update({
      spent_amount: currentSpent + amount
    }).eq('id', wallet.id);
    await refreshData();
    setTransactionForms(prev => ({
      ...prev,
      [wallet.id]: { amount: '', date: defaultDate, notes: '', loading: false }
    }));
  };

  const handleGlobalFormChange = (field: string, value: string | boolean) => {
    setGlobalForm(prev => ({ ...prev, [field]: value }));
  };

  const addGlobalTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !globalForm.walletId || !globalForm.amount) return;
    const wallet = wallets.find(w => w.id === globalForm.walletId);
    if (!wallet) return;
    const amount = Number(globalForm.amount);
    const currentSpent = Number(wallet.spent_amount) || 0;
    const available = wallet.allocated_amount - currentSpent;
    if (amount > available) {
      alert("You don't have enough balance in this wallet.");
      return;
    }
    setGlobalForm(prev => ({ ...prev, loading: true }));
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      wallet_id: wallet.id,
      category: wallet.category,
      amount,
      date: globalForm.date,
      notes: globalForm.notes
    });
    if (txError) {
      alert("Failed to add transaction.");
      setGlobalForm(prev => ({ ...prev, loading: false }));
      return;
    }
    await supabase.from('wallets').update({
      spent_amount: currentSpent + amount
    }).eq('id', wallet.id);
    await refreshData();
    setGlobalForm({ walletId: '', amount: '', date: defaultDate, notes: '', loading: false });
    setShowAddModal(false);
  };

  const deleteTransaction = async (tx: Transaction) => {
    if (!window.confirm('Delete this transaction?')) return;
    const wallet = wallets.find(w => w.id === tx.wallet_id);
    if (!wallet) return;
    const { error } = await supabase.from('transactions').delete().eq('id', tx.id);
    if (error) {
      alert('Failed to delete transaction.');
      return;
    }
    await supabase.from('wallets').update({
      spent_amount: Math.max(0, Number(wallet.spent_amount) - Number(tx.amount))
    }).eq('id', wallet.id);
    await refreshData();
  };

  const createDefaultWallets = async () => {
    if (!user) return;
    const defaultWallets = [
      { category: 'Savings', allocated_amount: 0, spent_amount: 0, allocated_percent: 0 },
      { category: 'Wants', allocated_amount: 0, spent_amount: 0, allocated_percent: 0 },
      { category: 'Needs', allocated_amount: 0, spent_amount: 0, allocated_percent: 0 },
    ];
    const walletsToInsert = defaultWallets.map(w => ({
      ...w,
      user_id: user.id
    }));
    const { error } = await supabase.from('wallets').insert(walletsToInsert);
    if (error) {
      alert('Failed to create default wallets.');
      return;
    }
    await refreshData();
  };

  return (
    <div className="min-h-full bg-[#0D1117] text-white p-4 md:p-8">
      {/* Floating + Button */}
      <button
        className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg z-50"
        onClick={() => setShowAddModal(true)}
        aria-label="Add Transaction"
      >
        +
      </button>
      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#161B22] rounded-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Add Transaction</h2>
            <form onSubmit={addGlobalTransaction} className="space-y-4">
              <select
                value={globalForm.walletId}
                onChange={e => handleGlobalFormChange('walletId', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select Wallet</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.category} (₹{w.allocated_amount - w.spent_amount} left)</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={globalForm.amount}
                onChange={e => handleGlobalFormChange('amount', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <input
                type="date"
                value={globalForm.date}
                onChange={e => handleGlobalFormChange('date', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={globalForm.notes}
                onChange={e => handleGlobalFormChange('notes', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={globalForm.loading || !globalForm.walletId || !globalForm.amount}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {globalForm.loading ? 'Adding...' : 'Add Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Wallets</h1>
        <p className="text-gray-400">Manage your budget categories</p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {wallets.length === 0 && (
          <div className="col-span-full text-center text-gray-500 flex flex-col items-center gap-4">
            <div>No wallets yet. Add a transaction to create one.</div>
            <button
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold"
              onClick={createDefaultWallets}
            >
              Create Default Wallets
            </button>
          </div>
        )}
        {[...wallets]
          .sort((a, b) => {
            const order = ['Savings', 'Wants', 'Needs'];
            const aIndex = order.indexOf(a.category);
            const bIndex = order.indexOf(b.category);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.category.localeCompare(b.category);
          })
          .map((wallet) => {
            const form = transactionForms[wallet.id] || { amount: '', date: defaultDate, notes: '', loading: false };
            const currentSpent = Number(wallet.spent_amount) || 0;
            const progress = wallet.allocated_amount ? (currentSpent / wallet.allocated_amount) * 100 : 0;

            return (
              <div key={wallet.id} className="relative bg-[#161B22] rounded-xl overflow-hidden transition-all duration-300 border border-gray-800">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500 text-white">
                      <span>{wallet.category[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{wallet.category}</div>
                      <div className="text-xs text-gray-400">₹{wallet.allocated_amount} allocated</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">Balance</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">₹{wallet.allocated_amount - currentSpent}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded">
                    <div className="h-2 rounded bg-green-500" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{Math.round(progress)}% spent</div>
                  <div className="mt-4">
                    <form onSubmit={e => addTransaction(e, wallet)} className="space-y-2">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={e => handleFormChange(wallet.id, 'amount', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={form.date}
                        onChange={e => handleFormChange(wallet.id, 'date', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={form.notes}
                        onChange={e => handleFormChange(wallet.id, 'notes', e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={form.loading || !form.amount}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {form.loading ? 'Adding...' : 'Add Transaction'}
                      </button>
                    </form>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-gray-400 mb-1">Transactions</div>
                    <ul className="space-y-1 max-h-32 overflow-y-auto">
                      {transactions.filter(tx => tx.wallet_id === wallet.id && tx.user_id === wallet.user_id).length === 0 && (
                        <li className="text-gray-600 text-xs">No transactions yet.</li>
                      )}
                      {transactions
                        .filter(tx => tx.wallet_id === wallet.id && tx.user_id === wallet.user_id)
                        .map(tx => (
                          <li key={tx.id} className="flex justify-between items-center text-xs gap-2">
                            <span>{tx.date}: ₹{tx.amount} {tx.notes && <span className="text-gray-400">({tx.notes})</span>}</span>
                            <button
                              className="text-red-400 hover:text-red-600 ml-2"
                              title="Delete"
                              onClick={() => deleteTransaction(tx)}
                            >
                              🗑️
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default WalletsPage;