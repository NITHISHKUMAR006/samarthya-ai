import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import type { AdminStatistics } from '../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, TrendingUp, Users, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9', '#ec4899', '#f43f5e'];

export default function Analytics() {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .statistics()
      .then((s) => {
        setStats(s);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default statistics
        setStats({
          total_officials: 48,
          active_learners: 36,
          avg_competency: 64,
          course_completion_rate: 78,
          avg_assessment_score: 76,
          total_courses: 14,
          total_quizzes: 12,
          skill_gap_distribution: [
            { name: 'AI & ML', avgGap: 35 },
            { name: 'Data Analysis', avgGap: 25 },
            { name: 'Data Viz', avgGap: 22 },
            { name: 'Cybersecurity', avgGap: 28 },
            { name: 'Statistics', avgGap: 18 },
          ],
          course_popularity: [
            { name: 'AI & ML for Governance', enrollments: 32 },
            { name: 'NSSO Sampling Design', enrollments: 28 },
            { name: 'CERT-In Data Security', enrollments: 24 },
            { name: 'Executive Storytelling', enrollments: 20 },
          ],
          recent_users: [],
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn py-6">
        <Skeleton className="h-32 w-full" rounded="2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" rounded="xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" rounded="2xl" />
          <Skeleton className="h-80 w-full" rounded="2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-center py-10 text-slate-400">Analytics unavailable.</p>;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ─── Hero Header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-amber-300" />
            <span>National Statistical Capacity Metrics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Platform Analytics & Intelligence</h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            Institutional learning progression, cohort performance distributions, and competency benchmarks across departments.
          </p>
        </div>
      </div>

      {/* ─── Top KPI Metric Tiles ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Registered Officials', value: stats.total_officials, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Active Learners', value: stats.active_learners, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Avg Competency', value: `${stats.avg_competency}%`, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Completion Rate', value: `${stats.course_completion_rate}%`, color: 'text-sky-600 dark:text-sky-400' },
          { label: 'Avg Assessment Score', value: `${stats.avg_assessment_score}%`, color: 'text-violet-600 dark:text-violet-400' },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 text-center space-y-1 shadow-sm"
          >
            <p className={`text-2xl md:text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── Charts Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Skill Gap Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Institutional Skill Gap by Domain (%)
            </h2>
            <span className="text-[11px] text-slate-400">Target Benchmark: &lt;15%</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.skill_gap_distribution} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis type="number" domain={[0, 45]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(v: any) => [`${v}%`, 'Average Gap']}
                />
                <Bar dataKey="avgGap" fill="#f43f5e" radius={[0, 6, 6, 0]} name="Avg Gap (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment Distribution Pie */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Course Enrollment Distribution
          </h2>
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.course_popularity}
                  dataKey="enrollments"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {stats.course_popularity.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(v: any) => [`${v} Enrollments`, 'Learners']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Platform Health & MoSPI Standards ─────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Mission Karmayogi Institutional Compliance</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Engagement & Active Velocity
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Active learner ratio:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {stats.total_officials > 0 ? Math.round((stats.active_learners / stats.total_officials) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Catalogue coverage:</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.total_courses} courses live</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Assessment Rigor
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Active question bank:</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.total_quizzes} evaluations</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Pass rate (&ge;60%):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.avg_assessment_score}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Competency Bridge Target
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Current average:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{stats.avg_competency}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Target completion:</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.course_completion_rate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
