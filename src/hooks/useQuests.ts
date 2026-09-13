import { useState, useEffect } from 'react';
import { Quest } from '../types/rpg';
import { subscribeToQuests } from '../services/questService';

export function useQuests(userId: string | undefined) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setQuests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToQuests(
      userId,
      (updatedQuests) => {
        setQuests(updatedQuests);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load quests.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

  return { quests, activeQuests, completedQuests, loading, error };
}
