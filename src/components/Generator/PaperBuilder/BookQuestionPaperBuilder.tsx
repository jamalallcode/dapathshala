import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Printer, 
  Copy, 
  Sparkles, 
  Check, 
  Search, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Bookmark,
  Share2,
  HelpCircle,
  Eye,
  RefreshCw,
  FolderPlus,
  Layers,
  Award,
  Database,
  Cloud,
  Pencil,
  ChevronUp,
  ChevronDown,
  Clock,
  Flame,
  Zap,
  Sprout,
  ArrowLeft,
  CheckCheck,
  LayoutGrid,
  List,
  Columns2,
  Columns3,
  CircleDot,
  Split,
  SkipForward,
  X,
  Maximize2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_BOOK_QUESTIONS, SUBJECT_TOPIC_MAP, BookQuestion, resolveDifficulty } from '../../../data/initialBookQuestions';
import { EXTENDED_NCTB_QUESTIONS } from '../../../data/extendedNctbQuestions';
import { AutoScrollHorizontalRow } from '../../Common/AutoScrollHorizontalRow';
import { getAllQuestionLifetimeUsage, incrementQuestionLifetimeUsage } from '../../../utils/questionUsageTracker';
import { MathFormulaRenderer } from '../../Common/MathFormulaRenderer';
import { QuestionGenerationWizard, QuestionWizardConfig } from './QuestionGenerationWizard';
import { PremiumBackButton } from '../../Common/PremiumBackButton';

