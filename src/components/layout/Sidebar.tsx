import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle,
  Award, 
  Brain, 
  X,
  Camera
} from 'lucide-react';
import { UserRole, AssignedTest } from '../../types';
import { getCurrentParent, ParentUser, updateParentProfile } from '../../lib/parentAuth';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarWidth?: number;
  onStartResize?: (e: React.MouseEvent | React.TouchEvent) => void;
  isResizing?: boolean;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeView: 'landing' | 'dashboard' | 'exam' | 'review';
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  parentTab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report' | 'settings' | 'games';
  onSelectParentTab: (tab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report' | 'settings' | 'games') => void;
  onOpenCreateExam: () => void;
  onOpenSettings?: () => void;
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
  parentTab,
  onSelectParentTab,
  onOpenCreateExam,
  onOpenSettings
}) => {
  const [parentUser, setParentUser] = useState<ParentUser | null>(() => getCurrentParent());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        updateParentProfile({ avatar: compressedDataUrl });
        setParentUser(getCurrentParent());
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    const handleAuthChange = () => {
      setParentUser(getCurrentParent());
    };
    window.addEventListener('dapathshala_parent_auth_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('dapathshala_parent_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

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
        {/* 1. TOP HEADER: Parent Photo + Name & Mobile Number       */}
        {/* ======================================================== */}
        <div className="h-14 border-b border-slate-800/90 flex items-center justify-between px-3 bg-[#090e1a] shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            
            {/* Hidden File Input for Avatar Upload from Computer */}
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />

            {/* Parent Profile Avatar / Initial Letter - Click to upload from computer */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-blue-400/60 flex items-center justify-center shrink-0 shadow-xs cursor-pointer group/avatar transition-transform hover:scale-105"
              title="কম্পিউটার থেকে ছবি সেট করতে ক্লিক করুন"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
            >
              {parentUser?.avatar ? (
                <img 
                  src={parentUser.avatar} 
                  alt={parentUser?.name || 'অভিভাবক'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-black text-sm select-none">
                  {getFirstLetter(parentUser?.name)}
                </span>
              )}

              {/* Hover overlay with Camera Icon */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Name & Mobile Number */}
            <div 
              onClick={() => handleLinkClick(onNavigateHome)}
              className="truncate min-w-0 cursor-pointer group"
              title="মূল ওয়েবসাইট / ল্যান্ডিং পেজে যান"
            >
              <span className="font-bold text-white text-sm tracking-tight block truncate group-hover:text-blue-300 transition-colors">
                {parentUser?.name || 'অভিভাবক'}
              </span>
              <span className="text-xs text-slate-400 font-semibold block truncate">
                {parentUser?.phone || '০১৭৮৯৫৩৯৪৯৪'}
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
        {/* 2. ACADEMIC NAVIGATION MENU (Specific to Dapathshala)      */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1 text-sm font-semibold">
          
          {/* Menu: প্রশ্নপত্র তৈরি */}
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
                <PlusCircle className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                <span className="truncate">প্রশ্নপত্র তৈরি</span>
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

          {/* Menu: কুইজ ও ব্রেইন গেমস */}
          <div>
            <button
              type="button"
              onClick={() => handleLinkClick(() => {
                onRoleChange('parent');
                onNavigateDashboard();
                onSelectParentTab('games');
              })}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
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
