import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Search,
  Layers,
  Activity,
  Cpu,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
} from 'lucide-react';

interface ThinkingStep {
  id: string;
  title: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  thresholdSec: number;
}

const THINKING_STEPS: ThinkingStep[] = [
  {
    id: 'analyze',
    title: 'Analyzing Prompt & Intent',
    detail: 'Parsing administrative context & semantic intent...',
    icon: Search,
    thresholdSec: 1.5,
  },
  {
    id: 'framework',
    title: 'Scanning SAMARTHYA Frameworks',
    detail: 'Mapping public service competencies & official role models...',
    icon: Layers,
    thresholdSec: 3.2,
  },
  {
    id: 'mospi',
    title: 'Connecting MoSPI Indicators',
    detail: 'Cross-referencing statistical data registries & NIF metrics...',
    icon: Activity,
    thresholdSec: 5.2,
  },
  {
    id: 'reasoning',
    title: 'Evaluating Capacity Pathways',
    detail: 'Curating targeted courses & strategic recommendations...',
    icon: Brain,
    thresholdSec: 7.5,
  },
  {
    id: 'synthesize',
    title: 'Synthesizing Response',
    detail: 'Structuring executive guidance & actionable next steps...',
    icon: Cpu,
    thresholdSec: 10.0,
  },
];

export interface ThinkingAnimationProps {
  model?: string;
  className?: string;
}

export const ThinkingAnimation: React.FC<ThinkingAnimationProps> = ({
  model,
  className = '',
}) => {
  const [elapsed, setElapsed] = useState<number>(0);
  const [showTrace, setShowTrace] = useState<boolean>(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const diffSec = (Date.now() - startTime) / 1000;
      setElapsed(diffSec);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Determine active step index based on elapsed seconds
  let currentStepIndex = 0;
  for (let i = 0; i < THINKING_STEPS.length; i++) {
    if (elapsed >= (THINKING_STEPS[i - 1]?.thresholdSec ?? 0)) {
      currentStepIndex = i;
    }
  }
  if (currentStepIndex >= THINKING_STEPS.length) {
    currentStepIndex = THINKING_STEPS.length - 1;
  }

  const currentStep = THINKING_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  // Asymptotic progress calculation (starts at 18%, climbs steadily up to 96%)
  const progressPercent = Math.min(
    96,
    Math.round(18 + (1 - Math.exp(-elapsed / 3.4)) * 78)
  );

  return (
    <div
      className={`w-full select-none space-y-2.5 font-sans animate-fadeIn text-slate-800 dark:text-slate-100 ${className}`}
    >
      {/* ─── Header: Neural Icon, Live Timer, Frequency Bars & Trace Toggle ─── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Glowing Brain Orb & "Thinking" Header */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-6 h-6">
            <span
              className="absolute inset-0 rounded-full bg-indigo-500/40 dark:bg-indigo-400/30 animate-ping"
              style={{ animationDuration: '2.4s' }}
            />
            <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xs">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-200 dark:to-pink-300 bg-clip-text text-transparent">
              Thinking
            </span>

            {/* Live elapsed seconds */}
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              <Clock className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400" />
              {elapsed.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Right: Soundwave / Neural Frequency Bars & Trace Toggle */}
        <div className="flex items-center gap-2">
          {/* Animated harmonic neural wave bars */}
          <div
            className="flex items-end gap-0.5 h-3.5 px-1"
            title="Neural Processing Frequency"
          >
            <span className="w-0.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-wave-1" />
            <span className="w-0.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-wave-2" />
            <span className="w-0.5 rounded-full bg-pink-500 dark:bg-pink-400 animate-wave-3" />
            <span className="w-0.5 rounded-full bg-violet-500 dark:bg-violet-400 animate-wave-4" />
            <span className="w-0.5 rounded-full bg-indigo-400 dark:bg-indigo-300 animate-wave-5" />
          </div>

          {/* Toggle trace drawer button */}
          <button
            type="button"
            onClick={() => setShowTrace((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 px-2 py-0.5 rounded-full border border-indigo-200/70 dark:border-indigo-800/80 transition-colors"
            title="Toggle Reasoning Trace"
          >
            <span>{showTrace ? 'Hide Trace' : `Step ${currentStepIndex + 1}/${THINKING_STEPS.length}`}</span>
            {showTrace ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* ─── Active Reasoning Stage Card ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl bg-slate-50/95 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-2.5 shadow-2xs">
        <div className="flex items-start gap-2.5">
          {/* Step Icon with glowing background */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500/15 to-purple-500/15 dark:from-indigo-500/25 dark:to-purple-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-700/50 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
            <StepIcon className="w-3.5 h-3.5 animate-pulse text-indigo-600 dark:text-indigo-300" />
          </div>

          {/* Step Title & Live Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {currentStep.title}
              </p>
              <span className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                {progressPercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
              <span className="truncate">{currentStep.detail}</span>
              <span
                className="inline-block w-1 h-3 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse flex-shrink-0"
                style={{ animationDuration: '0.8s' }}
              />
            </p>
          </div>
        </div>

        {/* ─── Glowing Animated Progress Bar ────────────────────────── */}
        <div className="mt-2.5 w-full bg-slate-200/80 dark:bg-slate-700/70 h-1.5 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Shimmer sweep */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/30 to-transparent animate-shimmer"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* ─── Expanded Reasoning Trace Steps ─────────────────────────── */}
      {showTrace && (
        <div className="space-y-1.5 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 animate-fadeIn">
          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 mb-1">
            Reasoning Pipeline
          </div>
          {THINKING_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const StepItemIcon = step.icon;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                  isCurrent
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60'
                    : 'opacity-75'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-spin flex-shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex-shrink-0" />
                )}

                <StepItemIcon
                  className={`w-3.5 h-3.5 flex-shrink-0 ${
                    isCurrent
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : isCompleted
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  }`}
                />

                <span
                  className={`text-[11px] truncate ${
                    isCurrent
                      ? 'font-semibold text-indigo-900 dark:text-indigo-200'
                      : isCompleted
                      ? 'text-slate-600 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Footer: Step Node Dots & Active Model / Engine Pill ──────── */}
      <div className="flex items-center justify-between px-1 text-[10px] gap-2">
        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {THINKING_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <span
                key={step.id}
                title={step.title}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isDone
                    ? 'w-1.5 bg-emerald-500 dark:bg-emerald-400'
                    : isCurrent
                    ? 'w-4 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 animate-pulse'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Model Engine Tag */}
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate max-w-[170px]">
          <Sparkles className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400 flex-shrink-0 animate-pulse" />
          <span className="truncate">
            {model || 'SAMARTHYA Reasoning Engine'}
          </span>
        </span>
      </div>
    </div>
  );
};

export default ThinkingAnimation;
