import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { OfficialSummary } from '../../types';
import { Search, Users } from 'lucide-react';

export default function Officials() {
  const [officials, setOfficials] = useState<OfficialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminAPI.officials().then((o) => { setOfficials(o); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading officials..." />;

  const filtered = officials.filter((o) =>
    o.full_name.toLowerCase().includes(search.toLowerCase()) ||
    o.department.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Officials Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{officials.length} registered officials</p>
        </div>
        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search officials..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Official</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Department</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Competency</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Courses</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Quizzes</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Avg Score</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {o.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{o.full_name}</p>
                        <p className="text-xs text-slate-400">{o.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{o.department}</td>
                  <td className="py-3 px-4 text-slate-600">{o.job_role}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-semibold ${o.avg_competency >= 60 ? 'text-emerald-600' : o.avg_competency >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {o.avg_competency}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600">{o.courses_completed}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{o.quizzes_taken}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-semibold ${o.average_score >= 70 ? 'text-emerald-600' : o.average_score >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {o.average_score}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      o.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {o.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No officials found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
