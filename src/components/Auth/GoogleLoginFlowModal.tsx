import React, { useState } from 'react';
import { 
  X, 
  Check, 
  User, 
  GraduationCap, 
  AlertTriangle, 
  ChevronDown, 
  Loader2,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface GoogleLoginFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: any) => void;
}

export const GoogleLoginFlowModal: React.FC<GoogleLoginFlowModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  // Step tracker:
  // 1 = Initial Login Card ("কোনো রেজিস্ট্রেশনের প্রয়োজন নেই...")
  // 2 = Google Account Selection Modal ("Sign in to DaPathshala.com")
  // 3 = Account Type Select ("একাউন্ট টাইপ সিলেক্ট করুন")
  // 4 = Redirecting state with "Success. Please wait!"
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form selections
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // User Profile
  const userProfile = {
    name: 'Jamal Uddin',
    email: 'commercialauditkhulna@gmail.com',
    avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
  };

  if (!isOpen) return null;

  const handleGoogleClick = () => {
    setStep(2);
  };

  const handleGoogleContinue = () => {
    setStep(3);
  };

  const handleSubmitRole = () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    setShowSuccessToast(true);
    setStep(4);

    setTimeout(() => {
      const authUser = {
        ...userProfile,
        role: selectedRole,
        loginAt: new Date().toISOString()
      };
      try {
        localStorage.setItem('ep_user', JSON.stringify(authUser));
      } catch (e) {
        // ignore
      }
      setIsSubmitting(false);
      onLoginSuccess(authUser);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto font-['Hind_Siliguri']">
      
      {/* =========================================================================
          STEP 2: GOOGLE OAUTH POPUP SIMULATION (Image 2 from user)
          ========================================================================= */}
      {step === 2 && (
        <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
          
          {/* Fake Browser URL bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center gap-2 text-[11px] text-slate-500 font-mono select-none">
            <Lock size={11} className="text-emerald-600" />
            <span className="truncate">accounts.google.com/signin/oauth/id?authuser=0&part=AJi8hANOv0EIQXa...</span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header: Sign in to DaPathshala.com */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                Sign in to DaPathshala.com
              </h2>
            </div>

            {/* Account Selector Pill */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50/80 text-xs font-medium text-slate-800 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                J
              </div>
              <span className="font-sans text-xs">{userProfile.email}</span>
              <ChevronDown size={14} className="text-slate-500" />
            </div>

            {/* Permissions text */}
            <div className="text-base text-slate-800 font-normal">
              Google will allow <span className="font-bold text-blue-700">DaPathshala.com</span> to access this info about you
            </div>

            {/* Info list */}
            <div className="space-y-2.5 pt-1">
              {/* Name */}
              <div 
                onClick={handleGoogleContinue}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 active:bg-blue-100/60 cursor-pointer transition-all group select-none"
                title="সিলেক্ট করে এগিয়ে যেতে ক্লিক করুন"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200 group-hover:border-blue-300 transition-colors">
                    <User size={14} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700 font-sans transition-colors">{userProfile.name}</div>
                    <div className="text-xs text-slate-500 font-sans">Name and profile picture</div>
                  </div>
                </div>
                <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                  সিলেক্ট করুন →
                </span>
              </div>

              {/* Email (Clickable Email Row) */}
              <div 
                onClick={handleGoogleContinue}
                className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/70 active:bg-blue-100/80 shadow-2xs hover:shadow-xs cursor-pointer transition-all group select-none relative"
                title="এই ইমেইল সিলেক্ট করে এগিয়ে যেতে ক্লিক করুন"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-700 group-hover:text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-300 group-hover:border-blue-400 transition-colors">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 font-sans truncate transition-colors">{userProfile.email}</div>
                    <div className="text-xs text-slate-500 font-sans flex items-center gap-2">
                      <span>Email address</span>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        ক্লিক করুন
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Privacy Text */}
            <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100 font-sans leading-relaxed">
              <p>
                Review DaPathshala.com's <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span> and <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span> to understand how DaPathshala.com will process and protect your data.
              </p>
              <p>
                To make changes at any time, go to your <span className="text-blue-600 hover:underline cursor-pointer">Google Account</span>.
              </p>
              <p>
                Learn more about <span className="text-blue-600 hover:underline cursor-pointer">Sign in with Google</span>.
              </p>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 px-5 rounded-full border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGoogleContinue}
                className="flex-1 py-2.5 px-5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
              >
                Continue
              </button>
            </div>

            {/* Google Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
              <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                <span>English (United States)</span>
                <ChevronDown size={11} />
              </div>
              <div className="flex items-center gap-3">
                <span className="hover:text-slate-700 cursor-pointer">Help</span>
                <span className="hover:text-slate-700 cursor-pointer">Privacy</span>
                <span className="hover:text-slate-700 cursor-pointer">Terms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 1: LOGIN CARD (Image 1 from user)
          ========================================================================= */}
      {step === 1 && (
        <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
          
          {/* Card Top Pill Header */}
          <div className="p-6 sm:p-7 text-center space-y-4">
            
            {/* 'লগইন' pill tag matching screenshot */}
            <div className="inline-block bg-slate-100 text-slate-800 text-sm font-bold px-6 py-1.5 rounded-lg border border-slate-200">
              লগইন
            </div>

            {/* Title: কোনো রেজিস্ট্রেশনের প্রয়োজন নেই। */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0c1e33] leading-snug">
                কোনো রেজিস্ট্রেশনের প্রয়োজন নেই।
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                নিচের Google বাটনে ক্লিক করে সরাসরি লগইন করুন
              </p>
            </div>

            {/* Dashed border container matching screenshot */}
            <div className="pt-2">
              <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50">
                
                {/* Sign in with Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="w-full max-w-xs py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center gap-2.5 transition group"
                >
                  {/* Google 4-Color G Logo SVG */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span className="font-sans font-medium text-slate-700">Sign in with Google</span>
                </button>

              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 transition"
              >
                ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3 & 4: ACCOUNT TYPE SELECTION & SUCCESS TOAST (Image 3, 4, 5)
          ========================================================================= */}
      {(step === 3 || step === 4) && (
        <div className="relative w-full max-w-[430px] my-auto">
          
          {/* Top Success Banner / Toast matching Image 5 */}
          {showSuccessToast && (
            <div className="mb-3 bg-[#16a34a] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                <CheckCircle2 size={16} />
                <span>Success. Please wait!</span>
              </div>
              <button 
                onClick={() => setShowSuccessToast(false)}
                className="text-white/80 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 sm:p-7 space-y-4">
            
            {/* Redirecting subtext matching Image 5 */}
            {step === 4 && (
              <div className="text-center text-xs font-bold text-[#16a34a] animate-pulse">
                Success. Redirecting...
              </div>
            )}

            {/* Title: একাউন্ট টাইপ সিলেক্ট করুন */}
            <h3 className="text-center font-bold text-base sm:text-lg text-slate-900">
              একাউন্ট টাইপ সিলেক্ট করুন
            </h3>

            {/* Radio Options */}
            <div className="space-y-3 pt-1">
              {/* Option 1: শিক্ষক */}
              <div
                onClick={() => {
                  if (step !== 4) setSelectedRole('teacher');
                }}
                className={`p-3.5 sm:p-4 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  selectedRole === 'teacher'
                    ? 'border-[#16a34a] bg-emerald-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                {/* Radio Indicator */}
                {selectedRole === 'teacher' ? (
                  <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                )}

                <div className="flex items-center gap-2.5 font-bold text-base text-slate-900">
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center">
                    <User size={15} />
                  </div>
                  <span>শিক্ষক</span>
                </div>
              </div>

              {/* Option 2: শিক্ষার্থী */}
              <div
                onClick={() => {
                  if (step !== 4) setSelectedRole('student');
                }}
                className={`p-3.5 sm:p-4 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  selectedRole === 'student'
                    ? 'border-[#16a34a] bg-emerald-50/40 text-slate-900 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                {/* Radio Indicator */}
                {selectedRole === 'student' ? (
                  <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0" />
                )}

                <div className="flex items-center gap-2.5 font-bold text-base text-slate-900">
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center">
                    <GraduationCap size={15} />
                  </div>
                  <span>শিক্ষার্থী</span>
                </div>
              </div>
            </div>

            {/* Conditional Content when শিক্ষক is selected (Image 4 & 5) */}
            {selectedRole === 'teacher' && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                {/* Warning notice box */}
                <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                  <span className="text-red-600 font-bold">Warning:</span>{' '}
                  সঠিক একাউন্ট টাইপ সিলেক্ট করুন, পরবর্তীতে পরিবর্তন করতে চাইলে হেল্প লাইনে যোগাযোগ করতে হবে। তাই নিশ্চিত হয়ে সিলেক্ট করুন। ধন্যবাদ ।
                </div>

                {/* Features box */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1.5">
                  <div className="text-xs font-bold text-slate-900">
                    শিক্ষক একাউন্ট এর ফিচারসমূহ
                  </div>
                  <div className="text-xs text-slate-700 font-medium">১ ক্লিকে প্রশ্ন তৈরী</div>
                  <div className="text-xs text-slate-700 font-medium">অনলাইন পরীক্ষা তৈরী</div>
                  <div className="text-xs text-slate-700 font-medium">OMR Evaluator</div>
                </div>
              </div>
            )}

            {/* Conditional Content when শিক্ষার্থী is selected */}
            {selectedRole === 'student' && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1 text-xs text-slate-700 font-medium animate-in fade-in duration-200">
                <div className="font-bold text-slate-900">শিক্ষার্থী একাউন্ট এর ফিচারসমূহ</div>
                <div>অনলাইন পরীক্ষায় অংশগ্রহণ</div>
                <div>মডেল টেস্ট ও অনুশীলন প্রশ্নব্যাংক</div>
                <div>স্বয়ংক্রিয় প্রগ্রেস ট্র্যাকিং</div>
              </div>
            )}

            {/* সাবমিট Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmitRole}
                disabled={!selectedRole || isSubmitting}
                className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                  selectedRole
                    ? 'bg-[#16a34a] hover:bg-[#15803d] text-white shadow-md shadow-[#16a34a]/20 cursor-pointer active:scale-[0.99]'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>সাবমিট</span>
                  </>
                ) : (
                  <span>সাবমিট</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
