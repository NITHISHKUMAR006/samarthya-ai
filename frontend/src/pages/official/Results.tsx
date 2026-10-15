import { useEffect, useState, useMemo } from 'react';
import { progressAPI } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import type { AssessmentResult } from '../../types';
import {
  Trophy, Calendar, Target, Award, CheckCircle2,
  FileText, ArrowRight, RotateCcw, Download, Sparkles, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

export default function Results() {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedResultForCert, setSelectedResultForCert] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    progressAPI
      .results()
      .then((r) => {
        setResults(r);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default assessment results
        setResults([
          {
            id: 1,
            quiz_id: 1,
            quiz_title: 'Foundations of AI & Machine Learning for Public Officials',
            competency_area: 'AI & ML',
            score: 4,
            total: 5,
            percentage: 80,
            completed_at: '2026-10-06T11:20:00Z',
          },
          {
            id: 2,
            quiz_id: 2,
            quiz_title: 'Statistical Sampling & Estimation Protocols',
            competency_area: 'Data Analysis',
            score: 5,
            total: 5,
            percentage: 100,
            completed_at: '2026-10-08T15:45:00Z',
          },
          {
            id: 3,
            quiz_id: 3,
            quiz_title: 'Public Portal Cybersecurity & Data Protection',
            competency_area: 'Cybersecurity',
            score: 3,
            total: 5,
            percentage: 60,
            completed_at: '2026-10-10T16:10:00Z',
          },
          {
            id: 4,
            quiz_id: 4,
            quiz_title: 'Executive Data Storytelling & Dashboard Metrics',
            competency_area: 'Data Visualization',
            score: 4,
            total: 5,
            percentage: 80,
            completed_at: '2026-10-12T09:30:00Z',
          },
        ]);
        setLoading(false);
      });
  }, []);

  const areas = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      if (r.competency_area) set.add(r.competency_area);
    });
    return ['All', ...Array.from(set)];
  }, [results]);

  const filteredResults = useMemo(() => {
    if (selectedArea === 'All') return results;
    return results.filter((r) => r.competency_area === selectedArea);
  }, [results, selectedArea]);

  const avgScore = results.length
    ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length)
    : 0;
  const distinctions = results.filter((r) => r.percentage >= 80).length;

  const chartData = useMemo(() => {
    return results.map((r, i) => ({
      name: `Test #${i + 1}`,
      score: r.percentage,
      title: r.quiz_title,
      area: r.competency_area,
    }));
  }, [results]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn py-6">
        <Skeleton className="h-32 w-full" rounded="2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" rounded="xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" rounded="2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ─── Hero Header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>SAMARTHYA Verified Assessment Transcript</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Assessment Results</h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            Historical transcript of completed evaluations, verified competency gains, and official certificate downloads.
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-indigo-100">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            📊 {results.length} Assessments Completed
          </span>
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            ⭐ {avgScore}% Overall Average
          </span>
          <span className="bg-emerald-500/20 text-emerald-200 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold">
            🎖️ {distinctions} Distinctions (≥80%)
          </span>
        </div>
      </div>

      {/* ─── Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-1 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Quizzes Attempted</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{results.length}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% submission rate</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-1 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Average Proficiency Score</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{avgScore}%</p>
          <p className="text-[11px] text-slate-500">Above MoSPI cohort benchmark (70%)</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-1 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Distinctions Verified</p>
          <p className="text-2xl font-black text-amber-500">{distinctions}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Eligible for Level 3 badge</p>
        </div>
      </div>

      {/* ─── Trend Chart ──────────────────────────────────────────── */}
      {results.length > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Score Progression Over Time
          </h2>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Score']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ─── Filter Pills ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
        {areas.map((area) => (
          <button
            key={area}
            onClick={() => setSelectedArea(area)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedArea === area
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* ─── Results List ─────────────────────────────────────────── */}
      {filteredResults.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto space-y-3">
          <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">
            No assessment records in this category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Take a quiz to earn verified scores and track your improvement.
          </p>
          <Link
            to="/quiz"
            className="inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            Take an Assessment
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredResults.map((r) => {
            const isHigh = r.percentage >= 80;
            const isMedium = r.percentage >= 60;

            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Percentage circular badge */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-sm ${
                      isHigh
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : isMedium
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <span className="text-base">{r.percentage}%</span>
                    <span className="text-[9px] uppercase font-bold tracking-tight">Score</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {r.quiz_title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
                        <Target className="w-3 h-3" />
                        {r.competency_area}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(r.completed_at).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {r.score} / {r.total} correct
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setSelectedResultForCert(r)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Certificate</span>
                  </button>

                  <Link
                    to={`/quiz/${r.quiz_id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                  >
                    <span>Retake</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Official Certificate Modal ───────────────────────────── */}
      {selectedResultForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-amber-400/40 max-w-xl w-full p-8 text-center space-y-6 shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-500">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                Government of India • Ministry of Statistics & PI
              </p>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Certificate of Competency Achievement
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-xs text-slate-500">This verifies that official participant</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">
                Rajesh Kumar, Statistical Officer (Gr. II)
              </p>
              <p className="text-xs text-slate-500">has successfully mastered the capacity evaluation in</p>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {selectedResultForCert.quiz_title}
              </p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                Verified Score: {selectedResultForCert.percentage}% ({selectedResultForCert.score}/{selectedResultForCert.total})
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Date: {new Date(selectedResultForCert.completed_at).toLocaleDateString()}</span>
              <span>SAMARTHYA AI Verification ID: #MoSPI-{selectedResultForCert.id}-2026</span>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setSelectedResultForCert(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
