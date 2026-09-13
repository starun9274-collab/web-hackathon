import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  questTitle: string;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  questTitle,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
    >
      <div
        id="delete-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-rose-500/30 bg-[#121826] p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto mb-4">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h3 className="font-display text-lg font-bold text-center text-white">
          Abandon Quest?
        </h3>
        <p className="mt-2 text-center text-xs text-slate-400">
          Are you sure you wish to strike &ldquo;<span className="text-slate-200 font-semibold">{questTitle}</span>&rdquo; from your journal? This cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            id="cancel-delete-btn"
            onClick={onClose}
            disabled={isDeleting}
            className="w-1/2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
          >
            Keep Quest
          </button>
          <button
            type="button"
            id="confirm-delete-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-1/2 rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
