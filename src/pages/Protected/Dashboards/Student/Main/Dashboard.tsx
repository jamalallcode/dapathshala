import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, Award, FileText, Download, ChevronRight, PlusCircle, CheckCircle2, ShieldCheck, Calculator } from 'lucide-react';
import { motion } from 'motion/react';
import { checkIsAdmin } from '../../../../../utils/adminAuth';
import Class10MathPaperWidget from '../../../../../components/Dashboard/Class10MathPaperWidget';

interface SavedSet {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  topic: string;
  count: number;
  createdAt: string;
  questions: any[];
}

const Dashboard = () => {
  const [savedSets, setSavedSets] = useState<SavedSet[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedQuestionSets');
      if (stored) {
        setSavedSets(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse savedQuestionSets", e);
    }
  }, []);

  const totalQuestionsCount = savedSets.reduce((acc, curr) => acc + (curr.count || curr.questions?.length || 0), 12);

  const handleDownloadSet = (set: SavedSet) => {
    if (!set.questions || set.questions.length === 0) return;
    const content = set.questions.map((q, idx) => {
      let text = `${idx + 1}. ${q.question}\n`;
      if (q.options && q.options.length > 0) {
        text += q.options.map((opt: string, i: number) => `   (${['ক', 'খ', 'গ', 'ঘ'][i] || String.fromCharCode(65 + i)}) ${opt}`).join('\n') + '\n';
      }
      text += `   সঠিক উত্তর: ${q.answer}\n`;
      if (q.explanation) {
        text += `   ব্যাখ্যা: ${q.explanation}\n`;
      }
      return text;
    }).join('\n');

    const header = `দা পাঠশালা - ${set.title}\nশ্রেণি: ${set.classLevel} | তারিখ: ${new Date(set.createdAt).toLocaleDateString('bn-BD')}\n` + '='.repeat(50) + '\n\n';
    const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${set.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8 pt-6 md:pt-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">স্বাগতম, ব্যবহারকারী! 👋</h1>
          <p className="text-slate-500">আপনার আজকের পড়াশোনার অগ্রগতি ও প্রশ্নভাণ্ডার এখানে দেখুন।</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {checkIsAdmin() && (
            <Link
              to="/admin"
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-sm transition-colors"
            >
              <ShieldCheck size={16} className="text-amber-400" />
              <span>মাস্টার কন্ট্রোল বোর্ড</span>
            </Link>
          )}
          <Link
            to="/generate"
            className="gradient-button px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 shadow-sm"
          >
            <PlusCircle size={16} />
            <span>নতুন প্রশ্ন তৈরি করুন</span>
          </Link>
          <Link
            to="/paper-builder"
            className="nexes-button-secondary px-4 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2"
          >
            <BookOpen size={16} />
            <span>পেপার মেকার</span>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-6 rounded-2xl flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">বোনাস পয়েন্ট</p>
            <p className="text-xl font-bold">৫০</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-6 rounded-2xl flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">তৈরিকৃত প্রশ্ন</p>
            <p className="text-xl font-bold">{totalQuestionsCount}</p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-6 rounded-2xl flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">অংশগ্রহণকৃত পরীক্ষা</p>
            <p className="text-xl font-bold">৫</p>
          </div>
        </motion.div>
      </div>

      {/* ۱۰ম শ্রেণির গণিত প্রশ্নপত্র তৈরি সেকশন (User's Interactive Math Paper Studio) */}
      <section className="mb-10">
        <Class10MathPaperWidget />
      </section>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">সাম্প্রতিক কার্যক্রম ও প্রশ্নসেট</h2>
          <Link to="/paper-builder" className="text-primary text-sm font-medium flex items-center hover:underline">
            প্রশ্ন ব্যাংক দেখুন <ChevronRight size={16} />
          </Link>
        </div>

        <div className="space-y-4">
          {savedSets.length > 0 ? (
            savedSets.map((item) => (
              <div key={item.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-primary/20 transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-primary shrink-0">
                    <FileText size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm sm:text-base">{item.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.count}টি প্রশ্ন • {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleDownloadSet(item)}
                    className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                    title="ডাউনলোড করুন"
                  >
                    <Download size={18} />
                  </button>
                  <Link
                    to="/paper-builder"
                    className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                    title="পেপার মেকারে ব্যবহার করুন"
                  >
                    <BookOpen size={18} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            [
              { title: 'পদার্থবিজ্ঞান - ২য় অধ্যায় (গতি ও বল)', time: '২ ঘণ্টা আগে', count: 10 },
              { title: 'রসায়ন - পর্যায় সারণি (MCQ)', time: '১ দিন আগে', count: 15 },
              { title: 'উচ্চতর গণিত - ত্রিকোণমিতি', time: '৩ দিন আগে', count: 20 }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.time} • {item.count}টি প্রশ্ন</p>
                  </div>
                </div>
                <Link to="/paper-builder" className="text-slate-400 hover:text-primary p-2">
                  <ChevronRight size={18} />
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
