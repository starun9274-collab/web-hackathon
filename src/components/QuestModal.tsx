import React, { useState, useEffect } from 'react';
import { X, BookOpen, Dumbbell, CheckCircle2, Sparkles, AlertCircle, Plus, Edit3 } from 'lucide-react';
import { Quest, QuestCategory } from '../types/rpg';
import { CATEGORY_CONFIG } from '../utils/rpgFormulas';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, category: QuestCategory) => Promise<void>;
  initialQuest?: Quest | null;
}

const CATEGORY_OPTIONS: {
  id: QuestCategory;
  label: string;
  improves: string;
  rewardXP: number;
  rewardCoins: number;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'Study',
    label: 'Study',
    improves: 'Intellect',
    rewardXP: CATEGORY_CONFIG.Study.xp,
    rewardCoins: CATEGORY_CONFIG.Study.coins,
    icon: BookOpen,
  },
  {
    id: 'Exercise',
    label: 'Exercise',
    improves: 'Strength',
    rewardXP: CATEGORY_CONFIG.Exercise.xp,
    rewardCoins: CATEGORY_CONFIG.Exercise.coins,
    icon: Dumbbell,
  },
  {
    id: 'Habit',
    label: 'Habit',
    improves: 'Discipline',
    rewardXP: CATEGORY_CONFIG.Habit.xp,
    rewardCoins: CATEGORY_CONFIG.Habit.coins,
    icon: CheckCircle2,
  },
  {
    id: 'Creative',
    label: 'Creative',
    improves: 'Creativity',
    rewardXP: CATEGORY_CONFIG.Creative.xp,
    rewardCoins: CATEGORY_CONFIG.Creative.coins,
    icon: Sparkles,
  },
];

export const QuestModal: React.FC<QuestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialQuest,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<QuestCategory>('Study');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialQuest) {
      setTitle(initialQuest.title);
      setCategory(initialQuest.category);
    } else {
      setTitle('');
      setCategory('Study');
    }
    setError(null);
  }, [initialQuest, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Please enter a quest title.');
      return;
    }
    if (trimmedTitle.length < 3) {
      setError('Quest title must be at least 3 characters long.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(trimmedTitle, category);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save quest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMeta = CATEGORY_CONFIG[category];

  return (
    <div
      id="quest-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        id="quest-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#121826] p-6 shadow-2xl"
      >
        {/* Close Button */}
        <button
          id="close-quest-modal-btn"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            {initialQuest ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              {initialQuest ? 'Edit Quest' : 'Declare New Quest'}
            </h2>
            <p className="text-xs text-slate-400">
              {initialQuest
                ? 'Update your quest details. Rewards adjust automatically.'
                : 'Turn a real-world task into an RPG challenge.'}
            </p>
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quest Title */}
          <div>
            <label
              htmlFor="quest-title-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
            >
              Quest Title <span className="text-amber-400">*</span>
            </label>
            <input
              id="quest-title-input"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Read 20 pages of chapter 4, or 30m gym session"
              maxLength={100}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-colors"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {CATEGORY_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = category === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    id={`category-btn-${opt.id}`}
                    onClick={() => setCategory(opt.id)}
                    disabled={isSubmitting}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500/50 bg-amber-500/10 shadow-sm'
                        : 'border-white/5 bg-slate-900/60 hover:border-white/10 hover:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{opt.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        +{opt.rewardXP} XP • {opt.improves}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Automatic Reward Preview */}
          <div className="rounded-xl border border-white/5 bg-slate-900/40 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Guaranteed completion bounty:</span>
              <div className="flex items-center gap-3 font-mono-code font-bold">
                <span className="text-indigo-400">+{selectedMeta.xp} XP</span>
                <span className="text-amber-400">+{selectedMeta.coins} Coins</span>
                <span className="text-emerald-400 capitalize">+{selectedMeta.attribute}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              id="cancel-quest-btn"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-quest-btn"
              disabled={isSubmitting}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-semibold text-slate-950 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              ) : null}
              <span>{initialQuest ? 'Update Quest' : 'Inscribe Quest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
