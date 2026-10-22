import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Shield, 
  Calendar, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3,
  FileCheck,
  Send,
  Printer,
  Sparkles,
  Lock,
  Unlock,
  Award,
  BookOpen,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ParentDashboard: React.FC = () => {
  const [activeChild, setActiveChild] = useState('child_1');
  const [activeTab, setActiveTab] = useState<'overview' | 'assign' | 'review' | 'report'>('overview');
  
  // Controls state
  const [studyModeLock, setStudyModeLock] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(4); // hours
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Assign Test form state
  const [assignForm, setAssignForm] = useState({
    subject: 'গণিত',
    chapter: 'অধ্যায় ৩: বীজগণিতীয় রাশিমালা',
    duration: 30,
    mcqCount: 15,
    creativeCount: 2,
    difficulty: 'medium'
  });

  // Mock Children
  const children = [
    { id: 'child_1', name: 'আরাফাত রহমান', grade: '৮ম শ্রেণী', roll: '০৪', avatar: 'https://picsum.photos/seed/child1/100' },
    { id: 'child_2', name: 'সুমাইয়া বিনতে', grade: '৫ম শ্রেণী', roll: '১২', avatar: 'https://picsum.photos/seed/child2/100' }
  ];

  const currentChild = children.find(c => c.id === activeChild) || children[0];

  const stats = [
    { label: 'আজকের পড়ার সময়', value: '৩.৫ ঘণ্টা', icon: <Clock className="text-blue-600" />, trend: '+১২%' },
    { label: 'কুইজ স্কোর (গড়)', value: '৮৫%', icon: <Target className="text-emerald-600" />, trend: '+৫%' },
    { label: 'অর্জিত পয়েন্ট', value: '১২৫০ XP', icon: <TrendingUp className="text-amber-600" />, trend: '+১৫০' },
  ];

  const recentActivities = [
    { id: 1, task: 'সালোকসংশ্লেষণ কুইজ সম্পন্ন করেছে (স্কোর: ৯/১০)', time: '১০ মিনিট আগে', status: 'success' },
    { id: 2, task: 'গণিত অধ্যায় ৫ সমাধান ও রিভিশন সম্পন্ন', time: '১ ঘণ্টা আগে', status: 'success' },
    { id: 3, task: 'ইংরেজি গ্রামার রাইট ফর্ম অফ ভার্বস স্টাডি', time: '২ ঘণ্টা আগে', status: 'pending' },
  ];

  // Assigned Tests
  const [assignedTests, setAssignedTests] = useState([
    {
      id: 'test-101',
      title: 'গণিত সাপ্তাহিক মূল্যায়ন',
      subject: 'গণিত',
      chapter: 'বীজগণিত ও সমীকরণ',
      questions: 15,
      duration: 30,
      status: 'submitted',
      score: 88,
      submittedAt: 'আজ, সকাল ১১:৩০',
      aiFeedback: 'বীজগণিতের সূত্রে খুবই ভালো দখল রয়েছে। তবে ৩ নম্বর প্রশ্নে চিহ্ন সতর্কতার প্রয়োজন।',
      parentComment: 'খুব ভালো হয়েছে বাবা! পরের পরীক্ষায় ৯০% আশা করছি।'
    },
    {
      id: 'test-102',
      title: 'বিজ্ঞান ও পরিবেশ কুইজ',
      subject: 'বিজ্ঞান',
      chapter: 'পরিবেশ ও বাস্তুতন্ত্র',
      questions: 10,
      duration: 20,
      status: 'pending',
      score: null,
      submittedAt: null,
      aiFeedback: null,
      parentComment: null
    }
  ]);

  const [parentFeedbackInput, setParentFeedbackInput] = useState('');

  const handleAssignTest = (e: React.FormEvent) => {
    e.preventDefault();
    const newTest = {
      id: 'test-' + Date.now(),
      title: `${assignForm.subject} - ${assignForm.chapter.split(':')[0]} স্পেশাল টেস্ট`,
      subject: assignForm.subject,
      chapter: assignForm.chapter,
      questions: assignForm.mcqCount,
      duration: assignForm.duration,
      status: 'pending',
      score: null,
      submittedAt: null,
      aiFeedback: null,
      parentComment: null
    };

    setAssignedTests([newTest, ...assignedTests]);
    setAlertSuccess(`"${currentChild.name}" এর ড্যাশবোর্ডে নতুন পরীক্ষা সফলভাবে অ্যাসাইন করা হয়েছে!`);
    setTimeout(() => setAlertSuccess(null), 4000);
    setActiveTab('review');
  };

  const handleAddParentComment = (testId: string) => {
    if (!parentFeedbackInput.trim()) return;
    setAssignedTests(assignedTests.map(t => {
      if (t.id === testId) {
        return { ...t, parentComment: parentFeedbackInput.trim() };
      }
      return t;
    }));
    setParentFeedbackInput('');
    setAlertSuccess('আপনার মূল্যায়ন ও উৎসাহব্যঞ্জক বার্তা সন্তানের কাছে পৌঁছে গেছে!');
    setTimeout(() => setAlertSuccess(null), 4000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
            <Shield size={14} className="text-indigo-600" />
            প্যারেন্টাল কেয়ার ও অ্যাকাডেমিক ট্র্যাকিং
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Shield size={24} />
            </div>
            অভিভাবক <span className="text-indigo-600">কন্ট্রোল হাব</span>
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            সন্তানদের পড়ার সময়, কাস্টম পরীক্ষা নির্ধারণ ও সাপ্তাহিক রেজাল্ট কার্ড এক নজরে পর্যবেক্ষণ করুন।
          </p>
        </div>

        {/* Child Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveChild(child.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeChild === child.id 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <img src={child.avatar} alt={child.name} className="w-8 h-8 rounded-full border border-white/40" />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold">{child.name}</div>
                <div className={`text-[10px] ${activeChild === child.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {child.grade} • রোল {child.roll}
                </div>
              </div>
            </button>
          ))}
        </div>
      </header>

      {/* Success Banner */}
      {alertSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold shadow-xs"
        >
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span>{alertSuccess}</span>
        </motion.div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ওভারভিউ ও মনিটরিং
        </button>
        <button
          onClick={() => setActiveTab('assign')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'assign' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Send size={16} />
          পরীক্ষা নির্ধারণ করুন
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'review' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck size={16} />
          খাতা মূল্যায়ন ও মন্তব্য ({assignedTests.length})
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'report' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Printer size={16} />
          ডিজিটাল রিপোর্ট কার্ড
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 border-none shadow-xl bg-white hover:shadow-2xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-500 mt-1">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Activity Log */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Activity size={18} className="text-indigo-600" />
                    {currentChild.name} এর আজকের স্টাডি লগ
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    সক্রিয় স্টাডি সেশন
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          activity.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {activity.status === 'success' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{activity.task}</h4>
                          <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Progress Summary */}
              <Card className="p-8 border-none shadow-xl bg-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                    <BarChart3 size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">সাপ্তাহিক প্রগ্রেস সামারি</h3>
                    <p className="text-slate-500 text-sm mt-1 max-w-md">
                      গত এক সপ্তাহে {currentChild.name} এর পড়ার সময় এবং সাফল্যের হার ১৮% বৃদ্ধি পেয়েছে।
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('report')}
                  className="rounded-xl shrink-0 cursor-pointer font-bold"
                >
                  পূর্ণাঙ্গ রিপোর্ট কার্ড দেখুন
                </Button>
              </Card>
            </div>

            {/* Parental Control & Screen Time */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl shadow-xl bg-indigo-600 text-white space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-white">
                  <Target size={20} />
                  আজকের অভিভাবকীয় লক্ষ্য
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20">
                    <CheckCircle2 size={18} className="text-emerald-300" />
                    <span className="text-sm font-medium text-white">২টি কুইজ সম্পন্ন করা (হয়েছে)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20">
                    <Clock size={18} className="text-amber-300" />
                    <span className="text-sm font-medium text-white">১ ঘণ্টা গণিত প্র্যাকটিস (চলমান)</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('assign')}
                  className="w-full bg-white text-indigo-950 hover:bg-slate-100 font-black py-3 rounded-xl mt-4 text-xs cursor-pointer border-none shadow-md"
                >
                  সন্তানকে নতুন টেস্ট দিন
                </Button>
              </div>

              {/* Control Switches */}
              <Card className="p-6 border-none shadow-xl bg-white space-y-5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={18} className="text-indigo-600" />
                  প্যারেন্টাল কন্ট্রোল ও স্ক্রিন টাইম
                </h3>
                
                {/* Study Mode Lock */}
                <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-slate-800 block">স্টাডি মোড লক</span>
                    <span className="text-xs text-slate-500">অন থাকলে গেমিং ও অপ্রয়োজনীয় ব্রাউজিং বন্ধ থাকে</span>
                  </div>
                  <button
                    onClick={() => setStudyModeLock(!studyModeLock)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      studyModeLock ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      studyModeLock ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Daily Hours Limit */}
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">দৈনিক স্ক্রিন টাইম লিমিট</span>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {dailyLimit} ঘণ্টা
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>১ ঘণ্টা</span>
                    <span>৪ ঘণ্টা (আদর্শ)</span>
                    <span>৮ ঘণ্টা</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    সন্তান টানা ৪৫ মিনিট পড়াশোনা করলে ১৫ মিনিটের হালকা বিরতি নেওয়ার নির্দেশ স্বয়ংক্রিয়ভাবে স্ক্রিনে দেখানো হয়।
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGN TEST */}
      {activeTab === 'assign' && (
        <Card className="p-6 sm:p-8 border-none shadow-xl bg-white max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Send className="text-indigo-600" />
              {currentChild.name} এর জন্য কাস্টম পরীক্ষা নির্ধারণ
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              আপনার ইচ্ছামতো বিষয়, অধ্যায়, সময় ও প্রশ্নের সংখ্যা নির্ধারণ করে সরাসরি সন্তানের পোর্টালে পাঠিয়ে দিন।
            </p>
          </div>

          <form onSubmit={handleAssignTest} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">বিষয় নির্বাচন করুন</label>
                <select
                  value={assignForm.subject}
                  onChange={(e) => setAssignForm({ ...assignForm, subject: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm bg-white"
                >
                  <option value="গণিত">গণিত</option>
                  <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                  <option value="রসায়ন">রসায়ন</option>
                  <option value="বিজ্ঞান">বিজ্ঞান</option>
                  <option value="ইংরেজি">ইংরেজি</option>
                  <option value="বাংলা">বাংলা</option>
                  <option value="আইসিটি">আইসিটি</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">অধ্যায় / টপিক</label>
                <input
                  type="text"
                  value={assignForm.chapter}
                  onChange={(e) => setAssignForm({ ...assignForm, chapter: e.target.value })}
                  placeholder="যেমন: অধ্যায় ৪: কাজ ও শক্তি"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">MCQ প্রশ্ন সংখ্যা</label>
                <select
                  value={assignForm.mcqCount}
                  onChange={(e) => setAssignForm({ ...assignForm, mcqCount: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-sm bg-white"
                >
                  <option value={10}>১০টি প্রশ্ন</option>
                  <option value={15}>১৫টি প্রশ্ন</option>
                  <option value={20}>২০টি প্রশ্ন</option>
                  <option value={30}>৩০টি প্রশ্ন</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">সময়সীমা</label>
                <select
                  value={assignForm.duration}
                  onChange={(e) => setAssignForm({ ...assignForm, duration: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-sm bg-white"
                >
                  <option value={15}>১৫ মিনিট</option>
                  <option value={30}>৩০ মিনিট</option>
                  <option value={45}>৪৫ মিনিট</option>
                  <option value={60}>৬০ মিনিট</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">কঠিনতার স্তর</label>
                <select
                  value={assignForm.difficulty}
                  onChange={(e) => setAssignForm({ ...assignForm, difficulty: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-semibold text-sm bg-white"
                >
                  <option value="easy">সহজ (মৌলিক)</option>
                  <option value="medium">মাঝারি (বোর্ড স্ট্যান্ডার্ড)</option>
                  <option value="hard">কঠিন (মেধা যাচাই)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
              <Sparkles size={20} className="text-indigo-600 shrink-0" />
              <p className="text-xs text-indigo-900 font-medium">
                অ্যাসাইন করার সাথে সাথে এআই স্বয়ংক্রিয়ভাবে পাঠ্যক্রমের আলোকে প্রশ্নপত্র তৈরি করে পরীক্ষা শুরু করতে তৈরি রাখবে।
              </p>
            </div>

            <Button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send size={18} />
              পরীক্ষা অ্যাসাইন করুন
            </Button>
          </form>
        </Card>
      )}

      {/* TAB 3: REVIEW EXAMS */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FileCheck className="text-indigo-600" />
              {currentChild.name} এর নির্ধারিত ও সম্পন্ন হওয়া পরীক্ষাসমূহ
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('assign')}
              className="text-xs font-bold cursor-pointer"
            >
              + নতুন পরীক্ষা দিন
            </Button>
          </div>

          <div className="space-y-4">
            {assignedTests.map((test) => (
              <Card key={test.id} className="p-6 border-none shadow-md bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {test.subject}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        test.status === 'submitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {test.status === 'submitted' ? 'খাতা জমা হয়েছে' : 'পরীক্ষা অপেক্ষায় আছে'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{test.title}</h3>
                    <p className="text-xs text-slate-500">{test.chapter} • {test.questions}টি প্রশ্ন • {test.duration} মিনিট</p>
                  </div>

                  {test.score !== null && (
                    <div className="text-right sm:self-center">
                      <div className="text-xs text-slate-400 font-bold uppercase">প্রাপ্ত স্কোর</div>
                      <div className="text-3xl font-black text-emerald-600">{test.score}%</div>
                    </div>
                  )}
                </div>

                {test.status === 'submitted' && (
                  <div className="space-y-3 pt-1">
                    {test.aiFeedback && (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                          <Sparkles size={14} className="text-indigo-600" /> এআই খাতা মূল্যায়নের সংক্ষিপ্ত ফিডব্যাক:
                        </span>
                        <p className="text-slate-600">{test.aiFeedback}</p>
                      </div>
                    )}

                    {test.parentComment ? (
                      <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                          <CheckCircle2 size={14} className="text-emerald-600" /> আপনার মন্তব্য সন্তানের কাছে পাঠানো হয়েছে:
                        </span>
                        <p className="text-emerald-800 font-medium">{test.parentComment}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">সন্তানকে উৎসাহ দিতে আপনার মন্তব্য বা পরামর্শ লিখুন:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="যেমন: শাবাশ! আরো ভালো করতে হবে..."
                            value={parentFeedbackInput}
                            onChange={(e) => setParentFeedbackInput(e.target.value)}
                            className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddParentComment(test.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-xl cursor-pointer"
                          >
                            মন্তব্য পাঠান
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REPORT CARD */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Printer className="text-indigo-600" />
              একাডেমিক প্রগ্রেস ও গ্রেড রিপোর্ট কার্ড
            </h2>
            <Button
              onClick={handlePrintReport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-200"
            >
              <Printer size={16} />
              রিপোর্ট প্রিন্ট / PDF সেভ করুন
            </Button>
          </div>

          <Card className="p-8 border-2 border-indigo-100 shadow-xl bg-white max-w-4xl mx-auto space-y-6">
            {/* Institute Header */}
            <div className="text-center border-b border-slate-200 pb-6 space-y-1">
              <div className="inline-flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900">
                দা<span className="text-emerald-600">পাঠশালা</span> ডিজিটাল অ্যাকাডেমিক প্ল্যাটফর্ম
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                সাপ্তাহিক ও মাসিক শিক্ষার্থী মূল্যায়ন প্রতিবেদন
              </p>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">শিক্ষার্থীর নাম</span>
                <span className="text-slate-900 font-bold text-sm">{currentChild.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">শ্রেণি ও রোল</span>
                <span className="text-slate-900 font-bold text-sm">{currentChild.grade} (রোল: {currentChild.roll})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">মোট পড়ার সময়</span>
                <span className="text-slate-900 font-bold text-sm">২৪.৫ ঘণ্টা (চলতি সপ্তাহ)</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">সামগ্রিক গ্রেড</span>
                <span className="text-emerald-600 font-black text-base">A+ (৮৮.৫%)</span>
              </div>
            </div>

            {/* Subject Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-600 font-bold text-xs uppercase">
                    <th className="pb-3 pl-2">বিষয়</th>
                    <th className="pb-3">সম্পন্ন কুইজ/পরীক্ষা</th>
                    <th className="pb-3">গড় নম্বর</th>
                    <th className="pb-3">পারদর্শিতা গ্রেড</th>
                    <th className="pb-3 pr-2">পর্যবেক্ষণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                  <tr>
                    <td className="py-3 pl-2 font-bold">সাধারণ ও উচ্চতর গণিত</td>
                    <td className="py-3">৬টি</td>
                    <td className="py-3 font-bold text-emerald-600">৯১%</td>
                    <td className="py-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">A+</span></td>
                    <td className="py-3 pr-2 text-slate-600">সূত্রের প্রয়োগে অসাধারণ দক্ষতা।</td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 font-bold">পদার্থবিজ্ঞান</td>
                    <td className="py-3">৫টি</td>
                    <td className="py-3 font-bold text-emerald-600">৮৫%</td>
                    <td className="py-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">A</span></td>
                    <td className="py-3 pr-2 text-slate-600">তাত্ত্বিক অংশ ভালো, গাণিতিক গতিবিদ্যায় মনোযোগ দরকার।</td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 font-bold">রসায়ন</td>
                    <td className="py-3">৪টি</td>
                    <td className="py-3 font-bold text-amber-600">৭৪%</td>
                    <td className="py-3"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">A-</span></td>
                    <td className="py-3 pr-2 text-slate-600">জৈব যৌগের বিক্রিয়াগুলো আরো ২ বার রিভিশন করতে হবে।</td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 font-bold">ইংরেজি ব্যাকরণ ও সাহিত্য</td>
                    <td className="py-3">৭টি</td>
                    <td className="py-3 font-bold text-emerald-600">৮৯%</td>
                    <td className="py-3"><span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">A+</span></td>
                    <td className="py-3 pr-2 text-slate-600">ভোকাবুলারি ও গ্রামার নিয়মে চমৎকার উন্নতি।</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recommendation Footer */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
              <Award size={22} className="text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-indigo-950">অভিভাবকের জন্য বিশেষ একাডেমিক পরামর্শ:</span>
                <p className="text-indigo-900 leading-relaxed">
                  {currentChild.name} নিয়মিত সময় দিয়ে পড়াশোনা সম্পন্ন করছে। রসায়নের ক্ষেত্রে আগামী সপ্তাহে অতিরিক্ত ২০ মিনিটের ডাউট সলভিং সেশন নেওয়ার সুপারিশ করা হচ্ছে।
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
