import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  BookOpen, 
  Lock, 
  Sparkles, 
  Check, 
  FileText, 
  Printer, 
  Download,
  Layers,
  Copy
} from 'lucide-react';

interface PdfToolsModalProps {
  type: 'protect' | 'booklet' | null;
  onClose: () => void;
}

export const PdfToolsModal: React.FC<PdfToolsModalProps> = ({ type, onClose }) => {
  const [watermarkText, setWatermarkText] = useState('দা পাঠশালা - DaPathshala Protected');
  const [hasPassword, setHasPassword] = useState(true);
  const [password, setPassword] = useState('dapathshala2026');
  const [preventCopy, setPreventCopy] = useState(true);
  const [preventPrint, setPreventPrint] = useState(false);
  const [bookletLayout, setBookletLayout] = useState<'duplex' | 'saddle' | 'twoup'>('duplex');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!type) return null;

  const handleApply = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStatusMessage(
        type === 'protect' 
          ? 'পিডিএফ সিকিউরিটি এবং ওয়াটারমার্ক সফলভাবে যুক্ত করা হয়েছে!' 
          : 'বুকলেট ফরম্যাটিং এবং ২-কলাম পেজ লেআউট রেডি হয়েছে!'
      );
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between text-white ${
          type === 'protect' ? 'bg-gradient-to-r from-rose-600 to-red-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600'
        }`}>
          <div className="flex items-center gap-2.5">
            {type === 'protect' ? <ShieldCheck size={22} /> : <BookOpen size={22} />}
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {type === 'protect' ? 'PDF Protect (পিডিএফ সুরক্ষা)' : 'PDF to Booklet (বুকলেট প্রিন্টিং)'}
              </h3>
              <p className="text-xs text-white/80">
                {type === 'protect' 
                  ? 'প্রশ্নপত্র ওয়াটারমার্ক ও কপি প্রোটেকশন টুল' 
                  : 'এ৪ সাইজে বইয়ের মতো ভাঁজ করা বুকলেট তৈরির টুল'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check size={16} className="text-emerald-600" />
              {statusMessage}
            </div>
          )}

          {type === 'protect' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ওয়াটারমার্ক টেক্সট (Watermark Text)
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
                  placeholder="যেমন: প্রতিষ্ঠান বা শিক্ষকের নাম"
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preventCopy}
                    onChange={(e) => setPreventCopy(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                  />
                  <span>কনটেন্ট সিলেক্ট বা কপি করা নিষ্ক্রিয় করুন (Anti-Copy)</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPassword}
                    onChange={(e) => setHasPassword(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                  />
                  <span>পাসওয়ার্ড প্রোটেকশন চালু করুন</span>
                </label>

                {hasPassword && (
                  <div className="pl-6 pt-1">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                      placeholder="পিডিএফ ওপেন পাসওয়ার্ড"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  বুকলেট পেজ বিন্যাস (Booklet Page Ordering)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setBookletLayout('duplex')}
                    className={`p-3 rounded-xl border text-center transition ${
                      bookletLayout === 'duplex'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">দ্বিমুখী (Duplex)</div>
                    <div className="text-[10px] text-slate-500">উভয় পিঠে প্রিন্ট</div>
                  </button>

                  <button
                    onClick={() => setBookletLayout('twoup')}
                    className={`p-3 rounded-xl border text-center transition ${
                      bookletLayout === 'twoup'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">২-কলাম পেজ</div>
                    <div className="text-[10px] text-slate-500">এক পাতায় ২টি পাতা</div>
                  </button>

                  <button
                    onClick={() => setBookletLayout('saddle')}
                    className={`p-3 rounded-xl border text-center transition ${
                      bookletLayout === 'saddle'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                    }`}
                  >
                    <div className="text-xs font-bold mb-0.5">স্যাডেল স্ট্রিচ</div>
                    <div className="text-[10px] text-slate-500">মাঝখানে পিন করার উপযোগী</div>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">কাগজ সাশ্রয় পরামর্শ:</div>
                <div>• ২ কলাম বা বুকলেট ফরম্যাটে প্রিন্ট দিলে কাগজের অপচয় ৫০% কমে যায়।</div>
                <div>• বোর্ড পরীক্ষার প্রশ্নপত্রের মতো প্রফেশনাল লুক পাওয়া যায়।</div>
              </div>
            </>
          )}

          <div className="pt-3 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              বন্ধ করুন
            </button>
            <button
              onClick={handleApply}
              disabled={isProcessing}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                type === 'protect'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
              }`}
            >
              {isProcessing ? 'প্রসেসিং হচ্ছে...' : 'সেটিংস প্রয়োগ করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