// Helper function to deduplicate questions by normalized question text and subject
export const deduplicateBookQuestions = (list: BookQuestion[]): BookQuestion[] => {
  const seenTexts = new Set<string>();
  const seenIds = new Set<string>();
  const result: BookQuestion[] = [];

  for (const item of list) {
    if (!item || !item.question) continue;
    if (item.id && seenIds.has(item.id)) continue;

    // Normalize: trim, lowercase, collapse whitespace, strip common ending punctuation (? | . ! : , etc.)
    const cleanQ = item.question
      .trim()
      .toLowerCase()
      .replace(/[\s\t\n]+/g, ' ')
      .replace(/[?|।.,!?:;'"-]+$/g, '')
      .trim();

    const cleanSubject = (item.subject || '').trim().toLowerCase();
    const key = `${cleanSubject}:::${cleanQ}`;

    if (!seenTexts.has(key)) {
      seenTexts.add(key);
      if (item.id) seenIds.add(item.id);
      result.push(item);
    }
  }

  return result;
};

// Helper function to format numbers to Bengali numerals with high legibility
export const toBengaliNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
};

export default function BookQuestionPaperBuilder() {
  // Persistence key
  const LOCAL_STORAGE_CUSTOM_QUESTIONS = 'dapathshala_custom_book_questions';
  const LOCAL_STORAGE_SAVED_PAPER = 'dapathshala_current_question_paper';
  const LOCAL_STORAGE_PAPER_HEADER = 'dapathshala_question_paper_header';

  // Bank questions state (built-in + user added + extended NCTB questions)
  const [allQuestions, setAllQuestions] = useState<BookQuestion[]>(() => 
    deduplicateBookQuestions([...INITIAL_BOOK_QUESTIONS, ...EXTENDED_NCTB_QUESTIONS])
  );
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('supabase');
  const [selectedSubject, setSelectedSubject] = useState<string>('বাংলা');
  const [selectedClass, setSelectedClass] = useState<string>('১০ম শ্রেণি');
  const [selectedTopic, setSelectedTopic] = useState<string>('কারক ও বিভক্তি');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const questionsPerPage = 6;

  // Selected Paper Questions
  const [paperQuestions, setPaperQuestions] = useState<BookQuestion[]>([]);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);

  // Independent scrolling refs for bank and paper
  const leftScrollContainerRef = useRef<HTMLDivElement>(null);
  const rightPaperScrollContainerRef = useRef<HTMLDivElement>(null);
  const latestPaperQuestionRef = useRef<HTMLDivElement>(null);

  // Question Generation Wizard state (Modal or View)
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Paper Header Info
  const [paperHeader, setPaperHeader] = useState({
    institutionName: 'দা পাঠশালা মডেল একাডেমি',
    examTitle: '১ম সাময়িক মডেল টেস্ট পরীক্ষা - ২০২৬',
    classLevel: '১০ম শ্রেণি',
    subject: 'বাংলা ১ম ও ২য় পত্র',
    duration: '৪৫ মিনিট',
    fullMarks: '২৫',
    instructions: 'প্রতিটি প্রশ্নের মান ১। সঠিক উত্তরের বৃত্তটি বলপয়েন্ট কলম দিয়ে ভরাট করো।'
  });

  // Core Main View Switcher: 'bank' (১. প্রশ্ন ব্যাংক) vs 'paper' (২. প্রশ্নপত্র তৈরি হচ্ছে)
  const [activeMainView, setActiveMainView] = useState<'bank' | 'paper'>('bank');

  // Question Difficulty Filters: 'সহজ', 'মাঝারি', 'কঠিন'
  const [selectedDifficulties, setSelectedDifficulties] = useState<('সহজ' | 'মাঝারি' | 'কঠিন')[]>(['সহজ', 'মাঝারি', 'কঠিন']);

  // Lifetime usage stats for questions (saved in localStorage)
  const [usageStats, setUsageStats] = useState<Record<string, number>>(() => getAllQuestionLifetimeUsage());

  // Listen for live lifetime usage updates across sessions/tabs
  useEffect(() => {
    const handleUsageSync = () => {
      setUsageStats(getAllQuestionLifetimeUsage());
    };
    window.addEventListener('question_usage_updated', handleUsageSync);
    window.addEventListener('storage', handleUsageSync);
    return () => {
      window.removeEventListener('question_usage_updated', handleUsageSync);
      window.removeEventListener('storage', handleUsageSync);
    };
  }, []);

  // Auto-scroll the paper preview container internally (isolated strictly to the right container without moving the window or left panel)
  useEffect(() => {
    if (lastAddedId && paperQuestions.length > 0) {
      const timer = setTimeout(() => {
        const container = rightPaperScrollContainerRef.current;
        if (container) {
          const latestPaperItem = document.getElementById(`paper-q-${paperQuestions.length - 1}`);
          if (latestPaperItem) {
            const containerRect = container.getBoundingClientRect();
            const itemRect = latestPaperItem.getBoundingClientRect();
            const relativeOffset = itemRect.top - containerRect.top;
            container.scrollTo({
              top: container.scrollTop + relativeOffset - 20,
              behavior: 'smooth'
            });
          } else {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [paperQuestions.length, lastAddedId]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<BookQuestion | null>(null);
  const [mobileActiveView, setMobileActiveView] = useState<'bank' | 'paper'>('bank');
  const [editToast, setEditToast] = useState<string | null>(null);
  const [showAnswersInPaper, setShowAnswersInPaper] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isLayoutSidebarOpen, setIsLayoutSidebarOpen] = useState(true);

  // Fullscreen Fresh Paper View State (কোনো এডিট অপশন ছাড়া সম্পূর্ণ স্ক্রিন জুড়ে ফ্রেশ প্রশ্নপত্র)
  const [isFullscreenPaperOpen, setIsFullscreenPaperOpen] = useState(false);
  const [freshPaperShowAnswers, setFreshPaperShowAnswers] = useState(false);

  // Escape key closes fullscreen fresh paper view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreenPaperOpen) {
        setIsFullscreenPaperOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenPaperOpen]);

  // Options Layout & Styling Preferences
  const [optionsColumns, setOptionsColumns] = useState<'1' | '2'>(() => {
    try {
      const saved = localStorage.getItem('book_paper_options_cols');
      if (saved === '1' || saved === '2') return saved;
      return '2';
    } catch (e) {
      return '2';
    }
  });

  const [optionsPrefix, setOptionsPrefix] = useState<'bracket' | 'circle' | 'sequential' | 'alpha'>(() => {
    try {
      const saved = localStorage.getItem('book_paper_options_prefix');
      if (saved === 'circle' || saved === 'sequential' || saved === 'alpha' || saved === 'bracket') return saved;
      return 'bracket';
    } catch (e) {
      return 'bracket';
    }
  });

  const handleSetColumns = (cols: '1' | '2') => {
    setOptionsColumns(cols);
    try {
      localStorage.setItem('book_paper_options_cols', cols);
    } catch (e) {}
    showToast(`অপশন কলাম: ${cols === '1' ? '১টি (উপর-নিচে)' : '২টি (ডানে-বামে)'}`);
  };

  const handleSetPrefix = (prefix: 'bracket' | 'circle' | 'sequential' | 'alpha') => {
    setOptionsPrefix(prefix);
    try {
      localStorage.setItem('book_paper_options_prefix', prefix);
    } catch (e) {}
    showToast(`অপশন প্রতীক: ${prefix === 'bracket' ? 'ফার্স্ট ব্র্যাকেট (ক)' : prefix === 'circle' ? 'গোল বৃত্ত ◯' : prefix === 'sequential' ? 'ক্রমিক ১.' : 'বর্ণ ক.'}`);
  };

  const showToast = (msg: string) => {
    setEditToast(msg);
    setTimeout(() => setEditToast(null), 3000);
  };

  // Paper Questions Layout & Two-Column Divider Preferences
  const [paperColumns, setPaperColumns] = useState<'1' | '2'>(() => {
    try {
      const saved = localStorage.getItem('book_paper_columns_count');
      if (saved === '1' || saved === '2') return saved;
      return '2'; // Default to 2 columns for professional question paper
    } catch (e) {
      return '2';
    }
  });

  const [paperDivider, setPaperDivider] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('book_paper_divider_enabled');
      if (saved === 'false') return false;
      return true; // Default to having a divider
    } catch (e) {
      return true;
    }
  });

  const [paperDividerStyle, setPaperDividerStyle] = useState<'solid' | 'dashed' | 'double'>(() => {
    try {
      const saved = localStorage.getItem('book_paper_divider_style');
      if (saved === 'dashed' || saved === 'double' || saved === 'solid') return saved;
      return 'solid';
    } catch (e) {
      return 'solid';
    }
  });

  const handleSetPaperColumns = (cols: '1' | '2') => {
    setPaperColumns(cols);
    try {
      localStorage.setItem('book_paper_columns_count', cols);
    } catch (e) {}
    showToast(`প্রশ্নপত্র লেআউট: ${cols === '2' ? '২ কলাম (বামে ও ডানে)' : '১ কলাম (স্বাভাবিক)'}`);
  };

  const handleTogglePaperDivider = () => {
    setPaperDivider((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('book_paper_divider_enabled', String(next));
      } catch (e) {}
      showToast(`মাঝখানের ডিভাইডার বর্ডার: ${next ? 'চালু করা হয়েছে' : 'বন্ধ করা হয়েছে'}`);
      return next;
    });
  };

  const handleSetPaperDividerStyle = (style: 'solid' | 'dashed' | 'double') => {
    setPaperDividerStyle(style);
    try {
      localStorage.setItem('book_paper_divider_style', style);
    } catch (e) {}
    showToast(`ডিভাইডার স্টাইল: ${style === 'solid' ? 'সলিড লাইন' : style === 'dashed' ? 'ড্যাশড লাইন' : 'ডাবল লাইন'}`);
  };

  const [newQuestionForm, setNewQuestionForm] = useState({
    subject: 'বাংলা',
    classLevel: '৯ম-১০ম শ্রেণি',
    topic: 'কারক ও বিভক্তি',
    bookName: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
    pageNumber: '',
    question: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    answer: '',
    explanation: '',
    yearOrBoard: '',
    difficulty: 'সহজ' as 'সহজ' | 'মাঝারি' | 'কঠিন'
  });

  // Load custom questions and active paper from localStorage & DB
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(LOCAL_STORAGE_CUSTOM_QUESTIONS);
      const customList: BookQuestion[] = savedCustom ? JSON.parse(savedCustom) : [];
      // Deduplicate custom list and clean up localStorage
      const cleanCustom = deduplicateBookQuestions(customList);
      try {
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_QUESTIONS, JSON.stringify(cleanCustom));
      } catch (e) {}
      
      // Combine with INITIAL_BOOK_QUESTIONS and EXTENDED_NCTB_QUESTIONS and deduplicate strictly
      const combined = deduplicateBookQuestions([...cleanCustom, ...INITIAL_BOOK_QUESTIONS, ...EXTENDED_NCTB_QUESTIONS]);
      setAllQuestions(combined);

      const savedPaper = localStorage.getItem(LOCAL_STORAGE_SAVED_PAPER);
      if (savedPaper) {
        const parsed = JSON.parse(savedPaper);
        if (Array.isArray(parsed)) {
          // Strictly deduplicate by text & ID to guarantee unique questions in paper
          const uniquePaper = deduplicateBookQuestions(parsed);
          setPaperQuestions(uniquePaper);
          localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(uniquePaper));
        }
      } else {
        // Pre-populate with first 3 questions as interactive starter
        const starters = INITIAL_BOOK_QUESTIONS.filter(q => q.topic === 'কারক ও বিভক্তি').slice(0, 3);
        setPaperQuestions(deduplicateBookQuestions(starters));
      }

      const savedHeader = localStorage.getItem(LOCAL_STORAGE_PAPER_HEADER);
      if (savedHeader) {
        setPaperHeader(JSON.parse(savedHeader));
      }
    } catch (err) {
      console.error("Error loading persisted question paper data:", err);
    }

    // Fetch from Supabase Cloud API
    fetch("/api/bank/questions")
      .then(res => res.json())
      .then(data => {
        if (data.source) {
          setDataSource(data.source);
          setIsCloudConnected(data.source === 'supabase');
        }
        if (data.questions && data.questions.length > 0) {
          setAllQuestions(prev => deduplicateBookQuestions([...data.questions, ...prev]));
        }
      })
      .catch(err => {
        console.log("DB questions sync note:", err.message);
        setIsCloudConnected(false);
      });

    // Check URL parameters (e.g. ?subject=গণিত&class=১০ম&topic=বীজগণিতীয় রাশি)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSubject = urlParams.get('subject');
      const urlClass = urlParams.get('class');
      const urlTopic = urlParams.get('topic');
      const urlDifficulty = urlParams.get('difficulty');

      if (urlDifficulty && ['সহজ', 'মাঝারি', 'কঠিন'].includes(urlDifficulty)) {
        setSelectedDifficulties([urlDifficulty as 'সহজ' | 'মাঝারি' | 'কঠিন']);
      }

      if (urlSubject) {
        setSelectedSubject(urlSubject);
        if (urlTopic) {
          setSelectedTopic(urlTopic);
        } else {
          const topics = SUBJECT_TOPIC_MAP[urlSubject] || ['সকল অধ্যায়'];
          setSelectedTopic(topics[0] || 'সকল অধ্যায়');
        }
        setPaperHeader(prev => ({
          ...prev,
          subject: urlSubject === 'গণিত' ? '১০ম শ্রেণি সাধারণ গণিত' : `${urlSubject} পরীক্ষা`,
          classLevel: urlClass ? (urlClass.includes('শ্রেণি') ? urlClass : `${urlClass} শ্রেণি`) : prev.classLevel
        }));
      }

      if (urlClass) {
        const normalizedClass = urlClass.includes('শ্রেণি') ? urlClass : `${urlClass} শ্রেণি`;
        setSelectedClass(normalizedClass);
      }
    } catch (err) {
      console.warn("URL params parse warning:", err);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(paperQuestions));
    } catch (e) {
      // ignore
    }
  }, [paperQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PAPER_HEADER, JSON.stringify(paperHeader));
    } catch (e) {
      // ignore
    }
  }, [paperHeader]);

  // Available topics for selected subject
  const availableTopics = useMemo(() => {
    if (selectedSubject === 'অংক') {
      return SUBJECT_TOPIC_MAP['গণিত'] || ['সকল অধ্যায়'];
    }
    if (selectedSubject === 'বিজ্ঞান') {
      return [
        'সকল অধ্যায়',
        ...(SUBJECT_TOPIC_MAP['পদার্থবিজ্ঞান'] || []).filter(t => t !== 'সকল অধ্যায়'),
        ...(SUBJECT_TOPIC_MAP['রসায়ন'] || []).filter(t => t !== 'সকল অধ্যায়'),
        ...(SUBJECT_TOPIC_MAP['জীববিজ্ঞান'] || []).filter(t => t !== 'সকল অধ্যায়')
      ];
    }
    return SUBJECT_TOPIC_MAP[selectedSubject] || ['সকল অধ্যায়'];
  }, [selectedSubject]);

  // When subject changes, set topic to first valid topic
  const handleSubjectChange = (subj: string) => {
    setSelectedSubject(subj);
    setSelectedTopic('সকল অধ্যায়');
    setCurrentPage(1);
    setPaperHeader(prev => ({ ...prev, subject: `${subj} পরীক্ষা` }));
  };

  // Difficulty toggle helpers
  const handleToggleDifficulty = (diff: 'সহজ' | 'মাঝারি' | 'কঠিন') => {
    setSelectedDifficulties(prev => {
      if (prev.includes(diff)) {
        const remaining = prev.filter(d => d !== diff);
        return remaining.length === 0 ? ['সহজ', 'মাঝারি', 'কঠিন'] : remaining;
      } else {
        return [...prev, diff];
      }
    });
    setCurrentPage(1);
  };

  const handleSelectOnlyDifficulty = (diff: 'সহজ' | 'মাঝারি' | 'কঠিন') => {
    setSelectedDifficulties([diff]);
    setCurrentPage(1);
  };

  const handleSelectAllDifficulties = () => {
    setSelectedDifficulties(['সহজ', 'মাঝারি', 'কঠিন']);
    setCurrentPage(1);
  };

  // Compute question counts per difficulty for the currently selected subject & class
  const difficultyCounts = useMemo(() => {
    const counts = { 'সহজ': 0, 'মাঝারি': 0, 'কঠিন': 0 };
    allQuestions.forEach(q => {
      const matchSubject = !selectedSubject || selectedSubject === 'সকল বিষয়' || 
        ((selectedSubject === 'অংক' || selectedSubject === 'গণিত') && (q.subject === 'গণিত' || q.subject === 'অংক')) ||
        (selectedSubject === 'বিজ্ঞান' && ['বিজ্ঞান', 'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান'].includes(q.subject)) ||
        q.subject === selectedSubject;
      
      const matchClass = !selectedClass || selectedClass === 'সকল শ্রেণি' || 
        q.classLevel === selectedClass ||
        (selectedClass === '১০ম শ্রেণি' && (q.classLevel === '১০ম শ্রেণি' || q.classLevel === '৯ম-১০ম শ্রেণি')) ||
        (selectedClass === '৯ম শ্রেণি' && (q.classLevel === '৯ম শ্রেণি' || q.classLevel === '৯ম-১০ম শ্রেণি'));

      if (matchSubject && matchClass) {
        const diff = resolveDifficulty(q);
        counts[diff] = (counts[diff] || 0) + 1;
      }
    });
    return counts;
  }, [allQuestions, selectedSubject, selectedClass]);

  // Filter questions based on Subject, Topic, Class, Difficulty & Search Query
  const filteredQuestions = useMemo(() => {
    const raw = allQuestions.filter(q => {
      const matchSubject = !selectedSubject || selectedSubject === 'সকল বিষয়' || 
        ((selectedSubject === 'অংক' || selectedSubject === 'গণিত') && (q.subject === 'গণিত' || q.subject === 'অংক')) ||
        (selectedSubject === 'বিজ্ঞান' && ['বিজ্ঞান', 'পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান'].includes(q.subject)) ||
        q.subject === selectedSubject;

      const matchTopic = !selectedTopic || selectedTopic === 'সকল অধ্যায়' || q.topic === selectedTopic;

      const matchClass = !selectedClass || selectedClass === 'সকল শ্রেণি' || 
        q.classLevel === selectedClass ||
        (selectedClass === '১০ম শ্রেণি' && (q.classLevel === '১০ম শ্রেণি' || q.classLevel === '৯ম-১০ম শ্রেণি')) ||
        (selectedClass === '৯ম শ্রেণি' && (q.classLevel === '৯ম শ্রেণি' || q.classLevel === '৯ম-১০ম শ্রেণি'));

      const qDiff = resolveDifficulty(q);
      const matchDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(qDiff);

      const matchSearch = !searchQuery || 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.bookName && q.bookName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchSubject && matchTopic && matchClass && matchDifficulty && matchSearch;
    });

    return deduplicateBookQuestions(raw);
  }, [allQuestions, selectedSubject, selectedTopic, selectedClass, selectedDifficulties, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / questionsPerPage));
  const displayedQuestions = useMemo(() => {
    const startIdx = (currentPage - 1) * questionsPerPage;
    return filteredQuestions.slice(startIdx, startIdx + questionsPerPage);
  }, [filteredQuestions, currentPage]);

  // Auto-scroll inside Question Bank to smoothly bring the next question into clear view without cutting off or jumping
  const scrollToNextQuestion = (currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < displayedQuestions.length) {
      const nextQ = displayedQuestions[nextIndex];
      setFocusedQuestionId(nextQ.id);

      setTimeout(() => {
        const nextEl = document.getElementById(`bank-q-${nextQ.id}`);
        const container = leftScrollContainerRef.current;
        if (nextEl) {
          if (container && container.scrollHeight > container.clientHeight && container.clientHeight > 0) {
            let elementTop = 0;
            let curr: HTMLElement | null = nextEl;
            while (curr && curr !== container) {
              elementTop += curr.offsetTop;
              curr = curr.offsetParent as HTMLElement | null;
            }
            container.scrollTo({
              top: Math.max(0, elementTop - 20),
              behavior: 'smooth'
            });
          } else {
            const rect = nextEl.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetY = scrollTop + rect.top - 80;
            window.scrollTo({
              top: Math.max(0, targetY),
              behavior: 'smooth'
            });
          }
        }
      }, 50);

      setTimeout(() => {
        setFocusedQuestionId(null);
      }, 1500);
    } else if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      showToast('পরবর্তী পৃষ্ঠার প্রশ্নসমূহ আনা হয়েছে');
    } else {
      showToast('এই অধ্যায়/টপিকের সকল প্রশ্ন দেখা সম্পন্ন হয়েছে');
    }
  };

  // Handle skip button click: brings the next question to top without adding to paper
  const handleSkipQuestion = (currentIndex: number) => {
    scrollToNextQuestion(currentIndex);
    showToast('পরবর্তী প্রশ্ন আনা হয়েছে (Skip করা হয়েছে)');
  };

  // Add question to paper with lifetime usage tracking & duplicate prevention
  const handleAddToPaper = (question: BookQuestion, questionIndex?: number) => {
    const cleanQ = question.question.trim().toLowerCase().replace(/[\s\t\n]+/g, ' ');
    const alreadyInPaper = paperQuestions.some(item => 
      item.id === question.id || 
      item.question.trim().toLowerCase().replace(/[\s\t\n]+/g, ' ') === cleanQ
    );

    if (alreadyInPaper) {
      showToast('প্রশ্নটি ইতিমধ্যে প্রশ্নপত্রে যুক্ত আছে');
      return;
    }

    setPaperQuestions(prev => {
      if (prev.some(item => item.id === question.id || item.question.trim().toLowerCase().replace(/[\s\t\n]+/g, ' ') === cleanQ)) {
        return prev;
      }
      setLastAddedId(question.id);
      setTimeout(() => {
        setLastAddedId(null);
      }, 2000);
      const updated = [...prev, question];
      try {
        localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });

    // Permanently record lifetime question usage count in localStorage
    const updatedLifetimeCount = incrementQuestionLifetimeUsage(question.id);
    setUsageStats(prev => ({ ...prev, [question.id]: updatedLifetimeCount }));
    showToast('প্রশ্নটি প্রশ্নপত্রে যোগ হয়েছে');

    // Auto-scroll next question smoothly up so teacher can continuously select questions
    if (typeof questionIndex === 'number') {
      scrollToNextQuestion(questionIndex);
    }
  };

  // Remove question from paper and update storage
  const handleRemoveFromPaper = (id: string) => {
    setPaperQuestions(prev => {
      const updated = prev.filter(q => q.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
    showToast('প্রশ্নপত্র থেকে বাদ দেওয়া হয়েছে');
  };

  // Handle paper generated from QuestionGenerationWizard
  const handleGenerateFromWizard = (selectedQuestions: BookQuestion[], config: QuestionWizardConfig) => {
    // Increment lifetime usage for all chosen questions
    const updatedStats = { ...usageStats };
    selectedQuestions.forEach(q => {
      const count = incrementQuestionLifetimeUsage(q.id);
      updatedStats[q.id] = count;
    });
    setUsageStats(updatedStats);

    // Update current paper questions with chosen questions (deduplicated)
    const newPaper = deduplicateBookQuestions(selectedQuestions);
    setPaperQuestions(newPaper);
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(newPaper));
    } catch (e) {}

    // Update paper header based on wizard config
    const subjectsText = config.selectedSubjects.join(' ও ');
    setPaperHeader(prev => {
      const updatedHeader = {
        ...prev,
        classLevel: config.selectedClass,
        subject: `${subjectsText} ${config.selectedTopics.length > 0 ? `(${config.selectedTopics.slice(0, 2).join(', ')})` : ''}`.trim(),
        fullMarks: String(newPaper.length),
        duration: newPaper.length <= 10 ? '১৫ মিনিট' : newPaper.length <= 25 ? '৩০ মিনিট' : '৪৫ মিনিট'
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_PAPER_HEADER, JSON.stringify(updatedHeader));
      } catch (e) {}
      return updatedHeader;
    });

    // Close wizard and jump directly to Paper view
    setIsWizardOpen(false);
    setActiveMainView('paper');
    setMobileActiveView('paper');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`সফল! ${newPaper.length}টি প্রশ্ন দিয়ে নতুন প্রশ্নপত্র তৈরি হয়েছে`);
  };

  // Move question up or down in sequence
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    setPaperQuestions(prev => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      try {
        localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(next));
      } catch (err) {}
      return next;
    });
  };

  // Open edit modal for a specific question
  const handleOpenEdit = (q: BookQuestion) => {
    setEditingQuestion({ ...q });
    setIsEditModalOpen(true);
  };

  // Save edited question
  const handleSaveEditedQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    
    setPaperQuestions(prev => {
      const updated = prev.map(item => item.id === editingQuestion.id ? editingQuestion : item);
      try {
        localStorage.setItem(LOCAL_STORAGE_SAVED_PAPER, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });

    // Also update in allQuestions bank
    setAllQuestions(prev => prev.map(item => item.id === editingQuestion.id ? editingQuestion : item));

    setIsEditModalOpen(false);
    setEditingQuestion(null);
    showToast('প্রশ্নটি সফলভাবে এডিট ও আপডেট করা হয়েছে!');
  };

  // Handle saving new custom book question
  const handleSaveNewQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.question || !newQuestionForm.optA || !newQuestionForm.optB || !newQuestionForm.optC || !newQuestionForm.optD || !newQuestionForm.answer) {
      alert("অনুগ্রহ করে প্রশ্ন, ৪টি অপশন এবং সঠিক উত্তর পূরণ করুন।");
      return;
    }

    const created: BookQuestion = {
      id: `custom-book-${Date.now()}`,
      subject: newQuestionForm.subject,
      classLevel: newQuestionForm.classLevel,
      topic: newQuestionForm.topic,
      bookName: newQuestionForm.bookName || 'আমার সংরক্ষিত বই',
      pageNumber: newQuestionForm.pageNumber ? `পৃষ্ঠা ${newQuestionForm.pageNumber}` : '',
      question: newQuestionForm.question,
      options: [newQuestionForm.optA, newQuestionForm.optB, newQuestionForm.optC, newQuestionForm.optD],
      answer: newQuestionForm.answer,
      explanation: newQuestionForm.explanation,
      yearOrBoard: newQuestionForm.yearOrBoard
    };

    // Update in memory & localStorage with deduplication
    const updated = deduplicateBookQuestions([created, ...allQuestions]);
    setAllQuestions(updated);
    try {
      const savedCustom = localStorage.getItem(LOCAL_STORAGE_CUSTOM_QUESTIONS);
      const customList: BookQuestion[] = savedCustom ? JSON.parse(savedCustom) : [];
      const updatedCustom = deduplicateBookQuestions([created, ...customList]);
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_QUESTIONS, JSON.stringify(updatedCustom));
    } catch (e) {
      // ignore
    }

    // Save to SQLite API
    fetch("/api/bank/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: created.subject,
        classLevel: created.classLevel,
        topic: created.topic,
        bookName: created.bookName,
        pageNumber: created.pageNumber,
        question: created.question,
        options: created.options,
        answer: created.answer,
        explanation: created.explanation,
        yearOrBoard: created.yearOrBoard
      })
    }).catch(err => console.log("DB save note:", err.message));

    // Reset form & close modal
    setNewQuestionForm({
      subject: selectedSubject,
      classLevel: '৯ম-১০ম শ্রেণি',
      topic: selectedTopic,
      bookName: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি',
      pageNumber: '',
      question: '',
      optA: '',
      optB: '',
      optC: '',
      optD: '',
      answer: '',
      explanation: '',
      yearOrBoard: ''
    });
    setIsAddModalOpen(false);
  };

  // Copy plain text question paper
  const handleCopyPaper = () => {
    let text = `${paperHeader.institutionName}\n${paperHeader.examTitle}\n`;
    text += `শ্রেণি: ${paperHeader.classLevel} | বিষয়: ${paperHeader.subject}\n`;
    text += `সময়: ${paperHeader.duration} | পূর্ণমান: ${paperQuestions.length}\n`;
    text += `${paperHeader.instructions}\n`;
    text += `--------------------------------------------------\n\n`;

    const getOptionPrefixText = (idx: number) => {
      const letters = ['ক', 'খ', 'গ', 'ঘ'];
      const numbers = ['১', '২', '৩', '৪'];
      if (optionsPrefix === 'circle') return `(○ ${letters[idx]})`;
      if (optionsPrefix === 'sequential') return `${numbers[idx]}.`;
      if (optionsPrefix === 'alpha') return `${letters[idx]}.`;
      return `(${letters[idx]})`;
    };

    paperQuestions.forEach((q, idx) => {
      text += `${idx + 1}. ${q.question}\n`;
      if (optionsColumns === '1') {
        q.options.forEach((opt, oIdx) => {
          text += `   ${getOptionPrefixText(oIdx)} ${opt}\n`;
        });
        text += '\n';
      } else if (optionsColumns === '2') {
        text += `   ${getOptionPrefixText(0)} ${q.options[0]}   ${getOptionPrefixText(1)} ${q.options[1]}\n`;
        text += `   ${getOptionPrefixText(2)} ${q.options[2]}   ${getOptionPrefixText(3)} ${q.options[3]}\n\n`;
      } else {
        text += `   ${q.options.map((opt, oIdx) => `${getOptionPrefixText(oIdx)} ${opt}`).join('   ')}\n\n`;
      }
    });

    if (showAnswersInPaper) {
      text += `\n--- [ উত্তরমালা / Answer Key ] ---\n`;
      paperQuestions.forEach((q, idx) => {
        text += `${idx + 1}. উত্তর: ${q.answer} ${q.explanation ? `(${q.explanation})` : ''}\n`;
      });
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    });
  };

  // Trigger print dialog
  const handlePrint = () => {
    window.print();
  };

  // Layout & Option Formatting Controls (Reusable content)
  const renderOptionControlsContent = () => {
    return (
      <div className="space-y-4">
        {/* Current Settings Pill Summary */}
        <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-[11px]">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200/70">
            প্রশ্নপত্র: {paperColumns === '2' ? '২ কলাম' : '১ কলাম'}
          </span>
          {paperColumns === '2' && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold border ${
              paperDivider 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-100 text-slate-500 border-slate-200/70'
            }`}>
              {paperDivider ? 'বর্ডার: চালু' : 'বর্ডার: বন্ধ'}
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200/70">
            অপশন: {optionsColumns} কলাম
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200/70">
            {optionsPrefix === 'circle' ? 'প্রতীক: বৃত্ত ◯' : optionsPrefix === 'sequential' ? 'প্রতীক: ১. ক্রমিক' : optionsPrefix === 'alpha' ? 'প্রতীক: ক. বর্ণ' : 'প্রতীক: (ক)'}
          </span>
        </div>

        {/* 1. Paper Columns Layout */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Columns2 size={13} className="text-primary" />
              <span>প্রশ্নপত্র কলাম বিন্যাস</span>
            </label>
            <span className="text-[10px] text-slate-500">{paperColumns === '2' ? 'বামে ও ডানে' : 'এক লাইনে'}</span>
          </div>

          <div className="grid grid-cols-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1">
            <button
              type="button"
              onClick={() => handleSetPaperColumns('1')}
              className={`py-2 px-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                paperColumns === '1'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <List size={13} className="shrink-0" />
              <span>১ কলাম</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetPaperColumns('2')}
              className={`py-2 px-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                paperColumns === '2'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Columns2 size={13} className="shrink-0" />
              <span>২ কলাম</span>
            </button>
          </div>

          {/* Sub-option: Middle Divider Border (When 2 columns) */}
          {paperColumns === '2' && (
            <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Split size={12} className="text-slate-500" />
                  <span>মাঝখানের ডিভাইডার বর্ডার</span>
                </span>
                <button
                  type="button"
                  onClick={handleTogglePaperDivider}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all border ${
                    paperDivider
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {paperDivider ? '✓ চালু' : '✕ বন্ধ'}
                </button>
              </div>

              {paperDivider && (
                <div className="space-y-1 pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] font-semibold text-slate-500 block">বর্ডার স্টাইল:</span>
                  <div className="grid grid-cols-3 bg-white p-0.5 rounded-lg border border-slate-200 text-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleSetPaperDividerStyle('solid')}
                      className={`py-1 text-[10px] rounded font-bold transition-all ${
                        paperDividerStyle === 'solid'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      সলিড
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPaperDividerStyle('dashed')}
                      className={`py-1 text-[10px] rounded font-bold transition-all ${
                        paperDividerStyle === 'dashed'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ড্যাশড
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetPaperDividerStyle('double')}
                      className={`py-1 text-[10px] rounded font-bold transition-all ${
                        paperDividerStyle === 'double'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ডাবল
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* 2. Option Columns Count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <LayoutGrid size={13} className="text-primary" />
              <span>অপশন কলাম সংখ্যা</span>
            </label>
            <span className="text-[10px] text-slate-500">{optionsColumns === '1' ? 'ওপর-নিচে' : 'পাশাপাশি'}</span>
          </div>

          <div className="grid grid-cols-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1">
            <button
              type="button"
              onClick={() => handleSetColumns('1')}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center truncate ${
                optionsColumns === '1'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              ১ কলাম
            </button>
            <button
              type="button"
              onClick={() => handleSetColumns('2')}
              className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center truncate ${
                optionsColumns === '2'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              ২ কলাম
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* 3. Option Prefix Style */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-primary" />
            <span>অপশন প্রতীক / ক্রমিক</span>
          </label>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleSetPrefix('bracket')}
              className={`p-2 text-xs font-bold rounded-xl transition-all border text-left flex items-center justify-between ${
                optionsPrefix === 'bracket'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>(ক) ব্র্যাকেট</span>
              <span className="text-[11px] opacity-70">(ক) (খ)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetPrefix('circle')}
              className={`p-2 text-xs font-bold rounded-xl transition-all border text-left flex items-center justify-between ${
                optionsPrefix === 'circle'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1">
                <CircleDot size={12} className="shrink-0" />
                <span>বৃত্ত</span>
              </div>
              <span className="text-[11px] opacity-70">◯ ক</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetPrefix('sequential')}
              className={`p-2 text-xs font-bold rounded-xl transition-all border text-left flex items-center justify-between ${
                optionsPrefix === 'sequential'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>১. ক্রমিক</span>
              <span className="text-[11px] opacity-70">১. ২.</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetPrefix('alpha')}
              className={`p-2 text-xs font-bold rounded-xl transition-all border text-left flex items-center justify-between ${
                optionsPrefix === 'alpha'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>ক. বর্ণ</span>
              <span className="text-[11px] opacity-70">ক. খ.</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Layout & Option Customization Sidebar (Neat, compact, fully organized)
  const renderOptionControlsSidebar = () => {
    return (
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <SlidersHorizontal size={15} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">লেআউট ও অপশন সেটিংস</h3>
              <p className="text-[11px] text-slate-500 truncate">প্রশ্নপত্র ও অপশনের রূপ সজ্জা</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLayoutSidebarOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            title="সাইডবার লুকান"
          >
            <X size={15} />
          </button>
        </div>

        {renderOptionControlsContent()}

        {/* Quick Actions at bottom of sidebar */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={() => setShowAnswersInPaper(!showAnswersInPaper)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
              showAnswersInPaper
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Eye size={13} className={showAnswersInPaper ? 'text-emerald-600' : 'text-slate-500'} />
            <span>{showAnswersInPaper ? 'উত্তরমালা লুকান' : 'উত্তরমালা প্রদর্শন করুন'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Printer size={13} />
            <span>প্রশ্নপত্র প্রিন্ট বা PDF করুন</span>
          </button>
        </div>
      </div>
    );
  };

  // Deprecated inline renderOptionControls (kept as null safe)
  const renderOptionControls = () => null;

  // Render options inside question cards
  const renderQuestionOptions = (options: string[], isRightSidebar = false) => {
    const isOneColumn = optionsColumns === '1';
    const gridCols = isOneColumn
      ? 'grid-cols-1 gap-y-1.5'
      : 'grid-cols-2 gap-x-2 sm:gap-x-6 md:gap-x-8 gap-y-1.5';

    const letters = ['ক', 'খ', 'গ', 'ঘ'];
    const numerals = ['১', '২', '৩', '৪'];

    return (
      <div className={`mt-2.5 ${isRightSidebar ? 'pl-1.5 sm:pl-3' : 'pl-2 sm:pl-5'} text-xs sm:text-sm text-slate-800 grid ${gridCols} w-full max-w-full text-justify`}>
        {options.map((opt, optIdx) => (
          <div key={optIdx} className="flex items-start min-w-0 w-full text-justify">
            {optionsPrefix === 'circle' ? (
              <span className="w-5 h-5 rounded-full border border-slate-600 bg-white text-slate-800 text-[11px] font-bold inline-flex items-center justify-center shrink-0 mr-1.5 sm:mr-2 shadow-2xs mt-0.5">
                {letters[optIdx]}
              </span>
            ) : optionsPrefix === 'sequential' ? (
              <span className="font-bold text-slate-700 mr-1.5 shrink-0">
                {numerals[optIdx]}.
              </span>
            ) : optionsPrefix === 'alpha' ? (
              <span className="font-bold text-slate-700 mr-1.5 shrink-0">
                {letters[optIdx]}.
              </span>
            ) : (
              <span className="font-bold text-slate-500 mr-1.5 shrink-0">
                ({letters[optIdx]})
              </span>
            )}
            <span className="break-words min-w-0 flex-1 leading-relaxed text-justify">
              <MathFormulaRenderer text={opt} />
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Render single question block (used for both 1-column and 2-column layout)
  const renderSingleQuestionItem = (
    item: BookQuestion, 
    index: number, 
    isRightSidebar = false, 
    isFresh = false
  ) => {
    const itemDiff = resolveDifficulty(item, index);
    const usageCount = usageStats[item.id] || 0;
    const isLatestAdded = lastAddedId === item.id && index === paperQuestions.length - 1;

    // Fresh Mode: purely clean exam paper view without any edit/delete/move buttons or badges
    if (isFresh) {
      return (
        <div 
          id={`fresh-q-${index}`}
          key={`fresh-${item.id}-${index}`} 
          className="pb-3 border-b border-slate-100 last:border-b-0 min-w-0 w-full bg-white"
        >
          <p className="font-bold text-slate-900 text-[13px] sm:text-sm leading-relaxed pr-1 flex items-start min-w-0">
            <span className="inline-block font-extrabold text-slate-900 mr-1.5 shrink-0 select-none">{index + 1}.</span>
            <span className="break-words min-w-0 flex-1">
              <MathFormulaRenderer text={item.question} />
            </span>
          </p>

          {renderQuestionOptions(item.options, isRightSidebar || paperColumns === '2')}
        </div>
      );
    }

    return (
      <div 
        id={`paper-q-${index}`}
        key={`${item.id}-${index}`} 
        className={`group relative pb-3.5 border-b border-slate-100 last:border-b-0 p-2 sm:p-2.5 rounded-xl transition-all duration-300 min-w-0 w-full ${
          isLatestAdded 
            ? 'ring-2 ring-primary/80 bg-violet-50/60 shadow-xs' 
            : 'hover:bg-slate-50/50'
        } ${
          paperColumns === '2' && !isRightSidebar ? 'text-[13px] sm:text-sm' : ''
        }`}
      >
        {/* Action Bar for each question (hidden on print) */}
        <div className="flex items-center justify-between gap-1 pb-1.5 mb-1.5 border-b border-slate-100 print:hidden min-w-0">
          <div className="flex flex-wrap items-center gap-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
              প্রশ্ন #{index + 1}
            </span>

            {/* Latest Added indicator */}
            {isLatestAdded && (
              <span className="text-[9px] sm:text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0 animate-pulse">
                ✨ এইমাত্র যুক্ত হলো
              </span>
            )}

            {/* Difficulty Tag */}
            <span className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border flex items-center gap-0.5 shrink-0 ${
              itemDiff === 'সহজ'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : itemDiff === 'মাঝারি'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {itemDiff === 'সহজ' && <Sprout size={10} />}
              {itemDiff === 'মাঝারি' && <Zap size={10} />}
              {itemDiff === 'কঠিন' && <Flame size={10} />}
              <span>{itemDiff}</span>
            </span>

            {/* Lifetime Usage Tag */}
            <span className="text-[9px] sm:text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0" title="এই প্রশ্নটি আগে কতবার প্রশ্নপত্রে ব্যবহৃত হয়েছে">
              <Clock size={10} className="shrink-0" />
              <span>{usageCount} বার</span>
            </span>
          </div>

          <div className="flex items-center space-x-0.5 sm:space-x-1 shrink-0">
            {/* Reorder Up */}
            <button
              onClick={() => handleMoveQuestion(index, 'up')}
              disabled={index === 0}
              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded-md hover:bg-slate-200 transition-colors"
              title="উপরে নিন"
            >
              <ChevronUp size={13} />
            </button>

            {/* Reorder Down */}
            <button
              onClick={() => handleMoveQuestion(index, 'down')}
              disabled={index === paperQuestions.length - 1}
              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20 rounded-md hover:bg-slate-200 transition-colors"
              title="নিচে নিন"
            >
              <ChevronDown size={13} />
            </button>

            {/* Edit Question - Icon Only */}
            <button
              onClick={() => handleOpenEdit(item)}
              className="p-1 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center justify-center border border-blue-200 active:scale-95"
              title="এই প্রশ্নটি এডিট করুন"
            >
              <Pencil size={11} />
            </button>

            {/* Remove Question - Icon Only */}
            <button
              onClick={() => handleRemoveFromPaper(item.id)}
              className="p-1 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors flex items-center justify-center border border-rose-200 active:scale-95"
              title="প্রশ্নপত্র থেকে বাদ দিন"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Question Text */}
        <p className="font-bold text-slate-900 text-[13px] sm:text-sm leading-relaxed pr-1 flex items-start min-w-0">
          <span className="inline-block text-primary font-extrabold mr-1.5 shrink-0">{index + 1}.</span>
          <span className="break-words min-w-0 flex-1">
            <MathFormulaRenderer text={item.question} />
          </span>
        </p>

        {/* Options */}
        {renderQuestionOptions(item.options, isRightSidebar || paperColumns === '2')}

        {/* Answer Key preview (if toggled) */}
        {showAnswersInPaper && (
          <div className="mt-2 ml-4 text-[11px] bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200 flex items-start gap-1">
            <CheckCircle2 size={12} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0 break-words">
              <strong>সঠিক উত্তর:</strong> <MathFormulaRenderer text={item.answer} />
              {item.explanation && <span className="opacity-90 ml-1 font-normal">({item.explanation})</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Helper to render questions container based on paperColumns and paperDivider
  const renderPaperQuestionsContainer = (isRightSidebar = false, isFresh = false) => {
    if (paperQuestions.length === 0) return null;

    // Single Column Layout
    if (paperColumns === '1') {
      return (
        <div className="space-y-3.5 w-full">
          {paperQuestions.map((item, index) => renderSingleQuestionItem(item, index, isRightSidebar, isFresh))}
        </div>
      );
    }

    // Two Columns Layout (Left side and Right side)
    const midPoint = Math.ceil(paperQuestions.length / 2);
    const leftQuestions = paperQuestions.slice(0, midPoint);
    const rightQuestions = paperQuestions.slice(midPoint);

    const dividerBorderClass = paperDivider
      ? paperDividerStyle === 'dashed'
        ? 'sm:border-l sm:border-dashed border-slate-300 print:border-slate-400'
        : paperDividerStyle === 'double'
        ? 'sm:border-l-4 sm:border-double border-slate-300 print:border-slate-500'
        : 'sm:border-l sm:border-solid border-slate-300/90 print:border-slate-400'
      : '';

    return (
      <div className="w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 md:gap-x-7 gap-y-4 w-full items-start">
          {/* Left Column Questions */}
          <div className="space-y-3.5 w-full min-w-0">
            {leftQuestions.map((item, localIdx) => renderSingleQuestionItem(item, localIdx, isRightSidebar, isFresh))}
          </div>

          {/* Right Column Questions (with optional divider border) */}
          <div className={`space-y-3.5 w-full min-w-0 ${dividerBorderClass} ${paperDivider ? 'sm:pl-4 md:pl-6' : ''}`}>
            {rightQuestions.map((item, localIdx) => renderSingleQuestionItem(item, midPoint + localIdx, isRightSidebar, isFresh))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-[1800px] 2xl:max-w-[1860px] mx-auto px-0 sm:px-1 py-3 sm:py-6 ${
      paperQuestions.length > 0 && activeMainView === 'bank' ? 'pb-20 sm:pb-16' : 'pb-6 sm:pb-8'
    } font-sans`}>
      {/* Consolidated Ultra-Premium Executive Header & Switcher */}
      <div className="mb-3.5 sm:mb-4 bg-white/95 backdrop-blur-md px-3.5 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
          
          {/* Left Column: Navigation, Title & Cloud Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <PremiumBackButton to="/" label="হোম" showHome={true} />
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-slate-900 truncate">
                  বইয়ের প্রশ্ন ব্যাংক ও প্রশ্নপত্র বিল্ডার
                </h1>
                <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold shrink-0">
                  <Cloud size={11} className="text-emerald-600 shrink-0" />
                  <span>ক্লাউড সিঙ্ক</span>
                </span>
              </div>
              <p className="text-slate-500 text-[11px] sm:text-xs truncate hidden sm:block mt-0.5">
                পাঠ্যবইয়ের অধ্যায় অনুযায়ী প্রশ্ন নির্বাচন করে দ্রুত প্রশ্নপত্র প্রস্তুত করুন
              </p>
            </div>
          </div>

          {/* Right Column: Sleek Pill Mode Tabs + Compact Action Buttons */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 sm:gap-2.5 min-w-0">
            
            {/* Sleek Segmented Switcher (১. প্রশ্ন ব্যাংক VS ২. প্রশ্নপত্র) */}
            <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl sm:rounded-2xl border border-slate-200/70 shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setActiveMainView('bank');
                  setMobileActiveView('bank');
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all ${
                  activeMainView === 'bank'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <BookOpen size={14} className="shrink-0" />
                <span>১. প্রশ্ন ব্যাংক</span>
                <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full font-black ${
                  activeMainView === 'bank' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {filteredQuestions.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMainView('paper');
                  setMobileActiveView('paper');
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all ${
                  activeMainView === 'paper'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <FileText size={14} className="shrink-0" />
                <span>২. প্রশ্নপত্র</span>
                <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-full font-black ${
                  activeMainView === 'paper' ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-800'
                }`}>
                  {paperQuestions.length}টি
                </span>
              </button>
            </div>

            {/* Compact Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Auto Wizard Button */}
              <button
                type="button"
                onClick={() => setIsWizardOpen(true)}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xs active:scale-95 transition-all"
                title="সংরক্ষিত প্রশ্ন থেকে স্বয়ংক্রিয় প্রশ্নপত্র তৈরি করুন"
              >
                <Sparkles size={14} className="text-amber-300 shrink-0" />
                <span className="hidden sm:inline">স্বয়ংক্রিয় প্রশ্নপত্র</span>
                <span className="sm:hidden">স্বয়ংক্রিয়</span>
              </button>

              {/* Add New Question Button */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs active:scale-95 transition-all"
                title="ডাটাবেজে নতুন প্রশ্ন সংরক্ষণ করুন"
              >
                <FolderPlus size={14} className="text-slate-500 shrink-0" />
                <span className="hidden sm:inline">নতুন প্রশ্ন</span>
                <span className="sm:hidden">+প্রশ্ন</span>
              </button>

              {/* Fullscreen Fresh Paper Button */}
              {paperQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsFullscreenPaperOpen(true)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-95 transition-all shrink-0"
                  title="কোনো এডিট অপশন ছাড়া ফ্রেশ প্রশ্নপত্র ফুলস্ক্রিনে দেখুন ও PDF করুন"
                >
                  <Maximize2 size={14} className="shrink-0" />
                  <span className="hidden sm:inline">ফ্রেশ প্রশ্নপত্র (PDF)</span>
                  <span className="sm:hidden">ফ্রেশ PDF</span>
                </button>
              )}

              {/* Quick Paper Preview Pill when questions exist in Bank mode */}
              {activeMainView === 'bank' && paperQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainView('paper');
                    setMobileActiveView('paper');
                  }}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95 transition-all shrink-0"
                  title="প্রশ্নপত্র প্রিভিউ ও এডিট করুন"
                >
                  <span className="truncate">প্রিভিউ ({paperQuestions.length})</span>
                  <ArrowRight size={13} className="shrink-0" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      {activeMainView === 'paper' ? (
        /* ======================= ভিউ ২: রূপান্তরিত প্রশস্ত প্রশ্নপত্র ও বাম পাশের অপশনসমূহ ======================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5 items-start min-w-0">
          
          {/* ======================= বাম পাশ: প্রশ্নপত্রের সংশ্লিষ্ট অপশন ও সেটিংস (lg:col-span-4 xl:col-span-4) ======================= */}
          <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-4 space-y-3.5 min-w-0 lg:sticky lg:top-3 lg:self-start lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto lg:pr-1.5 studio-scrollbar print:hidden">
            
            {/* ১. কুইক নেভিগেশন ও মূল অ্যাকশন কার্ড */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              {/* Back to Bank Button */}
              <button
                type="button"
                onClick={() => {
                  setActiveMainView('bank');
                  setMobileActiveView('bank');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xs active:scale-98 transition-all"
              >
                <ArrowLeft size={15} className="shrink-0" />
                <span>প্রশ্ন ব্যাংকে ফিরে আরো প্রশ্ন যোগ করুন</span>
              </button>

              {/* Stats Bar */}
              <div className="flex items-center justify-between px-1 text-xs text-slate-600 font-semibold border-b border-slate-100 pb-2.5">
                <span>মোট প্রশ্ন: <strong className="text-slate-900 font-extrabold">{paperQuestions.length}</strong>টি</span>
                <span>পূর্ণমান: <strong className="text-slate-900 font-extrabold">{paperQuestions.length}</strong></span>
                <span>সময়: <strong className="text-slate-900 font-extrabold">{paperHeader.duration}</strong></span>
              </div>

              {/* Main Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xs active:scale-98 transition-all"
              >
                <Printer size={15} className="shrink-0" />
                <span>প্রিন্ট / PDF তৈরি করুন</span>
              </button>

              {/* Full Screen Fresh Paper Button (কোনো এডিট ছাড়া ফ্রেশ ভিউ) */}
              <button
                type="button"
                onClick={() => setIsFullscreenPaperOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xs active:scale-98 transition-all"
                title="কোনো এডিট অপশন বা বোতাম ছাড়া শুধুমাত্র ফ্রেশ প্রশ্নপত্র সম্পূর্ণ স্ক্রিন জুড়ে দেখুন ও PDF করুন"
              >
                <Maximize2 size={15} className="shrink-0" />
                <span>সম্পূর্ণ ফ্রেশ ভিউ (ফুলস্ক্রিন)</span>
              </button>

              {/* Quick secondary buttons */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowAnswersInPaper(!showAnswersInPaper)}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 border transition-all ${
                    showAnswersInPaper 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                >
                  <Eye size={13} className={showAnswersInPaper ? 'text-emerald-600' : 'text-slate-500'} />
                  <span className="truncate">{showAnswersInPaper ? 'উত্তর লুকান' : 'উত্তরমালা'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPaper}
                  className="py-2 px-2.5 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  {copiedNotification ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-slate-500" />}
                  <span className="truncate">{copiedNotification ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>

              {paperQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPaperQuestions([]);
                    try {
                      localStorage.removeItem(LOCAL_STORAGE_SAVED_PAPER);
                    } catch (e) {}
                    showToast('প্রশ্নপত্র খালি করা হয়েছে।');
                  }}
                  className="w-full py-1.5 px-2 rounded-lg text-rose-500 hover:text-rose-700 font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={12} />
                  <span>প্রশ্নপত্র খালি করুন</span>
                </button>
              )}
            </div>

            {/* ২. পরীক্ষার তথ্য ও শিরোনাম এডিট কার্ড */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Pencil size={13} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">পরীক্ষার শিরোনাম ও তথ্য</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHeaderModalOpen(true)}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  মডালে এডিট
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">প্রতিষ্ঠানের নাম</label>
                  <input
                    type="text"
                    value={paperHeader.institutionName}
                    onChange={(e) => setPaperHeader({ ...paperHeader, institutionName: e.target.value })}
                    placeholder="প্রতিষ্ঠানের নাম"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">পরীক্ষার নাম / শিরোনাম</label>
                  <input
                    type="text"
                    value={paperHeader.examTitle}
                    onChange={(e) => setPaperHeader({ ...paperHeader, examTitle: e.target.value })}
                    placeholder="পরীক্ষার নাম"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">শ্রেণি</label>
                    <input
                      type="text"
                      value={paperHeader.classLevel}
                      onChange={(e) => setPaperHeader({ ...paperHeader, classLevel: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">বিষয়</label>
                    <input
                      type="text"
                      value={paperHeader.subject}
                      onChange={(e) => setPaperHeader({ ...paperHeader, subject: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">পরীক্ষার সময়</label>
                    <input
                      type="text"
                      value={paperHeader.duration}
                      onChange={(e) => setPaperHeader({ ...paperHeader, duration: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">বিশেষ নির্দেশনা</label>
                    <input
                      type="text"
                      value={paperHeader.instructions}
                      onChange={(e) => setPaperHeader({ ...paperHeader, instructions: e.target.value })}
                      placeholder="নির্দেশনা..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.setItem(LOCAL_STORAGE_PAPER_HEADER, JSON.stringify(paperHeader));
                    } catch (e) {}
                    showToast('পরীক্ষার তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-[11px] border border-slate-200/80 transition-all text-center mt-1"
                >
                  ✓ শিরোনাম তথ্য সেভ করুন
                </button>
              </div>
            </div>

            {/* ৩. লেআউট ও অপশন সেটিংস কার্ড */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={13} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">লেআউট ও অপশন সেটিংস</h3>
                  <p className="text-[10px] text-slate-500">প্রশ্নপত্র কলাম ও ফরম্যাটিং</p>
                </div>
              </div>

              {renderOptionControlsContent()}
            </div>

          </div>

          {/* ======================= ডান পাশ: প্রশস্ত প্রশ্নপত্র (প্রস্থ বৃদ্ধি পেয়ে ৮ কলাম) (lg:col-span-8 xl:col-span-8) ======================= */}
          <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-8 space-y-4 min-w-0 lg:pl-1 lg:pr-2 print:block print:w-full print:h-auto">
            
            {/* Top Compact Status Strip */}
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-2 print:hidden">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate">
                  প্রশস্ত প্রশ্নপত্র প্রিভিউ
                </span>
                <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                  ({paperQuestions.length}টি প্রশ্ন | পূর্ণমান: {paperQuestions.length})
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFullscreenPaperOpen(true)}
                  className="px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                  title="কোনো এডিট অপশন ছাড়া সম্পূর্ণ স্ক্রিন জুড়ে ফ্রেশ প্রশ্নপত্র দেখুন ও PDF করুন"
                >
                  <Maximize2 size={13} />
                  <span>ফ্রেশ ফুলস্ক্রিন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAnswersInPaper(!showAnswersInPaper)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1 transition-all"
                >
                  <Eye size={12} className={showAnswersInPaper ? 'text-emerald-600' : 'text-slate-500'} />
                  <span>{showAnswersInPaper ? 'উত্তর অন' : 'উত্তর অফ'}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                >
                  <Printer size={13} />
                  <span>প্রিন্ট / PDF</span>
                </button>
              </div>
            </div>

            {/* Printable Question Paper Sheet Card */}
            <div 
              id="printable-question-paper"
              className="w-full max-w-full overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 border border-slate-200/90 shadow-sm space-y-5 sm:space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none"
            >
              {/* Institution / Exam Header (Editable in-place) */}
              <div className="relative text-center border-b-2 border-slate-900 pb-5 space-y-1.5">
                <div className="flex justify-end print:hidden mb-1">
                  <button
                    type="button"
                    onClick={() => setIsHeaderModalOpen(true)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg"
                  >
                    <Pencil size={12} />
                    <span>শিরোনাম ও সময় পরিবর্তন করুন</span>
                  </button>
                </div>

                <input
                  type="text"
                  value={paperHeader.institutionName}
                  onChange={(e) => setPaperHeader({ ...paperHeader, institutionName: e.target.value })}
                  className="w-full text-center text-xl sm:text-3xl font-extrabold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none bg-transparent"
                  title="প্রতিষ্ঠানের নাম এডিট করতে ক্লিক করুন"
                />
                <input
                  type="text"
                  value={paperHeader.examTitle}
                  onChange={(e) => setPaperHeader({ ...paperHeader, examTitle: e.target.value })}
                  className="w-full text-center text-base sm:text-lg font-bold text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none bg-transparent"
                  title="পরীক্ষার নাম এডিট করতে ক্লিক করুন"
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm font-bold text-slate-800 pt-3 px-2 border-t border-slate-200/70">
                  <div className="text-left sm:text-center">শ্রেণি: <span className="font-semibold">{paperHeader.classLevel}</span></div>
                  <div className="text-right sm:text-center">বিষয়: <span className="font-semibold">{paperHeader.subject}</span></div>
                  <div className="text-left sm:text-center">সময়: <span className="font-semibold">{paperHeader.duration}</span></div>
                  <div className="text-right sm:text-center">পূর্ণমান: <span className="font-semibold">{toBengaliNumber(paperQuestions.length)}</span></div>
                </div>

                {/* Student Details fill-in on paper (Print-Friendly) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-3 text-xs text-slate-600 pt-2 border-t border-dashed border-slate-200">
                  <div className="text-left truncate">শিক্ষার্থীর নাম: .......................................</div>
                  <div className="text-left sm:text-center truncate">রোল নম্বর: ...................</div>
                  <div className="text-left sm:text-right truncate">শাখা: ................... তারিখ: ..................</div>
                </div>

                <p className="text-[11px] sm:text-xs text-slate-500 italic pt-1">
                  {paperHeader.instructions}
                </p>
              </div>

              {/* Questions in Paper */}
              {paperQuestions.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                    <FileText size={32} />
                  </div>
                  <p className="text-slate-700 font-bold text-lg">প্রশ্নপত্র এখনো খালি রয়েছে!</p>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                    প্রশ্ন ব্যাংক থেকে বাংলা, অংক, ইংরেজি, বিজ্ঞান বা সাধারণ জ্ঞান বিষয়ের সহজ, মাঝারি বা কঠিন প্রশ্ন বেছে নিয়ে <strong>"+ প্রশ্নপত্রে যোগ করুন"</strong> এ ক্লিক করলেই এখানে তাৎক্ষণিক প্রিমিয়াম প্রশ্নপত্র প্রস্তুত হয়ে যাবে।
                  </p>
                  <button
                    onClick={() => {
                      setActiveMainView('bank');
                      setMobileActiveView('bank');
                    }}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/30 inline-flex items-center space-x-2"
                  >
                    <BookOpen size={16} />
                    <span>প্রশ্ন ব্যাংকে গিয়ে প্রশ্ন নির্বাচন করুন</span>
                  </button>
                </div>
              ) : (
                renderPaperQuestionsContainer(false)
              )}

              {/* Paper Footer summary & Clear All */}
              {paperQuestions.length > 0 && (
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
                  <span className="font-semibold text-slate-700">মোট প্রশ্ন: {paperQuestions.length}টি | পূর্ণমান: {paperQuestions.length}</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setActiveMainView('bank');
                        setMobileActiveView('bank');
                      }}
                      className="text-primary hover:underline font-bold"
                    >
                      + আরো প্রশ্ন যোগ করুন
                    </button>
                    <button
                      onClick={() => {
                        setPaperQuestions([]);
                        try {
                          localStorage.removeItem(LOCAL_STORAGE_SAVED_PAPER);
                        } catch (e) {}
                        showToast('প্রশ্নপত্র খালি করা হয়েছে।');
                      }}
                      className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>সব ক্লিয়ার করুন</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ======================= ভিউ ১: প্রশ্ন ব্যাংক (বিষয়, টপিক, কাঠিন্য ও প্রশ্ন নির্বাচন) ======================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 xl:gap-5 items-start min-w-0">
        
        {/* ======================= বাম পাশ: বিষয়, টপিক ও বইয়ের প্রশ্ন নির্বাচন ======================= */}
        <div 
          ref={leftScrollContainerRef} 
          id="bank-questions-container" 
          className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 space-y-4 min-w-0 lg:pr-1"
        >
          
          {/* Class Level & Subject Navigation */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            {/* Class Level Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Award size={15} className="text-slate-600" />
                  <span>শ্রেণি নির্বাচন</span>
                </span>
                <span className="text-[11px] sm:text-xs text-slate-800 font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                  {selectedClass}
                </span>
              </div>
              {/* Class Level Quick Selector & Dropdown (Class 1 to 10 + All) */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  '১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি',
                  '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি', 'সকল শ্রেণি'
                ].map(cls => {
                  const isClsSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      onClick={() => {
                        setSelectedClass(cls);
                        setCurrentPage(1);
                        setPaperHeader(prev => ({
                          ...prev,
                          classLevel: cls === 'সকল শ্রেণি' ? '১০ম শ্রেণি' : cls
                        }));
                      }}
                      className={`py-1.5 px-2.5 rounded-xl font-bold text-[11px] sm:text-xs text-center transition-all truncate flex-1 min-w-[65px] ${
                        isClsSelected
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span className="truncate">{cls === '১০ম শ্রেণি' ? '১০ম (SSC)' : cls}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Navigation Tabs - বাংলা, অংক, ইংরেজি, বিজ্ঞান, সাধারণ জ্ঞান */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers size={15} className="text-slate-600" />
                  <span>বিষয় নির্বাচন</span>
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  সংরক্ষিত: {allQuestions.length}টি
                </span>
              </div>

              {/* Justified Responsive Grid for Subjects */}
              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-1.5 sm:gap-2">
                {[
                  { id: 'বাংলা', label: 'বাংলা', icon: '📚' },
                  { id: 'অংক', label: 'গণিত', icon: '📐' },
                  { id: 'ইংরেজি', label: 'ইংরেজি', icon: '🔤' },
                  { id: 'বিজ্ঞান', label: 'বিজ্ঞান', icon: '🔬' },
                  { id: 'সাধারণ জ্ঞান', label: 'GK', icon: '🌍' },
                  { id: 'সকল বিষয়', label: 'সকল', icon: '📑' }
                ].map(subjItem => {
                  const isSelected = selectedSubject === subjItem.id;
                  return (
                    <button
                      key={subjItem.id}
                      onClick={() => handleSubjectChange(subjItem.id)}
                      className={`w-full py-2 px-1.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1 truncate ${
                        isSelected 
                          ? 'bg-slate-950 text-white shadow-xs' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span className="text-xs">{subjItem.icon}</span>
                      <span className="truncate">{subjItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ৩টি ধরন: সহজ, মাঝারি ও কঠিন নির্বাচন ফিল্টার */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Flame size={15} className="text-amber-500 shrink-0" />
                <span>কাঠিন্যের স্তর</span>
              </span>

              <button
                type="button"
                onClick={handleSelectAllDifficulties}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  selectedDifficulties.length === 3
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                সবগুলো
              </button>
            </div>

            {/* ৩টি ধরন: সহজ, মাঝারি, কঠিন */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* সহজ */}
              <button
                type="button"
                onClick={() => handleToggleDifficulty('সহজ')}
                className={`py-2 px-2 sm:px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  selectedDifficulties.includes('সহজ')
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-slate-50/70 border-slate-200 text-slate-400 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-extrabold text-emerald-700">
                  <Sprout size={14} className="shrink-0" />
                  <span>সহজ</span>
                  {selectedDifficulties.includes('সহজ') && <span className="text-[10px] text-emerald-600">✓</span>}
                </div>
                <span className="text-[10px] sm:text-xs text-emerald-700/80 font-medium">
                  {difficultyCounts['সহজ']}টি
                </span>
              </button>

              {/* মাঝারি */}
              <button
                type="button"
                onClick={() => handleToggleDifficulty('মাঝারি')}
                className={`py-2 px-2 sm:px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  selectedDifficulties.includes('মাঝারি')
                    ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-xs ring-1 ring-amber-500/20'
                    : 'bg-slate-50/70 border-slate-200 text-slate-400 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-extrabold text-amber-700">
                  <Zap size={14} className="shrink-0" />
                  <span>মাঝারি</span>
                  {selectedDifficulties.includes('মাঝারি') && <span className="text-[10px] text-amber-600">✓</span>}
                </div>
                <span className="text-[10px] sm:text-xs text-amber-700/80 font-medium">
                  {difficultyCounts['মাঝারি']}টি
                </span>
              </button>

              {/* কঠিন */}
              <button
                type="button"
                onClick={() => handleToggleDifficulty('কঠিন')}
                className={`py-2 px-2 sm:px-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                  selectedDifficulties.includes('কঠিন')
                    ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold shadow-xs ring-1 ring-rose-500/20'
                    : 'bg-slate-50/70 border-slate-200 text-slate-400 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-extrabold text-rose-700">
                  <Flame size={14} className="shrink-0" />
                  <span>কঠিন</span>
                  {selectedDifficulties.includes('কঠিন') && <span className="text-[10px] text-rose-600">✓</span>}
                </div>
                <span className="text-[10px] sm:text-xs text-rose-700/80 font-medium">
                  {difficultyCounts['কঠিন']}টি
                </span>
              </button>
            </div>
          </div>

          {/* Topic Selector Chips */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <Bookmark size={15} className="text-slate-600 shrink-0" />
                <span className="truncate">{selectedSubject} - অধ্যায় বা টপিক</span>
              </label>
              <span className="text-[11px] sm:text-xs text-slate-800 font-bold bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg shrink-0">
                {filteredQuestions.length}টি প্রশ্ন
              </span>
            </div>

            {/* Topic Selector Chips - Uniform Justified Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-2 gap-1.5 sm:gap-2">
              {availableTopics.map(topic => {
                const isTopicSelected = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    onClick={() => {
                      setSelectedTopic(topic);
                      setCurrentPage(1);
                    }}
                    className={`w-full py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center truncate ${
                      isTopicSelected
                        ? 'bg-slate-950 text-white shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{topic}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="pt-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="প্রশ্ন, বইয়ের নাম বা শব্দ লিখে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Paginated Question List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-slate-800 text-base">
                  {selectedTopic} এর প্রশ্নসমূহ
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                পৃষ্ঠা {currentPage} এর {totalPages} (মোট {filteredQuestions.length}টি)
              </span>
            </div>

            {displayedQuestions.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-300 space-y-4">
                <HelpCircle size={40} className="mx-auto text-slate-400" />
                <p className="text-slate-600 font-bold text-base">এই টপিকে কোনো প্রশ্ন পাওয়া যায়নি।</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  আপনি 'নতুন প্রশ্ন যোগ করুন' বাটনে ক্লিক করে পাঠ্যবই থেকে নতুন প্রশ্ন যুক্ত করতে পারেন অথবা অন্য বিষয়/টপিক সিলেক্ট করুন।
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md shadow-primary/20"
                  >
                    + নতুন প্রশ্ন যুক্ত করুন
                  </button>
                  <button 
                    onClick={() => setIsWizardOpen(true)}
                    className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold"
                  >
                    ✨ উইজার্ড দিয়ে খুঁজুন
                  </button>
                </div>
              </div>
            ) : (
              displayedQuestions.map((q, qIndex) => {
                const cleanQText = q.question.trim().toLowerCase().replace(/[\s\t\n]+/g, ' ');
                const isAlreadyInPaper = paperQuestions.some(p => 
                  p.id === q.id || 
                  p.question.trim().toLowerCase().replace(/[\s\t\n]+/g, ' ') === cleanQText
                );
                const isJustAdded = lastAddedId === q.id;
                const isFocused = focusedQuestionId === q.id;
                const qDiff = resolveDifficulty(q, qIndex);
                const usageCount = usageStats[q.id] || 0;

                return (
                  <div
                    id={`bank-q-${q.id}`}
                    key={q.id}
                    onClick={() => {
                      if (!isAlreadyInPaper) handleAddToPaper(q, qIndex);
                    }}
                    title={isAlreadyInPaper ? 'ইতিমধ্যে প্রশ্নপত্রে যুক্ত করা হয়েছে' : 'এই প্রশ্নটি সরাসরি প্রশ্নপত্রে যুক্ত করতে ক্লিক করুন'}
                    className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-colors duration-200 relative group overflow-hidden ${
                      isFocused
                        ? 'border-indigo-500 ring-2 ring-indigo-400/50 bg-indigo-50/20 shadow-md'
                        : isAlreadyInPaper 
                        ? 'border-emerald-200/90 bg-emerald-50/20 shadow-2xs cursor-default' 
                        : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    {/* Header meta - Justified evenly on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-3">
                      <div className="grid grid-cols-4 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                        <span className="bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded-lg text-center truncate">
                          {q.classLevel || '১০ম শ্রেণি'}
                        </span>
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold px-2 py-1 rounded-lg text-center truncate">
                          {q.subject}
                        </span>

                        {/* Difficulty Badge */}
                        <span className={`text-[11px] font-extrabold px-2 py-1 rounded-lg border flex items-center justify-center gap-1 text-center truncate ${
                          qDiff === 'সহজ'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : qDiff === 'মাঝারি'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {qDiff === 'সহজ' && <Sprout size={12} className="shrink-0" />}
                          {qDiff === 'মাঝারি' && <Zap size={12} className="shrink-0" />}
                          {qDiff === 'কঠিন' && <Flame size={12} className="shrink-0" />}
                          <span className="truncate">{qDiff}</span>
                        </span>

                        <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold px-2 py-1 rounded-lg text-center truncate">
                          {q.topic}
                        </span>
                      </div>

                      {/* Lifetime Usage Count */}
                      <div className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center justify-between sm:justify-start gap-1.5 shrink-0 ${
                        usageCount > 0
                          ? 'bg-slate-100 text-slate-900 border-slate-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`} title="এই প্রশ্নটি আগে কতবার প্রশ্নপত্রে ব্যবহৃত হয়েছে">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-500 shrink-0" />
                          <span>ব্যবহার:</span>
                        </div>
                        <span className="font-extrabold text-slate-950">
                          {usageCount > 0 ? `${usageCount} বার` : '০ বার (নতুন)'}
                        </span>
                      </div>
                    </div>

                    {/* Question text */}
                    <h4 className="text-slate-900 font-bold text-sm sm:text-base mb-3.5 leading-relaxed text-justify">
                      <MathFormulaRenderer text={q.question} />
                    </h4>

                    {/* 4 Options Grid - Adaptive for smaller column */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 mb-3.5 text-justify">
                      {q.options.map((opt, optIdx) => {
                        const optLabels = ['(ক)', '(খ)', '(গ)', '(ঘ)'];
                        const isCorrect = q.answer === opt;
                        return (
                          <div 
                            key={optIdx} 
                            className={`px-2.5 py-2 rounded-xl text-xs font-medium border flex items-center space-x-2 transition-colors text-justify ${
                              isCorrect && showAnswersInPaper
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                                : 'bg-slate-50/80 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-slate-900 font-bold shrink-0">{optLabels[optIdx]}</span>
                            <span className="min-w-0 flex-1 break-words text-justify"><MathFormulaRenderer text={opt} /></span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Full-width Correct Answer Banner - sits directly below options spanning full width */}
                    <div className="w-full text-xs sm:text-sm text-emerald-800 font-medium flex items-center space-x-2 bg-emerald-50/90 border border-emerald-200/90 px-3 py-2 rounded-xl mb-3">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span className="min-w-0 break-words">
                        সঠিক উত্তর: <strong className="font-bold text-emerald-950"><MathFormulaRenderer text={q.answer} /></strong>
                      </span>
                    </div>

                    {/* Action footer - Skip button directly on the left of "প্রশ্নপত্রে যোগ করুন" */}
                    <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                      {/* Skip Button - immediately to the left of action button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSkipQuestion(qIndex);
                        }}
                        className="px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 shadow-2xs transition-all active:scale-95 shrink-0"
                        title="এই প্রশ্নটি স্কিপ করে পরের প্রশ্নটিতে যান"
                      >
                        <SkipForward size={14} className="text-slate-600 shrink-0" />
                        <span>Skip</span>
                      </button>

                      {isAlreadyInPaper ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center justify-center text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-2 rounded-xl border border-emerald-200 truncate">
                            <Check size={13} className="mr-1 shrink-0" /> যুক্ত আছে
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromPaper(q.id);
                            }}
                            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-xs transition-all active:scale-95"
                            title="প্রশ্নপত্র থেকে এই প্রশ্নটি বাদ দিন"
                          >
                            <Trash2 size={14} />
                            <span>বাদ দিন</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToPaper(q, qIndex);
                          }}
                          className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 bg-slate-950 hover:bg-slate-800 text-white shadow-xs active:scale-95 transition-all"
                        >
                          {isJustAdded ? (
                            <>
                              <Sparkles size={14} className="animate-spin text-white" />
                              <span>যুক্ত হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Plus size={15} />
                              <span>প্রশ্নপত্রে যোগ করুন</span>
                              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-xl font-bold text-sm transition-all ${
                      currentPage === pageNum
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ======================= ডান পাশ: লাইভ প্রশ্নপত্র প্রিভিউ ও প্রিন্ট ======================= */}
        <div 
          ref={rightPaperScrollContainerRef}
          id="paper-preview-container"
          className={`lg:col-span-7 xl:col-span-7 2xl:col-span-7 space-y-4 min-w-0 lg:sticky lg:top-3 lg:self-start lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto lg:pl-1 lg:pr-1.5 studio-scrollbar ${
            mobileActiveView === 'paper' ? 'block' : 'hidden lg:block'
          }`}
        >
          
          {/* Paper Control Top Bar */}
          <div className="bg-slate-900 text-white p-3.5 sm:p-4 md:p-5 rounded-2xl sm:rounded-3xl shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-amber-400" />
                <span>লাইভ প্রশ্নপত্র প্রিভিউ</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                নির্বাচিত প্রশ্ন: <span className="text-amber-400 font-extrabold">{paperQuestions.length}</span> টি
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Quick Paper Columns Switcher */}
              <div className="hidden sm:flex items-center bg-white/10 p-0.5 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => handleSetPaperColumns('1')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    paperColumns === '1' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-300 hover:text-white'
                  }`}
                  title="১ কলাম লেআউট"
                >
                  <List size={12} />
                  <span>১ কলাম</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPaperColumns('2')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    paperColumns === '2' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-300 hover:text-white'
                  }`}
                  title="২ কলাম লেআউট"
                >
                  <Columns2 size={12} />
                  <span>২ কলাম</span>
                </button>
              </div>

              <button
                onClick={() => setIsHeaderModalOpen(true)}
                title="পরীক্ষার শিরোনাম ও সময় এডিট করুন"
                className="p-2.5 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Pencil size={15} />
                <span className="hidden md:inline">শিরোনাম</span>
              </button>

              <button
                onClick={() => setShowAnswersInPaper(!showAnswersInPaper)}
                title="উত্তরমালা অন/অফ করুন"
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  showAnswersInPaper 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                <Eye size={15} />
                <span className="hidden md:inline">উত্তরমালা</span>
              </button>

              <button
                onClick={handleCopyPaper}
                title="প্রশ্নপত্র কপি করুন"
                className="p-2.5 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {copiedNotification ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                <span className="hidden md:inline">{copiedNotification ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveMainView('paper');
                  setMobileActiveView('paper');
                  setIsLayoutSidebarOpen(true);
                }}
                title="প্রশ্নপত্রের লেআউট ও অপশন সেটিংস সাইডবার খুলুন"
                className="p-2.5 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <SlidersHorizontal size={15} />
                <span className="hidden md:inline">লেআউট</span>
              </button>

              <button
                onClick={handlePrint}
                title="প্রশ্নপত্র প্রিন্ট বা PDF করুন"
                className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/30 transition-all flex items-center gap-1.5"
              >
                <Printer size={15} />
                <span>প্রিন্ট / PDF</span>
              </button>
            </div>
          </div>

          {/* Printable Question Paper Sheet Card (Broad, High-Readability Exam Paper) */}
          <div 
            id="printable-question-paper"
            className="w-full max-w-full overflow-hidden bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 border border-slate-200/90 shadow-xl space-y-5 sm:space-y-6 min-h-[550px] print:m-0 print:p-0 print:border-none print:shadow-none"
          >
            {/* Institution / Exam Header (Editable in-place) */}
            <div className="relative text-center border-b-2 border-slate-900 pb-4 space-y-1.5">
              <div className="flex justify-end print:hidden mb-1">
                <button
                  type="button"
                  onClick={() => setIsHeaderModalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg"
                >
                  <Pencil size={12} />
                  <span>শিরোনাম ও সময় এডিট</span>
                </button>
              </div>

              <input
                type="text"
                value={paperHeader.institutionName}
                onChange={(e) => setPaperHeader({ ...paperHeader, institutionName: e.target.value })}
                className="w-full text-center text-xl sm:text-2xl font-extrabold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none bg-transparent tracking-tight"
                title="প্রতিষ্ঠানের নাম এডিট করতে ক্লিক করুন"
              />
              <input
                type="text"
                value={paperHeader.examTitle}
                onChange={(e) => setPaperHeader({ ...paperHeader, examTitle: e.target.value })}
                className="w-full text-center text-sm sm:text-base font-bold text-slate-700 border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none bg-transparent"
                title="পরীক্ষার নাম এডিট করতে ক্লিক করুন"
              />

              <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm font-bold text-slate-800 pt-2 px-2 border-t border-slate-100">
                <div>শ্রেণি: <span className="font-semibold">{paperHeader.classLevel}</span></div>
                <div>বিষয়: <span className="font-semibold">{paperHeader.subject}</span></div>
                <div>সময়: <span className="font-semibold">{paperHeader.duration}</span></div>
                <div>পূর্ণমান: <span className="font-semibold">{toBengaliNumber(paperQuestions.length)}</span></div>
              </div>

              {/* Student Details fill-in on paper */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-3 text-xs text-slate-600 pt-2 border-t border-dashed border-slate-200">
                <div className="text-left truncate">শিক্ষার্থীর নাম: .......................................</div>
                <div className="text-left sm:text-center truncate">রোল নম্বর: ...................</div>
                <div className="text-left sm:text-right truncate">শাখা: ................... তারিখ: ..................</div>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-500 italic pt-1">
                {paperHeader.instructions}
              </p>
            </div>

            {/* Questions in Paper */}
            {paperQuestions.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <FileText size={48} className="mx-auto text-slate-300" />
                <p className="text-slate-600 font-bold text-base">প্রশ্নপত্র এখনো খালি রয়েছে!</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  বামপাশের বইয়ের তালিকা থেকে কাঙ্ক্ষিত প্রশ্নগুলোর <strong>"+ প্রশ্নপত্রে যোগ করুন"</strong> বাটনে ক্লিক করলেই এখানে চমৎকার পূর্ণাঙ্গ প্রশ্নপত্র সাজানো হয়ে যাবে।
                </p>
              </div>
            ) : (
              <>
                {renderPaperQuestionsContainer(false)}
                <div id="paper-bottom-anchor" ref={latestPaperQuestionRef} className="h-2 w-full pointer-events-none" />
              </>
            )}

            {/* Paper Footer summary & Clear All */}
            {paperQuestions.length > 0 && (
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
                <span>মোট প্রশ্ন: {paperQuestions.length}টি | পূর্ণমান: {paperQuestions.length}</span>
                <button
                  onClick={() => {
                    setPaperQuestions([]);
                    try {
                      localStorage.removeItem(LOCAL_STORAGE_SAVED_PAPER);
                    } catch (e) {}
                    showToast('প্রশ্নপত্র খালি করা হয়েছে।');
                  }}
                  className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={13} />
                  <span>সব ক্লিয়ার করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
      )}

      {/* ======================= Modal: নতুন বইয়ের প্রশ্ন যোগ করার ফর্ম ======================= */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <FolderPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">নিজের বইয়ের নতুন প্রশ্ন যুক্ত করুন</h3>
                    <p className="text-xs text-slate-500">আপনার সংরক্ষিত বইয়ের প্রশ্ন ৪টি অপশন সহ আজীবনের জন্য সেভ করুন</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveNewQuestion} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">বিষয় *</label>
                    <select
                      value={newQuestionForm.subject}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, subject: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    >
                      {Object.keys(SUBJECT_TOPIC_MAP).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">শ্রেণি</label>
                    <input
                      type="text"
                      value={newQuestionForm.classLevel}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, classLevel: e.target.value })}
                      placeholder="যেমন: ৯ম-১০ম শ্রেণি"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যায় বা টপিক *</label>
                    <input
                      type="text"
                      value={newQuestionForm.topic}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })}
                      placeholder="যেমন: কারক ও বিভক্তি"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">বইয়ের নাম *</label>
                    <input
                      type="text"
                      value={newQuestionForm.bookName}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, bookName: e.target.value })}
                      placeholder="যেমন: বাংলা ব্যাকরণ ও নির্মিতি"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">পৃষ্ঠা নম্বর বা বোর্ড সাল</label>
                    <input
                      type="text"
                      value={newQuestionForm.pageNumber}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, pageNumber: e.target.value })}
                      placeholder="যেমন: পৃষ্ঠা ১২৪ / ঢাকা বোর্ড ২০২০"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রশ্ন *</label>
                  <textarea
                    rows={2}
                    value={newQuestionForm.question}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                    placeholder="প্রশ্নের পুরো বাক্যটি লিখুন..."
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                  />
                </div>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">অপশন (ক) *</label>
                    <input
                      type="text"
                      value={newQuestionForm.optA}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optA: e.target.value })}
                      placeholder="ক এর উত্তর"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">অপশন (খ) *</label>
                    <input
                      type="text"
                      value={newQuestionForm.optB}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optB: e.target.value })}
                      placeholder="খ এর উত্তর"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">অপশন (গ) *</label>
                    <input
                      type="text"
                      value={newQuestionForm.optC}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optC: e.target.value })}
                      placeholder="গ এর উত্তর"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">অপশন (ঘ) *</label>
                    <input
                      type="text"
                      value={newQuestionForm.optD}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, optD: e.target.value })}
                      placeholder="ঘ এর উত্তর"
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">সঠিক উত্তর * (হুবহু অপশনটি লিখুন)</label>
                    <input
                      type="text"
                      value={newQuestionForm.answer}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, answer: e.target.value })}
                      placeholder="সঠিক অপশনের টেক্সটটি লিখুন"
                      required
                      className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-emerald-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">সংক্ষিপ্ত ব্যাখ্যা (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={newQuestionForm.explanation}
                      onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                      placeholder="কেন এই উত্তরটি সঠিক..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= Modal: প্রশ্ন এডিট করার ফর্ম ======================= */}
      <AnimatePresence>
        {isEditModalOpen && editingQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Pencil size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">প্রশ্ন ও অপশন এডিট করুন</h3>
                    <p className="text-xs text-slate-500">প্রশ্নের লেখা, ৪টি অপশন বা সঠিক উত্তর আপনার প্রয়োজনমতো পরিবর্তন করুন</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveEditedQuestion} className="space-y-4 text-sm">
                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    প্রশ্নের বিবরণ *
                  </label>
                  <textarea
                    rows={3}
                    value={editingQuestion.question}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:bg-white focus:outline-none font-medium text-slate-900 text-sm leading-relaxed"
                  />
                </div>

                {/* 4 Options */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    ৪টি অপশন (যেকোনো একটিকে সঠিক উত্তর হিসেবে মার্ক করতে পারেন)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((optIdx) => {
                      const labels = ['(ক)', '(খ)', '(গ)', '(ঘ)'];
                      const isThisCorrect = editingQuestion.answer === editingQuestion.options[optIdx];
                      return (
                        <div key={optIdx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">অপশন {labels[optIdx]}</span>
                            <button
                              type="button"
                              onClick={() => setEditingQuestion({ ...editingQuestion, answer: editingQuestion.options[optIdx] })}
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-all ${
                                isThisCorrect
                                  ? 'bg-emerald-500 text-white font-extrabold'
                                  : 'text-slate-400 hover:text-slate-700 bg-slate-100'
                              }`}
                            >
                              {isThisCorrect ? '✓ সঠিক উত্তর' : 'সঠিক মার্ক করুন'}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={editingQuestion.options[optIdx]}
                            onChange={(e) => {
                              const newOpts = [...editingQuestion.options] as [string, string, string, string];
                              const oldVal = newOpts[optIdx];
                              newOpts[optIdx] = e.target.value;
                              const newAnswer = editingQuestion.answer === oldVal ? e.target.value : editingQuestion.answer;
                              setEditingQuestion({ ...editingQuestion, options: newOpts, answer: newAnswer });
                            }}
                            required
                            className={`w-full p-2.5 rounded-xl border focus:outline-none text-sm font-medium ${
                              isThisCorrect
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                                : 'bg-slate-50 border-slate-200 focus:border-primary text-slate-900'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explicit Correct Answer & Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 mb-1">
                      সঠিক উত্তর নির্বাচন *
                    </label>
                    <select
                      value={editingQuestion.answer}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, answer: e.target.value })}
                      className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-emerald-900 text-sm"
                    >
                      {editingQuestion.options.map((opt, i) => (
                        <option key={i} value={opt}>
                          {['(ক)', '(খ)', '(গ)', '(ঘ)'][i]} {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      সংক্ষিপ্ত ব্যাখ্যা বা সমাধান (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      value={editingQuestion.explanation || ''}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                      placeholder="যেমন: নিয়ম বা সূত্র..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveFromPaper(editingQuestion.id);
                      setIsEditModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>প্রশ্নপত্র থেকে বাদ দিন</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs sm:text-sm"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-md shadow-primary/30 flex items-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>পরিবর্তন সংরক্ষণ করুন</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= Modal: প্রশ্নপত্রের শিরোনাম ও তথ্য এডিট ======================= */}
      <AnimatePresence>
        {isHeaderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Pencil size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">পরীক্ষার তথ্য ও শিরোনাম এডিট</h3>
                    <p className="text-xs text-slate-500">প্রতিষ্ঠানের নাম, সময় ও পূর্ণমান কাস্টমাইজ করুন</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsHeaderModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">প্রতিষ্ঠানের নাম</label>
                  <input
                    type="text"
                    value={paperHeader.institutionName}
                    onChange={(e) => setPaperHeader({ ...paperHeader, institutionName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">পরীক্ষার নাম / শিরোনাম</label>
                  <input
                    type="text"
                    value={paperHeader.examTitle}
                    onChange={(e) => setPaperHeader({ ...paperHeader, examTitle: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none font-bold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">শ্রেণি</label>
                    <input
                      type="text"
                      value={paperHeader.classLevel}
                      onChange={(e) => setPaperHeader({ ...paperHeader, classLevel: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">বিষয়</label>
                    <input
                      type="text"
                      value={paperHeader.subject}
                      onChange={(e) => setPaperHeader({ ...paperHeader, subject: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">সময়</label>
                    <input
                      type="text"
                      value={paperHeader.duration}
                      onChange={(e) => setPaperHeader({ ...paperHeader, duration: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">মোট নম্বর / পূর্ণমান</label>
                    <input
                      type="text"
                      value={paperHeader.fullMarks}
                      onChange={(e) => setPaperHeader({ ...paperHeader, fullMarks: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">নির্দেশনাবলী</label>
                  <textarea
                    rows={2}
                    value={paperHeader.instructions}
                    onChange={(e) => setPaperHeader({ ...paperHeader, instructions: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:outline-none text-xs"
                  />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem(LOCAL_STORAGE_PAPER_HEADER, JSON.stringify(paperHeader));
                      } catch (e) {}
                      setIsHeaderModalOpen(false);
                      showToast('পরীক্ষার শিরোনাম ও তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm shadow-md"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Question Generation Wizard Modal */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-4xl max-h-[92vh] overflow-y-auto my-auto"
            >
              <QuestionGenerationWizard
                allQuestions={allQuestions}
                initialClass={selectedClass === 'সকল শ্রেণি' ? '১০ম শ্রেণি' : selectedClass}
                onGeneratePaper={handleGenerateFromWizard}
                onCancel={() => setIsWizardOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fixed Sticky Bottom Bar - Attached flush to bottom screen edge with no gap */}
      {paperQuestions.length > 0 && activeMainView === 'bank' && (
        <aside
          aria-label="চলতি প্রশ্নপত্র সারাংশ ও প্রিভিউ"
          className="fixed bottom-0 left-0 right-0 z-40 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 sm:px-6 py-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-lg print:hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="w-full max-w-[1800px] 2xl:max-w-[1860px] mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0 shadow-2xs">
                {paperQuestions.length}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                  <span>প্রশ্নপত্র তৈরি হচ্ছে</span>
                  <span className="text-[11px] sm:text-xs text-primary font-semibold">({paperQuestions.length}টি প্রশ্ন)</span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                  পূর্ণমান: {paperQuestions.length} | সময়: {paperHeader.duration}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFullscreenPaperOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-xs active:scale-95 transition-all shrink-0"
                title="কোনো এডিট অপশন ছাড়া সম্পূর্ণ স্ক্রিন জুড়ে ফ্রেশ প্রশ্নপত্র দেখুন ও PDF করুন"
              >
                <Maximize2 size={14} className="shrink-0" />
                <span className="hidden sm:inline">ফ্রেশ প্রশ্নপত্র (PDF)</span>
                <span className="sm:hidden">ফ্রেশ PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMainView('paper');
                  setMobileActiveView('paper');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm flex items-center space-x-1.5 shadow-xs active:scale-95 transition-all shrink-0"
              >
                <span>প্রশ্নপত্র দেখুন</span>
                <ArrowRight size={14} className="shrink-0" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ======================= Modal/Overlay: সম্পূর্ণ ফ্রেশ প্রশ্নপত্র ফুলস্ক্রিন ভিউ (Clean Print/PDF Ready View) ======================= */}
      <AnimatePresence>
        {isFullscreenPaperOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 sm:bg-slate-950/85 backdrop-blur-md flex flex-col h-screen overflow-hidden print:static print:h-auto print:bg-white print:overflow-visible font-sans"
          >
            {/* Top Floating Control Bar (print:hidden) */}
            <header className="shrink-0 bg-slate-900/95 border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xl z-20 print:hidden">
              {/* Left: Indicator & Info */}
              <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-500/30">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                      ফ্রেশ প্রশ্নপত্র ভিউ (প্রিন্ট ও PDF রেডি)
                    </h2>
                    <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md text-[11px] font-extrabold shadow-2xs">
                      {toBengaliNumber(paperQuestions.length)} টি প্রশ্ন
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden sm:block">
                    কোনো এডিট অপশন ছাড়া সম্পূর্ণ ফ্রেশ প্রশ্নপত্র | পূর্ণমান: {toBengaliNumber(paperQuestions.length)} | সময়: {paperHeader.duration}
                  </p>
                </div>
              </div>

              {/* Center/Right: Quick Layout Controls & Actions */}
              <div className="flex items-center flex-wrap gap-2">
                {/* 1 col / 2 col toggle */}
                <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSetPaperColumns('1')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      paperColumns === '1' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    ১ কলাম
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPaperColumns('2')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      paperColumns === '2' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    ২ কলাম
                  </button>
                </div>

                {/* Answer Key Toggle */}
                <button
                  type="button"
                  onClick={() => setFreshPaperShowAnswers(!freshPaperShowAnswers)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    freshPaperShowAnswers
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                  title="প্রশ্নপত্রের নিচে উত্তরমালা যোগ বা লুকান"
                >
                  <Eye size={13} className={freshPaperShowAnswers ? 'text-emerald-400' : 'text-slate-400'} />
                  <span>{freshPaperShowAnswers ? 'উত্তরমালা অন' : 'উত্তরমালা অফ'}</span>
                </button>

                {/* Main PDF / Print Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold shadow-lg shadow-primary/30 flex items-center gap-1.5 active:scale-95 transition-all"
                  title="প্রশ্নপত্রটি প্রিন্ট করুন অথবা সরাসরি PDF হিসেবে সেভ করুন"
                >
                  <Printer size={15} />
                  <span>পিডিএফ / প্রিন্ট করুন</span>
                </button>

                {/* Close Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreenPaperOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1 active:scale-95 transition-all"
                  title="ফুলস্ক্রিন ভিউ বন্ধ করে ফিরে যান (Esc)"
                >
                  <X size={15} />
                  <span className="hidden sm:inline">ফিরে যান (Esc)</span>
                </button>
              </div>
            </header>

            {/* Main Fresh Paper Container (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-10 pb-16 sm:pb-24 flex justify-center items-start studio-scrollbar print:p-0 print:overflow-visible print:block print:bg-white">
              <div 
                id="fresh-printable-paper"
                className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 md:p-12 shadow-2xl border border-slate-200/90 space-y-6 shrink-0 h-auto min-h-fit mb-12 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none"
              >
                {/* Pure Pristine Header (No Input Fields, No Edit Pencils) */}
                <div className="text-center border-b-2 border-slate-900 pb-5 space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {paperHeader.institutionName || 'প্রতিষ্ঠানের নাম'}
                  </h1>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    {paperHeader.examTitle || 'পরীক্ষার নাম'}
                  </h2>

                  {/* Meta details bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm font-bold text-slate-800 pt-3 px-2 border-t border-slate-300">
                    <div className="text-left sm:text-center">শ্রেণি: <span className="font-semibold">{paperHeader.classLevel}</span></div>
                    <div className="text-right sm:text-center">বিষয়: <span className="font-semibold">{paperHeader.subject}</span></div>
                    <div className="text-left sm:text-center">সময়: <span className="font-semibold">{paperHeader.duration}</span></div>
                    <div className="text-right sm:text-center">পূর্ণমান: <span className="font-semibold">{toBengaliNumber(paperQuestions.length)}</span></div>
                  </div>

                  {/* Student filling line */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 pt-2 border-t border-dashed border-slate-300">
                    <div className="text-left truncate">শিক্ষার্থীর নাম: .......................................</div>
                    <div className="text-left sm:text-center truncate">রোল নম্বর: ...................</div>
                    <div className="text-left sm:text-right truncate"> শাখা: ................... তারিখ: ..................</div>
                  </div>

                  {/* Instructions */}
                  {paperHeader.instructions && (
                    <p className="text-[11px] sm:text-xs text-slate-600 italic pt-1">
                      {paperHeader.instructions}
                    </p>
                  )}
                </div>

                {/* Fresh Questions Container */}
                <div className="min-w-0">
                  {renderPaperQuestionsContainer(false, true)}
                </div>

                {/* Optional Answer Key Section at the bottom */}
                {freshPaperShowAnswers && (
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-300 space-y-3 print:break-before-page">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>উত্তরমালা (Answer Key)</span>
                      </h3>
                      <span className="text-[11px] text-slate-500 italic">মূল্যায়ন ও যাচাইয়ের জন্য</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 text-xs">
                      {paperQuestions.map((q, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center font-bold">
                          <span className="text-slate-500 mr-1">{idx + 1}:</span>
                          <span className="text-emerald-700">{q.answer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Printable Page Footer */}
                <div className="pt-4 border-t border-slate-200 text-center text-[10px] sm:text-xs text-slate-400">
                  {paperHeader.institutionName} | {paperHeader.subject} — সর্বমোট প্রশ্ন: {toBengaliNumber(paperQuestions.length)}টি
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification - Positioned at top so it never overlaps the bottom bar */}
      <AnimatePresence>
        {editToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-xl flex items-center space-x-2 text-xs font-bold border border-slate-700 max-w-[90vw]"
          >
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <span className="truncate">{editToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
