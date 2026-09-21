import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, Sparkles, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';

interface OmrTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OmrTokenModal: React.FC<OmrTokenModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState('DP-OMR-7829-2026');
  const [isCopied, setIsCopied] = useState(false);
  const [credits, setCredits] = useState(480);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setToken(`DP-OMR-${randomNum}-2026`);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-[#0c1e33] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">OMR সিকিউর টোকেন</h3>
              <p className="text-xs text-slate-300">ওএমআর শিট মূল্যায়ন ও স্ক্যানিং ভেরিফিকেশন</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Token Display Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 mb-1.5">আপনার বর্তমান OMR সিকিউরিটি টোকেন</div>
            <div className="flex items-center justify-between gap-2 bg-white px-3 py-2.5 rounded-lg border border-slate-300 shadow-xs">
              <span className="font-mono text-base sm:text-lg font-bold text-slate-800 tracking-wider">
                {token}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition flex items-center gap-1 text-xs font-semibold"
                  title="কপি করুন"
                >
                  {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  <span>{isCopied ? 'কপি হয়েছে' : 'কপি'}</span>
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                  title="নতুন টোকেন জেনারেট"
                >
                  <RefreshCw size={16} className={isGenerating ? 'animate-spin text-blue-600' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* Credits Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-xs text-emerald-800 font-medium">অবশিষ্ট OMR ক্রেডিট</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{credits} টি</div>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-center">
              <div className="text-xs text-blue-800 font-medium">টোকেন মেয়াদ</div>
              <div className="text-sm font-bold text-blue-900 mt-1.5">৩১ ডিসেম্বর, ২০২৬</div>
            </div>
          </div>

          {/* Guide */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>কীভাবে টোকেন ব্যবহার করবেন?</span>
            </div>
            <p>১. মোবাইল দিয়ে ওএমআর খাতা স্ক্যান করার সময় অ্যাপে এই টোকেনটি প্রবেশ করান।</p>
            <p>২. পরীক্ষার্থীদের খাতা স্বয়ংক্রিয়ভাবে আপনার শিক্ষক একাউন্টে সিঙ্ক হয়ে যাবে।</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0c1e33] text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
