import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Printer, 
  Share2, 
  X, 
  Sparkles, 
  UserCheck, 
  Clock, 
  Maximize2, 
  ShieldCheck,
  Edit3,
  ThumbsUp,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export interface FinalMarksheetData {
  id: string;
  examId?: string;
  title: string;
  subject: string;
  chapter?: string;
  childName?: string;
  studentName?: string;
  score: number; // percentage
  totalScoreObtained?: number;
  totalPossible?: number;
  totalMarks?: number;
  publishedAt?: string;
  submittedAt?: string;
  evaluationMode?: 'ai' | 'manual';
  aiFeedback?: string;
  parentComment?: string;
  handwrittenImages?: string[];
  questions?: Array<{
    id?: string;
    text?: string;
    question?: string;
    options?: string[];
    correctAnswer?: number | string;
    explanation?: string;
    marks?: number;
  }>;
  answers?: Record<string, number | string>;
  aiDetailedMarking?: Array<{
    questionId: string;
    isCorrect: boolean;
    marksObtained: number;
    maxMarks: number;
    redInkNote: string;
    isOverridden?: boolean;
  }>;
  manualGrades?: Record<string, {
    marks: number;
    comment: string;
  }>;
}

interface FinalMarksheetModalProps {
  data: FinalMarksheetData;
  onClose: () => void;
}

