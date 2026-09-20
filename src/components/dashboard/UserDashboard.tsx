import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { stripeService } from '../../services/stripe';
import { DrawEngine } from '../../services/drawEngine';
import { WinnerVerificationRecord } from '../../types';
import { ScoreManager } from '../scores/ScoreManager';
import { 
  User, 
  Target, 
  Trophy, 
  HeartHandshake, 
  CreditCard, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Calendar,
  ExternalLink,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface UserDashboardProps {
  onOpenCheckout: () => void;
  onExploreCharities: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenCheckout,
  onExploreCharities,
}) => {
  const { currentUser, isActiveSubscriber, updateCurrentUser, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'draws' | 'winnings' | 'settings'>('overview');

  // Winner proof upload state
  const [uploadingWinnerId, setUploadingWinnerId] = useState<string | null>(null);
  const [proofFilePreview, setProofFilePreview] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  if (!currentUser) return null;

  const charities = db.getCharities();
  const userCharity = charities.find(c => c.id === currentUser.selected_charity_id) || charities[0];
  const userScores = db.getUserScores(currentUser.id);
  const userWinners = db.getUserWinners(currentUser.id);
  const latestDraw = db.getLatestPublishedDraw();

  const userEntryBalls = DrawEngine.deriveDrawNumbers(userScores, currentUser.id, 'direct_scores');
  
  // Calculate match against latest published draw if available
  const matchesInLatest = latestDraw
    ? DrawEngine.evaluateMatch(userEntryBalls, latestDraw.winning_numbers)
    : [];

  const handleCharityChange = (charityId: string) => {
    updateCurrentUser({ selected_charity_id: charityId });
  };

  const handlePercentageChange = (pct: number) => {
    const validPct = Math.max(10, pct);
    updateCurrentUser({ charity_contribution_pct: validPct });
  };

  const handleCancelSubscription = () => {
    if (confirm('Cancel your recurring subscription? Your entry will remain valid until the end of the current billing period.')) {
      stripeService.cancelSubscription(currentUser);
      refreshUser();
    }
  };

  // Mock File Upload for Winner Proof (PRD Section 12: winner proof screenshot of golf platform scores)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, winnerId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingWinnerId(winnerId);
    setProofFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProofFilePreview(dataUrl);

      // Save to database record
      const winners = db.getWinners();
      const target = winners.find(w => w.id === winnerId);
      if (target) {
        target.status = 'proof_uploaded';
        target.proof_image_url = dataUrl;
        target.proof_file_name = file.name;
        target.proof_uploaded_at = new Date().toISOString();
        db.saveWinner(target);

        setUploadSuccessNotice(`Scorecard proof "${file.name}" uploaded successfully! Status changed to Under Admin Review.`);
        setTimeout(() => setUploadSuccessNotice(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Welcome Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 p-0.5 shadow-xl">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <User className="w-8 h-8 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white">{currentUser.full_name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isActiveSubscriber
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {currentUser.subscription.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span>Handicap: <strong>{currentUser.handicap || 14.2}</strong></span>
              <span>•</span>
              <span className="text-rose-300 font-semibold">{userCharity?.name}</span>
            </div>
          </div>
        </div>

        {/* Subscription Quick Status */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {!isActiveSubscriber ? (
            <button
              onClick={onOpenCheckout}
              className="w-full md:w-auto px-5 py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/50 transition flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Activate Membership ($20/mo)</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Plan Cadence</div>
              <div className="text-sm font-bold text-white capitalize">
                {currentUser.subscription.plan} (${currentUser.subscription.amount_cents / 100})
              </div>
              <div className="text-[10px] text-emerald-400">
                {currentUser.charity_contribution_pct}% to {userCharity?.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Overview & Tickets</span>
        </button>

        <button
          onClick={() => setActiveTab('scores')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'scores'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-400" />
          <span>My Stableford Scores ({userScores.length}/5)</span>
        </button>

        <button
          onClick={() => setActiveTab('draws')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'draws'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-indigo-400" />
          <span>Draw Participation</span>
        </button>

        <button
          onClick={() => setActiveTab('winnings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap relative ${
            activeTab === 'winnings'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          <span>My Winnings & Proof</span>
          {userWinners.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span>Charity & Subscription</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Active Entry Ticket Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">
                  Current Active Entry Ticket
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">October 2026 Monthly Draw</h3>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Draw Date: 31 Oct 2026</span>
              </div>
            </div>

            {/* Ball Numbers */}
            <div className="py-6">
              <div className="text-xs text-slate-400 mb-3">
                Your 5 numbers (derived from your 5 Stableford scores via Section 9 DrawEngine):
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {userEntryBalls.map((ball, i) => (
                  <div
                    key={i}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-xl flex items-center justify-center font-mono shadow-lg shadow-amber-950/50"
                  >
                    {ball}
                  </div>
                ))}
              </div>
            </div>

            {/* Scorecard connection strip */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
              <div>
                Source rounds: {userScores.map(s => `${s.score}pts (${s.date})`).join(' • ')}
              </div>
              <button
                onClick={() => setActiveTab('scores')}
                className="text-rose-400 hover:underline font-semibold"
              >
                Update My Scores →
              </button>
            </div>
          </div>

          {/* Impact & Rollover Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                My Total Charity Giving
              </span>
              <div className="text-3xl font-black text-white font-mono mt-2">
                ${((currentUser.subscription.amount_cents * (currentUser.charity_contribution_pct / 100) * 6) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Routed to <strong>{userCharity?.name}</strong> at {currentUser.charity_contribution_pct}% contribution rate.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Oct 5-Match Rollover Jackpot
              </span>
              <div className="text-3xl font-black text-amber-400 font-mono mt-2">
                $32,960.00
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Carried over from August draw. 40% of draw pool rolls over whenever 5-match is hitless.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Total Winnings Won
              </span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-2">
                ${(userWinners.reduce((sum, w) => sum + w.prize_cents, 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {userWinners.length} winning match tier recorded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Scores */}
      {activeTab === 'scores' && (
        <ScoreManager onScoreUpdated={() => refreshUser()} />
      )}

      {/* Tab 3: Draw Participation */}
      {activeTab === 'draws' && (
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Past Draw Participation & Performance</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Compare your official 5-ball entry against published monthly lottery results. 
              Matching 3, 4, or 5 numbers qualifies you for guaranteed prize disbursements.
            </p>

            {latestDraw && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-white">{latestDraw.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      PUBLISHED
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{latestDraw.month}</span>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-2">Winning Numbers Drawn:</div>
                  <div className="flex items-center space-x-2">
                    {latestDraw.winning_numbers.map((num) => (
                      <span
                        key={num}
                        className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center font-mono shadow"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-slate-400 mb-2">Your Entry Numbers:</div>
                  <div className="flex items-center space-x-2">
                    {userEntryBalls.map((ball) => {
                      const isMatch = latestDraw.winning_numbers.includes(ball);
                      return (
                        <span
                          key={ball}
                          className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center font-mono border ${
                            isMatch
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md ring-2 ring-emerald-400/50'
                              : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          {ball}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Matches Found: <strong className="text-emerald-400">{matchesInLatest.length} Numbers</strong>
                  </span>
                  <span className="text-slate-400 font-mono">
                    Mode: {latestDraw.mode.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Winnings & Winner Proof Verification (PRD Section 12) */}
      {activeTab === 'winnings' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Winner Verification Workflow</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Strict PRD Section 12 requirement: To safeguard integrity, prize disbursements follow:
                  <strong className="text-rose-300"> Pending → Proof Uploaded → Admin Review → Approved / Rejected → Paid</strong>.
                  Upload a screenshot of your golf app (GHIN, GolfShot, etc.) confirming your scores.
                </p>
              </div>
            </div>

            {uploadSuccessNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{uploadSuccessNotice}</span>
              </div>
            )}

            {userWinners.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                No prize claims recorded yet. Keep entering scores to qualify for upcoming draws!
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {userWinners.map((win) => {
                  const prizeDollars = (win.prize_cents / 100).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  });

                  return (
                    <div
                      key={win.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-base font-bold text-white">{win.draw_title}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {win.match_tier}-Match Winner
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Matched numbers: [{win.matched_numbers.join(', ')}] • Drawn: [{win.drawn_numbers.join(', ')}]
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-400 font-mono">{prizeDollars}</div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            win.status === 'paid'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : win.status === 'approved'
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                              : win.status === 'proof_uploaded'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            Status: {win.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Workflow Progress Bar */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-medium pt-1">
                        <div className={`p-2 rounded-lg ${
                          win.status !== 'pending' ? 'bg-emerald-950/60 text-emerald-300' : 'bg-slate-900 text-slate-400'
                        }`}>
                          1. Draw Won
                        </div>
                        <div className={`p-2 rounded-lg ${
                          win.proof_image_url ? 'bg-emerald-950/60 text-emerald-300' : 'bg-slate-900 text-slate-400'
                        }`}>
                          2. Proof Uploaded
                        </div>
                        <div className={`p-2 rounded-lg ${
                          win.status === 'approved' || win.status === 'paid' ? 'bg-emerald-950/60 text-emerald-300' : 'bg-slate-900 text-slate-400'
                        }`}>
                          3. Admin Approved
                        </div>
                        <div className={`p-2 rounded-lg ${
                          win.status === 'paid' ? 'bg-emerald-950/60 text-emerald-300' : 'bg-slate-900 text-slate-400'
                        }`}>
                          4. Payout Disbursed
                        </div>
                      </div>

                      {/* Proof Uploader / Status Action */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        {win.status === 'pending' && (
                          <div>
                            <div className="text-xs font-semibold text-white mb-2 flex items-center space-x-1.5">
                              <UploadCloud className="w-4 h-4 text-rose-400" />
                              <span>Upload Scorecard Screenshot (GHIN, GolfShot, or Paper Card)</span>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, win.id)}
                              className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-500 file:text-slate-950 hover:file:bg-rose-400 cursor-pointer"
                            />
                          </div>
                        )}

                        {win.status === 'proof_uploaded' && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2 text-slate-300">
                              <Clock className="w-4 h-4 text-amber-400" />
                              <span>Verification proof submitted: <strong>{win.proof_file_name || 'Scorecard.png'}</strong>. Awaiting Admin Review.</span>
                            </div>
                            {win.proof_image_url && (
                              <a
                                href={win.proof_image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-rose-400 hover:underline flex items-center space-x-1"
                              >
                                <span>Preview Upload</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {win.status === 'approved' && (
                          <div className="text-xs text-emerald-300 flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Proof verified by Admin! Payout queued for Stripe transfer.</span>
                          </div>
                        )}

                        {win.status === 'paid' && (
                          <div className="flex items-center justify-between text-xs text-emerald-300">
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Prize payout completed via Stripe! Ref: {win.paid_tx_reference || 'TRX-10928'}</span>
                            </div>
                            <span className="text-slate-400 font-mono text-[10px]">
                              Paid at: {win.paid_at?.split('T')[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Charity & Subscription Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Charity Settings */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center">
              <HeartHandshake className="w-4 h-4 text-rose-400 mr-2" />
              <span>Charity Settings</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Selected Beneficiary Charity
              </label>
              <select
                value={currentUser.selected_charity_id}
                onChange={(e) => handleCharityChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">Charity Contribution Percentage</span>
                <span className="text-rose-400 font-bold font-mono text-sm">
                  {currentUser.charity_contribution_pct}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={currentUser.charity_contribution_pct}
                onChange={(e) => handlePercentageChange(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>10% (Required Minimum)</span>
                <span>35%</span>
                <span>60%</span>
              </div>
            </div>

            <button
              onClick={onExploreCharities}
              className="text-xs text-rose-400 hover:underline font-semibold"
            >
              Browse complete charity profiles →
            </button>
          </div>

          {/* Subscription Settings */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center">
              <CreditCard className="w-4 h-4 text-indigo-400 mr-2" />
              <span>Stripe Subscription Billing</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold text-emerald-400 capitalize">{currentUser.subscription.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billing Plan:</span>
                <span className="font-bold text-white capitalize">{currentUser.subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subscription Fee:</span>
                <span className="font-mono text-white">${currentUser.subscription.amount_cents / 100}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Period End:</span>
                <span className="font-mono text-slate-300">
                  {currentUser.subscription.current_period_end?.split('T')[0]}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={onOpenCheckout}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Change Plan / Update Payment Method
              </button>

              {currentUser.subscription.status === 'active' && (
                <button
                  onClick={handleCancelSubscription}
                  className="py-2.5 px-4 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition"
                >
                  Cancel Subscription at Period End
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
