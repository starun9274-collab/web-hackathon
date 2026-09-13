import { useState, useEffect } from 'react';
import { InventoryItem } from '../types/rpg';
import { subscribeToInventory } from '../services/inventoryService';

export function useInventory(userId: string | undefined) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setInventory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToInventory(
      userId,
      (items) => {
        setInventory(items);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to load inventory.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const isOwned = (itemId: string): boolean => {
    return inventory.some((item) => item.itemId === itemId);
  };

  return { inventory, loading, error, isOwned };
}
