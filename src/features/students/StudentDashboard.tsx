import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Book, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Flame, 
  Star, 
  ArrowRight, 
  Zap,
  Gift,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { EXAMS, NOTES } from '../../constants';

export const StudentDashboard: React.FC = () => {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome & Retention Banner */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            শিক্ষার্থী ড্যাশবোর্ড
          </h1>
          <p className="text-slate-500 flex items-center gap-2">
            স্বাগতম, <span className="text-emerald-600 font-bold">জামাল!</span> আজকের লক্ষ্য পূরণ করতে প্রস্তুত?
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-2xl shadow-sm"
          >
            <Flame className="text-orange-500 fill-orange-500" size={20} />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-orange-400 uppercase leading-none">Streak</span>
              <span className="text-lg font-black text-orange-600 leading-none">১২ দিন</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl shadow-sm"
          >
            <Zap className="text-emerald-500 fill-emerald-500" size={20} />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-400 uppercase leading-none">Points</span>
              <span className="text-lg font-black text-emerald-600 leading-none">২৪৫০</span>
            </div>
          </motion.div>

          <Button variant="primary" size="lg" className="rounded-2xl shadow-lg shadow-emerald-200 gap-2">
            শেখা শুরু করুন
            <ArrowRight size={18} />
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'কোর্সসমূহ', value: '১২', icon: Book, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'অধ্যয়নের সময়', value: '৪৫.৫', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'গড় স্কোর', value: '৮৮%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'সার্টিফিকেট', value: '৪', icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
            >
              <Card className="flex items-center gap-4 border-none shadow-sm hover:shadow-md transition-shadow">
                <div className={`rounded-2xl p-4 ${stat.bg}`}>
                  <Icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Upcoming Exams */}
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="text-emerald-600" />
                আসন্ন পরীক্ষাসমূহ
              </h2>
              <Button variant="outline" size="sm" className="rounded-xl">সব দেখুন</Button>
            </div>
            <div className="space-y-4">
              {EXAMS.slice(0, 3).map((exam) => (
                <div key={exam.id} className="group flex items-center justify-between rounded-2xl border border-slate-100 p-4 transition-all hover:bg-slate-50 hover:border-emerald-100">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <span className="text-[10px] font-bold uppercase">{new Date(exam.date).toLocaleString('bn-BD', { month: 'short' })}</span>
                      <span className="text-xl font-black leading-none">{new Date(exam.date).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{exam.title}</h3>
                      <p className="text-sm text-slate-500">{exam.subject} • {exam.duration} মিনিট</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600">
                    অংশ নিন
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Business Trick: Recommended Notes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" />
                আপনার জন্য সেরা নোটসমূহ
              </h2>
              <Button variant="outline" size="sm" className="rounded-xl">স্টোর ভিজিট করুন</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {NOTES.slice(0, 2).map((note) => (
                <Card key={note.id} className="p-0 overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
                  <div className="relative h-32">
                    <img src={note.previewUrl} alt={note.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-emerald-700 shadow-sm">
                      ৳{note.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-900 line-clamp-1">{note.title}</h3>
                    <p className="text-xs text-slate-500 mb-3">{note.author}</p>
                    <Button variant="primary" size="sm" className="w-full rounded-xl gap-2">
                      <Zap size={14} />
                      এখনই কিনুন
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 space-y-8">
          {/* Daily Progress */}
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-emerald-600 text-white">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              দৈনিক লক্ষ্য
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span>আজকের প্রগ্রেস</span>
                <span>৭৫%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <p className="text-xs text-emerald-100 italic">
                "আর মাত্র ২৫% বাকি! আজকের লক্ষ্য পূরণ করলে আপনি ৫০ বোনাস পয়েন্ট পাবেন।"
              </p>
            </div>
          </Card>

          {/* Activity Feed */}
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <h2 className="mb-6 text-xl font-bold text-slate-900 flex items-center gap-2">
              <Gift className="text-purple-600" />
              সাম্প্রতিক কার্যক্রম
            </h2>
            <div className="space-y-6">
              {[
                { activity: 'গণিত কুইজ সম্পন্ন হয়েছে', time: '২ ঘণ্টা আগে', type: 'quiz', points: '+২০' },
                { activity: 'পদার্থবিজ্ঞান নোট কেনা হয়েছে', time: '৫ ঘণ্টা আগে', type: 'purchase', points: '-৫০' },
                { activity: 'রসায়ন লাইভ ক্লাসে যোগদান', time: 'গতকাল', type: 'class', points: '+১০' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="relative mt-1">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 group-hover:ring-emerald-100 transition-all" />
                    {i !== 2 && <div className="absolute top-3 left-1.5 h-12 w-px bg-slate-100" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{item.activity}</p>
                      <span className={`text-[10px] font-black ${item.points.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                        {item.points}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-8 w-full rounded-xl gap-2 group">
              সব কার্যক্রম দেখুন
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

