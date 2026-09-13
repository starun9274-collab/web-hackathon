import React, { useState } from 'react';
import { Coins, ShoppingBag, CheckCircle, Sparkles, Shield, AlertCircle } from 'lucide-react';
import { UserProfile, RewardItem, InventoryItem, RewardItemType } from '../types/rpg';
import { REWARD_SHOP_CATALOG } from '../utils/rpgFormulas';
import { RewardCard } from '../components/RewardCard';

interface RewardsPageProps {
  profile: UserProfile;
  inventory: InventoryItem[];
  onPurchaseReward: (itemId: string) => Promise<void>;
  onEquipCosmetic: (type: RewardItemType, itemId: string) => Promise<void>;
  onUnequipCosmetic: (type: RewardItemType) => Promise<void>;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({
  profile,
  inventory,
  onPurchaseReward,
  onEquipCosmetic,
  onUnequipCosmetic,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'theme' | 'badge' | 'accessory'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const ownedMap = new Set(inventory.map((inv) => inv.itemId));

  const filteredItems = REWARD_SHOP_CATALOG.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.type === activeCategory;
  });

  const handlePurchase = async (item: RewardItem) => {
    try {
      setProcessingId(item.id);
      setPageError(null);
      setSuccessToast(null);
      await onPurchaseReward(item.id);
      setSuccessToast(`Acquired ${item.name}! You can now equip it.`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Failed to purchase reward.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEquipToggle = async (item: RewardItem) => {
    try {
      setProcessingId(item.id);
      setPageError(null);

      const isCurrentlyEquipped =
        item.type === 'theme'
          ? profile.equippedTheme === item.id
          : item.type === 'badge'
          ? profile.equippedBadge === item.id
          : profile.equippedAccessory === item.id;

      if (isCurrentlyEquipped) {
        await onUnequipCosmetic(item.type);
      } else {
        await onEquipCosmetic(item.type, item.id);
      }
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Failed to equip cosmetic.');
    } finally {
      setProcessingId(null);
    }
  };

  const ownedCount = inventory.length;

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* Header with Treasury balance */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Guild Treasury & Vault
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Reward Shop
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exchange honorably earned quest coins for themes, insignias, and heroic relics.
          </p>
        </div>

        {/* Big Coin Badge */}
        <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 px-5 py-3 self-start sm:self-auto shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400">Available Coins</div>
            <div className="font-mono-code text-xl font-bold text-amber-300">
              {profile.coins} Coins
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {pageError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{pageError}</span>
        </div>
      )}

      {successToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        <button
          id="rewards-tab-all"
          onClick={() => setActiveCategory('all')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Wares ({REWARD_SHOP_CATALOG.length})
        </button>
        <button
          id="rewards-tab-theme"
          onClick={() => setActiveCategory('theme')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeCategory === 'theme'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Profile Themes
        </button>
        <button
          id="rewards-tab-badge"
          onClick={() => setActiveCategory('badge')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeCategory === 'badge'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Guild Badges
        </button>
        <button
          id="rewards-tab-accessory"
          onClick={() => setActiveCategory('accessory')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeCategory === 'accessory'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Avatar Relics
        </button>

        <span className="ml-auto text-xs text-slate-400 hidden sm:inline">
          Owned: <span className="font-mono-code text-amber-300 font-semibold">{ownedCount}</span> / {REWARD_SHOP_CATALOG.length}
        </span>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isOwned = ownedMap.has(item.id);
          const isEquipped =
            item.type === 'theme'
              ? profile.equippedTheme === item.id
              : item.type === 'badge'
              ? profile.equippedBadge === item.id
              : profile.equippedAccessory === item.id;

          return (
            <RewardCard
              key={item.id}
              item={item}
              isOwned={isOwned}
              isEquipped={isEquipped}
              userCoins={profile.coins}
              onPurchase={handlePurchase}
              onEquipToggle={handleEquipToggle}
              isProcessing={processingId === item.id}
            />
          );
        })}
      </div>
    </div>
  );
};
