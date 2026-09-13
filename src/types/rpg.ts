export type QuestCategory = 'Study' | 'Exercise' | 'Habit' | 'Creative';

export type AttributeType = 'intellect' | 'strength' | 'discipline' | 'creativity';

export interface UserAttributes {
  intellect: number;
  strength: number;
  discipline: number;
  creativity: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  totalXP: number;
  currentXP: number;
  coins: number;
  streak: number;
  lastActivityDate: string | null;
  attributes: UserAttributes;
  createdAt: string;
  equippedTheme?: string;
  equippedBadge?: string;
  equippedAccessory?: string;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  category: QuestCategory;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface TaskHistoryItem {
  id: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  category: QuestCategory;
  xpEarned: number;
  coinsEarned: number;
  completedAt: string;
}

export type RewardItemType = 'theme' | 'badge' | 'accessory';

export interface RewardItem {
  id: string;
  name: string;
  type: RewardItemType;
  price: number;
  description: string;
  iconName: string;
  previewColor?: string;
}

export interface InventoryItem {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  itemType: RewardItemType;
  purchasedAt: string;
}

export interface QuestCompletionResult {
  questId: string;
  questTitle: string;
  category: QuestCategory;
  xpEarned: number;
  coinsEarned: number;
  attributeImproved: AttributeType;
  newLevel: number;
  leveledUp: boolean;
  newStreak: number;
  newCoins: number;
  newTotalXP: number;
}
