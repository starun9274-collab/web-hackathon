import React, { useState } from 'react';
import {
  Coins,
  CheckCircle,
  Plus,
  ArrowRight,
  BookOpen,
  Dumbbell,
  Sparkles,
  History,
  Shield,
  Clock,
} from 'lucide-react';
import { UserProfile, Quest, TaskHistoryItem, QuestCategory, QuestCompletionResult } from '../types/rpg';
import { XPProgressBar } from '../components/XPProgressBar';
import { AttributeCard } from '../components/AttributeCard';
import { StreakBadge } from '../components/StreakBadge';
import { CATEGORY_CONFIG } from '../utils/rpgFormulas';

interface DashboardPageProps {
  profile: UserProfile;
  activeQuests: Quest[];
  recentHistory: TaskHistoryItem[];
  onCompleteQuest: (questId: string) => Promise<void>;
  onOpenCreateQuest: () => void;
  onNavigateToQuests: () => void;
  onNavigateToRewards: () => void;
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let timeStr = 'evening';
  if (hour < 12) timeStr = 'morning';
  else if (hour < 17) timeStr = 'afternoon';
  return `Good ${timeStr}, ${name || 'Hero'}`;
}

const CATEGORY_ICON_MAP: Record<QuestCategory, React.ComponentType<{ className?: string }>> = {
  Study: BookOpen,
  Exercise: Dumbbell,
  Habit: CheckCircle,
  Creative: Sparkles,
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  profile,
  activeQuests,
  recentHistory,
  onCompleteQuest,
  onOpenCreateQuest,
  onNavigateToQuests,
  onNavigateToRewards,
}) => {
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleComplete = async (questId: string) => {
    try {
      setCompletingId(questId);
      await onCompleteQuest(questId);
    } finally {
      setCompletingId(null);
    }
  };

  // Display top 4 active quests on the dashboard
  const displayQuests = activeQuests.slice(0, 4);

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* 1. Header with Greeting, Level & Coins */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Adventurer Codex
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            {getGreeting(profile.name)}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your quests await completion. Discipline and persistence forge greatness.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Level Pill */}
          <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-indigo-400">Level</div>
              <div className="font-mono-code text-sm font-bold text-indigo-200">
                Tier {profile.level}
              </div>
            </div>
          </div>

          {/* Coins Pill */}
          <div
            onClick={onNavigateToRewards}
            title="View Reward Shop"
            className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 cursor-pointer hover:border-amber-400/40 transition-colors"
          >
            <Coins className="h-4 w-4 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400">Treasury</div>
              <div className="font-mono-code text-sm font-bold text-amber-300">
                {profile.coins} Coins
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Progress Card */}
      <XPProgressBar
        level={profile.level}
        currentXP={profile.currentXP}
        totalXP={profile.totalXP}
      />

      {/* 3. Streak Card */}
      <StreakBadge
        streak={profile.streak}
        lastActivityDate={profile.lastActivityDate}
      />

      {/* 4. Four Attributes System */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold tracking-wide text-slate-200">
            Character Attributes
          </h2>
          <span className="text-xs text-slate-400">
            Permanent progression through category quests
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <AttributeCard type="intellect" value={profile.attributes?.intellect ?? 0} />
          <AttributeCard type="strength" value={profile.attributes?.strength ?? 0} />
          <AttributeCard type="discipline" value={profile.attributes?.discipline ?? 0} />
          <AttributeCard type="creativity" value={profile.attributes?.creativity ?? 0} />
        </div>
      </div>

      {/* 5. Today's Active Quests */}
      <div className="rpg-card p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-bold tracking-wide text-white">
              Today&apos;s Quests
            </h2>
            <p className="text-xs text-slate-400">
              {activeQuests.length === 0
                ? 'No pending quests in your journal.'
                : `${activeQuests.length} active challenge${activeQuests.length === 1 ? '' : 's'} remaining`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="dashboard-create-quest-btn"
              onClick={onOpenCreateQuest}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Declare Quest</span>
            </button>

            {activeQuests.length > 4 && (
              <button
                onClick={onNavigateToQuests}
                className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
              >
                <span>View All ({activeQuests.length})</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {displayQuests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center bg-slate-900/30">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="font-display text-sm font-bold text-slate-200">
              All Tasks Conquered!
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Declare a new quest to continue expanding your attributes and building your daily streak.
            </p>
            <button
              onClick={onOpenCreateQuest}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Plus className="h-4 w-4 text-amber-400" />
              <span>Inscribe New Quest</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayQuests.map((quest) => {
              const Icon = CATEGORY_ICON_MAP[quest.category] || BookOpen;
              const rule = CATEGORY_CONFIG[quest.category];
              const isCompleting = completingId === quest.id;

              return (
                <div
                  key={quest.id}
                  id={`dashboard-quest-item-${quest.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-slate-900/70 p-3.5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${rule.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">
                        {quest.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-300">{quest.category}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-mono-code">+{rule.xp} XP</span>
                        <span>•</span>
                        <span className="text-amber-400 font-mono-code">+{rule.coins} Coins</span>
                        <span>•</span>
                        <span className="capitalize text-emerald-400">+{rule.attribute}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    id={`complete-quest-btn-${quest.id}`}
                    onClick={() => handleComplete(quest.id)}
                    disabled={isCompleting}
                    className="flex items-center justify-center gap-1.5 self-end sm:self-auto rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isCompleting ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span>{isCompleting ? 'Validating...' : 'Complete'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Recent Activity Section */}
      <div className="rpg-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-400" />
            <h2 className="font-display text-base font-bold tracking-wide text-white">
              Recent Activity
            </h2>
          </div>
          <span className="text-xs text-slate-400">Past deeds inscribed in history</span>
        </div>

        {recentHistory.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No completed quests recorded yet. Finish a quest above to begin your chronicle.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 text-xs gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-medium text-slate-200">{item.taskTitle}</span>
                    <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono-code shrink-0">
                  <span className="text-indigo-400">+{item.xpEarned} XP</span>
                  <span className="text-amber-400">+{item.coinsEarned}c</span>
                  <span className="text-slate-500 text-[11px] hidden sm:inline flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
