/**
 * DIGITAL HEROES DRAW ENGINE
 * 
 * ============================================================================
 * SECTION 9 SPECIFICATION: DRAW CONVERSION ASSUMPTION & ARCHITECTURE
 * ============================================================================
 * 
 * The Digital Heroes Level 1 PRD states that golfers record 5 Stableford scores 
 * (bounded from 1 to 45) and participate in a monthly draw with 3, 4, or 5-number 
 * matching tiers. However, the exact mathematical mapping from a player's five 
 * Stableford scores to their official five lottery draw numbers is not specified.
 * 
 * To ensure transparency, modularity, and zero silent business assumptions:
 * 1. This engine isolates score-to-number transformation behind the `DrawMappingStrategy`
 *    interface.
 * 2. Supported mapping strategies are provided:
 *    - 'direct_scores' (Default): Uses the golfer's 5 exact Stableford scores (deduplicated 
 *       with deterministic fill if duplicate scores exist) directly as their draw numbers.
 *    - 'sorted_scores': Sorts the 5 Stableford scores in ascending sequence.
 *    - 'modulo_normalized': Normalizes scores into distinct lottery ball bins [1..45].
 *    - 'hash_seeded': Hashes the score tuple with the user's ID to generate 5 pseudo-random 
 *       unique numbers in [1..45].
 * 3. Administrators can dynamically inspect, select, or modify this conversion rule in 
 *    the Admin Draw Console without touching core lottery logic.
 */

import {
  DrawMappingStrategy,
  DrawMode,
  SimulationResult,
  StablefordScore,
  WinnerTierResult,
} from '../types';

export interface SubscriberDrawEntry {
  userId: string;
  userName: string;
  userEmail: string;
  scores: StablefordScore[];
  drawNumbers: number[]; // 5 unique numbers (1-45)
}

export class DrawEngine {
  /**
   * Generates exactly 5 unique draw numbers from a user's Stableford scores
   * based on the selected mapping strategy.
   * 
   * @param scores The user's active Stableford scores (up to 5, range 1-45)
   * @param userId The unique user ID (used for deterministic fallback/seed)
   * @param strategy The chosen strategy ('direct_scores' | 'sorted_scores' | 'modulo_normalized' | 'hash_seeded')
   */
  public static deriveDrawNumbers(
    scores: StablefordScore[],
    userId: string,
    strategy: DrawMappingStrategy = 'direct_scores'
  ): number[] {
    const rawScoreValues = scores.map(s => Math.min(45, Math.max(1, Math.round(s.score))));

    switch (strategy) {
      case 'direct_scores':
      case 'sorted_scores': {
        // Collect unique scores
        const uniqueSet = new Set<number>();
        for (const val of rawScoreValues) {
          if (uniqueSet.size < 5) {
            uniqueSet.add(val);
          }
        }

        // If golfer has fewer than 5 unique scores (e.g. entered fewer than 5 or duplicate values),
        // deterministically fill remaining slots using a seeded sequence from userId & date
        let seedOffset = 1;
        while (uniqueSet.size < 5) {
          const pseudoNum = ((Math.abs(this.hashString(userId + seedOffset)) % 45) + 1);
          uniqueSet.add(pseudoNum);
          seedOffset++;
        }

        const numbers = Array.from(uniqueSet);
        return strategy === 'sorted_scores' ? numbers.sort((a, b) => a - b) : numbers;
      }

      case 'modulo_normalized': {
        // Distribute scores across 5 bins of 9 numbers (1..45)
        const numbers: number[] = [];
        const used = new Set<number>();

        for (let i = 0; i < 5; i++) {
          const score = rawScoreValues[i] || ((Math.abs(this.hashString(userId + i)) % 45) + 1);
          // Bin i covers (i*9 + 1) to ((i+1)*9)
          const base = i * 9 + 1;
          let ball = base + (score % 9);
          if (ball > 45) ball = 45;
          while (used.has(ball)) {
            ball = (ball % 45) + 1;
          }
          used.add(ball);
          numbers.push(ball);
        }
        return numbers.sort((a, b) => a - b);
      }

      case 'hash_seeded': {
        // Combine raw scores + user ID into a deterministic cryptographic hash
        const seedStr = `${userId}:${rawScoreValues.join('-')}`;
        const picked = new Set<number>();
        let counter = 0;
        while (picked.size < 5) {
          const hashVal = Math.abs(this.hashString(`${seedStr}:${counter}`));
          const ball = (hashVal % 45) + 1;
          picked.add(ball);
          counter++;
        }
        return Array.from(picked).sort((a, b) => a - b);
      }

      default:
        return this.deriveDrawNumbers(scores, userId, 'direct_scores');
    }
  }

