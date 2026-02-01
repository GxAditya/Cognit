'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  Loader2,
  AlertCircle,
  LogOut,
  User,
  TrendingUp,
} from 'lucide-react';
import { WeekCard } from './WeekCard';
import type { StudyPlanWithTasks, TaskCompletion, CompletionStats } from '@/types';

interface StudyPlanDetailProps {
  planId: string;
  token: string;
}

export function StudyPlanDetail({ planId, token }: StudyPlanDetailProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<StudyPlanWithTasks | null>(null);
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPlanData();
    checkAuthStatus();
  }, [planId, token]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const session = await res.json();
        if (session?.user) {
          setUser(session.user);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const fetchPlanData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch plan with tasks
      const planRes = await fetch(`/api/study-plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!planRes.ok) {
        if (planRes.status === 404) {
          throw new Error('Study plan not found');
        }
        throw new Error('Failed to fetch study plan');
      }

      const planData = await planRes.json();
      if (planData.success && planData.plan) {
        setPlan(planData.plan);
      } else {
        throw new Error('Invalid plan data received');
      }

      // Fetch stats
      const statsRes = await fetch(`/api/study-plans/${planId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success && statsData.stats) {
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskToggle = async (taskId: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/study-plans/${planId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_completed: isCompleted }),
      });

      if (!res.ok) {
        throw new Error('Failed to update task');
      }

      const data = await res.json();
      if (data.success && data.task) {
        // Update local state
        setPlan((prevPlan) => {
          if (!prevPlan) return null;

          return {
            ...prevPlan,
            tasks: prevPlan.tasks.map((week) => ({
              ...week,
              tasks: week.tasks.map((task) =>
                task.id === taskId ? { ...task, is_completed: isCompleted } : task
              ),
            })),
          };
        });

        // Refresh stats
        const statsRes = await fetch(`/api/study-plans/${planId}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success && statsData.stats) {
            setStats(statsData.stats);
          }
        }
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const getTasksForWeek = (weekNumber: number): TaskCompletion[] => {
    if (!plan) return [];
    const weekTasks = plan.tasks.find((w) => w.week_number === weekNumber);
    return weekTasks?.tasks || [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-accent animate-spin" />
          <span className="text-foreground-muted font-mono text-sm">Loading study plan...</span>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle size={48} className="text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Plan</h2>
          <p className="text-foreground-muted mb-6">{error || 'Failed to load study plan'}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white transition-all"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className={`border-b border-border transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Cognit Logo" width={48} height={48} className="rounded" />
            <span className="text-2xl font-semibold tracking-tight text-foreground">Cognit</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-background-card border border-border">
              <User size={16} className="text-foreground-muted" />
              <span className="text-sm text-foreground font-mono">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 border border-border hover:border-foreground-muted text-foreground-muted hover:text-foreground text-sm transition-all duration-200"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to Dashboard</span>
          </Link>

          {/* Plan Header */}
          <div className={`mb-8 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-6 bg-background-card border border-border">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 border border-accent flex items-center justify-center bg-accent/5">
                    <Target size={24} className="text-accent" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground">{plan.goal}</h1>
                    <p className="text-sm text-foreground-muted font-mono">
                      Created {new Date(plan.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stats Overview */}
                {stats && (
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-baseline gap-1 justify-center">
                        <span className="text-2xl font-semibold text-accent">{Math.round(stats.completion_percentage)}</span>
                        <span className="text-sm text-foreground-muted">%</span>
                      </div>
                      <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Complete</span>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="text-center">
                      <div className="flex items-baseline gap-1 justify-center">
                        <span className="text-2xl font-semibold text-secondary">{stats.completed_tasks}</span>
                        <span className="text-sm text-foreground-muted">/{stats.total_tasks}</span>
                      </div>
                      <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Tasks Done</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {stats && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted flex items-center gap-2">
                      <TrendingUp size={14} />
                      Overall Progress
                    </span>
                    <span className="font-mono text-foreground">
                      {stats.completed_weeks} of {plan.weeks} weeks completed
                    </span>
                  </div>
                  <div className="h-2 bg-border overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${stats.completion_percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-4 bg-background-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-accent" />
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Duration</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">{plan.weeks}</div>
              <div className="text-xs text-foreground-muted">weeks</div>
            </div>
            <div className="p-4 bg-background-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-secondary" />
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Milestones</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">{plan.plan_data.milestones.length}</div>
              <div className="text-xs text-foreground-muted">weeks</div>
            </div>
            <div className="p-4 bg-background-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-success" />
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Completed</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">{stats?.completed_tasks || 0}</div>
              <div className="text-xs text-foreground-muted">tasks</div>
            </div>
            <div className="p-4 bg-background-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-foreground-muted" />
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Remaining</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {(stats?.total_tasks || 0) - (stats?.completed_tasks || 0)}
              </div>
              <div className="text-xs text-foreground-muted">tasks</div>
            </div>
          </div>

          {/* Week Cards */}
          <div className="space-y-6">
            <h2 className={`text-lg font-semibold text-foreground flex items-center gap-2 transition-all duration-500 delay-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <span className="w-1 h-6 bg-accent" />
              Weekly Breakdown
            </h2>

            <div className="space-y-6">
              {plan.plan_data.milestones.map((milestone, index) => (
                <div
                  key={milestone.week}
                  className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <WeekCard
                    milestone={milestone}
                    tasks={getTasksForWeek(milestone.week)}
                    weekNumber={milestone.week}
                    onTaskToggle={handleTaskToggle}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground-muted">
            Cognit — Stop planning. Start executing.
          </p>
          <div className="flex items-center gap-2 text-xs text-foreground-muted font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            System Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
