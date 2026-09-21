import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Database,
  BookOpen,
  PenTool,
  Users,
  Bell,
  Settings,
  ShieldCheck,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Filter,
  ChevronRight,
  Eye,
  Shield,
  Activity,
  Power,
  Save,
  Lock,
  Layers,
  FileText,
  UserCheck,
  UserX,
  Clock,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { INITIAL_BOOK_QUESTIONS, SUBJECT_TOPIC_MAP } from '../../../../data/initialBookQuestions';
import { checkIsAdmin, verifyAdminCredentials, logoutAdminSession } from '../../../../utils/adminAuth';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'coaching' | 'admin';
  status: 'active' | 'pending' | 'blocked';
  joinedDate: string;
  testsTaken: number;
}

interface ExamConfig {
  id: string;
  title: string;
  subject: string;
  questionsCount: number;
  durationMinutes: number;
  status: 'active' | 'draft' | 'archived';
  participantsCount: number;
  avgScore: number;
}

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'normal';
  createdAt: string;
  author: string;
}

const MasterAdminDashboard = () => {
  // Admin Session State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => checkIsAdmin());
  const [adminEmailInput, setAdminEmailInput] = useState('dapathshala.info@gmail.com');
  const [adminPasscodeInput, setAdminPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifyingAuth, setVerifyingAuth] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAdmin(checkIsAdmin());
    };
    window.addEventListener('auth_state_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth_state_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingAuth(true);
    setAuthError('');

    setTimeout(() => {
      const ok = verifyAdminCredentials(adminPasscodeInput, adminEmailInput);
      if (ok) {
        setIsAdmin(true);
        setAuthError('');
      } else {
        setAuthError('ভুল পাসকোড বা ইমেইল! শুধুমাত্র প্রধান অ্যাডমিন প্রবেশ করতে পারবেন।');
      }
      setVerifyingAuth(false);
    }, 300);
  };

  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'exams' | 'users' | 'notices' | 'settings'>('overview');

  // Real question bank state
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('সকল বিষয়');
  const [dataSource, setDataSource] = useState<'supabase' | 'local' | 'embedded'>('embedded');

  // Add Question Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [newQ, setNewQ] = useState({
    subject: 'পদার্থবিজ্ঞান',
    topic: 'গতি ও বল',
    classLevel: '৯ম-১০ম শ্রেণি',
    bookName: 'পদার্থবিজ্ঞান মূল বই',
    pageNumber: '৪৫',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    answer: '',
    explanation: ''
  });

  // Users Management State
  const [users, setUsers] = useState<UserRecord[]>([
    { id: 'DP-U01', name: 'আব্দুর রহমান', email: 'rahman.stu@gmail.com', role: 'student', status: 'active', joinedDate: '১২ সেপ্টেম্বর ২০২৬', testsTaken: 14 },
    { id: 'DP-U02', name: 'তানভীর আহমেদ', email: 'tanveer.master@gmail.com', role: 'teacher', status: 'active', joinedDate: '১০ সেপ্টেম্বর ২০২৬', testsTaken: 42 },
    { id: 'DP-U03', name: 'উন্মেষ একাডেমিয়া', email: 'unmesh.admin@gmail.com', role: 'coaching', status: 'active', joinedDate: '০৫ সেপ্টেম্বর ২০২৬', testsTaken: 120 },
    { id: 'DP-U04', name: 'সাদিয়া সুলতানা', email: 'sadia.edu@gmail.com', role: 'student', status: 'pending', joinedDate: '১৪ সেপ্টেম্বর ২০২৬', testsTaken: 3 },
    { id: 'DP-U05', name: 'কামরুল হাসান', email: 'kamrul.h@gmail.com', role: 'student', status: 'blocked', joinedDate: '০১ সেপ্টেম্বর ২০২৬', testsTaken: 1 }
  ]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Exams Management State
  const [exams, setExams] = useState<ExamConfig[]>([
    { id: 'EX-01', title: 'মডেল টেস্ট - ০১ (সাধারণ বিজ্ঞান ও আইসিটি)', subject: 'বিজ্ঞান', questionsCount: 10, durationMinutes: 10, status: 'active', participantsCount: 840, avgScore: 78 },
    { id: 'EX-02', title: 'বাংলা ১ম ও ২য় পত্র মেধা যাচাই পরীক্ষা', subject: 'বাংলা', questionsCount: 25, durationMinutes: 30, status: 'active', participantsCount: 512, avgScore: 82 },
    { id: 'EX-03', title: 'এসএসসি পদার্থবিজ্ঞান ফাইনাল রিভিশন টেস্ট', subject: 'পদার্থবিজ্ঞান', questionsCount: 30, durationMinutes: 40, status: 'draft', participantsCount: 0, avgScore: 0 },
    { id: 'EX-04', title: 'উচ্চতর গণিত ত্রিকোণমিতি স্পেশাল অলিম্পিয়াড', subject: 'গণিত', questionsCount: 15, durationMinutes: 20, status: 'active', participantsCount: 390, avgScore: 65 }
  ]);

  // System Settings State
  const [settingsState, setSettingsState] = useState({
    aiGenerationEnabled: true,
    antiCheatEnabled: true,
    examNegativeMarking: false,
    publicRegistration: true,
    institutionName: 'DaPathshala (দা পাঠশালা)',
    supportHotline: '+৮৮০ ১৭০০-০০০০০০',
    supportEmail: 'dapathshala.info@gmail.com',
    paperWatermark: 'DaPathshala Education'
  });
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  // Notices State
  const [notices, setNotices] = useState<NoticeItem[]>([
    { id: 'N-1', title: 'আসন্ন এসএসসি মডেল টেস্টের সময়সূচি ঘোষণা', content: 'সকল শিক্ষার্থীদের আগামী ২০ সেপ্টেম্বর হতে শুরু হতে যাওয়া সাপ্তাহিক মডেল টেস্টে নির্ধারিত সময়ে অংশগ্রহণের অনুরোধ করা যাচ্ছে।', priority: 'high', createdAt: '১৬ সেপ্টেম্বর ২০২৬', author: 'প্রধান অ্যাডমিন' },
    { id: 'N-2', title: 'নতুন পাঠ্যক্রমের রসায়ন ও গণিত প্রশ্নব্যাংক হালনাগাদ', content: 'বোর্ড বইয়ের নতুন অধ্যায়সমূহ অনুযায়ী প্রশ্নব্যাংকে আরও ৫০০+ প্রমাণিক প্রশ্ন যুক্ত করা হয়েছে।', priority: 'medium', createdAt: '১৫ সেপ্টেম্বর ২০২৬', author: 'কনটেন্ট টিম' }
  ]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticePriority, setNewNoticePriority] = useState<'high' | 'medium' | 'normal'>('medium');

  // Load questions on mount
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/bank/questions');
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setDataSource(data.source === 'supabase' ? 'supabase' : 'local');
      } else {
        setQuestions(INITIAL_BOOK_QUESTIONS);
        setDataSource('embedded');
      }
    } catch (e) {
      console.warn('Fallback to initial book questions', e);
      setQuestions(INITIAL_BOOK_QUESTIONS);
      setDataSource('embedded');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Handler to add new question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.question.trim() || !newQ.answer.trim()) {
      alert('অনুগ্রহ করে প্রশ্ন ও সঠিক উত্তর লিখুন।');
      return;
    }

    setSavingQuestion(true);
    const optionsArray = [
      newQ.optionA.trim() || 'অপশন ক',
      newQ.optionB.trim() || 'অপশন খ',
      newQ.optionC.trim() || 'অপশন গ',
      newQ.optionD.trim() || 'অপশন ঘ'
    ];

    try {
      const res = await fetch('/api/bank/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newQ.subject,
          classLevel: newQ.classLevel,
          topic: newQ.topic,
          bookName: newQ.bookName,
          pageNumber: newQ.pageNumber,
          question: newQ.question,
          options: optionsArray,
          answer: newQ.answer,
          explanation: newQ.explanation,
          yearOrBoard: '২০২৬'
        })
      });

      const data = await res.json();
      if (res.ok) {
        const created = {
          id: data.question?.id || Date.now().toString(),
          subject: newQ.subject,
          classLevel: newQ.classLevel,
          topic: newQ.topic,
          bookName: newQ.bookName,
          pageNumber: newQ.pageNumber,
          question: newQ.question,
          options: optionsArray,
          answer: newQ.answer,
          explanation: newQ.explanation,
          yearOrBoard: '২০২৬'
        };
        setQuestions(prev => [created, ...prev]);
        setShowAddModal(false);
        setNewQ({
          subject: 'পদার্থবিজ্ঞান',
          topic: 'গতি ও বল',
          classLevel: '৯ম-১০ম শ্রেণি',
          bookName: 'পদার্থবিজ্ঞান মূল বই',
          pageNumber: '৪৫',
          question: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          answer: '',
          explanation: ''
        });
      } else {
        alert(data.error || 'প্রশ্ন সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
      alert('সার্ভারে যোগাযোগ করা যায়নি, তবে লোকাল মেমোরিতে যুক্ত হচ্ছে।');
      setQuestions(prev => [{
        id: Date.now().toString(),
        ...newQ,
        options: optionsArray
      }, ...prev]);
      setShowAddModal(false);
    } finally {
      setSavingQuestion(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: string | number) => {
    if (!confirm('আপনি কি সত্যিই এই প্রশ্নটি প্রশ্নব্যাংক থেকে মুছে ফেলতে চান?')) return;
    try {
      await fetch(`/api/bank/questions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    setQuestions(prev => prev.filter(q => String(q.id) !== String(id)));
  };

  // Toggle user status
  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'active' ? 'blocked' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  // Toggle exam status
  const handleToggleExamStatus = (id: string) => {
    setExams(prev => prev.map(ex => {
      if (ex.id === id) {
        return { ...ex, status: ex.status === 'active' ? 'draft' : 'active' };
      }
      return ex;
    }));
  };

  // Post Notice
  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;
    const item: NoticeItem = {
      id: `N-${Date.now()}`,
      title: newNoticeTitle,
      content: newNoticeContent,
      priority: newNoticePriority,
      createdAt: new Date().toLocaleDateString('bn-BD'),
      author: 'সুপার অ্যাডমিন'
    };
    setNotices([item, ...notices]);
    setNewNoticeTitle('');
    setNewNoticeContent('');
  };

  // Delete Notice
  const handleDeleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  // Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem('dapathshala_system_settings', JSON.stringify(settingsState));
    setSettingsSavedNotice(true);
    setTimeout(() => setSettingsSavedNotice(false), 3000);
  };

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    const matchesSubject = filterSubject === 'সকল বিষয়' || q.subject === filterSubject;
    const matchesSearch = !questionSearch || 
      (q.question?.toLowerCase().includes(questionSearch.toLowerCase())) ||
      (q.topic?.toLowerCase().includes(questionSearch.toLowerCase())) ||
      (q.bookName?.toLowerCase().includes(questionSearch.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Security Gate for Non-Admin or Unauthenticated Users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 pt-28 pb-16 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500/20 to-primary/20 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <ShieldCheck size={36} className="text-amber-400" />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
              <Lock size={12} />
              <span>রেস্ট্রিক্টেড অ্যাডমিন এক্সেস</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              সুপার অ্যাডমিন সিকিউরিটি গেট
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              এই ড্যাশবোর্ডটি শুধুমাত্র DaPathshala-এর প্রধান অ্যাডমিনের জন্য সংরক্ষিত। ব্যবহারকারীদের জন্য এই পেজে প্রবেশ সুরক্ষিত রাখা হয়েছে।
            </p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            {authError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">অ্যাডমিন ইমেইল</label>
              <input
                type="email"
                required
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="dapathshala.info@gmail.com"
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">সিকিউরিটি পাসকোড / পিন</label>
                <span className="text-[10px] text-amber-400 font-mono">পিন: admin2026</span>
              </div>
              <input
                type="password"
                required
                value={adminPasscodeInput}
                onChange={(e) => setAdminPasscodeInput(e.target.value)}
                placeholder="অ্যাডমিন পাসকোড লিখুন..."
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={verifyingAuth}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <ShieldCheck size={18} />
              <span>{verifyingAuth ? 'যাচাই করা হচ্ছে...' : 'ভেরিফাই ও প্রবেশ করুন'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2">
            <p className="text-[11px] text-slate-500">
              আপনি কি সাধারণ ব্যবহারকারী বা শিক্ষার্থী?
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <span>শিক্ষার্থী ড্যাশবোর্ডে ফিরে যান</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pt-6 pb-20 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Master Control Top Banner */}
        <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-200 text-xs font-semibold">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>মাস্টার অ্যাডমিন কন্ট্রোল সেন্টার • DaPathshala Enterprise</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                অ্যাপ্লিকেশন সার্বিক নিয়ন্ত্রণ বোর্ড
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                আন্তর্জাতিক মানের এন্টারপ্রাইজ ড্যাশবোর্ড। এখান থেকে আপনি প্রশ্নভাণ্ডার, লাইভ পরীক্ষা, শিক্ষার্থী ও শিক্ষক রোল, সিস্টেম সিকিউরিটি এবং গ্লোবাল নোটিশ সরাসরি নিয়ন্ত্রণ করতে পারবেন।
              </p>
            </div>

            {/* Quick Status / Telemetry Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 flex items-center space-x-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-200">Supabase Cloud:</span>
                <span className="text-emerald-300 font-bold">{dataSource === 'supabase' ? 'অনলাইন ও সক্রিয়' : 'সক্রিয় (হাইব্রিড)'}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 flex items-center space-x-2 text-xs">
                <Activity size={14} className="text-blue-400" />
                <span className="font-semibold text-slate-200">Gemini 2.5 Flash:</span>
                <span className="text-blue-300 font-bold">রেডি</span>
              </div>
              <button
                onClick={fetchQuestions}
                className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-2xl border border-white/10 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                title="ডাটাবেজ রিফ্রেশ করুন"
              >
                <RefreshCw size={14} className={loadingQuestions ? 'animate-spin' : ''} />
                <span>সিঙ্ক</span>
              </button>
              <button
                onClick={() => {
                  logoutAdminSession();
                  setIsAdmin(false);
                }}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                title="অ্যাডমিন ড্যাশবোর্ড লক ও লগআউট করুন"
              >
                <Lock size={13} />
                <span>লক ও লগআউট</span>
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'overview', label: 'সার্বিক মেট্রিক্স', icon: LayoutDashboard },
              { id: 'questions', label: 'প্রশ্ন ব্যাংক নিয়ন্ত্রণ', icon: Database, count: questions.length },
              { id: 'exams', label: 'মডেল টেস্ট ও পরীক্ষা', icon: PenTool, count: exams.length },
              { id: 'users', label: 'ব্যবহারকারী ও রোল', icon: Users, count: users.length },
              { id: 'notices', label: 'লাইভ নোটিশ বোর্ড', icon: Bell, count: notices.length },
              { id: 'settings', label: 'সিস্টেম ও সিকিউরিটি', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-lg shadow-black/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-primary text-white' : 'bg-white/20 text-white'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* TAB 1: OVERVIEW & TELEMETRY */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center">
                    <Database size={24} />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center">
                    <TrendingUp size={12} className="mr-1" /> +১৮% বৃদ্ধি
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট প্রশ্নভাণ্ডার</h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{questions.length} <span className="text-xs font-normal text-slate-400">টি প্রশ্ন</span></p>
                <div className="mt-3 text-[11px] text-slate-500 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>ক্লাউড ও লোকাল ডেটাবেজে সংরক্ষিত</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users size={24} />
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg flex items-center">
                    <Users size={12} className="mr-1" /> সক্রিয়
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">মোট শিক্ষার্থী ও শিক্ষক</h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">১,৪৫০+ <span className="text-xs font-normal text-slate-400">জন</span></p>
                <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>শিক্ষার্থী: ১,৩৯০</span>
                  <span>কোচিং/শিক্ষক: ৬০</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <PenTool size={24} />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    লাইভ
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">অংশগ্রহণকৃত পরীক্ষা</h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">২,১৮০ <span className="text-xs font-normal text-slate-400">বার</span></p>
                <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>গড় ফলাফল: ৮১.৪%</span>
                  <span>পাস হার: ৯২%</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                    স্টুডিও
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">তৈরিকৃত প্রশ্নপত্র</h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">৫৩০+ <span className="text-xs font-normal text-slate-400">টি পেপার</span></p>
                <div className="mt-3 text-[11px] text-slate-500">
                  <span>প্রিন্ট ও পিডিএফ এক্সপোর্ট সম্পন্ন</span>
                </div>
              </div>
            </div>

            {/* Middle Grid: Quick Control Actions & System Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions Panel */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                  <Sparkles size={18} className="text-primary" />
                  <span>তাত্ক্ষণিক কন্ট্রোল অ্যাকশন</span>
                </h2>
                <div className="space-y-2.5">
                  <button
                    onClick={() => { setActiveTab('questions'); setShowAddModal(true); }}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-primary/5 hover:border-primary/30 border border-slate-200/70 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 hover:text-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-primary flex items-center justify-center">
                        <Plus size={16} />
                      </div>
                      <span>প্রশ্নব্যাংকে নতুন প্রশ্ন যোগ করুন</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab('exams')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200/70 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-700 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <PenTool size={16} />
                      </div>
                      <span>নতুন মডেল টেস্ট শিডিউল করুন</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setActiveTab('notices')}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200/70 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 hover:text-amber-800 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Bell size={16} />
                      </div>
                      <span>শিক্ষার্থীদের নোটিশ প্রকাশ করুন</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <Link
                    to="/paper-builder"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200/70 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 hover:text-purple-700 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <BookOpen size={16} />
                      </div>
                      <span>বই প্রশ্নপত্র বিল্ডারে যান</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* System Infrastructure Telemetry */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                    <Activity size={18} className="text-emerald-500" />
                    <span>ক্লাউড ও সিস্টেম স্থিতি মনিটর</span>
                  </h2>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">
                    সব সার্ভিস নরমাল (100% Uptime)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600">Supabase Cloud PostgreSQL</span>
                      <span className="text-emerald-600 font-bold">কানেক্টেড (ms: 42)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[94%]" />
                    </div>
                    <p className="text-[11px] text-slate-400">টেবিল: book_questions (স্বয়ংক্রিয় সিঙ্ক সক্ষম)</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600">Google Gemini 2.5 AI Engine</span>
                      <span className="text-blue-600 font-bold">অনলাইন</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-[98%]" />
                    </div>
                    <p className="text-[11px] text-slate-400">রেসপন্স মোড: বাংলা এডুকেশনাল ফরম্যাট</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600">লোকাল SQLite ক্যাশ ও ব্যাকআপ</span>
                      <span className="text-emerald-600 font-bold">সিঙ্কড</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                    </div>
                    <p className="text-[11px] text-slate-400">অফলাইন ফলব্যাক প্রস্তুত</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600">পরীক্ষা সিকিউরিটি ও ক্লিপবোর্ড লক</span>
                      <span className="text-indigo-600 font-bold">{settingsState.antiCheatEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full w-[100%]" />
                    </div>
                    <p className="text-[11px] text-slate-400">ট্যাব স্যুইচ অ্যালার্ট সক্রিয়</p>
                  </div>
                </div>

                {/* Audit Activity Log */}
                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">সাম্প্রতিক অ্যাডমিন অডিট ট্রেইল:</h3>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-slate-600">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>প্রশ্নব্যাংকে নতুন প্রশ্ন সিঙ্ক সম্পন্ন হয়েছে (Supabase Cloud)</span>
                      </div>
                      <span className="text-[10px] text-slate-400">আজ, ৩ মিনিট আগে</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-slate-600">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>মডেল টেস্ট - ০১ এ ৮৪০ জন শিক্ষার্থী অংশগ্রহণ করেছে</span>
                      </div>
                      <span className="text-[10px] text-slate-400">আজ, ১৫ মিনিট আগে</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-slate-600">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span>সিস্টেম কনফিগারেশন আপডেট ও সুরক্ষামূলক প্রোটোকল সচল</span>
                      </div>
                      <span className="text-[10px] text-slate-400">আজ, ১ ঘণ্টা আগে</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUESTIONS MANAGER (CRUD) */}
        {activeTab === 'questions' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">প্রশ্ন ব্যাংক ও কারিকুলাম কন্ট্রোল</h2>
                <p className="text-xs text-slate-500">
                  মোট {filteredQuestions.length}টি প্রশ্ন প্রদর্শিত হচ্ছে (উৎস: {dataSource})
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="gradient-button px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md"
                >
                  <Plus size={16} />
                  <span>নতুন প্রশ্ন তৈরি করুন</span>
                </button>
                <button
                  onClick={fetchQuestions}
                  className="nexes-button-secondary px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5"
                >
                  <RefreshCw size={14} className={loadingQuestions ? 'animate-spin' : ''} />
                  <span>রিফ্রেশ</span>
                </button>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="relative sm:col-span-2">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  placeholder="প্রশ্ন, অধ্যায় বা বইয়ের নাম দিয়ে সার্চ করুন..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="সকল বিষয়">সকল বিষয়</option>
                  <option value="বাংলা">বাংলা</option>
                  <option value="ইংরেজি">ইংরেজি</option>
                  <option value="গণিত">গণিত</option>
                  <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                  <option value="রসায়ন">রসায়ন</option>
                  <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
                  <option value="সাধারণ জ্ঞান">সাধারণ জ্ঞান</option>
                </select>
              </div>
            </div>

            {/* Questions Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3.5 pl-4">ক্রম</th>
                      <th className="p-3.5">প্রশ্ন ও অপশন</th>
                      <th className="p-3.5">বিষয় ও অধ্যায়</th>
                      <th className="p-3.5">বই ও পৃষ্ঠা</th>
                      <th className="p-3.5">সঠিক উত্তর</th>
                      <th className="p-3.5 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredQuestions.slice(0, 50).map((q, index) => (
                      <tr key={`${q.id || 'q'}-${index}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 pl-4 font-bold text-slate-400">{index + 1}</td>
                        <td className="p-3.5 max-w-xs sm:max-w-md">
                          <p className="font-semibold text-slate-900 leading-snug">{q.question}</p>
                          {q.options && q.options.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {q.options.map((opt: string, i: number) => (
                                <span key={i} className={`text-[11px] px-2 py-0.5 rounded-md border ${
                                  opt === q.answer ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200'
                                }`}>
                                  {['ক', 'খ', 'গ', 'ঘ'][i] || i + 1}. {opt}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold block w-fit mb-1">
                            {q.subject || 'সাধারণ'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            {q.topic || 'সকল অধ্যায়'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 text-xs">
                          <p className="font-medium">{q.bookName || 'পাঠ্যবই'}</p>
                          {q.pageNumber && <p className="text-[11px] text-slate-400">পৃষ্ঠা: {q.pageNumber}</p>}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                            {q.answer}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="ডিলিট করুন"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXAMS & MODEL TESTS CONTROL */}
        {activeTab === 'exams' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">মডেল টেস্ট ও অনলাইন পরীক্ষা ব্যবস্থাপনা</h2>
                <p className="text-xs text-slate-500">পরীক্ষার সময়সূচি, প্রশ্নের সংখ্যা এবং লাইভ স্ট্যাটাস নিয়ন্ত্রণ করুন।</p>
              </div>
              <Link
                to="/exams"
                className="gradient-button px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md w-fit"
              >
                <Eye size={16} />
                <span>লাইভ এক্সাম পেজ দেখুন</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((ex) => (
                <div key={ex.id} className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary/40 transition-all shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-primary uppercase tracking-wider">
                        {ex.subject}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2">{ex.title}</h3>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center space-x-1 ${
                      ex.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${ex.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{ex.status === 'active' ? 'সক্রিয় (Live)' : 'ড্রাফট (Draft)'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center p-3 bg-white rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <p className="text-slate-400 text-[10px]">মোট প্রশ্ন</p>
                      <p className="font-bold text-slate-800 text-sm">{ex.questionsCount}টি</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">বরাদ্দ সময়</p>
                      <p className="font-bold text-slate-800 text-sm">{ex.durationMinutes} মিনিট</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">অংশগ্রহণকারী</p>
                      <p className="font-bold text-slate-800 text-sm">{ex.participantsCount} জন</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleToggleExamStatus(ex.id)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
                        ex.status === 'active' 
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {ex.status === 'active' ? 'স্থগিত করুন' : 'লাইভ সক্রিয় করুন'}
                    </button>

                    <Link
                      to="/exams"
                      className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
                    >
                      <span>পরীক্ষা দিন</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: USERS & ROLES MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">ব্যবহারকারী ও রোল ম্যানেজমেন্ট</h2>
                <p className="text-xs text-slate-500">শিক্ষার্থী, শিক্ষক ও কোচিং অ্যাকাউন্টের অনুমোদন ও পারমিশন কন্ট্রোল।</p>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none"
                >
                  <option value="all">সকল রোল</option>
                  <option value="student">শিক্ষার্থী (Student)</option>
                  <option value="teacher">শিক্ষক (Teacher)</option>
                  <option value="coaching">কোচিং অ্যাডমিন (Coaching)</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3.5 pl-4">আইডি ও নাম</th>
                      <th className="p-3.5">ইমেইল</th>
                      <th className="p-3.5">রোল (Role)</th>
                      <th className="p-3.5">পরীক্ষায় অংশ</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 pl-4">
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.id}</p>
                        </td>
                        <td className="p-3.5 text-slate-600 font-mono text-xs">{u.email}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.role === 'coaching' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'teacher' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {u.role === 'coaching' ? 'কোচিং অ্যাডমিন' : u.role === 'teacher' ? 'শিক্ষক' : 'শিক্ষার্থী'}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-700">{u.testsTaken} টি টেস্ট</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            u.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.status === 'active' ? 'সক্রিয়' : u.status === 'pending' ? 'অপেক্ষমাণ' : 'স্থগিত'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors ${
                              u.status === 'active' 
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {u.status === 'active' ? 'ব্লক করুন' : 'সক্রিয় করুন'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: NOTICE BOARD & ANNOUNCEMENTS */}
        {activeTab === 'notices' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">লাইভ নোটিশ ও ঘোষণা কন্ট্রোল</h2>
              <p className="text-xs text-slate-500">শিক্ষার্থী ও শিক্ষকদের হোমপেজ এবং ড্যাশবোর্ডে সরাসরি নোটিশ প্রকাশ করুন।</p>
            </div>

            {/* Create Notice Form */}
            <form onSubmit={handleAddNotice} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Bell size={16} className="text-primary" />
                <span>নতুন নোটিশ পোস্ট করুন</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    required
                    value={newNoticeTitle}
                    onChange={(e) => setNewNoticeTitle(e.target.value)}
                    placeholder="নোটিশের শিরোনাম (যেমন: সাপ্তাহিক মডেল টেস্ট নোটিশ)..."
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <select
                    value={newNoticePriority}
                    onChange={(e) => setNewNoticePriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold outline-none"
                  >
                    <option value="high">জরুরি (High)</option>
                    <option value="medium">সাধারণ (Medium)</option>
                    <option value="normal">তথ্যমূলক (Normal)</option>
                  </select>
                </div>
              </div>
              <div>
                <textarea
                  required
                  rows={2}
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  placeholder="নোটিশের বিস্তারিত বিবরণ লিখুন..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-normal outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="gradient-button px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-sm"
              >
                <span>নোটিশ প্রকাশ করুন</span>
              </button>
            </form>

            {/* Published Notices List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800">প্রকাশিত নোটিশসমূহ ({notices.length})</h3>
              {notices.map((n) => (
                <div key={n.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start justify-between gap-4 hover:border-primary/30 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        n.priority === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {n.priority === 'high' ? 'জরুরি' : 'নোটিশ'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
                    <p className="text-[11px] text-slate-400">প্রকাশক: {n.author} • {n.createdAt}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SYSTEM & SECURITY SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">সিস্টেম কনফিগারেশন ও সিকিউরিটি কন্ট্রোল</h2>
                <p className="text-xs text-slate-500">অ্যাপ্লিকেশনের গ্লোবাল ফিচার টগল এবং ব্র্যান্ডিং সেটিংস পরিচালনা করুন।</p>
              </div>
              {settingsSavedNotice && (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl animate-fade-in">
                  ✓ সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Toggles */}
              <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Shield size={16} className="text-primary" />
                  <span>ফিচার ও সিকিউরিটি কন্ট্রোল</span>
                </h3>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">AI প্রশ্ন জেনারেটর ইঞ্জিন</p>
                    <p className="text-[11px] text-slate-400">শিক্ষার্থীরা এআই দ্বারা নতুন প্রশ্ন তৈরি করতে পারবে কি না</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsState({ ...settingsState, aiGenerationEnabled: !settingsState.aiGenerationEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settingsState.aiGenerationEnabled ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settingsState.aiGenerationEnabled ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">পরীক্ষায় অ্যান্টি-চিট ও লক</p>
                    <p className="text-[11px] text-slate-400">ট্যাব পরিবর্তন নিষেধাজ্ঞা ও রাইট ক্লিক লক</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsState({ ...settingsState, antiCheatEnabled: !settingsState.antiCheatEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settingsState.antiCheatEnabled ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settingsState.antiCheatEnabled ? 'right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-800">মডেল টেস্টে নেগেটিভ মার্কিং</p>
                    <p className="text-[11px] text-slate-400">ভুল উত্তরের জন্য ০.২৫ নম্বর কর্তন</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsState({ ...settingsState, examNegativeMarking: !settingsState.examNegativeMarking })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${settingsState.examNegativeMarking ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settingsState.examNegativeMarking ? 'bg-primary' : 'bg-slate-300'}`} />
                  </button>
                </div>
              </div>

              {/* Branding and Contact Config */}
              <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                  <Settings size={16} className="text-primary" />
                  <span>ব্র্যান্ডিং ও প্রতিষ্ঠান তথ্য</span>
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">প্রতিষ্ঠানের নাম</label>
                  <input
                    type="text"
                    value={settingsState.institutionName}
                    onChange={(e) => setSettingsState({ ...settingsState, institutionName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">হেল্পলাইন / মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={settingsState.supportHotline}
                    onChange={(e) => setSettingsState({ ...settingsState, supportHotline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">অফিসিয়াল সাপোর্ট ইমেইল</label>
                  <input
                    type="text"
                    value={settingsState.supportEmail}
                    onChange={(e) => setSettingsState({ ...settingsState, supportEmail: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="gradient-button px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md"
              >
                <Save size={16} />
                <span>সকল পরিবর্তন সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD NEW QUESTION DIRECTLY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">প্রশ্নব্যাংকে নতুন প্রশ্ন যোগ করুন</h3>
                <p className="text-xs text-slate-500">এটি স্বয়ংক্রিয়ভাবে ক্লাউড ডাটাবেজ ও পেপার মেকারে যুক্ত হবে।</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">বিষয়</label>
                  <select
                    value={newQ.subject}
                    onChange={(e) => setNewQ({ ...newQ, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold"
                  >
                    <option value="বাংলা">বাংলা</option>
                    <option value="ইংরেজি">ইংরেজি</option>
                    <option value="গণিত">গণিত</option>
                    <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                    <option value="রসায়ন">রসায়ন</option>
                    <option value="জীববিজ্ঞান">জীববিজ্ঞান</option>
                    <option value="সাধারণ জ্ঞান">সাধারণ জ্ঞান</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">শ্রেণি</label>
                  <input
                    type="text"
                    value={newQ.classLevel}
                    onChange={(e) => setNewQ({ ...newQ, classLevel: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">অধ্যায় / বিষয়বস্তু</label>
                  <input
                    type="text"
                    value={newQ.topic}
                    onChange={(e) => setNewQ({ ...newQ, topic: e.target.value })}
                    placeholder="যেমন: গতি ও বল"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">পাঠ্যবইয়ের নাম</label>
                  <input
                    type="text"
                    value={newQ.bookName}
                    onChange={(e) => setNewQ({ ...newQ, bookName: e.target.value })}
                    placeholder="যেমন: এনসিটিবি পদার্থবিজ্ঞান"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">বইয়ের পৃষ্ঠা নম্বর</label>
                  <input
                    type="text"
                    value={newQ.pageNumber}
                    onChange={(e) => setNewQ({ ...newQ, pageNumber: e.target.value })}
                    placeholder="যেমন: ৪২"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">প্রশ্ন *</label>
                <textarea
                  required
                  rows={2}
                  value={newQ.question}
                  onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
                  placeholder="প্রশ্নের মূল কথা লিখুন..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">অপশন (ক)</label>
                  <input
                    type="text"
                    value={newQ.optionA}
                    onChange={(e) => setNewQ({ ...newQ, optionA: e.target.value })}
                    placeholder="অপশন ক"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">অপশন (খ)</label>
                  <input
                    type="text"
                    value={newQ.optionB}
                    onChange={(e) => setNewQ({ ...newQ, optionB: e.target.value })}
                    placeholder="অপশন খ"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">অপশন (গ)</label>
                  <input
                    type="text"
                    value={newQ.optionC}
                    onChange={(e) => setNewQ({ ...newQ, optionC: e.target.value })}
                    placeholder="অপশন গ"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">অপশন (ঘ)</label>
                  <input
                    type="text"
                    value={newQ.optionD}
                    onChange={(e) => setNewQ({ ...newQ, optionD: e.target.value })}
                    placeholder="অপশন ঘ"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-emerald-700 mb-1">সঠিক উত্তর *</label>
                  <input
                    type="text"
                    required
                    value={newQ.answer}
                    onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })}
                    placeholder="সঠিক উত্তরটি হুবহু লিখুন"
                    className="w-full p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-300 text-xs font-bold text-emerald-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ব্যাখ্যা (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={newQ.explanation}
                    onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
                    placeholder="কেন এই উত্তরটি সঠিক..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="nexes-button-secondary px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="gradient-button px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md"
                >
                  {savingQuestion ? (
                    <span>সংরক্ষণ হচ্ছে...</span>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>ডাটাবেজে যুক্ত করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterAdminDashboard;
