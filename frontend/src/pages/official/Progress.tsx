import { useEffect, useState } from 'react';
import { progressAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Progress } from '../../types';
import { BookOpen, Clock, ClipboardCheck, Award, TrendingUp, Activity } from 'lucide-react';

export default function ProgressPage() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressAPI.get().then((p) => { setProgress(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading progress..." />;
  if (!progress) return <p className="text-center py-10 text-slate-400">Progress data not available.</p>;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Learning Progress</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track your overall learning journey</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Completed" value={progress.courses_completed} subtitle="courses" icon={BookOpen} color="emerald" />
        <StatCard title="In Progress" value={progress.courses_in_progress} subtitle="courses" icon={Clock} color="amber" />
        <StatCard title="Quizzes" value={progress.quizzes_taken} subtitle="taken" icon={ClipboardCheck} color="indigo" />
        <StatCard title="Avg Score" value={`${progress.average_score.toFixed(0)}%`} subtitle="assessment" icon={Award} color="violet" />
        <StatCard title="Learning" value={`${progress.total_learning_hours.toFixed(0)}h`} subtitle="total hours" icon={TrendingUp} color="sky" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-indigo-500" /> Recent Activity
        </h2>
        {progress.recent_activities.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {progress.recent_activities.map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.title}</p>
                  <p className="text-xs text-slate-400">{new Date(a.date).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex-shrink-0">
                  {a.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
