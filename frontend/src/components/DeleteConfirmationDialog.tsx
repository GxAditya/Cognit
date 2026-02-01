'use client';

import { X, AlertTriangle, Trash2, Loader2, Target, Clock } from 'lucide-react';
import type { StudyPlanListItem } from '@/types';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: StudyPlanListItem | null;
  isDeleting: boolean;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  plan,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-background-card border border-error/30 shadow-2xl animate-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-error/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-error/10 border border-error/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-error" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Delete Study Plan
              </h3>
              <p className="text-xs text-foreground-muted font-mono">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-foreground-muted hover:text-foreground transition-colors"
            disabled={isDeleting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-foreground-muted text-sm leading-relaxed">
            Are you sure you want to delete this study plan? All progress and task completion data will be permanently removed.
          </p>

          {/* Plan Details */}
          <div className="p-4 bg-background border border-border">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Target size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">
                    Goal
                  </span>
                  <p className="text-foreground font-medium mt-0.5">{plan.goal}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-secondary" />
                <div>
                  <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">
                    Duration
                  </span>
                  <span className="text-foreground font-medium ml-2">
                    {plan.weeks} week{plan.weeks !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-error/5 border border-error/20">
            <AlertTriangle size={16} className="text-error mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">
              This action is irreversible. All tasks and progress will be lost.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm text-foreground-muted hover:text-foreground border border-border hover:border-foreground-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-error hover:bg-error/90 disabled:bg-border disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
