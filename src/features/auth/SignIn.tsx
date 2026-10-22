import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Mail, Lock, X, ArrowRight, Eye, EyeOff, ShieldCheck, Smartphone } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface SignInProps {
  onSignIn: (email: string, password?: string) => void;
  onDevLogin: () => void;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSignIn, onDevLogin, onClose, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'login') {
      if (email && password) {
        setIsSubmitting(true);
        try {
          // Simulate role check for 2FA (In real app, this would be handled by backend)
          if (email.includes('admin') || email.includes('manager')) {
            setStep('2fa');
          } else {
            await onSignIn(email, password);
          }
        } finally {
          setIsSubmitting(false);
        }
      }
    } else {
      if (twoFactorCode.length === 6) {
        setIsSubmitting(true);
        try {
          await onSignIn(email, password);
        } finally {
          setIsSubmitting(false);
        }
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
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="relative overflow-hidden border border-white/20 shadow-2xl bg-white/80 backdrop-blur-xl">
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white/50 rounded-full transition-colors z-10"
            >
              <X size={18} />
            </button>

            <div className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              {step === 'login' ? (
                <motion.div
                  key="login-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-emerald-100/50 rounded-xl flex items-center justify-center text-emerald-600 mx-auto mb-2 backdrop-blur-sm border border-emerald-200/30">
                      <LogIn size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">সাইন ইন করুন</h2>
                    <p className="text-sm text-slate-500 mt-0.5">আপনার অ্যাকাউন্টে প্রবেশ করতে তথ্য দিন</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <button 
                      type="button"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white/50 hover:bg-white hover:border-emerald-500/50 transition-all group"
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="w-4 h-4" />
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">Google দিয়ে সাইন ইন</span>
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
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">ইমেইল ঠিকানা</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@mail.com"
                            className="w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">পাসওয়ার্ড</label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-slate-200 bg-white/50 pl-10 pr-10 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bot Protection Placeholder */}
                    <div className="p-2 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="captcha" 
                        checked={captchaVerified}
                        onChange={(e) => setCaptchaVerified(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" 
                      />
                      <label htmlFor="captcha" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                        আমি রোবট নই (Bot Protection)
                      </label>
                      <ShieldCheck className="ml-auto text-slate-300" size={16} />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-xs text-slate-600">মনে রাখুন</span>
                      </label>
                      <button type="button" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                        পাসওয়ার্ড ভুলে গেছেন?
                      </button>
                    </div>

                    <div className="pt-1 flex flex-col gap-3">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        disabled={!captchaVerified}
                        className={`w-full rounded-xl py-4 text-base shadow-lg ${captchaVerified ? 'shadow-emerald-200' : 'opacity-50 cursor-not-allowed'}`}
                        isLoading={isSubmitting}
                      >
                        সাইন ইন করুন
                        <ArrowRight className="ml-2" size={18} />
                      </Button>
                      <button 
                        type="button"
                        onClick={onSwitchToRegister}
                        className="text-xs font-medium text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        অ্যাকাউন্ট নেই? <span className="text-emerald-600 font-bold">রেজিস্ট্রেশন করুন</span>
                      </button>
                      
                      <div className="pt-2 border-t border-slate-100">
                        <button 
                          type="button"
                          onClick={onDevLogin}
                          className="w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                          <ShieldCheck size={12} />
                          DEV: QUICK LOGIN (TESTING)
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="2fa-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100/50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 backdrop-blur-sm border border-blue-200/30">
                      <Smartphone size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">টু-ফ্যাক্টর ভেরিফিকেশন</h2>
                    <p className="text-slate-500 mt-1">আপনার ফোনে পাঠানো ৬ ডিজিটের কোডটি দিন</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          className="w-full max-w-[200px] text-center text-3xl tracking-[0.5em] font-bold rounded-xl border border-slate-200 bg-white/50 py-4 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-slate-200"
                        />
                      </div>
                      <p className="text-center text-xs text-slate-500">
                        অ্যাডমিন মাস্টার কোড: <button type="button" onClick={() => setTwoFactorCode('123456')} className="text-blue-600 font-bold hover:underline">123456 (ক্লিক করে বসান)</button>
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col gap-4">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full rounded-2xl py-6 text-lg shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700"
                        isLoading={isSubmitting}
                        disabled={twoFactorCode.length !== 6}
                      >
                        ভেরিফাই করুন
                        <ShieldCheck className="ml-2" size={20} />
                      </Button>
                      <button 
                        type="button"
                        onClick={() => setStep('login')}
                        className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                      >
                        পিছনে ফিরে যান
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
      </div>
    </div>
  );
};
