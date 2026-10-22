import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Clock, CheckCircle, AlertCircle, Play, ChevronRight, Award } from 'lucide-react';
import { EXAMS } from '../../constants';
import { LiveExamEngine } from './LiveExamEngine';
import { Exam } from '../../types';

export const ExamPortal: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  if (selectedExam) {
    return <LiveExamEngine exam={selectedExam} onClose={() => setSelectedExam(null)} />;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">পরীক্ষা পোর্টাল</h1>
          <p className="mt-1 text-slate-500">পরীক্ষা দিন, ফলাফল দেখুন এবং আপনার পারফরম্যান্স ট্র্যাক করুন।</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md">পরীক্ষার ইতিহাস</Button>
          <Button variant="primary" size="md">প্র্যাকটিস টেস্ট</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
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
                    className="gap-2"
                    onClick={() => setSelectedExam(EXAMS[0])}
                  >
                    <Play size={14} />
                    পরীক্ষা চালিয়ে যান
                  </Button>
                </div>
              </div>
            </div>
          </Card>

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
                  <p className="text-xl font-bold text-slate-900">৮২.৫%</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="mt-8 w-full">বিস্তারিত বিশ্লেষণ দেখুন</Button>
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
                পরীক্ষার সময় পেজ রিফ্রেশ করবেন না।
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                প্রয়োজন হলে ক্যামেরা চালু রাখুন।
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
