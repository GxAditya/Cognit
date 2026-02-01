'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ExternalLink, Calendar, ListTodo, BookOpen, Loader2 } from 'lucide-react';
import type { Milestone, TaskCompletion } from '@/types';

interface WeekCardProps {
  milestone: Milestone;
  tasks: TaskCompletion[];
  weekNumber: number;
  onTaskToggle: (taskId: string, isCompleted: boolean) => Promise<void>;
}

export function WeekCard({ milestone, tasks, weekNumber, onTaskToggle }: WeekCardProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Sort tasks by day number
  const sortedTasks = [...tasks].sort((a, b) => a.day_number - b.day_number);

  const handleTaskToggle = async (task: TaskCompletion) => {
    if (updatingTaskId) return; // Prevent multiple simultaneous updates

    setUpdatingTaskId(task.id);
    try {
      await onTaskToggle(task.id, !task.is_completed);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Calculate progress
  const completedCount = tasks.filter(t => t.is_completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="bg-background-card border border-border card-hover overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-accent flex items-center justify-center bg-accent/5">
              <Calendar size={18} className="text-accent" />
            </div>
            <div>
              <span className="text-xs font-mono text-foreground-muted uppercase tracking-wider">
                Week {weekNumber}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {milestone.title}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-semibold text-accent">{completedCount}</span>
            <span className="text-foreground-muted">/{tasks.length}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-border overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Left: Tasks */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo size={16} className="text-secondary" />
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Daily Tasks
            </h4>
          </div>

          {sortedTasks.length > 0 ? (
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskToggle(task)}
                  className={`group flex items-start gap-3 p-3 border cursor-pointer transition-all duration-200 ${
                    task.is_completed
                      ? 'bg-secondary/5 border-secondary/30'
                      : 'bg-background border-border hover:border-accent/50'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {updatingTaskId === task.id ? (
                      <Loader2 size={18} className="text-accent animate-spin" />
                    ) : task.is_completed ? (
                      <CheckCircle2 size={18} className="text-secondary" />
                    ) : (
                      <Circle size={18} className="text-foreground-muted group-hover:text-accent transition-colors" />
                    )}
                  </div>
                  <span
                    className={`text-sm leading-relaxed ${
                      task.is_completed
                        ? 'text-foreground-muted line-through'
                        : 'text-foreground'
                    }`}
                  >
                    {task.task_text}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-foreground-muted">
              <ListTodo size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tasks for this week</p>
            </div>
          )}
        </div>

        {/* Right: Resources */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-secondary" />
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Learning Resources
            </h4>
          </div>

          {milestone.resources && milestone.resources.length > 0 ? (
            <div className="space-y-3">
              {milestone.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-3 bg-background border border-border hover:border-accent transition-all duration-200"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <ExternalLink size={14} className="text-foreground-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                      {resource.title}
                    </p>
                    <p className="text-xs text-foreground-muted font-mono mt-0.5">
                      {resource.type}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-foreground-muted">
              <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No resources for this week</p>
            </div>
          )}

          {/* Objectives Section */}
          {milestone.objectives && milestone.objectives.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                Objectives
              </h4>
              <ul className="space-y-2">
                {milestone.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-accent mt-1">•</span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
