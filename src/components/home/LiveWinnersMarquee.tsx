import React from 'react';
import { db } from '../../services/db';
import { Trophy, CheckCircle2, HeartHandshake, ShieldCheck } from 'lucide-react';

export const LiveWinnersMarquee: React.FC = () => {
  const winners = db.getWinners();

  return (
    <section className="py-12 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/80 mb-6 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Verified Recent Winners & Payouts
            </h3>
          </div>
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scorecard screenshot proof required before disbursement</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {winners.map((win) => {
            const formattedPrize = (win.prize_cents / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            });

            return (
              <div
                key={win.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                    win.match_tier === 5
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : win.match_tier === 4
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  }`}>
                    <Trophy className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">{win.user_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {win.match_tier}-Match
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                      <span>Matched balls:</span>
                      <span className="font-mono text-amber-300 font-semibold">
                        [{win.matched_numbers.join(', ')}]
                      </span>
                      <span>•</span>
                      <span>{win.draw_month}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-emerald-400 font-mono">
                    {formattedPrize}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-end space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="capitalize">{win.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
