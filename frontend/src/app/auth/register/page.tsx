'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, AlertCircle, ArrowLeft, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create account');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password.length >= 8 ? (password.length >= 12 ? 'strong' : 'medium') : 'weak';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className={`border-b border-border transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Cognit Logo" width={48} height={48} className="rounded" />
            <span className="text-2xl font-semibold tracking-tight text-foreground">Cognit</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>
      </nav>

      {/* Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className={`w-full max-w-md transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="p-8 md:p-10 bg-background-card border border-border">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Create account
              </h1>
              <p className="text-foreground-muted">
                Start your learning journey today
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 bg-background-elevated border-l-2 border-error flex items-center gap-3">
                <AlertCircle size={18} className="text-error shrink-0" />
                <span className="text-sm text-foreground">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Name <span className="text-foreground-muted font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                  />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-background border border-border text-foreground placeholder-foreground-muted focus:outline-none focus:border-accent transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-background border border-border text-foreground placeholder-foreground-muted focus:outline-none focus:border-accent transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 bg-background border border-border text-foreground placeholder-foreground-muted focus:outline-none focus:border-accent transition-all disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-border overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength === 'weak'
                            ? 'w-1/3 bg-error'
                            : passwordStrength === 'medium'
                            ? 'w-2/3 bg-secondary'
                            : 'w-full bg-accent'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-mono ${
                      passwordStrength === 'weak'
                        ? 'text-error'
                        : passwordStrength === 'medium'
                        ? 'text-secondary'
                        : 'text-accent'
                    }`}>
                      {passwordStrength}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
                  />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-background border border-border text-foreground placeholder-foreground-muted focus:outline-none focus:border-accent transition-all disabled:opacity-50"
                  />
                  {confirmPassword && password === confirmPassword && (
                    <CheckCircle2
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-accent"
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-accent hover:bg-accent-hover text-white font-medium rounded transition-all duration-200 btn-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-background-card text-foreground-muted font-mono">or</span>
              </div>
            </div>

            {/* Sign in link */}
            <div className="text-center">
              <p className="text-foreground-muted">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-accent hover:text-accent-hover font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
