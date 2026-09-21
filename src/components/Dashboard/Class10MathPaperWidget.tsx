import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  Plus, 
  Check, 
  Printer, 
  Trash2, 
  Search, 
  BookOpen, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Bookmark,
  Layers,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_BOOK_QUESTIONS, BookQuestion, SUBJECT_TOPIC_MAP } from '../../data/initialBookQuestions';
import { AutoScrollHorizontalRow } from '../common/AutoScrollHorizontalRow';

const LOCAL_STORAGE_SAVED_PAPER = 'dapathshala_current_question_paper';
const LOCAL_STORAGE_PAPER_HEADER = 'dapathshala_question_paper_header';

export default function Class10MathPaperWidget() {
  // All math questions for Class 10 (or 9-10)
  const mathQuestions = useMemo(() => {
    return INITIAL_BOOK_QUESTIONS.filter(
      q => q.subject === 'গণিত' && (q.classLevel === '১০ম শ্রেণি' || q.classLevel === '৯ম-১০ম শ্রেণি')
    );
  }, []);

  const [selectedTopic, setSelectedTopic] = useState<string>('সকল অধ্যায়');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [paperQuestions, setPaperQuestions] = useState<BookQuestion[]>([]);
  const [showAnswerKeys, setShowAnswerKeys] = useState<boolean>(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);

  // Paper header state
  const [paperHeader, setPaperHeader] = useState({
    institutionName: 'দা পাঠশালা মডেল একাডেমি',
    examTitle: '১০ম শ্রেণি বার্ষিক / মডেল টেস্ট পরীক্ষা - ২০২৬',
    classLevel: '১০ম শ্রেণি',
    subject: 'সাধারণ গণিত',
    duration: '৪৫ মিনিট',
    fullMarks: '২৫',
    instructions: 'প্রতিটি প্রশ্নের মান ১। সঠিক উত্তরের বৃত্তটি বলপয়েন্ট কলম দিয়ে ভরাট করো।'
  });

  // Load existing active paper from localStorage on mount
  useEffect(() => {
    try {
      const savedPaper = localStorage.getItem(LOCAL_STORAGE_SAVED_PAPER);
      if (savedPaper) {
        const parsed = JSON.parse(savedPaper);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly deduplicate by ID to prevent any duplicate keys
          const uniquePaper = Array.from(new Map(parsed.map((item: BookQuestion) => [item.id, item])).values());
          setPaperQuestions(uniquePaper);
          localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(uniquePaper));
        }
      }

      const savedHeader = localStorage.getItem(LOCAL_STORAGE_PAPER_HEADER);
      if (savedHeader) {
        setPaperHeader(prev => ({ ...prev, ...JSON.parse(savedHeader) }));
      }
    } catch (e) {
      console.warn("Could not load saved paper from localStorage", e);
    }
  }, []);

  // Save changes to localStorage
  const syncPaperToStorage = (updatedPaper: BookQuestion[]) => {
    setPaperQuestions(updatedPaper);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(updatedPaper));
    } catch (e) {
      // ignore
    }
  };

  // Add question to paper using functional updater to avoid race conditions
  const handleToggleQuestion = (q: BookQuestion) => {
    setPaperQuestions(prev => {
      const exists = prev.some(p => p.id === q.id);
      let updated: BookQuestion[];
      if (exists) {
        updated = prev.filter(p => p.id !== q.id);
      } else {
        setLastAddedId(q.id);
        setTimeout(() => setLastAddedId(null), 1000);
        updated = [...prev.filter(p => p.id !== q.id), q];
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Clear paper
  const handleClearPaper = () => {
    if (window.confirm("আপনি কি নিশ্চিত যে বর্তমান প্রশ্নপত্রটি খালি করতে চান?")) {
      syncPaperToStorage([]);
    }
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Topics for Class 10 Math
  const mathTopics = useMemo(() => {
    return [
      'সকল অধ্যায়',
      'বীজগণিতীয় রাশি',
      'সূচক ও লগারিদম',
      'ত্রিকোণমিতি',
      'জ্যামিতি (বৃত্ত ও ত্রিভুজ)',
      'সমান্তর ও গুণোত্তর ধারা',
      'এক চলক ও দ্বিঘাত সমীকরণ',
      'পরিমিতি ও পরিসংখ্যান'
    ];
  }, []);

  // Filtered math problems
  const filteredProblems = useMemo(() => {
    return mathQuestions.filter(q => {
      const matchesTopic = selectedTopic === 'সকল অধ্যায়' || q.topic === selectedTopic;
      const matchesSearch = !searchQuery || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (q.yearOrBoard && q.yearOrBoard.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTopic && matchesSearch;
    });
  }, [mathQuestions, selectedTopic, searchQuery]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-7 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-primary rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 bg-white/15 px-3 py-1 rounded-full text-xs font-bold text-amber-300 border border-white/20">
            <Calculator size={14} className="text-amber-300" />
            <span>১০ম শ্রেণি সাধারণ গণিত স্পেশাল</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>১০ম শ্রেণির অংক প্রশ্নপত্র তৈরি করুন</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
            নিচে ১০ম শ্রেণির সকল অধ্যায়ের অংকগুলো সাজানো আছে। আপনার পছন্দের অংকটিতে ক্লিক করলেই সেটি সাথে সাথে আপনার কাস্টম প্রশ্নপত্রে যুক্ত হয়ে যাবে!
          </p>
        </div>

        {/* Paper Counter & Direct Studio Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-blue-200 font-semibold block uppercase">যুক্ত করা অংক</span>
            <span className="text-xl font-black text-amber-400 font-mono">{paperQuestions.length} টি</span>
          </div>
          <Link
            to="/paper-builder?subject=গণিত&class=১০ম"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
          >
            <BookOpen size={16} />
            <span>ফুল পেপার মেকারে যান</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Topic Filter Chips & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
            <Bookmark size={15} className="text-primary" />
            <span>অধ্যায় বা অনুশীলনী বেছে নিন:</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="অংক বা টপিক খুঁজুন..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Chips */}
        <AutoScrollHorizontalRow speed={0.5} pauseDuration={1400} showArrows={true}>
          {mathTopics.map(topic => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </AutoScrollHorizontalRow>
      </div>

      {/* Grid: Left side Math Problems & Right side Live Question Paper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================= Left: Problem Bank (8 cols) ======================= */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>উপলব্ধ অংক সংখ্যা: {filteredProblems.length}টি</span>
            <span className="text-primary font-bold">👉 অংকের ওপর ক্লিক করলেই প্রশ্নপত্রে যোগ হবে</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
            {filteredProblems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-sm font-bold text-slate-600">কোনো অংক পাওয়া যায়নি।</p>
                <p className="text-xs text-slate-400 mt-1">অন্য কোনো অধ্যায় নির্বাচন করুন বা সার্চ ফিল্টার পরিবর্তন করুন।</p>
              </div>
            ) : (
              filteredProblems.map((problem, pIdx) => {
                const isInPaper = paperQuestions.some(p => p.id === problem.id);
                const isJustAdded = lastAddedId === problem.id;

                return (
                  <motion.div
                    key={`${problem.id}-${pIdx}`}
                    layout
                    whileHover={{ scale: 1.008 }}
                    onClick={() => handleToggleQuestion(problem)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isInPaper
                        ? 'bg-blue-50/60 border-primary shadow-sm ring-1 ring-primary/20'
                        : 'bg-white border-slate-200 hover:border-primary/40 hover:shadow-md'
                    }`}
                  >
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {problem.topic}
                        </span>
                        {problem.pageNumber && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {problem.pageNumber}
                          </span>
                        )}
                      </div>
                      {problem.yearOrBoard && (
                        <span className="bg-amber-500/10 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/20">
                          {problem.yearOrBoard}
                        </span>
                      )}
                    </div>

                    {/* Question text */}
                    <h4 className="text-sm font-bold text-slate-900 mb-3 leading-relaxed font-mono">
                      {problem.question}
                    </h4>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {problem.options.map((opt, optIdx) => {
                        const labels = ['(ক)', '(খ)', '(গ)', '(ঘ)'];
                        const isAnswer = problem.answer === opt;
                        return (
                          <div
                            key={optIdx}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                              showAnswerKeys && isAnswer
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                : 'bg-slate-50 border-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="text-primary font-bold mr-1.5">{labels[optIdx]}</span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-500">
                        {isInPaper ? '✓ আপনার পেপারে সাজানো আছে' : 'ক্লিক করে পেপারে যুক্ত করুন'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleQuestion(problem);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all text-xs ${
                          isInPaper
                            ? 'bg-emerald-600 hover:bg-rose-600 text-white'
                            : 'bg-primary hover:bg-primary/90 text-white shadow-sm'
                        }`}
                      >
                        {isInPaper ? (
                          <>
                            <Check size={14} />
                            <span>যোগ করা হয়েছে</span>
                          </>
                        ) : isJustAdded ? (
                          <>
                            <Sparkles size={14} className="animate-spin text-amber-300" />
                            <span>যুক্ত হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>প্রশ্নপত্রে যোগ করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================= Right: Live Question Paper (5 cols) ======================= */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl sticky top-24">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <FileText size={13} />
                <span>তৈরিকৃত কাস্টম প্রশ্নপত্র</span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                নির্বাচিত অংক: <span className="text-amber-400 font-mono">{paperQuestions.length}</span> টি
              </h3>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setShowAnswerKeys(!showAnswerKeys)}
                title="উত্তরমালা অন/অফ করুন"
                className={`p-2 rounded-xl text-xs font-bold transition-all ${
                  showAnswerKeys ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Eye size={15} />
              </button>
              {paperQuestions.length > 0 && (
                <button
                  onClick={handleClearPaper}
                  title="প্রশ্নপত্র খালি করুন"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Exam Header Preview Info */}
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 text-center space-y-1">
            <p className="text-xs font-bold text-white">{paperHeader.institutionName}</p>
            <p className="text-[11px] text-amber-300 font-semibold">{paperHeader.examTitle}</p>
            <div className="flex justify-center gap-3 text-[10px] text-slate-300 pt-1 font-mono">
              <span>বিষয়: {paperHeader.subject}</span>
              <span>•</span>
              <span>শ্রেণি: {paperHeader.classLevel}</span>
              <span>•</span>
              <span>পূর্ণমান: {paperQuestions.length}</span>
            </div>
          </div>

          {/* Questions List in Paper */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 no-scrollbar">
            {paperQuestions.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <FileText size={36} className="mx-auto text-slate-600" />
                <p className="text-xs font-bold text-slate-300">প্রশ্নপত্রটি এখনো খালি রয়েছে</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  বামপাশের তালিকা থেকে যেকোনো অংকের ওপর ক্লিক করুন; সাথে সাথে সেটি এখানে এসে যুক্ত হবে।
                </p>
              </div>
            ) : (
              paperQuestions.map((q, idx) => (
                <div
                  key={`${q.id}-${idx}`}
                  className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 flex items-start justify-between gap-2 group hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/30 border border-primary/40 text-primary-foreground font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-2 leading-relaxed font-mono">
                        {q.question}
                      </p>
                      {showAnswerKeys && (
                        <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                          উত্তর: {q.answer}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleQuestion(q)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                    title="বাদ দিন"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <Link
              to="/paper-builder?subject=গণিত&class=১০ম"
              className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-primary/30 transition-all"
            >
              <BookOpen size={15} />
              <span>ফুল পেপার মেকারে প্রিভিউ ও এডিট</span>
              <ArrowRight size={14} />
            </Link>

            <button
              onClick={handlePrint}
              disabled={paperQuestions.length === 0}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Printer size={15} />
              <span>সরাসরি প্রিন্ট বা PDF তৈরি করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
