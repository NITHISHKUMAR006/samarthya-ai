import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style, rounded = 'xl' }) => {
  const roundedClass = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      style={style}
      className={`
        bg-slate-200/80 dark:bg-slate-800/80
        shimmer-effect ${roundedClass} ${className}
      `}
    />
  );
};

export const CompetencySkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-7 w-32 rounded-full hidden sm:block" />
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
            <Skeleton className="w-12 h-12" rounded="xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="h-72 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="h-72 flex items-end justify-between gap-3 px-4 pt-8">
            {[45, 75, 60, 90, 50, 80, 65].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-full" style={{ height: `${h}%` } as React.CSSProperties} rounded="md" />
                <Skeleton className="h-3 w-8" rounded="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Gaps List Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="space-y-4 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner */}
      <div className="h-32 bg-indigo-900/20 dark:bg-indigo-950/40 rounded-2xl shimmer-effect border border-indigo-500/10" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="w-10 h-10" rounded="lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-80">
          <Skeleton className="h-5 w-40 mb-6" />
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-80 space-y-4">
          <Skeleton className="h-5 w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-3/4 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const CoursesSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-full sm:w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonCardGrid = CoursesSkeleton;
