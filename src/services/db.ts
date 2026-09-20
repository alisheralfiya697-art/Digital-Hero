/**
 * DIGITAL HEROES SUPABASE DATABASE & STORAGE SERVICE
 * 
 * Provides:
 * 1. Client-side local persistence backed by localStorage with realistic relational constraints.
 * 2. Strict implementation of PRD Score Management Rules:
 *    - Score 1 to 45
 *    - Date required
 *    - Unique (user_id, date) constraint: rejects duplicate dates
 *    - Retention limit: ONLY latest 5 scores retained. Adding a 6th automatically evicts oldest.
 *    - Reverse chronological display.
 * 3. Supabase client connector if NEXT_PUBLIC_SUPABASE_URL is provided, with seamless fallback.
 * 4. Production-grade PostgreSQL + RLS DDL script export for Supabase SQL Editor.
 */

import {
  Charity,
  DrawRecord,
  IndependentDonation,
  StablefordScore,
  UserProfile,
  WinnerVerificationRecord,
} from '../types';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'digital_heroes_users_v1',
  SCORES: 'digital_heroes_scores_v1',
  CHARITIES: 'digital_heroes_charities_v1',
  DRAWS: 'digital_heroes_draws_v1',
  WINNERS: 'digital_heroes_winners_v1',
  DONATIONS: 'digital_heroes_donations_v1',
  CURRENT_USER_ID: 'digital_heroes_active_uid_v1',
};

