import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  BrainCircuit, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  Flame,
  Check,
  Zap,
  Target
} from 'lucide-react';
import { motion } from 'motion/react';

interface TopicReview {
  id: string;
  subject: string;
  chapter: string;
  retentionScore: number; // percentage
  status: 'critical' | 'warning' | 'mastered';
  lastReviewed: string;
  nextDue: string;
  keyFormula: string;
}

export const SmartRevisionHub: React.FC<{ onStartQuiz?: (subject: string) => void }> = ({ onStartQuiz }) => {
  const [revisionList, setRevisionList] = useState<TopicReview[]>([
    {
      id: 'rev-1',
      subject: 'রসায়ন',
      chapter: 'জৈব যৌগের নামকরণ ও বিক্রিয়া',
      retentionScore: 42,
      status: 'critical',
      lastReviewed: '৭ দিন আগে',
      nextDue: 'আজ আবশ্যক',
      keyFormula: 'কার্বোক্যাটায়ন স্থায়িত্ব ক্রম: ৩° > ২° > ১° > মিথাইল'
    },
    {
      id: 'rev-2',
      subject: 'উচ্চতর গণিত',
      chapter: 'ত্রিকোণমিতিক বিপরীত ফাংশন',
      retentionScore: 58,
      status: 'warning',
      lastReviewed: '৪ দিন আগে',
      nextDue: 'আজ আবশ্যক',
      keyFormula: 'tan⁻¹x + tan⁻¹y = tan⁻¹[(x+y)/(1-xy)]'
    },
    {
      id: 'rev-3',
      subject: 'পদার্থবিজ্ঞান',
      chapter: 'কাজ, ক্ষমতা ও শক্তি',
      retentionScore: 68,
      status: 'warning',
      lastReviewed: '৫ দিন আগে',
      nextDue: 'আগামীকাল',
      keyFormula: 'স্প্রিং বল দ্বারা কৃতকাজ W = ½ k (x₂² - x₁²)'
    },
    {
      id: 'rev-4',
      subject: 'ইংরেজি',
      chapter: 'Preposition & Idioms',
      retentionScore: 88,
      status: 'mastered',
      lastReviewed: '২ দিন আগে',
      nextDue: '৩ দিন পর',
      keyFormula: 'Senior, Junior, Prior এর পরে সর্বদাই to বসে'
    }
  ]);

  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
  const [streakDays, setStreakDays] = useState(7);
  const [activeTab, setActiveTab] = useState<'queue' | 'weakpoints' | 'routine'>('queue');

  const handleMarkReviewed = (id: string) => {
    if (completedTopicIds.includes(id)) {
      setCompletedTopicIds(completedTopicIds.filter(item => item !== id));
    } else {
      setCompletedTopicIds([...completedTopicIds, id]);
    }
  };

  const subjectMastery = [
    { name: 'পদার্থবিজ্ঞান', score: 85, color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'উচ্চতর গণিত', score: 72, color: 'bg-indigo-600', text: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'রসায়ন', score: 54, color: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
    { name: 'জীববিজ্ঞান', score: 80, color: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'ইংরেজি ব্যাকরণ', score: 88, color: 'bg-amber-600', text: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
            <Sparkles size={14} className="text-indigo-600" />
            স্পেসড রিপিটেশন অ্যালগরিদম দ্বারা চালিত
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BrainCircuit size={24} />
            </div>
            স্মার্ট রিভিশন ও উইক-পয়েন্ট ডায়াগনস্টিক
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ভুলে যাওয়ার আগে বৈজ্ঞানিক স্পেসড রিপিটেশন নিয়মে রিভিশন দিন এবং দুর্বল চ্যাপ্টারগুলো আয়ত্তে আনুন।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-4 py-2.5 rounded-2xl">
            <Flame className="text-orange-500 fill-orange-500" size={22} />
            <div>
              <p className="text-[10px] font-bold text-orange-400 uppercase">রিভিশন স্ট্রিক</p>
              <p className="text-lg font-black text-orange-600">{streakDays} দিন সক্রিয়</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'queue' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          আজকের রিভিশন টাস্ক ({revisionList.length - completedTopicIds.length})
        </button>
        <button
          onClick={() => setActiveTab('weakpoints')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'weakpoints' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          বিষয়ভিত্তিক দুর্বলতা বিশ্লেষণ
        </button>
        <button
          onClick={() => setActiveTab('routine')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'routine' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          সাপ্তাহিক রিভিশন রুটিন
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Clock className="text-indigo-600" size={20} />
                আজ রিভিশন করা আবশ্যক এমন অধ্যায়সমূহ
              </h2>
              <span className="text-xs font-bold text-slate-500">
                {completedTopicIds.length} / {revisionList.length} সম্পন্ন
              </span>
            </div>

            <div className="space-y-3">
              {revisionList.map((item) => {
                const isDone = completedTopicIds.includes(item.id);
                return (
                  <Card 
                    key={item.id} 
                    className={`p-5 transition-all border ${
                      isDone 
                        ? 'bg-slate-50/70 border-slate-200 opacity-75' 
                        : item.status === 'critical'
                        ? 'border-rose-200 bg-white hover:border-rose-300'
                        : 'border-slate-200 bg-white hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleMarkReviewed(item.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-1 cursor-pointer transition-colors ${
                            isDone 
                              ? 'bg-emerald-600 border-emerald-600 text-white' 
                              : 'border-slate-300 hover:border-emerald-500'
                          }`}
                        >
                          {isDone && <Check size={14} />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {item.subject}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'critical' 
                                ? 'bg-rose-100 text-rose-700' 
                                : item.status === 'warning'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              স্মরণ দক্ষতা: {item.retentionScore}%
                            </span>
                          </div>
                          <h3 className={`text-base font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {item.chapter}
                          </h3>
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                            💡 <span className="font-bold text-slate-900">স্মরণ সূত্র:</span> {item.keyFormula}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            সর্বশেষ পড়েছেন: {item.lastReviewed} • পরবর্তী শিডিউল: {item.nextDue}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-2 shrink-0">
                        <Button
                          variant={isDone ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleMarkReviewed(item.id)}
                          className="w-full text-xs font-bold"
                        >
                          {isDone ? 'সম্পন্ন হয়েছে' : 'রিভিশন সম্পন্ন'}
                        </Button>
                        {onStartQuiz && (
                          <button
                            onClick={() => onStartQuiz(item.subject)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 cursor-pointer"
                          >
                            কুইজ দিন →
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Retention Stats */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-900 text-white shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-200">
                <Target size={20} />
                <span className="font-bold text-sm text-white">হারম্যান এবিংহাউসের বিস্মরণ তত্ত্ব</span>
              </div>
              <p className="text-xs text-indigo-100 leading-relaxed">
                পড়ার ২৪ ঘণ্টার মধ্যে প্রায় ৬০% তথ্য মানুষ ভুলে যায়। কিন্তু ১ম দিন, ৩য় দিন এবং ৭ম দিনে মাত্র ৫ মিনিটের সংক্ষিপ্ত রিভিশন স্মৃতিশক্তিকে স্থায়ী (Long-term Memory) করে তোলে।
              </p>
              <div className="p-3 bg-white/10 rounded-xl border border-white/20 text-xs font-bold text-white flex items-center justify-between">
                <span>আজকের রিভিশন প্রগ্রেস</span>
                <span>{Math.round((completedTopicIds.length / revisionList.length) * 100)}%</span>
              </div>
            </div>

            <Card className="p-6 border-none shadow-md bg-white space-y-4">
              <h3 className="font-bold text-slate-900 text-base">রিভিশন রিমাইন্ডার অ্যালার্ট</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="font-medium text-slate-700">ডেইলি সন্ধ্যা ৭টায় নোটিফিকেশন</span>
                  <span className="text-emerald-600 font-bold">অন আছে</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="font-medium text-slate-700">কঠিন টপিকে ডাবল রিমাইন্ডার</span>
                  <span className="text-emerald-600 font-bold">অন আছে</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Weak Points Tab */}
      {activeTab === 'weakpoints' && (
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-md bg-white space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" />
              আপনার বিষয়ভিত্তিক পারদর্শিতা ও সম্ভাব্য দুর্বলতা
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjectMastery.map((sub) => (
                <div key={sub.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{sub.name}</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded ${sub.bg} ${sub.text}`}>
                      {sub.score}% পারদর্শিতা
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${sub.color}`} 
                      style={{ width: `${sub.score}%` }} 
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {sub.score < 60 
                      ? '⚠️ সতর্কতা: এই বিষয়ে গড় নম্বর কম। প্রতিদিন অন্তত ৩০ মিনিট বরাদ্দ করুন।' 
                      : sub.score < 80 
                      ? 'মোটামুটি ভালো, বিগত বছরের বোর্ড প্রশ্ন প্র্যাকটিস বাড়িয়ে দিন।' 
                      : 'চমৎকার! বর্তমান দক্ষতা ধরে রাখতে নিয়মিত রিভিশন দিন।'}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Routine Tab */}
      {activeTab === 'routine' && (
        <Card className="p-6 border-none shadow-md bg-white space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="text-indigo-600" />
            সাপ্তাহিক রিকমেন্ডেড রিভিশন রুটিন
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="pb-3 pl-2">বার</th>
                  <th className="pb-3">সকালের রিভিশন (৩০ মিনিট)</th>
                  <th className="pb-3">সন্ধ্যার রিভিশন (৪৫ মিনিট)</th>
                  <th className="pb-3">প্র্যাকটিস টেস্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                <tr>
                  <td className="py-3 pl-2 font-bold text-indigo-600">শনিবার</td>
                  <td className="py-3">উচ্চতর গণিত সূত্রাবলী</td>
                  <td className="py-3">পদার্থবিজ্ঞান ২য় অধ্যায়</td>
                  <td className="py-3 text-emerald-600 font-bold">২০ নম্বরের কুইজ</td>
                </tr>
                <tr>
                  <td className="py-3 pl-2 font-bold text-indigo-600">রবিবার</td>
                  <td className="py-3">ইংরেজি Vocabulary & Idioms</td>
                  <td className="py-3">রসায়ন পর্যায় সারণি</td>
                  <td className="py-3 text-emerald-600 font-bold">১৫ নম্বরের টেস্ট</td>
                </tr>
                <tr>
                  <td className="py-3 pl-2 font-bold text-indigo-600">সোমবার</td>
                  <td className="py-3">জীববিজ্ঞান ডায়াগ্রাম রিভিশন</td>
                  <td className="py-3">গণিত জ্যামিতি উপপাদ্য</td>
                  <td className="py-3 text-emerald-600 font-bold">মডেল টেস্ট ১</td>
                </tr>
                <tr>
                  <td className="py-3 pl-2 font-bold text-indigo-600">মঙ্গলবার</td>
                  <td className="py-3">আইসিটি লজিক গেইট</td>
                  <td className="py-3">পদার্থবিজ্ঞান গতিবিদ্যা</td>
                  <td className="py-3 text-emerald-600 font-bold">সাপ্তাহিক মূল্যায়ন</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
