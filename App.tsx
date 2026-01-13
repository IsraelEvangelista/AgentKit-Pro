import React, { useState, useEffect } from 'react';
import { User } from './types';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScraperPage from './pages/ScraperPage';
import Layout from './components/Layout';
import { getSession, onAuthStateChange, signOut } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

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
      case 'catalog':
        return <ScraperPage onNavigate={setActivePage} user={user} />;
      case 'settings':
        return (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <div className="text-4xl mb-4">⚙️</div>
                <h2 className="text-xl font-mono uppercase">System Configuration</h2>
                <p>Module under construction...</p>
            </div>
        );
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
