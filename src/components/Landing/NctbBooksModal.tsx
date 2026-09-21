import React from 'react';
import { X, BookOpen, Download, ExternalLink, Sparkles } from 'lucide-react';

interface NctbBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NctbBooksModal: React.FC<NctbBooksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const classes = [
    { class: '৬ষ্ঠ শ্রেণি', count: '১৪টি বই', subjects: ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'ইতিহাস ও সামাজিক বিজ্ঞান'] },
    { class: '৭ম শ্রেণি', count: '১৪টি বই', subjects: ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'ডিজিটাল প্রযুক্তি'] },
    { class: '৮ম শ্রেণি', count: '১৪টি বই', subjects: ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'জীবন ও জীবিকা'] },
    { class: '৯ম শ্রেণি', count: '১২টি বই', subjects: ['বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'ডিজিটাল প্রযুক্তি'] },
    { class: '১০ম শ্রেণি (SSC)', count: '১২টি বই', subjects: ['বাংলা ১ম ও ২য়', 'ইংরেজি', 'সাধারণ গণিত', 'উচ্চতর গণিত', 'পদার্থবিজ্ঞান'] },
    { class: 'একাদশ-দ্বাদশ (HSC)', count: 'সকল বিভাগ', subjects: ['বাংলা', 'ইংরেজি', 'আইসিটি', 'বিজ্ঞান/মানবিক/ব্যবসায় শিক্ষা'] }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">২০২৬ সালের NCTB পাঠ্যবই সংগ্রহ</h3>
              <p className="text-xs text-white/90">জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত সকল পিডিএফ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center gap-2">
            <Sparkles size={18} className="text-amber-600 shrink-0" />
            <span>DaPathshala-তে সকল পাঠ্যবইয়ের প্রতিটি অধ্যায়ের শতভাগ নির্ভুল প্রশ্ন সংযোজন করা রয়েছে।</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {classes.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/30 transition group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-sm sm:text-base">{item.class}</span>
                  <span className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                    {item.count}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                  {item.subjects.join(', ')}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert(`${item.class}-এর ২০২৬ সালের সরকারি পাঠ্যবই ড্রাইভ লিংক প্রস্তুত রয়েছে।`)}
                    className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition"
                  >
                    <Download size={13} />
                    <span>পিডিএফ ডাউনলোড</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">উৎস: জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (এনসিটিবি)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
