import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FolderSearch, Settings, LogOut, ShieldCheck, User as UserIcon, Clock } from 'lucide-react';
import { User } from '../types';
import { getSignedAvatarUrl } from '../services/avatarService';
import { supabase } from '../services/supabaseClient';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activePage, onNavigate, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // Get display name from user
  const displayName = user.display_name || user.email?.split('@')[0] || 'User';

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const resolveAvatar = async () => {
      // First, try to get avatar from profiles table (uploaded avatar)
      if (user.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.avatar_url) {
          const profileAvatar = profile.avatar_url;

          // Handle different avatar URL formats
          if (profileAvatar.startsWith('data:') || profileAvatar.startsWith('blob:')) {
            setAvatarUrl(profileAvatar);
            return;
          }

          if (profileAvatar.startsWith('http')) {
            setAvatarUrl(profileAvatar);
            return;
          }

          // Otherwise try to get signed URL
          const { url } = await getSignedAvatarUrl(profileAvatar);
          if (url) {
            setAvatarUrl(url);
            return;
          }
        }
      }

      // Fallback to user.avatar from auth (GitHub avatar, etc.)
      const raw = user.avatar;
      if (!raw) {
        setAvatarUrl(null);
        return;
      }

      if (raw.startsWith('data:') || raw.startsWith('blob:')) {
        setAvatarUrl(raw);
        return;
      }

      if (raw.startsWith('http')) {
        setAvatarUrl(raw);
        return;
      }

      const { url } = await getSignedAvatarUrl(raw);
      setAvatarUrl(url);
    };

    resolveAvatar();
  }, [user.id, user.avatar]);

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = currentDateTime.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'night';
  };

  // Format date and time
  const formatDateTime = (): string => {
    const day = String(currentDateTime.getDate()).padStart(2, '0');
    const month = String(currentDateTime.getMonth() + 1).padStart(2, '0');
    const year = currentDateTime.getFullYear();
    const hours = String(currentDateTime.getHours()).padStart(2, '0');
    const minutes = String(currentDateTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentDateTime.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-cyber-text">
      {/* Sidebar */}
      <aside className={`
        flex flex-col z-20 bg-cyber-panel border-r border-cyber-border
        transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? 'w-16' : 'w-full md:w-64'}
      `}>
        {/* Header - Clickable to toggle */}
        <div
          onClick={toggleSidebar}
          className="p-4 border-b border-cyber-border cursor-pointer hover:bg-cyber-border/30 transition-colors group"
        >
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-transparent flex items-center justify-center flex-shrink-0">
              <img src="/assets/images/AgentKit_logo.png" alt="AgentPro-Kit Logo" className="w-full h-full object-contain" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold tracking-wider text-white text-lg">AGENTPRO-KIT</h1>
                <p className="text-xs text-cyber-orange tracking-widest font-mono">SYSTEM: ONLINE</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Icons centered when collapsed */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`
              w-full flex items-center rounded-lg transition-all duration-200 group
              ${isSidebarCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
              ${activePage === 'dashboard'
                ? 'bg-cyber-blue/10 border border-cyber-blue/50 text-white'
                : 'hover:bg-cyber-border/50 text-cyber-muted'
              }
            `}
            title={isSidebarCollapsed ? 'Dashboard' : undefined}
          >
            <LayoutDashboard size={18} className={activePage === 'dashboard' ? 'text-cyber-blue' : 'group-hover:text-white flex-shrink-0'} />
            {!isSidebarCollapsed && <span className="font-medium">Dashboard</span>}
          </button>

          <button
            onClick={() => onNavigate('search')}
            className={`
              w-full flex items-center rounded-lg transition-all duration-200 group
              ${isSidebarCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
              ${activePage === 'search'
                ? 'bg-cyber-blue/10 border border-cyber-blue/50 text-white'
                : 'hover:bg-cyber-border/50 text-cyber-muted'
              }
            `}
            title={isSidebarCollapsed ? 'Search' : undefined}
          >
            <FolderSearch size={18} className={activePage === 'search' ? 'text-cyber-cyan' : 'group-hover:text-white flex-shrink-0'} />
            {!isSidebarCollapsed && <span className="font-medium">Search</span>}
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={`
              w-full flex items-center rounded-lg transition-all duration-200 group
              ${isSidebarCollapsed ? 'justify-center px-3 py-3' : 'space-x-3 px-4 py-3'}
              ${activePage === 'settings'
                ? 'bg-cyber-blue/10 border border-cyber-blue/50 text-white'
                : 'hover:bg-cyber-border/50 text-cyber-muted'
              }
            `}
            title={isSidebarCollapsed ? 'Configuration' : undefined}
          >
            <Settings size={18} className={activePage === 'settings' ? 'text-cyber-purple' : 'group-hover:text-white flex-shrink-0'} />
            {!isSidebarCollapsed && <span className="font-medium">Configuration</span>}
          </button>
        </nav>

        {/* Footer - User info and logout */}
        <div className="p-2 border-t border-cyber-border space-y-2">
          {/* User Info */}
          <div className={`
            flex items-center p-2 bg-cyber-black rounded border border-cyber-border
            ${isSidebarCollapsed ? 'justify-center' : ''}
          `}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyber-blue to-cyber-cyan p-[1px] flex-shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-cyber-black flex items-center justify-center">
                  <UserIcon size={14} className="text-cyber-text" />
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="ml-3 min-w-0 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{displayName}</p>
                <p className="text-[10px] text-cyber-green font-mono uppercase">ROLE: {user.role}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={`
              w-full flex items-center text-red-400 hover:bg-red-900/10 rounded transition-colors
              ${isSidebarCollapsed ? 'justify-center p-2' : 'justify-center space-x-2 p-2'}
            `}
            title={isSidebarCollapsed ? 'Terminate Session' : undefined}
          >
            <LogOut size={14} className="flex-shrink-0" />
            {!isSidebarCollapsed && <span className="text-xs">TERMINATE SESSION</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 relative flex flex-col ${activePage === 'search' ? 'overflow-hidden h-screen' : 'overflow-y-auto'}`}>
        <div className="scan-line"></div>
        <header className="h-16 border-b border-cyber-border flex items-center justify-between px-6 bg-cyber-black/50 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center space-x-2 text-cyber-green text-xs font-mono">
            <ShieldCheck size={14} />
            <span>DATABASE_CONN_ESTABLISHED</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
              <Clock size={14} className="text-cyber-cyan" />
              <span>{formatDateTime()}</span>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-bold text-white">
                Good {getGreeting()}, <span className="text-cyber-blue">{displayName}</span>
              </h2>
            </div>
          </div>
        </header>
        <div className={`w-full ${activePage === 'search' ? 'h-full p-4 overflow-hidden' : 'p-6 md:p-8'}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
