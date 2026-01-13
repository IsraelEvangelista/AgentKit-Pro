import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, Loader2, ArrowLeft, Shield, X } from 'lucide-react';
import { signUpWithEmail } from '../services/authService';

interface RegisterPageProps {
  onBackToLogin: () => void;
  onRegisterSuccess: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToLogin, onRegisterSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ kind: 'error' | 'success'; title: string; message?: string } | null>(null);

  const showToast = (kind: 'error' | 'success', title: string, message?: string) => {
    setToast({ kind, title, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  const validateForm = (): { valid: boolean; message: string } => {
    if (!email || !password || !confirmPassword) {
      return { valid: false, message: 'All fields are required' };
    }
    if (!email.includes('@') || !email.includes('.')) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' };
    }
    if (password !== confirmPassword) {
      return { valid: false, message: 'Passwords do not match' };
    }
    return { valid: true, message: '' };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm();
    if (!validation.valid) {
      showToast('error', 'Validation error', validation.message);
      return;
    }

    setIsLoading(true);

    try {
      const { user, error } = await signUpWithEmail(email, password, displayName);

      if (error) {
        showToast('error', 'Registration failed', error);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onBackToLogin();
      onRegisterSuccess();

    } catch (error: any) {
      showToast('error', 'Registration failed', error?.message || 'Registration failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyber-blue/20 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md z-10 p-4">
        <div className="mb-6">
          <button
            onClick={onBackToLogin}
            className="flex items-center text-cyber-blue hover:text-blue-400 text-sm transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </button>
        </div>

        <div className="bg-cyber-panel/80 backdrop-blur border border-cyber-border rounded-xl overflow-hidden shadow-2xl">
          <div className="p-8">
            <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-gray-500 text-xs mb-6">Register to access the system.</p>

            <form onSubmit={handleRegister} className="space-y-4">
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5 ml-1">Display Name (Optional)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none transition-all placeholder-gray-700"
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5 ml-1">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 pl-10 pr-10 text-white text-sm focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none transition-all placeholder-gray-700"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5 ml-1">Confirm Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-cyber-dark border border-cyber-border rounded-lg py-3 pl-10 pr-10 text-white text-sm focus:border-cyber-blue focus:ring-1 focus:ring-cyber-blue outline-none transition-all placeholder-gray-700"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyber-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-[0_4px_14px_0_rgba(45,96,255,0.39)] hover:shadow-[0_6px_20px_rgba(45,96,255,0.23)] disabled:opacity-70 disabled:cursor-wait"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>CREATE ACCOUNT</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {toast && (
          <div
            className={`fixed bottom-4 right-4 rounded-lg p-4 max-w-sm shadow-2xl backdrop-blur z-50 border animate-in slide-in-from-bottom-4 fade-in duration-300 ${
              toast.kind === 'success'
                ? 'bg-cyber-panel/90 border-cyber-green/40'
                : 'bg-cyber-panel/90 border-red-500/40'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                    toast.kind === 'success'
                      ? 'bg-cyber-green/10 border-cyber-green/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <Shield size={16} className={toast.kind === 'success' ? 'text-cyber-green' : 'text-red-400'} />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white mb-1">{toast.title}</h4>
                {toast.message && <p className="text-xs text-gray-400">{toast.message}</p>}
              </div>
              <button
                onClick={() => setToast(null)}
                className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
                title="Close"
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

export default RegisterPage;
