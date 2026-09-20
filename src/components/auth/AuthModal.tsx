import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { X, HeartHandshake, LogIn, UserPlus, KeyRound, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup' | 'forgot';
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const { login, signup, forgotPassword, resetPassword, switchPersona } = useAuth();
  const charities = db.getCharities();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [handicap, setHandicap] = useState(14.5);
  const [selectedCharityId, setSelectedCharityId] = useState(charities[0]?.id || 'charity-1');
  const [charityContributionPct, setCharityContributionPct] = useState(15);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email);
        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setErrorMessage(res.error || 'Login failed.');
        }
      } else if (mode === 'signup') {
        if (!fullName.trim() || !email.trim()) {
          setErrorMessage('Please fill in all required fields.');
          setLoading(false);
          return;
        }
        const res = await signup({
          email,
          fullName,
          selectedCharityId,
          charityContributionPct,
          handicap,
        });
        if (res.success) {
          setSuccessMessage('Account created! Welcome to Digital Heroes.');
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 800);
        } else {
          setErrorMessage(res.error || 'Signup failed.');
        }
      } else if (mode === 'forgot') {
        const res = await forgotPassword(email);
        setSuccessMessage(res.message);
        setTimeout(() => setMode('reset'), 1500);
      } else if (mode === 'reset') {
        const res = await resetPassword(password);
        setSuccessMessage(res.message);
        setTimeout(() => setMode('login'), 1500);
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchPersona(userId);
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 p-0.5 mb-3 shadow-lg shadow-rose-950/50">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-rose-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'login' && 'Sign In to Digital Heroes'}
            {mode === 'signup' && 'Join the Charity & Draw Movement'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'reset' && 'Set New Password'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Enter your registered email to access your scores & entries'}
            {mode === 'signup' && 'Support causes you love while entering monthly rollover prize draws'}
            {mode === 'forgot' && "Enter your email and we'll dispatch a secure recovery token"}
            {mode === 'reset' && 'Choose a strong password to protect your account'}
          </p>
        </div>

        {/* Feedback messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                id="signup-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Jordan Spieth"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          )}

          {mode !== 'reset' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          )}

          {/* Additional Signup Fields: Charity & Contribution Percentage */}
          {mode === 'signup' && (
            <div className="pt-2 border-t border-slate-800 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center">
                    <HeartHandshake className="w-3.5 h-3.5 text-rose-400 mr-1" />
                    Select Your Beneficiary Charity
                  </span>
                  <span className="text-[10px] text-emerald-400 font-normal">Min 10% Required</span>
                </label>
                <select
                  id="signup-charity-select"
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 transition"
                >
                  {charities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Charity Contribution Percentage</span>
                  <span className="text-rose-400 font-bold font-mono">{charityContributionPct}%</span>
                </div>
                <input
                  id="signup-charity-slider"
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={charityContributionPct}
                  onChange={(e) => setCharityContributionPct(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>10% (Required)</span>
                  <span>25%</span>
                  <span>50% (Heroic)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Handicap Index</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="54"
                  value={handicap}
                  onChange={(e) => setHandicap(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:opacity-95 text-slate-950 shadow-lg shadow-rose-950/50 transition transform active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              'Processing...'
            ) : mode === 'login' ? (
              <span className="flex items-center justify-center space-x-1.5">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </span>
            ) : mode === 'signup' ? (
              <span className="flex items-center justify-center space-x-1.5">
                <UserPlus className="w-4 h-4" />
                <span>Create Subscriber Account</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Proceed</span>
              </span>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <div>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(null); }}
                className="font-semibold text-rose-400 hover:text-rose-300 underline"
              >
                Sign up now
              </button>
            </div>
          ) : mode === 'signup' ? (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(null); }}
                className="font-semibold text-rose-400 hover:text-rose-300 underline"
              >
                Sign in
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(null); }}
              className="text-slate-400 hover:text-white"
            >
              Back to Sign In
            </button>
          )}
        </div>

        {/* Instant Test Accounts for 1-Click Verification */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            One-Click Test Accounts (PRD Roles)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('user-admin-1')}
              className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/60 hover:bg-purple-900/60 text-left text-xs transition"
            >
              <div className="font-bold text-purple-200">Marcus Vance</div>
              <div className="text-[10px] text-purple-400">Administrator</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user-subscriber-1')}
              className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 hover:bg-emerald-900/60 text-left text-xs transition"
            >
              <div className="font-bold text-emerald-200">Sarah Miller</div>
              <div className="text-[10px] text-emerald-400">Active Subscriber</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user-subscriber-2')}
              className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 hover:bg-slate-800 text-left text-xs transition"
            >
              <div className="font-bold text-slate-200">David Chen</div>
              <div className="text-[10px] text-slate-400">Active (Yearly)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user-inactive-1')}
              className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/60 text-left text-xs transition"
            >
              <div className="font-bold text-amber-200">Liam Walker</div>
              <div className="text-[10px] text-amber-400">Inactive Sub</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
