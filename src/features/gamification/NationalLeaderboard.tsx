import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  School, 
  MapPin, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  FileText, 
  Share2, 
  Download, 
  User, 
  Zap, 
  Target,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export interface NationalRankStudent {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  institution: string;
  coachingName: string;
  division: string;
  district: string;
  track: 'এইচএসসি বিজ্ঞান ও বোর্ড' | 'ইঞ্জিনিয়ারিং ও বুয়েট' | 'মেডিকেল ও ডেন্টাল' | 'বিশ্ববিদ্যালয় ‘ক’ ইউনিট' | 'এসএসসি ও জুনিয়র' | 'বিসিএস ও সরকারি চাকরি';
  totalMarks: number;
  maxPossibleMarks: number;
  accuracyRate: number; // percentage
  examsCompleted: number;
  streakDays: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  badgeTitle: string;
}

export const NATIONAL_TOP_STUDENTS: NationalRankStudent[] = [
  {
    id: 'nat-01',
    rank: 1,
    name: 'তানভীর আহমেদ চৌধুরী',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    institution: 'নটর ডেম কলেজ, ঢাকা',
    coachingName: 'উদ্ভাস-উন্মেষ একাডেমি (ফার্মগেট)',
    division: 'ঢাকা',
    district: 'ঢাকা',
    track: 'ইঞ্জিনিয়ারিং ও বুয়েট',
    totalMarks: 4920,
    maxPossibleMarks: 5000,
    accuracyRate: 98.4,
    examsCompleted: 52,
    streakDays: 45,
    trend: 'stable',
    trendValue: 0,
    badgeTitle: 'জাতীয় শীর্ষ মেধা (National Champion)'
  },
  {
    id: 'nat-02',
    rank: 2,
    name: 'সাদিয়া তাসনিম অপি',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    institution: 'ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ',
    coachingName: 'রেটিনা মেডিকেল একাডেমি (ধানমন্ডি)',
    division: 'ঢাকা',
    district: 'ঢাকা',
    track: 'মেডিকেল ও ডেন্টাল',
    totalMarks: 4865,
    maxPossibleMarks: 5000,
    accuracyRate: 97.3,
    examsCompleted: 49,
    streakDays: 38,
    trend: 'up',
    trendValue: 1,
    badgeTitle: 'মেডিকেল স্টার র্যাঙ্কার'
  },
  {
    id: 'nat-03',
    rank: 3,
    name: 'মুহায়মিনুল হক জিসান',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    institution: 'চট্টগ্রাম কলেজ, চট্টগ্রাম',
    coachingName: 'চিটাগাং ইঞ্জিনিয়ার্স এইড (চকবাজার)',
    division: 'চট্টগ্রাম',
    district: 'চট্টগ্রাম',
    track: 'ইঞ্জিনিয়ারিং ও বুয়েট',
    totalMarks: 4810,
    maxPossibleMarks: 5000,
    accuracyRate: 96.2,
    examsCompleted: 46,
    streakDays: 30,
    trend: 'up',
    trendValue: 2,
    badgeTitle: 'চুয়েট/বুয়েট এলিট'
  },
  {
    id: 'nat-04',
    rank: 4,
    name: 'ফারহানা ইয়াসমিন বৃষ্টি',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    institution: 'রাজশাহী কলেজ, রাজশাহী',
    coachingName: 'রাজশাহী সায়েন্স পয়েন্ট',
    division: 'রাজশাহী',
    district: 'রাজশাহী',
    track: 'এইচএসসি বিজ্ঞান ও বোর্ড',
    totalMarks: 4760,
    maxPossibleMarks: 5000,
    accuracyRate: 95.2,
    examsCompleted: 44,
    streakDays: 28,
    trend: 'down',
    trendValue: 1,
    badgeTitle: 'বোর্ড টপার এক্সিলেন্স'
  },
  {
    id: 'nat-05',
    rank: 5,
    name: 'আব্দুল্লাহ আল নোমান',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    institution: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
    coachingName: 'ওমেগা সায়েন্স কেয়ার (উত্তরা)',
    division: 'ঢাকা',
    district: 'ঢাকা',
    track: 'বিশ্ববিদ্যালয় ‘ক’ ইউনিট',
    totalMarks: 4725,
    maxPossibleMarks: 5000,
    accuracyRate: 94.5,
    examsCompleted: 43,
    streakDays: 33,
    trend: 'up',
    trendValue: 3,
    badgeTitle: 'ভার্সিটি ক ইউনিটে শীর্ষ'
  },
  {
    id: 'nat-06',
    rank: 6,
    name: 'মাহমুদুল হাসান ফুয়াদ',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    institution: 'জালালাবাদ ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ',
    coachingName: 'সিলেট এক্সিলেন্স একাডেমি',
    division: 'সিলেট',
    district: 'সিলেট',
    track: 'ইঞ্জিনিয়ারিং ও বুয়েট',
    totalMarks: 4680,
    maxPossibleMarks: 5000,
    accuracyRate: 93.6,
    examsCompleted: 41,
    streakDays: 22,
    trend: 'stable',
    trendValue: 0,
    badgeTitle: 'ইঞ্জিনিয়ারিং অ্যাসপিরেন্ট'
  },
  {
    id: 'nat-07',
    rank: 7,
    name: 'নুসরাত জাহান মিম',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    institution: 'সরকারি ব্রজমোহন (বিএম) কলেজ, বরিশাল',
    coachingName: 'রেটিনা বরিশাল শাখা',
    division: 'বরিশাল',
    district: 'বরিশাল',
    track: 'মেডিকেল ও ডেন্টাল',
    totalMarks: 4640,
    maxPossibleMarks: 5000,
    accuracyRate: 92.8,
    examsCompleted: 39,
    streakDays: 25,
    trend: 'up',
    trendValue: 2,
    badgeTitle: 'বায়োলজি জিনিয়াস'
  },
  {
    id: 'nat-08',
    rank: 8,
    name: 'রাকিবুল ইসলাম আকাশ',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    institution: 'খুলনা জিলা স্কুল ও কলেজ',
    coachingName: 'উদ্ভাস খুলনা শাখা',
    division: 'খুলনা',
    district: 'খুলনা',
    track: 'এইচএসসি বিজ্ঞান ও বোর্ড',
    totalMarks: 4615,
    maxPossibleMarks: 5000,
    accuracyRate: 92.3,
    examsCompleted: 38,
    streakDays: 19,
    trend: 'down',
    trendValue: 2,
    badgeTitle: 'ম্যাথ মাস্টারমাইন্ড'
  },
  {
    id: 'nat-09',
    rank: 9,
    name: 'তাসমিয়া রহমান রিদা',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    institution: 'ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ, রংপুর',
    coachingName: 'রংপুর ব্রিলিয়ান্স কোচিং',
    division: 'রংপুর',
    district: 'রংপুর',
    track: 'এইচএসসি বিজ্ঞান ও বোর্ড',
    totalMarks: 4580,
    maxPossibleMarks: 5000,
    accuracyRate: 91.6,
    examsCompleted: 37,
    streakDays: 16,
    trend: 'up',
    trendValue: 4,
    badgeTitle: 'সায়েন্স অলরাউন্ডার'
  },
  {
    id: 'nat-10',
    rank: 10,
    name: 'সোহাগ রানা',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    institution: 'আনন্দ মোহন কলেজ, ময়মনসিংহ',
    coachingName: 'আইকন ময়মনসিংহ',
    division: 'ময়মনসিংহ',
    district: 'ময়মনসিংহ',
    track: 'বিশ্ববিদ্যালয় ‘ক’ ইউনিট',
    totalMarks: 4540,
    maxPossibleMarks: 5000,
    accuracyRate: 90.8,
    examsCompleted: 36,
    streakDays: 21,
    trend: 'stable',
    trendValue: 0,
    badgeTitle: 'টপ টেন স্কলার'
  },
  {
    id: 'nat-11',
    rank: 11,
    name: 'আবরার নাদিম',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    institution: 'আইডিয়াল স্কুল অ্যান্ড কলেজ, মতিঝিল',
    coachingName: 'উদ্ভাস মতিঝিল',
    division: 'ঢাকা',
    district: 'ঢাকা',
    track: 'এসএসসি ও জুনিয়র',
    totalMarks: 4505,
    maxPossibleMarks: 5000,
    accuracyRate: 90.1,
    examsCompleted: 35,
    streakDays: 14,
    trend: 'up',
    trendValue: 1,
    badgeTitle: 'এসএসসি ট্যালেন্ট পুল'
  },
  {
    id: 'nat-12',
    rank: 12,
    name: 'নাদিয়া সুলতানা',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
    institution: 'সরকারি করোনেশন মাধ্যমিক বালিকা বিদ্যালয়',
    coachingName: 'খুলনা ব্রিলিয়ান্ট কেয়ার',
    division: 'খুলনা',
    district: 'খুলনা',
    track: 'এসএসসি ও জুনিয়র',
    totalMarks: 4470,
    maxPossibleMarks: 5000,
    accuracyRate: 89.4,
    examsCompleted: 34,
    streakDays: 12,
    trend: 'down',
    trendValue: 1,
    badgeTitle: 'জুনিয়র স্কলার'
  }
];

