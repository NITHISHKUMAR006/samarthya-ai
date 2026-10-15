import React from 'react';

export const ThinkingAnimation: React.FC<{ model?: string }> = () => {
  return (
    <div className="inline-flex items-center gap-2 select-none animate-fadeIn py-0.5">
      {/* 3 Bouncing Dots */}
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-bounce"
          style={{ animationDuration: '0.85s', animationDelay: '0ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce"
          style={{ animationDuration: '0.85s', animationDelay: '150ms' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-pink-500 dark:bg-pink-400 animate-bounce"
          style={{ animationDuration: '0.85s', animationDelay: '300ms' }}
        />
      </div>

      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Thinking...
      </span>
    </div>
  );
};

export default ThinkingAnimation;
