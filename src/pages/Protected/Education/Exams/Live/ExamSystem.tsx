import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, CheckCircle2, Zap, ChevronRight, ChevronLeft, Award, RotateCcw, Home, HelpCircle, XCircle, AlertCircle } from 'lucide-react';
import { INITIAL_BOOK_QUESTIONS } from '../../../../../data/initialBookQuestions';

interface ExamQuestion {
  id: string | number;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  subject?: string;
}

const DEFAULT_QUESTIONS: ExamQuestion[] = [
  { 
    id: 1, 
    question: "নিচের কোনটি মৌলিক পদার্থ?", 
    options: ["পানি", "লবণ", "অক্সিজেন", "চিনি"], 
    answer: "অক্সিজেন",
    explanation: "অক্সিজেন একটি মৌলিক পদার্থ কারণ একে রাসায়নিকভাবে ভাঙলে অন্য কোনো পদার্থ পাওয়া যায় না।"
  },
  { 
    id: 2, 
    question: "শূন্য মাধ্যমে আলোর বেগ কত?", 
    options: ["3×10⁸ m/s", "3×10⁶ m/s", "2×10⁸ m/s", "1×10⁸ m/s"], 
    answer: "3×10⁸ m/s",
    explanation: "শূন্য মাধ্যমে আলোর বেগ প্রায় ৩ লক্ষ কিলোমিটার প্রতি সেকেন্ড বা 3×10⁸ m/s।"
  },
  {
    id: 3,
    question: "পানির রাসায়নিক সংকেত নিচের কোনটি?",
    options: ["H₂O", "CO₂", "NaCl", "O₂"],
    answer: "H₂O",
    explanation: "দুটি হাইড্রোজেন পরমাণু এবং একটি অক্সিজেন পরমাণুর রাসায়নিক বন্ধনে পানি (H₂O) গঠিত হয়।"
  },
  {
    id: 4,
    question: "'পাগলে কিনা বলে, ছাগলে কিনা খায়' — এখানে 'পাগলে' কোন কারকে কোন বিভক্তি?",
    options: ["কর্তৃকারকে ৭মী", "কর্মকারকে ৭মী", "করণকারকে ৭মী", "অপাদানকারকে ৭মী"],
    answer: "কর্তৃকারকে ৭মী",
    explanation: "ক্রিয়া সম্পন্নকারী কর্তা, আর 'এ' বিভক্তি থাকায় এটি কর্তৃকারকে সপ্তমী বিভক্তি।"
  },
  {
    id: 5,
    question: "Choose the correct synonym of 'Benevolent':",
    options: ["Kind", "Cruel", "Selfish", "Hostile"],
    answer: "Kind",
    explanation: "'Benevolent' শব্দের অর্থ দয়ালু, হিতৈষী বা মঙ্গলকামী (Kind)।"
  },
  {
    id: 6,
    question: "(a + b)² - (a - b)² এর মান নিচের কোনটি?",
    options: ["4ab", "2(a² + b²)", "a² - b²", "2ab"],
    answer: "4ab",
    explanation: "(a+b)² - (a-b)² = 4ab বীজগাণিতিক সূত্র।"
  },
  {
    id: 7,
    question: "মানবদেহে ক্রোমোজোমের সংখ্যা কতটি?",
    options: ["৪৬টি (২৩ জোড়া)", "৪৪টি (২২ জোড়া)", "৪৮টি (২৪ জোড়া)", "৪৫টি"],
    answer: "৪৬টি (২৩ জোড়া)",
    explanation: "মানুষের প্রতিটি সাধারণ কোষে ২৩ জোড়া বা মোট ৪৬টি ক্রোমোজোম থাকে।"
  },
  {
    id: 8,
    question: "১৯৭১ সালের মুক্তিযুদ্ধে সমগ্র বাংলাদেশকে কয়টি সেক্টরে বিভক্ত করা হয়েছিল?",
    options: ["১১টি", "৭টি", "৯টি", "১২টি"],
    answer: "১১টি",
    explanation: "রণকৌশল ও পরিচালনার সুবিধার্থে ১৯৭১ সালের মুক্তিযুদ্ধের সময় বাংলাদেশকে ১১টি সেক্টরে ভাগ করা হয়েছিল।"
  },
  {
    id: 9,
    question: "বৃত্তের পরিধি ও ব্যাসের অনুপাতকে কী বলা হয়?",
    options: ["পাই (π)", "থিটা (θ)", "ফাই (φ)", "রেডিয়ান"],
    answer: "পাই (π)",
    explanation: "বৃত্তের পরিধি ও ব্যাসের অনুপাত একটি ধ্রুবক সংখ্যা, যাকে গ্রিক বর্ণ π (পাই ≈ ৩.১৪১৬) বলা হয়।"
  },
  {
    id: 10,
    question: "কোষের শক্তিঘর বা পাওয়ার হাউজ (Powerhouse) কাকে বলা হয়?",
    options: ["মাইটোকন্ড্রিয়া", "রাইবোসোম", "গলজি বস্তু", "লাইসোজোম"],
    answer: "মাইটোকন্ড্রিয়া",
    explanation: "মাইটোকন্ড্রিয়ায় কোষীয় শ্বসনের ফলে শক্তি (ATP) উৎপন্ন ও সঞ্চিত হয়।"
  }
];

