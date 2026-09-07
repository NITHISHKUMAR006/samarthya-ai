import { useEffect, useState } from 'react';
import { profileAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { OfficialProfile, ProfileUpdate } from '../../types';
import { Save, User, Briefcase, Building2, Clock, Award, BookOpen, X, Plus } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState<OfficialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState<ProfileUpdate>({});
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    profileAPI.get().then((p) => {
      setProfile(p);
      setForm({
        department: p.department,
        job_role: p.job_role,
        years_of_experience: p.years_of_experience,
        skills: [...p.skills],
        bio: p.bio,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileAPI.update(form);
      setProfile(updated);
      setEditing(false);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to update profile.');
    }
    setSaving(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && form.skills && !form.skills.includes(newSkill.trim())) {
      setForm({ ...form, skills: [...form.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills?.filter((s) => s !== skill) });
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;
  if (!profile) return <p className="text-center text-slate-500 py-10">Profile not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-60 transition-colors">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        )}
      </div>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-lg ${msg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {msg}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {profile.full_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{profile.full_name}</h2>
            <p className="text-sm text-slate-500">{profile.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">Employee ID: {profile.employee_id}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" /> Work Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Department</label>
              {editing ? (
                <input value={form.department || ''} onChange={(e) => setForm({ ...form, department: e.target.value })} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ) : (
                <p className="text-sm font-medium text-slate-800 mt-1">{profile.department || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Job Role</label>
              {editing ? (
                <input value={form.job_role || ''} onChange={(e) => setForm({ ...form, job_role: e.target.value })} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ) : (
                <p className="text-sm font-medium text-slate-800 mt-1">{profile.job_role || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Years of Experience</label>
              {editing ? (
                <input type="number" value={form.years_of_experience || 0} onChange={(e) => setForm({ ...form, years_of_experience: parseInt(e.target.value) })} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              ) : (
                <p className="text-sm font-medium text-slate-800 mt-1">{profile.years_of_experience} years</p>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-500" /> About
          </h3>
          {editing ? (
            <textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={6} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">{profile.bio || 'No bio added yet.'}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-indigo-500" /> Skills
        </h3>
        <div className="flex flex-wrap gap-2">
          {(editing ? form.skills : profile.skills)?.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1.5 rounded-lg">
              {skill}
              {editing && (
                <button onClick={() => removeSkill(skill)} className="text-indigo-400 hover:text-rose-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
          {editing && (
            <div className="flex items-center gap-1.5">
              <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add skill" className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm w-32 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button onClick={addSkill} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Completed Training */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-indigo-500" /> Completed Training
        </h3>
        <div className="space-y-2">
          {profile.completed_training.map((t, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              {t}
            </div>
          ))}
          {profile.completed_training.length === 0 && (
            <p className="text-sm text-slate-400">No training records yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
