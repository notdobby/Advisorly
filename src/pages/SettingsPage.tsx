import React, { useState, useEffect } from 'react';
import { SettingsIcon, GlobeIcon, BellIcon, CalendarIcon, RefreshCwIcon, ShieldIcon, EyeIcon, EyeOffIcon, CheckIcon, KeyIcon, LockIcon, UnlockIcon, DatabaseIcon } from 'lucide-react';
import { supabase } from '../../frontend/supabaseClient';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useSMS } from '../hooks/useSMS';

const SettingsPage = () => {
  const { user } = useSupabaseAuth();
  const { hasPermission, isMobile, requestSMSPermission, syncTransactions, isLoading, apiKey, saveApiKey } = useSMS();
  const [notifications, setNotifications] = useState({
    spending: true,
    suggestions: true,
    security: true
  });
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [salaryDate, setSalaryDate] = useState('15');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('1234');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  // Update tempApiKey when apiKey changes
  useEffect(() => {
    setTempApiKey(apiKey);
  }, [apiKey]);

  const handleToggle = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
  };
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };
  const handleSalaryDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSalaryDate(e.target.value);
  };
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPin(e.target.value);
  };
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;
      const { data } = await supabase.from('users').select('currency, salary_date, theme').eq('id', user.id).single();
      if (data) {
        if (data.currency) setCurrency(data.currency);
        if (data.salary_date) setSalaryDate(String(data.salary_date));
        if (data.theme === 'light' || data.theme === 'dark') setTheme(data.theme);
      }
    };
    fetchUserSettings();
  }, [user]);
  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const handleThemeToggle = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (user) {
      await supabase.from('users').update({ theme: newTheme }).eq('id', user.id);
    }
  };
  const handleApiKeySave = () => {
    if (tempApiKey.trim()) {
      saveApiKey(tempApiKey.trim());
      alert('API key saved successfully!');
    } else {
      alert('Please enter a valid API key');
    }
  };
  const handleApiKeyClear = () => {
    setTempApiKey('');
    saveApiKey('');
    alert('API key cleared');
  };
  return <div className="min-h-full bg-white text-black dark:bg-[#0D1117] dark:text-white p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-indigo-900/50 flex items-center justify-center">
            <SettingsIcon size={20} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        </div>
        <p className="text-gray-400">
          Customize your financial vault experience
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* General Settings */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold mb-6">General Settings</h2>
          <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                <GlobeIcon size={16} className="text-blue-400" />
              </div>
              <h3 className="font-medium">Region & Language</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Currency
                </label>
                <select value={currency} onChange={handleCurrencyChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="JPY">Japanese Yen (¥)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Language
                </label>
                <select value={language} onChange={handleLanguageChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>
          </div>
          <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-yellow-900/30 flex items-center justify-center">
                <CalendarIcon size={16} className="text-yellow-400" />
              </div>
              <h3 className="font-medium">Salary & Budget</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Salary Date
                </label>
                <select value={salaryDate} onChange={handleSalaryDateChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  {[...Array(31)].map((_, i) => <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Day of month when your salary is received
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <RefreshCwIcon size={16} />
                <span>Reset Budget Categories</span>
              </button>
            </div>
          </div>
          <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center">
                <BellIcon size={16} className="text-purple-400" />
              </div>
              <h3 className="font-medium">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">Spending Alerts</label>
                <button onClick={() => handleToggle('spending')} className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.spending ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.spending ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">AI Suggestions</label>
                <button onClick={() => handleToggle('suggestions')} className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.suggestions ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.suggestions ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Security Alerts</label>
                <button onClick={() => handleToggle('security')} className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifications.security ? 'bg-indigo-600' : 'bg-gray-700'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.security ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
          <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-900/30 flex items-center justify-center">
                <span className="text-yellow-400 text-lg">🌓</span>
              </div>
              <h3 className="font-medium">Theme</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Dark Mode</span>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-400'}`}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </section>
        {/* SMS Tracking */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold mb-6">SMS Tracking</h2>
          <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-400 text-lg">📱</span>
              </div>
              <h3 className="font-medium">Bank Transaction Sync</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">SMS Tracking</label>
                  <p className="text-xs text-gray-400">
                    {isMobile 
                      ? 'Automatically capture bank transactions from SMS'
                      : 'Install the app on mobile to enable SMS tracking'
                    }
                  </p>
                </div>
                <button
                  onClick={requestSMSPermission}
                  disabled={!isMobile || isLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    hasPermission ? 'bg-indigo-600' : 'bg-gray-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      hasPermission ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {isMobile && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Sync Status</label>
                    <p className="text-xs text-gray-400">
                      {hasPermission ? 'SMS permissions granted' : 'SMS permissions required'}
                    </p>
                  </div>
                  <button
                    onClick={syncTransactions}
                    disabled={!hasPermission || isLoading}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    {isLoading ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              )}
              <div className="p-3 bg-gray-900/50 rounded-lg">
                <p className="text-xs text-gray-400">
                  <strong>Note:</strong> SMS tracking is only available on mobile devices. 
                  Install the app on your phone to automatically capture bank transactions from SMS messages.
                </p>
              </div>
            </div>
          </div>
          
          {/* API Key Management */}
          <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
                <DatabaseIcon size={16} className="text-green-400" />
              </div>
              <h3 className="font-medium">Bank API Configuration</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input 
                    type={showApiKey ? 'text' : 'password'} 
                    value={tempApiKey} 
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10" 
                    placeholder="Enter your bank API key"
                  />
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)} 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  >
                    {showApiKey ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is stored locally and never shared
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApiKeySave}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Save API Key
                </button>
                <button
                  onClick={handleApiKeyClear}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold"
                >
                  Clear
                </button>
              </div>
              <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <p className="text-xs text-blue-300">
                  <strong>How it works:</strong> Enter your API key to fetch real bank transactions from your SMS parsing service. 
                  The app will automatically sync your transaction history.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Security Settings */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold mb-6">Security</h2>
          <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
                <KeyIcon size={16} className="text-green-400" />
              </div>
              <h3 className="font-medium">Access Control</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Security PIN
                </label>
                <div className="relative">
                  <input type={showPin ? 'text' : 'password'} value={pin} onChange={handlePinChange} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10" maxLength={4} placeholder="Enter 4-digit PIN" />
                  <button onClick={() => setShowPin(!showPin)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white">
                    {showPin ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Required for sensitive operations
                </p>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Require PIN for changes</label>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors w-full">
                <KeyIcon size={16} />
                <span>Change Security PIN</span>
              </button>
            </div>
          </div>
          <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center">
                <ShieldIcon size={16} className="text-red-400" />
              </div>
              <h3 className="font-medium">Data Protection</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center">
                  <CheckIcon size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Your data is encrypted</p>
                  <p className="text-xs text-gray-500">
                    Using industry-standard encryption
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto-lock after inactivity</label>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <LockIcon size={16} />
                <span>Lock Vault Now</span>
              </button>
              <div className="pt-2">
                <button className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm">
                  <UnlockIcon size={14} />
                  <span>Export & Delete My Data</span>
                </button>
              </div>
            </div>
          </div>
          <div className="bg-[#161B22] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldIcon size={16} className="text-green-400" />
                <span className="text-sm">Your data is private</span>
              </div>
              <span className="text-xs text-gray-500">Last backup: Today</span>
            </div>
          </div>
        </section>
      </div>
    </div>;
};
export default SettingsPage;