import React from 'react';
import { 
  HeartHandshake, 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

interface HeroSectionProps {
  onJoin: () => void;
  onExploreCharities: () => void;
  onViewMechanics: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onJoin,
  onExploreCharities,
  onViewMechanics,
}) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-32 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Mission & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-300 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>Next Draw Date: October 31, 2026</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-bold">$32,960 Jackpot Rollover</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Where Every Round{' '}
              <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
                Powers Real Change.
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              Digital Heroes connects your Stableford golf rounds directly to vetted charitable causes. 
              Enjoy monthly draws, transparent prize pools, and verified payouts — turning your athletic dedication into recurring life-changing support.
            </p>

            {/* Value Checkpoints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>10%–50%+ goes directly to your chosen charity</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Automatic 5-number match rollover jackpots</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Latest 5 Stableford scores automatically mapped</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Full winner scorecard verification via storage</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                id="hero-cta-join-btn"
                onClick={onJoin}
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 hover:opacity-95 text-slate-950 shadow-xl shadow-rose-950/60 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-2"
              >
                <span>Start Subscription ($20/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-cta-charities-btn"
                onClick={onExploreCharities}
                className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition flex items-center space-x-2"
              >
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <span>Explore Charities</span>
              </button>

              <button
                id="hero-cta-mechanics-btn"
                onClick={onViewMechanics}
                className="px-4 py-3.5 text-xs text-slate-400 hover:text-white transition underline underline-offset-4"
              >
                How Draws Work
              </button>
            </div>
          </div>

          {/* Right Column: Live Draw Telemetry & Rollover Jackpot Board */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-700 p-6 sm:p-7 shadow-2xl shadow-slate-950/80">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Live Pool Telemetry</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  OCT-2026 DRAW
                </span>
              </div>

              {/* Huge Rollover Display */}
              <div className="py-6 text-center">
                <div className="text-xs font-semibold uppercase tracking-widest text-amber-400/90 mb-1 flex items-center justify-center space-x-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>5-Match Rollover Jackpot</span>
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                  $32,960<span className="text-amber-400">.00</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Unclaimed in August draw • Guaranteed full rollover to October
                </p>
              </div>

              {/* Prize Pool Breakdown Bar */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Prize Distribution Tiers</span>
                  <span className="text-slate-400">100% of draw pool</span>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-amber-400 w-[40%]" title="5-Match: 40% + Rollover" />
                  <div className="h-full bg-rose-500 w-[35%]" title="4-Match: 35%" />
                  <div className="h-full bg-indigo-500 w-[25%]" title="3-Match: 25%" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-amber-300 block">5-Match</span>
                    <span className="text-slate-400">40% + Rollover</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-rose-300 block">4-Match</span>
                    <span className="text-slate-400">35% Shared</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-indigo-300 block">3-Match</span>
                    <span className="text-slate-400">25% Shared</span>
                  </div>
                </div>
              </div>

              {/* Real-time Charity Counter */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-400">Total Charity Donated:</span>
                </div>
                <span className="font-bold text-rose-300 font-mono text-sm">$268,400</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
