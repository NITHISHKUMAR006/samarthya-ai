import { useEffect, useState } from 'react';
import { competencyAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Competency } from '../../types';
import { BarChart3 } from 'lucide-react';

export default function CompetencyManagement() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    competencyAPI.list().then((c) => { setCompetencies(c); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading competencies..." />;

  const categories = [...new Set(competencies.map((c) => c.category))];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Competency Framework</h1>
        <p className="text-sm text-slate-500 mt-0.5">{competencies.length} competencies across {categories.length} categories</p>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            {cat}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {competencies.filter((c) => c.category === cat).map((c) => (
              <div key={c.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <h3 className="text-sm font-semibold text-slate-800">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