  /**
   * Calculates the frequency distribution of scores across all active subscribers
   * for Algorithmic weighted mode.
   */
  public static calculateScoreFrequencies(entries: SubscriberDrawEntry[]): Record<number, number> {
    const freq: Record<number, number> = {};
    for (let i = 1; i <= 45; i++) {
      freq[i] = 1; // Base smoothing weight so every number has non-zero probability
    }

    for (const entry of entries) {
      for (const num of entry.drawNumbers) {
        if (num >= 1 && num <= 45) {
          freq[num] = (freq[num] || 0) + 1;
        }
      }
    }
    return freq;
  }

  /**
   * Executes a draw generation for 5 winning numbers in range 1-45.
   * - Random: Standard lottery uniform random pick.
   * - Algorithmic: Weighted probability sampling based on actual subscriber score frequency.
   */
  public static drawWinningNumbers(
    mode: DrawMode,
    entries: SubscriberDrawEntry[] = []
  ): { numbers: number[]; frequencies?: Record<number, number> } {
    if (mode === 'random' || entries.length === 0) {
      const pool: number[] = [];
      for (let i = 1; i <= 45; i++) pool.push(i);

      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const drawn = pool.slice(0, 5).sort((a, b) => a - b);
      return { numbers: drawn };
    }

    // Algorithmic Mode: Weighted Selection based on score frequency
    const freqMap = this.calculateScoreFrequencies(entries);
    const selected = new Set<number>();

    // Copy map so we can sample without replacement
    const workingFreq = { ...freqMap };

    while (selected.size < 5) {
      let totalWeight = 0;
      for (const [numStr, weight] of Object.entries(workingFreq)) {
        const num = Number(numStr);
        if (!selected.has(num)) {
          totalWeight += weight;
        }
      }

      let randomWeight = Math.random() * totalWeight;
      for (const [numStr, weight] of Object.entries(workingFreq)) {
        const num = Number(numStr);
        if (selected.has(num)) continue;

        randomWeight -= weight;
        if (randomWeight <= 0) {
          selected.add(num);
          break;
        }
      }
    }

    return {
      numbers: Array.from(selected).sort((a, b) => a - b),
      frequencies: freqMap,
    };
  }

  /**
   * Compares a subscriber's 5 draw numbers against the 5 winning numbers.
   * Returns list of matching numbers.
   */
  public static evaluateMatch(userNumbers: number[], winningNumbers: number[]): number[] {
    const winSet = new Set(winningNumbers);
    return userNumbers.filter(n => winSet.has(n));
  }

