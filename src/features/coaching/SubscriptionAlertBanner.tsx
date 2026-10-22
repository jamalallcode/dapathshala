import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  BellRing, 
  Sparkles, 
  Smartphone, 
  X,
  CreditCard,
  Check
} from 'lucide-react';
import { SubscriptionState, CoachingProfile } from './types';

interface SubscriptionAlertBannerProps {
  subscription: SubscriptionState;
  coachingProfile: CoachingProfile;
  onOpenRenew: () => void;
  onToggleAutoRenew: () => void;
}

export const SubscriptionAlertBanner: React.FC<SubscriptionAlertBannerProps> = ({
  subscription,
  coachingProfile,
  onOpenRenew,
  onToggleAutoRenew
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [testAlertToast, setTestAlertToast] = useState<string | null>(null);

  const renewalDate = new Date(subscription.renewalDate);
  const today = new Date();
  const diffTime = renewalDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining <= 5 && !isExpired;
  const formattedDate = renewalDate.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleSendSimulatedSMS = () => {
    const text = `[দা-পাঠশালা এসএমএস গেটওয়ে] প্রিয় ${coachingProfile.name}, আপনার '${subscription.planName}' সাবস্ক্রিপশনের মেয়াদ ${formattedDate}-এ শেষ হবে। নিরবচ্ছিন্ন সেবা নিশ্চিত করতে বিকাশ/নগদে রিনিউ করুন। হেল্পলাইন: 01886-900800`;
    setTestAlertToast(text);
    setTimeout(() => {
      setTestAlertToast(null);
    }, 6000);
  };

  if (dismissed && !isExpiringSoon && !isExpired) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Test simulated SMS toast overlay */}
      {testAlertToast && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone size={20} />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                স্বয়ংক্রিয় এসএমএস পাঠানো হয়েছে
              </span>
              <span className="text-[10px] text-slate-400">এখনই</span>
            </div>
            <p className="text-xs text-slate-200 font-sans leading-relaxed">
              {testAlertToast}
            </p>
          </div>
          <button 
            onClick={() => setTestAlertToast(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Alert Banner */}
      <div 
        className={`rounded-2xl p-4 sm:p-5 border shadow-sm transition-all relative overflow-hidden ${
          isExpired
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : isExpiringSoon
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-emerald-200 text-slate-900'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-start gap-3.5">
            <div 
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                isExpired
                  ? 'bg-rose-600 text-white'
                  : isExpiringSoon
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isExpired ? (
                <AlertTriangle size={22} />
              ) : isExpiringSoon ? (
                <Clock size={22} className="animate-pulse" />
              ) : (
                <CheckCircle2 size={22} />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black tracking-tight">
                  {isExpired 
                    ? 'সাবস্ক্রিপশনের মেয়াদ উত্তীর্ণ হয়েছে!' 
                    : isExpiringSoon 
                    ? `সতর্কতা: সাবস্ক্রিপশন রিনিউ করতে আর মাত্র ${daysRemaining.toLocaleString('bn-BD')} দিন বাকি!` 
                    : `সাবস্ক্রিপশন সক্রিয় (${subscription.planName})`}
                </span>
                
                {subscription.autoRenew ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    <RefreshCw size={10} className="animate-spin" />
                    অটো-রিনিউ চালু
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ম্যানুয়াল রিনিউয়াল
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600">
                পরবর্তী রিনিউয়াল তারিখ: <strong className="text-slate-900 font-bold">{formattedDate}</strong>। 
                {subscription.smsAlertsEnabled && ' (এসএমএস ও অ্যাপ নোটিফিকেশন অ্যালার্ট সক্রিয় রয়েছে)'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleSendSimulatedSMS}
              title="টেস্ট নোটিফিকেশন পাঠান"
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BellRing size={14} className="text-indigo-600" />
              <span>টেস্ট SMS সতর্কবার্তা</span>
            </button>

            <button
              type="button"
              onClick={onToggleAutoRenew}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                subscription.autoRenew
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <RefreshCw size={13} />
              <span>{subscription.autoRenew ? 'অটো-রিনিউ সক্রিয়' : 'অটো-রিনিউ বন্ধ'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenRenew}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                isExpired
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                  : isExpiringSoon
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              }`}
            >
              <CreditCard size={14} />
              <span>{isExpired ? 'এখনই রিনিউ করুন' : 'প্যাকেজ রিনিউ / আপগ্রেড'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
