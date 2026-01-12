import React, { useState } from 'react';
import { User } from './types';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ScraperPage from './pages/ScraperPage';
import Layout from './components/Layout';
// Using mock auth for now
// import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = () => {
      // Mock Login for Development
      setUser({
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Valid UUID for DB compatibility
          email: 'developer@agentpro.kit',
          role: 'admin'
      });
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage('dashboard');
  };

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActivePage} user={user} />;
      case 'catalog':
        return <ScraperPage onNavigate={setActivePage} />;
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
