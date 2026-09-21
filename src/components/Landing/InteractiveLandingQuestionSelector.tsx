import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  Sparkles, 
  FileText,
  RotateCcw,
  Check
} from 'lucide-react';

interface QuestionItem {
  id: number;
  question: string;
  options: string[];
}

const SAMPLE_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    question: 'বাংলাদেশের রাজধানী কোনটি?',
    options: ['চট্টগ্রাম', 'ঢাকা', 'খুলনা', 'রাজশাহী']
  },
  {
    id: 2,
    question: 'সূর্য কেন আলো দেয়?',
    options: ['তাপ বিকিরণ', 'পরমাণু বিস্ফোরণ', 'নিউক্লিয়ার ফিউশন', 'বৈদ্যুতিক তরঙ্গ']
  },
  {
    id: 3,
    question: 'নোবেল পুরস্কার কবে থেকে প্রদান করা শুরু হয়?',
    options: ['১৮৯৫', '১৯০১', '১৯১০', '১৯২৫']
  },
  {
    id: 4,
    question: 'বাংলা ভাষার প্রথম গ্রন্থ কোনটি?',
    options: ['মেঘনাদ বধ কাব্য', 'চর্যাপদ', 'গীতাঞ্জলি', 'সোনার তরী']
  },
  {
    id: 5,
    question: 'বাংলাদেশের জাতীয় পতাকার রং কী কী?',
    options: ['সবুজ ও লাল', 'নীল ও হলুদ', 'সাদা ও লাল', 'কালো ও লাল']
  },
  {
    id: 6,
    question: 'মুক্তিযুদ্ধ জাদুঘর কোথায় অবস্থিত?',
    options: ['শাহবাগ, ঢাকা', 'আগারগাঁও, ঢাকা', 'ধানমন্ডি, ঢাকা', 'মতিঝিল, ঢাকা']
  },
  {
    id: 7,
    question: 'বাংলাদেশের দীর্ঘতম নদী কোনটি?',
    options: ['পদ্মা', 'মেঘনা', 'যমুনা', 'কর্ণফুলী']
  },
  {
    id: 8,
    question: 'জাতীয় স্মৃতিসৌধের স্থপতি কে?',
    options: ['সৈয়দ মাইনুল হোসেন', 'হামিদুর রহমান', 'কামরুল হাসান', 'মোজাম্মেল হক']
  },
  {
    id: 9,
    question: 'বিশ্বের বৃহত্তম ম্যানগ্রোভ বন কোনটি?',
    options: ['অ্যামাজন', 'সুন্দরবন', 'কঙ্গো অববাহিকা', 'ডেইন্ট্রি রেইনফরেস্ট']
  },
  {
    id: 10,
    question: 'কম্পিউটারের মস্তিষ্ক বলা হয় কোনটিকে?',
    options: ['মনিটর', 'হার্ডডিস্ক', 'সিপিইউ (CPU)', 'র‍্যাম (RAM)']
  }
];

const toBengaliNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
};

const OPTION_PREFIXES = ['ক.', 'খ.', 'গ.', 'ঘ.'];

