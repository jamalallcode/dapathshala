import React from 'react';
import { Users, BookOpen, Award, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const ParentDashboard = () => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8 pt-6 md:pt-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">অভিভাবক ড্যাশবোর্ড 👋</h1>
        <p className="text-slate-500">আপনার সন্তানের পড়াশোনার অগ্রগতি পর্যবেক্ষণ করুন।</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">সন্তানের সংখ্যা</p>
            <p className="text-xl font-bold">০১</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">মোট অধ্যায় সম্পন্ন</p>
            <p className="text-xl font-bold">১৫</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">গড় স্কোর</p>
            <p className="text-xl font-bold">৮৫%</p>
          </div>
        </div>
      </div>

      <section className="glass-card p-8 rounded-[2rem]">
        <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
          <Clock size={20} className="text-primary" />
          <span>সাম্প্রতিক পারফরম্যান্স</span>
        </h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-bold">সাপ্তাহিক কুইজ - {i === 1 ? 'গণিত' : 'ইংরেজি'}</p>
                <p className="text-xs text-slate-500">তারিখ: ২৮ ফেব্রুয়ারি, ২০২৬</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">{i === 1 ? '৯০%' : '৭৮%'}</p>
                <p className="text-[10px] text-slate-400">গ্রেড: {i === 1 ? 'A+' : 'A'}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-6 py-3 text-primary font-bold flex items-center justify-center space-x-2">
          <span>বিস্তারিত রিপোর্ট দেখুন</span>
          <ChevronRight size={18} />
        </button>
      </section>
    </div>
  );
};

export default ParentDashboard;
