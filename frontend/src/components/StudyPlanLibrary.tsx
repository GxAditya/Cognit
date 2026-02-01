'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Target, Trash2, Eye, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import type { StudyPlanListItem } from '@/types';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

interface StudyPlanLibraryProps {
  plans: StudyPlanListItem[];
  isLoading: boolean;
  onDelete: (planId: string) => Promise<void>;
}

export function StudyPlanLibrary({ plans, isLoading, onDelete }: StudyPlanLibraryProps) {
  const router = useRouter();
  const [deletePlan, setDeletePlan] = useState<StudyPlanListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewPlan = (planId: string) => {
    router.push(`/dashboard/plan/${planId}`);
  };

  const handleDeleteClick = (plan: StudyPlanListItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletePlan(plan);
  };

  const handleConfirmDelete = async () => {
    if (!deletePlan) return;

    setIsDeleting(true);
    try {
      await onDelete(deletePlan.id);
      setDeletePlan(null);
    } catch (error) {
      console.error('Failed to delete plan:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-background-card border border-border">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 size={32} className="text-accent animate-spin" />
          <p className="text-foreground-muted font-mono text-sm">Loading your study plans...</p>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-12 bg-background-card border border-border text-center">
        <div className="w-16 h-16 mx-auto mb-4 border border-border flex items-center justify-center">
          <BookOpen size={28} className="text-foreground-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No study plans yet</h3>
        <p className="text-foreground-muted text-sm max-w-sm mx-auto">
          Generate your first study plan to start tracking your learning journey. Your plans will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            onClick={() => handleViewPlan(plan.id)}
            className="group p-5 bg-background-card border border-border hover:border-accent transition-all duration-200 cursor-pointer card-hover animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Plan Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} className="text-accent flex-shrink-0" />
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {plan.goal}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span className="font-mono">{plan.weeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span className="font-mono">{formatDate(plan.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewPlan(plan.id);
                  }}
                  className="p-2 text-foreground-muted hover:text-accent hover:bg-accent/10 transition-all"
                  title="View plan"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={(e) => handleDeleteClick(plan, e)}
                  className="p-2 text-foreground-muted hover:text-error hover:bg-error/10 transition-all"
                  title="Delete plan"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Progress Bar (placeholder for future enhancement) */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-foreground-muted mb-2">
                <span className="font-mono uppercase tracking-wider">Progress</span>
                <span className="font-mono">Click to view details</span>
              </div>
              <div className="h-1 bg-border overflow-hidden">
                <div className="h-full w-0 bg-accent group-hover:w-full transition-all duration-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deletePlan !== null}
        onClose={() => setDeletePlan(null)}
        onConfirm={handleConfirmDelete}
        plan={deletePlan}
        isDeleting={isDeleting}
      />
    </>
  );
}
