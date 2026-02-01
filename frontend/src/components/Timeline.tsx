'use client';

import { CheckCircle2, BookOpen, Calendar, ListTodo } from 'lucide-react';
import type { Milestone } from '@/types';

interface TimelineProps {
  milestones: Milestone[];
}

export function Timeline({ milestones }: TimelineProps) {
  // Defensive check for undefined or non-array milestones
  if (!milestones || !Array.isArray(milestones)) {
    return (
      <div className="p-4 bg-error/10 border border-error text-error">
        Error: Timeline data is missing or invalid
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {milestones.map((milestone, index) => (
        <div
          key={milestone.week}
          className="p-5 bg-background-card border border-border card-hover"
        >
          <div className="flex items-start gap-4">
            {/* Week indicator */}
            <div className="flex flex-col items-center min-w-[48px]">
              <div className="w-10 h-10 border border-accent flex items-center justify-center">
                <Calendar size={16} className="text-accent" />
              </div>
              {index < milestones.length - 1 && (
                <div className="w-px flex-1 min-h-[32px] bg-border mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-foreground-muted uppercase tracking-wider">Week {milestone.week}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {milestone.title}
              </h3>

              {/* Objectives */}
              {milestone.objectives.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs text-foreground-muted uppercase tracking-wider font-mono mb-2">
                    <CheckCircle2 size={12} />
                    <span>Objectives</span>
                  </div>
                  <ul className="space-y-1.5">
                    {milestone.objectives.map((objective, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-accent mt-1.5">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Daily Tasks */}
              {milestone.daily_tasks && milestone.daily_tasks.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs text-foreground-muted uppercase tracking-wider font-mono mb-2">
                    <ListTodo size={12} />
                    <span>Daily Tasks</span>
                  </div>
                  <ul className="space-y-1.5">
                    {milestone.daily_tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-accent mt-1">☐</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resources */}
              {milestone.resources.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs text-foreground-muted uppercase tracking-wider font-mono mb-2">
                    <BookOpen size={12} />
                    <span>Resources</span>
                  </div>
                  <ul className="space-y-1.5">
                    {milestone.resources.map((resource, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-foreground-muted mt-1">→</span>
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-accent hover:underline"
                          title={`${resource.title} (${resource.type})`}
                        >
                          {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
