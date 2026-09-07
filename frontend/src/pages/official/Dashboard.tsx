import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { competencyAPI, progressAPI, courseAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { CompetencyGap, Progress, RecommendedCourse } from '../../types';
import {
  BarChart3, Target, GraduationCap, Trophy, BookOpen, ArrowRight,
  AlertTriangle, TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OfficialDashboard() {
  const { user } = useAuth();
  const [gaps, setGaps] = useState<CompetencyGap[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [recommended, setRecommended] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      competencyAPI.gaps().catch(() => []),
      progressAPI.get().catch(() => null),
      courseAPI.recommended().catch(() => []),
    ]).then(([g, p, r]) => {
      setGaps(g);
      setProgress(p);
      setRecommended(r);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const overallScore = gaps.length
    ? Math.round(gaps.reduce((s, g) => s + g.current_score, 0) / gaps.length)
    : 0;
  const highGaps = gaps.filter((g) => g.priority === 'High').length;

  const chartData = gaps.slice(0, 6).map((g) => ({
    name: g.competency_name.length > 12 ? g.competency_name.slice(0, 12) + '…' : g.competency_name,
    Current: g.current_score,
    Required: g.required_score,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h1>
        <p className="text-indigo-100 mt-1 text-sm">
          Your personalized learning journey continues. Here's your progress overview.
        </p>
        <Link
          to="/competency"
          className="inline-flex items-center gap-2 mt-4 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2 rounded-lg backdrop-blur-sm transition-colors"
        >
          <TrendingUp className="w-4 h-4" /> View Competency Analysis <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Score" value={`${overallScore}%`} subtitle="Avg competency level" icon={BarChart3} color="indigo" />
        <StatCard title="Skill Gaps" value={highGaps} subtitle="High priority gaps" icon={AlertTriangle} color={highGaps > 0 ? 'rose' : 'emerald'} />
        <StatCard title="Courses" value={progress?.courses_completed || 0} subtitle={`${progress?.courses_in_progress || 0} in progress`} icon={GraduationCap} color="sky" />
        <StatCard title="Assessment" value={`${progress?.average_score?.toFixed(0) || 0}%`} subtitle={`${progress?.quizzes_taken || 0} quizzes taken`} icon={Trophy} color="amber" />
      </div>

      {/* Charts & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Competency Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Competency Overview</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Current" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Required" fill="#c7d2fe" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 py-10 text-center">No competency data available yet.</p>
          )}
        </div>

        {/* Skill Gaps */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Priority Gaps</h2>
          <div className="space-y-4">
            {gaps.slice(0, 5).map((g) => (
              <div key={g.competency_id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">{g.competency_name}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    g.priority === 'High' ? 'bg-rose-100 text-rose-700' :
                    g.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {g.priority}
                  </span>
                </div>
                <ProgressBar
                  value={g.current_score}
                  max={g.required_score}
                  color={g.priority === 'High' ? 'rose' : g.priority === 'Medium' ? 'amber' : 'emerald'}
                  size="sm"
                  showValue={false}
                />
                <p className="text-xs text-slate-400 mt-0.5">
                  {g.current_score}% / {g.required_score}% (gap: {g.gap}%)
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">Recommended for You</h2>
          <Link to="/courses" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.slice(0, 3).map((c) => (
            <div key={c.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {c.match_score}% match
                </span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mt-3 group-hover:text-indigo-600 transition-colors">
                {c.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                <span>{c.difficulty}</span>
                <span>•</span>
                <span>{c.duration_hours}h</span>
                <span>•</span>
                <span>{c.provider}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
