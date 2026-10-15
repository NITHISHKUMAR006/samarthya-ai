import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Day mode' : 'Switch to Night mode'}
      title={isDark ? 'Switch to Day mode' : 'Switch to Night mode'}
      className={`
        relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300
        ${isDark
          ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700/80 shadow-md shadow-amber-500/10'
          : 'bg-white text-indigo-600 hover:bg-slate-100 border border-slate-200 shadow-sm'
        }
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900
        ${className}
      `}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 transition-transform duration-300 transform rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 transition-transform duration-300 transform rotate-0 scale-100 text-amber-500" />
        )}
      </div>

      {showLabel && (
        <span className={`text-xs font-semibold select-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {isDark ? 'Night' : 'Day'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
