import React from 'react';
import { Card } from '../../components/ui/Card';
import { 
  Award, 
  Lock, 
  CheckCircle2, 
  Star, 
  Zap, 
  Flame, 
  BookOpen, 
  Target,
  Trophy
} from 'lucide-react';
import { motion } from 'motion/react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isUnlocked: boolean;
  progress: number;
  total: number;
}

export const Achievements: React.FC = () => {
  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'প্রথম পদক্ষেপ',
      description: 'আপনার প্রথম কুইজ সম্পন্ন করুন',
      icon: <Zap size={24} />,
      color: 'bg-amber-500',
      isUnlocked: true,
      progress: 1,
      total: 1
    },
    {
      id: '2',
      title: 'ধারাবাহিক শিক্ষার্থী',
      description: 'টানা ৭ দিন পড়াশোনা করুন',
      icon: <Flame size={24} />,
      color: 'bg-orange-500',
      isUnlocked: false,
      progress: 4,
      total: 7
    },
    {
      id: '3',
      title: 'কুইজ মাস্টার',
      description: '১০০টি এমসিকিউ সঠিক উত্তর দিন',
      icon: <Trophy size={24} />,
      color: 'bg-indigo-500',
      isUnlocked: false,
      progress: 65,
      total: 100
    },
    {
      id: '4',
      title: 'বই পোকা',
      description: '১০টি পিডিএফ ফাইল পড়ুন',
      icon: <BookOpen size={24} />,
      color: 'bg-emerald-500',
      isUnlocked: true,
      progress: 10,
      total: 10
    },
    {
      id: '5',
      title: 'লক্ষ্যভেদী',
      description: '৫টি স্টাডি প্ল্যান সম্পন্ন করুন',
      icon: <Target size={24} />,
      color: 'bg-rose-500',
      isUnlocked: false,
      progress: 2,
      total: 5
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Award size={24} />
          </div>
          আপনার <span className="text-indigo-600">অর্জনসমূহ</span>
        </h1>
        <p className="mt-1 text-slate-500">আপনার শেখার যাত্রার মাইলস্টোন এবং অর্জিত ব্যাজগুলো দেখুন।</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, i) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative overflow-hidden border-none shadow-xl transition-all h-full ${
              achievement.isUnlocked ? 'bg-white' : 'bg-slate-50 opacity-80'
            }`}>
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {achievement.isUnlocked ? (
                  <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
                    <CheckCircle2 size={16} />
                  </div>
                ) : (
                  <div className="bg-slate-200 text-slate-400 p-1 rounded-full">
                    <Lock size={16} />
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${achievement.color} ${
                  !achievement.isUnlocked && 'grayscale'
                }`}>
                  {achievement.icon}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{achievement.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{achievement.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                    <span>প্রগ্রেস</span>
                    <span>{achievement.progress} / {achievement.total}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      className={`h-full rounded-full ${achievement.isUnlocked ? 'bg-emerald-500' : 'bg-indigo-400'}`}
                    />
                  </div>
                </div>
              </div>

              {achievement.isUnlocked && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Rewards Summary */}
      <Card className="p-8 border-none shadow-2xl bg-indigo-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
          <Trophy size={160} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold">আপনি একজন উদীয়মান তারকা!</h2>
            <p className="text-indigo-100 max-w-md">
              আপনি ইতিমধ্যে ২ টি ব্যাজ অর্জন করেছেন এবং আরও ৩ টি অর্জনের পথে আছেন। আপনার ধারাবাহিকতা বজায় রাখুন!
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-black">১২৫০</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">মোট XP</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-black">০২</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">ব্যাজ</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
