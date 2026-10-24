import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Shield, 
  Calendar, 
  ChevronRight, 
  ChevronDown,
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3,
  FileCheck,
  Send,
  Printer,
  Sparkles,
  Lock,
  Unlock,
  Award,
  Trophy,
  BookOpen,
  Check,
  Edit3,
  Trash2,
  Plus,
  Eye,
  Link2,
  Copy,
  Save,
  X,
  FileText,
  Share2,
  RotateCcw,
  Loader2,
  HelpCircle,
  CheckCheck,
  ArrowLeft,
  MessageSquare,
  ExternalLink,
  ShieldAlert,
  Flag,
  Bell,
  Radio,
  Camera,
  Columns,
  LayoutList,
  Grid,
  Minus,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { getGeminiApiKey } from '../../lib/gemini';
import { CURRICULUM_DATA } from '../../lib/curriculumData';
import { 
  saveSharedLiveExam, 
  getSharedLiveExam, 
  savePublishedMarksheet,
  getPublishedMarksheet,
  SharedLiveExam, 
  getSubjectCode, 
  getChapterIndex,
  generateShortExamId,
  generateExamPin,
  buildCleanExamUrl
} from '../../lib/liveExamStorage';
import { getQuestionsForChapter } from '../../lib/curriculumQuestions';
import { ApiKeyModal } from '../../components/ApiKeyModal';
import { 
  getProctoringLogs, 
  fetchSupabaseProctoringLogs,
  subscribeToProctoringAlerts, 
  recordProctoringViolation, 
  markProctoringLogsAsRead, 
  ProctoringLogEntry,
  subscribeToExamSubmissions,
  ExamSubmissionPayload
} from '../../lib/proctoringService';
import { Question } from '../../types';

export interface ParentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  explanation?: string;
}

const STORAGE_TESTS_KEY = 'dapathshala_parent_assigned_tests';

