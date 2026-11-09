import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Camera, 
  Share2, 
  HelpCircle,
  AlertCircle,
  LogIn,
  UserPlus,
  LogOut,
  Phone,
  Crown,
  Lock
} from 'lucide-react';
import { AssignedTest, UserRole } from '../../types';
import { getStoredTests, saveStoredTests, fetchTestFromServer } from '../../lib/storage';
import { getCurrentParent, logoutParent, ParentUser } from '../../lib/parentAuth';
import { ParentAuthModal } from '../auth/ParentAuthModal';
import { SecretAdminLoginModal } from '../admin/SecretAdminLoginModal';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
  onOpenExamWithPin: (test: AssignedTest) => void;
  onCreateCustomExam?: () => void;
  onToggleSidebar?: () => void;
  onAdminLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  onOpenExamWithPin,
  onCreateCustomExam,
  onToggleSidebar,
  onAdminLogin,
}) => {
  const [currentParent, setCurrentParent] = useState<ParentUser | null>(() => getCurrentParent());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authPrompt, setAuthPrompt] = useState<string | undefined>(undefined);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // 20-clicks Secret Admin Trigger
  const [adminClicks, setAdminClicks] = useState(0);
  const [showSecretAdminModal, setShowSecretAdminModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('dapathshala_is_admin') === 'true';
  });
  const adminClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Consecutive 20-click handler for the marked graduation cap icon
  const handleMarkedIconClick = (e: React.MouseEvent) => {
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
      // Reset if inactive for 5 seconds
      adminClickTimeoutRef.current = setTimeout(() => {
        setAdminClicks(0);
      }, 5000);
    }
  };

  const handleAdminSuccess = () => {
    setIsAdminLoggedIn(true);
    if (onAdminLogin) {
      onAdminLogin();
    } else {
      onSelectRole('parent');
      setTimeout(() => {
        window.dispatchEvent(new Event('dapathshala_open_admin_portal'));
      }, 150);
    }
  };

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentParent(getCurrentParent());
    };
    window.addEventListener('dapathshala_parent_auth_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('dapathshala_parent_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleOpenLogin = () => {
    setAuthPrompt('আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে সহজে প্রবেশ করুন');
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthPrompt('শুধু মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে নিমেষেই রেজিস্টার করুন');
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    logoutParent();
    setCurrentParent(null);
  };

  const handleParentPortalClick = () => {
    const parent = getCurrentParent();
    if (parent) {
      onSelectRole('parent');
    } else {
      setAuthPrompt('অভিভাবক পোর্টালে প্রবেশের পূর্বে অনুগ্রহ করে আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন বা রেজিস্টার করুন।');
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (user: ParentUser) => {
    setCurrentParent(user);
    setIsAuthModalOpen(false);
    onSelectRole('parent');
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const trimmed = pinInput.trim();
    if (!trimmed) {
      setPinError('দয়া করে ৬-সংখ্যার পিন লিখুন');
      return;
    }
    const tests = getStoredTests();
    let matched = tests.find(t => t.pin === trimmed || t.id.toLowerCase() === trimmed.toLowerCase());
    
    // Check server if not in local storage
    if (!matched) {
      const serverTest = await fetchTestFromServer(trimmed);
      if (serverTest) {
        matched = serverTest;
        saveStoredTests([serverTest, ...tests]);
      }
    }

    if (matched) {
      onOpenExamWithPin(matched);
    } else {
      setPinError('এই পিনের কোনো পরীক্ষা পাওয়া যায়নি অথবা এটি মুছে ফেলা হয়েছে। অভিভাবক ড্যাশবোর্ড থেকে নতুন পরীক্ষা তৈরি করুন।');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* ======================================================== */}
      {/* 1. CLEAN TOP NAVBAR (Minimalist & High Contrast)         */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#0c1322] border-b border-slate-800 text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMarkedIconClick}
              className="w-8.5 h-8.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-90 text-white flex items-center justify-center shadow-xs cursor-pointer transition-all select-none focus:outline-none"
              title="দাপাঠশালা লোগো"
              aria-label="দাপাঠশালা লোগো"
            >
              <GraduationCap className="w-5 h-5 pointer-events-none" />
            </button>
            <div>
              <span className="font-black text-lg tracking-tight text-white block leading-tight">
                দাপাঠশালা
              </span>
              <span className="text-[11px] text-slate-400 font-semibold hidden sm:block">
                জাতীয় শিক্ষাক্রম ভিত্তিক মূল্যায়ন প্ল্যাটফর্ম
              </span>
            </div>
          </div>

          {/* Modern Login & Register Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-xs font-bold">

            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => {
                  if (onAdminLogin) {
                    onAdminLogin();
                  } else {
                    onSelectRole('parent');
                    setTimeout(() => {
                      window.dispatchEvent(new Event('dapathshala_open_admin_portal'));
                    }, 120);
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm border border-purple-400/40 cursor-pointer animate-in fade-in"
                title="সুপার-অ্যাডমিন কন্ট্রোল সেন্টার"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>অ্যাডমিন প্যানেল</span>
              </button>
            )}

            {currentParent ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700/80 shadow-2xs">
                  <span className="text-white text-xs font-bold truncate max-w-[130px] sm:max-w-[170px]">
                    {currentParent.name || 'অভিভাবক'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold pl-2 border-l border-slate-700">
                    <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{currentParent.phone}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="লগআউট করুন"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">লগআউট</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  <span>লগইন</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenRegister}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>রেজিস্টার</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. HERO HEADER (Focused & Clean)                         */}
      {/* ======================================================== */}
      <section className="pt-4 sm:pt-6 pb-3 px-4 sm:px-6 max-w-6xl mx-auto text-center w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold mb-3 shadow-2xs">
          <span>🎯</span>
          <span>সহজ, নিরাপদ ও স্বচ্ছ একাডেমিক মূল্যায়ন</span>
        </div>

        <h1 className="text-2xl sm:text-3.5xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
          সন্তানের একাডেমিক মূল্যায়ন ও স্মার্ট পরীক্ষা ব্যবস্থা
        </h1>
      </section>

      {/* ======================================================== */}
      {/* 3. TWO PRIMARY CHOICE CARDS (অভিভাবক ও সন্তান)           */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* ---------------------------------------------------- */}
          {/* OPTION 1: অভিভাবক (PARENT)                            */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-600 to-indigo-600" />

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                আমি একজন অভিভাবক
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                সন্তানের জন্য শ্রেণি, বিষয় ও অধ্যায় বেছে এআই দিয়ে প্রশ্ন তৈরি করুন। প্রতিটি প্রশ্ন এডিট বা স্কিপ করে নতুন প্রশ্ন আনার পর লিংক শেয়ার করুন।
              </p>

              {/* Feature Checklist */}
              <div className="space-y-2.5 mb-8 text-xs sm:text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ক্লাস ও অধ্যায় নির্বাচন করে এআই দিয়ে প্রশ্ন জেনারেশন</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>প্রশ্ন পছন্দ না হলে 'স্কিপ' বাটনে নতুন প্রশ্ন তৈরি</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>এক ক্লিকে পরীক্ষার লিংক জেনারেট ও সন্তানকে শেয়ার</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>পরীক্ষা শেষে খাতা যাচাই, মার্কস ও মন্তব্য প্রদান</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleParentPortalClick}
              className="w-full py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-200/80 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>অভিভাবক পোর্টালে প্রবেশ করুন</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* OPTION 2: সন্তান / শিক্ষার্থী (STUDENT / CHILD)        */}
          {/* ---------------------------------------------------- */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-emerald-500 to-teal-500" />

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                আমি শিক্ষার্থী / সন্তান
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-5">
                অভিভাবকের পাঠানো ৬-সংখ্যার পিন (PIN) অথবা পরীক্ষার লিংকে ক্লিক করে সরাসরি পরীক্ষায় অংশ নিন। শুরু করার আগে প্রশ্নপত্র সম্পূর্ণ গোপন থাকবে।
              </p>

              {/* PIN Entry Box */}
              <form onSubmit={handlePinSubmit} className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  🔑 পরীক্ষার ৬-সংখ্যার পিন (PIN) দিন:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="যেমন: 787193"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-wider"
                    maxLength={10}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    প্রবেশ করুন
                  </button>
                </div>
                {pinError && (
                  <div className="flex items-center gap-1.5 text-rose-600 text-xs font-semibold mt-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}
              </form>

            </div>

            <button
              type="button"
              onClick={() => onSelectRole('student')}
              className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>শিক্ষার্থী পোর্টাল খুলুন</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 4. 3-STEP EXAM LIFECYCLE (Visual Guide)                  */}
        {/* ======================================================== */}
        <div className="mt-10 sm:mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              পুরো প্রক্রিয়া কীভাবে সম্পন্ন হয়?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              অভিভাবকের প্রশ্ন তৈরি থেকে খাতা মূল্যায়ন পর্যন্ত স্বচ্ছ ৩টি ধাপ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm mb-3">
                  ১
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  প্রশ্ন তৈরি ও এডিট
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  অভিভাবক শ্রেণি, বিষয় ও অধ্যায় বেছে এআই দিয়ে প্রশ্ন বানান। প্রশ্ন অপছন্দ হলে স্কিপ করে নতুন প্রশ্ন নেওয়া যাবে।
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-700 mt-3 inline-block">
                🔗 পরীক্ষার লিংক ও পিন জেনারেট
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm mb-3">
                  ২
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  ক্যামেরা নজরদারিতে পরীক্ষা
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  সন্তান লিংকে ঢুকলে ওভারভিউ দেখতে পাবে। শুরু করলে ফ্রন্ট ক্যামেরা ওপেন হবে ও টাইমার শেষ হলে অটো-সাবমিট হবে।
                </p>
              </div>
              <span className="text-[11px] font-bold text-purple-700 mt-3 inline-block">
                🛡️ ফুলস্ক্রিন ও লাইভ প্রক্টরিং
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm mb-3">
                  ৩
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  খাতা মূল্যায়ন ও মন্তব্য
                </h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  খাতা জমা হলে অভিভাবকের কাছে নোটিফিকেশন যাবে। অভিভাবক খাতা দেখে মার্কস ও মন্তব্য প্রদান করে ফলাফল পাঠাবেন।
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 mt-3 inline-block">
                📝 চূড়ান্ত ফলাফল ও দিকনির্দেশনা
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 5. MINIMALIST FOOTER                                     */}
      {/* ======================================================== */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p>© ২০২৬ দাপাঠশালা — অভিভাবক ও শিক্ষার্থীর বিশ্বস্ত একাডেমিক মূল্যায়ন প্ল্যাটফর্ম</p>
        </div>
      </footer>

      {/* Parent Mobile & Password Auth Modal */}
      <ParentAuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        promptMessage={authPrompt}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Secret Admin Login Modal (Triggered by 20 consecutive clicks on marked icon) */}
      <SecretAdminLoginModal
        isOpen={showSecretAdminModal}
        onClose={() => setShowSecretAdminModal(false)}
        onSuccess={handleAdminSuccess}
      />

    </div>
  );
};
