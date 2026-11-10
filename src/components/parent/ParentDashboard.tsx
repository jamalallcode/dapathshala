import React, { useState, useEffect } from 'react';
import { 
  Plus, PlusCircle, Trash2, Copy, Check, Eye, FileText, FileCheck, CheckCircle2, 
  Clock, Shield, ShieldAlert, AlertTriangle, MessageSquare, ChevronRight, Share2,
  TrendingUp, Award, BookOpen, Sparkles, RefreshCw, Edit3, X,
  Save, AlertCircle, Camera, ExternalLink, HelpCircle, GraduationCap, ArrowRight, ArrowLeft,
  RotateCcw, MessageCircle, Lightbulb, ChevronDown, Printer, Settings,
  Brain, Trophy, Target, Zap, Landmark, School, Lock, Globe, FolderArchive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AssignedTest, StudentSubmission, ExamQuestion, ViolationSnapshot } from '../../types';
import { 
  getStoredTests, 
  saveStoredTests, 
  clearAllStoredTests, 
  deleteStoredTest,
  isPinDeleted,
  getStoredSubmissions, 
  saveStoredSubmission,
  getStoredNotifications,
  saveStoredNotifications,
  getShareableTestUrl,
  syncTestToServer,
  fetchTestFromServer,
  fetchSubmissionFromServer,
  fetchAllTestsFromServer,
  syncSubmissionToServer
} from '../../lib/storage';
import { 
  CHAPTER_QUESTION_BANK, 
  getQuestionsForChapter, 
  getAlternativeQuestion,
  generateTwoSolutions
} from '../../lib/curriculumQuestions';
import { 
  NCTB_CLASSES, 
  NCTB_CURRICULUM_MAP, 
  DifficultyLevel, 
  getQuestionsFromNCTBBank, 
  getAlternativeNCTBQuestion 
} from '../../lib/nctbCurriculum';
import { getCurrentParent, logoutParent, ParentUser } from '../../lib/parentAuth';
import { ParentSettingsModal } from './ParentSettingsModal';
import { InstitutionPaperExplorer } from './InstitutionPaperExplorer';
import { AdminPaperBulkUploadModal } from '../admin/AdminPaperBulkUploadModal';
import { InstitutionPaper } from '../../lib/institutionPapers';
import { 
  BLOOM_LEVELS, 
  BloomLevel, 
  normalizeBloomLevel, 
  inferBloomLevelFromQuestion, 
  calculateBloomStats 
} from '../../lib/bloomTaxonomy';
import { PrintableQuestionPaperModal } from '../exam/PrintableQuestionPaperModal';
import { TeacherQuestionLibrary } from './TeacherQuestionLibrary';