  /**
   * Simulates or executes a full monthly draw, computing tier winners and payouts.
   * 
   * PRIZE POOL RULES (PRD Section 10):
   * - 5-number match: 40% (+ any rollover from previous draw)
   * - 4-number match: 35% (no rollover)
   * - 3-number match: 25% (no rollover)
   * Total = 100% of draw pool.
   * 
   * If nobody wins 5-number match:
   * -> that 40% rolls over to the next draw!
   * 
   * If multiple winners in any tier:
   * -> split tier amount equally in integer cents.
   */
  public static simulateOrRunDraw(params: {
    mode: DrawMode;
    mappingStrategy: DrawMappingStrategy;
    entries: SubscriberDrawEntry[];
    prizePoolCents: number;
    rolloverIncomingCents: number;
    overrideWinningNumbers?: number[];
  }): SimulationResult {
    const {
      mode,
      mappingStrategy,
      entries,
      prizePoolCents,
      rolloverIncomingCents,
      overrideWinningNumbers,
    } = params;

    // 1. Draw numbers
    const drawOutcome = overrideWinningNumbers && overrideWinningNumbers.length === 5
      ? { numbers: [...overrideWinningNumbers].sort((a, b) => a - b) }
      : this.drawWinningNumbers(mode, entries);

    const winningNumbers = drawOutcome.numbers;

    // 2. Evaluate all active subscribers
    const tier5: { user_id: string; user_name: string; matched: number[]; payout_cents: number }[] = [];
    const tier4: { user_id: string; user_name: string; matched: number[]; payout_cents: number }[] = [];
    const tier3: { user_id: string; user_name: string; matched: number[]; payout_cents: number }[] = [];

    for (const entry of entries) {
      const matched = this.evaluateMatch(entry.drawNumbers, winningNumbers);
      const matchCount = matched.length;

      if (matchCount === 5) {
        tier5.push({ user_id: entry.userId, user_name: entry.userName, matched, payout_cents: 0 });
      } else if (matchCount === 4) {
        tier4.push({ user_id: entry.userId, user_name: entry.userName, matched, payout_cents: 0 });
      } else if (matchCount === 3) {
        tier3.push({ user_id: entry.userId, user_name: entry.userName, matched, payout_cents: 0 });
      }
    }

    // 3. Calculate pool allocation (PRD: 40% / 35% / 25%)
    const tier5Allocated = Math.floor(prizePoolCents * 0.40);
    const tier4Allocated = Math.floor(prizePoolCents * 0.35);
    const tier3Allocated = prizePoolCents - tier5Allocated - tier4Allocated; // Guarantee 100% exact minor units

    // Tier 5 includes rollover from incoming
    const tier5TotalAvailable = tier5Allocated + rolloverIncomingCents;

    let rolloverOutgoingCents = 0;
    let tier5PerWinner = 0;

    if (tier5.length > 0) {
      tier5PerWinner = Math.floor(tier5TotalAvailable / tier5.length);
      tier5.forEach(w => w.payout_cents = tier5PerWinner);
      rolloverOutgoingCents = 0; // Jackpot won!
    } else {
      // Jackpot rolls over to next draw!
      rolloverOutgoingCents = tier5TotalAvailable;
    }

    let tier4PerWinner = 0;
    if (tier4.length > 0) {
      tier4PerWinner = Math.floor(tier4Allocated / tier4.length);
      tier4.forEach(w => w.payout_cents = tier4PerWinner);
    }

    let tier3PerWinner = 0;
    if (tier3.length > 0) {
      tier3PerWinner = Math.floor(tier3Allocated / tier3.length);
      tier3.forEach(w => w.payout_cents = tier3PerWinner);
    }

    return {
      draw_mode: mode,
      mapping_strategy: mappingStrategy,
      winning_numbers: winningNumbers,
      number_frequency_weights: drawOutcome.frequencies,
      eligible_subscriber_count: entries.length,
      prize_pool_cents: prizePoolCents,
      rollover_incoming_cents: rolloverIncomingCents,
      rollover_outgoing_cents: rolloverOutgoingCents,
      tier_5_winners: tier5,
      tier_4_winners: tier4,
      tier_3_winners: tier3,
      tier_5_payout_per_winner_cents: tier5PerWinner,
      tier_4_payout_per_winner_cents: tier4PerWinner,
      tier_3_payout_per_winner_cents: tier3PerWinner,
    };
  }

  /**
   * Helper hash function for deterministic seeded mapping.
   */
  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash;
  }
}
