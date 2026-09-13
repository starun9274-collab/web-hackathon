import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { getXpRequiredForNextLevel } from '../utils/rpgFormulas';

interface XPProgressBarProps {
  level: number;
  currentXP: number;
  totalXP: number;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  level,
  currentXP,
  totalXP,
}) => {
  const xpRequired = getXpRequiredForNextLevel(level);
  const percentage = Math.min(100, Math.max(0, Math.round((currentXP / xpRequired) * 100)));

  return (
    <div className="rpg-card p-5 sm:p-6 relative overflow-hidden">
      {/* Subtle ambient gradient in card background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                  Level {level}
                </h2>
                <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300 font-mono-code border border-white/5">
                  Total: {totalXP.toLocaleString()} XP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Next tier unlocked at {xpRequired.toLocaleString()} XP
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono-code text-xl font-bold text-amber-400">
              {percentage}%
            </span>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">Progress</p>
          </div>
        </div>

        {/* Bar */}
        <div className="space-y-2">
          <div
            role="progressbar"
            aria-valuenow={currentXP}
            aria-valuemin={0}
            aria-valuemax={xpRequired}
            aria-label={`Level ${level} experience progress: ${currentXP} of ${xpRequired} XP`}
            className="h-3.5 w-full overflow-hidden rounded-full bg-slate-900 border border-white/10 p-0.5 shadow-inner"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-400 font-mono-code">
            <span className="flex items-center gap-1 text-amber-300/90">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {currentXP.toLocaleString()} XP
            </span>
            <span className="text-slate-500">
              {xpRequired.toLocaleString()} XP needed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
