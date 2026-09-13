import React from 'react';
import {
  Shield,
  Coins,
  Flame,
  LayoutDashboard,
  Scroll,
  ShoppingBag,
  User,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../types/rpg';

export type NavTab = 'dashboard' | 'quests' | 'rewards' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  profile: UserProfile | null;
  onLogout: () => void;
  onShowLanding?: () => void;
  isGuest?: boolean;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  profile,
  onLogout,
  onShowLanding,
  isGuest = false,
  onOpenAuth,
}) => {
  const tabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quests' as NavTab, label: 'Quests', icon: Scroll },
    { id: 'rewards' as NavTab, label: 'Rewards', icon: ShoppingBag },
    { id: 'profile' as NavTab, label: 'Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Identity */}
          <div
            id="brand-logo"
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 shadow-sm group-hover:border-amber-400/50 transition-colors">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-wide text-slate-100">
                  LIFE RPG
                </span>
                <span className="hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Hero Tier
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/60 p-1 border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User RPG Snapshot & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isGuest && onOpenAuth && (
              <button
                type="button"
                id="nav-guest-sync-btn"
                onClick={onOpenAuth}
                title="Playing in Guest Mode. Click to sign in and back up your hero to Cloud Firestore."
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Guest</span>
                <span className="text-amber-400/80 font-normal">| Sync Cloud</span>
              </button>
            )}

            {onShowLanding && (
              <button
                type="button"
                id="nav-landing-page-btn"
                onClick={onShowLanding}
                title="View Life RPG Landing Page"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
              >
                <span>Overview</span>
              </button>
            )}

            {profile && (
              <>
                {/* Streak Counter */}
                <div
                  id="nav-streak"
                  title={`${profile.streak} Day Streak`}
                  className="flex items-center gap-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 text-xs font-semibold text-orange-400"
                >
                  <Flame className="h-3.5 w-3.5 fill-orange-500/20 text-orange-400 animate-pulse" />
                  <span>{profile.streak}d</span>
                </div>

                {/* Coins Counter */}
                <div
                  id="nav-coins"
                  title={`${profile.coins} Coins`}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-300"
                >
                  <Coins className="h-3.5 w-3.5 text-amber-400" />
                  <span>{profile.coins}</span>
                </div>

                {/* Level Badge */}
                <div
                  id="nav-level"
                  title={`Level ${profile.level}`}
                  className="flex items-center gap-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 text-xs font-bold text-indigo-300"
                >
                  <span className="text-[10px] uppercase text-indigo-400">LV</span>
                  <span>{profile.level}</span>
                </div>

                {/* Logout Button */}
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  title="Log out of Life RPG"
                  aria-label="Log out"
                  className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-rose-400 transition-colors border border-transparent hover:border-white/5"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0b0f19]/95 backdrop-blur-lg px-2 py-1.5">
        <div className="grid grid-cols-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4 mb-1" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
