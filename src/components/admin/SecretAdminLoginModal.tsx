import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  X, 
  Sparkles,
  KeyRound,
  AlertCircle
} from 'lucide-react';

interface SecretAdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SecretAdminLoginModal: React.FC<SecretAdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [gmailId, setGmailId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanId = gmailId.trim().toLowerCase();
    const cleanPass = password.trim();

    // Verification check:
    // User requested ID: jamaluddinkh3424 (or jamaluddinkh3424@gmail.com)
    // User requested Password: 80093424JAma@
    const isIdValid = cleanId === 'jamaluddinkh3424' || cleanId === 'jamaluddinkh3424@gmail.com';
    const isPassValid = cleanPass === '80093424JAma@';

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (isIdValid && isPassValid) {
        // Store Admin Authentication Session
        localStorage.setItem('dapathshala_is_admin', 'true');
        localStorage.setItem('dapathshala_admin_session', JSON.stringify({
          id: 'admin_jamal',
          username: 'jamaluddinkh3424',
          email: 'jamaluddinkh3424@gmail.com',
          name: 'জামাল উদ্দিন (অ্যাডমিন)',
          role: 'admin',
          authenticatedAt: new Date().toISOString()
        }));

        // Dispatch system event
        window.dispatchEvent(new CustomEvent('dapathshala_admin_logged_in'));

        onSuccess();
        onClose();
      } else {
        setError('ভুল জিমেইল আইডি অথবা পাসওয়ার্ড! অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[11px] font-black border border-purple-400/30 mb-0.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>গোপন অ্যাডমিন প্রবেশদ্বার</span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-white">
                  অ্যাডমিন লগইন
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-purple-200/80 font-medium mt-2">
            ডাটাবেজ ও প্রশ্নপত্র পরিচালনা করতে আপনার অনুমোদিত জিমেইল আইডি ও পাসওয়ার্ড দিন।
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Gmail ID Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purple-700" />
              <span>জিমেইল আইডি (Gmail ID)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={gmailId}
                onChange={(e) => {
                  setGmailId(e.target.value);
                  if (error) setError('');
                }}
                placeholder="jamaluddinkh3424"
                className="w-full pl-3.5 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500 transition-all"
                autoFocus
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              আইডি বা জিমেইল ঠিকানা লিখুন
            </p>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-700" />
              <span>পাসওয়ার্ড (Password)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="গোপন পাসওয়ার্ড লিখুন"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-200 transition-all active:scale-[0.98] cursor-pointer mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>যাচাই করা হচ্ছে...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>এডমিন হিসেবে প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-400 font-medium pt-1">
            শুধুমাত্র অনুমোদিত অ্যাডমিনের ব্যবহারের জন্য সংরক্ষিত
          </p>

        </form>

      </div>
    </div>
  );
};