export const ParentDashboard: React.FC = () => {
  const [activeChild, setActiveChild] = useState('child_1');
  const [activeTab, setActiveTab] = useState<'overview' | 'assign' | 'review' | 'report' | 'proctoring'>('review');
  
  // Controls state
  const [studyModeLock, setStudyModeLock] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(4); // hours
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Real-time Proctoring & Anti-Cheating States
  const [proctoringLogs, setProctoringLogs] = useState<ProctoringLogEntry[]>(() => getProctoringLogs());
  const [realtimeAlert, setRealtimeAlert] = useState<ProctoringLogEntry | null>(null);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState<boolean>(() => {
    return getProctoringLogs().some(l => !l.isRead);
  });

  // Real-time Exam Submission & Dual Evaluation Mode States
  const [newSubmissionAlert, setNewSubmissionAlert] = useState<ExamSubmissionPayload | null>(null);
  const [evaluationModalTest, setEvaluationModalTest] = useState<any | null>(null);
  const [evaluationMode, setEvaluationMode] = useState<'ai' | 'manual'>('ai');
  const [manualGrades, setManualGrades] = useState<Record<string, { marks: number; comment: string }>>({});
  const [manualParentFeedback, setManualParentFeedback] = useState<string>('');
  const [isAIEvaluating, setIsAIEvaluating] = useState(false);
  const [aiEvaluationDone, setAiEvaluationDone] = useState(false);
  const [expandedScriptImage, setExpandedScriptImage] = useState<string | null>(null);

  // Assign Test form state (Defaulting accurately to Bangla - অপরিচিতা)
  const [assignForm, setAssignForm] = useState({
    subject: 'বাংলা',
    chapter: 'অপরিচিতা (গল্প - রবীন্দ্রনাথ ঠাকুর)',
    duration: 30,
    mcqCount: 15,
    creativeCount: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    marksPerQuestion: 1
  });

  const [customCountInput, setCustomCountInput] = useState<string>('15');
  const [showCountError, setShowCountError] = useState<boolean>(false);
  const [editorColumns, setEditorColumns] = useState<1 | 2>(2); // Default 2 columns as requested
  const [evalViewColumns, setEvalViewColumns] = useState<2 | 3>(3); // Multi-column high-density question viewer (2 or 3 columns)

  const handleSetQuestionCount = (val: number | string) => {
    let cleanVal = typeof val === 'string' ? parseInt(val, 10) : val;
    if (isNaN(cleanVal) || cleanVal < 1) {
      cleanVal = 1;
    }
    if (cleanVal > 100) {
      cleanVal = 100;
      setShowCountError(true);
      setTimeout(() => setShowCountError(false), 4000);
    } else {
      setShowCountError(false);
    }

    // Auto-adjust suggested duration based on question count
    let recommendedDuration = 30;
    if (cleanVal <= 5) recommendedDuration = 10;
    else if (cleanVal <= 10) recommendedDuration = 15;
    else if (cleanVal <= 15) recommendedDuration = 20;
    else if (cleanVal <= 25) recommendedDuration = 30;
    else if (cleanVal <= 35) recommendedDuration = 40;
    else if (cleanVal <= 50) recommendedDuration = 60;
    else if (cleanVal <= 75) recommendedDuration = 90;
    else recommendedDuration = 120;

    setAssignForm(prev => ({
      ...prev,
      mcqCount: cleanVal,
      duration: recommendedDuration
    }));
    setCustomCountInput(String(cleanVal));
  };

  const [showChapterDropdown, setShowChapterDropdown] = useState(false);

  // Editor and Workflow State
  const [assignStep, setAssignStep] = useState<'config' | 'editor'>('config');
  const [questions, setQuestions] = useState<ParentQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Add Question Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState<ParentQuestion>({
    id: '',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1,
    explanation: ''
  });

  // Preview Modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPaperData, setPreviewPaperData] = useState<{
    title: string;
    subject: string;
    chapter: string;
    duration: number;
    questions: ParentQuestion[];
  } | null>(null);
  const [copiedTestId, setCopiedTestId] = useState<string | null>(null);

  // Generate Link Modal state
  const [shareLinkModalData, setShareLinkModalData] = useState<{
    examId: string;
    url: string;
    title: string;
    subject: string;
    chapter: string;
    duration: number;
    totalMarks: number;
    questionCount: number;
  } | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // Mock Children
  const children = [
    { id: 'child_1', name: 'আরাফাত রহমান', grade: '৮ম শ্রেণী', roll: '০৪', avatar: 'https://picsum.photos/seed/child1/100' },
    { id: 'child_2', name: 'সুমাইয়া বিনতে', grade: '৫ম শ্রেণী', roll: '১২', avatar: 'https://picsum.photos/seed/child2/100' }
  ];

  const currentChild = children.find(c => c.id === activeChild) || children[0];

  const stats = [
    { label: 'আজকের পড়ার সময়', value: '৩.৫ ঘণ্টা', icon: <Clock className="text-blue-600" />, trend: '+১২%' },
    { label: 'কুইজ স্কোর (গড়)', value: '৮৫%', icon: <Target className="text-emerald-600" />, trend: '+৫%' },
    { label: 'অর্জিত পয়েন্ট', value: '১২৫০ XP', icon: <TrendingUp className="text-amber-600" />, trend: '+১৫০' },
  ];

  const recentActivities = [
    { id: 1, task: 'সালোকসংশ্লেষণ কুইজ সম্পন্ন করেছে (স্কোর: ৯/১০)', time: '১০ মিনিট আগে', status: 'success' },
    { id: 2, task: 'গণিত অধ্যায় ৫ সমাধান ও রিভিশন সম্পন্ন', time: '১ ঘণ্টা আগে', status: 'success' },
    { id: 3, task: 'ইংরেজি গ্রামার রাইট ফর্ম অফ ভার্বস স্টাডি', time: '২ ঘণ্টা আগে', status: 'pending' },
  ];



  // Default assigned tests with initial submitted test matching screenshots
  const DEFAULT_ASSIGNED_TESTS: any[] = [
    {
      id: 'test-101',
      examId: 'test-101',
      pin: '482910',
      title: 'গণিত সাপ্তাহিক মূল্যায়ন',
      subject: 'গণিত',
      chapter: 'বীজগণিত ও সমীকরণ',
      duration: 30,
      totalMarks: 5,
      childId: 'child_1',
      studentName: 'আরাফাত রহমান',
      status: 'submitted',
      isSubmitted: true,
      isViewed: false, // Initially false so button is bright; once viewed, turns dim/muted!
      submittedAt: 'আজ, সন্ধ্যা ৭:০৫',
      score: 4,
      evaluationMode: 'ai',
      answers: {
        'q_1': 0,
        'q_2': 1,
        'q_3': 0,
        'q_4': 0,
        'q_5': 0
      },
      questions: [
        {
          id: 'q_1',
          question: '(a + b)² এর সঠিক সম্প্রসারিত রূপ কোনটি?',
          text: '(a + b)² এর সঠিক সম্প্রসারিত রূপ কোনটি?',
          options: ['a² + 2ab + b²', 'a² - 2ab + b²', 'a² + b²', 'a² + ab + b²'],
          correctAnswer: 0,
          marks: 1,
          explanation: 'বর্গের সম্প্রসারণ সূত্র: (a + b)² = a² + 2ab + b²'
        },
        {
          id: 'q_2',
          question: 'যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?',
          text: 'যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?',
          options: ['16', '14', '18', '12'],
          correctAnswer: 1,
          marks: 1,
          explanation: 'x² + 1/x² = (x + 1/x)² - 2 = 16 - 2 = 14'
        },
        {
          id: 'q_3',
          question: 'একটি দ্বিঘাত সমীকরণের সর্বোচ্চ ঘাত কত?',
          text: 'একটি দ্বিঘাত সমীকরণের সর্বোচ্চ ঘাত কত?',
          options: ['১', '২', '৩', '৪'],
          correctAnswer: 1,
          marks: 1,
          explanation: 'দ্বিঘাত সমীকরণে চলের সর্বোচ্চ ঘাত সর্বদা ২ হয়।'
        },
        {
          id: 'q_4',
          question: 'দুটি পরস্পর পূরক কোণের সমষ্টি কত?',
          text: 'দুটি পরস্পর পূরক কোণের সমষ্টি কত?',
          options: ['৯০°', '১৮০°', '৩৬০°', '৪৫°'],
          correctAnswer: 0,
          marks: 1,
          explanation: 'দুটি কোণের সমষ্টি ৯০° হলে তাদেরকে পরস্পরের পূরক কোণ বলা হয়।'
        },
        {
          id: 'q_5',
          question: 'বৃত্তের পরিধি ও ব্যাসের অনুপাতকে কী বলে?',
          text: 'বৃত্তের পরিধি ও ব্যাসের অনুপাতকে কী বলে?',
          options: ['π (পাই)', 'θ (থিটা)', 'ব্যাসার্ধ', 'জ্যা'],
          correctAnswer: 0,
          marks: 1,
          explanation: 'বৃত্তের পরিধি ও ব্যাসের অনুপাত সর্বদা নির্দিষ্ট ধ্রুবক π (পাই)।'
        }
      ]
    }
  ];

  // Sanitizer helper to guarantee assignedTests is never corrupted
  const sanitizeTestsList = (raw: any): any[] => {
    if (!raw || !Array.isArray(raw)) return [];
    return raw
      .filter((item: any) => item && typeof item === 'object')
      .map((test: any, index: number) => {
        const id = String(test.id || test.examId || `test_${index}_${Date.now()}`);
        const title = typeof test.title === 'string' && test.title.trim() ? test.title : 'কাস্টম মূল্যায়ন পরীক্ষা';
        const subject = typeof test.subject === 'string' && test.subject.trim() ? test.subject : 'সাধারণ';
        const chapter = typeof test.chapter === 'string' && test.chapter.trim() ? test.chapter : 'অধ্যায় মূল্যায়ন';
        
        // Clean violations to be safe string array
        let safeViolations: string[] = [];
        if (Array.isArray(test.violations)) {
          safeViolations = test.violations.map((v: any) => 
            typeof v === 'string' ? v : (v?.violationDetails || v?.message || 'সন্দেহজনক কার্যকলাপ রেকর্ড')
          );
        } else if (typeof test.violations === 'string' && test.violations.trim()) {
          safeViolations = [test.violations];
        }

        // Clean handwrittenImages: only retain genuine uploaded images, purge any mock placeholders
        let safeImages: string[] = [];
        if (Array.isArray(test.handwrittenImages)) {
          safeImages = test.handwrittenImages.filter((img: any) => 
            typeof img === 'string' && img.trim() && !img.includes('image_fb59e449') && !img.includes('picsum.photos')
          );
        } else if (typeof test.handwrittenImages === 'string' && test.handwrittenImages.trim() && !test.handwrittenImages.includes('image_fb59e449') && !test.handwrittenImages.includes('picsum.photos')) {
          safeImages = [test.handwrittenImages];
        }

        return {
          ...test,
          id,
          title,
          subject,
          chapter,
          violations: safeViolations,
          handwrittenImages: safeImages,
          duration: Number(test.duration) || 30
        };
      });
  };

  // Assigned Tests with LocalStorage persistence and safety sanitization
  const [assignedTests, setAssignedTests] = useState<any[]>(() => {
    try {
      const wasCleared = localStorage.getItem('dapathshala_parent_tests_cleared');
      if (wasCleared === 'true') {
        return [];
      }
      const saved = localStorage.getItem(STORAGE_TESTS_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return sanitizeTestsList(parsed);
        }
      }
    } catch (e) {
      console.warn('Error loading tests from storage, using defaults:', e);
    }
    return DEFAULT_ASSIGNED_TESTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TESTS_KEY, JSON.stringify(assignedTests));
      if (assignedTests.length === 0) {
        localStorage.setItem('dapathshala_parent_tests_cleared', 'true');
      } else {
        localStorage.removeItem('dapathshala_parent_tests_cleared');
      }
    } catch (err) {
      console.warn('Failed to persist assigned tests:', err);
    }
  }, [assignedTests]);

  // Per-test parent comment inputs map: { [testId]: string }
  const [parentCommentInputs, setParentCommentInputs] = useState<Record<string, string>>({});

  // Play alert audio chime
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Audio chime note:', e);
    }
  };

  // High quality curriculum questions generator matching exact subject and chapter
  const generateCurriculumFallback = (subject: string, chapter: string, count: number): ParentQuestion[] => {
    return getQuestionsForChapter(subject, chapter, count, assignForm.marksPerQuestion || 1);
  };

  // AI Question Generation Handler (Supports 1 to 100 questions)
  const handleGenerateAIQuestions = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    const targetCount = Math.max(1, Math.min(100, assignForm.mcqCount || 15));
    const apiKey = getGeminiApiKey();

    const isEnglish = assignForm.subject === 'ইংরেজি' || assignForm.subject?.toLowerCase() === 'english';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const requestCount = Math.min(targetCount, 25); // Fast, high-quality prompt batch
        const prompt = isEnglish
          ? `You are an expert English language teacher for Class ${currentChild.grade}. Generate exactly ${requestCount} high-quality Multiple Choice Questions (MCQ) for Class ${currentChild.grade} student strictly about "${assignForm.chapter}" in English Grammar/Language.
Difficulty: ${assignForm.difficulty}.
CRITICAL LANGUAGE REQUIREMENT: All questions and all 4 options MUST strictly be written in English.
Return a JSON array of objects with schema:
id (string), question (string in English), options (array of 4 English strings), correctAnswer (one of the options string), explanation (short explanation).`
          : `You are a curriculum expert Bengali school teacher. Generate exactly ${requestCount} high-quality Multiple Choice Questions (MCQ) for Class ${currentChild.grade} student about "${assignForm.chapter}" in subject "${assignForm.subject}".
Difficulty: ${assignForm.difficulty}.
All text MUST strictly be in Bengali (বাংলা).
Return a JSON array of objects with schema:
id (string), question (string in Bengali), options (array of 4 Bengali strings), correctAnswer (one of the options string), explanation (short explanation in Bengali).`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ['id', 'question', 'options', 'correctAnswer', 'explanation']
              }
            }
          }
        });

        if (response.text) {
          const clean = response.text.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(clean);
          if (Array.isArray(parsed) && parsed.length > 0) {
            let formatted: ParentQuestion[] = parsed.map((item, index) => ({
              id: item.id || 'pq_' + Date.now() + '_' + index,
              question: item.question,
              options: Array.isArray(item.options) && item.options.length === 4 ? item.options : ['ক', 'খ', 'গ', 'ঘ'],
              correctAnswer: item.correctAnswer || item.options[0],
              marks: assignForm.marksPerQuestion || 1,
              explanation: item.explanation || ''
            }));

            // If user requested more than 25 (up to 100), supplement remaining from curriculum bank
            if (formatted.length < targetCount) {
              const needed = targetCount - formatted.length;
              const extra = generateCurriculumFallback(assignForm.subject, assignForm.chapter, needed);
              formatted = [...formatted, ...extra.map((q, idx) => ({ ...q, id: `pq_extra_${Date.now()}_${idx}` }))];
            }

            setQuestions(formatted.slice(0, targetCount));
            setAssignStep('editor');
            setIsGenerating(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn('Gemini generation bypassed/offline, using curriculum seeds:', err);
      }
    }

    // High quality resilient fallback (guarantees up to 100 questions instantaneously)
    const fallback = generateCurriculumFallback(assignForm.subject, assignForm.chapter, targetCount);
    setQuestions(fallback.slice(0, targetCount));
    setAssignStep('editor');
    setIsGenerating(false);
  };

  // Start manual question creation
  const handleStartManualQuestion = () => {
    const initialQ: ParentQuestion = {
      id: 'pq_' + Date.now(),
      question: `${assignForm.chapter} সম্পর্কিত প্রথম প্রশ্নটি এখানে লিখুন...`,
      options: ['অপশন ১', 'অপশন ২', 'অপশন ৩', 'অপশন ৪'],
      correctAnswer: 'অপশন ১',
      marks: assignForm.marksPerQuestion || 1,
      explanation: 'ব্যাখ্যা এখানে যোগ করতে পারেন।'
    };
    setQuestions([initialQ]);
    setAssignStep('editor');
  };

  // Question Editor Handlers
  const handleUpdateQuestion = (id: string, updated: Partial<ParentQuestion>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updated } : q));
  };

  const handleUpdateOption = (qId: string, optIndex: number, newText: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const oldOptText = q.options[optIndex];
        const newOptions = [...q.options];
        newOptions[optIndex] = newText;
        const newCorrect = q.correctAnswer === oldOptText ? newText : q.correctAnswer;
        return { ...q, options: newOptions, correctAnswer: newCorrect };
      }
      return q;
    }));
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 1) {
      alert('পরীক্ষায় কমপক্ষে ১টি প্রশ্ন থাকতে হবে।');
      return;
    }
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Add Question Modal Handlers
  const handleOpenAddQuestion = () => {
    setNewQuestionForm({
      id: 'pq_' + Date.now(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      marks: 1,
      explanation: ''
    });
    setShowAddModal(true);
  };

  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.question.trim()) {
      alert('অনুগ্রহ করে প্রশ্নের বিবরণ লিখুন।');
      return;
    }
    const filledOptions = newQuestionForm.options.map((opt, i) => opt.trim() || `অপশন ${i + 1}`);
    const correct = newQuestionForm.correctAnswer.trim() || filledOptions[0];

    const added: ParentQuestion = {
      id: 'pq_' + Date.now(),
      question: newQuestionForm.question.trim(),
      options: filledOptions,
      correctAnswer: correct,
      marks: Number(newQuestionForm.marks) || 1,
      explanation: newQuestionForm.explanation?.trim() || ''
    };

    setQuestions(prev => [...prev, added]);
    setShowAddModal(false);
  };

  // Send to Student Action
  const handleSendToStudent = () => {
    if (questions.length === 0) {
      alert('অনুগ্রহ করে কমপক্ষে ১টি প্রশ্ন যোগ করুন।');
      return;
    }

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const examId = generateShortExamId(assignForm.subject, assignForm.chapter, questions.length);
    const pin = generateExamPin();

    const formattedQuestions: Question[] = questions.map((q, idx) => {
      const correctIdx = q.options.findIndex(opt => opt.trim() === q.correctAnswer.trim());
      return {
        id: q.id || `q_${idx + 1}`,
        text: q.question,
        options: q.options,
        correctAnswer: correctIdx >= 0 ? correctIdx : 0,
        explanation: q.explanation
      };
    });

    const liveExam: SharedLiveExam = {
      id: examId,
      pin,
      title: `${assignForm.subject}: ${assignForm.chapter} কাস্টম মূল্যায়ন`,
      subject: assignForm.subject,
      chapter: assignForm.chapter,
      duration: assignForm.duration || 30,
      totalMarks,
      childName: currentChild.name,
      parentName: 'অভিভাবক',
      createdAt: Date.now(),
      questions: formattedQuestions
    };
    saveSharedLiveExam(liveExam);

    const newTest = {
      id: examId,
      examId,
      pin,
      title: `${assignForm.subject}: ${assignForm.chapter} কাস্টম মূল্যায়ন`,
      subject: assignForm.subject,
      chapter: assignForm.chapter,
      questions: formattedQuestions,
      questionsList: questions,
      duration: assignForm.duration,
      totalMarks,
      status: 'pending',
      score: null,
      submittedAt: null,
      aiFeedback: null,
      parentComment: null,
      handwrittenImages: []
    };

    setAssignedTests([newTest, ...assignedTests.filter(t => t.id !== examId)]);
    setShowPreviewModal(false);
    setAlertSuccess(`"${currentChild.name}" এর ড্যাশবোর্ডে ${questions.length}টি প্রশ্নের কাস্টম পরীক্ষা সফলভাবে পাঠানো হয়েছে! (পিন: ${pin})`);
    setTimeout(() => setAlertSuccess(null), 5000);
    setActiveTab('review');
    setAssignStep('config');
  };

  // Generate Link Action (Short, Clean URL with Exam PIN)
  const handleGenerateLink = () => {
    if (questions.length === 0) {
      alert('অনুগ্রহ করে কমপক্ষে ১টি প্রশ্ন তৈরি করুন।');
      return;
    }

    const examId = generateShortExamId(assignForm.subject, assignForm.chapter, questions.length);
    const pin = generateExamPin();

    // Format ParentQuestion to Question
    const formattedQuestions: Question[] = questions.map((q, idx) => {
      const correctIdx = q.options.findIndex(opt => opt.trim() === q.correctAnswer.trim());
      return {
        id: q.id || `q_${idx + 1}`,
        text: q.question,
        options: q.options,
        correctAnswer: correctIdx >= 0 ? correctIdx : 0,
        explanation: q.explanation
      };
    });

    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const liveExam: SharedLiveExam = {
      id: examId,
      pin,
      title: `${assignForm.subject}: ${assignForm.chapter} কাস্টম মূল্যায়ন`,
      subject: assignForm.subject,
      chapter: assignForm.chapter,
      duration: assignForm.duration || 30,
      totalMarks,
      childName: currentChild.name,
      parentName: 'অভিভাবক',
      createdAt: Date.now(),
      questions: formattedQuestions
    };

    saveSharedLiveExam(liveExam);

    // Clean, short URL with exact question count parameter
    const shareUrl = buildCleanExamUrl(examId, questions.length);

    // Register test into assignedTests so parent dashboard tracks it in pending state
    const newTestEntry = {
      id: examId,
      examId,
      pin,
      title: `${assignForm.subject}: ${assignForm.chapter} কাস্টম মূল্যায়ন`,
      subject: assignForm.subject,
      chapter: assignForm.chapter,
      questions: formattedQuestions,
      questionsList: questions,
      duration: assignForm.duration || 30,
      totalMarks,
      status: 'pending',
      score: null,
      submittedAt: null,
      aiFeedback: null,
      parentComment: null,
      handwrittenImages: []
    };
    setAssignedTests(prev => [newTestEntry, ...prev.filter(t => t.id !== examId && t.examId !== examId)]);

    setShareLinkModalData({
      examId,
      pin,
      url: shareUrl,
      title: `${currentChild.name} এর ${assignForm.subject} পরীক্ষার লিংক`,
      subject: assignForm.subject,
      chapter: assignForm.chapter,
      duration: assignForm.duration || 30,
      totalMarks,
      questionCount: questions.length
    });
    setIsLinkCopied(false);
  };

  const handleUpdateModalDuration = (newDuration: number) => {
    if (!shareLinkModalData) return;
    const stored = getSharedLiveExam(shareLinkModalData.examId);
    let updatedUrl = shareLinkModalData.url;
    if (stored) {
      stored.duration = newDuration;
      saveSharedLiveExam(stored);
      updatedUrl = buildCleanExamUrl(stored.id);
    }
    setShareLinkModalData(prev => prev ? { ...prev, duration: newDuration, url: updatedUrl } : null);
  };

  const handleCopyShareLink = () => {
    if (shareLinkModalData) {
      navigator.clipboard.writeText(shareLinkModalData.url);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 3000);
    }
  };

  const handleAddParentComment = (testId: string) => {
    const comment = (parentCommentInputs[testId] || '').trim();
    if (!comment) return;
    setAssignedTests(prev => prev.map(t => {
      if (t.id === testId || t.examId === testId) {
        return { ...t, parentComment: comment };
      }
      return t;
    }));
    setParentCommentInputs(prev => ({ ...prev, [testId]: '' }));
    setAlertSuccess('আপনার মূল্যায়ন ও উৎসাহব্যঞ্জক বার্তা সন্তানের কাছে পৌঁছে গেছে!');
    setTimeout(() => setAlertSuccess(null), 4000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Controlling options for assigned tests
  const handleCopyTestLink = (test: any) => {
    const qCount = Array.isArray(test.questions)
      ? test.questions.length
      : typeof test.questions === 'number'
      ? test.questions
      : (Number(test.totalMarks) || 15);
    const examId = test.examId || test.id;
    const url = buildCleanExamUrl(examId, qCount);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    const testKey = String(test.id || test.examId);
    setCopiedTestId(testKey);
    setAlertSuccess(`পরীক্ষার ইউনিক লিংক কপি হয়েছে!${test.pin ? ` (পিন: ${test.pin})` : ''}`);
    setTimeout(() => {
      setCopiedTestId(null);
      setAlertSuccess(null);
    }, 3500);
  };

  const handleStartTestNow = (test: any) => {
    const qCount = Array.isArray(test.questions)
      ? test.questions.length
      : typeof test.questions === 'number'
      ? test.questions
      : (Number(test.totalMarks) || 15);
    const examId = test.examId || test.id;
    const url = `/exam/live?id=${examId}&count=${qCount}`;
    window.open(url, '_blank');
  };

  const handlePreviewExistingTest = (test: any) => {
    let formattedQuestions: ParentQuestion[] = [];
    if (Array.isArray(test.questionsList) && test.questionsList.length > 0) {
      formattedQuestions = test.questionsList;
    } else if (Array.isArray(test.questions) && test.questions.length > 0) {
      formattedQuestions = test.questions.map((q: any, i: number) => {
        let optArr = Array.isArray(q.options) ? q.options : ['ক', 'খ', 'গ', 'ঘ'];
        let correctStr = typeof q.correctAnswer === 'number' ? (optArr[q.correctAnswer] || optArr[0]) : (q.correctAnswer || optArr[0]);
        return {
          id: q.id || `pq_${i + 1}`,
          question: q.text || q.question || `প্রশ্ন ${i + 1}`,
          options: optArr,
          correctAnswer: correctStr,
          marks: q.marks || 1,
          explanation: q.explanation || ''
        };
      });
    } else {
      const live = getSharedLiveExam(test.id || test.examId || test.pin);
      if (live && Array.isArray(live.questions) && live.questions.length > 0) {
        formattedQuestions = live.questions.map((q: any, i: number) => {
          let optArr = Array.isArray(q.options) ? q.options : ['ক', 'খ', 'গ', 'ঘ'];
          let correctStr = typeof q.correctAnswer === 'number' ? (optArr[q.correctAnswer] || optArr[0]) : (q.correctAnswer || optArr[0]);
          return {
            id: q.id || `pq_${i + 1}`,
            question: q.text || q.question || `প্রশ্ন ${i + 1}`,
            options: optArr,
            correctAnswer: correctStr,
            marks: 1,
            explanation: q.explanation || ''
          };
        });
      } else {
        const count = Number(test.totalMarks) || 15;
        formattedQuestions = generateCurriculumFallback(test.subject || 'বাংলা', test.chapter || '', count);
      }
    }

    setPreviewPaperData({
      title: test.title || `${test.subject} কাস্টম মূল্যায়ন`,
      subject: test.subject || 'বাংলা',
      chapter: test.chapter || '',
      duration: Number(test.duration) || 30,
      questions: formattedQuestions
    });
    setShowPreviewModal(true);
  };

  const handleDeleteAssignedTest = (testId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই পরীক্ষাটি তালিকা থেকে মুছে ফেলতে চান? এটি মুছে ফেললে আর ফিরে আসবে না।')) {
      const updated = assignedTests.filter(t => t.id !== testId && t.examId !== testId);
      setAssignedTests(updated);
      try {
        localStorage.setItem(STORAGE_TESTS_KEY, JSON.stringify(updated));
        if (updated.length === 0) {
          localStorage.setItem('dapathshala_parent_tests_cleared', 'true');
        }
      } catch {}
      setAlertSuccess('পরীক্ষাটি সফলভাবে মুছে ফেলা হয়েছে।');
      setTimeout(() => setAlertSuccess(null), 3000);
    }
  };

  const handleClearAllAssignedTests = () => {
    if (window.confirm('আপনি কি তালিকার সকল পরীক্ষা স্থায়ীভাবে মুছে ফেলতে চান? এটি ডিলিট করলে আর ফিরে আসবে না।')) {
      setAssignedTests([]);
      try {
        localStorage.setItem(STORAGE_TESTS_KEY, JSON.stringify([]));
        localStorage.setItem('dapathshala_parent_tests_cleared', 'true');
      } catch {}
      setAlertSuccess('সকল পরীক্ষা সফলভাবে মুছে ফেলা হয়েছে।');
      setTimeout(() => setAlertSuccess(null), 3000);
    }
  };

  // Subscribe to real-time proctoring alerts & exam submissions across Supabase and BroadcastChannel
  useEffect(() => {
    // 1. Initial fetch from Supabase
    fetchSupabaseProctoringLogs(activeChild).then((logs) => {
      setProctoringLogs(logs);
      setHasUnreadAlerts(logs.some(l => !l.isRead));
    });

    // 2. Real-time proctoring stream subscription
    const unsubscribeProctoring = subscribeToProctoringAlerts((newLog) => {
      setProctoringLogs(prev => [newLog, ...prev.filter(l => l.id !== newLog.id)]);
      if (newLog.childId === activeChild || !newLog.childId) {
        setRealtimeAlert(newLog);
        setHasUnreadAlerts(true);
      }
    });

    // 3. Real-time Exam Submission subscription ('নতুন খাতা জমা পড়েছে')
    const unsubscribeSubmissions = subscribeToExamSubmissions((newSub) => {
      try {
        playNotificationSound();
      } catch {}
      setAssignedTests(prev => {
        const idx = prev.findIndex(t => 
          (t.id && (t.id === newSub.id || t.id === newSub.examId)) ||
          (t.examId && (t.examId === newSub.id || t.examId === newSub.examId)) ||
          ((newSub as any).pin && t.pin === (newSub as any).pin)
        );
        if (idx >= 0) {
          const copy = [...prev];
          const existing = copy[idx];
          const existingQ = existing.questionsList || existing.questions || [];
          const incomingQ = newSub.questions || [];
          const mergedQ = (incomingQ.length >= existingQ.length && incomingQ.length > 0)
            ? incomingQ
            : (existingQ.length > 0 ? existingQ : incomingQ);

          copy[idx] = { 
            ...existing, 
            ...newSub,
            questions: mergedQ,
            questionsList: existing.questionsList || mergedQ,
            totalMarks: mergedQ.length > 0 ? mergedQ.length : (newSub.totalMarks || existing.totalMarks)
          };
          return copy;
        }
        return [newSub, ...prev];
      });
      setNewSubmissionAlert(newSub);
      setAlertSuccess(`🔔 নতুন খাতা জমা পড়েছে! "${newSub.studentName || 'সন্তান'}" এর '${newSub.title || newSub.subject}' পরীক্ষা সফলভাবে জমা হয়েছে।`);
    });

    return () => {
      unsubscribeProctoring();
      unsubscribeSubmissions();
    };
  }, [activeChild]);

  const handleOpenEvaluationModal = (test: any) => {
    const genuineImages = Array.isArray(test.handwrittenImages)
      ? test.handwrittenImages.filter((img: any) => typeof img === 'string' && img.trim() && !img.includes('image_fb59e449') && !img.includes('picsum.photos'))
      : [];
    
    let qList = (test.questions && Array.isArray(test.questions) && test.questions.length > 0) 
      ? test.questions 
      : [];
    if (qList.length === 0 && test.questionsList && Array.isArray(test.questionsList) && test.questionsList.length > 0) {
      qList = test.questionsList.map((q: any, i: number) => {
        let optArr = Array.isArray(q.options) ? q.options : ['ক', 'খ', 'গ', 'ঘ'];
        let correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : optArr.findIndex(o => o.trim() === String(q.correctAnswer).trim());
        return {
          id: q.id || `q_${i + 1}`,
          question: q.text || q.question || `প্রশ্ন ${i + 1}`,
          text: q.text || q.question || `প্রশ্ন ${i + 1}`,
          options: optArr,
          correctAnswer: correctIdx >= 0 ? correctIdx : 0,
          marks: q.marks || 1,
          explanation: q.explanation || ''
        };
      });
    }
    if (qList.length === 0) {
      const live = getSharedLiveExam(test.id || test.examId || test.pin);
      if (live && Array.isArray(live.questions) && live.questions.length > 0) {
        qList = live.questions;
      }
    }

    // Ensure aiDetailedMarking is pre-populated if missing so markings and score are instantly active
    let initialAiDetailed = test.aiDetailedMarking;
    if (!initialAiDetailed || !Array.isArray(initialAiDetailed) || initialAiDetailed.length === 0) {
      initialAiDetailed = qList.map((q: any, i: number) => {
        const qId = q.id || `q_${i + 1}`;
        const userSelected = test.answers ? test.answers[qId] : undefined;
        const isCorrect = userSelected === q.correctAnswer;
        const maxMarks = q.marks || 1;
        return {
          questionId: qId,
          isCorrect,
          marksObtained: isCorrect ? maxMarks : 0,
          maxMarks,
          redInkNote: isCorrect 
            ? '✓ সঠিক উত্তর। ধারণার প্রয়োগ যথাযথ হয়েছে এবং ধাপসমূহ নির্ভুল।' 
            : '✗ ভুল উত্তর। এখানে চিহ্নের রূপান্তর অথবা সূত্রের প্রয়োগে ত্রুটি হয়েছে।'
        };
      });
    }

    const sanitizedTest = {
      ...test,
      handwrittenImages: genuineImages,
      aiDetailedMarking: initialAiDetailed
    };
    setEvaluationModalTest(sanitizedTest);
    setEvaluationMode(test.evaluationMode || 'ai');
    setAiEvaluationDone(!!test.aiDetailedMarking || !!test.aiFeedback);
    setManualParentFeedback(test.parentComment || '');
    
    // Initialize manual grades if not present
    const initialGrades: Record<string, { marks: number; comment: string }> = {};
    if (test.manualGrades) {
      setManualGrades(test.manualGrades);
    } else {
      qList.forEach((q: any, i: number) => {
        const qId = q.id || `q_${i + 1}`;
        const isCorrect = test.answers ? test.answers[qId] === q.correctAnswer : false;
        initialGrades[qId] = {
          marks: isCorrect ? (q.marks || 1) : 0,
          comment: isCorrect ? 'সঠিক সমাধান হয়েছে' : 'উত্তরে ভুল রয়েছে, নিয়মটি আবার রিভিশন দেওয়া দরকার।'
        };
      });
      setManualGrades(initialGrades);
    }

    // Mark test as viewed in assigned tests so the "উত্তরপত্রটি দেখুন" button becomes dimmed/muted
    const testKey = test.id || test.examId;
    setAssignedTests(prev => prev.map(t => {
      const k = t.id || t.examId;
      if (k === testKey) {
        return { ...t, isViewed: true, hasBeenViewed: true };
      }
      return t;
    }));

    // Also update notification in localStorage to mark as read
    try {
      const storedNotifs = localStorage.getItem('dapathshala_notifications');
      if (storedNotifs) {
        const notifs = JSON.parse(storedNotifs);
        if (Array.isArray(notifs)) {
          const updated = notifs.map((n: any) => n.examId === testKey ? { ...n, read: true } : n);
          localStorage.setItem('dapathshala_notifications', JSON.stringify(updated));
        }
      }
    } catch {}
  };

  // Open Evaluation Modal immediately when triggered from Navigation notification
  useEffect(() => {
    const checkAndOpenEvaluation = (targetId?: string) => {
      let examId = targetId;
      if (!examId && typeof window !== 'undefined') {
        examId = sessionStorage.getItem('dapathshala_pending_eval_id') || undefined;
      }
      try {
        sessionStorage.removeItem('dapathshala_pending_eval_id');
      } catch {}

      const resolvedId = examId;
      const found = resolvedId 
        ? assignedTests.find((t: any) => t && (t.id === resolvedId || t.examId === resolvedId))
        : assignedTests.find((t: any) => t && (t.status === 'submitted' || t.submittedAt));

      if (found) {
        setActiveTab('review');
        setAssignStep('config');
        handleOpenEvaluationModal(found);
      }
    };

    if (typeof window !== 'undefined' && sessionStorage.getItem('dapathshala_pending_eval_id')) {
      checkAndOpenEvaluation();
    }

    const handleOpenEvalEvent = (e: any) => {
      checkAndOpenEvaluation(e.detail?.examId);
    };

    window.addEventListener('dapathshala_open_evaluation', handleOpenEvalEvent);
    return () => {
      window.removeEventListener('dapathshala_open_evaluation', handleOpenEvalEvent);
    };
  }, [assignedTests]);

  const handleRunAIEvaluation = async () => {
    if (!evaluationModalTest) return;
    setIsAIEvaluating(true);

    const qList = (evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions) && evaluationModalTest.questions.length > 0)
      ? evaluationModalTest.questions 
      : [];

    // Intelligent AI Detailed Marking with Digital Red Ink stamps
    const detailed = qList.map((q: any, i: number) => {
      const qId = q.id || `q_${i + 1}`;
      const userSelected = evaluationModalTest.answers ? evaluationModalTest.answers[qId] : undefined;
      const isCorrect = userSelected === q.correctAnswer;
      const maxMarks = q.marks || 1;
      const marksObtained = isCorrect ? maxMarks : 0;
      
      let redInkNote = '';
      if (isCorrect) {
        redInkNote = '✓ সঠিক উত্তর। সূত্রের প্রয়োগ ও হিসাব নির্ভুল হয়েছে।';
      } else {
        const correctOptText = q.options && q.options[q.correctAnswer] ? q.options[q.correctAnswer] : 'সঠিক বিকল্প';
        redInkNote = `✗ ভুল নির্বাচন। সঠিক উত্তর: ${correctOptText}। এখানে চিহ্নের বা সূত্রের ত্রুটি রয়েছে।`;
      }

      return {
        questionId: qId,
        isCorrect,
        marksObtained,
        maxMarks,
        redInkNote
      };
    });

    const totalObtained = detailed.reduce((sum: number, d: any) => sum + d.marksObtained, 0);
    const totalPossible = detailed.reduce((sum: number, d: any) => sum + d.maxMarks, 0) || 1;
    const finalScore = Math.round((totalObtained / totalPossible) * 100);

    const aiFeedbackText = `এআই স্বয়ংক্রিয় মূল্যায়নে শিক্ষার্থী ${finalScore}% স্কোর করেছে। মোট ${qList.length}টি প্রশ্নের মধ্যে ${detailed.filter((d: any) => d.isCorrect).length}টি সঠিক হয়েছে। হাতের লেখা উত্তরপত্রের বিন্যাস ও উপস্থাপনা ভালো।`;

    const updated = {
      ...evaluationModalTest,
      evaluationMode: 'ai' as const,
      score: finalScore,
      aiFeedback: aiFeedbackText,
      aiDetailedMarking: detailed
    };

    setEvaluationModalTest(updated);
    setAssignedTests(prev => prev.map(t => (t.id === updated.id || t.id === updated.examId) ? updated : t));
    setIsAIEvaluating(false);
    setAiEvaluationDone(true);
    setAlertSuccess('এআই দিয়ে খাতা সফলভাবে মূল্যায়ন সম্পন্ন হয়েছে এবং ডিজিটাল লাল কালির দাগ দেওয়া হয়েছে!');
    setTimeout(() => setAlertSuccess(null), 4000);
  };

  const handleSaveManualGrading = () => {
    if (!evaluationModalTest) return;
    const qList = evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions) 
      ? evaluationModalTest.questions 
      : [];
    
    let totalScoreObtained = 0;
    let maxPossible = 0;

    qList.forEach((q: any, i: number) => {
      const qId = q.id || `q_${i + 1}`;
      const grade = manualGrades[qId];
      const max = q.marks || 1;
      maxPossible += max;
      totalScoreObtained += grade ? Number(grade.marks || 0) : 0;
    });

    const finalPercent = maxPossible > 0 ? Math.round((totalScoreObtained / maxPossible) * 100) : 0;
    const comment = manualParentFeedback && manualParentFeedback.trim() ? manualParentFeedback.trim() : null;

    const updated = {
      ...evaluationModalTest,
      evaluationMode: 'manual' as const,
      score: finalPercent,
      totalScoreObtained,
      totalPossible: maxPossible,
      manualGrades,
      parentComment: comment,
      parentFeedback: comment,
      status: 'reviewed',
      isPublished: true
    };

    setEvaluationModalTest(updated);
    setAssignedTests(prev => prev.map(t => (t.id === updated.id || t.id === updated.examId) ? updated : t));
    savePublishedMarksheet(updated);
    setAlertSuccess('অভিভাবকের নিজস্ব মূল্যায়ন ও প্রতিটি প্রশ্নের নম্বর সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে!');
    setTimeout(() => setAlertSuccess(null), 4000);
    setEvaluationModalTest(null);
  };

  // Handler to override marks of any question in AI evaluation mode
  const handleOverrideAIMark = (questionId: string, newMarks: number) => {
    if (!evaluationModalTest) return;

    const qList = (evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions)) 
      ? evaluationModalTest.questions 
      : [];

    let currentMarkings = evaluationModalTest.aiDetailedMarking || [];
    if (currentMarkings.length === 0) {
      currentMarkings = qList.map((q: any, i: number) => {
        const qId = q.id || `q_${i + 1}`;
        const selected = evaluationModalTest.answers ? evaluationModalTest.answers[qId] : undefined;
        const isCorr = selected === q.correctAnswer;
        const max = q.marks || 1;
        return {
          questionId: qId,
          isCorrect: isCorr,
          marksObtained: isCorr ? max : 0,
          maxMarks: max,
          redInkNote: isCorr ? '✓ সঠিক উত্তর।' : '✗ ভুল উত্তর।'
        };
      });
    }

    const updatedMarkings = currentMarkings.map((item: any) => {
      if (item.questionId === questionId) {
        return {
          ...item,
          marksObtained: newMarks,
          isCorrect: newMarks > 0,
          isOverridden: true
        };
      }
      return item;
    });

    const totalObtained = updatedMarkings.reduce((sum: number, d: any) => sum + Number(d.marksObtained || 0), 0);
    const totalPossible = updatedMarkings.reduce((sum: number, d: any) => sum + Number(d.maxMarks || 1), 0) || 1;
    const finalScore = Math.round((totalObtained / totalPossible) * 100);

    const updated = {
      ...evaluationModalTest,
      score: finalScore,
      aiDetailedMarking: updatedMarkings
    };

    setEvaluationModalTest(updated);
    setAssignedTests(prev => prev.map(t => (t.id === updated.id || t.id === updated.examId) ? updated : t));
  };

  // Helper to compute live child score for display in the bottom action bar and header
  const getLiveEvaluationScore = () => {
    if (!evaluationModalTest) return { obtained: 0, max: 0, percent: 0, correctCount: 0, wrongCount: 0, totalQuestions: 0 };
    const qList = (evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions)) 
      ? evaluationModalTest.questions 
      : [];
    
    let obtained = 0;
    let max = 0;
    let correctCount = 0;
    let wrongCount = 0;

    if (evaluationMode === 'ai') {
      const markings = evaluationModalTest.aiDetailedMarking || [];
      qList.forEach((q: any, idx: number) => {
        const qId = q.id || `q_${idx + 1}`;
        const maxMarks = q.marks || 1;
        max += maxMarks;

        const found = markings.find((m: any) => m.questionId === qId);
        if (found !== undefined) {
          const marks = Number(found.marksObtained || 0);
          obtained += marks;
          if (marks > 0) correctCount++;
          else wrongCount++;
        } else {
          const selectedAns = evaluationModalTest.answers ? evaluationModalTest.answers[qId] : undefined;
          const isCorrect = selectedAns === q.correctAnswer;
          if (isCorrect) {
            obtained += maxMarks;
            correctCount++;
          } else {
            wrongCount++;
          }
        }
      });
    } else {
      qList.forEach((q: any, idx: number) => {
        const qId = q.id || `q_${idx + 1}`;
        const maxMarks = q.marks || 1;
        max += maxMarks;
        const grade = manualGrades[qId];
        const marks = grade !== undefined ? Number(grade.marks || 0) : (evaluationModalTest.answers?.[qId] === q.correctAnswer ? maxMarks : 0);
        obtained += marks;
        if (marks > 0) correctCount++;
        else wrongCount++;
      });
    }

    const percent = max > 0 ? Math.round((obtained / max) * 100) : 0;
    return { obtained, max, percent, correctCount, wrongCount, totalQuestions: qList.length };
  };

  // Final Submit & Publish Marksheet for Child to View
  const handleFinalSubmitAndPublish = () => {
    if (!evaluationModalTest) return;

    const isAIMode = evaluationMode === 'ai';
    const qList = (evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions) && evaluationModalTest.questions.length > 0)
      ? evaluationModalTest.questions 
      : [];

    let totalObtained = 0;
    let maxPossible = 0;

    if (isAIMode) {
      const markings = evaluationModalTest.aiDetailedMarking || [];
      totalObtained = markings.reduce((sum: number, d: any) => sum + Number(d.marksObtained || 0), 0);
      maxPossible = markings.reduce((sum: number, d: any) => sum + Number(d.maxMarks || 1), 0) || qList.length;
    } else {
      qList.forEach((q: any, i: number) => {
        const qId = q.id || `q_${i + 1}`;
        const grade = manualGrades[qId];
        const max = q.marks || 1;
        maxPossible += max;
        totalObtained += grade ? Number(grade.marks || 0) : 0;
      });
    }

    const finalPercent = maxPossible > 0 ? Math.round((totalObtained / maxPossible) * 100) : 0;
    const comment = manualParentFeedback && manualParentFeedback.trim() 
      ? manualParentFeedback.trim() 
      : (evaluationModalTest.parentComment || evaluationModalTest.parentFeedback || null);

    const targetId = evaluationModalTest.id || evaluationModalTest.examId || 'test-101';
    const targetExamId = evaluationModalTest.examId || evaluationModalTest.id || 'test-101';

    const publishedTest = {
      ...evaluationModalTest,
      id: targetId,
      examId: targetExamId,
      status: 'reviewed',
      isPublished: true,
      publishedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', আজ',
      score: finalPercent,
      totalScoreObtained: totalObtained,
      totalPossible: maxPossible,
      evaluationMode: isAIMode ? 'ai' : 'manual',
      aiFeedback: evaluationModalTest.aiFeedback || null,
      parentComment: comment,
      parentFeedback: comment,
      manualGrades: !isAIMode ? manualGrades : undefined,
      aiDetailedMarking: isAIMode ? evaluationModalTest.aiDetailedMarking : undefined
    };

    // Save marksheet across all storage keys and broadcast across tabs
    savePublishedMarksheet(publishedTest);

    // Update parent state
    setAssignedTests(prev => {
      const idx = prev.findIndex(t => t.id === publishedTest.id || t.id === publishedTest.examId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = publishedTest;
        return copy;
      }
      return [publishedTest, ...prev];
    });

    setAlertSuccess('🎉 ফাইনাল মার্কশিট প্রকাশিত হয়েছে! সন্তান তার স্ক্রিনে প্রাপ্ত মোট নম্বর, এআই ও অভিভাবকের যৌথ ফিডব্যাক এবং বিস্তারিত খাতা দেখতে পাবে।');
    setTimeout(() => setAlertSuccess(null), 5000);
    setEvaluationModalTest(null);
  };

  const handleSimulateViolation = () => {
    recordProctoringViolation({
      examId: 'test-101',
      examTitle: 'গণিত সাপ্তাহিক মূল্যায়ন',
      studentName: currentChild.name,
      childId: activeChild,
      violationType: 'tab_switch',
      violationDetails: 'পরীক্ষা চলাকালীন অন্য ট্যাব খোলার চেষ্টা করেছে',
      flagCount: 1,
      isAutoSubmitted: false
    });
  };

  const handleMarkAllRead = () => {
    markProctoringLogsAsRead(activeChild);
    setProctoringLogs(prev => prev.map(l => ({ ...l, isRead: true })));
    setHasUnreadAlerts(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
            <Shield size={14} className="text-indigo-600" />
            প্যারেন্টাল কেয়ার ও অ্যাকাডেমিক ট্র্যাকিং
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Shield size={24} />
            </div>
            অভিভাবক <span className="text-indigo-600">কন্ট্রোল হাব</span>
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            সন্তানদের পড়ার সময়, কাস্টম পরীক্ষা নির্ধারণ ও সাপ্তাহিক রেজাল্ট কার্ড এক নজরে পর্যবেক্ষণ করুন।
          </p>
        </div>

        {/* Child Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveChild(child.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeChild === child.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <img src={child.avatar} alt={child.name} className="w-8 h-8 rounded-full border border-white/40" />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold">{child.name}</div>
                <div className={`text-[10px] ${activeChild === child.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {child.grade} • রোল {child.roll}
                </div>
              </div>
            </button>
          ))}
        </div>
      </header>

      {/* Success Banner */}
      {alertSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold shadow-xs"
        >
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span>{alertSuccess}</span>
        </motion.div>
      )}

      {/* Real-Time Cheating Notification Alert Banner */}
      <AnimatePresence>
        {realtimeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl shadow-xl shadow-red-200 border border-red-300/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <ShieldAlert size={24} className="text-white animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black tracking-wide uppercase flex items-center gap-1">
                    <Flag size={11} className="fill-white" />
                    রেড ফ্ল্যাগ অ্যালার্ট
                  </span>
                  <span className="text-xs text-red-100 font-bold flex items-center gap-1">
                    <Radio size={12} className="text-white animate-pulse" />
                    এখনই সনাক্ত হয়েছে
                  </span>
                </div>
                <h3 className="font-black text-sm sm:text-base leading-snug">
                  আপনার সন্তান "{realtimeAlert.studentName}" {realtimeAlert.violationDetails || 'পরীক্ষা চলাকালীন অন্য ট্যাব খোলার চেষ্টা করেছে'}!
                </h3>
                <p className="text-xs text-red-100 font-medium">
                  পরীক্ষা: {realtimeAlert.examTitle} • সতর্কবার্তা: {realtimeAlert.flagCount}/৩ {realtimeAlert.flagCount >= 3 ? '(অটো-সাবমিট সম্পন্ন)' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                size="sm"
                onClick={() => {
                  setActiveTab('proctoring');
                  setRealtimeAlert(null);
                }}
                className="bg-white text-red-600 hover:bg-red-50 text-xs font-bold px-4 py-2 rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
              >
                বিস্তারিত লগ দেখুন
              </Button>
              <button
                onClick={() => setRealtimeAlert(null)}
                className="p-2 hover:bg-white/20 rounded-xl text-white/80 transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-Time Exam Submission Notification Alert ('নতুন খাতা জমা পড়েছে') */}
      <AnimatePresence>
        {newSubmissionAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-300/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <FileCheck size={24} className="text-white animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wide">
                    নতুন খাতা জমা পড়েছে
                  </span>
                  <span className="text-xs text-emerald-100 font-bold flex items-center gap-1">
                    <Radio size={12} className="text-white animate-pulse" />
                    এখনই জমা হয়েছে
                  </span>
                </div>
                <h3 className="font-black text-sm sm:text-base leading-snug">
                  নতুন খাতা জমা পড়েছে! {newSubmissionAlert.studentName} "{newSubmissionAlert.title}" এর উত্তরপত্র জমা দিয়েছে।
                </h3>
                <p className="text-xs text-emerald-100 font-medium">
                  হাতের লেখা খাতা: {newSubmissionAlert.handwrittenImages?.length || 0}টি পাতা • বিষয়: {newSubmissionAlert.subject}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                size="sm"
                onClick={() => {
                  setActiveTab('review');
                  handleOpenEvaluationModal(newSubmissionAlert);
                  setNewSubmissionAlert(null);
                }}
                className="bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold px-4 py-2 rounded-xl shadow-sm cursor-pointer whitespace-nowrap"
              >
                খাতা মূল্যায়ন করুন
              </Button>
              <button
                onClick={() => setNewSubmissionAlert(null)}
                className="p-2 hover:bg-white/20 rounded-xl text-white/80 transition-colors cursor-pointer"
                title="বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* PRIMARY HERO: আজকের অভিভাবকীয় লক্ষ্য ও পরীক্ষা গ্রহণ সেন্টার (Image 3 Requirement) */}
          <div className="p-6 sm:p-8 rounded-3xl shadow-xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white flex flex-col lg:flex-row items-center justify-between gap-6 border border-indigo-500/30">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-bold text-indigo-100 backdrop-blur-xs">
                <Target size={15} className="text-amber-300" />
                <span>অভিভাবক পরীক্ষা সেন্টার ও লক্ষ্য</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                আজকের অভিভাবকীয় লক্ষ্য ও পরীক্ষা গ্রহণ
              </h2>
              <p className="text-indigo-100/90 text-xs sm:text-sm leading-relaxed">
                বেশিরভাগ অভিভাবক সন্তানের প্রস্তুতি যাচাই করতে এখানে আসেন। খুব সহজে ১ থেকে ১০০ প্রশ্নের কাস্টম পরীক্ষা তৈরি করে লিংক তৈরি করুন অথবা সরাসরি পরীক্ষা আরম্ভ করান।
              </p>

              {/* Targets List */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 rounded-xl border border-white/15 text-xs font-semibold">
                  <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                  <span>২টি কুইজ সম্পন্ন করা (হয়েছে)</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 rounded-xl border border-white/15 text-xs font-semibold">
                  <Clock size={16} className="text-amber-300 shrink-0" />
                  <span>১ ঘণ্টা গণিত প্র্যাকটিস (চলমান)</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 bg-white/10 rounded-xl border border-white/15 text-xs font-semibold">
                  <Shield size={16} className="text-sky-300 shrink-0" />
                  <span>অ্যান্টি-চিটিং প্রোক্টরিং সক্রিয়</span>
                </div>
              </div>
            </div>

            {/* Quick Primary Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
              <Button 
                onClick={() => setActiveTab('assign')}
                className="bg-white hover:bg-slate-100 text-indigo-950 font-black text-sm px-6 py-4 rounded-2xl shadow-xl cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <Sparkles size={18} className="text-indigo-600" />
                সন্তানকে নতুন টেস্ট দিন
                <ChevronRight size={18} />
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveTab('review')}
                className="bg-indigo-900/40 hover:bg-indigo-900/70 border-white/30 text-white font-bold text-xs px-5 py-3 rounded-2xl cursor-pointer flex items-center justify-center gap-2"
              >
                <FileCheck size={16} />
                খাতা মূল্যায়ন ও পরীক্ষাসমূহ দেখুন
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 border-none shadow-xl bg-white hover:shadow-2xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-500 mt-1">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Activity Log */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Activity size={18} className="text-indigo-600" />
                    {currentChild.name} এর আজকের স্টাডি লগ
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    সক্রিয় স্টাডি সেশন
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activity.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {activity.status === 'success' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{activity.task}</h4>
                          <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Progress Summary */}
              <Card className="p-8 border-none shadow-xl bg-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                    <BarChart3 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">সাপ্তাহিক প্রগ্রেস সামারি</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-md">
                      গত এক সপ্তাহে {currentChild.name} এর পড়ার সময় এবং সাফল্যের হার ১৮% বৃদ্ধি পেয়েছে।
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('report')}
                  className="rounded-xl shrink-0 cursor-pointer font-bold"
                >
                  পূর্ণাঙ্গ রিপোর্ট কার্ড দেখুন
                </Button>
              </Card>

              {/* Anti-Cheating & Proctoring Quick Card */}
              <Card className="p-6 sm:p-7 border-none shadow-xl bg-gradient-to-br from-white via-red-50/20 to-rose-50/30 border border-red-100/80 flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldAlert size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                        সক্রিয় প্রক্টরিং ও অ্যান্টি-চিটিং
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
                        Supabase ডাটাবেজ সিঙ্কড
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      লাইভ চিটিং মনিটরিং ও রেড ফ্ল্যাগ
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5 max-w-lg leading-relaxed">
                      পরীক্ষা চলাকালীন সন্তান অন্য ট্যাব খোলার চেষ্টা করলে সাথে সাথে আপনার কাছে অ্যালার্ট পৌঁছাবে এবং এখানে রেড ফ্ল্যাগ চিহ্নিত হবে।
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                  <Button 
                    variant="outline" 
                    onClick={handleSimulateViolation}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 rounded-xl cursor-pointer font-bold text-xs"
                  >
                    <Radio size={14} className="animate-pulse mr-1" />
                    টেস্ট অ্যালার্ট পাঠান
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('proctoring')}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer font-bold text-xs shadow-sm"
                  >
                    সিকিউরিটি লগ দেখুন
                  </Button>
                </div>
              </Card>
            </div>

            {/* Parental Control & Screen Time */}
            <div className="lg:col-span-4 space-y-6">
              {/* Quick Exam Shortcut Card */}
              <div className="p-5 rounded-2xl shadow-md bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-indigo-600" />
                    কুইক অ্যাকশন
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    সক্রিয়
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  সন্তানের জন্য যেকোনো অধ্যায়ের ১-১০০ প্রশ্নের পরীক্ষা তৈরি করতে চান?
                </p>
                <Button 
                  onClick={() => setActiveTab('assign')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  পরীক্ষা তৈরি করুন
                </Button>
              </div>

              {/* Control Switches */}
              <Card className="p-6 border-none shadow-xl bg-white space-y-5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={18} className="text-indigo-600" />
                  প্যারেন্টাল কন্ট্রোল ও স্ক্রিন টাইম
                </h3>
                
                {/* Study Mode Lock */}
                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">স্টাডি মোড লক</span>
                    <span className="text-xs text-slate-500">অন থাকলে গেমিং ও অপ্রয়োজনীয় ব্রাউজিং বন্ধ থাকে</span>
                  </div>
                  <button
                    onClick={() => setStudyModeLock(!studyModeLock)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      studyModeLock ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      studyModeLock ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Daily Hours Limit */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">দৈনিক স্ক্রিন টাইম লিমিট</span>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {dailyLimit} ঘণ্টা
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>১ ঘণ্টা</span>
                    <span>৪ ঘণ্টা (আদর্শ)</span>
                    <span>৮ ঘণ্টা</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    সন্তান টানা ৪৫ মিনিট পড়াশোনা করলে ১৫ মিনিটের হালকা বিরতি নেওয়ার নির্দেশ স্বয়ংক্রিয়ভাবে স্ক্রিনে দেখানো হয়।
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGN TEST - PARENT QUESTION EDITOR & PREVIEW MODULE */}
      {activeTab === 'assign' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveTab('review');
                setAssignStep('config');
              }}
              className="text-xs font-bold text-slate-700 hover:bg-slate-100 border-slate-300 cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              পূর্বের তালিকায় ফিরে যান
            </Button>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              {currentChild.name} এর জন্য নতুন পরীক্ষা তৈরি
            </span>
          </div>

          {/* STEP 1: CONFIGURATION */}
          {assignStep === 'config' && (
            <Card className="p-6 sm:p-8 border-none shadow-xl bg-white max-w-3xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                  <Sparkles size={14} className="text-indigo-600" />
                  অভিভাবক প্রশ্নপত্র কনফিগারেশন
                </div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Send className="text-indigo-600" />
                  {currentChild.name} এর জন্য পরীক্ষা নির্ধারণ
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  বিষয় ও অধ্যায় নির্বাচন করুন। এআই স্বয়ংক্রিয়ভাবে প্রশ্ন তৈরি করবে এবং আপনি প্রতিটি প্রশ্ন ইচ্ছেমতো এডিট, যোগ বা প্রিভিউ করতে পারবেন।
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">বিষয় নির্বাচন করুন</label>
                    <select
                      value={assignForm.subject}
                      onChange={(e) => {
                        const newSub = e.target.value;
                        const defaultCh = CURRICULUM_DATA[newSub]?.[0] || 'অধ্যায় ১: পরিচিতি';
                        setAssignForm({ ...assignForm, subject: newSub, chapter: defaultCh });
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm bg-white cursor-pointer"
                    >
                      <option value="গণিত">গণিত</option>
                      <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                      <option value="রসায়ন">রসায়ন</option>
                      <option value="বিজ্ঞান">বিজ্ঞান</option>
                      <option value="বাংলা">বাংলা</option>
                      <option value="ইংরেজি">ইংরেজি</option>
                      <option value="আইসিটি">আইসিটি</option>
                    </select>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">অধ্যায় / টপিক</label>
                      <button
                        type="button"
                        onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                      >
                        <BookOpen size={12} />
                        <span>ড্রপডাউন তালিকা {showChapterDropdown ? 'লুকান' : 'দেখুন'}</span>
                        <ChevronDown size={12} className={`transition-transform duration-200 ${showChapterDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={assignForm.chapter}
                        onClick={() => setShowChapterDropdown(true)}
                        onFocus={() => setShowChapterDropdown(true)}
                        onChange={(e) => setAssignForm({ ...assignForm, chapter: e.target.value })}
                        placeholder="অধ্যায় নির্বাচন করুন বা লিখুন..."
                        className="w-full p-3 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm cursor-pointer hover:border-indigo-400 hover:bg-slate-50/50 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowChapterDropdown(!showChapterDropdown)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 cursor-pointer p-1 rounded-md"
                        title="অধ্যায়ের ড্রপডাউন তালিকা দেখুন"
                      >
                        <ChevronDown size={18} className={`transition-transform duration-200 ${showChapterDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Interactive Dropdown for Chapters / Topics */}
                    <AnimatePresence>
                      {showChapterDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowChapterDropdown(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-64 overflow-y-auto divide-y divide-slate-100 p-1.5"
                          >
                            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10 border-b border-slate-100">
                              <span>{assignForm.subject} এর অধ্যায়সমূহ</span>
                              <span className="text-[10px] text-indigo-600 font-semibold">ক্লিক করে নির্বাচন করুন</span>
                            </div>

                            {((CURRICULUM_DATA[assignForm.subject === 'রসায়ন' ? 'রসায়ন' : assignForm.subject]) || [
                              'অধ্যায় ১: পরিচিতি ও মৌলিক ধারণা',
                              'অধ্যায় ২: মূল বিষয়বস্তু ও সূত্রাবলি',
                              'অধ্যায় ৩: প্রায়োগিক সমস্যা ও সমাধান',
                              'অধ্যায় ৪: সৃজনশীল ও বহুনির্বাচনি প্রস্তুতি'
                            ]).map((ch, idx) => {
                              const isSelected = assignForm.chapter === ch;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setAssignForm({ ...assignForm, chapter: ch });
                                    setShowChapterDropdown(false);
                                  }}
                                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected 
                                      ? 'bg-indigo-50 text-indigo-700 font-bold' 
                                      : 'text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className="truncate pr-2">{ch}</span>
                                  {isSelected && <Check size={16} className="text-indigo-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Quick Chapter Suggestions */}
                {CURRICULUM_DATA[assignForm.subject === 'রসায়ন' ? 'রসায়ন' : assignForm.subject] && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">জনপ্রিয় অধ্যায়সমূহ (ক্লিক করে বাছাই করুন):</span>
                    <div className="flex flex-wrap gap-2">
                      {CURRICULUM_DATA[assignForm.subject === 'রসায়ন' ? 'রসায়ন' : assignForm.subject].slice(0, 4).map((ch, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAssignForm({ ...assignForm, chapter: ch })}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                            assignForm.chapter === ch 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {ch.length > 28 ? ch.substring(0, 28) + '...' : ch}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CUSTOM QUESTION COUNT SELECTOR (UP TO 100 QUESTIONS AS REQUESTED IN IMAGE 1) */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 rounded-2xl border-2 border-indigo-100 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <Sparkles size={16} className="text-indigo-600 shrink-0" />
                        <span>প্রশ্নের সংখ্যা নির্ধারণ (১ থেকে ১০০টি পর্যন্ত ইচ্ছামতো)</span>
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        ১ থেকে ১০০ পর্যন্ত যেকোনো সংখ্যা লিখুন অথবা দ্রুত বাছাই বাটনে চাপ দিন
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-xs">
                      <span className="text-xs font-bold text-slate-600">কাস্টম সংখ্যা:</span>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={customCountInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomCountInput(val);
                            const num = parseInt(val, 10);
                            if (!isNaN(num)) {
                              handleSetQuestionCount(num);
                            }
                          }}
                          onBlur={() => {
                            const num = parseInt(customCountInput, 10);
                            if (isNaN(num) || num < 1) handleSetQuestionCount(1);
                            else if (num > 100) handleSetQuestionCount(100);
                          }}
                          className="w-16 text-center text-sm font-black text-indigo-700 bg-indigo-50/60 border border-indigo-300 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                        />
                        <span className="text-xs font-black text-indigo-700 ml-1.5">টি</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">দ্রুত বাছাই করার তালিকা:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { count: 3, label: '৩টি (কুইজ)' },
                        { count: 5, label: '৫টি (মৌলিক)' },
                        { count: 10, label: '১০টি' },
                        { count: 15, label: '১৫টি' },
                        { count: 20, label: '২০টি' },
                        { count: 25, label: '২৫টি' },
                        { count: 30, label: '৩০টি (বোর্ড মান)' },
                        { count: 50, label: '৫০টি' },
                        { count: 75, label: '৭৫টি' },
                        { count: 100, label: '১০০টি (সর্বোচ্চ)' }
                      ].map((item) => {
                        const isSelected = assignForm.mcqCount === item.count;
                        return (
                          <button
                            key={item.count}
                            type="button"
                            onClick={() => handleSetQuestionCount(item.count)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {showCountError && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
                      <AlertCircle size={15} className="text-amber-600 shrink-0" />
                      <span>একবারে সর্বোচ্চ ১০০টি প্রশ্ন তৈরি করা যাবে। প্রশ্নের সংখ্যা ১০০টি নির্ধারণ করা হয়েছে।</span>
                    </div>
                  )}

                  {/* Duration and Difficulty Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-indigo-100/60">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">পরীক্ষার সময়সীমা</label>
                        <span className="text-[10px] text-indigo-600 font-semibold">{assignForm.duration} মিনিট নির্ধারিত</span>
                      </div>
                      <select
                        value={assignForm.duration}
                        onChange={(e) => setAssignForm({ ...assignForm, duration: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-xs sm:text-sm bg-white cursor-pointer"
                      >
                        <option value={10}>১০ মিনিট</option>
                        <option value={15}>১৫ মিনিট</option>
                        <option value={20}>২০ মিনিট</option>
                        <option value={25}>২৫ মিনিট</option>
                        <option value={30}>৩০ মিনিট (স্ট্যান্ডার্ড)</option>
                        <option value={45}>৪৫ মিনিট</option>
                        <option value={60}>৬০ মিনিট (১ ঘণ্টা)</option>
                        <option value={90}>৯০ মিনিট (১.৫ ঘণ্টা)</option>
                        <option value={120}>১২০ মিনিট (২ ঘণ্টা)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">কঠিনতার স্তর</label>
                      <select
                        value={assignForm.difficulty}
                        onChange={(e) => setAssignForm({ ...assignForm, difficulty: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-xs sm:text-sm bg-white cursor-pointer"
                      >
                        <option value="easy">সহজ (মৌলিক ধারণা যাচাই)</option>
                        <option value="medium">মাঝারি (বোর্ড পরীক্ষার মান)</option>
                        <option value="hard">কঠিন (উচ্চতর মেধা যাচাই)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-start gap-3">
                  <Sparkles size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                    এআই স্বয়ংক্রিয়ভাবে প্রশ্ন তৈরি করবে। এরপর আপনি প্রতিটি প্রশ্ন, নম্বর ও অপশন নিজের মতো এডিট করতে পারবেন, নতুন প্রশ্ন যোগ করতে পারবেন এবং পাঠানোর আগে প্রিন্ট প্রিভিউ দেখতে পারবেন।
                  </p>
                </div>

                {generationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{generationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleGenerateAIQuestions}
                    disabled={isGenerating}
                    className="py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>প্রশ্নপত্র তৈরি হচ্ছে...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>এআই দিয়ে প্রশ্ন জেনারেট করুন</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleStartManualQuestion}
                    className="py-3.5 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Edit3 size={18} className="text-slate-500" />
                    <span>সরাসরি নিজে প্রশ্ন লিখুন</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* STEP 2: PARENT QUESTION EDITOR */}
          {assignStep === 'editor' && (
            <div className="space-y-6">
              {/* Sticky / Top Control Card */}
              <div className="p-4 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAssignStep('config')}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all cursor-pointer"
                      title="কনফিগারেশনে ফিরে যান"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {assignForm.subject}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {assignForm.chapter}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          মোট প্রশ্ন: {questions.length}টি
                        </span>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                          মোট নম্বর: {questions.reduce((sum, q) => sum + (q.marks || 1), 0)}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                          সময়: {assignForm.duration} মিনিট
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                        প্যারেন্ট কোয়েশ্চেন এডিটর ({currentChild.name})
                      </h2>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenAddQuestion}
                      className="gap-1.5 rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs cursor-pointer shadow-xs"
                    >
                      <Plus size={16} />
                      নতুন প্রশ্ন যোগ
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreviewModal(true)}
                      className="gap-1.5 rounded-xl border-slate-300 hover:bg-slate-50 font-bold text-xs cursor-pointer shadow-xs text-slate-700"
                    >
                      <Eye size={16} className="text-indigo-600" />
                      প্রিভিউ ও প্রিন্ট
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateLink}
                      className="gap-1.5 rounded-xl border-slate-300 hover:bg-slate-50 font-bold text-xs cursor-pointer shadow-xs text-slate-700"
                    >
                      <Link2 size={16} className="text-emerald-600" />
                      লিংক তৈরি করুন
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleSendToStudent}
                      className="gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer shadow-md shadow-indigo-200"
                    >
                      <Send size={16} />
                      সন্তানকে পাঠান
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    {/* Two-Column / One-Column Layout Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setEditorColumns(2)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          editorColumns === 2 
                            ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="বোর্ড প্রশ্নপত্রের মতো ২ কলামে দেখুন"
                      >
                        <Columns size={14} className="text-indigo-600" />
                        <span>২ কলাম (বোর্ড প্যাটার্ন)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorColumns(1)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          editorColumns === 1 
                            ? 'bg-white text-indigo-700 shadow-xs border border-indigo-200' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="এক কলামে দেখুন"
                      >
                        <LayoutList size={14} className="text-slate-500" />
                        <span>১ কলাম</span>
                      </button>
                    </div>
                    <span className="hidden md:inline text-slate-400">•</span>
                    <span className="hidden md:inline">💡 প্রতিটি প্রশ্ন, অপশন ও নম্বর সরাসরি এডিট করতে পারবেন।</span>
                  </div>

                  <button
                    onClick={handleGenerateAIQuestions}
                    disabled={isGenerating}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RotateCcw size={12} className={isGenerating ? 'animate-spin' : ''} />
                    পুনরায় এআই জেনারেট
                  </button>
                </div>
              </div>

              {/* Questions List (2 Columns or 1 Column based on editorColumns - Image 2 Requirement) */}
              <div className={editorColumns === 2 ? "grid grid-cols-1 lg:grid-cols-2 gap-4 items-start" : "space-y-4"}>
                {questions.map((q, qIndex) => {
                  const optLabels = ['ক', 'খ', 'গ', 'ঘ'];
                  return (
                    <Card key={q.id} className="p-4 sm:p-5 border border-slate-200 shadow-sm bg-white hover:border-indigo-300 transition-all space-y-3 flex flex-col justify-between">
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                            {qIndex + 1}
                          </span>
                          <span className="text-sm font-black text-slate-800">
                            প্রশ্ন নং {qIndex + 1}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Marks Input */}
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                            <span className="text-xs font-bold text-slate-500">নম্বর:</span>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={q.marks || 1}
                              onChange={(e) => handleUpdateQuestion(q.id, { marks: Number(e.target.value) || 1 })}
                              className="w-12 text-center text-xs font-black text-indigo-700 bg-white border border-slate-300 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>

                          {/* Delete Question */}
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                            title="প্রশ্নটি মুছে ফেলুন"
                          >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">মুছুন</span>
                          </button>
                        </div>
                      </div>

                      {/* Question Textarea */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">প্রশ্নের বিবরণ (সম্পাদনা করুন):</label>
                        <textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) => handleUpdateQuestion(q.id, { question: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white transition-all resize-y"
                          placeholder="প্রশ্নের টেক্সট লিখুন..."
                        />
                      </div>

                      {/* 4 Options Grid */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">৪টি অপশন (সঠিক উত্তরে টিক দিন):</label>
                          <span className="text-[11px] text-slate-400">সবুজ চিহ্নিতটি হলো বর্তমান সঠিক উত্তর</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = q.correctAnswer === opt;
                            return (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                                  isCorrect 
                                    ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/10' 
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQuestion(q.id, { correctAnswer: opt })}
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-all ${
                                    isCorrect 
                                      ? 'bg-emerald-600 text-white shadow-xs' 
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                  title="ক্লিক করে সঠিক উত্তর নির্ধারণ করুন"
                                >
                                  {isCorrect ? <Check size={14} className="stroke-[3]" /> : optLabels[optIdx]}
                                </button>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                                  className="w-full text-xs font-semibold text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0 p-1"
                                  placeholder={`অপশন ${optLabels[optIdx]}`}
                                />
                                {isCorrect && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                    সঠিক
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation Box */}
                      <div className="space-y-1 pt-1">
                        <label className="text-xs font-bold text-slate-500">উত্তর বা ব্যাখ্যামূলক নোট (ঐচ্ছিক):</label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="ব্যাখ্যা বা হিন্ট লিখুন..."
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Add New Question Button Card */}
              <button
                onClick={handleOpenAddQuestion}
                className="w-full py-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50/70 rounded-3xl text-indigo-700 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Plus size={20} />
                নতুন প্রশ্ন যোগ করুন
              </button>

              {/* Bottom Quick Action Bar */}
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-semibold text-slate-600 text-center sm:text-left">
                  মোট <span className="font-bold text-slate-900">{questions.length}টি প্রশ্ন</span> প্রস্তুত রয়েছে। 
                  পূর্ণমান: <span className="font-black text-indigo-600">{questions.reduce((s, q) => s + (q.marks || 1), 0)} নম্বর</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreviewModal(true)}
                    className="rounded-xl border-slate-300 font-bold text-xs py-2.5 cursor-pointer text-slate-700"
                  >
                    <Eye size={16} className="text-indigo-600" />
                    প্রিভিউ ও প্রিন্ট
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGenerateLink}
                    className="rounded-xl border-slate-300 font-bold text-xs py-2.5 cursor-pointer text-slate-700"
                  >
                    <Link2 size={16} className="text-emerald-600" />
                    লিংক তৈরি করুন
                  </Button>
                  <Button
                    onClick={handleSendToStudent}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 shadow-md shadow-indigo-200 cursor-pointer"
                  >
                    <Send size={16} />
                    সন্তানকে পাঠান
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL 1: ADD QUESTION FORM (নতুন প্রশ্ন যোগ করার সহজ ফরম) */}
          <AnimatePresence>
            {showAddModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAddModal(false)}
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[150]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full bg-white rounded-3xl shadow-2xl z-[151] overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Plus size={18} />
                      </div>
                      <h3 className="font-black text-slate-900 text-base">নতুন প্রশ্ন যোগ করুন</h3>
                    </div>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveNewQuestion} className="p-5 overflow-y-auto space-y-4 flex-1">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">প্রশ্নের বিবরণ *</label>
                      <textarea
                        rows={2}
                        value={newQuestionForm.question}
                        onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                        placeholder="প্রশ্নটি এখানে স্পষ্ট করে লিখুন..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">প্রশ্নের নির্ধারিত নম্বর</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newQuestionForm.marks}
                        onChange={(e) => setNewQuestionForm({ ...newQuestionForm, marks: Number(e.target.value) || 1 })}
                        className="w-24 p-2.5 rounded-xl border border-slate-200 text-sm font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">৪টি অপশন ও সঠিক উত্তর নির্ধারণ করুন:</label>
                      {['ক', 'খ', 'গ', 'ঘ'].map((label, idx) => {
                        const isCorrect = newQuestionForm.correctAnswer === newQuestionForm.options[idx] && newQuestionForm.options[idx] !== '';
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setNewQuestionForm({ ...newQuestionForm, correctAnswer: newQuestionForm.options[idx] })}
                              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 cursor-pointer ${
                                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title="সঠিক উত্তর হিসেবে চিহ্নিত করতে ক্লিক করুন"
                            >
                              {isCorrect ? <Check size={14} /> : label}
                            </button>
                            <input
                              type="text"
                              value={newQuestionForm.options[idx]}
                              onChange={(e) => {
                                const newOpts = [...newQuestionForm.options];
                                newOpts[idx] = e.target.value;
                                const isCurCorrect = newQuestionForm.correctAnswer === newQuestionForm.options[idx];
                                setNewQuestionForm({
                                  ...newQuestionForm,
                                  options: newOpts,
                                  correctAnswer: isCurCorrect ? e.target.value : newQuestionForm.correctAnswer
                                });
                              }}
                              placeholder={`অপশন ${label} লিখুন...`}
                              className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              required
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">ব্যাখ্যা বা সমাধান (ঐচ্ছিক)</label>
                      <input
                        type="text"
                        value={newQuestionForm.explanation || ''}
                        onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                        placeholder="যেমন: সূত্রের প্রয়োগ বা প্রাসঙ্গিক তথ্য..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddModal(false)}
                        className="rounded-xl text-xs font-bold px-4"
                      >
                        বাতিল
                      </Button>
                      <Button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black px-5 shadow-md shadow-indigo-200 cursor-pointer"
                      >
                        প্রশ্নটি যুক্ত করুন
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 3: REVIEW EXAMS */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="text-indigo-600" />
              {currentChild.name} এর নির্ধারিত ও সম্পন্ন হওয়া পরীক্ষাসমূহ
            </h2>
            <div className="flex items-center gap-2">
              {assignedTests.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAllAssignedTests}
                  className="text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-300 border-slate-300 cursor-pointer flex items-center gap-1.5"
                  title="তালিকার সকল পরীক্ষা স্থায়ীভাবে মুছে ফেলুন"
                >
                  <Trash2 size={14} />
                  সকল পরীক্ষা মুছুন
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('assign')}
                className="text-xs font-bold cursor-pointer"
              >
                + নতুন পরীক্ষা দিন
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {assignedTests.filter(Boolean).length === 0 ? (
              <Card className="p-8 text-center bg-white border-dashed border-2 border-slate-200 rounded-3xl">
                <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                <h3 className="font-bold text-slate-700 text-base">কোনো পরীক্ষা জমা নেই</h3>
                <p className="text-xs text-slate-400 mt-1">সন্তান পরীক্ষা সম্পন্ন করে খাতা জমা দিলে তা এখানে মূল্যায়নের জন্য আসবে।</p>
              </Card>
            ) : (
              assignedTests.filter(Boolean).map((test, tIdx) => {
                const testKey = String(test.id || test.examId || `assigned_test_${tIdx}`);
                const testTitle = typeof test.title === 'string' && test.title.trim() ? test.title : 'মূল্যায়ন পরীক্ষা';
                const testSubject = typeof test.subject === 'string' && test.subject.trim() ? test.subject : 'সাধারণ';
                const testChapter = typeof test.chapter === 'string' && test.chapter.trim() ? test.chapter : 'অধ্যায় মূল্যায়ন';
                const testDuration = Number(test.duration) || 30;

                const qCount = Array.isArray(test.questions)
                  ? test.questions.length
                  : typeof test.questions === 'number'
                  ? test.questions
                  : (Number(test.totalMarks) || 5);

                const isReviewed = Boolean(test.isPublished || test.status === 'reviewed');
                const isSubmitted = test.status === 'submitted';

                // Safe violations list as strings
                const safeViolations: string[] = Array.isArray(test.violations)
                  ? test.violations.map((v: any) => typeof v === 'string' ? v : (v?.violationDetails || v?.message || 'সতর্কতা রেকর্ড'))
                  : (typeof test.violations === 'string' && test.violations ? [test.violations] : []);

                // Safe handwritten images list (exclude mock images)
                const safeImages: string[] = Array.isArray(test.handwrittenImages)
                  ? test.handwrittenImages.filter((img: any) => typeof img === 'string' && img.trim() && !img.includes('image_fb59e449') && !img.includes('picsum.photos'))
                  : (typeof test.handwrittenImages === 'string' && test.handwrittenImages && !test.handwrittenImages.includes('image_fb59e449') && !test.handwrittenImages.includes('picsum.photos') ? [test.handwrittenImages] : []);

                const currentCommentInput = parentCommentInputs[testKey] || '';

                return (
                  <Card key={testKey} className="p-6 border-none shadow-md bg-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            {testSubject}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isReviewed 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                              : isSubmitted 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {isReviewed 
                              ? '✓ মূল্যায়ন সম্পন্ন ও প্রকাশিত' 
                              : isSubmitted 
                              ? 'নতুন খাতা জমা পড়েছে (মূল্যায়ন অপেক্ষমান)' 
                              : 'পরীক্ষা অপেক্ষায় আছে'}
                          </span>
                          {test.redFlagsCount ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 flex items-center gap-1 border border-red-200">
                              <Flag size={11} className="text-red-600 fill-red-600" />
                              <span>রেড ফ্ল্যাগ: {test.redFlagsCount} বার সতর্কতা</span>
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{testTitle}</h3>
                        <p className="text-xs text-slate-500">{testChapter} • {qCount}টি প্রশ্ন • {testDuration} মিনিট</p>
                      </div>

                      {/* Right Header Controlling Options */}
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                        {/* Pending Controls */}
                        {!isReviewed && !isSubmitted && (
                          <div className="flex flex-wrap items-center gap-2">
                            {test.pin && (
                              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2 py-1 rounded-lg">
                                PIN: {test.pin}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleCopyTestLink(test)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-all cursor-pointer shadow-xs"
                              title="পরীক্ষার ইউনিক লিংক কপি করুন"
                            >
                              <Link2 size={13} className="text-indigo-600" />
                              {copiedTestId === testKey ? '✓ কপি হয়েছে!' : 'লিংক কপি'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePreviewExistingTest(test)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer shadow-xs"
                              title="বোর্ড ফরম্যাটে প্রশ্নপত্র দেখুন ও প্রিন্ট করুন"
                            >
                              <Eye size={13} className="text-slate-700" />
                              প্রশ্ন দেখুন
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssignedTest(testKey)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-200"
                              title="পরীক্ষাটি তালিকা থেকে মুছে ফেলুন"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}

                        {/* Submitted but Not Reviewed Controls */}
                        {isSubmitted && !isReviewed && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handlePreviewExistingTest(test)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                              title="প্রশ্নপত্র দেখুন"
                            >
                              <Eye size={13} />
                              প্রশ্নপত্র
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssignedTest(testKey)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}

                        {/* Reviewed Controls */}
                        {isReviewed && (
                          <div className="flex items-center gap-3">
                            {test.score !== null && test.score !== undefined && (
                              <div className="text-right">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">অনুমোদিত স্কোর</div>
                                <div className="text-2xl font-black text-emerald-600">{test.score}%</div>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handlePreviewExistingTest(test)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer border border-slate-200"
                              title="মূল প্রশ্নপত্র দেখুন ও প্রিন্ট করুন"
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssignedTest(testKey)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-slate-200"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* If Pending (পরীক্ষা অপেক্ষায় আছে): Detailed bottom control strip without start test button */}
                    {!isSubmitted && !isReviewed && (
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                                <Clock size={15} className="text-amber-700" />
                                পরীক্ষাটি শিক্ষার্থী এখনও শুরু বা জমা দেয়নি (অপেক্ষমান)
                              </span>
                              {test.pin && (
                                <span className="text-xs font-mono font-bold bg-white text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-300 shadow-xs">
                                  পিন: {test.pin}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-amber-900/80">
                              শিক্ষার্থীকে পরীক্ষার লিংক বা পিন শেয়ার করুন। শিক্ষার্থী পরীক্ষা সম্পন্ন করে উত্তরপত্র জমা দিলে তা এখানে মূল্যায়নের জন্য চলে আসবে।
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyTestLink(test)}
                              className="bg-white hover:bg-amber-100/60 border-amber-300 text-amber-950 font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
                            >
                              <Link2 size={14} className="text-amber-700" />
                              {copiedTestId === testKey ? '✓ লিংক কপি হয়েছে!' : 'লিংক ও পিন কপি'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewExistingTest(test)}
                              className="bg-white hover:bg-slate-100 border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-xs gap-1.5 cursor-pointer"
                            >
                              <Eye size={14} className="text-indigo-600" />
                              প্রশ্নপত্র দেখুন ও প্রিন্ট
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssignedTest(testKey)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-200"
                              title="পরীক্ষাটি তালিকা থেকে মুছে ফেলুন"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {(isSubmitted || isReviewed) && (
                      <div className="p-4 sm:p-5 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3.5">
                        {/* Serial Row 1: Evaluation Mode Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black text-slate-800">খাতা মূল্যায়ন মোড:</span>
                              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                test.evaluationMode === 'ai' 
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                  : test.evaluationMode === 'manual'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {test.evaluationMode === 'ai' ? '🤖 এআই দিয়ে মূল্যায়িত' : test.evaluationMode === 'manual' ? '✍️ অভিভাবকের স্বহস্তে মূল্যায়িত' : '⏳ মূল্যায়ন অপেক্ষমান'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {safeImages.length > 0 
                                ? `হাতের লেখা উত্তরপত্র: ${safeImages.length}টি পৃষ্ঠা সংযুক্ত রয়েছে`
                                : 'ডিজিটাল খাতা জমা পড়েছে'}
                            </p>
                          </div>
                        </div>

                        {/* Serial Row 3: AI Evaluation Summary (Only after review if feedback exists) */}
                        {isReviewed && test.aiFeedback && (
                          <div className="pt-3 border-t border-slate-200/80 text-xs space-y-1">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Sparkles size={14} className="text-indigo-600" />
                              এআই খাতা মূল্যায়নের সংক্ষিপ্ত ফিডব্যাক:
                            </span>
                            <p className="text-slate-600 leading-relaxed pl-5">{test.aiFeedback}</p>
                          </div>
                        )}

                        {/* Serial Row 4: Parent Encouraging Comment (Only after review if comment exists) */}
                        {isReviewed && test.parentComment && (
                          <div className="pt-3 border-t border-slate-200/80 text-xs space-y-1">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              আপনার প্রেরিত উৎসাহমূলক মন্তব্য:
                            </span>
                            <p className="text-slate-700 font-medium pl-5">{test.parentComment}</p>
                          </div>
                        )}

                        {/* Action Button at bottom of block: অস্পষ্ট (dimmed/muted) if already viewed, bright if not yet viewed */}
                        {(() => {
                          const isAnswerSheetViewed = test.isViewed || test.hasBeenViewed || test.status === 'reviewed' || test.isPublished;
                          return (
                            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleOpenEvaluationModal(test)}
                                className={`w-full sm:w-auto text-xs px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-all ${
                                  isAnswerSheetViewed
                                    ? 'opacity-40 hover:opacity-85 bg-slate-300 hover:bg-slate-400 text-slate-800 border border-slate-400/60 shadow-none font-bold'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-200 animate-pulse'
                                }`}
                                title={isAnswerSheetViewed ? 'উত্তরপত্রটি দেখা হয়েছে (ক্লিক করে পুনরায় দেখতে পারেন)' : 'খাতা দেখতে ক্লিক করুন'}
                              >
                                <FileCheck size={16} />
                                <span>উত্তরপত্রটি দেখুন</span>
                              </Button>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </Card>
                );
              })
        )}
      </div>
        </div>
      )}

      {/* TAB 4: REPORT CARD */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Printer className="text-indigo-600" />
              একাডেমিক প্রগ্রেস ও গ্রেড রিপোর্ট কার্ড
            </h2>
            <Button
              onClick={handlePrintReport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-200"
            >
              <Printer size={16} />
              রিপোর্ট প্রিন্ট / PDF সেভ করুন
            </Button>
          </div>

          <Card className="p-8 border-2 border-indigo-100 shadow-xl bg-white max-w-4xl mx-auto space-y-6">
            {/* Institute Header */}
            <div className="text-center border-b border-slate-200 pb-6 space-y-1">
              <div className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
                দা<span className="text-emerald-600">পাঠশালা</span> ডিজিটাল অ্যাকাডেমিক প্ল্যাটফর্ম
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                সাপ্তাহিক ও মাসিক শিক্ষার্থী মূল্যায়ন প্রতিবেদন
              </p>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">শিক্ষার্থীর নাম</span>
                <span className="text-slate-900 font-bold text-sm">{currentChild.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">শ্রেণি ও রোল</span>
                <span className="text-slate-900 font-bold text-sm">{currentChild.grade} (রোল: {currentChild.roll})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">মোট পড়ার সময়</span>
                <span className="text-slate-900 font-bold text-sm">২৪.৫ ঘণ্টা (চলতি সপ্তাহ)</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">সামগ্রিক গ্রেড</span>
                <span className="text-emerald-600 font-black text-base">A+ (৮৮.৫%)</span>
              </div>
            </div>

            {/* Subject Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-600 font-bold text-xs uppercase">
                    <th className="pb-3 pl-2">বিষয়</th>
                    <th className="pb-3">সম্পন্ন কুইজ/পরীক্ষা</th>
                    <th className="pb-3">গড় নম্বর</th>
                    <th className="pb-3">পারদর্শিতা গ্রেড</th>
                    <th className="pb-3 pr-2">পর্যবেক্ষণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  <tr>
                    <td className="py-3 pl-2 font-bold">সাধারণ ও উচ্চতর গণিত</td>
                    <td className="py-3">৬টি</td>
                    <td className="py-3 font-bold text-emerald-600">৯১%</td>
                    <td className="py-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">A+</span></td>
                    <td className="py-3 pr-2 text-slate-600">সূত্রের প্রয়োগে অসাধারণ দক্ষতা।</td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 font-bold">পদার্থবিজ্ঞান</td>
                    <td className="py-3">৫টি</td>
                    <td className="py-3 font-bold text-emerald-600">৮৫%</td>
                    <td className="py-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">A</span></td>
                    <td className="py-3 pr-2 text-slate-600">তাত্ত্বিক অংশ ভালো, গাণিতিক গতিবিদ্যায় মনোযোগ দরকার।</td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 font-bold">রসায়ন</td>
                    <td className="py-3">৪টি</td>
                    <td className="py-3 font-bold text-amber-600">৭৪%</td>
                    <td className="py-3"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">A-</span></td>
                    <td className="py-3 pr-2 text-slate-600">জৈব যৌগের বিক্রিয়াগুলো আরো ২ বার রিভিশন করতে হবে।</td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 font-bold">ইংরেজি ব্যাকরণ ও সাহিত্য</td>
                    <td className="py-3">৭টি</td>
                    <td className="py-3 font-bold text-emerald-600">৮৯%</td>
                    <td className="py-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">A+</span></td>
                    <td className="py-3 pr-2 text-slate-600">ভোকাবুলারি ও গ্রামার নিয়মে চমৎকার উন্নতি।</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendation Footer */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
              <Award size={22} className="text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-indigo-950">অভিভাবকের জন্য বিশেষ একাডেমিক পরামর্শ:</span>
                <p className="text-indigo-900 leading-relaxed">
                  {currentChild.name} নিয়মিত সময় দিয়ে পড়াশোনা সম্পন্ন করছে। রসায়নের ক্ষেত্রে আগামী সপ্তাহে অতিরিক্ত ২০ মিনিটের ডাউট সলভিং সেশন নেওয়ার সুপারিশ করা হচ্ছে।
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: LIVE PROCTORING & RED FLAGS */}
      {activeTab === 'proctoring' && (
        <div className="space-y-6">
          {/* Proctoring Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold mb-1">
                <Radio size={14} className="text-red-600 animate-pulse" />
                রিয়েল-টাইম অ্যান্টি-চিটিং সুরক্ষা সক্রিয়
              </div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="text-red-600" />
                লাইভ প্রক্টরিং ও রেড ফ্ল্যাগ লগ মনিটর
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {currentChild.name} এর পরীক্ষা চলাকালীন সকল ট্যাব সুইচ ও সন্দেহজনক আচরণ Supabase ডাটাবেজে রেকর্ড করা হয়েছে।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handleSimulateViolation}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Radio size={14} className="animate-pulse" />
                টেস্ট অ্যালার্ট সিমুলেট করুন
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer"
              >
                সব পঠিত মার্ক করুন
              </Button>
            </div>
          </div>

          {/* Supabase Sync Badge Card */}
          <Card className="p-4 bg-slate-900 text-white rounded-3xl border-none shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 size={22} />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-black text-white flex items-center gap-2 text-sm">
                  Supabase ক্লাউড ডাটাবেজ সিঙ্ক সক্রিয়
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </div>
                <p className="text-slate-400">
                  টেবিল: <code className="text-emerald-300 font-mono">exam_proctoring_logs</code> • রিয়েল-টাইম ব্রডকাস্ট লিসেনার কানেক্টেড
                </p>
              </div>
            </div>
            <div className="text-right self-start sm:self-center">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">লাইভ স্ট্যাটাস</span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                নিরাপদ ও সক্রিয়
              </span>
            </div>
          </Card>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-white border-2 border-red-100 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">মোট রেড ফ্ল্যাগ রেকর্ড</span>
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <Flag size={16} />
                </div>
              </div>
              <div className="text-3xl font-black text-red-600">
                {proctoringLogs.filter(l => !l.childId || l.childId === activeChild).length} টি
              </div>
              <p className="text-[11px] text-slate-400 mt-1">চলতি সপ্তাহে সনাক্ত হওয়া সতর্কবার্তা</p>
            </Card>

            <Card className="p-5 bg-white border-2 border-amber-100 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">ট্যাব পরিবর্তনের চেষ্টা</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <ShieldAlert size={16} />
                </div>
              </div>
              <div className="text-3xl font-black text-amber-600">
                {proctoringLogs.filter(l => (!l.childId || l.childId === activeChild) && l.violationType === 'tab_switch').length} বার
              </div>
              <p className="text-[11px] text-slate-400 mt-1">অন্য ট্যাব বা ব্রাউজার উইন্ডো সুইচ</p>
            </Card>

            <Card className="p-5 bg-white border-2 border-indigo-100 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">৩টি সতর্কতায় অটো-সাবমিট</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Lock size={16} />
                </div>
              </div>
              <div className="text-3xl font-black text-indigo-600">
                {proctoringLogs.filter(l => (!l.childId || l.childId === activeChild) && l.isAutoSubmitted).length} টি
              </div>
              <p className="text-[11px] text-slate-400 mt-1">সর্বোচ্চ সীমা ভঙ্গের কারণে বাতিল</p>
            </Card>
          </div>

          {/* Proctoring Logs Feed */}
          <Card className="p-6 bg-white border-none shadow-md rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                <Activity size={18} className="text-red-600" />
                সন্দেহজনক কার্যকলাপ ও চিটিং লগ হিস্ট্রি
              </h3>
              <span className="text-xs font-bold text-slate-400">
                সর্বশেষ আপডেট: এখনই
              </span>
            </div>

            {proctoringLogs.filter(l => !l.childId || l.childId === activeChild).length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">কোনো সন্দেহজনক কার্যকলাপ রেকর্ড হয়নি</h4>
                <p className="text-xs text-slate-400">আপনার সন্তান নিয়ম মেনে পরীক্ষা সম্পন্ন করছে।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {proctoringLogs
                  .filter(l => !l.childId || l.childId === activeChild)
                  .map((log) => {
                    const isSevere = log.flagCount >= 3 || log.isAutoSubmitted;
                    return (
                      <div
                        key={log.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSevere 
                            ? 'border-red-300 bg-red-50/60' 
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                            isSevere 
                              ? 'bg-red-600 text-white' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            <ShieldAlert size={18} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">{log.examTitle}</span>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                                isSevere 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                সতর্কতা {log.flagCount}/৩ {log.isAutoSubmitted ? '(অটো-সাবমিট)' : ''}
                              </span>
                              <span className="text-[11px] font-bold text-slate-400">
                                {new Date(log.timestamp).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700">
                              {log.violationDetails}
                            </p>
                            <div className="text-[11px] text-slate-400 flex items-center gap-3">
                              <span>শিক্ষার্থী: <strong className="text-slate-600">{log.studentName}</strong></span>
                              <span>ধরন: <strong className="text-slate-600">
                                {log.violationType === 'tab_switch' ? 'ট্যাব পরিবর্তন' : log.violationType === 'fullscreen_exit' ? 'ফুলস্ক্রিন ত্যাগ' : 'উইন্ডো মিনিমাইজ'}
                              </strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Supabase Logged
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </div>
      )}
      {/* FULL-PAGE EVALUATION WORKSPACE (স্বাভাবিক পেজ - উত্তরপত্র ও খাতা মূল্যায়ন) */}
      <AnimatePresence>
        {evaluationModalTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[180] bg-slate-100 flex flex-col w-full h-screen overflow-hidden"
          >
            {/* 1. TOP STICKY APPBAR / HEADER */}
            <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEvaluationModalTest(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft size={16} />
                  <span>ড্যাশবোর্ডে ফিরে যান</span>
                </button>

                <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <FileCheck size={18} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {evaluationModalTest.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        পরীক্ষার্থী: <strong className="text-slate-900">{currentChild.name}</strong>
                      </span>
                      <span className="text-xs text-slate-400 hidden md:inline">
                        • {evaluationModalTest.questions?.length || 0}টি প্রশ্ন ({evaluationModalTest.duration || 30} মিনিট)
                      </span>
                    </div>
                    <h2 className="font-black text-slate-900 text-sm sm:text-base leading-tight mt-0.5">
                      {evaluationModalTest.title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Mode switch & Column Layout Controls */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {/* Mode Selector Tabs */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEvaluationMode('ai')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      evaluationMode === 'ai'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>এআই মূল্যায়ন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvaluationMode('manual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      evaluationMode === 'manual'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Edit3 size={14} />
                    <span>নিজে খাতা দেখবো</span>
                  </button>
                </div>

                {/* Column Density Toggle (অনেক বেশি প্রশ্ন দেখার জন্য) */}
                <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setEvalViewColumns(2)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      evalViewColumns === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="২ কলাম ভিউ"
                  >
                    <Columns size={13} />
                    <span>২ কলাম</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvalViewColumns(3)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      evalViewColumns === 3 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="৩ কলাম ভিউ (অনেক বেশি প্রশ্ন ও উত্তর একসাথে দেখতে)"
                  >
                    <Grid size={13} />
                    <span>৩ কলাম (অনেক প্রশ্ন)</span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setEvaluationModalTest(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X size={20} />
                </button>
              </div>
            </header>

            {/* 2. SCROLLABLE PAGE BODY */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4">
              {/* Handwritten Answer Script Gallery (if child uploaded pages) */}
              {evaluationModalTest.handwrittenImages && evaluationModalTest.handwrittenImages.filter((img: string) => img && !img.includes('image_fb59e449') && !img.includes('picsum.photos')).length > 0 && (
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <Camera size={14} className="text-indigo-600" />
                      জমাকৃত হাতের লেখা উত্তরপত্র ({evaluationModalTest.handwrittenImages.filter((img: string) => img && !img.includes('image_fb59e449') && !img.includes('picsum.photos')).length}টি পৃষ্ঠা):
                    </span>
                    <span className="text-[11px] text-indigo-600 font-bold">
                      বড় করে দেখতে ছবিতে ক্লিক করুন
                    </span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {evaluationModalTest.handwrittenImages.filter((img: string) => img && !img.includes('image_fb59e449') && !img.includes('picsum.photos')).map((img: string, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setExpandedScriptImage(img)}
                        className="relative group shrink-0 w-20 h-28 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-indigo-500 cursor-pointer shadow-xs transition-all"
                      >
                        <img src={img} alt={`পৃষ্ঠা ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye size={18} className="text-white" />
                        </div>
                        <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          পৃষ্ঠা {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact AI Action & Status Strip in AI Mode */}
              {evaluationMode === 'ai' && (
                <div className="p-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-indigo-950 flex items-center gap-2">
                        <span>এআই স্মার্ট কারেকশন ও ডিজিটাল লাল কালির দাগ ইঞ্জিন</span>
                        {aiEvaluationDone && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            মূল্যায়ন সম্পন্ন
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        {aiEvaluationDone 
                          ? 'এআই দিয়ে স্বয়ংক্রিয়ভাবে খাতা চেক করা হয়েছে। আপনি চাইলে নিচে প্রতিটি প্রশ্নের মার্কস ও লাল কালির দাগ পরিবর্তন করতে পারেন।' 
                          : 'Gemini AI প্রতিটি প্রশ্নের নির্ভুলতা ও যুক্তিসহ স্বয়ংক্রিয়ভাবে খাতা চেক করবে।'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleRunAIEvaluation}
                    disabled={isAIEvaluating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-center"
                  >
                    {isAIEvaluating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>এআই খাতা মূল্যায়ন করছে...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>{aiEvaluationDone ? 'পুনরায় এআই মূল্যায়ন চালান' : 'এআই খাতা মূল্যায়ন শুরু করুন'}</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Compact AI Feedback Banner */}
              {evaluationMode === 'ai' && evaluationModalTest.aiFeedback && (
                <div className="p-3 bg-purple-50/90 border border-purple-200 rounded-2xl flex items-start gap-2.5 text-xs shadow-xs">
                  <Sparkles size={18} className="text-purple-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-950">এআই সার্বিক মূল্যায়ন রিপোর্ট:</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black text-[10px]">
                        স্কোর: {evaluationModalTest.score || getLiveEvaluationScore().percent}%
                      </span>
                    </div>
                    <p className="text-purple-900 leading-relaxed font-medium text-[11px]">
                      {evaluationModalTest.aiFeedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Manual Parent Mode Info Strip */}
              {evaluationMode === 'manual' && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Edit3 size={16} className="text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black text-emerald-950">অভিভাবক স্বহস্তে খাতা মূল্যায়ন ফরম</h4>
                      <p className="text-[11px] text-emerald-800">
                        প্রতিটি প্রশ্নে প্রাপ্ত মার্কস নির্ধারণ করুন এবং সন্তানের জন্য লাল কালিতে মন্তব্য লিখুন।
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* HIGH-DENSITY QUESTIONS GRID (অনেক বেশি প্রশ্ন ও উত্তর একসাথে দেখা যায়) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    প্রশ্নের খাতা ও ডিজিটাল লাল কালির দাগ (Digital Red Pen Marking):
                  </span>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    মোট {((evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions)) ? evaluationModalTest.questions.length : 0)}টি প্রশ্ন
                  </span>
                </div>

                <div className={`grid gap-3 ${
                  evalViewColumns === 2 
                    ? 'grid-cols-1 md:grid-cols-2' 
                    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                }`}>
                  {((evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions)) 
                    ? evaluationModalTest.questions 
                    : []
                  ).map((q: any, idx: number) => {
                    const qId = q.id || `q_${idx + 1}`;
                    const selectedAns = evaluationModalTest.answers ? evaluationModalTest.answers[qId] : undefined;
                    const isCorrect = selectedAns === q.correctAnswer;
                    const detailedInfo = evaluationModalTest.aiDetailedMarking?.find((d: any) => d.questionId === qId);
                    const maxMarks = q.marks || 1;

                    // Current marks for this question
                    const currentMarks = evaluationMode === 'ai'
                      ? (detailedInfo !== undefined ? detailedInfo.marksObtained : (isCorrect ? maxMarks : 0))
                      : (manualGrades[qId] !== undefined ? manualGrades[qId].marks : (isCorrect ? maxMarks : 0));
                    
                    const isFullMarks = currentMarks >= maxMarks;
                    const isPartial = currentMarks > 0 && currentMarks < maxMarks;

                    return (
                      <div
                        key={qId}
                        className={`p-3.5 rounded-2xl border-2 bg-white shadow-xs space-y-2.5 flex flex-col justify-between transition-all ${
                          isFullMarks 
                            ? 'border-emerald-200 hover:border-emerald-300' 
                            : isPartial 
                            ? 'border-amber-200 hover:border-amber-300' 
                            : 'border-rose-200 hover:border-rose-300'
                        }`}
                      >
                        <div className="space-y-2">
                          {/* Question header + Score badge */}
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                              <span className="text-indigo-600 font-black mr-1">{idx + 1}.</span>
                              {q.text || q.question}
                            </h4>

                            <div className="shrink-0">
                              {isFullMarks ? (
                                <span className="px-2 py-0.5 rounded-lg border border-emerald-500 bg-emerald-50 text-emerald-700 font-black text-[11px] flex items-center gap-1">
                                  <CheckCircle2 size={12} className="stroke-[3]" />
                                  <span>সঠিক (+{currentMarks})</span>
                                </span>
                              ) : isPartial ? (
                                <span className="px-2 py-0.5 rounded-lg border border-amber-500 bg-amber-50 text-amber-700 font-black text-[11px] flex items-center gap-1">
                                  <span>আংশিক (+{currentMarks})</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-lg border border-rose-500 bg-rose-50 text-rose-700 font-black text-[11px] flex items-center gap-1">
                                  <X size={12} className="stroke-[3]" />
                                  <span>ভুল (০)</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Options grid (Compact 2 columns) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-0.5 text-xs">
                            {q.options?.map((opt: string, optIdx: number) => {
                              const isUserChoice = selectedAns === optIdx;
                              const isRightChoice = q.correctAnswer === optIdx;

                              return (
                                <div
                                  key={optIdx}
                                  className={`p-1.5 px-2 rounded-lg border flex items-center justify-between text-[11px] font-medium ${
                                    isRightChoice
                                      ? 'border-emerald-400 bg-emerald-50/80 text-emerald-950 font-bold'
                                      : isUserChoice
                                      ? 'border-rose-400 bg-rose-50/80 text-rose-950'
                                      : 'border-slate-100 bg-slate-50/60 text-slate-600'
                                  }`}
                                >
                                  <span className="break-words line-clamp-2">{opt}</span>
                                  {isRightChoice && (
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded shrink-0 ml-1">
                                      সঠিক
                                    </span>
                                  )}
                                  {isUserChoice && !isRightChoice && (
                                    <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1 py-0.2 rounded shrink-0 ml-1">
                                      সন্তান
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Digital Red Ink annotation note */}
                          <div className={`p-2 rounded-xl border text-[11px] space-y-0.5 ${
                            isCorrect 
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                              : 'bg-rose-50/70 border-rose-200 text-rose-900'
                          }`}>
                            <div className={`font-bold flex items-center gap-1 text-[10px] ${
                              isCorrect ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              <span>✒️ {isCorrect ? 'মূল্যায়ন ও সমাধান নোট:' : 'ভুল চিহ্নিতকরণ ও মূল্যায়ন নোট:'}</span>
                            </div>
                            <p className="italic pl-1.5 border-l-2 leading-relaxed text-[10px] text-slate-700">
                              {detailedInfo?.redInkNote || (isCorrect 
                                ? '✓ সঠিক উত্তর। ধারণার প্রয়োগ যথাযথ হয়েছে এবং ধাপসমূহ নির্ভুল।' 
                                : '✗ ভুল উত্তর। এখানে চিহ্নের রূপান্তর অথবা সূত্রের প্রয়োগে ত্রুটি হয়েছে।')}
                            </p>
                          </div>
                        </div>

                        {/* Marks modifier input (Instantly live-updates bottom marks) */}
                        <div className="pt-1 mt-auto border-t border-slate-100 space-y-1.5">
                          <div className="p-1.5 px-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <Edit3 size={11} className="text-indigo-600" />
                              মার্কস পরিবর্তন:
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              <input
                                type="number"
                                min={0}
                                max={maxMarks}
                                step={0.5}
                                value={currentMarks}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(maxMarks, Number(e.target.value) || 0));
                                  if (evaluationMode === 'ai') {
                                    handleOverrideAIMark(qId, val);
                                  } else {
                                    setManualGrades(prev => ({
                                      ...prev,
                                      [qId]: { ...(prev[qId] || { marks: val, comment: '' }), marks: val }
                                    }));
                                  }
                                }}
                                className="w-12 p-0.5 text-center font-black text-indigo-700 bg-white border border-indigo-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 shadow-xs"
                              />
                              <span className="text-xs font-bold text-slate-400">/ {maxMarks}</span>
                            </div>
                          </div>

                          {/* Manual mode red ink comment input */}
                          {evaluationMode === 'manual' && (
                            <input
                              type="text"
                              value={manualGrades[qId]?.comment || ''}
                              onChange={(e) => {
                                setManualGrades(prev => ({
                                  ...prev,
                                  [qId]: { ...(prev[qId] || { marks: currentMarks, comment: '' }), comment: e.target.value }
                                }));
                              }}
                              placeholder="✍️ লাল কালিতে মন্তব্য..."
                              className="w-full p-1.5 px-2 rounded-lg border border-red-200 bg-red-50/30 text-[11px] font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-400"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overall Parent Feedback Textarea */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1.5 mt-2">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-amber-700" />
                  অভিভাবকের যৌথ মন্তব্য ও উৎসাহবার্তা (Parent Feedback):
                </label>
                <textarea
                  rows={2}
                  value={manualParentFeedback}
                  onChange={(e) => setManualParentFeedback(e.target.value)}
                  placeholder="এআই মূল্যায়নের পাশাপাশি সন্তানকে কোনো পরামর্শ বা উৎসাহ দিতে এখানে লিখুন (যেমন: বীজগণিত অনেক ভালো হয়েছে, কিন্তু চিহ্ন পরিবর্তনে একটু খেয়াল রাখবে)..."
                  className="w-full p-2.5 rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>

            {/* 3. STICKY BOTTOM ACTION BAR (Image 3 - Red Marked Section with Child's Total Marks Display) */}
            <div className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => setEvaluationModalTest(null)}
                  className="rounded-xl text-xs font-bold px-4 py-2 text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer w-full sm:w-auto"
                >
                  <ArrowLeft size={14} className="mr-1 inline" />
                  বন্ধ করুন
                </Button>
              </div>

              {/* MARKED SECTION FROM IMAGE 1: Unified single combined block for live score & publish marksheet button */}
              <div className="w-full sm:w-auto bg-gradient-to-r from-indigo-50/95 via-indigo-100/80 to-indigo-50/95 border-2 border-indigo-200/90 rounded-2xl p-2 sm:p-2.5 shadow-sm flex flex-col sm:flex-row items-center gap-3">
                {/* Child's Live Score inside this block */}
                {(() => {
                  const scoreInfo = getLiveEvaluationScore();
                  return (
                    <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto px-1">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1">
                          <Trophy size={13} className="text-amber-500 fill-amber-400" />
                          <span>সন্তানের মোট প্রাপ্ত মার্কস:</span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5 leading-tight">
                          <span className="text-indigo-600 font-extrabold">{scoreInfo.obtained}</span>
                          <span className="text-slate-400 text-xs font-bold">/ {scoreInfo.max}</span>
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ml-1 ${
                            scoreInfo.percent >= 80 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : scoreInfo.percent >= 40 
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {scoreInfo.percent}%
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 border-l border-indigo-200 pl-2.5 text-left">
                        <div className="flex items-center gap-1 text-emerald-700 font-bold whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          সঠিক: {scoreInfo.correctCount}টি
                        </div>
                        <div className="flex items-center gap-1 text-rose-700 font-bold whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          ভুল: {scoreInfo.wrongCount}টি
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Publish Marksheet Button inside the SAME single block */}
                <Button
                  onClick={handleFinalSubmitAndPublish}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-indigo-300/40 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shrink-0"
                >
                  <CheckCircle2 size={18} className="stroke-[2.5]" />
                  <span>ফাইনাল সাবমিট ও ফলাফল প্রকাশ করুন (Publish Marksheet)</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal for Full Handwritten Script Image View */}
      <AnimatePresence>
        {expandedScriptImage && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExpandedScriptImage(null)}
              className="fixed inset-0 bg-slate-950/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative z-10 max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-2 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <span className="font-bold text-slate-800 text-sm">হাতের লেখা উত্তরপত্র (পূর্ণ পৃষ্ঠা প্রিভিউ)</span>
                <button
                  onClick={() => setExpandedScriptImage(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-auto max-h-[80vh] flex items-center justify-center p-2 bg-slate-100 rounded-2xl">
                <img src={expandedScriptImage} alt="খাতার পূর্ণাঙ্গ ছবি" className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-md" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ROOT LEVEL MODAL: PRINT & EXAM VIEW PREVIEW MODAL (ACCESSIBLE FROM REVIEW AND ALL TABS) */}
      <AnimatePresence>
        {showPreviewModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPreviewModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[160]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-2 sm:inset-6 md:inset-10 lg:inset-16 bg-white rounded-3xl shadow-2xl z-[161] overflow-hidden flex flex-col max-w-4xl mx-auto"
            >
              {/* Top Modal Controls */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 font-black text-slate-800 text-sm sm:text-base">
                  <FileText className="text-indigo-600" size={20} />
                  {previewPaperData ? `${previewPaperData.subject} কাস্টম মূল্যায়ন প্রশ্নপত্র (বোর্ড ফরম্যাট)` : 'প্রশ্নপত্র প্রিন্ট ও পরীক্ষার পূর্ণাঙ্গ প্রিভিউ'}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.print()}
                    className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs gap-1.5 cursor-pointer"
                  >
                    <Printer size={15} />
                    <span className="hidden sm:inline">প্রিন্ট / PDF</span>
                  </Button>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setPreviewPaperData(null);
                    }}
                    className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Exam Paper Sheet */}
              {(() => {
                const activePaperQuestions = previewPaperData ? previewPaperData.questions : questions;
                const activePaperSubject = previewPaperData ? previewPaperData.subject : assignForm.subject;
                const activePaperChapter = previewPaperData ? previewPaperData.chapter : assignForm.chapter;
                const activePaperDuration = previewPaperData ? previewPaperData.duration : assignForm.duration;
                const totalPaperMarks = activePaperQuestions.reduce((s, q) => s + (q.marks || 1), 0);

                return (
                  <>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 bg-white font-serif text-slate-900 print:p-0">
                      {/* Board Exam Sheet Header */}
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
                        {/* Left: Exam Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                            <span>যমুনা / দা-পাঠশালা</span>
                            <span>•</span>
                            <span>পত্র নং: ০১</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            বহুনির্বাচনি অভীক্ষা
                          </h2>
                          <h3 className="text-base sm:text-lg font-bold text-slate-800">
                            {activePaperSubject} ({activePaperChapter})
                          </h3>
                          <p className="text-xs text-slate-600 font-sans">
                            [{new Date().getFullYear()} সালের বোর্ড সিলেবাস অনুযায়ী]
                          </p>
                          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold text-slate-800 pt-1 font-sans">
                            <span>সময় — {activePaperDuration} মিনিট</span>
                            <span>পূর্ণমান — {totalPaperMarks}</span>
                          </div>
                        </div>

                        {/* Right: Board Boxes */}
                        <div className="flex flex-col items-end gap-2 shrink-0 self-end sm:self-start">
                          <div className="border-2 border-slate-900 p-2 text-center bg-white">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-sans">বিষয় কোড :</span>
                              <div className="flex border border-slate-900">
                                <span className="w-6 h-6 border-r border-slate-900 flex items-center justify-center font-mono font-black text-xs">১</span>
                                <span className="w-6 h-6 border-r border-slate-900 flex items-center justify-center font-mono font-black text-xs">০</span>
                                <span className="w-6 h-6 flex items-center justify-center font-mono font-black text-xs">১</span>
                              </div>
                            </div>
                          </div>

                          <div className="border-2 border-slate-900 p-2 text-center bg-white flex items-center gap-2">
                            <span className="text-xs font-bold font-sans">সেট :</span>
                            <span className="w-7 h-7 border border-slate-900 flex items-center justify-center font-bold text-sm bg-slate-50">খ</span>
                          </div>
                        </div>
                      </div>

                      {/* Board Special Instructions */}
                      <div className="p-2.5 bg-slate-50 border border-slate-300 text-[11px] sm:text-xs text-slate-800 leading-relaxed font-sans space-y-0.5">
                        <p className="font-semibold">
                          [বিশেষ দ্রষ্টব্য: সরবরাহকৃত বহুনির্বাচনি অভীক্ষার উত্তরপত্রে প্রশ্নের ক্রমিক নম্বরের বিপরীতে প্রদত্ত বর্ণসংবলিত বৃত্তসমূহ হতে সঠিক/সর্বোৎকৃষ্ট উত্তরের বৃত্তটি বল পয়েন্ট কলম দ্বারা সম্পূর্ণ ভরাট কর। প্রতিটি প্রশ্নের মান ১।]
                        </p>
                        <p className="text-red-700 font-bold text-[10px] sm:text-[11px]">
                          প্রশ্নপত্রে কোনো প্রকার দাগ/চিহ্ন দেওয়া যাবে না।
                        </p>
                      </div>

                      {/* TWO-COLUMN BOARD EXAM QUESTIONS GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-start divide-y md:divide-y-0 md:divide-x divide-slate-200">
                        {/* Column 1 (Left) */}
                        <div className="space-y-4">
                          {activePaperQuestions.slice(0, Math.ceil(activePaperQuestions.length / 2)).map((q, idx) => {
                            const qNumber = idx + 1;
                            const optLetters = ['(ক)', '(খ)', '(গ)', '(ঘ)'];
                            return (
                              <div key={q.id} className="space-y-1.5 text-xs sm:text-sm border-b border-slate-100 pb-3">
                                <div className="flex items-start gap-1 font-bold text-slate-900 leading-snug">
                                  <span className="shrink-0">{qNumber}।</span>
                                  <span>{q.question}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pl-4 text-[11px] sm:text-xs text-slate-800 font-sans">
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-baseline gap-1">
                                      <span className="font-bold text-slate-600">{optLetters[optIdx]}</span>
                                      <span>{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Column 2 (Right) */}
                        <div className="space-y-4 md:pl-8 pt-4 md:pt-0">
                          {activePaperQuestions.slice(Math.ceil(activePaperQuestions.length / 2)).map((q, idx) => {
                            const qNumber = Math.ceil(activePaperQuestions.length / 2) + idx + 1;
                            const optLetters = ['(ক)', '(খ)', '(গ)', '(ঘ)'];
                            return (
                              <div key={q.id} className="space-y-1.5 text-xs sm:text-sm border-b border-slate-100 pb-3">
                                <div className="flex items-start gap-1 font-bold text-slate-900 leading-snug">
                                  <span className="shrink-0">{qNumber}।</span>
                                  <span>{q.question}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pl-4 text-[11px] sm:text-xs text-slate-800 font-sans">
                                  {q.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-baseline gap-1">
                                      <span className="font-bold text-slate-600">{optLetters[optIdx]}</span>
                                      <span>{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Answer Key Footer */}
                      <div className="mt-8 pt-4 border-t-2 border-slate-300 font-sans text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold uppercase tracking-wider text-slate-600">অভিভাবক সমাধান নির্দেশিকা (উত্তরমালা):</span>
                          <span className="text-[11px] text-slate-400">প্রিন্ট করার সময় প্রয়োজনে আলাদা পাতা হিসেবে ব্যবহারযোগ্য</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[11px]">
                          {activePaperQuestions.map((q, i) => (
                            <div key={q.id} className="p-1.5 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                              <span className="font-bold text-slate-600">{i + 1} :</span>
                              <span className="font-bold text-emerald-800 truncate max-w-[70px]">{q.correctAnswer}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    {previewPaperData ? (
                      <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
                        <span className="text-xs text-slate-500 font-sans">
                          * সংরক্ষিত কাস্টম পরীক্ষার পূর্ণাঙ্গ প্রশ্নপত্র। এটি সরাসরি প্রিন্ট করে শিক্ষার্থীকে দেওয়া যাবে।
                        </span>
                        <div className="flex items-center gap-2.5">
                          <Button
                            size="sm"
                            onClick={() => window.print()}
                            className="rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs gap-1.5 cursor-pointer"
                          >
                            <Printer size={15} />
                            প্রিন্ট / PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowPreviewModal(false);
                              setPreviewPaperData(null);
                            }}
                            className="rounded-xl border-slate-300 font-bold text-xs cursor-pointer"
                          >
                            বন্ধ করুন
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                        <span className="text-xs text-slate-500 text-center sm:text-left">
                          প্রশ্নপত্র সন্তোষজনক হলে সরাসরি সন্তানকে পাঠান অথবা লিংক তৈরি করে মেসেজে দিন।
                        </span>
                        <div className="flex items-center gap-2.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateLink}
                            className="rounded-xl border-slate-300 font-bold text-xs"
                          >
                            <Link2 size={16} className="text-emerald-600" />
                            লিংক তৈরি করুন
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSendToStudent}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200"
                          >
                            <Send size={16} />
                            সরাসরি সন্তানকে পাঠান
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ROOT LEVEL MODAL: GENERATE LINK MODAL (ACCESSIBLE FROM REVIEW AND ALL TABS) */}
      <AnimatePresence>
        {shareLinkModalData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShareLinkModalData(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[170]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:w-full bg-white rounded-3xl shadow-2xl z-[171] overflow-hidden p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Link2 size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">ইউনিক এক্সাম লিংক তৈরি হয়েছে</h3>
                    <p className="text-xs text-slate-500">{shareLinkModalData.subject} • {shareLinkModalData.questionCount}টি প্রশ্ন</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareLinkModalData(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock size={15} className="text-indigo-600" />
                    পরীক্ষার সময়সীমা (Duration) নির্ধারণ করুন:
                  </label>
                  <span className="text-xs font-black text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                    {shareLinkModalData.duration} মিনিট
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[10, 15, 20, 25, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleUpdateModalDuration(mins)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        shareLinkModalData.duration === mins
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {mins} মিনিট
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  * সন্তান যখন লিংকে প্রবেশ করবে তখন এই সময়সীমা অনুযায়ী টাইমার সক্রিয় হবে।
                </p>
              </div>

              {shareLinkModalData.pin && (
                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">সহজ ৬-সংখ্যার পরীক্ষার পিন (Exam PIN):</span>
                    <span className="text-2xl font-black text-amber-950 tracking-widest">{shareLinkModalData.pin}</span>
                    <span className="text-[10px] text-amber-700 block mt-0.5">সন্তান লিংকে না গিয়ে এই পিন লিখেও পরীক্ষা শুরু করতে পারবে</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLinkModalData.pin || '');
                      setIsLinkCopied(true);
                      setTimeout(() => setIsLinkCopied(false), 2500);
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
                  >
                    পিন কপি
                  </button>
                </div>
              )}

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">ছোট ও নিরাপদ পরীক্ষার ইউনিক লিংক:</span>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    readOnly
                    value={shareLinkModalData.url}
                    className="w-full text-xs font-mono text-slate-700 bg-transparent border-none focus:outline-none select-all font-semibold"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isLinkCopied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    {isLinkCopied ? (
                      <>
                        <CheckCheck size={14} />
                        <span>কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">সরাসরি শেয়ার করুন:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `📝 *দা পাঠশালা - অনলাইন পরীক্ষা*\nবিষয়: ${shareLinkModalData.subject}\nঅধ্যায়: ${shareLinkModalData.chapter}\nসময়সীমা: ${shareLinkModalData.duration} মিনিট | পূর্ণমান: ${shareLinkModalData.totalMarks}\n${shareLinkModalData.pin ? `পিন কোড: ${shareLinkModalData.pin}\n` : ''}\nপরীক্ষা দিতে নিচের লিংকে প্রবেশ করো:\n${shareLinkModalData.url}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Share2 size={16} />
                    <span>WhatsApp-এ পাঠান</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      handleSendToStudent();
                      setShareLinkModalData(null);
                    }}
                    className="w-full py-3 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Send size={16} />
                    <span>সন্তানের অ্যাকাউন্টে পাঠান</span>
                  </button>
                </div>

                <a
                  href={shareLinkModalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink size={15} className="text-slate-600" />
                  <span>লিংকটি নিজে ওপেন করে প্রিভিউ করুন</span>
                </a>

                <Button
                  variant="outline"
                  onClick={() => setShareLinkModalData(null)}
                  className="w-full text-xs font-bold rounded-xl cursor-pointer mt-1"
                >
                  বন্ধ করুন
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