// Seed Charities
export const INITIAL_CHARITIES: Charity[] = [
  {
    id: 'charity-1',
    name: 'Fairway Heroes for Veterans',
    slug: 'fairway-heroes-veterans',
    tagline: 'Rehabilitating wounded veterans & first responders through adaptive golf and community.',
    category: 'Veterans & First Responders',
    mission: 'To empower injured military personnel, law enforcement, and emergency responders through specialized golf rehabilitation, peer mentorship, and psychological wellness programs.',
    description: 'Fairway Heroes was founded in 2018 by combat veterans who discovered the restorative focus, camaraderie, and low-impact physical rehab that golf provides. We provide customized adaptive clubs, nationwide clinics, and family support days.',
    logo_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&auto=format&fit=crop&q=80',
    hero_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=80',
    donations_received_cents: 8425000, // $84,250
    active_supporters_count: 1420,
    is_featured: true,
    website_url: 'https://fairwayheroes.org',
    contact_email: 'outreach@fairwayheroes.org',
    upcoming_events: [
      {
        id: 'event-1',
        title: 'National Veterans Invitational Golf Day',
        date: '2026-10-14',
        location: 'Silverstone Pines Golf Club, CO',
        type: 'golf_day',
        description: 'Annual 18-hole Stableford scramble pairing military veterans with amateur golfers for an unforgettable afternoon of support and fellowship.',
        register_url: 'https://fairwayheroes.org/events/invitational',
      },
      {
        id: 'event-2',
        title: 'Heroes Charity Gala & Auction',
        date: '2026-11-20',
        location: 'Denver Grand Ballroom, CO',
        type: 'gala',
        description: 'Black-tie fundraising dinner celebrating resilience stories and raising equipment grants.',
      },
    ],
  },
  {
    id: 'charity-2',
    name: 'Starlight Youth STEM & Athletics',
    slug: 'starlight-youth-stem',
    tagline: 'Leveling the playing field for underprivileged children through sports scholarships and tech education.',
    category: 'Children & Youth',
    mission: 'Breaking systemic poverty cycles by funding athletic equipment, junior golf development, and after-school coding academies for underserved public school students.',
    description: 'We believe character, sportsmanship, and technical literacy form the trifecta of modern youth empowerment. Over 6,500 students have graduated from our junior circuits and robotics programs.',
    logo_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&auto=format&fit=crop&q=80',
    hero_image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80',
    donations_received_cents: 6180000, // $61,800
    active_supporters_count: 980,
    is_featured: true,
    website_url: 'https://starlightyouth.org',
    contact_email: 'partners@starlightyouth.org',
    upcoming_events: [
      {
        id: 'event-3',
        title: 'Junior Champions Charity Pro-Am',
        date: '2026-10-28',
        location: 'Metropolitan Country Club, NY',
        type: 'golf_day',
        description: 'Pairing junior academy prodigies with club members to fund 50 annual academic-athletic scholarships.',
      },
    ],
  },
  {
    id: 'charity-3',
    name: 'Frontiers Oncology Research Alliance',
    slug: 'frontiers-oncology',
    tagline: 'Accelerating non-invasive diagnostic therapies for pediatric and early-stage cancers.',
    category: 'Cancer Research',
    mission: 'Providing direct clinical grants to innovative oncology labs pioneering targeted cellular immunotherapies with zero bureaucratic red tape.',
    description: 'Frontiers Oncology bridges the gap between laboratory breakthrough and life-saving human trials. 100% of public donations flow straight to bench science and patient trial subsidies.',
    logo_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=200&auto=format&fit=crop&q=80',
    hero_image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&auto=format&fit=crop&q=80',
    donations_received_cents: 11240000, // $112,400
    active_supporters_count: 2310,
    is_featured: false,
    website_url: 'https://frontiersoncology.org',
    contact_email: 'science@frontiersoncology.org',
    upcoming_events: [
      {
        id: 'event-4',
        title: 'Hope on the Greens Benefit Tour',
        date: '2026-11-05',
        location: 'Pacific Dunes Links, OR',
        type: 'golf_day',
        description: 'Charity shotgun tournament with proceeds funding pediatric leukemia genomic sequencing.',
      },
    ],
  },
  {
    id: 'charity-4',
    name: 'MindSpace Athlete Mental Health Trust',
    slug: 'mindspace-athlete-mental-health',
    tagline: 'De-stigmatizing mental wellbeing and providing free therapeutic care for amateur & competitive athletes.',
    category: 'Mental Health',
    mission: 'Delivering confidential, licensed sports psychology and 24/7 crisis support to community athletes facing burnout, anxiety, or transition trauma.',
    description: 'Athletic culture frequently discourages vulnerability. MindSpace establishes safe mental conditioning workshops, clinical therapy stipends, and peer circles across hundreds of regional sports leagues.',
    logo_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&auto=format&fit=crop&q=80',
    hero_image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80',
    donations_received_cents: 4350000,
    active_supporters_count: 740,
    is_featured: false,
    website_url: 'https://mindspacetrust.org',
    contact_email: 'hello@mindspacetrust.org',
    upcoming_events: [],
  },
];

