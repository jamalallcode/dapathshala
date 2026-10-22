import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Clock, 
  FileText, 
  Star, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  Building2, 
  Tag, 
  ArrowRight, 
  Play, 
  Eye, 
  Search, 
  X, 
  CreditCard, 
  Plus, 
  Check, 
  BookOpen,
  Filter,
  GraduationCap
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Exam, Question } from '../../types';
import { LiveExamEngine } from './LiveExamEngine';

export interface PaidModelTest {
  id: string;
  title: string;
  coachingId: string;
  coachingName: string;
  coachingLogo: string;
  bannerImage: string;
  category: 'বুয়েট ও ইঞ্জিনিয়ারিং' | 'মেডিকেল ভর্তি' | 'এইচএসসি বিজ্ঞান ও বোর্ড' | 'বিশ্ববিদ্যালয় ‘ক’ ইউনিট' | 'আইবিএ ও বিইউপি' | 'এসএসসি বিজ্ঞান';
  subject: string;
  questionCount: number;
  durationMinutes: number;
  negativeMarking: string;
  rating: number;
  buyerCount: number;
  originalPrice: number;
  discountedPrice: number;
  description: string;
  features: string[];
  sampleQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  questions?: Question[];
}

export const INITIAL_PAID_TESTS: PaidModelTest[] = [
  {
    id: 'test-udvash-eng-01',
    title: 'উদ্ভাস ইঞ্জিনিয়ারিং বুয়েট ফাইনাল মেগা মডেল টেস্ট ২০২৬',
    coachingId: 'c-udvash-farmgate',
    coachingName: 'উদ্ভাস-উন্মেষ একাডেমি (ফার্মগেট)',
    coachingLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    category: 'বুয়েট ও ইঞ্জিনিয়ারিং',
    subject: 'পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিত',
    questionCount: 60,
    durationMinutes: 60,
    negativeMarking: '০.২৫ নম্বর',
    rating: 4.9,
    buyerCount: 1420,
    originalPrice: 150,
    discountedPrice: 49,
    description: 'বুয়েট ও ইঞ্জিনিয়ারিং গুচ্ছের সাম্প্রতিক প্রশ্নপদ্ধতি অনুযায়ী সম্পূর্ণ কনসেপ্ট-বেজড স্পেশাল মেগা মডেল টেস্ট।',
    features: [
      'বুয়েটিয়ান শিক্ষকদের প্রস্তুতকৃত এক্সক্লুসিভ প্রশ্ন',
      'বিস্তারিত সলভশিট ও প্রতি উত্তরের ব্যাখ্যা',
      'লাইভ নেগেটিভ মার্কিং ক্যালকুলেশন',
      'অল-বাংলাদেশ মেধা তালিকায় ফলাফল অন্তর্ভুক্তি'
    ],
    sampleQuestions: [
      {
        question: 'একটি সরল দোলককে চাঁদে নেওয়া হলে এর দোলনকালের কী পরিবর্তন হবে? (চাঁদের g = পৃথিবীর g এর ১/৬ ভাগ)',
        options: ['√6 গুণ বৃদ্ধি পাবে', '√6 গুণ হ্রাস পাবে', '৬ গুণ বাড়বে', 'অপরিবর্তিত থাকবে'],
        correctAnswer: 0,
        explanation: 'দোলনকাল T = 2π√(L/g)। যেহেতু চাঁদে g এর মান হ্রাস পায়, তাই T এর মান √6 গুণ বৃদ্ধি পাবে।'
      },
      {
        question: 'lim (x→0) (sin 5x / tan 3x) এর মান কত?',
        options: ['3/5', '5/3', '1', '15'],
        correctAnswer: 1,
        explanation: 'lim (x→0) (sin 5x / 5x) * (3x / tan 3x) * (5/3) = 1 * 1 * (5/3) = 5/3।'
      }
    ]
  },
  {
    id: 'test-retina-med-02',
    title: 'রেটিনা মেডিকেল স্পেশাল ১০০% কমন মডেল টেস্ট সিরিজ',
    coachingId: 'c-retina-dhanmondi',
    coachingName: 'রেটিনা মেডিকেল একাডেমি (ধানমন্ডি)',
    coachingLogo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    category: 'মেডিকেল ভর্তি',
    subject: 'জীববিজ্ঞান, রসায়ন, পদার্থ ও সাধারণ জ্ঞান',
    questionCount: 100,
    durationMinutes: 60,
    negativeMarking: '০.২৫ নম্বর',
    rating: 4.8,
    buyerCount: 1890,
    originalPrice: 140,
    discountedPrice: 49,
    description: 'মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষার হুবহু স্ট্যান্ডার্ড ও ওএমআর নিয়মে তৈরি পূর্ণাঙ্গ মক টেস্ট।',
    features: [
      'ডাক্তার মেন্টরদের পর্যালোচিত মেডিকেল স্ট্যান্ডার্ড প্রশ্ন',
      'বায়োলজি দাগানো বইয়ের লাইন ধরে বিশেষ প্রশ্ন',
      'ভর্তি পরীক্ষার চূড়ান্ত কাট-মার্ক অ্যানালাইসিস'
    ],
    sampleQuestions: [
      {
        question: 'মানবদেহের বৃহত্তম লসিকা গ্রন্থি কোনটি?',
        options: ['প্লীহা (Spleen)', 'থাইমাস', 'টনসিল', 'যকৃত'],
        correctAnswer: 0,
        explanation: 'মানবদেহের সর্ববৃহৎ লসিকা অঙ্গ বা গ্রন্থি হলো প্লীহা (Spleen)।'
      },
      {
        question: 'নিচের কোনটিতে মুক্ত-মূলক পলিমারকরণ ঘটে?',
        options: ['পলিথিন তৈরি', 'নাইলন-৬,৬', 'ড্যাক্রন', 'বেকেলাইট'],
        correctAnswer: 0,
        explanation: 'উচ্চ চাপে অক্সিজেন বা পারঅক্সাইড প্রভাবকের উপস্থিতিতে ইথিন থেকে মুক্ত মূলক কৌশলে পলিথিন গঠিত হয়।'
      }
    ]
  },
  {
    id: 'test-omega-hsc-03',
    title: 'ওমেগা এইচএসসি বোর্ড স্ট্যান্ডার্ড এ+ নিশ্চিতকরণ টেস্ট',
    coachingId: 'c-omega-uttara',
    coachingName: 'ওমেগা সায়েন্স কেয়ার (উত্তরা)',
    coachingLogo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
    category: 'এইচএসসি বিজ্ঞান ও বোর্ড',
    subject: 'উচ্চতর গণিত ও পদার্থবিজ্ঞান',
    questionCount: 50,
    durationMinutes: 45,
    negativeMarking: '০.২৫ নম্বর',
    rating: 4.7,
    buyerCount: 820,
    originalPrice: 99,
    discountedPrice: 29,
    description: 'বোর্ড পরীক্ষায় জিপিএ-৫ নিশ্চিত করতে অধ্যায়ভিত্তিক সিকিউ ও এমসিকিউ সমন্বিত স্পেশাল মডেল টেস্ট।',
    features: [
      'সকল শিক্ষা বোর্ডের বিগত ১০ বছরের অ্যানালাইসিস',
      'টপ কলেজ টেস্ট পেপার প্রশ্নব্যাংক সলভ',
      'রিভিশন শর্টনোট সরবরাহ'
    ],
    sampleQuestions: [
      {
        question: 'কোনো কণার সরণ s = 3t² + 2t হলে, t = 2 সেকেন্ডে কণাটির বেগ কত?',
        options: ['14 m/s', '12 m/s', '16 m/s', '10 m/s'],
        correctAnswer: 0,
        explanation: 'বেগ v = ds/dt = 6t + 2। সুতরাং t = 2 হলে v = 6(2) + 2 = 14 m/s।'
      }
    ]
  },
  {
    id: 'test-engineers-cuet-04',
    title: 'চিটাগাং ইঞ্জিনিয়ার্স এইড চুয়েট ও গুচ্ছ স্পেশাল টেস্ট',
    coachingId: 'c-chittagong-engineers',
    coachingName: 'চিটাগাং ইঞ্জিনিয়ার্স এইড (চকবাজার)',
    coachingLogo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    category: 'বুয়েট ও ইঞ্জিনিয়ারিং',
    subject: 'পদার্থবিজ্ঞান, গণিত ও রসায়ন',
    questionCount: 75,
    durationMinutes: 50,
    negativeMarking: '০.২৫ নম্বর',
    rating: 4.9,
    buyerCount: 960,
    originalPrice: 120,
    discountedPrice: 39,
    description: 'চুয়েট, কুয়েট ও রুয়েট ইঞ্জিনিয়ারিং গুচ্ছের স্পেশাল টেস্ট পেপার সলভ মক।',
    features: [
      'চুয়েটিয়ান শীর্ষ শিক্ষকদের তৈরি প্রশ্ন',
      'কঠিন ক্যালকুলেশন ট্রিকস সেশন',
      'ভার্চুয়াল ওএমআর শিট সমাধান'
    ],
    sampleQuestions: [
      {
        question: 'কার্নো ইঞ্জিনের উৎসের তাপমাত্রা 127°C এবং গ্রাহকের তাপমাত্রা 27°C হলে এর কর্মদক্ষতা কত?',
        options: ['25%', '33.3%', '50%', '75%'],
        correctAnswer: 0,
        explanation: 'η = 1 - (T2/T1) = 1 - (300/400) = 1 - 0.75 = 0.25 বা 25%।'
      }
    ]
  },
  {
    id: 'test-icon-du-05',
    title: 'আইকন প্লাস ঢাবি ‘খ’ ইউনিট ও বিইউপি প্রিমিয়াম টেস্ট',
    coachingId: 'c-iconplus-mirpur',
    coachingName: 'আইকন প্লাস (মিরপুর ১০)',
    coachingLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    category: 'আইবিএ ও বিইউপি',
    subject: 'ইংরেজি, সাধারণ জ্ঞান ও বাংলা',
    questionCount: 80,
    durationMinutes: 60,
    negativeMarking: '০.২৫ নম্বর',
    rating: 4.8,
    buyerCount: 740,
    originalPrice: 120,
    discountedPrice: 39,
    description: 'ঢাবি কলা ও সামাজিক বিজ্ঞান অনুষদ এবং বিইউপি ভর্তি পরীক্ষার জন্য স্পেশাল রিটেন ও এমসিকিউ টেস্ট।',
    features: [
      'আইবিএ ও বিইউপি স্ট্যান্ডার্ড অ্যানালিটিক্যাল ও জিকে',
      'সাম্প্রতিক সমসাময়িক আন্তর্জাতিক বিষয়াবলি',
      'ইংরেজির বিশেষ ব্যাকরণ শর্টকাট'
    ],
    sampleQuestions: [
      {
        question: 'Choose the correct synonym of "Ephemeral":',
        options: ['Transitory', 'Perpetual', 'Durable', 'Eternal'],
        correctAnswer: 0,
        explanation: 'Ephemeral মানে ক্ষণস্থায়ী, যার সমার্থক শব্দ Transitory বা Short-lived।'
      }
    ]
  },
  {
    id: 'test-rajshahi-science-06',
    title: 'রাজশাহী সায়েন্স পয়েন্ট রাবি ও রুয়েট স্পেশাল টেস্ট',
    coachingId: 'c-rajshahi-science',
    coachingName: 'রাজশাহী সায়েন্স পয়েন্ট (বোয়ালিয়া)',
    coachingLogo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80',
    category: 'বিশ্ববিদ্যালয় ‘ক’ ইউনিট',
    subject: 'পদার্থবিজ্ঞান ও রসায়ন',
    questionCount: 60,
    durationMinutes: 45,
    negativeMarking: '০.২০ নম্বর',
    rating: 4.8,
    buyerCount: 610,
    originalPrice: 100,
    discountedPrice: 29,
    description: 'রাজশাহী বিশ্ববিদ্যালয় এবং রুয়েট স্ট্যান্ডার্ডের স্পেশাল মডেল টেস্ট সিরিজ।',
    features: [
      'রাবি সিলেকশন স্ট্যান্ডার্ড প্রশ্নপত্র',
      'প্র্যাকটিস মেধা যাচাই',
      'লাইভ ফলাফল ও মেধা তালিকা'
    ],
    sampleQuestions: [
      {
        question: 'পর্যায় সারণির কোন গ্রুপকে ক্ষার ধাতু বলা হয়?',
        options: ['গ্রুপ ১', 'গ্রুপ ২', 'গ্রুপ ১৭', 'গ্রুপ ১৮'],
        correctAnswer: 0,
        explanation: 'পর্যায় সারণির গ্রুপ ১ এর মৌলগুলোকে ক্ষার ধাতু (Alkali Metals) বলা হয়।'
      }
    ]
  }
];

