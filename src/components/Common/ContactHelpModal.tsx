import React from 'react';
import { X, Phone, MessageSquare, Mail, Clock, MapPin, Send, ExternalLink } from 'lucide-react';

interface ContactHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactHelpModal: React.FC<ContactHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-[#0c1e33] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Phone size={19} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">হেল্পলাইন ও কাস্টমার কেয়ার</h3>
              <p className="text-xs text-slate-300">দা পাঠশালা সহায়তায় আমাদের সাপোর্ট টিম নিয়োজিত</p>
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
        <div className="p-5 sm:p-6 space-y-4">
          {/* Quick Helpline Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">হটলাইন নম্বর</div>
                <div className="text-sm font-bold text-slate-900">+880 1700-000000</div>
                <div className="text-[11px] text-slate-500 mt-0.5">সকাল ৯টা - রাত ১০টা</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                <MessageSquare size={18} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-medium">WhatsApp সাপোর্ট</div>
                <div className="text-sm font-bold text-slate-900">+880 1800-000000</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">২৪/৭ সক্রিয় চ্যাট</div>
              </div>
            </div>
          </div>

          {/* Social / Channel Notice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-blue-950">মেসেঞ্জার অফিসিয়াল চ্যানেল</div>
                <div className="text-xs text-blue-800 mt-0.5">নিয়মিত আপডেট, নোটিশ ও টিপস পেতে যুক্ত থাকুন</div>
              </div>
              <a
                href="https://m.me/dapathshala"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                <span>যুক্ত হোন</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Email and Address */}
          <div className="space-y-2.5 pt-1 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Mail size={15} className="text-slate-400" />
              <span>ইমেইল: <strong className="text-slate-800">support@dapathshala.com</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={15} className="text-slate-400" />
              <span>সার্ভিস সাপোর্ট সময়: প্রতিদিন সকাল ৯:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin size={15} className="text-slate-400" />
              <span>প্রধান কার্যালয়: খুলনা / ঢাকা, বাংলাদেশ</span>
            </div>
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