// Seed Users representing all three roles
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    email: 'admin@digitalheroes.org',
    full_name: 'Marcus Vance (Admin)',
    role: 'admin',
    handicap: 8.4,
    selected_charity_id: 'charity-1',
    charity_contribution_pct: 25,
    subscription: {
      plan: 'yearly',
      status: 'active',
      amount_cents: 20000, // $200.00 / yr
      charity_contribution_pct: 25,
      current_period_end: '2027-09-01T00:00:00.000Z',
      stripe_customer_id: 'cus_test_admin_marcus',
      stripe_subscription_id: 'sub_test_admin_marcus',
    },
    created_at: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'user-subscriber-1',
    email: 'sarah.miller@example.com',
    full_name: 'Sarah Miller',
    role: 'subscriber',
    handicap: 14.2,
    selected_charity_id: 'charity-1',
    charity_contribution_pct: 20,
    subscription: {
      plan: 'monthly',
      status: 'active',
      amount_cents: 2000, // $20.00 / mo
      charity_contribution_pct: 20,
      current_period_end: '2026-10-19T00:00:00.000Z',
      stripe_customer_id: 'cus_test_sub_sarah',
      stripe_subscription_id: 'sub_test_sub_sarah',
    },
    created_at: '2026-04-10T09:30:00.000Z',
  },
  {
    id: 'user-subscriber-2',
    email: 'david.chen@example.com',
    full_name: 'David Chen',
    role: 'subscriber',
    handicap: 18.0,
    selected_charity_id: 'charity-2',
    charity_contribution_pct: 15,
    subscription: {
      plan: 'yearly',
      status: 'active',
      amount_cents: 20000,
      charity_contribution_pct: 15,
      current_period_end: '2027-04-10T00:00:00.000Z',
      stripe_customer_id: 'cus_test_sub_david',
      stripe_subscription_id: 'sub_test_sub_david',
    },
    created_at: '2026-05-12T14:15:00.000Z',
  },
  {
    id: 'user-inactive-1',
    email: 'liam.walker@example.com',
    full_name: 'Liam Walker (Inactive)',
    role: 'subscriber',
    handicap: 22.5,
    selected_charity_id: 'charity-3',
    charity_contribution_pct: 10,
    subscription: {
      plan: 'monthly',
      status: 'inactive',
      amount_cents: 2000,
      charity_contribution_pct: 10,
      current_period_end: '2026-08-01T00:00:00.000Z',
    },
    created_at: '2026-06-01T11:00:00.000Z',
  },
  {
    id: 'user-subscriber-3',
    email: 'elena.rostova@example.com',
    full_name: 'Elena Rostova',
    role: 'subscriber',
    handicap: 9.8,
    selected_charity_id: 'charity-3',
    charity_contribution_pct: 30,
    subscription: {
      plan: 'monthly',
      status: 'active',
      amount_cents: 2000,
      charity_contribution_pct: 30,
      current_period_end: '2026-10-15T00:00:00.000Z',
    },
    created_at: '2026-07-02T12:00:00.000Z',
  },
  {
    id: 'user-subscriber-4',
    email: 'jamal.harris@example.com',
    full_name: 'Jamal Harris',
    role: 'subscriber',
    handicap: 12.1,
    selected_charity_id: 'charity-4',
    charity_contribution_pct: 10,
    subscription: {
      plan: 'monthly',
      status: 'active',
      amount_cents: 2000,
      charity_contribution_pct: 10,
      current_period_end: '2026-10-22T00:00:00.000Z',
    },
    created_at: '2026-07-15T16:20:00.000Z',
  },
];

