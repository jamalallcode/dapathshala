import React, { useState, useRef, useEffect } from 'react';
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
  BookOpen,
  ChevronDown,
  Key,
  Layers,
  Search,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CURRICULUM_DATA, POPULAR_SUBJECTS } from '../../lib/curriculumData';
import { getGeminiApiKey, hasGeminiApiKey } from '../../lib/gemini';
import { ApiKeyModal } from '../../components/ApiKeyModal';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type OptionStyle = 'circle' | 'bracket';
export type OptionLang = 'bn' | 'en';

export const BANGLA_SERIALS = ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'];
export const ENGLISH_SERIALS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const getOptionSerial = (index: number, lang: OptionLang = 'bn'): string => {
  if (lang === 'bn') {
    return BANGLA_SERIALS[index] || String(index + 1);
  }
  return ENGLISH_SERIALS[index] || String.fromCharCode(65 + index);
};

export const AIQuestionGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('বাংলা');
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

  // Option serial style (circle vs bracket) & language (bn vs en)
  const [optionStyle, setOptionStyle] = useState<OptionStyle>('circle');
  const [optionLang, setOptionLang] = useState<OptionLang>('bn');

  // Topic dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // API Key modal
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasKey, setHasKey] = useState(() => hasGeminiApiKey());

  const difficultyLabels = ['সহজ', 'মাঝারি', 'কঠিন'];
  const subjects = POPULAR_SUBJECTS;

  // Available chapters for the selected subject
  const availableChapters = CURRICULUM_DATA[subject] || CURRICULUM_DATA['বাংলা'] || [];

  // Filtered chapters if user is typing
  const filteredChapters = topic.trim() 
    ? availableChapters.filter(ch => ch.toLowerCase().includes(topic.toLowerCase()))
    : availableChapters;

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectChapter = (ch: string) => {
    setTopic(ch);
    setIsDropdownOpen(false);
    setError(null);
  };

  const generateQuestions = async () => {
    if (!topic.trim()) {
      setError("অনুগ্রহ করে একটি টপিক বা অধ্যায় নির্বাচন অথবা লিখুন।");
      return;
    }
    
    setIsLoading(true);
    setQuestions([]);
    setError(null);
    
    try {
      const apiKey = getGeminiApiKey();
      
      if (!apiKey) {
        setHasKey(false);
        setError("এপিআই কী (API Key) সেট করা নেই। দয়া করে নিচের বাটনে ক্লিক করে GEMINI_API_KEY যোগ করুন।");
        setIsLoading(false);
        setIsApiKeyModalOpen(true);
        return;
      }
      setHasKey(true);

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
        model: "gemini-2.5-flash",
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
      setError(err.message || "প্রশ্ন তৈরি করতে সমস্যা হয়েছে। আপনার এপিআই কী সঠিক কিনা যাচাই করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateSingleQuestion = async (id: string) => {
    setIsRegenerating(id);
    try {
      const apiKey = getGeminiApiKey();
      
      if (!apiKey) {
        setIsApiKeyModalOpen(true);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
    const text = questions.map((q, i) => {
      const optionsText = q.options.map((opt, j) => {
        const serial = getOptionSerial(j, optionLang);
        return optionStyle === 'bracket' ? `(${serial}) ${opt}` : `${serial}) ${opt}`;
      }).join('    ');
      return `${i + 1}. ${q.question}\n${optionsText}\nসঠিক উত্তর: ${q.correctAnswer}\nব্যাখ্যা: ${q.explanation}`;
    }).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (questions.length === 0) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <title>${subject} - ${topic || 'প্রশ্নপত্র'} | দ্যা পাঠশালা</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 36px;
      color: #0f172a;
      line-height: 1.6;
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #059669;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: #065f46;
    }
    .header p {
      margin: 4px 0 0;
      color: #475569;
      font-size: 14px;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .question-block {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .q-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #1e293b;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      margin-left: 12px;
    }
    .opt-item {
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .circle-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1.5px solid #475569;
      font-size: 11px;
      font-weight: bold;
      color: #1e293b;
    }
    .bracket-badge {
      font-weight: bold;
      font-size: 14px;
      color: #1e293b;
    }
    .answer-key {
      margin-top: 40px;
      border-top: 2px dashed #cbd5e1;
      padding-top: 20px;
      page-break-before: auto;
    }
    .answer-key h3 {
      color: #065f46;
      margin-top: 0;
      font-size: 16px;
    }
    .answer-row {
      font-size: 13px;
      margin: 6px 0;
      color: #334155;
    }
    @media print {
      body { padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>দ্যা পাঠশালা • প্রশ্নপত্র</h1>
    <p>বিষয়: ${subject} • অধ্যায়/টপিক: ${topic || 'সাধারণ'}</p>
  </div>
  <div class="meta-bar">
    <span>মোট প্রশ্ন: ${questions.length}টি</span>
    <span>পূর্ণমান: ${questions.length}</span>
    <span>সময়: ${Math.round(questions.length * 1.2)} মিনিট</span>
  </div>
  <div class="questions">
    ${questions.map((q, i) => `
      <div class="question-block">
        <div class="q-title">${i + 1}. ${q.question}</div>
        <div class="options-grid">
          ${q.options.map((opt, j) => {
            const serial = getOptionSerial(j, optionLang);
            const badge = optionStyle === 'circle'
              ? `<span class="circle-badge">${serial}</span>`
              : `<span class="bracket-badge">(${serial})</span>`;
            return `<div class="opt-item">${badge} <span>${opt}</span></div>`;
          }).join('')}
        </div>
      </div>
    `).join('')}
  </div>
  <div class="answer-key">
    <h3>উত্তরমালা ও ব্যাখ্যা:</h3>
    ${questions.map((q, i) => `
      <div class="answer-row">
        <strong>${i + 1}.</strong> উত্তর: <strong>${q.correctAnswer}</strong>
        ${q.explanation ? `— <em>${q.explanation}</em>` : ''}
      </div>
    `).join('')}
  </div>
  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
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
            <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={handleDownloadPDF}>
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
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Settings2 size={18} className="text-emerald-600" />
                স্মার্ট কনফিগারেশন
              </h2>
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(true)}
                className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold transition-all ${
                  hasKey 
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200 animate-pulse'
                }`}
                title="এপিআই কী পরিবর্তন বা সেট করুন"
              >
                <Key size={12} />
                {hasKey ? 'API Key সক্রিয়' : 'API Key সেট করুন'}
              </button>
            </div>

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
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-10 py-3 text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all appearance-none font-medium cursor-pointer"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              {/* Topic / Chapter with Dropdown */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">টপিক বা অধ্যায়</label>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Layers size={13} />
                    {isDropdownOpen ? 'তালিকা লুকান' : 'অধ্যায়সমূহ দেখুন'}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onFocus={() => setIsDropdownOpen(true)}
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    onChange={(e) => {
                      setTopic(e.target.value);
                      setIsDropdownOpen(true);
                      setError(null);
                    }}
                    placeholder={`উদা: ${availableChapters[0] || 'নিউটনের গতিসূত্র'}...`}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-4 pr-11 py-3 text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all cursor-pointer font-medium selection:bg-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen(prev => !prev);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition-all cursor-pointer"
                    title="অধ্যায়ের তালিকা খুলুন"
                  >
                    <ChevronDown size={18} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl z-40 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2.5 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between sticky top-0 z-10 border-b border-slate-100">
                      <span>{subject} বিষয়ের অধ্যায়সমূহ ({filteredChapters.length})</span>
                      {topic && (
                        <button
                          type="button"
                          onClick={() => setTopic('')}
                          className="text-emerald-600 hover:underline capitalize"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>

                    {filteredChapters.length > 0 ? (
                      filteredChapters.map((ch, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectChapter(ch)}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all flex items-center justify-between gap-2 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer ${
                            topic === ch ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{ch}</span>
                          {topic === ch && <Check size={14} className="text-emerald-600 shrink-0" />}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        কোনো অধ্যায় মিল পাওয়া যায়নি। আপনি নিজের মতো লিখতে পারেন।
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Chapter Chips */}
                {availableChapters.length > 0 && (
                  <div className="pt-1.5">
                    <p className="text-[11px] text-slate-400 mb-1.5 font-medium">দ্রুত পছন্দ করুন:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableChapters.slice(0, 4).map((ch, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectChapter(ch)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            topic === ch
                              ? 'bg-emerald-600 border-emerald-600 text-white font-medium shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
                          }`}
                        >
                          {ch.split('(')[0].trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

              {/* API Key Missing Callout */}
              {!hasKey && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                    <span>Gemini API Key প্রয়োজন</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    এআই জেনারেট চালু করতে বিনামূল্যে গুগল এআই স্টুডিও থেকে আপনার কী সেট করুন।
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsApiKeyModalOpen(true)}
                    className="w-full bg-white border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold gap-1.5 rounded-xl py-2 shadow-sm"
                  >
                    <Key size={14} />
                    এপিআই কী সেট করুন
                  </Button>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full py-6 text-lg rounded-2xl shadow-xl shadow-emerald-200 gap-2"
                onClick={generateQuestions}
                isLoading={isLoading}
                disabled={!topic.trim()}
              >
                {!isLoading && <Sparkles size={20} />}
                ম্যাজিক জেনারেট
              </Button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium space-y-2"
                >
                  <p>{error}</p>
                  {!hasKey && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setIsApiKeyModalOpen(true)}
                      className="w-full bg-white text-xs py-2 rounded-lg"
                    >
                      <Key size={12} className="mr-1" />
                      এপিআই কী ইনপুট করুন
                    </Button>
                  )}
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
                {/* Option Style Controls Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">অপশন ক্রমিক স্টাইল:</span>
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setOptionStyle('circle')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          optionStyle === 'circle'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-current inline-flex items-center justify-center text-[8px]">●</span>
                        গোল বৃত্ত (Circle)
                      </button>
                      <button
                        type="button"
                        onClick={() => setOptionStyle('bracket')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          optionStyle === 'bracket'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="font-mono font-bold text-xs">( )</span>
                        ফার্স্ট ব্র্যাকেট
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">হরফ:</span>
                    <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setOptionLang('bn')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          optionLang === 'bn'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        ক, খ, গ, ঘ
                      </button>
                      <button
                        type="button"
                        onClick={() => setOptionLang('en')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          optionLang === 'en'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        A, B, C, D
                      </button>
                    </div>
                  </div>
                </div>

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
                                <label className="text-[10px] font-bold text-slate-400 uppercase">
                                  অপশন {optionStyle === 'bracket' ? `(${getOptionSerial(idx, optionLang)})` : getOptionSerial(idx, optionLang)}
                                </label>
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
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 ml-0 sm:ml-11">
                            {q.options.map((opt, j) => {
                              const isCorrect = opt === q.correctAnswer;
                              const serial = getOptionSerial(j, optionLang);

                              return (
                                <div 
                                  key={j} 
                                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                                    isCorrect 
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs ring-1 ring-emerald-200' 
                                      : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100/70'
                                  }`}
                                >
                                  {optionStyle === 'circle' ? (
                                    <span 
                                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                                        isCorrect
                                          ? 'bg-emerald-600 text-white border border-emerald-600 ring-2 ring-emerald-200'
                                          : 'bg-white border-2 border-slate-300 text-slate-700'
                                      }`}
                                    >
                                      {serial}
                                    </span>
                                  ) : (
                                    <span 
                                      className={`flex-shrink-0 font-bold text-sm tracking-tight px-1.5 py-0.5 rounded-md transition-all ${
                                        isCorrect
                                          ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300 font-black'
                                          : 'bg-white border border-slate-200 text-slate-700 shadow-xs'
                                      }`}
                                    >
                                      ({serial})
                                    </span>
                                  )}
                                  <span className="flex-1 text-sm leading-relaxed">{opt}</span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="ml-0 sm:ml-11 pt-4 border-t border-slate-100">
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
      {/* API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaved={() => {
          setHasKey(true);
          setError(null);
        }}
      />
    </div>
  );
};

