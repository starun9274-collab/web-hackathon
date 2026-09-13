import {
  UserProfile,
  Quest,
  InventoryItem,
  TaskHistoryItem,
  QuestCompletionResult,
  QuestCategory,
  RewardItemType,
} from '../types/rpg';
import {
  CATEGORY_CONFIG,
  calculateLevelProgression,
  calculateNewStreak,
  REWARD_SHOP_CATALOG,
} from '../utils/rpgFormulas';

const GUEST_PROFILE_KEY = 'life_rpg_guest_profile';
const GUEST_QUESTS_KEY = 'life_rpg_guest_quests';
const GUEST_INVENTORY_KEY = 'life_rpg_guest_inventory';
const GUEST_HISTORY_KEY = 'life_rpg_guest_history';
export const GUEST_EVENT_NAME = 'life_rpg_guest_update';

function notifyGuestUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(GUEST_EVENT_NAME));
  }
}

export function getGuestProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read guest profile:', e);
  }

  const initial: UserProfile = {
    id: 'guest-hero',
    name: 'Guest Hero',
    email: 'guest@realm.local',
    level: 1,
    totalXP: 45,
    currentXP: 45,
    coins: 60,
    streak: 3,
    lastActivityDate: new Date().toISOString(),
    attributes: {
      intellect: 12,
      strength: 10,
      discipline: 14,
      creativity: 11,
    },
    createdAt: new Date().toISOString(),
    equippedTheme: 'default',
    equippedBadge: 'badge_novice',
  };
  localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(initial));
  return initial;
}

export function saveGuestProfile(profile: UserProfile): void {
  localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile));
  notifyGuestUpdate();
}

export function getGuestQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(GUEST_QUESTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read guest quests:', e);
  }

  const starterQuests: Quest[] = [
    {
      id: 'quest-guest-1',
      userId: 'guest-hero',
      title: 'Review System Design architecture guide',
      category: 'Study',
      completed: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'quest-guest-2',
      userId: 'guest-hero',
      title: '30-minute core workout & stretching',
      category: 'Exercise',
      completed: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'quest-guest-3',
      userId: 'guest-hero',
      title: 'Maintain daily morning focus routine',
      category: 'Habit',
      completed: true,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      completedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'quest-guest-4',
      userId: 'guest-hero',
      title: 'Draft concept illustration & world lore',
      category: 'Creative',
      completed: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ];
  localStorage.setItem(GUEST_QUESTS_KEY, JSON.stringify(starterQuests));
  return starterQuests;
}

export function saveGuestQuests(quests: Quest[]): void {
  localStorage.setItem(GUEST_QUESTS_KEY, JSON.stringify(quests));
  notifyGuestUpdate();
}

