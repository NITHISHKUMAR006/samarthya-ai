import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User as UserType } from '../types';
import {
  User, LogOut, ShieldCheck, ChevronDown, Sparkles, Trophy,
  Target, BarChart3, Copy, Check,
  ExternalLink, Layers, GraduationCap, ArrowRight
} from 'lucide-react';

interface UserMenuProps {
  user: UserType | null;
  onLogout: () => void;
  onOpenAI?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onOpenAI }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };


  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleTriggerAI = () => {
    setIsOpen(false);
    if (onOpenAI) onOpenAI();
  };

  const userInitial = user?.full_name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* ─── Interactive Avatar Trigger Button ─────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User Account Menu"
        className={`
          flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full sm:rounded-2xl
          transition-all duration-200 select-none cursor-pointer
          ${
            isOpen
              ? 'bg-indigo-50 dark:bg-slate-800 ring-2 ring-indigo-500/50 shadow-md'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95'
          }
        `}
      >
        {/* Avatar Circle with Online indicator */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-black shadow-md ring-2 ring-white dark:ring-slate-900 transition-transform">
            {userInitial}
          </div>
          {/* Active Status Beacon */}
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs"
            title="Active Official"
          />
        </div>

        {/* Desktop Name & Chevron */}
        <div className="hidden sm:flex flex-col text-left max-w-[120px] lg:max-w-[140px]">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
            {user?.full_name || 'Official'}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 truncate font-medium">
            {user?.role === 'ADMIN' ? 'Administrator' : 'Statistical Officer'}
          </span>
        </div>

        <ChevronDown
          className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
          }`}
        />
      </button>

      {/* ─── Dropdown Popover Menu ─────────────────────────────────── */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 dark:bg-black/50 backdrop-blur-xs sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="menu"
            aria-orientation="vertical"
            className="fixed inset-x-3 top-[68px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-92 max-w-[calc(100vw-1.5rem)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 z-50 overflow-hidden animate-fadeIn divide-y divide-slate-100 dark:divide-slate-800/60"
          >
          {/* ─── 1. Official Identity Header ───────────────────────── */}
          <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3 relative z-10">
              {/* Large Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-950/50">
                  {userInitial}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-xs" title="Online">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm sm:text-base text-white truncate tracking-wide">
                    {user?.full_name || 'Official User'}
                  </h4>
                  <span title="MoSPI Verified">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  </span>
                </div>

                {/* Email with 1-click Copy */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-slate-300 truncate font-mono">
                    {user?.email}
                  </p>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title={copiedEmail ? 'Copied to clipboard!' : 'Copy email address'}
                  >
                    {copiedEmail ? (
                      <Check className="w-3 h-3 text-emerald-400 animate-scaleIn" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                {/* Department & Role Badge */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono">
                    {user?.role === 'ADMIN' ? 'System Administrator' : 'Statistical Officer'}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Official
                  </span>
                </div>
              </div>
            </div>

            {/* Ministry footer tag */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span className="truncate">Ministry of Statistics & PI (MoSPI)</span>
              <span className="font-semibold text-amber-300/90 text-[10px]">Mission Karmayogi</span>
            </div>
          </div>

          {/* ─── 2. Quick Competency Telemetry Snippet ─────────────── */}
          {user?.role !== 'ADMIN' && (
            <div className="p-3 bg-indigo-50/50 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Karmayogi Level 2 (Practitioner)
                </span>
                <button
                  onClick={() => handleNavigate('/progress')}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Telemetry</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                  style={{ width: '74%' }}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                <span>Core Competency Progress</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">74% Target</span>
              </div>
            </div>
          )}

          {/* ─── 3. Primary Feature Navigation Links ───────────────── */}
          <div className="p-2 space-y-1">
            {/* View Profile */}
            <button
              onClick={() => handleNavigate(user?.role === 'ADMIN' ? '/admin/officials' : '/profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  View Profile & Dossier
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Official bio, designated skills & credentials
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Competency Roadmap */}
            <button
              onClick={() => handleNavigate(user?.role === 'ADMIN' ? '/admin/competencies' : '/learning-path')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Target className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Learning Roadmap & Goals
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  AI-personalized gap closure milestones
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Verified Transcripts & Certificates */}
            <button
              onClick={() => handleNavigate(user?.role === 'ADMIN' ? '/admin/analytics' : '/results')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {user?.role === 'ADMIN' ? 'Analytics & Telemetry' : 'Transcripts & Badges'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  Verified assessment proofs and certificates
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Quick Ask Samarthya AI trigger */}
            {onOpenAI && (
              <button
                onClick={handleTriggerAI}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-violet-50/40 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-violet-950/20 hover:from-indigo-100/80 hover:to-violet-100/60 dark:hover:from-indigo-950/70 dark:hover:to-violet-950/40 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/30">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      Samarthya AI Advisor
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                      VOICE & CHAT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Ask governance, stats, or course queries
                  </p>
                </div>
              </button>
            )}
          </div>


          {/* ─── 5. Sign Out / Logout Action ───────────────────────── */}
          <div className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200/80 dark:border-rose-900/60 transition-all shadow-2xs cursor-pointer group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Sign Out of Samarthya AI</span>
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