export const InteractiveLandingQuestionSelector: React.FC = () => {
  const navigate = useNavigate();

  // Initially select questions 1, 2, 3, 4 to match the screenshot exactly
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3, 4]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const itemsPerPage = 5;

  // Toggle question selection
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (submitted) setSubmitted(false);
  };

  // Get current page questions
  const currentQuestions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return SAMPLE_QUESTIONS.slice(start, start + itemsPerPage);
  }, [currentPage]);

  const totalPages = Math.ceil(SAMPLE_QUESTIONS.length / itemsPerPage);

  // Selected questions ordered as in SAMPLE_QUESTIONS
  const selectedQuestions = useMemo(() => {
    return SAMPLE_QUESTIONS.filter((q) => selectedIds.includes(q.id));
  }, [selectedIds]);

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Smooth scroll down to the generated paper on mobile if needed
    const paperEl = document.getElementById('interactive-paper-sheet');
    if (paperEl && window.innerWidth < 1024) {
      paperEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="live-question-builder-demo" 
      className="w-full max-w-full overflow-hidden bg-slate-50/70 border border-slate-200/90 rounded-3xl p-3 sm:p-6 md:p-8 shadow-xs"
    >
      {/* 2-Column Responsive Grid matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start min-w-0">
        
        {/* =========================================================================
            LEFT COLUMN: প্রশ্ন সিলেক্ট করুন (Interactive Question Selector)
            ========================================================================= */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col space-y-4 min-w-0">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
              <span>প্রশ্ন সিলেক্ট করুন</span>
              <Sparkles size={18} className="text-emerald-500 shrink-0" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              প্রশ্নগুলো সিলেক্ট করে সাবমিট করলেই প্রশ্ন তৈরী হয়ে যাবে !
            </p>
          </div>

          {/* Question List Cards */}
          <div className="space-y-3 min-w-0">
            {currentQuestions.map((q) => {
              const isSelected = selectedIds.includes(q.id);

              return (
                <div
                  key={q.id}
                  id={`demo-q-card-${q.id}`}
                  onClick={() => handleToggleSelect(q.id)}
                  className={`relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-150 select-none min-w-0 ${
                    isSelected
                      ? 'bg-white border-2 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  {/* Selection Indicator Checkbox */}
                  <div className="flex items-start justify-between gap-2 min-w-0 mb-2">
                    <div className="font-bold text-slate-900 text-[13px] sm:text-sm leading-snug break-words flex-1 min-w-0">
                      <span className="mr-1.5 font-extrabold">{toBengaliNumber(q.id)}.</span>
                      <span>{q.question}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* 2-Column Options */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-[13px] text-slate-700 pl-4 min-w-0">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="truncate min-w-0">
                        <span className="font-medium mr-1.5 text-slate-800">
                          {OPTION_PREFIXES[optIdx]}
                        </span>
                        <span className="text-slate-700">{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              id="selector-prev-page"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ← পূর্ববর্তী
            </button>
            <div className="text-xs font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              {toBengaliNumber(currentPage)} / {toBengaliNumber(totalPages)}
            </div>
            <button
              type="button"
              id="selector-next-page"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(2)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              পরবর্তী →
            </button>
          </div>

          {/* Submit / Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              id="interactive-submit-btn"
              onClick={handleSubmit}
              className="w-full sm:w-auto min-w-[200px] px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 group"
            >
              <CheckCircle2 size={16} />
              <span>প্রশ্নপত্র তৈরি করুন ({toBengaliNumber(selectedIds.length)})</span>
            </button>
            
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition py-1 px-2 rounded"
              >
                <RotateCcw size={12} />
                <span>রিসেট করুন</span>
              </button>
            )}
          </div>

          {submitted && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-center font-medium animate-fadeIn">
              🎉 প্রশ্নপত্র তৈরি হয়েছে! ডানের প্রিভিউতে দেখুন অথবা প্রিন্ট / সম্পূর্ণ এডিটরে নিয়ে যান।
            </div>
          )}
        </div>

        {/* =========================================================================
            RIGHT COLUMN: লাইভ তৈরি হওয়া প্রশ্নপত্র প্রিভিউ (স্বপ্নছোঁয়া একাডেমি)
            ========================================================================= */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col space-y-3 min-w-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              লাইভ রিয়েল-টাইম প্রশ্নপত্র
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs flex items-center gap-1"
                title="প্রিন্ট করুন"
              >
                <Printer size={13} />
                <span>প্রিন্ট</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/paper-builder')}
                className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition shadow-2xs flex items-center gap-1"
                title="সম্পূর্ণ এডিটরে খুলুন"
              >
                <FileText size={13} />
                <span>ফুল বিল্ডার</span>
              </button>
            </div>
          </div>

          {/* Clean White Paper Card */}
          <div 
            id="interactive-paper-sheet" 
            className="w-full bg-white rounded-2xl shadow-md border border-slate-200/90 p-4 sm:p-6 md:p-7 min-h-[480px] sm:min-h-[520px] flex flex-col justify-between transition-all"
          >
            <div>
              {/* Institution Header matching user image */}
              <div className="text-center space-y-0.5 pb-2">
                <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 tracking-tight">
                  স্বপ্নছোঁয়া একাডেমি
                </h3>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  শ্রেণিঃ ষষ্ঠ
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  বিষয়ঃ সাধারণ জ্ঞান
                </div>
              </div>

              {/* Exam Metadata Row */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-slate-800 font-semibold pt-1 border-t border-slate-200 mt-2 pb-2">
                <div>
                  সময়: <span className="font-bold">{toBengaliNumber(selectedQuestions.length)} মিনিট</span>
                </div>
                <div>
                  পূর্ণমান: <span className="font-bold">{toBengaliNumber(selectedQuestions.length)}</span>
                </div>
              </div>

              {/* Visual Divider Line */}
              <div className="w-full border-b border-slate-300 mb-3.5" />

              {/* Selected Questions Display */}
              {selectedQuestions.length > 0 ? (
                <div className="space-y-3 min-w-0">
                  {selectedQuestions.map((item, idx) => (
                    <div key={item.id} className="min-w-0">
                      {/* Question Text */}
                      <p className="font-bold text-slate-900 text-xs sm:text-sm leading-snug flex items-start min-w-0">
                        <span className="font-extrabold mr-1.5 shrink-0 select-none">
                          {toBengaliNumber(idx + 1)}.
                        </span>
                        <span className="break-words min-w-0 flex-1">{item.question}</span>
                      </p>

                      {/* 2-Column Options on Paper */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1 text-[11px] sm:text-xs text-slate-700 pl-4 min-w-0">
                        {item.options.map((opt, optIdx) => (
                          <div key={optIdx} className="truncate min-w-0">
                            <span className="font-semibold mr-1 text-slate-900">
                              {OPTION_PREFIXES[optIdx]}
                            </span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs sm:text-sm space-y-2">
                  <div className="text-2xl">📋</div>
                  <p>বাম পাশ থেকে যেকোনো প্রশ্ন সিলেক্ট করুন,</p>
                  <p className="text-[11px] text-slate-500">সাথে সাথে এখানে লাইভ প্রশ্নপত্র তৈরি হবে!</p>
                </div>
              )}
            </div>

            {/* Paper Bottom Footnote & Quick Action */}
            <div className="mt-6 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>* আসল পরীক্ষার আদলে ২-কলাম বা ১-কলাম A4 প্রিন্ট উপযোগী</span>
              <button
                type="button"
                onClick={() => navigate('/paper-builder')}
                className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                <span>বইয়ের প্রশ্নপত্র বিল্ডারে আরও প্রশ্ন যুক্ত করুন</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default InteractiveLandingQuestionSelector;
