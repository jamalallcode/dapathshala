import React from 'react';
import { Plus, Users, PenTool, Award, Clock, Copy } from 'lucide-react';

const CoachingDashboard = () => {
  return (
    <div className="pt-6 md:pt-8 p-4 md:p-8 max-w-7xl mx-auto pb-32">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">কোচিং অ্যাডমিন প্যানেল</h1>
          <p className="text-slate-500">আপনার প্রতিষ্ঠানের শিক্ষার্থী ও পরীক্ষা পরিচালনা করুন</p>
        </div>
        <div className="flex space-x-3">
          <button className="gradient-button px-6 py-3 rounded-xl font-bold flex items-center space-x-2">
            <Plus size={18} />
            <span>নতুন পরীক্ষা তৈরি</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 rounded-3xl border-b-4 border-b-primary">
          <Users className="text-primary mb-4" size={32} />
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">মোট শিক্ষার্থী</h3>
          <p className="text-3xl font-bold">১২৫০</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border-b-4 border-b-emerald-500">
          <PenTool className="text-emerald-500 mb-4" size={32} />
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">চলমান পরীক্ষা</h3>
          <p className="text-3xl font-bold">০৪</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border-b-4 border-b-amber-500">
          <Award className="text-amber-500 mb-4" size={32} />
          <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">গড় পাসের হার</h3>
          <p className="text-3xl font-bold">৮৮%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="glass-card p-8 rounded-[2rem]">
          <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
            <Users size={20} className="text-primary" />
            <span>সাম্প্রতিক শিক্ষার্থী</span>
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">S</div>
                  <div>
                    <p className="font-bold">শিক্ষার্থী নাম {i}</p>
                    <p className="text-xs text-slate-500">ID: DP-2026-00{i}</p>
                  </div>
                </div>
                <button className="text-primary text-sm font-bold">প্রোফাইল</button>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-slate-500 font-bold border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
            সকল শিক্ষার্থী দেখুন
          </button>
        </section>

        <section className="glass-card p-8 rounded-[2rem]">
          <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
            <Plus size={20} className="text-primary" />
            <span>ভার্চুয়াল এক্সাম লিংক</span>
          </h2>
          <div className="space-y-4">
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="font-bold mb-2">সাপ্তাহিক মডেল টেস্ট - ০৫</p>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
                <Clock size={14} />
                <span>সময়: ৬০ মিনিট</span>
                <span className="mx-2">|</span>
                <Users size={14} />
                <span>অংশগ্রহণকারী: ৪৫২</span>
              </div>
              <div className="flex space-x-2">
                <input 
                  readOnly 
                  value="https://dapathshala.com/exam/v-link-xyz" 
                  className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono"
                />
                <button className="bg-primary text-white p-2 rounded-lg">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CoachingDashboard;
