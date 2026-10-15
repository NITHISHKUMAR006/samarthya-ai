import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  BookOpen,
  AlertTriangle,
  FileText,
  CheckCircle2,
  X,
  ChevronRight,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: 'course' | 'gap' | 'circular' | 'system';
  badge: string;
  link?: string;
  actionText?: string;
}

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'SAMARTHYA Sync Active',
      desc: '12 new specialized MoSPI training modules synced to your catalog.',
      time: '10m ago',
      unread: true,
      type: 'course',
      badge: 'Training Sync',
      link: user?.role === 'ADMIN' ? '/admin/courses' : '/courses',
      actionText: 'View Modules',
    },
    {
      id: '2',
      title: 'Competency Gap Detected',
      desc: 'Your AI & ML in Public Governance gap is 35%. Recommendation roadmap ready.',
      time: '1h ago',
      unread: true,
      type: 'gap',
      badge: 'Competency Alert',
      link: user?.role === 'ADMIN' ? '/admin/competencies' : '/competency',
      actionText: 'Analyze Gap',
    },
    {
      id: '3',
      title: 'MoSPI Policy Circular 2026',
      desc: 'Updated standards on official statistical survey harmonization published.',
      time: '3h ago',
      unread: false,
      type: 'circular',
      badge: 'Policy Directive',
      link: '/materials',
      actionText: 'Read Circular',
    },
    {
      id: '4',
      title: 'Statistical Survey Quiz Open',
      desc: 'Quarterly evaluation on sampling methodology is now ready for assessment.',
      time: '1d ago',
      unread: false,
      type: 'system',
      badge: 'Assessment',
      link: '/quiz',
      actionText: 'Take Quiz',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return n.unread;
    return true;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.link) {
      setIsOpen(false);
      navigate(item.link);
    }
  };

  return (
    <div className="relative">
      {/* ─── Notification Bell Trigger Button ─────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Official Notifications"
        aria-expanded={isOpen}
        className={`relative p-2 rounded-xl transition-all ${
          isOpen
            ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </span>
        )}
      </button>

      {/* ─── Modal / Dropdown Layer ────────────────────────────────── */}
      {isOpen && (
        <>
          {/* Backdrop with click-to-dismiss */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Floating Dropdown Card */}
          <div
            role="dialog"
            aria-label="Notifications panel"
            className="
              fixed inset-x-4 max-w-[340px] sm:max-w-none mx-auto sm:mx-0 top-[64px] z-50
              sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2
              w-auto sm:w-[380px]
              bg-white dark:bg-slate-900
              rounded-2xl sm:rounded-3xl shadow-2xl
              border border-slate-200 dark:border-slate-800
              overflow-hidden animate-fadeIn flex flex-col
            "
          >
            {/* Header */}
            <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      Notifications
                    </h3>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-full shadow-xs flex-shrink-0">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                      title="Mark all notifications as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mark read</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Close"
                    aria-label="Close notification panel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                    activeFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveFilter('unread')}
                  className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    activeFilter === 'unread'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                        activeFilter === 'unread'
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Notification Items List */}
            <div className="overflow-y-auto max-h-[42vh] sm:max-h-[350px] p-2.5 sm:p-3 space-y-2 bg-slate-50/60 dark:bg-slate-900/60 divide-y-0">
              {filteredNotifications.length === 0 ? (
                <div className="py-6 px-3 text-center space-y-1.5">
                  <div className="w-9 h-9 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    All caught up!
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                    {activeFilter === 'unread'
                      ? 'No unread notifications.'
                      : 'No official alerts right now.'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((n) => {
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`group relative p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${
                        n.unread
                          ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/70 shadow-xs ring-1 ring-indigo-500/10'
                          : 'bg-white/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Active Unread Accent Bar */}
                      {n.unread && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-full" />
                      )}

                      <div className="flex items-start gap-2.5">
                        {/* Type Icon Container */}
                        <div className="mt-0.5 flex-shrink-0">
                          {n.type === 'course' && (
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center">
                              <BookOpen className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {n.type === 'gap' && (
                            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {n.type === 'circular' && (
                            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40 flex items-center justify-center">
                              <FileText className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {n.type === 'system' && (
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Text and Actions */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                n.type === 'course'
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'
                                  : n.type === 'gap'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                  : n.type === 'circular'
                                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              }`}
                            >
                              {n.badge}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              <Clock className="w-2.5 h-2.5 inline-block" />
                              <span>{n.time}</span>
                            </div>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                            {n.title}
                          </h4>

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {n.desc}
                          </p>

                          {/* Quick Action Button & Controls */}
                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/60">
                            {n.link && (
                              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 flex items-center gap-0.5">
                                {n.actionText || 'View'}
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            )}

                            <div className="flex items-center gap-1 ml-auto">
                              {n.unread && (
                                <button
                                  onClick={(e) => markAsRead(n.id, e)}
                                  className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => deleteNotification(n.id, e)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-75 group-hover:opacity-100"
                                title="Dismiss notification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-600 dark:text-slate-300">MoSPI Portal</span>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
