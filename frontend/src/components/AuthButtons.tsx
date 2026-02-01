'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, LogOut } from 'lucide-react';

export function AuthButtons() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const session = await res.json();
        if (session?.user) {
          setUser(session.user);
        }
      }
    } catch (error) {
      console.error('Failed to check session:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-500">
        <span className="mono text-xs">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-700">
          <User size={16} className="text-accent" />
          <span className="mono text-sm">{user.email}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-50 text-zinc-700 text-sm transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/auth/login"
        className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
      >
        Sign In
      </Link>
      <Link
        href="/auth/register"
        className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-md transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
}
