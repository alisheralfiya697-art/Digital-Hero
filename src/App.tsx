import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db } from './services/db';
import { Charity, PlanInterval } from './types';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Home Views
import { HeroSection } from './components/home/HeroSection';
import { CharitySpotlight } from './components/home/CharitySpotlight';
import { DrawMechanicsSection } from './components/home/DrawMechanicsSection';
import { SubscriptionPlans } from './components/home/SubscriptionPlans';
import { LiveWinnersMarquee } from './components/home/LiveWinnersMarquee';

// Dedicated Views
import { CharityDirectory } from './components/charities/CharityDirectory';
import { CharityDetailPage } from './components/charities/CharityDetailPage';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ScoreManager } from './components/scores/ScoreManager';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { StripeCheckoutModal } from './components/checkout/StripeCheckoutModal';
import { DonateModal } from './components/charities/DonateModal';

const AppContent: React.FC = () => {
  const { currentUser, isSubscriber } = useAuth();

  // Navigation State
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);

  // Modals State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanInterval>('monthly');
  const [checkoutContributionPct, setCheckoutContributionPct] = useState(15);

  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [donateCharity, setDonateCharity] = useState<Charity | null>(null);

  const charities = db.getCharities();

  const handleOpenAuth = (mode: 'login' | 'signup' = 'signup') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleOpenCheckout = (plan: PlanInterval = 'monthly', contributionPct: number = 15) => {
    setCheckoutPlan(plan);
    setCheckoutContributionPct(contributionPct);

    // If not logged in, prompt sign-up first or open checkout directly
    if (!currentUser) {
      setAuthMode('signup');
      setIsAuthOpen(true);
      return;
    }

    setIsCheckoutOpen(true);
  };

  const handleOpenDonate = (charity: Charity) => {
    setDonateCharity(charity);
    setIsDonateModalOpen(true);
  };

  const handleSelectCharityDetail = (charity: Charity) => {
    setSelectedCharity(charity);
    setActiveView('charity_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Navbar with Persona Role Switcher */}
      <Navbar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={handleOpenAuth}
        onOpenCheckout={() => handleOpenCheckout('monthly', 15)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* VIEW: Home */}
        {activeView === 'home' && (
          <div className="space-y-0 animate-fade-in">
            <HeroSection
              onJoin={() => handleOpenCheckout('monthly', 15)}
              onExploreCharities={() => {
                setActiveView('charities');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewMechanics={() => {
                setActiveView('mechanics');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            <LiveWinnersMarquee />

            <CharitySpotlight
              charities={charities}
              onSelectCharity={handleSelectCharityDetail}
              onViewAllCharities={() => {
                setActiveView('charities');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDonate={handleOpenDonate}
            />

            <DrawMechanicsSection />

            <SubscriptionPlans
              onSubscribe={(plan, pct) => handleOpenCheckout(plan, pct)}
            />
          </div>
        )}

        {/* VIEW: Charity Directory */}
        {activeView === 'charities' && (
          <div className="animate-fade-in">
            <CharityDirectory
              charities={charities}
              onSelectCharity={handleSelectCharityDetail}
              onDonate={handleOpenDonate}
              onDesignateForSubscription={(c) => {
                if (currentUser) {
                  currentUser.selected_charity_id = c.id;
                  db.saveUser(currentUser);
                  setActiveView('dashboard');
                } else {
                  handleOpenCheckout('monthly', 15);
                }
              }}
            />
          </div>
        )}

        {/* VIEW: Charity Detail Page */}
        {activeView === 'charity_detail' && selectedCharity && (
          <div className="animate-fade-in">
            <CharityDetailPage
              charity={selectedCharity}
              onBack={() => setActiveView('charities')}
              onDonate={handleOpenDonate}
              onSelectForSubscription={(c) => {
                if (currentUser) {
                  currentUser.selected_charity_id = c.id;
                  db.saveUser(currentUser);
                  setActiveView('dashboard');
                } else {
                  handleOpenCheckout('monthly', 15);
                }
              }}
            />
          </div>
        )}

        {/* VIEW: Draw Mechanics Breakdown */}
        {activeView === 'mechanics' && (
          <div className="animate-fade-in pt-8">
            <DrawMechanicsSection />
          </div>
        )}

        {/* VIEW: Membership & Subscription Pricing */}
        {activeView === 'pricing' && (
          <div className="animate-fade-in pt-8">
            <SubscriptionPlans
              onSubscribe={(plan, pct) => handleOpenCheckout(plan, pct)}
            />
          </div>
        )}

        {/* VIEW: Stableford Score Manager */}
        {activeView === 'scores' && (
          <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                My Stableford Scores
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Enter your handicap golf rounds. Your 5 latest scores automatically form your monthly draw ticket.
              </p>
            </div>
            <ScoreManager />
          </div>
        )}

        {/* VIEW: Subscriber Dashboard */}
        {activeView === 'dashboard' && (
          <div className="animate-fade-in">
            <UserDashboard
              onOpenCheckout={() => handleOpenCheckout('monthly', 15)}
              onExploreCharities={() => setActiveView('charities')}
            />
          </div>
        )}

        {/* VIEW: Administrator Command Console */}
        {activeView === 'admin' && (
          <div className="animate-fade-in">
            <AdminDashboard />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onSelectView={(view) => {
          setActiveView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={handleOpenAuth}
      />

      {/* Auth Modal (Login / Sign-up) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          setActiveView('dashboard');
        }}
      />

      {/* Stripe Checkout Simulation Modal */}
      <StripeCheckoutModal
        isOpen={isCheckoutOpen}
        initialPlan={checkoutPlan}
        initialContributionPct={checkoutContributionPct}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setActiveView('dashboard');
        }}
      />

      {/* Independent Charity Donation Modal (PRD Section 11) */}
      <DonateModal
        isOpen={isDonateModalOpen}
        charity={donateCharity}
        onClose={() => setIsDonateModalOpen(false)}
        onSuccess={() => {
          setIsDonateModalOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
