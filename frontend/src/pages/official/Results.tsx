import { useEffect, useState } from 'react';
import { progressAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { AssessmentResult } from '../../types';
import { Trophy, Calendar, Target } from 'lucide-react';

export default function Results() {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressAPI.results().then((r) => { setResults(r); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading results..." />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Assessment Results</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your quiz history and scores</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No assessments completed yet.</p>
          <p className="text-xs text-slate-400 mt-1">Take a quiz to see your results here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    r.percentage >= 80 ? 'bg-emerald-100 text-emerald-600' :
                    r.percentage >= 60 ? 'bg-amber-100 text-amber-600' :
                    'bg-rose-100 text-rose-600'
                  }`}>
                    {r.percentage}%
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{r.quiz_title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {r.competency_area}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(r.completed_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-700">{r.score}/{r.total}</span>
                  <p className="text-xs text-slate-400">correct</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
