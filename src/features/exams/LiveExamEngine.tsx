import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  RotateCcw, 
  Home, 
  Save, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Maximize2,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileCheck,
  Send,
  X,
  FileText,
  Award
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Exam, Question, ExamResult } from '../../types';
import { QUESTIONS } from '../../constants';
import { recordProctoringViolation, submitExamScript } from '../../lib/proctoringService';
import { FinalMarksheetModal, FinalMarksheetData } from './FinalMarksheetModal';

interface LiveExamEngineProps {
  exam: Exam;
  questions?: Question[];
  studentName?: string;
  childId?: string;
  onClose: () => void;
  onFinish?: (result: ExamResult) => void;
}

export const LiveExamEngine: React.FC<LiveExamEngineProps> = ({ 
  exam, 
  questions, 
  studentName = 'আরাফাত রহমান', 
  childId = 'child_1', 
  onClose, 
  onFinish 
}) => {
  const activeQuestions = questions && questions.length > 0 ? questions : QUESTIONS;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [startTime] = useState(Date.now());

  // Anti-Cheating / Anti-Proctoring States
  const [suspiciousCount, setSuspiciousCount] = useState<number>(0);
  const suspiciousCountRef = useRef<number>(0);
  const lastViolationTimeRef = useRef<number>(0);
  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    reason: string;
    count: number;
    isAutoSubmit?: boolean;
  } | null>(null);
  const [securityToast, setSecurityToast] = useState<string | null>(null);

  // Handwritten Upload & Submit Flow States
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [handwrittenImages, setHandwrittenImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [timeExpiredPrompt, setTimeExpiredPrompt] = useState(false);
  const [showFinalMarksheetModal, setShowFinalMarksheetModal] = useState(false);

  // Helper to request fullscreen
  const enterFullscreen = useCallback(() => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
  }, []);

  // Calculate and finalize results
  const calculateResult = useCallback((violationTerminated: boolean = false, flags?: number) => {
    const totalQuestions = activeQuestions.length;
    let correctAnswers = 0;
    
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const finalFlags = flags !== undefined ? flags : suspiciousCountRef.current;
    
    const examResult: ExamResult = {
      examId: exam.id,
      score: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      totalQuestions,
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      timeSpent,
      answers,
      suspiciousFlags: finalFlags,
      isViolationTerminated: violationTerminated
    };

    setResult(examResult);
    setIsFinished(true);
    localStorage.removeItem(`exam_progress_${exam.id}`);

    // Exit fullscreen if still active
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch {}
    }

    if (onFinish) {
      onFinish(examResult);
    }
  }, [answers, exam.id, startTime, activeQuestions, onFinish]);

  const handleOpenSubmitModal = (expired: boolean = false) => {
    setTimeExpiredPrompt(expired);
    setShowSubmitModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setHandwrittenImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddSampleHandwrittenImage = () => {
    const sample = 'https://picsum.photos/seed/exam_script_bangla/800/1100';
    setHandwrittenImages(prev => [...prev, sample]);
  };

  const handleRemoveHandwrittenImage = (index: number) => {
    setHandwrittenImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const totalQuestions = activeQuestions.length;
    let correctAnswers = 0;
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const scorePercent = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const finalFlags = suspiciousCountRef.current;

    const payload = {
      id: exam.id || 'sub_' + Date.now(),
      examId: exam.id,
      title: exam.title,
      subject: exam.subject,
      chapter: (exam as any).chapter || 'মূল্যায়ন পরীক্ষা',
      questions: activeQuestions,
      duration: exam.duration,
      totalMarks: exam.totalMarks || totalQuestions,
      studentName: studentName || 'আরাফাত রহমান',
      childId: childId || 'child_1',
      answers,
      handwrittenImages,
      submittedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', আজ',
      status: 'submitted' as const,
      score: scorePercent,
      redFlagsCount: finalFlags,
      violations: finalFlags > 0 ? [
        'অন্য ট্যাব বা উইন্ডো পরিবর্তনের চেষ্টা সনাক্ত হয়েছে'
      ] : []
    };

    try {
      await submitExamScript(payload);
    } catch (err) {
      console.warn('Submit script error:', err);
    }

    calculateResult(false, finalFlags);
    setIsSubmitting(false);
    setShowSubmitModal(false);
    setSubmissionComplete(true);
  };

  // Trigger security violation and handle auto-submit on 3 flags
  const triggerViolation = useCallback((
    reason: string, 
    violationType: 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'copy_attempt' | 'right_click' = 'tab_switch'
  ) => {
    if (isFinished) return;
    const now = Date.now();
    // Debounce within 1500ms to avoid duplicate count when blur & visibilitychange occur simultaneously
    if (now - lastViolationTimeRef.current < 1500) {
      return;
    }
    lastViolationTimeRef.current = now;

    const nextCount = suspiciousCountRef.current + 1;
    suspiciousCountRef.current = nextCount;
    setSuspiciousCount(nextCount);

    // Record to Supabase & Realtime BroadcastChannel
    recordProctoringViolation({
      examId: exam.id,
      examTitle: exam.title,
      studentName: studentName || 'আরাফাত রহমান',
      childId: childId || 'child_1',
      violationType,
      violationDetails: reason,
      flagCount: nextCount,
      isAutoSubmitted: nextCount >= 3
    }).catch(err => console.warn('Proctoring log record note:', err));

    if (nextCount >= 3) {
      // 3rd violation: Auto-submit exam immediately
      setWarningModal({
        isOpen: true,
        reason: 'সতর্কতা সীমা অতিক্রান্ত (৩/৩)! ৩ বার নিয়ম ভঙ্গের কারণে পরীক্ষাটি স্বয়ংক্রিয়ভাবে জমা (Auto-submit) করা হয়েছে।',
        count: 3,
        isAutoSubmit: true
      });
      calculateResult(true, 3);
    } else {
      setWarningModal({
        isOpen: true,
        reason,
        count: nextCount,
        isAutoSubmit: false
      });
    }
  }, [isFinished, calculateResult, exam.id, exam.title, studentName, childId]);

  // Display security toast message
  const showToast = useCallback((msg: string) => {
    setSecurityToast(msg);
    setTimeout(() => {
      setSecurityToast(prev => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  // 1. Fullscreen lifecycle & exit detection
  useEffect(() => {
    // Attempt fullscreen on mount
    enterFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isFinished) {
        triggerViolation('ফুলস্ক্রিন মোড থেকে বের হওয়া সনাক্ত হয়েছে!', 'fullscreen_exit');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        try {
          document.exitFullscreen().catch(() => {});
        } catch {}
      }
    };
  }, [isFinished, enterFullscreen, triggerViolation]);

  // 2. Tab switch & window blur detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isFinished) {
        triggerViolation('পরীক্ষা চলাকালীন অন্য ট্যাব খোলার চেষ্টা করেছে', 'tab_switch');
      }
    };

    const handleBlur = () => {
      if (!isFinished) {
        triggerViolation('ব্রাউজার থেকে বের হওয়ার বা উইন্ডো পরিবর্তন করার চেষ্টা করেছে', 'window_blur');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isFinished, triggerViolation]);

  // 3. Right-click, Copy, Cut, Paste, Text selection & Devtools keys prevention
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showToast('⚠️ পরীক্ষা চলাকালীন মাউসের রাইট-ক্লিক ব্লক করা আছে!');
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      showToast('⚠️ পরীক্ষার প্রশ্ন বা টেক্সট কপি করা নিষিদ্ধ!');
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, PrintScreen, Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+Shift+I
      if (
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
        showToast('⚠️ এই শর্টকাটটি পরীক্ষা চলাকালীন নিষিদ্ধ!');
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCut);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [showToast]);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`exam_progress_${exam.id}`);
    if (savedProgress) {
      const { answers: savedAnswers, timeLeft: savedTime } = JSON.parse(savedProgress);
      setAnswers(savedAnswers);
      if (savedTime < timeLeft) setTimeLeft(savedTime);
    }
  }, [exam.id]);

  // Save progress to localStorage
  useEffect(() => {
    if (!isFinished) {
      localStorage.setItem(`exam_progress_${exam.id}`, JSON.stringify({
        answers,
        timeLeft
      }));
    }
  }, [answers, timeLeft, exam.id, isFinished]);

  // Timer logic
  useEffect(() => {
    if (isFinished) return;

    if (timeLeft <= 0) {
      handleOpenSubmitModal(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, calculateResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!activeQuestions[currentQuestionIndex]) return;
    setAnswers(prev => ({
      ...prev,
      [activeQuestions[currentQuestionIndex].id]: optionIndex
    }));
  };

  const currentQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];
  const progress = activeQuestions.length > 0 ? (Object.keys(answers).length / activeQuestions.length) * 100 : 0;

  // Render Result Screen
  if (isFinished && result) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6">
              <Trophy size={40} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">পরীক্ষা সম্পন্ন হয়েছে!</h1>
            <p className="text-slate-500 text-base sm:text-lg">আপনার অর্জিত ফলাফল নিচে দেওয়া হলো</p>
          </motion.div>

          {/* Exam Completed Success Message Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl shadow-xl shadow-emerald-200 border border-emerald-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 text-left"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider">
                  পরীক্ষা সম্পন্ন বার্তা
                </span>
                <h2 className="text-xl font-black">
                  পরীক্ষা সফলভাবে সম্পন্ন হয়েছে!
                </h2>
                <p className="text-xs text-emerald-100 font-medium">
                  আপনার উত্তরপত্র এবং {handwrittenImages.length}টি হাতের লেখা খাতার পৃষ্ঠা সফলভাবে জমা নেওয়া হয়েছে। অভিভাবকের ড্যাশবোর্ডে "নতুন খাতা জমা পড়েছে" নোটিফিকেশন পাঠানো হয়েছে।
                </p>
              </div>
            </div>
          </motion.div>

          {/* Uploaded Handwritten Scripts Preview if any */}
          {handwrittenImages.length > 0 && (
            <Card className="p-5 border-none shadow-lg bg-white rounded-3xl mb-8 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Camera size={16} className="text-indigo-600" />
                  জমাকৃত হাতের লেখা উত্তরপত্র ({handwrittenImages.length}টি পৃষ্ঠা)
                </h3>
                <span className="text-xs text-indigo-600 font-semibold">মূল্যায়নের জন্য প্রস্তুত</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {handwrittenImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-3/4">
                    <img src={img} alt={`পৃষ্ঠা ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      পৃষ্ঠা {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Anti-Cheating Termination Alert */}
          {result.isViolationTerminated && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-red-50 border-2 border-red-200 rounded-3xl flex items-start gap-4 mb-8 text-left shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-black text-red-950">
                  অ্যান্টি-চিটিং অটো-সাবমিট রিপোর্ট (৩টি সতর্কতা অতিক্রান্ত)
                </h3>
                <p className="text-xs sm:text-sm text-red-800 leading-relaxed font-medium">
                  পরীক্ষা চলাকালীন ৩ বার অন্য ট্যাবে যাওয়া, উইন্ডো মিনিমাইজ করা বা অননুমোদিত কার্যকলাপ সনাক্ত হওয়ায় পরীক্ষাটি স্বয়ংক্রিয়ভাবে নির্ধারিত সময়ের আগেই জমা নেওয়া হয়েছে।
                </p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6 border-none shadow-lg bg-white rounded-3xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">আপনার স্কোর</p>
              <p className="text-4xl font-black text-emerald-600">{result.score.toFixed(0)}%</p>
            </Card>
            <Card className="text-center p-6 border-none shadow-lg bg-white rounded-3xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">সঠিক উত্তর</p>
              <p className="text-4xl font-black text-blue-600">{result.correctAnswers}/{result.totalQuestions}</p>
            </Card>
            <Card className="text-center p-6 border-none shadow-lg bg-white rounded-3xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">সময় লেগেছে</p>
              <p className="text-4xl font-black text-purple-600">{Math.floor(result.timeSpent / 60)} মিনিট</p>
            </Card>
          </div>

          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-slate-900">বিস্তারিত পর্যালোচনা</h2>
            {activeQuestions.map((q, idx) => {
              const userAnswer = result.answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <Card key={q.id} className={`border-2 rounded-3xl ${isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
                  <div className="flex items-start gap-4 p-5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                      {idx + 1}
                    </div>
                    <div className="space-y-4 flex-1">
                      <p className="font-bold text-slate-900 text-base sm:text-lg">{q.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, optIdx) => {
                          const isUserChoice = userAnswer === optIdx;
                          const isCorrectChoice = q.correctAnswer === optIdx;
                          return (
                            <div 
                              key={optIdx}
                              className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-between ${
                                isCorrectChoice ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 
                                isUserChoice ? 'border-red-500 bg-red-50 text-red-900 font-bold' : 
                                'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrectChoice && <CheckCircle2 size={16} className="text-emerald-600 shrink-0 ml-2" />}
                              {isUserChoice && !isCorrectChoice && <AlertCircle size={16} className="text-red-600 shrink-0 ml-2" />}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="p-4 bg-white/70 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-600">
                          <span className="font-bold text-slate-900">ব্যাখ্যা:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1 rounded-2xl gap-2 py-5 bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold cursor-pointer" 
              onClick={() => setShowFinalMarksheetModal(true)}
            >
              <Award size={20} />
              ফাইনাল যৌথ মার্কশিট ও খাতা দেখুন
            </Button>
            <Button variant="primary" size="lg" className="flex-1 rounded-2xl gap-2 py-5" onClick={() => window.location.reload()}>
              <RotateCcw size={20} />
              আবার পরীক্ষা দিন
            </Button>
            <Button variant="outline" size="lg" className="flex-1 rounded-2xl gap-2 py-5" onClick={onClose}>
              <Home size={20} />
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          </div>
        </div>

        {/* Final Joint Marksheet Modal */}
        {showFinalMarksheetModal && (
          <FinalMarksheetModal
            data={{
              id: exam.id,
              title: exam.title,
              subject: exam.subject,
              childName: studentName,
              score: Math.round(result.score),
              totalScoreObtained: result.correctAnswers,
              totalPossible: result.totalQuestions,
              publishedAt: 'এখনই সম্পন্ন',
              evaluationMode: 'ai',
              aiFeedback: `এআই স্বয়ংক্রিয় মূল্যায়নে শিক্ষার্থী ${result.score.toFixed(0)}% স্কোর করেছে। মোট ${result.totalQuestions}টি প্রশ্নের মধ্যে ${result.correctAnswers}টি সঠিক হয়েছে।`,
              parentComment: 'খাতা মূল্যায়ন ও ফাইনাল ফলাফল অনুমোদন সম্পন্ন হয়েছে। ভালো করে অনুশীলন চালিয়ে যাও!',
              handwrittenImages: handwrittenImages,
              questions: activeQuestions,
              answers: result.answers
            }}
            onClose={() => setShowFinalMarksheetModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col select-none">
      {/* Exam Header */}
      <header className="bg-slate-900 text-white px-4 py-3 sm:px-8 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer" title="ফিরে যান">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="font-black text-base sm:text-lg line-clamp-1">{exam.title}</h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{exam.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Anti-Cheating Live Proctoring Indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            suspiciousCount === 0
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : suspiciousCount === 1
              ? 'border-amber-500/40 bg-amber-500/20 text-amber-300 animate-pulse'
              : 'border-red-500/50 bg-red-500/20 text-red-300 animate-pulse'
          }`}>
            {suspiciousCount === 0 ? (
              <ShieldCheck size={15} className="text-emerald-400" />
            ) : (
              <ShieldAlert size={15} className="text-red-400" />
            )}
            <span>
              {suspiciousCount === 0 ? 'প্রক্টরিং সক্রিয় • ০/৩' : `সতর্কতা: ${suspiciousCount}/৩`}
            </span>
          </div>

          {/* Fullscreen Button if user exited */}
          {!document.fullscreenElement && (
            <button
              onClick={enterFullscreen}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer text-xs flex items-center gap-1"
              title="ফুলস্ক্রিন মোড চালু করুন"
            >
              <Maximize2 size={16} />
              <span className="hidden md:inline">ফুলস্ক্রিন</span>
            </button>
          )}

          {/* Timer Display */}
          <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl border-2 ${
            timeLeft < 300 
              ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' 
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
          }`}>
            <Clock size={18} />
            <span className="font-black text-lg sm:text-xl tabular-nums">{formatTime(timeLeft)}</span>
          </div>

          <Button 
            variant="primary" 
            className="hidden sm:flex rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none px-5 py-2 text-xs font-bold cursor-pointer" 
            onClick={() => handleOpenSubmitModal(false)}
          >
            সাবমিট করুন
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-emerald-500"
        />
      </div>

      {/* Main Exam Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="flex items-center justify-between">
                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest">
                  প্রশ্ন {currentQuestionIndex + 1} / {activeQuestions.length}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                    <Save size={14} />
                    অটো-সেভড
                  </div>
                  {/* Mobile Proctoring Counter */}
                  <div className={`sm:hidden px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    suspiciousCount === 0 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    সতর্কতা: {suspiciousCount}/৩
                  </div>
                </div>
              </div>

              <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
                {currentQuestion.text}
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`group relative flex items-center p-4 sm:p-6 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' 
                          : 'border-white bg-white hover:border-slate-200 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black mr-3 sm:mr-4 transition-colors ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-base sm:text-lg font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {option}
                      </span>
                      {isSelected && (
                        <div className="ml-auto text-emerald-600">
                          <CheckCircle2 size={24} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Exam Footer Navigation */}
      <footer className="bg-white border-t border-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-2xl gap-2 px-4 sm:px-8 cursor-pointer text-xs sm:text-sm font-bold"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">আগের প্রশ্ন</span>
          </Button>

          <div className="hidden sm:flex gap-2">
            {activeQuestions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-xl font-bold transition-all cursor-pointer ${
                  currentQuestionIndex === idx ? 'bg-slate-900 text-white scale-110 shadow-lg' : 
                  answers[activeQuestions[idx].id] !== undefined ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === activeQuestions.length - 1 ? (
            <Button 
              variant="primary" 
              size="lg" 
              className="rounded-2xl gap-2 px-4 sm:px-8 bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-xs sm:text-sm font-bold"
              onClick={() => handleOpenSubmitModal(false)}
            >
              পরীক্ষা শেষ করুন
              <CheckCircle2 size={18} />
            </Button>
          ) : (
            <Button 
              variant="primary" 
              size="lg" 
              className="rounded-2xl gap-2 px-4 sm:px-8 cursor-pointer text-xs sm:text-sm font-bold"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              <span className="hidden sm:inline">পরবর্তী প্রশ্ন</span>
              <ChevronRight size={18} />
            </Button>
          )}
        </div>
      </footer>

      {/* Security Toast notification (for blocked copy, right-click, etc.) */}
      <AnimatePresence>
        {securityToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] px-4 py-2.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-slate-700/80 pointer-events-none"
          >
            <ShieldAlert size={18} className="text-amber-400 shrink-0" />
            <span>{securityToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anti-Cheating Warning Dialog Modal */}
      <AnimatePresence>
        {warningModal?.isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 max-w-lg w-full bg-white rounded-3xl shadow-2xl border-2 border-red-200 overflow-hidden p-6 sm:p-8 space-y-5 text-center"
            >
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
                warningModal.count >= 3 
                  ? 'bg-red-600 text-white shadow-red-200 animate-bounce' 
                  : 'bg-amber-100 text-amber-600 shadow-amber-100'
              }`}>
                <ShieldAlert size={36} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {warningModal.count >= 3 
                    ? 'পরীক্ষা অটো-সাবমিট হয়েছে!' 
                    : 'সতর্কতা! পরীক্ষা চলাকালীন অন্য ট্যাবে যাওয়া নিষেধ'}
                </h3>
                <div className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-xl text-xs sm:text-sm font-bold border border-red-200">
                  {warningModal.reason}
                </div>
              </div>

              {/* Suspicious Flags Counter Visualization */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">সন্দেহজনক কার্যকলাপ (Suspicious Flags):</span>
                  <span className={`px-2 py-0.5 rounded-lg ${
                    warningModal.count >= 3 ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {warningModal.count} / ৩
                  </span>
                </div>

                {/* 3 Flags Visual Progress Indicators */}
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((flagNum) => (
                    <div
                      key={flagNum}
                      className={`h-2.5 rounded-full transition-all ${
                        flagNum <= warningModal.count
                          ? 'bg-red-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {warningModal.count === 1 && '⚠️ প্রথম সতর্কতা: পরীক্ষা চলাকালীন অন্য ট্যাব, উইন্ডো বা অ্যাপ খোলা সম্পূর্ণ নিষেধ। আর ২টি সতর্কতায় পরীক্ষা বাতিল ও অটো-সাবমিট হবে।'}
                  {warningModal.count === 2 && '🚨 চূড়ান্ত সতর্কতা! আর মাত্র ১ বার অন্য ট্যাবে গেলে পরীক্ষাটি সাথে সাথে অটো-সাবমিট হয়ে যাবে।'}
                  {warningModal.count >= 3 && '⛔ সর্বোচ্চ ৩ বার নিয়ম ভাঙার কারণে পরীক্ষাটি তাৎক্ষণিক স্বয়ংক্রিয়ভাবে সমাপ্ত ও সাবমিট করা হয়েছে।'}
                </p>
              </div>

              {/* Modal Action Button */}
              <div>
                {warningModal.count < 3 ? (
                  <Button
                    variant="primary"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 cursor-pointer"
                    onClick={() => {
                      setWarningModal(null);
                      enterFullscreen();
                    }}
                  >
                    আমি বুঝতে পেরেছি, পরীক্ষা চালিয়ে যান
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 cursor-pointer"
                    onClick={() => {
                      setWarningModal(null);
                    }}
                  >
                    ফলাফল ও পর্যালোচনা দেখুন
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Exam & Handwritten Upload Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!timeExpiredPrompt) setShowSubmitModal(false);
              }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {timeExpiredPrompt ? 'সময় সমাপ্ত • উত্তরপত্র জমা দিন' : 'পরীক্ষা সম্পন্ন ও উত্তরপত্র জমা'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {exam.title} • {exam.subject}
                    </p>
                  </div>
                </div>
                {!timeExpiredPrompt && (
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {timeExpiredPrompt && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-amber-900">
                    <Clock size={18} className="text-amber-600 shrink-0" />
                    <span>পরীক্ষার নির্ধারিত সময় শেষ হয়েছে। চূড়ান্তভাবে খাতা জমা দিতে নিচে ক্লিক করুন।</span>
                  </div>
                )}

                {/* Progress Summary */}
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">উত্তর দেওয়া হয়েছে</span>
                    <span className="text-emerald-600 font-black text-base">
                      {Object.keys(answers).length} / {activeQuestions.length} টি
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">অনুত্থিত প্রশ্ন</span>
                    <span className="text-slate-700 font-bold text-base">
                      {activeQuestions.length - Object.keys(answers).length} টি
                    </span>
                  </div>
                </div>

                {/* Handwritten Answer Script Photo Upload Section */}
                <div className="space-y-3 p-4 bg-indigo-50/50 rounded-2xl border-2 border-dashed border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Camera size={16} className="text-indigo-600" />
                        হাতের লেখা উত্তরপত্রের ছবি আপলোড (সৃজনশীল / খাতা)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        খাতায় লেখা উত্তরের ছবি তুলুন যাতে অভিভাবক বা এআই লাল কালিতে মূল্যায়ন করতে পারে।
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {handwrittenImages.length}টি পাতা
                    </span>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <label
                      htmlFor="camera-upload-input"
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all"
                    >
                      <Camera size={16} />
                      ক্যামেরা দিয়ে ছবি তুলুন
                      <input
                        id="camera-upload-input"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>

                    <label
                      htmlFor="gallery-upload-input"
                      className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-all"
                    >
                      <Upload size={16} className="text-indigo-600" />
                      ফাইল / গ্যালারি থেকে ছবি নিন
                      <input
                        id="gallery-upload-input"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleAddSampleHandwrittenImage}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      <FileText size={14} />
                      নমুনা খাতার পাতা যোগ করুন
                    </button>
                  </div>

                  {/* Preview Thumbnails */}
                  {handwrittenImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-2">
                      {handwrittenImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-300 aspect-3/4 bg-slate-100">
                          <img src={img} alt={`পৃষ্ঠা ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-slate-900/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                            পৃষ্ঠা {idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveHandwrittenImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm cursor-pointer"
                            title="মুছুন"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 space-y-1">
                  <div className="font-bold text-slate-700">খাতা জমার নিয়মাবলী:</div>
                  <p>• সাবমিট বাটনে চাপ দিলে আপনার উত্তরপত্র অভিভাবকের ড্যাশবোর্ডে সাথে সাথে পাঠানো হবে।</p>
                  <p>• অভিভাবক এআই দিয়ে স্বয়ংক্রিয় দাগ বা নিজে দেখে প্রতিটি প্রশ্নে মূল্যায়ন ও মন্তব্য করবেন।</p>
                </div>
              </div>

              {/* Modal Footer / Submit Button */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                {!timeExpiredPrompt && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSubmitModal(false)}
                    className="rounded-xl text-xs font-bold text-slate-600 px-4"
                  >
                    ফিরে যান
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <span>খাতা জমা নেওয়া হচ্ছে...</span>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>চূড়ান্তভাবে খাতা জমা দিন (Submit Exam)</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
