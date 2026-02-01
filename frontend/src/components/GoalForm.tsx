'use client';

import { useState } from 'react';
import { Target, Clock, ArrowRight, BookOpen } from 'lucide-react';

interface GoalFormProps {
  onSubmit: (goal: string, weeks: number) => void;
  isLoading: boolean;
}

export function GoalForm({ onSubmit, isLoading }: GoalFormProps) {
  const [goal, setGoal] = useState('');
  const [weeks, setWeeks] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onSubmit(goal.trim(), weeks);
    }
  };

  const suggestions = [
    'Master Python programming',
    'Learn React and Next.js',
    'Prepare for AWS certification',
    'Study AP Calculus AB',
  ];

  return (
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
              disabled={isLoading}
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
              disabled={isLoading}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !goal.trim()}
          className="w-full py-3.5 bg-accent hover:bg-accent-hover disabled:bg-border disabled:cursor-not-allowed text-white font-medium rounded transition-all duration-200 btn-lift flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating plan...</span>
            </>
          ) : (
            <>
              Generate Plan
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Info text */}
        <p className="mt-4 text-xs text-foreground-muted text-center">
          Our system will create a personalized learning roadmap for you
        </p>
      </div>
    </form>
  );
}
