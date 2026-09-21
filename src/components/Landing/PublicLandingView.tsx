import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowRight, 
  Search, 
  Eye, 
  Save, 
  CheckSquare, 
  Square, 
  FileText, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Check,
  Building,
  UserCheck,
  Printer,
  SlidersHorizontal,
  CheckCircle2,
  Tv,
  ScanLine,
  GraduationCap,
  ShieldCheck,
  Zap,
  Clock,
  Coins,
  Copy,
  FolderPlus,
  HelpCircle,
  PhoneCall,
  Mail,
  Award,
  BookMarked,
  LayoutGrid,
  Columns2,
  Users,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { NctbBooksModal } from './NctbBooksModal';
import { PricingModal } from './PricingModal';
import { SmartboardModal } from '../Common/SmartboardModal';
import { PdfToolsModal } from '../Common/PdfToolsModal';
import { TutorialModal } from '../Common/TutorialModal';
import { ContactHelpModal } from '../Common/ContactHelpModal';
import { PremiumBackButton } from '../Common/PremiumBackButton';
import { InteractiveLandingQuestionSelector } from './InteractiveLandingQuestionSelector';

interface PublicLandingViewProps {
  onOpenLogin: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({ 
  onOpenLogin,
  currentUser,
  onLogout
}) => {
  const navigate = useNavigate();

  // Modals state
  const [isNctbModalOpen, setIsNctbModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isSmartboardOpen, setIsSmartboardOpen] = useState(false);
  const [isPdfToolsOpen, setIsPdfToolsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Interactive Live Preview State
  const [previewColumns, setPreviewColumns] = useState<'1' | '2'>('2');
  const [previewShowAnswers, setPreviewShowAnswers] = useState<boolean>(false);
  const [previewOptionStyle, setPreviewOptionStyle] = useState<'bangla' | 'circle' | 'bracket'>('bangla');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqList = [
    {
      q: '১. আমি কি আমার স্কুল বা কোচিং সেন্টারের নাম ও লোগো প্রশ্নপত্রে যুক্ত করতে পারব?',
      a: 'হ্যাঁ, অবশ্যই! দা পাঠশালা প্রশ্নপত্র বিল্ডারে আপনি সরাসরি আপনার প্রতিষ্ঠানের নাম, পরীক্ষার শিরোনাম (যেমন: অর্ধবার্ষিক পরীক্ষা ২০২৬), সময়, পূর্ণমান এবং রোল নম্বর লেখার স্থান আপনার পছন্দমতো পরিবর্তন করতে পারবেন। এমনকি প্রিন্ট করার সময় আপনার প্রতিষ্ঠানের নিজস্ব মনোগ্রাম ও ওয়াটারমার্ক যুক্ত করা যায়।'
    },
    {
      q: '২. প্রিন্ট করা প্রশ্নপত্রে কি কোনো অনাকাঙ্ক্ষিত বিজ্ঞাপন বা দা পাঠশালার বড় লোগো থাকবে?',
      a: 'না, কখনোই নয়। শিক্ষকদের গোপনীয়তা ও প্রাতিষ্ঠানিক মর্যাদা রক্ষার্থে আমাদের প্রিন্ট-আউট সম্পূর্ণ বিজ্ঞাপনমুক্ত। আপনি যখন প্রিন্ট করবেন বা PDF ডাউনলোড করবেন, তখন এটি ঠিক একটি প্রফেশনাল প্রেসে কম্পোজ করা আসল পরীক্ষার প্রশ্নপত্রের মতোই দেখাবে।'
    },
    {
      q: '৩. গণিতের জটিল সমীকরণ, ভগ্নাংশ ও বিজ্ঞানের চিত্র কি পরিষ্কারভাবে প্রিন্ট হবে?',
      a: 'হ্যাঁ, দা পাঠশালা প্ল্যাটফর্মে আধুনিক গাণিতিক টাইপসেটিং ইঞ্জিন (LaTeX / MathJax) ব্যবহার করা হয়েছে। ফলে ভগ্নাংশ, বর্গমূল (Square root), জ্যামিতিক চিত্র, বীজগণিতীয় সমীকরণ ও রাসায়নিক সংকেত ক্রিস্প ও হাই-রেজোলিউশনে স্পষ্ট দেখতে পাওয়া যায় এবং প্রিন্টেও নিখুঁত আসে।'
    },
    {
      q: '৪. মোবাইল ফোন বা ট্যাবলেট দিয়ে কি সম্পূর্ণ প্রশ্নপত্র তৈরি ও প্রিন্ট করা সম্ভব?',
      a: 'হ্যাঁ, দা পাঠশালা শতভাগ রেসপনসিভভাবে তৈরি করা হয়েছে। আপনার হাতে থাকা যেকোনো স্মার্টফোন বা ট্যাবলেটে বসে আপনি শ্রেণি, বিষয় ও অধ্যায় সিলেক্ট করে প্রশ্নপত্র সাজাতে পারবেন এবং এক ক্লিকেই PDF হিসেবে সেভ করে প্রিন্ট করতে পারবেন।'
    },
    {
      q: '৫. ২০২৬ সালের নতুন কারিকুলাম ও নতুন পাঠ্যবইয়ের প্রশ্ন কি এতে পাওয়া যাবে?',
      a: 'হ্যাঁ! ২০২৬ সালের সর্বশেষ জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত সকল নতুন পাঠ্যবই ও আপডেটেড অধ্যায় অনুসারে আমাদের প্রশ্নব্যাংক নিয়মিত হালনাগাদ করা হচ্ছে। এছাড়াও আমাদের প্ল্যাটফর্মে সকল নতুন পাঠ্যবইয়ের অফিশিয়াল PDF সরাসরি পড়া ও ডাউনলোড করার সুবিধাও রয়েছে।'
    },
    {
      q: '৬. OMR শিট কি যেকোনো সাধারণ প্রিন্টারে প্রিন্ট করে পরীক্ষা নেওয়া যাবে?',
      a: 'হ্যাঁ, আমাদের ওএমআর জেনারেটর দিয়ে ২০, ২৫, ৫০ বা ১০০ নম্বরের স্ট্যান্ডার্ড OMR শিট তৈরি করা যায়, যা যেকোনো স্বাভাবিক লেজার বা ইনকজেট প্রিন্টারে A4 সাইজের কাগজে সহজেই প্রিন্ট করা যায়।'
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#f8fafc] text-slate-800 font-['Hind_Siliguri'] antialiased selection:bg-blue-100 selection:text-blue-900">
      
      {/* =========================================================================
          TOP NAVBAR / HEADER (Sticky at Top, Stays Fixed When Scrolling Down)
          ========================================================================= */}
      <header className="h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 sticky top-0 z-50 transition-all shadow-xs w-full">
        <div className="max-w-7xl w-full mx-auto h-full flex items-center justify-between">
          {/* Left: Brand Logo & Title */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 sm:gap-3 select-none cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-2xs">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="13" y2="17" />
                <line x1="10" y1="9" x2="11" y2="9" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                DaPathshala
              </span>
              <span className="text-[11px] text-slate-500 font-semibold leading-none hidden sm:inline">
                স্মার্ট প্রশ্নপত্র ও পরীক্ষা প্ল্যাটফর্ম
              </span>
            </div>
          </div>

          {/* Right Action Buttons: Uncluttered, responsive */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Pricing Button */}
            <button
              type="button"
              id="header-pricing-btn"
              onClick={() => setIsPricingModalOpen(true)}
              className="hidden sm:inline-flex px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95"
            >
              প্যাকেজ সমূহ
            </button>

            {/* Action Button: প্রশ্ন তৈরি করতে লগইন করুন */}
            {currentUser ? (
              <button
                type="button"
                id="header-dashboard-btn"
                onClick={() => navigate('/dashboard')}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>ড্যাশবোর্ডে যান</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                id="header-login-btn"
                onClick={onOpenLogin}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 flex items-center gap-1.5 whitespace-nowrap group"
              >
                <span>প্রশ্ন তৈরি করতে লগইন করুন</span>
                <ArrowRight size={14} className="text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN LANDING CONTENT (Flex-1 so footer stays pushed to bottom)
          ========================================================================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-6 sm:py-10 space-y-12 sm:space-y-16 overflow-x-hidden min-w-0">
        
        {/* =========================================================================
            HERO SECTION: High-Impact Typography, Badges, CTAs & Live Stats
            ========================================================================= */}
        <section className="text-center space-y-5 sm:space-y-7 pt-2 sm:pt-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-900 text-xs sm:text-sm font-bold shadow-2xs">
            <Sparkles size={15} className="text-blue-600 animate-pulse shrink-0" />
            <span className="truncate">২০২৬ নতুন শিক্ষাক্রম ও সকল শিক্ষা বোর্ড অনুমোদিত স্ট্যান্ডার্ড</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.2] max-w-4xl mx-auto break-words">
            শিক্ষা প্রতিষ্ঠান ও শিক্ষকদের জন্য স্বয়ংসম্পূর্ণ <span className="text-emerald-600">স্মার্ট প্রশ্নপত্র তৈরির</span> প্ল্যাটফর্ম
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            প্রথাগত টাইপিংয়ের ক্লান্তি ও সময় অপচয় ছাড়াই—৬ষ্ঠ থেকে ১২শ শ্রেণির সকল বিষয়ের বোর্ড স্ট্যান্ডার্ড সৃজনশীল ও বহুনির্বাচনী প্রশ্নপত্র তৈরি করুন মাত্র কয়েক ক্লিকে। আসল পরীক্ষার আদলে ২-কলাম A4 প্রিন্ট ও নিজস্ব প্রতিষ্ঠানের ব্র্যান্ডিং।
          </p>

          {/* Call-to-Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/paper-builder')}
              className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 group"
            >
              <FileText size={18} className="text-amber-400 group-hover:rotate-6 transition-transform" />
              <span>বইয়ের প্রশ্নপত্র বিল্ডার শুরু করুন</span>
              <ArrowRight size={16} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/generate')}
              className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 group"
            >
              <Zap size={18} className="text-amber-300" />
              <span>১ ক্লিকে অটো প্রশ্ন তৈরি</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNctbModalOpen(true)}
              className="px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm sm:text-base shadow-xs transition active:scale-95 flex items-center gap-2"
            >
              <BookOpen size={18} />
              <span>২০২৬ পাঠ্যবই PDF</span>
            </button>
          </div>

          {/* Live Trust & Statistics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-slate-900">১,৫০,০০০+</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-bold">সংরক্ষিত প্রশ্নভাণ্ডার</div>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-emerald-600">৯টি বোর্ড</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-bold">+ মাদ্রাসা ও কারিগরি</div>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-blue-600">৫০,০০০+</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-bold">শিক্ষক ও শিক্ষা প্রতিষ্ঠান</div>
            </div>
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-0.5">
              <div className="text-xl sm:text-2xl font-black text-amber-600">৫ মিনিটে</div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-bold">পূর্ণাঙ্গ পরীক্ষা ও OMR রেডি</div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            LIVE INTERACTIVE QUESTION SELECTOR & EXAM PAPER DEMO
            (Matches requested layout: Left = প্রশ্ন সিলেক্ট করুন, Right = স্বপ্নছোঁয়া একাডেমি)
            ========================================================================= */}
        <InteractiveLandingQuestionSelector />

        {/* =========================================================================
            YELLOW BANNER: ২০২৬ সালের NCTB পাঠ্যবই ও নতুন সিলেবাস
            ========================================================================= */}
        <section className="rounded-2xl sm:rounded-3xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/60 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 text-left w-full sm:w-auto">
            <span className="text-3xl sm:text-4xl shrink-0">📚</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  ২০২৬ সালের সর্বশেষ NCTB পাঠ্যবই ও নতুন কারিকুলাম
                </h2>
                <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">
                  অফিসিয়াল
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 leading-relaxed">
                ১ম থেকে ১০ম শ্রেণির সকল বিষয়ের অফিশিয়াল পাঠ্যবইয়ের PDF ও অধ্যায়ভিত্তিক অনুশীলনীর প্রশ্ন এক জায়গায়।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNctbModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center justify-center gap-2 group whitespace-nowrap active:scale-95 shrink-0"
          >
            <span>বইয়ের PDF লিস্ট দেখুন</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

        {/* =========================================================================
            FEATURE CARDS GRID: ৬টি প্রধান পাওয়ার টুলসের বিস্তারিত বিবরণ ও অ্যাকশন
            ========================================================================= */}
        <section id="features" className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              প্রধান ফিচারসমূহ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              দা পাঠশালা প্ল্যাটফর্মের পূর্ণাঙ্গ টুল স্যুইট
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              প্রশ্ন তৈরি, প্রশ্নব্যাংক, ওএমআর মূল্যায়ন থেকে শুরু করে ক্লাসরুম স্মার্টবোর্ড—সবকিছু একই সফটওয়্যারে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Tool 1: ১ ক্লিকে প্রশ্ন তৈরি */}
            <div 
              onClick={() => navigate('/generate')}
              className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/70 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    ১ ক্লিকে প্রশ্নপত্র তৈরি (AI Generator)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    শ্রেণি, বিষয়, অধ্যায় ও পূর্ণমান সিলেক্ট করুন। অ্যালগরিদম স্বয়ংক্রিয়ভাবে সহজ, মধ্যম ও কঠিন প্রশ্নের বোর্ড অনুপাত রক্ষা করে চোখের পলকে প্রশ্নপত্র প্রস্তুত করে দেবে।
                  </p>
                </div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>সহজ, মধ্যম ও কঠিন প্রশ্নের নিখুঁত ব্যালেন্স</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>MCQ, জ্ঞানমূলক ও অনুধাবনমূলক প্রশ্ন সাপোর্ট</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-2 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                <span>প্রশ্ন তৈরি শুরু করুন →</span>
              </div>
            </div>

            {/* Tool 2: বইয়ের প্রশ্নপত্র বিল্ডার (Custom Paper Builder) */}
            <div 
              onClick={() => navigate('/paper-builder')}
              className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-slate-900 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                জনপ্রিয়
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText size={24} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    বইয়ের প্রশ্নপত্র বিল্ডার (Custom Builder)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    আসল পাঠ্যবইয়ের অধ্যায় ও অনুশীলনীভিত্তিক প্রতিটি প্রশ্ন লাইভ শিটে ক্লিক করে যোগ করুন। ১ বা ২ কলাম লেআউট, অপশন ফরম্যাট (ক/খ/গ/ঘ), উত্তরমালা ও প্রতিষ্ঠানের শিরোনাম সহ পূর্ণাঙ্গ প্রিন্ট।
                  </p>
                </div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>২-কলাম বা ১-কলাম আসল পরীক্ষার লেআউট</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    <span>অপশন বিন্যাস ও কাস্টম উত্তরমালা অন/অফ</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-2 flex items-center text-xs font-bold text-slate-900 group-hover:text-emerald-700 group-hover:translate-x-1 transition-transform">
                <span>কাস্টম বিল্ডার ওপেন করুন →</span>
              </div>
            </div>

            {/* Tool 3: সমৃদ্ধ প্রশ্নব্যাংক */}
            <div 
              onClick={() => navigate('/question-bank')}
              className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/70 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookMarked size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    সমৃদ্ধ প্রশ্নব্যাংক (Board & Cadet Bank)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    বিগত ২০ বছরের ৯টি সাধারণ শিক্ষা বোর্ড, ক্যাডেট কলেজ ও শীর্ষ মডেল স্কুলের প্রশ্নাবলি। গাণিতিক সূত্র, চিত্র ও ব্যাখ্যামূলক সমাধান সমৃদ্ধ বিশাল ভাণ্ডার।
                  </p>
                </div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-blue-600 shrink-0" />
                    <span>রিপিটেড বোর্ড প্রশ্ন ও টেস্ট পেপার ফিল্টার</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-blue-600 shrink-0" />
                    <span>৬ষ্ঠ থেকে ১২শ শ্রেণির সকল মূল বিষয়</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-2 flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
                <span>প্রশ্নব্যাংক ব্রাউজ করুন →</span>
              </div>
            </div>

            {/* Tool 4: OMR শিট মেকার ও অটো মূল্যায়ন */}
            <div 
              onClick={() => navigate('/exams')}
              className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-rose-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/70 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ScanLine size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    OMR শিট মেকার ও স্বয়ংক্রিয় মূল্যায়ন
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    যেকোনো পরীক্ষার জন্য ২০, ২৫, ৫০ বা ১০০ নম্বরের নিখুঁত OMR শিট জেনারেট করুন এবং সাধারণ প্রিন্টারে প্রিন্ট করে পরীক্ষা নিন। সাথে রয়েছে দ্রুত রেজাল্ট প্রসেসিং ব্যবস্থা।
                  </p>
                </div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-rose-600 shrink-0" />
                    <span>যেকোনো প্রিন্টারে A4 সাইজে প্রিন্টযোগ্য OMR</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-rose-600 shrink-0" />
                    <span>কাস্টম রোল নম্বর ও বিষয় কোড বাবল</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-2 flex items-center text-xs font-bold text-rose-700 group-hover:translate-x-1 transition-transform">
                <span>OMR সিস্টেম দেখুন →</span>
              </div>
            </div>

            {/* Tool 5: ডিজিটাল ক্লাসরুম স্মার্টবোর্ড */}
            <div 
              onClick={() => setIsSmartboardOpen(true)}
              className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-purple-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/70 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Tv size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    ডিজিটাল স্মার্টবোর্ড (Classroom Smartboard)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    ক্লাসে প্রজেক্টর বা স্মার্ট টিভিতে প্রশ্ন প্রদর্শন করে সরাসরি পাঠদান করুন। বড় ফন্টে প্রশ্ন, চিত্র ও অংকের ধাপে ধাপে সমাধান প্রদর্শনের আধুনিক ক্লাসরুম সুবিধা।
                  </p>
                </div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-purple-600 shrink-0" />
                    <span>ফুলস্ক্রিন প্রজেকশন মোড ও পেন টুল সাপোর্ট</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-purple-600 shrink-0" />
                    <span>সরাসরি প্রশ্ন আলোচনা ও উত্তর বিশ্লেষণ</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-2 flex items-center text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
                <span>স্মার্টবোর্ড ওপেন করুন →</span>
              </div>
            </div>

            {/* Tool 6: সিকিউর PDF ও ডাবল কলাম প্রিন্ট */}
            <div 
              onClick={() => setIsPdfToolsOpen(true)}
              className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Printer size={24} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    সিকিউর PDF ও ডাবল কলাম প্রিন্ট
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    বিদ্যালয়ের নিজস্ব মনোগ্রাম ও ওয়াটারমার্ক যুক্ত করে প্রফেশনাল প্রেসে ছাপানোর মতো ২-কলাম A4 প্রিন্ট করুন। পাসওয়ার্ড সুরক্ষা ও বুকলেট আকারে তৈরির সুবিধা।
                  </p>
                </div>
                <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-amber-600 shrink-0" />
                    <span>১০০% বিজ্ঞাপনমুক্ত ক্লিন প্রিন্ট আউট</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-amber-600 shrink-0" />
                    <span>ওয়াটারমার্ক ও সিকিউর বুকলেট রূপান্তর</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 mt-2 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
                <span>PDF টুলস দেখুন →</span>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            LIVE QUESTION PAPER SHOWCASE (100% Full-Width, NO SIDEBAR, Interactive)
            ========================================================================= */}
        <section id="paper-builder-info" className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              আসল পরীক্ষার প্রশ্নপত্র কেমন হবে?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ফুল-উইডথ লাইভ প্রশ্নপত্র প্রিভিউ ও কাস্টমাইজেশন
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
              কোনো সাইডবার ছাড়াই পুরো স্ক্রিনে দেখুন আসল প্রশ্নপত্রের রূপরেখা। আপনার প্রয়োজনমতো ১-কলাম বা ২-কলাম নির্বাচন করুন।
            </p>
          </div>

          {/* Interactive Paper Container */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden min-w-0">
            
            {/* Top Interactive Controls Toolbar */}
            <div className="bg-slate-900 text-white p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-amber-400" />
                <span className="text-xs sm:text-sm font-bold">লাইভ প্রশ্নপত্র নমুনা (বার্ষিক পরীক্ষা ২০২৬)</span>
              </div>

              {/* Toolbar Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* 1 vs 2 Columns toggle */}
                <div className="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewColumns('1')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                      previewColumns === '1' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>১ কলাম</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewColumns('2')}
                    className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                      previewColumns === '2' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Columns2 size={13} />
                    <span>২ কলাম</span>
                  </button>
                </div>

                {/* Option Style Selector */}
                <button
                  type="button"
                  onClick={() => {
                    if (previewOptionStyle === 'bangla') setPreviewOptionStyle('circle');
                    else if (previewOptionStyle === 'circle') setPreviewOptionStyle('bracket');
                    else setPreviewOptionStyle('bangla');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold transition flex items-center gap-1"
                >
                  <SlidersHorizontal size={13} />
                  <span>অপশন: {previewOptionStyle === 'bangla' ? '(ক)(খ)' : previewOptionStyle === 'circle' ? 'বৃত্ত' : '১,২'}</span>
                </button>

                {/* Answers Toggle */}
                <button
                  type="button"
                  onClick={() => setPreviewShowAnswers(!previewShowAnswers)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                    previewShowAnswers ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  <Eye size={13} />
                  <span>{previewShowAnswers ? 'উত্তর অন' : 'উত্তরমালা'}</span>
                </button>

                {/* Open Full Builder */}
                <button
                  type="button"
                  onClick={() => navigate('/paper-builder')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition flex items-center gap-1 shadow-2xs"
                >
                  <span>সম্পূর্ণ বিল্ডারে যান →</span>
                </button>
              </div>
            </div>

            {/* Printable Paper Preview Body */}
            <div className="p-4 sm:p-8 md:p-10 space-y-6 bg-white min-w-0">
              
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1.5">
                <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  দা পাঠশালা মডেল হাই স্কুল ও কলেজ
                </h3>
                <div className="text-sm sm:text-base font-bold text-slate-700">
                  বার্ষিক মূল্যায়ন পরীক্ষা - ২০২৬
                </div>
                <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-bold text-slate-800 pt-2 px-2 border-t border-slate-100">
                  <div>শ্রেণি: <span className="font-semibold">১০ম শ্রেণি</span></div>
                  <div>বিষয়: <span className="font-semibold">সাধারণ গণিত ও বিজ্ঞান</span></div>
                  <div>সময়: <span className="font-semibold">২ ঘণ্টা ৩০ মিনিট</span></div>
                  <div>পূর্ণমান: <span className="font-semibold">১০০</span></div>
                </div>

                {/* Student Info Lines */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-dashed border-slate-200">
                  <div className="text-left">শিক্ষার্থীর নাম: ....................................................</div>
                  <div className="text-left sm:text-center">রোল নম্বর: ...................</div>
                  <div className="text-left sm:text-right">শাখা: ................... তারিখ: ...................</div>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-500 italic pt-1">
                  [ দ্রষ্টব্য: ডানপাশের সংখ্যা প্রশ্নের পূর্ণমান জ্ঞাপক। সকল প্রশ্নের উত্তর দেওয়া আবশ্যক। ]
                </p>
              </div>

              {/* Sample Questions in Columns */}
              <div className={previewColumns === '2' ? 'columns-1 md:columns-2 gap-8 [column-rule:1px_dashed_#cbd5e1]' : 'space-y-4'}>
                
                {/* Question 1 */}
                <div className="break-inside-avoid mb-5 pb-4 border-b border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      ১. বাস্তব সংখ্যার ক্ষেত্রে a ও b দুটি বাস্তব সংখ্যা হলে (a + b)² এর সঠিক সম্প্রসারিত রূপ কোনটি?
                    </span>
                    <span className="text-xs font-bold text-slate-500 shrink-0">[১]</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(ক)' : previewOptionStyle === 'circle' ? '①' : '১.'} a² + b²
                    </div>
                    <div className={`p-1.5 rounded border ${previewShowAnswers ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800' : 'bg-slate-50 border-slate-200/60'}`}>
                      {previewOptionStyle === 'bangla' ? '(খ)' : previewOptionStyle === 'circle' ? '②' : '২.'} a² + 2ab + b² {previewShowAnswers && '✓'}
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(গ)' : previewOptionStyle === 'circle' ? '③' : '৩.'} a² - 2ab + b²
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(ঘ)' : previewOptionStyle === 'circle' ? '④' : '৪.'} a² + 2ab - b²
                    </div>
                  </div>
                </div>

                {/* Question 2 */}
                <div className="break-inside-avoid mb-5 pb-4 border-b border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      ২. কোনো ত্রিভুজের কোণ তিনটির অনুপাত ২ : ৩ : ৫ হলে, ত্রিভুজটির বৃহত্তম কোণের মান কত ডিগ্রি?
                    </span>
                    <span className="text-xs font-bold text-slate-500 shrink-0">[১]</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(ক)' : previewOptionStyle === 'circle' ? '①' : '১.'} ৩৬°
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(খ)' : previewOptionStyle === 'circle' ? '②' : '২.'} ৫৪°
                    </div>
                    <div className={`p-1.5 rounded border ${previewShowAnswers ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800' : 'bg-slate-50 border-slate-200/60'}`}>
                      {previewOptionStyle === 'bangla' ? '(গ)' : previewOptionStyle === 'circle' ? '③' : '৩.'} ৯০° {previewShowAnswers && '✓'}
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(ঘ)' : previewOptionStyle === 'circle' ? '④' : '৪.'} ১০০°
                    </div>
                  </div>
                </div>

                {/* Question 3 */}
                <div className="break-inside-avoid mb-5 pb-4 border-b border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      ৩. সমবেগে চলমান একটি গাড়ির ত্বরণ কত হবে?
                    </span>
                    <span className="text-xs font-bold text-slate-500 shrink-0">[১]</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                    <div className={`p-1.5 rounded border ${previewShowAnswers ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800' : 'bg-slate-50 border-slate-200/60'}`}>
                      {previewOptionStyle === 'bangla' ? '(ক)' : previewOptionStyle === 'circle' ? '①' : '১.'} শূন্য (0) {previewShowAnswers && '✓'}
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(খ)' : previewOptionStyle === 'circle' ? '②' : '২.'} ৯.৮ মি/সে²
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(গ)' : previewOptionStyle === 'circle' ? '③' : '৩.'} অসীম
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(ঘ)' : previewOptionStyle === 'circle' ? '④' : '৪.'} ধ্রুবক ধনাত্মক
                    </div>
                  </div>
                </div>

                {/* Question 4 */}
                <div className="break-inside-avoid mb-5 pb-4 border-b border-slate-100 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      ৪. সালোকসংশ্লেষণ প্রক্রিয়ায় আলোক শক্তি কোন শক্তিতে রূপান্তরিত হয়?
                    </span>
                    <span className="text-xs font-bold text-slate-500 shrink-0">[১]</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(ক)' : previewOptionStyle === 'circle' ? '①' : '১.'} তাপ শক্তি
                    </div>
                    <div className={`p-1.5 rounded border ${previewShowAnswers ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800' : 'bg-slate-50 border-slate-200/60'}`}>
                      {previewOptionStyle === 'bangla' ? '(খ)' : previewOptionStyle === 'circle' ? '②' : '২.'} রাসায়নিক শক্তি {previewShowAnswers && '✓'}
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(গ)' : previewOptionStyle === 'circle' ? '③' : '৩.'} গতি শক্তি
                    </div>
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200/60">
                      {previewOptionStyle === 'bangla' ? '(ঘ)' : previewOptionStyle === 'circle' ? '④' : '৪.'} বৈদ্যুতিক শক্তি
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom CTA for Builder */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    এটি শুধুমাত্র একটি সংক্ষিপ্ত নমুনা প্রিভিউ
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500">
                    আমাদের প্রশ্ন ব্যাংক থেকে সরাসরি আপনার পছন্দের যে কোনো প্রশ্ন যোগ করে সম্পূর্ণ ১০০ নম্বরের প্রশ্নপত্র সাজান।
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/paper-builder')}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs whitespace-nowrap active:scale-95"
                >
                  প্রশ্নপত্র বিল্ডারে প্রবেশ করুন →
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            HOW IT WORKS: ৩টি সহজ ধাপে প্রশ্নপত্র তৈরির উপায়
            ========================================================================= */}
        <section id="how-it-works" className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              সহজ প্রক্রিয়া
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              মাত্র ৩টি সহজ ধাপে প্রশ্নপত্র তৈরি
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              কোনো জটিল প্রযুক্তিগত জ্ঞান ছাড়াই যেকোনো সাধারণ কম্পিউটার বা মোবাইল দিয়ে প্রশ্নপত্র তৈরি করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-lg">
                ১
              </div>
              <h3 className="text-base font-bold text-slate-900">
                শ্রেণি ও বিষয় নির্বাচন করুন
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ১ম থেকে ১২শ শ্রেণির বাংলা, ইংরেজি, সাধারণ গণিত, বিজ্ঞান, উচ্চতর গণিত, পদার্থ, রসায়ন ইত্যাদির যে কোনো বিষয় বেছে নিন।
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black text-lg">
                ২
              </div>
              <h3 className="text-base font-bold text-slate-900">
                অধ্যায় ও প্রশ্ন নির্বাচন করুন
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                পাঠ্যবইয়ের অধ্যায় অনুযায়ী ক্লিক করে প্রশ্ন নির্বাচন করুন অথবা ১-ক্লিকে স্বয়ংক্রিয়ভাবে পূর্ণাঙ্গ প্রশ্নপত্র জেনারেট করুন।
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3 relative shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-black text-lg">
                ৩
              </div>
              <h3 className="text-base font-bold text-slate-900">
                ২-কলামে প্রিন্ট বা PDF ডাউনলোড
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                প্রতিষ্ঠানের নাম ও সময় ঠিক করে এক ক্লিকে A4 সাইজের ২-কলাম ডাবল ফরম্যাটে প্রফেশনাল প্রেসে ছাপানোর মতো প্রিন্ট করুন।
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================================
            TARGET AUDIENCE: কাদের জন্য উপযোগী?
            ========================================================================= */}
        <section id="target-users" className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              ব্যবহারকারী
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              কাদের জন্য দা পাঠশালা তৈরি?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              বাংলাদেশের প্রতিটি শিক্ষাপ্রতিষ্ঠান ও সম্মানিত শিক্ষকের নিত্যদিনের পরীক্ষা ব্যবস্থাপনায় বিশ্বস্ত সঙ্গী।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building size={20} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">স্কুল ও কলেজ শিক্ষকবৃন্দ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                মাসিক টিউটোরিয়াল, অর্ধবার্ষিক ও বার্ষিক পরীক্ষার বোর্ড স্ট্যান্ডার্ড প্রশ্নপত্র টাইপিং ছাড়া কয়েক মিনিটে তৈরি করুন।
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">কোচিং সেন্টার ও একাডেমি</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                প্রতিদিনের ডেইলি টেস্ট, উইকলি ও মডেল টেস্টের প্রশ্নপত্র ও OMR শিট দ্রুত তৈরি করে শিক্ষার্থীদের এগিয়ে রাখুন।
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award size={20} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">মাদ্রাসা ও কারিগরি প্রতিষ্ঠান</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                দাখিল, আলিম ও কারিগরি বোর্ডের বিশেষ সিলেবাস ও পাঠ্যপুস্তকের প্রশ্ন তৈরি ও পরিচালনা করার সুবিধা।
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 text-center">
              <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <h3 className="font-bold text-sm text-slate-900">প্রাইভেট টিউটর ও অভিভাবক</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                নিজের সন্তান বা ব্যাচের শিক্ষার্থীদের নিয়মিত অনুশীলনের জন্য চ্যাপ্টারভিত্তিক প্রশ্নপত্র তৈরি ও মূল্যায়ন।
              </p>
            </div>

          </div>
        </section>

        {/* =========================================================================
            PRICING PACKAGES OVERVIEW
            ========================================================================= */}
        <section id="pricing" className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              স্বচ্ছ মূল্য তালিকা
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              আপনার প্রয়োজন অনুযায়ী সহজ প্যাকেজ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              কোনো গোপন চার্জ নেই। সম্পূর্ণ নিশ্চিন্তে যাচাই করে শুরু করতে পারেন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Free Trial */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">যাচাইয়ের জন্য</div>
                <div className="text-2xl font-black text-slate-900">ফ্রি ট্রায়াল</div>
                <div className="text-3xl font-black text-emerald-600">৳ ০ <span className="text-xs font-normal text-slate-400">/ আজীবন</span></div>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>১ ক্লিকে অটো প্রশ্ন জেনারেটর</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>পাঠ্যবইয়ের প্রশ্নপত্র বিল্ডার এক্সেস</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>২০২৬ NCTB পাঠ্যবইয়ের ফ্রি PDF</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => navigate('/paper-builder')}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition active:scale-95"
              >
                ফ্রি শুরু করুন
              </button>
            </div>

            {/* Teacher Special */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border-2 border-emerald-500 shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                জনপ্রিয়
              </div>
              <div className="space-y-4">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">শিক্ষকদের জন্য</div>
                <div className="text-2xl font-black text-white">শিক্ষক স্পেশাল প্যাক</div>
                <div className="text-3xl font-black text-amber-400">৳ ৯৯৯ <span className="text-xs font-normal text-slate-400">/ ৬ মাস</span></div>
                <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>আনলিমিটেড প্রশ্নপত্র তৈরি ও প্রিন্ট</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>নিজস্ব প্রতিষ্ঠানের নাম ও লোগো যুক্ত করার সুবিধা</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>সম্পূর্ণ OMR শিট জেনারেটর ও মূল্যায়ন</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>প্রিমিয়াম ক্লাসরুম স্মার্টবোর্ড এক্সেস</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition shadow-md active:scale-95"
              >
                প্যাকেজটি গ্রহণ করুন
              </button>
            </div>

            {/* Institution Unlimited */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">স্কুল ও কোচিং</div>
                <div className="text-2xl font-black text-slate-900">প্রাতিষ্ঠানিক প্যাক</div>
                <div className="text-3xl font-black text-blue-600">৳ ১,৮৯৯ <span className="text-xs font-normal text-slate-400">/ ১ বছর</span></div>
                <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-blue-600 shrink-0" />
                    <span>একাধিক শিক্ষক ও অ্যাকাউন্ট ব্যবস্থাপনা</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-blue-600 shrink-0" />
                    <span>ফুল প্রাতিষ্ঠানিক ব্র্যান্ডিং ও ওয়াটারমার্ক</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-blue-600 shrink-0" />
                    <span>শিক্ষার্থী ডাটাবেজ ও রেজাল্ট শিট প্রসেসিং</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-blue-600 shrink-0" />
                    <span>২৪/৭ ডেডিকেটেড ভিআইপি হেল্পলাইন সাপোর্ট</span>
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-95"
              >
                প্যাকেজটি গ্রহণ করুন
              </button>
            </div>

          </div>
        </section>

        {/* =========================================================================
            FAQ ACCORDION: সচরাচর জিজ্ঞাসিত প্রশ্নাবলী
            ========================================================================= */}
        <section id="faq" className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              জিজ্ঞাসা ও সমাধান
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              আপনার মনের সাধারণ প্রশ্নগুলোর দ্রুত ও স্পষ্ট উত্তর।
            </p>
          </div>

          <div className="space-y-3">
            {faqList.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                  >
                    <span>{item.q}</span>
                    <span className="p-1 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            FINAL CALL TO ACTION BANNER: বড় আকর্ষণীয় ব্যানার
            ========================================================================= */}
        <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 md:p-12 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-2xl mx-auto relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              আজই শুরু করুন আপনার প্রশ্নপত্র তৈরিতে ডিজিটাল রূপান্তর
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              হাজারো শিক্ষক ও শিক্ষা প্রতিষ্ঠানের আস্থা—দা পাঠশালা। কোনো রেজিস্ট্রেশন ঝামেলা ছাড়াই এখনই বিনামূল্যে ট্রায়াল দিয়ে দেখুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 relative z-10 pt-2">
            <button
              type="button"
              onClick={() => navigate('/paper-builder')}
              className="px-6 sm:px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm sm:text-base shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <FileText size={18} />
              <span>বিনামূল্যে প্রশ্নপত্র তৈরি শুরু করুন</span>
            </button>

            <button
              type="button"
              onClick={() => setIsContactOpen(true)}
              className="px-5 sm:px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base transition active:scale-95 border border-white/20 flex items-center gap-2"
            >
              <PhoneCall size={16} />
              <span>হেল্পলাইন ও সহায়তা</span>
            </button>
          </div>
        </section>

      </main>

      {/* =========================================================================
          FOOTER (Pinned to bottom of viewport via mt-auto, goes down on scroll)
          ========================================================================= */}
      <footer className="mt-auto w-full bg-white border-t border-slate-200/90 py-8 px-4 sm:px-8 text-slate-600 font-['Hind_Siliguri']">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-100 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                D
              </div>
              <span className="font-bold text-sm text-slate-900">DaPathshala</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              বাংলাদেশের শিক্ষক, বিদ্যালয় ও কোচিং সেন্টারের জন্য স্মার্ট প্রশ্ন প্রণয়ন ও আধুনিক পরীক্ষা প্ল্যাটফর্ম।
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-slate-900">টুলস ও ফিচারস</div>
            <div className="space-y-1 text-slate-500">
              <div><a href="#features" className="hover:text-slate-900">১ ক্লিকে প্রশ্ন তৈরি</a></div>
              <div><a href="#paper-builder-info" className="hover:text-slate-900">বইয়ের প্রশ্নপত্র বিল্ডার</a></div>
              <div><a href="#features" className="hover:text-slate-900">OMR মূল্যায়ন শিট</a></div>
              <div><a href="#features" className="hover:text-slate-900">স্মার্টবোর্ড ক্লাসরুম</a></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-slate-900">শিক্ষা বোর্ড ও কারিকুলাম</div>
            <div className="space-y-1 text-slate-500">
              <div><button onClick={() => setIsNctbModalOpen(true)} className="hover:text-slate-900">২০২৬ NCTB পাঠ্যবই</button></div>
              <div><span>৯টি সাধারণ শিক্ষা বোর্ড প্রশ্ন</span></div>
              <div><span>মাদ্রাসা ও কারিগরি শিক্ষা বোর্ড</span></div>
              <div><span>ক্যাডেট কলেজ মডেল প্রশ্ন</span></div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="font-bold text-slate-900">সহায়তা ও যোগাযোগ</div>
            <div className="space-y-1 text-slate-500">
              <div><span>হেল্পলাইন: +৮৮০১৭১২-৩৪৫৬৭৮</span></div>
              <div><span>ইমেইল: support@dapathshala.com</span></div>
              <div><span>সকাল ৯টা - রাত ১০টা</span></div>
              <div><button onClick={() => setIsContactOpen(true)} className="text-emerald-600 font-bold hover:underline">মেসেজ পাঠান</button></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 text-center sm:text-left">
          <div>© ২০২৬ DaPathshala.com - সর্বস্বত্ব সংরক্ষিত।</div>
          <div className="flex items-center gap-4">
            <span>গোপনীয়তা নীতি</span>
            <span>ব্যবহারের শর্তাবলী</span>
            <span>নিরাপত্তা গাইড</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      <NctbBooksModal
        isOpen={isNctbModalOpen}
        onClose={() => setIsNctbModalOpen(false)}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSelectPlan={onOpenLogin}
      />

      <SmartboardModal
        isOpen={isSmartboardOpen}
        onClose={() => setIsSmartboardOpen(false)}
      />

      <PdfToolsModal
        type={isPdfToolsOpen ? 'protect' : null}
        onClose={() => setIsPdfToolsOpen(false)}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <ContactHelpModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

    </div>
  );
};

export default PublicLandingView;
