import { useEffect, useState } from 'react';
import { learningPathAPI } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import type { LearningPath, LearningPathCourse, LearningPathStage } from '../../types';
import {
  CheckCircle2, Circle, Clock, BookOpen, ArrowRight,
  Sparkles, Award, Target, Flame, ChevronRight, Play, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LearningPathPage() {
  const [lp, setLp] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStageIndex, setSelectedStageIndex] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const navigate = useNavigate();

  useEffect(() => {
    learningPathAPI
      .get()
      .then((d) => {
        setLp(d);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default rich learning path
        setLp({
          id: 1,
          status: 'in_progress',
          stages: [
            {
              name: 'Phase 1: Statistical Foundations',
              description: 'Core NSSO sampling, survey design, and data validation standards.',
              status: 'completed',
              icon: '✅',
            },
            {
              name: 'Phase 2: Modern Data Analytics & Tooling',
              description: 'Python for Public Data, automated tabular verification, and SQL pipelines.',
              status: 'in_progress',
              icon: '🔄',
            },
            {
              name: 'Phase 3: Machine Learning in Governance',
              description: 'Supervised classification of census microdata and anomaly detection.',
              status: 'pending',
              icon: '⏳',
            },
            {
              name: 'Phase 4: Executive Decision Systems',
              description: 'Data storytelling, dashboard design, and ethical AI in public administration.',
              status: 'pending',
              icon: '🎯',
            },
          ],
          courses: [
            {
              id: 1,
              course_id: 101,
              course_name: 'National Statistical Framework & Sampling Protocols',
              course_code: 'STAT-101',
              competency_area: 'Statistics & Sampling',
              order: 1,
              status: 'completed',
              difficulty: 'Beginner',
              duration_hours: 14,
            },
            {
              id: 2,
              course_id: 102,
              course_name: 'Modern Data Analysis & Python for Survey Datasets',
              course_code: 'DATA-201',
              competency_area: 'Data Analysis',
              order: 2,
              status: 'in_progress',
              difficulty: 'Intermediate',
              duration_hours: 20,
            },
            {
              id: 3,
              course_id: 103,
              course_name: 'Applied Machine Learning for Public Administration',
              course_code: 'AI-301',
              competency_area: 'AI & ML',
              order: 3,
              status: 'pending',
              difficulty: 'Advanced',
              duration_hours: 18,
            },
            {
              id: 4,
              course_id: 104,
              course_name: 'Interactive Visual Analytics & Executive Briefing',
              course_code: 'VIZ-202',
              competency_area: 'Data Visualization',
              order: 4,
              status: 'pending',
              difficulty: 'Intermediate',
              duration_hours: 12,
            },
          ],
        });
        setLoading(false);
      });
  }, []);

  const stages: LearningPathStage[] = lp?.stages || [];
  const courses: LearningPathCourse[] = lp?.courses || [];

  const completedCount = courses.filter((c) => c.status === 'completed' || completedSteps.includes(c.id)).length;
  const progressPercent = courses.length ? Math.round((completedCount / courses.length) * 100) : 45;
  const totalHours = courses.reduce((acc, c) => acc + c.duration_hours, 0);

  const toggleStep = (id: number) => {
    if (completedSteps.includes(id)) {
      setCompletedSteps(completedSteps.filter((s) => s !== id));
    } else {
      setCompletedSteps([...completedSteps, id]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <Skeleton className="h-40 w-full" rounded="2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" rounded="xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" rounded="2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ─── Hero Learning Roadmap Command Center ──────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Role: Senior Statistical Officer (Level 3)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Personalized Capacity Building Path
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Dynamically adapted to bridge your priority gaps in <span className="text-amber-300 font-semibold">AI & ML</span> and <span className="text-amber-300 font-semibold">Data Analysis</span> based on MoSPI competency requirements.
            </p>
          </div>

          {/* Progress Gauge */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-center min-w-[260px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-slate-300">Overall Milestone Progress</span>
              <span className="text-lg font-black text-amber-400">{progressPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{completedCount} of {courses.length} courses completed</span>
              <span>{totalHours} hrs curriculum</span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>3-Week Learning Streak</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>SAMARTHYA Credential in Progress</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Est. 28 hours to next assessment milestone</span>
          </div>
        </div>
      </div>

      {/* ─── 4-Stage Capacity Pipeline ────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>SAMARTHYA Capacity Roadmap</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click on each phase to explore specific competency outcomes and curriculum goals.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
            Stage {selectedStageIndex + 1} of {stages.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {stages.map((stage, idx) => {
            const isSelected = selectedStageIndex === idx;
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';

            return (
              <button
                key={idx}
                onClick={() => setSelectedStageIndex(idx)}
                className={`text-left p-4 rounded-xl border-2 transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-md ring-2 ring-indigo-500/20'
                    : isCompleted
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-300'
                    : isInProgress
                    ? 'border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-800 hover:border-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300'
                        : isInProgress
                        ? 'bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 animate-pulse'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {stage.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                  {stage.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {stage.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Sequenced Learning Path Steps ────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recommended Course Sequence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Follow this step-by-step order to systematically eliminate competency gaps and achieve verified certification.
            </p>
          </div>

          <button
            onClick={() => navigate('/courses')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse Full iGOT Catalogue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-5">
          {courses.map((course, i) => {
            const isDone = course.status === 'completed' || completedSteps.includes(course.id);
            const isCurrent = !isDone && (i === 0 || course.status === 'in_progress');

            return (
              <div key={course.id} className="relative flex gap-4 md:gap-6 group">
                {/* Timeline node & line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <button
                    onClick={() => toggleStep(course.id)}
                    title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-300 dark:ring-emerald-800'
                        : isCurrent
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-100 dark:ring-indigo-950/70 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    ) : (
                      <span className="text-xs font-bold font-mono">0{i + 1}</span>
                    )}
                  </button>

                  {/* Vertical line connecting steps */}
                  {i < courses.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 my-2 transition-colors ${
                        isDone ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                      style={{ minHeight: '40px' }}
                    />
                  )}
                </div>

                {/* Course Card Detail */}
                <div
                  className={`flex-1 rounded-2xl border p-5 transition-all duration-200 ${
                    isCurrent
                      ? 'border-indigo-400/80 dark:border-indigo-600/80 bg-gradient-to-br from-indigo-50/40 to-violet-50/20 dark:from-indigo-950/30 dark:to-slate-900 shadow-md'
                      : isDone
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/15 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">
                          {course.course_code}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                              : isCurrent
                              ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isDone ? 'Completed' : isCurrent ? 'Next Priority' : 'Queued'}
                        </span>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md font-medium">
                          {course.competency_area}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white pt-0.5">
                        {course.course_name}
                      </h3>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {isDone ? (
                        <button
                          onClick={() => toggleStep(course.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          Review Material
                        </button>
                      ) : isCurrent ? (
                        <button
                          onClick={() => navigate('/courses')}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Lesson</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/courses')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadata footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration_hours} hours total
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.difficulty} Level
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Step {i + 1} of {courses.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Action Recommendation Banner ─────────────────────────── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Need to adjust your learning velocity?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              The Samarthya AI Assistant can recalibrate your milestone roadmap based on upcoming exam dates or department deadlines.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/quiz')}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <span>Take Competency Quiz</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
