import React from 'react';
import {
  Coins,
  Shield,
  Compass,
  Flame,
  Crown,
  BookOpen,
  ShieldCheck,
  Gem,
  Sparkles,
  Award,
  Check,
} from 'lucide-react';
import { RewardItem } from '../types/rpg';

interface RewardCardProps {
  item: RewardItem;
  isOwned: boolean;
  isEquipped: boolean;
  userCoins: number;
  onPurchase: (item: RewardItem) => Promise<void>;
  onEquipToggle: (item: RewardItem) => Promise<void>;
  isProcessing: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Compass,
  Flame,
  Crown,
  BookOpen,
  ShieldCheck,
  Gem,
  Sparkles,
  Award,
};

export const RewardCard: React.FC<RewardCardProps> = ({
  item,
  isOwned,
  isEquipped,
  userCoins,
  onPurchase,
  onEquipToggle,
  isProcessing,
}) => {
  const Icon = ICON_MAP[item.iconName] || Award;
  const canAfford = userCoins >= item.price;

  const typeLabels = {
    theme: 'Profile Theme',
    badge: 'Guild Badge',
    accessory: 'Avatar Relic',
  };

  return (
    <div
      id={`reward-card-${item.id}`}
      className={`rpg-card p-5 relative flex flex-col justify-between transition-all duration-200 ${
        isEquipped
          ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
          : isOwned
          ? 'border-emerald-500/30'
          : 'border-white/5'
      }`}
    >
      <div>
        {/* Top Tag & Price */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border border-white/5">
            {typeLabels[item.type]}
          </span>

          <div className="flex items-center gap-1 font-mono-code text-xs font-bold text-amber-400">
            <Coins className="h-3.5 w-3.5" />
            <span>{item.price}</span>
          </div>
        </div>

        {/* Item Icon & Preview */}
        <div className="flex items-center gap-3.5 mb-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-sm"
            style={{
              backgroundColor: item.previewColor || 'rgba(245, 158, 11, 0.08)',
            }}
          >
            <Icon className="h-6 w-6 text-amber-400" />
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-white tracking-wide">
              {item.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
              {item.description}
            </p>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-3 border-t border-white/5 mt-2">
        {isOwned ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Owned
            </span>
            <button
              id={`equip-btn-${item.id}`}
              onClick={() => onEquipToggle(item)}
              disabled={isProcessing}
              className={`ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                isEquipped
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
              }`}
            >
              {isEquipped ? 'Active' : 'Equip'}
            </button>
          </div>
        ) : (
          <button
            id={`buy-btn-${item.id}`}
            onClick={() => onPurchase(item)}
            disabled={!canAfford || isProcessing}
            className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
              canAfford
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {isProcessing ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
            ) : (
              <Coins className="h-3.5 w-3.5" />
            )}
            <span>{canAfford ? `Acquire for ${item.price} Coins` : 'Insufficient Coins'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
