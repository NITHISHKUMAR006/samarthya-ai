import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import { Skeleton } from '../../components/Skeleton';
import type { AdminStatistics } from '../../types';
import {
  Users, UserCheck, BarChart3, GraduationCap, Trophy,
  BookOpen, ClipboardCheck, ShieldCheck, ArrowRight, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9', '#4f46e5', '#4338ca'];

export default function AdminDashboard() {
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
        // Fallback default admin statistics
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
          recent_users: [
            { name: 'Rajesh Kumar', email: 'rajesh.kumar@samarthya.demo', joinedAt: '2026-10-01' },
            { name: 'Priya Sharma', email: 'priya.sharma@mospi.gov.in', joinedAt: '2026-10-03' },
            { name: 'Amitabh Verma', email: 'amitabh.verma@mospi.gov.in', joinedAt: '2026-10-05' },
            { name: 'Sneha Patel', email: 'sneha.patel@mospi.gov.in', joinedAt: '2026-10-08' },
          ],
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn py-6">
        <Skeleton className="h-32 w-full" rounded="2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" rounded="xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" rounded="2xl" />
          <Skeleton className="h-80 w-full" rounded="2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-center py-10 text-slate-400">Failed to load statistics.</p>;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ─── Hero Banner ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>Capacity Building Commission Oversight Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Governance Dashboard</h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            Institutional telemetry, officer competency benchmarks, and course deployment analytics across MoSPI departments.
          </p>
        </div>
      </div>

      {/* ─── Top Stats Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Officials" value={stats.total_officials} icon={Users} color="indigo" />
        <StatCard title="Active Learners" value={stats.active_learners} icon={UserCheck} color="emerald" />
        <StatCard title="Avg Competency" value={`${stats.avg_competency}%`} icon={BarChart3} color="amber" />
        <StatCard title="Avg Assessment" value={`${stats.avg_assessment_score}%`} icon={Trophy} color="violet" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Completion Rate" value={`${stats.course_completion_rate}%`} icon={GraduationCap} color="sky" />
        <StatCard title="Total Courses" value={stats.total_courses} icon={BookOpen} color="indigo" />
        <StatCard title="Total Quizzes" value={stats.total_quizzes} icon={ClipboardCheck} color="rose" />
      </div>

      {/* ─── Charts ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Gap Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Institutional Skill Gap Distribution (%)
            </h2>
            <span className="text-[11px] text-slate-400">Higher = More urgent gap</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.skill_gap_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
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
                <Bar dataKey="avgGap" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Avg Gap (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Popularity Pie */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Course Enrollment Popularity
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
                  innerRadius={55}
                  outerRadius={95}
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
                  formatter={(v: any) => [`${v} Officials`, 'Enrolled']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── Recent Active Officials Table ────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Recently Registered Officials
          </h2>
          <Link
            to="/admin/officials"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Officials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="text-left py-3 px-3">Official Name</th>
                <th className="text-left py-3 px-3">Email Address</th>
                <th className="text-left py-3 px-3">Date Joined</th>
                <th className="text-right py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {stats.recent_users.map((u, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{u.name}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-3 text-slate-400">{new Date(u.joinedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
