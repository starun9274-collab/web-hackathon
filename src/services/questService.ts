import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Quest, QuestCategory } from '../types/rpg';
import {
  getGuestQuests,
  createGuestQuest,
  updateGuestQuest,
  deleteGuestQuest,
  GUEST_EVENT_NAME,
} from './localRpgStore';

/**
 * Validates quest fields before submission
 */
export function validateQuestInput(title: string, category: string): { valid: boolean; error?: string } {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return { valid: false, error: 'Quest title cannot be empty.' };
  }
  if (trimmedTitle.length < 3) {
    return { valid: false, error: 'Quest title must be at least 3 characters long.' };
  }
  if (trimmedTitle.length > 100) {
    return { valid: false, error: 'Quest title is too long (maximum 100 characters).' };
  }
  const validCategories: QuestCategory[] = ['Study', 'Exercise', 'Habit', 'Creative'];
  if (!validCategories.includes(category as QuestCategory)) {
    return { valid: false, error: 'Please choose a valid Quest category.' };
  }
  return { valid: true };
}

/**
 * Creates a new quest in Firestore: users/{userId}/quests
 */
export async function createQuest(
  userId: string,
  title: string,
  category: QuestCategory
): Promise<string> {
  const validation = validateQuestInput(title, category);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (userId.startsWith('guest')) {
    return createGuestQuest(title, category);
  }

  const questsColRef = collection(db, 'users', userId, 'quests');
  const now = new Date().toISOString();

  const docRef = await addDoc(questsColRef, {
    userId,
    title: title.trim(),
    category,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Updates an existing quest in Firestore
 */
export async function updateQuest(
  userId: string,
  questId: string,
  title: string,
  category: QuestCategory
): Promise<void> {
  const validation = validateQuestInput(title, category);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (userId.startsWith('guest')) {
    return updateGuestQuest(questId, { title: title.trim(), category });
  }

  const questDocRef = doc(db, 'users', userId, 'quests', questId);
  await updateDoc(questDocRef, {
    title: title.trim(),
    category,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Deletes a quest from Firestore
 */
export async function deleteQuest(userId: string, questId: string): Promise<void> {
  if (userId.startsWith('guest')) {
    return deleteGuestQuest(questId);
  }
  const questDocRef = doc(db, 'users', userId, 'quests', questId);
  await deleteDoc(questDocRef);
}

/**
 * Real-time listener for user's quests
 */
export function subscribeToQuests(
  userId: string,
  onQuests: (quests: Quest[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  if (userId.startsWith('guest')) {
    onQuests(getGuestQuests());
    const handler = () => {
      onQuests(getGuestQuests());
    };
    window.addEventListener(GUEST_EVENT_NAME, handler);
    return () => {
      window.removeEventListener(GUEST_EVENT_NAME, handler);
    };
  }

  const questsColRef = collection(db, 'users', userId, 'quests');
  const q = query(questsColRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const quests: Quest[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Quest, 'id'>),
      }));
      onQuests(quests);
    },
    (err) => {
      console.error('Error listening to quests:', err);
      if (onError) onError(err);
    }
  );
}
