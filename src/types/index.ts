export type UserRole = 'public_visitor' | 'subscriber' | 'admin';

export type SubscriptionStatus = 'inactive' | 'active' | 'past_due' | 'canceled';

export type PlanInterval = 'monthly' | 'yearly';

export interface SubscriptionDetails {
  plan: PlanInterval;
  status: SubscriptionStatus;
  amount_cents: number; // e.g. 2000 = $20.00 / mo or 20000 = $200.00 / yr
  charity_contribution_pct: number; // min 10%
  current_period_end: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  cancel_at_period_end?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  handicap?: number;
  selected_charity_id: string;
  charity_contribution_pct: number; // min 10
  subscription: SubscriptionDetails;
  created_at: string;
  avatar_url?: string;
}

export interface StablefordScore {
  id: string;
  user_id: string;
  score: number; // 1 to 45
  date: string; // YYYY-MM-DD
  course_name?: string;
  created_at: string;
}

export interface CharityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: 'golf_day' | 'fundraiser' | 'gala' | 'marathon';
  description: string;
  register_url?: string;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  category: 'Children & Youth' | 'Veterans & First Responders' | 'Cancer Research' | 'Mental Health' | 'Disability Support' | 'Environmental Action';
  mission: string;
  description: string;
  logo_url: string;
  hero_image_url: string;
  donations_received_cents: number;
  active_supporters_count: number;
  upcoming_events: CharityEvent[];
  is_featured: boolean;
  website_url: string;
  contact_email: string;
}

export type DrawMode = 'random' | 'algorithmic';

export type DrawStatus = 'draft' | 'simulated' | 'published';

/**
 * Configurable strategy for converting a player's 5 Stableford scores (1-45)
 * into their 5 Draw Numbers.
 * Documented assumption per Section 9 of the PRD.
 */
export type DrawMappingStrategy = 'direct_scores' | 'sorted_scores' | 'modulo_normalized' | 'hash_seeded';

export interface WinnerTierResult {
  tier: 3 | 4 | 5;
  percentage_of_pool: number; // 40 for 5-match, 35 for 4-match, 25 for 3-match
  allocated_pool_cents: number;
  rollover_cents_added: number; // For tier 5 if rollover from previous
  total_payout_cents: number;
  winners_count: number;
  payout_per_winner_cents: number;
  winner_ids: string[];
  rolled_over_to_next: boolean;
}

export interface DrawRecord {
  id: string;
  draw_code: string;
  title: string;
  month: string; // e.g. "October 2026"
  scheduled_date: string;
  mode: DrawMode;
  mapping_strategy: DrawMappingStrategy;
  status: DrawStatus;
  winning_numbers: number[]; // 5 unique numbers (1-45)
  total_subscribers_active: number;
  base_prize_pool_cents: number;
  rollover_incoming_cents: number; // carried over from previous 5-match
  rollover_outgoing_cents: number; // unawarded 5-match carried to future
  tier_5_result: WinnerTierResult;
  tier_4_result: WinnerTierResult;
  tier_3_result: WinnerTierResult;
  published_at?: string;
  created_by?: string;
  notes?: string;
}

export type WinnerVerificationStatus = 
  | 'pending'
  | 'proof_uploaded'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'paid';

export interface WinnerVerificationRecord {
  id: string;
  draw_id: string;
  draw_title: string;
  draw_month: string;
  user_id: string;
  user_name: string;
  user_email: string;
  match_tier: 3 | 4 | 5;
  matched_numbers: number[];
  drawn_numbers: number[];
  user_entry_numbers: number[];
  prize_cents: number;
  status: WinnerVerificationStatus;
  proof_image_url?: string;
  proof_file_name?: string;
  proof_uploaded_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
  verified_by?: string;
  verified_at?: string;
  paid_at?: string;
  paid_tx_reference?: string;
  created_at: string;
}

export interface IndependentDonation {
  id: string;
  donor_name: string;
  donor_email: string;
  charity_id: string;
  charity_name: string;
  amount_cents: number;
  message?: string;
  created_at: string;
}

export interface SimulationResult {
  draw_mode: DrawMode;
  mapping_strategy: DrawMappingStrategy;
  winning_numbers: number[];
  number_frequency_weights?: Record<number, number>;
  eligible_subscriber_count: number;
  prize_pool_cents: number;
  rollover_incoming_cents: number;
  rollover_outgoing_cents: number;
  tier_5_winners: { user_id: string; user_name: string; matched: number[]; payout_cents: number }[];
  tier_4_winners: { user_id: string; user_name: string; matched: number[]; payout_cents: number }[];
  tier_3_winners: { user_id: string; user_name: string; matched: number[]; payout_cents: number }[];
  tier_5_payout_per_winner_cents: number;
  tier_4_payout_per_winner_cents: number;
  tier_3_payout_per_winner_cents: number;
}
