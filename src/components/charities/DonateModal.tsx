import React, { useState } from 'react';
import { Charity } from '../../types';
import { db } from '../../services/db';
import { X, HeartHandshake, Check, Sparkles, CreditCard, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DonateModalProps {
  charity: Charity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({
  charity,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [amountDollars, setAmountDollars] = useState<number>(50);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen || !charity) return null;

  const presets = [25, 50, 100, 250];

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountDollars || amountDollars <= 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Record independent donation in database (PRD Section 11: independent donations separate from draw participation)
      db.recordIndependentDonation({
        donor_name: donorName.trim() || 'Anonymous Patron',
        donor_email: donorEmail.trim() || 'anonymous@donor.org',
        charity_id: charity.id,
        charity_name: charity.name,
        amount_cents: Math.round(amountDollars * 100),
        message: message.trim() || undefined,
      });

      setIsSubmitting(false);
      setIsComplete(true);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#f59e0b'],
        });
      } catch {}

      setTimeout(() => {
        setIsComplete(false);
        onSuccess?.();
        onClose();
      }, 1600);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isComplete ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Thank You for Your Generosity!</h3>
            <p className="text-xs text-slate-300">
              Your direct donation of <strong>${amountDollars}.00</strong> has been allocated to{' '}
              <strong>{charity.name}</strong>.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Independent Charity Gift</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Direct Gift to {charity.name}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              100% of this one-off gift flows directly to the organization, separate from monthly draw participation.
            </p>

            <form onSubmit={handleDonate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Donation Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmountDollars(preset)}
                      className={`py-2 rounded-xl text-xs font-bold font-mono transition border ${
                        amountDollars === preset
                          ? 'bg-rose-500 text-slate-950 border-rose-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    min="5"
                    step="1"
                    value={amountDollars}
                    onChange={(e) => setAmountDollars(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                    placeholder="Custom amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="e.g. Arnold Palmer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email for Receipt</label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Donor Note of Support</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Keep doing heroic work!"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || amountDollars <= 0}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-500 to-rose-600 hover:opacity-95 text-slate-950 shadow-lg shadow-rose-950/50 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Complete Direct Donation (${amountDollars})</span>
              </button>

              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center space-x-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Encrypted 256-bit Stripe direct non-profit transfer</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
