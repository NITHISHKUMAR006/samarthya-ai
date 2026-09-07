import { useEffect, useState } from 'react';
import { courseAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Course } from '../../types';
import { GraduationCap, Clock } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseAPI.list().then((c) => { setCourses(c); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading courses..." />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Course Catalogue</h1>
        <p className="text-sm text-slate-500 mt-0.5">{courses.length} courses from iGOT Karmayogi (mock)</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Code</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Course Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Competency</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Difficulty</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Duration</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Provider</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{c.course_code}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{c.competency_area}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      c.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-700' :
                      c.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {c.difficulty}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3" /> {c.duration_hours}h
                  </td>
                  <td className="py-3 px-4 text-slate-500">{c.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
