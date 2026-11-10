import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Home, 
  X, 
  Menu,
  Settings,
  Phone,
  Mail,
  Clock,
  Info,
  HelpCircle,
  Crown,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { AppNotification, UserRole } from '../../types';
import { getStoredNotifications, saveStoredNotifications, addDismissedNotifId, clearAllNotifications } from '../../lib/storage';
import { logoutParent } from '../../lib/parentAuth';
import { logoutStudent } from '../../lib/studentAuth';
import { SecretAdminLoginModal } from '../admin/SecretAdminLoginModal';

interface NavigationProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigateToReview?: (testId?: string) => void;
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
  onOpenCreateExam?: () => void;
  onSelectTab?: (tab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report' | 'settings' | 'games' | 'library') => void;
  onOpenSettings?: () => void;
  isHomeActive?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenAdminDashboard?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRole,
  onRoleChange,
  onNavigateToReview,
  onNavigateHome,
  onNavigateDashboard,
  onOpenCreateExam,
  onSelectTab,
  onOpenSettings,
  isHomeActive,
  onToggleSidebar,
  isSidebarOpen,
  onOpenAdminDashboard
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const [activeNavModal, setActiveNavModal] = useState<'about' | 'guide' | 'contact' | null>(null);

  // Settings dropdown state (আইকনটিতে ক্লিক করলে ড্রপডাউন: ১. লগ-আউট ২. অন্যান্য)
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // 20-clicks Secret Admin Trigger
  const [adminClicks, setAdminClicks] = useState(0);
  const [showSecretAdminModal, setShowSecretAdminModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('dapathshala_is_admin') === 'true';
  });
  const adminClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (adminClickTimeoutRef.current) {
      clearTimeout(adminClickTimeoutRef.current);
    }

    const nextCount = adminClicks + 1;
    if (nextCount >= 20) {
      setAdminClicks(0);
      setShowSecretAdminModal(true);
    } else {
      setAdminClicks(nextCount);
      if (nextCount === 1) {
        adminClickTimeoutRef.current = setTimeout(() => {
          setAdminClicks(0);
          onNavigateHome?.();
        }, 300);
      } else {
        adminClickTimeoutRef.current = setTimeout(() => {
          setAdminClicks(0);
        }, 4000);
      }
    }
  };

  const handleAdminSuccess = () => {
    setIsAdminLoggedIn(true);
    if (onOpenAdminDashboard) {
      onOpenAdminDashboard();
    } else {
      onRoleChange('parent');
      onNavigateDashboard?.();
      setTimeout(() => {
        window.dispatchEvent(new Event('dapathshala_open_admin_portal'));
      }, 150);
    }
  };

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
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };
    if (isNotifOpen || isSettingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isNotifOpen, isSettingsMenuOpen]);

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
    <>
      <header className="sticky top-0 z-40 bg-[#0c1322] border-b border-slate-800 text-slate-200 w-full select-none shadow-sm">
      <div className="w-full flex items-center justify-between h-13 px-3 sm:px-4">
        
        {/* Left Section: Mobile Menu + Blue Home Square + Header Menu Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Mobile Sidebar Hamburger */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Blue Home Square - Navigates directly to Landing Page (and 20-click admin trigger) */}
          <button
            type="button"
            onClick={handleLogoAdminClick}
            className="w-8.5 h-8.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center shrink-0 rounded-lg transition-all shadow-xs cursor-pointer z-10 select-none"
            title="মূল হোমপেজ"
            aria-label="মূল হোমপেজে ফিরে যান"
          >
            <Home className="w-4.5 h-4.5 pointer-events-none" />
          </button>

          {/* Clean Menu Items (সর্বোচ্চ ৪ টি আইটেম) */}
          <div className="hidden md:flex items-center gap-1 ml-3 text-xs sm:text-sm font-semibold text-slate-200">
            {/* ১. আমাদের সম্পর্কে */}
            <button
              type="button"
              onClick={() => setActiveNavModal('about')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              আমাদের সম্পর্কে
            </button>

            {/* ৩. কুইজ ও গেমস */}
            <button
              type="button"
              onClick={() => {
                onRoleChange('parent');
                onNavigateDashboard?.();
                onSelectTab?.('games');
              }}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              কুইজ ও গেমস
            </button>

            {/* ৪. নির্দেশিকা */}
            <button
              type="button"
              onClick={() => setActiveNavModal('guide')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              নির্দেশিকা
            </button>

            {/* ৫. যোগাযোগ */}
            <button
              type="button"
              onClick={() => setActiveNavModal('contact')}
              className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-amber-300 text-amber-400 transition-colors cursor-pointer"
            >
              যোগাযোগ
            </button>
          </div>

        </div>

        {/* Right Section: Notifications & Settings Link */}
        <div className="flex items-center gap-2 sm:gap-3">

          {isAdminLoggedIn && (
            <button
              type="button"
              onClick={() => {
                if (onOpenAdminDashboard) {
                  onOpenAdminDashboard();
                } else {
                  window.dispatchEvent(new Event('dapathshala_open_admin_portal'));
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md border border-purple-400/40 cursor-pointer animate-in fade-in"
              title="সুপার-অ্যাডমিন কন্ট্রোল সেন্টারে প্রবেশ করুন"
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>অ্যাডমিন</span>
            </button>
          )}

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

          {/* Parent Settings Gear Icon with Dropdown (১. লগ-আউট, ২. অন্যান্য) */}
          {currentRole === 'parent' && (
            <div className="relative ml-1" ref={settingsMenuRef}>
              <button
                type="button"
                onClick={() => setIsSettingsMenuOpen(prev => !prev)}
                className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center border shadow-2xs group ${
                  isSettingsMenuOpen
                    ? 'bg-slate-800 text-amber-400 border-amber-500/60 ring-1 ring-amber-400/30'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/80'
                }`}
                title="অভিভাবক সেটিংস মেনু"
                aria-label="সেটিংস মেনু"
              >
                <Settings className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${
                  isSettingsMenuOpen ? 'rotate-90 text-amber-300' : 'group-hover:rotate-45'
                }`} />
              </button>

              {/* Dropdown Menu */}
              {isSettingsMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 select-none">
                  <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    অভিভাবক মেনু
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      logoutParent();
                      if (onNavigateHome) onNavigateHome();
                      else window.location.reload();
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 block transition-colors cursor-pointer"
                  >
                    লগআউট
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      if (onOpenSettings) onOpenSettings();
                      else if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-bold text-slate-800 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer border-t border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>প্রক্টরিং ও পরীক্ষা সেটিংস (৪টি লেভেল)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      window.dispatchEvent(new Event('dapathshala_open_admin_portal'));
                    }}
                    className="w-full px-4 py-2 text-left text-[11px] font-bold text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer border-t border-slate-100 flex items-center justify-between"
                  >
                    <span>অ্যাডমিন প্রশ্ন আপলোড</span>
                    <span className="text-[10px] text-amber-600 bg-amber-100 px-1 py-0.2 rounded font-mono">PIN</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Student Logout Action */}
          {currentRole === 'student' && (
            <button
              type="button"
              onClick={() => {
                logoutStudent();
                if (onNavigateHome) onNavigateHome();
                else window.location.reload();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-200 hover:text-rose-200 text-xs font-bold transition-all cursor-pointer border border-slate-700 hover:border-rose-500/50"
              title="শিক্ষার্থী অ্যাকাউন্ট থেকে লগআউট করুন"
            >
              লগআউট
            </button>
          )}

        </div>

      </div>
    </header>

    {/* ======================================================== */}
    {/* NAVBAR MODAL 1: যোগাযোগ ও হেল্পলাইন                        */}
    {/* ======================================================== */}
    {activeNavModal === 'contact' && (
      <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">যোগাযোগ ও হেল্পলাইন</h3>
                <p className="text-xs text-slate-500 font-medium">দাপাঠশালা সাপোর্ট ও সহায়তা কেন্দ্র</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveNavModal(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-500 font-semibold">হটলাইন / মোবাইল:</p>
                <p className="font-bold text-slate-900 font-mono">০১৭৮৯-৫৩৯৪৯৪</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-500 font-semibold">অফিসিয়াল ইমেইল:</p>
                <p className="font-bold text-slate-900 font-mono">support@dapathshala.com</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="text-[11px] text-slate-500 font-semibold">সেবা প্রদানের সময়সূচী:</p>
                <p className="font-bold text-slate-800">প্রতিদিন সকাল ৯:০০ টা হতে রাত ১০:০০ টা</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveNavModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ======================================================== */}
    {/* NAVBAR MODAL 2: আমাদের সম্পর্কে                            */}
    {/* ======================================================== */}
    {activeNavModal === 'about' && (
      <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">আমাদের সম্পর্কে</h3>
                <p className="text-xs text-slate-500 font-medium">দাপাঠশালা স্মার্ট মূল্যায়ন প্ল্যাটফর্ম</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveNavModal(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            ‘দাপাঠশালা’ হলো বাংলাদেশের জাতীয় শিক্ষাক্রম অনুযায়ী সন্তানের মেধা যাচাই, নিরাপদ অনলাইন পরীক্ষা গ্রহণ ও স্বচ্ছ মূল্যায়নের জন্য তৈরি আধুনিক প্ল্যাটফর্ম। অভিভাবকরা সহজেই নিজে বা কৃত্রিম বুদ্ধিমত্তা (এআই) দিয়ে প্রশ্নপত্র তৈরি করতে পারেন এবং সন্তান ঘরে বসেই পরীক্ষা দিতে পারে।
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveNavModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ======================================================== */}
    {/* NAVBAR MODAL 3: নির্দেশিকা                                  */}
    {/* ======================================================== */}
    {activeNavModal === 'guide' && (
      <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">ব্যবহার নির্দেশিকা</h3>
                <p className="text-xs text-slate-500 font-medium">কীভাবে প্ল্যাটফর্মটি ব্যবহার করবেন</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveNavModal(null)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-slate-700">
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
              <p className="font-bold text-blue-900">১. প্রশ্নপত্র তৈরি:</p>
              <p className="text-slate-600 text-xs mt-0.5">অভিভাবক পোর্টালে নিজে প্রশ্ন লিখুন বা এআই দিয়ে স্বয়ংক্রিয়ভাবে প্রশ্নপত্র তৈরি করুন।</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
              <p className="font-bold text-indigo-900">২. সন্তানের পরীক্ষা:</p>
              <p className="text-slate-600 text-xs mt-0.5">৬ সংখ্যার পিন বা লিংক সন্তানের কাছে দিন। নির্ধারিত সময়ে সন্তান পরীক্ষা সম্পন্ন করবে।</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <p className="font-bold text-emerald-900">৩. খাতা মূল্যায়ন ও ফলাফল:</p>
              <p className="text-slate-600 text-xs mt-0.5">পরীক্ষা জমা দেওয়ার পর উত্তরপত্র দেখে নম্বর অনুমোদন করুন এবং সার্বিক রিপোর্ট কার্ড সংগ্রহ করুন।</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveNavModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Secret Admin Login Modal (Triggered by 20 consecutive clicks) */}
    <SecretAdminLoginModal
      isOpen={showSecretAdminModal}
      onClose={() => setShowSecretAdminModal(false)}
      onSuccess={handleAdminSuccess}
    />
  </>
  );
};
