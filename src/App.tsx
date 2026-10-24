/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthModal } from './components/auth/AuthModal';
import { Navigation } from './components/layout/Navigation';
import { AIQuestionGenerator } from './features/ai/AIQuestionGenerator';
import { AIOCR } from './features/ai/AIOCR';
import { VideoToQuiz } from './features/ai/VideoToQuiz';
import { PDFReader } from './features/ai/PDFReader';
import { FlashcardFactory } from './features/ai/FlashcardFactory';
import { StudyPlanner } from './features/ai/StudyPlanner';
import { Leaderboard } from './features/gamification/Leaderboard';
import { Achievements } from './features/gamification/Achievements';
import { ParentDashboard } from './features/parent/ParentDashboard';
import { DeveloperConsole } from './features/developer/DeveloperConsole';
import { Settings } from './features/settings/Settings';
import { LandingPage } from './features/landing/LandingPage';
import { ExamPortal } from './features/exams/ExamPortal';
import { StartExamScreen } from './features/exams/StartExamScreen';
import { NoteStore } from './features/notes/NoteStore';
import { CoachingDashboard } from './features/coaching/CoachingDashboard';
import { CoachingMarketplace } from './features/coaching/CoachingMarketplace';
import { NationalLeaderboard } from './features/gamification/NationalLeaderboard';
import { PaidModelTestStore } from './features/exams/PaidModelTestStore';
import { AIDoubtSolver } from './features/ai/AIDoubtSolver';
import { SmartRevisionHub } from './features/students/SmartRevisionHub';
import { PeerCommunityHub } from './features/community/PeerCommunityHub';
import { 
  Sparkles, 
  BookOpen, 
  Trophy, 
  Clock, 
  ChevronRight, 
  Zap, 
  Star,
  Crown,
  HelpCircle,
  BrainCircuit,
  Swords,
  Users,
  Building2,
  GraduationCap,
  Search
} from 'lucide-react';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { ResumeToast } from './components/auth/ResumeToast';
import { SecurityShield } from './components/auth/SecurityShield';
import { useResumeSession } from './hooks/useResumeSession';
import { AnimatePresence, motion } from 'motion/react';
import { User } from './types';
import { supabase } from './supabase';
import { 
  getCurrentUser, 
  saveCurrentUser, 
  clearCurrentUser, 
  ROLE_LABELS 
} from './lib/authService';
import { decodeExamFromUrlPayload } from './lib/liveExamStorage';

