import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Fixed category rules
const CATEGORY_RULES: Record<string, { xp: number; coins: number; attribute: string }> = {
  Study: { xp: 40, coins: 10, attribute: 'intellect' },
  Exercise: { xp: 40, coins: 10, attribute: 'strength' },
  Habit: { xp: 30, coins: 10, attribute: 'discipline' },
  Creative: { xp: 40, coins: 10, attribute: 'creativity' },
};

// Non-linear level formula: 100 * level^1.5
function getXpRequired(level: number): number {
  return Math.round(100 * Math.pow(Math.max(1, Math.floor(level)), 1.5));
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Authoritative completeQuest Cloud Function
 */
export const completeQuest = onCall(async (request) => {
  // 1. Verify user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated to complete quests.');
  }

  const userId = request.auth.uid;
  const questId = request.data?.questId;

  if (!questId || typeof questId !== 'string') {
    throw new HttpsError('invalid-argument', 'A valid questId is required.');
  }

  const questRef = db.collection('users').doc(userId).collection('quests').doc(questId);
  const userRef = db.collection('users').doc(userId);

  return await db.runTransaction(async (transaction) => {
    // 2. Verify quest exists and belongs to user
    const questSnap = await transaction.get(questRef);
    if (!questSnap.exists) {
      throw new HttpsError('not-found', 'Quest not found.');
    }

    const questData = questSnap.data();
    if (!questData || questData.userId !== userId) {
      throw new HttpsError('permission-denied', 'You do not have permission to access this quest.');
    }

    // 3. Verify quest is not already completed
    if (questData.completed) {
      throw new HttpsError('failed-precondition', 'This quest has already been completed.');
    }

    // 4. Read user document
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'User profile not found.');
    }

    const userData = userSnap.data() || {};
    const category = questData.category as string;
    const rule = CATEGORY_RULES[category];

    if (!rule) {
      throw new HttpsError('invalid-argument', `Invalid quest category: ${category}`);
    }

    const earnedXP = rule.xp;
    const earnedCoins = rule.coins;
    const improvedAttr = rule.attribute;

    // 5. Calculate non-linear level progression
    let currentLevel = userData.level || 1;
    let currentXP = (userData.currentXP || 0) + earnedXP;
    let leveledUp = false;

    while (true) {
      const required = getXpRequired(currentLevel);
      if (currentXP >= required) {
        currentXP -= required;
        currentLevel += 1;
        leveledUp = true;
      } else {
        break;
      }
    }

    // 6. Calculate streak
    const now = new Date();
    const todayStr = formatDate(now);
    const lastActivity = userData.lastActivityDate || null;
    let newStreak = userData.streak || 0;

    if (!lastActivity) {
      newStreak = 1;
    } else if (lastActivity === todayStr) {
      newStreak = Math.max(1, newStreak);
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);

      if (lastActivity === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    // 7. Update attributes
    const currentAttrs = userData.attributes || { intellect: 0, strength: 0, discipline: 0, creativity: 0 };
    const newAttrs = {
      ...currentAttrs,
      [improvedAttr]: (currentAttrs[improvedAttr] || 0) + 1,
    };

    const newCoins = (userData.coins || 0) + earnedCoins;
    const newTotalXP = (userData.totalXP || 0) + earnedXP;
    const nowIso = now.toISOString();

    // 8. Update quest
    transaction.update(questRef, {
      completed: true,
      completedAt: nowIso,
      updatedAt: nowIso,
    });

    // 9. Update user stats
    transaction.update(userRef, {
      level: currentLevel,
      currentXP,
      totalXP: newTotalXP,
      coins: newCoins,
      streak: newStreak,
      lastActivityDate: todayStr,
      attributes: newAttrs,
    });

    // 10. Record history
    const historyRef = db.collection('users').doc(userId).collection('taskHistory').doc();
    transaction.set(historyRef, {
      userId,
      taskId: questId,
      taskTitle: questData.title,
      category,
      xpEarned: earnedXP,
      coinsEarned: earnedCoins,
      completedAt: nowIso,
    });

    return {
      questId,
      questTitle: questData.title,
      category,
      xpEarned: earnedXP,
      coinsEarned: earnedCoins,
      attributeImproved: improvedAttr,
      newLevel: currentLevel,
      leveledUp,
      newStreak,
      newCoins,
      newTotalXP,
    };
  });
});

/**
 * Authoritative purchaseReward Cloud Function
 */
export const purchaseReward = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const userId = request.auth.uid;
  const itemId = request.data?.itemId;

  // Authoritative catalog
  const CATALOG: Record<string, { name: string; type: string; price: number }> = {
    theme_obsidian: { name: 'Obsidian Knight', type: 'theme', price: 60 },
    theme_emerald: { name: 'Emerald Ranger', type: 'theme', price: 80 },
    theme_crimson: { name: 'Crimson Vanguard', type: 'theme', price: 100 },
    theme_solar: { name: 'Solar Paladin', type: 'theme', price: 150 },
    badge_novice: { name: 'Quest Pioneer', type: 'badge', price: 40 },
    badge_scholar: { name: 'Grand Scholar', type: 'badge', price: 70 },
    badge_iron_will: { name: 'Iron Will', type: 'badge', price: 90 },
    badge_sentinel: { name: 'Streak Sentinel', type: 'badge', price: 120 },
    acc_runestone: { name: 'Mystic Runestone', type: 'accessory', price: 50 },
    acc_laurel: { name: 'Golden Laurel', type: 'accessory', price: 95 },
    acc_feather: { name: 'Phoenix Feather', type: 'accessory', price: 130 },
  };

  const item = CATALOG[itemId];
  if (!item) {
    throw new HttpsError('not-found', 'Item not found in catalog.');
  }

  const userRef = db.collection('users').doc(userId);
  const inventoryRef = db.collection('users').doc(userId).collection('inventory').doc(itemId);

  return await db.runTransaction(async (transaction) => {
    const invSnap = await transaction.get(inventoryRef);
    if (invSnap.exists) {
      throw new HttpsError('already-exists', 'Item already owned.');
    }

    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'User profile not found.');
    }

    const currentCoins = userSnap.data()?.coins || 0;
    if (currentCoins < item.price) {
      throw new HttpsError('failed-precondition', 'Insufficient coins.');
    }

    const remainingCoins = currentCoins - item.price;
    const nowIso = new Date().toISOString();

    transaction.update(userRef, { coins: remainingCoins });
    transaction.set(inventoryRef, {
      userId,
      itemId,
      itemName: item.name,
      itemType: item.type,
      purchasedAt: nowIso,
    });

    return {
      success: true,
      itemId,
      remainingCoins,
    };
  });
});
