import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Layers, 
  Sparkles, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  BrainCircuit,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGeminiApiKey } from '../../lib/gemini';

interface Flashcard {
  front: string;
  back: string;
}

export const FlashcardFactory: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCards = async () => {
    if (!topic) return;
    
    setIsLoading(true);
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
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
        contents: `Generate 10 educational flashcards about "${topic}" in Bengali. Each card must have a "front" (question/term) and a "back" (answer/definition). The output MUST be a valid JSON array of objects.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
              },
              required: ["front", "back"],
            },
          },
        },
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        setCards(result);
      }
    } catch (err: any) {
      console.error(err);
      setError("ফ্ল্যাশকার্ড তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl shadow-inner">
          <Layers size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          ফ্ল্যাশকার্ড <span className="text-indigo-600">ফ্যাক্টরি</span>
        </h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          যেকোনো টপিক থেকে এআই দিয়ে ফ্ল্যাশকার্ড তৈরি করুন এবং আপনার স্মৃতিশক্তি ঝালাই করুন।
        </p>
      </header>

      <Card className="p-6 border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <BrainCircuit className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="টপিক লিখুন (উদা: পর্যায় সারণী, বাংলাদেশের ইতিহাস...)"
              className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-4 text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
            />
          </div>
          <Button
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl shadow-lg shadow-indigo-200 gap-2 whitespace-nowrap"
            onClick={generateCards}
            disabled={!topic || isLoading}
            isLoading={isLoading}
          >
            {!isLoading && <Sparkles size={20} />}
            কার্ড তৈরি করুন
          </Button>
        </div>
        {error && (
          <div className="mt-4 text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}
      </Card>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-lg font-bold text-slate-600 animate-pulse">এআই ফ্ল্যাশকার্ড তৈরি করছে...</p>
          </motion.div>
        ) : cards.length > 0 ? (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between text-slate-500 font-medium">
              <span>কার্ড {currentIndex + 1} / {cards.length}</span>
              <div className="flex gap-1">
                {cards.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'w-6 bg-indigo-600' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>

            {/* Flashcard Component */}
            <div 
              className="perspective-1000 cursor-pointer h-[350px] w-full"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="relative w-full h-full transition-all duration-500 preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-2xl border-2 border-indigo-50 flex flex-col items-center justify-center p-12 text-center">
                  <span className="absolute top-6 left-6 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">প্রশ্ন / টপিক</span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {cards[currentIndex].front}
                  </h3>
                  <p className="absolute bottom-6 text-xs text-slate-400 font-medium">ক্লিক করে উত্তর দেখুন</p>
                </div>

                {/* Back Side */}
                <div 
                  className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-12 text-center text-white"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <span className="absolute top-6 left-6 text-[10px] font-bold text-indigo-200 uppercase tracking-widest">উত্তর / ব্যাখ্যা</span>
                  <p className="text-xl sm:text-2xl font-medium leading-relaxed">
                    {cards[currentIndex].back}
                  </p>
                  <p className="absolute bottom-6 text-xs text-indigo-200 font-medium">ক্লিক করে প্রশ্নে ফিরে যান</p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-2xl w-16 h-16 p-0 border-2 hover:bg-slate-50"
                onClick={(e) => { e.stopPropagation(); prevCard(); }}
              >
                <ChevronLeft size={32} />
              </Button>
              
              <div className="flex gap-4">
                <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-2">
                  <CheckCircle2 size={18} />
                  পেরেছি
                </Button>
                <Button variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 gap-2">
                  <XCircle size={18} />
                  পারিনি
                </Button>
              </div>

              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-2xl w-16 h-16 p-0 border-2 hover:bg-slate-50"
                onClick={(e) => { e.stopPropagation(); nextCard(); }}
              >
                <ChevronRight size={32} />
              </Button>
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" className="text-slate-400 gap-2" onClick={() => setCards([])}>
                <RotateCcw size={16} />
                রিসেট করুন
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
              <Layers size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">আপনার ফ্ল্যাশকার্ড তৈরি করুন</h3>
            <p className="text-slate-500 mt-2">উপরে টপিক লিখে ম্যাজিক শুরু করুন।</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}} />
    </div>
  );
};
