import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Home, 
  PlusCircle, 
  ShieldCheck, 
  FileText, 
  ChevronDown, 
  CheckCircle2, 
  X, 
  Shield, 
  User, 
  Menu,
  Award,
  BookMarked
} from 'lucide-react';
import { AppNotification, UserRole } from '../../types';
import { getStoredNotifications, saveStoredNotifications, addDismissedNotifId, clearAllNotifications } from '../../lib/storage';

interface NavigationProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigateToReview?: (testId?: string) => void;
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateCompetitive?: () => void;
  onNavigateSyllabus?: () => void;
  onOpenCreateExam?: () => void;
  onSelectTab?: (tab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report') => void;
  isHomeActive?: boolean;
  isCompetitiveActive?: boolean;
  isSyllabusActive?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRole,
  onRoleChange,
  onNavigateToReview,
  onNavigateHome,
  onNavigateDashboard,
  onNavigateCompetitive,
  onNavigateSyllabus,
  onOpenCreateExam,
  onSelectTab,
  isHomeActive,
  isCompetitiveActive,
  isSyllabusActive,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  // Load notifications and listen for custom events
  // "যেগুলো একবার দেখা হয়ে যাবে সেগুলো নোটিফিকেশনে আর থাকার দরকার নেই।"
  const loadNotifs = () => {
    const all = getStoredNotifications();
    const filtered = all.filter(n => (n.forRole === currentRole || !n.forRole) && !n.isRead);
    setNotifications(filtered);
  };

  useEffect(() => {
    loadNotifs();
    const handleStorageChange = () => loadNotifs();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('dapathshala_notifs_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dapathshala_notifs_updated', handleStorageChange);
    };
  }, [currentRole]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNotifOpen]);

  const handleDismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addDismissedNotifId(id);
    const all = getStoredNotifications();
    const updated = all.filter(n => n.id !== id);
    saveStoredNotifications(updated);
    setNotifications(updated.filter(n => (n.forRole === currentRole || !n.forRole) && !n.isRead));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAllNotifications();
    setNotifications([]);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setIsNotifOpen(false);
    // Remove immediately once viewed so it no longer stays in notifications
    const all = getStoredNotifications();
    const updated = all.filter(n => n.id !== notif.id);
    saveStoredNotifications(updated);
    setNotifications(updated.filter(n => (n.forRole === currentRole || !n.forRole) && !n.isRead));
    if (notif.testId && onNavigateToReview) {
      onNavigateToReview(notif.testId);
    }
  };

  const unreadNotifs = notifications;

  return (
    <header className="sticky top-0 z-40 bg-[#0c1322] border-b border-slate-800 text-slate-200 w-full select-none shadow-sm">
      <div className="w-full flex items-center justify-between h-13 px-2.5 sm:px-4 gap-2">
        
        {/* Left Section: Mobile Menu + Blue Home Square + Header Menu Links */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          
          {/* Mobile Sidebar Hamburger */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Blue Home Square - Navigates directly to Landing Page */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onNavigateHome?.();
            }}
            className="w-8.5 h-8.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white flex items-center justify-center shrink-0 rounded-lg transition-colors shadow-xs cursor-pointer z-10"
            title="মূল হোমপেজ / ল্যান্ডিং পেজ"
            aria-label="মূল হোমপেজে ফিরে যান"
          >
            <Home className="w-4.5 h-4.5 pointer-events-none" />
          </button>

          {/* Responsive Header Menu Items (Always single-line, never wraps or deforms) */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-slate-200 min-w-0">
            {/* Primary Action: নতুন পরীক্ষা (Always accessible) */}
            <button
              type="button"
              onClick={() => {
                onSelectTab?.('assigned');
                onOpenCreateExam?.();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white transition-colors border border-emerald-500/30 cursor-pointer whitespace-nowrap shrink-0"
              title="কাস্টম পরীক্ষা তৈরি করুন"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">নতুন পরীক্ষা</span>
              <span className="sm:hidden">+ পরীক্ষা</span>
            </button>

            {/* ভর্তি ও বিসিএস পরীক্ষা (Compact on tablet, full on desktop) */}
            <button
              type="button"
              onClick={() => onNavigateCompetitive?.()}
              className={`hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isCompetitiveActive
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 hover:text-white border border-blue-500/30'
              }`}
              title="বিসিএস, মেডিকেল ও বিশ্ববিদ্যালয় ভর্তি পোর্টাল"
            >
              <Award className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="whitespace-nowrap">ভর্তি ও বিসিএস</span>
            </button>

            {/* সিলেবাস ও প্রশ্নব্যাংক (Adaptive label on medium, full on wide) */}
            <button
              type="button"
              onClick={() => onNavigateSyllabus?.()}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isSyllabusActive
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-white border border-cyan-500/30'
              }`}
              title="এনসিটিবি কারিকুলাম, ২০২৫ সালের বোর্ড প্রশ্ন ও ভর্তি প্রশ্নব্যাংক"
            >
              <BookMarked className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap hidden lg:inline">সিলেবাস ও প্রশ্নব্যাংক</span>
              <span className="whitespace-nowrap lg:hidden">সিলেবাস</span>
            </button>

            {/* Secondary: লাইভ প্রক্টরিং (Displayed on large desktop screens where space permits) */}
            <button
              type="button"
              onClick={() => onSelectTab?.('proctoring')}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="whitespace-nowrap">লাইভ প্রক্টরিং</span>
            </button>

            {/* Secondary: নির্ধারিত পরীক্ষা (Displayed on large desktop screens where space permits) */}
            <button
              type="button"
              onClick={() => onSelectTab?.('assigned')}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="whitespace-nowrap">নির্ধারিত পরীক্ষা</span>
            </button>
          </div>

        </div>

        {/* Right Section: Role Switcher, Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Role Switcher (Compact on mobile, full on desktop) */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 p-0.5 rounded-lg text-xs sm:text-sm font-bold shrink-0">
            <button
              type="button"
              onClick={() => onRoleChange('parent')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentRole === 'parent'
                  ? 'bg-blue-600 text-white font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>অভিভাবক</span>
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('student')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                currentRole === 'student'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>শিক্ষার্থী</span>
            </button>
          </div>

          {/* Notifications Bell */}
          <div className="relative shrink-0" ref={notifContainerRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(prev => !prev)}
              className="relative p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="বিজ্ঞপ্তি"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs">
                  {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isNotifOpen && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-14 sm:top-full sm:mt-1.5 w-auto sm:w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-100">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>বিজ্ঞপ্তি তালিকা</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px]">
                        {unreadNotifs.length}টি নতুন
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      সব মুছুন
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-400">
                      কোন নতুন বিজ্ঞপ্তি নেই
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 relative"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold text-slate-900">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDismissNotification(notif.id, e)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
