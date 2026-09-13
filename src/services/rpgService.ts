import {
  doc,
  runTransaction,
  collection,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import {
  Quest,
  UserProfile,
  QuestCompletionResult,
  RewardItem,
} from '../types/rpg';
import {
  CATEGORY_CONFIG,
  calculateLevelProgression,
  calculateNewStreak,
  REWARD_SHOP_CATALOG,
} from '../utils/rpgFormulas';
import { completeGuestQuest, purchaseGuestReward } from './localRpgStore';

/**
 * Authoritative Quest Completion Service.
 * Ensures the client NEVER supplies XP, coins, attributes, or streak values.
 * All rewards, calculations, streaks, and level progression are calculated authoritatively.
 */
export async function executeCompleteQuest(
  userId: string,
  questId: string
): Promise<QuestCompletionResult> {
  if (userId.startsWith('guest')) {
    return completeGuestQuest(questId);
  }

  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || currentAuthUser.uid !== userId) {
    throw new Error('Unauthorized. You must be logged in to complete quests.');
  }

  const questDocRef = doc(db, 'users', userId, 'quests', questId);
  const userDocRef = doc(db, 'users', userId);

  // Execute atomic authoritative transaction
  return await runTransaction(db, async (transaction) => {
    // 1. Verify Quest exists and belongs to user
    const questSnap = await transaction.get(questDocRef);
    if (!questSnap.exists()) {
      throw new Error('Quest not found.');
    }

    const questData = questSnap.data() as Quest;
    if (questData.userId !== userId) {
      throw new Error('Unauthorized. This quest belongs to another adventurer.');
    }

    // 2. Verify quest is not already completed
    if (questData.completed) {
      throw new Error('This quest has already been completed.');
    }

    // 3. Read current user RPG profile
    const userSnap = await transaction.get(userDocRef);
    if (!userSnap.exists()) {
      throw new Error('User profile record not found.');
    }
    const userData = userSnap.data() as UserProfile;

    // 4. Determine rewards authoritatively based on verified category
    const categoryRule = CATEGORY_CONFIG[questData.category];
    if (!categoryRule) {
      throw new Error(`Unrecognized quest category: ${questData.category}`);
    }

    const earnedXP = categoryRule.xp;
    const earnedCoins = categoryRule.coins;
    const improvedAttr = categoryRule.attribute;

    // 5. Authoritatively calculate non-linear level progression
    const currentLevel = userData.level || 1;
    const currentXP = userData.currentXP || 0;
    const totalXP = userData.totalXP || 0;

    const progression = calculateLevelProgression(currentLevel, currentXP, earnedXP);

    // 6. Authoritatively calculate streak
    const currentStreak = userData.streak || 0;
    const lastActivity = userData.lastActivityDate || null;
    const streakResult = calculateNewStreak(currentStreak, lastActivity);

    // 7. Authoritatively increment attribute
    const currentAttrs = userData.attributes || { intellect: 0, strength: 0, discipline: 0, creativity: 0 };
    const newAttrs = {
      ...currentAttrs,
      [improvedAttr]: (currentAttrs[improvedAttr] || 0) + 1,
    };

    const newCoins = (userData.coins || 0) + earnedCoins;
    const newTotalXP = totalXP + earnedXP;
    const nowIso = new Date().toISOString();

    // 8. Update Quest status to completed
    transaction.update(questDocRef, {
      completed: true,
      completedAt: nowIso,
      updatedAt: nowIso,
    });

    // 9. Update User RPG document with verified authoritative values
    transaction.update(userDocRef, {
      level: progression.newLevel,
      currentXP: progression.newCurrentXP,
      totalXP: newTotalXP,
      coins: newCoins,
      streak: streakResult.newStreak,
      lastActivityDate: streakResult.todayDateStr,
      attributes: newAttrs,
    });

    // 10. Record Task History item
    const historyColRef = collection(db, 'users', userId, 'taskHistory');
    const newHistoryDocRef = doc(historyColRef);
    transaction.set(newHistoryDocRef, {
      userId,
      taskId: questId,
      taskTitle: questData.title,
      category: questData.category,
      xpEarned: earnedXP,
      coinsEarned: earnedCoins,
      completedAt: nowIso,
    });

    return {
      questId,
      questTitle: questData.title,
      category: questData.category,
      xpEarned: earnedXP,
      coinsEarned: earnedCoins,
      attributeImproved: improvedAttr,
      newLevel: progression.newLevel,
      leveledUp: progression.leveledUp,
      newStreak: streakResult.newStreak,
      newCoins,
      newTotalXP,
    };
  });
}

/**
 * Authoritative Virtual Reward Purchase Service.
 * Protects against negative coins, duplicate purchases, and client-side price tampering.
 */
export async function executePurchaseReward(
  userId: string,
  itemId: string
): Promise<{ success: boolean; item: RewardItem; remainingCoins: number }> {
  if (userId.startsWith('guest')) {
    const invItem = await purchaseGuestReward(itemId);
    const catalogItem = REWARD_SHOP_CATALOG.find((item) => item.id === itemId)!;
    const { getGuestProfile } = await import('./localRpgStore');
    return {
      success: true,
      item: catalogItem,
      remainingCoins: getGuestProfile().coins,
    };
  }

  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || currentAuthUser.uid !== userId) {
    throw new Error('Unauthorized. You must be logged in to purchase rewards.');
  }

  // Authoritative catalog check (never trust client prices)
  const catalogItem = REWARD_SHOP_CATALOG.find((item) => item.id === itemId);
  if (!catalogItem) {
    throw new Error('Invalid item. Item does not exist in the official guild shop.');
  }

  const userDocRef = doc(db, 'users', userId);
  const inventoryDocRef = doc(db, 'users', userId, 'inventory', itemId);

  return await runTransaction(db, async (transaction) => {
    // 1. Check if user already owns this item
    const inventorySnap = await transaction.get(inventoryDocRef);
    if (inventorySnap.exists()) {
      throw new Error('You already own this item.');
    }

    // 2. Check user coins
    const userSnap = await transaction.get(userDocRef);
    if (!userSnap.exists()) {
      throw new Error('User profile record not found.');
    }

    const userData = userSnap.data() as UserProfile;
    const currentCoins = userData.coins || 0;

    if (currentCoins < catalogItem.price) {
      throw new Error(`Insufficient coins. You have ${currentCoins} coins, but this item costs ${catalogItem.price} coins.`);
    }

    const remainingCoins = currentCoins - catalogItem.price;
    const nowIso = new Date().toISOString();

    // 3. Deduct coins from user
    transaction.update(userDocRef, {
      coins: remainingCoins,
    });

    // 4. Add item to user inventory
    transaction.set(inventoryDocRef, {
      userId,
      itemId: catalogItem.id,
      itemName: catalogItem.name,
      itemType: catalogItem.type,
      purchasedAt: nowIso,
    });

    return {
      success: true,
      item: catalogItem,
      remainingCoins,
    };
  });
}
