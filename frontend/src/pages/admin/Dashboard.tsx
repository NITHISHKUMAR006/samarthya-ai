import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { AdminStatistics } from '../../types';
import { Users, UserCheck, BarChart3, GraduationCap, Trophy, BookOpen, ClipboardCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9', '#4f46e5', '#4338ca'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.statistics().then((s) => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading admin dashboard..." />;
  if (!stats) return <p className="text-center py-10 text-slate-400">Failed to load statistics.</p>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-300 text-sm mt-1">SAMARTHYA AI platform overview and analytics</p>
      </div>

      {/* Stats */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Skill Gap Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.skill_gap_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Bar dataKey="avgGap" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Gap (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Course Popularity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.course_popularity} dataKey="enrollments" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                {stats.course_popularity.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_users.map((u, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-medium text-slate-800">{u.name}</td>
                  <td className="py-2.5 px-3 text-slate-500">{u.email}</td>
                  <td className="py-2.5 px-3 text-slate-400">{new Date(u.joinedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