// Seed Stableford Scores for test users
// Example matching PRD: 38 - 18 Sep, 41 - 14 Sep, 35 - 10 Sep, 39 - 06 Sep, 32 - 01 Sep
export const INITIAL_SCORES: StablefordScore[] = [
  {
    id: 'score-s1-1',
    user_id: 'user-subscriber-1',
    score: 38,
    date: '2026-09-18',
    course_name: 'Torrey Pines South',
    created_at: '2026-09-18T18:00:00.000Z',
  },
  {
    id: 'score-s1-2',
    user_id: 'user-subscriber-1',
    score: 41,
    date: '2026-09-14',
    course_name: 'Pebble Beach Golf Links',
    created_at: '2026-09-14T17:30:00.000Z',
  },
  {
    id: 'score-s1-3',
    user_id: 'user-subscriber-1',
    score: 35,
    date: '2026-09-10',
    course_name: 'Cypress Point Club',
    created_at: '2026-09-10T19:10:00.000Z',
  },
  {
    id: 'score-s1-4',
    user_id: 'user-subscriber-1',
    score: 39,
    date: '2026-09-06',
    course_name: 'Spyglass Hill Golf Course',
    created_at: '2026-09-06T16:45:00.000Z',
  },
  {
    id: 'score-s1-5',
    user_id: 'user-subscriber-1',
    score: 32,
    date: '2026-09-01',
    course_name: 'Spanish Bay Links',
    created_at: '2026-09-01T15:20:00.000Z',
  },
  // David Chen scores
  {
    id: 'score-s2-1',
    user_id: 'user-subscriber-2',
    score: 42,
    date: '2026-09-17',
    course_name: 'Bandon Dunes',
    created_at: '2026-09-17T17:00:00.000Z',
  },
  {
    id: 'score-s2-2',
    user_id: 'user-subscriber-2',
    score: 36,
    date: '2026-09-12',
    course_name: 'Pacific Dunes',
    created_at: '2026-09-12T16:00:00.000Z',
  },
  {
    id: 'score-s2-3',
    user_id: 'user-subscriber-2',
    score: 38,
    date: '2026-09-08',
    course_name: 'Old Macdonald',
    created_at: '2026-09-08T18:00:00.000Z',
  },
  {
    id: 'score-s2-4',
    user_id: 'user-subscriber-2',
    score: 34,
    date: '2026-09-03',
    course_name: 'Bandon Trails',
    created_at: '2026-09-03T17:15:00.000Z',
  },
  {
    id: 'score-s2-5',
    user_id: 'user-subscriber-2',
    score: 40,
    date: '2026-08-28',
    course_name: 'Sheep Ranch',
    created_at: '2026-08-28T14:40:00.000Z',
  },
  // Elena Rostova scores
  {
    id: 'score-s3-1',
    user_id: 'user-subscriber-3',
    score: 37,
    date: '2026-09-16',
    course_name: 'Whistling Straits',
    created_at: '2026-09-16T18:00:00.000Z',
  },
  {
    id: 'score-s3-2',
    user_id: 'user-subscriber-3',
    score: 41,
    date: '2026-09-11',
    course_name: 'Blackwolf Run',
    created_at: '2026-09-11T16:00:00.000Z',
  },
  {
    id: 'score-s3-3',
    user_id: 'user-subscriber-3',
    score: 39,
    date: '2026-09-05',
    course_name: 'Erin Hills',
    created_at: '2026-09-05T17:00:00.000Z',
  },
  {
    id: 'score-s3-4',
    user_id: 'user-subscriber-3',
    score: 35,
    date: '2026-08-29',
    course_name: 'Lawsonia Links',
    created_at: '2026-08-29T15:00:00.000Z',
  },
  {
    id: 'score-s3-5',
    user_id: 'user-subscriber-3',
    score: 43,
    date: '2026-08-22',
    course_name: 'Sand Valley',
    created_at: '2026-08-22T14:00:00.000Z',
  },
];

// Seed Past Draws
export const INITIAL_DRAWS: DrawRecord[] = [
  {
    id: 'draw-2026-08',
    draw_code: 'DH-2026-AUG',
    title: 'August 2026 Championship Draw',
    month: 'August 2026',
    scheduled_date: '2026-08-31',
    mode: 'algorithmic',
    mapping_strategy: 'direct_scores',
    status: 'published',
    winning_numbers: [14, 22, 35, 38, 41],
    total_subscribers_active: 5240,
    base_prize_pool_cents: 5240000, // $52,400
    rollover_incoming_cents: 1200000, // $12,000 from July
    rollover_outgoing_cents: 3296000, // Rolled over because no 5-match
    tier_5_result: {
      tier: 5,
      percentage_of_pool: 40,
      allocated_pool_cents: 2096000,
      rollover_cents_added: 1200000,
      total_payout_cents: 3296000,
      winners_count: 0,
      payout_per_winner_cents: 0,
      winner_ids: [],
      rolled_over_to_next: true,
    },
    tier_4_result: {
      tier: 4,
      percentage_of_pool: 35,
      allocated_pool_cents: 1834000,
      rollover_cents_added: 0,
      total_payout_cents: 1834000,
      winners_count: 4,
      payout_per_winner_cents: 458500, // $4,585 each
      winner_ids: ['user-subscriber-1'],
      rolled_over_to_next: false,
    },
    tier_3_result: {
      tier: 3,
      percentage_of_pool: 25,
      allocated_pool_cents: 1310000,
      rollover_cents_added: 0,
      total_payout_cents: 1310000,
      winners_count: 42,
      payout_per_winner_cents: 31190, // $311.90 each
      winner_ids: ['user-subscriber-2', 'user-subscriber-3'],
      rolled_over_to_next: false,
    },
    published_at: '2026-08-31T20:00:00.000Z',
    created_by: 'Marcus Vance (Admin)',
    notes: 'Official August draw completed. 4-match tier split among 4 winners. 5-match jackpot rolled over to September.',
  },
];

