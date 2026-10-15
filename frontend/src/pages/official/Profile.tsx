import { useEffect, useState } from 'react';
import { profileAPI } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import type { OfficialProfile, ProfileUpdate } from '../../types';
import {
  Save, User, Briefcase, Building2, Clock, Award,
  BookOpen, X, Plus, ShieldCheck, Mail, Hash, Sparkles,
  CheckCircle2, AlertCircle, Edit3
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'Python for Data Science',
  'NSSO Sampling Design',
  'Machine Learning',
  'PowerBI Dashboarding',
  'CERT-In Security Compliance',
  'Time Series Forecasting',
  'SQL & Database Queries',
  'National Accounts Statistics',
];

export default function Profile() {
  const [profile, setProfile] = useState<OfficialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState<ProfileUpdate>({});
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    profileAPI
      .get()
      .then((p) => {
        setProfile(p);
        setForm({
          department: p.department || 'Ministry of Statistics & Programme Implementation (MoSPI)',
          job_role: p.job_role || 'Statistical Officer (Gr. II)',
          years_of_experience: p.years_of_experience || 6,
          skills: p.skills?.length ? [...p.skills] : ['Data Analysis', 'Survey Sampling', 'Statistical Computing', 'Data Visualization'],
          completed_training: p.completed_training?.length ? [...p.completed_training] : [
            'NSSO Field Operations & Survey Methodology (NSSTA, Greater Noida)',
            'Foundations of Big Data Analytics in Public Policy (SAMARTHYA)',
            'Cybersecurity & Citizen Data Protection Norms (MeitY)',
          ],
          bio: p.bio || 'Senior statistical officer managing large-scale household socio-economic surveys, census tabulation pipelines, and predictive estimation models.',
        });
        setLoading(false);
      })
      .catch(() => {
        // Fallback default profile
        const defaultProfile: OfficialProfile = {
          id: 1,
          user_id: 1,
          employee_id: 'MOSPI-2024-0842',
          department: 'Ministry of Statistics & Programme Implementation (MoSPI)',
          job_role: 'Statistical Officer (Gr. II)',
          years_of_experience: 6,
          skills: ['Data Analysis', 'Survey Sampling', 'Statistical Computing', 'Data Visualization'],
          completed_training: [
            'NSSO Field Operations & Survey Methodology (NSSTA, Greater Noida)',
            'Foundations of Big Data Analytics in Public Policy (SAMARTHYA)',
            'Cybersecurity & Citizen Data Protection Norms (MeitY)',
          ],
          bio: 'Statistical officer managing large-scale household socio-economic surveys, census tabulation pipelines, and predictive estimation models.',
          full_name: 'Rajesh Kumar',
          email: 'rajesh.kumar@samarthya.demo',
        };
        setProfile(defaultProfile);
        setForm({
          department: defaultProfile.department,
          job_role: defaultProfile.job_role,
          years_of_experience: defaultProfile.years_of_experience,
          skills: [...defaultProfile.skills],
          completed_training: [...defaultProfile.completed_training],
          bio: defaultProfile.bio,
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileAPI.update(form);
      setProfile(updated);
      setEditing(false);
      setMsg({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMsg(null), 3500);
    } catch {
      if (profile) {
        setProfile({
          ...profile,
          department: form.department || profile.department,
          job_role: form.job_role || profile.job_role,
          years_of_experience: form.years_of_experience || profile.years_of_experience,
          skills: form.skills || profile.skills,
          bio: form.bio || profile.bio,
        });
      }
      setEditing(false);
      setMsg({ text: 'Profile updated locally!', type: 'success' });
      setTimeout(() => setMsg(null), 3500);
    }
    setSaving(false);
  };

  const addSkill = (skillToAdd?: string) => {
    const val = (skillToAdd || newSkill).trim();
    if (val && form.skills && !form.skills.includes(val)) {
      setForm({ ...form, skills: [...form.skills, val] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills?.filter((s) => s !== skill) });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn py-6">
        <Skeleton className="h-44 w-full" rounded="2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" rounded="2xl" />
          <Skeleton className="h-64 w-full" rounded="2xl" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* ─── Notification message ─────────────────────────────────── */}
      {msg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── Official GovTech Identity Card ───────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Government Seal Border */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-4 ring-white/10">
                {profile.full_name?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white text-[10px]">
                ✓
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight">{profile.full_name}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>SAMARTHYA Verified</span>
                </span>
              </div>

              <p className="text-xs font-medium text-slate-300">{profile.job_role}</p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Hash className="w-3 h-3 text-indigo-400" />
                  {profile.employee_id}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-400" />
                  {profile.email}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cadre & Department Strip */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="font-medium">{profile.department}</span>
          </div>

          <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-lg border border-indigo-800/60">
            Cadre: Subordinate Statistical Service (SSS)
          </span>
        </div>
      </div>

      {/* ─── Work Information & Bio Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Work Information Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Official Posting Details</span>
          </h2>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Ministry / Department
              </label>
              {editing ? (
                <input
                  type="text"
                  value={form.department || ''}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {profile.department}
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Designation / Job Role
              </label>
              {editing ? (
                <input
                  type="text"
                  value={form.job_role || ''}
                  onChange={(e) => setForm({ ...form, job_role: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {profile.job_role}
                </p>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Years in Public Service
              </label>
              {editing ? (
                <input
                  type="number"
                  value={form.years_of_experience || 0}
                  onChange={(e) =>
                    setForm({ ...form, years_of_experience: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {profile.years_of_experience} Years
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bio / Capacity Statement Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Capacity Statement & Bio</span>
          </h2>

          <div className="flex-1 pt-1">
            {editing ? (
              <textarea
                value={form.bio || ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={5}
                placeholder="Describe your primary responsibilities, survey domains, or technical competencies..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            ) : (
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {profile.bio || 'No capacity statement added yet.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Competency Skills Manager ─────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Verified Competency Skill Tags</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Skills mapped to your SAMARTHYA learning profile and competency assessment records.
            </p>
          </div>
        </div>

        {/* Active Skill Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(editing ? form.skills : profile.skills)?.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-2xs"
            >
              <span>{skill}</span>
              {editing && (
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-indigo-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>

        {/* Edit Add Skill Input & Suggestions */}
        {editing && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Type skill name and press Enter..."
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => addSkill()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div>
              <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Quick suggestions for MoSPI officers:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter((s) => !form.skills?.includes(s)).slice(0, 5).map((s) => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Completed Training Records ────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Completed Institutional Training Records</span>
        </h2>

        <div className="space-y-2.5 pt-1">
          {profile.completed_training.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex-1">{t}</span>
              <span className="text-[11px] font-mono text-slate-400">Verified</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
