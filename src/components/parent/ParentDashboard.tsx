import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Copy, Check, Eye, FileText, CheckCircle2, 
  Clock, Shield, AlertTriangle, MessageSquare, ChevronRight, Share2,
  TrendingUp, Award, BookOpen, Sparkles, RefreshCw, Edit3, X,
  Save, AlertCircle, Camera, ExternalLink, HelpCircle, GraduationCap, ArrowRight, ArrowLeft,
  RotateCcw, MessageCircle
} from 'lucide-react';
import { AssignedTest, StudentSubmission, ExamQuestion } from '../../types';
import { 
  getStoredTests, 
  saveStoredTests, 
  getStoredSubmissions, 
  saveStoredSubmission,
  getStoredNotifications,
  saveStoredNotifications,
  getShareableTestUrl
} from '../../lib/storage';
import { 
  CHAPTER_QUESTION_BANK, 
  getQuestionsForChapter, 
  getAlternativeQuestion 
} from '../../lib/curriculumQuestions';

interface ParentDashboardProps {
  onOpenTest: (test: AssignedTest) => void;
  onOpenReview: (test: AssignedTest) => void;
  onNavigateHome?: () => void;
  activeTab?: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report';
  onTabChange?: (tab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report') => void;
  showCreateModalExternal?: boolean;
  onCloseCreateModalExternal?: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  onOpenTest,
  onOpenReview,
  onNavigateHome,
  showCreateModalExternal,
  onCloseCreateModalExternal
}) => {
  const [tests, setTests] = useState<AssignedTest[]>([]);
  const [activeViewMode, setActiveViewMode] = useState<'builder' | 'tests'>('tests');
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Configuration for AI Question Builder
  const [selectedClass, setSelectedClass] = useState('৮ম শ্রেণি');
  const [selectedSubject, setSelectedSubject] = useState('সাধারণ গণিত');
  const [selectedChapter, setSelectedChapter] = useState('বীজগণিত ও সমীকরণ');
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);

  // Generated Questions state for customization before finalizing
  const [generatedQuestions, setGeneratedQuestions] = useState<ExamQuestion[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });

  // Success Link Generation Modal & Finalized State
  const [createdTestResult, setCreatedTestResult] = useState<AssignedTest | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);

  // Review & Evaluation Modal
  const [reviewTest, setReviewTest] = useState<AssignedTest | null>(null);
  const [parentComment, setParentComment] = useState('');
  const [approvedScore, setApprovedScore] = useState<number>(0);

  // Controlling Action Modals (Delete, Share, Retake)
  const [testToDelete, setTestToDelete] = useState<AssignedTest | null>(null);
  const [shareModalTest, setShareModalTest] = useState<AssignedTest | null>(null);
  const [retakeModalTest, setRetakeModalTest] = useState<AssignedTest | null>(null);

  // Load tests on mount and listen to updates
  const loadTests = () => {
    const list = getStoredTests();
    setTests(list);
  };

  useEffect(() => {
    loadTests();
    const handleStorage = () => loadTests();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('dapathshala_notifs_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dapathshala_notifs_updated', handleStorage);
    };
  }, []);

  useEffect(() => {
    if (showCreateModalExternal) {
      setActiveViewMode('builder');
      onCloseCreateModalExternal?.();
    }
  }, [showCreateModalExternal, onCloseCreateModalExternal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Subject to Chapters mapping
  const subjectChapters: Record<string, string[]> = {
    'সাধারণ গণিত': ['বীজগণিত ও সমীকরণ', 'ত্রিকোণমিতি ও উচ্চতা', 'লগারিদম ও সূচক', 'জ্যামিতি ও ক্ষেত্রফল'],
    'সাধারণ বিজ্ঞান': ['বিজ্ঞান ও পরিবেশ', 'পদার্থবিজ্ঞান ও বলগতি', 'রসায়ন ও পদার্থের গঠন', 'জীববিজ্ঞান ও সালোকসংশ্লেষণ'],
    'বাংলা': ['অপরিচিতা (রবীন্দ্রনাথ ঠাকুর)', 'বিলাসী (শরৎচন্দ্র চট্টোপাধ্যায়)', 'বায়ান্নর দিনগুলো (বঙ্গবন্ধু)', 'রেইনকোট (আখতারুজ্জামান ইলিয়াস)', 'সোনার তরী', 'বিদ্রোহী (কাজী নজরুল ইসলাম)', 'বাংলা ব্যাকরণ ও সমাস'],
    'ইংরেজি': ['Voice Change', 'Right Form of Verbs', 'Prepositions & Idioms'],
    'বাংলাদেশ ও বিশ্বপরিচয়': ['পরিবেশ ও প্রাকৃতিক সম্পদ', 'বাংলাদেশের ইতিহাস ও মুক্তিযুদ্ধ', 'নাগরিক দায়িত্ব ও সংবিধান'],
    'আইসিটি / তথ্য ও যোগাযোগ প্রযুক্তি': ['তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি', 'কম্পিউটার নেটওয়ার্ক ও সাইবার নিরাপত্তা']
  };

  // When subject changes, set default chapter
  const handleSubjectChange = (sub: string) => {
    setSelectedSubject(sub);
    const chaps = subjectChapters[sub] || ['সাধারণ অধ্যায়'];
    setSelectedChapter(chaps[0]);
  };

  // Generate Questions via AI / Bank
  const handleGenerateQuestions = () => {
    const questions = getQuestionsForChapter(selectedSubject, selectedChapter, questionCount);
    const mapped: ExamQuestion[] = questions.map((q, idx) => ({
      id: q.id || `q_${Date.now()}_${idx}`,
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || 'সঠিক উত্তর নির্বাচন করুন।'
    }));
    setGeneratedQuestions(mapped);
    showToast('✨ এআই পাঠ্যবই অনুযায়ী প্রশ্নপত্র সফলভাবে প্রস্তুত করেছে!');
  };

  // Initialize with questions on first load if empty
  useEffect(() => {
    if (generatedQuestions.length === 0) {
      handleGenerateQuestions();
    }
  }, []);

  // Skip / Replace a single question
  const handleSkipQuestion = (index: number) => {
    const existingTexts = generatedQuestions.map(q => q.question);
    const replacement = getAlternativeQuestion(selectedSubject, selectedChapter, existingTexts);
    
    const updated = [...generatedQuestions];
    updated[index] = {
      id: replacement.id,
      question: replacement.question,
      options: [...replacement.options],
      correctAnswer: replacement.correctAnswer,
      explanation: replacement.explanation
    };
    setGeneratedQuestions(updated);
    showToast(`🔄 প্রশ্ন ${index + 1} স্কিপ করে নতুন প্রশ্ন প্রতিস্থাপন করা হয়েছে!`);
  };

  // Start editing a question
  const handleStartEdit = (q: ExamQuestion) => {
    setEditingQuestionId(q.id);
    setEditForm({
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    });
  };

  // Save edited question
  const handleSaveEdit = (id: string) => {
    const updated = generatedQuestions.map(q => {
      if (q.id === id) {
        return {
          ...q,
          question: editForm.question.trim(),
          options: editForm.options.map(opt => opt.trim()),
          correctAnswer: editForm.correctAnswer.trim(),
          explanation: editForm.explanation.trim()
        };
      }
      return q;
    });
    setGeneratedQuestions(updated);
    setEditingQuestionId(null);
    showToast('✓ প্রশ্ন সফলভাবে আপডেট করা হয়েছে!');
  };

  // Delete a question
  const handleDeleteQuestion = (index: number) => {
    if (generatedQuestions.length <= 1) {
      alert('পরীক্ষায় অন্তত ১টি প্রশ্ন থাকতে হবে!');
      return;
    }
    const updated = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(updated);
    showToast('প্রশ্ন মুছে ফেলা হয়েছে।');
  };

  // Add a new question manually
  const handleAddQuestion = () => {
    const newQ: ExamQuestion = {
      id: `manual_q_${Date.now()}`,
      question: 'নতুন প্রশ্নের বিবরণ লিখুন...',
      options: ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪'],
      correctAnswer: 'অপশন ১',
      explanation: 'ব্যাখ্যা লিখুন...'
    };
    setGeneratedQuestions([...generatedQuestions, newQ]);
    handleStartEdit(newQ);
  };

  // Finalize Exam & Generate Link + PIN
  const handleFinalizeExam = () => {
    if (generatedQuestions.length === 0) {
      alert('দয়া করে প্রথমে প্রশ্ন তৈরি করুন!');
      return;
    }

    setIsFinalized(true);

    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const newTest: AssignedTest = {
      id: `test-${Date.now()}`,
      title: `${selectedClass} - ${selectedSubject}: ${selectedChapter} মূল্যায়ন`,
      subject: selectedSubject,
      chapter: selectedChapter,
      questionCount: generatedQuestions.length,
      durationMinutes: durationMinutes,
      pin: randomPin,
      createdAt: 'আজ, এইমাত্র',
      status: 'pending',
      studentName: 'পরীক্ষার্থী / সন্তান',
      totalMarks: generatedQuestions.length * 20,
      proctoringEnabled: proctoringEnabled,
      aiGradingEnabled: true,
      questions: generatedQuestions
    };

    const updated = [newTest, ...tests];
    setTests(updated);
    saveStoredTests(updated);
    setCreatedTestResult(newTest);
  };

  // Copy Link Helper with Full Cross-Device Support
  const handleCopyLink = (testOrPin: AssignedTest | string) => {
    let link = '';
    let pin = '';
    if (typeof testOrPin === 'string') {
      pin = testOrPin;
      const matched = tests.find(t => t.pin === pin);
      link = matched ? getShareableTestUrl(matched) : `${window.location.origin}?pin=${pin}`;
    } else {
      pin = testOrPin.pin;
      link = getShareableTestUrl(testOrPin);
    }
    navigator.clipboard.writeText(link);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2500);
    showToast('✓ সম্পূর্ণ পরীক্ষার লিংক কপি হয়েছে! যেকোনো ডিভাইসে সরাসরি পরীক্ষা চালু হবে।');
  };

  // Open Review Modal for a submitted test
  const handleOpenReviewModal = (test: AssignedTest) => {
    setReviewTest(test);
    setParentComment(test.parentComment || '');
    setApprovedScore(test.score !== undefined ? test.score : 80);
  };

  // Approve and publish evaluated test with parent feedback
  const handleSaveEvaluation = () => {
    if (!reviewTest) return;

    const updated = tests.map(t => {
      if (t.id === reviewTest.id) {
        return {
          ...t,
          status: 'reviewed' as const,
          score: approvedScore,
          parentComment: parentComment.trim(),
          isPublished: true
        };
      }
      return t;
    });

    setTests(updated);
    saveStoredTests(updated);

    // Remove parent submission notification for this test completely so it no longer stays in notifications
    const notifs = getStoredNotifications();
    const updatedNotifs = notifs.filter(n => !(n.testId === reviewTest.id && (n.forRole === 'parent' || !n.forRole)));

    const newNotif = {
      id: `notif-rev-${Date.now()}`,
      title: 'খাতা মূল্যায়ন ও মন্তব্য প্রকাশিত',
      message: `আপনার অভিভাবক "${reviewTest.title}" পরীক্ষার খাতা যাচাই করেছেন এবং ফলাফল প্রকাশ করেছেন। প্রাপ্ত নম্বর: ${approvedScore}%।`,
      time: 'এইমাত্র',
      testId: reviewTest.id,
      isRead: false,
      forRole: 'student' as const
    };
    saveStoredNotifications([newNotif, ...updatedNotifs]);

    setReviewTest(null);
    showToast('✓ খাতা দেখা সম্পন্ন হয়েছে এবং ফলাফল ও মন্তব্য পাঠানো হয়েছে!');
  };

  // Delete Test completely from state, localStorage, and server
  const handleConfirmDeleteTest = async () => {
    if (!testToDelete) return;
    const { id, pin } = testToDelete;

    // Remove from state
    const updated = tests.filter(t => t.id !== id && t.pin !== pin);
    setTests(updated);
    saveStoredTests(updated);

    // Clean up notifications for this test
    const notifs = getStoredNotifications().filter(
      n => n.testId !== id && !n.message.includes(pin)
    );
    saveStoredNotifications(notifs);
    window.dispatchEvent(new Event('dapathshala_notifs_updated'));

    // Send DELETE to server API
    try {
      await fetch(`/api/tests/${pin}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete on server:', e);
    }

    setTestToDelete(null);
    showToast('✓ পরীক্ষাটি তালিকা থেকে সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Retake / Reset Test for Student
  const handleConfirmRetakeTest = async () => {
    if (!retakeModalTest) return;
    const targetId = retakeModalTest.id;

    const updated = tests.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          status: 'pending' as const,
          score: undefined,
          parentComment: undefined,
          proctoringFlags: [],
          questions: t.questions.map(q => ({
            ...q,
            studentAnswer: undefined,
            isCorrect: undefined
          }))
        };
      }
      return t;
    });

    setTests(updated);
    saveStoredTests(updated);

    // Sync to server so student gets clean test state
    const refreshed = updated.find(t => t.id === targetId);
    if (refreshed) {
      try {
        await fetch('/api/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(refreshed)
        });
      } catch (e) {
        console.error('Failed to sync retake to server:', e);
      }
    }

    setRetakeModalTest(null);
    showToast('🔄 পরীক্ষাটি পুনরায় দেওয়ার জন্য পেন্ডিং করা হয়েছে! সন্তান আবার পরীক্ষা দিতে পারবে।');
  };

  const toBn = (num: number | string) => {
    return num.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
  };

  // Only count tests pending evaluation so the badge count decreases upon review
  const pendingReviewCount = tests.filter(t => t.status === 'submitted').length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP PORTAL HEADER & MAIN VIEW SWITCHER                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              দাপাঠশালা অভিভাবক পোর্টাল
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              এআই প্রশ্নপত্র তৈরি, লিংক শেয়ার ও ফ্রন্ট ক্যামেরা লাইভ খাতা মূল্যায়ন
            </p>
          </div>
        </div>

        {/* Header Right Status / Back Button */}
        {activeViewMode === 'builder' ? (
          <button
            type="button"
            onClick={() => setActiveViewMode('tests')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← পরীক্ষাসমূহ ও খাতায় ফিরে যান</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-bold">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>নির্ধারিত পরীক্ষা: {toBn(tests.length)}টি</span>
              {pendingReviewCount > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black animate-pulse">
                  {toBn(pendingReviewCount)}টি খাতা মূল্যায়নের বাকি
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: AI EXAM BUILDER & QUESTION CUSTOMIZER            */}
      {/* ======================================================== */}
      {activeViewMode === 'builder' && (
        <div className="space-y-6">
          
          {/* Section A: Selection & Parameters Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  সন্তানের জন্য বিষয় ও অধ্যায় নির্বাচন করুন
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveViewMode('tests')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ফিরে যান</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Class Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  শ্রেণি / ক্লাস:
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি'].map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  বিষয়:
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(subjectChapters).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Chapter Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  পাঠ্যবইয়ের অধ্যায়:
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(subjectChapters[selectedSubject] || []).map(chap => (
                    <option key={chap} value={chap}>{chap}</option>
                  ))}
                </select>
              </div>

              {/* Question Count & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    প্রশ্ন সংখ্যা:
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>৫টি</option>
                    <option value={10}>১০টি</option>
                    <option value={15}>১৫টি</option>
                    <option value={20}>২০টি</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    সময়:
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>১০ মিনিট</option>
                    <option value={15}>১৫ মিনিট</option>
                    <option value={20}>২০ মিনিট</option>
                    <option value={30}>৩০ মিনিট</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Proctoring Toggle & Action */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={proctoringEnabled}
                  onChange={(e) => setProctoringEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>নকল প্রতিরোধে ফ্রন্ট ক্যামেরা ও ফুলস্ক্রিন নজরদারি সক্রিয় থাকবে</span>
                </span>
              </label>

              <button
                type="button"
                onClick={handleGenerateQuestions}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>এআই দিয়ে প্রশ্ন রিলোড করুন</span>
              </button>
            </div>
          </div>

          {/* Section B: Live Question Paper Preview & Customizer */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>📝 প্রস্তুতকৃত প্রশ্নপত্র ({toBn(generatedQuestions.length)}টি প্রশ্ন)</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  পছন্দ না হলে পাশে থাকা 'স্কিপ' বাটনে নতুন প্রশ্ন আনুন অথবা নিজের মতো 'এডিট' করুন
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ ম্যানুয়ালি প্রশ্ন যোগ করুন</span>
              </button>
            </div>

            {/* Question Cards List */}
            <div className="space-y-4">
              {generatedQuestions.map((q, index) => {
                const isEditing = editingQuestionId === q.id;

                return (
                  <div 
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    {isEditing ? (
                      /* Inline Question Editor */
                      <div className="space-y-3 bg-white p-4 rounded-xl border border-blue-300">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            প্রশ্ন {index + 1} এর শিরোনাম:
                          </label>
                          <input
                            type="text"
                            value={editForm.question}
                            onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {editForm.options.map((opt, optIdx) => (
                            <div key={optIdx}>
                              <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                                অপশন {optIdx + 1}:
                              </label>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const updatedOpts = [...editForm.options];
                                  updatedOpts[optIdx] = e.target.value;
                                  setEditForm({ ...editForm, options: updatedOpts });
                                }}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-emerald-700 mb-0.5">
                              সঠিক উত্তর নির্বাচন করুন:
                            </label>
                            <select
                              value={editForm.correctAnswer}
                              onChange={(e) => setEditForm({ ...editForm, correctAnswer: e.target.value })}
                              className="w-full bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-900 focus:outline-none"
                            >
                              {editForm.options.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                              ব্যাখ্যা / সূত্র:
                            </label>
                            <input
                              type="text"
                              value={editForm.explanation}
                              onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setEditingQuestionId(null)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100"
                          >
                            বাতিল
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(q.id)}
                            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>সংরক্ষণ করুন</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Normal Question View with Actions */
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {toBn(index + 1)}
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                              {q.question}
                            </h4>
                          </div>

                          {/* Quick Controls: Skip, Edit, Delete */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Skip / Replace Button */}
                            <button
                              type="button"
                              onClick={() => handleSkipQuestion(index)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                              title="এই প্রশ্নটি পছন্দ না হলে অন্য একটি প্রশ্ন আনুন"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                              <span className="hidden sm:inline">স্কিপ / অন্য প্রশ্ন</span>
                              <span className="sm:hidden">স্কিপ</span>
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleStartEdit(q)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                              title="প্রশ্ন এডিট করুন"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(index)}
                              className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="প্রশ্ন মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 ml-8 text-xs sm:text-sm">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = opt === q.correctAnswer;
                            return (
                              <div
                                key={oIdx}
                                className={`px-3 py-2 rounded-xl border flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrect && (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    ✓ সঠিক উত্তর
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-2.5 ml-8 text-xs text-slate-500 font-medium">
                            <span className="font-bold text-slate-700">ব্যাখ্যা:</span> {q.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Final Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-medium">
                প্রশ্নপত্র প্রস্তুত? নিচের বাটনে চাপলে পরীক্ষার লিংক ও ৬-সংখ্যার পিন তৈরি হবে।
              </div>

              <button
                type="button"
                onClick={handleFinalizeExam}
                className={`w-full sm:w-auto px-7 py-3 rounded-2xl font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  isFinalized
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/80 ring-2 ring-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-200/80'
                }`}
              >
                {isFinalized ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3] text-emerald-100" />
                    <span>✓ চূড়ান্ত সম্পন্ন হয়েছে! লিংক প্রস্তুত</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    <span>প্রশ্নপত্র চূড়ান্ত করুন ও লিংক পান</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: TESTS LIST & EVALUATION (SUBMITTED EXAMS)        */}
      {/* ======================================================== */}
      {activeViewMode === 'tests' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                অভিভাবকের নির্ধারিত পরীক্ষাসমূহ ও খাতা
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                সন্তানের জমা দেওয়া উত্তরপত্র মূল্যায়ন করুন এবং দিকনির্দেশনামূলক মন্তব্য দিন
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveViewMode('builder')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ নতুন পরীক্ষা বানান</span>
            </button>
          </div>

          {tests.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                এখনও কোনো পরীক্ষা তৈরি করা হয়নি
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4 font-medium">
                আপনার সন্তানের জন্য নতুন প্রশ্নপত্র তৈরি করতে 'নতুন প্রশ্ন তৈরি' ট্যাবে ক্লিক করুন।
              </p>
              <button
                type="button"
                onClick={() => setActiveViewMode('builder')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                + এখনই প্রশ্ন তৈরি করুন
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {tests.map(test => {
                const isSubmitted = test.status === 'submitted';
                const isReviewed = test.status === 'reviewed';
                const isPending = test.status === 'pending';

                return (
                  <div
                    key={test.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isSubmitted
                        ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                        : isReviewed
                        ? 'bg-emerald-50/20 border-emerald-200 shadow-2xs'
                        : 'bg-white border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    {/* ======================================================== */}
                    {/* SECTION 1: EXAM INFORMATION & METADATA (Full Width)      */}
                    {/* ======================================================== */}
                    <div className="space-y-2">
                      {/* Top Badges Row: Subject, PIN, and Status Pill - All aligned left */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                          {test.subject}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                          পিন: <span className="font-mono font-bold text-blue-600">{test.pin}</span>
                        </span>

                        {/* Status Pills shifted to left alongside Subject and PIN */}
                        {isSubmitted && (
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500 text-white animate-pulse inline-flex items-center gap-1 shadow-2xs">
                            <span>🔔</span> নতুন খাতা জমা পড়েছে!
                          </span>
                        )}
                        {isReviewed && (
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            মূল্যায়ন সম্পন্ন ও মন্তব্য প্রেরিত
                          </span>
                        )}
                        {isPending && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                            <span>⏳</span> সন্তানের পরীক্ষার অপেক্ষায়
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        {test.title}
                      </h3>

                      {/* Metadata Row: Spans full card width so it never wraps awkwardly */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 font-medium pt-0.5">
                        <span>অধ্যায়: <span className="font-bold text-slate-800">{test.chapter}</span></span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1">
                          মোট প্রশ্ন: <strong className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tracking-wider font-['Noto_Sans_Bengali']">{toBn(test.questionCount)}টি</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1">
                          সময়: <strong className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tracking-wider font-['Noto_Sans_Bengali']">{toBn(test.durationMinutes)} মিনিট</strong>
                        </span>
                        {test.score !== undefined && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 tracking-wider font-['Noto_Sans_Bengali']">
                              প্রাপ্ত নম্বর: {toBn(test.score)}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ======================================================== */}
                    {/* SECTION 2: CONTROLLING & ACTION TOOLBAR (All on Left)    */}
                    {/* ======================================================== */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-start gap-2 sm:gap-2.5">
                      
                      {/* 1. Copy Link Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(test)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        title="পরীক্ষার সরাসরি লিংক কপি করুন"
                      >
                        {copiedPin === test.pin ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">লিংক কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>লিংক কপি</span>
                          </>
                        )}
                      </button>

                      {/* 2. Share Option */}
                      <button
                        type="button"
                        onClick={() => setShareModalTest(test)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                        title="পরীক্ষার লিংক ও পিন হোয়াটসঅ্যাপ বা অন্যান্য মাধ্যমে শেয়ার করুন"
                      >
                        <Share2 className="w-3.5 h-3.5 text-sky-600 group-hover:scale-110 transition-transform" />
                        <span>শেয়ার</span>
                      </button>

                      {/* 3. Retake Option (only for submitted / reviewed tests) */}
                      {(test.status === 'submitted' || test.status === 'reviewed') && (
                        <button
                          type="button"
                          onClick={() => setRetakeModalTest(test)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                          title="সন্তানকে আবার এই পরীক্ষাটি দেওয়ার সুযোগ দিন"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600 group-hover:-rotate-45 transition-transform" />
                          <span>পুনঃপরীক্ষা</span>
                        </button>
                      )}

                      {/* 4. Delete Option */}
                      <button
                        type="button"
                        onClick={() => setTestToDelete(test)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                        title="পরীক্ষাটি তালিকা থেকে মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
                        <span>মুছুন</span>
                      </button>

                      {/* 5. Primary Action Button (Grading / Review / View Questions) */}
                      {isSubmitted && (
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(test)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-black shadow-xs transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>খাতা মূল্যায়ন করুন</span>
                        </button>
                      )}

                      {isReviewed && (
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(test)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-400 text-emerald-800 text-xs font-bold transition-all shadow-xs cursor-pointer group"
                          title="খাতা পুনরায় দেখতে বা মূল্যায়ন সম্পাদন করতে ক্লিক করুন"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>খাতা দেখা হয়েছে</span>
                        </button>
                      )}

                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onOpenTest(test)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>প্রশ্নপত্র দেখুন</span>
                        </button>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: EXAM CREATED & SHAREABLE LINK POPUP             */}
      {/* ======================================================== */}
      {createdTestResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ✓
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  প্রশ্নপত্র প্রস্তুত ও লিংক তৈরি হয়েছে!
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreatedTestResult(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">পরীক্ষার নাম:</span>
                  <span className="font-bold text-slate-900">{createdTestResult.title}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">মোট প্রশ্ন ও সময়:</span>
                  <span className="font-bold text-slate-900">
                    {toBn(createdTestResult.questionCount)}টি প্রশ্ন ({toBn(createdTestResult.durationMinutes)} মিনিট)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold">৬-সংখ্যার পিন (PIN):</span>
                  <span className="font-black text-base text-blue-600 tracking-wider">
                    {createdTestResult.pin}
                  </span>
                </div>
              </div>

              {/* Shareable Link Box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>সন্তান বা বন্ধুকে সরাসরি পরীক্ষার লিংকটি পাঠান:</span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    যেকোনো ডিভাইসে সরাসরি ওপেন হবে ✓
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareableTestUrl(createdTestResult)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyLink(createdTestResult)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    {copiedPin === createdTestResult.pin ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>লিংক কপি</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Anti-Cheating & Student Experience Note */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>সন্তানের পরীক্ষা অভিজ্ঞতা ও নিরাপত্তা:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  • সন্তান বা পরীক্ষার্থী এই লিংকে ঢুকলে সরাসরি পরীক্ষার স্ক্রিন দেখতে পাবে। কোনো হোমপেজে আটকাবে না।<br />
                  • 'পরীক্ষা শুরু করুন' বাটন চাপলেই ফ্রন্ট ক্যামেরা ওপেন হবে, নতুন ট্যাব লক হবে ও টাইমার চালু হবে।<br />
                  • নির্দিষ্ট সময় পর খাতা স্বয়ংক্রিয়ভাবে অভিভাবকের কাছে জমা হবে।
                </p>
              </div>

              {/* Direct WhatsApp Share & Dismiss */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `তোমার জন্য একটি নতুন অনলাইন পরীক্ষা নির্ধারণ করা হয়েছে: ${createdTestResult.title}\nসরাসরি পরীক্ষা দেওয়ার লিংক:\n${getShareableTestUrl(createdTestResult)}\n\n(অথবা ৬-সংখ্যার পিন: ${createdTestResult.pin})`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>হোয়াটসঅ্যাপে পাঠান</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setCreatedTestResult(null);
                    setActiveViewMode('tests');
                  }}
                  className="py-3 px-5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  সম্পন্ন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: GRADING & PARENT FEEDBACK MODAL                 */}
      {/* ======================================================== */}
      {reviewTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  খাতা মূল্যায়ন ও মন্তব্য
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {reviewTest.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewTest(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Proctoring & Integrity Summary */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-700">ফ্রন্ট ক্যামেরা: সক্রিয় ছিল</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${reviewTest.proctoringFlags && reviewTest.proctoringFlags.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <span className={`font-bold ${reviewTest.proctoringFlags && reviewTest.proctoringFlags.length > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
                    নকল সতর্কতা: {reviewTest.proctoringFlags && reviewTest.proctoringFlags.length > 0 ? `${reviewTest.proctoringFlags.length} বার সনাক্ত` : '০ বার (স্বাভাবিক ও সৎ)'}
                  </span>
                </div>
              </div>

              {reviewTest.proctoringFlags && reviewTest.proctoringFlags.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1.5 animate-in fade-in">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>ক্যামেরা ও এআই কর্তৃক সনাক্তকৃত সতর্কতার লগ:</span>
                  </div>
                  <ul className="space-y-1 pl-1 text-[11px] text-amber-800 font-medium">
                    {reviewTest.proctoringFlags.map((flag, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Questions breakdown */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              <h4 className="text-xs font-bold text-slate-500">উত্তরপত্র বিস্তারিত:</h4>
              {reviewTest.questions.map((q, idx) => {
                const isCorrect = q.studentAnswer === q.correctAnswer;
                return (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {toBn(idx + 1)}. {q.question}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? '✓ সঠিক' : '✗ ভুল'}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <span>সন্তানের দেওয়া উত্তর: </span>
                      <span className="font-bold text-slate-800">{q.studentAnswer || 'উত্তর দেয়নি'}</span>
                    </div>
                    <div className="text-slate-600">
                      <span>সঠিক উত্তর: </span>
                      <span className="font-bold text-emerald-700">{q.correctAnswer}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Parent Feedback & Score Input */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  চূড়ান্ত স্কোর নির্ধারণ (১০০ এর মধ্যে):
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={approvedScore}
                  onChange={(e) => setApprovedScore(Number(e.target.value))}
                  className="w-32 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অভিভাবকের দিকনির্দেশনামূলক মন্তব্য ও পরামর্শ:
                </label>
                <textarea
                  rows={3}
                  value={parentComment}
                  onChange={(e) => setParentComment(e.target.value)}
                  placeholder="যেমন: মাশাআল্লাহ্‌ খুব ভালো হয়েছে! তবে গণিতের ৩ নং প্রশ্নের সূত্রে আরও যত্নশীল হতে হবে..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewTest(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvaluation}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>ফলাফল ও মন্তব্য অনুমোদন করুন</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE TEST CONFIRMATION                        */}
      {/* ======================================================== */}
      {testToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  পরীক্ষাটি মুছে ফেলতে চান?
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">পরীক্ষার নাম:</span>
                <span className="font-bold text-slate-800 text-right">{testToDelete.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">পরীক্ষার পিন:</span>
                <span className="font-mono font-bold text-blue-600">{testToDelete.pin}</span>
              </div>
            </div>

            <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 leading-relaxed">
              সতর্কতা: এটি নিশ্চিত করলে প্রশ্নপত্র এবং এর সাথে সম্পর্কিত খাতা ও মূল্যায়নের সকল রেকর্ড তালিকা থেকে সম্পূর্ণ মুছে যাবে।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTestToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTest}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: SHARE TEST MODAL (WHATSAPP, SHORT URL, PIN)     */}
      {/* ======================================================== */}
      {shareModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    পরীক্ষা শেয়ার ও লিংক
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {shareModalTest.subject} • {shareModalTest.chapter}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareModalTest(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Test Details Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">পরীক্ষার নাম:</span>
                <span className="font-bold text-slate-800">{shareModalTest.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">মোট প্রশ্ন ও সময়:</span>
                <span className="font-semibold text-slate-800">
                  {toBn(shareModalTest.questionCount)}টি প্রশ্ন • {toBn(shareModalTest.durationMinutes)} মিনিট
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                <span className="text-slate-600 font-bold">৬-সংখ্যার পিন (PIN):</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-blue-600 tracking-wider">
                    {shareModalTest.pin}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(shareModalTest.pin);
                      showToast('✓ পিন কপি হয়েছে!');
                    }}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
                    title="পিন কপি করুন"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Short Direct Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>সরাসরি পরীক্ষা দেওয়ার লিংক:</span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  লগইন ছাড়াই সরাসরি ওপেন হবে ✓
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareableTestUrl(shareModalTest)}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(shareModalTest)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {copiedPin === shareModalTest.pin ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* WhatsApp & Native Share Buttons */}
            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `দা পাঠশালা: ${shareModalTest.title}\nসময়: ${toBn(shareModalTest.durationMinutes)} মিনিট, মোট প্রশ্ন: ${toBn(shareModalTest.questionCount)}টি।\n\nপরীক্ষায় অংশ নিতে নিচের লিংকে ক্লিক করো:\n${getShareableTestUrl(shareModalTest)}\n\n(অথবা দা পাঠশালা পোর্টালে পিন দাও: ${shareModalTest.pin})`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে সরাসরি পাঠান</span>
              </a>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.share({
                        title: shareModalTest.title,
                        text: `দা পাঠশালা: ${shareModalTest.title} (পিন: ${shareModalTest.pin})\nলিংক: `,
                        url: getShareableTestUrl(shareModalTest)
                      });
                    } catch (e) {
                      // ignore cancelled
                    }
                  }}
                  className="w-full py-2 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>অন্য অ্যাপে শেয়ার করুন</span>
                </button>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShareModalTest(null)}
                className="px-5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: RETAKE CONFIRMATION MODAL                       */}
      {/* ======================================================== */}
      {retakeModalTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-amber-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  পুনঃপরীক্ষা নেওয়ার অনুমতি দিন
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  সন্তান আবার নতুন করে পরীক্ষা দিতে পারবে
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">পরীক্ষার নাম:</span>
                <span className="font-bold text-slate-800 text-right">{retakeModalTest.title}</span>
              </div>
              {retakeModalTest.score !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">পূর্ববর্তী প্রাপ্ত নম্বর:</span>
                  <span className="font-bold text-amber-700">{toBn(retakeModalTest.score)}%</span>
                </div>
              )}
            </div>

            <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
              আপনি কি সন্তানকে পুনরায় এই পরীক্ষা দেওয়ার সুযোগ দিতে চান? এতে খাতার পূর্ববর্তী অবস্থা রিসেট হয়ে আবার পেন্ডিং হবে এবং সন্তান নতুন করে পরীক্ষা শুরু করতে পারবে।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRetakeModalTest(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmRetakeTest}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>হ্যাঁ, পুনঃপরীক্ষা দিন</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