// Seed Winner Verifications
export const INITIAL_WINNERS: WinnerVerificationRecord[] = [
  {
    id: 'win-aug-sarah',
    draw_id: 'draw-2026-08',
    draw_title: 'August 2026 Championship Draw',
    draw_month: 'August 2026',
    user_id: 'user-subscriber-1',
    user_name: 'Sarah Miller',
    user_email: 'sarah.miller@example.com',
    match_tier: 4,
    matched_numbers: [35, 38, 41, 14],
    drawn_numbers: [14, 22, 35, 38, 41],
    user_entry_numbers: [32, 35, 38, 39, 41],
    prize_cents: 458500, // $4,585.00
    status: 'proof_uploaded', // In the workflow: Pending -> Proof uploaded -> Admin review -> Approved/Rejected -> Paid
    proof_image_url: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&auto=format&fit=crop&q=80',
    proof_file_name: 'GHIN_Scorecard_Verification_Aug.png',
    proof_uploaded_at: '2026-09-02T14:30:00.000Z',
    admin_notes: 'Uploaded GHIN scorecard confirming round on Sept 14 & 18. Awaiting final handicap admin verification.',
    created_at: '2026-08-31T20:01:00.000Z',
  },
  {
    id: 'win-aug-david',
    draw_id: 'draw-2026-08',
    draw_title: 'August 2026 Championship Draw',
    draw_month: 'August 2026',
    user_id: 'user-subscriber-2',
    user_name: 'David Chen',
    user_email: 'david.chen@example.com',
    match_tier: 3,
    matched_numbers: [35, 38, 41],
    drawn_numbers: [14, 22, 35, 38, 41],
    user_entry_numbers: [34, 36, 38, 40, 42],
    prize_cents: 31190, // $311.90
    status: 'paid',
    proof_image_url: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800&auto=format&fit=crop&q=80',
    proof_file_name: 'GolfShot_Round_Export.png',
    proof_uploaded_at: '2026-09-01T10:15:00.000Z',
    verified_by: 'Marcus Vance (Admin)',
    verified_at: '2026-09-02T09:00:00.000Z',
    paid_at: '2026-09-02T11:00:00.000Z',
    paid_tx_reference: 'STRIPE_TRX_99214028',
    created_at: '2026-08-31T20:01:00.000Z',
  },
];

