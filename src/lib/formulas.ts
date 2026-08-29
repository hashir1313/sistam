export type RankType = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

/**
 * Formula for XP required to level up from `level` to `level + 1`:
 * XP Required = level^2 * 2
 * Example: Level 30 -> 31 requires 30^2 * 2 = 1800 XP.
 */
export function getXpRequiredForNextLevel(level: number): number {
  const currentLevel = Math.max(1, Math.floor(level));
  return Math.pow(currentLevel, 2) * 2;
}

/**
 * Calculates coins earned from manual XP entry:
 * Coins = XP / 10
 */
export function calculateCoinsFromXp(xp: number): number {
  if (xp <= 0) return 0;
  return Number((xp / 10).toFixed(2));
}

/**
 * Calculates Hunter Rank based on Player Level:
 * E: Level 1 - 10
 * D: Level 11 - 25
 * C: Level 26 - 50
 * B: Level 51 - 75
 * A: Level 76 - 99
 * S: Level 100+
 */
export function calculateRank(level: number): RankType {
  if (level >= 100) return 'S';
  if (level >= 76) return 'A';
  if (level >= 51) return 'B';
  if (level >= 26) return 'C';
  if (level >= 11) return 'D';
  return 'E';
}

/**
 * Evaluates whether new total XP causes level-up(s) from current level.
 * Returns the new level, new rank, and how many levels were gained.
 */
export function evaluateLevelUp(currentLevel: number, totalXpEarned: number): {
  newLevel: number;
  newRank: RankType;
  levelsGained: number;
  xpForNextLevel: number;
} {
  let level = Math.max(1, currentLevel);
  let levelsGained = 0;
  let requiredXp = getXpRequiredForNextLevel(level);

  while (totalXpEarned >= requiredXp) {
    level++;
    levelsGained++;
    requiredXp = getXpRequiredForNextLevel(level);
  }

  return {
    newLevel: level,
    newRank: calculateRank(level),
    levelsGained,
    xpForNextLevel: requiredXp,
  };
}
