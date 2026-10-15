import { useEffect, useState } from 'react';
import { competencyAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ProgressBar from '../../components/ProgressBar';
import type { CompetencyGap } from '../../types';
import { BarChart3, AlertTriangle, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function CompetencyAnalysis() {
  const [gaps, setGaps] = useState<CompetencyGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    competencyAPI.gaps().then((g) => { setGaps(g); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Analyzing competencies..." type="competency" />;

  const overallScore = gaps.length ? Math.round(gaps.reduce((s, g) => s + g.current_score, 0) / gaps.length) : 0;
  const totalGap = gaps.reduce((s, g) => s + g.gap, 0);

  const barData = gaps.map((g) => ({
    name: g.competency_name.length > 14 ? g.competency_name.slice(0, 14) + '…' : g.competency_name,
    Current: g.current_score,
    Required: g.required_score,
    Gap: g.gap,
  }));

  const radarData = gaps.map((g) => ({
    subject: g.competency_name.length > 10 ? g.competency_name.slice(0, 10) + '…' : g.competency_name,
    current: g.current_score,
    required: g.required_score,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Competency Gap Analysis</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Prototype competency-gap engine — Required vs Current scores</p>
        </div>
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/60">
          🧪 Prototype Engine
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/70 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall Score</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{overallScore}%</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/70 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Gap</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalGap}%</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/70 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Competencies</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{gaps.length}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Current vs Required Standard</h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={2} margin={{ bottom: 25, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-25} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Current" fill="#6366f1" radius={[4, 4, 0, 0]} name="Current Score" />
                <Bar dataKey="Required" fill="#c7d2fe" radius={[4, 4, 0, 0]} name="Required Standard" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Competency Radar Profile</h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" strokeOpacity={0.6} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#cbd5e1" />
                <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Required" dataKey="required" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Gap List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Detailed Gap Analysis & Recommendations</h2>
            <p className="text-xs text-slate-400">Target scores defined by MoSPI Competency Framework</p>
          </div>
          <button
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            🖨️ Export PDF
          </button>
        </div>

        <div className="space-y-4 pt-2">
          {gaps.map((g) => (
            <div
              key={g.competency_id}
              className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800"
            >
              <div className="sm:w-48 flex-shrink-0">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{g.competency_name}</p>
                <p className="text-[11px] text-slate-400">{g.category}</p>
              </div>
              <div className="flex-1">
                <ProgressBar
                  value={g.current_score}
                  max={g.required_score}
                  color={g.priority === 'High' ? 'rose' : g.priority === 'Medium' ? 'amber' : 'emerald'}
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{g.current_score}% / {g.required_score}%</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    g.priority === 'High'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400'
                      : g.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
                  }`}
                >
                  {g.gap}% gap
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
