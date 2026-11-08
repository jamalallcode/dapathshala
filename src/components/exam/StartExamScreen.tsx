import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  Play, 
  CircleCheck, 
  CheckCircle2, 
  FileText, 
  GraduationCap, 
  MessageSquare, 
  Award,
  AlertCircle
} from 'lucide-react';
import { LiveExamEngine } from './LiveExamEngine';
import { AssignedTest } from '../../types';
import { fetchTestFromServer, getStoredTests, saveStoredTests } from '../../lib/storage';

interface StartExamScreenProps {
  test: AssignedTest;
  onExit: () => void;
}

export const StartExamScreen: React.FC<StartExamScreenProps> = ({ test: initialTest, onExit }) => {
  const [test, setTest] = useState<AssignedTest>(initialTest);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    setTest(initialTest);
  }, [initialTest]);

  // Periodic check if submitted: automatically update when parent evaluates
  useEffect(() => {
    if (test.status !== 'submitted') return;

    let isCancelled = false;
    const checkEvaluation = async () => {
      try {
        const latest = await fetchTestFromServer(test.pin);
        if (latest && latest.status === 'reviewed' && !isCancelled) {
          setTest(latest);
          const localTests = getStoredTests();
          saveStoredTests(localTests.map(t => (t.id === latest.id || t.pin === latest.pin) ? latest : t));
        }
      } catch {}
    };

    checkEvaluation();
    const interval = setInterval(checkEvaluation, 3500);
    window.addEventListener('focus', checkEvaluation);

    return () => {
      isCancelled = true;
      clearInterval(interval);
      window.removeEventListener('focus', checkEvaluation);
    };
  }, [test.status, test.pin]);

  const isReviewed = test.status === 'reviewed';
  const isSubmitted = test.status === 'submitted';
  const isAlreadySubmitted = isReviewed || isSubmitted;

  if (isExamStarted) {
    return (
      <LiveExamEngine
        test={test}
        onExit={onExit}
        isReviewOnly={false}
      />
    );
  }

  if (isReviewMode) {
    return (
      <LiveExamEngine
        test={test}
        onExit={onExit}
        isReviewOnly={true}
      />
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden">
        
        {/* Back Button */}
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ড্যাশবোর্ডে ফিরে যান</span>
        </button>

        {isReviewed ? (
          /* ======================================================== */
          /* STATE 1: KHATA REVIEWED (মার্ক ও অভিভাবকের মন্তব্য প্রদর্শিত) */
          /* ======================================================== */
          <div className="text-center space-y-5 animate-in fade-in">
            {/* Top Badge with Green Check */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>খাতা দেখা হয়েছে ও মূল্যায়ন প্রকাশিত</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                অভিভাবক আপনার খাতা মূল্যায়ন করেছেন!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                "{test.title}" পরীক্ষার ফলাফল ও অভিভাবকের দিকনির্দেশনামূলক পরামর্শ নিচে দেওয়া হলো:
              </p>
            </div>

            {/* Score & Exam Details Card */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center flex flex-col justify-center">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                  প্রাপ্ত নম্বর
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-800 mt-0.5">
                  {test.score !== undefined ? `${test.score}%` : '৮৫%'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  পূর্ণমান: {test.totalMarks || 100}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 text-left flex flex-col justify-center text-xs space-y-1">
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">বিষয়:</span>
                  <span className="font-bold text-slate-800 truncate block">{test.subject}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[10px]">অধ্যায়:</span>
                  <span className="font-semibold text-slate-700 truncate block text-[11px]">{test.chapter}</span>
                </div>
              </div>
            </div>

            {/* Parent Feedback & Guidance Box */}
            {test.parentComment && (
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 sm:p-5 text-left space-y-2">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                  <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>অভিভাবকের দিকনির্দেশনামূলক মন্তব্য ও পরামর্শ:</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-2xs">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 italic leading-relaxed">
                    "{test.parentComment}"
                  </p>
                </div>
                <p className="text-[11px] text-indigo-700 font-medium">
                  ✓ এই ফলাফল ও অভিভাবকীয় মূল্যায়ন আপনার উন্নতির জন্য নির্ধারিত।
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsReviewMode(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>প্রতিটি প্রশ্নের সমাধান ও উত্তরপত্র দেখুন</span>
              </button>
              <button
                type="button"
                onClick={onExit}
                className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer transition-all"
              >
                ড্যাশবোর্ড
              </button>
            </div>
          </div>
        ) : isSubmitted ? (
          /* ======================================================== */
          /* STATE 2: SUBMITTED BUT PENDING PARENT EVALUATION        */
          /* ======================================================== */
          <div className="text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                ⏳ খাতা অভিভাবকের মূল্যায়নাধীন
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                উত্তরপত্র সফলভাবে জমা দেওয়া হয়েছে!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                আপনার খাতাটি অভিভাবকের কাছে পৌঁছেছে। অভিভাবক খাতা যাচাই ও মন্তব্য প্রদান করলে প্রাপ্ত নম্বর ও মতামত এই লিংকেই দেখতে পাবেন।
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">পরীক্ষা:</span>
                <span className="font-bold text-slate-800">{test.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">বিষয় ও অধ্যায়:</span>
                <span className="font-semibold text-slate-700">{test.subject} ({test.chapter})</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">অবস্থা:</span>
                <span className="font-bold text-amber-600">অভিভাবকের মূল্যায়নের অপেক্ষায়</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsReviewMode(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>উত্তরপত্র প্রাক-দর্শন</span>
              </button>
              <button
                type="button"
                onClick={onExit}
                className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer transition-all"
              >
                ড্যাশবোর্ড
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* STATE 3: READY TO TAKE EXAM (QUESTIONS KEPT SECRET)     */
          /* ======================================================== */
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                {test.subject}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {test.title}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                অধ্যায়: {test.chapter}
              </p>
            </div>

            {/* Test Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">সময়সীমা</p>
                  <p className="text-sm font-bold text-slate-800">
                    {test.durationMinutes} মিনিট
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">মোট প্রশ্ন</p>
                  <p className="text-sm font-bold text-slate-800">
                    {test.questionCount}টি
                  </p>
                </div>
              </div>
            </div>

            {/* Anti-Cheating & Exam Rules */}
            <div className="space-y-2 text-xs text-slate-700 bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-2 font-bold text-amber-900 mb-1.5 text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>পরীক্ষার বিশেষ নির্দেশনাবলী:</span>
              </div>
              <ul className="space-y-2 text-slate-700 text-xs sm:text-sm font-semibold">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <span>'পরীক্ষা শুরু করুন' বাটন চাপার আগে প্রশ্ন দেখা যাবে না</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <span>নকল এড়াতে ফ্রন্ট ক্যামেরা নজরদারি ও ফুলস্ক্রিন সুরক্ষা</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <span>নির্দিষ্ট সময় শেষে স্বয়ংক্রিয়ভাবে খাতা অটো-সাবমিট</span>
                </li>
              </ul>
            </div>

            {/* Start Exam CTA */}
            <button
              type="button"
              onClick={async () => {
                try {
                  if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                  }
                } catch (err) {
                  console.warn("Fullscreen error", err);
                }
                setIsExamStarted(true);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>ফুলস্ক্রিনে পরীক্ষা শুরু করুন</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
