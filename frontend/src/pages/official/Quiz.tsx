import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { quizAPI } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import type { Quiz } from '../../types';
import {
  ClipboardCheck, ArrowRight, Clock, HelpCircle,
  Sparkles, Award, Search, Filter, CheckCircle2, Flame
} from 'lucide-react';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');

  useEffect(() => {
    quizAPI
      .list()
      .then((q) => {
        setQuizzes(q);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default quizzes if backend is starting
        setQuizzes([
          {
            id: 1,
            title: 'Machine Learning & Predictive Modeling Assessment',
            description: 'Evaluate your grasp of supervised classification, regression diagnostics, and bias detection in administrative data.',
            competency_area: 'AI & ML',
            total_questions: 5,
            created_at: '2026-10-01',
          },
          {
            id: 2,
            title: 'Statistical Sampling & Estimation Protocols',
            description: 'Test your understanding of stratified multi-stage sampling, sampling errors, and MoSPI survey weights.',
            competency_area: 'Data Analysis',
            total_questions: 5,
            created_at: '2026-10-02',
          },
          {
            id: 3,
            title: 'Public Portal Cybersecurity & Data Protection',
            description: 'Verify your proficiency in CERT-In security norms, digital citizen privacy, and access control policies.',
            competency_area: 'Cybersecurity',
            total_questions: 5,
            created_at: '2026-10-04',
          },
          {
            id: 4,
            title: 'Executive Data Storytelling & Dashboard Metrics',
            description: 'Assess key principles of visual encoding, chart selection, and KPI communication for governance leadership.',
            competency_area: 'Data Visualization',
            total_questions: 5,
            created_at: '2026-10-06',
          },
        ]);
        setLoading(false);
      });
  }, []);

  const areas = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => {
      if (q.competency_area) set.add(q.competency_area);
    });
    return ['All', ...Array.from(set)];
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchSearch =
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.description.toLowerCase().includes(search.toLowerCase()) ||
        q.competency_area.toLowerCase().includes(search.toLowerCase());
      const matchArea = selectedArea === 'All' || q.competency_area === selectedArea;
      return matchSearch && matchArea;
    });
  }, [quizzes, search, selectedArea]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <Skeleton className="h-32 w-full" rounded="2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 w-full" rounded="2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ─── Hero Header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 md:p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
            <ClipboardCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>SAMARTHYA Competency Verification</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Competency Assessments</h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            Validate your knowledge, bridge critical skill gaps, and earn verified capacity building credentials for your MoSPI official record.
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-indigo-100">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            📝 {quizzes.length} Standard Quizzes
          </span>
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            ⏱️ 5-10 Minutes Each
          </span>
          <span className="bg-emerald-500/20 text-emerald-200 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold">
            🎯 Instant Competency Gap Recalculation
          </span>
        </div>
      </div>

      {/* ─── Search & Category Filter Bar ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes by title or topic..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedArea === area
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Quiz Grid ────────────────────────────────────────────── */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">No assessments found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search query or reset the competency category.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedArea('All');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((q) => (
            <Link
              key={q.id}
              to={`/quiz/${q.id}`}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>

                  <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {q.competency_area}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {q.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>
                </div>
              </div>

              {/* Bottom metadata */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <HelpCircle className="w-3.5 h-3.5" />
                    {q.total_questions} Questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{q.total_questions * 2} mins
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Start Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
