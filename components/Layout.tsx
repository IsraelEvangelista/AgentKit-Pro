import React from 'react';
import { LayoutDashboard, FolderSearch, Settings, LogOut, Database, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activePage, onNavigate, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row text-cyber-text">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-cyber-panel border-r border-cyber-border flex flex-col z-20">
        <div className="p-6 border-b border-cyber-border">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-transparent flex items-center justify-center">
                    <img src="/assets/images/AgentKit_logo.png" alt="AgentPro-Kit Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="font-bold tracking-wider text-white text-lg">AGENTPRO-KIT</h1>
                    <p className="text-xs text-cyber-orange tracking-widest font-mono">SYSTEM: ONLINE</p>
                </div>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => onNavigate('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activePage === 'dashboard' ? 'bg-cyber-blue/10 border border-cyber-blue/50 text-white' : 'hover:bg-cyber-border/50 text-cyber-muted'}`}
            >
                <LayoutDashboard size={18} className={activePage === 'dashboard' ? 'text-cyber-blue' : 'group-hover:text-white'} />
                <span className="font-medium">Dashboard</span>
            </button>
            <button 
                onClick={() => onNavigate('catalog')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activePage === 'catalog' ? 'bg-cyber-blue/10 border border-cyber-blue/50 text-white' : 'hover:bg-cyber-border/50 text-cyber-muted'}`}
            >
                <FolderSearch size={18} className={activePage === 'catalog' ? 'text-cyber-cyan' : 'group-hover:text-white'} />
                <span className="font-medium">Catalog & Scrape</span>
            </button>
            <button 
                onClick={() => onNavigate('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activePage === 'settings' ? 'bg-cyber-blue/10 border border-cyber-blue/50 text-white' : 'hover:bg-cyber-border/50 text-cyber-muted'}`}
            >
                <Settings size={18} className={activePage === 'settings' ? 'text-cyber-purple' : 'group-hover:text-white'} />
                <span className="font-medium">Configuration</span>
            </button>
        </nav>

        <div className="p-4 border-t border-cyber-border">
            <div className="flex items-center p-3 bg-cyber-black rounded border border-cyber-border mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyber-blue to-cyber-cyan p-[1px]">
                    <div className="w-full h-full rounded-full bg-cyber-black flex items-center justify-center">
                         <UserIcon size={14} className="text-cyber-text" />
                    </div>
                </div>
                <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user.email}</p>
                    <p className="text-[10px] text-cyber-green font-mono uppercase">ROLE: {user.role}</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-2 p-2 text-xs text-red-400 hover:bg-red-900/10 rounded transition-colors"
            >
                <LogOut size={14} />
                <span>TERMINATE SESSION</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 relative flex flex-col ${activePage === 'catalog' ? 'overflow-hidden h-screen' : 'overflow-y-auto'}`}>
        <div className="scan-line"></div>
        <header className="h-16 border-b border-cyber-border flex items-center justify-between px-6 bg-cyber-black/50 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
            <div className="flex items-center space-x-2 text-cyber-green text-xs font-mono">
                <ShieldCheck size={14} />
                <span>DATABASE_CONN_ESTABLISHED</span>
            </div>
            <div className="flex items-center space-x-4">
               {activePage === 'catalog' && (
                 <button onClick={() => onNavigate('dashboard')} className="text-xs bg-cyber-orange hover:bg-orange-600 text-white px-4 py-2 font-bold uppercase tracking-wider rounded transition-colors">
                    + Add New Skill
                 </button>
               )}
            </div>
        </header>
        <div className={`mx-auto w-full ${activePage === 'catalog' ? 'h-full p-4 overflow-hidden' : 'p-6 md:p-8 max-w-7xl'}`}>
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