export const PaidModelTestStore: React.FC = () => {
  const [tests, setTests] = useState<PaidModelTest[]>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_paid_model_tests');
      return saved ? JSON.parse(saved) : INITIAL_PAID_TESTS;
    } catch {
      return INITIAL_PAID_TESTS;
    }
  });

  // Track purchased/unlocked tests in localStorage
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_unlocked_tests');
      return saved ? JSON.parse(saved) : ['test-udvash-eng-01']; // default 1 unlocked for demo
    } catch {
      return ['test-udvash-eng-01'];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('সকল ক্যাটাগরি');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTest, setPreviewTest] = useState<PaidModelTest | null>(null);
  const [checkoutTest, setCheckoutTest] = useState<PaidModelTest | null>(null);
  const [activeLiveExam, setActiveLiveExam] = useState<Exam | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Checkout modal states
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [senderPhone, setSenderPhone] = useState('01712345678');
  const [transactionId, setTransactionId] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Publish new test form state
  const [publishForm, setPublishForm] = useState({
    title: '',
    coachingName: 'আমার কোচিং সেন্টার',
    category: 'এইচএসসি বিজ্ঞান ও বোর্ড' as PaidModelTest['category'],
    subject: 'পদার্থবিজ্ঞান ও গণিত',
    questionCount: 50,
    durationMinutes: 45,
    discountedPrice: 39,
    originalPrice: 99,
    description: ''
  });

  useEffect(() => {
    try {
      localStorage.setItem('dapathshala_unlocked_tests', JSON.stringify(unlockedIds));
    } catch {}
  }, [unlockedIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const CATEGORIES = [
    'সকল ক্যাটাগরি',
    'বুয়েট ও ইঞ্জিনিয়ারিং',
    'মেডিকেল ভর্তি',
    'এইচএসসি বিজ্ঞান ও বোর্ড',
    'বিশ্ববিদ্যালয় ‘ক’ ইউনিট',
    'আইবিএ ও বিইউপি'
  ];

  const filteredTests = useMemo(() => {
    return tests.filter(t => {
      const matchesSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.coachingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'সকল ক্যাটাগরি' ? true : t.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [tests, searchQuery, selectedCategory]);

  const handleConfirmPurchase = () => {
    if (!checkoutTest) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setUnlockedIds(prev => [...prev, checkoutTest.id]);
      showToast(`অভিনন্দন! "${checkoutTest.title}" সফলভাবে আনলক হয়েছে।`);
      const unlockedTarget = checkoutTest;
      setCheckoutTest(null);

      // Offer immediate launch
      setTimeout(() => {
        if (confirm(`টেস্ট আনলক সম্পন্ন হয়েছে! আপনি কি এখনই "${unlockedTarget.title}"-এর লাইভ পরীক্ষা শুরু করতে চান?`)) {
          handleStartExam(unlockedTarget);
        }
      }, 400);
    }, 1200);
  };

  const handleStartExam = (test: PaidModelTest) => {
    const examObj: Exam = {
      id: test.id,
      title: test.title,
      date: new Date().toISOString().slice(0, 10),
      duration: test.durationMinutes,
      subject: test.subject,
      totalMarks: test.questionCount
    };
    setActiveLiveExam(examObj);
  };

  const handlePublishTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishForm.title) return;

    const newTest: PaidModelTest = {
      id: `test-coaching-${Date.now()}`,
      title: publishForm.title,
      coachingId: 'custom-coaching',
      coachingName: publishForm.coachingName,
      coachingLogo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=120&h=120&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
      category: publishForm.category,
      subject: publishForm.subject,
      questionCount: Number(publishForm.questionCount),
      durationMinutes: Number(publishForm.durationMinutes),
      negativeMarking: '০.২৫ নম্বর',
      rating: 5.0,
      buyerCount: 0,
      originalPrice: Number(publishForm.originalPrice),
      discountedPrice: Number(publishForm.discountedPrice),
      description: publishForm.description || 'কোচিং সেন্টারের এক্সক্লুসিভ প্রিমিয়াম প্রশ্নপত্র।',
      features: [
        'অভিজ্ঞ শিক্ষকমণ্ডলীর তৈরি স্পেশাল মডেল টেস্ট',
        'তাৎক্ষণিক সমাধান ও বিশ্লেষণ',
        'জাতীয় মেধা তালিকায় অন্তর্ভুক্তি'
      ],
      sampleQuestions: [
        {
          question: 'নমুনা প্রশ্ন: একটি সমীকরণ বা সূত্রের নমুনা প্রশ্নপত্র।',
          options: ['বিকল্প ক', 'বিকল্প খ', 'বিকল্প গ', 'বিকল্প ঘ'],
          correctAnswer: 0,
          explanation: 'সঠিক উত্তরের ব্যাখ্যা এখানে প্রদর্শিত হবে।'
        }
      ]
    };

    const updated = [newTest, ...tests];
    setTests(updated);
    try {
      localStorage.setItem('dapathshala_paid_model_tests', JSON.stringify(updated));
    } catch {}

    setShowPublishModal(false);
    showToast(`"${newTest.title}" প্রিমিয়াম টেস্ট স্টোরে সফলভাবে প্রকাশিত হয়েছে!`);
  };

  if (activeLiveExam) {
    return (
      <LiveExamEngine
        exam={activeLiveExam}
        onClose={() => setActiveLiveExam(null)}
      />
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[130] bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-emerald-500 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white p-6 sm:p-10 shadow-2xl border border-emerald-800/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
            <Sparkles size={14} className="text-emerald-400" />
            <span>কোচিং প্রিমিয়াম মডেল টেস্ট পে-ওয়াল স্টোর</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            শীর্ষ কোচিং সেন্টারের <span className="text-emerald-400">এক্সক্লুসিভ মডেল টেস্ট</span> ও মেধা যাচাই
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            উদ্ভাস, রেটিনা, ওমেগা ও অন্যান্য শীর্ষ কোচিং সেন্টারের তৈরি প্রিমিয়াম প্রশ্নপত্র সরাসরি বিকাশ বা নগদে আনলক করে বাসায় বসেই লাইভ টাইমার ও ওএমআর নিয়মে পরীক্ষা দিন।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-900/60 px-3 py-1.5 rounded-xl border border-emerald-700/50">
              <CheckCircle2 size={14} />
              <span>আপনার আনলককৃত টেস্ট: {unlockedIds.length}টি</span>
            </div>
            <button
              onClick={() => setShowPublishModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-1.5 rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} className="text-emerald-400" />
              <span>কোচিং পরিচালক? নতুন টেস্ট প্রকাশ করুন</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop icon */}
        <div className="absolute right-6 bottom-4 opacity-10 pointer-events-none hidden md:block">
          <ShoppingBag size={240} className="text-emerald-400" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-5 border-none shadow-sm bg-white space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="টেস্টের নাম, কোচিং সেন্টার বা বিষয় লিখে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="text-emerald-700 font-black">{filteredTests.length}টি</span> প্রিমিয়াম টেস্ট উপলব্ধ
          </div>
        </div>

        {/* Categories Chips */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
            <Filter size={13} /> বিভাগ:
          </span>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      {/* Model Test Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests.map((test) => {
          const isUnlocked = unlockedIds.includes(test.id);

          return (
            <Card
              key={test.id}
              className={`overflow-hidden border transition-all duration-300 flex flex-col justify-between bg-white rounded-3xl ${
                isUnlocked 
                  ? 'border-emerald-300 shadow-md ring-1 ring-emerald-200' 
                  : 'border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-xl'
              }`}
            >
              <div>
                {/* Banner & Badges */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                  <img
                    src={test.bannerImage}
                    alt={test.title}
                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Unlocked / Paywalled Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {isUnlocked ? (
                      <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <CheckCircle2 size={12} /> আপনার কাছে কেনা আছে
                      </span>
                    ) : (
                      <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Lock size={12} /> প্রিমিয়াম পে-ওয়াল
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 text-slate-900 text-xs font-black shadow-sm">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{test.rating}</span>
                    <span className="text-[10px] text-slate-500 font-normal">({test.buyerCount})</span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-bold text-amber-300 text-[11px] bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {test.category}
                    </span>
                    <span className="text-[11px] text-slate-200 flex items-center gap-1">
                      <Clock size={12} /> {test.durationMinutes} মিনিট
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 p-1 border border-slate-200 shrink-0 shadow-sm">
                      <img src={test.coachingLogo} alt={test.coachingName} className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-emerald-700 block line-clamp-1">{test.coachingName}</span>
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mt-0.5">
                        {test.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {test.description}
                  </p>

                  {/* Specs */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">প্রশ্ন সংখ্যা</span>
                      <span className="font-black text-slate-800">{test.questionCount}টি এমসিকিউ</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">নেগেটিভ মার্ক</span>
                      <span className="font-black text-rose-600">{test.negativeMarking}</span>
                    </div>
                  </div>

                  {/* Price Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">মডেল টেস্ট ফি</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">৳{test.discountedPrice}</span>
                        <span className="text-xs text-slate-400 line-through">৳{test.originalPrice}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                          {Math.round(((test.originalPrice - test.discountedPrice) / test.originalPrice) * 100)}% ছাড়
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setPreviewTest(test)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} />
                      নমুনা দেখুন
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0">
                {isUnlocked ? (
                  <Button
                    onClick={() => handleStartExam(test)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play size={15} className="fill-white" />
                    <span>এখনই পরীক্ষা শুরু করুন</span>
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewTest(test)}
                      className="text-xs font-bold py-2.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      নমুনা প্রশ্ন
                    </Button>
                    <Button
                      onClick={() => setCheckoutTest(test)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Lock size={13} />
                      <span>কিনুন (৳{test.discountedPrice})</span>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Paywall Checkout Modal */}
      {checkoutTest && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 text-white p-5 sm:p-6 relative">
              <button
                onClick={() => setCheckoutTest(null)}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
                <Lock size={12} />
                প্রিমিয়াম টেস্ট আনলক গেটওয়ে
              </div>
              <h2 className="text-xl font-black text-white">{checkoutTest.title}</h2>
              <p className="text-xs text-emerald-100 mt-1">প্রদানকারী: {checkoutTest.coachingName}</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              
              {/* Price summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">মূল ফি:</span>
                  <span className="font-bold text-slate-800">৳{checkoutTest.originalPrice}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold">স্পেশাল ছাড়:</span>
                  <span className="font-bold text-emerald-700">-৳{checkoutTest.originalPrice - checkoutTest.discountedPrice}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">সর্বমোট প্রদেয়:</span>
                  <span className="text-2xl font-black text-emerald-600">৳{checkoutTest.discountedPrice}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">পেমেন্ট মেথড নির্বাচন করুন:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bkash', name: 'বিকাশ', color: 'border-pink-500 text-pink-700 bg-pink-50/50' },
                    { id: 'nagad', name: 'নগদ', color: 'border-orange-500 text-orange-700 bg-orange-50/50' },
                    { id: 'rocket', name: 'রকেট', color: 'border-purple-500 text-purple-700 bg-purple-50/50' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethod === m.id ? `${m.color} ring-2 ring-emerald-500` : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {paymentMethod === m.id && <Check size={14} className="stroke-[3]" />}
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account instructions */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CreditCard size={14} />
                  {paymentMethod === 'bkash' ? 'বিকাশ' : paymentMethod === 'nagad' ? 'নগদ' : 'রকেট'} মার্চেন্ট নম্বর: 01700-000000
                </p>
                <p className="text-[11px] text-amber-800">
                  স্যান্ডবক্স/ডেমো মোড সক্রিয় রয়েছে। আপনি সরাসরি নিচের বাটনে ক্লিক করে এক ক্লিকে টেস্টটি আনলক করতে পারেন।
                </p>
              </div>

              {/* Form Input */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">আপনার মোবাইল নম্বর</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ট্রানজেকশন আইডি (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="যেমন: TRX92817462"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => setCheckoutTest(null)}
                  className="w-full text-xs font-bold py-2.5 cursor-pointer"
                >
                  বাতিল
                </Button>
                <Button
                  onClick={handleConfirmPurchase}
                  disabled={isProcessingPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <span>ভেরিফাই হচ্ছে...</span>
                  ) : (
                    <>
                      <Unlock size={14} />
                      <span>৳{checkoutTest.discountedPrice} দিয়ে আনলক করুন</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free Sample Questions Preview Modal */}
      {previewTest && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[85vh] flex flex-col">
            
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200 shrink-0">
                  <img src={previewTest.coachingLogo} alt={previewTest.coachingName} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700">{previewTest.coachingName}</span>
                  <h3 className="font-bold text-slate-900 text-base">{previewTest.title} (নমুনা প্রশ্ন)</h3>
                </div>
              </div>
              <button
                onClick={() => setPreviewTest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-600 shrink-0" />
                <span>এই টেস্টে মোট {previewTest.questionCount}টি প্রশ্ন রয়েছে। ক্রয়ের পূর্বে নিচের নমুনা প্রশ্নগুলো দেখে মান যাচাই করুন।</span>
              </div>

              {previewTest.sampleQuestions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="font-bold text-emerald-700 uppercase block tracking-wider text-[10px]">
                    নমুনা প্রশ্ন #{idx + 1}
                  </span>
                  <p className="font-bold text-slate-900 text-sm leading-relaxed">{q.question}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                          oIdx === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                          oIdx === q.correctAnswer ? 'bg-emerald-600 text-white font-black' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-200 text-emerald-950 text-[11px] leading-relaxed">
                    <strong>ব্যাখ্যা:</strong> {q.explanation}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="text-xs">
                <span className="text-slate-400 block">আনলক ফি</span>
                <span className="text-lg font-black text-slate-900">৳{previewTest.discountedPrice}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewTest(null)}
                  className="text-xs font-bold"
                >
                  বন্ধ করুন
                </Button>
                <Button
                  onClick={() => {
                    const target = previewTest;
                    setPreviewTest(null);
                    setCheckoutTest(target);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 rounded-xl flex items-center gap-1.5"
                >
                  <Unlock size={14} />
                  <span>সম্পূর্ণ টেস্ট কিনুন</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Paid Model Test Modal (For Coaching Center Owners) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-emerald-400" />
                <h3 className="font-bold text-base">নতুন প্রিমিয়াম মডেল টেস্ট প্রকাশ করুন</h3>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishTest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">মডেল টেস্টের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: এইচএসসি ফাইনাল রিভিশন মেগা মক টেস্ট"
                  value={publishForm.title}
                  onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ক্যাটাগরি</label>
                  <select
                    value={publishForm.category}
                    onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium"
                  >
                    <option value="বুয়েট ও ইঞ্জিনিয়ারিং">বুয়েট ও ইঞ্জিনিয়ারিং</option>
                    <option value="মেডিকেল ভর্তি">মেডিকেল ভর্তি</option>
                    <option value="এইচএসসি বিজ্ঞান ও বোর্ড">এইচএসসি বিজ্ঞান ও বোর্ড</option>
                    <option value="বিশ্ববিদ্যালয় ‘ক’ ইউনিট">বিশ্ববিদ্যালয় ‘ক’ ইউনিট</option>
                    <option value="আইবিএ ও বিইউপি">আইবিএ ও বিইউপি</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">বিষয়সমূহ</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: উচ্চতর গণিত ও পদার্থ"
                    value={publishForm.subject}
                    onChange={(e) => setPublishForm({ ...publishForm, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">প্রশ্ন সংখ্যা</label>
                  <input
                    type="number"
                    value={publishForm.questionCount}
                    onChange={(e) => setPublishForm({ ...publishForm, questionCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">সময় (মিনিট)</label>
                  <input
                    type="number"
                    value={publishForm.durationMinutes}
                    onChange={(e) => setPublishForm({ ...publishForm, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    value={publishForm.discountedPrice}
                    onChange={(e) => setPublishForm({ ...publishForm, discountedPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">আসল মূল্য (৳)</label>
                  <input
                    type="number"
                    value={publishForm.originalPrice}
                    onChange={(e) => setPublishForm({ ...publishForm, originalPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">বিবরণ ও সিলেবাস</label>
                <textarea
                  rows={2}
                  placeholder="পরীক্ষার সিলেবাস ও বিশেষত্ব সম্পর্কে লিখুন..."
                  value={publishForm.description}
                  onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setShowPublishModal(false)}>
                  বাতিল
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  স্টোরে টেস্ট যুক্ত করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
