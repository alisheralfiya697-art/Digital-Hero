import React, { useState } from 'react';
import { PlanInterval } from '../../types';
import { STRIPE_PLANS } from '../../services/stripe';
import { Check, Sparkles, HeartHandshake, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface SubscriptionPlansProps {
  onSubscribe: (plan: PlanInterval, contributionPct: number) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onSubscribe }) => {
  const [billingCycle, setBillingCycle] = useState<PlanInterval>('monthly');
  const [contributionPct, setContributionPct] = useState<number>(15);

  const monthlyConfig = STRIPE_PLANS.monthly;
  const yearlyConfig = STRIPE_PLANS.yearly;

  return (
    <section className="py-16 sm:py-24 border-b border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Membership Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Simple, Transparent Subscription
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Every subscription includes handicap-level score tracking, guaranteed minimum 10% charity distribution, 
            and automatic entry into every monthly prize draw.
          </p>

          {/* Monthly / Yearly Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 mt-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition ${
                billingCycle === 'monthly'
                  ? 'bg-rose-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition relative ${
                billingCycle === 'yearly'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly (Save 17%)
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-900 text-amber-300">
                2 Mo Free
              </span>
            </button>
          </div>
        </div>

        {/* Dynamic Charity Contribution Slider Widget */}
        <div className="max-w-xl mx-auto p-5 rounded-2xl bg-slate-900 border border-slate-800 mb-10 shadow-lg">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-200 font-semibold flex items-center">
              <HeartHandshake className="w-4 h-4 text-rose-400 mr-1.5" />
              Adjust Your Monthly Charity Contribution:
            </span>
            <span className="text-rose-400 font-bold font-mono text-sm">{contributionPct}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={contributionPct}
            onChange={(e) => setContributionPct(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>10% (PRD Baseline)</span>
            <span>25% (Community Partner)</span>
            <span>50% (Grand Patron)</span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className={`rounded-3xl p-8 transition relative flex flex-col justify-between ${
            billingCycle === 'monthly'
              ? 'bg-slate-900 border-2 border-rose-500/80 shadow-2xl shadow-rose-950/40'
              : 'bg-slate-900/60 border border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  {monthlyConfig.name}
                </span>
                <span className="text-xs text-slate-400">Recurring Monthly</span>
              </div>

              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-black text-white">$20</span>
                <span className="text-slate-400 text-sm ml-2 font-medium">/ month</span>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {monthlyConfig.description}
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-300">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Automatic entry into every monthly draw</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Stores latest 5 Stableford scores with auto-eviction</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{(20 * contributionPct / 100).toFixed(2)}/mo routed straight to your charity</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Cancel or modify anytime via Stripe portal</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => onSubscribe('monthly', contributionPct)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-lg shadow-rose-950/50 transition flex items-center justify-center space-x-2"
              >
                <span>Select Monthly Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Yearly Plan */}
          <div className={`rounded-3xl p-8 transition relative flex flex-col justify-between ${
            billingCycle === 'yearly'
              ? 'bg-slate-900 border-2 border-amber-500/80 shadow-2xl shadow-amber-950/40'
              : 'bg-slate-900/60 border border-slate-800'
          }`}>
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-lg">
              Most Popular • Save $40
            </span>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {yearlyConfig.name}
                </span>
                <span className="text-xs text-amber-300 font-mono">Billed Annually</span>
              </div>

              <div className="mt-4 flex items-baseline">
                <span className="text-5xl font-black text-white">$200</span>
                <span className="text-slate-400 text-sm ml-2 font-medium">/ year</span>
                <span className="text-emerald-400 text-xs ml-3 font-semibold">($16.66/mo)</span>
              </div>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {yearlyConfig.description}
              </p>

              <div className="mt-6 space-y-3 text-xs text-slate-300">
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>12 uninterrupted monthly draw participations</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{(200 * contributionPct / 100).toFixed(2)}/yr total impact to designated charity</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>VIP invitations to partner charity golf scramble days</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Priority winner scorecard verification queue</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => onSubscribe('yearly', contributionPct)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:opacity-95 text-slate-950 shadow-lg shadow-amber-950/50 transition flex items-center justify-center space-x-2"
              >
                <span>Select Annual Champion</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
