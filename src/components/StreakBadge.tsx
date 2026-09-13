import React from 'react';
import { Flame, Calendar, CheckCircle } from 'lucide-react';
import { formatDateKey } from '../utils/rpgFormulas';

interface StreakBadgeProps {
  streak: number;
  lastActivityDate: string | null;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, lastActivityDate }) => {
  const todayStr = formatDateKey(new Date());
  const isActiveToday = lastActivityDate === todayStr;

  return (
    <div
      id="dashboard-streak-card"
      className="rpg-card p-5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Flame className="h-6 w-6 text-orange-400 fill-orange-500/20 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-white">
                {streak} Day Streak
              </span>
              {isActiveToday ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                  Active Today
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                  <Calendar className="h-3 w-3" />
                  Due Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isActiveToday
                ? 'Your devotion is sealed for today. Keep returning tomorrow!'
                : 'Complete at least one quest before midnight to advance your streak.'}
            </p>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <span className="font-mono-code text-2xl font-bold text-orange-400">
            {streak > 0 ? `🔥 x${streak}` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
