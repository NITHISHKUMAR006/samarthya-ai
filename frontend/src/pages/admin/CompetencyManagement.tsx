import { useEffect, useState, useMemo } from 'react';
import { competencyAPI } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import type { Competency } from '../../types';
import { BarChart3, Search, Sparkles, Target, Layers } from 'lucide-react';

export default function CompetencyManagement() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    competencyAPI
      .list()
      .then((c) => {
        setCompetencies(c);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default competencies
        setCompetencies([
          { id: 1, name: 'AI & Machine Learning in Governance', category: 'Emerging Technologies', description: 'Understanding predictive models, supervised algorithms, and automated data processing in public policy.' },
          { id: 2, name: 'NSSO Survey Sampling Protocols', category: 'Statistical Systems', description: 'Design, execution, and weighting of multi-stage stratified surveys for national socioeconomic metrics.' },
          { id: 3, name: 'Cybersecurity & Public Data Protection', category: 'Digital Governance', description: 'CERT-In guidelines, cryptographic token standards, and citizen privacy compliance.' },
          { id: 4, name: 'Interactive Executive Dashboarding', category: 'Data Storytelling', description: 'Visual hierarchy, chart encoding, and policy indicator reporting for senior administrative leadership.' },
          { id: 5, name: 'National Accounts Statistics & CPI', category: 'Statistical Systems', description: 'Quarterly GDP estimation, Consumer Price Index tabulation, and econometrics modeling.' },
          { id: 6, name: 'Data Ethics & Algorithmic Fairness', category: 'Emerging Technologies', description: 'Bias mitigation, disparate impact audits, and constitutional principles in automated governance.' },
        ]);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    competencies.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [competencies]);

  const filteredCompetencies = useMemo(() => {
    return competencies.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [competencies, search]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fadeIn py-6">
        <Skeleton className="h-28 w-full" rounded="2xl" />
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
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>Mission Karmayogi Competency Taxonomy</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Competency Framework</h1>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            Standardized capability models defining behavioral, domain-specific, and functional proficiencies for Indian public statistical officers.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-indigo-100">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            📚 {competencies.length} Competencies Catalogued
          </span>
          <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
            🏛️ {categories.length} Knowledge Domains
          </span>
        </div>
      </div>

      {/* ─── Search Bar ───────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search competencies or domains..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* ─── Category Groups ──────────────────────────────────────── */}
      {categories.map((cat) => {
        const catCompetencies = filteredCompetencies.filter((c) => c.category === cat);
        if (catCompetencies.length === 0) return null;

        return (
          <div
            key={cat}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <span>{cat}</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                {catCompetencies.length} Competencies
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {catCompetencies.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      ID #{c.id}
                    </span>
                    <Target className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
