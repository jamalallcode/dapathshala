import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  PlusSquare,
  Monitor,
  Tv,
  Database,
  ListOrdered,
  Users,
  Landmark,
  CalendarCheck,
  PlayCircle,
  ListChecks,
  KeyRound,
  CheckSquare,
  Contact,
  ClipboardEdit,
  X,
  PanelLeftClose,
  PanelRightClose,
  ArrowLeftRight,
  ChevronLeft
} from 'lucide-react';
import { InstitutionRegistrationModal } from '../../Landing/InstitutionRegistrationModal';
import { SmartboardModal } from '../../Common/SmartboardModal';
import { TutorialModal } from '../../Common/TutorialModal';
import { OmrTokenModal } from '../../Common/OmrTokenModal';
import { ContactHelpModal } from '../../Common/ContactHelpModal';
import { FeedbackModal } from '../../Common/FeedbackModal';
import { AffiliateModal } from '../../Common/AffiliateModal';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  position?: 'left' | 'right';
  onToggleCollapse?: () => void;
  onTogglePosition?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ 
  isOpen, 
  onClose,
  isCollapsed = false,
  position = 'left',
  onToggleCollapse,
  onTogglePosition
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isRight = position === 'right';

  // Modals state
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isSmartboardOpen, setIsSmartboardOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isOmrTokenModalOpen, setIsOmrTokenModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);

  // Institution profile
  const [registeredInstitution, setRegisteredInstitution] = useState<any>(() => {
    try {
      const data = localStorage.getItem('registered_institution');
      if (data) return JSON.parse(data);
    } catch (e) {}
    return { instituteName: 'দা পাঠশালা একাডেমি' };
  });

  useEffect(() => {
    const handleStorageUpdate = () => {
      try {
        const data = localStorage.getItem('registered_institution');
        if (data) setRegisteredInstitution(JSON.parse(data));
      } catch (e) {}
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('institution_registered', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('institution_registered', handleStorageUpdate);
    };
  }, []);

  // Determine active item based on current URL path
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/generate') return 'one_click';
    if (path === '/paper-builder' || path === '/question-bank') return 'bank';
    if (path === '/exams') return 'omr_eval';
    if (path === '/coaching-dashboard') return 'students';
    return '';
  };

  const activeItem = getActiveItem();

  const handleNavClick = (id: string) => {
    // Close mobile drawer upon clicking any action
    if (window.innerWidth < 1024) {
      onClose();
    }

    if (id === 'dashboard') {
      navigate('/');
    } else if (id === 'one_click') {
      navigate('/generate');
    } else if (id === 'smartboard') {
      setIsSmartboardOpen(true);
    } else if (id === 'tutorial') {
      setIsTutorialOpen(true);
    } else if (id === 'bank') {
      navigate('/paper-builder');
    } else if (id === 'my_questions') {
      navigate('/dashboard');
    } else if (id === 'students') {
      navigate('/coaching-dashboard');
    } else if (id === 'institution') {
      setIsRegistrationModalOpen(true);
    } else if (id === 'subscription') {
      setIsRegistrationModalOpen(true);
    } else if (id === 'omr_tutorial') {
      setIsTutorialOpen(true);
    } else if (id === 'omr_create') {
      navigate('/paper-builder');
    } else if (id === 'omr_token') {
      setIsOmrTokenModalOpen(true);
    } else if (id === 'omr_eval') {
      navigate('/exams');
    } else if (id === 'contact') {
      setIsContactModalOpen(true);
    } else if (id === 'feedback') {
      setIsFeedbackModalOpen(true);
    } else if (id === 'affiliate') {
      setIsAffiliateModalOpen(true);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Persistent Sidebar (Fixed to bottom, support left/right and full collapse):
          - Left/Right positioning based on `position` prop
          - Fully hideable via `isCollapsed` prop
          - Height fixed to 100vh / 100dvh (never scroll up with page content)
      */}
      <aside
        id="app-global-sidebar"
        className={`fixed inset-y-0 top-0 bottom-0 z-40 w-72 h-screen h-[100dvh] max-h-screen bg-[#0c1e33] text-slate-300 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
          isRight ? 'right-0 border-l border-slate-800/80' : 'left-0 border-r border-slate-800/80'
        } ${
          isOpen 
            ? 'translate-x-0 shadow-2xl z-50' 
            : (isRight ? 'translate-x-full' : '-translate-x-full')
        } ${
          isCollapsed 
            ? (isRight ? 'lg:translate-x-full' : 'lg:-translate-x-full') 
            : 'lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 sm:h-20 px-3.5 sm:px-5 flex items-center justify-between border-b border-slate-800/80 bg-[#071f3b] shrink-0 gap-2">
          <Link
            to="/dashboard"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center gap-2.5 select-none no-underline hover:no-underline min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600/25 border border-blue-400/40 flex items-center justify-center text-white shadow-xs shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="13" y2="17" />
                <line x1="10" y1="9" x2="11" y2="9" />
              </svg>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight font-sans truncate">
                DaPathshala
              </span>
              <span className="text-[9px] text-blue-200/80 font-medium tracking-wide font-['Hind_Siliguri'] truncate">
                স্মার্ট ড্যাশবোর্ড
              </span>
            </div>
          </Link>

          {/* Action buttons: Position toggle & Collapse / Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onTogglePosition && (
              <button
                onClick={onTogglePosition}
                id="sidebar-position-toggle"
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition flex items-center gap-1 text-[11px]"
                title={isRight ? 'বামে স্থানান্তর করুন' : 'ডান পাশে নিন'}
              >
                <ArrowLeftRight size={14} />
                <span className="hidden xl:inline text-[10px]">{isRight ? 'বামে' : 'ডানে'}</span>
              </button>
            )}

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                id="sidebar-collapse-toggle"
                className="hidden lg:flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition items-center gap-1 text-[11px]"
                title="সাইডবার সম্পূর্ণ হাইড করুন"
              >
                <ChevronLeft size={16} className={isRight ? 'rotate-180' : ''} />
                <span className="text-[10px]">হাইড</span>
              </button>
            )}

            {/* Close button for mobile drawer */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="মেনু বন্ধ করুন"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Menu Links (Zero visible scrollbars - matches Image 1 & 2) */}
        <div
          className="flex-1 min-h-0 overflow-y-auto px-3.5 py-4 space-y-5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden font-['Hind_Siliguri']"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Section 1: সার্বিক চিত্র */}
          <div>
            <div className="px-3 mb-2 text-xs font-bold text-slate-200 tracking-wider">
              সার্বিক চিত্র
            </div>
            <div className="space-y-1">
              {/* ড্যাশবোর্ড */}
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-bold text-sm transition-all duration-150 ${
                  activeItem === 'dashboard'
                    ? 'bg-[#dce5ef] text-slate-900 shadow-xs'
                    : 'text-white hover:bg-slate-800/70'
                }`}
              >
                <LayoutGrid size={18} className={activeItem === 'dashboard' ? 'text-slate-900' : 'text-white'} />
                <span>ড্যাশবোর্ড</span>
              </button>

              {/* ১ ক্লিকে প্রশ্ন তৈরী */}
              <button
                onClick={() => handleNavClick('one_click')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                  activeItem === 'one_click'
                    ? 'bg-[#dce5ef] text-slate-900 font-bold shadow-xs'
                    : 'text-white hover:bg-slate-800/70'
                }`}
              >
                <PlusSquare size={18} className={activeItem === 'one_click' ? 'text-slate-900' : 'text-white'} />
                <span>১ ক্লিকে প্রশ্ন তৈরী</span>
              </button>

              {/* স্মার্টবোর্ড */}
              <button
                onClick={() => handleNavClick('smartboard')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <Monitor size={18} className="text-white" />
                <span>স্মার্টবোর্ড</span>
              </button>

              {/* টিউটোরিয়াল */}
              <button
                onClick={() => handleNavClick('tutorial')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <Tv size={18} className="text-white" />
                <span>টিউটোরিয়াল</span>
              </button>

              {/* প্রশ্নব্যাংক */}
              <button
                onClick={() => handleNavClick('bank')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                  activeItem === 'bank'
                    ? 'bg-[#dce5ef] text-slate-900 font-bold shadow-xs'
                    : 'text-white hover:bg-slate-800/70'
                }`}
              >
                <Database size={18} className={activeItem === 'bank' ? 'text-slate-900' : 'text-white'} />
                <span>প্রশ্নব্যাংক</span>
              </button>
            </div>
          </div>

          {/* Section 2: ব্যবস্থাপনা */}
          <div>
            <div className="px-3 mb-2 text-xs font-bold text-slate-200 tracking-wider">
              ব্যবস্থাপনা
            </div>
            <div className="space-y-1">
              {/* আমার তৈরী প্রশ্ন */}
              <button
                onClick={() => handleNavClick('my_questions')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <ListOrdered size={18} className="text-white" />
                <span>আমার তৈরী প্রশ্ন</span>
              </button>

              {/* শিক্ষার্থী */}
              <button
                onClick={() => handleNavClick('students')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                  activeItem === 'students'
                    ? 'bg-[#dce5ef] text-slate-900 font-bold shadow-xs'
                    : 'text-white hover:bg-slate-800/70'
                }`}
              >
                <Users size={18} className={activeItem === 'students' ? 'text-slate-900' : 'text-white'} />
                <span>শিক্ষার্থী</span>
              </button>
            </div>
          </div>

          {/* Section 3: প্রতিষ্ঠান সংক্রান্ত */}
          <div>
            <div className="px-3 mb-2 text-xs font-bold text-slate-200 tracking-wider">
              প্রতিষ্ঠান সংক্রান্ত
            </div>
            <div className="space-y-1">
              {/* আমার প্রতিষ্ঠান */}
              <button
                onClick={() => handleNavClick('institution')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <Landmark size={18} className="text-white" />
                <span>আমার প্রতিষ্ঠান</span>
              </button>

              {/* আমার সাবস্ক্রিপশন */}
              <button
                onClick={() => handleNavClick('subscription')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <CalendarCheck size={18} className="text-white" />
                <span>আমার সাবস্ক্রিপশন</span>
              </button>
            </div>
          </div>

          {/* Section 4: OMR সংক্রান্ত */}
          <div>
            <div className="px-3 mb-2 text-xs font-bold text-slate-200 tracking-wider">
              OMR সংক্রান্ত
            </div>
            <div className="space-y-1">
              {/* OMR টিউটোরিয়াল */}
              <button
                onClick={() => handleNavClick('omr_tutorial')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <PlayCircle size={18} className="text-white" />
                <span>OMR টিউটোরিয়াল</span>
              </button>

              {/* OMR তৈরী */}
              <button
                onClick={() => handleNavClick('omr_create')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <ListChecks size={18} className="text-white" />
                <span>OMR তৈরী</span>
              </button>

              {/* OMR টোকেন */}
              <button
                onClick={() => handleNavClick('omr_token')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <KeyRound size={18} className="text-white" />
                <span>OMR টোকেন</span>
              </button>

              {/* OMR মূল্যায়ন */}
              <button
                onClick={() => handleNavClick('omr_eval')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                  activeItem === 'omr_eval'
                    ? 'bg-[#dce5ef] text-slate-900 font-bold shadow-xs'
                    : 'text-white hover:bg-slate-800/70'
                }`}
              >
                <CheckSquare size={18} className={activeItem === 'omr_eval' ? 'text-slate-900' : 'text-white'} />
                <span>OMR মূল্যায়ন</span>
              </button>
            </div>
          </div>

          {/* Section 5: হেল্প লাইন */}
          <div>
            <div className="px-3 mb-2 text-xs font-bold text-slate-200 tracking-wider">
              হেল্প লাইন
            </div>
            <div className="space-y-1">
              {/* যোগাযোগ */}
              <button
                onClick={() => handleNavClick('contact')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <Contact size={18} className="text-white" />
                <span>যোগাযোগ</span>
              </button>

              {/* মতামত */}
              <button
                onClick={() => handleNavClick('feedback')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 text-white hover:bg-slate-800/70"
              >
                <ClipboardEdit size={18} className="text-white" />
                <span>মতামত</span>
              </button>
            </div>
          </div>

          {/* দা পাঠশালা এফিলিয়েট প্রোগ্রাম বাটন */}
          <div className="pt-2">
            <button
              onClick={() => handleNavClick('affiliate')}
              className="w-full py-2.5 px-3 rounded-lg bg-[#243b55] hover:bg-[#2c4868] text-white text-xs sm:text-sm font-bold shadow-xs transition duration-150 text-center flex items-center justify-center border border-slate-700/60"
            >
              দা পাঠশালা এফিলিয়েট প্রোগ্রাম
            </button>
          </div>
        </div>

        {/* Sidebar Footer User Info / Institution Status */}
        <div className="p-3.5 border-t border-slate-800/80 bg-[#091728] shrink-0 font-['Hind_Siliguri']">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-slate-800/40 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-slate-300 truncate font-medium">
                {registeredInstitution?.instituteName || 'দা পাঠশালা একাডেমি'}
              </span>
            </div>
            <button
              onClick={() => setIsRegistrationModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold shrink-0 cursor-pointer ml-1"
              title="রেজিস্ট্রেশন বিবরণ"
            >
              ইডিট
            </button>
          </div>
        </div>
      </aside>

      {/* Global Modals triggered from Sidebar */}
      <InstitutionRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onRegistered={(data) => {
          setRegisteredInstitution(data);
          try {
            localStorage.setItem('registered_institution', JSON.stringify(data));
          } catch (e) {}
        }}
      />

      <SmartboardModal
        isOpen={isSmartboardOpen}
        onClose={() => setIsSmartboardOpen(false)}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <OmrTokenModal
        isOpen={isOmrTokenModalOpen}
        onClose={() => setIsOmrTokenModalOpen(false)}
      />

      <ContactHelpModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      <AffiliateModal
        isOpen={isAffiliateModalOpen}
        onClose={() => setIsAffiliateModalOpen(false)}
      />
    </>
  );
};

export default AppSidebar;
