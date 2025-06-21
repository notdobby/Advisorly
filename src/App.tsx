import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationFlow from './pages/RegistrationFlow';
import Dashboard from './pages/Dashboard';
import WalletsPage from './pages/WalletsPage';
import AISuggestionsPage from './pages/AISuggestionsPage';
import ActivityPage from './pages/ActivityPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './layouts/MainLayout';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { supabase } from '../frontend/supabaseClient';
import { checkAndClearOldCache } from './utils/clearCache';

export function App() {
  const { user, loading } = useSupabaseAuth();
  const [isRegistered, setIsRegistered] = React.useState(false);

  React.useEffect(() => {
    // Check and clear old cache if transitioning from development to production
    checkAndClearOldCache();
    
    // Handle authentication callback
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth callback error:', error);
      }
    };

    handleAuthCallback();
  }, []);

  React.useEffect(() => {
    if (user) {
      supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error && error.code !== 'PGRST116') {
            console.error('Error checking user registration:', error);
          }
          setIsRegistered(!!data);
        });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D1117]">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <LoginPage /> : !isRegistered ? <Navigate to="/register" /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={user && !isRegistered ? <RegistrationFlow onComplete={() => setIsRegistered(true)} /> : <Navigate to={user ? '/dashboard' : '/'} />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={user && isRegistered ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/wallets/:id?" element={user && isRegistered ? <WalletsPage /> : <Navigate to="/" />} />
          <Route path="/ai-suggestions" element={user && isRegistered ? <AISuggestionsPage /> : <Navigate to="/" />} />
          <Route path="/activity" element={user && isRegistered ? <ActivityPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={user && isRegistered ? <SettingsPage /> : <Navigate to="/" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}