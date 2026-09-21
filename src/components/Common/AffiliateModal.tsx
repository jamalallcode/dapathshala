import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, TrendingUp, Users, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';

interface AffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = 'https://dapathshala.com/ref/DP-TEACHER-829';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0c1e33] to-[#15345a] px-5 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">টিচার্স এফিলিয়েট প্রোগ্রাম</h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  ২০% কমিশন
                </span>
              </div>
              <p className="text-xs text-slate-300">সহকর্মী শিক্ষকদের আমন্ত্রণ জানিয়ে আজীবন আয় করুন</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Earning Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs text-slate-500 font-medium">মোট রেফারেল</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">১৪ জন</div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-xs text-emerald-800 font-medium">মোট আয়</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">৳ ৭,২০০</div>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
              <div className="text-xs text-amber-800 font-medium">উত্তোলনযোগ্য</div>
              <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">৳ ২,৪০০</div>
            </div>
          </div>

          {/* Referral Link Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700">আপনার ইউনিক রেফারেল লিংক</label>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full text-xs font-mono text-slate-700 bg-transparent focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-md bg-[#0c1e33] hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'কপি হয়েছে' : 'কপি লিংক'}</span>
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 tracking-wider">প্রোগ্রামের নিয়মাবলী:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-800">১. লিংক শেয়ার করুন</div>
                <p className="text-slate-600 text-[11px]">আপনার ফেসবুক, গ্রুপ বা সহকর্মী শিক্ষকদের সাথে রেফারেল লিংক শেয়ার করুন।</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-800">২. রেজিস্ট্রেশন ও সাবস্ক্রিপশন</div>
                <p className="text-slate-600 text-[11px]">শিক্ষক আপনার লিংকে এসে যেকোনো সাবস্ক্রিপশন প্যাকেজ নিলেই কমিশন প্রযোজ্য।</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-800">৩. বিকাশ/নগদে উত্তোলন</div>
                <p className="text-slate-600 text-[11px]">সর্বনিম্ন ৫০০ টাকা হলেই বিকাশ বা নগদ নম্বরে সরাসরি উত্তোলন করা যাবে।</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            উত্তোলন সংক্রান্ত সহায়তায় হটলাইনে যোগাযোগ করুন
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0c1e33] text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
