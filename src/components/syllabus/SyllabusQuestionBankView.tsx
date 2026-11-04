import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookMarked, 
  Search, 
  Filter, 
  Sparkles, 
  Layers, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  UploadCloud, 
  Copy, 
  Check, 
  Play, 
  FileText, 
  Award, 
  BookOpen, 
  ExternalLink, 
  Database,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Trash2
} from 'lucide-react';
import { ExamQuestion, AssignedTest, ExamTrack } from '../../types';
import { CHAPTER_QUESTION_BANK, getQuestionsForChapter } from '../../lib/curriculumQuestions';
import { COMPETITIVE_QUESTION_BANK } from '../../lib/competitiveQuestionBank';
import { 
  getStoredCustomQuestions, 
  saveStoredCustomQuestion, 
  saveBulkStoredCustomQuestions, 
  deleteStoredCustomQuestion,
  saveStoredTests,
  getStoredTests
} from '../../lib/storage';

interface SyllabusQuestionBankViewProps {
  onStartExam?: (test: AssignedTest) => void;
  onNavigateDashboard?: () => void;
  onNavigateHome?: () => void;
  onOpenCreateExam?: () => void;
}

// Curriculum Syllabus Metadata Structure
interface ChapterSyllabusMeta {
  chapter: string;
  totalMarks: number;
  mcqMarks: number;
  creativeMarks: number;
  learningOutcomes: string[];
  keyFormulasOrConcepts: string[];
  boardYearTag?: string;
}

interface SubjectSyllabusMeta {
  subject: string;
  code: string;
  chapters: ChapterSyllabusMeta[];
}

interface ClassSyllabusGroup {
  id: string;
  title: string;
  badge: string;
  track: ExamTrack;
  subjects: SubjectSyllabusMeta[];
}

