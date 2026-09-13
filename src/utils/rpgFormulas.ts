import { QuestCategory, AttributeType, RewardItem } from '../types/rpg';

/**
 * Category configuration: XP rewards, coins, and mapped RPG attributes.
 */
export const CATEGORY_CONFIG: Record<
  QuestCategory,
  { xp: number; coins: number; attribute: AttributeType; label: string; color: string; icon: string }
> = {
  Study: {
    xp: 40,
    coins: 10,
    attribute: 'intellect',
    label: 'Study',
    color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    icon: 'BookOpen',
  },
  Exercise: {
    xp: 40,
    coins: 10,
    attribute: 'strength',
    label: 'Exercise',
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    icon: 'Dumbbell',
  },
  Habit: {
    xp: 30,
    coins: 10,
    attribute: 'discipline',
    label: 'Habit',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    icon: 'CheckCircle2',
  },
  Creative: {
    xp: 40,
    coins: 10,
    attribute: 'creativity',
    label: 'Creative',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    icon: 'Sparkles',
  },
};

/**
 * Non-linear level formula:
 * XP required for next level = 100 × level^1.5
 */
export function getXpRequiredForNextLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.round(100 * Math.pow(safeLevel, 1.5));
}

/**
 * Calculates updated level and currentXP when gaining XP.
 * Preserves excess XP and allows multi-level advancement if applicable.
 */
export function calculateLevelProgression(
  currentLevel: number,
  currentXP: number,
  earnedXP: number
): { newLevel: number; newCurrentXP: number; leveledUp: boolean; levelsGained: number } {
  let level = Math.max(1, currentLevel);
  let xp = Math.max(0, currentXP + earnedXP);
  let leveledUp = false;
  let levelsGained = 0;

  while (true) {
    const required = getXpRequiredForNextLevel(level);
    if (xp >= required) {
      xp -= required;
      level += 1;
      leveledUp = true;
      levelsGained += 1;
    } else {
      break;
    }
  }

  return {
    newLevel: level,
    newCurrentXP: xp,
    leveledUp,
    levelsGained,
  };
}

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function formatDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculate streak update based on lastActivityDate and current date.
 * - Same day: keep current streak
 * - Yesterday: increment streak + 1
 * - More than 1 day gap or no prior date: reset streak to 1
 */
export function calculateNewStreak(
  currentStreak: number,
  lastActivityDate: string | null,
  now: Date = new Date()
): { newStreak: number; streakIncreased: boolean; todayDateStr: string } {
  const todayDateStr = formatDateKey(now);

  if (!lastActivityDate) {
    return { newStreak: 1, streakIncreased: true, todayDateStr };
  }

  if (lastActivityDate === todayDateStr) {
    // Already completed a task today; streak is preserved, no extra increment
    return { newStreak: Math.max(1, currentStreak), streakIncreased: false, todayDateStr };
  }

  // Check if lastActivityDate was yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDateStr = formatDateKey(yesterday);

  if (lastActivityDate === yesterdayDateStr) {
    return { newStreak: currentStreak + 1, streakIncreased: true, todayDateStr };
  }

  // Gap of 2+ days: streak resets to 1
  return { newStreak: 1, streakIncreased: false, todayDateStr };
}

/**
 * Reward Shop catalog
 */
export const REWARD_SHOP_CATALOG: RewardItem[] = [
  // Themes
  {
    id: 'theme_obsidian',
    name: 'Obsidian Knight',
    type: 'theme',
    price: 60,
    description: 'Deep onyx and charcoal mantle with refined silver radiance.',
    iconName: 'Shield',
    previewColor: '#0f172a',
  },
  {
    id: 'theme_emerald',
    name: 'Emerald Ranger',
    type: 'theme',
    price: 80,
    description: 'Verdant forest aura with calming moss and jade highlights.',
    iconName: 'Compass',
    previewColor: '#064e3b',
  },
  {
    id: 'theme_crimson',
    name: 'Crimson Vanguard',
    type: 'theme',
    price: 100,
    description: 'Bold ruby warplate with smoldering embers along the borders.',
    iconName: 'Flame',
    previewColor: '#7f1d1d',
  },
  {
    id: 'theme_solar',
    name: 'Solar Paladin',
    type: 'theme',
    price: 150,
    description: 'Radiant gold celestial finish with royal sun crest accents.',
    iconName: 'Crown',
    previewColor: '#78350f',
  },

  // Badges
  {
    id: 'badge_novice',
    name: 'Quest Pioneer',
    type: 'badge',
    price: 40,
    description: 'Bestowed on courageous adventurers undertaking their early trials.',
    iconName: 'Award',
  },
  {
    id: 'badge_scholar',
    name: 'Grand Scholar',
    type: 'badge',
    price: 70,
    description: 'Dedicated to persistent minds expanding their intellect.',
    iconName: 'BookOpen',
  },
  {
    id: 'badge_iron_will',
    name: 'Iron Will',
    type: 'badge',
    price: 90,
    description: 'Honoring relentless discipline and unyielding habits.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'badge_sentinel',
    name: 'Streak Sentinel',
    type: 'badge',
    price: 120,
    description: 'Guardian of the eternal flame, keeping the unbroken streak.',
    iconName: 'Flame',
  },

  // Avatar Accessories
  {
    id: 'acc_runestone',
    name: 'Mystic Runestone',
    type: 'accessory',
    price: 50,
    description: 'An ancient carving pulsing with arcane clarity.',
    iconName: 'Gem',
  },
  {
    id: 'acc_laurel',
    name: 'Golden Laurel',
    type: 'accessory',
    price: 95,
    description: 'A classic crown honoring victories won day by day.',
    iconName: 'Crown',
  },
  {
    id: 'acc_feather',
    name: 'Phoenix Feather',
    type: 'accessory',
    price: 130,
    description: 'An enduring talisman of perseverance and quiet rebirth.',
    iconName: 'Sparkles',
  },
];
