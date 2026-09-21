import React from 'react';
import { X, Check, ShieldCheck, Sparkles, Building, User } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan?: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'একক শিক্ষক প্যাক',
      icon: User,
      price: '৳ ৯৯০',
      period: '/ বাৎসরিক',
      desc: 'স্বতন্ত্র শিক্ষক ও হোম টিউটরদের জন্য আদর্শ',
      features: [
        'অসীমিত ১-ক্লিকে প্রশ্ন তৈরী',
        'সকল শ্রেণি ও বিষয়ের প্রশ্ন ব্যাংক',
        'ডিজিটাল স্মার্টবোর্ড আনলিমিটেড ব্যবহার',
        'PDF Protect ও ওয়াটারমার্ক সুরক্ষা',
        'OMR শিট ডাউনলোড ও রেজাল্ট সিস্টেম'
      ],
      popular: false,
      btnColor: 'bg-slate-900 hover:bg-slate-800'
    },
    {
      name: 'কোচিং ও একাডেমি প্যাক',
      icon: Sparkles,
      price: '৳ ২৪৫০',
      period: '/ বাৎসরিক',
      desc: 'কোচিং সেন্টার ও প্রাইভেট ব্যাচের জন্য সেরা সমাধান',
      features: [
        'একক প্যাকের সকল সুবিধা অন্তর্ভুক্ত',
        'প্রতিষ্ঠানের নিজস্ব লোগো ও হেডার সাপোর্ট',
        'ব্যাচ ও শিক্ষার্থীভিত্তিক ওএমআর মূল্যায়ন',
        '২-কলাম বোর্ড স্ট্যান্ডার্ড বুকলেট প্রিন্ট',
        'লাইভ অনলাইন পরীক্ষা ও অটোমেটেড রেজাল্ট',
        'অগ্রাধিকারভিত্তিক ২৪/৭ হেল্পলাইন'
      ],
      popular: true,
      btnColor: 'bg-[#16a34a] hover:bg-[#15803d]'
    },
    {
      name: 'প্রতিষ্ঠান / স্কুল প্যাক',
      icon: Building,
      price: '৳ ৪৯৫০',
      period: '/ বাৎসরিক',
      desc: 'স্কুল, কলেজ ও মাদ্রাসার পূর্ণাঙ্গ পরীক্ষা ব্যবস্থা',
      features: [
        'মাল্টি-টিচার অ্যাক্সেস (১০ জন শিক্ষক)',
        'বার্ষিক ও অর্ধবার্ষিক পরীক্ষার পূর্ণাঙ্গ প্রশ্ন শিট',
        'কাস্টম প্রশ্ন আপলোড ও শেয়ার্ড লাইব্রেরি',
        'বোর্ড পরীক্ষার অনুরূপ হুবহু মডেল টেস্ট',
        'ডেডিকেটেড একাউন্ট ম্যানেজার সাপোর্ট'
      ],
      popular: false,
      btnColor: 'bg-slate-900 hover:bg-slate-800'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#16a34a] px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h3 className="font-bold text-lg sm:text-xl">DaPathshala প্যাকেজ ও মূল্য তালিকা</h3>
            <p className="text-xs text-white/90">আপনার প্রয়োজনীয়তা অনুযায়ী সেরা সাশ্রয়ী প্ল্যানটি বেছে নিন</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[75vh] overflow-y-auto">
          {plans.map((plan, idx) => {
            const IconComp = plan.icon;
            return (
              <div 
                key={idx}
                className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  plan.popular 
                    ? 'border-[#16a34a] ring-2 ring-[#16a34a]/20 bg-emerald-50/20 shadow-md' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#16a34a] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                    সবচেয়ে জনপ্রিয়
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      plan.popular ? 'bg-emerald-100 text-[#16a34a]' : 'bg-slate-100 text-slate-700'
                    }`}>
                      <IconComp size={18} />
                    </div>
                    <h4 className="font-bold text-base text-slate-900">{plan.name}</h4>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">{plan.desc}</p>

                  <div className="mb-4 pb-4 border-b border-slate-100">
                    <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-500 font-medium">{plan.period}</span>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check size={14} className="text-[#16a34a] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onSelectPlan) onSelectPlan();
                    onClose();
                  }}
                  className={`w-full py-2.5 rounded-xl text-white text-xs font-bold transition shadow-xs ${plan.btnColor}`}
                >
                  প্ল্যানটি গ্রহণ করুন
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#16a34a]" />
            <span>নিরাপদ বিকাশ/নগদ/রকেট ও কার্ড পেমেন্ট সাপোর্ট</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
