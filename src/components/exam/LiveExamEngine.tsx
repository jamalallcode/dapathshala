import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { 
  ArrowLeft, Clock, CircleAlert, CircleCheck, Check, CheckCircle2,
  FileCheck, Send, ShieldCheck, ShieldAlert, X, FileText, Camera, 
  AlertTriangle, EyeOff, Maximize, MessageSquare 
} from "lucide-react";
import { getStoredTests, saveStoredTests, getStoredNotifications, saveStoredNotifications } from "../../lib/storage";
import { AssignedTest } from "../../types";

interface LiveExamEngineProps {
  test: AssignedTest;
  onExit: () => void;
  isReviewOnly?: boolean;
}

export const LiveExamEngine: React.FC<LiveExamEngineProps> = ({
  test,
  onExit,
  isReviewOnly = false
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    test.questions.forEach((q) => {
      if (q.studentAnswer) {
        initial[q.id] = q.studentAnswer;
      }
    });
    return initial;
  });

  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(isReviewOnly || test.status === 'submitted' || test.status === 'reviewed');
  
  // Anti-Cheating, Fullscreen & Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [lastWarning, setLastWarning] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);
  const [isHoveringTopBar, setIsHoveringTopBar] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Request Fullscreen Mode to lock out browser tabs and address bar
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  };

  // Fullscreen enforcement listener
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (!active) {
        triggerSuspiciousFlag('ফুলস্ক্রিন থেকে বের হওয়া বা নতুন ট্যাব খোলার চেষ্টা সনাক্ত হয়েছে!');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Request fullscreen on active exam load
    enterFullscreen();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isReviewOnly, isSubmitted]);

  // Block keyboard shortcuts for new tabs (Ctrl+T, Cmd+T, Ctrl+N, Ctrl+Tab, etc.)
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent New Tab (Ctrl+T / Cmd+T)
      if ((e.ctrlKey || e.metaKey) && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        e.stopPropagation();
        triggerSuspiciousFlag('নতুন ট্যাব (Ctrl+T) খোলার অপশন সম্পূর্ণ নিষিদ্ধ!');
        return false;
      }
      // Prevent New Window (Ctrl+N / Cmd+N)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        e.stopPropagation();
        triggerSuspiciousFlag('নতুন উইন্ডো (Ctrl+N) খোলার অপশন সম্পূর্ণ নিষিদ্ধ!');
        return false;
      }
      // Prevent Close Tab (Ctrl+W / Cmd+W)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Prevent Tab Switching (Ctrl+Tab, Ctrl+Shift+Tab, Ctrl+PageUp/PageDown, Ctrl+1..9)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Tab' || e.key === 'PageUp' || e.key === 'PageDown' || (e.key >= '1' && e.key <= '9'))) {
        e.preventDefault();
        e.stopPropagation();
        triggerSuspiciousFlag('ট্যাব পরিবর্তনের চেষ্টা নিষিদ্ধ!');
        return false;
      }
      // Prevent Inspect / DevTools
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.key === 'i' || e.key === 'I'))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isReviewOnly, isSubmitted]);

  // Detect cursor approaching top tab area
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 3) {
        setIsHoveringTopBar(true);
      } else if (e.clientY > 35) {
        setIsHoveringTopBar(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isReviewOnly, isSubmitted]);

  // Initialize Front Camera for Live Proctoring
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    let isMounted = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
            audio: false
          });
          if (isMounted) {
            mediaStreamRef.current = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.play().catch(() => {});
            }
            setCameraActive(true);
          }
        } else {
          setCameraError(true);
        }
      } catch (err) {
        // Fallback gracefully without breaking test if permission denied or no camera
        setCameraError(true);
      }
    }

    initCamera();

    // Cleanup camera stream
    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isReviewOnly, isSubmitted]);

  // Anti-Cheating Listeners: Tab Switch & Window Blur Detection
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerSuspiciousFlag('ট্যাব পরিবর্তন বা অন্য অ্যাপে যাওয়ার চেষ্টা সনাক্ত হয়েছে!');
      }
    };

    const handleWindowBlur = () => {
      triggerSuspiciousFlag('পরীক্ষার উইন্ডো থেকে ফোকাস সরানো হয়েছে!');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isReviewOnly, isSubmitted, violationCount]);

  const triggerSuspiciousFlag = (reason: string) => {
    setViolationCount(prev => {
      const next = prev + 1;
      setLastWarning(`⚠️ সতর্কতা (${next}/৩): ${reason}`);
      if (next >= 3) {
        // Auto-submit exam immediately on 3 violations
        setTimeout(() => {
          handleSubmitExam(true);
        }, 800);
      }
      return next;
    });

    setTimeout(() => {
      setLastWarning(null);
    }, 4500);
  };

  // Timer countdown & Auto-submit
  useEffect(() => {
    if (isReviewOnly || isSubmitted) return;

    if (timeLeft <= 0) {
      handleSubmitExam(false);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isReviewOnly, isSubmitted]);

  const handleSelectOption = (questionId: string, option: string) => {
    if (isReviewOnly || isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  // Submit Exam
  const handleSubmitExam = (isForcedByProctor: boolean = false) => {
    if (isSubmitted) return;

    // Stop camera
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }

    let correctCount = 0;
    const updatedQuestions = test.questions.map((q) => {
      const chosen = answers[q.id] || "";
      const isCorrect = chosen === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        ...q,
        studentAnswer: chosen,
        isCorrect
      };
    });

    const calculatedScore = Math.round((correctCount / test.questions.length) * 100);
    
    const updatedTest: AssignedTest = {
      ...test,
      status: "submitted",
      score: calculatedScore,
      questions: updatedQuestions,
      proctoringFlags: isForcedByProctor 
        ? ['নকলের চেষ্টার কারণে পরীক্ষা নির্ধারিত সময়ের পূর্বে স্বয়ংক্রিয়ভাবে জমা হয়েছে'] 
        : violationCount > 0 
        ? [`${violationCount} বার অন্য ট্যাবে যাওয়ার চেষ্টা সনাক্ত হয়েছে`] 
        : []
    };

    const allTests = getStoredTests();
    const updatedList = allTests.map((t) => t.id === test.id ? updatedTest : t);
    saveStoredTests(updatedList);

    // Notification for Parent
    const notifs = getStoredNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: "নতুন উত্তরপত্র জমা হয়েছে",
      message: `আপনার সন্তান "${test.title}" পরীক্ষা সফলভাবে সম্পন্ন করে খাতা জমা দিয়েছে। প্রাপ্ত স্কোর: ${calculatedScore}%। খাতা মূল্যায়ন করুন।`,
      time: "এইমাত্র",
      testId: test.id,
      isRead: false,
      forRole: "parent" as const
    };
    saveStoredNotifications([newNotif, ...notifs]);

    // Dispatch update event
    try {
      window.dispatchEvent(new Event('dapathshala_notifs_updated'));
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    setIsSubmitted(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const isReviewed = test.status === 'reviewed';

  return (
    <div 
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      
      {/* 1. Fullscreen Lockdown Shield Overlay when not in Fullscreen Mode */}
      {!isFullscreen && !isReviewOnly && !isSubmitted && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 text-center text-white space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40">
                🔒 কঠোর অ্যান্টি-চিটিং নিরাপত্তা
              </span>
              <h3 className="text-xl font-black">
                নতুন ট্যাব ও উইন্ডো খোলা সম্পূর্ণ নিষিদ্ধ
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                পরীক্ষা চলাকালে কোনো নতুন ট্যাব, ব্রাউজার উইন্ডো বা অন্য অ্যাপ্লিকেশন খোলার অপশন বন্ধ রাখা হয়েছে। পরীক্ষাটি শুধুমাত্র সম্পূর্ণ পর্দা (Fullscreen) মোডে দেওয়ার অনুমতি রয়েছে।
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-amber-300 font-semibold space-y-1 text-left">
              <p>• ফুলস্ক্রিন ছাড়া কোনো প্রশ্ন দেখতে বা উত্তর দিতে পারবেন না।</p>
              <p>• নতুন ট্যাব খোলার চেষ্টা সনাক্ত হলে পরীক্ষা স্বয়ংক্রিয়ভাবে বাতিল হয়ে যাবে।</p>
            </div>

            <button
              type="button"
              onClick={enterFullscreen}
              className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Maximize className="w-4.5 h-4.5" />
              <span>ফুলস্ক্রিন চালু করে পরীক্ষায় প্রবেশ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Top-bar Hover Warning */}
      {isHoveringTopBar && !isReviewOnly && !isSubmitted && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-rose-400 animate-pulse flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>ট্যাব বার বা ব্রাউজারের বাইরে মাউস নেওয়া সম্পূর্ণ নিষিদ্ধ! পরীক্ষা ফুলস্ক্রিনে রাখুন।</span>
        </div>
      )}

      {/* Realtime Anti-Cheating Floating Warning */}
      {lastWarning && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-black border border-rose-400 animate-bounce">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{lastWarning}</span>
        </div>
      )}

      {/* Floating Live Camera PIP Window during active exam */}
      {!isReviewOnly && !isSubmitted && (
        <div className="fixed bottom-5 right-5 z-40 bg-slate-900 border-2 border-emerald-500 rounded-2xl p-1.5 shadow-2xl w-36 sm:w-44 flex flex-col items-center">
          <div className="w-full h-24 sm:h-28 bg-slate-950 rounded-xl overflow-hidden relative flex items-center justify-center">
            {cameraActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover mirror"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-2 text-slate-400">
                <Camera className="w-6 h-6 mb-1 text-emerald-400" />
                <span className="text-[10px] font-bold">ক্যামেরা পর্যবেক্ষণ মোড</span>
              </div>
            )}
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full text-[9px] text-emerald-400 font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>LIVE</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-300 text-center mt-1">
            নকল প্রতিরোধে নজরদারি সক্রিয়
          </div>
        </div>
      )}

      {/* Top Exam Header Strip */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-xs sm:max-w-md">
              {test.title}
            </h2>
            {!isReviewOnly && !isSubmitted && (
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>নতুন ট্যাব লক ও ফুলস্ক্রিন সক্রিয়</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {isReviewOnly || isSubmitted ? "উত্তরপত্র ও খাতা পর্যালোচনা" : "লাইভ পরীক্ষা চলমান (ফ্রন্ট ক্যামেরা নজরদারি ও ফুলস্ক্রিন সুরক্ষা)"}
          </p>
        </div>

        {!isReviewOnly && !isSubmitted ? (
          <div className="flex items-center gap-2">
            {!isFullscreen && (
              <button
                type="button"
                onClick={enterFullscreen}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="ফুলস্ক্রিন মোড চালু করুন"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>ফুলস্ক্রিন</span>
              </button>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-black border ${
              timeLeft < 180 ? "bg-rose-50 text-rose-600 border-rose-200 animate-pulse" : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isReviewed ? "খাতা দেখা হয়েছে" : "মূল্যায়ন সম্পন্ন"}</span>
            {test.score !== undefined && (
              <span className="ml-1 pl-1.5 border-l border-emerald-300 font-black text-emerald-900">
                {test.score}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Parent Feedback & Approved Score Banner (When Reviewed) */}
      {(isReviewOnly || isSubmitted) && test.parentComment && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 sm:p-5 space-y-2 text-indigo-950 shadow-xs">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-900">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>অভিভাবকের মন্তব্য ও দিকনির্দেশনা:</span>
          </div>
          <p className="text-sm sm:text-base font-semibold italic text-slate-800 bg-white/70 p-3 rounded-xl border border-indigo-100">
            "{test.parentComment}"
          </p>
          <div className="flex items-center justify-between text-xs pt-1 font-semibold text-indigo-700">
            <span>চূড়ান্ত প্রাপ্ত নম্বর: {test.score}%</span>
            <span>অভিভাবক কর্তৃক অনুমোদিত ও প্রকাশিত ✓</span>
          </div>
        </div>
      )}

      {/* Post-Submission Success Notice for Student */}
      {isSubmitted && !isReviewOnly && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h3 className="text-lg font-black text-emerald-900">
            উত্তরপত্র সফলভাবে জমা হয়েছে!
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
            আপনার উত্তরপত্রটি অভিভাবকের কাছে পৌঁছেছে। অভিভাবক খাতা যাচাই ও দিকনির্দেশনামূলক মন্তব্য দিলে আপনি পূর্ণাঙ্গ ফলাফল ও মার্কস দেখতে পাবেন।
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onExit}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
            >
              মূল পাতায় ফিরে যান
            </button>
          </div>
        </div>
      )}

      {/* Questions Answering Sheet */}
      <div className="space-y-4">
        {test.questions.map((q, idx) => {
          const chosenAnswer = answers[q.id];
          const isCorrect = chosenAnswer === q.correctAnswer;
          const showGrading = isReviewOnly || isSubmitted;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                showGrading
                  ? isCorrect
                    ? "border-emerald-200 bg-emerald-50/10"
                    : chosenAnswer
                    ? "border-rose-200 bg-rose-50/10"
                    : "border-slate-200"
                  : chosenAnswer
                  ? "border-blue-400 shadow-xs"
                  : "border-slate-200"
              }`}
            >
              {/* Question Text */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q.question}
                  </h4>
                </div>

                {showGrading && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                      isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isCorrect ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>{isCorrect ? "সঠিক" : "ভুল"}</span>
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {q.options.map((opt, oIdx) => {
                  const isSelected = chosenAnswer === opt;
                  const isRightAnswer = q.correctAnswer === opt;

                  let optClass = "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700";

                  if (showGrading) {
                    if (isRightAnswer) {
                      optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                    } else if (isSelected && !isRightAnswer) {
                      optClass = "border-rose-400 bg-rose-50 text-rose-900 line-through";
                    } else {
                      optClass = "border-slate-200 bg-slate-50/30 text-slate-400";
                    }
                  } else if (isSelected) {
                    optClass = "border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs";
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isReviewOnly || isSubmitted}
                      onClick={() => handleSelectOption(q.id, opt)}
                      className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${optClass} ${
                        !isReviewOnly && !isSubmitted ? "cursor-pointer active:scale-[0.99]" : ""
                      }`}
                    >
                      <span>{opt}</span>
                      {showGrading && isRightAnswer && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {showGrading && isSelected && !isRightAnswer && (
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Solution / Explanation on Review */}
              {showGrading && q.explanation && (
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800 block mb-0.5">ব্যাখ্যা ও সমাধান:</span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Action Strip */}
      {!isReviewOnly && !isSubmitted && (
        <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200 shadow-xl flex items-center justify-between gap-4">
          <div className="text-xs text-slate-600 font-bold">
            উত্তর সম্পন্ন: <span className="text-blue-600 font-black">{answeredCount}</span> / {test.questions.length}টি
          </div>

          <button
            type="button"
            onClick={() => handleSubmitExam(false)}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>খাতা জমা দিন</span>
          </button>
        </div>
      )}

    </div>
  );
};