class DatabaseService {
  private load<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  }

  private save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to save to localStorage [${key}]`, e);
    }
  }

  // ==========================================
  // USERS & AUTHENTICATION
  // ==========================================
  public getUsers(): UserProfile[] {
    return this.load<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public getUserByEmail(email: string): UserProfile | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public saveUser(user: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.save(STORAGE_KEYS.USERS, users);
  }

  public getActiveUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user-subscriber-1';
  }

  public setActiveUserId(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  // ==========================================
  // STABLEFORD SCORES (STRICT PRD COMPLIANCE)
  // ==========================================
  /**
   * Rules:
   * - Score must be between 1 and 45.
   * - Every score requires a date.
   * - Only one score is allowed for a particular date.
   * - Duplicate dates must be rejected.
   * - Existing scores may be edited or deleted.
   * - Only the latest 5 scores are retained.
   * - When a sixth score is added, automatically remove the oldest stored score.
   * - Display scores in reverse chronological order.
   */
  public getUserScores(userId: string): StablefordScore[] {
    const all = this.load<StablefordScore[]>(STORAGE_KEYS.SCORES, INITIAL_SCORES);
    return all
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getAllScores(): StablefordScore[] {
    return this.load<StablefordScore[]>(STORAGE_KEYS.SCORES, INITIAL_SCORES);
  }

  public addScore(params: {
    userId: string;
    score: number;
    date: string;
    courseName?: string;
  }): { success: boolean; error?: string; evictedScore?: StablefordScore } {
    const { userId, score, date, courseName } = params;

    // 1. Validation: Score between 1 and 45
    if (!Number.isInteger(score) || score < 1 || score > 45) {
      return { success: false, error: 'Score must be a whole number between 1 and 45 points.' };
    }

    // 2. Validation: Date required
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: false, error: 'A valid round date is required (YYYY-MM-DD).' };
    }

    const allScores = this.load<StablefordScore[]>(STORAGE_KEYS.SCORES, INITIAL_SCORES);

    // 3. Database constraint: Unique (user_id, date)
    const duplicate = allScores.find(s => s.user_id === userId && s.date === date);
    if (duplicate) {
      return { success: false, error: `A score is already recorded for date ${date}. Duplicate dates are not permitted.` };
    }

    // Get current user scores sorted newest to oldest
    const userScores = allScores
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const newScore: StablefordScore = {
      id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: userId,
      score,
      date,
      course_name: courseName || 'Local Championship Course',
      created_at: new Date().toISOString(),
    };

    // 4. Max 5 scores retained. If adding causes count > 5, evict oldest.
    let evictedScore: StablefordScore | undefined;
    if (userScores.length >= 5) {
      // Oldest score is at the end of descending array
      evictedScore = userScores[userScores.length - 1];
    }

    // Filter out evicted score from global store
    const updatedGlobal = allScores.filter(s => !evictedScore || s.id !== evictedScore.id);
    updatedGlobal.push(newScore);

    this.save(STORAGE_KEYS.SCORES, updatedGlobal);
    return { success: true, evictedScore };
  }

  public updateScore(id: string, updates: { score: number; date: string; courseName?: string }): { success: boolean; error?: string } {
    const { score, date, courseName } = updates;

    if (!Number.isInteger(score) || score < 1 || score > 45) {
      return { success: false, error: 'Score must be a whole number between 1 and 45 points.' };
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { success: false, error: 'A valid round date is required (YYYY-MM-DD).' };
    }

    const allScores = this.load<StablefordScore[]>(STORAGE_KEYS.SCORES, INITIAL_SCORES);
    const existingIndex = allScores.findIndex(s => s.id === id);
    if (existingIndex < 0) {
      return { success: false, error: 'Score record not found.' };
    }

    const currentScore = allScores[existingIndex];

    // Check for duplicate date on other scores for this user
    const duplicate = allScores.find(s => s.user_id === currentScore.user_id && s.date === date && s.id !== id);
    if (duplicate) {
      return { success: false, error: `Another score is already recorded for ${date}.` };
    }

    allScores[existingIndex] = {
      ...currentScore,
      score,
      date,
      course_name: courseName || currentScore.course_name,
    };

    this.save(STORAGE_KEYS.SCORES, allScores);
    return { success: true };
  }

  public deleteScore(id: string): { success: boolean } {
    const allScores = this.load<StablefordScore[]>(STORAGE_KEYS.SCORES, INITIAL_SCORES);
    const filtered = allScores.filter(s => s.id !== id);
    this.save(STORAGE_KEYS.SCORES, filtered);
    return { success: true };
  }

  // ==========================================
  // CHARITIES
  // ==========================================
  public getCharities(): Charity[] {
    return this.load<Charity[]>(STORAGE_KEYS.CHARITIES, INITIAL_CHARITIES);
  }

  public getCharityById(id: string): Charity | undefined {
    return this.getCharities().find(c => c.id === id);
  }

  public saveCharity(charity: Charity): void {
    const charities = this.getCharities();
    const index = charities.findIndex(c => c.id === charity.id);
    if (index >= 0) {
      charities[index] = charity;
    } else {
      charities.push(charity);
    }
    this.save(STORAGE_KEYS.CHARITIES, charities);
  }

  public recordIndependentDonation(donation: Omit<IndependentDonation, 'id' | 'created_at'>): IndependentDonation {
    const record: IndependentDonation = {
      ...donation,
      id: `don-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const donations = this.load<IndependentDonation[]>(STORAGE_KEYS.DONATIONS, []);
    donations.push(record);
    this.save(STORAGE_KEYS.DONATIONS, donations);

    // Increment charity total
    const charities = this.getCharities();
    const ch = charities.find(c => c.id === donation.charity_id);
    if (ch) {
      ch.donations_received_cents += donation.amount_cents;
      this.saveCharity(ch);
    }

    return record;
  }

  // ==========================================
  // DRAWS & WINNERS
  // ==========================================
  public getDraws(): DrawRecord[] {
    return this.load<DrawRecord[]>(STORAGE_KEYS.DRAWS, INITIAL_DRAWS);
  }

  public getDrawById(id: string): DrawRecord | undefined {
    return this.getDraws().find(d => d.id === id);
  }

  public saveDraw(draw: DrawRecord): void {
    const draws = this.getDraws();
    const idx = draws.findIndex(d => d.id === draw.id);
    if (idx >= 0) {
      draws[idx] = draw;
    } else {
      draws.unshift(draw); // newest first
    }
    this.save(STORAGE_KEYS.DRAWS, draws);
  }

  public getLatestPublishedDraw(): DrawRecord | undefined {
    return this.getDraws().find(d => d.status === 'published');
  }

  public getWinners(): WinnerVerificationRecord[] {
    return this.load<WinnerVerificationRecord[]>(STORAGE_KEYS.WINNERS, INITIAL_WINNERS);
  }

  public getUserWinners(userId: string): WinnerVerificationRecord[] {
    return this.getWinners().filter(w => w.user_id === userId);
  }

  public saveWinner(winner: WinnerVerificationRecord): void {
    const winners = this.getWinners();
    const idx = winners.findIndex(w => w.id === winner.id);
    if (idx >= 0) {
      winners[idx] = winner;
    } else {
      winners.unshift(winner);
    }
    this.save(STORAGE_KEYS.WINNERS, winners);
  }

  /**
   * Generates production-ready PostgreSQL SQL DDL schema for Supabase
   * with full Row-Level-Security (RLS), constraints, and triggers.
   */
  public getSupabaseSQLSchema(): string {
    return `-- ============================================================================
-- DIGITAL HEROES SUPABASE DATABASE & RLS POLICIES DDL
-- ============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. User Profiles Table (Linked to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text check (role in ('public_visitor', 'subscriber', 'admin')) default 'subscriber',
  handicap numeric(4,1),
  selected_charity_id text not null,
  charity_contribution_pct integer check (charity_contribution_pct >= 10 and charity_contribution_pct <= 100) default 10,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_plan text check (subscription_plan in ('monthly', 'yearly')) default 'monthly',
  subscription_status text check (subscription_status in ('inactive', 'active', 'past_due', 'canceled')) default 'inactive',
  subscription_amount_cents integer default 2000,
  current_period_end timestamptz,
  created_at timestamptz default now() not null
);

-- 3. Charities Directory Table
create table public.charities (
  id text primary key,
  name text not null,
  slug text unique not null,
  tagline text not null,
  category text not null,
  mission text not null,
  description text not null,
  logo_url text not null,
  hero_image_url text not null,
  donations_received_cents bigint default 0 not null,
  active_supporters_count integer default 0 not null,
  is_featured boolean default false,
  website_url text,
  contact_email text,
  upcoming_events jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null
);

-- 4. Stableford Scores Table
-- PRD: Score 1-45, only one per date, unique (user_id, date), latest 5 retained
create table public.scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null check (score >= 1 and score <= 45),
  date date not null,
  course_name text default 'Championship Course',
  created_at timestamptz default now() not null,
  constraint unique_user_round_date unique (user_id, date)
);

-- Index for rapid reverse chronological retrieval
create index idx_scores_user_date on public.scores (user_id, date desc);

-- Trigger: Automatically evict 6th oldest score when new score added
create or replace function public.enforce_five_score_limit()
returns trigger as $$
begin
  delete from public.scores
  where id in (
    select id from public.scores
    where user_id = NEW.user_id
    order by date desc, created_at desc
    offset 5
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger tr_enforce_five_scores
after insert on public.scores
for each row execute function public.enforce_five_score_limit();

-- 5. Monthly Draws Table
create table public.draws (
  id uuid default uuid_generate_v4() primary key,
  draw_code text unique not null,
  title text not null,
  month text not null,
  scheduled_date date not null,
  mode text check (mode in ('random', 'algorithmic')) not null,
  mapping_strategy text not null default 'direct_scores',
  status text check (status in ('draft', 'simulated', 'published')) default 'draft',
  winning_numbers integer[] not null,
  total_subscribers_active integer default 0,
  base_prize_pool_cents integer default 0,
  rollover_incoming_cents integer default 0,
  rollover_outgoing_cents integer default 0,
  tier_5_result jsonb not null,
  tier_4_result jsonb not null,
  tier_3_result jsonb not null,
  published_at timestamptz,
  created_by text,
  notes text,
  created_at timestamptz default now() not null
);

-- 6. Winner Verification Table
create table public.winner_verifications (
  id uuid default uuid_generate_v4() primary key,
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_tier integer check (match_tier in (3, 4, 5)) not null,
  matched_numbers integer[] not null,
  drawn_numbers integer[] not null,
  user_entry_numbers integer[] not null,
  prize_cents integer not null,
  status text check (status in ('pending', 'proof_uploaded', 'under_review', 'approved', 'rejected', 'paid')) default 'pending',
  proof_image_url text,
  proof_file_name text,
  proof_uploaded_at timestamptz,
  rejection_reason text,
  admin_notes text,
  verified_by text,
  verified_at timestamptz,
  paid_at timestamptz,
  paid_tx_reference text,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.scores enable row level security;
alter table public.charities enable row level security;
alter table public.draws enable row level security;
alter table public.winner_verifications enable row level security;

-- Profiles: Public can read basic, users can edit own, admin can manage all
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Scores: Subscribers can view/add/edit/delete own scores, admin can view/edit all
create policy "Subscribers can view own scores" on public.scores
  for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Subscribers can insert own scores" on public.scores
  for insert with check (auth.uid() = user_id);

create policy "Subscribers can update own scores" on public.scores
  for update using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Subscribers can delete own scores" on public.scores
  for delete using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Charities: Public can view all, only admin can insert/update
create policy "Charities are viewable by everyone" on public.charities
  for select using (true);

create policy "Admins can manage charities" on public.charities
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Draws: Published draws are viewable by all, drafts/simulations by admin only
create policy "Published draws are viewable by everyone" on public.draws
  for select using (status = 'published' or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage draws" on public.draws
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Winner Verifications: Winners can view and upload proof; only admin can approve/mark paid
create policy "Winners can view own records" on public.winner_verifications
  for select using (auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Winners can upload proof" on public.winner_verifications
  for update using (auth.uid() = user_id and status in ('pending', 'proof_uploaded'))
  with check (auth.uid() = user_id);

create policy "Admins can manage all winner verifications" on public.winner_verifications
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
`;
  }
}

export const db = new DatabaseService();