const SYLLABUS_CATALOG: ClassSyllabusGroup[] = [
  {
    id: 'ssc',
    title: '৯ম - ১০ম শ্রেণি (এসএসসি ২০২৫ ও বোর্ড প্রশ্নব্যাংক)',
    badge: 'NCTB ২০২৫ নতুন কারিকুলাম',
    track: 'academic',
    subjects: [
      {
        subject: 'সাধারণ গণিত',
        code: '১০৯',
        chapters: [
          {
            chapter: 'বীজগণিত ও সমীকরণ',
            totalMarks: 20,
            mcqMarks: 5,
            creativeMarks: 15,
            learningOutcomes: [
              'বীজগাণিতিক সূত্রাবলি ও এর জ্যামিতিক ব্যাখ্যা',
              'দ্বিঘাত সমীকরণের মূল নির্ণয় ও সমাধান (ax² + bx + c = 0)',
              'ভগ্নাংশীয় বীজগণিত ও মান নির্ণয়ের বিভিন্ন নিয়ম'
            ],
            keyFormulasOrConcepts: [
              '(a+b)² = a² + 2ab + b²',
              'x = (-b ± √(b² - 4ac)) / (2a)',
              'a³ + b³ = (a+b)(a² - ab + b²)'
            ],
            boardYearTag: '২০২৫ বোর্ড মডেল ও বিগত ৫ বছরের প্রশ্ন'
          },
          {
            chapter: 'জ্যামিতি ও ক্ষেত্রফল',
            totalMarks: 20,
            mcqMarks: 5,
            creativeMarks: 15,
            learningOutcomes: [
              'পীথাগোরাসের উপপাদ্য ও এর বিপরীত প্রতিজ্ঞা',
              'বৃত্ত ও স্পর্শক সম্পর্কিত উপপাদ্য',
              'ত্রিভুজ ও চতুর্ভুজের ক্ষেত্রফল পরিমাপ'
            ],
            keyFormulasOrConcepts: [
              'অতিভুজ² = লম্ব² + ভূমি²',
              'বৃত্তের ক্ষেত্রফল = πr²',
              'সমবাহু ত্রিভুজের ক্ষেত্রফল = (√3/4)a²'
            ],
            boardYearTag: 'ঢাকা, চট্টগ্রাম ও রাজশাহী বোর্ড'
          },
          {
            chapter: 'ত্রিকোণমিতি ও পরিমিতি',
            totalMarks: 15,
            mcqMarks: 4,
            creativeMarks: 11,
            learningOutcomes: [
              'সূক্ষ্মকোণের ত্রিকোণমিতিক অনুপাত (sin, cos, tan)',
              'দূরত্ব ও উচ্চতা নির্ণয় সম্পর্কিত ব্যবহারিক সমস্যা',
              'সিলিন্ডার ও গোলকের পৃষ্ঠতলের ক্ষেত্রফল'
            ],
            keyFormulasOrConcepts: [
              'sin²θ + cos²θ = 1',
              'tanθ = sinθ / cosθ',
              'sec²θ - tan²θ = 1'
            ],
            boardYearTag: 'সকল বোর্ড ২০২৪-২০২৫'
          }
        ]
      },
      {
        subject: 'পদার্থবিজ্ঞান',
        code: '১৩৬',
        chapters: [
          {
            chapter: 'গতিবিদ্যা ও বল',
            totalMarks: 25,
            mcqMarks: 8,
            creativeMarks: 17,
            learningOutcomes: [
              'গতি ও স্কেলার-ভেক্টর রাশির পার্থক্য',
              'গতির সমীকরণ প্রতিপাদন ও গ্রাফ বিশ্লেষণ',
              'নিউটনের গতির সূত্রাবলি ও ভরবেগের নিত্যতা'
            ],
            keyFormulasOrConcepts: [
              'v = u + at',
              's = ut + ½at²',
              'v² = u² + 2as',
              'F = ma'
            ],
            boardYearTag: 'এসএসসি ২০২৫ প্রমিত মান'
          },
          {
            chapter: 'কাজ, ক্ষমতা ও শক্তি',
            totalMarks: 20,
            mcqMarks: 5,
            creativeMarks: 15,
            learningOutcomes: [
              'কাজের গাণিতিক সংজ্ঞা ও ধনাত্মক/ঋণাত্মক কাজ',
              'গতিশক্তি ও বিভব শক্তির রূপান্তর',
              'কর্মদক্ষতা নির্ণয় ও শক্তির নিত্যতা'
            ],
            keyFormulasOrConcepts: [
              'W = Fs cosθ',
              'Ek = ½mv²',
              'Ep = mgh',
              'কর্মদক্ষতা (η) = (লভ্য কার্যকর শক্তি / মোট প্রদত্ত শক্তি) × ১০০%'
            ],
            boardYearTag: 'কুমিল্লা ও সিলেট বোর্ড'
          }
        ]
      },
      {
        subject: 'বাংলা সাহিত্য ও ব্যাকরণ',
        code: '১০১',
        chapters: [
          {
            chapter: 'অপরিচিতা ও বিলাসী',
            totalMarks: 30,
            mcqMarks: 10,
            creativeMarks: 20,
            learningOutcomes: [
              'যৌতুকপ্রথার বিরুদ্ধে বলিষ্ঠ প্রতিবাদ ও কল্যাণীর চরিত্র',
              'শরৎচন্দ্রের বিলাসী গল্পের মানবপ্রেম ও কুসংস্কার বিরোধিতা',
              'শব্দার্থ, বাক্য সংকোচন ও সাহিত্যের রসাস্বাদন'
            ],
            keyFormulasOrConcepts: [
              'রবীন্দ্রনাথ ঠাকুরের "অপরিচিতা" (প্রথম প্রকাশ সবুজপত্র ১৯১৪)',
              'শরৎচন্দ্র চট্টোপাধ্যায়ের "বিলাসী" (উদ্ধারকারী সাপুড়ের কন্যা)',
              'সন্ধি ও সমাসের মৌলিক নিয়ম'
            ],
            boardYearTag: '২০২৫ বোর্ড প্রশ্নব্যাংক'
          }
        ]
      }
    ]
  },
  {
    id: 'hsc',
    title: 'একাদশ - দ্বাদশ শ্রেণি (এইচএসসি ২০২৫ ও বোর্ড প্রশ্নব্যাংক)',
    badge: 'উচ্চ মাধ্যমিক পূর্ণাঙ্গ সিলেবাস',
    track: 'academic',
    subjects: [
      {
        subject: 'উচ্চতর গণিত',
        code: '২৬৫',
        chapters: [
          {
            chapter: 'ম্যাট্রিক্স ও নির্ণায়ক',
            totalMarks: 10,
            mcqMarks: 3,
            creativeMarks: 7,
            learningOutcomes: [
              'ম্যাট্রিক্সের প্রকারভেদ, গুণন ও বিপরীত ম্যাট্রিক্স',
              'ক্রেমারের নিয়মে একঘাত সমীকরণ জোট সমাধান'
            ],
            keyFormulasOrConcepts: [
              '|A| ≠ 0 হলে A⁻¹ = (1/|A|) adj(A)',
              'AB ≠ BA (সাধারণত)'
            ],
            boardYearTag: 'এইচএসসি ২০২৫ স্পেশাল'
          },
          {
            chapter: 'ক্যালকুলাস (অন্তরীকরণ ও যোগজীকরণ)',
            totalMarks: 20,
            mcqMarks: 6,
            creativeMarks: 14,
            learningOutcomes: [
              'সীমা বা লিমিট ও অবিচ্ছিন্নতা',
              'অন্তরজ নির্ণয় ও গুরুমান-লঘুমান বিশ্লেষণ',
              'নির্দিষ্ট ও অনির্দিষ্ট যোগজীকরণ'
            ],
            keyFormulasOrConcepts: [
              'd/dx(xⁿ) = n xⁿ⁻¹',
              'd/dx(sin x) = cos x',
              '∫ xⁿ dx = (xⁿ⁺¹)/(n+1) + C'
            ],
            boardYearTag: '২০২৫ সম্ভাব্য মডেল প্রশ্ন'
          }
        ]
      },
      {
        subject: 'রসায়ন',
        code: '১৭৬',
        chapters: [
          {
            chapter: 'গুণগত রসায়ন',
            totalMarks: 15,
            mcqMarks: 5,
            creativeMarks: 10,
            learningOutcomes: [
              'বোর পরমাণু মডেল ও কোয়ান্টাম সংখ্যা',
              'আউফবাউ, হুন্ড ও পাউলির বর্জন নীতি',
              'দ্রাব্যতা ও দ্রাব্যতা গুণফল (Ksp)'
            ],
            keyFormulasOrConcepts: [
              'mvr = nh / 2π',
              'ΔE = hν = hc/λ',
              'Ksp = [A⁺]ᵐ [B⁻]ⁿ'
            ],
            boardYearTag: 'এইচএসসি বোর্ড প্রশ্নাবলি'
          }
        ]
      }
    ]
  },
  {
    id: 'bcs',
    title: '🏛️ বিসিএস প্রিলিমিনারি (১০ম - ৪৬তম বিসিএস)',
    badge: 'বিপিএসসি সিলেবাস ২০০ নম্বর',
    track: 'bcs',
    subjects: [
      {
        subject: 'বাংলা ভাষা ও সাহিত্য',
        code: 'BCS-01',
        chapters: [
          {
            chapter: 'প্রাচীন ও মধ্যযুগ',
            totalMarks: 5,
            mcqMarks: 5,
            creativeMarks: 0,
            learningOutcomes: [
              'চর্যাপদ আবিষ্কার, কবি ও ভাষা পরিচয়',
              'শ্রীকৃষ্ণকীর্তন কাব্য ও বৈষ্ণব পদাবলী',
              'মঙ্গলকাব্য ও আরাকান রাজসভা'
            ],
            keyFormulasOrConcepts: [
              'হরপ্রসাদ শাস্ত্রী ১৯০৭ সালে নেপাল থেকে চর্যাপদ উদ্ধার করেন',
              'কাহ্নপা সর্বোচ্চ ১৩টি পদ রচনা করেন'
            ],
            boardYearTag: '৪৪তম, ৪৫তম ও ৪৬তম বিসিএস'
          },
          {
            chapter: 'আধুনিক যুগ ও ব্যাকরণ',
            totalMarks: 30,
            mcqMarks: 30,
            creativeMarks: 0,
            learningOutcomes: [
              'ফোর্ট উইলিয়াম কলেজ ও বাংলা গদ্যের বিকাশ',
              'রবীন্দ্রনাথ, নজরুল, বঙ্কিমচন্দ্র ও জসীম উদ্দীন',
              'ধ্বনি ও বর্ণ, সন্ধি, সমাস, কারক ও প্রত্যয়'
            ],
            keyFormulasOrConcepts: [
              'প্রথম সার্থক বাংলা নাটক: শর্মিষ্ঠা (১৮৫৯)',
              'প্রত্যুষ = প্রতি + ঊষ'
            ],
            boardYearTag: '১০ম-৪৫তম বিসিএস প্রিভিয়াস'
          }
        ]
      },
      {
        subject: 'বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী',
        code: 'BCS-02',
        chapters: [
          {
            chapter: 'বাংলাদেশের মুক্তিযুদ্ধ ও সংবিধান',
            totalMarks: 50,
            mcqMarks: 50,
            creativeMarks: 0,
            learningOutcomes: [
              '১৯৪৭ থেকে ১৯৭১ সালের ঐতিহাসিক ঘটনাবলি',
              'মুজিবনগর সরকার গঠন ও সেক্টর কমান্ডারগণ',
              'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানের মূলনীতি ও অনুচ্ছেদ'
            ],
            keyFormulasOrConcepts: [
              'সংবিধান কার্যকর হয়: ১৬ ডিসেম্বর ১৯৭২',
              'মুজিবনগর সরকারের রাষ্ট্রপতি: বঙ্গবন্ধু শেখ মুজিবুর রহমান'
            ],
            boardYearTag: 'বিসিএস সকল পরীক্ষা'
          }
        ]
      }
    ]
  },
  {
    id: 'medical',
    title: '🩺 মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষা',
    badge: 'ডিজিএইচএস প্রমিত প্রশ্নব্যাংক',
    track: 'medical',
    subjects: [
      {
        subject: 'জীববিজ্ঞান (উদ্ভিদ ও প্রাণিবিজ্ঞান)',
        code: 'MED-BIO',
        chapters: [
          {
            chapter: 'কোষ ও এর গঠন',
            totalMarks: 15,
            mcqMarks: 15,
            creativeMarks: 0,
            learningOutcomes: [
              'প্লাজমামেমব্রেনের ফ্লুইড মোজাইক মডেল',
              'মাইটোকন্ড্রিয়া ও ক্লোরোপ্লাস্টের গঠন',
              'ডিএনএ অনুলিপন ও প্রোটিন সংশ্লেষণ'
            ],
            keyFormulasOrConcepts: [
              'সিঙ্গার ও নিকলসন ১৯৭২ সালে ফ্লুইড মোজাইক মডেল প্রবর্তন করেন',
              'মাইটোকন্ড্রিয়া কোষের পাওয়ার হাউস'
            ],
            boardYearTag: 'মেডিকেল ২০২৩-২৪ প্রশ্ন'
          },
          {
            chapter: 'রক্ত ও সংবহন',
            totalMarks: 15,
            mcqMarks: 15,
            creativeMarks: 0,
            learningOutcomes: [
              'রক্তের উপাদান ও রক্তকণিকার কাজ',
              'হৃৎপিণ্ডের গঠন, রক্ত সংবহন ও পেসমেকার',
              'রক্ত তঞ্চন প্রক্রিয়া ও ফ্যাক্টরসমূহ'
            ],
            keyFormulasOrConcepts: [
              'রক্তের প্রধান বাফার: বাইকার্বনেট বাফার (H₂CO₃ / NaHCO₃)',
              'রক্ত তঞ্চনের প্রধান ৪টি ফ্যাক্টর: ফাইব্রিনোজেন, প্রোথ্রম্বিন, থ্রম্বোপ্লাস্টিন, ক্যালসিয়াম'
            ],
            boardYearTag: 'ডেন্টাল ও মেডিকেল প্রশ্নব্যাংক'
          }
        ]
      }
    ]
  },
  {
    id: 'primary',
    title: '১ম - ৮ম শ্রেণি (প্রাথমিক ও নিম্ন মাধ্যমিক কারিকুলাম)',
    badge: 'NCTB মৌলিক বুনিয়াদ',
    track: 'academic',
    subjects: [
      {
        subject: 'সাধারণ গণিত',
        code: 'GEN-MATH',
        chapters: [
          {
            chapter: 'পাটিগণিত ও অনুপাত',
            totalMarks: 50,
            mcqMarks: 15,
            creativeMarks: 35,
            learningOutcomes: [
              'ঐকিক নিয়ম, লাভ-ক্ষতি ও সরল মুনাফা',
              'অনুপাত ও সমানুপাত সমস্যা সমাধান',
              'ল.সা.গু ও গ.সা.গু নির্ণয়'
            ],
            keyFormulasOrConcepts: [
              'মুনাফা (I) = Pnr',
              'লাভ = বিক্রয়মূল্য - ক্রয়মূল্য'
            ],
            boardYearTag: 'পিইসি ও জেএসসি কারিকুলাম'
          }
        ]
      }
    ]
  }
];

