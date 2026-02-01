
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { StudyPlanLibrary } from '@/components/StudyPlanLibrary';
import { getUserStudyPlans, deleteStudyPlan } from '@/lib/api';
import type { StudyPlanListItem } from '@/types';
import { LogOut, User, ArrowLeft, Library, CheckCircle, AlertCircle, Target, Clock, BookOpen } from 'lucide-react';

export default function PlansPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string>('');

  // Library state
  const [savedPlans, setSavedPlans] = useState<StudyPlanListItem[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Toast notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
  }, []);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const session = await res.json();
        if (session?.user) {
          setUser(session.user);
          const sessionToken = session?.session?.token || '';
          setToken(sessionToken);
          // Load saved plans
          await loadSavedPlans(sessionToken);
        } else {
          router.push('/auth/login');
        }
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login');
    } finally {
      setAuthLoading(false);
    }
  };

  const loadSavedPlans = async (authToken: string) => {
    setIsLoadingPlans(true);
    try {
      const response = await getUserStudyPlans(authToken);
      if (response.success) {
        setSavedPlans(response.plans);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteStudyPlan(planId, token);
      await loadSavedPlans(token);
      setToast({ type: 'success', message: 'Study plan deleted successfully!' });
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete study plan' });
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

  // Calculate stats
  const totalGoals = savedPlans.length;
  const totalWeeks = savedPlans.reduce((acc, plan) => acc + plan.weeks, 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span className="text-foreground-muted font-mono text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Toast Notifications */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 border shadow-lg ${
              toast.type === 'success'
                ? 'bg-success/10 border-success/20 text-success'
                : toast.type === 'error'
                ? 'bg-error/10 border-error/20 text-error'
                : 'bg-info/10 border-info/20 text-info'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={18} />
            ) : toast.type === 'error' ? (
              <AlertCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-current opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
              <span className="text-sm text-foreground font-mono">{user.email}</span>
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
          {/* Back Navigation */}
          <div className={`mb-6 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className={`mb-8 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 bg-secondary" />
              <Library size={20} className="text-secondary" />
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
                My Study Plans
              </h1>
            </div>
            <p className="text-foreground-muted ml-6">
              View and manage all your saved study plans
            </p>
          </div>

          {/* Stats Overview */}
          <div className={`grid grid-cols-3 gap-4 mb-8 transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-4 bg-background-card border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Target size={16} className="text-accent" />
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Total Goals</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">{totalGoals}</div>
            </div>
            <div className="p-4 bg-background-card border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={16} className="text-secondary" />
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Total Weeks</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">{totalWeeks}</div>
            </div>
            <div className="p-4 bg-background-card border border-border">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen size={16} className="text-foreground-muted" />
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Active Plans</span>
              </div>
              <div className="text-2xl font-semibold text-foreground">{totalGoals}</div>
            </div>
          </div>

          {/* Study Plans Library */}
          <div className={`transition-all duration-500 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <StudyPlanLibrary
              plans={savedPlans}
              isLoading={isLoadingPlans}
              onDelete={handleDeletePlan}
            />
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
