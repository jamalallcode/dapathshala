import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  FileCheck, 
  ShieldCheck, 
  Award, 
  Layers, 
  Brain, 
  ChevronDown, 
  ChevronRight, 
  X,
  GraduationCap,
  BookMarked
} from 'lucide-react';
import { UserRole, AssignedTest } from '../../types';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth?: number;
  onStartResize?: (e: React.MouseEvent | React.TouchEvent) => void;
  isResizing?: boolean;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: 'landing' | 'dashboard' | 'exam' | 'review' | 'competitive' | 'syllabus';
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  onNavigateCompetitive?: () => void;
  onNavigateSyllabus?: () => void;
  parentTab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report';
  onSelectParentTab: (tab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report') => void;
  onOpenCreateExam: () => void;
  onDirectStartExam?: (test: AssignedTest) => void;
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
  onNavigateCompetitive,
  onNavigateSyllabus,
  parentTab,
  onSelectParentTab,
  onOpenCreateExam
}) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>('exams');

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(prev => prev === menu ? null : menu);
  };

  const handleLinkClick = (action: () => void) => {
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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container with Resizable Drag Handle */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#0c1322] text-slate-300 border-r border-slate-800/90 flex flex-col select-none w-64 max-w-[85vw] lg:w-[var(--sidebar-width)] ${
          isResizing ? '' : 'transition-[width] duration-75'
        } ${
          // Mobile drawer slide
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* ======================================================== */}
        {/* 1. TOP HEADER: Logo + Title (Collapse icon removed)       */}
        {/* ======================================================== */}
        <div className="h-13 border-b border-slate-800/90 flex items-center justify-between px-3 bg-[#090e1a] shrink-0">
          <div 
            onClick={() => handleLinkClick(onNavigateHome)}
            className="flex items-center gap-2 cursor-pointer overflow-hidden min-w-0 group"
            title="মূল ওয়েবসাইট / ল্যান্ডিং পেজে যান"
          >
            {/* Square Blue Emblem Icon */}
            <div className="w-8 h-8 rounded-lg bg-blue-600 group-hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors">
              <GraduationCap className="w-4.5 h-4.5" />
            </div>
            
            <div className="truncate min-w-0">
              <span className="font-black text-white text-base tracking-tight block truncate group-hover:text-blue-300 transition-colors">
                দাপাঠশালা
              </span>
              <span className="text-xs text-slate-400 font-semibold block truncate">
                একাডেমিক পোর্টাল
              </span>
            </div>
          </div>

          {/* Mobile Close Button only (Collapse button removed completely) */}
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
        {/* 2. ACADEMIC NAVIGATION MENU (Specific to Dapathshala)      */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1 text-sm font-semibold">
          
          {/* Menu 1: ড্যাশবোর্ড হোম */}
          <div>
            <button
              type="button"
              onClick={() => handleLinkClick(() => {
                onRoleChange('parent');
                onNavigateDashboard();
                onSelectParentTab('overview');
              })}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                parentTab === 'overview' && activeView === 'dashboard'
                  ? 'bg-blue-600/30 text-white font-bold border-l-2 border-blue-500'
                  : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <LayoutDashboard className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                <span className="truncate">ড্যাশবোর্ড হোম</span>
              </div>
            </button>
          </div>

          {/* Menu 2: পরীক্ষাসমূহ ও খাতা (Exams) */}
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                parentTab === 'assigned' && activeView === 'dashboard'
                  ? 'bg-blue-600/30 text-white font-bold border-l-2 border-blue-500'
                  : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <BookOpen className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                <span className="truncate">পরীক্ষাসমূহ ও খাতা</span>
              </div>
            </button>
          </div>

          {/* Menu 2.5: ভর্তি ও বিসিএস পরীক্ষা (Competitive Exams) */}
          <div>
            <button
              type="button"
              onClick={() => {
                handleLinkClick(() => {
                  onNavigateCompetitive?.();
                });
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                activeView === 'competitive'
                  ? 'bg-blue-600/40 text-white font-bold border-l-2 border-amber-400'
                  : 'hover:bg-slate-800/60 text-amber-300/90 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <GraduationCap className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                <span className="truncate font-bold">ভর্তি ও বিসিএস পরীক্ষা</span>
              </div>
            </button>
          </div>

          {/* Menu 3: খাতা মূল্যায়ন (Grading & Review) */}
          <div>
            <button
              type="button"
              onClick={() => handleLinkClick(() => {
                onRoleChange('parent');
                onNavigateDashboard();
                onSelectParentTab('review');
              })}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                parentTab === 'review' && activeView === 'dashboard'
                  ? 'bg-blue-600/30 text-white font-bold border-l-2 border-blue-500'
                  : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <FileCheck className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                <span className="truncate">খাতা মূল্যায়ন</span>
              </div>
            </button>
          </div>

          {/* Menu 4: লাইভ প্রক্টরিং (Live Proctoring & Integrity) */}
          <div>
            <button
              type="button"
              onClick={() => handleLinkClick(() => {
                onRoleChange('parent');
                onNavigateDashboard();
                onSelectParentTab('proctoring');
              })}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                parentTab === 'proctoring' && activeView === 'dashboard'
                  ? 'bg-blue-600/30 text-white font-bold border-l-2 border-blue-500'
                  : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <ShieldCheck className="w-4.5 h-4.5 text-purple-400 shrink-0" />
                <span className="truncate">লাইভ প্রক্টরিং</span>
              </div>
            </button>
          </div>

          {/* Menu 5: ফলাফল ও রিপোর্ট কার্ড */}
          <div>
            <button
              type="button"
              onClick={() => handleLinkClick(() => {
                onRoleChange('parent');
                onNavigateDashboard();
                onSelectParentTab('report');
              })}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
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

          {/* Menu 6: ওয়ার্কশিট জেনারেটর */}
          <div>
            <button
              type="button"
              onClick={() => handleLinkClick(() => {
                onNavigateHome();
                setTimeout(() => {
                  const el = document.getElementById('worksheet-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              })}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-slate-800/60 text-slate-200 hover:text-white"
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <Layers className="w-4.5 h-4.5 text-teal-400 shrink-0" />
                <span className="truncate">ওয়ার্কশিট জেনারেটর</span>
              </div>
            </button>
          </div>

          {/* Menu 7: কুইজ ও ব্রেইন গেমস */}
          <div>
            <button
              type="button"
              onClick={() => handleLinkClick(() => {
                onNavigateHome();
                setTimeout(() => {
                  const el = document.getElementById('generators-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              })}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-slate-800/60 text-slate-200 hover:text-white"
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <Brain className="w-4.5 h-4.5 text-rose-400 shrink-0" />
                <span className="truncate">কুইজ ও ব্রেইন গেমস</span>
              </div>
            </button>
          </div>

          {/* Menu 8: সিলেবাস ও প্রশ্নব্যাংক */}
          <div>
            <button
              type="button"
              onClick={() => handleLinkClick(() => {
                if (onNavigateSyllabus) {
                  onNavigateSyllabus();
                } else {
                  onRoleChange('parent');
                  onNavigateDashboard();
                  onSelectParentTab('assigned');
                }
              })}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                activeView === 'syllabus'
                  ? 'bg-cyan-600/40 text-white font-bold border-l-2 border-cyan-400'
                  : 'hover:bg-slate-800/60 text-slate-200 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <BookMarked className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
                <span className="truncate">সিলেবাস ও প্রশ্নব্যাংক</span>
              </div>
              {activeView === 'syllabus' && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400 shrink-0"></span>
              )}
            </button>
          </div>

        </div>

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
