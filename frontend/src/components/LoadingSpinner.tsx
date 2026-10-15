import React from 'react';
import { Sparkles, Brain, Cpu } from 'lucide-react';
import { CompetencySkeleton, DashboardSkeleton, CoursesSkeleton } from './Skeleton';

interface Props {
  message?: string;
  type?: 'competency' | 'dashboard' | 'courses' | 'ai' | 'default';
}

export default function LoadingSpinner({ message = 'Loading...', type = 'default' }: Props) {
  // If specific view skeleton requested, render matching skeleton
  if (type === 'competency' || message.toLowerCase().includes('competenc')) {
    return <CompetencySkeleton />;
  }
  if (type === 'dashboard' || message.toLowerCase().includes('dashboard')) {
    return <DashboardSkeleton />;
  }
  if (type === 'courses' || message.toLowerCase().includes('course')) {
    return <CoursesSkeleton />;
  }

  // Premium AI Engine Loading Interface (Replaces raw circular spinner)
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] p-6 animate-fadeIn">
      <div className="relative max-w-sm w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-6 overflow-hidden">
        {/* Animated Background Glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-violet-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Central Glowing AI Pulse Core */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          {/* Outer glowing pulse ring */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 opacity-20 animate-ping" style={{ animationDuration: '2.5s' }} />
          {/* Rotating gradient ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-sm animate-pulse-gentle" />
          {/* Core box */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
            <Brain className="w-8 h-8 animate-pulse-gentle" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
        </div>

        {/* Status text & details */}
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/40 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Cpu className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            SAMARTHYA AI ENGINE
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {message}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Synthesizing official statistics & competency matrix...
          </p>
        </div>

        {/* Shimmering Dynamic Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-full shimmer-effect w-3/4 animate-pulse-gentle" />
        </div>
      </div>
    </div>
  );
}