// Helper to extract examId from URL path, query param, or hash
const extractExamIdFromUrl = (): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    const url = new URL(window.location.href);

    // 1. Check URL query parameters: ?id=... or ?examId=...
    const queryId = url.searchParams.get('id') || url.searchParams.get('examId');
    if (queryId) return queryId;

    // 1b. Check URL encoded exam payload: ?data=... or ?payload=...
    const dataPayload = url.searchParams.get('data') || url.searchParams.get('payload');
    if (dataPayload) {
      const decoded = decodeExamFromUrlPayload(dataPayload);
      if (decoded && decoded.id) return decoded.id;
    }

    // 2. Check path: /exam/live or /exam/live/exam_123
    const path = url.pathname;
    if (path.includes('/exam/live') || path.includes('/live-exam')) {
      const match = path.match(/\/exam\/(?:live\/)?([a-zA-Z0-9_-]+)/);
      if (match && match[1] && match[1] !== 'live') return match[1];
      return queryId || 'demo_exam_01';
    }

    // 3. Check hash: #/exam/live?id=... or #id=...
    const hash = url.hash;
    if (hash) {
      if (hash.includes('?')) {
        const hashSearch = new URLSearchParams(hash.substring(hash.indexOf('?')));
        const hashId = hashSearch.get('id') || hashSearch.get('examId');
        if (hashId) return hashId;
      }
      const match = hash.match(/(?:id=|\/)([a-zA-Z0-9_-]+)/);
      if (match && match[1] && !['exam', 'live', 'home'].includes(match[1])) {
        return match[1];
      }
      if (hash.includes('exam/live') || hash.includes('exam-')) {
        return 'demo_exam_01';
      }
    }
  } catch (e) {
    console.warn('URL parsing error:', e);
  }
  return null;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [redirectTab, setRedirectTab] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'otp' | 'magic'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showResumeToast, setShowResumeToast] = useState(false);

  // Detect live exam URL (?id=... or /exam/live or #exam-live)
  const [liveExamId, setLiveExamId] = useState<string | null>(() => extractExamIdFromUrl());

  const { savedSession, clearSession } = useResumeSession();

  useEffect(() => {
    const handleUrlChange = () => {
      setLiveExamId(extractExamIdFromUrl());
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    // Check local storage for existing session
    const cachedUser = getCurrentUser();
    if (cachedUser) {
      setUser(cachedUser);
      setShowLanding(false);
    }

    // Check for saved session to show toast
    if (savedSession && !cachedUser) {
      setShowResumeToast(true);
    }

    // Check active session in Supabase if configured
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || 'ব্যবহারকারী',
            email: session.user.email || '',
            role: session.user.user_metadata?.role || cachedUser?.role || 'general_student',
            avatar: session.user.user_metadata?.avatar,
            points: session.user.user_metadata?.points || cachedUser?.points || 0
          };
          setUser(userData);
          saveCurrentUser(userData);
          setShowLanding(false);
        }
      }).catch((err) => {
        console.warn('Supabase getSession network error:', err);
      });
    }

    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || 'ব্যবহারকারী',
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'general_student',
          avatar: session.user.user_metadata?.avatar,
          points: session.user.user_metadata?.points || 0
        };
        setUser(userData);
        saveCurrentUser(userData);
        setShowLanding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [savedSession]);

  const handleAuthSuccess = (userData: any) => {
    const formattedUser: User = {
      id: userData.id || 'usr_' + Math.random().toString(36).substr(2, 9),
      name: userData.user_metadata?.name || userData.name || 'ব্যবহারকারী',
      email: userData.email || '',
      role: userData.user_metadata?.role || userData.role || 'general_student',
      points: userData.user_metadata?.points || userData.points || 150
    };
    setUser(formattedUser);
    saveCurrentUser(formattedUser);
    setShowLanding(false);
    clearSession();
    if (redirectTab) {
      setActiveTab(redirectTab);
      setRedirectTab(null);
    } else if (formattedUser.role === 'parent') {
      setActiveTab('home');
    }
  };

  const handleLogout = async () => {
    clearCurrentUser();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Signout offline error:', err);
      }
    }
    setUser(null);
    setShowLanding(true);
    setIsAuthModalOpen(false);
    setActiveTab('home');
  };

  const openAuth = (mode: 'signin' | 'register' | 'otp' | 'magic', tab?: string) => {
    setAuthMode(mode);
    if (tab) setRedirectTab(tab);
    setIsAuthModalOpen(true);
    setShowResumeToast(false);
  };

  const handleResume = () => {
    if (savedSession) {
      setAuthMode(savedSession.mode);
      setIsAuthModalOpen(true);
      setShowResumeToast(false);
    }
  };

  const handleUpdateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  const roleLabels: Record<string, string> = {
    general_student: 'শিক্ষার্থী',
    madrasah_student: 'মাদ্রাসা শিক্ষার্থী',
    guardian: 'অভিভাবক',
    coaching_manager: 'কোচিং ম্যানেজার',
    university_candidate: 'বিশ্ববিদ্যালয় পরীক্ষার্থী',
    departmental_examinee: 'বিভাগীয় পরীক্ষার্থী',
    admin: 'মালিক / সুপার অ্যাডমিন',
    parent: 'অভিভাবক',
    child: 'শিক্ষার্থী'
  };

  // PRIORITY 1: Direct Live Exam Screen (Shareable Exam Link immediately launches exam)
  if (liveExamId) {
    return (
      <StartExamScreen 
        examId={liveExamId} 
        onExit={() => {
          setLiveExamId(null);
          try {
            const cleanPath = window.location.pathname.replace(/\/exam\/live\/?/, '/') || '/';
            window.history.pushState({}, '', cleanPath);
          } catch {}
        }} 
      />
    );
  }

  // PRIORITY 2: Landing Page if user not logged in or explicitly on landing
  if (showLanding) {
    return (
      <>
        <LandingPage 
          user={user}
          onDashboardClick={() => setShowLanding(false)}
          onGetStarted={() => openAuth('register')} 
          onFeatureClick={(tab) => {
            if (user) {
              setActiveTab(tab);
              setShowLanding(false);
            } else {
              openAuth('signin', tab);
            }
          }}
          onSignInClick={() => openAuth('signin')}
          onRegisterClick={() => openAuth('register')}
        />
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
        />
        <ResumeToast 
          isVisible={showResumeToast}
          onClose={() => setShowResumeToast(false)}
          onResume={handleResume}
          email={savedSession?.email || ''}
        />
      </>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border flex items-center gap-1.5 shadow-sm ${
                    user?.role === 'admin'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : user?.role === 'parent' 
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200' 
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${user?.role === 'admin' ? 'bg-amber-600' : user?.role === 'parent' ? 'bg-indigo-600' : 'bg-emerald-600'} animate-pulse`} />
                    {user?.role ? (roleLabels[user.role] || user.role) : 'ব্যবহারকারী'}
                  </span>
                  {user?.role === 'admin' && (
                    <span className="text-xs bg-amber-500 text-white px-3 py-1 rounded-full font-bold shadow-sm flex items-center gap-1">
                      <Crown size={12} />
                      ওনার কন্ট্রোল
                    </span>
                  )}
                  {user?.role === 'parent' && (
                    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold border border-slate-200">
                      প্যারেন্ট মনিটরিং অ্যাক্টিভ
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                  স্বাগতম, <span className={user?.role === 'admin' ? 'text-amber-600' : user?.role === 'parent' ? 'text-indigo-600' : 'text-emerald-600'}>
                    {user?.name || user?.email?.split('@')[0]}
                  </span>!
                </h1>
                <p className="mt-2 text-slate-500 text-lg">
                  {user?.role === 'admin'
                    ? 'মালিক ও সুপার অ্যাডমিন হিসেবে সম্পূর্ণ প্ল্যাটফর্ম ও সিস্টেম পর্যবেক্ষণ করুন।'
                    : user?.role === 'parent' 
                    ? 'আপনার সন্তানদের পড়াশোনা এবং কুইজের অগ্রগতি পর্যবেক্ষণ করুন।' 
                    : 'আপনার শেখার যাত্রা আজ কোথা থেকে শুরু করবেন?'}
                </p>
              </div>
              <div className="flex gap-3 sm:gap-4 shrink-0">
                <div className={`px-5 py-3.5 rounded-2xl shadow-md border flex items-center gap-3.5 transition-all min-w-[140px] ${
                  user?.role === 'parent' 
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-100' 
                    : user?.role === 'admin'
                    ? 'bg-slate-900 text-white border-slate-800 shadow-slate-200'
                    : 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-100'
                }`}>
                  <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center shrink-0">
                    <Zap size={22} className="text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white leading-tight">{user?.points || 0}</div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-white/90">মোট XP</div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-amber-500 text-white border border-amber-600 rounded-2xl shadow-md shadow-amber-100 flex items-center gap-3.5 min-w-[130px]">
                  <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center shrink-0">
                    <Star size={22} className="text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white leading-tight">০৫</div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-white/90">স্ট্রিক</div>
                  </div>
                </div>
              </div>
            </header>

            {/* Special Owner / Admin Banner */}
            {user?.role === 'admin' && (
              <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-amber-500/40">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-300/30">
                    <Crown size={14} className="text-amber-300" />
                    মালিক ও সুপার অ্যাডমিন প্যানেল সক্রিয়
                  </div>
                  <h3 className="text-2xl font-black text-white">প্ল্যাটফর্ম মালিক কন্ট্রোল ও সম্পূর্ণ সিস্টেম পরিচালনা</h3>
                  <p className="text-amber-100/90 text-sm max-w-xl">
                    স্বাগতম অ্যাডমিন! আপনি এই অ্যাপ্লিকেশনের মালিক। এখান থেকে আপনি সিস্টেম লগ, পরীক্ষা পোর্টাল, কোচিং ম্যানেজমেন্ট, স্টোর এবং সকল ফিচার পরিচালনা করতে পারেন।
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <button 
                    onClick={() => setActiveTab('developer')}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 text-sm transition-all cursor-pointer"
                  >
                    <span className="text-slate-950 font-black">অ্যাডমিন কনসোল</span>
                    <ChevronRight size={18} className="text-slate-950 stroke-[3]" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('exams')}
                    className="border border-white/40 text-white hover:bg-white/10 font-bold px-5 py-3.5 rounded-xl text-sm transition-all cursor-pointer"
                  >
                    পরীক্ষা পোর্টাল
                  </button>
                </div>
              </div>
            )}

            {/* Special Guardian Banner if logged in as Parent */}
            {user?.role === 'parent' && (
              <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-700/50">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    অভিভাবক বিশেষ কন্ট্রোল প্যানেল
                  </div>
                  <h3 className="text-2xl font-black text-white">সন্তানদের অগ্রগতি ও কুইজ মনিটর করুন</h3>
                  <p className="text-indigo-200 text-sm max-w-xl">
                    সন্তানদের পড়াশোনার সময়, পরীক্ষার ফলাফল পর্যালোচনা করুন এবং যেকোনো বিষয়ের উপর নতুন পরীক্ষা বা কুইজ নির্ধারণ করে দিন।
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 shrink-0">
                  <button 
                    onClick={() => setActiveTab('parent-dashboard')}
                    className="bg-white hover:bg-slate-100 text-indigo-950 font-black px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2 text-sm transition-all cursor-pointer border-2 border-white"
                  >
                    <span className="text-indigo-950 font-black text-sm">প্যারেন্ট ড্যাশবোর্ডে প্রবেশ করুন</span>
                    <ChevronRight size={18} className="text-indigo-950 stroke-[3]" />
                  </button>
                </div>
              </div>
            )}

            {/* Coaching Marketplace & Student Admission Finder Spotlight Banner */}
            <div className="p-6 sm:p-7 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-700/40">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold">
                  <Building2 size={14} className="text-emerald-400" />
                  কোচিং মার্কেটপ্লেস ও স্টুডেন্ট অ্যাডমিশন ফাইন্ডার
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">এলাকা ও বিষয় অনুযায়ী সেরা কোচিং খুঁজুন ও অনলাইনে ভর্তি আবেদন করুন</h3>
                <p className="text-emerald-100 text-xs sm:text-sm max-w-xl">
                  ফি স্ট্রাকচার, শিক্ষক প্যানেল ও রেটিং পর্যালোচনা করে পছন্দের কোর্সে সরাসরি ভর্তি আবেদন পাঠান। কোচিং ম্যানেজারদের জন্য রয়েছে স্টুডেন্ট লিডস ও ব্যাচ কন্ট্রোল প্যানেল।
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <button 
                  onClick={() => setActiveTab('coaching-marketplace')}
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Search size={16} />
                  <span>কোচিং ফাইন্ডার ডিরেক্টরি</span>
                  <ChevronRight size={18} className="text-slate-950 stroke-[3]" />
                </button>
                <button 
                  onClick={() => setActiveTab('coaching')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-4 py-3.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <GraduationCap size={16} className="text-emerald-300" />
                  <span>ম্যানেজার ড্যাশবোর্ড ও লিডস</span>
                </button>
              </div>
            </div>

            {/* Student Peer Community & Challenge System Spotlight Banner */}
            <div className="p-6 sm:p-7 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-700/40">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                  <Swords size={14} className="text-amber-400" />
                  পিয়ার কমিউনিটি ও লাইভ ডুয়েল
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">সহপাঠীদের প্রশ্ন-উত্তর ফোরাম ও 'Challenge a Friend'</h3>
                <p className="text-purple-100 text-xs sm:text-sm max-w-xl">
                  অন্যান্য কোচিং ও কলেজের শিক্ষার্থীদের সাথে প্রশ্ন শেয়ার করুন, লাইভ ১০ কুইজ পরীক্ষায় বন্ধুকে চ্যালেঞ্জ জানান এবং পয়েন্ট স্ক্যানারে জয়ী ট্রফি অর্জন করুন।
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <button 
                  onClick={() => setActiveTab('community')}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2 text-sm transition-all cursor-pointer"
                >
                  <Swords size={18} />
                  <span>কমিউনিটি ও ডুয়েলে প্রবেশ করুন</span>
                  <ChevronRight size={18} className="text-slate-950 stroke-[3]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab('ai-gen')}
                    className="group p-5 bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl hover:border-emerald-200 transition-all text-left cursor-pointer"
                  >
                    <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Sparkles size={22} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">স্মার্ট কোয়েস্ট</h3>
                    <p className="text-xs text-slate-500 mt-1">এআই কুইজ ও অনুশীলন</p>
                  </button>

                  <button 
                    onClick={() => setActiveTab('doubt-solver')}
                    className="group p-5 bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl hover:border-emerald-200 transition-all text-left cursor-pointer"
                  >
                    <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <HelpCircle size={22} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">ডাউট সলভার</h3>
                    <p className="text-xs text-slate-500 mt-1">ধাপে ধাপে প্রশ্নের সমাধান</p>
                  </button>

                  <button 
                    onClick={() => setActiveTab('smart-revision')}
                    className="group p-5 bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl hover:border-indigo-200 transition-all text-left cursor-pointer"
                  >
                    <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <BrainCircuit size={22} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">স্মার্ট রিভিশন</h3>
                    <p className="text-xs text-slate-500 mt-1">দুর্বল অধ্যায় নির্ণয় ও রুটিন</p>
                  </button>

                  <button 
                    onClick={() => setActiveTab('exams')}
                    className="group p-5 bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl hover:border-blue-200 transition-all text-left cursor-pointer"
                  >
                    <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <BookOpen size={22} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">পরীক্ষা পোর্টাল</h3>
                    <p className="text-xs text-slate-500 mt-1">লাইভ মডেল টেস্ট ও মেধা</p>
                  </button>
                </div>

                <Card className="p-8 border-none shadow-xl bg-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Clock size={120} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="text-indigo-600" size={20} />
                        পড়া চালিয়ে যান
                      </h3>
                      <Button variant="ghost" className="text-indigo-600 font-bold">সব দেখুন</Button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: 'সালোকসংশ্লেষণ প্রক্রিয়া', subject: 'জীববিজ্ঞান', progress: 75, color: 'bg-emerald-500' },
                        { title: 'ত্রিকোণমিতি বেসিকস', subject: 'গণিত', progress: 40, color: 'bg-blue-500' }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-all">
                          <div className="flex-1 mr-8">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-slate-900">{item.title}</span>
                              <span className="text-xs font-bold text-slate-400 uppercase">{item.subject}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full ${item.color}`} style={{ width: `${item.progress}%` }} />
                            </div>
                          </div>
                          <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <Card className="p-6 border-none shadow-xl bg-white space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Trophy className="text-amber-500" size={20} />
                      লিডারবোর্ড
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab('leaderboard')}
                      className="text-indigo-600 font-bold text-xs"
                    >
                      সব দেখুন
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'আরাফাত', xp: 2450, rank: 1, avatar: 'https://picsum.photos/seed/1/40' },
                      { name: 'সুমাইয়া', xp: 2100, rank: 2, avatar: 'https://picsum.photos/seed/2/40' },
                      { name: 'আপনি', xp: user?.points || 0, rank: 15, avatar: `https://picsum.photos/seed/${user?.id}/40` }
                    ].map((player, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${player.name === 'আপনি' ? 'bg-indigo-50 border border-indigo-100' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-400 w-4">#{player.rank}</span>
                          <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-lg" />
                          <span className="text-sm font-bold text-slate-700">{player.name}</span>
                        </div>
                        <span className="text-xs font-black text-indigo-600">{player.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="p-6 rounded-2xl shadow-xl bg-indigo-600 text-white space-y-4">
                  <h3 className="text-lg font-bold text-white">আজকের লক্ষ্য</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/90">৩টি কুইজ সম্পন্ন করা</span>
                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg text-white">২/৩</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[66%]" />
                  </div>
                  <p className="text-xs text-white/80 italic">আর মাত্র ১টি কুইজ বাকি! আপনি পারবেন!</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'ai-gen': return <AIQuestionGenerator />;
      case 'doubt-solver': return <AIDoubtSolver />;
      case 'smart-revision': return <SmartRevisionHub onStartQuiz={() => setActiveTab('exams')} />;
      case 'ai-ocr': return <AIOCR />;
      case 'video-quiz': return <VideoToQuiz />;
      case 'pdf-reader': return <PDFReader />;
      case 'flashcards': return <FlashcardFactory />;
      case 'study-planner': return <StudyPlanner />;
      case 'leaderboard': return <Leaderboard />;
      case 'national-leaderboard': return <NationalLeaderboard onStartExam={() => setActiveTab('exams')} onOpenStore={() => setActiveTab('paid-tests')} />;
      case 'achievements': return <Achievements />;
      case 'parent-dashboard': return <ParentDashboard />;
      case 'exams': return <ExamPortal />;
      case 'paid-tests': return <PaidModelTestStore />;
      case 'notes': return <NoteStore />;
      case 'coaching-marketplace': return <CoachingMarketplace onOpenCoachingDashboard={() => setActiveTab('coaching')} />;
      case 'coaching': return <CoachingDashboard onOpenMarketplace={() => setActiveTab('coaching-marketplace')} />;
      case 'community': return <PeerCommunityHub />;
      case 'developer': return <DeveloperConsole />;
      case 'settings': return <Settings user={user} onUpdateUser={handleUpdateUser} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <SecurityShield user={user} isEnabled={!!user}>
        {user ? (
          <div className="flex flex-col min-h-screen">
            <Navigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              user={user} 
              onLogout={handleLogout}
              onGoToLanding={() => setShowLanding(true)}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            <main className={`flex-1 pt-16 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-indigo-50">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/20 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full" />
            </div>
            
            <div className="max-w-md w-full space-y-8 relative z-10">
              <div className="text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => setShowLanding(false)}
                  className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-2xl shadow-emerald-200 text-white mb-4 cursor-pointer"
                >
                  <BookOpen size={40} />
                </motion.div>
                <h1 className="text-5xl font-black tracking-tighter text-slate-900">
                  দা<span className="text-emerald-600">পাঠশালা</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium">এআই চালিত আগামীর শিক্ষা প্ল্যাটফর্ম</p>
              </div>

              <Card className="p-8 border-none shadow-2xl bg-white/80 backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">শুরু করা যাক</h2>
                    <p className="text-slate-500 text-sm">আপনার একাউন্টে লগইন করুন অথবা নতুন একাউন্ট খুলুন</p>
                  </div>
                  <Button 
                    onClick={() => openAuth('signin')}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    লগইন / সাইনআপ
                  </Button>
                  <div className="flex items-center gap-4 text-slate-300">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-bold uppercase tracking-widest">অথবা</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="rounded-2xl py-3 border-slate-200 hover:bg-slate-50">Google</Button>
                    <Button variant="outline" className="rounded-2xl py-3 border-slate-200 hover:bg-slate-50">Facebook</Button>
                  </div>
                </div>
              </Card>

              <p className="text-center text-slate-400 text-xs font-medium">
                চালিয়ে যাওয়ার মাধ্যমে আপনি আমাদের <span className="text-slate-600 underline cursor-pointer">শর্তাবলী</span> এবং <span className="text-slate-600 underline cursor-pointer">প্রাইভেসি পলিসি</span> মেনে নিচ্ছেন।
              </p>
            </div>
          </div>
        )}
      </SecurityShield>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
      />

      <ResumeToast 
        isVisible={showResumeToast}
        onClose={() => setShowResumeToast(false)}
        onResume={handleResume}
        email={savedSession?.email || ''}
      />
    </div>
  );
}

