import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Read role from localStorage since state may not have updated yet
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(userData.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      if (!err.response) {
        setError(`Unable to reach backend server (${err.message || 'Network Error'}). Ensure the backend container is running on port 5173.`);
      } else {
        setError(err.response?.data?.detail || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'official') => {
    if (role === 'admin') {
      setEmail('admin@samarthya.demo');
      setPassword('admin123');
    } else {
      setEmail('rajesh.kumar@samarthya.demo');
      setPassword('official123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Floating Theme Toggle in top-right */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle showLabel={true} className="shadow-md" />
      </div>

      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-sky-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/70 dark:to-slate-900 transition-colors duration-300" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl animate-pulse-gentle" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl animate-pulse-gentle" style={{ animationDelay: '1s' }} />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* SIH Badge */}
        <div className="text-center mb-6">
          <span className="inline-block bg-amber-500/90 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full tracking-wide shadow-sm">
            SMART INDIA HACKATHON 2026
          </span>
        </div>

        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-8 transition-colors duration-300">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
              <span className="text-white text-2xl font-black">S</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">SAMARTHYA AI</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">AI-Powered Personalized Learning Platform</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Government of India — Official Statistical System</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:rose-300 text-sm rounded-lg px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@samarthya.demo"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-60 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('official')}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-transparent dark:border-indigo-900/40 px-3 py-2 rounded-lg transition-colors"
              >
                👤 Official Login
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 border border-transparent dark:border-violet-900/40 px-3 py-2 rounded-lg transition-colors"
              >
                🛡️ Admin Login
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          Prototype — SAMARTHYA AI &copy; SIH 2026
        </p>
      </div>
    </div>
  );
}
