import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  ChevronRight, 
  Award, 
  Eye, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { EXAMS } from '../../constants';
import { LiveExamEngine } from './LiveExamEngine';
import { Exam } from '../../types';
import { FinalMarksheetModal, FinalMarksheetData } from './FinalMarksheetModal';
import { PaidModelTestStore } from './PaidModelTestStore';

export const ExamPortal: React.FC = () => {
  const [examView, setExamView] = useState<'regular' | 'paid_store'>('regular');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [publishedTests, setPublishedTests] = useState<FinalMarksheetData[]>([]);
  const [selectedMarksheet, setSelectedMarksheet] = useState<FinalMarksheetData | null>(null);

  // Load published tests from localStorage and subscribe to real-time events
  useEffect(() => {
    const loadTests = () => {
      try {
        const saved = localStorage.getItem('dapathshala_parent_assigned_tests');
        if (saved) {
          const parsed = JSON.parse(saved);
          const published = parsed.filter((t: any) => t.isPublished || t.status === 'reviewed' || t.status === 'completed');
          if (published.length > 0) {
            setPublishedTests(published);
            return;
          }
        }
      } catch (e) {
        console.warn('Error loading published tests:', e);
      }

      // Default sample evaluated test with AI & Parent feedback if none exists
      const sampleEvaluated: FinalMarksheetData = {
        id: 'test-101',
        title: 'গণিত সাপ্তাহিক মূল্যায়ন',
        subject: 'গণিত',
        chapter: 'বীজগণিত ও সমীকরণ',
        childName: 'আরাফাত রহমান',
        score: 88,
        totalScoreObtained: 4.5,
        totalPossible: 5,
        publishedAt: 'আজ, দুপুর ১২:১৫',
        evaluationMode: 'ai',
        aiFeedback: 'বীজগণিতের মৌলিক সূত্রের প্রয়োগ ও প্রতিস্থাপন নির্ভুল হয়েছে। সামগ্রিক উপস্থাপনা ও গাণিতিক নির্ভুলতা চমৎকার। তবে সমীকরণ সমাধানের ৩ নম্বর প্রশ্নে পক্ষান্তরের চিহ্নে সামান্য সতর্কতা আবশ্যক।',
        parentComment: 'খুব চমৎকার পরীক্ষা দিয়েছ বাবা! বীজগণিতের দক্ষতা অনেক বেড়েছে। ৩ নম্বর প্রশ্নের চিহ্নটি ঠিক করে নাও, আগামী পরীক্ষায় ১০০% আশা করছি!',
        handwrittenImages: [
          '/assets/aistudio/image_fb59e449.png'
        ],
        aiDetailedMarking: [
          {
            questionId: 'q1',
            isCorrect: true,
            marksObtained: 1,
            maxMarks: 1,
            redInkNote: '✓ সঠিক উত্তর। সূত্রের সম্প্রসারণ ও ধাপসমূহ নির্ভুল হয়েছে।'
          },
          {
            questionId: 'q2',
            isCorrect: true,
            marksObtained: 1,
            maxMarks: 1,
            redInkNote: '✓ সঠিক উত্তর। (x + 1/x)² - 2 এর মান নির্ণয় নির্ভুল।'
          },
          {
            questionId: 'q3',
            isCorrect: false,
            marksObtained: 0.5,
            maxMarks: 1,
            isOverridden: true,
            redInkNote: '✗ ভুল নির্বাচন ছিল। তবে খাতার গাণিতিক যুক্তির আংশিক সঠিকতার কারণে অভিভাবক ০.৫ নম্বর প্রদান করেছেন।'
          },
          {
            questionId: 'q4',
            isCorrect: true,
            marksObtained: 1,
            maxMarks: 1,
            redInkNote: '✓ সঠিক উত্তর। পিথাগোরাসের উপপাদ্যের প্রয়োগ সঠিক।'
          },
          {
            questionId: 'q5',
            isCorrect: true,
            marksObtained: 1,
            maxMarks: 1,
            redInkNote: '✓ সঠিক উত্তর। মৌলিক সংখ্যার সংজ্ঞা অনুযায়ী সঠিক বিকল্প ২৩।'
          }
        ]
      };

      setPublishedTests([sampleEvaluated]);
    };

    loadTests();

    // Listen for custom published event from ParentDashboard
    const handlePublishedEvent = (e: any) => {
      if (e.detail) {
        setPublishedTests(prev => {
          const idx = prev.findIndex(t => t.id === e.detail.id || t.id === e.detail.examId);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = e.detail;
            return updated;
          }
          return [e.detail, ...prev];
        });
      }
    };

    window.addEventListener('dapathshala_marksheet_published', handlePublishedEvent);
    window.addEventListener('storage', loadTests);

    return () => {
      window.removeEventListener('dapathshala_marksheet_published', handlePublishedEvent);
      window.removeEventListener('storage', loadTests);
    };
  }, []);

  if (selectedExam) {
    return <LiveExamEngine exam={selectedExam} onClose={() => setSelectedExam(null)} />;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">পরীক্ষা পোর্টাল</h1>
          <p className="mt-1 text-slate-500">পরীক্ষা দিন, অভিভাবক ও এআই যৌথ মূল্যায়িত ফলাফল ও খাতা দেখুন।</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md">পরীক্ষার ইতিহাস</Button>
          <Button variant="primary" size="md">প্র্যাকটিস টেস্ট</Button>
        </div>
      </header>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setExamView('regular')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            examView === 'regular'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={18} />
          নিয়মিত পরীক্ষা ও ফলাফল
        </button>
        <button
          onClick={() => setExamView('paid_store')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            examView === 'paid_store'
              ? 'border-amber-600 text-amber-700 bg-amber-50/60 rounded-t-xl'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles size={18} className="text-amber-500" />
          কোচিং প্রিমিয়াম টেস্ট স্টোর (Paid)
          <span className="ml-1.5 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-black">
            ৳২৯ থেকে
          </span>
        </button>
      </div>

      {examView === 'paid_store' ? (
        <PaidModelTestStore />
      ) : (
        /* Main Grid */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">

          {/* PUBLISHED MARKSHEETS & EVALUATED SCRIPTS SECTION */}
          {publishedTests.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    অভিভাবক ও এআই অনুমোদিত খাতা
                  </div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Award className="text-indigo-600" size={22} />
                    মূল্যায়িত খাতা ও ফাইনাল রেজাল্ট শিট
                  </h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                  {publishedTests.length}টি মূল্যায়িত পরীক্ষা
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {publishedTests.map((test) => (
                  <Card 
                    key={test.id} 
                    className="p-5 sm:p-6 border-2 border-indigo-100 bg-gradient-to-r from-white via-indigo-50/20 to-emerald-50/20 shadow-md hover:shadow-xl transition-all rounded-3xl"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center font-black shadow-lg shadow-indigo-200 shrink-0">
                          <span className="text-base leading-none">{test.score}%</span>
                          <span className="text-[10px] font-bold text-indigo-200 mt-0.5">নম্বর</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                              {test.subject}
                            </span>
                            {test.chapter && (
                              <span className="text-xs text-slate-500 font-medium">
                                • {test.chapter}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 size={12} /> ফলাফল প্রকাশিত
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900">
                            {test.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-1 italic">
                            💬 অভিভাবক: "{test.parentComment || 'খাতা মূল্যায়ন ও ফাইনাল ফলাফল অনুমোদন সম্পন্ন হয়েছে।'}"
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => setSelectedMarksheet(test)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-indigo-200 cursor-pointer shrink-0"
                      >
                        <Eye size={16} />
                        ফাইনাল মার্কশিট ও খাতা দেখুন
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE EXAM NOTIFICATION CARD */}
          <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/30">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                <AlertCircle size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">চলমান পরীক্ষা: গণিত ফাইনাল</h2>
                <p className="mt-1 text-sm text-slate-600">আপনার একটি সক্রিয় পরীক্ষা সেশন রয়েছে। সময় শেষ হওয়ার আগে এটি সম্পন্ন করুন।</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Clock size={16} />
                    ৪৫:২০ বাকি
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="gap-2 cursor-pointer"
                    onClick={() => setSelectedExam(EXAMS[0])}
                  >
                    <Play size={14} />
                    পরীক্ষা চালিয়ে যান
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* AVAILABLE EXAMS */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">উপলব্ধ পরীক্ষাসমূহ</h2>
            {EXAMS.map((exam) => (
              <Card 
                key={exam.id} 
                className="group cursor-pointer transition-all hover:border-emerald-200 hover:shadow-lg"
                onClick={() => setSelectedExam(exam)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{exam.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {exam.duration} মিনিট
                        </span>
                        <span>•</span>
                        <span>{exam.subject}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-xl font-bold text-slate-900">আপনার পরিসংখ্যান</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">সম্পন্ন পরীক্ষা</p>
                  <p className="text-xl font-bold text-slate-900">২৪</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">গড় স্কোর</p>
                  <p className="text-xl font-bold text-slate-900">৮৮%</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="mt-8 w-full cursor-pointer">বিস্তারিত বিশ্লেষণ দেখুন</Button>
          </Card>

          <Card className="bg-slate-50 border-dashed border-2 border-slate-200">
            <h2 className="mb-2 text-lg font-bold text-slate-900">পরীক্ষার নির্দেশিকা</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                স্থিতিশীল ইন্টারনেট সংযোগ নিশ্চিত করুন।
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                পরীক্ষার সময় ট্যাব বা উইন্ডো পরিবর্তন করবেন না।
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                পরীক্ষা শেষে হাতের লেখা উত্তরপত্রের ছবি আপলোড করতে পারবেন।
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                অভিভাবক ও এআই দ্বারা মূল্যায়নের পর মার্কশিট দেখতে পাবেন।
              </li>
            </ul>
          </Card>
        </div>
      </div>
      )}

      {/* RENDER FINAL MARKSHEET MODAL */}
      {selectedMarksheet && (
        <FinalMarksheetModal
          data={selectedMarksheet}
          onClose={() => setSelectedMarksheet(null)}
        />
      )}
    </div>
  );
};
