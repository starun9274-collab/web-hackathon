import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, Coins, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { QuestCompletionResult } from '../types/rpg';

interface CelebrationModalProps {
  result: QuestCompletionResult | null;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <AnimatePresence>
      <div
        id="celebration-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <motion.div
          id="celebration-dialog"
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-[#121826] p-6 shadow-2xl"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center">
            {/* Icon Banner */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-400 shadow-lg">
              {result.leveledUp ? (
                <Trophy className="h-8 w-8 text-amber-300 animate-bounce" />
              ) : (
                <ShieldCheck className="h-8 w-8 text-amber-400" />
              )}
            </div>

            {/* Title */}
            {result.leveledUp ? (
              <div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300 border border-amber-500/40">
                  Glorious Triumph!
                </span>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white">
                  LEVEL UP!
                </h2>
                <p className="mt-1 text-sm text-amber-300 font-medium">
                  You have ascended to <span className="font-bold underline">Level {result.newLevel}</span>
                </p>
              </div>
            ) : (
              <div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
                  Quest Accomplished
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
                  Quest Complete!
                </h2>
                <p className="mt-1 text-sm text-slate-300 truncate max-w-xs mx-auto">
                  &ldquo;{result.questTitle}&rdquo;
                </p>
              </div>
            )}

            {/* Rewards Breakdown Grid */}
            <div className="mt-6 grid grid-cols-3 gap-2.5">
              {/* XP */}
              <div className="rounded-xl bg-slate-900/80 border border-white/5 p-3">
                <div className="flex justify-center text-indigo-400 mb-1">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="font-mono-code text-lg font-bold text-indigo-300">
                  +{result.xpEarned}
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  XP Gained
                </div>
              </div>

              {/* Coins */}
              <div className="rounded-xl bg-slate-900/80 border border-white/5 p-3">
                <div className="flex justify-center text-amber-400 mb-1">
                  <Coins className="h-4 w-4" />
                </div>
                <div className="font-mono-code text-lg font-bold text-amber-300">
                  +{result.coinsEarned}
                </div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Coins
                </div>
              </div>

              {/* Attribute */}
              <div className="rounded-xl bg-slate-900/80 border border-white/5 p-3">
                <div className="flex justify-center text-emerald-400 mb-1">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="font-mono-code text-lg font-bold text-emerald-300 capitalize">
                  +1
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
                  {result.attributeImproved}
                </div>
              </div>
            </div>

            {/* Streak update footer */}
            <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 py-1.5 px-3 text-xs text-orange-300 font-medium">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span>Current Streak: {result.newStreak} Days</span>
            </div>

            {/* Action */}
            <button
              id="celebration-confirm-btn"
              onClick={onClose}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>Claim & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
