import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Youtube, 
  Play, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileQuestion,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGeminiApiKey } from '../../lib/gemini';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const VideoToQuiz: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async () => {
    if (!url) return;
    
    setIsLoading(true);
    setQuestions([]);
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
        contents: `Analyze the content of this URL: ${url}. Generate 5 multiple choice questions based on the key information presented in this content. The output MUST be a valid JSON array of objects in Bengali. Each object MUST have: "question", "options" (array of 4), "correctAnswer", and "explanation".`,
        config: {
          tools: [{ urlContext: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        setQuestions(result);
      }
    } catch (err: any) {
      console.error(err);
      setError("ভিডিও বা ইউআরএল থেকে কুইজ তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে সঠিক ইউআরএল ব্যবহার করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-2xl shadow-inner">
          <Youtube size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          ভিডিও থেকে <span className="text-red-600">স্মার্ট কুইজ</span>
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          যেকোনো শিক্ষামূলক ভিডিওর লিংক দিন, আমাদের এআই আপনার জন্য কুইজ তৈরি করে দেবে।
        </p>
      </header>

      <Card className="p-6 border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Play className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="YouTube ভিডিও বা আর্টিকেলের লিংক দিন..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-4 text-slate-900 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 focus:outline-none transition-all"
            />
          </div>
          <Button
            variant="primary"
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-red-200 gap-2 whitespace-nowrap"
            onClick={generateQuiz}
            disabled={!url || isLoading}
            isLoading={isLoading}
          >
            {!isLoading && <Sparkles size={20} />}
            কুইজ তৈরি করুন
          </Button>
        </div>
        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </Card>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="relative">
              <div className="w-20 h-20 border-4 border-red-100 border-t-red-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Youtube className="text-red-600 animate-pulse" size={24} />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-600 animate-pulse">এআই ভিডিওটি বিশ্লেষণ করছে...</p>
          </motion.div>
        ) : questions.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" />
                তৈরিকৃত কুইজ
              </h2>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                {questions.length} টি প্রশ্ন
              </span>
            </div>

            <div className="grid gap-6">
              {questions.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 border-none shadow-lg bg-white hover:shadow-xl transition-shadow">
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <div className="space-y-4 flex-1">
                        <p className="text-lg font-bold text-slate-900">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {q.options.map((opt, j) => (
                            <div 
                              key={j}
                              className={`p-3 rounded-xl border text-sm transition-all ${
                                opt === q.correctAnswer 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' 
                                  : 'bg-slate-50 border-slate-100 text-slate-600'
                              }`}
                            >
                              <span className="inline-block w-5 h-5 rounded bg-white border border-inherit flex items-center justify-center text-[10px] mr-2 font-bold">
                                {String.fromCharCode(65 + j)}
                              </span>
                              {opt}
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                          <p className="text-xs font-bold text-slate-400 uppercase mb-1">ব্যাখ্যা</p>
                          <p className="text-sm text-slate-600 italic">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <Button variant="outline" className="rounded-xl gap-2 px-8 py-4">
                সম্পূর্ণ কুইজ শুরু করুন
                <ArrowRight size={18} />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 text-slate-300 rounded-3xl mb-6">
              <FileQuestion size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">এখনো কোনো কুইজ নেই</h3>
            <p className="text-slate-500 mt-2">উপরে ভিডিও লিংক দিয়ে কুইজ জেনারেট করুন।</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
