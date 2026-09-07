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

  if (loading) return <LoadingSpinner message="Analyzing competencies..." />;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Competency Gap Analysis</h1>
          <p className="text-sm text-slate-500 mt-0.5">Prototype competency-gap engine — Required vs Current scores</p>
        </div>
        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          🧪 Prototype Engine
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Overall Score</p>
            <p className="text-2xl font-bold text-slate-800">{overallScore}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Gap</p>
            <p className="text-2xl font-bold text-slate-800">{totalGap}%</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Competencies</p>
            <p className="text-2xl font-bold text-slate-800">{gaps.length}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Current vs Required Competency</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-25} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Current" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Required" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Competency Radar</h2>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#cbd5e1" />
              <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Radar name="Required" dataKey="required" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Gap List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Detailed Gap Analysis</h2>
        <div className="space-y-5">
          {gaps.map((g) => (
            <div key={g.competency_id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="sm:w-40 flex-shrink-0">
                <p className="text-sm font-medium text-slate-800">{g.competency_name}</p>
                <p className="text-xs text-slate-400">{g.category}</p>
              </div>
              <div className="flex-1">
                <ProgressBar
                  value={g.current_score}
                  max={g.required_score}
                  color={g.priority === 'High' ? 'rose' : g.priority === 'Medium' ? 'amber' : 'emerald'}
                />
              </div>
              <div className="sm:w-28 flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-500">{g.current_score}% / {g.required_score}%</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  g.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                  g.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {g.gap}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
