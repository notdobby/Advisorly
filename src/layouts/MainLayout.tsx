import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, WalletIcon, BrainCircuitIcon, ClockIcon, SettingsIcon, MenuIcon, XIcon } from 'lucide-react';
import { supabase } from '../../frontend/supabaseClient';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  const navItems = [{
    path: '/dashboard',
    icon: <HomeIcon size={20} />,
    label: 'Dashboard'
  }, {
    path: '/wallets',
    icon: <WalletIcon size={20} />,
    label: 'Wallets'
  }, {
    path: '/ai-suggestions',
    icon: <BrainCircuitIcon size={20} />,
    label: 'AI Insights'
  }, {
    path: '/activity',
    icon: <ClockIcon size={20} />,
    label: 'Activity'
  }, {
    path: '/settings',
    icon: <SettingsIcon size={20} />,
    label: 'Settings'
  }];
  const { user } = useSupabaseAuth() as { user: any };
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.email ||
    'User';
  const userAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  const NavItem = ({
    path,
    icon,
    label
  }: { path: string; icon: React.ReactNode; label: string }) => (
    <NavLink to={path} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-indigo-900/30 text-indigo-400 border-l-2 border-indigo-400' : 'text-gray-400 hover:bg-indigo-900/20 hover:text-indigo-300'}`} onClick={() => setIsMobileMenuOpen(false)}>
      <div className="flex items-center justify-center w-6">{icon}</div>
      <span>{label}</span>
    </NavLink>
  );
  return <div className="flex h-screen bg-white text-black dark:bg-[#0D1117] dark:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-[#161B22] border-r border-gray-800">
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">
            <span className="text-indigo-400">🔐</span> Financial Vault
          </h1>
        </div>
        <div className="flex flex-col flex-1 p-4 space-y-2">
          {navItems.map((item, index) => <NavItem key={index} {...item} />)}
        </div>
        <div className="p-4 border-t border-gray-800">
          <div className="relative group flex flex-col items-start">
            <div className="flex items-center space-x-3">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  {userName[0]}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-gray-400">Secure Session</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 bg-red-600 hover:bg-red-500 text-white px-4 py-1 rounded-lg font-semibold shadow transition-colors opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto z-10"
              style={{ minWidth: '90px' }}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Header and Menu */}
      <div className="flex flex-col flex-1">
        <div className="md:hidden flex items-center justify-between h-16 px-4 bg-[#161B22] border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">
            <span className="text-indigo-400">🔐</span> Financial Vault
          </h1>
          <button onClick={toggleMobileMenu} className="p-2 rounded-md text-gray-400 hover:text-white">
            {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && <div className="md:hidden absolute top-16 left-0 right-0 bg-[#161B22] border-b border-gray-800 z-50 shadow-lg">
            <div className="p-4 space-y-2">
              {navItems.map((item, index) => <NavItem key={index} {...item} />)}
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="flex items-center space-x-3">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      {userName[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{userName}</p>
                    <p className="text-xs text-gray-400">Secure Session</p>
                  </div>
                </div>
              </div>
            </div>
          </div>}
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>;
};
export default MainLayout;