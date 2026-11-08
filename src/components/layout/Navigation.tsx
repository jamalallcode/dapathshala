import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Home, 
  PlusCircle, 
  ShieldCheck, 
  FileText, 
  X, 
  Shield, 
  User, 
  Menu,
  LogOut,
  Settings,
  Sliders
} from 'lucide-react';
import { AppNotification, UserRole } from '../../types';
import { getStoredNotifications, saveStoredNotifications, addDismissedNotifId, clearAllNotifications } from '../../lib/storage';
import { logoutParent } from '../../lib/parentAuth';

interface NavigationProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigateToReview?: (testId?: string) => void;
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
  onOpenCreateExam?: () => void;
  onSelectTab?: (tab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report' | 'settings' | 'games') => void;
  onOpenSettings?: () => void;
  isHomeActive?: boolean;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
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
  isSidebarOpen
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifContainerRef = useRef<HTMLDivElement>(null);

  // Settings dropdown state (আইকনটিতে ক্লিক করলে ড্রপডাউন: ১. লগ-আউট ২. অন্যান্য)
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

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

          {/* Clean Menu Items */}
          <div className="hidden sm:flex items-center gap-1.5 ml-3 text-sm font-semibold text-slate-200">
            <button
              type="button"
              onClick={() => onSelectTab?.('assigned')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>নির্ধারিত পরীক্ষা</span>
            </button>
          </div>

        </div>

        {/* Right Section: Notifications & Settings Link */}
        <div className="flex items-center gap-2 sm:gap-3">

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
                    className="w-full px-3.5 py-2.5 text-left text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>১. লগ-আউট</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      if (onOpenSettings) onOpenSettings();
                      else if (onSelectTab) onSelectTab('settings');
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-slate-100"
                  >
                    <Sliders className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>২. অন্যান্য</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
