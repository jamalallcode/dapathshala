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
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  onGoToLanding?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, user, onLogout, onGoToLanding }) => {
  const [isOpen, setIsOpen] = useState(false);

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
    { id: 'notes', label: 'নোট স্টোর', icon: <ShoppingBag size={20} />, category: 'Learning' },
    { id: 'leaderboard', label: 'লিডারবোর্ড', icon: <Trophy size={20} />, category: 'Community' },
    { id: 'achievements', label: 'অর্জনসমূহ', icon: <Award size={20} />, category: 'Community' },
  ];

  if (user?.role === 'parent' || user?.role === 'guardian' || isOwnerOrAdmin) {
    menuItems.push({ id: 'parent-dashboard', label: 'প্যারেন্ট ড্যাশবোর্ড', icon: <Shield size={20} />, category: 'Control' });
  }

  if (isOwnerOrAdmin || user?.role === 'coaching_manager') {
    menuItems.push({ id: 'coaching', label: 'কোচিং ব্যবস্থাপনা', icon: <Layout size={20} />, category: 'Control' });
  }

  if (isOwnerOrAdmin) {
    menuItems.push({ id: 'developer', label: 'মালিক / অ্যাডমিন কনসোল', icon: <Crown size={20} className="text-amber-500" />, category: 'Control' });
  }

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-[100] px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-xl lg:hidden text-slate-600"
          >
            <Menu size={24} />
          </button>
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
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col p-4 z-50 overflow-y-auto">
        <div className="space-y-8">
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
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeTab === item.id 
                          ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
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
        <div className="mt-auto pt-8 space-y-2">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'settings' 
                ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings size={20} className={activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'} />
            সেটিংস
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} className="text-red-400" />
            লগআউট
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] lg:hidden"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-[201] lg:hidden flex flex-col p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => { handleLogoClick(); setIsOpen(false); }}>
                  <span className="text-xl font-black tracking-tight text-slate-900">
                    দা<span className="text-emerald-600">পাঠশালা</span>
                  </span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-6">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold transition-all ${
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
                  onClick={() => { setActiveTab('settings'); setIsOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold transition-all ${
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
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-bold text-red-500 hover:bg-red-50 transition-all"
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
