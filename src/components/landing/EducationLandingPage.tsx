import React, { useState } from 'react';
import { 
  Search, ChevronDown, Sparkles, BookOpen, GraduationCap, 
  Shield, CheckCircle2, ArrowRight, Play, Award, Clock, 
  Brain, FileText, Zap, Key, Layers, Grid, HelpCircle, 
  Smile, UserCheck, Star, X, Check
} from 'lucide-react';
import { AssignedTest } from '../../types';
import { getStoredTests } from '../../lib/storage';

interface EducationLandingPageProps {
  onGoToParentDashboard: () => void;
  onGoToStudentDashboard: () => void;
  onOpenExam: (test: AssignedTest) => void;
  onCreateCustomExam?: () => void;
}

export const EducationLandingPage: React.FC<EducationLandingPageProps> = ({
  onGoToParentDashboard,
  onGoToStudentDashboard,
  onOpenExam,
  onCreateCustomExam
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>('buildWorksheet');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickPin, setQuickPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active interactive generator demo
  const [selectedGenerator, setSelectedGenerator] = useState<string>('addition');
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError('');
    const trimmed = quickPin.trim();
    if (!trimmed) {
      setPinError('দয়া করে ৬-সংখ্যার পিন লিখুন');
      return;
    }
    const tests = getStoredTests();
    const matched = tests.find(t => t.pin === trimmed || t.id === trimmed);
    if (matched) {
      setShowPinModal(false);
      onOpenExam(matched);
    } else {
      setPinError('এই পিন (PIN) এর কোন পরীক্ষা পাওয়া যায়নি। সঠিক পিন দিন।');
    }
  };

  const handleGenerateSample = () => {
    setGeneratedSuccess(true);
    setTimeout(() => setGeneratedSuccess(false), 2500);
  };

  const toBn = (num: number | string) => {
    return num.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
  };

  // Worksheet generator items matching Education.com screenshot dropdown
  const worksheetGenerators = [
    { id: 'word-scramble', name: 'Word Scramble (শব্দ মেলানো)', desc: 'এলোমেলো বর্ণ সাজিয়ে সঠিক শব্দ গঠন', icon: '🔤' },
    { id: 'word-search', name: 'Word Search (শব্দ সন্ধান)', desc: 'গ্রিড থেকে বিষয়ভিত্তিক শব্দ খোঁজা', icon: '🔍' },
    { id: 'crossword', name: 'Crossword Puzzle (শব্দছক)', desc: 'ক্লু দেখে শব্দ দিয়ে ছক পূরণ', icon: '🧩' },
    { id: 'sudoku', name: 'Sudoku Generator (সুডোকু)', desc: 'যুক্তিবোধ ও সংখ্যা সাজানোর বুদ্ধির খেলা', icon: '🔢' },
    { id: 'addition', name: 'Addition Worksheet Generator (যোগের শিট)', desc: '১ থেকে ৩ অঙ্কের যোগ অনুশীলন', icon: '➕' },
    { id: 'subtraction', name: 'Subtraction Worksheet Generator (বিয়োগের শিট)', desc: 'ধার নেওয়া ও সাধারণ বিয়োগ অঙ্ক', icon: '➖' },
    { id: 'multiplication', name: 'Multiplication Worksheet Generator (গুণের শিট)', desc: 'নামতা ও গুণন দক্ষতা বৃদ্ধি', icon: '✖️' },
    { id: 'division', name: 'Division Worksheet Generator (ভাগের শিট)', desc: 'ভাগশেষ ও সহজ ভাগ প্রক্রিয়া', icon: '➗' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans w-full max-w-full overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">
      
      {/* ======================================================== */}
      {/* 1. TOP HEADER BAR (Education.com Style)                  */}
      {/* ======================================================== */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            
            {/* Logo: Cyan/Teal icon mark + clean wordmark */}
            <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm shadow-teal-200">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-teal-700">দাপাঠশালা</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-teal-50 text-teal-700 border border-teal-200">
                    .com
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wide hidden sm:block">
                  একাডেমিক লার্নিং ও পরীক্ষা হাব
                </span>
              </div>
            </div>

            {/* Centered Pill Search Bar (Education.com style) */}
            <div className="flex-1 max-w-xl mx-2 sm:mx-6 hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='অনুসন্ধান করুন "গণিত ওয়ার্কশিট, বাংলা মডেল টেস্ট, ইংরেজি গ্রামার..."'
                  className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden"
                />
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowPinModal(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>পিন এন্ট্রি</span>
              </button>

              <button
                type="button"
                onClick={onGoToStudentDashboard}
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-teal-700 px-2 sm:px-3 py-2 transition-colors"
              >
                শিক্ষার্থী লগইন
              </button>

              <button
                type="button"
                onClick={onGoToParentDashboard}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-200 transition-all active:scale-95 whitespace-nowrap flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>অভিভাবক হাব</span>
              </button>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SUB-NAVIGATION MENU BAR WITH DROPDOWNS                */}
        {/* ======================================================== */}
        <div className="bg-white border-t border-slate-100 text-xs sm:text-sm font-semibold text-slate-700 relative">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 sm:gap-6 overflow-x-auto no-scrollbar py-2">
              
              {/* Subjects */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'subjects' ? null : 'subjects')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-teal-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  <span>বিষয়সমূহ</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                </button>
                {activeDropdown === 'subjects' && (
                  <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50">
                    <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                      জাতীয় পাঠ্যক্রমের বিষয়
                    </div>
                    {['বাংলা প্রথম ও দ্বিতীয় পত্র', 'গণিত ও উচ্চতর গণিত', 'ইংরেজি ও গ্রামার', 'সাধারণ বিজ্ঞান ও পদার্থ/রসায়ন', 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', 'বাংলাদেশ ও বিশ্বপরিচয়'].map((item) => (
                      <button
                        key={item}
                        onClick={() => { setActiveDropdown(null); onGoToStudentDashboard(); }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grades */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'grades' ? null : 'grades')}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-teal-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  <span>শ্রেণি / গ্রেড</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
                </button>
                {activeDropdown === 'grades' && (
                  <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50 grid grid-cols-2 gap-1">
                    {['১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি (প্রাথমিক)', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি (জেএসসি)', '৯ম-১০ম (এসএসসি)', 'একাদশ-দ্বাদশ (এইচএসসি)'].map((grade) => (
                      <button
                        key={grade}
                        onClick={() => { setActiveDropdown(null); onGoToParentDashboard(); }}
                        className="text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition-colors"
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Worksheets */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('worksheet-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-teal-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <span>ওয়ার্কশিট ও শিট</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Games & Quizzes */}
              <button
                type="button"
                onClick={onGoToStudentDashboard}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-teal-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <span>কুইজ ও গেমস</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Build a Worksheet (Active Teal Underline like in Education.com screenshot) */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'buildWorksheet' ? null : 'buildWorksheet')}
                  className="flex items-center gap-1 px-3 py-1.5 text-teal-800 font-bold border-b-2 border-teal-500 whitespace-nowrap relative"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Build a Worksheet (ওয়ার্কশিট জেনারেটর)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-teal-600" />
                </button>

                {/* Dropdown Menu matching Education.com screenshot exactly */}
                {activeDropdown === 'buildWorksheet' && (
                  <div className="absolute left-0 top-full mt-1 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 mb-1">
                      <span className="text-xs font-bold text-slate-900 block">কাস্টম শিট ও এক্সাম জেনারেটর</span>
                      <span className="text-[11px] text-slate-400">এক ক্লিকে প্রিন্ট ও অনলাইন প্র্যাকটিস শিট তৈরি করুন</span>
                    </div>

                    <div className="space-y-0.5">
                      {worksheetGenerators.map((gen) => (
                        <button
                          key={gen.id}
                          onClick={() => {
                            setSelectedGenerator(gen.id);
                            const el = document.getElementById('worksheet-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                            setActiveDropdown(null);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-teal-50/80 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{gen.icon}</span>
                            <div>
                              <span className="text-xs font-bold text-slate-800 group-hover:text-teal-800 block">
                                {gen.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {gen.desc}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                        onClick={() => {
                          if (onCreateCustomExam) onCreateCustomExam();
                          else onGoToParentDashboard();
                        }}
                      >
                        <span>সকল জেনারেটর ও টেস্ট দেখুন &rarr;</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* More Resources */}
              <button
                type="button"
                onClick={onGoToParentDashboard}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:text-teal-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <span>অভিভাবক ট্র্যাকিং</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Roly Recommends (Education.com cute mascot tab) */}
              <button
                type="button"
                onClick={onGoToStudentDashboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-bold whitespace-nowrap ml-auto"
              >
                <span>🐱 পাঠশালা স্পেশাল</span>
              </button>

            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. NOTIFICATION / PIN BAR (Education.com "Did you receive a login code?" style) */}
        {/* ======================================================== */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 py-2.5 text-center text-xs sm:text-sm text-amber-900 font-medium px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center flex-wrap gap-2">
            <span>পরীক্ষার পিন কোড (PIN) কিংবা হোমওয়ার্ক কোড পেয়েছেন?</span>
            <button
              type="button"
              onClick={() => setShowPinModal(true)}
              className="font-bold underline text-teal-800 hover:text-teal-950 inline-flex items-center gap-1"
            >
              <span>সরাসরি পরীক্ষায় প্রবেশ করতে এখানে ক্লিক করুন &rarr;</span>
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. HERO SECTION (Education.com Style with Autumn Mascot) */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-linear-to-b from-amber-50/50 via-teal-50/30 to-white py-8 sm:py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Headline, Description & Calls to Action */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 text-teal-900 text-xs font-bold border border-teal-200">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                <span>বাংলাদেশের সর্বাধুনিক স্কুল লার্নিং পোর্টাল</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
                পড়াশোনা হোক আনন্দময় ও অর্থপূর্ণ
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                ৪০,০০০+ বিষয়ভিত্তিক ওয়ার্কশিট, কাস্টম পরীক্ষা জেনারেটর এবং অভিভাবকদের জন্য নিখুঁত একাডেমি ট্র্যাকিং—যা সন্তানের মৌলিক মেধা ও আত্মবিশ্বাস গড়ে তোলে।
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onGoToParentDashboard}
                  className="px-6 sm:px-8 py-3.5 rounded-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-black text-sm sm:text-base shadow-lg shadow-teal-600/20 transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>অভিভাবক ড্যাশবোর্ড শুরু করুন</span>
                </button>

                <button
                  type="button"
                  onClick={onGoToStudentDashboard}
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm sm:text-base border border-slate-300 shadow-xs transition-all active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-teal-600" />
                  <span>শিক্ষার্থী পোর্টাল দেখুন</span>
                </button>
              </div>

              {/* Quick Trust Checklist */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs sm:text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>১ম থেকে ১০ম শ্রেণি পাঠ্যক্রম</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>লাইভ প্রক্টরিং ও সততা যাচাই</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>১০০% ফ্রি অ্যাকাউন্ট</span>
                </div>
              </div>

            </div>

            {/* Right Column: Autumn Educational Illustration (Mascot Learning Tablet) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-amber-100">
                <img
                  src="/src/assets/images/education_hero_mascot_1793606746096.jpg"
                  alt="Students learning and studying together in autumn park"
                  className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-500"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Badge */}
                <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-lg border border-slate-200/80 max-w-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                      ৪.৯★
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-black text-slate-900 block leading-tight">
                        ২৫,০০০+ অভিভাবকের আস্থা
                      </span>
                      <span className="text-[10px] text-slate-500">
                        সন্তানের পরীক্ষার প্রস্তুতি ও দুর্বলতা সমাধান
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. INTERACTIVE "BUILD A WORKSHEET" / TEST GENERATOR SHOWCASE */}
      {/* ======================================================== */}
      <section id="worksheet-section" className="py-12 sm:py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-teal-600 text-xs font-bold uppercase tracking-wider block mb-1">
              ইন্টারেক্টিভ লার্নিং টুলস
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              স্মার্ট ওয়ার্কশিট ও এক্সাম জেনারেটর
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Education.com এর মতো নিজের প্রয়োজন অনুযায়ী প্রশ্নপত্র ও অনুশীলনী তৈরি করুন নিমিষেই
            </p>
          </div>

          {/* Generator Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {worksheetGenerators.slice(0, 4).map(gen => (
              <button
                key={gen.id}
                type="button"
                onClick={() => setSelectedGenerator(gen.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  selectedGenerator === gen.id
                    ? 'bg-teal-50/80 border-teal-500 shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="text-2xl block mb-2">{gen.icon}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                  {gen.name}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {gen.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Interactive Preview Canvas */}
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-teal-700 bg-teal-100/60 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  লাইভ প্রিভিউ ও জেনারেটর
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {worksheetGenerators.find(g => g.id === selectedGenerator)?.name || 'ওয়ার্কশিট'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  পাঠ্যবইয়ের অধ্যায় ও কাঙ্ক্ষিত প্রশ্নের সংখ্যা নির্বাচন করুন
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateSample}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>তৈরি করুন (Generate)</span>
                </button>
                <button
                  type="button"
                  onClick={onGoToParentDashboard}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm transition-all"
                >
                  কাস্টম পরীক্ষা দিন
                </button>
              </div>
            </div>

            {generatedSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>ওয়ার্কশিটটি সফলভাবে প্রস্তুত হয়েছে! এটি সন্তানের ড্যাশবোর্ডে লিংক করা হয়েছে।</span>
              </div>
            )}

            {/* Mock Worksheet Content Preview */}
            <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 font-mono text-xs text-slate-700">
              <div className="flex justify-between border-b pb-3 font-sans">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">দাপাঠশালা ডিজিটাল ওয়ার্কশিট</span>
                  <span className="text-xs text-slate-400">বিষয়: প্রাথমিক ও মাধ্যমিক সাধারণ গণিত · শ্রেণি: ৫ম-৮ম</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">সময়: ১৫ মিনিট</span>
                  <span className="font-bold text-teal-600">পূর্ণমান: ২০</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">১. যোগফল নির্ণয় কর:</span>
                  <p className="text-slate-600">৪৫৬ + ৭৮৯ = [ _________ ]</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">২. গুণফল বের কর:</span>
                  <p className="text-slate-600">১২ × ৮ = [ _________ ]</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">৩. ভগ্নাংশের বিয়োগফল:</span>
                  <p className="text-slate-600">৩/৪ - ১/৪ = [ _________ ]</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">৪. কথার অঙ্ক সমাধান:</span>
                  <p className="text-slate-600">একটি ঝুড়িতে ২৫টি আম ছিল, ৫ জন সমানভাবে ভাগ পেলে...</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. BROWSE BY GRADE & SUBJECT (Clean Education.com Cards) */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-16 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              শ্রেণি অনুযায়ী প্রস্তুতি ও শিট
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              জাতীয় শিক্ষাক্রমের প্রতিটি শ্রেণির বই ও অধ্যায়ের সাথে সম্পূর্ণ সামঞ্জস্যপূর্ণ
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { grade: '১ম শ্রেণি', color: 'from-amber-400 to-orange-500', count: '৩,৫০০+' },
              { grade: '২য় শ্রেণি', color: 'from-emerald-400 to-teal-500', count: '৪,২০০+' },
              { grade: '৩য় শ্রেণি', color: 'from-sky-400 to-blue-500', count: '৫,১০০+' },
              { grade: '৪র্থ শ্রেণি', color: 'from-indigo-400 to-violet-500', count: '৬,৩০০+' },
              { grade: '৫ম শ্রেণি (PSC)', color: 'from-pink-400 to-rose-500', count: '৭,৫০০+' },
              { grade: '৮ম শ্রেণি (জেএসসি)', color: 'from-teal-500 to-emerald-600', count: '৮,০০০+' },
            ].map(item => (
              <button
                key={item.grade}
                type="button"
                onClick={onGoToParentDashboard}
                className="bg-white rounded-2xl p-4 border border-slate-200 text-center hover:shadow-md hover:border-teal-300 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${item.color} text-white flex items-center justify-center font-black text-sm mx-auto mb-3 shadow-xs group-hover:scale-105 transition-transform`}>
                  {item.grade.slice(0, 2)}
                </div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-teal-700">
                  {item.grade}
                </h4>
                <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">
                  {item.count} প্রশ্ন ও শিট
                </span>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. PARENT & STUDENT DUAL HUB SHOWCASE                    */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Parent Card */}
            <div className="rounded-3xl bg-linear-to-br from-teal-50/80 to-emerald-50/50 p-6 sm:p-8 border border-teal-200/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-200 mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wide">অভিভাবকদের জন্য</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 mb-3">
                  সন্তানের পড়ার সময় ও মেধার পূর্ণাঙ্গ ট্র্যাকিং
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  বাসায় বসে সন্তান কতটুকু পড়ল, কাস্টম টেস্ট তৈরি করে দিন, সততা বা ট্যাব সুইচের লাইভ প্রক্টরিং লগ দেখুন এবং এআই মূল্যায়িত খাতায় দিকনির্দেশনা দিন।
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-medium mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>পছন্দমতো বিষয় ও অধ্যায়ের পরীক্ষা নির্ধারণ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>অ্যান্টি-চিটিং ও ব্রাউজার ব্লার সতর্কতা লগ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>সাপ্তাহিক প্রগ্রেস কার্ড ও অভিভাবকীয় উৎসাহবার্তা</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onGoToParentDashboard}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <span>অভিভাবক ড্যাশবোর্ড খুলুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Student Card */}
            <div className="rounded-3xl bg-linear-to-br from-indigo-50/80 to-sky-50/50 p-6 sm:p-8 border border-indigo-200/80 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">শিক্ষার্থীদের জন্য</span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 mb-3">
                  সহজে কুইজ, মডেল টেস্ট ও এআই ডাউট সলভার
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  পিন কোড দিয়ে দ্রুত পরীক্ষায় অংশগ্রহণ করুন, তাৎক্ষণিক সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা দেখুন এবং পড়ালেখাকে আরও উপভোগ্য করে তুলুন।
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 font-medium mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>৬-সংখ্যার পিন দিয়ে ইনস্ট্যান্ট পরীক্ষা শুরু</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>অধ্যায়ভিত্তিক সেলফ প্র্যাকটিস ও কুইজ মোড</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>অর্জিত পয়েন্ট (XP) ও মেধা লিডারবোর্ড</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onGoToStudentDashboard}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <span>শিক্ষার্থী ড্যাশবোর্ডে প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. PIN MODAL                                             */}
      {/* ======================================================== */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => { setShowPinModal(false); setPinError(''); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">পরীক্ষার পিন (PIN) কোড লিখুন</h3>
            <p className="text-xs text-slate-500 mb-5">
              অভিভাবক বা শিক্ষকের দেওয়া ৬-সংখ্যার পিন দিয়ে সরাসরি টেস্টে চলে যান
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={quickPin}
                  onChange={(e) => setQuickPin(e.target.value)}
                  placeholder="যেমন: 787193"
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center font-black tracking-widest text-slate-900 focus:outline-hidden focus:border-teal-500 text-xl"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {pinError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-md transition-all active:scale-95"
              >
                পরীক্ষায় যান &rarr;
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. FOOTER (Education.com Style Clean 4-Column Layout)    */}
      {/* ======================================================== */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-lg font-black text-white">দাপাঠশালা.com</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                বাংলাদেশের প্রাথমিক ও মাধ্যমিক শিক্ষার্থীদের জন্য স্বয়ংক্রিয় ওয়ার্কশিট, কুইজ ও অভিভাবক মনিটরিং পোর্টাল।
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">জনপ্রিয় ফিচারসমূহ</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={onGoToParentDashboard} className="hover:text-teal-400">কাস্টম পরীক্ষা জেনারেটর</button></li>
                <li><button onClick={onGoToStudentDashboard} className="hover:text-teal-400">মডেল টেস্ট ও প্র্যাকটিস</button></li>
                <li><button onClick={onGoToParentDashboard} className="hover:text-teal-400">লাইভ প্রক্টরিং ও সততা যাচাই</button></li>
                <li><button onClick={onGoToParentDashboard} className="hover:text-teal-400">ডিজিটাল রেজাল্ট কার্ড</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">শ্রেণি ও পাঠ্যক্রম</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={onGoToParentDashboard} className="hover:text-teal-400">১ম থেকে ৫ম শ্রেণি (প্রাথমিক)</button></li>
                <li><button onClick={onGoToParentDashboard} className="hover:text-teal-400">৬ষ্ঠ থেকে ৮ম শ্রেণি (জুনিয়র)</button></li>
                <li><button onClick={onGoToParentDashboard} className="hover:text-teal-400">৯ম ও ১০ম শ্রেণি (এসএসসি)</button></li>
                <li><button onClick={onGoToParentDashboard} className="hover:text-teal-400">অধ্যায়ভিত্তিক প্রশ্নব্যাংক</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">সহায়তা ও যোগাযোগ</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>হেল্পলাইন: ০৯৬১২-৩৪৫৬৭৮</li>
                <li>ইমেইল: support@dapathshala.com</li>
                <li>ঢাকা, বাংলাদেশ</li>
                <li><span className="text-teal-400">গোপনীয়তা নীতি ও শর্তাবলী</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} দাপাঠশালা (DaPathshala.com) - সর্বস্বত্ব সংরক্ষিত।</p>
            <div className="flex items-center gap-4">
              <span>পরিচ্ছন্ন শিক্ষা</span>
              <span>·</span>
              <span>নিখুঁত মূল্যায়ন</span>
              <span>·</span>
              <span>উন্নত ভবিষ্যৎ</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
