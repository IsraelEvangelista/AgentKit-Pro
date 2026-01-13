import React, { useState } from 'react';
import { X, Lock, User, Eye, EyeOff, ArrowRight, Github, Loader2 } from 'lucide-react';
import { signInWithGitHub } from '../services/authService';
import RegisterPage from './RegisterPage';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [showRegister, setShowRegister] = useState(false);
  const [showVerificationNotification, setShowVerificationNotification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('dev@agentpro.kit');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const handleRegisterSuccess = () => {
    setShowVerificationNotification(true);
  };

  if (showRegister) {
    return (
      <>
        <RegisterPage
          onBackToLogin={() => setShowRegister(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      </>
    );
  }

  // Mock Login Handler (for development)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate delay
    setTimeout(() => {
        setIsLoading(false);
        onLogin(); // Triggers state update in App.tsx
    }, 1000);
  };

  // GitHub OAuth Handler
  const handleGithubLogin = async () => {
    setIsGithubLoading(true);

    try {
      const { user, error } = await signInWithGitHub();

      if (error) {
        console.error('GitHub login error:', error);
        setIsGithubLoading(false);
        return;
      }

      // OAuth will redirect to GitHub, so we don't need to do anything else
      // The redirect back to the app will be handled by Supabase
    } catch (error) {
      console.error('GitHub login failed:', error);
      setIsGithubLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Grids */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>

      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyber-blue/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md z-10 p-4">
        {/* Logo Area */}
        <div className="text-center mb-8 relative group">
           <div className="w-16 h-16 mx-auto bg-transparent border-0 flex items-center justify-center mb-4 transition-all duration-500">
             <img src="/assets/images/AgentKit_logo.png" alt="AgentPro-Kit Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]" />
           </div>
           <h1 className="text-3xl font-bold text-white tracking-tight mb-1">AgentPro-Kit</h1>
           <div className="inline-block px-3 py-1 rounded bg-cyber-panel border border-cyber-border text-cyber-blue text-[10px] font-mono tracking-[0.2em] uppercase">
             Neural Catalog System
           </div>
        </div>

        {/* Card */}
        <div className="bg-cyber-panel/80 backdrop-blur border border-cyber-border rounded-xl overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-cyber-border">
            <div className="flex-1 py-3 text-center text-sm font-bold text-cyber-blue border-b-2 border-cyber-blue bg-cyber-blue/5 cursor-pointer">
              AUTHENTICATE
            </div>
            <div className="flex-1 py-3 text-center text-sm font-bold text-gray-500 hover:text-white cursor-pointer transition-colors">
              REGISTER
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-white mb-1">Identity Verification</h2>
            <p className="text-gray-500 text-xs mb-6">Enter credentials to access the mainframe.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5 ml-1">Operator ID (Email)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none transition-all placeholder-gray-700"
                    placeholder="operator@skillsmp.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1">
                  <label className="block text-[10px] font-mono uppercase text-gray-400">Access Key</label>
                  <a href="#" className="text-[10px] text-cyber-orange hover:text-orange-400 transition-colors">Lost Key?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 pl-10 pr-10 text-white text-sm focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none transition-all placeholder-gray-700"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyber-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-[0_4px_14px_0_rgba(45,96,255,0.39)] hover:shadow-[0_6px_20px_rgba(45,96,255,0.23)] disabled:opacity-70 disabled:cursor-wait"
              >
                <span>{isLoading ? 'ESTABLISHING CONNECTION...' : 'INITIALIZE SESSION'}</span>
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="relative my-6">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-cyber-border"></div>
               </div>
               <div className="relative flex justify-center text-xs uppercase">
                 <span className="bg-[#15151b] px-2 text-gray-500 font-mono">External Protocols</span>
               </div>
            </div>

            <button
                type="button"
                onClick={handleGithubLogin}
                disabled={isGithubLoading}
                className="w-full bg-cyber-dark border border-cyber-border hover:bg-cyber-border hover:border-white text-white py-2 rounded-lg flex items-center justify-center text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-wait"
                title="Sign in with GitHub"
               >
                  {isGithubLoading ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : (
                    <Github size={14} className="mr-2" />
                  )}
                  GitHub
               </button>
          </div>

          <div className="p-4 bg-black/20 text-center border-t border-cyber-border">
            <p className="text-xs text-gray-500">New operator? <button onClick={() => setShowRegister(true)} className="text-cyber-cyan hover:underline font-bold ml-1">Create Account</button></p>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center space-x-4 text-[10px] text-gray-600 font-mono tracking-widest">
            <div className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse"></div>
            <span>SYSTEM OPERATIONAL</span>
            <span>|</span>
            <span>V 3.4.1 (STABLE)</span>
            <span>|</span>
            <span>MOD: PRODUCTION</span>
        </div>

        {showVerificationNotification && (
          <div className="fixed bottom-4 right-4 bg-cyber-panel/90 border border-cyber-green/40 rounded-lg shadow-2xl p-4 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-300 backdrop-blur z-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center">
                  <Lock size={16} className="text-cyber-green" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-1">Verification Email Sent</h4>
                <p className="text-xs text-gray-400">Please check your inbox and click the verification link to activate your account.</p>
              </div>
              <button
                onClick={() => setShowVerificationNotification(false)}
                className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
