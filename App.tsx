import React, { useState, useEffect } from 'react';
import { User } from './types';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import { getSession, onAuthStateChange, signOut } from './services/authService';
import { useHashRouter } from './hooks/useHashRouter';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentPage: activePage, navigate: setActivePage } = useHashRouter();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { user: sessionUser, error } = await getSession();

      if (error) {
        console.error('Failed to get session:', error);
      }

      setUser(sessionUser);
      setIsLoading(false);
    };

    checkSession();

    // Listen to auth state changes
    const { data: { subscription } } = onAuthStateChange((authUser) => {
      setUser(authUser);
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    // This is now handled by the GitHub OAuth flow in LoginPage
    // Kept for mock/dev mode fallback if needed
  };

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.error('Logout error:', error);
    }

    setUser(null);
    setActivePage('dashboard');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActivePage} user={user} />;
      case 'search':
        return <SearchPage onNavigate={setActivePage} user={user} />;
      case 'settings':
        return <SettingsPage user={user} />;
      default:
        return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyber-blue font-mono text-sm">INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout
        user={user}
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
    >
        {renderContent()}
    </Layout>
  );
};

export default App;
