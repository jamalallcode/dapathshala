import React, { useState } from 'react';
import { X, Play, BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const tutorials = [
    {
      title: '১ ক্লিকে পূর্ণাঙ্গ প্রশ্নপত্র তৈরি',
      duration: '২ মিনিট',
      desc: 'শ্রেণি, বিষয় ও অধ্যায় সিলেক্ট করে কিভাবে মাত্র ১ মিনিটে মানসম্মত প্রশ্নপত্র প্রিন্ট উপযোগী করবেন তা দেখুন।',
      steps: [
        '১. ড্যাশবোর্ডের "১ ক্লিকে প্রশ্ন তৈরী" বাটনে ক্লিক করুন।',
        '২. আপনার কাঙ্ক্ষিত শ্রেণি (যেমন: ১০ম শ্রেণি) ও বিষয় (যেমন: বাংলা) নির্বাচন করুন।',
        '৩. অধ্যায় বা টপিক সিলেক্ট করে "প্রশ্ন তৈরি করুন" বাটনে চাপুন।',
        '৪. স্বয়ংক্রিয়ভাবে তৈরি হওয়া প্রশ্নপত্র প্রিভিউ ও ১/২ কলামে প্রিন্ট করুন।'
      ]
    },
    {
      title: 'স্মার্টবোর্ড দিয়ে ক্লাসে পাঠদান',
      duration: '১.৫ মিনিট',
      desc: 'প্রজেক্টরে সরাসরি ডিজিটাল হোয়াইটবোর্ড ও প্রশ্ন সমাধানের কলাকৌশল।',
      steps: [
        '১. ড্যাশবোর্ড থেকে "স্মার্টবোর্ড" অপশনে ক্লিক করুন।',
        '২. পছন্দমতো কলমের রং, সাইজ ও ব্যাকগ্রাউন্ড গ্রিড নির্বাচন করুন।',
        '৩. লাইভ সমাধান লিখে চিত্র সহ সংরক্ষণ করুন।'
      ]
    },
    {
      title: 'ওএমআর (OMR) শিট জেনারেশন ও মূল্যায়ন',
      duration: '২.৫ মিনিট',
      desc: 'শিক্ষার্থীদের মডেল টেস্টের জন্য ওএমআর শিট প্রিন্ট ও রোল নম্বর ট্র্যাকিং।',
      steps: [
        '১. OMR শিট জেনারেটরে গিয়ে প্রশ্নের সংখ্যা (২৫/৫০/১০০) নির্ধারণ করুন।',
        '২. প্রতিষ্ঠানের নাম ও পরীক্ষার নাম হেডার যুক্ত করুন।',
        '৩. পিডিএফ ডাউনলোড করে সরাসরি শিক্ষার্থীদের মাঝে বিতরণ করুন।'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
              <Play size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">টিউটোরিয়াল ও ব্যবহার নির্দেশিকা</h3>
              <p className="text-xs text-slate-400">সহজে DaPathshala ব্যবহারের ভিডিও ও চিত্রভিত্তিক গাইড</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Tabs */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
            {tutorials.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  activeStep === idx
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Active Tutorial Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-slate-900">{tutorials[activeStep].title}</h4>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Clock size={12} />
                {tutorials[activeStep].duration}
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {tutorials[activeStep].desc}
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">ধাপসমূহ:</div>
              {tutorials[activeStep].steps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2.5 text-sm text-slate-800 font-medium">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            বুঝেছি, ধন্যবাদ
          </button>
        </div>
      </div>
    </div>
  );
};
