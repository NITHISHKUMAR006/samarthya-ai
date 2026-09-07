import { useEffect, useState } from 'react';
import { courseAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { RecommendedCourse } from '../../types';
import { GraduationCap, Clock, Star, Filter, Search } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('All');

  useEffect(() => {
    courseAPI.recommended().then((c) => { setCourses(c); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading iGOT courses..." />;

  const filtered = courses.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                       c.competency_area.toLowerCase().includes(search.toLowerCase());
    const matchDiff = filterDiff === 'All' || c.difficulty === filterDiff;
    return matchSearch && matchDiff;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">iGOT Karmayogi Courses</h1>
          <p className="text-sm text-slate-500 mt-0.5">Mock iGOT catalogue — courses matched to your competency gaps</p>
        </div>
        <span className="text-xs font-medium text-sky-600 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200 self-start">
          📚 {courses.length} courses available
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              className={`text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                filterDiff === d ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-amber-600">{c.match_score}%</span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-slate-400">{c.course_code}</span>
            <h3 className="text-sm font-semibold text-slate-800 mt-1 group-hover:text-indigo-600 transition-colors">
              {c.name}
            </h3>
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">{c.description}</p>

            {c.match_score > 50 && (
              <p className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded mt-2 font-medium">
                💡 {c.reason}
              </p>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className={`font-medium px-2 py-0.5 rounded ${
                  c.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600' :
                  c.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600' :
                  'bg-rose-50 text-rose-600'
                }`}>
                  {c.difficulty}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {c.duration_hours}h
                </span>
              </div>
              <span className="text-[10px] text-slate-400">{c.provider}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-10">No courses match your search criteria.</p>
      )}
    </div>
  );
}
