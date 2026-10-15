import { useEffect, useState } from 'react';
import { progressAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import { Skeleton } from '../../components/Skeleton';
import type { Progress } from '../../types';
import {
  BookOpen, Clock, ClipboardCheck, Award, TrendingUp,
  Activity, Sparkles, CheckCircle2, Target, Calendar, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';

const MOCK_HOURS_DATA = [
  { month: 'Jun', hours: 8 },
  { month: 'Jul', hours: 14 },
  { month: 'Aug', hours: 18 },
  { month: 'Sep', hours: 22 },
  { month: 'Oct', hours: 28 },
];

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressAPI
      .get()
      .then((p) => {
        setProgress(p);
        setLoading(false);
      })
      .catch(() => {
        // Fallback progress state
        setProgress({
          courses_completed: 3,
          courses_in_progress: 2,
          quizzes_taken: 5,
          average_score: 80,
          total_learning_hours: 32,
          recent_activities: [
            {
              type: 'quiz',
              title: 'Statistical Sampling & Estimation Protocols Assessment',
              score: '100%',
              date: '2026-10-08T15:45:00Z',
            },
            {
              type: 'course',
              title: 'Foundations of AI & Machine Learning for Public Officials',
              score: 'Lesson 4 Completed',
              date: '2026-10-09T11:20:00Z',
            },
            {
              type: 'quiz',
              title: 'Public Portal Cybersecurity & Data Protection',
              score: '60%',
              date: '2026-10-10T16:10:00Z',
            },
            {
              type: 'quiz',
              title: 'Executive Data Storytelling & Dashboard Metrics',
              score: '80%',
              date: '2026-10-12T09:30:00Z',
            },
          ],
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn py-6">
        <Skeleton className="h-32 w-full" rounded="2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 w-full" rounded="xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" rounded="2xl" />
      </div>
    );
  }

  if (!progress) return null;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ─── Hero Header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
            <span>Mission Karmayogi Performance Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Learning Journey & Progress Metrics
          </h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            Holistic view of your completed hours, competency evolution, and ongoing capacity milestones.
          </p>
        </div>

        {/* Level 2 to Level 3 progress bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 max-w-lg">
          <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
            <span>Karmayogi Level 2 → Level 3 (Senior Data Officer)</span>
            <span className="font-bold text-amber-400">74% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full" style={{ width: '74%' }} />
          </div>
        </div>
      </div>

      {/* ─── Key Metrics Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Courses Completed" value={progress.courses_completed} subtitle="certified" icon={BookOpen} color="emerald" />
        <StatCard title="In Progress" value={progress.courses_in_progress} subtitle="active" icon={Clock} color="amber" />
        <StatCard title="Quizzes Taken" value={progress.quizzes_taken} subtitle="evaluations" icon={ClipboardCheck} color="indigo" />
        <StatCard title="Avg Score" value={`${progress.average_score.toFixed(0)}%`} subtitle="proficiency" icon={Award} color="violet" />
        <StatCard title="Total Hours" value={`${progress.total_learning_hours.toFixed(0)}h`} subtitle="invested" icon={TrendingUp} color="sky" />
      </div>

      {/* ─── Charts & Domains Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Hours Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Monthly Learning Engagement (Hours)</span>
          </h2>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_HOURS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} hrs`, 'Learning Time']}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Domain Mastery */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Target Competency Mastery</span>
          </h2>

          <div className="space-y-3.5 pt-1">
            {[
              { name: 'Survey Sampling & Methodology', score: 85, color: 'bg-emerald-500' },
              { name: 'Data Visualization & Reporting', score: 78, color: 'bg-indigo-500' },
              { name: 'Cybersecurity & Citizen Privacy', score: 65, color: 'bg-sky-500' },
              { name: 'AI & Machine Learning in Governance', score: 55, color: 'bg-amber-500' },
              { name: 'National Accounts & Econometrics', score: 72, color: 'bg-violet-500' },
            ].map((d, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{d.name}</span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-400">{d.score}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full transition-all duration-500`} style={{ width: `${d.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recent Activity Log ──────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Recent Learning Activity Log</span>
          </h2>
          <Link to="/results" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All Results
          </Link>
        </div>

        <div className="space-y-3 pt-1">
          {progress.recent_activities.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{a.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{new Date(a.date).toLocaleDateString()}</p>
                </div>
              </div>

              <span className="font-bold text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/60 flex-shrink-0">
                {a.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
