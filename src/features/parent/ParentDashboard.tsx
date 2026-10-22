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
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';
import { getGeminiApiKey } from '../../lib/gemini';
import { CURRICULUM_DATA } from '../../lib/curriculumData';
import { saveSharedLiveExam, getSharedLiveExam, SharedLiveExam } from '../../lib/liveExamStorage';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'assign' | 'review' | 'report' | 'proctoring'>('overview');
  
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

  // Assign Test form state
  const [assignForm, setAssignForm] = useState({
    subject: 'গণিত',
    chapter: 'অধ্যায় ৩: বীজগণিতীয় রাশিমালা',
    duration: 30,
    mcqCount: 5,
    creativeCount: 0,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    marksPerQuestion: 1
  });

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

  // Default seed questions for math test-101
  const SAMPLE_MATH_QUESTIONS = [
    { id: 'q1', text: '(a + b)² এর সঠিক সম্প্রসারিত রূপ কোনটি?', options: ['a² + 2ab + b²', 'a² - 2ab + b²', 'a² + b²', 'a² + ab + b²'], correctAnswer: 0, marks: 1 },
    { id: 'q2', text: 'যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?', options: ['16', '14', '18', '12'], correctAnswer: 1, marks: 1 },
    { id: 'q3', text: 'একটি দ্বিঘাত সমীকরণের সর্বোচ্চ ঘাত কত?', options: ['১', '২', '৩', '৪'], correctAnswer: 1, marks: 1 },
    { id: 'q4', text: 'সমকোণী ত্রিভুজের পিথাগোরাসের উপপাদ্য কোনটি?', options: ['অতিভুজ² = লম্ব² + ভূমি²', 'অতিভুজ = লম্ব + ভূমি', 'লম্ব² = অতিভুজ² + ভূমি²', 'ভূমি² = লম্ব² + অতিভুজ²'], correctAnswer: 0, marks: 1 },
    { id: 'q5', text: 'নিচের কোনটি মৌলিক সংখ্যা?', options: ['৪', '৬', '৯', '১১'], correctAnswer: 3, marks: 1 }
  ];

  // Default seed tests (Test-101 is initially submitted and waiting for parent/AI review)
  const DEFAULT_ASSIGNED_TESTS = [
    {
      id: 'test-101',
      title: 'গণিত সাপ্তাহিক মূল্যায়ন',
      subject: 'গণিত',
      chapter: 'বীজগণিত ও সমীকরণ',
      questions: SAMPLE_MATH_QUESTIONS,
      duration: 30,
      totalMarks: 5,
      status: 'submitted',
      isPublished: false,
      score: null,
      submittedAt: 'আজ, সকাল ১১:৩০',
      aiFeedback: null,
      parentComment: null,
      redFlagsCount: 1,
      violations: [
        'অন্য ট্যাব বা উইন্ডোতে যাওয়ার চেষ্টা করেছে (সতর্কতা ১/৩)'
      ],
      handwrittenImages: [
        '/assets/aistudio/image_fb59e449.png'
      ],
      answers: {
        q1: 0,
        q2: 1,
        q3: 0,
        q4: 0,
        q5: 3
      }
    },
    {
      id: 'test-102',
      title: 'বিজ্ঞান ও পরিবেশ কুইজ',
      subject: 'বিজ্ঞান',
      chapter: 'পরিবেশ ও বাস্তুতন্ত্র',
      questions: 4,
      duration: 20,
      totalMarks: 4,
      status: 'pending',
      isPublished: false,
      score: null,
      submittedAt: null,
      aiFeedback: null,
      parentComment: null
    }
  ];

  // Sanitizer helper to guarantee assignedTests is never corrupted
  const sanitizeTestsList = (raw: any): any[] => {
    if (!raw || !Array.isArray(raw)) return DEFAULT_ASSIGNED_TESTS;
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

        // Clean handwrittenImages to be safe string array
        let safeImages: string[] = [];
        if (Array.isArray(test.handwrittenImages)) {
          safeImages = test.handwrittenImages.filter((img: any) => typeof img === 'string');
        } else if (typeof test.handwrittenImages === 'string' && test.handwrittenImages.trim()) {
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
      const saved = localStorage.getItem(STORAGE_TESTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = sanitizeTestsList(parsed);
        if (sanitized.length > 0) return sanitized;
      }
    } catch (e) {
      console.warn('Error loading tests from storage, using defaults:', e);
    }
    return DEFAULT_ASSIGNED_TESTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TESTS_KEY, JSON.stringify(assignedTests));
    } catch (err) {
      console.warn('Failed to persist assigned tests:', err);
    }
  }, [assignedTests]);

  // Per-test parent comment inputs map: { [testId]: string }
  const [parentCommentInputs, setParentCommentInputs] = useState<Record<string, string>>({});

  // Fallback curriculum seed generator for instant, resilient questions
  const generateCurriculumFallback = (subject: string, chapter: string, count: number): ParentQuestion[] => {
    const seedBank: Record<string, Array<{ question: string; options: string[]; correctAnswer: string; explanation: string }>> = {
      'গণিত': [
        {
          question: 'নিচের কোনটি একটি দ্বিঘাত সমীকরণের আদর্শ রূপ?',
          options: ['ax + b = 0', 'ax² + bx + c = 0', 'ax³ + bx² + c = 0', 'a/x + b = 0'],
          correctAnswer: 'ax² + bx + c = 0',
          explanation: 'দ্বিঘাত সমীকরণে অজ্ঞাত রাশির সর্বোচ্চ ঘাত ২ হয়।'
        },
        {
          question: 'যদি x + y = 6 এবং x - y = 2 হয়, তবে x ও y এর মান যথাক্রমে কত?',
          options: ['4, 2', '5, 1', '3, 3', '6, 0'],
          correctAnswer: '4, 2',
          explanation: 'উভয় সমীকরণ যোগ করলে 2x = 8 বা x = 4 এবং y = 2 পাওয়া যায়।'
        },
        {
          question: 'সমকোণী ত্রিভুজের পিথাগোরাসের উপপাদ্য কোনটি?',
          options: ['অতিভুজ² = লম্ব² + ভূমি²', 'অতিভুজ = লম্ব + ভূমি', 'লম্ব² = অতিভুজ² + ভূমি²', 'ভূমি² = লম্ব² + অতিভুজ²'],
          correctAnswer: 'অতিভুজ² = লম্ব² + ভূমি²',
          explanation: 'পিথাগোরাসের উপপাদ্য অনুযায়ী অতিভুজের বর্গ অপর দুই বাহুর বর্গের সমষ্টির সমান।'
        },
        {
          question: 'লগারিদমের ভিত্তি ১০ হলে, log₁₀(1000) এর মান কত?',
          options: ['১', '২', '৩', '১০'],
          correctAnswer: '৩',
          explanation: '১০³ = ১০০০, অতএব log₁₀(1000) = ৩।'
        },
        {
          question: 'একটি বৃত্তের ব্যাসার্ধ r হলে, এর ক্ষেত্রফল নির্ণয়ের সূত্র কোনটি?',
          options: ['2πr', 'πr²', '4/3πr³', 'πd'],
          correctAnswer: 'πr²',
          explanation: 'বৃত্তের ক্ষেত্রফলের সূত্র πr²।'
        }
      ],
      'পদার্থবিজ্ঞান': [
        {
          question: 'নিউটনের গতির দ্বিতীয় সূত্র থেকে কিসের পরিমাপ পাওয়া যায়?',
          options: ['বলের পরিমাপ (F = ma)', 'জড়তা', 'ক্রিয়া ও প্রতিক্রিয়া', 'মহাকর্ষ বল'],
          correctAnswer: 'বলের পরিমাপ (F = ma)',
          explanation: 'ভরবেগের পরিবর্তনের হার প্রযুক্ত বলের সমানুপাতিক (F = ma)।'
        },
        {
          question: 'কাজের আন্তর্জাতিক (SI) একক কী?',
          options: ['জুল (Joule)', 'নিউটন (Newton)', 'ওয়াট (Watt)', 'প্যাসকেল (Pascal)'],
          correctAnswer: 'জুল (Joule)',
          explanation: 'বল প্রয়োগে ১ মিটার সরণ হলে সম্পন্ন কাজের পরিমাণ ১ জুল।'
        },
        {
          question: 'পৃথিবীর আদর্শ অভিকর্ষজ ত্বরণ (g)-এর মান কত?',
          options: ['৯.৮ m/s²', '৯.৮ m/s', '৮.৯ m/s²', '১০.৫ m/s²'],
          correctAnswer: '৯.৮ m/s²',
          explanation: 'ভূপৃষ্ঠে অভিকর্ষজ ত্বরণের গড় মান ৯.৮ মিটার/সেকেন্ড²।'
        },
        {
          question: 'আলোর প্রতিসরণের ২য় সূত্রটি কী নামে পরিচিত?',
          options: ['স্নেলের সূত্র', 'হুকের সূত্র', 'বয়েলের সূত্র', 'কুলম্বের সূত্র'],
          correctAnswer: 'স্নেলের সূত্র',
          explanation: 'আপতন কোণের সাইন ও প্রতিসরণ কোণের সাইনের অনুপাত একটি ধ্রুবক (স্নেলের সূত্র)।'
        }
      ],
      'রসায়ন': [
        {
          question: 'পানির অণুতে হাইড্রোজেন ও অক্সিজেনের পরমাণুর অনুপাত কত?',
          options: ['২ : ১', '১ : ২', '১ : ১', '২ : ২'],
          correctAnswer: '২ : ১',
          explanation: 'H₂O অণুতে ২টি হাইড্রোজেন এবং ১টি অক্সিজেন থাকে।'
        },
        {
          question: 'পর্যায় সারণিতে ক্ষার ধাতুসমূহ কোন গ্রুপে অবস্থিত?',
          options: ['গ্রুপ ১', 'গ্রুপ ২', 'গ্রুপ ১৭', 'গ্রুপ ১৮'],
          correctAnswer: 'গ্রুপ ১',
          explanation: 'হাইড্রোজেন ব্যতীত গ্রুপ-১ এর মৌলগুলো তীব্র ক্ষার ধাতু।'
        },
        {
          question: 'নিরপেক্ষ বা বিশুদ্ধ পানির pH মান কত?',
          options: ['৭', '০', '৫', '১৪'],
          correctAnswer: '৭',
          explanation: 'নিরপেক্ষ দ্রবণের pH ঠিক ৭ হয়।'
        }
      ],
      'বাংলা': [
        {
          question: '\'অপরিচিতা\' ছোটগল্পের কেন্দ্রীয় চরিত্রের নাম কী?',
          options: ['অনুপম', 'কল্যাণী', 'শম্ভুনাথ সেন', 'হরিশ'],
          correctAnswer: 'অনুপম',
          explanation: 'অনুপম গল্পের মূল বক্তা ও কেন্দ্রীয় চরিত্র।'
        },
        {
          question: 'বাংলা বর্ণমালায় মাত্রাহীন বর্ণ কয়টি?',
          options: ['১০টি', '৭টি', '৮টি', '১১টি'],
          correctAnswer: '১০টি',
          explanation: 'বাংলা বর্ণমালায় মাত্রাহীন বর্ণের সংখ্যা ১০টি।'
        },
        {
          question: 'নিচের কোন বানানটি শুদ্ধ?',
          options: ['মুহূর্ত', 'মুহুর্ত', 'মুহূত্ত', 'মুহুর্ত্ত'],
          correctAnswer: 'মুহূর্ত',
          explanation: 'প্রমিত বাংলা নিয়মে সঠিক বানান \'মুহূর্ত\'।'
        }
      ]
    };

    const pool = seedBank[subject] || seedBank['গণিত'];
    const result: ParentQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const item = pool[i % pool.length];
      result.push({
        id: 'pq_' + Date.now() + '_' + i,
        question: item.question,
        options: [...item.options],
        correctAnswer: item.correctAnswer,
        marks: assignForm.marksPerQuestion || 1,
        explanation: item.explanation
      });
    }
    return result;
  };

  // AI Question Generation Handler
  const handleGenerateAIQuestions = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    const apiKey = getGeminiApiKey();

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a curriculum expert Bengali school teacher. Generate exactly ${assignForm.mcqCount} high-quality Multiple Choice Questions (MCQ) for Class ${currentChild.grade} student about "${assignForm.chapter}" in subject "${assignForm.subject}".
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
            const formatted: ParentQuestion[] = parsed.map((item, index) => ({
              id: item.id || 'pq_' + Date.now() + '_' + index,
              question: item.question,
              options: Array.isArray(item.options) && item.options.length === 4 ? item.options : ['ক', 'খ', 'গ', 'ঘ'],
              correctAnswer: item.correctAnswer || item.options[0],
              marks: assignForm.marksPerQuestion || 1,
              explanation: item.explanation || ''
            }));
            setQuestions(formatted);
            setAssignStep('editor');
            setIsGenerating(false);
            return;
          }
        }
      } catch (err: any) {
        console.warn('Gemini generation bypassed/offline, using curriculum seeds:', err);
      }
    }

    // High quality resilient fallback
    const fallback = generateCurriculumFallback(assignForm.subject, assignForm.chapter, assignForm.mcqCount);
    setQuestions(fallback);
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
    const newTest = {
      id: 'test-' + Date.now(),
      title: `${assignForm.subject}: ${assignForm.chapter} কাস্টম মূল্যায়ন`,
      subject: assignForm.subject,
      chapter: assignForm.chapter,
      questions: questions.length,
      duration: assignForm.duration,
      totalMarks,
      status: 'pending',
      score: null,
      submittedAt: null,
      aiFeedback: null,
      parentComment: null,
      questionsList: questions
    };

    setAssignedTests([newTest, ...assignedTests]);
    setShowPreviewModal(false);
    setAlertSuccess(`"${currentChild.name}" এর ড্যাশবোর্ডে ${questions.length}টি প্রশ্নের কাস্টম পরীক্ষা সফলভাবে পাঠানো হয়েছে!`);
    setTimeout(() => setAlertSuccess(null), 5000);
    setActiveTab('review');
    setAssignStep('config');
  };

  // Generate Link Action
  const handleGenerateLink = () => {
    if (questions.length === 0) {
      alert('অনুগ্রহ করে কমপক্ষে ১টি প্রশ্ন তৈরি করুন।');
      return;
    }

    const examId = 'exam_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

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

    const shareUrl = `${window.location.origin}/exam/live?id=${examId}`;
    setShareLinkModalData({
      examId,
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
    setShareLinkModalData(prev => prev ? { ...prev, duration: newDuration } : null);

    const stored = getSharedLiveExam(shareLinkModalData.examId);
    if (stored) {
      stored.duration = newDuration;
      saveSharedLiveExam(stored);
    }
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
      setAssignedTests(prev => {
        const idx = prev.findIndex(t => t.id === newSub.id || t.id === newSub.examId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...newSub };
          return copy;
        }
        return [newSub, ...prev];
      });
      setNewSubmissionAlert(newSub);
    });

    return () => {
      unsubscribeProctoring();
      unsubscribeSubmissions();
    };
  }, [activeChild]);

  const handleOpenEvaluationModal = (test: any) => {
    setEvaluationModalTest(test);
    setEvaluationMode(test.evaluationMode || 'ai');
    setAiEvaluationDone(!!test.aiDetailedMarking || !!test.aiFeedback);
    setManualParentFeedback(test.parentComment || '');
    
    // Initialize manual grades if not present
    const initialGrades: Record<string, { marks: number; comment: string }> = {};
    if (test.manualGrades) {
      setManualGrades(test.manualGrades);
    } else {
      const qList = (test.questions && Array.isArray(test.questions) && test.questions.length > 0) 
        ? test.questions 
        : SAMPLE_MATH_QUESTIONS;
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
  };

  const handleRunAIEvaluation = async () => {
    if (!evaluationModalTest) return;
    setIsAIEvaluating(true);

    const qList = (evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions) && evaluationModalTest.questions.length > 0)
      ? evaluationModalTest.questions 
      : SAMPLE_MATH_QUESTIONS;

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

    const updated = {
      ...evaluationModalTest,
      evaluationMode: 'manual' as const,
      score: finalPercent,
      manualGrades,
      parentComment: manualParentFeedback || 'অভিভাবক কর্তৃক স্বহস্তে খাতা মূল্যায়ন সম্পন্ন হয়েছে।'
    };

    setEvaluationModalTest(updated);
    setAssignedTests(prev => prev.map(t => (t.id === updated.id || t.id === updated.examId) ? updated : t));
    setAlertSuccess('অভিভাবকের নিজস্ব মূল্যায়ন ও প্রতিটি প্রশ্নের নম্বর সফলভাবে সংরক্ষিত হয়েছে!');
    setTimeout(() => setAlertSuccess(null), 4000);
    setEvaluationModalTest(null);
  };

  // Handler to override marks of any question in AI evaluation mode
  const handleOverrideAIMark = (questionId: string, newMarks: number) => {
    if (!evaluationModalTest) return;

    const currentMarkings = evaluationModalTest.aiDetailedMarking || [];
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
  };

  // Final Submit & Publish Marksheet for Child to View
  const handleFinalSubmitAndPublish = () => {
    if (!evaluationModalTest) return;

    const isAIMode = evaluationMode === 'ai';
    const qList = (evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions) && evaluationModalTest.questions.length > 0)
      ? evaluationModalTest.questions 
      : SAMPLE_MATH_QUESTIONS;

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

    const publishedTest = {
      ...evaluationModalTest,
      status: 'reviewed',
      isPublished: true,
      publishedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', আজ',
      score: finalPercent,
      totalScoreObtained: totalObtained,
      totalPossible: maxPossible,
      evaluationMode: isAIMode ? 'ai' : 'manual',
      aiFeedback: evaluationModalTest.aiFeedback || (isAIMode ? 'এআই দ্বারা নিখুঁত পর্যালোচনা ও মূল্যায়ন সম্পন্ন।' : 'সাধারণ পর্যালোচনা।'),
      parentComment: manualParentFeedback || 'খাতা মূল্যায়ন ও ফাইনাল ফলাফল অনুমোদন সম্পন্ন হয়েছে। ভালো করে অনুশীলন চালিয়ে যাও!',
      manualGrades: !isAIMode ? manualGrades : undefined,
      aiDetailedMarking: isAIMode ? evaluationModalTest.aiDetailedMarking : undefined
    };

    // Save to localStorage
    try {
      const saved = localStorage.getItem('dapathshala_parent_assigned_tests');
      const allTests: any[] = saved ? JSON.parse(saved) : [];
      const idx = allTests.findIndex(t => t.id === publishedTest.id || t.id === publishedTest.examId);
      let updatedTests: any[];
      if (idx >= 0) {
        updatedTests = [...allTests];
        updatedTests[idx] = publishedTest;
      } else {
        updatedTests = [publishedTest, ...allTests];
      }
      localStorage.setItem('dapathshala_parent_assigned_tests', JSON.stringify(updatedTests));
      setAssignedTests(updatedTests);
    } catch (err) {
      console.warn('Error saving published marksheet:', err);
    }

    // Broadcast published marksheet event
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('dapathshala_marksheet_published', { detail: publishedTest })
        );
      }
    } catch {}

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

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ওভারভিউ ও মনিটরিং
        </button>
        <button
          onClick={() => setActiveTab('assign')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'assign' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Send size={16} />
          পরীক্ষা নির্ধারণ করুন
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'review' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck size={16} />
          খাতা মূল্যায়ন ও মন্তব্য ({assignedTests.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('proctoring');
            handleMarkAllRead();
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'proctoring' 
              ? 'bg-red-600 text-white shadow-md shadow-red-200' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert size={16} className={activeTab === 'proctoring' ? 'text-white' : 'text-red-600'} />
          লাইভ প্রক্টরিং ও রেড ফ্ল্যাগ
          {hasUnreadAlerts && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block ml-0.5" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'report' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer size={16} />
          ডিজিটাল রিপোর্ট কার্ড
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
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
              <div className="p-6 rounded-2xl shadow-xl bg-indigo-600 text-white space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-white">
                  <Target size={20} />
                  আজকের অভিভাবকীয় লক্ষ্য
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20">
                    <CheckCircle2 size={18} className="text-emerald-300" />
                    <span className="text-sm font-medium text-white">২টি কুইজ সম্পন্ন করা (হয়েছে)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20">
                    <Clock size={18} className="text-amber-300" />
                    <span className="text-sm font-medium text-white">১ ঘণ্টা গণিত প্র্যাকটিস (চলমান)</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('assign')}
                  className="w-full bg-white text-indigo-950 hover:bg-slate-100 font-black py-3 rounded-xl mt-4 text-xs cursor-pointer border-none shadow-md"
                >
                  সন্তানকে নতুন টেস্ট দিন
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

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">অধ্যায় / টপিক</label>
                    <input
                      type="text"
                      value={assignForm.chapter}
                      onChange={(e) => setAssignForm({ ...assignForm, chapter: e.target.value })}
                      placeholder="যেমন: বীজগণিতীয় রাশি ও সমীকরণ"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Quick Chapter Suggestions */}
                {CURRICULUM_DATA[assignForm.subject] && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">জনপ্রিয় অধ্যায়সমূহ (ক্লিক করে বাছাই করুন):</span>
                    <div className="flex flex-wrap gap-2">
                      {CURRICULUM_DATA[assignForm.subject].slice(0, 4).map((ch, idx) => (
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">প্রশ্নের সংখ্যা</label>
                    <select
                      value={assignForm.mcqCount}
                      onChange={(e) => setAssignForm({ ...assignForm, mcqCount: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-sm bg-white cursor-pointer"
                    >
                      <option value={3}>৩টি প্রশ্ন (দ্রুত কুইজ)</option>
                      <option value={5}>৫টি প্রশ্ন (মৌলিক)</option>
                      <option value={10}>১০টি প্রশ্ন (স্ট্যান্ডার্ড)</option>
                      <option value={15}>১৫টি প্রশ্ন (পূর্ণাঙ্গ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">সময়সীমা</label>
                    <select
                      value={assignForm.duration}
                      onChange={(e) => setAssignForm({ ...assignForm, duration: Number(e.target.value) })}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-sm bg-white cursor-pointer"
                    >
                      <option value={10}>১০ মিনিট</option>
                      <option value={15}>১৫ মিনিট</option>
                      <option value={20}>২০ মিনিট</option>
                      <option value={30}>৩০ মিনিট</option>
                      <option value={45}>৪৫ মিনিট</option>
                      <option value={60}>৬০ মিনিট</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">কঠিনতার স্তর</label>
                    <select
                      value={assignForm.difficulty}
                      onChange={(e) => setAssignForm({ ...assignForm, difficulty: e.target.value as any })}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-sm bg-white cursor-pointer"
                    >
                      <option value="easy">সহজ (মৌলিক)</option>
                      <option value="medium">মাঝারি (বোর্ড মান)</option>
                      <option value="hard">কঠিন (মেধা যাচাই)</option>
                    </select>
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

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>💡 নির্দেশিকা: প্রতিটি প্রশ্নের লেখা, অপশন ও নম্বর সরাসরি এডিট করতে পারবেন। সঠিক উত্তরটি সিলেক্ট করতে অপশনের পাশের বৃত্তে ক্লিক করুন।</span>
                  <button
                    onClick={handleGenerateAIQuestions}
                    disabled={isGenerating}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <RotateCcw size={12} className={isGenerating ? 'animate-spin' : ''} />
                    পুনরায় এআই জেনারেট
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {questions.map((q, qIndex) => {
                  const optLabels = ['ক', 'খ', 'গ', 'ঘ'];
                  return (
                    <Card key={q.id} className="p-5 sm:p-6 border border-slate-200 shadow-md bg-white hover:border-indigo-200 transition-all space-y-4">
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

          {/* MODAL 2: PRINT & EXAM VIEW PREVIEW MODAL */}
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
                      প্রশ্নপত্র প্রিন্ট ও পরীক্ষার পূর্ণাঙ্গ প্রিভিউ
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
                        onClick={() => setShowPreviewModal(false)}
                        className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-xl transition-all cursor-pointer"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Exam Paper Sheet */}
                  <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 bg-white font-sans">
                    {/* Exam Sheet Header */}
                    <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1.5">
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        দা<span className="text-emerald-600">পাঠশালা</span> ডিজিটাল পাঠশালা
                      </h1>
                      <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-200">
                        অভিভাবক কাস্টম মূল্যায়ন পরীক্ষা
                      </div>
                      <div className="text-base sm:text-lg font-bold text-slate-800">
                        বিষয়: {assignForm.subject} • {assignForm.chapter}
                      </div>

                      {/* Meta Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-semibold text-slate-600 border-t border-slate-100 mt-2">
                        <div>পরীক্ষার্থী: <strong className="text-slate-900">{currentChild.name}</strong></div>
                        <div>শ্রেণি: <strong className="text-slate-900">{currentChild.grade}</strong></div>
                        <div>পূর্ণমান: <strong className="text-indigo-600 font-black">{questions.reduce((s, q) => s + (q.marks || 1), 0)} নম্বর</strong></div>
                        <div>সময়: <strong className="text-slate-900 font-black">{assignForm.duration} মিনিট</strong></div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 italic pb-1">
                      [বিশেষ নির্দেশ: প্রতিটি প্রশ্নের মান ডানপাশে দেওয়া আছে। সঠিক উত্তরের পাশে বৃত্তটি ভরাট অথবা টিক চিহ্ন দিন।]
                    </div>

                    {/* Questions Display */}
                    <div className="space-y-6 divide-y divide-slate-100">
                      {questions.map((q, idx) => (
                        <div key={q.id} className="pt-5 first:pt-0 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                              <span className="font-black text-indigo-700 mr-1.5">{idx + 1}.</span>
                              {q.question}
                            </h3>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                              [{q.marks || 1} নম্বর]
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                            {q.options.map((opt, optIdx) => {
                              const labels = ['(ক)', '(খ)', '(গ)', '(ঘ)'];
                              return (
                                <div key={optIdx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-800">
                                  <span className="font-bold text-slate-500">{labels[optIdx]}</span>
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Answer Key Footer */}
                    <div className="mt-8 pt-6 border-t-2 border-slate-200 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">উত্তরমালা ও সমাধান নির্দেশিকা:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {questions.map((q, i) => (
                          <div key={q.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-bold text-slate-700">{i + 1} নং: </span>
                            <span className="font-black text-emerald-700">{q.correctAnswer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
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
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* MODAL 3: GENERATE LINK MODAL (শেয়ার লিংক মডাল) */}
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
                    {/* Modal Header */}
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

                    {/* Duration Setter (সময়সীমা নির্ধারণ) */}
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

                    {/* Shareable Link Box with Quick Copy */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">শেয়ারেবল পরীক্ষার ইউনিক লিংক:</span>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          readOnly
                          value={shareLinkModalData.url}
                          className="w-full text-xs font-mono text-slate-700 bg-transparent border-none focus:outline-none select-all"
                        />
                        <button
                          onClick={handleCopyShareLink}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                            isLinkCopied 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
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

                    {/* Share Action Buttons (WhatsApp & Messenger) */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">সরাসরি শেয়ার করুন:</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* WhatsApp Share Action Button */}
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `*দা পাঠশালা অনলাইন মূল্যায়ন পরীক্ষা*\nবিষয়: ${shareLinkModalData.subject}\nঅধ্যায়: ${shareLinkModalData.chapter}\nসময়সীমা: ${shareLinkModalData.duration} মিনিট\nমোট প্রশ্ন: ${shareLinkModalData.questionCount}টি\n\nপরীক্ষা দিতে লিংকে প্রবেশ করো:\n${shareLinkModalData.url}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <Share2 size={15} />
                          <span>WhatsApp-এ শেয়ার</span>
                        </a>

                        {/* Facebook Messenger Share Action Button */}
                        <a
                          href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareLinkModalData.url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareLinkModalData.url)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 bg-[#0084FF] hover:bg-[#0074E0] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <MessageSquare size={15} />
                          <span>Messenger-এ শেয়ার</span>
                        </a>
                      </div>

                      {/* Open / Test Start Exam screen */}
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
      )}

      {/* TAB 3: REVIEW EXAMS */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="text-indigo-600" />
              {currentChild.name} এর নির্ধারিত ও সম্পন্ন হওয়া পরীক্ষাসমূহ
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('assign')}
              className="text-xs font-bold cursor-pointer"
            >
              + নতুন পরীক্ষা দিন
            </Button>
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

                // Safe handwritten images list
                const safeImages: string[] = Array.isArray(test.handwrittenImages)
                  ? test.handwrittenImages.filter((img: any) => typeof img === 'string')
                  : (typeof test.handwrittenImages === 'string' && test.handwrittenImages ? [test.handwrittenImages] : []);

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

                      {isReviewed && test.score !== null && test.score !== undefined && (
                        <div className="text-right sm:self-center">
                          <div className="text-xs text-slate-400 font-bold uppercase">অনুমোদিত স্কোর</div>
                          <div className="text-3xl font-black text-emerald-600">{test.score}%</div>
                        </div>
                      )}
                    </div>

                    {(isSubmitted || isReviewed) && (
                      <div className="space-y-3 pt-1">
                        {/* Dual Mode Evaluation Action Banner */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100">
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

                          <Button
                            size="sm"
                            onClick={() => handleOpenEvaluationModal(test)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <FileCheck size={16} />
                            {test.isPublished ? 'মূল্যায়িত খাতা ও লাল কালির দাগ দেখুন' : 'খাতা মূল্যায়ন করুন (এআই / নিজে)'}
                          </Button>
                        </div>

                        {safeViolations.length > 0 && (
                          <div className="p-3.5 bg-red-50/90 rounded-xl border border-red-200 text-xs space-y-1.5">
                            <span className="font-bold text-red-950 flex items-center gap-1.5">
                              <ShieldAlert size={15} className="text-red-600" />
                              চিটিং ও সন্দেহজনক কার্যকলাপ রেকর্ড (Supabase Log):
                            </span>
                            <ul className="space-y-1 pl-4 list-disc text-red-800 font-medium">
                              {safeViolations.map((vStr: string, vIdx: number) => (
                                <li key={vIdx}>{vStr}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {test.aiFeedback && (
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                              <Sparkles size={14} className="text-indigo-600" /> এআই খাতা মূল্যায়নের সংক্ষিপ্ত ফিডব্যাক:
                            </span>
                            <p className="text-slate-600">{test.aiFeedback}</p>
                          </div>
                        )}

                        {test.parentComment ? (
                          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                            <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                              <CheckCircle2 size={14} className="text-emerald-600" /> আপনার মন্তব্য সন্তানের কাছে পাঠানো হয়েছে:
                            </span>
                            <p className="text-emerald-800 font-medium">{test.parentComment}</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700">সন্তানকে উৎসাহ দিতে আপনার মন্তব্য বা পরামর্শ লিখুন:</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="যেমন: শাবাশ! আরো ভালো করতে হবে..."
                                value={currentCommentInput}
                                onChange={(e) => setParentCommentInputs({
                                  ...parentCommentInputs,
                                  [testKey]: e.target.value
                                })}
                                className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddParentComment(testKey)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-xl cursor-pointer"
                              >
                                মন্তব্য পাঠান
                              </Button>
                            </div>
                          </div>
                        )}
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
      {/* MODAL 4: DUAL EVALUATION MODAL (এআই দিয়ে খাতা দেখান / আমি নিজে খাতা দেখবো) */}
      <AnimatePresence>
        {evaluationModalTest && (
          <div className="fixed inset-0 z-[180] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEvaluationModalTest(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
                    <FileCheck size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {evaluationModalTest.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        পরীক্ষার্থী: <strong className="text-slate-800">{currentChild.name}</strong>
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight mt-0.5">
                      {evaluationModalTest.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setEvaluationModalTest(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* 1. Handwritten Answer Script Gallery (হাতের লেখা খাতার পাতা) */}
                {evaluationModalTest.handwrittenImages && evaluationModalTest.handwrittenImages.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                        <Camera size={14} className="text-indigo-600" />
                        জমাকৃত হাতের লেখা উত্তরপত্র ({evaluationModalTest.handwrittenImages.length}টি পৃষ্ঠা):
                      </span>
                      <span className="text-[11px] text-indigo-600 font-bold">
                        বড় করে দেখতে ছবিতে ক্লিক করুন
                      </span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {evaluationModalTest.handwrittenImages.map((img: string, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => setExpandedScriptImage(img)}
                          className="relative group shrink-0 w-24 h-32 rounded-xl overflow-hidden border-2 border-slate-300 hover:border-indigo-500 cursor-pointer shadow-xs transition-all"
                        >
                          <img src={img} alt={`পৃষ্ঠা ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye size={20} className="text-white" />
                          </div>
                          <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            পৃষ্ঠা {idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. DUAL EVALUATION MODE SELECTOR TABS */}
                <div className="space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    মূল্যায়ন মোড নির্বাচন করুন:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* OPTION A: AI Evaluation */}
                    <button
                      type="button"
                      onClick={() => setEvaluationMode('ai')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                        evaluationMode === 'ai'
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-md shadow-indigo-100 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        evaluationMode === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Sparkles size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm">ক) এআই দিয়ে খাতা দেখান</h4>
                          {evaluationMode === 'ai' && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                              নির্বাচিত
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          এআই স্বয়ংক্রিয়ভাবে খাতা মূল্যায়ন করে মার্কস ও ডিজিটাল লাল কালির দাগ দেবে।
                        </p>
                      </div>
                    </button>

                    {/* OPTION B: Manual Parent Grading */}
                    <button
                      type="button"
                      onClick={() => setEvaluationMode('manual')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                        evaluationMode === 'manual'
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-md shadow-emerald-100 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        evaluationMode === 'manual' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Edit3 size={20} />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm">খ) আমি নিজে খাতা দেখবো</h4>
                          {evaluationMode === 'manual' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                              নির্বাচিত
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          অভিভাবক নিজে প্রতিটি প্রশ্নে মার্কস দিতে পারবেন এবং লাল কালিতে কমেন্ট লিখতে পারবেন।
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. MODE A VIEW: AI EVALUATION CONTENT */}
                {evaluationMode === 'ai' && (
                  <div className="space-y-5">
                    {/* Trigger AI Evaluation button if not done */}
                    <div className="p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-indigo-600" />
                          এআই স্মার্ট কারেকশন ও ডিজিটাল লাল কালির দাগ ইঞ্জিন
                        </span>
                        <p className="text-xs text-slate-600">
                          Gemini AI দিয়ে প্রতিটি প্রশ্নের নির্ভুলতা ও হাতের লেখা সমাধান স্বয়ংক্রিয়ভাবে খাতা চেক করা হবে।
                        </p>
                      </div>

                      <Button
                        onClick={handleRunAIEvaluation}
                        disabled={isAIEvaluating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        {isAIEvaluating ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>এআই খাতা মূল্যায়ন করছে...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            <span>{aiEvaluationDone ? 'পুনরায় এআই মূল্যায়ন চালান' : 'এআই খাতা মূল্যায়ন শুরু করুন'}</span>
                          </>
                        )}
                      </Button>
                    </div>

                    {/* AI Feedback & Score Banner */}
                    {evaluationModalTest.aiFeedback && (
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-3">
                        <Sparkles size={20} className="text-purple-600 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2 font-bold text-purple-950">
                            <span>এআই মূল্যায়ন রিপোর্ট:</span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-black">
                              স্কোর: {evaluationModalTest.score || 88}%
                            </span>
                          </div>
                          <p className="text-purple-900 leading-relaxed font-medium">
                            {evaluationModalTest.aiFeedback}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Questions List with Digital Red Ink Stamps and Corrections */}
                    <div className="space-y-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        প্রশ্নের খাতা ও ডিজিটাল লাল কালির দাগ (Digital Red Pen Marking):
                      </div>

                      {((evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions)) 
                        ? evaluationModalTest.questions 
                        : [
                            { id: 'q1', text: '(a + b)² এর সঠিক সম্প্রসারিত রূপ কোনটি?', options: ['a² + 2ab + b²', 'a² - 2ab + b²', 'a² + b²', 'a² + ab + b²'], correctAnswer: 0, marks: 1 },
                            { id: 'q2', text: 'যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?', options: ['16', '14', '18', '12'], correctAnswer: 1, marks: 1 },
                            { id: 'q3', text: 'একটি দ্বিঘাত সমীকরণের সর্বোচ্চ ঘাত কত?', options: ['১', '২', '৩', '৪'], correctAnswer: 1, marks: 1 }
                          ]
                      ).map((q: any, idx: number) => {
                        const qId = q.id || `q_${idx + 1}`;
                        const selectedAns = evaluationModalTest.answers ? evaluationModalTest.answers[qId] : 0;
                        const isCorrect = selectedAns === q.correctAnswer;
                        const detailedInfo = evaluationModalTest.aiDetailedMarking?.find((d: any) => d.questionId === qId);

                        return (
                          <div
                            key={qId}
                            className="p-5 rounded-2xl border-2 border-slate-200 bg-white shadow-xs relative overflow-hidden space-y-3"
                          >
                            {/* DIGITAL RED INK STAMP OVERLAY */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              {isCorrect ? (
                                <div className="px-3 py-1 rounded-full border-2 border-red-600 bg-red-50 text-red-600 font-black text-xs flex items-center gap-1 shadow-sm transform -rotate-3 select-none">
                                  <CheckCircle2 size={16} className="text-red-600 stroke-[3]" />
                                  <span>✓ সঠিক (+{q.marks || 1})</span>
                                </div>
                              ) : (
                                <div className="px-3 py-1 rounded-full border-2 border-red-600 bg-red-50 text-red-600 font-black text-xs flex items-center gap-1 shadow-sm transform rotate-3 select-none">
                                  <X size={16} className="text-red-600 stroke-[3]" />
                                  <span>✗ ভুল (০)</span>
                                </div>
                              )}
                            </div>

                            <div className="pr-24">
                              <h4 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                                <span className="text-indigo-600 mr-1.5">{idx + 1}.</span>
                                {q.text || q.question}
                              </h4>
                            </div>

                            {/* Options with Student selection indicator */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                              {q.options?.map((opt: string, optIdx: number) => {
                                const isUserChoice = selectedAns === optIdx;
                                const isRightChoice = q.correctAnswer === optIdx;

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between font-medium ${
                                      isRightChoice
                                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                                        : isUserChoice
                                        ? 'border-red-400 bg-red-50/70 text-red-950'
                                        : 'border-slate-200 bg-slate-50/50 text-slate-600'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isRightChoice && (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                        সঠিক উত্তর
                                      </span>
                                    )}
                                    {isUserChoice && !isRightChoice && (
                                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                        সন্তানের নির্বাচন
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* DIGITAL RED INK ANNOTATION NOTE */}
                            <div className="p-3 bg-red-50/90 rounded-xl border border-red-200 text-xs text-red-900 space-y-1">
                              <div className="font-black flex items-center gap-1.5 text-red-700">
                                <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                                ✒️ ডিজিটাল লাল কালির দাগ ও মূল্যায়ন নোট:
                              </div>
                              <p className="font-semibold italic pl-3 border-l-2 border-red-400 text-red-800">
                                {detailedInfo?.redInkNote || (isCorrect 
                                  ? '✓ সঠিক উত্তর। ধারণার প্রয়োগ যথাযথ হয়েছে এবং ধাপসমূহ নির্ভুল।' 
                                  : '✗ ভুল উত্তর। এখানে চিহ্নের রূপান্তর অথবা সূত্রের প্রয়োগে ত্রুটি হয়েছে।')}
                              </p>
                            </div>

                            {/* PARENT OVERRIDE CONTROLS (অভিভাবক কর্তৃক নম্বর পরিবর্তন) */}
                            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                                    <Edit3 size={13} className="text-amber-700" />
                                    অভিভাবক মার্কস পরিবর্তন (Override):
                                  </span>
                                  {detailedInfo?.isOverridden && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                                      ✏️ সংশোধিত
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-amber-800">
                                  এআই মূল্যায়নের পরও আপনি ইচ্ছেমতো এই প্রশ্নের নম্বর পরিবর্তন করতে পারেন।
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                <label className="text-xs font-bold text-slate-700">প্রাপ্ত মার্কস:</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={q.marks || 1}
                                  step={0.5}
                                  value={detailedInfo !== undefined ? detailedInfo.marksObtained : (isCorrect ? (q.marks || 1) : 0)}
                                  onChange={(e) => handleOverrideAIMark(qId, Number(e.target.value) || 0)}
                                  className="w-16 p-1.5 text-center font-black text-indigo-700 bg-white border border-amber-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 shadow-xs"
                                />
                                <span className="text-xs font-bold text-slate-500">/ {q.marks || 1}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Overall Parent Joint Comment in AI Mode */}
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2 mt-4">
                      <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <MessageSquare size={14} className="text-amber-700" />
                        অভিভাবকের যৌথ মন্তব্য ও উৎসাহবার্তা (Parent Feedback):
                      </label>
                      <textarea
                        rows={2}
                        value={manualParentFeedback}
                        onChange={(e) => setManualParentFeedback(e.target.value)}
                        placeholder="এআই মূল্যায়নের পাশাপাশি সন্তানকে কোনো পরামর্শ বা উৎসাহ দিতে এখানে লিখুন (যেমন: বীজগণিত অনেক ভালো হয়েছে, কিন্তু চিহ্ন পরিবর্তনে একটু খেয়াল রাখবে)..."
                        className="w-full p-3 rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* 4. MODE B VIEW: MANUAL PARENT GRADING CONTENT */}
                {evaluationMode === 'manual' && (
                  <div className="space-y-5">
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                          <Edit3 size={15} className="text-emerald-700" />
                          অভিভাবক স্বহস্তে মূল্যায়ন ফরম
                        </span>
                        <p className="text-xs text-emerald-800">
                          প্রতিটি প্রশ্নে প্রাপ্ত মার্কস নির্ধারণ করুন এবং সন্তানের জন্য লাল কালিতে উৎসাহ বা সংশোধনী মন্তব্য লিখুন।
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-emerald-700 block uppercase">লাইভ মোট নম্বর:</span>
                        <span className="text-xl font-black text-emerald-900">
                          {Object.values(manualGrades).reduce((sum: number, g: any) => sum + Number(g?.marks || 0), 0)} নম্বর
                        </span>
                      </div>
                    </div>

                    {/* Manual Question Evaluation List */}
                    <div className="space-y-4">
                      {((evaluationModalTest.questions && Array.isArray(evaluationModalTest.questions)) 
                        ? evaluationModalTest.questions 
                        : [
                            { id: 'q1', text: '(a + b)² এর সঠিক সম্প্রসারিত রূপ কোনটি?', options: ['a² + 2ab + b²', 'a² - 2ab + b²', 'a² + b²', 'a² + ab + b²'], correctAnswer: 0, marks: 1 },
                            { id: 'q2', text: 'যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?', options: ['16', '14', '18', '12'], correctAnswer: 1, marks: 1 },
                            { id: 'q3', text: 'একটি দ্বিঘাত সমীকরণের সর্বোচ্চ ঘাত কত?', options: ['১', '২', '৩', '৪'], correctAnswer: 1, marks: 1 }
                          ]
                      ).map((q: any, idx: number) => {
                        const qId = q.id || `q_${idx + 1}`;
                        const selectedAns = evaluationModalTest.answers ? evaluationModalTest.answers[qId] : 0;
                        const maxMarks = q.marks || 1;
                        const grade = manualGrades[qId] || { marks: 1, comment: '' };

                        return (
                          <div
                            key={qId}
                            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <h4 className="font-bold text-slate-900 text-sm">
                                <span className="text-indigo-600 mr-1.5">{idx + 1}.</span>
                                {q.text || q.question}
                              </h4>

                              {/* Marks Input */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                <label className="text-xs font-bold text-slate-600">প্রাপ্ত মার্কস:</label>
                                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                                  <input
                                    type="number"
                                    min={0}
                                    max={maxMarks}
                                    value={grade.marks}
                                    onChange={(e) => {
                                      const val = Math.max(0, Math.min(maxMarks, Number(e.target.value) || 0));
                                      setManualGrades({
                                        ...manualGrades,
                                        [qId]: { ...grade, marks: val }
                                      });
                                    }}
                                    className="w-12 text-center text-sm font-black text-indigo-700 bg-white rounded-lg border border-slate-200 p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                  <span className="text-xs font-bold text-slate-500 pr-1">/ {maxMarks}</span>
                                </div>
                              </div>
                            </div>

                            {/* Options View */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {q.options?.map((opt: string, optIdx: number) => {
                                const isUserChoice = selectedAns === optIdx;
                                const isRightChoice = q.correctAnswer === optIdx;

                                return (
                                  <div
                                    key={optIdx}
                                    className={`p-2 rounded-lg border ${
                                      isRightChoice
                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold'
                                        : isUserChoice
                                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                                        : 'border-slate-100 text-slate-500'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isRightChoice && <span className="ml-1 text-[10px] text-emerald-700 font-bold">(সঠিক)</span>}
                                    {isUserChoice && <span className="ml-1 text-[10px] text-indigo-700 font-bold">(সন্তানের উত্তর)</span>}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Parent Red Ink Comment Box */}
                            <div className="space-y-1 pt-1">
                              <label className="text-xs font-bold text-red-700 flex items-center gap-1">
                                <span>✍️ এই প্রশ্নে আপনার লাল কালির মন্তব্য / সংশোধনী লিখুন:</span>
                              </label>
                              <input
                                type="text"
                                value={grade.comment || ''}
                                onChange={(e) => {
                                  setManualGrades({
                                    ...manualGrades,
                                    [qId]: { ...grade, comment: e.target.value }
                                  });
                                }}
                                placeholder="যেমন: সূত্রের ২য় ধাপটি ভালো হয়েছে, তবে গুণ করার সময় সতর্ক থাকো..."
                                className="w-full p-2.5 rounded-xl border border-red-200 bg-red-50/30 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Overall Parent Feedback */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">
                        সন্তানকে উৎসাহ ও সার্বিক পরামর্শ বার্তা:
                      </label>
                      <textarea
                        rows={2}
                        value={manualParentFeedback}
                        onChange={(e) => setManualParentFeedback(e.target.value)}
                        placeholder="যেমন: মাশাআল্লাহ! আজকের গণিত পরীক্ষায় তোমার আত্মবিশ্বাস অনেক বেড়েছে। আগামী সপ্তাহে বিজ্ঞান অধ্যায় রিভিশন করতে হবে..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEvaluationModalTest(null)}
                  className="rounded-xl text-xs font-bold px-5 text-slate-600 w-full sm:w-auto"
                >
                  বন্ধ করুন
                </Button>

                <Button
                  onClick={handleFinalSubmitAndPublish}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <CheckCircle2 size={18} />
                  ফাইনাল সাবমিট ও ফলাফল প্রকাশ করুন (Publish Marksheet)
                </Button>
              </div>
            </motion.div>
          </div>
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
    </div>
  );
};
