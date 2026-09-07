interface Props {
  value: number;
  max?: number;
  label?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md';
  showValue?: boolean;
}

const barColors = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

export default function ProgressBar({ value, max = 100, label, color = 'indigo', size = 'md', showValue = true }: Props) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const h = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
          {showValue && <span className="text-sm font-semibold text-slate-700">{pct}%</span>}
        </div>
      )}
      <div className={`w-full ${h} bg-slate-100 rounded-full overflow-hidden`}>
        <div
          className={`${h} ${barColors[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
