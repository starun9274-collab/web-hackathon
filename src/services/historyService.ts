import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { TaskHistoryItem } from '../types/rpg';
import { getGuestHistory, GUEST_EVENT_NAME } from './localRpgStore';

/**
 * Real-time listener for recent task history
 */
export function subscribeToTaskHistory(
  userId: string,
  limitCount: number = 6,
  onHistory: (items: TaskHistoryItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (userId.startsWith('guest')) {
    onHistory(getGuestHistory(limitCount));
    const handler = () => {
      onHistory(getGuestHistory(limitCount));
    };
    window.addEventListener(GUEST_EVENT_NAME, handler);
    return () => {
      window.removeEventListener(GUEST_EVENT_NAME, handler);
    };
  }

  const historyColRef = collection(db, 'users', userId, 'taskHistory');
  const q = query(historyColRef, orderBy('completedAt', 'desc'), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: TaskHistoryItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<TaskHistoryItem, 'id'>),
      }));
      onHistory(items);
    },
    (err) => {
      console.error('Error loading task history:', err);
      if (onError) onError(err);
    }
  );
}
