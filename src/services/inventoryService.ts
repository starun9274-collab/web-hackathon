import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { InventoryItem } from '../types/rpg';
import {
  getGuestInventory,
  equipGuestCosmetic,
  unequipGuestCosmetic,
  GUEST_EVENT_NAME,
} from './localRpgStore';

/**
 * Real-time listener for user inventory
 */
export function subscribeToInventory(
  userId: string,
  onInventory: (items: InventoryItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (userId.startsWith('guest')) {
    onInventory(getGuestInventory());
    const handler = () => {
      onInventory(getGuestInventory());
    };
    window.addEventListener(GUEST_EVENT_NAME, handler);
    return () => {
      window.removeEventListener(GUEST_EVENT_NAME, handler);
    };
  }

  const inventoryColRef = collection(db, 'users', userId, 'inventory');
  const q = query(inventoryColRef, orderBy('purchasedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: InventoryItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<InventoryItem, 'id'>),
      }));
      onInventory(items);
    },
    (err) => {
      console.error('Error listening to inventory:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Equips a purchased theme, badge, or accessory onto the user profile
 */
export async function equipCosmetic(
  userId: string,
  type: 'theme' | 'badge' | 'accessory',
  itemId: string
): Promise<void> {
  if (userId.startsWith('guest')) {
    return equipGuestCosmetic(type, itemId);
  }

  const userDocRef = doc(db, 'users', userId);
  const fieldName =
    type === 'theme'
      ? 'equippedTheme'
      : type === 'badge'
      ? 'equippedBadge'
      : 'equippedAccessory';

  await updateDoc(userDocRef, {
    [fieldName]: itemId,
  });
}

/**
 * Unequips a cosmetic
 */
export async function unequipCosmetic(
  userId: string,
  type: 'theme' | 'badge' | 'accessory'
): Promise<void> {
  if (userId.startsWith('guest')) {
    return unequipGuestCosmetic(type);
  }

  const userDocRef = doc(db, 'users', userId);
  const fieldName =
    type === 'theme'
      ? 'equippedTheme'
      : type === 'badge'
      ? 'equippedBadge'
      : 'equippedAccessory';

  await updateDoc(userDocRef, {
    [fieldName]: '',
  });
}
