'use client';

import { AlertTriangle, X, RefreshCw, CheckCircle } from 'lucide-react';

interface SavePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  goal: string;
  weeks: number;
}

export function SavePlanDialog({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  goal,
  weeks,
}: SavePlanDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-background-card border border-border shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 border border-warning/20 flex items-center justify-center">
              <AlertTriangle size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Duplicate Plan Detected
              </h3>
              <p className="text-xs text-foreground-muted font-mono">
                Study plan already exists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-foreground-muted hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-foreground-muted text-sm leading-relaxed">
            You already have a study plan with the same goal and timeline:
          </p>

          <div className="p-4 bg-background border border-border">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">
                  Goal
                </span>
                <p className="text-foreground font-medium mt-1">{goal}</p>
              </div>
              <div>
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">
                  Duration
                </span>
                <p className="text-foreground font-medium mt-1">
                  {weeks} week{weeks !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-info/10 border border-info/20">
            <RefreshCw size={16} className="text-info mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">
              Would you like to replace the existing plan with this new one? The
              old plan will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-foreground-muted hover:text-foreground border border-border hover:border-foreground-muted transition-all"
          >
            No, Keep Existing
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-white transition-all flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Yes, Replace
          </button>
        </div>
      </div>
    </div>
  );
}
