import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Sparkles, 
  Camera, 
  Youtube, 
  FileText, 
  Layers, 
  Calendar, 
  Trophy, 
  Award, 
  Shield, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  Zap,
  Terminal,
  ShoppingBag,
  Layout,
  Crown,
  HelpCircle,
  BrainCircuit,
  ChevronLeft,
  GraduationCap,
  Users,
  Swords,
  Building2,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';
import { subscribeToExamSubmissions, ExamSubmissionPayload } from '../../lib/proctoringService';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  onGoToLanding?: () => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  onGoToLanding,
  isSidebarOpen = false,
  setIsSidebarOpen
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const openState = setIsSidebarOpen ? isSidebarOpen : internalOpen;
  const setOpenState = setIsSidebarOpen || setInternalOpen;

  const clickCountRef = React.useRef(0);
  const clickTimerRef = React.useRef<any>(null);
  const [clickPrompt, setClickPrompt] = useState<string | null>(null);

  // Notification states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    examId?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('dapathshala_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    // Check if any tests in dapathshala_parent_assigned_tests are in 'submitted' state
    try {
      const savedTests = localStorage.getItem('dapathshala_parent_assigned_tests');
      if (savedTests !== null) {
        const tests = JSON.parse(savedTests);
        if (Array.isArray(tests)) {
          const submittedTests = tests.filter((t: any) => t && t.status === 'submitted' && !t.isPublished);
          if (submittedTests.length > 0) {
            return submittedTests.map((t: any) => ({
              id: 'notif_' + (t.id || t.examId || Date.now()),
              title: 'নতুন খাতা জমা পড়েছে!',
              message: `${t.studentName || t.childName || 'সন্তান'} "${t.title || t.subject}" পরীক্ষার খাতা জমা দিয়েছে।`,
              time: t.submittedAt || 'অপেক্ষমান',
              read: false,
              examId: t.id || t.examId
            }));
          }
        }
      }
    } catch {}

    return [
      {
        id: 'notif_seed_math',
        title: 'নতুন খাতা জমা পড়েছে!',
        message: 'আরাফাত রহমান "গণিত সাপ্তাহিক মূল্যায়ন" পরীক্ষার খাতা জমা দিয়েছে। খাতা দেখতে এখানে ক্লিক করুন।',
        time: 'আজ, সন্ধ্যা ৭:০৫',
        read: false,
        examId: 'test-101'
      }
    ];
  });

  // Audio notification chime
  const playAudioChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.38);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.38);
    } catch {}
  };

  // Persist notifications across turns and reloads
  useEffect(() => {
    try {
      localStorage.setItem('dapathshala_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Auto-remove notification when an exam marksheet is published/evaluated
  useEffect(() => {
    const handlePublished = (e: any) => {
      const publishedExamId = e.detail?.id || e.detail?.examId;
      if (publishedExamId) {
        setNotifications(prev => prev.filter(n => n.examId !== publishedExamId));
      }
    };
    window.addEventListener('dapathshala_marksheet_published', handlePublished);
    return () => {
      window.removeEventListener('dapathshala_marksheet_published', handlePublished);
    };
  }, []);

  useEffect(() => {
    const syncNotifs = () => {
      try {
        let notifs: any[] = [];
        const savedNotifs = localStorage.getItem('dapathshala_notifications');
        if (savedNotifs) {
          const parsed = JSON.parse(savedNotifs);
          if (Array.isArray(parsed)) notifs = parsed;
        }

        // Check dapathshala_parent_assigned_tests for any submitted tests not yet in notifications
        const savedTests = localStorage.getItem('dapathshala_parent_assigned_tests');
        if (savedTests) {
          const tests = JSON.parse(savedTests);
          if (Array.isArray(tests)) {
            const submitted = tests.filter((t: any) => t && (t.status === 'submitted' || t.submittedAt) && !t.isPublished);
            submitted.forEach((t: any) => {
              const testKey = t.id || t.examId || t.pin;
              const alreadyHas = notifs.some(n => n.examId === testKey || (t.pin && n.examId === t.pin) || (t.id && n.examId === t.id));
              if (!alreadyHas) {
                notifs.unshift({
                  id: 'notif_sub_' + testKey,
                  title: 'নতুন খাতা জমা পড়েছে!',
                  message: `${t.studentName || t.childName || 'সন্তান'} "${t.title || t.subject}" পরীক্ষার খাতা জমা দিয়েছে।`,
                  time: t.submittedAt || 'আজ, এইমাত্র',
                  read: false,
                  examId: testKey
                });
              }
            });
          }
        }

        if (notifs.length > 0) {
          setNotifications(notifs);
        }
      } catch {}
    };

    const handleNewNotif = (e: any) => {
      const notif = e.detail;
      if (notif) {
        playAudioChime();
        setNotifications(prev => [
          notif,
          ...prev.filter(n => n.id !== notif.id && n.examId !== notif.examId)
        ]);
      }
    };

    window.addEventListener('dapathshala_new_notification', handleNewNotif);
    window.addEventListener('storage', syncNotifs);
    window.addEventListener('focus', syncNotifs);

    const unsubscribe = subscribeToExamSubmissions((newSub: ExamSubmissionPayload) => {
      playAudioChime();
      const examKey = newSub.id || newSub.examId || (newSub as any).pin;
      const notifItem = {
        id: 'notif_' + Date.now(),
        title: 'নতুন খাতা জমা পড়েছে!',
        message: `${newSub.studentName || 'সন্তান'} "${newSub.title || newSub.subject}" পরীক্ষা সম্পন্ন করেছে ও খাতা জমা দিয়েছে।`,
        time: 'আজ, এইমাত্র',
        read: false,
        examId: examKey
      };
      setNotifications(prev => [
        notifItem,
        ...prev.filter(n => n.examId !== examKey && (!newSub.examId || n.examId !== newSub.examId))
      ]);
    });

    // Run sync on mount to catch any recent submissions
    syncNotifs();

    return () => {
      window.removeEventListener('dapathshala_new_notification', handleNewNotif);
      window.removeEventListener('storage', syncNotifs);
      window.removeEventListener('focus', syncNotifs);
      unsubscribe();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleSidebar = (forcedState?: boolean) => {
    if (typeof forcedState === 'boolean') {
      setOpenState(forcedState);
    } else {
      setOpenState(prev => !prev);
    }
    setClickPrompt(null);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      if (!openState) {
        setClickPrompt('আর ১ বার ক্লিক করুন');
      }
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
        setClickPrompt(null);
      }, 550);
    } else if (clickCountRef.current >= 2) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickCountRef.current = 0;
      toggleSidebar();
    }
  };

  const handleMenuDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickCountRef.current = 0;
    toggleSidebar();
  };

  const handleLogoClick = () => {
    if (onGoToLanding) {
      onGoToLanding();
    } else {
      setActiveTab('home');
    }
  };

  const isOwnerOrAdmin = user?.role === 'admin' || user?.email === 'websitetogather@gmail.com' || user?.email === 'admin@dapathshala.com' || localStorage.getItem('dapathshala_dev_mode') === 'true';

  const menuItems = [
    { id: 'home', label: 'হোম', icon: <Home size={20} />, category: 'Main' },
    { id: 'ai-gen', label: 'স্মার্ট কোয়েস্ট', icon: <Sparkles size={20} />, category: 'AI Tools' },
    { id: 'doubt-solver', label: 'ডাউট সলভার', icon: <HelpCircle size={20} />, category: 'AI Tools' },
    { id: 'ai-ocr', label: 'এআই ওসিআর', icon: <Camera size={20} />, category: 'AI Tools' },
    { id: 'video-quiz', label: 'ভিডিও কুইজ', icon: <Youtube size={20} />, category: 'AI Tools' },
    { id: 'smart-revision', label: 'স্মার্ট রিভিশন', icon: <BrainCircuit size={20} />, category: 'Learning' },
    { id: 'pdf-reader', label: 'পিডিএফ রিডার', icon: <FileText size={20} />, category: 'Learning' },
    { id: 'flashcards', label: 'ফ্ল্যাশকার্ড', icon: <Layers size={20} />, category: 'Learning' },
    { id: 'study-planner', label: 'স্টাডি প্ল্যানার', icon: <Calendar size={20} />, category: 'Learning' },
    { id: 'exams', label: 'পরীক্ষা পোর্টাল', icon: <FileText size={20} />, category: 'Learning' },
    { id: 'paid-tests', label: 'প্রিমিয়াম টেস্ট স্টোর', icon: <Sparkles size={20} className="text-amber-500" />, category: 'Learning' },
    { id: 'coaching-marketplace', label: 'কোচিং ফাইন্ডার ও ভর্তি', icon: <Building2 size={20} />, category: 'Learning' },
    { id: 'notes', label: 'নোট স্টোর', icon: <ShoppingBag size={20} />, category: 'Learning' },
    { id: 'community', label: 'পিয়ার ফোরাম ও চ্যালেঞ্জ', icon: <Swords size={20} />, category: 'Community' },
    { id: 'national-leaderboard', label: 'জাতীয় মেধা তালিকা', icon: <Crown size={20} className="text-amber-500" />, category: 'Community' },
    { id: 'leaderboard', label: 'লিডারবোর্ড', icon: <Trophy size={20} />, category: 'Community' },
    { id: 'achievements', label: 'অর্জনসমূহ', icon: <Award size={20} />, category: 'Community' },
  ];

  if (user?.role === 'parent' || user?.role === 'guardian' || isOwnerOrAdmin) {
    menuItems.push({ id: 'parent-dashboard', label: 'প্যারেন্ট ড্যাশবোর্ড', icon: <Shield size={20} />, category: 'Control' });
  }

  menuItems.push({ id: 'coaching', label: 'কোচিং ড্যাশবোর্ড ও লিডস', icon: <GraduationCap size={20} />, category: 'Control' });

  if (isOwnerOrAdmin) {
    menuItems.push({ id: 'developer', label: 'মালিক / অ্যাডমিন কনসোল', icon: <Crown size={20} className="text-amber-500" />, category: 'Control' });
  }

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-[100] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={handleMenuClick}
              onDoubleClick={handleMenuDoubleClick}
              title="সাইডবার আনহাইড করতে পরপর ২ বার ক্লিক করুন"
              className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                openState 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' 
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
              aria-label="Toggle Sidebar"
            >
              <Menu size={22} className="stroke-[2.5]" />
            </button>

            {/* Hint tooltip on 1st click */}
            <AnimatePresence>
              {clickPrompt && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  className="absolute left-0 top-full mt-2 z-[110] bg-slate-900 text-white text-xs font-semibold py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1.5 border border-slate-700 pointer-events-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {clickPrompt}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
            <span className="text-xl font-black tracking-tight text-slate-900">
              দা<span className="text-emerald-600">পাঠশালা</span>
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="সার্চ করুন..." 
              className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-700">{user?.points || 0} XP</span>
          </div>
          {/* Real-time Notification Bell & Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative cursor-pointer transition-colors"
              title="বিজ্ঞপ্তি ও সংকেত"
            >
              <Bell size={20} className={unreadCount > 0 ? 'text-indigo-600' : ''} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-600 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            <AnimatePresence>
              {isNotificationOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-[110]" 
                    onClick={() => setIsNotificationOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-[120] overflow-hidden flex flex-col max-h-[80vh]"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-indigo-600" />
                        <h4 className="font-black text-slate-900 text-sm">বিজ্ঞপ্তি ও পরীক্ষার সংকেত</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            সব পড়া হয়েছে
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={() => setNotifications([])}
                            className="text-[11px] font-bold text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            সব মুছুন
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notification List */}
                    <div className="overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 font-semibold">
                          কোনো নতুন বিজ্ঞপ্তি নেই
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              const targetExamId = item.examId || 'test-101';
                              try {
                                sessionStorage.setItem('dapathshala_pending_eval_id', targetExamId);
                              } catch {}
                              setActiveTab('parent-dashboard');
                              setIsNotificationOpen(false);
                              setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
                              setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('dapathshala_open_evaluation', {
                                  detail: { examId: targetExamId }
                                }));
                              }, 50);
                            }}
                            className={`p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                              item.read ? 'hover:bg-slate-50 opacity-80' : 'bg-indigo-50/60 hover:bg-indigo-50'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                              <FileCheck size={16} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="font-black text-xs text-slate-900 truncate">{item.title}</h5>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] text-slate-400 font-semibold">{item.time}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNotifications(prev => prev.filter(n => n.id !== item.id));
                                    }}
                                    className="p-1 hover:bg-slate-200 text-slate-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                                    title="বিজ্ঞপ্তিটি মুছুন"
                                  >
                                    <X size={13} />
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 leading-snug line-clamp-2">{item.message}</p>
                              <span className="inline-block text-[10px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                                খাতা মূল্যায়ন করতে ক্লিক করুন →
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer">
            <img src={user?.avatar || `https://picsum.photos/seed/${user?.id}/100`} alt="Profile" />
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside 
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-4 z-40 overflow-y-auto transition-transform duration-500 ease-in-out ${
          openState 
            ? 'translate-x-0 shadow-lg' 
            : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">মেনু নেভিগেশন</span>
          </div>
          <button
            onClick={() => toggleSidebar(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="সাইডবার লুকান"
            aria-label="সাইডবার লুকান"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="space-y-8 flex-1">
          {['Main', 'AI Tools', 'Learning', 'Community', 'Control'].map((category) => {
            const items = menuItems.filter(item => item.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category} className="space-y-2">
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{category}</h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        activeTab === item.id 
                          ? 'bg-emerald-50 text-emerald-600 shadow-sm font-bold' 
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className={activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-emerald-50 text-emerald-600 shadow-sm font-bold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings size={20} className={activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'} />
            সেটিংস
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut size={20} className="text-red-400" />
            লগআউট
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {openState && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => toggleSidebar(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] lg:hidden"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-[201] lg:hidden flex flex-col p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => { handleLogoClick(); toggleSidebar(false); }}>
                  <span className="text-xl font-black tracking-tight text-slate-900">
                    দা<span className="text-emerald-600">পাঠশালা</span>
                  </span>
                </div>
                <button onClick={() => toggleSidebar(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 cursor-pointer">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); toggleSidebar(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold transition-all cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t space-y-4">
                <button 
                  onClick={() => { setActiveTab('settings'); toggleSidebar(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold transition-all cursor-pointer ${
                    activeTab === 'settings' 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Settings size={24} />
                  সেটিংস
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut size={24} />
                  লগআউট
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