export const SyllabusQuestionBankView: React.FC<SyllabusQuestionBankViewProps> = ({
  onStartExam,
  onNavigateDashboard,
  onNavigateHome,
  onOpenCreateExam
}) => {
  // Navigation inside Syllabus & Question Bank Hub
  const [activeTab, setActiveTab] = useState<'syllabus' | 'explorer' | 'my_database'>('explorer');
  const [selectedClassId, setSelectedClassId] = useState<string>('ssc');
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>('সাধারণ গণিত');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom question add modal / form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [newExplanation, setNewExplanation] = useState('');
  const [newMethodOne, setNewMethodOne] = useState('');
  const [newMethodTwo, setNewMethodTwo] = useState('');
  const [newTrack, setNewTrack] = useState<ExamTrack>('academic');
  const [newSubject, setNewSubject] = useState('সাধারণ গণিত');
  const [newTopic, setNewTopic] = useState('বীজগণিত ও সমীকরণ');
  const [newExamSource, setNewExamSource] = useState('২০২৫ সালের বোর্ড পরীক্ষা');

  // Bulk import state
  const [bulkText, setBulkText] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Custom questions from localStorage
  const [customQuestions, setCustomQuestions] = useState<ExamQuestion[]>([]);

  useEffect(() => {
    setCustomQuestions(getStoredCustomQuestions());
    const handleUpdate = () => {
      setCustomQuestions(getStoredCustomQuestions());
    };
    window.addEventListener('dapathshala_custom_questions_updated', handleUpdate);
    return () => window.removeEventListener('dapathshala_custom_questions_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Build unified question bank (Static curriculum + Competitive + User Custom Questions)
  const allQuestionsPool: ExamQuestion[] = useMemo(() => {
    const list: ExamQuestion[] = [];

    // 1. Gather curriculum questions
    Object.entries(CHAPTER_QUESTION_BANK).forEach(([chapterName, questions]) => {
      questions.forEach((q, idx) => {
        let subject = 'সাধারণ গণিত';
        let track: ExamTrack = 'academic';
        if (chapterName.includes('অপরিচিতা') || chapterName.includes('বিলাসী') || chapterName.includes('সোনার তরী')) {
          subject = 'বাংলা সাহিত্য ও ব্যাকরণ';
        } else if (chapterName.includes('বল') || chapterName.includes('গতি') || chapterName.includes('আলো')) {
          subject = 'পদার্থবিজ্ঞান';
        } else if (chapterName.includes('Right Form') || chapterName.includes('Preposition')) {
          subject = 'English Grammar';
        }

        list.push({
          id: `curr_${chapterName}_${idx}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          solutions: q.solutions || [
            `পদ্ধতি ১ (পাঠ্যবই নিয়ম): ${q.explanation}`,
            `পদ্ধতি ২ (বিকল্প যুক্তি): বিকল্পগুলো পর্যালোচনা করে সঠিক উত্তর "${q.correctAnswer}" যাচাই করা সম্ভব।`
          ],
          subject,
          topic: chapterName,
          track,
          examSource: 'এসএসসি / এইচএসসি ২০২৫ বোর্ড মডেল',
          year: 2025
        });
      });
    });

    // 2. Gather competitive questions
    COMPETITIVE_QUESTION_BANK.forEach(q => {
      list.push(q);
    });

    // 3. Gather user custom database questions
    customQuestions.forEach(q => {
      list.push(q);
    });

    return list;
  }, [customQuestions]);

  // Filtered Questions according to active search, track, year, and subject
  const filteredQuestions = useMemo(() => {
    return allQuestionsPool.filter(q => {
      // Query search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQ = q.question.toLowerCase().includes(query);
        const matchesOptions = q.options.some(opt => opt.toLowerCase().includes(query));
        const matchesSubject = q.subject?.toLowerCase().includes(query);
        const matchesTopic = q.topic?.toLowerCase().includes(query);
        const matchesSource = q.examSource?.toLowerCase().includes(query);
        if (!matchesQ && !matchesOptions && !matchesSubject && !matchesTopic && !matchesSource) {
          return false;
        }
      }

      // Track filter
      if (selectedTrackFilter !== 'all') {
        if (q.track !== selectedTrackFilter) return false;
      }

      // Year filter
      if (selectedYearFilter !== 'all') {
        if (selectedYearFilter === '2025') {
          if (!q.examSource?.includes('২০২৫') && q.year !== 2025) return false;
        } else if (selectedYearFilter === '2024') {
          if (!q.examSource?.includes('২০২৪') && q.year !== 2024) return false;
        } else if (selectedYearFilter === 'bcs_prev') {
          if (q.track !== 'bcs') return false;
        }
      }

      return true;
    });
  }, [allQuestionsPool, searchQuery, selectedTrackFilter, selectedYearFilter]);

  // Current active class group for syllabus view
  const activeClassGroup = useMemo(() => {
    return SYLLABUS_CATALOG.find(c => c.id === selectedClassId) || SYLLABUS_CATALOG[0];
  }, [selectedClassId]);

  // Toggle explanation / solutions
  const toggleSolution = (id: string) => {
    setExpandedSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Direct practice test generator from filtered questions or chapter
  const handleLaunchPracticeExam = (title: string, questionsToUse: ExamQuestion[]) => {
    if (!questionsToUse || questionsToUse.length === 0) {
      showToast('⚠️ নির্বাচিত বিষয়ে কোনো প্রশ্ন পাওয়া যায়নি!');
      return;
    }
    const sample = questionsToUse.slice(0, 10);
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const newTest: AssignedTest = {
      id: 'test_syllabus_' + Date.now().toString(36),
      title: title,
      subject: sample[0]?.subject || 'সাধারণ মূল্যায়ন',
      chapter: sample[0]?.topic || 'সিলেবাস ও প্রশ্নব্যাংক অনুশীলন',
      questionCount: sample.length,
      durationMinutes: Math.max(5, sample.length * 2),
      pin: pin,
      createdAt: 'আজ, ১-ক্লিকে সিলেবাস থেকে প্রস্তুত',
      status: 'pending',
      studentName: 'অনুশীলনকারী শিক্ষার্থী',
      totalMarks: sample.length * 2,
      proctoringEnabled: true,
      aiGradingEnabled: true,
      questions: sample
    };

    const currentTests = getStoredTests();
    saveStoredTests([newTest, ...currentTests]);

    if (onStartExam) {
      onStartExam(newTest);
    } else if (onNavigateDashboard) {
      onNavigateDashboard();
    }
  };

  // Add custom single question
  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newOptionA.trim() || !newOptionB.trim() || !newOptionC.trim() || !newOptionD.trim()) {
      showToast('⚠️ অনুগ্রহ করে প্রশ্ন এবং ৪টি অপশন সঠিকভাবে লিখুন');
      return;
    }

    const options = [newOptionA.trim(), newOptionB.trim(), newOptionC.trim(), newOptionD.trim()];
    const correctMap = { A: 0, B: 1, C: 2, D: 3 };
    const correctIndex = correctMap[newCorrectAnswer];
    const correctAnswer = options[correctIndex];

    const solutions: string[] = [];
    if (newMethodOne.trim()) {
      solutions.push(`পদ্ধতি ১ (মূল নিয়ম): ${newMethodOne.trim()}`);
    } else {
      solutions.push(`পদ্ধতি ১ (বিশ্লেষণ): ${newExplanation.trim() || 'পাঠ্যবইয়ের সংশ্লিষ্ট নিয়মানুযায়ী সঠিক উত্তর।'}`);
    }

    if (newMethodTwo.trim()) {
      solutions.push(`পদ্ধতি ২ (বিকল্প নিয়ম): ${newMethodTwo.trim()}`);
    } else {
      solutions.push(`পদ্ধতি ২ (স্মার্ট টেকনিক): বিকল্প অপশনগুলো বাদ দিয়ে সরাসরি উত্তর "${correctAnswer}" যাচাই করা যায়।`);
    }

    const created: ExamQuestion = {
      id: 'custom_q_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      question: newQuestionText.trim(),
      options: options,
      correctAnswer: correctAnswer,
      correctAnswerIndex: correctIndex,
      explanation: newExplanation.trim() || 'আপনার নিজস্ব সংরক্ষিত প্রশ্ন ব্যাখ্যা।',
      solutions: solutions,
      subject: newSubject,
      topic: newTopic,
      track: newTrack,
      examSource: newExamSource || 'আমার সংরক্ষিত প্রশ্নব্যাংক',
      year: 2025
    };

    saveStoredCustomQuestion(created);
    setShowAddModal(false);
    // Reset form
    setNewQuestionText('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
    setNewExplanation('');
    setNewMethodOne('');
    setNewMethodTwo('');
    showToast('✅ নতুন প্রশ্নটি সফলভাবে আপনার প্রশ্নব্যাংকে যুক্ত হয়েছে!');
  };

  // Bulk import questions from text format (e.g. Q: ... A: ... B: ... Ans: ...)
  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      showToast('⚠️ অনুগ্রহ করে প্রশ্ন টেক্সট পেস্ট করুন');
      return;
    }

    try {
      // Check if user pasted JSON
      if (bulkText.trim().startsWith('[') && bulkText.trim().endsWith(']')) {
        const parsed = JSON.parse(bulkText);
        if (Array.isArray(parsed)) {
          const validated = parsed.map((item: any, i: number) => ({
            id: 'bulk_q_' + Date.now().toString(36) + '_' + i,
            question: item.question || item.q || 'প্রশ্ন ' + (i + 1),
            options: Array.isArray(item.options) ? item.options : [item.a, item.b, item.c, item.d].filter(Boolean),
            correctAnswer: item.correctAnswer || item.answer || item.ans || item.options?.[0] || 'ক',
            explanation: item.explanation || item.exp || 'বোর্ড ভিত্তিক বিস্তারিত সমাধান।',
            solutions: Array.isArray(item.solutions) ? item.solutions : [
              `পদ্ধতি ১: ${item.explanation || 'নৈর্ব্যক্তিক বিশ্লেষণ'}`,
              `পদ্ধতি ২: শর্টকাট সূত্র বা ব্যাকরণ যাচাই`
            ],
            subject: item.subject || 'সাধারণ গণিত',
            topic: item.topic || '২০২৫ বোর্ড প্রশ্নব্যাংক',
            track: (item.track as ExamTrack) || 'academic',
            examSource: item.examSource || '২০২৫ সালের বোর্ড প্রশ্ন',
            year: 2025
          }));
          saveBulkStoredCustomQuestions(validated);
          setShowBulkModal(false);
          setBulkText('');
          showToast(`🎉 চমৎকার! ${validated.length}টি প্রশ্ন সফলভাবে ডাটাবেজে যুক্ত হয়েছে!`);
          return;
        }
      }

      // Simple plain text lines parser
      const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
      const imported: ExamQuestion[] = [];
      let curQ: Partial<ExamQuestion> | null = null;
      let curOpts: string[] = [];

      lines.forEach((line) => {
        if (line.startsWith('প্রশ্ন:') || line.startsWith('Q:') || /^\d+[\.\)]/.test(line)) {
          if (curQ && curQ.question && curOpts.length >= 2) {
            imported.push({
              id: 'bulk_txt_' + Date.now().toString(36) + '_' + imported.length,
              question: curQ.question,
              options: curOpts.length === 4 ? curOpts : [...curOpts, 'বিকল্প ৩', 'বিকল্প ৪'].slice(0, 4),
              correctAnswer: curOpts[0],
              explanation: 'সংরক্ষিত প্রশ্ন ডাটাবেজ সমাধান।',
              solutions: [
                'পদ্ধতি ১ (সাধারণ নিয়ম): প্রশ্ন অনুযায়ী প্রথম বিকল্পটি সঠিক।',
                'পদ্ধতি ২ (বিকল্প নিয়ম): অপশন যাচাই পদ্ধতি।'
              ],
              subject: '২০২৫ বোর্ড প্রশ্ন',
              topic: 'সংগৃহীত অধ্যায়',
              track: 'academic',
              examSource: '২০২৫ বোর্ড সংগৃহীত',
              year: 2025
            });
          }
          curQ = { question: line.replace(/^(প্রশ্ন:|Q:|\d+[\.\)])\s*/, '') };
          curOpts = [];
        } else if (/^[ক-ঘa-dA-D][\.\)]/.test(line) || line.startsWith('অপশন:')) {
          curOpts.push(line.replace(/^([ক-ঘa-dA-D][\.\)]|অপশন:)\s*/, ''));
        }
      });

      if (curQ && curQ.question && curOpts.length >= 2) {
        imported.push({
          id: 'bulk_txt_' + Date.now().toString(36) + '_' + imported.length,
          question: curQ.question,
          options: curOpts.length === 4 ? curOpts : [...curOpts, 'বিকল্প ৩', 'বিকল্প ৪'].slice(0, 4),
          correctAnswer: curOpts[0],
          explanation: 'সংরক্ষিত প্রশ্ন ডাটাবেজ সমাধান।',
          solutions: [
            'পদ্ধতি ১ (সাধারণ নিয়ম): প্রশ্ন অনুযায়ী প্রথম বিকল্পটি সঠিক।',
            'পদ্ধতি ২ (বিকল্প নিয়ম): অপশন যাচাই পদ্ধতি।'
          ],
          subject: '২০২৫ বোর্ড প্রশ্ন',
          topic: 'সংগৃহীত অধ্যায়',
          track: 'academic',
          examSource: '২০২৫ বোর্ড সংগৃহীত',
          year: 2025
        });
      }

      if (imported.length > 0) {
        saveBulkStoredCustomQuestions(imported);
        setShowBulkModal(false);
        setBulkText('');
        showToast(`🎉 চমৎকার! ${imported.length}টি প্রশ্ন সফলভাবে ডাটাবেজে যুক্ত হয়েছে!`);
      } else {
        showToast('⚠️ টেক্সট ফরম্যাট শনাক্ত করা যায়নি। সঠিক ফরম্যাটে লিখুন অথবা JSON ব্যবহার করুন।');
      }
    } catch (err) {
      showToast('⚠️ প্রশ্ন রূপান্তর করতে সমস্যা হয়েছে। দয়া করে ফরম্যাট চেক করুন।');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f3f7fa] text-slate-800 pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. HERO HEADER: সিলেবাস ও জাতীয় প্রশ্নব্যাংক ভান্ডার      */}
      {/* ======================================================== */}
      <div className="bg-linear-to-b from-[#0c1322] to-[#131e33] text-white border-b border-slate-800 px-4 sm:px-6 py-6 sm:py-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs sm:text-sm font-bold mb-2">
              <BookMarked className="w-4 h-4 text-cyan-400" />
              <span>NCTB কারিকুলাম, ২০২৫ সালের বোর্ড প্রশ্ন ও ভর্তি প্রশ্নব্যাংক</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>সিলেবাস ও জাতীয় প্রশ্নব্যাংক ভান্ডার</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-600/30 border border-cyan-400 text-cyan-200 font-bold">
                {allQuestionsPool.length}+ প্রশ্ন উপলব্ধ
              </span>
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-300 font-medium max-w-3xl leading-relaxed">
              ১ম-১২শ শ্রেণি (নৈর্ব্যক্তিক ও বিস্তারিত সমাধান), ২০২৫ সালের সকল বোর্ড পরীক্ষার প্রশ্নব্যাংক এবং বিসিএস, মেডিকেল ও বিশ্ববিদ্যালয় ভর্তি পরীক্ষার সম্পূর্ণ সিলেবাস ও অনুশীলন কেন্দ্র।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-cyan-900/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্রশ্ন যোগ করুন</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>বাল্ক প্রশ্ন ইমপোর্ট</span>
            </button>

            {onOpenCreateExam && (
              <button
                type="button"
                onClick={onOpenCreateExam}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>এআই পরীক্ষা বানান</span>
              </button>
            )}
          </div>

        </div>

        {/* Primary View Switcher Tabs: Syllabus vs Question Explorer vs My Custom DB */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center gap-2 border-b border-slate-800/80 pb-0.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'explorer'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-t-lg'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>প্রশ্নব্যাংক ও বিস্তারিত সমাধান ({filteredQuestions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'syllabus'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-t-lg'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>শ্রেণিভিত্তিক NCTB ও ভর্তি সিলেবাস ডিরেক্টরি</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my_database')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'my_database'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-t-lg'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>আমার নিজস্ব ডাটাবেজ ({customQuestions.length} টি সংরক্ষিত)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN CONTAINER CONTENT                                   */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

        {/* ------------------------------------------------------ */}
        {/* VIEW 1: QUESTION BANK EXPLORER & SEARCH (DEFAULT)       */}
        {/* ------------------------------------------------------ */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            
            {/* Search & Filter Toolbar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="প্রশ্ন, অধ্যায়, সূত্র বা বিষয় দিয়ে খুঁজুন (যেমন: দ্বিঘাত, চর্যাপদ, রক্ত সংবহন, ২০২৫ বোর্ড)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-slate-800 placeholder-slate-400 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded-full"
                  >
                    ক্লিয়ার
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                
                {/* Track Selector */}
                <select
                  value={selectedTrackFilter}
                  onChange={(e) => setSelectedTrackFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 cursor-pointer"
                >
                  <option value="all">সকল ক্যাটাগরি</option>
                  <option value="academic">১ম-১২শ শ্রেণি (NCTB)</option>
                  <option value="bcs">🏛️ বিসিএস প্রিলিমিনারি</option>
                  <option value="medical">🩺 মেডিকেল ভর্তি</option>
                  <option value="varsity">🎓 বিশ্ববিদ্যালয় ভর্তি</option>
                  <option value="engineering">⚙️ ইঞ্জিনিয়ারিং ভর্তি</option>
                </select>

                {/* Year / Source Filter */}
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 cursor-pointer"
                >
                  <option value="all">সকল সাল ও উৎস</option>
                  <option value="2025">✨ ২০২৫ সালের বোর্ড প্রশ্ন</option>
                  <option value="2024">২০২৪ সালের বোর্ড প্রশ্ন</option>
                  <option value="bcs_prev">বিসিএস প্রিভিয়াস প্রশ্ন</option>
                </select>

                {/* Instant Test from filtered questions */}
                <button
                  type="button"
                  onClick={() => handleLaunchPracticeExam('প্রশ্নব্যাংক দ্রুত অনুশীলন টেস্ট', filteredQuestions)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                  title="এই ফিল্টারের প্রশ্নগুলো থেকে টেস্ট দিন"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>১-ক্লিকে টেস্ট দিন ({Math.min(filteredQuestions.length, 10)}টি)</span>
                </button>
              </div>

            </div>

            {/* Questions Counter & Quick Tag Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-600 font-medium px-1">
              <div className="flex items-center gap-2">
                <span>মোট প্রদর্শিত প্রশ্ন: <strong className="text-cyan-700 font-bold">{filteredQuestions.length}টি</strong></span>
                {selectedTrackFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 font-semibold text-xs">
                    ফিল্টার: {selectedTrackFilter}
                  </span>
                )}
                {selectedYearFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold text-xs">
                    সাল: {selectedYearFilter}
                  </span>
                )}
              </div>

              <div className="text-slate-500 text-xs">
                💡 প্রতিটি প্রশ্নে <strong>"বিস্তারিত সমাধান"</strong> বোতামে ক্লিক করে ২ ধরণের সমাধান পদ্ধতি দেখুন
              </div>
            </div>

            {/* Questions List Cards */}
            {filteredQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">কোনো প্রশ্ন পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা আপনার নিজস্ব প্রশ্ন যুক্ত করুন।</p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSelectedTrackFilter('all'); setSelectedYearFilter('all'); }}
                  className="mt-4 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions.map((q, qIndex) => {
                  const isExpanded = !!expandedSolutions[q.id];
                  const methods = q.solutions && q.solutions.length >= 2 
                    ? q.solutions 
                    : [
                        `পদ্ধতি ১ (সাধারণ নিয়ম): ${q.explanation || 'সঠিক উত্তর যাচাইকরণ'}`,
                        `পদ্ধতি ২ (বিকল্প নিয়ম): বিকল্পগুলো থেকে সঠিক উত্তর ${q.correctAnswer} নির্বাচন করা যায়।`
                      ];

                  return (
                    <div 
                      key={q.id || qIndex} 
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
                    >
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {qIndex + 1}
                          </span>
                          
                          {q.subject && (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                              {q.subject}
                            </span>
                          )}

                          {q.topic && (
                            <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 text-xs font-semibold border border-cyan-100">
                              {q.topic}
                            </span>
                          )}

                          {q.examSource && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                              🎯 {q.examSource}
                            </span>
                          )}
                        </div>

                        {/* Quick 1-Question Practice or Copy */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`${q.question}\n${q.options.map((opt, i) => `${['ক','খ','গ','ঘ'][i]}. ${opt}`).join('\n')}\nউত্তর: ${q.correctAnswer}`);
                              showToast('📋 প্রশ্নটি ক্লিপবোর্ডে কপি হয়েছে');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                            title="কপি করুন"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLaunchPracticeExam(`প্রশ্ন অনুশীলন: ${q.topic || q.subject}`, [q])}
                            className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition-colors cursor-pointer"
                          >
                            মক টেস্ট দিন
                          </button>
                        </div>
                      </div>

                      {/* Question Text */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 leading-relaxed">
                        {q.question}
                      </h3>

                      {/* Options Grid (ক, খ, গ, ঘ) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                        {q.options.map((option, optIdx) => {
                          const optionLetters = ['ক', 'খ', 'গ', 'ঘ'];
                          const isCorrect = option === q.correctAnswer;

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                                isCorrect
                                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                                  : 'bg-slate-50/60 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {optionLetters[optIdx]}
                                </span>
                                <span className="break-words leading-tight">{option}</span>
                              </div>

                              {isCorrect && (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold shrink-0 ml-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>সঠিক উত্তর</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Solutions Accordion Button (User Request 4 Requirement) */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => toggleSolution(q.id)}
                          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100/80 px-3.5 py-1.5 rounded-xl border border-cyan-200/80 transition-colors cursor-pointer"
                        >
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          <span>{isExpanded ? 'বিস্তারিত সমাধান লুকান' : 'বিস্তারিত সমাধান দেখুন (২টি পদ্ধতি)'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* Collapsible Solution Content */}
                        {isExpanded && (
                          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 animate-fadeIn">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span>📚 বিস্তারিত অংক ও উত্তরের ব্যাখ্যা</span>
                            </div>

                            {/* Method 1 */}
                            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                              <div className="font-bold text-blue-700 mb-1 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] flex items-center justify-center font-bold">১</span>
                                <span>পদ্ধতি ১: পাঠ্যবই নিয়ম ও বিশ্লেষণ</span>
                              </div>
                              <p className="whitespace-pre-wrap">{methods[0]}</p>
                            </div>

                            {/* Method 2 */}
                            {methods[1] && (
                              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
                                <div className="font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center font-bold">২</span>
                                  <span>পদ্ধতি ২: শর্টকাট টেকনিক ও বিকল্প নিয়ম</span>
                                </div>
                                <p className="whitespace-pre-wrap">{methods[1]}</p>
                              </div>
                            )}
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

        {/* ------------------------------------------------------ */}
        {/* VIEW 2: CLASS-WISE NCTB & ADMISSION SYLLABUS DIRECTORY */}
        {/* ------------------------------------------------------ */}
        {activeTab === 'syllabus' && (
          <div className="space-y-6">
            
            {/* Class Track Selector Buttons */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-wrap gap-2">
              {SYLLABUS_CATALOG.map((group) => {
                const isSelected = group.id === selectedClassId;
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => {
                      setSelectedClassId(group.id);
                      setSelectedSubjectName(group.subjects[0]?.subject || '');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-700 text-white shadow-sm shadow-cyan-900/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{group.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Class Header Card */}
            <div className="bg-linear-to-r from-cyan-900 to-slate-900 text-white rounded-2xl p-6 border border-cyan-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                    {activeClassGroup.badge}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-2">{activeClassGroup.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    এনসিটিবি প্রণীত প্রমিত সিলেবাসের সকল বিষয়, অধ্যায়ভিত্তিক মানবণ্টন ও মূল শিখনফল।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const sample = allQuestionsPool.filter(q => q.track === activeClassGroup.track);
                    handleLaunchPracticeExam(`${activeClassGroup.title} পূর্ণাঙ্গ মডেল টেস্ট`, sample);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer shrink-0 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>সম্পূর্ণ সিলেবাসের ওপর পরীক্ষা দিন</span>
                </button>
              </div>
            </div>

            {/* Subject Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {activeClassGroup.subjects.map((sub) => {
                const isSelected = sub.subject === selectedSubjectName;
                return (
                  <button
                    key={sub.code}
                    type="button"
                    onClick={() => setSelectedSubjectName(sub.subject)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{sub.subject}</span>
                    <span className="ml-1.5 text-xs opacity-70">({sub.chapters.length}টি অধ্যায়)</span>
                  </button>
                );
              })}
            </div>

            {/* Chapters Breakdown Cards */}
            {(() => {
              const activeSubject = activeClassGroup.subjects.find(s => s.subject === selectedSubjectName) || activeClassGroup.subjects[0];
              if (!activeSubject) return null;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeSubject.chapters.map((chap, chapIdx) => {
                    const pool = allQuestionsPool.filter(q => q.topic?.includes(chap.chapter) || q.subject?.includes(activeSubject.subject));

                    return (
                      <div 
                        key={chapIdx}
                        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                              অধ্যায় {chapIdx + 1}
                            </span>
                            {chap.boardYearTag && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                                {chap.boardYearTag}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                            {chap.chapter}
                          </h3>

                          {/* Marks Distribution */}
                          <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mb-3">
                            <div>মোট নম্বর: <strong className="text-slate-900">{chap.totalMarks}</strong></div>
                            <span className="text-slate-300">|</span>
                            <div>MCQ: <strong className="text-emerald-700">{chap.mcqMarks}</strong></div>
                            <span className="text-slate-300">|</span>
                            <div>সৃজনশীল: <strong className="text-blue-700">{chap.creativeMarks}</strong></div>
                          </div>

                          {/* Learning Outcomes */}
                          <div className="mb-3">
                            <div className="text-xs font-bold text-slate-500 mb-1.5">🎯 মূল শিখনফল ও বিষয়বস্তু:</div>
                            <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                              {chap.learningOutcomes.map((lo, i) => (
                                <li key={i}>{lo}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Key Formulas or Concepts */}
                          {chap.keyFormulasOrConcepts.length > 0 && (
                            <div className="mb-4">
                              <div className="text-xs font-bold text-slate-500 mb-1.5">⚡ গুরুত্বপূর্ণ সূত্র / তথ্য:</div>
                              <div className="flex flex-wrap gap-1.5">
                                {chap.keyFormulasOrConcepts.map((f, i) => (
                                  <span key={i} className="px-2 py-1 bg-slate-100 rounded-md text-[11px] font-mono text-slate-800">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Chapter Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery(chap.chapter);
                              setActiveTab('explorer');
                            }}
                            className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1 cursor-pointer"
                          >
                            <span>প্রশ্নগুলো দেখুন ({pool.length}টি)</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLaunchPracticeExam(`${activeSubject.subject}: ${chap.chapter} মূল্যায়ন`, pool)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            পরীক্ষা তৈরি করুন
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </div>
        )}

        {/* ------------------------------------------------------ */}
        {/* VIEW 3: MY CUSTOM DATABASE & STORAGE                   */}
        {/* ------------------------------------------------------ */}
        {activeTab === 'my_database' && (
          <div className="space-y-6">
            
            {/* Explanatory Banner (User Request 5 fulfillment) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>ব্যক্তিগত ও বোর্ড প্রশ্ন ডাটাবেজ ভান্ডার</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">আপনার নিজস্ব সংগৃহীত প্রশ্নব্যাংক</h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  আপনার কাছে থাকা ১ম-১২শ শ্রেণি এবং ২০২৫ সালের বোর্ড পরীক্ষার সকল প্রশ্ন এখানে নিরাপদে সংরক্ষণ করুন। এক ক্লিকেই এই প্রশ্নগুলো দিয়ে পরীক্ষার প্রশ্নপত্র প্রস্তুত করতে পারবেন।
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন প্রশ্ন লিখুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>বাল্ক ইমপোর্ট</span>
                </button>
              </div>
            </div>

            {/* Custom Questions List */}
            {customQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
                <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">এখনও কোনো নিজস্ব প্রশ্ন যোগ করা হয়নি</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  "নতুন প্রশ্ন লিখুন" অথবা "বাল্ক ইমপোর্ট" বোতামে ক্লিক করে আপনার পাঠ্যবই বা ২০২৫ বোর্ড পরীক্ষার প্রশ্নগুলো সংরক্ষণ করুন।
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  প্রথম প্রশ্ন যোগ করুন
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs sm:text-sm font-bold text-slate-700">
                    সংরক্ষিত প্রশ্ন সংখ্যা: {customQuestions.length}টি
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLaunchPracticeExam('আমার প্রশ্নব্যাংক থেকে বিশেষ পরীক্ষা', customQuestions)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    এই প্রশ্নগুলো দিয়ে পরীক্ষা তৈরি করুন
                  </button>
                </div>

                {customQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {q.subject || 'সাধারণ'}
                        </span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {q.examSource || 'ব্যক্তিগত প্রশ্নব্যাংক'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('আপনি কি এই প্রশ্নটি মুছে ফেলতে চান?')) {
                            deleteStoredCustomQuestion(q.id);
                            showToast('🗑️ প্রশ্নটি মুছে ফেলা হয়েছে');
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mb-3">{q.question}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                      {q.options.map((opt, oIdx) => (
                        <div 
                          key={oIdx}
                          className={`p-2 rounded-lg border ${
                            opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          {['ক', 'খ', 'গ', 'ঘ'][oIdx]}. {opt}
                        </div>
                      ))}
                    </div>

                    {q.solutions && q.solutions.length > 0 && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <strong className="text-slate-800">পদ্ধতি ১:</strong> {q.solutions[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD SINGLE QUESTION FORM                        */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">প্রশ্নব্যাংকে নতুন প্রশ্ন যুক্ত করুন</h3>
                  <p className="text-xs text-slate-500">নৈর্ব্যক্তিক প্রশ্ন ও ২ ধরণের সমাধান যোগ করুন</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewQuestion} className="space-y-4 mt-4">
              
              {/* Category & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি / ট্র্যাক</label>
                  <select
                    value={newTrack}
                    onChange={(e) => setNewTrack(e.target.value as ExamTrack)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  >
                    <option value="academic">১ম-১২শ শ্রেণি (NCTB)</option>
                    <option value="bcs">🏛️ বিসিএস প্রিলিমিনারি</option>
                    <option value="medical">🩺 মেডিকেল ভর্তি</option>
                    <option value="varsity">🎓 বিশ্ববিদ্যালয় ভর্তি</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">বিষয়</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="যেমন: সাধারণ গণিত"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অধ্যায় / টপিক</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="যেমন: বীজগণিত ও সমীকরণ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              {/* Exam Source Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">বোর্ড / সাল / পরীক্ষার উৎস</label>
                <input
                  type="text"
                  value={newExamSource}
                  onChange={(e) => setNewExamSource(e.target.value)}
                  placeholder="যেমন: ঢাকা বোর্ড ২০২৫ বা ৪৬তম বিসিএস মডেল"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রশ্নের বিবরণ (Question)*</label>
                <textarea
                  required
                  rows={2}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="প্রশ্নের পুরো বিবরণ বাংলায় লিখুন..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-slate-800"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অপশন (ক)*</label>
                  <input
                    required
                    type="text"
                    value={newOptionA}
                    onChange={(e) => setNewOptionA(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    placeholder="ক এর উত্তর"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অপশন (খ)*</label>
                  <input
                    required
                    type="text"
                    value={newOptionB}
                    onChange={(e) => setNewOptionB(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    placeholder="খ এর উত্তর"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অপশন (গ)*</label>
                  <input
                    required
                    type="text"
                    value={newOptionC}
                    onChange={(e) => setNewOptionC(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    placeholder="গ এর উত্তর"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">অপশন (ঘ)*</label>
                  <input
                    required
                    type="text"
                    value={newOptionD}
                    onChange={(e) => setNewOptionD(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    placeholder="ঘ এর উত্তর"
                  />
                </div>
              </div>

              {/* Correct Answer Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সঠিক উত্তর নির্বাচন করুন*</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((optKey, idx) => {
                    const letters = ['ক', 'খ', 'গ', 'ঘ'];
                    const isSelected = newCorrectAnswer === optKey;
                    return (
                      <button
                        key={optKey}
                        type="button"
                        onClick={() => setNewCorrectAnswer(optKey)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        অপশন ({letters[idx]})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Solutions: 2 Methods */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>বিস্তারিত সমাধান (উভয় পদ্ধতি দেওয়া ভালো)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-blue-800 mb-1">পদ্ধতি ১: পাঠ্যবই নিয়ম ও বিশ্লেষণ</label>
                  <input
                    type="text"
                    value={newMethodOne}
                    onChange={(e) => setNewMethodOne(e.target.value)}
                    placeholder="ধাপে ধাপে মূল সমাধানটি লিখুন..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">পদ্ধতি ২: শর্টকাট টেকনিক ও বিকল্প নিয়ম</label>
                  <input
                    type="text"
                    value={newMethodTwo}
                    onChange={(e) => setNewMethodTwo(e.target.value)}
                    placeholder="সহজ শর্টকাট বা ট্রিকস..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: BULK IMPORT QUESTIONS                           */}
      {/* ======================================================== */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">বাল্ক প্রশ্ন ইমপোর্ট করুন</h3>
                  <p className="text-xs text-slate-500">একসাথে ১০০+ প্রশ্ন পেস্ট করে ডেটাবেজে যুক্ত করুন</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-600">
                নিচে প্রশ্ন ও অপশন টেক্সট আকারে লিখুন অথবা JSON অ্যারে পেস্ট করুন।
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
                <div className="font-bold text-slate-800">সহজ টেক্সট নমুনা:</div>
                <div>প্রশ্ন: নিচের কোনটি দ্বিঘাত সমীকরণের আদর্শ রূপ?</div>
                <div>ক) ax² + bx + c = 0</div>
                <div>খ) ax + b = 0</div>
                <div>গ) ax³ + bx² + c = 0</div>
                <div>ঘ) a/x + b = 0</div>
              </div>

              <textarea
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="এখানে প্রশ্নসমূহ পেস্ট করুন..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  ইমপোর্ট সম্পন্ন করুন
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