interface NationalLeaderboardProps {
  onStartExam?: () => void;
  onOpenStore?: () => void;
}

export const NationalLeaderboard: React.FC<NationalLeaderboardProps> = ({
  onStartExam,
  onOpenStore
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('সারা দেশ');
  const [selectedTrack, setSelectedTrack] = useState('সকল মেধা');
  const [timeframe, setTimeframe] = useState<'all_time' | 'monthly' | 'weekly'>('all_time');
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<NationalRankStudent | null>(null);

  const DIVISIONS = [
    'সারা দেশ',
    'ঢাকা',
    'চট্টগ্রাম',
    'রাজশাহী',
    'খুলনা',
    'সিলেট',
    'বরিশাল',
    'রংপুর',
    'ময়মনসিংহ'
  ];

  const TRACKS = [
    'সকল মেধা',
    'ইঞ্জিনিয়ারিং ও বুয়েট',
    'মেডিকেল ও ডেন্টাল',
    'এইচএসসি বিজ্ঞান ও বোর্ড',
    'বিশ্ববিদ্যালয় ‘ক’ ইউনিট',
    'এসএসসি ও জুনিয়র',
    'বিসিএস ও সরকারি চাকরি'
  ];

  // Filtered leaderboard
  const filteredStudents = useMemo(() => {
    return NATIONAL_TOP_STUDENTS.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.coachingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDivision = selectedDivision === 'সারা দেশ' ? true : s.division === selectedDivision;
      const matchesTrack = selectedTrack === 'সকল মেধা' ? true : s.track === selectedTrack;

      return matchesSearch && matchesDivision && matchesTrack;
    });
  }, [searchQuery, selectedDivision, selectedTrack]);

  // Current logged in student mock rank info
  const myRank = 15;
  const myTotalMarks = 4380;
  const myAccuracy = 88.5;
  const myExams = 32;

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-amber-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-amber-600/30">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Crown size={14} className="text-amber-400" />
            <span>অল-বাংলাদেশ স্টুডেন্ট র‍্যাঙ্কিং সিস্টেম</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            জাতীয় <span className="text-amber-400">মেধা তালিকা</span> ও অল-বাংলাদেশ র‍্যাংক
          </h1>

          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
            সারা দেশের সকল স্কুল, কলেজ ও কোচিং সেন্টারের শিক্ষার্থীদের সামগ্রিক পরীক্ষার প্রাপ্ত নম্বর, মডেল টেস্ট স্কোর এবং নির্ভুলতার হার (Accuracy) অনুযায়ী রিয়েল-টাইম জাতীয় মেধা তালিকা।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span><strong>১২,৪৫০+</strong> শিক্ষার্থী তালিকাভুক্ত</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span><strong>৮৫,০০০+</strong> মডেল টেস্ট রেকর্ড</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span><strong>৬৪টি</strong> জেলা সংযুক্ত</span>
            </div>
          </div>
        </div>

        {/* Decorative backdrop icon */}
        <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none hidden md:block">
          <Trophy size={280} className="text-amber-400" />
        </div>
      </div>

      {/* Logged-in Student Status Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border-2 border-amber-400/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center text-2xl shadow-xl shadow-amber-300/40 shrink-0">
            #{myRank}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                আপনার জাতীয় মেধা অবস্থান
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> সারা দেশের শীর্ষ ৩% শিক্ষার্থীদের মধ্যে
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              আপনি বর্তমানে <span className="text-amber-600 font-black">১৫তম স্থানে</span> রয়েছেন!
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              সামগ্রিক মার্কস: <strong>{myTotalMarks.toLocaleString('bn-BD')}</strong> • শুদ্ধতা: <strong>{myAccuracy}%</strong> • পরীক্ষা দিয়েছেন: <strong>{myExams}টি</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block font-medium">শীর্ষ ১০-এ উঠতে প্রয়োজন</span>
            <span className="text-xs font-black text-amber-600">আর মাত্র ১৬০ নম্বর!</span>
          </div>
          {onStartExam && (
            <Button
              onClick={onStartExam}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md cursor-pointer"
            >
              নতুন পরীক্ষা দিয়ে র‍্যাংক বাড়ান
            </Button>
          )}
          {onOpenStore && (
            <Button
              onClick={onOpenStore}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-md cursor-pointer flex items-center gap-1"
            >
              <Sparkles size={14} />
              প্রিমিয়াম টেস্ট স্টোর
            </Button>
          )}
        </div>
      </div>

      {/* Top 3 National Champions Podium */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Crown size={22} className="text-amber-500" />
            জাতীয় মেধা চ্যাম্পিয়ন (Top 3 National Podium)
          </h2>
          <span className="text-xs font-bold text-slate-500">অল-বাংলাদেশ সার্বিক ফলাফল</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          
          {/* #2 National Runner-up */}
          {NATIONAL_TOP_STUDENTS[1] && (
            <div className="order-2 md:order-1 bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-slate-300 shadow-md flex flex-col items-center text-center relative group">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 font-black text-lg flex items-center justify-center absolute -top-6 shadow-md border-2 border-white">
                #২
              </div>
              <div className="w-20 h-20 rounded-2xl overflow-hidden mt-3 mb-3 border-2 border-slate-200 shadow-sm">
                <img src={NATIONAL_TOP_STUDENTS[1].avatar} alt={NATIONAL_TOP_STUDENTS[1].name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 mb-1">
                {NATIONAL_TOP_STUDENTS[1].badgeTitle}
              </span>
              <h3 className="font-bold text-slate-900 text-base">{NATIONAL_TOP_STUDENTS[1].name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{NATIONAL_TOP_STUDENTS[1].institution}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">{NATIONAL_TOP_STUDENTS[1].coachingName}</p>

              <div className="w-full mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-1 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">মোট নম্বর</span>
                  <span className="text-xs font-black text-slate-900">{NATIONAL_TOP_STUDENTS[1].totalMarks}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">শুদ্ধতা</span>
                  <span className="text-xs font-black text-emerald-600">{NATIONAL_TOP_STUDENTS[1].accuracyRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">মডেল টেস্ট</span>
                  <span className="text-xs font-black text-slate-700">{NATIONAL_TOP_STUDENTS[1].examsCompleted}টি</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForCert(NATIONAL_TOP_STUDENTS[1])}
                className="mt-3 text-xs text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                মেধা সনদ দেখুন <ArrowUpRight size={13} />
              </button>
            </div>
          )}

          {/* #1 National Champion */}
          {NATIONAL_TOP_STUDENTS[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 via-white to-white rounded-3xl p-7 border-2 border-amber-400 shadow-xl flex flex-col items-center text-center relative group scale-100 md:scale-105 z-10">
              <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center absolute -top-7 shadow-xl shadow-amber-300 border-2 border-white">
                <Crown size={24} className="fill-slate-950" />
              </div>
              <div className="w-24 h-24 rounded-3xl overflow-hidden mt-4 mb-3 border-4 border-amber-300 shadow-lg">
                <img src={NATIONAL_TOP_STUDENTS[0].avatar} alt={NATIONAL_TOP_STUDENTS[0].name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-black text-amber-900 px-3 py-1 rounded-full bg-amber-300 shadow-sm mb-1">
                {NATIONAL_TOP_STUDENTS[0].badgeTitle}
              </span>
              <h3 className="font-black text-slate-900 text-lg sm:text-xl">{NATIONAL_TOP_STUDENTS[0].name}</h3>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">{NATIONAL_TOP_STUDENTS[0].institution}</p>
              <p className="text-xs text-amber-800 font-bold mt-0.5">{NATIONAL_TOP_STUDENTS[0].coachingName}</p>

              <div className="w-full mt-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 grid grid-cols-3 gap-1 text-center">
                <div>
                  <span className="text-[10px] text-amber-800 block font-bold">মোট নম্বর</span>
                  <span className="text-sm font-black text-slate-900">{NATIONAL_TOP_STUDENTS[0].totalMarks}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800 block font-bold">শুদ্ধতা</span>
                  <span className="text-sm font-black text-emerald-600">{NATIONAL_TOP_STUDENTS[0].accuracyRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800 block font-bold">মডেল টেস্ট</span>
                  <span className="text-sm font-black text-slate-800">{NATIONAL_TOP_STUDENTS[0].examsCompleted}টি</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForCert(NATIONAL_TOP_STUDENTS[0])}
                className="mt-3.5 text-xs text-amber-700 hover:text-amber-900 font-black inline-flex items-center gap-1 cursor-pointer"
              >
                জাতীয় চ্যাম্পিয়ন সনদ <ArrowUpRight size={14} />
              </button>
            </div>
          )}

          {/* #3 National 2nd Runner-up */}
          {NATIONAL_TOP_STUDENTS[2] && (
            <div className="order-3 bg-white rounded-3xl p-6 border-2 border-amber-700/20 hover:border-amber-700/40 shadow-md flex flex-col items-center text-center relative group">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 font-black text-lg flex items-center justify-center absolute -top-6 shadow-md border-2 border-white">
                #৩
              </div>
              <div className="w-20 h-20 rounded-2xl overflow-hidden mt-3 mb-3 border-2 border-amber-200 shadow-sm">
                <img src={NATIONAL_TOP_STUDENTS[2].avatar} alt={NATIONAL_TOP_STUDENTS[2].name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-bold text-amber-800 px-2 py-0.5 rounded-full bg-amber-50 mb-1">
                {NATIONAL_TOP_STUDENTS[2].badgeTitle}
              </span>
              <h3 className="font-bold text-slate-900 text-base">{NATIONAL_TOP_STUDENTS[2].name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{NATIONAL_TOP_STUDENTS[2].institution}</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">{NATIONAL_TOP_STUDENTS[2].coachingName}</p>

              <div className="w-full mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-3 gap-1 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">মোট নম্বর</span>
                  <span className="text-xs font-black text-slate-900">{NATIONAL_TOP_STUDENTS[2].totalMarks}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">শুদ্ধতা</span>
                  <span className="text-xs font-black text-emerald-600">{NATIONAL_TOP_STUDENTS[2].accuracyRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">মডেল টেস্ট</span>
                  <span className="text-xs font-black text-slate-700">{NATIONAL_TOP_STUDENTS[2].examsCompleted}টি</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForCert(NATIONAL_TOP_STUDENTS[2])}
                className="mt-3 text-xs text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                মেধা সনদ দেখুন <ArrowUpRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-5 border-none shadow-sm bg-white space-y-4">
        
        {/* Top search & timeframe */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="শিক্ষার্থী নাম, কলেজ, জেলা বা কোচিং লিখে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold shrink-0">
              <button
                onClick={() => setTimeframe('all_time')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${timeframe === 'all_time' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                সর্বকালের
              </button>
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${timeframe === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                চলতি মাস
              </button>
              <button
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${timeframe === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                এই সপ্তাহ
              </button>
            </div>

            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              aria-label="বিভাগ নির্বাচন করুন"
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none shrink-0"
            >
              {DIVISIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tracks / Categories Chips */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap mr-1 flex items-center gap-1">
            <Target size={13} /> বিভাগ / ট্র্যাক:
          </span>
          {TRACKS.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTrack(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedTrack === t
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      {/* Main National Ranking Table */}
      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-3xl">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">জাতীয় মেধা তালিকা ক্রম</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ফিল্টার অনুযায়ী মোট {filteredStudents.length} জন শিক্ষার্থীর মেধা স্থান প্রদর্শিত হচ্ছে
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            হালনাগাদ: আজ দুপুর ১২:০০
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase bg-slate-50/30">
                <th className="py-3.5 pl-6">মেধা স্থান</th>
                <th className="py-3.5">শিক্ষার্থীর তথ্য</th>
                <th className="py-3.5">প্রতিষ্ঠান ও কোচিং</th>
                <th className="py-3.5">জেলা</th>
                <th className="py-3.5">সামগ্রিক মার্কস</th>
                <th className="py-3.5">শুদ্ধতার হার</th>
                <th className="py-3.5">পরীক্ষা সংখ্যা</th>
                <th className="py-3.5 pr-6 text-right">সনদ ও ট্রেন্ড</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Rank */}
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        st.rank === 1 
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-200' 
                          : st.rank === 2 
                          ? 'bg-slate-200 text-slate-800' 
                          : st.rank === 3 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{st.rank}
                      </span>
                    </div>
                  </td>

                  {/* Student Info */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <img src={st.avatar} alt={st.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                          <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                            {st.badgeTitle}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono mt-0.5 block">{st.track}</span>
                      </div>
                    </div>
                  </td>

                  {/* Institution & Coaching */}
                  <td className="py-4">
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{st.institution}</p>
                      <p className="text-emerald-700 font-semibold text-[11px] mt-0.5">{st.coachingName}</p>
                    </div>
                  </td>

                  {/* District / Division */}
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                      <MapPin size={12} className="text-slate-400" />
                      {st.district}, {st.division}
                    </span>
                  </td>

                  {/* Marks */}
                  <td className="py-4">
                    <div>
                      <span className="text-sm font-black text-slate-900">{st.totalMarks.toLocaleString('bn-BD')}</span>
                      <span className="text-[10px] text-slate-400 block">/ {st.maxPossibleMarks.toLocaleString('bn-BD')}</span>
                    </div>
                  </td>

                  {/* Accuracy */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${st.accuracyRate}%` }}
                        />
                      </div>
                      <span className="font-black text-emerald-600 text-xs">{st.accuracyRate}%</span>
                    </div>
                  </td>

                  {/* Exams */}
                  <td className="py-4">
                    <span className="font-bold text-slate-700">{st.examsCompleted}টি টেস্ট</span>
                  </td>

                  {/* Actions & Trend */}
                  <td className="py-4 pr-6 text-right">
                    <div className="inline-flex items-center gap-2.5">
                      <div className="flex items-center gap-1 text-xs font-bold">
                        {st.trend === 'up' && (
                          <span className="text-emerald-600 flex items-center text-[11px]">
                            <TrendingUp size={14} className="mr-0.5" /> +{st.trendValue}
                          </span>
                        )}
                        {st.trend === 'down' && (
                          <span className="text-red-500 flex items-center text-[11px]">
                            <TrendingDown size={14} className="mr-0.5" /> -{st.trendValue}
                          </span>
                        )}
                        {st.trend === 'stable' && (
                          <span className="text-slate-400 flex items-center text-[11px]">
                            <Minus size={14} /> 0
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedStudentForCert(st)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Award size={13} className="text-amber-500" />
                        সনদ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <Trophy size={36} className="mx-auto text-slate-300" />
            <h4 className="font-bold text-slate-700">কোনো মেধা রেকর্ড পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-400">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
          </div>
        )}
      </Card>

      {/* Certificate Modal */}
      {selectedStudentForCert && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-gradient-to-b from-amber-50/50 via-white to-white rounded-3xl p-7 border-2 border-amber-300 shadow-2xl space-y-6">
            
            <button
              onClick={() => setSelectedStudentForCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-200">
                <Crown size={34} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">জাতীয় মেধা স্বীকৃতি সনদ</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                দাপাঠশালা অল-বাংলাদেশ স্টুডেন্ট র‍্যাঙ্কিং
              </p>
            </div>

            {/* Certificate Body */}
            <div className="p-6 rounded-2xl bg-amber-50/40 border-2 border-amber-200 text-center space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                এই মর্মে স্বীকৃতি প্রদান করা যাচ্ছে যে,
              </p>
              <h3 className="text-2xl font-black text-slate-900 underline decoration-amber-400 underline-offset-8">
                {selectedStudentForCert.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {selectedStudentForCert.institution} ({selectedStudentForCert.coachingName})
              </p>
              
              <div className="py-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-sm shadow-md">
                  <Trophy size={16} />
                  <span>জাতীয় মেধা ক্রম: #{selectedStudentForCert.rank}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-xs border-t border-amber-200/80">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">মোট স্কোর</span>
                  <span className="font-black text-slate-800">{selectedStudentForCert.totalMarks}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">শুদ্ধতার হার</span>
                  <span className="font-black text-emerald-600">{selectedStudentForCert.accuracyRate}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px]">অংশগ্রহণ</span>
                  <span className="font-black text-slate-800">{selectedStudentForCert.examsCompleted} পরীক্ষা</span>
                </div>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>ডিজিটালভাবে সত্যায়িত মেধা সনদ</span>
              </div>
              <span className="font-mono text-[11px]">আইডি: BD-RANK-{selectedStudentForCert.id}</span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedStudentForCert(null)}
                className="w-full text-xs font-bold py-2.5 cursor-pointer"
              >
                বন্ধ করুন
              </Button>
              <Button
                onClick={() => {
                  alert(`"${selectedStudentForCert.name}"-এর জাতীয় মেধা সনদ ডাউনলোড সম্পন্ন হয়েছে!`);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download size={14} />
                সনদ ডাউনলোড করুন
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
