import React, { useState } from 'react';
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
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';

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
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative">
            <Bell size={20} />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
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
