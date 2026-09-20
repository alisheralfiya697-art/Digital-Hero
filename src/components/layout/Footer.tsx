import React from 'react';
import { HeartHandshake, ShieldCheck, Sparkles, Trophy, Lock } from 'lucide-react';

interface FooterProps {
  setActiveView?: (view: string) => void;
  onSelectView?: (view: string) => void;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView, onSelectView, onOpenAuth }) => {
  const handleNav = (view: string) => {
    if (onSelectView) onSelectView(view);
    else if (setActiveView) setActiveView(view);
  };
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      {/* Top Value Strip */}
      <div className="border-b border-slate-900 bg-slate-900/40 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Guaranteed Charitable Minimum</h4>
              <p className="mt-1 text-slate-400 leading-relaxed text-[12px]">
                Every single membership fee routes a minimum of 10% directly to your chosen vetted charity, with options to voluntarily scale your gift up to 100%.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Algorithmic & Random Rollover Draws</h4>
              <p className="mt-1 text-slate-400 leading-relaxed text-[12px]">
                Transparent monthly prize pools (40% 5-match jackpot with automatic roll-overs, 35% 4-match, 25% 3-match) fully auditable on-chain & in database.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">Verified Winner Workflow</h4>
              <p className="mt-1 text-slate-400 leading-relaxed text-[12px]">
                Only verified players with genuine golf handicap app scorecards receive automated payouts. Zero bot fraud, complete community trust.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                </div>
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">DIGITAL HEROES</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              The modern subscription platform turning recreational golf scores into recurring charitable funding and thrilling monthly prize draws.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stripe 256-Bit Encrypted Payments</span>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Platform</h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-white transition">
                  Platform Overview
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('charities')} className="hover:text-white transition">
                  Vetted Charities Directory
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('mechanics')} className="hover:text-white transition">
                  3/4/5 Match Draw Rules
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('pricing')} className="hover:text-white transition">
                  Monthly & Yearly Membership
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Governance</h5>
            <ul className="space-y-2">
              <li className="text-slate-400">Section 9 Draw Engine Isolated Specification</li>
              <li className="text-slate-400">PostgreSQL Row-Level Security Enforced</li>
              <li className="text-slate-400">Independent Financial Payout Audits</li>
              <li className="text-slate-400">No Personal Database Sharing Policy</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Legal & Ethical Play</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Digital Heroes is a skill-connected performance and charitable sweepstakes platform. Golfers must be 18+ to subscribe. Past performance does not guarantee prize matching. Charitable gifts are designated at checkout.
            </p>
            <div className="mt-3 text-[11px] text-slate-500">
              © {new Date().getFullYear()} Digital Heroes Level 1. Built strictly to specification.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
