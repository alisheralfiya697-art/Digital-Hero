import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { stripeService, STRIPE_PLANS } from '../../services/stripe';
import { PlanInterval } from '../../types';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  HeartHandshake, 
  Trophy, 
  Check, 
  Lock, 
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: PlanInterval;
  initialPlan?: PlanInterval;
  initialContributionPct?: number;
  onSuccess?: () => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'monthly',
  initialPlan,
  initialContributionPct = 15,
  onSuccess,
}) => {
  const { currentUser, refreshUser } = useAuth();
  const charities = db.getCharities();

  const [selectedPlan, setSelectedPlan] = useState<PlanInterval>(initialPlan || defaultPlan);
  const [selectedCharityId, setSelectedCharityId] = useState<string>(
    currentUser?.selected_charity_id || charities[0]?.id || 'charity-1'
  );
  const [contributionPct, setContributionPct] = useState<number>(
    initialContributionPct || currentUser?.charity_contribution_pct || 15
  );

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  if (!isOpen) return null;

  const planConfig = STRIPE_PLANS[selectedPlan];
  const totalCostDollars = planConfig.priceCents / 100;
  
  // Real-time distribution breakdown
  const charityAmountDollars = (totalCostDollars * (contributionPct / 100)).toFixed(2);
  const prizePoolPortionDollars = (totalCostDollars * 0.5).toFixed(2); // 50% fixed portion to prize pool
  const platformOpsDollars = (
    totalCostDollars - Number(charityAmountDollars) - Number(prizePoolPortionDollars)
  ).toFixed(2);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsProcessing(true);

    try {
      // Simulate realistic Stripe API session creation
      await stripeService.createCheckoutSession({
        userId: currentUser.id,
        plan: selectedPlan,
        charityId: selectedCharityId,
        charityContributionPct: contributionPct,
      });

      // Simulate webhook processor receiving `customer.subscription.created` & `invoice.payment_succeeded`
      stripeService.activateSubscription(currentUser, selectedPlan, selectedCharityId, contributionPct);
      refreshUser();

      setIsProcessing(false);
      setCheckoutSuccess(true);

      // Trigger celebratory confetti for new membership
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#fbbf24', '#10b981', '#6366f1'],
        });
      } catch {
        // Confetti fallback
      }

      setTimeout(() => {
        setCheckoutSuccess(false);
        onSuccess?.();
        onClose();
      }, 1500);
    } catch {
      setIsProcessing(false);
    }
  };

  const selectedCharity = charities.find(c => c.id === selectedCharityId) || charities[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="checkout-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {checkoutSuccess ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-950/40">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Subscription Active!</h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your golf rounds are now officially connected to <strong>{selectedCharity?.name}</strong> and eligible for all upcoming monthly draws.
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stripe Webhook Synchronized</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Stripe Secure Subscription</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Elevate Your Game • Fund Real Impact
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Select your membership cadence and fine-tune your monthly contribution to vetted charitable causes.
            </p>

            <form onSubmit={handleCheckout} className="space-y-6">
              {/* Plan Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`cursor-pointer p-4 rounded-xl border transition relative ${
                    selectedPlan === 'monthly'
                      ? 'bg-rose-950/30 border-rose-500/80 shadow-md shadow-rose-950/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === 'monthly' ? 'border-rose-500 bg-rose-500' : 'border-slate-600'
                    }`}>
                      {selectedPlan === 'monthly' && <Check className="w-2.5 h-2.5 text-slate-950" />}
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">$20<span className="text-xs font-normal text-slate-400">/mo</span></div>
                  <div className="text-[11px] text-slate-400 mt-1">Flexible, cancel anytime</div>
                </div>

                <div
                  onClick={() => setSelectedPlan('yearly')}
                  className={`cursor-pointer p-4 rounded-xl border transition relative ${
                    selectedPlan === 'yearly'
                      ? 'bg-amber-950/30 border-amber-500/80 shadow-md shadow-amber-950/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shadow">
                    Save 17% (2 Free Mos)
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Annual</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPlan === 'yearly' ? 'border-amber-500 bg-amber-500' : 'border-slate-600'
                    }`}>
                      {selectedPlan === 'yearly' && <Check className="w-2.5 h-2.5 text-slate-950" />}
                    </div>
                  </div>
                  <div className="mt-2 text-2xl font-extrabold text-white">$200<span className="text-xs font-normal text-slate-400">/yr</span></div>
                  <div className="text-[11px] text-amber-300/90 mt-1">12 full draw entries</div>
                </div>
              </div>

              {/* Charity Selection & Percentage Slider */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center">
                      <HeartHandshake className="w-4 h-4 text-rose-400 mr-1.5" />
                      Designate Beneficiary Charity
                    </span>
                    <span className="text-[10px] text-slate-400">100% Verified Non-Profit</span>
                  </label>
                  <select
                    id="checkout-charity-select"
                    value={selectedCharityId}
                    onChange={(e) => setSelectedCharityId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 transition"
                  >
                    {charities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} • {c.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">Your Monthly Charity Allocation:</span>
                    <span className="text-rose-400 font-bold font-mono text-sm">{contributionPct}%</span>
                  </div>
                  <input
                    id="checkout-contribution-slider"
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={contributionPct}
                    onChange={(e) => setContributionPct(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>10% (PRD Baseline)</span>
                    <span>25% (Supporter)</span>
                    <span>50%+ (Hero)</span>
                  </div>
                </div>

                {/* Real-time breakdown card */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/30">
                    <div className="text-[10px] text-rose-300">To Charity ({contributionPct}%)</div>
                    <div className="text-sm font-bold text-rose-400 font-mono">${charityAmountDollars}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/30">
                    <div className="text-[10px] text-amber-300">To Prize Pool (50%)</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">${prizePoolPortionDollars}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Platform Ops</div>
                    <div className="text-sm font-bold text-slate-300 font-mono">${platformOpsDollars}</div>
                  </div>
                </div>
              </div>

              {/* Mock Stripe Payment Card Elements */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300 flex items-center">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                    Payment Details (Stripe Test Environment)
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    PCI-DSS Level 1
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="Card Number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="MM / YY"
                  />
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="CVC"
                  />
                </div>
              </div>

              <button
                id="checkout-confirm-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:opacity-95 text-slate-950 shadow-xl shadow-rose-950/50 transition transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <span>Contacting Stripe Webhook API...</span>
                ) : (
                  <>
                    <span>Confirm Subscription (${totalCostDollars}.00 / {planConfig.intervalDisplay})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
