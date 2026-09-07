import { useEffect, useState } from 'react';
import { learningPathAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { LearningPath } from '../../types';
import { CheckCircle2, Circle, Clock, BookOpen, ArrowDown } from 'lucide-react';

export default function LearningPathPage() {
  const [lp, setLp] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    learningPathAPI.get().then((d) => { setLp(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading learning path..." />;

  const stages = lp?.stages || [];
  const courses = lp?.courses || [];

  const stageIcons: Record<string, string> = {
    completed: '✅',
    in_progress: '🔄',
    pending: '⏳',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Personalized Learning Path</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your adaptive learning journey, step by step</p>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-6">Learning Pipeline</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                stage.status === 'completed'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : stage.status === 'in_progress'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <span className="text-base">{stageIcons[stage.status] || '⏳'}</span>
                <div>
                  <p className="font-semibold text-xs">{stage.name}</p>
                  <p className="text-[10px] opacity-70">{stage.description}</p>
                </div>
              </div>
              {i < stages.length - 1 && (
                <ArrowDown className="w-4 h-4 text-slate-300 mx-1 rotate-[-90deg] hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Course Path */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-6">Recommended Courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No courses assigned to your learning path yet.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((c, i) => (
              <div key={c.id} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    c.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                    c.status === 'in_progress' ? 'bg-indigo-100 text-indigo-600' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {c.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> :
                     c.status === 'in_progress' ? <Clock className="w-4 h-4" /> :
                     <Circle className="w-4 h-4" />}
                  </div>
                  {i < courses.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
                </div>

                {/* Course Card */}
                <div className={`flex-1 border rounded-lg p-4 transition-shadow hover:shadow-md ${
                  c.status === 'in_progress' ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">{c.course_code}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          c.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          c.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mt-1">{c.course_name}</h3>
                    </div>
                    <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span>{c.competency_area}</span>
                    <span>•</span>
                    <span>{c.difficulty}</span>
                    <span>•</span>
                    <span>{c.duration_hours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
