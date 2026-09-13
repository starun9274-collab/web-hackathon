import React from 'react';
import {
  User,
  Mail,
  Shield,
  Flame,
  Coins,
  Trophy,
  LogOut,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { UserProfile, InventoryItem } from '../types/rpg';
import { AttributeCard } from '../components/AttributeCard';
import { REWARD_SHOP_CATALOG } from '../utils/rpgFormulas';

interface ProfilePageProps {
  profile: UserProfile;
  inventory: InventoryItem[];
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profile,
  inventory,
  onLogout,
}) => {
  const activeBadgeItem = REWARD_SHOP_CATALOG.find((i) => i.id === profile.equippedBadge);
  const activeThemeItem = REWARD_SHOP_CATALOG.find((i) => i.id === profile.equippedTheme);
  const activeAccessoryItem = REWARD_SHOP_CATALOG.find((i) => i.id === profile.equippedAccessory);

  const joinDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="space-y-6 pb-16 md:pb-8 max-w-4xl mx-auto">
      {/* Hero Banner Card */}
      <div className="rpg-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Avatar and Identity */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 text-2xl font-bold font-display shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>

              {activeBadgeItem && (
                <div
                  title={`Badge: ${activeBadgeItem.name}`}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950 border-2 border-[#121826] shadow-sm"
                >
                  <Award className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display text-2xl font-bold text-white">
                  {profile.name}
                </h1>
                <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                  Level {profile.level}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {joinDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-white/5 px-3 py-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Streak</div>
                <div className="font-mono-code text-sm font-bold text-orange-300">
                  {profile.streak} Days
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-white/5 px-3 py-2">
              <Coins className="h-4 w-4 text-amber-400" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Coins</div>
                <div className="font-mono-code text-sm font-bold text-amber-300">
                  {profile.coins}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-white">
            Character Attributes
          </h2>
          <span className="text-xs text-slate-400">Progression from completed quests</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AttributeCard type="intellect" value={profile.attributes?.intellect ?? 0} />
          <AttributeCard type="strength" value={profile.attributes?.strength ?? 0} />
          <AttributeCard type="discipline" value={profile.attributes?.discipline ?? 0} />
          <AttributeCard type="creativity" value={profile.attributes?.creativity ?? 0} />
        </div>
      </div>

      {/* Equipped Hero Accoutrements */}
      <div className="rpg-card p-5 sm:p-6">
        <h2 className="font-display text-base font-bold text-white mb-4">
          Equipped Honors & Relics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Active Theme
            </span>
            <div className="font-display text-sm font-semibold text-slate-200 mt-1">
              {activeThemeItem ? activeThemeItem.name : 'Default Codex'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeThemeItem ? activeThemeItem.description : 'Standard dark fantasy interface.'}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Guild Badge
            </span>
            <div className="font-display text-sm font-semibold text-slate-200 mt-1">
              {activeBadgeItem ? activeBadgeItem.name : 'None Equipped'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeBadgeItem ? activeBadgeItem.description : 'Purchase and equip in the Reward Shop.'}
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Avatar Relic
            </span>
            <div className="font-display text-sm font-semibold text-slate-200 mt-1">
              {activeAccessoryItem ? activeAccessoryItem.name : 'None Equipped'}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeAccessoryItem ? activeAccessoryItem.description : 'Ancient relics enhance hero prestige.'}
            </p>
          </div>
        </div>
      </div>

      {/* Account Controls & Logout */}
      <div className="rpg-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-sm font-bold text-white">
            Account Session
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Securely sign out of your Life RPG session on this device.
          </p>
        </div>

        <button
          id="profile-logout-btn"
          onClick={onLogout}
          className="flex items-center justify-center gap-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-4 py-2.5 text-xs font-semibold text-rose-300 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out of Life RPG</span>
        </button>
      </div>
    </div>
  );
};