const ExamSystem = () => {
  const navigate = useNavigate();
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>(DEFAULT_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('সকল বিষয়');

  const startExam = (subject?: string) => {
    let pool: ExamQuestion[] = [];
    const filter = subject || selectedSubjectFilter;
    if (filter !== 'সকল বিষয়') {
      const filtered = INITIAL_BOOK_QUESTIONS.filter(q => q.subject === filter && q.options && q.options.length > 0);
      if (filtered.length >= 5) {
        pool = filtered.slice(0, 10).map(q => ({
          id: q.id,
          question: q.question,
          options: q.options || [],
          answer: q.answer,
          explanation: q.explanation,
          subject: q.subject
        }));
      }
    }
    if (pool.length === 0) {
      pool = DEFAULT_QUESTIONS;
    }

    setQuestions(pool);
    setCurrentIdx(0);
    setAnswers({});
    setTimeLeft(600);
    setExamSubmitted(false);
    setShowConfirmSubmit(false);
    setExamStarted(true);
  };

  const handleSubmitExam = () => {
    setShowConfirmSubmit(false);
    setExamSubmitted(true);
  };

  useEffect(() => {
    if (examStarted && !examSubmitted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && examStarted && !examSubmitted) {
      setExamSubmitted(true);
    }
  }, [examStarted, examSubmitted, timeLeft]);

  // Calculations for Result
  const totalQuestions = questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;

  questions.forEach(q => {
    const userAns = answers[q.id];
    if (!userAns) {
      skippedCount++;
    } else if (userAns.trim() === q.answer.trim()) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100) || 0;

  // 1. Welcome / Exam Start Screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pt-6 sm:pt-8 pb-20 font-['Hind_Siliguri']">
        <div className="w-full max-w-7xl mx-auto px-0.5 sm:px-4 md:px-6">
          <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm relative space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <PenTool size={36} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">অনলাইন মডেল টেস্ট</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                আপনার মেধা ও দক্ষতা যাচাই করতে অধ্যায়ভিত্তিক ও বিষয়ভিত্তিক পূর্ণাঙ্গ মডেল টেস্টে অংশগ্রহণ করুন।
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-left">
                <label className="block text-xs font-bold text-slate-700 mb-2">বিষয় নির্বাচন করুন:</label>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="সকল বিষয়">সকল বিষয় (পূর্ণাঙ্গ মডেল টেস্ট - ১০টি প্রশ্ন)</option>
                  <option value="বাংলা">বাংলা (ব্যাকরণ ও সাহিত্য)</option>
                  <option value="গণিত">গণিত (বীজগণিত ও জ্যামিতি)</option>
                  <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                  <option value="রসায়ন">রসায়ন</option>
                  <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
                  <option value="সাধারণ জ্ঞান">সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক)</option>
                  <option value="চাকুরি প্রস্তুতি">চাকুরি প্রস্তুতি (বিসিএস, প্রাইমারি, ব্যাংক)</option>
                </select>
              </div>

              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl text-left space-y-2.5 border border-slate-100">
                <p className="text-xs sm:text-sm flex items-center space-x-2 text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>মোট প্রশ্ন: <strong>১০টি বহুনির্বাচনী (MCQ)</strong></span>
                </p>
                <p className="text-xs sm:text-sm flex items-center space-x-2 text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>বরাদ্দকৃত সময়: <strong>১০ মিনিট</strong></span>
                </p>
                <p className="text-xs sm:text-sm flex items-center space-x-2 text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>প্রতিটি প্রশ্নের মান: <strong>১ নম্বর</strong> (কোনো নেগেটিভ মার্কিং নেই)</span>
                </p>
                <p className="text-xs sm:text-sm flex items-center space-x-2 text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>পরীক্ষা শেষে তাৎক্ষণিক ফলাফল ও বিস্তারিত ব্যাখ্যা দেখতে পাবেন।</span>
                </p>
              </div>

              <button 
                onClick={() => startExam()} 
                className="gradient-button w-full py-3.5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center space-x-2"
              >
                <span>পরীক্ষা শুরু করুন</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Result View
  if (examSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 pt-6 sm:pt-8 pb-20 font-['Hind_Siliguri']">
        <div className="w-full max-w-7xl mx-auto px-0.5 sm:px-4 md:px-6">
          {/* Result Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm text-center mb-8">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${
              percentage >= 70 ? 'bg-emerald-100 text-emerald-600' : percentage >= 40 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
            }`}>
              <Award size={36} />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-1">পরীক্ষার ফলাফল</h2>
            <p className="text-sm text-slate-500 mb-6">
              {percentage >= 80 ? 'অসাধারণ ফলাফল! আপনার প্রস্তুতি খুবই চমৎকার।' :
               percentage >= 50 ? 'ভালো হয়েছে! আরেকটু প্রস্তুতি নিলে আরও ভালো করবেন।' :
               'আরও মনোযোগ দিয়ে অধ্যয়ন ও অনুশীলন করা প্রয়োজন।'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">প্রাপ্ত নম্বর</p>
                <p className="text-2xl font-bold text-primary">{correctCount} / {totalQuestions}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-xs text-emerald-600 mb-1">সঠিক উত্তর</p>
                <p className="text-2xl font-bold text-emerald-600">{correctCount}</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-xs text-rose-600 mb-1">ভুল উত্তর</p>
                <p className="text-2xl font-bold text-rose-600">{wrongCount}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs text-amber-600 mb-1">উত্তর দেননি</p>
                <p className="text-2xl font-bold text-amber-600">{skippedCount}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => startExam()}
                className="gradient-button w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-sm"
              >
                <RotateCcw size={16} />
                <span>পুনরায় পরীক্ষা দিন</span>
              </button>
              <Link
                to="/dashboard"
                className="nexes-button-secondary w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2"
              >
                <Home size={16} />
                <span>ড্যাশবোর্ডে ফিরে যান</span>
              </Link>
            </div>
          </div>

          {/* Question Review & Explanations */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 px-1">উত্তরমালা ও বিস্তারিত পর্যালোচনা:</h3>
            {questions.map((item, idx) => {
              const studentAnswer = answers[item.id];
              const isCorrect = studentAnswer && studentAnswer.trim() === item.answer.trim();
              const isSkipped = !studentAnswer;

              return (
                <div key={idx} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-slate-800 text-sm sm:text-base">
                      {idx + 1}. {item.question}
                    </p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold shrink-0 flex items-center space-x-1 ${
                      isCorrect 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : isSkipped 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isCorrect ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>সঠিক (+১)</span>
                        </>
                      ) : isSkipped ? (
                        <>
                          <HelpCircle size={13} />
                          <span>উত্তর দেননি (০)</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={13} />
                          <span>ভুল (০)</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                    {item.options.map((opt, i) => {
                      const isOptionCorrect = opt.trim() === item.answer.trim();
                      const isUserChoice = studentAnswer === opt;
                      
                      let bgClass = "bg-slate-50 border-slate-100 text-slate-600";
                      if (isOptionCorrect) {
                        bgClass = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                      } else if (isUserChoice && !isCorrect) {
                        bgClass = "bg-rose-50 border-rose-300 text-rose-800 line-through";
                      }

                      return (
                        <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between ${bgClass}`}>
                          <span>{['(ক)', '(খ)', '(গ)', '(ঘ)'][i] || String.fromCharCode(65 + i)}. {opt}</span>
                          {isOptionCorrect && <CheckCircle2 size={14} className="text-emerald-600 shrink-0 ml-1" />}
                          {isUserChoice && !isCorrect && <XCircle size={14} className="text-rose-600 shrink-0 ml-1" />}
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                      <strong>ব্যাখ্যা:</strong> {item.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Live Exam Screen
  const q = questions[currentIdx] || questions[0];

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800">মডেল টেস্ট - ০১</h2>
          <p className="text-xs text-slate-500 font-medium">প্রশ্ন {currentIdx + 1} / {questions.length}</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl font-mono font-bold text-sm flex items-center space-x-1.5 border border-red-100">
            <Zap size={16} />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>

          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="text-xs sm:text-sm bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 sm:px-4 py-1.5 rounded-xl font-bold transition-colors"
          >
            সাবমিট
          </button>
        </div>
      </header>

      {/* Question Number Palette Bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex items-center space-x-2 overflow-x-auto shrink-0 scrollbar-none">
        {questions.map((item, index) => {
          const isAnswered = !!answers[item.id];
          const isCurrent = index === currentIdx;
          return (
            <button
              key={index}
              onClick={() => setCurrentIdx(index)}
              className={`w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-all ${
                isCurrent
                  ? 'bg-primary text-white ring-2 ring-primary/30'
                  : isAnswered
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Body */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-[1800px] 2xl:max-w-[1860px] mx-auto w-full">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
            {currentIdx + 1}. {q.question}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt: string, i: number) => {
              const isSelected = answers[q.id] === opt;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                      : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {['ক', 'খ', 'গ', 'ঘ'][i] || String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isSelected && <CheckCircle2 size={18} className="text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Bottom Navigation Controls */}
      <footer className="bg-white border-t border-slate-100 p-4 shrink-0">
        <div className="w-full max-w-[1800px] 2xl:max-w-[1860px] mx-auto flex items-center justify-between gap-3">
          <button
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="nexes-button-secondary px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span>পূর্ববর্তী</span>
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(currentIdx + 1)}
              className="gradient-button px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-md"
            >
              <span>পরবর্তী প্রশ্ন</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="gradient-button px-6 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 shadow-md bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 size={16} />
              <span>পরীক্ষা সাবমিট করুন</span>
            </button>
          )}
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">পরীক্ষা সাবমিট করতে চান?</h3>
            <p className="text-xs text-slate-500">
              আপনি মোট {questions.length}টির মধ্যে {Object.keys(answers).length}টি প্রশ্নের উত্তর দিয়েছেন।
              {questions.length - Object.keys(answers).length > 0 && (
                <span className="block text-amber-600 font-medium mt-1">
                  ({questions.length - Object.keys(answers).length}টি প্রশ্নের উত্তর দেওয়া বাকি আছে)
                </span>
              )}
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="nexes-button-secondary flex-1 py-2.5 rounded-xl text-xs font-bold"
              >
                বাতিল
              </button>
              <button
                onClick={handleSubmitExam}
                className="gradient-button flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md"
              >
                হ্যাঁ, সাবমিট করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSystem;

