'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { 
  Target, 
  Brain, 
  Calendar, 
  Lightbulb, 
  ListTodo, 
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Lightbulb,
      title: 'Intelligent Planning',
      description: 'Our system decomposes your goals into structured learning paths with clear milestones.',
    },
    {
      icon: ListTodo,
      title: 'Structured Milestones',
      description: 'Week-by-week breakdown with specific objectives and measurable deliverables.',
    },
    {
      icon: BookOpen,
      title: 'Curated Resources',
      description: 'Hand-picked learning materials and references for each stage of your journey.',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: Target,
      title: 'Define Your Goal',
      description: 'Describe what you want to learn and set your timeline.',
    },
    {
      number: '02',
      icon: Brain,
      title: 'Generate Your Plan',
      description: 'Our system analyzes and structures your optimal learning path.',
    },
    {
      number: '03',
      icon: Calendar,
      title: 'Execute & Track',
      description: 'Follow weekly milestones with curated resources and clear objectives.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className={`border-b border-border transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo.png" alt="Cognit Logo" width={50} height={50} className="rounded" />
            <span className="text-2xl font-semibold tracking-tight text-foreground">Cognit</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="text-sm text-foreground-muted hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded transition-all duration-200 btn-lift"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <div className={`mb-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-sm font-mono text-foreground-muted uppercase tracking-widest">
              Stop planning. <span className="line-through decoration-accent decoration-2">Start executing</span>.
            </p>
          </div>

          {/* Main heading */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-semibold text-foreground mb-6 leading-tight tracking-tight transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Turn your learning goals into{' '}
            <span className="italic text-accent">actionable</span>{' '}
            plans
          </h1>

          {/* Subtitle */}
          <p className={`text-lg text-foreground-muted mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Enter what you want to learn. We'll create a personalized roadmap with weekly milestones, 
            daily tasks, and curated resources.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link
              href="/auth/register"
              className="group flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-white font-medium rounded transition-all duration-200 btn-lift"
            >
              Create Your Plan
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border border-border hover:border-foreground-muted text-foreground font-medium rounded transition-all duration-200"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className={`flex items-center justify-center gap-12 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center">
              <div className="text-3xl font-semibold text-foreground">3</div>
              <div className="text-xs text-foreground-muted uppercase tracking-wider mt-1">Planning Layers</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-semibold text-foreground">100%</div>
              <div className="text-xs text-foreground-muted uppercase tracking-wider mt-1">Personalized</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-3xl font-semibold text-foreground">∞</div>
              <div className="text-xs text-foreground-muted uppercase tracking-wider mt-1">Topics</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 border-y border-border bg-background-elevated">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl font-semibold text-foreground mt-3 tracking-tight">
              Three steps to mastery
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`group p-8 bg-background-card border border-border card-hover transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${500 + index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 border border-border flex items-center justify-center">
                    <step.icon size={22} className="text-accent" />
                  </div>
                  <span className="font-mono text-sm text-foreground-muted">{step.number}</span>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-foreground-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">Features</span>
            <h2 className="text-3xl font-semibold text-foreground mt-3 tracking-tight">
              Everything you need to succeed
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-8 bg-background-card border border-border card-hover transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${800 + index * 100}ms` }}
              >
                <div className="w-10 h-10 border border-border flex items-center justify-center mb-5">
                  <feature.icon size={20} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planning Process Section */}
      <section className="py-20 px-6 border-y border-border bg-background-elevated">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-mono text-accent uppercase tracking-widest">The Process</span>
              <h2 className="text-3xl font-semibold text-foreground mt-3 mb-6 tracking-tight">
                How your plan is built
              </h2>
              <p className="text-foreground-muted mb-8 leading-relaxed">
                Our multi-layer system works together to create the perfect study plan for you. 
                Each layer specializes in a different aspect of learning design.
              </p>

              <div className="space-y-4">
                {[
                  { name: 'Strategist', role: 'Decomposes your goal into learning objectives' },
                  { name: 'Scout', role: 'Researches and curates the best resources' },
                  { name: 'Architect', role: 'Builds your structured weekly schedule' },
                ].map((layer, index) => (
                  <div
                    key={layer.name}
                    className={`flex items-center gap-4 p-4 bg-background-card border border-border transition-all duration-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                    style={{ transitionDelay: `${1000 + index * 100}ms` }}
                  >
                    <div className="w-8 h-8 bg-accent text-white flex items-center justify-center font-mono text-sm font-medium">
                      {layer.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{layer.name}</div>
                      <div className="text-sm text-foreground-muted">{layer.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code preview */}
            <div className={`transition-all duration-700 delay-1200 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="bg-background-card border border-border">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background-elevated">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <span className="ml-4 text-xs text-foreground-muted font-mono">study-plan.json</span>
                </div>
                <div className="p-6 font-mono text-sm overflow-x-auto">
                  <div className="text-foreground-muted">{'{'}</div>
                  <div className="pl-4">
                    <span className="text-secondary">"goal"</span>
                    <span className="text-foreground-muted">: </span>
                    <span className="text-accent">"Master Python"</span>
                    <span className="text-foreground-muted">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-secondary">"weeks"</span>
                    <span className="text-foreground-muted">: </span>
                    <span className="text-foreground">8</span>
                    <span className="text-foreground-muted">,</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-secondary">"milestones"</span>
                    <span className="text-foreground-muted">: [</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-foreground-muted">{'{'}</span>
                  </div>
                  <div className="pl-12">
                    <span className="text-secondary">"week"</span>
                    <span className="text-foreground-muted">: </span>
                    <span className="text-foreground">1</span>
                    <span className="text-foreground-muted">,</span>
                  </div>
                  <div className="pl-12">
                    <span className="text-secondary">"title"</span>
                    <span className="text-foreground-muted">: </span>
                    <span className="text-accent">"Python Basics"</span>
                  </div>
                  <div className="pl-8">
                    <span className="text-foreground-muted">{'}'}</span>
                  </div>
                  <div className="pl-4">
                    <span className="text-foreground-muted">]</span>
                  </div>
                  <div className="text-foreground-muted">{'}'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className={`p-12 md:p-16 bg-background-card border border-border text-center transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '1400ms' }}>
            <h2 className="text-3xl font-semibold text-foreground mb-4 tracking-tight">
              Ready to start learning?
            </h2>
            <p className="text-foreground-muted mb-8 max-w-md mx-auto">
              Create your first personalized study plan in seconds. No credit card required.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-hover text-white font-medium rounded transition-all duration-200 btn-lift"
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-8 mt-10 text-xs text-foreground-muted font-mono uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Instant Plans</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Cognit Logo" width={28} height={28} className="rounded" />
            <span className="text-lg font-semibold text-foreground">Cognit</span>
          </div>
          <p className="text-sm text-foreground-muted">
            Stop planning. Start executing.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/auth/login" className="text-foreground-muted hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-foreground-muted hover:text-foreground transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
