import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  AlertCircle, 
  Play, 
  Award, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LiveExamEngine } from './LiveExamEngine';
import { 
  getSharedLiveExam, 
  DEFAULT_DEMO_EXAM, 
  SharedLiveExam,
  getPublishedMarksheet,
  subscribeToPublishedMarksheet
} from '../../lib/liveExamStorage';
import { Exam, ExamResult } from '../../types';

interface StartExamScreenProps {
  examId?: string | null;
  onExit?: () => void;
}

export const StartExamScreen: React.FC<StartExamScreenProps> = ({ examId, onExit }) => {
  const [examData, setExamData] = useState<SharedLiveExam | null>(null);
  const [studentName, setStudentName] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [examFinishedResult, setExamFinishedResult] = useState<ExamResult | null>(null);
  const [matchedSubmission, setMatchedSubmission] = useState<any>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const loadExamByKey = (key: string) => {
    const found = getSharedLiveExam(key);
    if (found) {
      setExamData(found);
      setSelectedDuration(found.duration || 30);
      if (found.childName && found.childName !== 'শিক্ষার্থী') {
        setStudentName(found.childName);
      }
      setPinError(null);
      return true;
    }
    return false;
  };

  const handleLoadByPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    const success = loadExamByKey(pinInput.trim());
    if (!success) {
      setPinError('এই পিন কোড বা আইডি দিয়ে কোনো পরীক্ষা পাওয়া যায়নি। সঠিক ৬-ডিজিটের পিন লিখুন।');
    }
  };

  useEffect(() => {
    // Attempt to load exam from storage or URL
    let foundExam: SharedLiveExam | null = null;
    if (examId) {
      foundExam = getSharedLiveExam(examId);
    }

    if (!foundExam) {
      // Check window query params
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('id') || params.get('examId') || params.get('pin');
      if (queryId) {
        foundExam = getSharedLiveExam(queryId);
      }
    }

    // Fallback to default demo exam
    if (!foundExam) {
      foundExam = DEFAULT_DEMO_EXAM;
    }

    setExamData(foundExam);
    setSelectedDuration(foundExam.duration || 30);
    if (foundExam.childName && foundExam.childName !== 'শিক্ষার্থী') {
      setStudentName(foundExam.childName);
    }

    // Check for previous submission if available, but never force-open the finished result
    try {
      const targetId = foundExam.id || examId;
      const queryParams = new URLSearchParams(window.location.search);
      const qId = queryParams.get('id') || queryParams.get('examId');

      const assignedRaw = localStorage.getItem('dapathshala_parent_assigned_tests');
      if (assignedRaw) {
        const assignedList = JSON.parse(assignedRaw);
        const currentTest = assignedList.find((t: any) =>
          (targetId && (t.id === targetId || t.examId === targetId || t.pin === targetId)) || 
          (qId && (t.id === qId || t.examId === qId || t.pin === qId))
        );
        if (currentTest) {
          // If the test has all questions saved in questionsList or questions, ensure they are loaded
          const fullQ = currentTest.questionsList || currentTest.questions;
          if (Array.isArray(fullQ) && fullQ.length > 0) {
            const formatted = fullQ.map((q: any, idx: number) => {
              let correctIdx = 0;
              if (typeof q.correctAnswer === 'number') {
                correctIdx = q.correctAnswer;
              } else if (typeof q.correctAnswer === 'string' && q.options) {
                const fIdx = q.options.findIndex((opt: string) => opt.trim() === q.correctAnswer.trim());
                correctIdx = fIdx >= 0 ? fIdx : 0;
              }
              return {
                id: q.id || `q_${idx + 1}`,
                text: q.question || q.text || `প্রশ্ন ${idx + 1}`,
                options: q.options || ['ক', 'খ', 'গ', 'ঘ'],
                correctAnswer: correctIdx,
                explanation: q.explanation || ''
              };
            });
            foundExam.questions = formatted;
            foundExam.totalMarks = formatted.length;
          }
          if (currentTest.status === 'submitted' || currentTest.status === 'reviewed' || currentTest.isPublished === true) {
            setMatchedSubmission(currentTest);
          }
        }
      }
    } catch (e) {
      console.warn('Error checking existing exam submission state:', e);
    }
  }, [examId]);

  if (!examData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-bold">পরীক্ষার তথ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // If exam has started, render LiveExamEngine
  // If exam has started, render LiveExamEngine with questions
  if (isExamStarted) {
    const activeExamObject: any = {
      id: examData.id,
      title: examData.title,
      subject: examData.subject,
      duration: selectedDuration,
      date: new Date().toISOString(),
      totalMarks: examData.totalMarks || examData.questions.length,
      isPublished: false
    };

    return (
      <LiveExamEngine
        exam={activeExamObject}
        questions={examData.questions}
        studentName={studentName || examData.childName || 'আরাফাত রহমান'}
        childId="child_1"
        initialSubmission={undefined}
        onClose={() => {
          setIsExamStarted(false);
          if (onExit) onExit();
        }}
        onFinish={(res) => {
          setExamFinishedResult(res);
        }}
      />
    );
  }

  const durationOptions = [10, 15, 20, 25, 30, 45, 60];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Navigation Bar / Top Return */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (onExit) {
                onExit();
              } else {
                window.location.href = window.location.origin;
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            প্রধান পাতায় ফিরে যান
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            <ShieldCheck size={14} className="text-emerald-600" />
            সুরক্ষিত অনলাইন পরীক্ষা কেন্দ্র
          </div>
        </div>

        {/* Quick PIN Code Bar */}
        <form onSubmit={handleLoadByPin} className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">অন্য কোনো পরীক্ষার পিন কোড আছে?</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="৬-সংখ্যার পিন (যেমন: 489210)"
              className="flex-1 sm:w-48 p-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors shadow-xs"
            >
              পরীক্ষা খুঁজুন
            </button>
          </div>
        </form>

        {pinError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold flex items-center justify-between">
            <span>⚠️ {pinError}</span>
            <button onClick={() => setPinError(null)} className="text-red-500 font-bold p-1">✕</button>
          </div>
        )}

        {/* Hero Card */}
        <Card className="p-6 sm:p-10 border-2 border-indigo-100 shadow-xl bg-white rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

          {/* Exam Header */}
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold">
              <BookOpen size={14} />
              {examData.subject} • {examData.chapter}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {examData.title}
            </h1>

            <p className="text-slate-500 text-sm sm:text-base">
              অভিভাবক কর্তৃক অনুমোদিত কাস্টম মূল্যায়ন পরীক্ষা। মনোযোগ সহকারে প্রতিটি প্রশ্ন পড়ে উত্তর দিন।
            </p>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">মোট প্রশ্ন</span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-600">
                {examData.questions.length} টি
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">পূর্ণমান</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                {examData.totalMarks || examData.questions.length} নম্বর
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">সময়সীমা</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 flex items-center justify-center gap-1">
                <Clock size={22} className="text-amber-500" />
                {selectedDuration} মিনিট
              </span>
            </div>
          </div>

          {/* Duration Selector & Customization */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Clock size={16} className="text-indigo-600" />
                সময়সীমা (Duration) নির্ধারণ বা যাচাই করুন:
              </label>
              <span className="text-xs text-indigo-600 font-semibold">
                বর্তমান সময়: {selectedDuration} মিনিট
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {durationOptions.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSelectedDuration(mins)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedDuration === mins
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {mins} মিনিট
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * অভিভাবক বা শিক্ষার্থী প্রয়োজন অনুযায়ী পরীক্ষার জন্য উপযুক্ত সময় বেছে নিতে পারেন।
            </p>
          </div>

          {/* Student Name Input */}
          <div className="space-y-2 relative z-10">
            <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <UserCheck size={16} className="text-indigo-600" />
              পরীক্ষার্থীর নাম (ঐচ্ছিক):
            </label>
            <input
              type="text"
              placeholder="আপনার নাম লিখুন..."
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-3 pt-2 border-t border-slate-100 relative z-10">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-600" />
              পরীক্ষার্থীর জন্য বিশেষ নির্দেশাবলী:
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>প্রতিটি প্রশ্নের চারটি বিকল্প অপশনের মধ্যে একটি সঠিক উত্তর বেছে নিতে হবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>নির্ধারিত সময় শেষ হওয়ার সাথে সাথে পরীক্ষা স্বয়ংক্রিয়ভাবে জমা (Auto-submit) হবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>ফুলস্ক্রিন ও অ্যান্টি-চিটিং সুরক্ষা: অন্য ট্যাবে যাওয়া, কপি-পেস্ট ও রাইট-ক্লিক নিষেধ। ৩টি সতর্কতায় পরীক্ষা অটো-সাবমিট হবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>পরীক্ষা শেষে সঙ্গে সঙ্গে সঠিক উত্তরের ব্যাখ্যা ও পূর্ণাঙ্গ মূল্যায়ন দেখা যাবে।</span>
              </li>
            </ul>
          </div>

          {/* Start Exam CTA */}
          <div className="pt-2 relative z-10">
            <Button
              onClick={() => {
                try {
                  if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                } catch {}
                setIsExamStarted(true);
              }}
              className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-lg sm:text-xl rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Play size={22} className="fill-white" />
              পরীক্ষা শুরু করুন (Start Exam)
            </Button>
          </div>
        </Card>

        {/* Footer Guarantee */}
        <p className="text-center text-xs text-slate-400">
          দা পাঠশালা ডিজিটাল এডুকেশন সিস্টেম • মেধা বিকাশ ও নিরাপদ অনলাইন মূল্যায়ন
        </p>
      </div>
    </div>
  );
};
