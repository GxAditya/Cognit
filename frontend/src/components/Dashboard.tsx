'use client';

import { Target, Clock, AlertCircle, CheckCircle, Loader2, Save } from 'lucide-react';
import { Timeline } from './Timeline';
import type { StudyPlan } from '@/types';

interface DashboardProps {
  plan: StudyPlan | null;
  error: string | null;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error' | 'duplicate';
  saveError?: string | null;
}

export function Dashboard({ plan, error, saveStatus = 'idle', saveError }: DashboardProps) {
  if (error) {
    return (
      <div className="p-6 bg-background-card border-l-2 border-error">
        <div className="flex items-center gap-2 text-error mb-2">
          <AlertCircle size={18} />
          <span className="font-semibold">Error</span>
        </div>
        <p className="text-foreground-muted">{error}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-12 bg-background-card border border-border text-center">
        <div className="w-16 h-16 mx-auto mb-4 border border-border flex items-center justify-center">
          <Target size={28} className="text-foreground-muted" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No plan yet</h3>
        <p className="text-foreground-muted text-sm max-w-sm mx-auto">
          Fill out the form to generate your personalized study plan with weekly milestones and resources.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="p-6 bg-background-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Study Plan</h2>
          </div>
          
          {/* Save Status Indicator */}
          {saveStatus !== 'idle' && (
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-foreground-muted text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="font-mono">Saving...</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-success text-sm">
                  <CheckCircle size={16} />
                  <span className="font-mono">Saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-error text-sm">
                  <AlertCircle size={16} />
                  <span className="font-mono">{saveError || 'Save failed'}</span>
                </div>
              )}
              {saveStatus === 'duplicate' && (
                <div className="flex items-center gap-2 text-warning text-sm">
                  <AlertCircle size={16} />
                  <span className="font-mono">Duplicate detected</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Goal</span>
            <p className="text-base text-foreground mt-1">{plan.goal}</p>
          </div>
          <div>
            <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Duration</span>
            <div className="flex items-center gap-2 mt-1">
              <Clock size={14} className="text-foreground-muted" />
              <span className="font-mono text-foreground">{plan.weeks} weeks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent" />
          Milestones
        </h3>
        <Timeline milestones={plan.milestones} />
      </div>
    </div>
  );
}
