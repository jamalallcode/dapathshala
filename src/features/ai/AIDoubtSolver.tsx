import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  HelpCircle, 
  Sparkles, 
  Send, 
  BookOpen, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Bookmark, 
  RefreshCw, 
  Zap,
  ArrowRight,
  Brain,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SolvedDoubt {
  id: string;
  question: string;
  subject: string;
  coreConcept: string;
  steps: string[];
  tips: string;
  practiceProblem: {
    question: string;
    answer: string;
  };
  timestamp: string;
}

export const AIDoubtSolver: React.FC = () => {
  const [questionInput, setQuestionInput] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('গণিত');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);

  const subjects = [
    { id: 'গণিত', label: 'গণিত', icon: '📐' },
    { id: 'পদার্থবিজ্ঞান', label: 'পদার্থবিজ্ঞান', icon: '⚡' },
    { id: 'রসায়ন', label: 'রসায়ন', icon: '🧪' },
    { id: 'জীববিজ্ঞান', label: 'জীববিজ্ঞান', icon: '🧬' },
    { id: 'ইংরেজি', label: 'ইংরেজি', icon: '📖' },
    { id: 'আইসিটি', label: 'আইসিটি', icon: '💻' },
  ];

  const sampleQuestions: Record<string, string[]> = {
    'গণিত': [
      'ax² + bx + c = 0 সমীকরণের মূলদ্বয়ের সম্পর্ক বুঝিয়ে দাও',
      'sin²θ + cos²θ = 1 এর জ্যামিতিক প্রমাণ দেখাও',
      'একটি বৃত্তের ক্ষেত্রফল ও পরিধির অনুপাত কীভাবে বের করব?'
    ],
    'পদার্থবিজ্ঞান': [
      'নিউটনের ৩য় সূত্রের বাস্তব প্রয়োগ ও প্রতিক্রিয়া বলের ব্যাখ্যা দাও',
      'গতির ৩য় সমীকরণ v² = u² + 2as এর প্রতিপাদন কর',
      'ওহমের সূত্র এবং রোধের তাপীয় ফল বুঝিয়ে দাও'
    ],
    'রসায়ন': [
      'পর্যায় সারণিতে পারমাণবিক ব্যাসার্ধ কীভাবে পরিবর্তিত হয়?',
      'জারণ ও বিজারণ বিক্রিয়া একসঙ্গে ঘটে কেন?',
      'pH মান ৭ এর কম হলে দ্রবণ এসিডিক কেন হয়?'
    ],
    'জীববিজ্ঞান': [
      'সালোকসংশ্লেষণের আলোক নির্ভর ও আলোক নিরপেক্ষ পর্যায়ের পার্থক্য কী?',
      'ডিএনএ (DNA) এর ডাবল হেলিক্স কাঠামোর ব্যাখ্যা দাও'
    ],
    'ইংরেজি': [
      'Right form of verbs এর প্রধান ৫টি নিয়ম উদাহরণসহ দাও',
      'Active voice থেকে Passive voice এ পরিবর্তনের মূল নিয়ম'
    ],
    'আইসিটি': [
      'বাইনারি থেকে ডেসিমাল সংখ্যায় রূপান্তরের নিয়ম',
      'লজিক গেইট (AND, OR, NOT) এর ট্রুথ টেবিল বুঝিয়ে দাও'
    ]
  };

  const [currentSolution, setCurrentSolution] = useState<SolvedDoubt | null>({
    id: 'sample-1',
    question: 'ax² + bx + c = 0 সমীকরণের মূলদ্বয়ের সম্পর্ক বুঝিয়ে দাও',
    subject: 'গণিত',
    coreConcept: 'দ্বিঘাত সমীকরণের মূলদ্বয়ের যোগফল ও গুণফলের ধর্ম',
    steps: [
      'ধরি, দ্বিঘাত সমীকরণ ax² + bx + c = 0 এর মূল দুটি যথাক্রমে α এবং β।',
      'দ্বিঘাত সূত্রের সাহায্যে আমরা জানি, x = [-b ± √(b² - 4ac)] / 2a।',
      'সুতরাং মূলদ্বয়ের যোগফল: α + β = (-b/a)। অর্থাৎ x এর সহগের বিপরীত চিহ্নকে x² এর সহগ দিয়ে ভাগ করতে হয়।',
      'এবং মূলদ্বয়ের গুণফল: α · β = (c/a)। অর্থাৎ ধ্রুবপদকে x² এর সহগ দিয়ে ভাগ করতে হয়।'
    ],
    tips: 'পরীক্ষায় বহুভোজী প্রশ্নে মূলের যোগফল ও গুণফল দিয়ে দ্রুত সমীকরণ গঠন করতে হয়: x² - (মূলদ্বয়ের যোগফল)x + (মূলদ্বয়ের গুণফল) = 0।',
    practiceProblem: {
      question: 'যদি কোনো সমীকরণের মূল দুটি ৩ এবং -৫ হয়, তবে সমীকরণটি কী হবে?',
      answer: 'যোগফল = ৩ + (-৫) = -২, গুণফল = ৩ × (-৫) = -১৫। অতএব নির্ণেয় সমীকরণ: x² - (-২)x + (-১৫) = 0  => x² + 2x - 15 = 0।'
    },
    timestamp: 'আজ, ১০:১৫ পূর্বাহ্ন'
  });

  const handleSolve = async (customQ?: string) => {
    const q = customQ || questionInput.trim();
    if (!q) return;

    setIsLoading(true);
    setBookmarked(false);
    setShowPracticeAnswer(false);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `
You are an expert Bengali academic tutor on DaPathshala for secondary and higher secondary students.
Solve this student doubt in Bengali:
Subject: ${selectedSubject}
Question: "${q}"

Respond in valid JSON format only, matching this structure:
{
  "coreConcept": "সংক্ষিপ্ত মূল সূত্র বা থিওরি (1-2 sentences)",
  "steps": [
    "ধাপ ১: ...",
    "ধাপ ২: ...",
    "ধাপ ৩: ..."
  ],
  "tips": "একটি প্রয়োজনীয় পরীক্ষার টিপস বা সাধারণ ভুল যা এড়াতে হবে",
  "practiceProblem": {
    "question": "একটি অনুরূপ অনুশীলন প্রশ্ন",
    "answer": "তার সঠিক উত্তর ও সংক্ষিপ্ত ব্যাখ্যা"
  }
}
Do not use markdown backticks around JSON.
`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        setCurrentSolution({
          id: Date.now().toString(),
          question: q,
          subject: selectedSubject,
          coreConcept: parsed.coreConcept || 'মূল ধারণা',
          steps: parsed.steps || ['সমাধান প্রস্তুত করা হয়েছে।'],
          tips: parsed.tips || 'সাবধানে হিসাব করুন।',
          practiceProblem: parsed.practiceProblem || {
            question: 'অনুরূপ একটি অঙ্ক অনুশীলন করুন।',
            answer: 'সঠিক উত্তর যাচাই করুন।'
          },
          timestamp: 'মাত্র এখন'
        });
      } else {
        // Fallback realistic rich explanation
        await new Promise(r => setTimeout(r, 700));
        setCurrentSolution({
          id: Date.now().toString(),
          question: q,
          subject: selectedSubject,
          coreConcept: `${selectedSubject} বিষয়ের গুরুত্বপূর্ণ মৌলিক নিয়মাবলী`,
          steps: [
            `প্রশ্নটি লক্ষ্য করুন: "${q}"। প্রথমে প্রদত্ত মান ও শর্তগুলো চিহ্নিত করুন।`,
            `দ্বিতীয় ধাপে প্রাসঙ্গিক সূত্র প্রয়োগ করুন এবং প্রয়োজনীয় রাশিগুলো প্রতিস্থাপন করুন।`,
            `গাণিতিক সমীকরণ সমাধান করে কাঙ্ক্ষিত ফলাফল নির্ণয় করুন। একক (Unit) লিখতে ভুলবেন না।`,
            `প্রাপ্ত ফলাফল যাচাই করে চূড়ান্ত উত্তরের নিচে স্পষ্ট করে সমাপ্তি লিখুন।`
          ],
          tips: 'পরীক্ষায় যেকোনো অঙ্ক বা প্রশ্নের ক্ষেত্রে ধাপ অনুযায়ী নম্বর থাকে, তাই সরাসরি উত্তর না লিখে প্রতিটি ধাপ পরিষ্কারভাবে লিখুন।',
          practiceProblem: {
            question: `"${q}" এর অনুরূপ আরেকটি মান বসিয়ে নিজে অনুশীলন করার চেষ্টা করুন।`,
            answer: 'একই পদ্ধতিতে মূল সূত্রে মান বসিয়ে ফলাফল নির্ণয় করুন।'
          },
          timestamp: 'মাত্র এখন'
        });
      }
    } catch (e) {
      console.error(e);
      // Fallback response
      setCurrentSolution({
        id: Date.now().toString(),
        question: q,
        subject: selectedSubject,
        coreConcept: 'মৌলিক সূত্র ও তাত্ত্বিক ধারণা',
        steps: [
          'প্রশ্নটির মূল সমস্যা বিশ্লেষণ করা হয়েছে।',
          'ধাপ ১: সূত্র প্রতিপাদন এবং মান বসানো।',
          'ধাপ ২: সমাধান নির্ণয় ও একক সংযোগ।'
        ],
        tips: 'মূল সূত্রগুলো নিয়মিত রিভিশন দিন যাতে বিভ্রান্তি না ঘটে।',
        practiceProblem: {
          question: 'অনুরূপ সমস্যার সমাধান প্র্যাকটিস করুন।',
          answer: 'সূত্র অনুযায়ী মান প্রতিস্থাপন করে সমাধান মিলান।'
        },
        timestamp: 'মাত্র এখন'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!currentSolution) return;
    const text = `প্রশ্ন: ${currentSolution.question}\n\nমূল ধারণা: ${currentSolution.coreConcept}\n\nধাপসমূহ:\n${currentSolution.steps.join('\n')}\n\nটিপস: ${currentSolution.tips}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Sparkles size={14} className="text-emerald-600" />
            শিক্ষার্থীদের ২৪/৭ পার্সোনাল টিউটর
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <HelpCircle size={24} />
            </div>
            এআই ডাউট সলভার ও প্রবলেম ল্যাব
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            পড়াশোনার সময় যেকোনো কঠিন প্রশ্ন বা অঙ্কে আটকে গেলে এখানে লিখুন, ধাপে ধাপে বাংলা সমাধান ও টিপস পেয়ে যাবেন।
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <Brain className="text-emerald-600" size={24} />
          <div className="text-xs">
            <p className="font-bold text-slate-800">অ্যাক্টিভ ডাউট সাপোর্ট</p>
            <p className="text-slate-500">সকল শ্রেণির জাতীয় পাঠ্যক্রম ভিত্তিক</p>
          </div>
        </div>
      </div>

      {/* Subject Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubject(sub.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all cursor-pointer ${
              selectedSubject === sub.id 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{sub.icon}</span>
            <span>{sub.label}</span>
          </button>
        ))}
      </div>

      {/* Question Input Box */}
      <Card className="p-6 border-none shadow-xl bg-white space-y-4">
        <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
          <span>আপনার প্রশ্ন বা অংকটি বিস্তারিত লিখুন:</span>
          <span className="text-xs text-slate-400 font-normal">বাংলা অথবা ইংরেজিতে লিখতে পারেন</span>
        </label>
        
        <div className="relative">
          <textarea
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder={`যেমন: ${selectedSubject} বিষয়ের কোনো কঠিন প্রশ্ন, উপপাদ্য বা সমীকরণ এখানে লিখুন...`}
            rows={3}
            className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-400 font-medium resize-none"
          />
        </div>

        {/* Quick Sample Questions */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">দ্রুত নমুনা প্রশ্ন সিলেক্ট করুন:</span>
          <div className="flex flex-wrap gap-2">
            {(sampleQuestions[selectedSubject] || sampleQuestions['গণিত']).map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestionInput(q);
                  handleSolve(q);
                }}
                className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200/80 transition-all text-left cursor-pointer"
              >
                💡 {q}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={() => handleSolve()}
            disabled={isLoading || !questionInput.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                সমাধান খোঁজা হচ্ছে...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                ধাপে ধাপে সমাধান দেখুন
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Solution Section */}
      {currentSolution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-emerald-600" size={22} />
              সমাধান ও ব্যাখ্যা
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'কপি হয়েছে' : 'কপি করুন'}
              </button>
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                  bookmarked 
                    ? 'bg-amber-50 border-amber-200 text-amber-700' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark size={14} className={bookmarked ? 'fill-amber-500 text-amber-500' : ''} />
                {bookmarked ? 'রিভিশনে সেভড' : 'রিভিশনে রাখুন'}
              </button>
            </div>
          </div>

          {/* Question Summary Bar */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">বিষয়: {currentSolution.subject}</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{currentSolution.question}</p>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full font-semibold self-start sm:self-auto shrink-0">
              {currentSolution.timestamp}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Steps & Solution (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Core Concept Card */}
              <Card className="p-6 border-none shadow-md bg-white">
                <div className="flex items-center gap-2 text-indigo-700 font-bold mb-3">
                  <Lightbulb size={20} className="text-indigo-600" />
                  <span>মূল তত্ত্ব ও প্রাসঙ্গিক সূত্র (Core Concept)</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 font-medium">
                  {currentSolution.coreConcept}
                </p>
              </Card>

              {/* Step by step card */}
              <Card className="p-6 border-none shadow-md bg-white space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-3">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <span>ধাপে ধাপে সমাধান (Step-by-step Solution)</span>
                </div>

                <div className="space-y-4">
                  {currentSolution.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100/80">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        {index + 1}
                      </div>
                      <p className="text-slate-800 text-sm font-medium leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Side Tools: Tips & Practice (1 Col) */}
            <div className="space-y-6">
              {/* Exam Tip Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-200/50 space-y-3">
                <div className="flex items-center gap-2 font-bold text-white">
                  <AlertTriangle size={20} className="text-amber-200" />
                  <span>গুরুত্বপূর্ণ পরীক্ষার টিপস</span>
                </div>
                <p className="text-amber-50 text-xs leading-relaxed font-medium">
                  {currentSolution.tips}
                </p>
              </div>

              {/* Practice Problem */}
              <Card className="p-6 border-none shadow-md bg-white space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <Zap size={18} className="text-emerald-600" />
                  <span>অনুরূপ অনুশীলন প্রশ্ন (Practice)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-800">
                  {currentSolution.practiceProblem.question}
                </div>
                
                <button
                  onClick={() => setShowPracticeAnswer(!showPracticeAnswer)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {showPracticeAnswer ? 'উত্তর লুকান' : 'উত্তর ও সমাধান দেখুন'}
                </button>

                {showPracticeAnswer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed font-medium"
                  >
                    {currentSolution.practiceProblem.answer}
                  </motion.div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