export const FinalMarksheetModal: React.FC<FinalMarksheetModalProps> = ({ data, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const studentName = data.studentName || data.childName || 'শিক্ষার্থী';
  const questionsList = (data.questions && Array.isArray(data.questions) && data.questions.length > 0)
    ? data.questions
    : [
        {
          id: 'q1',
          text: '(a + b)² এর সঠিক সম্প্রসারিত রূপ কোনটি?',
          options: ['a² + 2ab + b²', 'a² - 2ab + b²', 'a² + b²', 'a² + ab + b²'],
          correctAnswer: 0,
          explanation: 'বীজগণিতের বর্গের মৌলিক সূত্র: (a + b)² = a² + 2ab + b²',
          marks: 1
        },
        {
          id: 'q2',
          text: 'যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?',
          options: ['16', '14', '18', '12'],
          correctAnswer: 1,
          explanation: 'x² + 1/x² = (x + 1/x)² - 2 = 4² - 2 = 16 - 2 = 14',
          marks: 1
        },
        {
          id: 'q3',
          text: 'একটি দ্বিঘাত সমীকরণের সর্বোচ্চ ঘাত কত?',
          options: ['১', '২', '৩', '৪'],
          correctAnswer: 1,
          explanation: 'যে সমীকরণে চলকের সর্বোচ্চ ঘাত ২ তাকে দ্বিঘাত সমীকরণ বলা হয়।',
          marks: 1
        },
        {
          id: 'q4',
          text: 'সমকোণী ত্রিভুজের অতিভুজ ১৫ সেমি ও ভূমি ১২ সেমি হলে লম্ব কত সেমি?',
          options: ['৯ সেমি', '১০ সেমি', '৮ সেমি', '১১ সেমি'],
          correctAnswer: 0,
          explanation: 'পিথাগোরাসের সূত্র: লম্ব = √(১৫² - ১২²) = √(২২৫ - ১৪৪) = √৮১ = ৯ সেমি',
          marks: 1
        },
        {
          id: 'q5',
          text: 'নিচের কোনটি মৌলিক সংখ্যা?',
          options: ['৯', '১৫', '২৩', '২৭'],
          correctAnswer: 2,
          explanation: '২৩ একটি মৌলিক সংখ্যা কারণ এর ১ ও ২৩ ছাড়া অন্য কোনো গুণনীয়ক নেই।',
          marks: 1
        }
      ];

  // Calculate scores
  const totalQuestions = questionsList.length;
  let totalMarksPossible = data.totalPossible || totalQuestions;
  let totalMarksObtained = data.totalScoreObtained;

  if (totalMarksObtained === undefined) {
    if (data.aiDetailedMarking && data.aiDetailedMarking.length > 0) {
      totalMarksObtained = data.aiDetailedMarking.reduce((sum, d) => sum + Number(d.marksObtained || 0), 0);
      totalMarksPossible = data.aiDetailedMarking.reduce((sum, d) => sum + Number(d.maxMarks || 1), 0);
    } else if (data.manualGrades) {
      totalMarksObtained = Object.values(data.manualGrades).reduce((sum: number, g: any) => sum + Number(g?.marks || 0), 0);
    } else {
      totalMarksObtained = Math.round((data.score / 100) * totalMarksPossible * 10) / 10;
    }
  }

  const percentage = data.score !== undefined ? data.score : Math.round((totalMarksObtained / totalMarksPossible) * 100);

  // Grade calculation
  const getGrade = (pct: number) => {
    if (pct >= 80) return { letter: 'A+', label: 'অসাধারণ মেধা (Outstanding)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (pct >= 70) return { letter: 'A', label: 'খুব ভালো (Very Good)', color: 'text-blue-700 bg-blue-100 border-blue-300' };
    if (pct >= 60) return { letter: 'A-', label: 'ভালো (Good)', color: 'text-indigo-700 bg-indigo-100 border-indigo-300' };
    if (pct >= 50) return { letter: 'B', label: 'সন্তোষজনক (Satisfactory)', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    return { letter: 'C', label: 'আরো অনুশীলন প্রয়োজন (Needs Improvement)', color: 'text-rose-700 bg-rose-100 border-rose-300' };
  };

  const gradeInfo = getGrade(percentage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200"
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Award size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  ফাইনাল মূল্যায়িত ফলাফল ও মার্কশিট
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  <CheckCircle2 size={11} /> যৌথ অনুমোদিত
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {data.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="মার্কশিট প্রিন্ট / সংরক্ষণ করুন"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">প্রিন্ট</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* 1. Student & Exam Meta Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">শিক্ষার্থীর নাম</span>
              <span className="font-bold text-slate-800 text-sm">{studentName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">বিষয় ও অধ্যায়</span>
              <span className="font-bold text-slate-800 text-sm">{data.subject} {data.chapter ? `• ${data.chapter}` : ''}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">মূল্যায়ন সম্পন্ন সময়</span>
              <span className="font-bold text-slate-800 text-sm">{data.publishedAt || 'আজ, অনুমোদিত'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">মূল্যায়ন মাধ্যম</span>
              <span className="font-bold text-indigo-600 text-sm flex items-center gap-1">
                <Sparkles size={14} /> এআই + অভিভাবক রিভিও
              </span>
            </div>
          </div>

          {/* 2. Total Marks & Score Hero Banner */}
          <div className="p-6 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                  <CheckCircle2 size={14} /> অভিভাবক কর্তৃক চূড়ান্ত অনুমোদিত ফলাফল
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-200">
                  অভিনন্দন, <span className="text-white font-black">{studentName}</span>! তোমার পরীক্ষার ফলাফল প্রকাশিত হয়েছে।
                </h3>
                <p className="text-xs text-indigo-200 max-w-xl">
                  নিচে অভিভাবক ও এআই-এর যৌথ মতামত, প্রতিটি প্রশ্নের লাল কালির দাগ এবং তোমার ভুলত্রুটিগুলো সংশোধন করে দেওয়া হয়েছে।
                </p>
              </div>

              {/* Score Metric Badges */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Total Marks Pill */}
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[120px]">
                  <span className="text-[11px] font-bold text-indigo-200 block uppercase">প্রাপ্ত মোট নম্বর</span>
                  <div className="text-3xl font-black text-white mt-0.5">
                    {totalMarksObtained} <span className="text-sm font-medium text-indigo-200">/ {totalMarksPossible}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 block mt-0.5">{percentage}% স্কোর</span>
                </div>

                {/* Grade Badge */}
                <div className={`p-4 rounded-2xl border text-center min-w-[90px] ${gradeInfo.color}`}>
                  <span className="text-[11px] font-black uppercase block opacity-80">গ্রেড</span>
                  <span className="text-3xl font-black block mt-0.5">{gradeInfo.letter}</span>
                  <span className="text-[10px] font-bold block mt-0.5">সফল</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Joint Feedback: AI Evaluation + Parent Feedback Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* AI Feedback Card */}
            <Card className="p-5 border-2 border-indigo-100 bg-white shadow-sm rounded-3xl space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    🤖
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">এআই মূল্যায়ন ও বিশ্লেষণ</h4>
                    <span className="text-[10px] text-indigo-600 font-bold">স্বয়ংক্রিয় নিখুঁত যাচাই</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  AI Model Checked
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {data.aiFeedback || 'এআই স্বয়ংক্রিয় মূল্যায়নে শিক্ষার্থী প্রশ্নের মূল বিষয়বস্তু সঠিকভাবে অনুধাবন করেছে। বীজগণিত ও গণনার সূত্রে ভালো দখল পরিলক্ষিত হয়েছে।'}
              </p>
            </Card>

            {/* Parent Feedback Card */}
            <Card className="p-5 border-2 border-emerald-100 bg-white shadow-sm rounded-3xl space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    👨‍👩‍👧
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">অভিভাবকের মন্তব্য ও উৎসাহবার্তা</h4>
                    <span className="text-[10px] text-emerald-600 font-bold">ব্যক্তিগত পর্যালোচনা ও দিকনির্দেশনা</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  অভিভাবকের স্বাক্ষর
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold italic">
                "{data.parentComment || 'খুব চমৎকার ফলাফল করেছ বাবা! যে প্রশ্নগুলোতে লাল কালির দাগ পড়েছে সেগুলো আজকের মধ্যে খাতায় আবার লিখে প্র্যাকটিস করবে।'}"
              </p>
            </Card>
          </div>

          {/* 4. Uploaded Handwritten Sheets Preview (if any genuine images uploaded) */}
          {data.handwrittenImages && data.handwrittenImages.filter(img => img && !img.includes('image_fb59e449') && !img.includes('picsum.photos')).length > 0 && (
            <Card className="p-5 border-2 border-indigo-100 bg-white shadow-sm rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="text-indigo-600" size={18} />
                  <h4 className="text-sm font-black text-slate-900">
                    তোমার আপলোডকৃত মূল হাতের লেখা উত্তরপত্র ({data.handwrittenImages.filter(img => img && !img.includes('image_fb59e449') && !img.includes('picsum.photos')).length}টি পৃষ্ঠা)
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-slate-400">ছবিতে ক্লিক করে বড় করে দেখুন</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {data.handwrittenImages.filter(img => img && !img.includes('image_fb59e449') && !img.includes('picsum.photos')).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 aspect-3/4 bg-slate-100 cursor-pointer hover:border-indigo-500 transition-all shadow-xs"
                  >
                    <img src={img} alt={`পৃষ্ঠা ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-xl flex items-center justify-between">
                      <span>পৃষ্ঠা {idx + 1}</span>
                      <Maximize2 size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 5. Detailed Question Paper with Errors, Answers & Digital Red Ink */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="text-indigo-600" size={20} />
                  কোথায় ভুল হয়েছে তার বিস্তারিত খাতা ও লাল কালির দাগ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রতিটি প্রশ্নের উত্তর, তোমার নির্বাচন, অভিভাবকের দেওয়া নম্বর ও সংশোধনী নিচে দেখে নাও।
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-200 text-slate-700">
                মোট প্রশ্ন: {questionsList.length}টি
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questionsList.map((q, idx) => {
                const qId = q.id || `q_${idx + 1}`;
                const userSelected = data.answers ? data.answers[qId] : undefined;
                
                // Find AI detailed marking or manual grade
                const aiDetail = data.aiDetailedMarking?.find(d => d.questionId === qId);
                const manualGrade = data.manualGrades ? data.manualGrades[qId] : undefined;

                // Determine marks obtained
                let marksObtained = 0;
                let isCorrect = false;
                let isOverridden = false;
                let redInkNote = '';

                if (aiDetail) {
                  marksObtained = aiDetail.marksObtained;
                  isCorrect = aiDetail.isCorrect;
                  isOverridden = !!aiDetail.isOverridden;
                  redInkNote = aiDetail.redInkNote;
                } else if (manualGrade) {
                  marksObtained = manualGrade.marks;
                  isCorrect = marksObtained > 0;
                  redInkNote = manualGrade.comment;
                } else {
                  isCorrect = userSelected === q.correctAnswer;
                  marksObtained = isCorrect ? (q.marks || 1) : 0;
                  redInkNote = isCorrect 
                    ? '✓ সঠিক উত্তর। সূত্রের প্রয়োগ যথাযথ হয়েছে।' 
                    : '✗ ভুল উত্তর। এখানে হিসাবের ত্রুটি রয়েছে। সঠিক নিয়ম দেখে নাও।';
                }

                const maxMarks = q.marks || 1;

                return (
                  <Card
                    key={qId}
                    className={`p-5 rounded-3xl border-2 transition-all ${
                      isCorrect 
                        ? 'border-emerald-200 bg-white' 
                        : 'border-red-200 bg-white'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Question Header & Score Pill */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {idx + 1}
                          </div>
                          <h4 className="font-black text-slate-900 text-sm sm:text-base">
                            {q.text || q.question}
                          </h4>
                        </div>

                        {/* Marks & Status Badges */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          {isOverridden && (
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Edit3 size={11} /> অভিভাবক কর্তৃক সংশোধিত
                            </span>
                          )}

                          <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                            marksObtained > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            প্রাপ্ত নম্বর: {marksObtained} / {maxMarks}
                          </span>
                        </div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options?.map((opt, optIdx) => {
                          const isUserChoice = userSelected === optIdx;
                          const isRightChoice = q.correctAnswer === optIdx;

                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-2xl border flex items-center justify-between font-medium transition-all ${
                                isRightChoice
                                  ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold'
                                  : isUserChoice
                                  ? 'border-red-400 bg-red-50/80 text-red-950 font-bold'
                                  : 'border-slate-200 bg-slate-50/50 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                                  isRightChoice ? 'bg-emerald-600 text-white' :
                                  isUserChoice ? 'bg-red-600 text-white' :
                                  'bg-slate-200 text-slate-600'
                                }`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>

                              <div className="shrink-0 flex items-center gap-1">
                                {isRightChoice && (
                                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <CheckCircle2 size={12} /> সঠিক উত্তর
                                  </span>
                                )}
                                {isUserChoice && !isRightChoice && (
                                  <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <XCircle size={12} /> তোমার উত্তর (ভুল)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* DIGITAL RED INK STAMP & ERROR CORRECTION NOTE */}
                      <div className={`p-4 rounded-2xl border ${
                        isCorrect
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-red-50/80 border-red-200 text-red-900'
                      } text-xs space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-black flex items-center gap-1.5 ${
                            isCorrect ? 'text-emerald-800' : 'text-red-700'
                          }`}>
                            <span className={`w-2 h-2 rounded-full inline-block ${
                              isCorrect ? 'bg-emerald-600' : 'bg-red-600'
                            }`} />
                            ✒️ ডিজিটাল লাল কালির দাগ ও খাতার মন্তব্য:
                          </span>
                          {isOverridden && (
                            <span className="text-[10px] font-black text-amber-800">
                              অভিভাবক এই প্রশ্নে নম্বর ও মন্তব্য পরিবর্তন করেছেন
                            </span>
                          )}
                        </div>

                        <p className={`font-semibold italic pl-3 border-l-2 leading-relaxed ${
                          isCorrect ? 'border-emerald-400 text-emerald-800' : 'border-red-400 text-red-800'
                        }`}>
                          {redInkNote}
                        </p>

                        {q.explanation && (
                          <div className="pt-2 text-[11px] text-slate-600 border-t border-slate-200/50 mt-2">
                            <span className="font-bold text-slate-800">সঠিক সমাধান ও নিয়ম: </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
            যেকোনো প্রশ্নের সমাধান বুঝতে সমস্যা হলে <span className="text-indigo-600 font-bold">এআই ডাউট সলভার</span> বা তোমার শিক্ষকের সহায়তা নাও।
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial rounded-xl text-xs font-bold gap-1.5 px-4"
            >
              <Printer size={15} />
              প্রিন্ট / সেভ করুন
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-xl text-xs font-black px-6 bg-indigo-600 hover:bg-indigo-700"
            >
              ঠিক আছে
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Lightbox for handwritten image full view */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-2 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-sm">হাতের লেখা উত্তরপত্র (পূর্ণ পৃষ্ঠা ভিউ)</span>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-auto max-h-[80vh] flex items-center justify-center p-2 bg-slate-100 rounded-2xl">
                <img src={selectedImage} alt="খাতার পূর্ণাঙ্গ ছবি" className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-md" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
