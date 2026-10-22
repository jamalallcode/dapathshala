import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, User, Users, Layout, Globe, ShieldCheck, ArrowRight, X, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';

interface RegistrationProps {
  onRegister: (data: { name: string; email: string; role: UserRole; password?: string }) => void;
  onDevLogin: () => void;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

const generateStrongPassword = () => {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

export const Registration: React.FC<RegistrationProps> = ({ onRegister, onDevLogin, onClose, onSwitchToSignIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('general_student');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPassword(generateStrongPassword());
  }, []);

  const roles: { id: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      id: 'general_student', 
      label: 'সাধারণ শিক্ষার্থী (১ম - ১২শ শ্রেণী)', 
      icon: <GraduationCap size={20} />, 
      desc: 'স্কুল ও কলেজের নিয়মিত পাঠ্যক্রমের জন্য' 
    },
    { 
      id: 'madrasah_student', 
      label: 'মাদ্রাসা শিক্ষার্থী', 
      icon: <BookOpen size={20} />, 
      desc: 'মাদ্রাসার নিয়মিত পাঠ্যক্রমের জন্য' 
    },
    { 
      id: 'guardian', 
      label: 'অভিভাবক (Guardian)', 
      icon: <Users size={20} />, 
      desc: 'শিক্ষার্থীর পড়াশোনার প্রগ্রেস এবং রেজাল্ট ট্র্যাক করতে' 
    },
    { 
      id: 'coaching_manager', 
      label: 'কোচিং সেন্টার/পরিচালক', 
      icon: <Layout size={20} />, 
      desc: 'ভর্তি, ব্যাচ ম্যানেজমেন্ট এবং নোটিশ বোর্ড পরিচালনা করতে' 
    },
    { 
      id: 'university_candidate', 
      label: 'বিশ্ববিদ্যালয় পরীক্ষার্থী', 
      icon: <Globe size={20} />, 
      desc: 'এডমিশন টেস্ট এবং প্রশ্নব্যাংক নিয়ে কাজ করতে' 
    },
    { 
      id: 'departmental_examinee', 
      label: 'বিভাগীয় পরীক্ষার্থী', 
      icon: <ShieldCheck size={20} />, 
      desc: 'প্রফেশনাল বা বিভাগীয় পরীক্ষার প্রস্তুতির জন্য' 
    },
    {
      id: 'parent',
      label: 'অভিভাবক (Parent)',
      icon: <Users size={20} />,
      desc: 'সন্তানের পরীক্ষা সেট ও মনিটর করতে'
    },
    {
      id: 'child',
      label: 'সন্তান (Child)',
      icon: <GraduationCap size={20} />,
      desc: 'বাবার দেওয়া পরীক্ষা দিতে ও শিখতে'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ ডিজিটের হতে হবে');
      return;
    }

    if (name && email && role) {
      setIsSubmitting(true);
      try {
        await onRegister({ name, email, role, password });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative overflow-hidden border border-white/20 shadow-2xl bg-white/80 backdrop-blur-xl max-h-[95vh] flex flex-col">
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-full transition-colors backdrop-blur-sm"
            >
              <X size={18} />
            </button>

            <div className="overflow-y-auto p-4 sm:p-5 custom-scrollbar">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">নতুন অ্যাকাউন্ট তৈরি করুন</h2>
              <p className="text-xs text-slate-500 mt-0.5">আপনার সঠিক রোল নির্বাচন করে রেজিস্ট্রেশন সম্পন্ন করুন</p>
            </div>

            <div className="space-y-3 mb-4">
              <button 
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white/50 hover:bg-white hover:border-emerald-500/50 transition-all group"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">Google দিয়ে রেজিস্ট্রেশন</span>
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-slate-400">অথবা ইমেইল দিয়ে</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="উদা: জামাল উদ্দিন"
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">পাসওয়ার্ড (মিনিমাম ৬ ডিজিট)</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-2 pr-10 text-sm text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
              </div>

              {/* Bot Protection Placeholder */}
              <div className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="captcha-reg" 
                  required
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                />
                <label htmlFor="captcha-reg" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                  আমি রোবট নই (Bot Protection)
                </label>
                <ShieldCheck className="ml-auto text-slate-300" size={16} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700">আপনার রোল নির্বাচন করুন</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <label
                      key={r.id}
                      className={`relative flex items-center gap-2 p-2 rounded-xl border-2 cursor-pointer transition-all ${
                        role === r.id 
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/10' 
                          : 'border-slate-100 bg-white/40 hover:border-slate-200 hover:bg-white/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        className="sr-only"
                        checked={role === r.id}
                        onChange={() => setRole(r.id)}
                      />
                      <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                        role === r.id ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border border-slate-200'
                      }`}>
                        {React.cloneElement(r.icon as React.ReactElement, { size: 16 })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-xs truncate ${role === r.id ? 'text-emerald-900' : 'text-slate-900'}`}>{r.label}</p>
                        <p className="text-[9px] text-slate-500 line-clamp-1 leading-tight">{r.desc}</p>
                      </div>
                      {role === r.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                          <ShieldCheck size={12} />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:flex-1 rounded-xl py-4 text-base shadow-lg shadow-emerald-200"
                  isLoading={isSubmitting}
                >
                  রেজিস্ট্রেশন করুন
                  <ArrowRight className="ml-2" size={18} />
                </Button>
                <button 
                  type="button"
                  onClick={onSwitchToSignIn}
                  className="text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  ইতিমধ্যেই অ্যাকাউন্ট আছে? <span className="text-emerald-600 font-bold">সাইন ইন করুন</span>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={onDevLogin}
                  className="w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={12} />
                  DEV: QUICK LOGIN (TESTING)
                </button>
              </div>
            </form>
          </div>
        </Card>
      </motion.div>
      </div>
    </div>
  );
};
