import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Download, Edit3, Trash2, CheckCircle2, AlertCircle, Plus, ChevronRight, Check, BookOpen, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateQuestions } from '../../../../services/geminiService';

const QuestionGenerator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingToDashboard, setSavingToDashboard] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    classLevel: '১০ম শ্রেণি',
    subject: 'পদার্থবিজ্ঞান',
    topic: '',
    type: 'mcq' as 'mcq' | 'written' | 'creative',
    count: 10
  });

  const handleGenerate = async () => {
    if (!formData.topic) {
      alert('অনুগ্রহ করে একটি টপিক লিখুন');
      return;
    }
    setLoading(true);
    setSavedSuccess(false);
    try {
      const result = await generateQuestions({
        subject: formData.subject,
        classLevel: formData.classLevel,
        topic: formData.topic,
        count: formData.count,
        type: formData.type
      });
      setQuestions(result);
      setStep(2);
    } catch (error) {
      console.error(error);
      alert('প্রশ্ন তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleNotLiked = () => {
    handleGenerate();
  };

  const handleDeleteQuestion = (idxToDelete: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idxToDelete));
  };

  const handleDownloadQuestions = () => {
    if (questions.length === 0) return;
    const content = questions.map((q, idx) => {
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

    const header = `দা পাঠশালা - প্রশ্নপত্র\nবিষয়: ${formData.subject} | শ্রেণি: ${formData.classLevel} | অধ্যায়: ${formData.topic}\nমোট প্রশ্ন: ${questions.length}টি\n` + '='.repeat(50) + '\n\n';
    const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.subject}_${formData.topic || 'প্রশ্ন'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add all questions to Dashboard and Supabase Question Bank
  const handleAddToDashboard = async () => {
    if (questions.length === 0) return;
    setSavingToDashboard(true);
    try {
      // 1. Save all questions to Supabase Cloud & Local SQLite DB via API
      for (const q of questions) {
        await fetch('/api/bank/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: formData.subject,
            classLevel: formData.classLevel,
            topic: formData.topic || 'সাধারণ',
            bookName: 'এআই জেনারেটর',
            pageNumber: '',
            question: q.question,
            options: q.options || ['ক', 'খ', 'গ', 'ঘ'],
            answer: q.answer || '',
            explanation: q.explanation || '',
            yearOrBoard: '২০২৬'
          })
        }).catch(e => console.log("Single question save notice:", e));
      }

      // 2. Save set to localStorage for Dashboard recent activities
      const existingSets = JSON.parse(localStorage.getItem('savedQuestionSets') || '[]');
      const newSet = {
        id: Date.now().toString(),
        title: `${formData.subject} - ${formData.topic || 'সাধারণ'} (${formData.type === 'mcq' ? 'MCQ' : 'লিখিত'})`,
        subject: formData.subject,
        classLevel: formData.classLevel,
        topic: formData.topic,
        count: questions.length,
        createdAt: new Date().toISOString(),
        questions: questions
      };
      localStorage.setItem('savedQuestionSets', JSON.stringify([newSet, ...existingSets]));

      setSavedSuccess(true);
    } catch (err) {
      console.error("Error saving questions to dashboard:", err);
      alert("সংরক্ষণ করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setSavingToDashboard(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">এআই প্রশ্ন জেনারেটর</h1>
        <p className="text-slate-500">মাত্র ১ মিনিটে আপনার কাঙ্খিত প্রশ্ন তৈরি করুন।</p>
      </header>

      {step === 1 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-[2rem] space-y-6 shadow-xl shadow-primary/5"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">শ্রেণি</label>
              <select 
                className="nexes-input"
                value={formData.classLevel}
                onChange={(e) => setFormData({...formData, classLevel: e.target.value})}
              >
                <option>১০ম শ্রেণি</option>
                <option>১১শ শ্রেণি</option>
                <option>১২শ শ্রেণি</option>
                <option>বিসিএস/জব</option>
                <option>বিশ্ববিদ্যালয় ভর্তি</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">বিষয়</label>
              <select 
                className="nexes-input"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              >
                <option>পদার্থবিজ্ঞান</option>
                <option>রসায়ন</option>
                <option>গণিত</option>
                <option>জীববিজ্ঞান</option>
                <option>ইংরেজি</option>
                <option>বাংলা</option>
                <option>সাধারণ জ্ঞান</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">অধ্যায় বা টপিক</label>
            <input 
              type="text" 
              placeholder="যেমন: গতি, বল, কাজ ও শক্তি" 
              className="nexes-input"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">প্রশ্নের ধরন</label>
              <select 
                className="nexes-input"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="mcq">MCQ (বহুনির্বাচনী)</option>
                <option value="written">লিখিত</option>
                <option value="creative">সৃজনশীল</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">প্রশ্নের সংখ্যা</label>
              <select 
                className="nexes-input"
                value={formData.count}
                onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
              >
                <option value={10}>১০টি</option>
                <option value={20}>২০টি</option>
                <option value={50}>৫০টি</option>
                <option value={100}>১০০টি</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="gradient-button w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap size={18} />
                <span>প্রশ্ন তৈরি করুন</span>
              </>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 no-select"
        >
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-800">তৈরিকৃত প্রশ্নসমূহ ({questions.length})</h2>
              <p className="text-xs text-slate-400">{formData.subject} • {formData.classLevel} • {formData.topic}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleDownloadQuestions}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-primary hover:bg-blue-50 transition-colors flex items-center space-x-1"
                title="ডাউনলোড করুন"
              >
                <Download size={17} />
                <span className="text-xs font-semibold hidden sm:inline">ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Success Banner when added to Dashboard */}
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-800 shadow-sm"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">ড্যাশবোর্ড ও প্রশ্ন ব্যাংকে সফলভাবে যোগ করা হয়েছে!</p>
                  <p className="text-xs text-emerald-600">প্রশ্নগুলো এখন আপনার ক্লাউড ডাটাবেজে স্থায়ীভাবে সংরক্ষিত রয়েছে।</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Link
                  to="/paper-builder"
                  className="flex-1 sm:flex-initial text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold flex items-center justify-center space-x-1 shadow-sm transition-colors"
                >
                  <BookOpen size={14} />
                  <span>পেপার মেকারে যান</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex-1 sm:flex-initial text-xs bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100 px-3 py-2 rounded-xl font-bold flex items-center justify-center space-x-1 transition-colors"
                >
                  <span>ড্যাশবোর্ড দেখুন</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                <div className="watermark" />
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleDeleteQuestion(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 bg-slate-50 rounded-xl transition-colors"
                    title="এই প্রশ্নটি বাদ দিন"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-base sm:text-lg font-bold mb-5 text-slate-900 leading-relaxed pr-8">{idx + 1}. {q.question}</p>
                {q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {q.options.map((opt: string, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs sm:text-sm font-medium text-slate-700">
                        <span className="mr-2 text-primary font-bold">{['(ক)', '(খ)', '(গ)', '(ঘ)'][i] || String.fromCharCode(65 + i)}.</span> {opt}
                      </div>
                    ))}
                  </div>
                )}
                <details className="group">
                  <summary className="nexes-button-secondary w-full flex items-center justify-between cursor-pointer list-none py-2.5 px-4 text-xs sm:text-sm">
                    <span className="font-bold">উত্তর ও ব্যাখ্যা দেখুন</span>
                    <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 p-4 sm:p-5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-xs sm:text-sm">
                    <p className="font-bold flex items-center space-x-2 text-emerald-700">
                      <CheckCircle2 size={16} />
                      <span>সঠিক উত্তর: {q.answer}</span>
                    </p>
                    {q.explanation && <p className="mt-2 text-xs font-normal opacity-90 leading-relaxed border-t border-emerald-200/60 pt-2">ব্যাখ্যা: {q.explanation}</p>}
                  </div>
                </details>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
            <button 
              onClick={handleNotLiked}
              disabled={loading || savingToDashboard}
              className="nexes-button-secondary flex-1 py-3.5 flex items-center justify-center space-x-2 text-sm"
            >
              <AlertCircle size={17} />
              <span>পছন্দ হয়নি? আবার তৈরি করুন</span>
            </button>
            <button 
              onClick={handleAddToDashboard}
              disabled={savingToDashboard || questions.length === 0}
              className={`gradient-button flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center space-x-2 text-sm shadow-lg transition-all ${
                savedSuccess ? 'bg-emerald-600 text-white' : ''
              }`}
            >
              {savingToDashboard ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check size={18} />
                  <span>ড্যাশবোর্ডে সংরক্ষিত হয়েছে</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>সব ড্যাশবোর্ডে যোগ করুন</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuestionGenerator;