export async function createGuestQuest(
  title: string,
  category: QuestCategory
): Promise<string> {
  const quests = getGuestQuests();
  const id = 'quest-guest-' + Date.now();
  const newQuest: Quest = {
    id,
    userId: 'guest-hero',
    title: title.trim(),
    category,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  quests.unshift(newQuest);
  saveGuestQuests(quests);
  return id;
}

export async function updateGuestQuest(
  questId: string,
  updates: Partial<Quest>
): Promise<void> {
  const quests = getGuestQuests();
  const idx = quests.findIndex((q) => q.id === questId);
  if (idx !== -1) {
    quests[idx] = { ...quests[idx], ...updates, updatedAt: new Date().toISOString() };
    saveGuestQuests(quests);
  }
}

export async function deleteGuestQuest(questId: string): Promise<void> {
  const quests = getGuestQuests();
  const filtered = quests.filter((q) => q.id !== questId);
  saveGuestQuests(filtered);
}

export async function completeGuestQuest(
  questId: string
): Promise<QuestCompletionResult> {
  const quests = getGuestQuests();
  const quest = quests.find((q) => q.id === questId);
  if (!quest) throw new Error('Quest not found.');
  if (quest.completed) throw new Error('Quest already completed.');

  const profile = getGuestProfile();
  const config = CATEGORY_CONFIG[quest.category];
  const earnedXP = config.xp;
  const earnedCoins = config.coins;
  const improvedAttr = config.attribute;

  // Level calculation
  const { newLevel, newCurrentXP, leveledUp } = calculateLevelProgression(
    profile.level,
    profile.currentXP,
    earnedXP
  );

  // Streak calculation
  const streakRes = calculateNewStreak(profile.streak, profile.lastActivityDate);
  const newStreak = streakRes.newStreak;
  const now = new Date().toISOString();

  // Update Quest
  quest.completed = true;
  quest.completedAt = now;
  saveGuestQuests(quests);

  // Update Profile
  const updatedProfile: UserProfile = {
    ...profile,
    level: newLevel,
    currentXP: newCurrentXP,
    totalXP: profile.totalXP + earnedXP,
    coins: profile.coins + earnedCoins,
    streak: newStreak,
    lastActivityDate: streakRes.todayDateStr,
    attributes: {
      ...profile.attributes,
      [improvedAttr]: (profile.attributes[improvedAttr] || 10) + 1,
    },
  };
  saveGuestProfile(updatedProfile);

  // Add History
  addGuestHistory({
    id: 'hist-' + Date.now(),
    userId: 'guest-hero',
    taskId: quest.id,
    taskTitle: quest.title,
    category: quest.category,
    xpEarned: earnedXP,
    coinsEarned: earnedCoins,
    completedAt: now,
  });

  return {
    questId: quest.id,
    questTitle: quest.title,
    category: quest.category,
    xpEarned: earnedXP,
    coinsEarned: earnedCoins,
    attributeImproved: improvedAttr,
    newLevel,
    leveledUp,
    newStreak,
    newCoins: updatedProfile.coins,
    newTotalXP: updatedProfile.totalXP,
  };
}

export function getGuestInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(GUEST_INVENTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read guest inventory:', e);
  }
  const initial: InventoryItem[] = [
    {
      id: 'inv-guest-1',
      userId: 'guest-hero',
      itemId: 'badge_novice',
      itemName: 'Novice Seal',
      itemType: 'badge',
      purchasedAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(GUEST_INVENTORY_KEY, JSON.stringify(initial));
  return initial;
}

export async function purchaseGuestReward(rewardId: string): Promise<InventoryItem> {
  const catalogItem = REWARD_SHOP_CATALOG.find((i) => i.id === rewardId);
  if (!catalogItem) throw new Error('Reward item not found.');

  const profile = getGuestProfile();
  if (profile.coins < catalogItem.price) {
    throw new Error(`Insufficient gold coins. Requires ${catalogItem.price} coins.`);
  }

  const inv = getGuestInventory();
  if (inv.some((i) => i.itemId === rewardId)) {
    throw new Error('You already possess this artifact.');
  }

  // Deduct coins
  profile.coins -= catalogItem.price;
  saveGuestProfile(profile);

  const newItem: InventoryItem = {
    id: 'inv-guest-' + Date.now(),
    userId: 'guest-hero',
    itemId: catalogItem.id,
    itemName: catalogItem.name,
    itemType: catalogItem.type,
    purchasedAt: new Date().toISOString(),
  };
  inv.push(newItem);
  localStorage.setItem(GUEST_INVENTORY_KEY, JSON.stringify(inv));
  notifyGuestUpdate();
  return newItem;
}

export async function equipGuestCosmetic(
  type: RewardItemType,
  itemId: string
): Promise<void> {
  const profile = getGuestProfile();
  if (type === 'theme') profile.equippedTheme = itemId;
  if (type === 'badge') profile.equippedBadge = itemId;
  if (type === 'accessory') profile.equippedAccessory = itemId;
  saveGuestProfile(profile);
}

export async function unequipGuestCosmetic(type: RewardItemType): Promise<void> {
  const profile = getGuestProfile();
  if (type === 'theme') profile.equippedTheme = 'default';
  if (type === 'badge') profile.equippedBadge = '';
  if (type === 'accessory') profile.equippedAccessory = '';
  saveGuestProfile(profile);
}

export function getGuestHistory(limitCount: number = 10): TaskHistoryItem[] {
  try {
    const raw = localStorage.getItem(GUEST_HISTORY_KEY);
    if (raw) {
      const items: TaskHistoryItem[] = JSON.parse(raw);
      return items.slice(0, limitCount);
    }
  } catch (e) {
    console.error('Failed to read guest history:', e);
  }

  const initial: TaskHistoryItem[] = [
    {
      id: 'hist-guest-init',
      userId: 'guest-hero',
      taskId: 'quest-guest-3',
      taskTitle: 'Maintain daily morning focus routine',
      category: 'Habit',
      xpEarned: 30,
      coinsEarned: 10,
      completedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];
  localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(initial));
  return initial.slice(0, limitCount);
}

function addGuestHistory(item: TaskHistoryItem): void {
  try {
    const raw = localStorage.getItem(GUEST_HISTORY_KEY);
    const list: TaskHistoryItem[] = raw ? JSON.parse(raw) : [];
    list.unshift(item);
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
    notifyGuestUpdate();
  } catch (e) {
    console.error('Failed to save guest history item:', e);
  }
}
