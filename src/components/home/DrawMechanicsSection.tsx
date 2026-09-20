import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  HelpCircle, 
  Check, 
  Shuffle, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';

export const DrawMechanicsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tiers' | 'modes' | 'engine'>('tiers');

  return (
    <section className="py-16 sm:py-24 border-b border-slate-800 bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Provably Fair Gaming Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How The Monthly Draw Works
          </h2>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            Your 5 latest Stableford scores convert into official draw entries each month. 
            Fixed portions fund the prize pool, charities, and rollover jackpots.
          </p>

          {/* Switcher Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 mt-6">
            <button
              onClick={() => setActiveTab('tiers')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'tiers'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Prize Tiers (40/35/25%)
            </button>
            <button
              onClick={() => setActiveTab('modes')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'modes'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Random vs Algorithmic
            </button>
            <button
              onClick={() => setActiveTab('engine')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'engine'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. DrawEngine Specification
            </button>
          </div>
        </div>

        {/* Tab 1: Prize Tiers */}
        {activeTab === 'tiers' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 5-Match Tier */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border-2 border-amber-500/60 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl flex items-center space-x-1">
                <Flame className="w-3 h-3" />
                <span>Rollover Jackpot</span>
              </div>

              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-4 font-mono">
                  5/5
                </div>
                <h3 className="text-xl font-bold text-white">5-Number Match</h3>
                <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">40% of Pool</div>
                
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Match all five numbers in the monthly draw. If nobody wins this tier, 
                  <strong> 100% of this 40% allocation automatically rolls over to the next month's jackpot</strong>.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-amber-300/90 font-mono">
                  Current Oct Jackpot: $32,960.00
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                Split equally in integer cents among all 5-ball winners.
              </div>
            </div>

            {/* 4-Match Tier */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg mb-4 font-mono">
                  4/5
                </div>
                <h3 className="text-xl font-bold text-white">4-Number Match</h3>
                <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1">35% of Pool</div>
                
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Match four of the five winning numbers. No rollover rule — if multiple players match 4 numbers, 
                  the 35% tier allocation is distributed evenly among them in certified cash payouts.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-rose-300/90 font-mono">
                  Avg Payout: $1,200 – $4,500
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                August Draw: 4 winners won $4,585.00 each.
              </div>
            </div>

            {/* 3-Match Tier */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg mb-4 font-mono">
                  3/5
                </div>
                <h3 className="text-xl font-bold text-white">3-Number Match</h3>
                <div className="text-2xl font-extrabold text-indigo-400 font-mono mt-1">25% of Pool</div>
                
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Match three of the five winning numbers. High probability tier providing frequent returns 
                  to community players and keeping excitement high every month.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-indigo-300/90 font-mono">
                  August Draw: 42 winners won $311.90 each
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                No rollover; split equally among all 3-ball matches.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Random vs Algorithmic Modes */}
        {activeTab === 'modes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Shuffle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Random Mode</h3>
                  <p className="text-xs text-slate-400">Standard Lottery Uniform Selection</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizes a uniform pseudo-random number generator (Fisher-Yates distribution) across balls 1 through 45. 
                Every single integer has an exact 1/45 independent probability of being selected on the first draw.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="text-slate-400 font-semibold">Mode Characteristics:</div>
                <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                  <li>Uniform distribution across all 45 balls</li>
                  <li>Independent of golfer round frequency</li>
                  <li>Classical lottery model transparency</li>
                </ul>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Algorithmic Mode (Score-Weighted)</h3>
                  <p className="text-xs text-slate-400">Weighted by Active Score Frequency</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Calculates the actual frequency of each score (1–45) submitted by active subscribers. 
                Balls are sampled without replacement weighted proportionally to subscriber score occurrences, 
                rewarding common golf performance clusters.
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="text-slate-400 font-semibold">Mode Characteristics:</div>
                <ul className="space-y-1 text-slate-300 list-disc list-inside text-[11px]">
                  <li>Dynamic weight matrix built from active user cards</li>
                  <li>Higher match probability for prevalent Stableford scores (e.g. 32–40)</li>
                  <li>Admin selectable in Draw Console before monthly simulation</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: PRD Section 9 DrawEngine Specification */}
        {activeTab === 'engine' && (
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Isolated DrawEngine & Conversion Documentation (Section 9)
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  As mandated by Section 9 of the Digital Heroes PRD, the conversion between a player's 5 Stableford scores 
                  and their 5 official draw balls is isolated within the <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded">DrawEngine</code> module.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-purple-300">Direct Score Mapping (Default)</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Directly takes the user's 5 stored Stableford scores (e.g. 38, 41, 35, 39, 32) as their 5 draw numbers. 
                  Duplicate scores on different dates are filled with deterministic hash offsets.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-purple-300">Sorted Score Sequence</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Orders the 5 scores in ascending numerical sequence [32, 35, 38, 39, 41] for optical alignment with the ascending drawn winning balls.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-purple-300">Modulo-Normalized Bins</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Maps scores across five 9-unit bins [1..9, 10..18, 19..27, 28..36, 37..45] ensuring broad numerical coverage across the entire ball pool.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
              <strong>Admin Configurable:</strong> Administrators can switch between these strategies on the Admin Console at any time without recompilation or database schema changes.
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
