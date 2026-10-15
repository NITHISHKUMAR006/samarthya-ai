import { useEffect, useState, useMemo } from 'react';
import { courseAPI } from '../../services/api';
import { SkeletonCardGrid } from '../../components/Skeleton';
import type { RecommendedCourse } from '../../types';
import {
  GraduationCap, Clock, Star, Filter, Search, BookOpen,
  CheckCircle2, Play, ExternalLink, X, Award, Sparkles, ArrowUpDown
} from 'lucide-react';

interface EnrolledState {
  [courseId: number]: {
    status: 'enrolled' | 'in_progress' | 'completed';
    progress: number;
    enrolledAt: string;
  };
}

const STORAGE_KEY = 'samarthya_enrolled_courses';

export default function Courses() {
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterDiff, setFilterDiff] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'duration_asc' | 'duration_desc' | 'name'>('match');
  const [selectedCourse, setSelectedCourse] = useState<RecommendedCourse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent enrollment state
  const [enrolled, setEnrolled] = useState<EnrolledState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      1: { status: 'in_progress', progress: 45, enrolledAt: '2026-10-01' },
      3: { status: 'enrolled', progress: 10, enrolledAt: '2026-10-05' },
    };
  });

  useEffect(() => {
    courseAPI
      .recommended()
      .then((c) => {
        setCourses(c);
        setLoading(false);
      })
      .catch(() => {
        // Fallback demo courses if backend is connecting
        setCourses([
          {
            id: 1,
            course_code: 'IGOT-AI-101',
            name: 'Foundations of AI & Machine Learning for Public Officials',
            competency_area: 'AI & ML',
            difficulty: 'Intermediate',
            duration_hours: 18,
            description: 'Comprehensive introduction to machine learning algorithms, model interpretability, and data-driven policymaking within Indian public governance.',
            provider: 'iGOT Karmayogi',
            is_igot: true,
            match_score: 94,
            reason: 'Directly addresses your 35% priority gap in AI & ML',
          },
          {
            id: 2,
            course_code: 'IGOT-STAT-204',
            name: 'Statistical Sampling & Survey Methodologies (MoSPI)',
            competency_area: 'Data Analysis',
            difficulty: 'Advanced',
            duration_hours: 24,
            description: 'In-depth mastery of stratified sampling, estimation errors, and national statistical data verification guidelines for NSSO/MoSPI datasets.',
            provider: 'MoSPI National Academy',
            is_igot: true,
            match_score: 88,
            reason: 'High priority recommendation for your role as Statistical Officer',
          },
          {
            id: 3,
            course_code: 'IGOT-SEC-102',
            name: 'Cybersecurity & Data Privacy in Government Portals',
            competency_area: 'Cybersecurity',
            difficulty: 'Beginner',
            duration_hours: 12,
            description: 'Essential security hygiene, CERT-In compliance protocols, and data classification frameworks for handling sensitive citizen data.',
            provider: 'MeitY / Digital India',
            is_igot: true,
            match_score: 82,
            reason: 'Bridges your 25% gap in Cybersecurity and compliance',
          },
          {
            id: 4,
            course_code: 'IGOT-VIZ-105',
            name: 'Interactive Data Storytelling & Dashboarding',
            competency_area: 'Data Visualization',
            difficulty: 'Intermediate',
            duration_hours: 16,
            description: 'Design impactful dashboards using PowerBI, open-source charts, and visual analytics to communicate statistical insights to senior leadership.',
            provider: 'iGOT Karmayogi',
            is_igot: true,
            match_score: 79,
            reason: 'Bridges visual communication gap for policy briefs',
          },
          {
            id: 5,
            course_code: 'IGOT-GOV-301',
            name: 'Public Sector Ethics & Algorithmic Accountability',
            competency_area: 'Governance',
            difficulty: 'Beginner',
            duration_hours: 8,
            description: 'Frameworks for ethical decision-making, bias detection in automated public systems, and citizen-first digital service delivery.',
            provider: 'Capacity Building Commission',
            is_igot: true,
            match_score: 71,
            reason: 'Core requirement under Mission Karmayogi mandate',
          },
        ]);
        setLoading(false);
      });
  }, []);

  // Save enrollments
  const updateEnrollment = (courseId: number, status: 'enrolled' | 'in_progress' | 'completed', progress: number) => {
    const updated = {
      ...enrolled,
      [courseId]: { status, progress, enrolledAt: new Date().toISOString().split('T')[0] },
    };
    setEnrolled(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.competency_area) set.add(c.competency_area);
    });
    return ['All', ...Array.from(set)];
  }, [courses]);

  // Filter & sort
  const filteredCourses = useMemo(() => {
    let result = courses.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.competency_area.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code.toLowerCase().includes(search.toLowerCase());
      const matchDiff = filterDiff === 'All' || c.difficulty === filterDiff;
      const matchCat = selectedCategory === 'All' || c.competency_area === selectedCategory;
      return matchSearch && matchDiff && matchCat;
    });

    result.sort((a, b) => {
      if (sortBy === 'match') return (b.match_score || 0) - (a.match_score || 0);
      if (sortBy === 'duration_asc') return a.duration_hours - b.duration_hours;
      if (sortBy === 'duration_desc') return b.duration_hours - a.duration_hours;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [courses, search, filterDiff, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <SkeletonCardGrid count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-sm font-medium border border-slate-700 dark:border-slate-200 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 md:p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Mission Karmayogi Curated Catalogue</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">iGOT Karmayogi Courses</h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            AI-matched courses aligned with your competency gaps, job role at MoSPI, and targeted career milestones.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-indigo-100">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            📚 {courses.length} Available Courses
          </span>
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            🎯 {courses.filter((c) => c.match_score >= 80).length} High-Match Opportunities
          </span>
          <span className="bg-emerald-500/20 text-emerald-200 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold">
            ⚡ {Object.keys(enrolled).length} Active Enrollments
          </span>
        </div>
      </div>

      {/* Search & Filters Control Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course title, skill area, code, or keyword..."
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort courses by"
                className="bg-transparent font-semibold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
              >
                <option value="match" className="dark:bg-slate-900">Highest Match</option>
                <option value="duration_asc" className="dark:bg-slate-900">Shortest Duration</option>
                <option value="duration_desc" className="dark:bg-slate-900">Longest Duration</option>
                <option value="name" className="dark:bg-slate-900">Course Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category & Difficulty Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Chips */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDiff(diff)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterDiff === diff
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Count */}
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
        <span>Showing {filteredCourses.length} of {courses.length} courses</span>
        {(search || selectedCategory !== 'All' || filterDiff !== 'All') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setFilterDiff('All');
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((c) => {
          const userState = enrolled[c.id];
          const isEnrolled = !!userState;
          const isCompleted = userState?.status === 'completed';

          return (
            <div
              key={c.id}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 relative overflow-hidden"
            >
              {/* Top Accent line if high match */}
              {c.match_score >= 85 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-indigo-500 to-violet-500" />
              )}

              <div>
                {/* Header row: Icon & Match score */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm flex-shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-bold shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{c.match_score}% Match</span>
                    </div>
                    {isCompleted ? (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    ) : isEnrolled ? (
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                        In Progress ({userState.progress}%)
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Course Code & Title */}
                <div className="space-y-1">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-500 font-semibold">
                    {c.course_code} • {c.provider}
                  </span>
                  <h3
                    onClick={() => setSelectedCourse(c)}
                    className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2"
                  >
                    {c.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                {/* AI Match Reason Badge */}
                {c.reason && (
                  <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-tight">{c.reason}</span>
                  </div>
                )}
              </div>

              {/* In-progress progress bar */}
              {isEnrolled && !isCompleted && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{userState.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${userState.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Bottom Metadata & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                      c.difficulty === 'Beginner'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                        : c.difficulty === 'Intermediate'
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {c.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3" /> {c.duration_hours}h
                  </span>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedCourse(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Course Details"
                    aria-label="View Course Details"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>

                  {isCompleted ? (
                    <button
                      onClick={() => setSelectedCourse(c)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Review
                    </button>
                  ) : isEnrolled ? (
                    <button
                      onClick={() => {
                        updateEnrollment(c.id, 'in_progress', Math.min(100, (userState.progress || 0) + 20));
                        showToast(`Progress recorded (+20%) for ${c.name}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        updateEnrollment(c.id, 'enrolled', 0);
                        showToast(`Successfully enrolled in ${c.name}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">No courses match your criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search keywords, clear category selections, or reset difficulty filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setFilterDiff('All');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ─── Detailed Course Modal ────────────────────────────────── */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {selectedCourse.course_code}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {selectedCourse.provider}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedCourse.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                aria-label="Close dialog"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
              <div>
                <p className="text-[11px] text-slate-400">Match Score</p>
                <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {selectedCourse.match_score}%
                </p>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-700">
                <p className="text-[11px] text-slate-400">Duration</p>
                <p className="text-base font-bold text-slate-800 dark:text-white">
                  {selectedCourse.duration_hours} Hours
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400">Difficulty</p>
                <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedCourse.difficulty}
                </p>
              </div>
            </div>

            {/* Description & Competency Target */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Course Overview
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCourse.description}
              </p>

              {selectedCourse.reason && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-800 dark:text-indigo-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Why this is recommended for you:</span>
                    <span>{selectedCourse.reason}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Syllabus Modules */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Curriculum Modules
              </h3>
              <div className="space-y-2">
                {[
                  { title: 'Module 1: Principles & National Standards', duration: '3.5h', completed: true },
                  { title: 'Module 2: Practical Data Pipelines & Analysis', duration: '6.0h', completed: enrolled[selectedCourse.id]?.progress ? enrolled[selectedCourse.id].progress > 40 : false },
                  { title: 'Module 3: Hands-on Case Studies in Indian Governance', duration: '4.5h', completed: false },
                  { title: 'Module 4: Final Capstone & Competency Assessment', duration: '2.0h', completed: enrolled[selectedCourse.id]?.status === 'completed' },
                ].map((mod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          mod.completed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {mod.completed ? '✓' : idx + 1}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{mod.title}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">{mod.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <a
                href="https://igotkarmayogi.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5"
              >
                <span>Open in Official iGOT Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {enrolled[selectedCourse.id]?.status === 'completed' ? (
                  <button
                    onClick={() => {
                      updateEnrollment(selectedCourse.id, 'in_progress', 50);
                      showToast('Course reset to in-progress for review.');
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Retake Course
                  </button>
                ) : enrolled[selectedCourse.id] ? (
                  <button
                    onClick={() => {
                      updateEnrollment(selectedCourse.id, 'completed', 100);
                      showToast(`Congratulations! You completed ${selectedCourse.name}!`);
                      setSelectedCourse(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Completed
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      updateEnrollment(selectedCourse.id, 'enrolled', 0);
                      showToast(`Enrolled in ${selectedCourse.name}`);
                      setSelectedCourse(null);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Enroll in Course
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
