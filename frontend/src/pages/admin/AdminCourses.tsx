import { useEffect, useState, useMemo } from 'react';
import { courseAPI } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import type { Course } from '../../types';
import { GraduationCap, Clock, Search, BookOpen, Filter, ExternalLink } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('All');

  useEffect(() => {
    courseAPI
      .list()
      .then((c) => {
        setCourses(c);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default courses
        setCourses([
          { id: 1, course_code: 'IGOT-AI-101', name: 'Foundations of AI & Machine Learning for Public Officials', competency_area: 'AI & ML', difficulty: 'Intermediate', duration_hours: 18, description: 'Comprehensive intro to ML algorithms in public governance.', provider: 'iGOT Karmayogi', is_igot: true },
          { id: 2, course_code: 'IGOT-STAT-204', name: 'Statistical Sampling & Survey Methodologies (MoSPI)', competency_area: 'Data Analysis', difficulty: 'Advanced', duration_hours: 24, description: 'Mastery of stratified sampling protocols for national statistics.', provider: 'MoSPI National Academy', is_igot: true },
          { id: 3, course_code: 'IGOT-SEC-102', name: 'Cybersecurity & Data Privacy in Government Portals', competency_area: 'Cybersecurity', difficulty: 'Beginner', duration_hours: 12, description: 'CERT-In guidelines and access control frameworks.', provider: 'MeitY / Digital India', is_igot: true },
          { id: 4, course_code: 'IGOT-VIZ-105', name: 'Interactive Data Storytelling & Dashboarding', competency_area: 'Data Visualization', difficulty: 'Intermediate', duration_hours: 16, description: 'Visual analytics and executive briefings.', provider: 'iGOT Karmayogi', is_igot: true },
        ]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.course_code.toLowerCase().includes(search.toLowerCase()) ||
        c.competency_area.toLowerCase().includes(search.toLowerCase());
      const matchDiff = filterDiff === 'All' || c.difficulty === filterDiff;
      return matchSearch && matchDiff;
    });
  }, [courses, search, filterDiff]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn py-6">
        <Skeleton className="h-16 w-full" rounded="2xl" />
        <Skeleton className="h-96 w-full" rounded="2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            iGOT Course Catalogue Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {courses.length} institutional courses indexed and mapped to national competency matrices
          </p>
        </div>

        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
          📚 Official iGOT Catalogue
        </span>
      </div>

      {/* ─── Filter & Search ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by code, title, or competency area..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDiff(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterDiff === diff
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Table ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="text-left py-3.5 px-4 font-bold">Course Code</th>
                <th className="text-left py-3.5 px-4 font-bold">Title</th>
                <th className="text-left py-3.5 px-4 font-bold">Competency Domain</th>
                <th className="text-center py-3.5 px-4 font-bold">Difficulty</th>
                <th className="text-center py-3.5 px-4 font-bold">Duration</th>
                <th className="text-left py-3.5 px-4 font-bold">Agency Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    {c.course_code}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]">
                      {c.competency_area}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        c.difficulty === 'Beginner'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : c.difficulty === 'Intermediate'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {c.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {c.duration_hours} hrs
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                    {c.provider}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No courses match your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
