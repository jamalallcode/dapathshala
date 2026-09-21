import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  User, 
  Clock, 
  Megaphone, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  PlusCircle,
  BookOpen,
  FileText,
  ChevronRight,
  Download
} from 'lucide-react';
import { InstitutionRegistrationModal } from '../../../../components/Landing/InstitutionRegistrationModal';
import { SmartboardModal } from '../../../../components/Common/SmartboardModal';
import { PdfToolsModal } from '../../../../components/Common/PdfToolsModal';
import { TutorialModal } from '../../../../components/Common/TutorialModal';
import { OmrTokenModal } from '../../../../components/Common/OmrTokenModal';
import { ContactHelpModal } from '../../../../components/Common/ContactHelpModal';
import { FeedbackModal } from '../../../../components/Common/FeedbackModal';
import { AffiliateModal } from '../../../../components/Common/AffiliateModal';
import Class10MathPaperWidget from '../../../../components/Dashboard/Class10MathPaperWidget';
import { checkIsAdmin } from '../../../../utils/adminAuth';

export const DaPathshalaDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const user = localStorage.getItem('ep_user');
      if (user) return JSON.parse(user);
    } catch (e) {}
    return null;
  });

  // Modals state
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isSmartboardOpen, setIsSmartboardOpen] = useState(false);
  const [pdfToolModalType, setPdfToolModalType] = useState<'protect' | 'booklet' | null>(null);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isOmrTokenModalOpen, setIsOmrTokenModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [impactView, setImpactView] = useState<'all' | 'me'>('all');

  // Institution State
  const [, setRegisteredInstitution] = useState<any>(null);

  useEffect(() => {
    const syncUserData = () => {
      try {
        const saved = localStorage.getItem('dapathshala_institution_profile');
        if (saved) {
          setRegisteredInstitution(JSON.parse(saved));
        }
        const user = localStorage.getItem('ep_user');
        if (user) {
          setCurrentUser(JSON.parse(user));
        }
      } catch (e) {
        // ignore
      }
    };

    syncUserData();
    window.addEventListener('auth_state_changed', syncUserData);
    return () => window.removeEventListener('auth_state_changed', syncUserData);
  }, []);

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 font-['Hind_Siliguri'] overflow-x-hidden relative min-h-screen">
      {/* Dashboard Main Content */}
      <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto overflow-x-hidden min-w-0">

        {/* Top Welcome Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>স্বাগতম, {currentUser?.name || 'শিক্ষক'}!</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {currentUser?.role === 'student' ? 'শিক্ষার্থী' : 'শিক্ষক পোর্টাল'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              আপনার প্রশ্নপত্র প্রণয়ন, ওএমআর মূল্যায়ন ও ডিজিটাল ক্লাসরুম সহায়তা
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {checkIsAdmin() && (
              <Link
                to="/admin"
                className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ShieldCheck size={14} className="text-amber-400" />
                <span>মাস্টার কন্ট্রোল</span>
              </Link>
            )}
            <Link
              to="/generate"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition"
            >
              <PlusCircle size={16} />
              <span>নতুন প্রশ্ন তৈরি</span>
            </Link>
            <Link
              to="/paper-builder"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
            >
              <BookOpen size={16} />
              <span>পেপার মেকার</span>
            </Link>
          </div>
        </div>
          
        {/* =========================================================================
            1. SIX QUICK-ACTION CIRCULAR TOOL CARDS (Matches Image 2 exactly)
            (প্রশ্ন তৈরি, OMR Evaluator, অনলাইন পরীক্ষা, স্মার্টবোর্ড, PDF Protect, PDF to Booklet)
            ========================================================================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
            
            {/* Card 1: প্রশ্ন তৈরি */}
            <div 
              onClick={() => navigate('/generate')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/70 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:shadow-md group-hover:border-teal-300 transition-all duration-300 relative overflow-hidden">
                <svg width="48" height="48" viewBox="0 0 72 72" fill="none" className="text-teal-600 drop-shadow-xs">
                  <rect x="14" y="10" width="30" height="52" rx="4" fill="#ffffff" stroke="#0d9488" strokeWidth="2.5" />
                  <line x1="20" y1="18" x2="38" y2="18" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
                  <line x1="20" y1="24" x2="34" y2="24" stroke="#99f6e4" strokeWidth="2" strokeLinecap="round" />
                  <rect x="20" y="30" width="4" height="4" rx="1" fill="#14b8a6" />
                  <line x1="27" y1="32" x2="38" y2="32" stroke="#5eead4" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="20" y="38" width="4" height="4" rx="1" fill="#14b8a6" />
                  <line x1="27" y1="40" x2="38" y2="40" stroke="#5eead4" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="20" y="46" width="4" height="4" rx="1" fill="#14b8a6" />
                  <line x1="27" y1="48" x2="38" y2="48" stroke="#5eead4" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="32" y="16" width="28" height="44" rx="3" fill="#f0fdfa" stroke="#0f766e" strokeWidth="2" />
                  <line x1="38" y1="24" x2="52" y2="24" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" />
                  <line x1="38" y1="30" x2="54" y2="30" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="41" cy="38" r="2" fill="#10b981" />
                  <line x1="46" y1="38" x2="54" y2="38" stroke="#cbd5e1" strokeWidth="1.5" />
                  <circle cx="41" cy="46" r="2" fill="#10b981" />
                  <line x1="46" y1="46" x2="54" y2="46" stroke="#cbd5e1" strokeWidth="1.5" />
                  <circle cx="28" cy="55" r="7" fill="#059669" fillOpacity="0.2" />
                  <path d="M26 53 L28 47 L30 53 L34 54 L30 56 L29 60 L27 56 L23 55 Z" fill="#047857" />
                </svg>
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-700 group-hover:text-teal-700 transition">
                প্রশ্ন তৈরি
              </span>
            </div>

            {/* Card 2: OMR Evaluator */}
            <div 
              onClick={() => setIsOmrTokenModalOpen(true)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/70 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:shadow-md group-hover:border-rose-300 transition-all duration-300 relative overflow-hidden">
                <svg width="48" height="48" viewBox="0 0 72 72" fill="none" className="drop-shadow-xs">
                  <rect x="14" y="16" width="28" height="42" rx="3" fill="#ffffff" stroke="#f43f5e" strokeWidth="2" />
                  <text x="17" y="24" fill="#e11d48" fontSize="6" fontWeight="bold" fontFamily="sans-serif">OMR</text>
                  <circle cx="20" cy="30" r="1.5" fill="#f43f5e" />
                  <circle cx="25" cy="30" r="1.5" stroke="#cbd5e1" />
                  <circle cx="30" cy="30" r="1.5" stroke="#cbd5e1" />
                  <circle cx="20" cy="36" r="1.5" stroke="#cbd5e1" />
                  <circle cx="25" cy="36" r="1.5" fill="#f43f5e" />
                  <circle cx="30" cy="36" r="1.5" stroke="#cbd5e1" />
                  <circle cx="20" cy="42" r="1.5" stroke="#cbd5e1" />
                  <circle cx="25" cy="42" r="1.5" stroke="#cbd5e1" />
                  <circle cx="30" cy="42" r="1.5" fill="#f43f5e" />
                  <rect x="30" y="12" width="26" height="48" rx="4" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
                  <line x1="38" y1="15" x2="48" y2="15" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="33" y="20" width="20" height="28" rx="2" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x="35" y="36" fill="#047857" fontSize="7" fontWeight="bold" fontFamily="sans-serif">92/100</text>
                  <path d="M48 8 L50 4 L52 8 L56 10 L52 12 L50 16 L48 12 L44 10 Z" fill="#10b981" />
                </svg>
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-700 group-hover:text-rose-700 transition">
                OMR Evaluator
              </span>
            </div>

            {/* Card 3: অনলাইন পরীক্ষা */}
            <div 
              onClick={() => navigate('/exams')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/70 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:shadow-md group-hover:border-cyan-300 transition-all duration-300 relative overflow-hidden">
                <svg width="48" height="48" viewBox="0 0 72 72" fill="none" className="drop-shadow-xs">
                  <rect x="15" y="18" width="42" height="28" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
                  <line x1="10" y1="46" x2="62" y2="46" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
                  <rect x="20" y="24" width="16" height="4" rx="1" fill="#bae6fd" />
                  <rect x="20" y="30" width="12" height="3" rx="1" fill="#e0f2fe" />
                  <circle cx="44" cy="28" r="9" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  <polyline points="44 23 44 28 48 28" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="44" cy="40" r="4.5" fill="#10b981" />
                  <path d="M42 40 L43.5 41.5 L46.5 38.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-700 group-hover:text-cyan-700 transition">
                অনলাইন পরীক্ষা
              </span>
            </div>

            {/* Card 4: স্মার্টবোর্ড */}
            <div 
              onClick={() => setIsSmartboardOpen(true)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/70 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:shadow-md group-hover:border-purple-300 transition-all duration-300 relative overflow-hidden">
                <svg width="48" height="48" viewBox="0 0 72 72" fill="none" className="text-purple-600 drop-shadow-xs">
                  <line x1="22" y1="48" x2="16" y2="62" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="50" y1="48" x2="56" y2="62" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="36" y1="48" x2="36" y2="60" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                  <rect x="14" y="14" width="44" height="34" rx="4" fill="#ffffff" stroke="#7c3aed" strokeWidth="2.5" />
                  <path d="M20 34 Q 28 22 36 30 T 52 24" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <circle cx="25" cy="24" r="3.5" fill="#a78bfa" fillOpacity="0.4" stroke="#7c3aed" strokeWidth="1.5" />
                  <line x1="38" y1="36" x2="48" y2="36" stroke="#6d28d9" strokeWidth="2" strokeLinecap="round" />
                  <line x1="38" y1="40" x2="44" y2="40" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M48 40 L53 35 L56 38 L51 43 Z" fill="#16a34a" />
                </svg>
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-700 group-hover:text-purple-700 transition">
                স্মার্টবোর্ড
              </span>
            </div>

            {/* Card 5: PDF Protect */}
            <div 
              onClick={() => setPdfToolModalType('protect')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/70 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:shadow-md group-hover:border-rose-300 transition-all duration-300 relative overflow-hidden">
                <svg width="48" height="48" viewBox="0 0 72 72" fill="none" className="drop-shadow-xs">
                  <path d="M20 12 C 20 10.5 21 9.5 22.5 9.5 L 42 9.5 L 52 19.5 L 52 50 C 52 51.5 51 52.5 49.5 52.5 L 22.5 52.5 C 21 52.5 20 51.5 20 50 Z" fill="#ffffff" stroke="#e11d48" strokeWidth="2.5" />
                  <path d="M42 9.5 L 42 19.5 L 52 19.5 Z" fill="#ffe4e6" stroke="#e11d48" strokeWidth="1.5" />
                  <rect x="25" y="24" width="22" height="10" rx="2" fill="#e11d48" />
                  <text x="27" y="32" fill="#ffffff" fontSize="7" fontWeight="bold" fontFamily="sans-serif">PDF</text>
                  <rect x="34" y="37" width="18" height="16" rx="3" fill="#ca8a04" stroke="#a16207" strokeWidth="1.5" />
                  <path d="M38 37 V 32 C 38 29.5 48 29.5 48 32 V 37" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <circle cx="43" cy="44" r="2" fill="#713f12" />
                </svg>
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-700 group-hover:text-rose-700 transition">
                PDF Protect
              </span>
            </div>

            {/* Card 6: PDF to Booklet */}
            <div 
              onClick={() => setPdfToolModalType('booklet')}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/70 shadow-xs flex items-center justify-center group-hover:scale-105 group-hover:shadow-md group-hover:border-indigo-300 transition-all duration-300 relative overflow-hidden">
                <svg width="48" height="48" viewBox="0 0 72 72" fill="none" className="drop-shadow-xs">
                  <rect x="12" y="22" width="18" height="26" rx="2" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                  <line x1="16" y1="28" x2="26" y2="28" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="33" x2="24" y2="33" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M28 17 Q 38 10 44 19" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <polyline points="40 19 44 19 44 15" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M38 24 L 38 48 Q 46 45 54 48 L 54 24 Q 46 21 38 24 Z" fill="#f8fafc" stroke="#1d4ed8" strokeWidth="2" />
                  <path d="M38 24 L 38 48 Q 30 45 22 48 L 22 24 Q 30 21 38 24 Z" fill="#ffffff" stroke="#1d4ed8" strokeWidth="2" />
                  <line x1="42" y1="30" x2="50" y2="30" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition">
                PDF to Booklet
              </span>
            </div>

          </div>
        </div>

        {/* =========================================================================
            2. MIDDLE SECTION: TWO LARGE CARDS
            (Left: 🚀 দা পাঠশালার ইমপ্যাক্ট with [সকল | আমি] toggle, Right: আপডেটস)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          
          {/* Left Card: 🚀 দা পাঠশালার ইমপ্যাক্ট */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header with [সকল | আমি] Toggle */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚀</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    দা পাঠশালার ইমপ্যাক্ট
                  </h3>
                </div>
                
                {/* [ 👥 সকল | 👤 আমি ] Switcher */}
                <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold">
                  <button
                    onClick={() => setImpactView('all')}
                    className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                      impactView === 'all'
                        ? 'bg-[#0c1e33] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users size={12} />
                    <span>সকল</span>
                  </button>
                  <button
                    onClick={() => setImpactView('me')}
                    className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                      impactView === 'me'
                        ? 'bg-[#0c1e33] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User size={12} />
                    <span>আমি</span>
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mb-6">
                {impactView === 'all' ? 'শিক্ষকদের সময় ও খরচ সাশ্রয়ের পরিসংখ্যান' : 'আপনার ব্যক্তিগত সময় ও খরচ সাশ্রয়ের পরিসংখ্যান'}
              </p>

              {/* Stat 1: সময় সাশ্রয় */}
              <div className="space-y-1 mb-5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Clock size={13} />
                  </div>
                  <span>সময় সাশ্রয়</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight pl-7">
                  {impactView === 'all' ? '৩১.১৫ লাখ ঘণ্টা' : '৮৪ ঘণ্টা'}
                </div>
              </div>

              {/* Stat 2: টাকা সাশ্রয় */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    ৳
                  </div>
                  <span>টাকা সাশ্রয়</span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-900 tracking-tight pl-7">
                  {impactView === 'all' ? '৮৭.০১ কোটি টাকা' : '১৫,৬০০ টাকা'}
                </div>
              </div>
            </div>

            {/* Action Quick Link to Paper Maker */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                স্বয়ংক্রিয় প্রশ্নপত্র জেনারেশন সিস্টেম
              </span>
              <button
                onClick={() => navigate('/generate')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
              >
                <span>প্রশ্নপত্র তৈরি শুরু করুন</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Card: দা পাঠশালা আপডেটস */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1 rounded-md bg-amber-100 text-amber-700">
                  <Megaphone size={16} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  দা পাঠশালা আপডেটস
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mb-5">
                নতুন ফিচার, আপডেট ও গুরুত্বপূর্ণ ঘোষণা
              </p>

              {/* Channel Notice Box */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-5">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  নতুন ফিচার, জরুরি আপডেট, সার্ভার নোটিশ এবং গুরুত্বপূর্ণ নির্দেশনা পেতে আমাদের Messenger Channel-এ যুক্ত থাকুন।
                </p>
              </div>

              {/* Notice Bullet List */}
              <div className="space-y-3">
                <div 
                  onClick={() => setIsTutorialOpen(true)}
                  className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium hover:text-slate-900 cursor-pointer"
                >
                  <span className="text-base">🚀</span>
                  <span>নতুন ফিচার আপডেট (২০২৬ কারিকুলাম প্রশ্ন ব্যাংক)</span>
                </div>

                <div 
                  onClick={() => setIsRegistrationModalOpen(true)}
                  className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium hover:text-slate-900 cursor-pointer"
                >
                  <span className="text-base">📢</span>
                  <span>প্রতিষ্ঠান রেজিস্ট্রেশন ও কাস্টম হেডার সুবিধা</span>
                </div>

                <div 
                  onClick={() => setIsContactModalOpen(true)}
                  className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-medium hover:text-slate-900 cursor-pointer"
                >
                  <span className="text-base">🔔</span>
                  <span>সরাসরি শিক্ষক সহায়তা হেল্পডেস্ক</span>
                </div>
              </div>
            </div>

            {/* Action Quick Link */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                সহায়তা বা ফিডব্যাকের জন্য যোগাযোগ
              </span>
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 group"
              >
                <span>টিউটোরিয়াল গাইড দেখুন</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* ۱۰ম শ্রেণির গণিত প্রশ্নপত্র তৈরি সেকশন (User's Interactive Math Paper Studio) */}
        <section className="mb-2">
          <Class10MathPaperWidget />
        </section>

        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-white">
                স্মার্ট প্রশ্নপত্র তৈরিতে নতুন মাত্রা
              </h4>
              <p className="text-xs text-slate-300">
                সৃজনশীল, বহুনির্বাচনী ও সংক্ষিপ্ত প্রশ্ন মুহূর্তের মধ্যে এ৪ সাইজে ২-কলামে প্রিন্ট করুন।
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/generate')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm whitespace-nowrap shadow-xs transition"
          >
            এখনই প্রশ্নপত্র তৈরি করুন
          </button>
        </div>

      </div>

      {/* Modals */}
      <InstitutionRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onRegistered={(data) => {
          setRegisteredInstitution(data);
        }}
      />

      <SmartboardModal
        isOpen={isSmartboardOpen}
        onClose={() => setIsSmartboardOpen(false)}
      />

      <PdfToolsModal
        type={pdfToolModalType}
        onClose={() => setPdfToolModalType(null)}
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

    </div>
  );
};
