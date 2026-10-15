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
  AlertTriangle, TrendingUp, Sparkles, Play, Flame, Award,
  CheckCircle2, Clock, ShieldCheck, ChevronRight, PieChart,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

export default function OfficialDashboard() {
  const { user } = useAuth();
  const [gaps, setGaps] = useState<CompetencyGap[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [recommended, setRecommended] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'bar' | 'radar'>('bar');

  // Weekly Interactive Milestones
  const [milestones, setMilestones] = useState([
    { id: 1, title: 'Complete Module 3: Advanced SQL for MoSPI Surveys', done: true, time: '45 mins' },
    { id: 2, title: 'Take 10-minute diagnostic quiz on AI in Public Governance', done: false, time: '10 mins' },
    { id: 3, title: 'Upload & analyze state economic circular PDF in Materials', done: false, time: '15 mins' },
  ]);

  const toggleMilestone = (id: number) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
  };

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

  if (loading) return <LoadingSpinner message="Loading your personalized dashboard..." type="dashboard" />;

  const overallScore = gaps.length
    ? Math.round(gaps.reduce((s, g) => s + g.current_score, 0) / gaps.length)
    : 0;
  const highGaps = gaps.filter((g) => g.priority === 'High').length;

  const barData = gaps.slice(0, 6).map((g) => ({
    name: g.competency_name.length > 14 ? g.competency_name.slice(0, 14) + '…' : g.competency_name,
    fullName: g.competency_name,
    Current: g.current_score,
    Required: g.required_score,
    Gap: g.gap,
  }));

  const radarData = gaps.slice(0, 6).map((g) => ({
    subject: g.competency_name.length > 11 ? g.competency_name.slice(0, 11) + '…' : g.competency_name,
    fullName: g.competency_name,
    Current: g.current_score,
    Required: g.required_score,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Hero Command Center ────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20">
        {/* Abstract glowing accents */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-indigo-100 flex items-center gap-1.5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                MoSPI Capacity Building
              </span>
              <span className="text-xs font-semibold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> 4-Day Streak
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl leading-relaxed">
              Your AI-curated statistical competency path is <strong>{overallScore}% complete</strong>. You have <strong>{highGaps} priority gaps</strong> ready for accelerated closure.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/competency"
                className="btn-hero-cta inline-flex items-center gap-2 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] select-none"
              >
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>View Gap Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> 3-Min AI Quiz
              </Link>
              <Link
                to="/learning-path"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl backdrop-blur-md transition-colors"
              >
                <Target className="w-4 h-4 text-sky-300" /> Learning Roadmap
              </Link>
            </div>
          </div>

          {/* Quick Level Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 flex lg:flex-col items-center justify-around gap-4 min-w-[200px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20 font-black text-xl">
              <Award className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <p className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">SAMARTHYA Level</p>
              <p className="text-lg font-bold text-white">Practitioner (L2)</p>
              <p className="text-[11px] text-indigo-200/80 mt-0.5">Top 15% in Department</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Competency"
          value={`${overallScore}%`}
          subtitle="Target: 80% benchmark"
          icon={BarChart3}
          color="indigo"
        />
        <StatCard
          title="Priority Skill Gaps"
          value={highGaps}
          subtitle="Requires attention"
          icon={AlertTriangle}
          color={highGaps > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="iGOT Courses"
          value={progress?.courses_completed || 0}
          subtitle={`${progress?.courses_in_progress || 0} in progress`}
          icon={GraduationCap}
          color="sky"
        />
        <StatCard
          title="Assessment Average"
          value={`${progress?.average_score?.toFixed(0) || 0}%`}
          subtitle={`${progress?.quizzes_taken || 0} quizzes evaluated`}
          icon={Trophy}
          color="amber"
        />
      </div>

      {/* ─── Continue Learning & In-Progress Highlight ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Continue In-Progress Course</h2>
              <p className="text-xs text-slate-400">Pick up right where you left off</p>
            </div>
          </div>
          <Link
            to="/courses"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            All Courses ({recommended.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                MoSPI Data Specialist Track
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 45 mins left
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Data Analysis & Visualization in Public Administration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Module 3: Visualizing National Survey Data with Power BI & Python
            </p>
            <div className="pt-2 max-w-md">
              <ProgressBar value={65} max={100} color="indigo" size="sm" showValue label="Module Progress" />
            </div>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-colors self-start md:self-center"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Resume Lesson
          </Link>
        </div>
      </div>

      {/* ─── Competency Overview Chart & Priority Gaps ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart View with Toggle */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Competency Matrix</h2>
              <p className="text-xs text-slate-400">Current proficiency vs Required role standard</p>
            </div>

            {/* Chart Mode Switcher */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 self-start sm:self-auto">
              <button
                onClick={() => setChartMode('bar')}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setChartMode('radar')}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                  chartMode === 'radar'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                Radar View
              </button>
            </div>
          </div>

          {barData.length > 0 ? (
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'bar' ? (
                  <BarChart data={barData} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="#94a3b8"
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                              <p className="font-bold text-sm text-indigo-300">{data.fullName}</p>
                              <p>Current: <span className="font-semibold">{data.Current}%</span></p>
                              <p>Required: <span className="font-semibold">{data.Required}%</span></p>
                              <p className="text-rose-400">Gap: <span className="font-semibold">{data.Gap}%</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="Current" fill="#6366f1" radius={[4, 4, 0, 0]} name="Current Score" />
                    <Bar dataKey="Required" fill="#c7d2fe" radius={[4, 4, 0, 0]} name="Required Standard" />
                  </BarChart>
                ) : (
                  <RadarChart data={radarData} outerRadius="75%">
                    <PolarGrid stroke="#e2e8f0" strokeOpacity={0.6} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <PolarRadiusAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 9 }} />
                    <Radar name="Current" dataKey="Current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
                    <Radar name="Required" dataKey="Required" stroke="#a5b4fc" fill="#a5b4fc" fillOpacity={0.2} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </RadarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-16 text-center">No competency metrics registered.</p>
          )}
        </div>

        {/* Priority Gaps with Direct Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Critical Skill Gaps</h2>
              <p className="text-xs text-slate-400">High priority competencies</p>
            </div>
            <Link to="/competency" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              All Gaps
            </Link>
          </div>

          <div className="space-y-3.5 pt-1">
            {gaps.slice(0, 4).map((g) => (
              <div
                key={g.competency_id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                    {g.competency_name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.priority === 'High'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}
                  >
                    {g.priority} ({g.gap}%)
                  </span>
                </div>
                <ProgressBar
                  value={g.current_score}
                  max={g.required_score}
                  color={g.priority === 'High' ? 'rose' : 'amber'}
                  size="sm"
                  showValue={false}
                />
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                  <span className="text-[10px] text-slate-400">
                    {g.current_score}% / {g.required_score}%
                  </span>
                  <Link
                    to="/courses"
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    Bridge Gap <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Weekly Milestones & Official Badges ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Goals Checklist */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Weekly Learning Milestones</h3>
                <p className="text-xs text-slate-400">Tasks recommended by Samarthya AI</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {milestones.filter((m) => m.done).length} / {milestones.length} Done
            </span>
          </div>

          <div className="space-y-2.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => toggleMilestone(m.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  m.done
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-slate-400 line-through'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      m.done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {m.done && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {m.title}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60">
                  {m.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Badges & SAMARTHYA Achievements */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Official Credentials</h3>
                <p className="text-xs text-slate-400">Micro-credentials & MoSPI digital badges</p>
              </div>
            </div>
            <Link to="/results" className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Certificates
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-slate-800 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
              <span className="text-xl">🏅</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Data Ethics in Public Policy</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Mastered • Level 3</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/60 dark:from-indigo-950/40 dark:to-slate-800 border border-indigo-200/60 dark:border-indigo-900/40 space-y-1">
              <span className="text-xl">📊</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Survey Harmonization</p>
              <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">70% Completed</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 dark:from-emerald-950/40 dark:to-slate-800 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
              <span className="text-xl">🚀</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Fast Learner Ace</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">5 Quizzes Passed</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/60 dark:from-purple-950/40 dark:to-slate-800 border border-purple-200/60 dark:border-purple-900/40 space-y-1">
              <span className="text-xl">🛡️</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Governance Security</p>
              <p className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold">Next Milestone</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recommended iGOT Courses ───────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Top Recommended iGOT Courses</h2>
            <p className="text-xs text-slate-400">Matched to close your active competency gaps</p>
          </div>
          <Link to="/courses" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommended.slice(0, 3).map((c) => (
            <div
              key={c.id}
              className="border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-4 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/90 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/50">
                    {c.match_score}% match
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {c.difficulty} • {c.duration_hours}h
                </span>
                <Link
                  to="/courses"
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  Enroll <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
