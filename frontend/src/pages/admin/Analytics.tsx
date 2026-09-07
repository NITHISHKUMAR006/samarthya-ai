import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { AdminStatistics } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9', '#ec4899', '#f43f5e'];

export default function Analytics() {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.statistics().then((s) => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading analytics..." />;
  if (!stats) return <p className="text-center py-10 text-slate-400">Analytics unavailable.</p>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Platform Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Comprehensive platform usage and performance insights</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Officials', value: stats.total_officials },
          { label: 'Active Learners', value: stats.active_learners },
          { label: 'Avg Competency', value: `${stats.avg_competency}%` },
          { label: 'Completion Rate', value: `${stats.course_completion_rate}%` },
          { label: 'Avg Score', value: `${stats.avg_assessment_score}%` },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Average Skill Gap by Competency</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.skill_gap_distribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="avgGap" fill="#6366f1" radius={[0, 4, 4, 0]} name="Avg Gap (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Course Enrollment Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.course_popularity} dataKey="enrollments" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fontSize: 10 }}>
                {stats.course_popularity.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Platform Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Engagement</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Active learner rate</span>
                <span className="font-semibold text-slate-800">{stats.total_officials > 0 ? Math.round((stats.active_learners / stats.total_officials) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Course availability</span>
                <span className="font-semibold text-slate-800">{stats.total_courses} courses</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Assessment</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total quizzes</span>
                <span className="font-semibold text-slate-800">{stats.total_quizzes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Average score</span>
                <span className="font-semibold text-slate-800">{stats.avg_assessment_score}%</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Competency</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Average level</span>
                <span className="font-semibold text-slate-800">{stats.avg_competency}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Completion rate</span>
                <span className="font-semibold text-slate-800">{stats.course_completion_rate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
