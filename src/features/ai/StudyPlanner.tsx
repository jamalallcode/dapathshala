import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Calendar, 
  Clock, 
  Target, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  BookOpen,
  Coffee,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGeminiApiKey } from '../../lib/gemini';

interface StudySession {
  day: string;
  topic: string;
  duration: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  tasks: string[];
}

export const StudyPlanner: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<StudySession[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = async () => {
    if (!goal) return;
    
    setIsLoading(true);
    setPlan([]);
    setError(null);

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        setError("এপিআই কী (API Key) সেট করা নেই। দয়া করে সেটিংস থেকে GEMINI_API_KEY যোগ করুন।");
        setIsLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Create a 7-day personalized study plan for the goal: "${goal}". The user can study ${hoursPerDay} hours per day. The output MUST be a valid JSON array of 7 objects. Each object MUST have: "day" (e.g., Day 1), "topic", "duration", "timeOfDay" (one of: morning, afternoon, evening), and "tasks" (array of 3 specific tasks). Language: Bengali.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                topic: { type: Type.STRING },
                duration: { type: Type.STRING },
                timeOfDay: { type: Type.STRING, enum: ['morning', 'afternoon', 'evening'] },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["day", "topic", "duration", "timeOfDay", "tasks"],
            },
          },
        },
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        setPlan(result);
      }
    } catch (err: any) {
      console.error(err);
      setError("স্টাডি প্ল্যান তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'morning': return <Sun className="text-orange-500" size={18} />;
      case 'afternoon': return <Coffee className="text-amber-600" size={18} />;
      case 'evening': return <Moon className="text-indigo-600" size={18} />;
      default: return <Clock size={18} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
              <Calendar size={24} />
            </div>
            স্মার্ট <span className="text-violet-600">স্টাডি প্ল্যানার</span>
          </h1>
          <p className="mt-1 text-slate-500">আপনার লক্ষ্যের জন্য এআই-চালিত কাস্টম রুটিন তৈরি করুন।</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Target size={16} className="text-violet-600" />
                  আপনার লক্ষ্য (Goal)
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="উদা: বিসিএস প্রিলিমিনারি প্রস্তুতি, এইচএসসি গণিত রিভিশন..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:outline-none transition-all min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Clock size={16} className="text-violet-600" />
                  প্রতিদিন পড়ার সময়: <span className="text-violet-600">{hoursPerDay} ঘণ্টা</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>১ ঘণ্টা</span>
                  <span>১৬ ঘণ্টা</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full py-6 text-lg rounded-2xl shadow-xl shadow-violet-200 gap-2 bg-violet-600 hover:bg-violet-700"
                onClick={generatePlan}
                disabled={!goal || isLoading}
                isLoading={isLoading}
              >
                {!isLoading && <Sparkles size={20} />}
                প্ল্যান তৈরি করুন
              </Button>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Plan Display */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 gap-4"
              >
                <Loader2 className="animate-spin text-violet-600" size={48} />
                <p className="text-lg font-bold text-slate-600 animate-pulse">আপনার জন্য সেরা রুটিন তৈরি হচ্ছে...</p>
              </motion.div>
            ) : plan.length > 0 ? (
              <motion.div
                key="plan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {plan.map((session, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="p-0 overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-32 bg-slate-50 p-4 flex flex-col items-center justify-center border-r border-slate-100 group-hover:bg-violet-50 transition-colors">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{session.day}</span>
                          <div className="mt-2 p-2 bg-white rounded-lg shadow-sm">
                            {getTimeIcon(session.timeOfDay)}
                          </div>
                        </div>
                        <div className="flex-1 p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">{session.topic}</h3>
                              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                <Clock size={14} />
                                {session.duration} সেশন
                              </p>
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              সক্রিয়
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {session.tasks.map((task, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                                <span className="truncate">{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                <div className="flex justify-center pt-6">
                  <Button variant="outline" className="rounded-xl gap-2">
                    প্ল্যানটি সেভ করুন
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 text-slate-300 rounded-3xl mb-6">
                  <BookOpen size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">আপনার স্টাডি প্ল্যান তৈরি নেই</h3>
                <p className="text-slate-500 mt-2">বাম পাশের প্যানেলে আপনার লক্ষ্য লিখে প্ল্যান তৈরি করুন।</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
