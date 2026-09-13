import React, { useState } from 'react';
import {
  Plus,
  CheckCircle,
  Edit3,
  Trash2,
  BookOpen,
  Dumbbell,
  Sparkles,
  Scroll,
  Clock,
} from 'lucide-react';
import { Quest, QuestCategory } from '../types/rpg';
import { CATEGORY_CONFIG } from '../utils/rpgFormulas';
import { QuestModal } from '../components/QuestModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface QuestsPageProps {
  quests: Quest[];
  loading: boolean;
  onCreateQuest: (title: string, category: QuestCategory) => Promise<void>;
  onUpdateQuest: (questId: string, title: string, category: QuestCategory) => Promise<void>;
  onDeleteQuest: (questId: string) => Promise<void>;
  onCompleteQuest: (questId: string) => Promise<void>;
  isModalOpen: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

const CATEGORY_ICON_MAP: Record<QuestCategory, React.ComponentType<{ className?: string }>> = {
  Study: BookOpen,
  Exercise: Dumbbell,
  Habit: CheckCircle,
  Creative: Sparkles,
};

export const QuestsPage: React.FC<QuestsPageProps> = ({
  quests,
  loading,
  onCreateQuest,
  onUpdateQuest,
  onDeleteQuest,
  onCompleteQuest,
  isModalOpen,
  onCloseModal,
  onOpenModal,
}) => {
  const [filter, setFilter] = useState<'active' | 'completed'>('active');
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [deletingQuest, setDeletingQuest] = useState<Quest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const activeQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);
  const displayedQuests = filter === 'active' ? activeQuests : completedQuests;

  const handleOpenEdit = (quest: Quest) => {
    setEditingQuest(quest);
    onOpenModal();
  };

  const handleModalClose = () => {
    setEditingQuest(null);
    onCloseModal();
  };

  const handleModalSubmit = async (title: string, category: QuestCategory) => {
    if (editingQuest) {
      await onUpdateQuest(editingQuest.id, title, category);
    } else {
      await onCreateQuest(title, category);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuest) return;
    try {
      setIsDeleting(true);
      setPageError(null);
      await onDeleteQuest(deletingQuest.id);
      setDeletingQuest(null);
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete quest.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleComplete = async (questId: string) => {
    try {
      setCompletingId(questId);
      setPageError(null);
      await onCompleteQuest(questId);
    } catch (err: unknown) {
      setPageError(err instanceof Error ? err.message : 'Failed to complete quest.');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Quest Directory
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Quest Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize real-world responsibilities into structured character advancements.
          </p>
        </div>

        <button
          id="create-quest-main-btn"
          onClick={() => {
            setEditingQuest(null);
            onOpenModal();
          }}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-md shadow-amber-500/10 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>+ Inscribe Quest</span>
        </button>
      </div>

      {/* Error alert */}
      {pageError && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-300">
          {pageError}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          id="filter-active-quests"
          onClick={() => setFilter('active')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            filter === 'active'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Quests ({activeQuests.length})
        </button>
        <button
          id="filter-completed-quests"
          onClick={() => setFilter('completed')}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            filter === 'completed'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Chronicle Archive ({completedQuests.length})
        </button>
      </div>

      {/* Quest List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-900/60 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : displayedQuests.length === 0 ? (
        <div className="rpg-card p-12 text-center border-dashed">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-white/10 text-slate-400 mb-3">
            <Scroll className="h-6 w-6" />
          </div>
          <h3 className="font-display text-base font-bold text-white">
            {filter === 'active' ? 'No Active Quests' : 'No Completed Quests'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {filter === 'active'
              ? 'Your quest log is clear. Create your first task to start leveling up your attributes.'
              : 'Completed quests will be permanently preserved in this archive.'}
          </p>
          {filter === 'active' && (
            <button
              onClick={() => {
                setEditingQuest(null);
                onOpenModal();
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Quest</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayedQuests.map((quest) => {
            const Icon = CATEGORY_ICON_MAP[quest.category] || BookOpen;
            const rule = CATEGORY_CONFIG[quest.category];
            const isCompleting = completingId === quest.id;

            return (
              <div
                key={quest.id}
                id={`quest-card-${quest.id}`}
                className={`rpg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  quest.completed ? 'opacity-75 bg-slate-950/40' : 'hover:border-white/15'
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${rule.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm font-semibold text-white truncate ${quest.completed ? 'line-through text-slate-400' : ''}`}>
                        {quest.title}
                      </h3>
                      <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/5">
                        {quest.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                      <span className="text-indigo-400 font-mono-code font-semibold">+{rule.xp} XP</span>
                      <span>•</span>
                      <span className="text-amber-400 font-mono-code font-semibold">+{rule.coins} Coins</span>
                      <span>•</span>
                      <span className="text-emerald-400 capitalize">+{rule.attribute}</span>

                      {quest.completedAt && (
                        <>
                          <span>•</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Finished {new Date(quest.completedAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {!quest.completed && (
                    <button
                      id={`quest-complete-action-${quest.id}`}
                      onClick={() => handleComplete(quest.id)}
                      disabled={isCompleting}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isCompleting ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      <span>Complete</span>
                    </button>
                  )}

                  {!quest.completed && (
                    <button
                      id={`quest-edit-action-${quest.id}`}
                      onClick={() => handleOpenEdit(quest)}
                      title="Edit Quest"
                      className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors border border-transparent hover:border-white/5"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    id={`quest-delete-action-${quest.id}`}
                    onClick={() => setDeletingQuest(quest)}
                    title="Delete Quest"
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quest Modal */}
      <QuestModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialQuest={editingQuest}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingQuest)}
        onClose={() => setDeletingQuest(null)}
        onConfirm={handleConfirmDelete}
        questTitle={deletingQuest?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};
