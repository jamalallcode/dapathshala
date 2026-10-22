import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Clock, 
  Trophy, 
  Target, 
  ShieldAlert, 
  Lock, 
  Maximize2, 
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Timer,
  Eye
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ExamAssignment } from '../../types';

export const ChildDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<ExamAssignment[]>([
    {
      id: 'exam-2',
      parentId: 'parent-1',
      childId: 'child-1',
      subject: 'গণিত',
      chapter: 'অধ্যায় ৩: পরিমাপ',
      class: '৮ম',
      duration: 60,
      status: 'pending',
      config: { mcqCount: 20, creativeCount: 5, difficulty: 'hard' }
    }
  ]);

  const [activeExam, setActiveExam] = useState<ExamAssignment | null>(null);
  const [isLockdown, setIsLockdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 mins in seconds
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Lockdown simulation: Tab change detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isLockdown) {
        setTabSwitchCount(prev => prev + 1);
        alert('সতর্কবার্তা: ট্যাব পরিবর্তন করার চেষ্টা করা হয়েছে! ৩ বার ট্যাব পরিবর্তন করলে পরীক্ষা অটো-সাবমিট হয়ে যাবে।');
        if (tabSwitchCount >= 2) {
          handleFinishExam();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLockdown, tabSwitchCount]);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (isLockdown && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isLockdown) {
      handleFinishExam();
    }
    return () => clearInterval(timer);
  }, [isLockdown, timeLeft]);

  const handleStartExam = (exam: ExamAssignment) => {
    setActiveExam(exam);
    setIsLockdown(true);
    setTimeLeft(exam.duration * 60);
    // Request fullscreen (simulated)
    if (document.documentElement.requestFullscreen) {
      // document.documentElement.requestFullscreen(); // Disabled for preview safety
    }
  };

  const handleFinishExam = () => {
    setIsLockdown(false);
    setActiveExam(null);
    alert('পরীক্ষা সফলভাবে জমা দেওয়া হয়েছে! আপনার বাবার কাছে নোটিফিকেশন পাঠানো হয়েছে।');
    // Update status in local state
    setAssignments(prev => prev.map(a => a.id === activeExam?.id ? { ...a, status: 'submitted' } : a));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLockdown && activeExam) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col">
        {/* Exam Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="font-bold">{activeExam.subject} - {activeExam.chapter}</h2>
              <p className="text-xs text-slate-400">অ্যান্টি-চিটিং শিল্ড সক্রিয় আছে</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-full border border-slate-600">
              <Timer size={18} className="text-emerald-400" />
              <span className="font-mono text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>
            <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleFinishExam}>
              জমা দিন
            </Button>
          </div>
        </div>

        {/* Exam Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="p-8 border-slate-200">
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">প্রশ্ন ১ (MCQ)</span>
                  <p className="text-lg font-bold text-slate-900 mt-2">নিচের কোনটি মৌলিক সংখ্যা নয়?</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {['২', '৩', '৫', '৯'].map((opt, i) => (
                    <button key={i} className="w-full p-4 text-left rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400 group-hover:border-emerald-500 group-hover:text-emerald-600">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-medium text-slate-700">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-8 border-slate-200">
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">প্রশ্ন ২ (সৃজনশীল)</span>
                  <p className="text-lg font-bold text-slate-900 mt-2">একটি আয়তাকার বাগানের দৈর্ঘ্য প্রস্থের ৩ গুণ। বাগানটির ক্ষেত্রফল ৩০০ বর্গমিটার হলে এর পরিসীমা কত?</p>
                </div>
                <textarea 
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="আপনার উত্তর এখানে লিখুন..."
                ></textarea>
              </div>
            </Card>
          </div>
        </div>

        {/* Lockdown Footer */}
        <div className="bg-slate-800 p-3 text-center text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
          Lockdown Mode: Fullscreen & Tab Monitoring Active • Tab Switches: {tabSwitchCount}/3
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">লার্নিং ও অ্যাকশন ড্যাশবোর্ড</h1>
          <p className="text-slate-500">তোমার বাবা তোমার জন্য নতুন পরীক্ষা পাঠিয়েছেন</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Trophy className="text-amber-500" size={20} />
            <span className="font-bold">৪৫০ পয়েন্ট</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Target className="text-emerald-500" size={20} />
            <span className="font-bold">লেভেল ৮</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            অপেক্ষমান পরীক্ষা
          </h2>

          <div className="space-y-4">
            {assignments.filter(a => a.status === 'pending').map(assignment => (
              <Card key={assignment.id} className="p-6 border-slate-200 bg-gradient-to-r from-white to-emerald-50/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
                      <Play size={28} fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{assignment.subject}</h3>
                      <p className="text-slate-600 font-medium">{assignment.chapter}</p>
                      <div className="flex gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={14} /> {assignment.duration} মিনিট</span>
                        <span className="flex items-center gap-1"><Maximize2 size={14} /> ২০টি MCQ</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    className="rounded-2xl px-8 py-6 text-lg shadow-xl shadow-emerald-200"
                    onClick={() => handleStartExam(assignment)}
                  >
                    পরীক্ষা শুরু করো
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </div>
              </Card>
            ))}

            {assignments.filter(a => a.status === 'pending').length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-900">সব পরীক্ষা শেষ!</h3>
                <p className="text-slate-500 text-sm mt-1">আপাতত তোমার জন্য কোনো নতুন পরীক্ষা নেই।</p>
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-12">সাম্প্রতিক ফলাফল</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                ৮৫%
              </div>
              <div>
                <p className="font-bold text-slate-900">বিজ্ঞান - অধ্যায় ২</p>
                <p className="text-xs text-slate-500">বাবার ফিডব্যাক: "খুব ভালো হয়েছে!"</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto p-2">
                <Eye size={16} />
              </Button>
            </Card>
          </div>
        </div>

        {/* Sidebar: Notifications & Tips */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Lock size={18} className="text-blue-600" />
              সিকিউরিটি রুলস
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">১</div>
                <p className="text-xs text-slate-600 leading-relaxed">পরীক্ষা চলাকালীন অন্য কোনো ট্যাব বা অ্যাপ ওপেন করা যাবে না।</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">২</div>
                <p className="text-xs text-slate-600 leading-relaxed">ট্যাব পরিবর্তন করলে ৩ বার সতর্কবার্তা দেওয়া হবে, এরপর অটো-সাবমিট হবে।</p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">৩</div>
                <p className="text-xs text-slate-600 leading-relaxed">সময় শেষ হলে খাতা স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-slate-200 bg-emerald-600 text-white">
            <h3 className="font-bold mb-2">আজকের টিপস</h3>
            <p className="text-sm text-emerald-100 leading-relaxed italic">
              "গণিতের পরিমাপ অধ্যায়ে একক পরিবর্তনের দিকে খেয়াল রেখো। মিটার থেকে সেন্টিমিটারে নিতে ১০০ দিয়ে গুণ করতে হয়।"
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
