import React, { useState } from 'react';
import { 
  X, 
  Check, 
  User, 
  GraduationCap, 
  ChevronDown, 
  Loader2,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { PremiumBackButton } from '../Common/PremiumBackButton';

interface LoginPageViewProps {
  onLoginComplete: (user: any) => void;
  onBackToLanding?: () => void;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  onLoginComplete,
  onBackToLanding
}) => {
  // Step tracker:
  // 1 = Initial Login Card (Image 1: "কোনো রেজিস্ট্রেশনের প্রয়োজন নেই...")
  // 2 = Google Account Selection Modal (Image 2: "Sign in to DaPathshala.com")
  // 3 = Account Type Select - Unselected (Image 3: "একাউন্ট টাইপ সিলেক্ট করুন")
  // 4 = Role Selected (Image 4: শিক্ষক selected with Warning & Features box)
  // 5 = Success Redirecting (Image 5: "Success. Please wait!" toast & spinner)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Selections
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Profile matching screenshot (made interactive state)
  const [googleAccount, setGoogleAccount] = useState({
    name: 'Jamal Uddin',
    email: 'commercialauditkhulna@gmail.com'
  });
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSelectingAccount, setIsSelectingAccount] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [newNameInput, setNewNameInput] = useState('');

  const handleSelectAccountAndContinue = () => {
    setIsSelectingAccount(true);
    setTimeout(() => {
      setIsSelectingAccount(false);
      setCurrentStep(3);
    }, 200);
  };

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setSelectedRole(role);
    setCurrentStep(4);
  };

  const handleSubmit = () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    setShowSuccessToast(true);
    setCurrentStep(5);

    setTimeout(() => {
      const userData = {
        name: googleAccount.name,
        email: googleAccount.email,
        role: selectedRole,
        institutionRegistered: false,
        loginTime: new Date().toISOString()
      };
      try {
        localStorage.setItem('ep_user', JSON.stringify(userData));
      } catch (e) {
        // ignore
      }
      setIsSubmitting(false);
      onLoginComplete(userData);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#f1f5f9] text-slate-800 font-['Hind_Siliguri'] flex flex-col justify-between select-none">
      
      {/* =========================================================================
          TOP HEADER BAR (Matches Image 1 from User)
          Left: DaPathshala logo
          Right: Login -> button
          ========================================================================= */}
      <header className="h-16 sm:h-20 glass-navbar border-b border-slate-200/70 px-6 sm:px-12 flex items-center justify-between shadow-xs sticky top-0 z-40 transition-all">
        {/* Left Logo */}
        <div 
          onClick={onBackToLanding}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            DaPathshala
          </span>
        </div>

        {/* Right Button */}
        <div className="flex items-center gap-3">
          {onBackToLanding && (
            <PremiumBackButton
              onClick={onBackToLanding}
              label="ল্যান্ডিং পেজে ফিরে যান"
              variant="pill"
            />
          )}
          <button 
            onClick={() => setCurrentStep(1)}
            className="px-4 py-2 sm:px-5 sm:py-2 rounded-lg bg-[#0c1e33] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <span>Login</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative">

        {/* =======================================================================
            STEP 1: LOGIN CARD (Matches Image 1 Exactly)
            "লগইন" pill
            "কোনো রেজিস্ট্রেশনের প্রয়োজন নেই।"
            "নিচের Google বাটনে ক্লিক করে সরাসরি লগইন করুন"
            [ Sign in with Google ] inside dashed box
            ======================================================================= */}
        {currentStep === 1 && (
          <div className="bg-white w-full max-w-[440px] rounded-2xl shadow-xl border border-slate-200/90 p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-150">
            
            {/* 'লগইন' pill tag */}
            <div className="inline-block bg-[#f1f5f9] text-slate-900 text-sm font-extrabold px-8 py-1.5 rounded-md border border-slate-200 mb-6">
              লগইন
            </div>

            {/* Heading: কোনো রেজিস্ট্রেশনের প্রয়োজন নেই। */}
            <div className="space-y-1.5 mb-6">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0c1e33] leading-snug">
                কোনো রেজিস্ট্রেশনের প্রয়োজন নেই।
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                নিচের Google বাটনে ক্লিক করে সরাসরি লগইন করুন
              </p>
            </div>

            {/* Dashed Border Container */}
            <div className="border border-dashed border-slate-300 rounded-xl p-6 sm:p-8 bg-slate-50/40 flex flex-col items-center justify-center">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full max-w-xs py-2.5 px-5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 shadow-2xs flex items-center justify-center gap-3 transition duration-150 cursor-pointer hover:shadow-xs"
              >
                {/* Google 4-Color Logo */}
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
        )}

        {/* =======================================================================
            STEP 2: GOOGLE OAUTH POPUP SIMULATION (Matches Image 2 Exactly)
            "Sign in to DaPathshala.com"
            Account: commercialauditkhulna@gmail.com
            Jamal Uddin
            [ Cancel ] [ Continue ]
            ======================================================================= */}
        {currentStep === 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
              
              {/* Fake Chrome/Google Browser Address Bar */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono select-none">
                <Lock size={12} className="text-emerald-600 shrink-0" />
                <span className="truncate">accounts.google.com/signin/oauth/id?authuser=0&part=AJi8hANOv0EIQXa_VV0ZZ8...</span>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                {/* Title */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                    Sign in to DaPathshala.com
                  </h2>
                </div>

                {/* Selected Account Pill (Interactive Dropdown Toggle) */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 shadow-2xs transition cursor-pointer"
                    title="ক্লিক করে অ্যাকাউন্ট পরিবর্তন করুন"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {googleAccount.name ? googleAccount.name[0] : 'J'}
                    </div>
                    <span className="font-sans text-xs">{googleAccount.email}</span>
                    <ChevronDown size={14} className={`text-slate-500 ml-1 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Account Switcher Dropdown */}
                  {isAccountDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        অ্যাকাউন্ট নির্বাচন করুন
                      </div>

                      {/* Current Account */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountDropdownOpen(false);
                          handleSelectAccountAndContinue();
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center gap-2.5 text-slate-800 transition"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                          {googleAccount.name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold truncate">{googleAccount.name}</div>
                          <div className="text-[11px] text-slate-500 font-sans truncate">{googleAccount.email}</div>
                        </div>
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      </button>

                      {/* Add Another Account Option */}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            setShowAddAccountModal(true);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-slate-50 text-blue-600 font-semibold flex items-center gap-2 transition"
                        >
                          <User size={14} />
                          <span>অন্য একাউন্ট যোগ করুন...</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Permissions intro */}
                <div className="text-sm sm:text-base text-slate-800 font-normal leading-relaxed">
                  Google will allow <span className="font-bold text-blue-700 underline">DaPathshala.com</span> to access this info about you
                </div>

                {/* Profile entries - FULLY INTERACTIVE & CLICKABLE */}
                <div className="space-y-2.5 pt-1">
                  
                  {/* Name Row */}
                  <div
                    onClick={handleSelectAccountAndContinue}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/50 active:bg-blue-100/60 cursor-pointer transition-all group select-none"
                    title="এই প্রোফাইল সিলেক্ট করে পরবর্তী ধাপে যেতে ক্লিক করুন"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-700 group-hover:text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200 group-hover:border-blue-300 transition-colors">
                        <User size={15} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 group-hover:text-blue-700 font-sans transition-colors">
                          {googleAccount.name}
                        </div>
                        <div className="text-xs text-slate-500 font-sans">Name and profile picture</div>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                      সিলেক্ট করুন →
                    </span>
                  </div>

                  {/* Email Row (MATCHES USER'S RED CIRCLED HIGHLIGHT) */}
                  <div
                    id="google-oauth-email-row"
                    onClick={handleSelectAccountAndContinue}
                    className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/70 active:bg-blue-100/80 shadow-2xs hover:shadow-xs cursor-pointer transition-all group select-none relative"
                    title="এই ইমেইল সিলেক্ট করে সরাসরি প্রবেশ করুন"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-700 group-hover:text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-300 group-hover:border-blue-400 transition-colors">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 font-sans truncate transition-colors">
                          {googleAccount.email}
                        </div>
                        <div className="text-xs text-slate-500 font-sans flex items-center gap-2">
                          <span>Email address</span>
                          <span className="text-[11px] font-bold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            ক্লিক করুন
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelectingAccount ? (
                        <Loader2 size={18} className="animate-spin text-blue-600" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Terms and Privacy Text */}
                <div className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100 font-sans leading-relaxed">
                  <p>
                    Review <span className="text-blue-700 font-bold">DaPathshala.com</span>'s{' '}
                    <span className="text-blue-600 font-semibold hover:underline cursor-pointer">Privacy Policy</span> and{' '}
                    <span className="text-blue-600 font-semibold hover:underline cursor-pointer">Terms of Service</span> to understand how DaPathshala.com will process and protect your data.
                  </p>
                  <p>
                    To make changes at any time, go to your <span className="text-blue-600 hover:underline cursor-pointer">Google Account</span>.
                  </p>
                  <p>
                    Learn more about <span className="text-blue-600 hover:underline cursor-pointer">Sign in with Google</span>.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-2.5 px-5 rounded-full border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-2.5 px-5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-semibold shadow-xs transition"
                  >
                    Continue
                  </button>
                </div>

                {/* Bottom Bar */}
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
          </div>
        )}

        {/* =======================================================================
            STEP 3, 4, 5: ACCOUNT TYPE SELECTION & SUCCESS TOAST
            (Matches Image 3, Image 4, and Image 5 Exactly)
            ======================================================================= */}
        {(currentStep === 3 || currentStep === 4 || currentStep === 5) && (
          <div className="relative w-full max-w-[430px] my-auto">
            
            {/* Top Success Banner / Toast (Image 5) */}
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

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Success Redirecting text (Image 5) */}
              {currentStep === 5 && (
                <div className="text-center text-xs sm:text-sm font-bold text-[#16a34a] animate-pulse">
                  Success. Redirecting...
                </div>
              )}

              {/* Title: একাউন্ট টাইপ সিলেক্ট করুন */}
              <h3 className="text-center font-bold text-base sm:text-lg text-slate-900">
                একাউন্ট টাইপ সিলেক্ট করুন
              </h3>

              {/* Options */}
              <div className="space-y-3 pt-1">
                
                {/* 1. শিক্ষক */}
                <div
                  onClick={() => {
                    if (currentStep !== 5) handleRoleSelect('teacher');
                  }}
                  className={`p-3.5 sm:p-4 rounded-xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                    selectedRole === 'teacher'
                      ? 'border-[#16a34a] bg-emerald-50/40 text-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {selectedRole === 'teacher' ? (
                    <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
                      <Check size={13} strokeWidth={3} />
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

                {/* 2. শিক্ষার্থী */}
                <div
                  onClick={() => {
                    if (currentStep !== 5) handleRoleSelect('student');
                  }}
                  className={`p-3.5 sm:p-4 rounded-xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                    selectedRole === 'student'
                      ? 'border-[#16a34a] bg-emerald-50/40 text-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {selectedRole === 'student' ? (
                    <div className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center shrink-0">
                      <Check size={13} strokeWidth={3} />
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
                <div className="space-y-3 pt-2 animate-in fade-in duration-150">
                  {/* Warning notice box */}
                  <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
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

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
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

        {/* Add Another Account Modal */}
        {showAddAccountModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">অন্য গুগল অ্যাকাউন্ট যোগ করুন</h3>
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">আপনার নাম</label>
                  <input
                    type="text"
                    value={newNameInput}
                    onChange={(e) => setNewNameInput(e.target.value)}
                    placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">গুগল ইমেইল ঠিকানা</label>
                  <input
                    type="email"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-sans"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newEmailInput.trim()) {
                      setGoogleAccount({
                        name: newNameInput.trim() || 'Google User',
                        email: newEmailInput.trim()
                      });
                    }
                    setShowAddAccountModal(false);
                    handleSelectAccountAndContinue();
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                >
                  যোগ করে প্রবেশ করুন
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500">
        DaPathshala © ২০২৬ - শিক্ষক ও শিক্ষার্থীদের ডিজিটাল পরীক্ষা প্ল্যাটফর্ম
      </footer>

    </div>
  );
};
