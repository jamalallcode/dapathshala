import React, { useState, useEffect } from 'react';
import { 
  Plus, PlusCircle, Trash2, Copy, Check, Eye, FileText, CheckCircle2, 
  Clock, Shield, AlertTriangle, MessageSquare, ChevronRight, Share2,
  TrendingUp, Award, BookOpen, Sparkles, RefreshCw, Edit3, X,
  Save, AlertCircle, Camera, ExternalLink, HelpCircle, GraduationCap, ArrowRight, ArrowLeft,
  RotateCcw, MessageCircle, Lightbulb, ChevronDown
} from 'lucide-react';
import { AssignedTest, StudentSubmission, ExamQuestion } from '../../types';
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

  // Creation Mode Selection: 'manual' (নিজে প্রশ্ন তৈরি করুন) vs 'ai' (এআই দিয়ে তৈরি করুন)
  const [showCreationModeModal, setShowCreationModeModal] = useState(false);
  const [creationMode, setCreationMode] = useState<'manual' | 'ai'>('manual');

  // Custom exam title input
  const [examTitleInput, setExamTitleInput] = useState('');

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
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  // Load tests on mount and listen to updates
  const loadTests = () => {
    const list = getStoredTests();
    setTests(list);
  };

  useEffect(() => {
    loadTests();

    const handleStorage = () => loadTests();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('dapathshala_tests_updated', handleStorage);
    window.addEventListener('dapathshala_submissions_updated', handleStorage);
    window.addEventListener('dapathshala_notifs_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('dapathshala_tests_updated', handleStorage);
      window.removeEventListener('dapathshala_submissions_updated', handleStorage);
      window.removeEventListener('dapathshala_notifs_updated', handleStorage);
    };
  }, []);

  const [isSyncing, setIsSyncing] = useState(false);

  // Background sync from server: checks if student has submitted any exam
  // so the button flips from "প্রশ্নপত্র দেখুন" to "উত্তরপত্র" automatically
  const runSync = async (notifyUser = false) => {
    try {
      const localTests = getStoredTests();
      const serverTests = await fetchAllTestsFromServer();
      let hasChanges = false;

      const mergedMap = new Map<string, AssignedTest>();
      localTests.forEach(t => {
        const key = String(t.pin || t.id).trim();
        mergedMap.set(key, t);
      });

      const findExistingKey = (pin?: string, id?: string): string | null => {
        for (const [k, v] of mergedMap.entries()) {
          if (pin && v.pin && String(v.pin).trim() === String(pin).trim()) return k;
          if (id && v.id && String(v.id).trim() === String(id).trim()) return k;
          if (pin && v.id && String(v.id).replace('test-', '').trim() === String(pin).trim()) return k;
          if (id && v.pin && String(id).replace('test-', '').trim() === String(v.pin).trim()) return k;
        }
        return null;
      };

      // 1. Process server tests: ONLY update existing tests that belong to this parent!
      // NEVER inject foreign or uncreated tests into the parent's dashboard!
      serverTests.forEach(st => {
        if (!st || (!st.pin && !st.id)) return;
        if (isPinDeleted(st.pin, st.id)) return;
        const existingKey = findExistingKey(st.pin, st.id);
        const local = existingKey ? mergedMap.get(existingKey) : undefined;
        
        // Only if the parent already created this test locally, update its submission status
        if (local && (st.status === 'submitted' || st.status === 'reviewed')) {
          if (local.status !== st.status || local.score !== st.score || local.parentComment !== st.parentComment) {
            mergedMap.set(existingKey!, {
              ...local,
              ...st,
              status: st.status,
              score: st.score ?? local.score,
              questions: (st.questions && st.questions.length > 0) ? st.questions : local.questions,
              proctoringFlags: st.proctoringFlags || local.proctoringFlags
            });
            hasChanges = true;
          }
        }
      });

      // 2. Also check individual pins for any test that may have been submitted directly
      await Promise.all(localTests.map(async (t) => {
        if (isPinDeleted(t.pin, t.id)) return;
        if (t.status === 'pending' || !t.score) {
          let serverData = t.pin ? await fetchSubmissionFromServer(t.pin) : null;
          if (!serverData && t.id) {
            serverData = await fetchSubmissionFromServer(t.id);
          }
          if (!serverData && t.pin) {
            serverData = await fetchTestFromServer(t.pin);
          }
          if (!serverData && t.id) {
            serverData = await fetchTestFromServer(t.id);
          }
          if (serverData && (serverData.status === 'submitted' || serverData.status === 'reviewed')) {
            const existingKey = findExistingKey(t.pin, t.id) || String(t.pin || t.id).trim();
            const existing = mergedMap.get(existingKey) || t;
            mergedMap.set(existingKey, {
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

  // When subject changes, set default chapter
  const handleSubjectChange = (sub: string) => {
    setSelectedSubject(sub);
    const chaps = subjectChapters[sub] || ['সাধারণ অধ্যায়'];
    setSelectedChapter(chaps[0]);
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
      const newFromBank = getAlternativeQuestion(selectedSubject, selectedChapter, existingTexts);
      const correctIdx = newFromBank.options.findIndex(o => o === newFromBank.correctAnswer);

      const newQ: ExamQuestion = {
        id: `ai_q_${Date.now()}_${nextNum}`,
        question: newFromBank.question,
        options: [...newFromBank.options],
        correctAnswer: newFromBank.correctAnswer,
        correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
        explanation: newFromBank.explanation || '',
        solutions: newFromBank.solutions || generateTwoSolutions(newFromBank.question, newFromBank.options, newFromBank.correctAnswer, newFromBank.explanation)
      };

      setGeneratedQuestions(prev => [...prev, newQ]);
      showToast(`✓ প্রশ্ন নম্বর ${toBn(nextNum)} এআই দ্বারা যুক্ত হয়েছে!`);
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

  // Select creation mode from modal (১. নিজে প্রশ্ন তৈরি করুন / ২. এআই দিয়ে তৈরি করুন)
  const handleSelectCreationMode = (mode: 'manual' | 'ai') => {
    setCreationMode(mode);
    setIsFinalized(false);
    setCreatedTestResult(null);

    if (mode === 'manual') {
      // 1. নিজে প্রশ্ন তৈরি করুন: শুরু হবে ১টি সম্পূর্ণ খালি প্রশ্ন তৈরির ফরম্যাট দিয়ে
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
      setExamTitleInput(`${selectedClass} - ${selectedSubject}: ${selectedChapter} মূল্যায়ন`);
      showToast('✍️ নিজে প্রশ্ন তৈরির ফরম্যাট সক্রিয় হয়েছে! আপনার প্রশ্ন ও অপশন লিখুন।');
    } else {
      // 2. এআই দিয়ে তৈরি করুন: স্বয়ংক্রিয়ভাবে কারিকুলাম ও অধ্যায় অনুযায়ী প্রশ্ন লোড হবে
      const questions = getQuestionsForChapter(selectedSubject, selectedChapter, questionCount);
      const mapped: ExamQuestion[] = questions.map((q, idx) => {
        const correctIdx = q.options.findIndex(o => o === q.correctAnswer);
        return {
          id: q.id || `ai_q_${Date.now()}_${idx}`,
          question: q.question,
          options: [...q.options],
          correctAnswer: q.correctAnswer,
          correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
          explanation: q.explanation || '',
          solutions: q.solutions || generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation)
        };
      });
      setGeneratedQuestions(mapped);
      setExamTitleInput(`${selectedClass} - ${selectedSubject}: ${selectedChapter} মূল্যায়ন`);
    }

    setActiveViewMode('builder');
    setShowCreationModeModal(false);
  };

  // Generate / Regenerate with AI
  const handleGenerateWithAI = () => {
    const questions = getQuestionsForChapter(selectedSubject, selectedChapter, questionCount);
    const mapped: ExamQuestion[] = questions.map((q, idx) => {
      const correctIdx = q.options.findIndex(o => o === q.correctAnswer);
      return {
        id: q.id || `ai_q_${Date.now()}_${idx}`,
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
        explanation: q.explanation || '',
        solutions: q.solutions || generateTwoSolutions(q.question, q.options, q.correctAnswer, q.explanation)
      };
    });
    setGeneratedQuestions(mapped);
    showToast(`✨ এআই পাঠ্যবই অনুযায়ী ${toBn(mapped.length)}টি প্রশ্ন প্রস্তুত করেছে!`);
  };

  // Skip / Replace question with alternative from question bank
  const handleSkipQuestion = (index: number) => {
    const currentOnScreen = generatedQuestions.map(q => q.question);
    const previousQuestionText = currentOnScreen[index];
    const allExcluded = Array.from(new Set([...currentOnScreen, ...seenQuestionTexts]));
    const replacement = getAlternativeQuestion(selectedSubject, selectedChapter, allExcluded);
    const correctIdx = replacement.options.findIndex(o => o === replacement.correctAnswer);
    const updated = [...generatedQuestions];
    updated[index] = {
      id: replacement.id || `alt_${Date.now()}_${index}`,
      question: replacement.question,
      options: [...replacement.options],
      correctAnswer: replacement.correctAnswer,
      correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
      explanation: replacement.explanation || '',
      solutions: replacement.solutions || generateTwoSolutions(replacement.question, replacement.options, replacement.correctAnswer, replacement.explanation)
    };
    setGeneratedQuestions(updated);
    setSeenQuestionTexts(prev => Array.from(new Set([...prev, replacement.question, previousQuestionText])));
    showToast(`✓ প্রশ্ন নম্বর ${toBn(index + 1)} এর পরিবর্তে বিকল্প প্রশ্ন আনা হয়েছে!`);
  };



  // Clear all previous / demo tests completely - opens clean in-app confirmation modal
  const handleClearAllTests = () => {
    setShowClearConfirmModal(true);
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
    const finalTitle = examTitleInput.trim() || `${selectedClass} - ${selectedSubject}: ${selectedChapter} পরীক্ষা`;
    const newTest: AssignedTest = {
      id: `test-${Date.now()}`,
      title: finalTitle,
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
    syncTestToServer(newTest);
    setCreatedTestResult(newTest);
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
  const handleConfirmDeleteTest = async () => {
    if (!testToDelete) return;
    const { id, pin } = testToDelete;

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

  // Only count tests pending evaluation so the badge count decreases upon review
  const pendingReviewCount = tests.filter(t => t.status === 'submitted').length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4">
      
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
      {/* VIEW 1: DUAL-MODE BUILDER: MANUAL OR AI                  */}
      {/* ======================================================== */}
      {activeViewMode === 'builder' && (
        <div className="space-y-6">
          
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
          </div>

          {/* Section A: Exam Basic Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  creationMode === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {creationMode === 'manual' ? <Edit3 className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    {creationMode === 'manual' 
                      ? '১. নিজে প্রশ্ন তৈরি করুন (ম্যানুয়াল পদ্ধতি)' 
                      : '২. এআই দিয়ে তৈরি করুন (স্বয়ংক্রিয় এআই পদ্ধতি)'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {creationMode === 'manual'
                      ? 'নিজে হাতে প্রশ্ন ও অপশন লিখুন এবং সঠিক উত্তর চিহ্নিত করে পরীক্ষা প্রস্তুত করুন।'
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

            <div className={`grid grid-cols-1 sm:grid-cols-2 ${creationMode === 'ai' ? 'lg:grid-cols-4' : 'lg:grid-cols-4'} gap-4`}>
              
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
                  অধ্যায় / টপিক:
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

              {/* Duration in Minutes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  পরীক্ষার সময়:
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>৫ মিনিট</option>
                  <option value={10}>১০ মিনিট</option>
                  <option value={15}>১৫ মিনিট</option>
                  <option value={20}>২০ মিনিট</option>
                  <option value={30}>৩০ মিনিট</option>
                  <option value={45}>৪৫ মিনিট</option>
                  <option value={60}>৬০ মিনিট</option>
                </select>
              </div>

            </div>

            {/* AI Specific: Question Count & Reload Button */}
            {creationMode === 'ai' && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">এআই প্রশ্নের সংখ্যা:</span>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={5}>৫টি প্রশ্ন</option>
                    <option value={10}>১০টি প্রশ্ন</option>
                    <option value={15}>১৫টি প্রশ্ন</option>
                    <option value={20}>২০টি প্রশ্ন</option>
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

            {/* Anti-Cheating Proctoring Toggle & Info Banner */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
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

              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                <span>{creationMode === 'manual' ? '✍️ ম্যানুয়াল মোড সক্রিয়' : '✨ এআই মোড সক্রিয়'}</span>
              </div>
            </div>
          </div>

          {/* Section B: Question Authoring / Review Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
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

            {/* Questions List */}
            <div className="space-y-4">
              {(generatedQuestions || []).map((q, qIndex) => {
                return (
                  <div 
                    key={q.id || `q_${qIndex}`}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-100 border border-slate-200/90 shadow-xs hover:-translate-y-1.5 hover:shadow-xl hover:shadow-slate-300/80 hover:border-blue-300/80 hover:bg-slate-50/95 transition-all duration-300 ease-out space-y-3 group cursor-default"
                  >
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

                      {/* Header Actions: Alternative Question (Only for AI Mode) and Delete */}
                      <div className="flex items-center justify-end gap-1.5 shrink-0 pl-10 sm:pl-0">
                        {creationMode === 'ai' && (
                          <button
                            type="button"
                            onClick={() => handleSkipQuestion(qIndex)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-slate-200 text-amber-800 text-xs font-bold transition-all border border-amber-300/70 cursor-pointer"
                            title="এই প্রশ্নটি পরিবর্তন করতে চাইলে বিকল্প প্রশ্ন আনুন"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                            <span>বিকল্প প্রশ্ন</span>
                          </button>
                        )}

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

                    {/* 2. 4 Clean Options (Left column strictly aligned with Question Number, no 'সঠিক' / 'টিক দিন' labels) */}
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
                            {/* Tick / Letter Circle Button - exactly w-8 h-8 matching question serial badge */}
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

                    {/* 3. Collapsible Detailed Solutions Section (At least 2 methods, hidden by default, not visible to student during exam) */}
                    <div className="pt-2 border-t border-slate-200/70 mt-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
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
                        <span className="text-[11px] text-slate-500 font-medium italic">
                          (সন্তান পরীক্ষার সময় কোনো সমাধান দেখতে পাবে না)
                        </span>
                      </div>

                      {/* Expanded Solution Content */}
                      {expandedSolutions[qIndex] && (
                        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-1 text-xs leading-relaxed text-slate-800">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                            <span className="font-black text-slate-900 flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <span>অংকের গাণিতিক সমাধান ও বিকল্প পদ্ধতিসমূহ:</span>
                            </span>
                            {q.correctAnswer && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                সঠিক উত্তর: {q.correctAnswer}
                              </span>
                            )}
                          </div>

                          {/* Render the 2+ methods */}
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
                                      <div className="pl-6.5 text-slate-700 whitespace-pre-line font-medium leading-relaxed">
                                        {sol}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
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

              <button
                type="button"
                onClick={handleFinalizeExam}
                className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 ${
                  isFinalized
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/80 ring-2 ring-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-200/80'
                }`}
              >
                {isFinalized ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3] text-emerald-100" />
                    <span>✓ প্রশ্নপত্র সংরক্ষিত! লিংক প্রস্তুত</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    <span>প্রশ্নপত্র চূড়ান্ত করুন ও ৬-সংখ্যার পিন লিংক পান</span>
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
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                অভিভাবকের নির্ধারিত পরীক্ষাসমূহ ও খাতা
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                সন্তানের জন্য আপনার তৈরি করা পরীক্ষাসমূহ এবং জমা দেওয়া উত্তরপত্র
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

              <button
                type="button"
                onClick={() => setShowCreationModeModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="নতুন পরীক্ষা বা প্রশ্নপত্র তৈরি করুন"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন পরীক্ষা তৈরি করুন</span>
              </button>

              {tests.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllTests}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="সকল ডামি ও পূর্ববর্তী পরীক্ষা মুছে সম্পূর্ণ ফ্রেশ ড্যাশবোর্ড করুন"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>সকল পরীক্ষা মুছুন</span>
                </button>
              )}
            </div>
          </div>

          {tests.length === 0 ? (
            <div className="py-7 sm:py-9 text-center bg-slate-50/70 rounded-3xl border border-dashed border-slate-300 px-4 sm:px-6">
              <div className="w-13 h-13 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 mb-1">
                এখনও কোনো পরীক্ষা তৈরি করা হয়নি
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4 font-medium leading-relaxed">
                আপনার সন্তানের জন্য নতুন পরীক্ষা তৈরি করতে নিচের বাটনে ক্লিক করুন। আপনি চাইলে নিজে প্রশ্ন লিখতে পারেন অথবা এআই দিয়ে স্বয়ংক্রিয়ভাবে তৈরি করতে পারেন।
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
          ) : (
            <div className="space-y-3.5">
              {(tests || []).map(test => {
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
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs sm:text-sm font-black shadow-md shadow-amber-500/30 transition-all cursor-pointer ring-2 ring-amber-400 ring-offset-1 animate-pulse"
                          title="সন্তান পরীক্ষা দিয়েছে! উত্তরপত্র দেখতে ও মূল্যায়ন করতে ক্লিক করুন"
                        >
                          <FileText className="w-4 h-4" />
                          <span>উত্তরপত্র</span>
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
                          <span>উত্তরপত্রটি দেখা হয়েছে</span>
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
                    {(reviewTest.proctoringFlags || []).map((flag, fIdx) => (
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
              {(reviewTest.questions || []).length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl">
                  কোনো প্রশ্ন পাওয়া যায়নি।
                </div>
              ) : (
                (reviewTest.questions || []).map((q, idx) => {
                  const isCorrect = q.studentAnswer === q.correctAnswer;
                  return (
                    <div key={q.id || `rq_${idx}`} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
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
      {/* MODAL 3B: CLEAR ALL TESTS CONFIRMATION                   */}
      {/* ======================================================== */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  সকল পরীক্ষা ও খাতা মুছে ফেলবেন?
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  এই কাজটি স্থায়ী এবং আর ফিরিয়ে আনা যাবে না
                </p>
              </div>
            </div>

            <p className="text-xs text-rose-700 bg-rose-50 p-3.5 rounded-2xl border border-rose-200 leading-relaxed font-medium">
              ⚠️ সতর্কতা: এটি নিশ্চিত করলে আপনার তৈরি করা সমস্ত প্রশ্নপত্র, শিক্ষার্থীর জমা দেওয়া উত্তরপত্র এবং সুপাবেজ ক্লাউড ডাটাবেজের সকল রেকর্ড সম্পূর্ণ মুছে ফ্রেশ ও খালি ড্যাশবোর্ড হয়ে যাবে।
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isClearingAll}
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isClearingAll}
                onClick={async () => {
                  setIsClearingAll(true);
                  try {
                    setTests([]);
                    await clearAllStoredTests();
                    setShowClearConfirmModal(false);
                    showToast('🗑️ সকল পরীক্ষা ও ক্লাউড ডাটাবেজ সম্পূর্ণ মুছে ফেলা হয়েছে।');
                  } finally {
                    setIsClearingAll(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                {isClearingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>মুছে ফেলা হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>হ্যাঁ, সম্পূর্ণ মুছে ফেলুন</span>
                  </>
                )}
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
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-6 relative animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <PlusCircle className="w-6 h-6" />
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

            {/* Two Choices - Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option 1: নিজে প্রশ্ন তৈরি করুন */}
              <button
                type="button"
                onClick={() => handleSelectCreationMode('manual')}
                className="group relative flex flex-col items-start p-5 rounded-2xl border-2 border-blue-200 hover:border-blue-600 bg-blue-50/40 hover:bg-blue-50 text-left transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    অভিভাবকের পছন্দ
                  </span>
                </div>
                
                <h4 className="text-base font-black text-slate-900 group-hover:text-blue-700 mb-1.5 transition-colors flex items-center gap-1.5">
                  <span>১. নিজে প্রশ্ন তৈরি করুন</span>
                </h4>
                
                <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                  কোনো অটোমেটিক প্রশ্ন থাকবে না। অভিভাবক নিজের হাতে প্রশ্ন ও ৪টি অপশন লিখে সঠিক উত্তর নির্ধারণ করবেন।
                </p>

                <div className="mt-auto w-full pt-3 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:translate-x-0.5 transition-transform">
                  <span>নিজে প্রশ্ন লিখতে ক্লিক করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 2: এআই দিয়ে তৈরি করুন */}
              <button
                type="button"
                onClick={() => handleSelectCreationMode('ai')}
                className="group relative flex flex-col items-start p-5 rounded-2xl border-2 border-amber-200 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50 text-left transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    স্বয়ংক্রিয় ও দ্রুত
                  </span>
                </div>
                
                <h4 className="text-base font-black text-slate-900 group-hover:text-amber-700 mb-1.5 transition-colors flex items-center gap-1.5">
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

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
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

    </div>
  );
};
