import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Sparkles, 
  Loader2, 
  Copy, 
  Check, 
  FileText, 
  Settings2, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  Download,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const AIQuestionGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('সাধারণ');
  const [difficulty, setDifficulty] = useState(1); // 0: সহজ, 1: মাঝারি, 2: কঠিন
  const [qType, setQType] = useState<'mcq' | 'creative'>('mcq');
  const [count, setCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Question | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const difficultyLabels = ['সহজ', 'মাঝারি', 'কঠিন'];

  const subjects = [
    'সাধারণ', 'বাংলা', 'ইংরেজি', 'গণিত', 'বিজ্ঞান', 'ইতিহাস', 'ভূগোল', 'ধর্ম', 'আইসিটি'
  ];

  const generateQuestions = async () => {
    if (!topic) return;
    
    setIsLoading(true);
    setQuestions([]);
    setError(null);
    
    try {
      const apiKey = process.env.GEMINI_API_KEY || '';
      
      if (!apiKey) {
        setError("এপিআই কী (API Key) সেট করা নেই। দয়া করে সেটিংস থেকে GEMINI_API_KEY যোগ করুন।");
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = qType === 'mcq' 
        ? `Generate exactly ${count} multiple choice questions about "${topic}" for the subject "${subject}" in Bengali. 
           Difficulty level: ${difficultyLabels[difficulty]}. 
           The output MUST be a valid JSON array of objects.
           Each object MUST have: "id" (unique string), "question", "options" (array of exactly 4 strings), "correctAnswer" (the exact string from options), and "explanation".`
        : `Generate exactly ${count} creative/subjective questions about "${topic}" for the subject "${subject}" in Bengali. 
           Difficulty level: ${difficultyLabels[difficulty]}. 
           The output MUST be a valid JSON array of objects.
           Each object MUST have: "id" (unique string), "question", "options" (empty array []), "correctAnswer" (a model answer), and "explanation" (marking criteria).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ["id", "question", "options", "correctAnswer", "explanation"],
            },
          },
        },
      });

      if (response.text) {
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(cleanText);
        if (Array.isArray(result)) {
          setQuestions(result);
        } else {
          setError("এআই থেকে সঠিক ফরম্যাটে উত্তর পাওয়া যায়নি।");
        }
      }
    } catch (err: any) {
      setError(err.message || "প্রশ্ন তৈরি করতে সমস্যা হয়েছে।");
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateSingleQuestion = async (id: string) => {
    setIsRegenerating(id);
    try {
      const systemKey = process.env.GEMINI_API_KEY;
      const apiKey = systemKey || localStorage.getItem('dapathshala_gemini_key') || '';
      
      if (!apiKey) return;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate exactly ONE unique multiple choice question about "${topic}" for the subject "${subject}" in Bengali. 
        Difficulty level: ${difficulty}. 
        The output MUST be a valid JSON object.
        The object MUST have: "id" (use "${id}"), "question", "options" (array of exactly 4 strings), "correctAnswer" (the exact string from options), and "explanation".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"],
          },
        },
      });

      if (response.text) {
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        const newQ = JSON.parse(cleanText);
        setQuestions(prev => prev.map(q => q.id === id ? newQ : q));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(null);
    }
  };

  const startEditing = (q: Question) => {
    setEditingId(q.id);
    setEditForm({ ...q });
  };

  const saveEdit = () => {
    if (editForm) {
      setQuestions(prev => prev.map(q => q.id === editForm.id ? editForm : q));
      setEditingId(null);
      setEditForm(null);
    }
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const copyToClipboard = () => {
    const text = questions.map((q, i) => 
      `${i + 1}. ${q.question}\nOptions: ${q.options.join(', ')}\nCorrect: ${q.correctAnswer}\nExplanation: ${q.explanation}`
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Sparkles size={24} />
            </div>
            Smart Quest <span className="text-emerald-600">এআই জেনারেটর</span>
          </h1>
          <p className="mt-1 text-slate-500">অ্যাডভান্সড এআই প্রযুক্তির মাধ্যমে নিখুঁত প্রশ্নপত্র তৈরি করুন।</p>
        </div>
        {questions.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={copyToClipboard}>
              {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              {copied ? 'কপি হয়েছে' : 'সব কপি করুন'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Download size={16} />
              PDF ডাউনলোড
            </Button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Configuration Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <Settings2 size={18} className="text-emerald-600" />
              স্মার্ট কনফিগারেশন
            </h2>

            <div className="space-y-5">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setQType('mcq')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${qType === 'mcq' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  MCQ
                </button>
                <button
                  onClick={() => setQType('creative')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${qType === 'creative' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  সৃজনশীল
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">বিষয় (Subject)</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all appearance-none"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">টপিক বা অধ্যায়</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="উদা: সালোকসংশ্লেষণ, নিউটনের গতিসূত্র..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">কঠিনতা: <span className="text-emerald-600">{difficultyLabels[difficulty]}</span></label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="1"
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>সহজ</span>
                  <span>মাঝারি</span>
                  <span>কঠিন</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">প্রশ্নের সংখ্যা</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <Button
                variant="primary"
                className="w-full py-6 text-lg rounded-2xl shadow-xl shadow-emerald-200 gap-2"
                onClick={generateQuestions}
                isLoading={isLoading}
                disabled={!topic}
              >
                {!isLoading && <Sparkles size={20} />}
                ম্যাজিক জেনারেট
              </Button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}
            </div>
          </Card>
        </div>

        {/* Questions Display */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {questions.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {questions.map((q, i) => (
                  <motion.div
                    layout
                    key={q.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`relative border-none shadow-lg transition-all ${editingId === q.id ? 'ring-2 ring-emerald-500 bg-emerald-50/30' : 'bg-white'}`}>
                      {/* Action Toolbar */}
                      <div className="absolute top-4 right-4 flex items-center gap-1">
                        {editingId === q.id ? (
                          <>
                            <button onClick={saveEdit} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Save">
                              <Save size={18} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="Cancel">
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => regenerateSingleQuestion(q.id)} 
                              disabled={isRegenerating === q.id}
                              className={`p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ${isRegenerating === q.id ? 'animate-spin' : ''}`} 
                              title="Regenerate this question"
                            >
                              <RefreshCw size={18} />
                            </button>
                            <button onClick={() => startEditing(q)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                              <Edit3 size={18} />
                            </button>
                            <button onClick={() => deleteQuestion(q.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>

                      {editingId === q.id ? (
                        <div className="space-y-4 pt-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase">প্রশ্ন</label>
                            <textarea
                              value={editForm?.question}
                              onChange={(e) => setEditForm(prev => prev ? { ...prev, question: e.target.value } : null)}
                              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 focus:border-emerald-500 focus:outline-none min-h-[80px]"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {editForm?.options.map((opt, idx) => (
                              <div key={idx} className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">অপশন {String.fromCharCode(65 + idx)}</label>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...(editForm?.options || [])];
                                    newOpts[idx] = e.target.value;
                                    setEditForm(prev => prev ? { ...prev, options: newOpts } : null);
                                  }}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase">সঠিক উত্তর</label>
                              <select
                                value={editForm?.correctAnswer}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, correctAnswer: e.target.value } : null)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                              >
                                {editForm?.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-400 uppercase">ব্যাখ্যা</label>
                              <input
                                type="text"
                                value={editForm?.explanation}
                                onChange={(e) => setEditForm(prev => prev ? { ...prev, explanation: e.target.value } : null)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={isRegenerating === q.id ? 'opacity-50 pointer-events-none' : ''}>
                          <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                              {i + 1}
                            </span>
                            <p className="font-bold text-slate-900 text-lg pr-24">{q.question}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 ml-11">
                            {q.options.map((opt, j) => (
                              <div 
                                key={j} 
                                className={`p-4 rounded-2xl border transition-all ${
                                  opt === q.correctAnswer 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold shadow-sm' 
                                    : 'bg-slate-50 border-slate-100 text-slate-600'
                                }`}
                              >
                                <span className="inline-block w-6 h-6 rounded bg-white border border-inherit flex items-center justify-center text-xs mr-3 font-bold">
                                  {String.fromCharCode(65 + j)}
                                </span>
                                {opt}
                              </div>
                            ))}
                          </div>

                          <div className="ml-11 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              ব্যাখ্যা
                            </div>
                            <p className="text-sm text-slate-600 italic leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      )}

                      {isRegenerating === q.id && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl z-20">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-emerald-600" size={32} />
                            <span className="text-xs font-bold text-emerald-700">নতুন প্রশ্ন তৈরি হচ্ছে...</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card className="flex flex-col items-center justify-center py-32 text-center border-none shadow-xl shadow-slate-200/50 bg-white/50 backdrop-blur-sm">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
                    <div className="relative rounded-3xl bg-white p-8 shadow-2xl shadow-emerald-500/10">
                      <Sparkles size={64} className="text-emerald-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">আপনার স্মার্ট কোয়েস্ট শুরু করুন</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-3 leading-relaxed">
                    বাম পাশের প্যানেলে বিষয় এবং টপিক লিখে 'ম্যাজিক জেনারেট' বাটনে ক্লিক করুন। আমাদের এআই আপনার জন্য সেরা প্রশ্নগুলো খুঁজে বের করবে।
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

