import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Layers, 
  ChevronDown, 
  ArrowRight, 
  Check, 
  Sprout, 
  Zap, 
  Flame, 
  HelpCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NCTB_CLASS_SYLLABUS, getClassMeta } from '../../data/nctbClassSyllabus';
import { ALL_STORED_SUBJECT_QUESTIONS, resolveDifficulty } from '../../data/initialBookQuestions';
import { MathFormulaRenderer } from '../Common/MathFormulaRenderer';

export const InteractiveQuestionBuilderHero: React.FC = () => {
  const navigate = useNavigate();

  // Step 0: "প্রশ্ন তৈরি করুন" (Click to expand into interactive selection)
  // Step 1: কোন ক্লাসের প্রশ্ন তৈরি করতে চান (১ম - ১০ম শ্রেণি)
  // Step 2: কোন বইয়ের উপর প্রশ্ন তৈরি করতে চান
  // Step 3: কোন অধ্যায়ের প্রশ্ন তৈরি করতে চান
  // Step 4: সহজ, মধ্যম ও কঠিন ক্যাটাগরি অনুযায়ী প্রশ্নের তালিকা ও ফিল্টারিং
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  // Step container references for automatic smooth scrolling
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  // Smooth scroll helper to bring the next step directly into user's sight
  const scrollToStep = (stepNumber: 1 | 2 | 3 | 4) => {
    setActiveStep(stepNumber);
    setTimeout(() => {
      let targetEl: HTMLElement | null = null;
      if (stepNumber === 1) targetEl = step1Ref.current;
      if (stepNumber === 2) targetEl = step2Ref.current;
      if (stepNumber === 3) targetEl = step3Ref.current;
      if (stepNumber === 4) targetEl = step4Ref.current;

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };
  
  // Difficulty multi-select filter: 'সহজ', 'মাঝারি' (মধ্যম), 'কঠিন'
  const [selectedDifficulties, setSelectedDifficulties] = useState<('সহজ' | 'মাঝারি' | 'কঠিন')[]>([
    'সহজ', 
    'মাঝারি', 
    'কঠিন'
  ]);

  // Selected questions checkbox map for creating the paper
  const [checkedQuestionIds, setCheckedQuestionIds] = useState<Record<string, boolean>>({});

  // Class metadata and available books
  const currentClassMeta = useMemo(() => {
    if (!selectedClass) return null;
    return getClassMeta(selectedClass);
  }, [selectedClass]);

  const availableBooks = useMemo(() => {
    if (!currentClassMeta) return [];
    return currentClassMeta.subjects;
  }, [currentClassMeta]);

  // Available chapters for the selected book
  const availableChapters = useMemo(() => {
    if (!selectedBook || !currentClassMeta) return [];
    const bookObj = currentClassMeta.subjects.find(s => s.name === selectedBook);
    return bookObj ? ['সকল অধ্যায়', ...bookObj.chapters] : ['সকল অধ্যায়'];
  }, [selectedBook, currentClassMeta]);

  // Matching questions filtered from the stored subject database
  const matchingQuestions = useMemo(() => {
    if (!selectedClass || !selectedBook) return [];

    return ALL_STORED_SUBJECT_QUESTIONS.filter(q => {
      // 1. Match Class
      const matchClass = 
        q.classLevel === selectedClass ||
        (selectedClass === '১০ম শ্রেণি' && (q.classLevel === '১০ম শ্রেণি' || q.classLevel === '৯ম-১০ম শ্রেণি')) ||
        (selectedClass === '৯ম শ্রেণি' && (q.classLevel === '৯ম শ্রেণি' || q.classLevel === '৯ম-১০ম শ্রেণি'));

      // 2. Match Subject / Book
      const matchSubject = 
        (selectedBook.includes('বাংলা') && q.subject === 'বাংলা') ||
        ((selectedBook.includes('গণিত') || selectedBook.includes('অংক')) && (q.subject === 'গণিত' || q.subject === 'অংক')) ||
        (selectedBook.includes('English') && q.subject === 'ইংরেজি') ||
        (selectedBook.includes('বিজ্ঞান') && ['বিজ্ঞান', 'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান'].includes(q.subject)) ||
        (selectedBook.includes('বাংলাদেশ ও বিশ্বপরিচয়') && q.subject === 'সাধারণ জ্ঞান') ||
        q.subject.toLowerCase() === selectedBook.toLowerCase();

      // 3. Match Chapter / Topic
      const matchChapter = 
        !selectedChapter || 
        selectedChapter === 'সকল অধ্যায়' || 
        q.topic === selectedChapter ||
        selectedChapter.includes(q.topic) ||
        q.topic.includes(selectedChapter);

      // 4. Match Difficulty Filter
      const diff = resolveDifficulty(q);
      const matchDiff = selectedDifficulties.includes(diff);

      return matchClass && matchSubject && matchChapter && matchDiff;
    });
  }, [selectedClass, selectedBook, selectedChapter, selectedDifficulties]);

  // Toggle difficulty filters
  const handleToggleDifficulty = (diff: 'সহজ' | 'মাঝারি' | 'কঠিন') => {
    setSelectedDifficulties(prev => {
      if (prev.includes(diff)) {
        const remaining = prev.filter(d => d !== diff);
        return remaining.length === 0 ? ['সহজ', 'মাঝারি', 'কঠিন'] : remaining;
      } else {
        return [...prev, diff];
      }
    });
  };

  const handleSelectSingleDifficulty = (diff: 'সহজ' | 'মাঝারি' | 'কঠিন') => {
    setSelectedDifficulties([diff]);
  };

  const handleSelectAllDifficulties = () => {
    setSelectedDifficulties(['সহজ', 'মাঝারি', 'কঠিন']);
  };

  // Toggle individual question selection
  const handleToggleQuestionCheck = (id: string) => {
    setCheckedQuestionIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Step selection handlers with auto-scroll and highlight
  const handleSelectClass = (cls: string) => {
    setSelectedClass(cls);
    setSelectedBook('');
    setSelectedChapter('');
    if (cls) {
      scrollToStep(2);
    } else {
      setActiveStep(1);
    }
  };

  const handleSelectBook = (bookName: string) => {
    setSelectedBook(bookName);
    setSelectedChapter('');
    if (bookName) {
      scrollToStep(3);
    } else {
      setActiveStep(2);
    }
  };

  const handleSelectChapter = (chName: string) => {
    setSelectedChapter(chName);
    if (chName) {
      scrollToStep(4);
    } else {
      setActiveStep(3);
    }
  };

  // Proceed to paper builder with the selected class, subject, topic and difficulty
  const handleGoToPaperBuilder = () => {
    // Map selected book to standard subject name
    let standardSubject = 'বাংলা';
    if (selectedBook.includes('গণিত') || selectedBook.includes('অংক')) standardSubject = 'গণিত';
    else if (selectedBook.includes('English')) standardSubject = 'ইংরেজি';
    else if (selectedBook.includes('বিজ্ঞান')) standardSubject = 'বিজ্ঞান';
    else if (selectedBook.includes('বিশ্বপরিচয়') || selectedBook.includes('জ্ঞান')) standardSubject = 'সাধারণ জ্ঞান';

    const params = new URLSearchParams();
    if (selectedClass) params.set('class', selectedClass);
    if (standardSubject) params.set('subject', standardSubject);
    if (selectedChapter && selectedChapter !== 'সকল অধ্যায়') params.set('topic', selectedChapter);
    if (selectedDifficulties.length === 1) params.set('difficulty', selectedDifficulties[0]);

    // If specific questions were checked, also seed them into localStorage paper
    const selectedList = matchingQuestions.filter(q => checkedQuestionIds[q.id]);
    if (selectedList.length > 0) {
      try {
        localStorage.setItem('dapathshala_current_question_paper', JSON.stringify(selectedList));
      } catch (e) {}
    }

    navigate(`/question-bank?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 text-left">
      {/* Step 0: In place of the top pill, user sees "প্রশ্ন তৈরি করুন" */}
      {!isOpen ? (
        <div className="flex justify-center mb-6">
          <motion.button
            type="button"
            onClick={() => {
              setIsOpen(true);
              scrollToStep(1);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-primary text-white text-sm sm:text-base font-black shadow-lg shadow-indigo-500/25 border border-indigo-400/30 hover:shadow-indigo-500/40 transition-all cursor-pointer"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
            <Sparkles size={18} className="text-amber-300 shrink-0" />
            <span>প্রশ্ন তৈরি করুন</span>
            <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform shrink-0" />
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-white rounded-3xl border-2 border-indigo-500/40 shadow-2xl p-4 sm:p-7 md:p-8 mb-8 text-slate-900 overflow-hidden relative"
        >
          {/* Top Bar with Step status and Close / Reset */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                ✨
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black text-slate-950">
                  স্বয়ংক্রিয় পাঠ্যবই ভিত্তিক প্রশ্নপত্র বিল্ডার
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  পর্যায়ক্রমে শ্রেণি, পাঠ্যবই ও অধ্যায় নির্বাচন করে আপনার প্রশ্নপত্র তৈরি করুন
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSelectedClass('');
                setSelectedBook('');
                setSelectedChapter('');
                setActiveStep(1);
              }}
              className="text-xs text-slate-500 hover:text-rose-600 font-bold px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              title="বন্ধ করুন"
            >
              বন্ধ করুন ✕
            </button>
          </div>

          {/* Interactive Step Progress Stepper */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 mb-6 p-1.5 sm:p-2 bg-slate-50 rounded-2xl border border-slate-200/90 text-center">
            {/* Step 1 Pill */}
            <button
              type="button"
              onClick={() => scrollToStep(1)}
              className={`py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 truncate ${
                activeStep === 1
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/30'
                  : selectedClass
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {selectedClass ? <Check size={12} className="text-emerald-700 shrink-0" /> : <span>১.</span>}
              <span className="truncate">শ্রেণি {selectedClass ? `(${selectedClass})` : ''}</span>
            </button>

            {/* Step 2 Pill */}
            <button
              type="button"
              onClick={() => {
                if (selectedClass) scrollToStep(2);
              }}
              disabled={!selectedClass}
              className={`py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 truncate ${
                activeStep === 2
                  ? 'bg-violet-600 text-white shadow-xs ring-2 ring-violet-400/30'
                  : selectedBook
                  ? 'bg-emerald-100 text-emerald-800'
                  : !selectedClass
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {selectedBook ? <Check size={12} className="text-emerald-700 shrink-0" /> : <span>২.</span>}
              <span className="truncate">পাঠ্যবই {selectedBook ? `(${selectedBook})` : ''}</span>
            </button>

            {/* Step 3 Pill */}
            <button
              type="button"
              onClick={() => {
                if (selectedBook) scrollToStep(3);
              }}
              disabled={!selectedBook}
              className={`py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 truncate ${
                activeStep === 3
                  ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/30'
                  : selectedChapter
                  ? 'bg-emerald-100 text-emerald-800'
                  : !selectedBook
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {selectedChapter ? <Check size={12} className="text-emerald-700 shrink-0" /> : <span>৩.</span>}
              <span className="truncate">অধ্যায়</span>
            </button>

            {/* Step 4 Pill */}
            <button
              type="button"
              onClick={() => {
                if (selectedBook) scrollToStep(4);
              }}
              disabled={!selectedBook}
              className={`py-1.5 px-1 sm:px-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 truncate ${
                activeStep === 4
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-400/30'
                  : !selectedBook
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>৪.</span>
              <span className="truncate">প্রশ্নপত্র</span>
            </button>
          </div>

          {/* ================= 1. কোন ক্লাসের প্রশ্ন তৈরি করতে চান ================= */}
          <div ref={step1Ref} className="space-y-3 mb-6 scroll-mt-28 transition-all duration-300">
            {/* Step 1 Title Header - Highlighted when active */}
            <div className={`p-3 sm:p-3.5 rounded-2xl transition-all duration-300 ${
              activeStep === 1
                ? 'bg-gradient-to-r from-indigo-100/90 via-violet-50 to-pink-50/70 border-2 border-indigo-500 shadow-md shadow-indigo-500/15 ring-4 ring-indigo-500/20'
                : selectedClass
                ? 'bg-emerald-50/60 border border-emerald-200'
                : 'bg-slate-50/80 border border-slate-200/80'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                    activeStep === 1
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : selectedClass
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {selectedClass ? <Check size={16} /> : '১'}
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-1.5 cursor-pointer">
                      <GraduationCap size={18} className={activeStep === 1 ? "text-indigo-600 animate-bounce" : "text-slate-600"} />
                      <span>১. আপনি কোন ক্লাসের প্রশ্ন তৈরি করতে চান?</span>
                    </label>
                    <p className={`text-[11px] mt-0.5 ${activeStep === 1 ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>
                      {activeStep === 1 
                        ? '👉 শুরু করতে প্রথমে আপনার কাঙ্ক্ষিত শ্রেণি (যেমন: ৯ম শ্রেণি) নির্বাচন করুন' 
                        : selectedClass 
                        ? `নির্বাচিত শ্রেণি: ${selectedClass}` 
                        : '১ম থেকে ১০ম শ্রেণির মধ্যে যেকোনো একটি নির্বাচন করুন'}
                    </p>
                  </div>
                </div>

                {activeStep === 1 && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 rounded-full shadow-sm animate-pulse shrink-0">
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                    বর্তমান ধাপ: শ্রেণি নির্বাচন
                  </span>
                )}
                {selectedClass && activeStep !== 1 && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                    <Check size={12} /> {selectedClass}
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => handleSelectClass(e.target.value)}
                className={`w-full appearance-none bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 font-bold text-xs sm:text-sm px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer pr-10 shadow-xs ${
                  activeStep === 1 ? 'border-indigo-400 focus:border-indigo-600' : 'border-slate-200'
                }`}
              >
                <option value="">-- ক্লাস নির্বাচন করুন (১ম থেকে ১০ম শ্রেণি) --</option>
                {NCTB_CLASS_SYLLABUS.map((c) => (
                  <option key={c.classLevel} value={c.classLevel}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            {/* Quick Class Pills for Instant Mobile Tap */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি'].map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => handleSelectClass(cls)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedClass === cls
                      ? 'bg-slate-950 text-white shadow-sm ring-2 ring-slate-950/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  {cls === '১০ম শ্রেণি' ? '১০ম (SSC)' : cls}
                </button>
              ))}
            </div>
          </div>

          {/* ================= 2. আপনি কোন বইয়ের উপর প্রশ্ন তৈরি করতে চান ================= */}
          <AnimatePresence>
            {selectedClass && (
              <motion.div
                ref={step2Ref}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-3 mb-6 pt-4 border-t border-slate-100 scroll-mt-28"
              >
                {/* Step 2 Title Header - Highlighted when active */}
                <div className={`p-3 sm:p-3.5 rounded-2xl transition-all duration-300 ${
                  activeStep === 2
                    ? 'bg-gradient-to-r from-violet-100 via-indigo-50 to-pink-50 border-2 border-violet-500 shadow-md shadow-violet-500/15 ring-4 ring-violet-500/20'
                    : selectedBook
                    ? 'bg-emerald-50/60 border border-emerald-200'
                    : 'bg-slate-50/80 border border-slate-200/80'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                        activeStep === 2
                          ? 'bg-violet-600 text-white shadow-xs'
                          : selectedBook
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {selectedBook ? <Check size={16} /> : '২'}
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-1.5 cursor-pointer">
                          <BookOpen size={18} className={activeStep === 2 ? "text-violet-600 animate-bounce" : "text-slate-600"} />
                          <span>২. আপনি কোন বইয়ের উপর প্রশ্ন তৈরি করতে চান?</span>
                        </label>
                        <p className={`text-[11px] mt-0.5 ${activeStep === 2 ? 'text-violet-700 font-bold' : 'text-slate-500'}`}>
                          {activeStep === 2 
                            ? '👉 চমৎকার! এবার নিচের তালিকা থেকে যে বিষয়ের প্রশ্ন তৈরি করতে চান সেই বইটি নির্বাচন করুন' 
                            : selectedBook 
                            ? `নির্বাচিত বই: ${selectedBook}` 
                            : 'পাঠ্যবই নির্বাচন'}
                        </p>
                      </div>
                    </div>

                    {activeStep === 2 && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 rounded-full shadow-sm animate-pulse shrink-0">
                        <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                        বর্তমান ধাপ: বই নির্বাচন
                      </span>
                    )}
                    {selectedBook && activeStep !== 2 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                        <Check size={12} /> {selectedBook}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedBook}
                    onChange={(e) => handleSelectBook(e.target.value)}
                    className={`w-full appearance-none bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 font-bold text-xs sm:text-sm px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer pr-10 shadow-xs ${
                      activeStep === 2 ? 'border-violet-400 focus:border-violet-600' : 'border-slate-200'
                    }`}
                  >
                    <option value="">-- {selectedClass}-এর বই নির্বাচন করুন --</option>
                    {availableBooks.map((subj) => (
                      <option key={subj.name} value={subj.name}>
                        {subj.icon} {subj.name} ({subj.bookTitle})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                {/* Quick Subject Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                  {availableBooks.map((subj) => {
                    const isSelected = selectedBook === subj.name;
                    return (
                      <button
                        key={subj.name}
                        type="button"
                        onClick={() => handleSelectBook(subj.name)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-2 transition-all truncate border cursor-pointer ${
                          isSelected
                            ? 'bg-violet-50 border-violet-500 text-violet-950 shadow-xs ring-2 ring-violet-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="text-base shrink-0">{subj.icon}</span>
                        <span className="truncate">{subj.name}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= 3. আপনি কোন অধ্যায়ের প্রশ্ন তৈরি করতে চান ================= */}
          <AnimatePresence>
            {selectedBook && (
              <motion.div
                ref={step3Ref}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-3 mb-6 pt-4 border-t border-slate-100 scroll-mt-28"
              >
                {/* Step 3 Title Header - Highlighted when active */}
                <div className={`p-3 sm:p-3.5 rounded-2xl transition-all duration-300 ${
                  activeStep === 3
                    ? 'bg-gradient-to-r from-indigo-100 via-sky-50 to-violet-50 border-2 border-indigo-500 shadow-md shadow-indigo-500/15 ring-4 ring-indigo-500/20'
                    : selectedChapter
                    ? 'bg-emerald-50/60 border border-emerald-200'
                    : 'bg-slate-50/80 border border-slate-200/80'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                        activeStep === 3
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : selectedChapter
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {selectedChapter ? <Check size={16} /> : '৩'}
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-1.5 cursor-pointer">
                          <Layers size={18} className={activeStep === 3 ? "text-indigo-600 animate-bounce" : "text-slate-600"} />
                          <span>৩. আপনি কোন অধ্যায়ের প্রশ্ন তৈরি করতে চান?</span>
                        </label>
                        <p className={`text-[11px] mt-0.5 ${activeStep === 3 ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>
                          {activeStep === 3 
                            ? '👉 দারুণ! এবার নির্দিষ্ট অধ্যায় নির্বাচন করুন অথবা সকল অধ্যায় সিলেক্ট রাখুন' 
                            : selectedChapter 
                            ? `নির্বাচিত অধ্যায়: ${selectedChapter}` 
                            : 'অধ্যায় নির্বাচন'}
                        </p>
                      </div>
                    </div>

                    {activeStep === 3 && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1 rounded-full shadow-sm animate-pulse shrink-0">
                        <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                        বর্তমান ধাপ: অধ্যায় নির্বাচন
                      </span>
                    )}
                    {selectedChapter && activeStep !== 3 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                        <Check size={12} /> {selectedChapter}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={selectedChapter}
                    onChange={(e) => handleSelectChapter(e.target.value)}
                    className={`w-full appearance-none bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 font-bold text-xs sm:text-sm px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer pr-10 shadow-xs ${
                      activeStep === 3 ? 'border-indigo-400 focus:border-indigo-600' : 'border-slate-200'
                    }`}
                  >
                    <option value="">-- অধ্যায় নির্বাচন করুন (অথবা সকল অধ্যায়) --</option>
                    {availableChapters.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>

                {/* Chapter Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1 max-h-32 overflow-y-auto">
                  {availableChapters.map((ch) => {
                    const isSelected = selectedChapter === ch || (!selectedChapter && ch === 'সকল অধ্যায়');
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => handleSelectChapter(ch)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all truncate border cursor-pointer ${
                          isSelected
                            ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= 4. সহজ, মধ্যম ও কঠিন ক্যাটাগরি ও প্রশ্নপত্র প্রিভিউ ================= */}
          <AnimatePresence>
            {selectedClass && selectedBook && (
              <motion.div
                ref={step4Ref}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                className="pt-5 border-t-2 border-slate-100 space-y-4 scroll-mt-28"
              >
                {/* Step 4 Title Header - Highlighted when active */}
                <div className={`p-3 sm:p-3.5 rounded-2xl transition-all duration-300 ${
                  activeStep === 4
                    ? 'bg-gradient-to-r from-amber-100/90 via-orange-50 to-yellow-50 border-2 border-amber-500 shadow-md shadow-amber-500/15 ring-4 ring-amber-500/20'
                    : 'bg-slate-50/80 border border-slate-200/80'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        ৪
                      </div>
                      <div>
                        <label className="text-xs sm:text-sm font-black text-slate-950 flex items-center gap-1.5 cursor-pointer">
                          <Flame size={18} className={activeStep === 4 ? "text-amber-600 animate-bounce" : "text-slate-600"} />
                          <span>৪. কাঠিন্য নির্বাচন ও প্রশ্নপত্র প্রস্তুতকরণ</span>
                        </label>
                        <p className={`text-[11px] mt-0.5 ${activeStep === 4 ? 'text-amber-900 font-bold' : 'text-slate-500'}`}>
                          👉 শেষ ধাপ! সহজ, মধ্যম বা কঠিন প্রশ্ন ফিল্টার করে প্রশ্নপত্র চূড়ান্ত করুন
                        </p>
                      </div>
                    </div>

                    {activeStep === 4 && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-950 bg-amber-400 px-3 py-1 rounded-full shadow-sm animate-pulse shrink-0">
                        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                        বর্তমান ধাপ: প্রশ্নপত্র চূড়ান্তকরণ
                      </span>
                    )}
                  </div>
                </div>

                {/* Difficulty Category Controls */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Flame size={16} className="text-amber-500 shrink-0" />
                      <span>কাঠিন্যের ক্যাটাগরি নির্বাচন (সহজ, মধ্যম ও কঠিন):</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllDifficulties}
                        className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
                      >
                        সবগুলো সিলেক্ট
                      </button>
                      <span className="text-slate-300">|</span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        পাওয়া গেছে: {matchingQuestions.length}টি প্রশ্ন
                      </span>
                    </div>
                  </div>

                  {/* 3 Categories: সহজ, মধ্যম (মাঝারি), কঠিন */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {/* সহজ */}
                    <button
                      type="button"
                      onClick={() => handleToggleDifficulty('সহজ')}
                      className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-between px-4 cursor-pointer ${
                        selectedDifficulties.includes('সহজ')
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black ring-1 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sprout size={18} className={selectedDifficulties.includes('সহজ') ? 'text-emerald-600' : 'text-slate-400'} />
                        <span className="text-xs sm:text-sm font-bold">সহজ প্রশ্ন</span>
                      </div>
                      {selectedDifficulties.includes('সহজ') ? (
                        <span className="text-xs text-emerald-600 font-bold">✓ সক্রিয়</span>
                      ) : (
                        <span className="text-xs text-slate-400">নিষ্ক্রিয়</span>
                      )}
                    </button>

                    {/* মধ্যম */}
                    <button
                      type="button"
                      onClick={() => handleToggleDifficulty('মাঝারি')}
                      className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-between px-4 cursor-pointer ${
                        selectedDifficulties.includes('মাঝারি')
                          ? 'bg-amber-50 border-amber-500 text-amber-950 font-black ring-1 ring-amber-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Zap size={18} className={selectedDifficulties.includes('মাঝারি') ? 'text-amber-600' : 'text-slate-400'} />
                        <span className="text-xs sm:text-sm font-bold">মধ্যম প্রশ্ন</span>
                      </div>
                      {selectedDifficulties.includes('মাঝারি') ? (
                        <span className="text-xs text-amber-600 font-bold">✓ সক্রিয়</span>
                      ) : (
                        <span className="text-xs text-slate-400">নিষ্ক্রিয়</span>
                      )}
                    </button>

                    {/* কঠিন */}
                    <button
                      type="button"
                      onClick={() => handleToggleDifficulty('কঠিন')}
                      className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-between px-4 cursor-pointer ${
                        selectedDifficulties.includes('কঠিন')
                          ? 'bg-rose-50 border-rose-500 text-rose-950 font-black ring-1 ring-rose-500/20 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame size={18} className={selectedDifficulties.includes('কঠিন') ? 'text-rose-600' : 'text-slate-400'} />
                        <span className="text-xs sm:text-sm font-bold">কঠিন প্রশ্ন</span>
                      </div>
                      {selectedDifficulties.includes('কঠিন') ? (
                        <span className="text-xs text-rose-600 font-bold">✓ সক্রিয়</span>
                      ) : (
                        <span className="text-xs text-slate-400">নিষ্ক্রিয়</span>
                      )}
                    </button>
                  </div>

                  {/* Single Difficulty Quick Presets */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 pt-1">
                    <span className="font-bold">এক ক্লিকে নির্বাচন:</span>
                    <button
                      type="button"
                      onClick={() => handleSelectSingleDifficulty('সহজ')}
                      className="px-2 py-0.5 rounded-md bg-emerald-100/70 hover:bg-emerald-200 text-emerald-800 font-semibold cursor-pointer"
                    >
                      শুধুমাত্র সহজ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSingleDifficulty('মাঝারি')}
                      className="px-2 py-0.5 rounded-md bg-amber-100/70 hover:bg-amber-200 text-amber-800 font-semibold cursor-pointer"
                    >
                      শুধুমাত্র মধ্যম
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectSingleDifficulty('কঠিন')}
                      className="px-2 py-0.5 rounded-md bg-rose-100/70 hover:bg-rose-200 text-rose-800 font-semibold cursor-pointer"
                    >
                      শুধুমাত্র কঠিন
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulties(['সহজ', 'মাঝারি'])}
                      className="px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
                    >
                      সহজ ও মধ্যম
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulties(['মাঝারি', 'কঠিন'])}
                      className="px-2 py-0.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer"
                    >
                      মধ্যম ও কঠিন
                    </button>
                  </div>
                </div>

                {/* Display matching questions preview */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      সংরক্ষিত অধ্যায়ভিত্তিক প্রশ্নের তালিকা ({matchingQuestions.length}টি পাওয়া গেছে):
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const allChecked: Record<string, boolean> = {};
                        matchingQuestions.forEach(q => { allChecked[q.id] = true; });
                        setCheckedQuestionIds(allChecked);
                      }}
                      className="text-xs text-primary hover:underline font-bold cursor-pointer"
                    >
                      সব প্রশ্ন সিলেক্ট করুন
                    </button>
                  </div>

                  {matchingQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <HelpCircle size={32} className="mx-auto text-slate-400" />
                      <p className="text-sm font-bold text-slate-700">এই ক্যাটাগরিতে কোনো প্রশ্ন পাওয়া যায়নি।</p>
                      <p className="text-xs text-slate-500">অন্য কোনো অধ্যায় বা অন্য কাঠিন্যের স্তর সিলেক্ট করে দেখুন।</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {matchingQuestions.map((q, idx) => {
                        const diff = resolveDifficulty(q, idx);
                        const isChecked = !!checkedQuestionIds[q.id];

                        return (
                          <div
                            key={q.id || idx}
                            onClick={() => handleToggleQuestionCheck(q.id)}
                            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isChecked
                                ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-400/20'
                                : 'bg-white hover:bg-slate-50/80 border-slate-200/90'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                              }`}>
                                {isChecked && <Check size={12} />}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                  diff === 'সহজ'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : diff === 'মাঝারি'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border-rose-200'
                                }`}>
                                  {diff === 'মাঝারি' ? 'মধ্যম' : diff}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  {q.topic}
                                </span>
                                {q.bookName && (
                                  <span className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                    {q.bookName}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words text-justify">
                                <span className="mr-1">{idx + 1}.</span>
                                <MathFormulaRenderer text={q.question} />
                              </p>

                              {/* Options */}
                              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-700 text-justify">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex items-start gap-1 text-justify min-w-0">
                                    <span className="font-bold shrink-0">({['ক', 'খ', 'গ', 'ঘ'][oIdx]})</span>
                                    <span className="min-w-0 flex-1 break-words text-justify"><MathFormulaRenderer text={opt} /></span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Action: Go To Full Paper Builder */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 font-medium">
                    {Object.values(checkedQuestionIds).filter(Boolean).length > 0 ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ {Object.values(checkedQuestionIds).filter(Boolean).length}টি প্রশ্ন সিলেক্ট করা হয়েছে
                      </span>
                    ) : (
                      <span>এই অধ্যায় থেকে সরাসরি প্রশ্নপত্র তৈরি করুন</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleGoToPaperBuilder}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>এই প্রশ্নগুলো দিয়ে প্রশ্নপত্র তৈরি করুন</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveQuestionBuilderHero;
