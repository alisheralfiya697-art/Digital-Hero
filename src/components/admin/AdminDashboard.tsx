import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { DrawEngine } from '../../services/drawEngine';
import { 
  Charity, 
  DrawMappingStrategy, 
  DrawMode, 
  DrawRecord, 
  SimulationResult, 
  UserProfile, 
  WinnerVerificationRecord 
} from '../../types';
import { 
  ShieldAlert, 
  Trophy, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Cpu, 
  Shuffle, 
  Play, 
  Send, 
  HeartHandshake, 
  DollarSign, 
  Database, 
  FileText, 
  Eye, 
  Check, 
  Plus, 
  Edit3,
  Flame,
  CreditCard,
  Copy,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'draws' | 'winners' | 'users' | 'charities' | 'reports' | 'schema'
  >('draws');

  // Draw Management State
  const [drawMonth, setDrawMonth] = useState('October 2026');
  const [drawDate, setDrawDate] = useState('2026-10-31');
  const [drawMode, setDrawMode] = useState<DrawMode>('algorithmic');
  const [mappingStrategy, setMappingStrategy] = useState<DrawMappingStrategy>('direct_scores');
  const [activeSubscribersCount, setActiveSubscribersCount] = useState(5850);
  const [subscriptionFeeDollars, setSubscriptionFeeDollars] = useState(20);
  const [incomingRolloverDollars, setIncomingRolloverDollars] = useState(32960); // from August!

  // Simulation State
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [publishSuccessNotice, setPublishSuccessNotice] = useState<string | null>(null);
  const [adminActionNotice, setAdminActionNotice] = useState<string | null>(null);

  // Winner Review State
  const [selectedWinner, setSelectedWinner] = useState<WinnerVerificationRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Charity Add/Edit State
  const [isEditingCharity, setIsEditingCharity] = useState(false);
  const [charityForm, setCharityForm] = useState<Partial<Charity>>({
    name: '',
    category: 'Veterans & First Responders',
    tagline: '',
    mission: '',
    description: '',
    hero_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    logo_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&auto=format&fit=crop&q=80',
    website_url: 'https://charity.org',
    contact_email: 'contact@charity.org',
    is_featured: false,
    donations_received_cents: 0,
    active_supporters_count: 0,
    upcoming_events: [],
  });

  if (!isAdmin) {
    return (
      <div className="p-12 max-w-xl mx-auto my-12 text-center bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 mt-2">
          Only authorized staff can configure draws, review winner proofs, and execute payouts.
        </p>
        <div className="mt-4 text-xs text-slate-400">
          Switch to the <strong>Marcus Vance (Admin)</strong> persona via the top role switcher to inspect the console.
        </div>
      </div>
    );
  }

  const allUsers = db.getUsers();
  const allDraws = db.getDraws();
  const allWinners = db.getWinners();
  const allCharities = db.getCharities();

  // Run Simulation (PRD Section 8: Admin can run simulation and review results without publishing!)
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setPublishSuccessNotice(null);

    setTimeout(() => {
      // Build active subscribers pool
      const poolEntries = allUsers
        .filter(u => u.subscription.status === 'active')
        .map(u => {
          const userScores = db.getUserScores(u.id);
          const drawNums = DrawEngine.deriveDrawNumbers(userScores, u.id, mappingStrategy);
          return {
            userId: u.id,
            userName: u.full_name,
            userEmail: u.email,
            scores: userScores,
            drawNumbers: drawNums,
          };
        });

      // Calculate prize pool (50% of active subscriptions)
      const basePrizePoolCents = Math.round(activeSubscribersCount * subscriptionFeeDollars * 0.5 * 100);
      const incomingRolloverCents = Math.round(incomingRolloverDollars * 100);

      const sim = DrawEngine.simulateOrRunDraw({
        mode: drawMode,
        mappingStrategy,
        entries: poolEntries,
        prizePoolCents: basePrizePoolCents,
        rolloverIncomingCents: incomingRolloverCents,
      });

      setSimulationResult(sim);
      setIsSimulating(false);
    }, 600);
  };

  // Publish Live Draw (PRD Section 8: Prevent accidental duplicate draw execution, record permanently)
  const handlePublishDraw = () => {
    if (!simulationResult) return;

    const existingDrawForMonth = allDraws.find(d => d.month === drawMonth && d.status === 'published');
    if (existingDrawForMonth) {
      alert(`Error: A draw for ${drawMonth} has already been published! Duplicate draws are rejected.`);
      return;
    }

    const drawCode = `DH-${Date.now()}`;
    const newDrawRecord: DrawRecord = {
      id: `draw-${Date.now()}`,
      draw_code: drawCode,
      title: `${drawMonth} Official Championship Draw`,
      month: drawMonth,
      scheduled_date: drawDate,
      mode: simulationResult.draw_mode,
      mapping_strategy: simulationResult.mapping_strategy,
      status: 'published',
      winning_numbers: simulationResult.winning_numbers,
      total_subscribers_active: activeSubscribersCount,
      base_prize_pool_cents: simulationResult.prize_pool_cents,
      rollover_incoming_cents: simulationResult.rollover_incoming_cents,
      rollover_outgoing_cents: simulationResult.rollover_outgoing_cents,
      tier_5_result: {
        tier: 5,
        percentage_of_pool: 40,
        allocated_pool_cents: Math.floor(simulationResult.prize_pool_cents * 0.4),
        rollover_cents_added: simulationResult.rollover_incoming_cents,
        total_payout_cents: simulationResult.tier_5_winners.length > 0 
          ? (Math.floor(simulationResult.prize_pool_cents * 0.4) + simulationResult.rollover_incoming_cents)
          : 0,
        winners_count: simulationResult.tier_5_winners.length,
        payout_per_winner_cents: simulationResult.tier_5_payout_per_winner_cents,
        winner_ids: simulationResult.tier_5_winners.map(w => w.user_id),
        rolled_over_to_next: simulationResult.tier_5_winners.length === 0,
      },
      tier_4_result: {
        tier: 4,
        percentage_of_pool: 35,
        allocated_pool_cents: Math.floor(simulationResult.prize_pool_cents * 0.35),
        rollover_cents_added: 0,
        total_payout_cents: Math.floor(simulationResult.prize_pool_cents * 0.35),
        winners_count: simulationResult.tier_4_winners.length,
        payout_per_winner_cents: simulationResult.tier_4_payout_per_winner_cents,
        winner_ids: simulationResult.tier_4_winners.map(w => w.user_id),
        rolled_over_to_next: false,
      },
      tier_3_result: {
        tier: 3,
        percentage_of_pool: 25,
        allocated_pool_cents: simulationResult.prize_pool_cents - Math.floor(simulationResult.prize_pool_cents * 0.4) - Math.floor(simulationResult.prize_pool_cents * 0.35),
        rollover_cents_added: 0,
        total_payout_cents: simulationResult.prize_pool_cents - Math.floor(simulationResult.prize_pool_cents * 0.4) - Math.floor(simulationResult.prize_pool_cents * 0.35),
        winners_count: simulationResult.tier_3_winners.length,
        payout_per_winner_cents: simulationResult.tier_3_payout_per_winner_cents,
        winner_ids: simulationResult.tier_3_winners.map(w => w.user_id),
        rolled_over_to_next: false,
      },
      published_at: new Date().toISOString(),
      created_by: currentUser?.full_name || 'Admin',
      notes: `Published via Admin Console. Drawn balls: [${simulationResult.winning_numbers.join(', ')}].`,
    };

    db.saveDraw(newDrawRecord);

    // Create winner verification records for all winning users
    const allWinnersList = [
      ...simulationResult.tier_5_winners.map(w => ({ ...w, tier: 5 as const })),
      ...simulationResult.tier_4_winners.map(w => ({ ...w, tier: 4 as const })),
      ...simulationResult.tier_3_winners.map(w => ({ ...w, tier: 3 as const })),
    ];

    allWinnersList.forEach(w => {
      const winRecord: WinnerVerificationRecord = {
        id: `win-${Date.now()}-${w.user_id}`,
        draw_id: newDrawRecord.id,
        draw_title: newDrawRecord.title,
        draw_month: newDrawRecord.month,
        user_id: w.user_id,
        user_name: w.user_name,
        user_email: 'subscriber@digitalheroes.org',
        match_tier: w.tier,
        matched_numbers: w.matched,
        drawn_numbers: simulationResult.winning_numbers,
        user_entry_numbers: w.matched,
        prize_cents: w.payout_cents,
        status: 'pending', // Starts at Pending
        created_at: new Date().toISOString(),
      };
      db.saveWinner(winRecord);
    });

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}

    setPublishSuccessNotice(`Draw ${drawMonth} published live! Winning balls: [${simulationResult.winning_numbers.join(', ')}]. ${allWinnersList.length} prize tickets generated.`);
    setSimulationResult(null);
  };

  // Winner Proof Verification Actions (PRD Section 12: Admin can View Proof, Approve, Reject, Mark Payout Completed)
  const handleApproveProof = (winnerId: string) => {
    const winner = db.getWinners().find(w => w.id === winnerId);
    if (!winner) return;

    winner.status = 'approved';
    winner.verified_by = currentUser?.full_name || 'Marcus Vance (Admin)';
    winner.verified_at = new Date().toISOString();
    winner.admin_notes = 'Scorecard screenshot verified against GHIN handicap database.';
    db.saveWinner(winner);

    setAdminActionNotice(`Winner ${winner.user_name} approved! Payout ready to disburse.`);
    setTimeout(() => setAdminActionNotice(null), 3000);
  };

  const handleRejectProof = (winnerId: string) => {
    const winner = db.getWinners().find(w => w.id === winnerId);
    if (!winner) return;

    winner.status = 'rejected';
    winner.verified_by = currentUser?.full_name || 'Marcus Vance (Admin)';
    winner.verified_at = new Date().toISOString();
    winner.rejection_reason = rejectionReason.trim() || 'Scorecard date or points did not match round entries.';
    db.saveWinner(winner);

    setAdminActionNotice(`Winner proof for ${winner.user_name} rejected.`);
    setSelectedWinner(null);
    setRejectionReason('');
    setTimeout(() => setAdminActionNotice(null), 3000);
  };

  const handleMarkAsPaid = (winnerId: string) => {
    const winner = db.getWinners().find(w => w.id === winnerId);
    if (!winner) return;

    winner.status = 'paid';
    winner.paid_at = new Date().toISOString();
    winner.paid_tx_reference = `STRIPE_PAYOUT_${Date.now()}`;
    db.saveWinner(winner);

    setAdminActionNotice(`Prize of $${(winner.prize_cents / 100).toFixed(2)} marked as PAID via Stripe transfer.`);
    setTimeout(() => setAdminActionNotice(null), 3000);
  };

  // User Role & Subscription Toggle
  const handleToggleUserStatus = (userId: string) => {
    const user = db.getUserById(userId);
    if (!user) return;
    const current = user.subscription.status;
    user.subscription.status = current === 'active' ? 'inactive' : 'active';
    db.saveUser(user);
    setAdminActionNotice(`Updated ${user.full_name} subscription to ${user.subscription.status}`);
    setTimeout(() => setAdminActionNotice(null), 2500);
  };

  // Charity Save Handler
  const handleSaveCharity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!charityForm.name || !charityForm.tagline) return;

    const newCharity: Charity = {
      id: charityForm.id || `charity-${Date.now()}`,
      name: charityForm.name,
      slug: charityForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: charityForm.category as any,
      tagline: charityForm.tagline,
      mission: charityForm.mission || charityForm.tagline,
      description: charityForm.description || charityForm.tagline,
      logo_url: charityForm.logo_url || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200',
      hero_image_url: charityForm.hero_image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200',
      donations_received_cents: charityForm.donations_received_cents || 0,
      active_supporters_count: charityForm.active_supporters_count || 10,
      is_featured: charityForm.is_featured || false,
      website_url: charityForm.website_url || 'https://charity.org',
      contact_email: charityForm.contact_email || 'info@charity.org',
      upcoming_events: charityForm.upcoming_events || [],
    };

    db.saveCharity(newCharity);
    setIsEditingCharity(false);
    setAdminActionNotice(`Charity "${newCharity.name}" saved successfully!`);
    setTimeout(() => setAdminActionNotice(null), 3000);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-950 border border-purple-800/60 shadow-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white">Administrator Command Console</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/80 text-purple-200 border border-purple-700">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Draw simulation, winner proof audits, subscription management, and Supabase DDL exports.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-2 font-mono">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>PostgreSQL RLS Active</span>
        </div>
      </div>

      {/* Global Admin Alerts */}
      {adminActionNotice && (
        <div className="mb-6 p-4 rounded-xl bg-purple-950/70 border border-purple-800 text-purple-200 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>{adminActionNotice}</span>
        </div>
      )}

      {publishSuccessNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{publishSuccessNotice}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveAdminTab('draws')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
            activeAdminTab === 'draws'
              ? 'bg-purple-900/60 text-white border border-purple-700/80'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Draws & Simulator</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('winners')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap relative ${
            activeAdminTab === 'winners'
              ? 'bg-purple-900/60 text-white border border-purple-700/80'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Winner Proofs & Payouts ({allWinners.filter(w => w.status !== 'paid').length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
            activeAdminTab === 'users'
              ? 'bg-purple-900/60 text-white border border-purple-700/80'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Subscribers & Users ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('charities')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
            activeAdminTab === 'charities'
              ? 'bg-purple-900/60 text-white border border-purple-700/80'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-rose-400" />
          <span>Charity Management ({allCharities.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
            activeAdminTab === 'reports'
              ? 'bg-purple-900/60 text-white border border-purple-700/80'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Reports & Analytics</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('schema')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center space-x-2 whitespace-nowrap ${
            activeAdminTab === 'schema'
              ? 'bg-purple-900/60 text-white border border-purple-700/80'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-slate-400" />
          <span>Supabase SQL DDL</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DRAWS & SIMULATOR (PRD SECTION 8 & 9) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'draws' && (
        <div className="space-y-8">
          {/* Draw Configuration & Parameters */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Monthly Draw Console & Simulator</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure mode, select DrawEngine mapping strategy, test simulation, and publish live draw.
                </p>
              </div>
              <span className="text-xs font-mono text-purple-300 px-2.5 py-1 rounded bg-purple-950 border border-purple-800">
                PRD Sections 8, 9, 10
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Month & Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Draw Month / Label</label>
                <input
                  type="text"
                  value={drawMonth}
                  onChange={(e) => setDrawMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Draw Mode: Random vs Algorithmic */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Draw Mode (PRD Section 8)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDrawMode('random')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border transition ${
                      drawMode === 'random'
                        ? 'bg-indigo-950 text-indigo-200 border-indigo-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Random</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawMode('algorithmic')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 border transition ${
                      drawMode === 'algorithmic'
                        ? 'bg-emerald-950 text-emerald-200 border-emerald-500 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Algorithmic</span>
                  </button>
                </div>
              </div>

              {/* DrawEngine Mapping Strategy (PRD Section 9 Documented Assumption) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Score Mapping Strategy</span>
                  <span className="text-[10px] text-purple-400">Section 9</span>
                </label>
                <select
                  value={mappingStrategy}
                  onChange={(e) => setMappingStrategy(e.target.value as DrawMappingStrategy)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="direct_scores">Direct Scores (1–45) [Default]</option>
                  <option value="sorted_scores">Ascending Ranked Scores</option>
                  <option value="modulo_normalized">Modulo-Normalized 5 Bins</option>
                  <option value="hash_seeded">Hash-Seeded Cryptographic</option>
                </select>
              </div>
            </div>

            {/* Prize Pool Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Active Subscriber Base Count
                </label>
                <input
                  type="number"
                  value={activeSubscribersCount}
                  onChange={(e) => setActiveSubscribersCount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Subscription Fee ($)
                </label>
                <input
                  type="number"
                  value={subscriptionFeeDollars}
                  onChange={(e) => setSubscriptionFeeDollars(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Incoming 5-Match Rollover ($)</span>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </label>
                <input
                  type="number"
                  value={incomingRolloverDollars}
                  onChange={(e) => setIncomingRolloverDollars(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-amber-300"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="py-3 px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-purple-950/50 transition flex items-center space-x-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{isSimulating ? 'Simulating Matches...' : 'Run Simulation Only'}</span>
              </button>

              <span className="text-xs text-slate-400">
                A simulation will NOT publish a live draw. Review results below first.
              </span>
            </div>
          </div>

          {/* Simulation Results Review Card */}
          {simulationResult && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-purple-500/70 shadow-2xl space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                    Simulation Ready for Review
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {drawMonth} Simulation Outcome
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-mono">
                    Mode: {simulationResult.draw_mode.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Winning Numbers Drawn in Simulation */}
              <div className="py-2">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Drawn 5 Balls in Range [1..45]:
                </div>
                <div className="flex items-center space-x-3">
                  {simulationResult.winning_numbers.map((num) => (
                    <div
                      key={num}
                      className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center font-mono shadow-lg shadow-amber-950/60"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier Breakdown Matrix (PRD Section 10: 40% / 35% / 25%) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 5-Match */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-amber-400">5-Match (40% + Rollover)</span>
                    <span className="text-white font-mono">{simulationResult.tier_5_winners.length} Winners</span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    ${(simulationResult.tier_5_payout_per_winner_cents / 100).toFixed(2)}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ winner</span>
                  </div>
                  {simulationResult.tier_5_winners.length === 0 ? (
                    <div className="p-2 rounded-lg bg-amber-950/40 text-amber-300 text-[11px] border border-amber-900/50 flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Zero 5-match hits. Full <strong>${(simulationResult.rollover_outgoing_cents / 100).toFixed(2)}</strong> rolls over!</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 font-semibold">
                      Jackpot won and split evenly!
                    </div>
                  )}
                </div>

                {/* 4-Match */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-rose-400">4-Match (35% Pool)</span>
                    <span className="text-white font-mono">{simulationResult.tier_4_winners.length} Winners</span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    ${(simulationResult.tier_4_payout_per_winner_cents / 100).toFixed(2)}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ winner</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Total pool: ${((simulationResult.prize_pool_cents * 0.35) / 100).toFixed(2)}
                  </div>
                </div>

                {/* 3-Match */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-indigo-400">3-Match (25% Pool)</span>
                    <span className="text-white font-mono">{simulationResult.tier_3_winners.length} Winners</span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    ${(simulationResult.tier_3_payout_per_winner_cents / 100).toFixed(2)}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ winner</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Total pool: ${((simulationResult.prize_pool_cents * 0.25) / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Publish Final Confirmation */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Ready to commit? Publishing assigns prizes to winners and records permanently into database.
                </div>

                <button
                  onClick={handlePublishDraw}
                  className="py-3 px-6 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-950/50 transition flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Official Live Draw</span>
                </button>
              </div>
            </div>
          )}

          {/* Past Draws History Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Permanently Recorded Draws</h4>
            </div>

            <div className="divide-y divide-slate-800">
              {allDraws.map((d) => (
                <div key={d.id} className="p-4 sm:p-5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-sm">{d.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {d.draw_code}
                      </span>
                    </div>
                    <div className="text-slate-400 mt-1 flex items-center space-x-3">
                      <span>Drawn Balls: <strong className="text-amber-400 font-mono">[{d.winning_numbers.join(', ')}]</strong></span>
                      <span>•</span>
                      <span>Mode: {d.mode}</span>
                      <span>•</span>
                      <span>Pool: ${(d.base_prize_pool_cents / 100).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      PUBLISHED
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      {d.published_at?.split('T')[0]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WINNER PROOF & PAYOUT VERIFICATION (PRD SECTION 12) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'winners' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-lg font-bold text-white">Winner Verification & Payout Queue</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              PRD Section 12 mandates: <strong>Pending → Proof uploaded → Admin review → Approved / Rejected → Paid</strong>. 
              Winners upload their golf platform scorecard screenshots. Administrators inspect the proof, verify rounds, and approve payouts.
            </p>
          </div>

          <div className="space-y-4">
            {allWinners.map((win) => {
              const prizeFormatted = (win.prize_cents / 100).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              });

              return (
                <div
                  key={win.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-white">{win.user_name}</span>
                        <span className="text-xs text-slate-400 font-mono">{win.user_email}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {win.match_tier}-Match ({win.draw_month})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Matched Numbers: [{win.matched_numbers.join(', ')}] • Drawn: [{win.drawn_numbers.join(', ')}]
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-emerald-400 font-mono">{prizeFormatted}</div>
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

                  {/* Proof Inspection Box */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-rose-400" />
                        <span>Uploaded Verification File:</span>
                        <strong className="text-white ml-1">
                          {win.proof_file_name || (win.proof_image_url ? 'Scorecard_Screenshot.png' : 'None yet')}
                        </strong>
                      </div>
                      {win.proof_uploaded_at && (
                        <div className="text-[11px] text-slate-400">
                          Submitted: {new Date(win.proof_uploaded_at).toLocaleString()}
                        </div>
                      )}
                      {win.admin_notes && (
                        <div className="text-[11px] text-indigo-300">
                          Admin audit notes: {win.admin_notes}
                        </div>
                      )}
                      {win.rejection_reason && (
                        <div className="text-[11px] text-rose-400">
                          Rejection note: {win.rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* Inspection & Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {win.proof_image_url && (
                        <a
                          href={win.proof_image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Proof</span>
                        </a>
                      )}

                      {win.status === 'proof_uploaded' && (
                        <>
                          <button
                            onClick={() => handleApproveProof(win.id)}
                            className="py-2 px-3.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Proof</span>
                          </button>

                          <button
                            onClick={() => setSelectedWinner(win)}
                            className="py-2 px-3.5 rounded-lg text-xs font-semibold bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 transition flex items-center space-x-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      {win.status === 'approved' && (
                        <button
                          onClick={() => handleMarkAsPaid(win.id)}
                          className="py-2 px-4 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 shadow-md transition flex items-center space-x-1.5"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Disburse Payout (${(win.prize_cents / 100).toFixed(2)})</span>
                        </button>
                      )}

                      {win.status === 'paid' && (
                        <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Disbursed ({win.paid_tx_reference})</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rejection Modal */}
          {selectedWinner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4 text-white">
                <h4 className="text-base font-bold">Reject Winner Verification</h4>
                <p className="text-xs text-slate-300">
                  Provide reason for rejecting {selectedWinner.user_name}'s proof for the {selectedWinner.match_tier}-match prize.
                </p>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Golf round date on scorecard does not match registered date or score is illegible."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setSelectedWinner(null)}
                    className="py-2 px-3 rounded-lg text-xs bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRejectProof(selectedWinner.id)}
                    className="py-2 px-4 rounded-lg text-xs font-bold bg-rose-600 text-white"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USERS & SUBSCRIPTION MANAGEMENT */}
      {/* ========================================================================= */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Registered Users & Subscribers</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit roles, manage Stripe subscription statuses, and inspect score counts.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Subscription</th>
                  <th className="p-4">Charity %</th>
                  <th className="p-4">Scores</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {allUsers.map((u) => {
                  const scores = db.getUserScores(u.id);
                  const charity = db.getCharityById(u.selected_charity_id);

                  return (
                    <tr key={u.id} className="hover:bg-slate-850/40">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.subscription.status === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {u.subscription.status} ({u.subscription.plan})
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-rose-400">{u.charity_contribution_pct}%</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {charity?.name || 'Charity'}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-white">
                        {scores.length} / 5
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className="py-1.5 px-3 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        >
                          Toggle Status
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CHARITY MANAGEMENT (PRD SECTION 11) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'charities' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Charity Partner Registry</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add charities, update impact narratives, toggle featured status, and schedule charity events.
              </p>
            </div>

            <button
              onClick={() => {
                setCharityForm({
                  name: '',
                  category: 'Children & Youth',
                  tagline: '',
                  mission: '',
                  description: '',
                  hero_image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200',
                  logo_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200',
                  website_url: 'https://charity.org',
                  contact_email: 'outreach@charity.org',
                  is_featured: false,
                  donations_received_cents: 0,
                  active_supporters_count: 0,
                  upcoming_events: [],
                });
                setIsEditingCharity(true);
              }}
              className="py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-400 text-slate-950 shadow transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Charity</span>
            </button>
          </div>

          {/* Charity Add/Edit Form */}
          {isEditingCharity && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-rose-500/60 shadow-2xl space-y-4">
              <h4 className="text-base font-bold text-white">
                {charityForm.id ? 'Edit Charity Record' : 'Register New Partner Charity'}
              </h4>

              <form onSubmit={handleSaveCharity} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Charity Name</label>
                    <input
                      type="text"
                      required
                      value={charityForm.name}
                      onChange={(e) => setCharityForm({ ...charityForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                      placeholder="e.g. Greens of Hope"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={charityForm.category}
                      onChange={(e) => setCharityForm({ ...charityForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    >
                      <option value="Veterans & First Responders">Veterans & First Responders</option>
                      <option value="Children & Youth">Children & Youth</option>
                      <option value="Cancer Research">Cancer Research</option>
                      <option value="Mental Health">Mental Health</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    required
                    value={charityForm.tagline}
                    onChange={(e) => setCharityForm({ ...charityForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    placeholder="Short punchy mission summary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mission Statement</label>
                  <textarea
                    rows={2}
                    value={charityForm.mission}
                    onChange={(e) => setCharityForm({ ...charityForm, mission: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={charityForm.is_featured}
                    onChange={(e) => setCharityForm({ ...charityForm, is_featured: e.target.checked })}
                    className="accent-rose-500"
                  />
                  <label htmlFor="featured-check" className="text-xs text-slate-300">
                    Feature prominently on Homepage Spotlight
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCharity(false)}
                    className="py-2 px-4 rounded-xl text-xs bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl text-xs font-bold bg-rose-500 text-slate-950"
                  >
                    Save Charity Record
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Charity List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allCharities.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{c.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {c.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{c.tagline}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                  <span>Donations: ${(c.donations_received_cents / 100).toLocaleString()}</span>
                  <span>Supporters: {c.active_supporters_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: REPORTS & FINANCIAL AUDIT (PRD SECTION 10) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Charity Distributed</span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">$268,400.00</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Prizes Paid to Date</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">$148,250.00</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Rollover Reserve</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">$32,960.00</div>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Active Subscriptions</span>
              <div className="text-2xl font-black text-indigo-400 font-mono mt-1">{activeSubscribersCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SUPABASE SQL & ARCHITECTURE EXPORTER (PRD SECTION 2 & 3) */}
      {/* ========================================================================= */}
      {activeAdminTab === 'schema' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">PostgreSQL & Supabase RLS Schema Export</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Copy and run this DDL directly in your new Supabase project SQL Editor to instantiate all tables, constraints, 5-score triggers, and RLS policies.
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(db.getSupabaseSQLSchema());
                setAdminActionNotice('Copied full Supabase PostgreSQL DDL to clipboard!');
                setTimeout(() => setAdminActionNotice(null), 3000);
              }}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow flex items-center space-x-1.5"
            >
              <Copy className="w-4 h-4" />
              <span>Copy SQL Script</span>
            </button>
          </div>

          <pre className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[500px]">
            {db.getSupabaseSQLSchema()}
          </pre>
        </div>
      )}
    </div>
  );
};
