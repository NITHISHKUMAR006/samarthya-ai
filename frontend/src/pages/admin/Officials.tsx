import { useEffect, useState, useMemo } from 'react';
import { adminAPI } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import type { OfficialSummary } from '../../types';
import {
  Search, Users, Download, ShieldCheck, Mail, Building2, Award,
  UserPlus, X, Eye, EyeOff, Key, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';

export default function Officials() {
  const [officials, setOfficials] = useState<OfficialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  // ─── Create Official Modal State ──────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formDepartment, setFormDepartment] = useState('Ministry of Statistics & PI (MoSPI)');
  const [formJobRole, setFormJobRole] = useState('Statistical Officer');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Gov@';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(pwd);
    setShowPassword(true);
  };

  const handleCreateOfficial = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      setErrorMsg('Please fill in Full Name, Email ID, and Password.');
      return;
    }

    if (formPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const newOfficial = await adminAPI.createOfficial({
        full_name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        password: formPassword,
        department: formDepartment.trim() || 'Ministry of Statistics & PI (MoSPI)',
        job_role: formJobRole.trim() || 'Statistical Officer',
      });

      setOfficials((prev) => [newOfficial, ...prev]);
      setSuccessMsg(`Official account for ${newOfficial.full_name} created successfully!`);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to create official account.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    adminAPI
      .officials()
      .then((o) => {
        setOfficials(o);
        setLoading(false);
      })
      .catch(() => {
        // Fallback default mock officials
        setOfficials([
          {
            id: 1,
            full_name: 'Rajesh Kumar',
            email: 'rajesh.kumar@samarthya.demo',
            department: 'Ministry of Statistics & PI (MoSPI)',
            job_role: 'Statistical Officer (Gr. II)',
            avg_competency: 64,
            courses_completed: 3,
            quizzes_taken: 5,
            average_score: 80,
            is_active: true,
          },
          {
            id: 2,
            full_name: 'Priya Sharma',
            email: 'priya.sharma@mospi.gov.in',
            department: 'NSSO Survey Design & Research Division',
            job_role: 'Assistant Director (Statistics)',
            avg_competency: 78,
            courses_completed: 5,
            quizzes_taken: 6,
            average_score: 88,
            is_active: true,
          },
          {
            id: 3,
            full_name: 'Amitabh Verma',
            email: 'amitabh.verma@mospi.gov.in',
            department: 'Data Informatics & Innovation Division',
            job_role: 'Senior Statistical Officer',
            avg_competency: 56,
            courses_completed: 2,
            quizzes_taken: 3,
            average_score: 72,
            is_active: true,
          },
          {
            id: 4,
            full_name: 'Sneha Patel',
            email: 'sneha.patel@mospi.gov.in',
            department: 'National Accounts Division (NAD)',
            job_role: 'Junior Statistical Officer',
            avg_competency: 70,
            courses_completed: 4,
            quizzes_taken: 4,
            average_score: 85,
            is_active: true,
          },
        ]);
        setLoading(false);
      });
  }, []);

  const departments = useMemo(() => {
    const set = new Set<string>();
    officials.forEach((o) => {
      if (o.department) set.add(o.department);
    });
    return ['All', ...Array.from(set)];
  }, [officials]);

  const filtered = useMemo(() => {
    return officials.filter((o) => {
      const matchSearch =
        o.full_name.toLowerCase().includes(search.toLowerCase()) ||
        o.department.toLowerCase().includes(search.toLowerCase()) ||
        o.email.toLowerCase().includes(search.toLowerCase()) ||
        o.job_role.toLowerCase().includes(search.toLowerCase());
      const matchDept = filterDept === 'All' || o.department === filterDept;
      return matchSearch && matchDept;
    });
  }, [officials, search, filterDept]);

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Department', 'Job Role', 'Avg Competency', 'Completed Courses', 'Quizzes', 'Avg Score', 'Status'];
    const rows = filtered.map((o) => [
      o.id,
      `"${o.full_name}"`,
      `"${o.email}"`,
      `"${o.department}"`,
      `"${o.job_role}"`,
      `${o.avg_competency}%`,
      o.courses_completed,
      o.quizzes_taken,
      `${o.average_score}%`,
      o.is_active ? 'Active' : 'Inactive',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `samarthya_officials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
            Officials Registry & Capacity Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {officials.length} registered public officials enrolled across national statistical directorates
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => {
              setErrorMsg(null);
              setSuccessMsg(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Official</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Filter & Search Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, role, or division..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {departments.length > 2 && (
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            aria-label="Filter by department"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer shadow-sm"
          >
            {departments.map((d) => (
              <option key={d} value={d} className="dark:bg-slate-900">
                {d}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ─── Officials Table ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="text-left py-3.5 px-4 font-bold">Official / Identity</th>
                <th className="text-left py-3.5 px-4 font-bold">Department / Division</th>
                <th className="text-left py-3.5 px-4 font-bold">Designation</th>
                <th className="text-center py-3.5 px-4 font-bold">Competency</th>
                <th className="text-center py-3.5 px-4 font-bold">Courses</th>
                <th className="text-center py-3.5 px-4 font-bold">Quizzes</th>
                <th className="text-center py-3.5 px-4 font-bold">Avg Score</th>
                <th className="text-center py-3.5 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-sm">
                        {o.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{o.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{o.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {o.department}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{o.job_role}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                        o.avg_competency >= 60
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : o.avg_competency >= 40
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {o.avg_competency}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {o.courses_completed}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {o.quizzes_taken}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`font-bold ${
                        o.average_score >= 70
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {o.average_score}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No officials match your search filter.</p>
          </div>
        )}
      </div>

      {/* ─── Create Official Account Modal ──────────────────────────── */}
      {showCreateModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-official-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setShowCreateModal(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 id="create-official-title" className="font-extrabold text-base tracking-wide text-white">
                    Create New Official Account
                  </h3>
                  <p className="text-xs text-slate-300">
                    Enroll civil servant with username, email ID & credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateOfficial} className="p-5 space-y-4">
              {/* Alert Feedback Messages */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Username / Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Username <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Official Email ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. ramesh.sharma@mospi.gov.in"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Account Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Department & Designation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. National Accounts Division (NAD)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation / Job Role
                  </label>
                  <input
                    type="text"
                    value={formJobRole}
                    onChange={(e) => setFormJobRole(e.target.value)}
                    placeholder="e.g. Statistical Officer"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Enrolling Official...' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
