'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, User, Target, Clock, BookOpen, Sparkles, Library, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const session = await res.json();
        if (session?.user) {
          setUser(session.user);
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
      <main className="flex-1 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className={`mb-12 text-center transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Welcome back, {user.name || user.email.split('@')[0]}
            </h1>
            <p className="text-foreground-muted text-lg max-w-lg mx-auto">
              What would you like to do today?
            </p>
          </div>

          {/* Navigation Cards */}
          <div className={`grid md:grid-cols-2 gap-6 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Create New Study Plan Card */}
            <Link
              href="/dashboard/generator"
              className="group p-8 bg-background-card border border-border hover:border-accent transition-all duration-300 card-hover"
            >
              <div className="flex flex-col h-full">
                <div className="w-14 h-14 bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-all">
                  <Sparkles size={28} className="text-accent" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  Create New Study Plan
                </h2>
                <p className="text-foreground-muted mb-6 flex-1">
                  Generate a personalized AI-powered study plan tailored to your learning goals and timeline.
                </p>
                <div className="flex items-center gap-2 text-accent font-medium">
                  <span>Get Started</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* View My Study Plans Card */}
            <Link
              href="/dashboard/plans"
              className="group p-8 bg-background-card border border-border hover:border-secondary transition-all duration-300 card-hover"
            >
              <div className="flex flex-col h-full">
                <div className="w-14 h-14 bg-secondary/10 border border-secondary/20 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-all">
                  <Library size={28} className="text-secondary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  View My Study Plans
                </h2>
                <p className="text-foreground-muted mb-6 flex-1">
                  Access your saved study plans, track progress, and continue your learning journey.
                </p>
                <div className="flex items-center gap-2 text-secondary font-medium">
                  <span>View Library</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Tips */}
          <div className={`mt-12 p-6 bg-background-card border border-border transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-foreground-muted" />
              Quick Tips
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target size={14} className="text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Set Clear Goals</p>
                  <p className="text-foreground-muted text-xs mt-1">Define specific, measurable learning objectives</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={14} className="text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Be Realistic</p>
                  <p className="text-foreground-muted text-xs mt-1">Choose a timeline that fits your schedule</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-foreground-muted/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen size={14} className="text-foreground-muted" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Track Progress</p>
                  <p className="text-foreground-muted text-xs mt-1">Mark tasks complete as you learn</p>
                </div>
              </div>
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
