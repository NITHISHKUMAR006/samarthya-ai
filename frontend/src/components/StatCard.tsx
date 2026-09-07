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
  indigo:  { bg: 'bg-indigo-50',  icon: 'bg-indigo-100 text-indigo-600',  border: 'border-indigo-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
  amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-600',   border: 'border-amber-100' },
  rose:    { bg: 'bg-rose-50',    icon: 'bg-rose-100 text-rose-600',    border: 'border-rose-100' },
  sky:     { bg: 'bg-sky-50',     icon: 'bg-sky-100 text-sky-600',     border: 'border-sky-100' },
  violet:  { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-600',  border: 'border-violet-100' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }: Props) {
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-xl border ${c.border} p-5 hover:shadow-md transition-shadow animate-fadeIn`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${c.icon} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
