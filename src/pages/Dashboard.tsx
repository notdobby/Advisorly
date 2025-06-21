import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../frontend/supabaseClient';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface Wallet {
  id: string;
  user_id: string;
  category: string;
  allocated_percent: number;
  allocated_amount: number;
  spent_amount: number;
}

const Dashboard = () => {
  const { user, loading } = useSupabaseAuth();
  const [income, setIncome] = useState(0);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [remainingPercentage, setRemainingPercentage] = useState(0);
  const [salaryDate, setSalaryDate] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      // Fetch user profile
      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
      setIncome(userData?.income || 0);
      // Fetch wallets
      const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', user.id);
      setWallets(walletData || []);
      // Calculate remaining
      const totalSpent = (walletData || []).reduce((sum, w) => sum + (w.spent_amount || 0), 0);
      setRemaining((userData?.income || 0) - totalSpent);
      setRemainingPercentage(userData?.income ? (100 * ((userData?.income - totalSpent) / userData.income)) : 0);
      // After fetching userData in useEffect, store salary_date in state
      setSalaryDate(userData?.salary_date || null);
    };
    fetchData();
  }, [user]);

  // Calculate days until next deposit
  const today = new Date();
  const currentDay = today.getDate();
  let daysUntilNextDeposit = null;
  if (salaryDate) {
    if (currentDay < salaryDate) {
      daysUntilNextDeposit = salaryDate - currentDay;
    } else {
      // Get days in next month
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const daysInMonth = nextMonth.getDate();
      daysUntilNextDeposit = (daysInMonth - currentDay) + salaryDate;
    }
  }

  if (loading) return <div>Loading...</div>;

  return <div className="min-h-screen bg-white text-black dark:bg-[#0D1117] dark:text-white p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <span className="text-2xl">🔒</span> Secured Overview
        </h1>
        <p className="text-gray-400">Welcome back, User</p>
      </header>
      
      <section>
      <div className="flex flex-col md:flex-row gap-4 mt-6">
  <div className="flex-1 bg-[#161B22] rounded-xl p-6 shadow border border-gray-800">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg font-semibold">Monthly Income</span>
    </div>
    <div className="text-3xl font-bold">₹{income}</div>
    <div className="text-xs text-gray-400 mt-1">
      {daysUntilNextDeposit !== null ? `Next deposit in ${daysUntilNextDeposit} days` : 'Next deposit date not set'}
    </div>
  </div>
  <div className="flex-1 bg-[#161B22] rounded-xl p-6 shadow border border-gray-800">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg font-semibold">Remaining Funds</span>
    </div>
    <div className="text-3xl font-bold">₹{remaining}</div>
    <div className="w-full h-2 bg-gray-800 rounded mt-2">
      <div className="h-2 rounded bg-indigo-500" style={{ width: `${remainingPercentage}%` }}></div>
    </div>
    <div className="text-xs text-gray-400 mt-1">{remainingPercentage.toFixed(0)}% left</div>
  </div>
  <div className="flex-1 bg-[#161B22] rounded-xl p-6 shadow border border-gray-800">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg font-semibold">AI Insight</span>
      <span className="text-yellow-400">⚠️</span>
    </div>
    <div className="text-sm text-gray-300">{wallets.length === 0 ? 'No data yet.' : 'AI will analyze your spending and give insights here.'}</div>
    <div className="text-xs text-indigo-400 mt-2 cursor-pointer">View all insights →</div>
  </div>
</div>
<div className="text-xs text-gray-400 text-right mt-2">Last updated: {new Date().toLocaleDateString()}</div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Wallets</h2>
          <Link to="/wallets" className="text-sm text-indigo-400 hover:text-indigo-300">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wallets
            .sort((a, b) => {
              const order = ['Savings', 'Wants', 'Needs'];
              const aIndex = order.indexOf(a.category);
              const bIndex = order.indexOf(b.category);
              if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;
              return a.category.localeCompare(b.category);
            })
            .map((wallet: Wallet) => {
              const usedPercent = wallet.allocated_amount > 0 ? (wallet.spent_amount / wallet.allocated_amount) * 100 : 0;
              let barColor = 'bg-green-500';
              if (usedPercent >= 90) barColor = 'bg-red-500';
              else if (usedPercent >= 60) barColor = 'bg-yellow-400';
              return (
                <Link key={wallet.id} to={`/wallets/${wallet.id}`} className="group">
                  <div className="relative bg-[#161B22] rounded-2xl overflow-hidden transition-all duration-300 border border-gray-800 shadow-md hover:shadow-xl hover:border-indigo-600">
                    <div className="p-7 flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-blue-500 text-white text-xl font-bold shadow">
                          {wallet.category[0]}
                        </div>
                        <div>
                          <div className="font-extrabold text-xl">{wallet.category}</div>
                          <div className="text-xs text-gray-400 font-medium">₹{wallet.allocated_amount} allocated</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-1">Balance</div>
                      <div className="text-2xl font-extrabold text-green-400 mb-2">₹{wallet.allocated_amount - (wallet.spent_amount || 0)}</div>
                      <div className="w-full h-3 bg-gray-800 rounded-full mb-2">
                        <div
                          className={`h-3 rounded-full transition-all ${barColor}`}
                          style={{ width: `${Math.min(usedPercent, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                        <span>{Math.round(usedPercent)}% used</span>
                        <span className="text-indigo-400 hover:underline font-semibold cursor-pointer">View details →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
    </div>;
};
export default Dashboard;