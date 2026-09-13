import { useState, useEffect } from 'react';
import { TaskHistoryItem } from '../types/rpg';
import { subscribeToTaskHistory } from '../services/historyService';

export function useHistory(userId: string | undefined, limitCount: number = 6) {
  const [history, setHistory] = useState<TaskHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToTaskHistory(
      userId,
      limitCount,
      (items) => {
        setHistory(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load task history.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, limitCount]);

  return { history, loading, error };
}
