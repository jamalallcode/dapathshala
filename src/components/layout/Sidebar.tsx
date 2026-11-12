import React, { useState, useEffect, useRef } from 'react';
import { 
  Award, 
  Brain, 
  X,
  Camera,
  BookOpen,
  Key,
  GraduationCap,
  LogOut,
  Crown,
  Building2,
  Users,
  FileText,
  ShieldCheck,
  Radio,
  Settings,
  Database,
  BarChart3,
  Sliders,
  Sparkles,
  ShieldAlert,
  FolderArchive,
  FileCheck
} from 'lucide-react';
import { UserRole, AssignedTest } from '../../types';
import { getCurrentParent, ParentUser, updateParentProfile } from '../../lib/parentAuth';
import { getCurrentStudent, StudentUser, updateStudentProfile, logoutStudent } from '../../lib/studentAuth';
import { getStoredTests } from '../../lib/storage';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth?: number;
  onStartResize?: (e: React.MouseEvent | React.TouchEvent) => void;
  isResizing?: boolean;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: 'landing' | 'dashboard' | 'exam' | 'review' | 'admin';
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  parentTab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report' | 'settings' | 'games' | 'library';
  onSelectParentTab: (tab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report' | 'settings' | 'games' | 'library') => void;
  onOpenCreateExam: () => void;
  onOpenSettings?: () => void;
  onDirectStartExam?: (test: AssignedTest) => void;
  // Admin Navigation Props
  adminTab?: 'overview' | 'papers' | 'users' | 'exams' | 'proctoring' | 'notice' | 'system' | 'ai-vision';
  onSelectAdminTab?: (tab: 'overview' | 'papers' | 'users' | 'exams' | 'proctoring' | 'notice' | 'system' | 'ai-vision') => void;
  onOpenAdminDashboard?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sidebarWidth,
  onStartResize,
  isResizing = false,
  currentRole,
  onRoleChange,
  activeView,
  onNavigateHome,
  onNavigateDashboard,
  parentTab,
  onSelectParentTab,
  onOpenCreateExam,
  onOpenSettings,
  adminTab = 'overview',
  onSelectAdminTab,
  onOpenAdminDashboard
}) => {
  const [parentUser, setParentUser] = useState<ParentUser | null>(() => getCurrentParent());
  const [studentUser, setStudentUser] = useState<StudentUser | null>(() => getCurrentStudent());
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('dapathshala_is_admin') === 'true';
  });
  const [parentTests, setParentTests] = useState<AssignedTest[]>(() => {
    try {
      return getStoredTests();
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        setParentTests(getStoredTests());
      } catch {}
    };
    window.addEventListener('dapathshala_tests_updated', handleUpdate);
    window.addEventListener('dapathshala_submissions_updated', handleUpdate);
    return () => {
      window.removeEventListener('dapathshala_tests_updated', handleUpdate);
      window.removeEventListener('dapathshala_submissions_updated', handleUpdate);
    };
  }, []);

  const totalTestsCount = parentTests.length;
  const submittedAnswerCount = parentTests.filter(t => t.status === 'submitted' || t.status === 'reviewed').length;

  const [cursorTooltip, setCursorTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleItemMouseEnter = (text: string, e: React.MouseEvent) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const textSpan = currentTarget.querySelector('.truncate') as HTMLElement | null;
    const targetToCheck = textSpan || currentTarget;
    
    // Only display tooltip if text is genuinely truncated with ellipsis (...)
    if (targetToCheck && targetToCheck.scrollWidth > targetToCheck.clientWidth) {
      setCursorTooltip({
        text,
        x: e.clientX,
        y: e.clientY + 18
      });
    } else {
      setCursorTooltip(null);
    }
  };

  const handleItemMouseMove = (e: React.MouseEvent) => {
    setCursorTooltip(prev => (prev ? { ...prev, x: e.clientX, y: e.clientY + 18 } : null));
  };

  const handleItemMouseLeave = () => {
    setCursorTooltip(null);
  };

  const getFirstLetter = (name?: string): string => {
    if (!name || !name.trim()) return 'অ';
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase();
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (currentRole === 'student') {
          updateStudentProfile({ avatar: compressedDataUrl });
          setStudentUser(getCurrentStudent());
        } else {
          updateParentProfile({ avatar: compressedDataUrl });
          setParentUser(getCurrentParent());
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    const handleAuthChange = () => {
      setParentUser(getCurrentParent());
      setStudentUser(getCurrentStudent());
    };
    window.addEventListener('dapathshala_parent_auth_changed', handleAuthChange);
    window.addEventListener('dapathshala_student_auth_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('dapathshala_parent_auth_changed', handleAuthChange);
      window.removeEventListener('dapathshala_student_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleLinkClick = (action: () => void) => {
    setCursorTooltip(null);
    action();
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[50] lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container with Resizable Drag Handle */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[60] bg-[#0c1322] text-slate-300 border-r border-slate-800/90 flex flex-col select-none w-64 lg:w-[var(--sidebar-width)] shadow-2xl ${
          isResizing ? '' : 'transition-[width] duration-75'
        } ${
          // Mobile drawer slide
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* ======================================================== */}
        {/* 1. TOP HEADER: Brand Logo & Title                        */}
        {/* ======================================================== */}
        <div className="h-14 border-b border-slate-800/90 flex items-center justify-between px-3.5 bg-[#090e1a] shrink-0">
          <div 
            onClick={() => handleLinkClick(onNavigateHome)}
            className="flex items-center overflow-hidden min-w-0 cursor-pointer group"
          >
            <div className="truncate min-w-0">
              <span className="font-black text-white text-base tracking-tight block truncate group-hover:text-blue-300 transition-colors">
                দাপাঠশালা
              </span>
              <span className="text-[10px] text-slate-400 font-bold block truncate">
                {activeView === 'admin' 
                  ? 'মাস্টার অ্যাডমিন হাব' 
                  : currentRole === 'student' 
                  ? 'শিক্ষার্থী পোর্টাল' 
                  : 'অভিভাবক ড্যাশবোর্ড'}
              </span>
            </div>
          </div>

          {/* Mobile Close Button only */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 2. NAVIGATION MENU (Conditional Admin / Parent / Student) */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1 text-sm font-semibold">
          
          {/* Admin Mode Badge (Strictly Admin only - No Guardian or Student options) */}
          {activeView === 'admin' ? (
            <div className="px-3 pb-2 mb-2 border-b border-purple-900/40">
              <div className="flex items-center gap-2 bg-[#12192e] px-3 py-2 rounded-xl border border-purple-500/30 shadow-xs">
                <Crown className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-black text-white block truncate">এডমিন এক্সেস</span>
                  <span className="text-[10px] text-purple-300 font-semibold block truncate">সার্বজনীন নিয়ন্ত্রণ হাব</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* VIEW A: DEDICATED SUPER-ADMIN CONTROLLING SUITE */}
          {activeView === 'admin' ? (
            <div className="space-y-0.5">
              <div className="px-3 py-1 text-[10px] font-black uppercase text-purple-400 tracking-wider">
                👑 সুপার-অ্যাডমিন কন্ট্রোল
              </div>

              {/* 1. মাস্টার ওভারভিউ */}
              <button
                type="button"
                onClick={() => handleLinkClick(() => onSelectAdminTab?.('overview'))}
                onMouseEnter={(e) => handleItemMouseEnter('মাস্টার ওভারভিউ', e)}
                onMouseMove={handleItemMouseMove}
                onMouseLeave={handleItemMouseLeave}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  adminTab === 'overview'
                    ? 'bg-purple-600/30 text-white font-bold border-l-2 border-purple-500'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <BarChart3 className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                  <span className="truncate">মাস্টার ওভারভিউ</span>
                </div>
              </button>

              {/* 2. কেন্দ্রীয় প্রশ্নব্যাংক */}
              <button
                type="button"
                onClick={() => handleLinkClick(() => onSelectAdminTab?.('papers'))}
                onMouseEnter={(e) => handleItemMouseEnter('কেন্দ্রীয় প্রশ্নব্যাংক', e)}
                onMouseMove={handleItemMouseMove}
                onMouseLeave={handleItemMouseLeave}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  adminTab === 'papers' || adminTab === 'ai-vision'
                    ? 'bg-purple-600/30 text-white font-bold border-l-2 border-purple-500'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <Building2 className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                  <span className="truncate">কেন্দ্রীয় প্রশ্নব্যাংক</span>
                </div>
              </button>

              {/* 3. ইউজার ও অ্যাকাউন্ট */}
              <button
                type="button"
                onClick={() => handleLinkClick(() => onSelectAdminTab?.('users'))}
                onMouseEnter={(e) => handleItemMouseEnter('ব্যবহারকারী ও একাউন্ট', e)}
                onMouseMove={handleItemMouseMove}
                onMouseLeave={handleItemMouseLeave}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  adminTab === 'users'
                    ? 'bg-purple-600/30 text-white font-bold border-l-2 border-purple-500'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <Users className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                  <span className="truncate">ব্যবহারকারী ও একাউন্ট</span>
                </div>
              </button>

              {/* 4. গ্লোবাল পরীক্ষা ও খাতা */}
              <button
                type="button"
                onClick={() => handleLinkClick(() => onSelectAdminTab?.('exams'))}
                onMouseEnter={(e) => handleItemMouseEnter('গ্লোবাল পরীক্ষা ও খাতা', e)}
                onMouseMove={handleItemMouseMove}
                onMouseLeave={handleItemMouseLeave}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  adminTab === 'exams'
                    ? 'bg-purple-600/30 text-white font-bold border-l-2 border-purple-500'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <FileText className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  <span className="truncate">গ্লোবাল পরীক্ষা ও খাতা</span>
                </div>
              </button>

              {/* 5. প্রক্টরিং সিকিউরিটি */}
              <button
                type="button"
                onClick={() => handleLinkClick(() => onSelectAdminTab?.('proctoring'))}
                onMouseEnter={(e) => handleItemMouseEnter('প্রক্টরিং সিকিউরিটি', e)}
                onMouseMove={handleItemMouseMove}
                onMouseLeave={handleItemMouseLeave}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  adminTab === 'proctoring'
                    ? 'bg-purple-600/30 text-white font-bold border-l-2 border-purple-500'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <ShieldCheck className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                  <span className="truncate">প্রক্টরিং সিকিউরিটি</span>
                </div>
              </button>

              {/* 6. নোটিশ ব্রডকাস্ট */}
              <button
                type="button"
                onClick={() => handleLinkClick(() => onSelectAdminTab?.('notice'))}
                onMouseEnter={(e) => handleItemMouseEnter('নোটিশ ব্রডকাস্ট', e)}
                onMouseMove={handleItemMouseMove}
                onMouseLeave={handleItemMouseLeave}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  adminTab === 'notice'
                    ? 'bg-purple-600/30 text-white font-bold border-l-2 border-purple-500'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <Radio className="w-4.5 h-4.5 text-amber-300 shrink-0" />
                  <span className="truncate">নোটিশ ব্রডকাস্ট</span>
                </div>
              </button>

              {/* 7. সিস্টেম ও ব্যাকআপ */}
              <button
                type="button"
                onClick={() => handleLinkClick(() => onSelectAdminTab?.('system'))}
                onMouseEnter={(e) => handleItemMouseEnter('সিস্টেম ও ব্যাকআপ', e)}
                onMouseMove={handleItemMouseMove}
                onMouseLeave={handleItemMouseLeave}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  adminTab === 'system'
                    ? 'bg-purple-600/30 text-white font-bold border-l-2 border-purple-500'
                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <Settings className="w-4.5 h-4.5 text-teal-400 shrink-0" />
                  <span className="truncate">সিস্টেম ও ব্যাকআপ</span>
                </div>
              </button>

            </div>
          ) : currentRole === 'parent' ? (
            <>
              {/* Menu 1: প্রশ্নপত্র তৈরি */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    handleLinkClick(() => {
                      onRoleChange('parent');
                      onNavigateDashboard();
                      onOpenCreateExam();
                    });
                  }}
                  onMouseEnter={(e) => handleItemMouseEnter('নতুন প্রশ্নপত্র তৈরি', e)}
                  onMouseMove={handleItemMouseMove}
                  onMouseLeave={handleItemMouseLeave}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer hover:bg-slate-800/60 text-slate-200 hover:text-white"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <FileText className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                    <span className="truncate">প্রশ্নপত্র তৈরি</span>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    + নতুন
                  </span>
                </button>
              </div>

              {/* Menu 2: নির্ধারিত পরীক্ষা (Moved from top banner to Sidebar) */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    handleLinkClick(() => {
                      onRoleChange('parent');
                      onNavigateDashboard();
                      onSelectParentTab('assigned');
                    });
                  }}
                  onMouseEnter={(e) => handleItemMouseEnter('নির্ধারিত পরীক্ষা', e)}
                  onMouseMove={handleItemMouseMove}
                  onMouseLeave={handleItemMouseLeave}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    parentTab === 'assigned' && activeView === 'dashboard'
                      ? 'bg-blue-600/30 text-white font-bold border-l-2 border-blue-500'
                      : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <FileText className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                    <span className="truncate">নির্ধারিত পরীক্ষা</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {totalTestsCount.toLocaleString('bn-BD')}টি
                  </span>
                </button>
              </div>

              {/* Menu 3: সকল উত্তরপত্র (Moved from top banner to Sidebar) */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    handleLinkClick(() => {
                      onRoleChange('parent');
                      onNavigateDashboard();
                      onSelectParentTab('review');
                    });
                  }}
                  onMouseEnter={(e) => handleItemMouseEnter('সকল উত্তরপত্র ও খাতা মূল্যায়ন', e)}
                  onMouseMove={handleItemMouseMove}
                  onMouseLeave={handleItemMouseLeave}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    parentTab === 'review' && activeView === 'dashboard'
                      ? 'bg-blue-600/30 text-white font-bold border-l-2 border-blue-500'
                      : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <FileCheck className="w-4.5 h-4.5 text-sky-400 shrink-0" />
                    <span className="truncate">সকল উত্তরপত্র</span>
                  </div>
                  {submittedAnswerCount > 0 ? (
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      {submittedAnswerCount.toLocaleString('bn-BD')}টি
                    </span>
                  ) : null}
                </button>
              </div>

              {/* Menu: প্রশ্ন লাইব্রেরি */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    handleLinkClick(() => {
                      onRoleChange('parent');
                      onNavigateDashboard();
                      onSelectParentTab('library');
                    });
                  }}
                  onMouseEnter={(e) => handleItemMouseEnter('প্রশ্ন লাইব্রেরি (আর্কাইভ)', e)}
                  onMouseMove={handleItemMouseMove}
                  onMouseLeave={handleItemMouseLeave}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    parentTab === 'library' && activeView === 'dashboard'
                      ? 'bg-indigo-600/30 text-white font-bold border-l-2 border-indigo-400'
                      : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <FolderArchive className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                    <span className="truncate">প্রশ্ন লাইব্রেরি</span>
                  </div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    আর্কাইভ
                  </span>
                </button>
              </div>

              {/* Menu: ফলাফল ও রিপোর্ট */}
              <div>
                <button
                  type="button"
                  onClick={() => handleLinkClick(() => {
                    onRoleChange('parent');
                    onNavigateDashboard();
                    onSelectParentTab('report');
                  })}
                  onMouseEnter={(e) => handleItemMouseEnter('ফলাফল ও রিপোর্ট', e)}
                  onMouseMove={handleItemMouseMove}
                  onMouseLeave={handleItemMouseLeave}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    parentTab === 'report' && activeView === 'dashboard'
                      ? 'bg-blue-600/30 text-white font-bold border-l-2 border-blue-500'
                      : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <Award className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    <span className="truncate">ফলাফল ও রিপোর্ট</span>
                  </div>
                </button>
              </div>

              {/* Menu: কুইজ ও ব্রেইন গেমস */}
              <div>
                <button
                  type="button"
                  onClick={() => handleLinkClick(() => {
                    onRoleChange('parent');
                    onNavigateDashboard();
                    onSelectParentTab('games');
                  })}
                  onMouseEnter={(e) => handleItemMouseEnter('কুইজ ও ব্রেইন গেমস', e)}
                  onMouseMove={handleItemMouseMove}
                  onMouseLeave={handleItemMouseLeave}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    parentTab === 'games' && activeView === 'dashboard'
                      ? 'bg-blue-600/30 text-white font-bold border-l-2 border-blue-500'
                      : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <Brain className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                    <span className="truncate">কুইজ ও ব্রেইন গেমস</span>
                  </div>
                </button>
              </div>

              {/* Exclusive Admin Quick Access Card for Admin Users */}
              {isAdminLoggedIn && (
                <div className="pt-3 px-3 mt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleLinkClick(() => onOpenAdminDashboard?.())}
                    onMouseEnter={(e) => handleItemMouseEnter('সুপার-অ্যাডমিন কন্ট্রোল সেন্টার', e)}
                    onMouseMove={handleItemMouseMove}
                    onMouseLeave={handleItemMouseLeave}
                    title="সুপার-অ্যাডমিন কন্ট্রোল সেন্টার"
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/40 text-white font-bold text-xs transition-all shadow-md cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <Crown className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="truncate">অ্যাডমিন ড্যাশবোর্ড</span>
                    </div>
                    <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full shrink-0">
                      CONTROL
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Student Menu 1: নির্ধারিত পরীক্ষা */}
              <div>
                <button
                  type="button"
                  onClick={() => handleLinkClick(() => {
                    onNavigateDashboard();
                    const el = document.getElementById('student-exam-list');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  })}
                  onMouseEnter={(e) => handleItemMouseEnter('নির্ধারিত পরীক্ষাসমূহ', e)}
                  onMouseMove={handleItemMouseMove}
                  onMouseLeave={handleItemMouseLeave}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors bg-emerald-600/25 text-white font-bold border-l-2 border-emerald-500 hover:bg-emerald-600/35 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <BookOpen className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                    <span className="truncate">নির্ধারিত পরীক্ষাসমূহ</span>
                  </div>
                </button>
              </div>

              {/* Student Menu 2: পিন দিয়ে পরীক্ষা */}
              <div>
                <button
                  type="button"
                  onClick={() => handleLinkClick(() => {
                    onNavigateDashboard();
                    const input = document.getElementById('student-pin-input');
                    input?.focus();
                  })}
                  onMouseEnter={(e) => handleItemMouseEnter('পিন দিয়ে নতুন পরীক্ষা শুরু করুন', e)}
                  onMouseMove={handleItemMouseMove}
                  onMouseLeave={handleItemMouseLeave}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-slate-800/60 text-slate-200 hover:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <Key className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                    <span className="truncate">পিন দিয়ে পরীক্ষা</span>
                  </div>
                </button>
              </div>

              {/* Student Menu 3: কুইজ ও ব্রেইন গেমস */}
              <div>
                <button
                  type="button"
                  onClick={() => handleLinkClick(() => {
                    onRoleChange('parent');
                    onNavigateDashboard();
                    onSelectParentTab('games');
                  })}
                  onMouseEnter={(e) => handleItemMouseEnter('কুইজ ও ব্রেইন গেমস', e)}
                  onMouseMove={handleItemMouseMove}
                  onMouseLeave={handleItemMouseLeave}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-slate-800/60 text-slate-200 hover:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <Brain className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                    <span className="truncate">কুইজ ও ব্রেইন গেমস</span>
                  </div>
                </button>
              </div>
            </>
          )}

        </div>

        {/* ======================================================== */}
        {/* 3. BOTTOM FOOTER: User Profile + Landing Page Button     */}
        {/* ======================================================== */}
        <div className="border-t border-slate-800/90 bg-[#090e1a] p-2.5 shrink-0 space-y-2">
          
          {/* Hidden File Input for Avatar Upload from Computer */}
          <input 
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarFileSelect}
            className="hidden"
          />

          {/* User Profile Section (Admin / Parent / Student) */}
          <div 
            onClick={() => handleLinkClick(onNavigateHome)}
            onMouseEnter={(e) => handleItemMouseEnter(
              activeView === 'admin' 
                ? 'সুপার-অ্যাডমিন • ল্যান্ডিং পেজে যান' 
                : `${currentRole === 'student' ? (studentUser?.name || 'শিক্ষার্থী') : (parentUser?.name || 'অভিভাবক')} • ল্যান্ডিং পেজে যান`, 
              e
            )}
            onMouseMove={handleItemMouseMove}
            onMouseLeave={handleItemMouseLeave}
            className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer group"
          >
            {/* Avatar / Crown */}
            {activeView === 'admin' ? (
              <div 
                className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-700 border border-amber-400/60 flex items-center justify-center shrink-0 shadow-md shadow-purple-950/40 select-none"
                title="দাপাঠশালা সুপার-অ্যাডমিন"
              >
                <Crown className="w-4.5 h-4.5 text-amber-200" />
              </div>
            ) : (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className={`relative w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0 shadow-xs cursor-pointer group/avatar transition-transform hover:scale-105 ${
                  currentRole === 'student'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-400/60'
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-400/60'
                }`}
                title="কম্পিউটার থেকে ছবি পরিবর্তন করতে ক্লিক করুন"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }
                }}
              >
                {(currentRole === 'student' ? studentUser?.avatar : parentUser?.avatar) ? (
                  <img 
                    src={currentRole === 'student' ? studentUser?.avatar : parentUser?.avatar} 
                    alt={currentRole === 'student' ? (studentUser?.name || 'শিক্ষার্থী') : (parentUser?.name || 'অভিভাবক')} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-black text-sm select-none">
                    {getFirstLetter(currentRole === 'student' ? studentUser?.name : parentUser?.name)}
                  </span>
                )}

                {/* Hover overlay with Camera Icon */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}

            {/* Name & Role Details */}
            <div className="truncate min-w-0 flex-1">
              <span className="font-bold text-white text-xs tracking-tight block truncate group-hover:text-blue-300 transition-colors">
                {activeView === 'admin'
                  ? 'সুপার-অ্যাডমিন'
                  : currentRole === 'student'
                  ? (studentUser?.name || 'শিক্ষার্থী')
                  : (parentUser?.name || 'অভিভাবক')}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block truncate">
                {activeView === 'admin'
                  ? 'মাস্টার অথরিটি • সিস্টেম'
                  : currentRole === 'student'
                  ? (studentUser?.studentClass ? `${studentUser.studentClass} • ${studentUser.phone || ''}` : (studentUser?.phone || 'শিক্ষার্থী কর্নার'))
                  : (parentUser?.phone || '০১৭৮৯৫৩৯৪৯৪')}
              </span>
            </div>
          </div>
        </div>
        {/* Interactive Cursor-Following Tooltip                     */}
        {/* ======================================================== */}
        {cursorTooltip && (
          <div
            style={{
              left: `${Math.max(12, Math.min(cursorTooltip.x, window.innerWidth - 240))}px`,
              top: `${(cursorTooltip.y + 40 > window.innerHeight) ? cursorTooltip.y - 45 : cursorTooltip.y}px`
            }}
            className="fixed z-[9999] pointer-events-none -translate-x-2 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-2xl border border-purple-500/50 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span>{cursorTooltip.text}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. INTERACTIVE RESIZE DRAG HANDLE (Desktop)               */}
        {/* ======================================================== */}
        {onStartResize && (
          <div
            onMouseDown={onStartResize}
            onTouchStart={onStartResize}
            className="hidden lg:flex absolute top-0 bottom-0 -right-1.5 w-3 cursor-col-resize items-center justify-center group z-50 select-none hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors"
            title="টেনে সাইডবার ইচ্ছামত বাড়ান বা কমান"
            role="separator"
            aria-orientation="vertical"
          >
            {/* Visual thin line on hover or dragging */}
            <div className={`w-0.5 h-full transition-colors ${
              isResizing ? 'bg-blue-500 shadow-sm shadow-blue-500' : 'bg-transparent group-hover:bg-blue-400'
            }`} />

            {/* Grip handle visual pill */}
            <div className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-7 rounded bg-slate-800 border border-slate-700 items-center justify-center shadow-md pointer-events-none hidden group-hover:flex ${
              isResizing ? 'flex bg-blue-600 border-blue-400' : ''
            }`}>
              <span className="text-[9px] text-slate-300 font-mono select-none">⋮</span>
            </div>
          </div>
        )}

      </aside>
    </>
  );
};