interface ParentDashboardProps {
  onOpenTest: (test: AssignedTest) => void;
  onOpenReview: (test: AssignedTest) => void;
  onNavigateHome?: () => void;
  activeTab?: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report' | 'settings' | 'games' | 'library';
  onTabChange?: (tab: 'overview' | 'assigned' | 'review' | 'proctoring' | 'report' | 'settings' | 'games' | 'library') => void;
  showCreateModalExternal?: boolean;
  onCloseCreateModalExternal?: () => void;
  isSettingsOpenExternal?: boolean;
  onCloseSettingsExternal?: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  onOpenTest,
  onOpenReview,
  onNavigateHome,
  activeTab,
  onTabChange,
  showCreateModalExternal,
  onCloseCreateModalExternal,
  isSettingsOpenExternal,
  onCloseSettingsExternal
}) => {
  const [tests, setTests] = useState<AssignedTest[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'profile' | 'password' | 'preferences'>('preferences');
  const showSettingsModal = Boolean(isSettingsOpenExternal || isSettingsOpen || activeTab === 'settings');

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    onCloseSettingsExternal?.();
    if (activeTab === 'settings' && onTabChange) {
      onTabChange('assigned');
    }
  };
  const [activeViewMode, setActiveViewMode] = useState<'builder' | 'tests' | 'institution_papers'>('tests');
  const [filterMode, setFilterMode] = useState<'all' | 'unreviewed'>('all');
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<ViolationSnapshot | null>(null);

  // Configuration for AI Question Builder & NCTB Question Bank
  const [selectedClass, setSelectedClass] = useState<string>('১০ম শ্রেণি (এসএসসি নির্বাচনী/বোর্ড)');
  const [selectedSubject, setSelectedSubject] = useState<string>('সাধারণ গণিত');
  const [selectedChapter, setSelectedChapter] = useState<string>('বীজগণিতীয় রাশি ও সমীকরণ');
  const [selectedChapters, setSelectedChapters] = useState<string[]>(['বীজগণিতীয় রাশি ও সমীকরণ']);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('all');
  const [questionCount, setQuestionCount] = useState(20);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [recentlySwappedIndex, setRecentlySwappedIndex] = useState<number | null>(null);
  const [manualBatchMode, setManualBatchMode] = useState<'batch' | 'blank'>('batch');
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [proctoringLevel, setProctoringLevel] = useState<1 | 2 | 3 | 4>(() => {
    const saved = localStorage.getItem('dapathshala_parent_proctoring_level');
    return (saved ? Number(saved) : 2) as 1 | 2 | 3 | 4;
  });

  // Creation Mode Selection: 'manual' (নিজে প্রশ্ন তৈরি করুন) vs 'ai' (এআই দিয়ে তৈরি করুন) vs 'institution' (প্রতিষ্ঠান ও সালের প্রশ্ন)
  const [showCreationModeModal, setShowCreationModeModal] = useState(false);
  const [creationMode, setCreationMode] = useState<'manual' | 'ai' | 'institution'>('manual');
  const [showAdminUploadModal, setShowAdminUploadModal] = useState(false);

  // Authentic School & Board Question Paper Header metadata (3rd Picture Format)
  const [selectedInstitutionMeta, setSelectedInstitutionMeta] = useState<{
    institutionName: string;
    year: string;
    studentClass: string;
    subject: string;
    examType: string;
    region?: string;
    subjectCode: string;
    setCode: string;
    paperPart?: string;
  }>({
    institutionName: 'মতিঝিল সরকারি বালিকা উচ্চ বিদ্যালয়',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি',
    subject: 'বাংলা ১ম পত্র',
    examType: 'নির্বাচনী পরীক্ষা / টেস্ট পরীক্ষা',
    region: 'বুড়িগঙ্গা',
    subjectCode: '১০১',
    setCode: '০৩ সেট',
    paperPart: 'প্রথম পত্র'
  });

  // Custom exam title input
  const [examTitleInput, setExamTitleInput] = useState('');
  // Track which paper is currently being edited/modified in builder
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);

  // Questions state for authoring (starts with a single blank question format for manual mode)
  const [generatedQuestions, setGeneratedQuestions] = useState<ExamQuestion[]>([
    {
      id: 'manual_q_init_1',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      correctAnswerIndex: undefined,
      explanation: ''
    }
  ]);

  // Track all used question texts so every skip produces a new unique question
  const [seenQuestionTexts, setSeenQuestionTexts] = useState<string[]>([]);

  // State to track expanded solution methods per question (hidden by default)
  const [expandedSolutions, setExpandedSolutions] = useState<Record<number, boolean>>({});
  const toggleSolution = (qIdx: number) => {
    setExpandedSolutions(prev => ({
      ...prev,
      [qIdx]: !prev[qIdx]
    }));
  };

  // State to track which question's explanation & steps are in edit mode
  const [editingSolutionIndices, setEditingSolutionIndices] = useState<Record<number, boolean>>({});
  const toggleEditSolution = (qIdx: number) => {
    setEditingSolutionIndices(prev => ({
      ...prev,
      [qIdx]: !prev[qIdx]
    }));
    // Auto-expand if currently closed
    setExpandedSolutions(prev => ({
      ...prev,
      [qIdx]: true
    }));
  };

  // Success Link Generation Modal & Finalized State
  const [createdTestResult, setCreatedTestResult] = useState<AssignedTest | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);

  // Question Paper Preview Modal (clean view without starting exam or auto-submitting)
  const [previewPaperTest, setPreviewPaperTest] = useState<AssignedTest | null>(null);

  // Official 2-Column A4 Printable Modal (School / Coaching Offline Exam & Answer Key)
  const [printModalTest, setPrintModalTest] = useState<AssignedTest | null>(null);

  // Review & Evaluation Modal
  const [reviewTest, setReviewTest] = useState<AssignedTest | null>(null);
  const [parentComment, setParentComment] = useState('');
  const [approvedScore, setApprovedScore] = useState<number>(0);

  // Controlling Action States (Delete, Share, Retake)
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);
  const [isDeletingAllInline, setIsDeletingAllInline] = useState(false);
  const [shareModalTest, setShareModalTest] = useState<AssignedTest | null>(null);
  const [retakeModalTest, setRetakeModalTest] = useState<AssignedTest | null>(null);

  const [currentParent, setCurrentParent] = useState<ParentUser | null>(() => getCurrentParent());

  // Load tests on mount and listen to updates (strictly filtered for current parent)
  // যদি কোনো অভিভাবক কোনো প্রশ্ন তৈরি করে না থাকে তবে কোনো অটোমেটিক প্রশ্ন দেখাবে না
  const loadTests = () => {
    const list = getStoredTests();
    const parent = getCurrentParent();
    if (parent?.phone) {
      // STRICT FILTER: Only tests explicitly created by this parent!
      const filtered = list.filter(t => t.parentPhone && t.parentPhone === parent.phone);
      setTests(filtered);
    } else {
      setTests([]);
    }
  };

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {}
    loadTests();

    const handleStorage = () => loadTests();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('dapathshala_tests_updated', handleStorage);
    window.addEventListener('dapathshala_submissions_updated', handleStorage);
    window.addEventListener('dapathshala_notifs_updated', handleStorage);
    const handleOpenAdmin = () => setShowAdminUploadModal(true);
    window.addEventListener('dapathshala_open_admin_portal', handleOpenAdmin);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dapathshala_tests_updated', handleStorage);
      window.removeEventListener('dapathshala_submissions_updated', handleStorage);
      window.removeEventListener('dapathshala_notifs_updated', handleStorage);
      window.removeEventListener('dapathshala_open_admin_portal', handleOpenAdmin);
    };
  }, []);

  // Tab-based view routing from Sidebar options
  useEffect(() => {
    if (activeTab === 'assigned') {
      setActiveViewMode('tests');
      setFilterMode('all');
    } else if (activeTab === 'review') {
      setActiveViewMode('tests');
      setFilterMode('unreviewed');
    }
  }, [activeTab]);

  // Quiz & Brain Games State
  const [gamesTab, setGamesTab] = useState<'math' | 'gk'>('math');
  const [mathNum1, setMathNum1] = useState(14);
  const [mathNum2, setMathNum2] = useState(8);
  const [mathOp, setMathOp] = useState<'+' | '-' | '×'>('+');
  const [mathOptions, setMathOptions] = useState<number[]>([22, 20, 24, 21]);
  const [mathScore, setMathScore] = useState(0);
  const [mathStreak, setMathStreak] = useState(0);
  const [mathFeedback, setMathFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateNewMathProblem = () => {
    const ops: ('+' | '-' | '×')[] = ['+', '-', '×'];
    const chosenOp = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 20) + 2;
    let n2 = Math.floor(Math.random() * 15) + 1;
    if (chosenOp === '-' && n1 < n2) {
      const temp = n1;
      n1 = n2;
      n2 = temp;
    }
    if (chosenOp === '×') {
      n1 = Math.floor(Math.random() * 10) + 2;
      n2 = Math.floor(Math.random() * 9) + 2;
    }
    const ans = chosenOp === '+' ? n1 + n2 : chosenOp === '-' ? n1 - n2 : n1 * n2;
    setMathNum1(n1);
    setMathNum2(n2);
    setMathOp(chosenOp);

    const opts = new Set<number>([ans]);
    while (opts.size < 4) {
      const offset = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = Math.max(0, ans + offset);
      if (fake !== ans) opts.add(fake);
    }
    setMathOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    setMathFeedback(null);
  };

  const handleMathAnswer = (val: number) => {
    const correctAns = mathOp === '+' ? mathNum1 + mathNum2 : mathOp === '-' ? mathNum1 - mathNum2 : mathNum1 * mathNum2;
    if (val === correctAns) {
      setMathFeedback('correct');
      setMathScore(prev => prev + 10);
      setMathStreak(prev => prev + 1);
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      } catch {}
      setTimeout(() => {
        generateNewMathProblem();
      }, 700);
    } else {
      setMathFeedback('wrong');
      setMathStreak(0);
    }
  };

  // GK Trivia State
  const [currentGkIndex, setCurrentGkIndex] = useState(0);
  const [gkSelectedOption, setGkSelectedOption] = useState<number | null>(null);
  const [gkScore, setGkScore] = useState(0);
  const [isGkFinished, setIsGkFinished] = useState(false);

  const gkQuestions = [
    {
      q: 'বাংলাদেশের জাতীয় স্মৃতিসৌধের প্রধান স্থপতি কে?',
      options: ['সৈয়দ মাইনুল হোসেন', 'মাজহারুল ইসলাম', 'হামিদুর রহমান', 'মুস্তাফা মনোয়ার'],
      correct: 0,
      exp: 'জাতীয় স্মৃতিসৌধ সাভারে অবস্থিত এবং এর স্থপতি সৈয়দ মাইনুল হোসেন।'
    },
    {
      q: 'সৌরজগতের সবচেয়ে বড় গ্রহ কোনটি?',
      options: ['মঙ্গল', 'বৃহস্পতি', 'শনি', 'পৃথিবী'],
      correct: 1,
      exp: 'বৃহস্পতি (Jupiter) সৌরজগতের বৃহত্তম গ্রহ।'
    },
    {
      q: 'পানির রাসায়নিক সংকেত কোনটি?',
      options: ['CO2', 'NaCl', 'H2O', 'O2'],
      correct: 2,
      exp: 'পানির রাসায়নিক সংকেত হলো H2O (দুইটি হাইড্রোজেন ও একটি অক্সিজেন পরমাণু)।'
    },
    {
      q: 'আন্তর্জাতিক মাতৃভাষা দিবস কোন তারিখে পালিত হয়?',
      options: ['২৬শে মার্চ', '১৬ই ডিসেম্বর', '২১শে ফেব্রুয়ারি', '৭ই মার্চ'],
      correct: 2,
      exp: 'ইউনেস্কোর ঘোষণার পর প্রতি বছর ২১শে ফেব্রুয়ারি আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে পালিত হয়।'
    },
    {
      q: 'গাছের পাতা সবুজ দেখায় কোন উপাদানের কারণে?',
      options: ['ক্লোরোফিল', 'ক্যারোটিন', 'নাইট্রোজেন', 'হিমোগ্লোবিন'],
      correct: 0,
      exp: 'পাতায় ক্লোরোফিল নামক রঞ্জক পদার্থ থাকার কারণে গাছের পাতা সবুজ দেখায়।'
    }
  ];

  const handleGkAnswer = (optionIdx: number) => {
    if (gkSelectedOption !== null) return;
    setGkSelectedOption(optionIdx);
    if (optionIdx === gkQuestions[currentGkIndex].correct) {
      setGkScore(prev => prev + 20);
      try {
        confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
      } catch {}
    }
  };

  const handleNextGkQuestion = () => {
    if (currentGkIndex < gkQuestions.length - 1) {
      setCurrentGkIndex(prev => prev + 1);
      setGkSelectedOption(null);
    } else {
      setIsGkFinished(true);
    }
  };

  const handleRestartGk = () => {
    setCurrentGkIndex(0);
    setGkSelectedOption(null);
    setGkScore(0);
    setIsGkFinished(false);
  };

  const [isSyncing, setIsSyncing] = useState(false);

  // Background sync from server: checks if student has submitted any exam
  // so the button flips from "প্রশ্নপত্র দেখুন" to "উত্তরপত্র" automatically
  const runSync = async (notifyUser = false) => {
    try {
      const localTests = getStoredTests();
      if (!localTests || localTests.length === 0) return;
      let hasChanges = false;

      const mergedMap = new Map<string, AssignedTest>();
      localTests.forEach(t => {
        const key = String(t.pin || t.id).trim();
        mergedMap.set(key, t);
      });

      // ONLY check if the student has submitted answers for any of THIS parent's own pending tests:
      await Promise.all(localTests.map(async (t) => {
        if (isPinDeleted(t.pin, t.id)) return;
        if (t.status === 'pending') {
          let serverData = t.pin ? await fetchSubmissionFromServer(t.pin) : null;
          if (!serverData && t.id) {
            serverData = await fetchSubmissionFromServer(t.id);
          }
          if (serverData && (serverData.status === 'submitted' || serverData.status === 'reviewed')) {
            const key = String(t.pin || t.id).trim();
            const existing = mergedMap.get(key) || t;
            mergedMap.set(key, {
              ...existing,
              ...serverData,
              status: serverData.status,
              score: serverData.score ?? existing.score,
              questions: (serverData.questions && serverData.questions.length > 0) ? serverData.questions : existing.questions,
              proctoringFlags: serverData.proctoringFlags || existing.proctoringFlags
            });
            hasChanges = true;
          }
        }
      }));

      if (hasChanges) {
        const updated = Array.from(mergedMap.values());
        setTests(updated);
        saveStoredTests(updated);
        if (notifyUser) {
          showToast('✓ নতুন উত্তরপত্র সিঙ্ক সম্পন্ন! খাতা জমা পাওয়া গেছে।');
        }
      } else if (notifyUser) {
        showToast('✓ সার্ভারের সাথে সিঙ্ক সম্পন্ন হয়েছে। খাতা সর্বশেষ আপডেটেড রয়েছে।');
      }
    } catch (err) {
      console.warn('Error checking server updates in ParentDashboard:', err);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    runSync();
    const interval = setInterval(() => {
      if (!isCancelled) runSync();
    }, 1500);
    const onFocus = () => {
      if (!isCancelled) runSync();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      isCancelled = true;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await runSync(true);
    setTimeout(() => setIsSyncing(false), 500);
  };

  useEffect(() => {
    if (showCreateModalExternal) {
      setShowCreationModeModal(true);
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

  // Helper to automatically update exam title whenever Class, Subject, or Chapter is selected
  const updateExamTitle = (cls: string, sub: string, chap: string) => {
    setExamTitleInput(`${cls} - ${sub}: ${chap} মূল্যায়ন`);
  };

  // Dynamically compute subjects based on selected class
  const getAvailableSubjects = (cls: string): string[] => {
    const fromMap = NCTB_CURRICULUM_MAP[cls];
    if (fromMap && Object.keys(fromMap).length > 0) {
      return Object.keys(fromMap);
    }
    return Object.keys(subjectChapters);
  };

  // Dynamically compute chapters based on selected class & subject
  const getAvailableChapters = (cls: string, sub: string): string[] => {
    const fromMap = NCTB_CURRICULUM_MAP[cls]?.[sub];
    if (fromMap && fromMap.length > 0) {
      return fromMap;
    }
    return subjectChapters[sub] || ['সাধারণ অধ্যায়'];
  };

  // Central question generator from NCTB bank with strict chapter filtering
  const fetchExamQuestionsFromCurriculum = (
    cls: string,
    sub: string,
    chaps: string[],
    diff: DifficultyLevel,
    count: number
  ): ExamQuestion[] => {
    const raw = getQuestionsFromNCTBBank({
      selectedClass: cls,
      selectedSubject: sub,
      selectedChapters: chaps,
      difficulty: diff,
      count: count
    });

    const mapped: ExamQuestion[] = (raw || []).map((q, idx) => {
      const correctIdx = q.options.findIndex(o => o === q.correctAnswer);
      const resolvedSolutions = (q.solutions && q.solutions.length >= 2)
        ? q.solutions
        : generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation || 'পাঠ্যবই অনুযায়ী বিশ্লেষণ');
      const resolvedCognitive = q.cognitiveLevel || inferBloomLevelFromQuestion(q.question, q.explanation);

      return {
        id: q.id || `nctb_q_${Date.now()}_${idx}`,
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        correctAnswerIndex: correctIdx !== -1 ? correctIdx : (q.correctAnswerIndex ?? 0),
        explanation: q.explanation || '',
        solutions: resolvedSolutions,
        difficulty: q.difficulty,
        cognitiveLevel: resolvedCognitive,
        chapter: q.chapter,
        format: q.format,
        stimulus: q.stimulus
      };
    });

    if (mapped.length >= count) {
      return mapped.slice(0, count);
    }

    // Fallback to legacy getQuestionsForChapter if needed
    const needed = count - mapped.length;
    const fallback = getQuestionsForChapter(sub, chaps[0] || selectedChapter, needed);
    const fallbackMapped: ExamQuestion[] = fallback.map((q, idx) => {
      const correctIdx = q.options.findIndex(o => o === q.correctAnswer);
      const resolvedCognitive = inferBloomLevelFromQuestion(q.question, q.explanation);
      return {
        id: q.id || `legacy_q_${Date.now()}_${idx}`,
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
        explanation: q.explanation || '',
        solutions: q.solutions || generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation),
        difficulty: 'medium',
        cognitiveLevel: resolvedCognitive,
        chapter: chaps[0] || selectedChapter
      };
    });

    return [...mapped, ...fallbackMapped].slice(0, count);
  };

  // When class changes, dynamically adapt subjects & chapters and auto-update title & questions
  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    const availableSubs = getAvailableSubjects(cls);
    const newSub = availableSubs.includes(selectedSubject) ? selectedSubject : availableSubs[0];
    setSelectedSubject(newSub);
    const availableChaps = getAvailableChapters(cls, newSub);
    const newChapters = availableChaps.length > 0 ? [availableChaps[0]] : ['সাধারণ অধ্যায়'];
    setSelectedChapters(newChapters);
    setSelectedChapter(newChapters[0]);
    updateExamTitle(cls, newSub, newChapters[0]);

    if (creationMode === 'ai') {
      const newQuestions = fetchExamQuestionsFromCurriculum(cls, newSub, newChapters, selectedDifficulty, questionCount);
      setGeneratedQuestions(newQuestions);
    }
  };

  // When subject changes, set default chapter and auto-update title & questions
  const handleSubjectChange = (sub: string) => {
    setSelectedSubject(sub);
    const availableChaps = getAvailableChapters(selectedClass, sub);
    const newChapters = availableChaps.length > 0 ? [availableChaps[0]] : ['সাধারণ অধ্যায়'];
    setSelectedChapters(newChapters);
    setSelectedChapter(newChapters[0]);
    updateExamTitle(selectedClass, sub, newChapters[0]);

    if (creationMode === 'ai') {
      const newQuestions = fetchExamQuestionsFromCurriculum(selectedClass, sub, newChapters, selectedDifficulty, questionCount);
      setGeneratedQuestions(newQuestions);
    }
  };

  // Multi-chapter selection toggles
  const handleToggleChapter = (chap: string) => {
    let updated: string[];
    if (selectedChapters.includes(chap)) {
      if (selectedChapters.length === 1) {
        showToast('⚠️ অন্তত ১টি অধ্যায় নির্বাচিত থাকতে হবে!');
        return;
      }
      updated = selectedChapters.filter(c => c !== chap);
    } else {
      updated = [...selectedChapters, chap];
    }
    setSelectedChapters(updated);
    setSelectedChapter(updated[0] || chap);
    const titleChapPart = updated.length > 1 ? `${toBn(updated.length)}টি অধ্যায়` : updated[0];
    updateExamTitle(selectedClass, selectedSubject, titleChapPart);

    if (creationMode === 'ai') {
      const newQuestions = fetchExamQuestionsFromCurriculum(selectedClass, selectedSubject, updated, selectedDifficulty, questionCount);
      setGeneratedQuestions(newQuestions);
      showToast(`✨ নির্বাচিত অধ্যায়সমূহ (${toBn(updated.length)}টি) থেকে প্রশ্ন সাজানো হয়েছে!`);
    }
  };

  // Select all chapters of the current subject
  const handleSelectAllChapters = () => {
    const all = getAvailableChapters(selectedClass, selectedSubject);
    setSelectedChapters(all);
    setSelectedChapter(all[0] || 'সব অধ্যায়');
    updateExamTitle(selectedClass, selectedSubject, 'সম্পূর্ণ বই / সকল অধ্যায়');

    if (creationMode === 'ai') {
      const newQuestions = fetchExamQuestionsFromCurriculum(selectedClass, selectedSubject, all, selectedDifficulty, questionCount);
      setGeneratedQuestions(newQuestions);
      showToast(`✨ বিষয়টির সকল (${toBn(all.length)}টি) অধ্যায় নির্বাচন করা হয়েছে!`);
    }
  };

  // Difficulty change handler
  const handleDifficultyChange = (diff: DifficultyLevel) => {
    setSelectedDifficulty(diff);
    if (creationMode === 'ai') {
      const newQuestions = fetchExamQuestionsFromCurriculum(selectedClass, selectedSubject, selectedChapters, diff, questionCount);
      setGeneratedQuestions(newQuestions);
      const diffLabel = diff === 'easy' ? 'সহজ' : diff === 'medium' ? 'মাঝারি' : diff === 'hard' ? 'কঠিন' : 'সকল মাত্রা (মিশ্র)';
      showToast(`🎯 প্রশ্নের মান "${diffLabel}" অনুযায়ী বিন্যস্ত করা হয়েছে!`);
    }
  };

  // When single chapter changes (backward compatibility)
  const handleChapterChange = (chap: string) => {
    setSelectedChapters([chap]);
    setSelectedChapter(chap);
    updateExamTitle(selectedClass, selectedSubject, chap);

    if (creationMode === 'ai') {
      const newQuestions = fetchExamQuestionsFromCurriculum(selectedClass, selectedSubject, [chap], selectedDifficulty, questionCount);
      setGeneratedQuestions(newQuestions);
    }
  };

  // Add a new question: blank format for manual mode, or curriculum bank for AI mode
  const handleAddQuestion = () => {
    const nextNum = generatedQuestions.length + 1;
    if (creationMode === 'manual') {
      const newBlankQ: ExamQuestion = {
        id: `manual_q_${Date.now()}_${nextNum}`,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        correctAnswerIndex: undefined,
        explanation: ''
      };
      setGeneratedQuestions(prev => [...prev, newBlankQ]);
      showToast(`✓ নতুন প্রশ্ন ${toBn(nextNum)} এর খালি ফরম্যাট যুক্ত হয়েছে! আপনার প্রশ্ন ও অপশন লিখুন।`);
    } else {
      const existingTexts = generatedQuestions.map(q => q.question);
      const nctbReplacement = getAlternativeNCTBQuestion(
        selectedSubject,
        selectedChapters,
        existingTexts,
        selectedDifficulty
      );

      if (nctbReplacement) {
        const correctIdx = nctbReplacement.options.findIndex(o => o === nctbReplacement.correctAnswer);
        const newQ: ExamQuestion = {
          id: nctbReplacement.id || `nctb_q_${Date.now()}_${nextNum}`,
          question: nctbReplacement.question,
          options: [...nctbReplacement.options],
          correctAnswer: nctbReplacement.correctAnswer,
          correctAnswerIndex: correctIdx !== -1 ? correctIdx : (nctbReplacement.correctAnswerIndex ?? 0),
          explanation: nctbReplacement.explanation || '',
          solutions: nctbReplacement.solutions || [nctbReplacement.explanation || ''],
          difficulty: nctbReplacement.difficulty,
          cognitiveLevel: nctbReplacement.cognitiveLevel,
          chapter: nctbReplacement.chapter,
          format: nctbReplacement.format,
          stimulus: nctbReplacement.stimulus
        };
        setGeneratedQuestions(prev => [...prev, newQ]);
        showToast(`✓ প্রশ্ন নম্বর ${toBn(nextNum)} অধ্যায় "${nctbReplacement.chapter}" থেকে যুক্ত হয়েছে!`);
      } else {
        const newFromBank = getAlternativeQuestion(selectedSubject, selectedChapters[0] || selectedChapter, existingTexts);
        const correctIdx = newFromBank.options.findIndex(o => o === newFromBank.correctAnswer);

        const newQ: ExamQuestion = {
          id: `ai_q_${Date.now()}_${nextNum}`,
          question: newFromBank.question,
          options: [...newFromBank.options],
          correctAnswer: newFromBank.correctAnswer,
          correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
          explanation: newFromBank.explanation || '',
          solutions: newFromBank.solutions || generateTwoSolutions(newFromBank.question, newFromBank.options, newFromBank.correctAnswer, newFromBank.explanation),
          difficulty: 'medium',
          chapter: selectedChapters[0] || selectedChapter
        };

        setGeneratedQuestions(prev => [...prev, newQ]);
        showToast(`✓ প্রশ্ন নম্বর ${toBn(nextNum)} এআই দ্বারা যুক্ত হয়েছে!`);
      }
    }
  };

  // Update question text
  const handleUpdateQuestionText = (index: number, text: string) => {
    setGeneratedQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], question: text };
      return copy;
    });
  };

  // Update question explanation
  const handleUpdateQuestionExplanation = (index: number, text: string) => {
    setGeneratedQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], explanation: text };
      return copy;
    });
  };

  // Update option text
  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    setGeneratedQuestions(prev => {
      const copy = [...prev];
      const q = copy[qIdx];
      const prevOpt = q.options[optIdx];
      const newOptions = [...q.options];
      newOptions[optIdx] = val;
      let newCorrect = q.correctAnswer;
      // If this option is marked as correct either by index or matching previous value
      if (q.correctAnswerIndex === optIdx || (newCorrect === prevOpt && prevOpt !== '')) {
        newCorrect = val;
      }
      copy[qIdx] = { ...q, options: newOptions, correctAnswer: newCorrect };
      return copy;
    });
  };

  // Select which option is correct answer via tick button
  const handleSetCorrectAnswerByIndex = (qIdx: number, optIdx: number) => {
    setGeneratedQuestions(prev => {
      const copy = [...prev];
      const q = copy[qIdx];
      const optVal = q.options[optIdx] || '';
      copy[qIdx] = { 
        ...q, 
        correctAnswer: optVal,
        correctAnswerIndex: optIdx
      };
      return copy;
    });
    const letter = ['ক', 'খ', 'গ', 'ঘ'][optIdx] || (optIdx + 1);
    showToast(`✓ অপশন (${letter}) সঠিক উত্তর হিসেবে টিক দেওয়া হয়েছে।`);
  };

  // Legacy helper
  const handleSetCorrectAnswer = (qIdx: number, optVal: string) => {
    setGeneratedQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correctAnswer: optVal };
      return copy;
    });
    showToast(`✓ প্রশ্ন ${toBn(qIdx + 1)} এর সঠিক উত্তর নির্ধারণ করা হয়েছে।`);
  };

  // Update Bloom's Taxonomy cognitive level for a question
  const handleUpdateCognitiveLevel = (qIdx: number, level: BloomLevel) => {
    setGeneratedQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], cognitiveLevel: level };
      return copy;
    });
    showToast(`✓ প্রশ্ন ${toBn(qIdx + 1)} এর স্তর "${BLOOM_LEVELS[level].banglaName}" এ নির্ধারিত হয়েছে।`);
  };

  // Update explanation text for a question
  const handleUpdateExplanation = (qIdx: number, newExplanation: string) => {
    setGeneratedQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], explanation: newExplanation };
      return copy;
    });
  };

  // Update specific solution method (Method 1 or Method 2) for a question
  const handleUpdateSolutionMethod = (qIdx: number, methodIdx: number, newText: string) => {
    setGeneratedQuestions(prev => {
      const copy = [...prev];
      const q = copy[qIdx];
      const currentSolutions = q.solutions && q.solutions.length >= 2
        ? [...q.solutions]
        : generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation);
      currentSolutions[methodIdx] = newText;
      copy[qIdx] = { ...q, solutions: currentSolutions };
      return copy;
    });
  };

  // Delete a question
  const handleDeleteQuestion = (index: number) => {
    if (generatedQuestions.length <= 1) {
      showToast('⚠️ পরীক্ষায় অন্তত ১টি প্রশ্ন থাকতে হবে!');
      return;
    }
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
    showToast('প্রশ্ন মুছে ফেলা হয়েছে।');
  };

  // Optional: Load suggestions from textbook ONLY if parent explicitly requests
  const handleLoadCurriculumSuggestion = () => {
    const questions = getQuestionsForChapter(selectedSubject, selectedChapter, questionCount);
    const mapped: ExamQuestion[] = questions.map((q, idx) => {
      const correctIdx = q.options.findIndex(o => o === q.correctAnswer);
      return {
        id: q.id || `bank_q_${Date.now()}_${idx}`,
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
        explanation: q.explanation || '',
        solutions: q.solutions || generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation)
      };
    });
    setGeneratedQuestions(mapped);
    showToast('✨ পাঠ্যবইয়ের প্রশ্নব্যাংক থেকে আইডিয়া লোড হয়েছে। নিজের মতো এডিট করতে পারেন।');
  };

  // Select creation mode from modal (১. ম্যানুয়াল মোড / ২. এআই মোড)
  const handleSelectCreationMode = (mode: 'manual' | 'ai') => {
    setCreationMode(mode);
    setIsFinalized(false);
    setCreatedTestResult(null);

    const chapSummary = selectedChapters.length > 1 ? `${toBn(selectedChapters.length)}টি অধ্যায়` : (selectedChapters[0] || selectedChapter);
    setExamTitleInput(`${selectedClass} - ${selectedSubject}: ${chapSummary} মূল্যায়ন`);

    if (mode === 'manual') {
      // ম্যানুয়াল মোড: নির্বাচিত অধ্যায় থেকে নির্দিষ্ট ব্যাচে (ডিফল্ট ২০টি প্রশ্ন) লোড হবে,
      // শিক্ষক যেকোনো প্রশ্ন পছন্দ না হলে "স্কিপ / পরিবর্তন" বাটনে ক্লিক করে ওই অধ্যায় থেকেই তাত্ক্ষণিক নতুন প্রশ্ন দিয়ে রিপ্লেস করতে পারবেন
      const batchCount = questionCount < 5 ? 20 : questionCount;
      setQuestionCount(batchCount);
      const batch = fetchExamQuestionsFromCurriculum(selectedClass, selectedSubject, selectedChapters, selectedDifficulty, batchCount);
      setGeneratedQuestions(batch);
      showToast(`✍️ ম্যানুয়াল মোডে ${toBn(batch.length)}টি প্রশ্ন লোড হয়েছে! অপছন্দ হলে 'স্কিপ / পরিবর্তন' চাপুন।`);
    } else {
      // এআই মোড: স্বয়ংক্রিয়ভাবে কারিকুলাম ও অধ্যায় অনুযায়ী প্রশ্ন লোড হবে
      const questions = fetchExamQuestionsFromCurriculum(selectedClass, selectedSubject, selectedChapters, selectedDifficulty, questionCount);
      setGeneratedQuestions(questions);
      showToast(`✨ এআই দ্বারা ${toBn(questions.length)}টি প্রশ্ন প্রস্তুত করা হয়েছে!`);
    }

    setActiveViewMode('builder');
    setShowCreationModeModal(false);
  };

  // Select Institution & Board Question Paper
  const handleSelectInstitutionPaper = (paper: InstitutionPaper) => {
    setCreationMode('institution');
    setIsFinalized(false);
    setCreatedTestResult(null);

    // Derive authentic subject code (e.g. বাংলা ১ম = ১০১, বাংলা ২য় = ১০২, গণিত = ১০৯, ইত্যাদি)
    let subCode = '১০১';
    let pPart = 'প্রথম পত্র';
    if (paper.subject.includes('গণিত')) {
      subCode = '১০৯';
      pPart = 'আবশ্যিক';
    } else if (paper.subject.includes('ইংরেজি ১ম') || paper.subject.includes('English 1st')) {
      subCode = '১০৭';
      pPart = 'প্রথম পত্র';
    } else if (paper.subject.includes('ইংরেজি ২য়') || paper.subject.includes('English 2nd')) {
      subCode = '১০৮';
      pPart = 'দ্বিতীয় পত্র';
    } else if (paper.subject.includes('পদার্থ')) {
      subCode = '১৩৬';
      pPart = 'তত্ত্বীয়';
    } else if (paper.subject.includes('রসায়ন')) {
      subCode = '১৩৭';
      pPart = 'তত্ত্বীয়';
    } else if (paper.subject.includes('জীববিজ্ঞান')) {
      subCode = '১৩৮';
      pPart = 'তত্ত্বীয়';
    } else if (paper.subject.includes('বিজ্ঞান')) {
      subCode = '১২৭';
      pPart = 'সাধারণ';
    } else if (paper.subject.includes('হিসাব')) {
      subCode = '১৪৬';
      pPart = 'ব্যবসায় শিক্ষা';
    }

    setSelectedInstitutionMeta({
      institutionName: paper.institutionName,
      year: paper.year,
      studentClass: paper.studentClass,
      subject: paper.subject,
      examType: paper.examType,
      region: paper.districtOrBoard || 'বুড়িগঙ্গা',
      subjectCode: subCode,
      setCode: '০৩ সেট',
      paperPart: pPart
    });

    const questions: ExamQuestion[] = (paper.questions || []).map((q, idx) => {
      const correctIdx = q.options.findIndex(o => o === q.correctAnswer);
      return {
        id: q.id || `inst_q_${Date.now()}_${idx}`,
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
        explanation: q.explanation || '',
        solutions: q.solutions || generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation)
      };
    });

    setGeneratedQuestions(questions);
    setSelectedClass(paper.studentClass || selectedClass);
    setSelectedSubject(paper.subject || selectedSubject);
    setExamTitleInput(`${paper.institutionName} - ${paper.studentClass} ${paper.subject} (${paper.examType} ${paper.year})`);
    setDurationMinutes(paper.durationMinutes || 30);
    setQuestionCount(questions.length);

    setActiveViewMode('builder');
    showToast(`🏛️ "${paper.institutionName}" এর প্রশ্নপত্র (${toBn(questions.length)}টি প্রশ্ন) লোড হয়েছে!`);
  };

  // Generate / Regenerate with AI strictly from selected NCTB chapters & difficulty
  const handleGenerateWithAI = () => {
    const questions = fetchExamQuestionsFromCurriculum(
      selectedClass,
      selectedSubject,
      selectedChapters,
      selectedDifficulty,
      questionCount
    );
    setGeneratedQuestions(questions);
    showToast(`✨ নির্বাচিত অধ্যায়সমূহ (${toBn(selectedChapters.length)}টি) থেকে ${toBn(questions.length)}টি প্রশ্ন প্রস্তুত হয়েছে!`);
  };

  // Skip / Replace question with alternative from selected NCTB chapters
  const handleSkipQuestion = (index: number) => {
    const currentOnScreen = generatedQuestions.map(q => q.question);
    const previousQuestionText = currentOnScreen[index];
    const allExcluded = Array.from(new Set([...currentOnScreen, ...seenQuestionTexts]));

    // Try NCTB replacement first strictly from selected chapters and difficulty
    const nctbReplacement = getAlternativeNCTBQuestion(
      selectedSubject,
      selectedChapters,
      allExcluded,
      selectedDifficulty
    );

    if (nctbReplacement) {
      const correctIdx = nctbReplacement.options.findIndex(o => o === nctbReplacement.correctAnswer);
      const updated = [...generatedQuestions];
      updated[index] = {
        id: nctbReplacement.id || `alt_${Date.now()}_${index}`,
        question: nctbReplacement.question,
        options: [...nctbReplacement.options],
        correctAnswer: nctbReplacement.correctAnswer,
        correctAnswerIndex: correctIdx !== -1 ? correctIdx : (nctbReplacement.correctAnswerIndex ?? 0),
        explanation: nctbReplacement.explanation || '',
        solutions: nctbReplacement.solutions || [nctbReplacement.explanation || 'পাঠ্যবই অনুযায়ী বিশ্লেষণ'],
        difficulty: nctbReplacement.difficulty,
        cognitiveLevel: nctbReplacement.cognitiveLevel,
        chapter: nctbReplacement.chapter,
        format: nctbReplacement.format,
        stimulus: nctbReplacement.stimulus
      };
      setGeneratedQuestions(updated);
      setSeenQuestionTexts(prev => Array.from(new Set([...prev, nctbReplacement.question, previousQuestionText])));
      setRecentlySwappedIndex(index);
      setTimeout(() => setRecentlySwappedIndex(null), 2500);
      showToast(`✓ প্রশ্ন নম্বর ${toBn(index + 1)} এর স্থানে অধ্যায় "${nctbReplacement.chapter || selectedSubject}" থেকে নতুন বিকল্প প্রশ্ন প্রতিস্থাপিত হয়েছে!`);
      return;
    }

    // Fallback to legacy getAlternativeQuestion
    const replacement = getAlternativeQuestion(selectedSubject, selectedChapters[0] || selectedChapter, allExcluded);
    const correctIdx = replacement.options.findIndex(o => o === replacement.correctAnswer);
    const updated = [...generatedQuestions];
    updated[index] = {
      id: replacement.id || `alt_${Date.now()}_${index}`,
      question: replacement.question,
      options: [...replacement.options],
      correctAnswer: replacement.correctAnswer,
      correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
      explanation: replacement.explanation || '',
      solutions: replacement.solutions || generateTwoSolutions(replacement.question, replacement.options, replacement.correctAnswer, replacement.explanation),
      difficulty: 'medium',
      chapter: selectedChapters[0] || selectedChapter
    };
    setGeneratedQuestions(updated);
    setSeenQuestionTexts(prev => Array.from(new Set([...prev, replacement.question, previousQuestionText])));
    setRecentlySwappedIndex(index);
    setTimeout(() => setRecentlySwappedIndex(null), 2500);
    showToast(`✓ প্রশ্ন নম্বর ${toBn(index + 1)} এর স্থানে নতুন বিকল্প প্রশ্ন প্রতিস্থাপিত হয়েছে!`);
  };



  // Clear all previous / demo tests completely with inline confirmation
  const handleClearAllTestsDirect = async () => {
    setIsDeletingAllInline(false);
    setTests([]);
    await clearAllStoredTests();
    saveStoredNotifications([]);
    window.dispatchEvent(new Event('dapathshala_notifs_updated'));
    showToast('✓ সকল পরীক্ষা ও ডাটা সফলভাবে মুছে ফেলা হয়েছে।');
  };

  // Finalize Exam & Generate Link + PIN
  const handleFinalizeExam = () => {
    if (generatedQuestions.length === 0) {
      showToast('⚠️ দয়া করে অন্তত ১টি প্রশ্ন লিখুন!');
      return;
    }

    // Strict validation so all questions are properly filled
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      if (!q.question.trim()) {
        showToast(`⚠️ দয়া করে প্রশ্ন নম্বর ${toBn(i + 1)} এর বিবরণ লিখুন।`);
        return;
      }
      const filledOptions = q.options.filter(o => o.trim() !== '');
      if (filledOptions.length < 2) {
        showToast(`⚠️ প্রশ্ন নম্বর ${toBn(i + 1)} এ অন্তত ২টি অপশন লিখুন।`);
        return;
      }
      let finalCorrect = q.correctAnswer?.trim();
      if (!finalCorrect && q.correctAnswerIndex !== undefined && q.options[q.correctAnswerIndex]?.trim()) {
        finalCorrect = q.options[q.correctAnswerIndex].trim();
        q.correctAnswer = finalCorrect;
      }
      if (!finalCorrect) {
        showToast(`⚠️ প্রশ্ন নম্বর ${toBn(i + 1)} এর সঠিক উত্তরের পাশের বৃত্তে ক্লিক করুন।`);
        return;
      }
    }

    setIsFinalized(true);

    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    const chaptersStr = selectedChapters.length > 0 ? selectedChapters.join(', ') : selectedChapter;
    const finalTitle = examTitleInput.trim() || `${selectedClass} - ${selectedSubject}: ${chaptersStr} পরীক্ষা`;
    const nowIso = new Date().toISOString();

    const newTest: AssignedTest = {
      id: editingPaperId ? editingPaperId : `test-${Date.now()}`,
      title: finalTitle,
      subject: selectedSubject,
      chapter: chaptersStr,
      studentClass: selectedClass,
      questionCount: generatedQuestions.length,
      durationMinutes: durationMinutes,
      pin: randomPin,
      createdAt: 'আজ, এইমাত্র',
      lastModifiedAt: nowIso,
      status: 'pending',
      studentName: 'পরীক্ষার্থী / সন্তান',
      totalMarks: generatedQuestions.length * 20,
      proctoringEnabled: proctoringEnabled,
      proctoringLevel: proctoringEnabled ? proctoringLevel : 2,
      aiGradingEnabled: true,
      questions: generatedQuestions,
      parentPhone: currentParent?.phone,
      isSavedToLibrary: true,
      customTags: ['নির্ধারিত পরীক্ষা']
    };

    let updated: AssignedTest[];
    if (editingPaperId) {
      updated = tests.map(t => (t.id === editingPaperId ? newTest : t));
    } else {
      updated = [newTest, ...tests];
    }

    setTests(updated);
    saveStoredTests(updated);
    syncTestToServer(newTest);
    setCreatedTestResult(newTest);
    setEditingPaperId(null);
  };

  // Save directly to Teacher's Library without publishing exam
  const handleSaveToLibraryDirect = () => {
    if (generatedQuestions.length === 0) {
      showToast('⚠️ দয়া করে অন্তত ১টি প্রশ্ন লিখুন!');
      return;
    }

    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      if (!q.question.trim()) {
        showToast(`⚠️ দয়া করে প্রশ্ন নম্বর ${toBn(i + 1)} এর বিবরণ লিখুন।`);
        return;
      }
      const filledOptions = q.options.filter(o => o.trim() !== '');
      if (filledOptions.length < 2) {
        showToast(`⚠️ প্রশ্ন নম্বর ${toBn(i + 1)} এ অন্তত ২টি অপশন লিখুন।`);
        return;
      }
      let finalCorrect = q.correctAnswer?.trim();
      if (!finalCorrect && q.correctAnswerIndex !== undefined && q.options[q.correctAnswerIndex]?.trim()) {
        finalCorrect = q.options[q.correctAnswerIndex].trim();
        q.correctAnswer = finalCorrect;
      }
      if (!finalCorrect) {
        showToast(`⚠️ প্রশ্ন নম্বর ${toBn(i + 1)} এর সঠিক উত্তরের পাশের বৃত্তে ক্লিক করুন।`);
        return;
      }
    }

    const chaptersStr = selectedChapters.length > 0 ? selectedChapters.join(', ') : selectedChapter;
    const finalTitle = examTitleInput.trim() || `${selectedClass} - ${selectedSubject}: ${chaptersStr} প্রশ্নপত্র`;
    const nowIso = new Date().toISOString();

    if (editingPaperId) {
      const updated = tests.map(t => {
        if (t.id === editingPaperId) {
          return {
            ...t,
            title: finalTitle,
            subject: selectedSubject,
            chapter: chaptersStr,
            studentClass: selectedClass,
            questionCount: generatedQuestions.length,
            durationMinutes: durationMinutes,
            questions: generatedQuestions,
            isSavedToLibrary: true,
            lastModifiedAt: nowIso
          };
        }
        return t;
      });
      setTests(updated);
      saveStoredTests(updated);
      const updatedTest = updated.find(t => t.id === editingPaperId);
      if (updatedTest) syncTestToServer(updatedTest);
      showToast(`✓ প্রশ্নপত্র "${finalTitle}" সফলভাবে আপডেট ও লাইব্রেরিতে সংরক্ষিত হয়েছে!`);
      setEditingPaperId(null);
      onTabChange?.('library');
      setActiveViewMode('tests');
    } else {
      const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
      const newTest: AssignedTest = {
        id: `test-${Date.now()}`,
        title: finalTitle,
        subject: selectedSubject,
        chapter: chaptersStr,
        studentClass: selectedClass,
        questionCount: generatedQuestions.length,
        durationMinutes: durationMinutes,
        pin: randomPin,
        createdAt: 'আজ, এইমাত্র',
        lastModifiedAt: nowIso,
        status: 'pending',
        studentName: 'শিক্ষার্থী / পরীক্ষার্থী',
        totalMarks: generatedQuestions.length * 20,
        proctoringEnabled: proctoringEnabled,
        proctoringLevel: proctoringEnabled ? proctoringLevel : 2,
        aiGradingEnabled: true,
        questions: generatedQuestions,
        parentPhone: currentParent?.phone,
        isSavedToLibrary: true,
        customTags: ['শিক্ষকের প্রশ্নব্যাংক']
      };

      const updated = [newTest, ...tests];
      setTests(updated);
      saveStoredTests(updated);
      syncTestToServer(newTest);
      showToast(`✓ নতুন প্রশ্নপত্র "${finalTitle}" সফলভাবে লাইব্রেরিতে সংরক্ষিত হয়েছে!`);
      onTabChange?.('library');
      setActiveViewMode('tests');
    }
  };

  // Load an existing paper into Builder for editing/modifying
  const handleEditPaperInBuilder = (test: AssignedTest) => {
    setEditingPaperId(test.id);
    setExamTitleInput(test.title || '');
    if (test.studentClass) {
      setSelectedClass(test.studentClass);
    }
    if (test.subject) {
      setSelectedSubject(test.subject);
    }
    if (test.chapter) {
      const parts = test.chapter.split(', ').map(s => s.trim()).filter(Boolean);
      setSelectedChapters(parts);
      if (parts[0]) setSelectedChapter(parts[0]);
    }
    if (test.durationMinutes) {
      setDurationMinutes(test.durationMinutes);
    }
    if (Array.isArray(test.questions) && test.questions.length > 0) {
      setGeneratedQuestions(test.questions.map(q => ({ ...q })));
    }
    setCreationMode('manual');
    setIsFinalized(false);
    onTabChange?.('assigned');
    setActiveViewMode('builder');
    showToast(`📝 "${test.title}" এডিটিং মোডে লোড হয়েছে। পরিমার্জন শেষে সেভ করুন।`);
  };

  // Copy Link Helper with Full Cross-Device Support
  const handleCopyLink = (testOrPin: AssignedTest | string) => {
    let link = '';
    let pin = '';
    if (typeof testOrPin === 'string') {
      pin = testOrPin;
      const allTests = getStoredTests();
      const matched = allTests.find(t => t.pin === pin || t.id === pin) || tests.find(t => t.pin === pin || t.id === pin);
      link = matched ? getShareableTestUrl(matched) : `${window.location.origin}${window.location.pathname}?pin=${pin}`;
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
    const safeQuestions = Array.isArray(test.questions) ? test.questions : [];
    const safeTest: AssignedTest = {
      ...test,
      questions: safeQuestions,
      proctoringFlags: Array.isArray(test.proctoringFlags) ? test.proctoringFlags : []
    };
    setReviewTest(safeTest);
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

    const reviewedItem = updated.find(t => t.id === reviewTest.id);
    if (reviewedItem) {
      syncTestToServer(reviewedItem);
      syncSubmissionToServer(reviewedItem);
    }

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
  const handleDeleteSingleTest = async (test: AssignedTest) => {
    const { id, pin } = test;

    // Remove from state
    const updated = tests.filter(t => t.id !== id && t.pin !== pin);
    setTests(updated);
    await deleteStoredTest(pin || id);

    // Clean up notifications for this test
    const notifs = getStoredNotifications().filter(
      n => n.testId !== id && !n.message.includes(pin)
    );
    saveStoredNotifications(notifs);
    window.dispatchEvent(new Event('dapathshala_notifs_updated'));

    setDeletingTestId(null);
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
          questions: (Array.isArray(t.questions) ? t.questions : []).map(q => ({
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

  const toBn = (num: any, fallback = '০'): string => {
    if (num === undefined || num === null || num === '' || (typeof num === 'number' && isNaN(num))) {
      return fallback;
    }
    return String(num).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d, 10)]);
  };

  // Helper to format when and on what date the child submitted the khata
  const formatSubmissionDateTime = (test: AssignedTest): string => {
    let dateObj: Date | null = null;
    
    // 1. Check test.submittedAt
    if (test.submittedAt) {
      const parsed = new Date(test.submittedAt);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      } else {
        return test.submittedAt;
      }
    }
    
    // 2. Fallback to test ID timestamp if it was submitted
    if (!dateObj && (test.status === 'submitted' || test.status === 'reviewed')) {
      if (test.id && test.id.startsWith('test-')) {
        const ts = parseInt(test.id.replace('test-', ''), 10);
        if (!isNaN(ts) && ts > 1600000000000) {
          dateObj = new Date(ts);
        }
      }
    }

    // 3. Fallback to current time if status is submitted or reviewed
    if (!dateObj && (test.status === 'submitted' || test.status === 'reviewed')) {
      dateObj = new Date();
    }

    if (!dateObj) {
      return 'এখনও জমা দেয়নি';
    }

    const d = dateObj;
    const day = toBn(d.getDate().toString().padStart(2, '0'));
    const months = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const month = months[d.getMonth()];
    const year = toBn(d.getFullYear());

    const hours24 = d.getHours();
    const minutes = toBn(d.getMinutes().toString().padStart(2, '0'));
    let period = 'সকাল';
    if (hours24 >= 12 && hours24 < 15) period = 'দুপুর';
    else if (hours24 >= 15 && hours24 < 18) period = 'বিকাল';
    else if (hours24 >= 18 && hours24 < 20) period = 'সন্ধ্যা';
    else if (hours24 >= 20 || hours24 < 6) period = 'রাত';
    else period = 'সকাল';

    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const hoursStr = toBn(hours12);

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return `আজ (${day} ${month}, ${year}) • ${period} ${hoursStr}:${minutes} মি.`;
    }

    return `${day} ${month}, ${year} • ${period} ${hoursStr}:${minutes} মি.`;
  };

  // Only count tests pending evaluation so the badge count decreases upon review
  const pendingReviewCount = tests.filter(t => t.status === 'submitted').length;

  // Filter tests if parent clicked "সকল উত্তরপত্র" (only answer sheets that haven't been reviewed yet)
  const displayedTests = filterMode === 'unreviewed'
    ? tests.filter(t => t.status === 'submitted')
    : tests;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-6 sm:pt-6 sm:pb-8 space-y-4">
      
      {/* Toast Alert: repositioned to bottom center to prevent covering header/navigation */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border border-slate-700/80 max-w-[90vw] animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOP PORTAL HEADER & MAIN VIEW SWITCHER                */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
            {activeTab === 'report' ? (
              <Award className="w-6 h-6 text-amber-300" />
            ) : activeTab === 'games' ? (
              <Brain className="w-6 h-6 text-rose-300" />
            ) : activeTab === 'review' ? (
              <FileCheck className="w-6 h-6 text-emerald-300" />
            ) : activeTab === 'library' ? (
              <FolderArchive className="w-6 h-6 text-indigo-200" />
            ) : (
              <GraduationCap className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === 'report' 
                  ? 'ফলাফল ও সার্বিক রিপোর্ট' 
                  : activeTab === 'games' 
                  ? 'কুইজ ও ব্রেইন গেমস' 
                  : activeTab === 'review'
                  ? 'খাতা মূল্যায়ন ও পরীক্ষণ'
                  : activeTab === 'library'
                  ? 'আমার প্রশ্ন লাইব্রেরি ও প্রশ্নব্যাংক'
                  : 'অভিভাবক ও শিক্ষক পোর্টাল'}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              {activeTab === 'report'
                ? 'সন্তানের সম্পন্ন পরীক্ষার ফলাফল, অর্জিত গ্রেড ও বিস্তারিত মূল্যায়ন রিপোর্ট'
                : activeTab === 'games'
                ? 'দ্রুত মেধা বিকাশ, সাধারণ জ্ঞান ও গণিত চ্যালেঞ্জের ইন্টারেক্টিভ প্ল্যাটফর্ম'
                : activeTab === 'review'
                ? 'সন্তানের জমা দেওয়া উত্তরপত্র যাচাই, প্রতিটি প্রশ্নে নম্বর প্রদান ও ফিডব্যাক'
                : activeTab === 'library'
                ? 'আজীবন সংরক্ষিত প্রশ্নপত্র, পরিমার্জন, ডুপ্লিকেট সেট তৈরি, ফিল্টারিং ও প্রিন্টিং সুবিধা'
                : 'এআই প্রশ্নপত্র তৈরি, লিংক শেয়ার ও ফ্রন্ট ক্যামেরা লাইভ খাতা মূল্যায়ন'}
            </p>
          </div>
        </div>

        {/* Header Right Status / Back Button */}
        {activeTab === 'report' || activeTab === 'games' || activeTab === 'library' ? (
          <button
            type="button"
            onClick={() => onTabChange?.('assigned')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-blue-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← ড্যাশবোর্ডে ফিরে যান</span>
          </button>
        ) : (activeViewMode === 'builder' || activeViewMode === 'institution_papers') ? (
          <button
            type="button"
            onClick={() => {
              setActiveViewMode('tests');
              setEditingPaperId(null);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← ড্যাশবোর্ডে ফিরে যান</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {/* নতুন প্রশ্ন তৈরি করুন (স্থানান্তরিত: উপরে ব্যানার কার্ডে) */}
            <button
              type="button"
              onClick={() => {
                setEditingPaperId(null);
                setShowCreationModeModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-98"
              title="নতুন প্রশ্নপত্র বা পরীক্ষা তৈরি করুন"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>নতুন প্রশ্ন তৈরি করুন</span>
            </button>

            {/* আমার প্রশ্ন লাইব্রেরি Tab Button */}
            <button
              type="button"
              onClick={() => {
                setActiveViewMode('tests');
                onTabChange?.('library');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100 hover:border-indigo-300"
              title="সংরক্ষিত সকল প্রশ্নপত্র ও শিক্ষকের আর্কাইভ দেখুন"
            >
              <FolderArchive className="w-4 h-4 text-indigo-600" />
              <span>প্রশ্ন লাইব্রেরি ({toBn(tests.length)})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveViewMode('tests');
                setFilterMode('all');
                onTabChange?.('assigned');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs ${
                activeTab === 'assigned' && filterMode === 'all'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300'
              }`}
              title="সকল নির্ধারিত পরীক্ষা দেখুন"
            >
              <FileText className={`w-4 h-4 ${activeTab === 'assigned' && filterMode === 'all' ? 'text-white' : 'text-blue-600'}`} />
              <span>নির্ধারিত পরীক্ষা: {toBn(tests.length)}টি</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveViewMode('tests');
                setFilterMode('unreviewed');
                onTabChange?.('review');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs ${
                activeTab === 'review' || filterMode === 'unreviewed'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300'
              }`}
              title="যেসব উত্তরপত্র এখনো দেখা হয়নি সব সামনে আনুন"
            >
              <FileCheck className={`w-4 h-4 ${activeTab === 'review' || filterMode === 'unreviewed' ? 'text-white' : 'text-blue-600'}`} />
              <span>সকল উত্তরপত্র</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIEW 3: ফলাফল ও সার্বিক রিপোর্ট কার্ড (REPORT CARD)        */}
      {/* ======================================================== */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Overview Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">মোট পরীক্ষা</span>
                <BookOpen className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{toBn(tests.length)}টি</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">নির্ধারিত সকল প্রশ্নপত্র</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">জমা দেওয়া খাতা</span>
                <FileCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {toBn(tests.filter(t => t.status === 'submitted' || t.status === 'reviewed').length)}টি
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">পরীক্ষা সম্পন্ন ও জমা</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">গড় সাফল্য হার</span>
                <TrendingUp className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {(() => {
                  const ev = tests.filter(t => t.status === 'submitted' || t.status === 'reviewed');
                  if (ev.length === 0) return '০%';
                  const totalSc = ev.reduce((a, b) => a + (b.score || 0), 0);
                  const totalPos = ev.reduce((a, b) => a + (b.questionCount || b.questions?.length || 1), 0);
                  const pct = totalPos > 0 ? Math.round((totalSc / totalPos) * 100) : 0;
                  return `${toBn(pct)}%`;
                })()}
              </p>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">সামগ্রিক পারফরম্যান্স</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">সর্বোচ্চ স্কোর</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                {(() => {
                  const ev = tests.filter(t => t.status === 'submitted' || t.status === 'reviewed');
                  if (ev.length === 0) return '০';
                  const maxSc = Math.max(...ev.map(t => t.score || 0));
                  return toBn(maxSc);
                })()}
              </p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">সেরা প্রাপ্ত নম্বর</p>
            </div>
          </div>

          {/* Results Table & Performance Breakdown */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  পরীক্ষা ভিত্তিক ফলাফল ও গ্রেড তালিকা
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  সন্তানের প্রতিটি পরীক্ষার প্রাপ্ত নম্বর, শতাংশ ও অভিভাবকের দেওয়া মন্তব্য
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  title="রিপোর্ট প্রিন্ট করুন"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>প্রিন্ট রিপোর্ট</span>
                </button>
              </div>
            </div>

            {/* List of Results */}
            {(() => {
              const evaluated = tests.filter(t => t.status === 'submitted' || t.status === 'reviewed');
              if (evaluated.length === 0) {
                return (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Award className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-600">এখনো কোনো পরীক্ষার খাতা জমা পড়েনি</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      সন্তান পরীক্ষা সম্পন্ন করে উত্তরপত্র জমা দিলে এখানে তার স্বয়ংক্রিয় রেজাল্ট ও গ্রেড শিট দেখতে পারবেন।
                    </p>
                  </div>
                );
              }

              return (
                <div className="divide-y divide-slate-100 overflow-hidden">
                  {evaluated.map((test) => {
                    const totalQ = test.questionCount || (test.questions?.length || 1);
                    const score = test.score || 0;
                    const pct = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
                    let grade = 'F';
                    let gradeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                    if (pct >= 80) { grade = 'A+'; gradeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'; }
                    else if (pct >= 70) { grade = 'A'; gradeColor = 'bg-blue-50 text-blue-700 border-blue-200'; }
                    else if (pct >= 60) { grade = 'A-'; gradeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200'; }
                    else if (pct >= 50) { grade = 'B'; gradeColor = 'bg-amber-50 text-amber-700 border-amber-200'; }
                    else if (pct >= 40) { grade = 'C'; gradeColor = 'bg-orange-50 text-orange-700 border-orange-200'; }

                    return (
                      <div key={test.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2.5 rounded-2xl transition-colors">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900 truncate">
                              {test.title || `${test.subject} - ${test.chapter}`}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${gradeColor}`}>
                              গ্রেড: {grade} ({toBn(pct)}%)
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                            <span>বিষয়: {test.subject}</span>
                            <span>•</span>
                            <span>অধ্যায়: {test.chapter}</span>
                            <span>•</span>
                            <span>পিন: {toBn(test.pin)}</span>
                          </div>
                          {test.parentComment && (
                            <p className="text-xs text-blue-700 bg-blue-50/70 p-1.5 rounded-lg border border-blue-100 font-medium mt-1">
                              💬 অভিভাবকের মন্তব্য: {test.parentComment}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-base font-black text-slate-900">
                              {toBn(score)} / {toBn(totalQ)}
                            </span>
                            <span className="block text-[11px] text-slate-400 font-medium">প্রাপ্ত নম্বর</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenReview(test)}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>উত্তরপত্র দেখুন</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 4: কুইজ ও ব্রেইন গেমস হাব (QUIZ & BRAIN GAMES)       */}
      {/* ======================================================== */}
      {activeTab === 'games' && (
        <div className="space-y-6">
          {/* Game Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs gap-2">
            <button
              type="button"
              onClick={() => setGamesTab('math')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                gamesTab === 'math'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>১. গণিত স্পিড চ্যালেঞ্জ</span>
            </button>

            <button
              type="button"
              onClick={() => setGamesTab('gk')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                gamesTab === 'gk'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Brain className="w-4 h-4 text-rose-300" />
              <span>২. সাধারণ জ্ঞান ও বিজ্ঞান কুইজ</span>
            </button>
          </div>

          {/* GAME 1: MATH SPEED CHALLENGE */}
          {gamesTab === 'math' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-xl mx-auto text-center space-y-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-3 border-b border-slate-100">
                <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>স্কোর: {toBn(mathScore)}</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  <span>স্ট্রিক: {toBn(mathStreak)} 🔥</span>
                </span>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">দ্রুত সঠিক উত্তরে ক্লিক করুন</span>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 mt-3 tracking-wider font-mono">
                  {toBn(mathNum1)} {mathOp} {toBn(mathNum2)} = ?
                </div>
              </div>

              {/* Feedback indicator */}
              {mathFeedback && (
                <div className={`text-sm font-black animate-in zoom-in-95 duration-150 ${
                  mathFeedback === 'correct' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {mathFeedback === 'correct' ? '✓ দারুণ! সঠিক উত্তর!' : '✕ ভুল উত্তর! আবার চেষ্টা করুন'}
                </div>
              )}

              {/* 4 Answer Choice Buttons */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                {mathOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleMathAnswer(opt)}
                    className="py-4 px-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border-2 border-slate-200 hover:border-blue-500 text-slate-900 hover:text-blue-700 text-2xl font-black transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    {toBn(opt)}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={generateNewMathProblem}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  প্রশ্ন পরিবর্তন করুন →
                </button>
              </div>
            </div>
          )}

          {/* GAME 2: GK TRIVIA */}
          {gamesTab === 'gk' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs max-w-xl mx-auto space-y-6">
              {!isGkFinished ? (
                <>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-3 border-b border-slate-100">
                    <span>প্রশ্ন নম্বর: {toBn(currentGkIndex + 1)} / {toBn(gkQuestions.length)}</span>
                    <span className="text-blue-600 font-bold">স্কোর: {toBn(gkScore)}</span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      {gkQuestions[currentGkIndex].q}
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {gkQuestions[currentGkIndex].options.map((opt, idx) => {
                      const isSelected = gkSelectedOption === idx;
                      const isCorrect = idx === gkQuestions[currentGkIndex].correct;
                      let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

                      if (gkSelectedOption !== null) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 font-black';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={gkSelectedOption !== null}
                          onClick={() => handleGkAnswer(idx)}
                          className={`w-full p-3.5 rounded-xl border-2 text-left text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {gkSelectedOption !== null && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          )}
                          {gkSelectedOption !== null && isSelected && !isCorrect && (
                            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {gkSelectedOption !== null && (
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2 animate-in fade-in">
                      <p className="font-bold">💡 তথ্য: {gkQuestions[currentGkIndex].exp}</p>
                      <button
                        type="button"
                        onClick={handleNextGkQuestion}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black transition-colors cursor-pointer"
                      >
                        {currentGkIndex < gkQuestions.length - 1 ? 'পরবর্তী প্রশ্ন →' : 'ফলাফল দেখুন 🏁'}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <Trophy className="w-14 h-14 text-amber-500 mx-auto animate-bounce" />
                  <h3 className="text-2xl font-black text-slate-900">কুইজ সম্পন্ন হয়েছে!</h3>
                  <p className="text-sm font-bold text-slate-600">
                    আপনার মোট স্কোর: <span className="text-blue-600 text-lg font-black">{toBn(gkScore)} / ১০০</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleRestartGk}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-xs cursor-pointer"
                  >
                    পুনরায় খেলুন 🔄
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 5: শিক্ষকের নিজস্ব লাইব্রেরি ও প্রশ্ন আর্কাইভ (STEP 5) */}
      {/* ======================================================== */}
      {activeTab === 'library' && (
        <TeacherQuestionLibrary
          tests={tests}
          onSaveTests={(updated) => {
            setTests(updated);
            saveStoredTests(updated);
            updated.forEach(t => syncTestToServer(t));
          }}
          onEditPaper={handleEditPaperInBuilder}
          onOpenCreateModal={() => {
            onTabChange?.('assigned');
            setActiveViewMode('builder');
            setEditingPaperId(null);
          }}
          onDirectStartExam={onOpenTest}
          onToast={showToast}
        />
      )}

      {/* ======================================================== */}
      {/* VIEW 1: DUAL-MODE BUILDER: MANUAL OR AI                  */}
      {/* ======================================================== */}
      {activeTab !== 'report' && activeTab !== 'games' && activeTab !== 'library' && activeViewMode === 'builder' && (
        <div className="space-y-6">
          {/* Editing Mode Alert Banner */}
          {editingPaperId && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                    <span>প্রশ্নপত্র পরিমার্জন ও সংস্কার মোড</span>
                    <span className="text-[10px] bg-indigo-200/80 text-indigo-900 font-bold px-2 py-0.5 rounded-full">
                      লাইব্রেরি আপডেট
                    </span>
                  </h4>
                  <p className="text-xs text-indigo-700">
                    আপনি পূর্বের সংরক্ষিত প্রশ্নপত্রে পরিবর্তন বা বিকল্প প্রশ্ন প্রতিস্থাপন করছেন। কাজ শেষ হলে "পরিবর্তন লাইব্রেরিতে সেভ করুন" চাপুন।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPaperId(null);
                  showToast('✓ পরিমার্জন মোড বাতিল করে নতুন প্রশ্ন তৈরির মোডে ফেরা হয়েছে।');
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
              >
                পরিমার্জন বাতিল
              </button>
            </div>
          )}
          
          {/* Top Mode Switcher Bar */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (creationMode !== 'manual') {
                  setCreationMode('manual');
                  setGeneratedQuestions([
                    {
                      id: `manual_q_${Date.now()}_1`,
                      question: '',
                      options: ['', '', '', ''],
                      correctAnswer: '',
                      correctAnswerIndex: undefined,
                      explanation: ''
                    }
                  ]);
                  showToast('✍️ নিজে প্রশ্ন তৈরির ফরম্যাট সক্রিয় হয়েছে! আপনার প্রশ্ন ও অপশন লিখুন।');
                }
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                creationMode === 'manual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>১. নিজে প্রশ্ন তৈরি করুন</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                creationMode === 'manual' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                ম্যানুয়াল
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (creationMode !== 'ai') {
                  setCreationMode('ai');
                  handleGenerateWithAI();
                }
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                creationMode === 'ai'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>২. এআই দিয়ে তৈরি করুন</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                creationMode === 'ai' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                স্মার্ট এআই
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveViewMode('institution_papers');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                creationMode === 'institution'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Landmark className="w-4 h-4 text-purple-300" />
              <span>৩. প্রতিষ্ঠান ও সালের প্রশ্ন</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                creationMode === 'institution' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
              }`}>
                প্রশ্নব্যাংক
              </span>
            </button>
          </div>

          {/* Section A: Exam Basic Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  creationMode === 'manual' 
                    ? 'bg-blue-100 text-blue-700' 
                    : creationMode === 'institution'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {creationMode === 'manual' ? (
                    <Edit3 className="w-4.5 h-4.5" />
                  ) : creationMode === 'institution' ? (
                    <Landmark className="w-4.5 h-4.5" />
                  ) : (
                    <Sparkles className="w-4.5 h-4.5" />
                  )}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {creationMode === 'manual' 
                      ? '১. নিজে প্রশ্ন তৈরি করুন (ম্যানুয়াল পদ্ধতি)' 
                      : creationMode === 'institution'
                      ? '৩. বিভিন্ন প্রতিষ্ঠান ও সালের প্রশ্ন (সংরক্ষিত প্রশ্নব্যাংক)'
                      : '২. এআই দিয়ে তৈরি করুন (স্বয়ংক্রিয় এআই পদ্ধতি)'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {creationMode === 'manual'
                      ? 'নিজে হাতে প্রশ্ন ও অপশন লিখুন এবং সঠিক উত্তর চিহ্নিত করে পরীক্ষা প্রস্তুত করুন।'
                      : creationMode === 'institution'
                      ? 'শীর্ষ স্কুল, কলেজ ও শিক্ষা বোর্ডের সংরক্ষিত প্রশ্নপত্র লোড হয়েছে। প্রয়োজনে এডিট করুন বা সরাসরি লিংক তৈরি করুন।'
                      : 'শ্রেণি, বিষয় ও অধ্যায় সিলেক্ট করুন; এআই পাঠ্যবই অনুযায়ী প্রশ্ন তৈরি করে দেবে।'}
                  </p>
                </div>
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

            {/* Custom Exam Title */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                পরীক্ষার নাম / শিরোনাম:
              </label>
              <input
                type="text"
                value={examTitleInput}
                onChange={(e) => setExamTitleInput(e.target.value)}
                placeholder={`যেমন: ${selectedClass} - ${selectedSubject}: ১ম সাময়িকী পরীক্ষা`}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Grid 1: Class, Subject, Difficulty, and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Class Selection (১ম থেকে ১২শ শ্রেণি) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>শ্রেণি / ক্লাস:</span>
                  <span className="text-[10px] font-semibold text-blue-600">১ম - ১২শ শ্রেণি</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {NCTB_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* 2. Subject Selection (Dynamic based on selected class) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>বিষয়:</span>
                  <span className="text-[10px] font-semibold text-slate-500">{toBn(getAvailableSubjects(selectedClass).length)}টি বিষয়</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {getAvailableSubjects(selectedClass).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* 3. Difficulty Level (কঠিন্যতার মাত্রা: সহজ / মাঝারি / কঠিন / সকল মাত্রা) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>কঠিন্যতার মাত্রা:</span>
                  <span className={`text-[10px] font-bold ${
                    selectedDifficulty === 'easy' ? 'text-emerald-600' :
                    selectedDifficulty === 'medium' ? 'text-amber-600' :
                    selectedDifficulty === 'hard' ? 'text-rose-600' : 'text-blue-600'
                  }`}>
                    {selectedDifficulty === 'easy' ? 'সহজ' :
                     selectedDifficulty === 'medium' ? 'মাঝারি' :
                     selectedDifficulty === 'hard' ? 'কঠিন' : 'মিশ্র/সকল'}
                  </span>
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => handleDifficultyChange(e.target.value as DifficultyLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">🌐 সকল মাত্রা (সহজ+মাঝারি+কঠিন)</option>
                  <option value="easy">🟢 সহজ (Easy Level)</option>
                  <option value="medium">🟡 মাঝারি (Medium Level)</option>
                  <option value="hard">🔴 কঠিন (Hard Level)</option>
                </select>
              </div>

              {/* 4. Duration in Minutes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  পরীক্ষার সময়:
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value={5}>৫ মিনিট</option>
                  <option value={10}>১০ মিনিট</option>
                  <option value={15}>১৫ মিনিট</option>
                  <option value={20}>২০ মিনিট</option>
                  <option value={30}>৩০ মিনিট</option>
                  <option value={45}>৪৫ মিনিট</option>
                  <option value={60}>৬০ মিনিট (১ ঘণ্টা)</option>
                  <option value={90}>৯০ মিনিট (দেড় ঘণ্টা)</option>
                  <option value={100}>১০০ মিনিট</option>
                  <option value={120}>১২০ মিনিট (২ ঘণ্টা)</option>
                </select>
              </div>

            </div>

            {/* Grid 2: Multi-Chapter Selection Panel (একাধিক অধ্যায় একসঙ্গে নির্বাচন) */}
            <div className="mt-4 pt-3.5 border-t border-slate-200/80 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    অধ্যায়সমূহ নির্বাচন করুন (এক বা একাধিক অধ্যায় একসঙ্গে নির্বাচন করা যাবে):
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllChapters}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>সব অধ্যায় ({toBn(getAvailableChapters(selectedClass, selectedSubject).length)})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const first = getAvailableChapters(selectedClass, selectedSubject)[0];
                      if (first) {
                        setSelectedChapters([first]);
                        setSelectedChapter(first);
                        updateExamTitle(selectedClass, selectedSubject, first);
                        if (creationMode === 'ai') {
                          const newQ = fetchExamQuestionsFromCurriculum(selectedClass, selectedSubject, [first], selectedDifficulty, questionCount);
                          setGeneratedQuestions(newQ);
                        }
                        showToast(`✓ শুধুমাত্র ১ম অধ্যায় "${first}" নির্বাচিত রাখা হলো।`);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <span>ক্লিয়ার / রিসেট</span>
                  </button>
                </div>
              </div>

              {/* Interactive Pill Badges for All Chapters */}
              <div className="flex flex-wrap gap-2">
                {getAvailableChapters(selectedClass, selectedSubject).map((chap, cIdx) => {
                  const isSelected = selectedChapters.includes(chap);
                  return (
                    <button
                      key={chap}
                      type="button"
                      onClick={() => handleToggleChapter(chap)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300 scale-102'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 hover:border-slate-400'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : toBn(cIdx + 1)}
                      </span>
                      <span>{chap}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Chapter Status Notice */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span className="flex items-center gap-1.5 font-bold text-blue-700">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>বর্তমানে {toBn(selectedChapters.length)}টি অধ্যায় সক্রিয়</span>
                </span>
                <span className="text-slate-500 italic hidden sm:inline">
                  (এআই নিজ দায়িত্বে শুধুমাত্র এই নির্বাচিত অধ্যায়গুলো থেকেই নিখুঁতভাবে প্রশ্নপত্র তৈরি করবে)
                </span>
              </div>
            </div>

            {/* AI Specific: Question Count & Reload Button */}
            {creationMode === 'ai' && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">এআই প্রশ্নের সংখ্যা:</span>
                  <select
                    value={questionCount}
                    onChange={(e) => {
                      const newCount = Number(e.target.value);
                      setQuestionCount(newCount);
                      const questions = fetchExamQuestionsFromCurriculum(
                        selectedClass,
                        selectedSubject,
                        selectedChapters,
                        selectedDifficulty,
                        newCount
                      );
                      setGeneratedQuestions(questions);
                    }}
                    className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value={1}>১টি প্রশ্ন</option>
                    <option value={2}>২টি প্রশ্ন</option>
                    <option value={3}>৩টি প্রশ্ন</option>
                    <option value={5}>৫টি প্রশ্ন</option>
                    <option value={10}>১০টি প্রশ্ন</option>
                    <option value={15}>১৫টি প্রশ্ন</option>
                    <option value={20}>২০টি প্রশ্ন</option>
                    <option value={25}>২৫টি প্রশ্ন</option>
                    <option value={30}>৩০টি প্রশ্ন</option>
                    <option value={40}>৪০টি প্রশ্ন</option>
                    <option value={50}>৫০টি প্রশ্ন</option>
                    <option value={60}>৬০টি প্রশ্ন</option>
                    <option value={70}>৭০টি প্রশ্ন</option>
                    <option value={75}>৭৫টি প্রশ্ন</option>
                    <option value={80}>৮০টি প্রশ্ন</option>
                    <option value={90}>৯০টি প্রশ্ন</option>
                    <option value={100}>১০০টি প্রশ্ন (মডেল টেস্ট)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-100" />
                  <span>এআই দিয়ে প্রশ্ন রিলোড করুন</span>
                </button>
              </div>
            )}

            {/* Manual Mode Specific: Batch Size Selector & Reload / Add Buttons */}
            {creationMode === 'manual' && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-blue-50/60 p-3.5 rounded-2xl border border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-black text-slate-800">ব্যাচ সাইজ:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[10, 20, 25, 30, 50, 100].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => {
                          setQuestionCount(cnt);
                          const batch = fetchExamQuestionsFromCurriculum(selectedClass, selectedSubject, selectedChapters, selectedDifficulty, cnt);
                          setGeneratedQuestions(batch);
                          showToast(`✓ ${toBn(cnt)}টি প্রশ্নের ব্যাচ লোড হয়েছে!`);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          questionCount === cnt
                            ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                            : 'bg-white text-slate-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {toBn(cnt)}টি
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const batch = fetchExamQuestionsFromCurriculum(selectedClass, selectedSubject, selectedChapters, selectedDifficulty, questionCount);
                      setGeneratedQuestions(batch);
                      showToast(`✓ নির্বাচিত অধ্যায়সমূহ থেকে ${toBn(batch.length)}টি প্রশ্নের নতুন ব্যাচ লোড হয়েছে!`);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="নির্বাচিত অধ্যায়সমূহ থেকে সম্পূর্ণ নতুন ব্যাচ আনুন"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-100" />
                    <span>নতুন ব্যাচ আনুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-700 border border-blue-300 text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="নিজে হাতে নতুন প্রশ্ন লিখতে খালি কার্ড যোগ করুন"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    <span>খালি প্রশ্ন যোগ করুন</span>
                  </button>
                </div>
              </div>
            )}

            {/* Anti-Cheating Proctoring Toggle & Strictness Level (4 Levels) */}
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={proctoringEnabled}
                    onChange={(e) => setProctoringEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>নকল প্রতিরোধে ফ্রন্ট ক্যামেরা ও লাইভ নজরদারি সক্রিয় থাকবে</span>
                  </span>
                </label>

                <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                  creationMode === 'manual'
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : creationMode === 'institution'
                    ? 'text-purple-700 bg-purple-50 border-purple-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  <span>
                    {creationMode === 'manual'
                      ? '✍️ ম্যানুয়াল মোড সক্রিয়'
                      : creationMode === 'institution'
                      ? '🏛️ প্রতিষ্ঠান ও বোর্ড প্রশ্নব্যাংক সক্রিয়'
                      : '✨ এআই মোড সক্রিয়'}
                  </span>
                </div>
              </div>

              {/* 4 Proctoring Levels Selector (লেভেল ১, লেভেল ২, লেভেল ৩, লেভেল ৪) */}
              {proctoringEnabled && (
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                      <span>প্রক্টরিং নজরদারির কঠোরতার মাত্রা নির্ধারণ করুন (মোট ৪টি লেভেল):</span>
                    </span>
                    <span className="font-black text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 self-start sm:self-auto">
                      নির্বাচিত: লেভেল {proctoringLevel === 1 ? '১ (মৃদু)' : proctoringLevel === 2 ? '২ (মাঝারি)' : proctoringLevel === 3 ? '৩ (কঠোর - আড় চোখ সনাক্ত)' : '৪ (সর্বোচ্চ কঠোর - অতি-সংবেদনশীল)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {[
                      {
                        lvl: 1 as const,
                        name: 'লেভেল ১: মৃদু',
                        tag: 'সহনশীল',
                        desc: 'বড় ধরনের মাথা ঘোরানো বা অনুপস্থিতি সনাক্ত। ছোটখাটো আড় চোখে তাকানো ছাড়।'
                      },
                      {
                        lvl: 2 as const,
                        name: 'লেভেল ২: মাঝারি',
                        tag: 'স্ট্যান্ডার্ড',
                        desc: 'স্বাভাবিক পরীক্ষা মানদণ্ড। মাথা এদিক-ওদিক সরালে বা চোখ ফেরালে সতর্কবার্তা।'
                      },
                      {
                        lvl: 3 as const,
                        name: 'লেভেল ৩: কঠোর',
                        tag: 'আড় চোখ সনাক্ত',
                        desc: 'মাথা সোজা রেখে আড় চোখে এদিক-সেদিক তাকালে ও বই খোঁজার চেষ্টা করলেই সতর্কবার্তা।'
                      },
                      {
                        lvl: 4 as const,
                        name: 'লেভেল ৪: সর্বোচ্চ',
                        tag: 'অতি-সংবেদনশীল',
                        desc: 'মাথা ঘোরানো বা স্ক্রিন ছেড়ে অন্যদিকে তাকানোর সাথে সাথেই তাৎক্ষণিক সতর্কবার্তা (প্রতি ৩ বারে বিশেষ পর্যবেক্ষণ নোটিশ)।'
                      }
                    ].map((item) => (
                      <button
                        key={item.lvl}
                        type="button"
                        onClick={() => {
                          setProctoringLevel(item.lvl);
                          localStorage.setItem('dapathshala_parent_proctoring_level', String(item.lvl));
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          proctoringLevel === item.lvl
                            ? 'border-blue-600 bg-white shadow-xs ring-2 ring-blue-500/30'
                            : 'border-slate-200 bg-white/60 hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-xs font-black ${proctoringLevel === item.lvl ? 'text-blue-700' : 'text-slate-800'}`}>
                            {item.name}
                          </span>
                          <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                            proctoringLevel === item.lvl ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[10.5px] leading-relaxed text-slate-500">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 pt-0.5 italic">
                    ℹ️ নির্দেশিকা: পরীক্ষার্থী চোখ সরালে বা আড় চোখে তাকালে তাৎক্ষণিক সতর্ক ও কাউন্ট হবে। তবে ন্যূনতম ৫০ বার সতর্ক না হওয়া পর্যন্ত পরীক্ষা কখনই স্বয়ংক্রিয়ভাবে সমাপ্ত হবে না।
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Question Authoring / Review Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
            {creationMode === 'institution' ? (
              /* ======================================================== */
              /* AUTHENTIC BANGLADESH SCHOOL/BOARD QUESTION PAPER HEADER   */
              /* (হুবহু ৩ নং ছবির অফিসিয়াল বোর্ড ও স্কুল প্রশ্নপত্র ফরম্যাট)      */
              /* ======================================================== */
              <div className="w-full bg-[#fdfdfd] border-2 border-slate-900 rounded-3xl p-5 sm:p-7 shadow-xs relative select-none font-['Noto_Sans_Bengali']">
                
                {/* 1. Top Meta Row: Region/Area - Code - Serial/Year */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-800 pb-2 border-b border-dashed border-slate-300">
                  <span className="tracking-wide text-slate-700 font-bold">
                    {selectedInstitutionMeta.region || 'বুড়িগঙ্গা'}
                  </span>
                  <span className="font-bold text-slate-700 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                    ৮৩
                  </span>
                  <span className="font-mono font-black text-slate-900 tracking-wider">
                    {selectedInstitutionMeta.subjectCode}/{selectedInstitutionMeta.year}
                  </span>
                </div>

                {/* 2. Main Center Header Block (Matching Picture 3) */}
                <div className="text-center py-3.5 space-y-1">
                  
                  {/* Set Box: ০৩ সেট */}
                  <div className="inline-block px-3.5 py-1 rounded border-2 border-slate-900 text-xs sm:text-sm font-black text-slate-950 tracking-wider bg-white shadow-2xs mb-1">
                    {selectedInstitutionMeta.setCode || '০৩ সেট'}
                  </div>

                  {/* Institution Name */}
                  <h2 className="text-xl sm:text-2.5xl font-black text-slate-950 tracking-tight leading-snug">
                    {selectedInstitutionMeta.institutionName}
                  </h2>

                  {/* Class & Exam Type */}
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {selectedInstitutionMeta.studentClass} • {selectedInstitutionMeta.examType}
                  </p>

                  {/* Subject Name */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 pt-1">
                    {selectedInstitutionMeta.subject.includes('(') ? selectedInstitutionMeta.subject : `${selectedInstitutionMeta.subject} (বহুনির্বাচনি অভীক্ষা)`}
                  </h3>

                  {/* Paper Part (প্রথম পত্র) */}
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    {selectedInstitutionMeta.paperPart || 'প্রথম পত্র'}
                  </p>

                  {/* Syllabus Notice */}
                  <p className="text-xs font-semibold text-slate-600 pt-0.5">
                    [{selectedInstitutionMeta.year} সালের সিলেবাস অনুযায়ী]
                  </p>

                  {/* Boxed Subject Code (হুবহু ৩ নং ছবির মতো বক্স করা ডিজিট) */}
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">বিষয় কোড :</span>
                    <div className="inline-flex items-center border-2 border-slate-900 rounded bg-white shadow-2xs overflow-hidden">
                      {selectedInstitutionMeta.subjectCode.split('').map((digit, dIdx) => (
                        <span
                          key={dIdx}
                          className="w-7 h-7 flex items-center justify-center font-black text-xs sm:text-sm text-slate-950 border-r last:border-r-0 border-slate-900 font-mono"
                        >
                          {digit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Time & Total Marks Row */}
                  <div className="pt-3 flex items-center justify-center gap-8 sm:gap-14 text-xs sm:text-sm font-black text-slate-950 border-t border-slate-900 mt-2">
                    <span>সময় — {toBn(durationMinutes)} মিনিট</span>
                    <span>পূর্ণমান — {toBn(generatedQuestions.length)}</span>
                  </div>

                  {/* Special Instruction Note */}
                  <p className="pt-2 text-[11px] sm:text-xs font-bold text-slate-700 italic max-w-xl mx-auto leading-relaxed">
                    [বিশেষ দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে সঠিক উত্তরের বৃত্তটি বলপেন দিয়ে ভরাট করো। সকল প্রশ্নের মান সমান।]
                  </p>
                </div>

                {/* 3. Action Toolbar at bottom of authentic header */}
                <div className="pt-3 border-t border-dashed border-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveViewMode('institution_papers')}
                    className="px-3.5 py-1.5 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Landmark className="w-3.5 h-3.5 text-purple-600" />
                    <span>অন্য প্রতিষ্ঠান বা সালের প্রশ্নপত্র বাছাই করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন প্রশ্ন যোগ করুন</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Standard Manual / AI Header */
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>
                      {creationMode === 'manual' ? '✍️ নিজে প্রশ্ন প্রণয়ন' : '✨ এআই প্রস্তুতকৃত প্রশ্নপত্র'}
                      {' '}(মোট: {toBn(generatedQuestions.length)}টি প্রশ্ন)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {creationMode === 'manual'
                      ? 'নিচে খালি ফরম্যাটে প্রশ্ন লিখুন, ৪টি অপশন দিন এবং সঠিক উত্তরের বোতামে ক্লিক করে টিক দিন'
                      : 'পছন্দ না হলে পাশে থাকা "বিকল্প প্রশ্ন" বাটনে নতুন প্রশ্ন আনুন অথবা নিজের মতো "এডিট" করুন'}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন প্রশ্ন যোগ করুন</span>
                  </button>

                  {creationMode === 'manual' && (
                    <button
                      type="button"
                      onClick={handleLoadCurriculumSuggestion}
                      className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      title="পাঠ্যবইয়ের প্রশ্নব্যাংক থেকে আইডিয়া দেখতে চাইলে ক্লিক করুন"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden md:inline">বইয়ের আইডিয়া দেখুন</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Bloom's Taxonomy Cognitive Balance Bar */}
            {generatedQuestions.length > 0 && (() => {
              const stats = calculateBloomStats(generatedQuestions);
              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-lg space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                        <Brain className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5">
                          <span>ব্লুমস ট্যাক্সোনমি ও কগনিটিভ দক্ষতার ভারসাম্য (Bloom's Taxonomy)</span>
                        </h4>
                        <p className="text-[11px] text-slate-300 font-medium">
                          NCTB ও জাতীয় শিক্ষাক্রমের আলোকে প্রতিটি স্তরের প্রশ্নের সুষম বণ্টন
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-200 bg-white/10 px-3 py-1 rounded-full border border-white/15 self-start sm:self-auto">
                      মোট প্রশ্ন: {toBn(generatedQuestions.length)}টি
                    </span>
                  </div>

                  {/* Visual Multi-Segment Bar */}
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner border border-slate-700/50">
                    <div 
                      style={{ width: `${stats.percentages.knowledge}%` }} 
                      className="bg-blue-500 h-full transition-all" 
                      title={`জ্ঞানমূলক: ${stats.counts.knowledge}টি (${stats.percentages.knowledge}%)`} 
                    />
                    <div 
                      style={{ width: `${stats.percentages.comprehension}%` }} 
                      className="bg-emerald-500 h-full transition-all" 
                      title={`অনুধাবনমূলক: ${stats.counts.comprehension}টি (${stats.percentages.comprehension}%)`} 
                    />
                    <div 
                      style={{ width: `${stats.percentages.application}%` }} 
                      className="bg-amber-500 h-full transition-all" 
                      title={`প্রয়োগমূলক: ${stats.counts.application}টি (${stats.percentages.application}%)`} 
                    />
                    <div 
                      style={{ width: `${stats.percentages.higher_order}%` }} 
                      className="bg-purple-500 h-full transition-all" 
                      title={`উচ্চতর দক্ষতা: ${stats.counts.higher_order}টি (${stats.percentages.higher_order}%)`} 
                    />
                  </div>

                  {/* 4 Interactive Level Chips with standard benchmark */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    {/* Knowledge */}
                    <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-400/30">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-blue-300">
                          <span>📘</span> জ্ঞানমূলক
                        </span>
                        <span className="font-mono text-white font-black">{toBn(stats.counts.knowledge)}টি ({toBn(stats.percentages.knowledge)}%)</span>
                      </div>
                      <span className="text-[10px] text-blue-200/70 block mt-0.5">বোর্ড মান: ৪০% (সংজ্ঞা/সূত্র)</span>
                    </div>

                    {/* Comprehension */}
                    <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-emerald-300">
                          <span>📗</span> অনুধাবনমূলক
                        </span>
                        <span className="font-mono text-white font-black">{toBn(stats.counts.comprehension)}টি ({toBn(stats.percentages.comprehension)}%)</span>
                      </div>
                      <span className="text-[10px] text-emerald-200/70 block mt-0.5">বোর্ড মান: ৩০% (অর্থ/ব্যাখ্যা)</span>
                    </div>

                    {/* Application */}
                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-amber-300">
                          <span>📙</span> প্রয়োগমূলক
                        </span>
                        <span className="font-mono text-white font-black">{toBn(stats.counts.application)}টি ({toBn(stats.percentages.application)}%)</span>
                      </div>
                      <span className="text-[10px] text-amber-200/70 block mt-0.5">বোর্ড মান: ২০% (অংক/গণনা)</span>
                    </div>

                    {/* Higher Order */}
                    <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-400/30">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1 text-purple-300">
                          <span>📕</span> উচ্চতর দক্ষতা
                        </span>
                        <span className="font-mono text-white font-black">{toBn(stats.counts.higher_order)}টি ({toBn(stats.percentages.higher_order)}%)</span>
                      </div>
                      <span className="text-[10px] text-purple-200/70 block mt-0.5">বোর্ড মান: ১০% (বিশ্লেষণ/যুক্তি)</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Questions List */}
            <div className="space-y-4">
              {(generatedQuestions || []).map((q, qIndex) => {
                const currentBloom = q.cognitiveLevel 
                  ? normalizeBloomLevel(q.cognitiveLevel) 
                  : inferBloomLevelFromQuestion(q.question, q.explanation);
                const bloomMeta = BLOOM_LEVELS[currentBloom];
                const isEditingSol = Boolean(editingSolutionIndices[qIndex]);

                return (
                  <div 
                    key={q.id || `q_${qIndex}`}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ease-out space-y-3 group cursor-default relative ${
                      recentlySwappedIndex === qIndex
                        ? 'bg-emerald-50/95 border-emerald-400 shadow-xl shadow-emerald-200/70 ring-2 ring-emerald-400 animate-in zoom-in-95'
                        : 'bg-slate-100 border-slate-200/90 shadow-xs hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/80 hover:border-blue-300/80 hover:bg-slate-50/95'
                    }`}
                  >
                    {/* Live Swapped Notification Pill */}
                    {recentlySwappedIndex === qIndex && (
                      <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wider shadow-md flex items-center gap-1.5 animate-bounce z-10">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        <span>নতুন বিকল্প প্রশ্ন প্রতিস্থাপিত হয়েছে!</span>
                      </div>
                    )}

                    {/* Question Header Meta Badges: Chapter, Difficulty, & Interactive Bloom's Taxonomy Level Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200/70">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {q.chapter && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100/90 text-blue-900 text-[10px] font-bold border border-blue-200">
                            📖 {q.chapter}
                          </span>
                        )}
                        {q.difficulty && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            q.difficulty === 'easy' ? 'bg-emerald-100/90 text-emerald-900 border-emerald-200' :
                            q.difficulty === 'hard' ? 'bg-rose-100/90 text-rose-900 border-rose-200' :
                            'bg-amber-100/90 text-amber-900 border-amber-200'
                          }`}>
                            {q.difficulty === 'easy' ? '🟢 সহজ' : q.difficulty === 'hard' ? '🔴 কঠিন' : '🟡 মাঝারি'}
                          </span>
                        )}
                      </div>

                      {/* Interactive Bloom's Taxonomy Cognitive Level Dropdown Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">ট্যাক্সোনমি স্তর:</span>
                        <div className="relative inline-flex items-center">
                          <select
                            value={currentBloom}
                            onChange={(e) => handleUpdateCognitiveLevel(qIndex, e.target.value as BloomLevel)}
                            className={`text-[11px] font-black pl-2 pr-6 py-1 rounded-lg border shadow-2xs appearance-none cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-purple-400 ${bloomMeta.badgeBg} ${bloomMeta.badgeBorder}`}
                            title="ব্লুমস ট্যাক্সোনমি অনুযায়ী এই প্রশ্নের কগনিটিভ স্তর পরিবর্তন করুন"
                          >
                            <option value="knowledge">📘 জ্ঞানমূলক (Knowledge)</option>
                            <option value="comprehension">📗 অনুধাবনমূলক (Comprehension)</option>
                            <option value="application">📙 প্রয়োগমূলক (Application)</option>
                            <option value="higher_order">📕 উচ্চতর দক্ষতা (Higher Order)</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 pointer-events-none text-slate-600" />
                        </div>
                      </div>
                    </div>

                    {/* Stimulus / উদ্দীপক (যদি উদ্দীপকভিত্তিক প্রশ্ন হয়) */}
                    {q.stimulus && (
                      <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 text-xs text-slate-800 leading-relaxed font-serif">
                        <span className="font-bold text-amber-950 block mb-0.5 text-[11px]">নিচের উদ্দীপকটি পড়ে সংশ্লিষ্ট প্রশ্নের উত্তর দিন:</span>
                        {q.stimulus}
                      </div>
                    )}

                    {/* 1. Direct Question Row: Number Badge + Question Input + Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          {toBn(qIndex + 1)}
                        </span>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleUpdateQuestionText(qIndex, e.target.value)}
                          placeholder={creationMode === 'manual' ? `প্রশ্ন নম্বর ${toBn(qIndex + 1)} লিখুন...` : 'এখানে প্রশ্নটি সম্পাদনা করুন...'}
                          className="flex-1 min-w-0 bg-transparent border-none px-2 py-1.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 transition-colors"
                        />
                      </div>

                      {/* Header Actions: Alternative Question (Skip & Swap from same chapter) and Delete */}
                      <div className="flex items-center justify-end gap-1.5 shrink-0 pl-10 sm:pl-0">
                        <button
                          type="button"
                          onClick={() => handleSkipQuestion(qIndex)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-amber-900 text-xs font-bold transition-all border border-amber-300 shadow-2xs hover:scale-102 cursor-pointer active:scale-95 shrink-0"
                          title="এই প্রশ্নটি পছন্দ না হলে নির্বাচিত অধ্যায় থেকেই আরেকটি নতুন প্রশ্ন দিয়ে প্রতিস্থাপন করুন"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                          <span>স্কিপ ও পরিবর্তন</span>
                        </button>

                        {generatedQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(qIndex)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-transparent hover:bg-rose-50 border border-rose-300/70 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            title="এই প্রশ্নটি মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>মুছুন</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. 4 Clean Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-1">
                      {(q.options || ['', '', '', '']).map((opt, optIndex) => {
                        const isCorrect = (q.correctAnswer && q.correctAnswer === opt && opt !== '') ||
                                          (q.correctAnswerIndex !== undefined && q.correctAnswerIndex === optIndex);
                        const optLetters = ['ক', 'খ', 'গ', 'ঘ'];

                        return (
                          <div 
                            key={optIndex}
                            onClick={() => handleSetCorrectAnswerByIndex(qIndex, optIndex)}
                            className="flex items-center gap-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-200/40 transition-colors cursor-pointer group/opt"
                          >
                            {/* Tick / Letter Circle Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetCorrectAnswerByIndex(qIndex, optIndex);
                              }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all cursor-pointer ${
                                isCorrect 
                                  ? 'bg-emerald-600 text-white shadow-2xs scale-105' 
                                  : 'bg-transparent border border-slate-400 text-slate-700 group-hover/opt:border-emerald-600 group-hover/opt:text-emerald-700'
                              }`}
                              title={isCorrect ? 'এটি সঠিক উত্তর হিসেবে নির্বাচিত' : 'সঠিক উত্তর হিসেবে নির্বাচন করতে ক্লিক করুন'}
                            >
                              {isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : optLetters[optIndex]}
                            </button>

                            {/* Option Input Field */}
                            <input
                              type="text"
                              value={opt}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleUpdateOption(qIndex, optIndex, e.target.value)}
                              placeholder={`অপশন (${optLetters[optIndex]}) লিখুন...`}
                              className={`flex-1 min-w-0 bg-transparent border-none text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-none transition-colors ${
                                isCorrect ? 'text-emerald-950 font-bold' : 'text-slate-800'
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* 3. Detailed Step-by-Step Explanation & Multi-Method Solution with Direct Editing */}
                    <div className="pt-2 border-t border-slate-200/70 mt-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => toggleSolution(qIndex)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50/90 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                            title="এই প্রশ্নের বিস্তারিত সমাধান ও বিকল্প কৌশল দেখতে ক্লিক করুন"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{expandedSolutions[qIndex] ? 'বিস্তারিত সমাধান লুকান' : 'বিস্তারিত সমাধান দেখুন (২টি পদ্ধতি)'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSolutions[qIndex] ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Explanation & Steps Edit Mode Toggle Button */}
                          <button
                            type="button"
                            onClick={() => toggleEditSolution(qIndex)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                              isEditingSol
                                ? 'bg-purple-600 text-white border-purple-700'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                            }`}
                            title="এই প্রশ্নের তাত্ত্বিক ও গাণিতিক ব্যাখ্যা এবং ২টি সমাধান পদ্ধতি এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isEditingSol ? '✓ এডিট শেষ' : 'ব্যাখ্যা ও পদ্ধতি এডিট'}</span>
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-500 font-medium italic">
                          (সন্তান পরীক্ষার সময় কোনো সমাধান দেখতে পাবে না)
                        </span>
                      </div>

                      {/* Expanded Solution Content with Interactive Editor */}
                      {expandedSolutions[qIndex] && (
                        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-1 text-xs leading-relaxed text-slate-800">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 flex-wrap gap-2">
                            <span className="font-black text-slate-900 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <span>তাত্ত্বিক ও গাণিতিক সমাধান (ব্লুমস স্তর: {bloomMeta.banglaName}):</span>
                            </span>
                            {q.correctAnswer && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                সঠিক উত্তর: {q.correctAnswer}
                              </span>
                            )}
                          </div>

                          {/* Main Explanation Field (Editable or Static View) */}
                          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                            <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wide">
                              মূল তাত্ত্বিক / কনসেপ্ট ব্যাখ্যা:
                            </label>
                            {isEditingSol ? (
                              <textarea
                                rows={2}
                                value={q.explanation || ''}
                                onChange={(e) => handleUpdateExplanation(qIndex, e.target.value)}
                                placeholder="পাঠ্যবইয়ের সূত্র বা মৌলিক ধারণার ব্যাখ্যা লিখুন..."
                                className="w-full text-xs font-medium p-2 rounded-lg border border-purple-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-300 outline-none text-slate-900"
                              />
                            ) : (
                              <p className="text-slate-800 font-medium">
                                {q.explanation || 'সংশ্লিষ্ট পাঠ্যবইয়ের অধ্যায়ভিত্তিক মূলনীতি ও সূত্রানুসারে এই প্রশ্নের সমাধান প্রযোজ্য।'}
                              </p>
                            )}
                          </div>

                          {/* 2 Step-by-Step Methods (Method 1: Formula/Curriculum, Method 2: Shortcut/Alternative) */}
                          {(() => {
                            const solutions = (q.solutions && q.solutions.length >= 2)
                              ? q.solutions
                              : generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation);

                            return (
                              <div className="space-y-2.5">
                                {solutions.map((sol, sIdx) => {
                                  const isMethod1 = sIdx === 0;
                                  return (
                                    <div 
                                      key={sIdx}
                                      className={`p-3 rounded-xl border ${
                                        isMethod1 
                                          ? 'bg-blue-50/50 border-blue-200/80 text-blue-950' 
                                          : 'bg-amber-50/50 border-amber-200/80 text-amber-950'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 font-black mb-1.5">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                                          isMethod1 ? 'bg-blue-600' : 'bg-amber-600'
                                        }`}>
                                          {toBn(sIdx + 1)}
                                        </span>
                                        <span className={isMethod1 ? 'text-blue-900' : 'text-amber-900'}>
                                          {isMethod1 ? 'পদ্ধতি ১: বইয়ের নিয়ম ও বিস্তারিত সূত্র প্রয়োগ' : 'পদ্ধতি ২: সহজ শর্টকাট / বিকল্প কৌশল'}
                                        </span>
                                      </div>

                                      {isEditingSol ? (
                                        <textarea
                                          rows={2}
                                          value={sol}
                                          onChange={(e) => handleUpdateSolutionMethod(qIndex, sIdx, e.target.value)}
                                          placeholder={`পদ্ধতি ${toBn(sIdx + 1)} এর বিস্তারিত ধাপ লিখুন...`}
                                          className={`w-full text-xs font-medium p-2 rounded-lg border outline-none ${
                                            isMethod1 
                                              ? 'border-blue-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-300 text-blue-950 bg-white' 
                                              : 'border-amber-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-300 text-amber-950 bg-white'
                                          }`}
                                        />
                                      ) : (
                                        <div className="pl-6.5 text-slate-700 whitespace-pre-line font-medium leading-relaxed">
                                          {sol}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {isEditingSol && (
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => toggleEditSolution(qIndex)}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>সম্পাদনা সংরক্ষণ করুন</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>আরও একটি প্রশ্ন যোগ করুন</span>
              </button>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveToLibraryDirect}
                  className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  title="প্রশ্নপত্রটি শিক্ষকের প্রশ্ন লাইব্রেরিতে সংরক্ষণ করুন"
                >
                  <Save className="w-4 h-4 text-indigo-200" />
                  <span>{editingPaperId ? 'পরিবর্তন লাইব্রেরিতে সেভ করুন' : 'লাইব্রেরিতে সংরক্ষণ করুন'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalizeExam}
                  className={`flex-1 sm:flex-initial px-7 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                    isFinalized
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/80 ring-2 ring-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-200/80'
                  }`}
                >
                  {isFinalized ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3] text-emerald-100" />
                      <span>✓ প্রশ্নপত্র সংরক্ষিত! লিংক প্রস্তুত</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>প্রশ্ন চূড়ান্ত করুন ও পিন পান</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: TESTS LIST & EVALUATION (SUBMITTED EXAMS)        */}
      {/* ======================================================== */}
      {activeTab !== 'report' && activeTab !== 'games' && activeTab !== 'library' && activeViewMode === 'tests' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {filterMode === 'unreviewed' ? 'অমূল্যায়িত উত্তরপত্রসমূহ (যা এখনো দেখা হয়নি)' : 'অভিভাবকের নির্ধারিত পরীক্ষাসমূহ ও খাতা'}
                </h2>
                {filterMode === 'unreviewed' && (
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className="px-2 py-0.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold border border-blue-200 cursor-pointer transition-colors"
                    title="সকল পরীক্ষা দেখুন"
                  >
                    সব দেখুন ✕
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {filterMode === 'unreviewed'
                  ? `মোট ${toBn(displayedTests.length)}টি উত্তরপত্র মূল্যায়নের অপেক্ষায় রয়েছে`
                  : 'সন্তানের জন্য আপনার তৈরি করা পরীক্ষাসমূহ এবং জমা দেওয়া উত্তরপত্র'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filterMode === 'unreviewed' && (
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className="px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="সকল নির্ধারিত পরীক্ষা দেখুন"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>সকল পরীক্ষা দেখুন</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl border border-sky-200 bg-sky-50/80 hover:bg-sky-100 text-sky-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="সার্ভার থেকে সদ্য জমা হওয়া উত্তরপত্র ও স্কোর তৎক্ষণাৎ রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'খাতা রিফ্রেশ'}</span>
              </button>

              {tests.length > 0 && (
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setIsDeletingAllInline(!isDeletingAllInline)}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="সকল ডামি ও পূর্ববর্তী পরীক্ষা মুছে সম্পূর্ণ ফ্রেশ ড্যাশবোর্ড করুন"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>সকল পরীক্ষা মুছুন</span>
                  </button>

                  {isDeletingAllInline && (
                    <div className="absolute top-full right-0 mt-1.5 z-30 bg-white border border-rose-200 rounded-xl p-3 shadow-xl min-w-[240px] animate-in fade-in slide-in-from-top-1 text-left">
                      <p className="text-[11px] font-bold text-rose-800 mb-2 leading-tight">
                        ⚠️ সকল পরীক্ষা মুছে ফেলতে চান?
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleClearAllTestsDirect}
                          className="flex-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors cursor-pointer text-center"
                        >
                          ওকে
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDeletingAllInline(false)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Proctoring Strictness Level Card in Tests View */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldAlert className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-800">
                    লাইভ প্রক্টরিং কঠোরতার মাত্রা:
                  </span>
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-600 text-white shadow-2xs">
                    লেভেল {proctoringLevel === 1 ? '১ (মৃদু)' : proctoringLevel === 2 ? '২ (মাঝারি)' : proctoringLevel === 3 ? '৩ (কঠোর - আড় চোখ সনাক্ত)' : '৪ (সর্বোচ্চ কঠোর - অতি-সংবেদনশীল)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  পরীক্ষার্থী আড় চোখে বা অন্য দিকে তাকালে তাৎক্ষণিক সতর্ক ও কাউন্ট হবে (সর্বনিম্ন ৫০ বারে সমাপ্তি)।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 flex-wrap">
              <span className="text-[11px] font-bold text-slate-600 hidden md:inline">লেভেল নির্বাচন:</span>
              {[
                { lvl: 1, name: 'লেভেল ১' },
                { lvl: 2, name: 'লেভেল ২' },
                { lvl: 3, name: 'লেভেল ৩' },
                { lvl: 4, name: 'লেভেল ৪' }
              ].map(item => (
                <button
                  key={item.lvl}
                  type="button"
                  onClick={() => {
                    setProctoringLevel(item.lvl as 1 | 2 | 3 | 4);
                    localStorage.setItem('dapathshala_parent_proctoring_level', String(item.lvl));
                    showToast(`✓ প্রক্টরিং কঠোরতার মাত্রা লেভেল ${item.lvl} এ সেট করা হয়েছে!`);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    proctoringLevel === item.lvl 
                      ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-600/30' 
                      : 'bg-white text-purple-800 hover:bg-purple-100 border border-purple-200 shadow-2xs'
                  }`}
                  title={`লেভেল ${item.lvl} নির্বাচন করুন`}
                >
                  {item.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSettingsInitialTab('preferences');
                  setIsSettingsOpen(true);
                }}
                className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer border border-purple-200 bg-white ml-1 shadow-2xs flex items-center gap-1 text-[11px] font-bold"
                title="পূর্ণাঙ্গ প্রক্টরিং সেটিংস খুলুন"
              >
                <Settings className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden sm:inline">সেটিংস</span>
              </button>
            </div>
          </div>

          {tests.length === 0 ? (
            <div className="py-7 sm:py-9 text-center bg-slate-50/70 rounded-3xl border border-dashed border-slate-300 px-4 sm:px-6">
              <div className="w-13 h-13 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1">
                কোন প্রশ্ন তৈরি করেননি
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4 font-medium leading-relaxed">
                আপনার সন্তানের জন্য নতুন প্রশ্নপত্র বা পরীক্ষা তৈরি করতে নিচের বাটনে ক্লিক করুন।
              </p>
              
              {/* Marked Button: Opens creation mode modal with single + icon */}
              <button
                type="button"
                onClick={() => setShowCreationModeModal(true)}
                className="px-6 py-2.5 sm:py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer inline-flex items-center gap-2 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন পরীক্ষা তৈরি করুন</span>
              </button>
            </div>
          ) : displayedTests.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/70 rounded-3xl border border-dashed border-slate-300 px-4 sm:px-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1">
                কোনো অমূল্যায়িত উত্তরপত্র বাকি নেই!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4 font-medium">
                সব জমাকৃত উত্তরপত্র দেখা সম্পন্ন হয়েছে।
              </p>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>সকল নির্ধারিত পরীক্ষা দেখুন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {displayedTests.map(test => {
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
                          মোট প্রশ্ন: <strong className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tracking-wider font-['Noto_Sans_Bengali']">{toBn(test.questionCount ?? test.questions?.length ?? 0)}টি</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1">
                          সময়: <strong className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tracking-wider font-['Noto_Sans_Bengali']">{toBn(test.durationMinutes ?? 15)} মিনিট</strong>
                        </span>
                        {test.score !== undefined && test.score !== null && (
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

                      {/* 2. Delete Option with Inline Warning */}
                      <div className="relative inline-block">
                        <button
                          type="button"
                          onClick={() => setDeletingTestId(deletingTestId === test.id ? null : test.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
                          title="পরীক্ষাটি তালিকা থেকে মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
                          <span>মুছুন</span>
                        </button>

                        {/* Inline Warning Message right beneath delete button */}
                        {deletingTestId === test.id && (
                          <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border border-rose-200 rounded-xl p-2.5 shadow-lg min-w-[210px] animate-in fade-in slide-in-from-top-1 text-left">
                            <p className="text-[11px] font-bold text-rose-800 mb-2 leading-tight">
                              ⚠️ নিশ্চিত মুছে ফেলতে চান?
                            </p>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteSingleTest(test)}
                                className="flex-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-colors cursor-pointer text-center"
                              >
                                ওকে
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingTestId(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2b. Action Button: A4 প্রিন্ট ও স্কুল ফরম্যাট (দ্বৈত মোড - অফলাইন ক্লাসরুম পরীক্ষা) */}
                      <button
                        type="button"
                        onClick={() => setPrintModalTest(test)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-2xs hover:scale-102 cursor-pointer active:scale-95"
                        title="স্কুলের জন্য অফিসিয়াল ২-কলাম A4 প্রিন্ট ও উত্তরমালা ফরম্যাট খুলুন"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-600" />
                        <span>A4 প্রিন্ট</span>
                      </button>

                      {/* 2c. Action Button: এডিট / সংস্কার */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleEditPaperInBuilder(test)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          title="প্রশ্নপত্রটি পুনরায় এডিট বা পরিবর্তন করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>এডিট</span>
                        </button>
                      )}

                      {/* 3. Action Button: প্রশ্নপত্র দেখুন (যদি এখনও জমা না দেয় - এর পাশে কোন সময় থাকবে না) */}
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => setPreviewPaperTest(test)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>প্রশ্নপত্র দেখুন</span>
                        </button>
                      )}

                      {/* 4. Action Button: উত্তরপত্র (খাতা জমা হওয়ার পর) এবং ঠিক এর ডান পাশে জমার দিনক্ষণ */}
                      {(isSubmitted || isReviewed) && (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(test)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer ${
                              isReviewed
                                ? 'bg-slate-500 hover:bg-slate-600 active:bg-slate-700 ring-1 ring-slate-400/80 shadow-2xs'
                                : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 ring-2 ring-amber-400 ring-offset-1'
                            }`}
                            title={isReviewed ? "মূল্যায়িত উত্তরপত্র দেখতে ক্লিক করুন" : "উত্তরপত্র দেখতে ও মূল্যায়ন করতে ক্লিক করুন"}
                          >
                            <FileText className="w-4 h-4" />
                            <span>উত্তরপত্র</span>
                          </button>

                          {/* উত্তরপত্রের ঠিক ডান পাশে খাতা জমা হওয়ার দিনক্ষণ */}
                          <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/90 text-indigo-950 text-xs font-semibold shadow-2xs"
                            title="সন্তানের খাতা জমার সঠিক তারিখ ও সময়"
                          >
                            <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>
                              জমার সময়: <strong className="font-bold text-indigo-900 font-['Noto_Sans_Bengali']">{formatSubmissionDateTime(test)}</strong>
                            </span>
                          </div>
                        </div>
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
      {/* VIEW 3: INSTITUTION & BOARD PAPERS FULL EXPLORER         */}
      {/* (কোনো পপাপ নয় - সরাসরি ড্যাশবোর্ড ক্যানভাসে উন্মুক্ত ভিউ)  */}
      {/* ======================================================== */}
      {activeTab !== 'report' && activeTab !== 'games' && activeTab !== 'library' && activeViewMode === 'institution_papers' && (
        <InstitutionPaperExplorer
          onBack={() => setActiveViewMode('tests')}
          onSelectPaper={handleSelectInstitutionPaper}
          onOpenAdminUpload={() => setShowAdminUploadModal(true)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 0: QUESTION PAPER PREVIEW (নিরাপদ প্রিভিউ ও প্রিন্ট)   */}
      {/* (পরীক্ষা শুরু না করেই সম্পূর্ণ প্রশ্নপত্র ও সঠিক উত্তর দেখার সুবিধা) */}
      {/* ======================================================== */}
      {previewPaperTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      প্রশ্নপত্র প্রিভিউ
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                      পিন: {previewPaperTest.pin}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    {previewPaperTest.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    অধ্যায়: {previewPaperTest.chapter} • মোট প্রশ্ন: {toBn(previewPaperTest.questions?.length ?? previewPaperTest.questionCount)}টি • সময়: {toBn(previewPaperTest.durationMinutes)} মিনিট
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = previewPaperTest;
                    setPreviewPaperTest(null);
                    setPrintModalTest(target);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  title="স্কুলের জন্য অফিসিয়াল ২-কলাম A4 প্রিন্ট ও উত্তরমালা ফরম্যাট খুলুন"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>A4 প্রিন্ট ফরম্যাট</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPaperTest(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Questions List Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {(previewPaperTest.questions || []).map((q, idx) => {
                const bLevel = q.cognitiveLevel 
                  ? normalizeBloomLevel(q.cognitiveLevel) 
                  : inferBloomLevelFromQuestion(q.question, q.explanation);
                const bMeta = BLOOM_LEVELS[bLevel];
                const solutions = (q.solutions && q.solutions.length >= 2)
                  ? q.solutions
                  : generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation);

                return (
                  <div key={q.id || idx} className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 space-y-3">
                    {/* Header: Serials + Bloom's Taxonomy badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {toBn(idx + 1)}
                        </span>
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                          {q.question}
                        </p>
                      </div>

                      {/* Bloom's Cognitive Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold border shrink-0 ${bMeta.badgeBg} ${bMeta.badgeBorder}`}>
                        {bMeta.icon} {bMeta.banglaName}
                      </span>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      {(q.options || []).map((opt, optIdx) => {
                        const isCorrect = opt.trim() === q.correctAnswer?.trim();
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
                              isCorrect 
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-2xs' 
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center">
                                {['ক', 'খ', 'গ', 'ঘ'][optIdx] || optIdx + 1}
                              </span>
                              <span>{opt}</span>
                            </div>
                            {isCorrect && (
                              <span className="text-[11px] text-emerald-700 font-black flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>সঠিক উত্তর</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step-by-Step Explanation & Methods Guide */}
                    {(q.explanation || (solutions && solutions.length > 0)) && (
                      <div className="ml-8 mt-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs text-amber-950 space-y-2">
                        {q.explanation && (
                          <div className="leading-relaxed">
                            <span className="font-bold text-amber-900">তাত্ত্বিক ব্যাখ্যা: </span>
                            <span>{q.explanation}</span>
                          </div>
                        )}

                        {/* 2 Methods */}
                        {solutions && solutions.length > 0 && (
                          <div className="space-y-1.5 pt-1 border-t border-amber-200/60">
                            {solutions.map((sol, sIdx) => (
                              <div key={sIdx} className="text-[11px] leading-relaxed">
                                <strong className="text-amber-900 font-bold">
                                  {sIdx === 0 ? '• পদ্ধতি ১ (বইয়ের নিয়ম): ' : '• পদ্ধতি ২ (শর্টকাট কৌশল): '}
                                </strong>
                                <span className="text-slate-800">{sol}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                সন্তানের সাথে ৬-সংখ্যার পিনটি (<strong className="text-blue-700 font-black">{previewPaperTest.pin}</strong>) শেয়ার করুন।
              </span>
              <button
                type="button"
                onClick={() => setPreviewPaperTest(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
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
                    {toBn(createdTestResult.questionCount ?? createdTestResult.questions?.length ?? 0)}টি প্রশ্ন ({toBn(createdTestResult.durationMinutes ?? 15)} মিনিট)
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

              {/* Dual Mode Choices: Online Live Exam vs Offline School Print */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Mode A: Online Live Exam */}
                <button
                  type="button"
                  onClick={() => {
                    const target = createdTestResult;
                    setCreatedTestResult(null);
                    onOpenTest(target);
                  }}
                  className="p-3.5 rounded-2xl border-2 border-blue-500 bg-blue-50/80 hover:bg-blue-100 text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-xs text-blue-950">১. অনলাইনে লাইভ পরীক্ষা</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-tight font-medium">
                    ওয়েবক্যাম প্রক্টরিং, টাইমার ও স্বয়ংক্রিয় খাতা মূল্যায়ন
                  </p>
                </button>

                {/* Mode B: Offline Classroom A4 Print */}
                <button
                  type="button"
                  onClick={() => {
                    const target = createdTestResult;
                    setCreatedTestResult(null);
                    setPrintModalTest(target);
                  }}
                  className="p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/80 hover:bg-emerald-100 text-left transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Printer className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-xs text-emerald-950">২. অফলাইনে A4 প্রিন্ট</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-tight font-medium">
                    স্কুলের জন্য ২-কলাম প্রশ্নপত্র ও শিক্ষকের উত্তরমালা প্রিন্ট
                  </p>
                </button>
              </div>

              {/* Direct WhatsApp Share & Dismiss */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `তোমার জন্য একটি নতুন পরীক্ষা নির্ধারণ করা হয়েছে: ${createdTestResult.title}\nসরাসরি পরীক্ষা দেওয়ার লিংক:\n${getShareableTestUrl(createdTestResult)}\n\n(অথবা ৬-সংখ্যার পিন: ${createdTestResult.pin})`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
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
                  className="py-2.5 px-5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex justify-center items-start">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-5 my-4 sm:my-8 relative">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    খাতা মূল্যায়ন ও মন্তব্য
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 inline-flex items-center gap-1 font-['Noto_Sans_Bengali']">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>জমার সময়: {formatSubmissionDateTime(reviewTest)}</span>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {reviewTest.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewTest(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
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
                    {(reviewTest.proctoringFlags || []).map((flag, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feature 1: Photographic Violation Snapshot Proofs Gallery */}
              {reviewTest.violationSnapshots && reviewTest.violationSnapshots.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-xs space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-rose-950 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>সন্দেহজনক মুহূর্তের স্বয়ংক্রিয় ফটো স্ন্যাপশট প্রমাণ ({toBn(reviewTest.violationSnapshots.length)}টি সংরক্ষিত):</span>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                      ক্লিক করে বড় ছবি দেখুন ⤢
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                    {reviewTest.violationSnapshots.map((snap, sIdx) => (
                      <div
                        key={snap.id || sIdx}
                        onClick={() => setSelectedSnapshot(snap)}
                        className="group relative rounded-xl overflow-hidden border border-rose-300 bg-black cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all"
                      >
                        <img
                          src={snap.photo}
                          alt={`সতর্কতা #${snap.strike}`}
                          className="w-full h-24 object-cover group-hover:opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-1.5 pointer-events-none">
                          <span className="self-start text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded shadow-xs">
                            #{toBn(snap.strike)}
                          </span>
                          <div className="text-white">
                            <span className="block text-[8.5px] font-bold truncate text-rose-200" title={snap.reason}>
                              {snap.reason}
                            </span>
                            <span className="block text-[8px] text-slate-300 font-mono">
                              {snap.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Questions breakdown */}
            <div className="max-h-72 overflow-y-auto space-y-3.5 pr-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>উত্তরপত্র ও বিস্তারিত সমাধান মূল্যায়ন:</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  ব্লুমস ট্যাক্সোনমি ও ধাপে ধাপে ব্যাখ্যা সহ
                </span>
              </div>

              {(reviewTest.questions || []).length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                  কোনো প্রশ্ন পাওয়া যায়নি।
                </div>
              ) : (
                (reviewTest.questions || []).map((q, idx) => {
                  const isCorrect = q.studentAnswer === q.correctAnswer;
                  const bLevel = q.cognitiveLevel 
                    ? normalizeBloomLevel(q.cognitiveLevel) 
                    : inferBloomLevelFromQuestion(q.question, q.explanation);
                  const bMeta = BLOOM_LEVELS[bLevel];
                  const solutions = (q.solutions && q.solutions.length >= 2)
                    ? q.solutions
                    : generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation);

                  return (
                    <div key={q.id || `rq_${idx}`} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {toBn(idx + 1)}
                          </span>
                          <span className="font-bold text-slate-900 leading-snug">
                            {q.question}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                          {/* Bloom's Taxonomy Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${bMeta.badgeBg} ${bMeta.badgeBorder}`}>
                            {bMeta.icon} {bMeta.banglaName}
                          </span>

                          {q.responseTimeSeconds !== undefined && (
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                              q.responseTimeSeconds < 2.2
                                ? 'bg-rose-50 text-rose-700 border-rose-300 flex items-center gap-1'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {q.responseTimeSeconds < 2.2 && <Zap className="w-2.5 h-2.5 text-rose-600 animate-pulse" />}
                              <span>{q.responseTimeSeconds < 2.2 ? 'অতি দ্রুত: ' : 'সময়: '}{toBn(q.responseTimeSeconds)} সে.</span>
                            </span>
                          )}

                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10.5px] ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {isCorrect ? '✓ সঠিক' : '✗ ভুল'}
                          </span>
                        </div>
                      </div>

                      {/* Student Answer vs Correct Answer */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/70 text-[11.5px]">
                        <div className={`p-2 rounded-xl border ${
                          isCorrect ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-rose-50/70 border-rose-200 text-rose-950'
                        }`}>
                          <span className="text-slate-500 font-medium block text-[10px]">সন্তানের উত্তর:</span>
                          <span className="font-bold">{q.studentAnswer || '(উত্তর দেয়নি)'}</span>
                        </div>

                        <div className="p-2 rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-950">
                          <span className="text-slate-500 font-medium block text-[10px]">সঠিক উত্তর:</span>
                          <span className="font-bold text-emerald-800">{q.correctAnswer}</span>
                        </div>
                      </div>

                      {/* Step-by-Step Explanation & Method 1 + 2 */}
                      {(q.explanation || (solutions && solutions.length > 0)) && (
                        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-[11px] leading-relaxed space-y-1.5 mt-1">
                          {q.explanation && (
                            <div>
                              <strong className="text-amber-900 font-bold">তাত্ত্বিক ব্যাখ্যা: </strong>
                              <span className="text-slate-800">{q.explanation}</span>
                            </div>
                          )}

                          {solutions && solutions.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-amber-200/60">
                              {solutions.map((sol, sIdx) => (
                                <div key={sIdx}>
                                  <strong className="text-amber-900 font-bold">
                                    {sIdx === 0 ? '• পদ্ধতি ১ (সূত্র প্রয়োগ): ' : '• পদ্ধতি ২ (শর্টকাট কৌশল): '}
                                  </strong>
                                  <span className="text-slate-800">{sol}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
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
                  {toBn(shareModalTest.questionCount ?? shareModalTest.questions?.length ?? 0)}টি প্রশ্ন • {toBn(shareModalTest.durationMinutes ?? 15)} মিনিট
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
                  `দা পাঠশালা: ${shareModalTest.title}\nসময়: ${toBn(shareModalTest.durationMinutes ?? 15)} মিনিট, মোট প্রশ্ন: ${toBn(shareModalTest.questionCount ?? shareModalTest.questions?.length ?? 0)}টি।\n\nপরীক্ষায় অংশ নিতে নিচের লিংকে ক্লিক করো:\n${getShareableTestUrl(shareModalTest)}\n\n(অথবা দা পাঠশালা পোর্টালে পিন দাও: ${shareModalTest.pin})`
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
              {retakeModalTest.score !== undefined && retakeModalTest.score !== null && (
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

      {/* ======================================================== */}
      {/* MODAL 6: TEST CREATION MODE SELECTION MODAL              */}
      {/* (১. নিজে প্রশ্ন তৈরি করুন / ২. এআই দিয়ে তৈরি করুন)         */}
      {/* ======================================================== */}
      {showCreationModeModal && (
        <div className="fixed inset-0 lg:left-[var(--sidebar-width,208px)] z-[80] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-4xl w-full border border-slate-200 shadow-2xl space-y-5 relative animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    পরীক্ষা কীভাবে তৈরি করতে চান?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    নিচের যেকোনো একটি অপশন বেছে নিয়ে পরীক্ষা তৈরি শুরু করুন:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreationModeModal(false)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proctoring Level Quick Selector inside Modal */}
            <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/70 rounded-2xl border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800">
                      প্রক্টরিং কঠোরতার মাত্রা:
                    </span>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-purple-600 text-white shadow-2xs">
                      লেভেল {proctoringLevel === 1 ? '১ (মৃদু)' : proctoringLevel === 2 ? '২ (মাঝারি)' : proctoringLevel === 3 ? '৩ (কঠোর - আড় চোখ সনাক্ত)' : '৪ (সর্বোচ্চ কঠোর - অতি-সংবেদনশীল)'}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    পরীক্ষার্থীর জন্য নির্ধারিত এই লেভেল অনুযায়ী পরীক্ষা পর্যবেক্ষণ করা হবে (ন্যূনতম ৫০ বারে সমাপ্তি)।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 flex-wrap">
                {[
                  { lvl: 1, name: 'লেভেল ১' },
                  { lvl: 2, name: 'লেভেল ২' },
                  { lvl: 3, name: 'লেভেল ৩' },
                  { lvl: 4, name: 'লেভেল ৪' }
                ].map(item => (
                  <button
                    key={item.lvl}
                    type="button"
                    onClick={() => {
                      setProctoringLevel(item.lvl as 1 | 2 | 3 | 4);
                      localStorage.setItem('dapathshala_parent_proctoring_level', String(item.lvl));
                      showToast(`✓ প্রক্টরিং কঠোরতার মাত্রা লেভেল ${item.lvl} এ সেট করা হয়েছে!`);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      proctoringLevel === item.lvl 
                        ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-600/30' 
                        : 'bg-white text-purple-800 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Three Choices - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Option 1: নিজে প্রশ্ন তৈরি করুন */}
              <button
                type="button"
                onClick={() => handleSelectCreationMode('manual')}
                className="group relative flex flex-col items-start p-4 sm:p-5 rounded-2xl border-2 border-blue-200 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50 text-left transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    শিক্ষক ও অভিভাবক
                  </span>
                </div>
                
                <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-700 mb-1.5 transition-colors flex items-center gap-1.5">
                  <span>১. ম্যানুয়াল মোড (ব্যাচ ও স্কিপ)</span>
                </h4>
                
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                  নির্বাচিত অধ্যায়সমূহ থেকে নির্দিষ্ট ব্যাচে (১০/২০/৫০টি) প্রশ্ন আসবে। কোনো প্রশ্ন পছন্দ না হলে "স্কিপ ও পরিবর্তন" করে ওই অধ্যায় থেকেই নতুন প্রশ্ন প্রতিস্থাপন করতে পারবেন।
                </p>

                <div className="mt-auto w-full pt-3 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  <span>ম্যানুয়াল ব্যাচে প্রশ্ন সাজাতে ক্লিক করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 2: এআই দিয়ে তৈরি করুন */}
              <button
                type="button"
                onClick={() => handleSelectCreationMode('ai')}
                className="group relative flex flex-col items-start p-4 sm:p-5 rounded-2xl border-2 border-amber-200 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 text-left transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    স্বয়ংক্রিয় ও দ্রুত
                  </span>
                </div>
                
                <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-700 mb-1.5 transition-colors flex items-center gap-1.5">
                  <span>২. এআই দিয়ে তৈরি করুন</span>
                </h4>
                
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                  শ্রেণি, বিষয় ও অধ্যায় বাছাই করলেই এআই পাঠ্যবই থেকে দ্রুত মানসম্মত প্রশ্নপত্র সাজিয়ে দেবে (পরে ইচ্ছেমতো এডিটও করা যাবে)।
                </p>

                <div className="mt-auto w-full pt-3 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                  <span>এআই দিয়ে বানাতে ক্লিক করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 3: বিভিন্ন প্রতিষ্ঠান ও সালের প্রশ্ন */}
              <button
                type="button"
                onClick={() => {
                  setShowCreationModeModal(false);
                  setActiveViewMode('institution_papers');
                }}
                className="group relative flex flex-col items-start p-4 sm:p-5 rounded-2xl border-2 border-purple-200 hover:border-purple-600 bg-purple-50/40 hover:bg-purple-50 text-left transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    স্কুল ও বোর্ড প্রশ্ন
                  </span>
                </div>
                
                <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-purple-700 mb-1.5 transition-colors flex items-center gap-1.5">
                  <span>৩. বিভিন্ন প্রতিষ্ঠান ও সালের প্রশ্ন</span>
                </h4>
                
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                  মতিঝিল আইডিয়াল, ভিকারুননিসা, রাজউক কিংবা শিক্ষা বোর্ডের আসল প্রশ্নপত্র ১-ক্লিকেই রেডি করে সন্তানের পরীক্ষা নিন।
                </p>

                <div className="mt-auto w-full pt-3 border-t border-purple-100 flex items-center justify-between text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform">
                  <span>প্রশ্নপত্র দেখতে ক্লিক করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

            </div>

            {/* Footer with discreet Admin Lock button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowCreationModeModal(false);
                  setShowAdminUploadModal(true);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-700 transition-colors cursor-pointer"
                title="কেবলমাত্র অ্যাডমিন এক্সেস"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>অ্যাডমিন প্রশ্ন আপলোড</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCreationModeModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Secure Admin Bulk Question Paper Upload Portal Modal */}
      <AdminPaperBulkUploadModal
        isOpen={showAdminUploadModal}
        onClose={() => setShowAdminUploadModal(false)}
      />

      {/* Parent Account Settings Modal */}
      <ParentSettingsModal
        isOpen={showSettingsModal}
        initialTab={settingsInitialTab}
        onClose={handleCloseSettings}
        onProfileUpdated={(updated) => {
          setCurrentParent(updated);
          showToast('✓ অভিভাবক প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!');
        }}
        onLogoutSuccess={() => {
          if (onNavigateHome) {
            onNavigateHome();
          } else {
            window.location.reload();
          }
        }}
      />

      {/* Feature 1: Zoom Modal for Violation Snapshot Photo Proof */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-rose-200">
                    নকল সতর্কতার সচিত্র প্রমাণ (সতর্কতা #{toBn(selectedSnapshot.strike)})
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    রেকর্ড সময়: {selectedSnapshot.timestamp}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSnapshot(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex flex-col items-center">
              <div className="w-full rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-inner">
                <img
                  src={selectedSnapshot.photo}
                  alt={selectedSnapshot.reason}
                  className="w-full h-auto object-contain max-h-[380px]"
                />
              </div>

              <div className="w-full mt-3.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">সনাক্তকৃত কারণ:</span>
                  <span className="font-bold text-rose-300">{selectedSnapshot.reason}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">প্রমাণ আইডি:</span>
                  <span className="font-mono text-[10px] text-slate-400">{selectedSnapshot.id}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                ফ্রন্ট ক্যামেরা থেকে স্বয়ংক্রিয়ভাবে ধারণকৃত প্রমাণ
              </span>
              <button
                type="button"
                onClick={() => setSelectedSnapshot(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official 2-Column A4 Printable Question Paper Modal (Dual Mode - Classroom & Offline Exam) */}
      {printModalTest && (
        <PrintableQuestionPaperModal
          test={printModalTest}
          onClose={() => setPrintModalTest(null)}
          onLaunchOnlineExam={onOpenTest}
        />
      )}

    </div>
  );
};
