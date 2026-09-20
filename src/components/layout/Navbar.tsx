import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { 
  HeartHandshake, 
  Trophy, 
  Sparkles, 
  User, 
  ShieldAlert, 
  LogOut, 
  LogIn, 
  ChevronDown, 
  Target, 
  CreditCard,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenCheckout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenAuth,
  onOpenCheckout,
}) => {
  const { currentUser, role, isSubscriber, isActiveSubscriber, isAdmin, isPublicVisitor, logout, switchPersona } = useAuth();
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allUsers = db.getUsers();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      {/* Top Impact Banner */}
      <div className="bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-emerald-950/40 border-b border-slate-800/40 px-4 py-1 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <HeartHandshake className="w-3 h-3 mr-1" />
              Charity Impact
            </span>
            <span className="hidden sm:inline text-slate-400">Over $268,400 distributed to partner causes</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-amber-300/90 font-medium">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Next Draw Jackpot: <strong className="text-amber-300 font-bold">$32,960 Rollover</strong></span>
            </div>

            {/* Persona Switcher for easy inspection */}
            <div className="relative">
              <button
                id="persona-switcher-btn"
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
                title="Switch persona to test all 3 roles and subscription statuses"
              >
                <span className="text-slate-400">Role:</span>
                <span className="font-semibold text-rose-300 capitalize">
                  {isAdmin ? 'Admin' : isActiveSubscriber ? 'Active Subscriber' : isSubscriber ? 'Inactive Sub' : 'Public Visitor'}
                </span>
                <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-slate-400" />
              </button>

              {personaDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-left text-xs"
                  onClick={() => setPersonaDropdownOpen(false)}
                >
                  <div className="px-2 py-1 font-semibold text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 mb-1">
                    Select Test Persona (PRD Roles)
                  </div>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => switchPersona(u.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition flex items-center justify-between ${
                        currentUser?.id === u.id
                          ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-100">{u.full_name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        u.role === 'admin'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                          : u.subscription.status === 'active'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : u.subscription.status}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-slate-800 my-1 pt-1">
                    <button
                      onClick={() => switchPersona(null)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition text-slate-400 hover:bg-slate-800 hover:text-slate-200 ${
                        isPublicVisitor ? 'bg-slate-800 font-semibold text-white' : ''
                      }`}
                    >
                      Public Visitor (Logged Out)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">DIGITAL HEROES</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Level 1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">Play Golf • Back Charities • Win Monthly</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              id="nav-home-btn"
              onClick={() => setActiveView('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'home'
                  ? 'text-white bg-slate-800/80 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Overview
            </button>

            <button
              id="nav-charities-btn"
              onClick={() => setActiveView('charities')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                activeView === 'charities' || activeView === 'charity_detail'
                  ? 'text-white bg-slate-800/80 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <span>Charity Directory</span>
            </button>

            <button
              id="nav-mechanics-btn"
              onClick={() => setActiveView('mechanics')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                activeView === 'mechanics'
                  ? 'text-white bg-slate-800/80 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Draw Mechanics</span>
            </button>

            <button
              id="nav-pricing-btn"
              onClick={() => setActiveView('pricing')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                activeView === 'pricing'
                  ? 'text-white bg-slate-800/80 shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Membership
            </button>

            {/* Subscriber-Only Features */}
            {isSubscriber && (
              <>
                <button
                  id="nav-scores-btn"
                  onClick={() => setActiveView('scores')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    activeView === 'scores'
                      ? 'text-white bg-slate-800/80 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>My Scores</span>
                </button>

                <button
                  id="nav-dashboard-btn"
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    activeView === 'dashboard'
                      ? 'text-white bg-slate-800/80 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Dashboard</span>
                  {!isActiveSubscriber && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Subscription Inactive" />
                  )}
                </button>
              </>
            )}

            {/* Admin Portal */}
            {isAdmin && (
              <button
                id="nav-admin-btn"
                onClick={() => setActiveView('admin')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1.5 ${
                  activeView === 'admin'
                    ? 'bg-purple-900/60 text-purple-200 border border-purple-700/80'
                    : 'text-purple-300 hover:bg-purple-950/50 border border-purple-800/40'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isPublicVisitor ? (
              <div className="flex items-center space-x-2">
                <button
                  id="header-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </button>

                <button
                  id="header-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 shadow-md shadow-rose-950/50 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Join the Mission
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {!isActiveSubscriber && (
                  <button
                    id="header-activate-sub-btn"
                    onClick={onOpenCheckout}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center space-x-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Activate Subscription</span>
                  </button>
                )}

                <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white leading-tight">{currentUser?.full_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {isAdmin ? 'Super Admin' : `${currentUser?.charity_contribution_pct}% to Charity`}
                    </div>
                  </div>

                  <button
                    id="header-logout-btn"
                    onClick={logout}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => { setActiveView('home'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
          >
            Overview
          </button>
          <button
            onClick={() => { setActiveView('charities'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
          >
            Charity Directory
          </button>
          <button
            onClick={() => { setActiveView('mechanics'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
          >
            Draw Mechanics
          </button>
          <button
            onClick={() => { setActiveView('pricing'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
          >
            Membership
          </button>

          {isSubscriber && (
            <>
              <button
                onClick={() => { setActiveView('scores'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                My Scores
              </button>
              <button
                onClick={() => { setActiveView('dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                Subscriber Dashboard
              </button>
            </>
          )}

          {isAdmin && (
            <button
              onClick={() => { setActiveView('admin'); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-purple-300 bg-purple-950/40 border border-purple-800"
            >
              Admin Console
            </button>
          )}

          <div className="border-t border-slate-800 pt-3">
            {isPublicVisitor ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2 rounded-lg text-center text-sm font-medium bg-slate-800 text-white"
                >
                  Log In
                </button>
                <button
                  onClick={() => { onOpenAuth('signup'); setMobileMenuOpen(false); }}
                  className="w-full py-2 rounded-lg text-center text-sm font-semibold bg-rose-500 text-slate-950"
                >
                  Join
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{currentUser?.email}</span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
