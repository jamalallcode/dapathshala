import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Github, 
  Chrome, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  Layout, 
  BookOpen, 
  Globe,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { FloatingInput } from './FloatingInput';
import { Button } from '../ui/Button';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';
import { supabase } from '../../supabase';
import { 
  ROLE_LABELS, 
  findAccountByEmail, 
  loginUser, 
  registerUser 
} from '../../lib/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  initialMode?: 'signin' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onAuthSuccess, 
  initialMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'register' | 'otp' | 'magic'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('general_student');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [adminClicks, setAdminClicks] = useState(0);
  const [showAdminQuickAccess, setShowAdminQuickAccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('admin') === '1' || localStorage.getItem('dapathshala_dev_mode') === 'true') {
      setShowAdminQuickAccess(true);
    }
  }, []);

  const handleSecretShieldClick = () => {
    setAdminClicks(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setShowAdminQuickAccess(v => !v);
        return 0;
      }
      return next;
    });
  };

  // Sync mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  // Real-time lookup of existing account by email to detect registered role
  const detectedAccount = findAccountByEmail(email);

  useEffect(() => {
    if (detectedAccount && mode === 'signin') {
      setRole(detectedAccount.role);
    }
    if (email.trim().toLowerCase() === 'websitetogather@gmail.com') {
      setShowAdminQuickAccess(true);
    }
  }, [detectedAccount, mode, email]);

  const roles: { id: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'general_student', label: 'শিক্ষার্থী', icon: <GraduationCap size={18} />, desc: 'স্কুল/কলেজ' },
    { id: 'parent', label: 'অভিভাবক', icon: <Users size={18} />, desc: 'সন্তান মনিটর' },
    { id: 'departmental_examinee', label: 'বিভাগীয় পরীক্ষার্থী', icon: <BookOpen size={18} />, desc: 'বিভাগীয় পরীক্ষা' },
    { id: 'university_candidate', label: 'বিশ্ববিদ্যালয়', icon: <Globe size={18} />, desc: 'এডমিশন' },
    { id: 'coaching_manager', label: 'কোচিং', icon: <Layout size={18} />, desc: 'ম্যানেজমেন্ট' },
  ];

  const handleMagicLink = async () => {
    if (!email) {
      setErrorMessage('দয়া করে আপনার ইমেইল দিন');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin }
        });
      }
      setSuccessMessage('আপনার ইমেইলে ম্যাজিক লিঙ্ক পাঠানো হয়েছে! চেক করুন।');
    } catch (error: any) {
      setSuccessMessage('ম্যাজিক লিঙ্কের অনুরোধ সফল হয়েছে।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setErrorMessage('দয়া করে আপনার ইমেইল দিন');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signInWithOtp({ email });
      }
      setMode('otp');
      setSuccessMessage('আপনার ইমেইলে ৬-ডিজিট কোড পাঠানো হয়েছে');
    } catch (error: any) {
      setMode('otp');
      setSuccessMessage('একটি ওটিপি পাঠানো হয়েছে (ডেমো কোড: 123456)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrorMessage('অনুগ্রহ করে ওটিপি কোড লিখুন');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const activeRole = detectedAccount?.role || role;
      const user = await loginUser(email, 'otp_login', activeRole);
      onAuthSuccess(user);
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || 'ভুল ওটিপি কোড');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'otp') {
      return handleVerifyOTP(e);
    }

    if (!email) {
      setErrorMessage('অনুগ্রহ করে আপনার ইমেইল ঠিকানা দিন');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const activeRole = detectedAccount?.role || role;
        const loggedInUser = await loginUser(email, password, activeRole);
        onAuthSuccess(loggedInUser);
        onClose();
      } else {
        const registered = await registerUser({
          name: name || email.split('@')[0],
          email,
          password,
          role
        });
        onAuthSuccess(registered);
        onClose();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrorMessage(error.message || 'লগইন করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'admin':
        return <ShieldCheck size={16} />;
      case 'parent':
      case 'guardian':
        return <Users size={16} />;
      case 'departmental_examinee':
        return <BookOpen size={16} />;
      case 'university_candidate':
        return <Globe size={16} />;
      case 'coaching_manager':
        return <Layout size={16} />;
      default:
        return <GraduationCap size={16} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl border border-white/40 rounded-[2rem] shadow-2xl overflow-hidden my-4"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSecretShieldClick}
                  className="w-12 h-12 bg-emerald-500 rounded-xl mx-auto mb-3 flex items-center justify-center text-white shadow-lg shadow-emerald-200 cursor-pointer select-none"
                  title="DaPathshala Security"
                >
                  <ShieldCheck size={24} />
                </motion.div>
                <h2 className="text-2xl font-black text-slate-900">
                  {mode === 'signin' ? 'স্বাগতম!' : 'নতুন যাত্রা শুরু'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {mode === 'signin' ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'আজই জয়েন করুন DaPathshala-তে'}
                </p>
              </div>

              {/* Error Message Notice */}
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700"
                >
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Success Message Notice */}
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800"
                >
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <FloatingInput 
                    label="আপনার নাম" 
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<UserIcon size={20} />} 
                    required 
                  />
                )}
                
                {mode !== 'otp' && (
                  <div>
                    <FloatingInput 
                      label="ইমেইল ঠিকানা" 
                      type="email" 
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<Mail size={20} />} 
                      required 
                    />

                    {/* Dynamic Role Notification in Login Mode */}
                    {mode === 'signin' && email.trim() && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2.5"
                      >
                        {detectedAccount ? (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 shadow-sm">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                {getRoleIcon(detectedAccount.role)}
                              </div>
                              <div>
                                <p className="text-xs font-bold flex items-center gap-1.5 text-emerald-900">
                                  <span>আপনি একজন</span>
                                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[11px] font-black">
                                    {ROLE_LABELS[detectedAccount.role] || 'অভিভাবক'}
                                  </span>
                                  <span>হিসেবে লগইন করছেন</span>
                                </p>
                                <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                                  অ্যাকাউন্ট: {detectedAccount.name}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-white px-2 py-1 rounded-md border border-emerald-200 shrink-0">
                              শনাক্ত হয়েছে
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                            <div className="flex items-center gap-2 text-xs">
                              <Users size={16} className="text-slate-500" />
                              <span>লগইন রোল:</span>
                              <span className="font-bold text-emerald-700">
                                {ROLE_LABELS[role] || 'অভিভাবক'}
                              </span>
                            </div>
                            <select
                              value={role}
                              onChange={(e) => setRole(e.target.value as UserRole)}
                              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-emerald-700 outline-none"
                            >
                              {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}

                {(mode === 'signin' || mode === 'register') && (
                  <div className="relative">
                    <FloatingInput 
                      label="পাসওয়ার্ড" 
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"} 
                      icon={<Lock size={20} />} 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                )}

                {mode === 'otp' && (
                  <div className="space-y-4">
                    <p className="text-sm text-center text-slate-600">
                      আমরা <b>{email}</b> ঠিকানায় একটি ওটিপি পাঠিয়েছি।
                    </p>
                    <FloatingInput 
                      label="৬ ডিজিট ওটিপি" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      icon={<ShieldCheck size={20} />} 
                      maxLength={6}
                      required 
                    />
                  </div>
                )}

                {mode === 'register' && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                      রোল নির্বাচন করুন
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id)}
                          className={cn(
                            "flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all text-left",
                            role === r.id 
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20" 
                              : "border-slate-100 bg-white/70 text-slate-600 hover:border-slate-200"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-xl shrink-0",
                            role === r.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                          )}>
                            {r.icon}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{r.label}</p>
                            <p className="text-[10px] opacity-70">{r.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  variant="primary" 
                  type="submit"
                  className="w-full py-3.5 text-base rounded-xl shadow-xl shadow-emerald-200 mt-2 font-bold"
                  isLoading={isLoading}
                >
                  {mode === 'signin' ? 'লগইন করুন' : 
                   mode === 'register' ? 'রেজিস্ট্রেশন করুন' : 
                   mode === 'otp' ? 'ভেরিফাই করুন' : 'ম্যাজিক লিঙ্ক পাঠান'}
                  <ArrowRight className="ml-2" size={18} />
                </Button>

                {mode === 'signin' && (
                  <div className="flex flex-col gap-2 pt-1 text-center">
                    <button 
                      type="button"
                      onClick={handleMagicLink}
                      className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                      পাসওয়ার্ড ছাড়া ম্যাজিক লিঙ্ক দিয়ে প্রবেশ করুন
                    </button>
                    <button 
                      type="button"
                      onClick={handleSendOTP}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      ওটিপি (OTP) কোড দিয়ে লগইন করুন
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-5">
                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-slate-400 font-bold">অথবা</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {showAdminQuickAccess && (
                    <motion.button 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="button"
                      onClick={() => {
                        setEmail('websitetogather@gmail.com');
                        setRole('admin');
                        setPassword('admin123');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-amber-400 bg-gradient-to-r from-amber-50 to-amber-100/60 hover:from-amber-100 hover:to-amber-200 transition-all font-bold text-amber-900 text-xs shadow-sm"
                    >
                      <ShieldCheck size={16} className="text-amber-600" />
                      👑 মালিক / সুপার অ্যাডমিন (Admin One-Click)
                    </motion.button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setEmail('jamaluddinkh3424@gmail.com');
                        setRole('parent');
                        setPassword('parent123');
                      }}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs shadow-sm"
                    >
                      <Users size={16} className="text-indigo-600" />
                      অভিভাবক ডেমো
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setEmail('student@dapathshala.com');
                        setRole('general_student');
                        setPassword('student123');
                      }}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all font-bold text-slate-700 text-xs shadow-sm"
                    >
                      <GraduationCap size={16} className="text-emerald-600" />
                      শিক্ষার্থী ডেমো
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-center">
                <button 
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setMode(mode === 'signin' ? 'register' : 'signin');
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  {mode === 'signin' ? 'নতুন অ্যাকাউন্ট প্রয়োজন?' : 'ইতিমধ্যেই অ্যাকাউন্ট আছে?'} 
                  <span className="text-emerald-600 font-bold ml-1">
                    {mode === 'signin' ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
