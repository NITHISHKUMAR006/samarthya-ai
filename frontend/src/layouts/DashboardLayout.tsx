import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import AIAssistantModal from '../components/AIAssistantModal';
import NotificationCenter from '../components/NotificationCenter';
import UserMenu from '../components/UserMenu';
import {
  LayoutDashboard, User, BarChart3, BookOpen, GraduationCap,
  FileText, ClipboardCheck, TrendingUp, Trophy, Users,
  PieChart, Settings, LogOut, Menu, X, ChevronRight, Target, Sparkles,
} from 'lucide-react';

const officialNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/competency', label: 'Competency', icon: BarChart3 },
  { to: '/learning-path', label: 'Learning Path', icon: Target },
  { to: '/courses', label: 'SAMARTHYA Courses', icon: GraduationCap },
  { to: '/materials', label: 'Materials', icon: FileText },
  { to: '/quiz', label: 'Quiz', icon: ClipboardCheck },
  { to: '/results', label: 'Results', icon: Trophy },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/officials', label: 'Officials', icon: Users },
  { to: '/admin/competencies', label: 'Competencies', icon: BarChart3 },
  { to: '/admin/courses', label: 'Courses', icon: BookOpen },
  { to: '/admin/analytics', label: 'Analytics', icon: PieChart },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const navItems = user?.role === 'ADMIN' ? adminNav : officialNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* ─── Sidebar ──────────────────────────────── */}
      {/* Overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Fixed Left Sidebar (Laptop Fixed + Mobile Drawer) ─── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 max-w-[85vw] h-full h-[100dvh]
          bg-white dark:bg-slate-950
          border-r border-slate-200 dark:border-slate-800
          flex flex-col shadow-2xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-4 sm:px-5 border-b border-slate-200/80 dark:border-slate-800/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-indigo-500/25">
              S
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wide text-slate-900 dark:text-white">
                SAMARTHYA AI
              </h1>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 -mt-0.5">
                Govt Learning Platform
              </p>
            </div>
          </div>
          <button
            className="ml-auto lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation & Callout */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0 transition-transform group-hover:scale-105" />
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5" />
              </NavLink>
            ))}
          </nav>

          {/* Samarthya AI Callout button in sidebar (scrolls with nav so bottom is never pushed off) */}
          <button
            onClick={() => {
              setSidebarOpen(false);
              setAiModalOpen(true);
            }}
            className="w-full p-3 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-violet-100/40 dark:from-indigo-950/60 dark:via-purple-950/30 dark:to-violet-950/50 border border-indigo-200/90 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-600 text-left transition-all duration-200 group shadow-2xs hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/10 dark:bg-indigo-400/20 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 group-hover:rotate-12 transition-transform" />
                </div>
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  Samarthya AI
                </span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-600/10 dark:bg-indigo-400/20 text-indigo-700 dark:text-indigo-300">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Ask questions about courses, gap analysis & MoSPI
            </p>
          </button>
        </div>

        {/* Quick Actions: Day/Night Mode & Sign Out */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-950/90 flex-shrink-0 flex items-center gap-2">
          <div className="flex-1">
            <ThemeToggle showLabel className="w-full justify-center py-2 text-xs font-semibold" />
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200/70 dark:border-slate-800/70 transition-colors shadow-2xs flex-shrink-0 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ─── Main Content Area (Offset by lg:pl-64 for fixed sidebar) ─── */}
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0 transition-all duration-200">
        {/* Top navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 lg:px-6 sticky top-0 z-30 transition-colors duration-200">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 mr-2 text-slate-600 dark:text-slate-300 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-black tracking-tight truncate flex items-center gap-2">
              <span className="text-slate-900 dark:text-white font-black tracking-tight">
                SAMARTHYA AI
              </span>
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500 font-medium select-none">
                —
              </span>
              <span className="hidden sm:inline text-slate-700 dark:text-slate-300 font-bold text-sm sm:text-base lg:text-lg">
                Adaptive Intelligence
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ask AI button (Desktop & Tablet only; mobile uses prominent bottom nav action) */}
            <button
              onClick={() => setAiModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ask AI</span>
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Theme Toggle (Day & Night) */}
            <ThemeToggle showLabel={false} />

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

            {/* User Account Menu with Profile, Logout & Features */}
            <UserMenu
              user={user}
              onLogout={handleLogout}
              onOpenAI={() => setAiModalOpen(true)}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (< 1024px) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
          <NavLink
            to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to={user?.role === 'ADMIN' ? '/admin/competencies' : '/competency'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              }`
            }
          >
            <BarChart3 className="w-5 h-5" />
            <span>Gaps</span>
          </NavLink>

          {/* Center AI action button */}
          <button onClick={() => setAiModalOpen(true)} className="flex flex-col items-center gap-0.5 -mt-5 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/35 border-2 border-white dark:border-slate-900 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Ask AI</span>
          </button>

          <NavLink
            to={user?.role === 'ADMIN' ? '/admin/courses' : '/courses'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              }`
            }
          >
            <GraduationCap className="w-5 h-5" />
            <span>Courses</span>
          </NavLink>

          <NavLink
            to={user?.role === 'ADMIN' ? '/admin/officials' : '/profile'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              }`
            }
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </NavLink>
        </div>
      </div>

      {/* Global AI Assistant Modal */}
      <AIAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        userName={user?.full_name}
        role={user?.role}
      />
    </div>
  );
}
