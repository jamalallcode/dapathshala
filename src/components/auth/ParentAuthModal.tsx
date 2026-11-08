import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { loginParent, registerParent, ParentUser, normalizePhone } from '../../lib/parentAuth';

interface ParentAuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (user: ParentUser) => void;
  promptMessage?: string;
}

export const ParentAuthModal: React.FC<ParentAuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
  promptMessage
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setPassword('');
      setLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const result = await registerParent(phone, password);
        if (!result.success || !result.user) {
          setError(result.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে');
          setLoading(false);
          return;
        }
        onSuccess(result.user);
        onClose();
      } else {
        const result = await loginParent(phone, password);
        if (!result.success || !result.user) {
          setError(result.error || 'লগইন ব্যর্থ হয়েছে');
          setLoading(false);
          return;
        }
        onSuccess(result.user);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'একটি অপ্রত্যাশিত সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Click outside backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Gradient Header Bar */}
        <div className="h-2 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Header Title & Subtitle */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs border border-blue-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              {mode === 'login' ? 'অভিভাবক লগইন' : 'অভিভাবক অ্যাকাউন্ট তৈরি'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {promptMessage || (mode === 'login' 
                ? 'আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে সহজে প্রবেশ করুন' 
                : 'শুধু মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে নিমেষেই রেজিস্টার করুন')}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              লগইন
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              নতুন রেজিস্টার
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mobile Number Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                মোবাইল নম্বর <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1.5 text-slate-400 pointer-events-none">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-500">🇧🇩 +৮৮</span>
                  <span className="text-slate-300">|</span>
                </div>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="017XXXXXXXX"
                  className="w-full pl-24 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-bold outline-hidden text-slate-900 tracking-wide transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                বাংলা বা ইংরেজি যেকোনো সংখ্যায় মোবাইল নম্বর লিখুন
              </p>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                পাসওয়ার্ড <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={mode === 'register' ? 'কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড দিন' : 'আপনার পাসওয়ার্ড লিখুন'}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm font-semibold outline-hidden text-slate-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  aria-label="পাসওয়ার্ড দেখুন"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-200/80 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'অভিভাবক পোর্টালে প্রবেশ করুন' : 'অ্যাকাউন্ট তৈরি ও প্রবেশ করুন'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Security Guarantee Note */}
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-[11px] text-blue-900 font-medium leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>১০০% গোপনীয়তা সুরক্ষিত:</strong> আপনার তৈরি করা প্রশ্নপত্র ও সন্তানের জমা দেওয়া উত্তরপত্র কেবল আপনার এই মোবাইল অ্যাকাউন্টের অধীনে সুরক্ষিত থাকবে। অন্য কোনো অভিভাবক তা দেখতে পারবেন না।
            </span>
          </div>

          {/* Bottom Switch Link */}
          <div className="text-center pt-1 border-t border-slate-100">
            {mode === 'login' ? (
              <p className="text-xs text-slate-600 font-medium">
                নতুন অভিভাবক?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-blue-700 hover:text-blue-800 font-bold underline cursor-pointer"
                >
                  বিনামূল্যে রেজিস্টার করুন
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600 font-medium">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-blue-700 hover:text-blue-800 font-bold underline cursor-pointer"
                >
                  সরাসরি লগইন করুন
                </button>
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
