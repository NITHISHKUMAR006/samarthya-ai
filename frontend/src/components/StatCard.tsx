import { type LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
}

const colorMap = {
  indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-950/40',  icon: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',  border: 'border-indigo-100 dark:border-indigo-900/40' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/40' },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-950/40',   icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',   border: 'border-amber-100 dark:border-amber-900/40' },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-950/40',    icon: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',    border: 'border-rose-100 dark:border-rose-900/40' },
  sky:     { bg: 'bg-sky-50 dark:bg-sky-950/40',     icon: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',     border: 'border-sky-100 dark:border-sky-900/40' },
  violet:  { bg: 'bg-violet-50 dark:bg-violet-950/40',  icon: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',  border: 'border-violet-100 dark:border-violet-900/40' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }: Props) {
  const c = colorMap[color];
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border ${c.border} p-5 hover:shadow-md transition-all animate-fadeIn`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${c.icon} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
