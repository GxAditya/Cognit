'use client';

import { useState } from 'react';
import { Target, Clock, ArrowRight, BookOpen, Sparkles, Save, Loader2 } from 'lucide-react';
import type { StudyPlan } from '@/types';

interface StudyPlanGeneratorProps {
  onGenerate: (goal: string, weeks: number) => void;
  onSave: (plan: StudyPlan) => void;
  isGenerating: boolean;
  isSaving: boolean;
  generatedPlan: StudyPlan | null;
}

export function StudyPlanGenerator({
  onGenerate,
  onSave,
  isGenerating,
  isSaving,
  generatedPlan,
}: StudyPlanGeneratorProps) {
  const [goal, setGoal] = useState('');
  const [weeks, setWeeks] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onGenerate(goal.trim(), weeks);
    }
  };

  const suggestions = [
    'Master Python programming',
    'Learn React and Next.js',
    'Prepare for AWS certification',
    'Study AP Calculus AB',
    'Learn Spanish basics',
    'Master data structures',
  ];

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <form onSubmit={handleSubmit}>
        <div className="p-6 bg-background-card border border-border card-hover">
          {/* Goal Input */}
          <div className="mb-6">
            <label
              htmlFor="goal"
              className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3"
            >
              <Target size={16} className="text-accent" />
              What do you want to learn?
            </label>
            <div className="relative">
              <textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Master Python programming in 8 weeks..."
                className="w-full px-4 py-3 bg-background border border-border text-foreground placeholder-foreground-muted focus:outline-none focus:border-accent resize-none transition-all"
                rows={4}
                disabled={isGenerating}
              />
              <BookOpen
                size={16}
                className="absolute right-4 top-4 text-foreground-muted"
              />
            </div>

            {/* Suggestions */}
            {!goal && (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setGoal(suggestion)}
                    className="px-3 py-1.5 text-xs bg-background border border-border hover:border-accent text-foreground-muted hover:text-foreground transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration Slider */}
          <div className="mb-6">
            <label
              htmlFor="weeks"
              className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4"
            >
              <Clock size={16} className="text-secondary" />
              Duration
            </label>

            <div className="px-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-foreground-muted font-mono">1 week</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-accent">{weeks}</span>
                  <span className="text-sm text-foreground-muted">weeks</span>
                </div>
                <span className="text-xs text-foreground-muted font-mono">12 weeks</span>
              </div>

              <input
                id="weeks"
                type="range"
                min={1}
                max={12}
                value={weeks}
                onChange={(e) => setWeeks(parseInt(e.target.value))}
                className="w-full"
                disabled={isGenerating}
              />

              {/* Tick marks */}
              <div className="flex justify-between mt-2 px-1">
                {[1, 3, 6, 9, 12].map((tick) => (
                  <button
                    key={tick}
                    type="button"
                    onClick={() => setWeeks(tick)}
                    className={`w-1 h-1 rounded-full transition-all ${
                      weeks >= tick ? 'bg-accent w-1.5 h-1.5' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isGenerating || !goal.trim()}
            className="w-full py-3.5 bg-accent hover:bg-accent-hover disabled:bg-border disabled:cursor-not-allowed text-white font-medium rounded transition-all duration-200 btn-lift flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating plan...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Plan</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Info text */}
          <p className="mt-4 text-xs text-foreground-muted text-center">
            Our AI will create a personalized learning roadmap for you
          </p>
        </div>
      </form>

      {/* Preview Section */}
      {generatedPlan && (
        <div className="p-6 bg-background-card border border-border card-hover animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <h3 className="text-lg font-semibold text-foreground">Preview</h3>
            </div>
            <button
              onClick={() => onSave(generatedPlan)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-hover disabled:bg-border disabled:cursor-not-allowed text-white text-sm font-medium transition-all duration-200"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Plan</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-background border border-border">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">
                    Goal
                  </span>
                  <p className="text-base text-foreground mt-1">{generatedPlan.goal}</p>
                </div>
                <div>
                  <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">
                    Duration
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={14} className="text-foreground-muted" />
                    <span className="font-mono text-foreground">{generatedPlan.weeks} weeks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Preview */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent" />
                Milestones Overview
              </h4>
              <div className="space-y-2">
                {generatedPlan.milestones.slice(0, 3).map((milestone) => (
                  <div
                    key={milestone.week}
                    className="p-3 bg-background border border-border flex items-center gap-3"
                  >
                    <div className="w-8 h-8 border border-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-mono text-accent">W{milestone.week}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {milestone.title}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {milestone.daily_tasks?.length || 0} tasks • {milestone.resources?.length || 0} resources
                      </p>
                    </div>
                  </div>
                ))}
                {generatedPlan.milestones.length > 3 && (
                  <p className="text-xs text-foreground-muted text-center py-2">
                    +{generatedPlan.milestones.length - 3} more weeks
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
