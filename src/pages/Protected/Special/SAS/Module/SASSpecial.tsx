import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, CheckCircle2, Search, Download, Volume2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const SASSpecial = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchSASQuestions = async () => {
    setLoading(true);
    setTimeout(() => {
      setQuestions([
        { id: 1, year: 2024, subject: "Audit & Accounts", question: "অডিট ম্যানুয়াল অনুযায়ী ভাউচার যাচাইকরণের প্রধান ধাপগুলো কী কী?", answer: "ভাউচার যাচাইকরণের প্রধান ধাপগুলো হলো: ১. তারিখ পরীক্ষা, ২. স্বাক্ষর যাচাই, ৩. টাকার অংক মিলানো...", explanation: "এটি অডিট ম্যানুয়ালের ৩য় অধ্যায়ে বিস্তারিত আছে।" },
        { id: 2, year: 2023, subject: "Financial Rules", question: "সরকারি অর্থ ব্যয়ের ক্ষেত্রে 'Financial Propriety' বলতে কী বোঝায়?", answer: "Financial Propriety বলতে বোঝায় যে একজন সাধারণ মানুষ নিজের অর্থ ব্যয়ের ক্ষেত্রে যে সতর্কতা অবলম্বন করেন, সরকারি অর্থ ব্যয়ের ক্ষেত্রেও ঠিক সেই সতর্কতা অবলম্বন করা।", explanation: "GFR Rule 10 এ এটি বর্ণিত আছে।" },
      ]);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    fetchSASQuestions();
  }, []);

  if (!isSubscribed) {
    return (
      <div className="pt-48 p-4 md:p-8 max-w-4xl mx-auto">
        <div className="glass-card p-12 rounded-[2rem] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <ShieldCheck size={12} />
              <span>PREMIUM</span>
            </div>
          </div>
          <Award size={64} className="mx-auto text-primary mb-6" />
          <h1 className="text-3xl font-bold mb-4">SAS (অডিট ও অ্যাকাউন্টস) স্পেশাল</h1>
          <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
            বিগত বছরের সকল প্রশ্নব্যাংক, অডিট ম্যানুয়াল কোর্স এবং বিশেষায়িত এআই টিউটর অ্যাক্সেস করতে প্রিমিয়াম সাবস্ক্রিপশন প্রয়োজন।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl">
              <CheckCircle2 className="text-primary mt-1" size={18} />
              <span className="text-sm font-medium">বিগত ২০ বছরের সকল প্রশ্ন ও সমাধান</span>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl">
              <CheckCircle2 className="text-primary mt-1" size={18} />
              <span className="text-sm font-medium">অডিট ম্যানুয়াল এআই টিউটর</span>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl">
              <CheckCircle2 className="text-primary mt-1" size={18} />
              <span className="text-sm font-medium">আনলিমিটেড মডেল টেস্ট</span>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl">
              <CheckCircle2 className="text-primary mt-1" size={18} />
              <span className="text-sm font-medium">স্ক্রিনশট ও কপি প্রোটেকশন</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSubscribed(true)}
            className="gradient-button px-12 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
          >
            সাবস্ক্রাইব করুন (৳৫০০/মাস)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-48 p-4 md:p-8 max-w-5xl mx-auto pb-32 no-select">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SAS প্রশ্নব্যাংক ও সলিউশন</h1>
          <p className="text-slate-500">বিভাগীয় পরীক্ষার্থীদের জন্য বিশেষায়িত মডিউল</p>
        </div>
        <div className="flex space-x-3">
          <button className="nexes-button-secondary flex items-center space-x-2">
            <Search size={18} />
            <span>অনুসন্ধান</span>
          </button>
          <button className="nexes-button-primary flex items-center space-x-2">
            <Download size={18} />
            <span>ডাউনলোড (ওয়াটারমার্ক-সহ)</span>
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          questions.map((q) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 rounded-3xl border-l-4 border-l-primary relative overflow-hidden"
            >
              <div className="watermark" />
              <div className="flex justify-between items-start mb-4">
                <div className="flex space-x-2">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold">{q.year}</span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold">{q.subject}</span>
                </div>
                <button className="text-slate-400 hover:text-primary">
                  <Volume2 size={20} />
                </button>
              </div>
              <p className="text-lg font-bold mb-6 leading-relaxed">{q.question}</p>
              
              <details className="group">
                <summary className="nexes-button-secondary w-full flex items-center justify-between cursor-pointer list-none">
                  <span className="font-bold">উত্তর ও ব্যাখ্যা দেখুন</span>
                  <ChevronRight size={20} className="group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-4 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold mb-3">
                    <CheckCircle2 size={18} />
                    <span>সঠিক উত্তর:</span>
                  </div>
                  <p className="text-slate-700 mb-4 leading-relaxed">{q.answer}</p>
                  <div className="pt-4 border-t border-emerald-100">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">এআই ব্যাখ্যা:</p>
                    <p className="text-sm text-slate-600 italic">{q.explanation}</p>
                  </div>
                </div>
              </details>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SASSpecial;
