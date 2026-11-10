import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  FileText, 
  CheckCircle2, 
  Download, 
  Globe, 
  Copy, 
  Check, 
  Settings2, 
  BookOpen, 
  Brain,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { AssignedTest } from '../../types';
import { toBn } from '../../lib/utils';
import { BLOOM_LEVELS, BloomLevel, normalizeBloomLevel, inferBloomLevelFromQuestion } from '../../lib/bloomTaxonomy';
import { generateTwoSolutions } from '../../lib/curriculumQuestions';

interface PrintableQuestionPaperModalProps {
  test: AssignedTest;
  onClose: () => void;
  onLaunchOnlineExam?: (test: AssignedTest) => void;
}

export const PrintableQuestionPaperModal: React.FC<PrintableQuestionPaperModalProps> = ({
  test,
  onClose,
  onLaunchOnlineExam
}) => {
  const [activeTab, setActiveTab] = useState<'question_paper' | 'answer_key' | 'settings'>('question_paper');
  const [printScope, setPrintScope] = useState<'both' | 'questions_only' | 'answers_only'>('questions_only');
  const [copiedLink, setCopiedLink] = useState(false);

  // Editable Header Details for School/Institution Printing
  const [institutionName, setInstitutionName] = useState(() => {
    return (test as any).institutionName || 'মতিঝিল আইডিয়াল স্কুল অ্যান্ড কলেজ, ঢাকা';
  });
  const [examName, setExamName] = useState(() => {
    return test.title || 'বার্ষিক মূল্যায়ন পরীক্ষা / নির্বাচনী মডেল টেস্ট';
  });
  const [studentClass, setStudentClass] = useState(() => {
    return (test as any).studentClass || '১০ম শ্রেণি';
  });
  const [subjectName, setSubjectName] = useState(() => {
    return test.subject || 'সাধারণ গণিত';
  });
  const [subjectCode, setSubjectCode] = useState(() => {
    return (test as any).subjectCode || '১০৯';
  });
  const [setCode, setSetCode] = useState('ক সেট');
  const [timeAllowed, setTimeAllowed] = useState(() => `${toBn(test.durationMinutes || 25)} মিনিট`);
  const [totalMarks, setTotalMarks] = useState(() => `${toBn(test.questions?.length || test.questionCount || 20)}`);
  const [instructions, setInstructions] = useState(
    'বিশেষ নির্দেশাবলি: সকল প্রশ্নের উত্তর দিতে হবে। প্রতিটি প্রশ্নের মান ১। ক্যালকুলেটর অনুমোদিত।'
  );

  const handlePrint = (scope: 'questions_only' | 'answers_only' | 'both') => {
    setPrintScope(scope);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const questions = test.questions || [];

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col print:p-0 print:bg-white print:static print:min-h-0">
      
      {/* Page Container */}
      <div className="w-full flex-1 flex flex-col print:border-none print:shadow-none print:w-full">
        
        {/* ======================================================== */}
        {/* TOP BAR / CONTROLS (Hidden during actual print)          */}
        {/* ======================================================== */}
        <div className="p-3 sm:p-4 border-b border-slate-800 bg-slate-900 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 sticky top-0 z-20 shadow-md print:hidden">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Back Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0 border border-slate-700 active:scale-95"
              title="ড্যাশবোর্ডে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>ফিরে যান</span>
            </button>

            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Printer className="w-4.5 h-4.5" />
            </div>
            <div className="truncate min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  দ্বৈত এক্সাম মোড (Dual Mode)
                </span>
                <span className="text-xs font-bold text-slate-300">
                  পিন: <strong className="text-amber-400 font-mono">{test.pin}</strong>
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white truncate mt-0.5">
                অফিসিয়াল ২-কলাম A4 প্রিন্ট ও স্কুল ফরম্যাট
              </h3>
            </div>
          </div>

          {/* Action Tabs & Print Triggers */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* View switcher pills */}
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('question_paper')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'question_paper'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                প্রশ্নপত্র (২-কলাম)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('answer_key')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'answer_key'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                উত্তরমালা ও ব্যাখ্যা
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'settings'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="হেডারের স্কুলের নাম ও তথ্য এডিট করুন"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">তথ্য পরিবর্তন</span>
              </button>
            </div>

            {/* Direct Print Button */}
            <button
              type="button"
              onClick={() => handlePrint(activeTab === 'answer_key' ? 'answers_only' : 'questions_only')}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer active:scale-95"
              title="A4 পেজে সরাসরি প্রিন্ট বা PDF ডাউনলোড করুন"
            >
              <Printer className="w-4 h-4" />
              <span>{activeTab === 'answer_key' ? 'উত্তরমালা প্রিন্ট' : 'প্রশ্নপত্র প্রিন্ট (A4)'}</span>
            </button>

            {/* Launch Online Button (Dual Mode) */}
            {onLaunchOnlineExam && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLaunchOnlineExam(test);
                }}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="লাইভ ক্যামেরা ও টাইমার সহ অনলাইনে পরীক্ষা শুরু করুন"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">অনলাইন লাইভ পরীক্ষা</span>
              </button>
            )}

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
              title="বন্ধ করে ড্যাশবোর্ডে ফিরে যান"
            >
              <X className="w-4 h-4" />
              <span className="hidden md:inline">বন্ধ করুন</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 3: HEADER SETTINGS / CUSTOMIZATION (SCREEN ONLY)    */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 overflow-y-auto space-y-4 print:hidden">
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-purple-600" />
              <span>ছাপাখানার জন্য স্কুলের হেডার ও পরীক্ষার তথ্য কাস্টমাইজ করুন:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">প্রতিষ্ঠানের নাম:</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">পরীক্ষার নাম:</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">শ্রেণি:</label>
                <input
                  type="text"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">বিষয়:</label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">বিষয় কোড:</label>
                <input
                  type="text"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">প্রশ্ন সেট:</label>
                <input
                  type="text"
                  value={setCode}
                  onChange={(e) => setSetCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">সময়:</label>
                <input
                  type="text"
                  value={timeAllowed}
                  onChange={(e) => setTimeAllowed(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">পূর্ণমান:</label>
                <input
                  type="text"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-slate-700 font-bold mb-1">সাধারণ নির্দেশাবলি:</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('question_paper')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                ✓ প্রিভিউতে ফিরে যান
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PRINTABLE BODY / A4 PREVIEW CONTAINER                   */}
        {/* ======================================================== */}
        <div className="flex-1 p-3 sm:p-8 bg-slate-100 print:bg-white print:p-0">
          
          {/* A4 Paper Sheet Wrapper */}
          <div className="max-w-[210mm] mx-auto bg-white p-6 sm:p-10 shadow-xl border border-slate-200/90 rounded-2xl print:shadow-none print:border-none print:p-4 print:rounded-none print:max-w-none text-slate-950 font-serif">
            
            {/* ======================================================== */}
            {/* VIEW 1: OFFICIAL QUESTION PAPER (2-COLUMN A4 FORMAT)    */}
            {/* ======================================================== */}
            {(activeTab === 'question_paper' || printScope === 'both' || printScope === 'questions_only') && (
              <div className={`${printScope === 'answers_only' ? 'hidden print:hidden' : 'block'}`}>
                
                {/* 1. Official Header (School & Exam Metadata) */}
                <header className="text-center pb-3 border-b-2 border-slate-900 mb-3 space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-sans">
                    {institutionName}
                  </h1>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {examName}
                  </h2>
                  <div className="flex items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-800 flex-wrap pt-0.5">
                    <span>শ্রেণি: {studentClass}</span>
                    <span>বিষয়: {subjectName}</span>
                    <span>বিষয় কোড: {subjectCode}</span>
                    <span className="px-2 py-0.5 rounded border border-slate-800 text-xs font-black">{setCode}</span>
                  </div>
                  
                  {/* Time & Marks Strip */}
                  <div className="flex items-center justify-between pt-2 text-xs font-bold border-t border-slate-400 mt-2">
                    <span>সময়: {timeAllowed}</span>
                    <span className="font-sans italic text-[11px] text-slate-700">{instructions}</span>
                    <span>পূর্ণমান: {totalMarks}</span>
                  </div>

                  {/* Student Roll / Name Field Lines */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-left border-t border-dashed border-slate-300 mt-2">
                    <div className="border-b border-slate-500 pb-0.5">
                      <span className="font-bold">শিক্ষার্থীর নাম: </span>
                    </div>
                    <div className="border-b border-slate-500 pb-0.5">
                      <span className="font-bold">রোল নম্বর: </span>
                    </div>
                    <div className="border-b border-slate-500 pb-0.5">
                      <span className="font-bold">শাখা / বিভাগ: </span>
                    </div>
                  </div>
                </header>

                {/* 2. Authentic Two-Column Layout for Questions */}
                <div 
                  className="columns-1 md:columns-2 gap-x-8 text-xs leading-relaxed"
                  style={{
                    columnRule: '1px solid #cbd5e1'
                  }}
                >
                  {questions.map((q, idx) => {
                    const optLetters = ['ক', 'খ', 'গ', 'ঘ'];
                    return (
                      <div 
                        key={q.id || idx} 
                        className="break-inside-avoid pb-3.5 mb-2 border-b border-slate-100 last:border-b-0"
                      >
                        {/* Stimulus / উদ্দীপক (যদি থাকে) */}
                        {q.stimulus && (
                          <div className="p-2 mb-1.5 rounded bg-slate-50 border border-slate-300 text-[11px] italic leading-normal">
                            <span className="font-bold not-italic block text-[10px]">নিচের উদ্দীপকটি পড়ো:</span>
                            {q.stimulus}
                          </div>
                        )}

                        {/* Question Text */}
                        <div className="flex items-start gap-1 font-bold text-slate-950 mb-1 leading-snug">
                          <span className="font-black shrink-0 font-sans">{toBn(idx + 1)}.</span>
                          <span>{q.question}</span>
                        </div>

                        {/* Options in 2x2 grid */}
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pl-4 pt-0.5 text-slate-900 font-normal">
                          {(q.options || []).map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-start gap-1 leading-tight">
                              <span className="font-bold shrink-0 font-sans">({optLetters[optIdx]})</span>
                              <span className="break-words">{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Signature Lines */}
                <div className="pt-8 mt-4 border-t border-slate-300 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="text-center">
                    <div className="w-32 border-b border-slate-600 mb-1"></div>
                    <span>শিক্ষকের স্বাক্ষর</span>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-slate-600 mb-1"></div>
                    <span>প্রধান শিক্ষকের অনুমোদন</span>
                  </div>
                </div>

              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: TEACHER'S ANSWER KEY & STEP-BY-STEP SOLUTIONS    */}
            {/* ======================================================== */}
            {(activeTab === 'answer_key' || printScope === 'both' || printScope === 'answers_only') && (
              <div className={`${activeTab === 'question_paper' && printScope !== 'both' && printScope !== 'answers_only' ? 'hidden print:hidden' : 'block'} print:page-break-before`}>
                
                {/* Answer Key Header */}
                <header className="text-center pb-3 border-b-2 border-emerald-900 mb-4 pt-2">
                  <div className="inline-block px-3 py-1 rounded bg-emerald-100 text-emerald-900 text-xs font-black uppercase mb-1">
                    শুধুমাত্র শিক্ষক ও মূল্যায়নকারীর জন্য (Teacher's Evaluation Guide)
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-950 font-sans">
                    {institutionName} — পূর্ণাঙ্গ উত্তরমালা ও সমাধান নির্দেশিকা
                  </h2>
                  <p className="text-xs text-slate-600 font-bold mt-0.5">
                    {subjectName} ({studentClass}) • বিষয় কোড: {subjectCode} • মোট প্রশ্ন: {toBn(questions.length)}টি
                  </p>
                </header>

                {/* Fast OMR Answer Lookup Grid (দ্রুত খাতা দেখার টেবিল) */}
                <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-black text-slate-800 mb-2 flex items-center gap-1.5 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>দ্রুত খাতা দেখার ওএমআর (OMR) উত্তর তালিকা:</span>
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 text-xs font-bold text-center">
                    {questions.map((q, idx) => {
                      const optLetters = ['ক', 'খ', 'গ', 'ঘ'];
                      const correctIdx = q.correctAnswerIndex !== undefined 
                        ? q.correctAnswerIndex 
                        : (q.options || []).findIndex(o => o.trim() === q.correctAnswer?.trim());
                      const letter = correctIdx !== -1 ? optLetters[correctIdx] : 'ক';

                      return (
                        <div key={idx} className="p-1.5 rounded-lg border border-slate-300 bg-white shadow-2xs">
                          <span className="text-[10px] text-slate-500 font-mono block">{toBn(idx + 1)}</span>
                          <span className="text-sm font-black text-emerald-700 font-sans">{letter}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step-by-Step Mathematical & Theoretical Explanations with Bloom's Taxonomy */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 font-sans">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span>প্রতিটি প্রশ্নের বিস্তারিত গাণিতিক সূত্র ও বিকল্প পদ্ধতিসমূহ:</span>
                  </h4>

                  {questions.map((q, idx) => {
                    const bLevel = q.cognitiveLevel 
                      ? normalizeBloomLevel(q.cognitiveLevel) 
                      : inferBloomLevelFromQuestion(q.question, q.explanation);
                    const bMeta = BLOOM_LEVELS[bLevel];
                    const solutions = (q.solutions && q.solutions.length >= 2)
                      ? q.solutions
                      : generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation);

                    return (
                      <div key={q.id || idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 break-inside-avoid">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-900">
                            {toBn(idx + 1)}. {q.question}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-2 py-0.5 rounded font-black text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                              সঠিক: {q.correctAnswer}
                            </span>
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${bMeta.badgeBg} ${bMeta.badgeBorder}`}>
                              {bMeta.icon} {bMeta.banglaName}
                            </span>
                          </div>
                        </div>

                        {q.explanation && (
                          <div className="text-[11px] text-slate-700 pl-2 border-l-2 border-blue-400">
                            <strong>তাত্ত্বিক মূলনীতি: </strong>{q.explanation}
                          </div>
                        )}

                        {solutions && solutions.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                            {solutions.map((sol, sIdx) => (
                              <div key={sIdx} className="p-2 rounded-lg bg-white border border-slate-200">
                                <span className="font-bold text-blue-900 block mb-0.5">
                                  {sIdx === 0 ? 'পদ্ধতি ১ (বইয়ের নিয়ম):' : 'পদ্ধতি ২ (শর্টকাট কৌশল):'}
                                </span>
                                <span className="text-slate-800 whitespace-pre-line">{sol}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>

        </div>

        {/* ======================================================== */}
        {/* FOOTER (PRINT ACTION STRIP)                              */}
        {/* ======================================================== */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20 shadow-lg print:hidden">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-300"
              title="ড্যাশবোর্ডে ফিরে যান"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>ফিরে যান</span>
            </button>
            <span className="hidden sm:inline">|</span>
            <span>পরীক্ষার পিন: <strong className="text-blue-700 font-mono font-black">{test.pin}</strong></span>
            <span>• মোট {toBn(questions.length)}টি প্রশ্ন</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => handlePrint('questions_only')}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>শুধু প্রশ্নপত্র প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrint('answers_only')}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>শুধু উত্তরমালা প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={() => handlePrint('both')}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>উভয়ই প্রিন্ট / PDF (সম্পূর্ণ সেট)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
