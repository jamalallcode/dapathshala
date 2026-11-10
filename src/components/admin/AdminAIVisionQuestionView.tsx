import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Save, 
  ArrowLeft, 
  ShieldCheck, 
  BookOpen, 
  FileQuestion,
  Loader2,
  Check,
  RefreshCw
} from 'lucide-react';
import { getGeminiApiKey } from '../../lib/gemini';
import { 
  InstitutionPaper, 
  saveInstitutionPapers, 
  pushBulkPapersToServer,
  getStoredInstitutionPapers 
} from '../../lib/institutionPapers';

interface ExtractedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  correctAnswerIndex?: number;
  explanation?: string;
}

interface AdminAIVisionQuestionViewProps {
  onBack: () => void;
  onSavedSuccess: () => void;
}

export const AdminAIVisionQuestionView: React.FC<AdminAIVisionQuestionViewProps> = ({
  onBack,
  onSavedSuccess
}) => {
  // Step: 'upload' -> 'scanning' -> 'review'
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  
  // Mode: 'question_paper' or 'book_page'
  const [mode, setMode] = useState<'question_paper' | 'book_page'>('question_paper');

  // Ephemeral file states (never saved to database)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  // Metadata form
  const [institutionName, setInstitutionName] = useState('মতিঝিল আইডিয়াল স্কুল অ্যান্ড কলেজ / টেস্ট পেপার');
  const [studentClass, setStudentClass] = useState('১০ম শ্রেণি');
  const [subject, setSubject] = useState('পদার্থবিজ্ঞান');
  const [examType, setExamType] = useState('টেস্ট পরীক্ষা / নির্বাচনী পরীক্ষা');
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Extracted questions for review & editing
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Image viewer controls (Zoom, Pan, Rotate)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up object URLs when unmounted to guarantee zero memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // File selection & base64 conversion
  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrorMsg('দয়া করে শুধুমাত্র ছবি (JPG, PNG, WebP) অথবা পিডিএফ (PDF) ফাইল নির্বাচন করুন।');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('ফাইলের সাইজ সর্বোচ্চ ২৫ মেগাবাইট হতে পারবে।');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setErrorMsg(null);
    setZoomLevel(1);
    setRotation(0);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.onerror = () => {
      setErrorMsg('ফাইলটি পড়তে সমস্যা হয়েছে। দয়া করে পুনরায় নির্বাচন করুন।');
    };
    reader.readAsDataURL(file);
  };

  // Start AI Vision Scanning
  const handleStartScanning = async () => {
    if (!selectedFile || !fileBase64) {
      setErrorMsg('অনুগ্রহ করে আগে একটি ছবি বা পিডিএফ আপলোড করুন।');
      return;
    }

    setStep('scanning');
    setErrorMsg(null);

    try {
      const apiKey = getGeminiApiKey();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (apiKey) {
        headers['x-gemini-key'] = apiKey;
      }

      const res = await fetch('/api/ai/vision-extract-questions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileBase64,
          mimeType: selectedFile.type,
          mode,
          targetClass: studentClass,
          subject,
          institutionName
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'এআই প্রসেসিং ব্যর্থ হয়েছে।');
      }

      const data = json.data;
      if (data.detectedClass && (!studentClass || studentClass === '১০ম শ্রেণি')) {
        setStudentClass(data.detectedClass);
      }
      if (data.detectedSubject && (!subject || subject === 'পদার্থবিজ্ঞান')) {
        setSubject(data.detectedSubject);
      }
      if (data.detectedInstitution && (!institutionName || institutionName.includes('মতিঝিল'))) {
        setInstitutionName(data.detectedInstitution);
      }

      const rawQuestions: any[] = data.questions || [];
      if (rawQuestions.length === 0) {
        throw new Error('ছবি থেকে কোনো প্রশ্ন চিহ্নিত করা সম্ভব হয়নি। পাতাটি স্পষ্ট করে আবার আপলোড করুন।');
      }

      // Format questions
      const formatted: ExtractedQuestion[] = rawQuestions.map((q, idx) => {
        let opts = Array.isArray(q.options) ? q.options : ['ক. অপশন ১', 'খ. অপশন ২', 'গ. অপশন ৩', 'ঘ. অপশন ৪'];
        if (opts.length < 4) {
          while (opts.length < 4) {
            opts.push(`অপশন ${opts.length + 1}`);
          }
        }
        
        let correctIdx = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : 0;
        if (correctIdx < 0 || correctIdx >= opts.length) correctIdx = 0;

        return {
          question: q.question || `${idx + 1}. প্রশ্ন`,
          options: opts,
          correctAnswer: opts[correctIdx] || opts[0],
          correctAnswerIndex: correctIdx,
          explanation: q.explanation || ''
        };
      });

      setQuestions(formatted);
      setStep('review');
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'ছবি প্রসেস করার সময় ত্রুটি ঘটেছে।');
      setStep('upload');
    }
  };

  // Update a single question field
  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Update option
  const handleUpdateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[oIdx] = value;
      copy[qIdx] = {
        ...copy[qIdx],
        options: opts,
        correctAnswer: opts[copy[qIdx].correctAnswerIndex || 0]
      };
      return copy;
    });
  };

  // Set correct answer
  const handleSetCorrectAnswer = (qIdx: number, oIdx: number) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIdx] = {
        ...copy[qIdx],
        correctAnswerIndex: oIdx,
        correctAnswer: copy[qIdx].options[oIdx]
      };
      return copy;
    });
  };

  // Delete question
  const handleDeleteQuestion = (qIdx: number) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
  };

  // Add blank question
  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question: `${prev.length + 1}. নতুন প্রশ্ন লিখুন...`,
        options: ['ক. অপশন ১', 'খ. অপশন ২', 'গ. অপশন ৩', 'ঘ. অপশন ৪'],
        correctAnswer: 'ক. অপশন ১',
        correctAnswerIndex: 0,
        explanation: ''
      }
    ]);
  };

  // Discard & return to upload step or previous page
  const handleDiscard = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileBase64(null);
    setQuestions([]);
    setStep('upload');
    setErrorMsg(null);
    onBack();
  };

  // FINALIZE & SAVE TO DATABASE (Auto-Purges Image from Memory)
  const handleFinalizeAndSaveToDatabase = async () => {
    if (questions.length === 0) {
      setErrorMsg('ডাটাবেজে সেভ করার মতো কোনো প্রশ্ন নেই।');
      return;
    }

    setIsSaving(true);
    try {
      const newPaper: InstitutionPaper = {
        id: `vision_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        institutionName: institutionName.trim() || 'এআই ভিশন প্রশ্নপত্র',
        institutionType: mode === 'book_page' ? 'board' : 'school',
        year: '২০২৪-২০২৫',
        studentClass: studentClass.trim() || '১০ম শ্রেণি',
        subject: subject.trim() || 'পদার্থবিজ্ঞান',
        examType: examType.trim() || 'টেস্ট পরীক্ষা',
        durationMinutes,
        totalMarks: questions.length,
        questionCount: questions.length,
        questions: questions.map((q, qIdx) => ({
          id: `q_vis_${Date.now()}_${qIdx}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          correctAnswerIndex: q.correctAnswerIndex ?? 0,
          explanation: q.explanation || ''
        })),
        createdAt: new Date().toISOString(),
        isCustomUploaded: true
      };

      // 1. Save lightweight text questions to local & server storage
      saveInstitutionPapers([newPaper]);
      await pushBulkPapersToServer([newPaper]);

      // 2. CRITICAL USER CONSTRAINT: Auto-delete the temporary image/pdf from memory
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setFileBase64(null);

      setIsSaving(false);
      onSavedSuccess();
      
      alert(`🎉 সফলভাবে সম্পন্ন হয়েছে!\n\n"${newPaper.institutionName}"-এর ${questions.length}টি প্রশ্ন ডাটাবেজে সংরক্ষণ করা হয়েছে।\nমূল ছবিটি ডাটাবেজে রাখা হয়নি এবং মেমোরি থেকে সম্পূর্ণ ডিলিট করা হয়েছে।`);
    } catch (err: any) {
      console.error('Save error:', err);
      setIsSaving(false);
      setErrorMsg('ডাটাবেজে সংরক্ষণ করতে সমস্যা হয়েছে: ' + (err.message || 'অজ্ঞাত ত্রুটি'));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ================= PAGE HEADER & BACK NAVIGATION ================= */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="কেন্দ্রীয় প্রশ্নব্যাংকে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">ফিরে যান</span>
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>এআই ভিশন প্রশ্ন কনভার্টার ও যাচাইকরণ</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                জিরো-স্টোরেজ গ্যারান্টি (ছবি সেভ হবে না)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              বইয়ের পাতার ছবি বা প্রশ্নপত্রের সফট কপি থেকে স্বয়ংক্রিয় প্রশ্ন রূপান্তর, চোখে দেখে যাচাই ও সংরক্ষণ
            </p>
          </div>
        </div>

        {step === 'review' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('upload')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>অন্য ছবি আপলোড</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= ERROR BANNER ================= */}
      {errorMsg && (
        <div className="bg-rose-950/80 border border-rose-800/80 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMsg(null)} 
            className="text-rose-400 hover:text-white font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= STEP 1: UPLOAD SCREEN (NORMAL PAGE VIEW) ================= */}
      {step === 'upload' && (
        <div className="space-y-6">
          
          {/* 1. Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <button
              type="button"
              onClick={() => setMode('question_paper')}
              className={`p-6 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                mode === 'question_paper'
                  ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/30'
                  : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <FileQuestion className="w-6 h-6" />
                </div>
                {mode === 'question_paper' && (
                  <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-black flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> নির্বাচিত মোড
                  </span>
                )}
              </div>
              <h3 className="font-bold text-white text-base mb-1.5">
                ১. প্রশ্নপত্র রূপান্তর (Question Paper Extraction)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                স্কুল, কলেজ, ক্যাডেট বা শিক্ষা বোর্ডের তৈরি প্রশ্নপত্রের ছবি/পিডিএফ দিলে তা প্রতিটি প্রশ্ন, ৪টি অপশন (ক, খ, গ, ঘ) এবং সঠিক উত্তর আলাদা করে টেক্সটে রূপান্তর করবে।
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('book_page')}
              className={`p-6 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                mode === 'book_page'
                  ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/30'
                  : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                {mode === 'book_page' && (
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> নির্বাচিত মোড
                  </span>
                )}
              </div>
              <h3 className="font-bold text-white text-base mb-1.5">
                ২. বইয়ের রিডিং পাতা থেকে প্রশ্ন তৈরি (Book Page Formulation)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                যেকোনো পাঠ্যবইয়ের রিডিং পড়ার পাতার ছবি দিলে এআই সেই বিষয়বস্তু ও মূল তথ্যগুলো পড়ে নিজে থেকেই উচ্চমানের ৪টি অপশনসহ নৈর্ব্যক্তিক (MCQ) প্রশ্ন ও সঠিক উত্তর বানিয়ে দেবে।
              </p>
            </button>

          </div>

          {/* 2. Metadata Context Form */}
          <div className="bg-[#0f172a] p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>প্রশ্নের তথ্য ও বিবরণ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  শ্রেণি (Class)
                </label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {['৩য় শ্রেণি', '৪র্থ শ্রেণি', '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি', '১০ম শ্রেণি', '১১শ শ্রেণি', '১২শ শ্রেণি'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  বিষয় (Subject)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="যেমন: পদার্থবিজ্ঞান, বাংলা, গণিত"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  উৎস / প্রতিষ্ঠানের নাম
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="যেমন: মতিঝিল আইডিয়াল / ঢাকা বোর্ড"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">
                  পরীক্ষার ধরন / অধ্যায়
                </label>
                <input
                  type="text"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  placeholder="যেমন: টেস্ট পরীক্ষা / অধ্যায় ২"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
          </div>

          {/* 3. Drag & Drop File Upload Area */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-3xl p-10 sm:p-14 bg-[#0f172a] hover:bg-[#0f172a]/80 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group shadow-sm text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            <div className="w-20 h-20 rounded-3xl bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              <Upload className="w-10 h-10" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <span className="text-base font-bold text-emerald-400 block">
                  ✓ নির্বাচিত ফাইল: {selectedFile.name}
                </span>
                <span className="text-xs text-slate-400 block">
                  ফাইলের সাইজ: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • অন্য ফাইল দিতে ক্লিক করুন
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base sm:text-lg">
                  বইয়ের পাতার ছবি বা প্রশ্নপত্রের ফাইল এখানে দিন অথবা ক্লিক করুন
                </h4>
                <p className="text-xs text-slate-400">
                  সাপোর্টেড ফরম্যাট: JPG, PNG, WEBP, PDF (সর্বোচ্চ ২৫ মেগাবাইট)
                </p>
              </div>
            )}
          </div>

          {/* 4. Action Button */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              disabled={!selectedFile}
              onClick={handleStartScanning}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-purple-900/40 cursor-pointer transition-all active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>এআই দিয়ে স্ক্যান ও প্রশ্ন রূপান্তর শুরু করুন</span>
            </button>
          </div>

        </div>
      )}

      {/* ================= STEP 2: SCANNING PROGRESS ================= */}
      {step === 'scanning' && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-12 sm:p-20 text-center flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin flex items-center justify-center" />
            <Sparkles className="w-10 h-10 text-amber-400 absolute inset-0 m-auto animate-bounce" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-black text-white">
              এআই পাতাটি পড়ে প্রশ্ন ও উত্তর তৈরি করছে...
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {mode === 'question_paper'
                ? 'প্রশ্নপত্রের প্রতিটি লাইন পড়ে প্রশ্নমালা, অপশন ও সঠিক উত্তর আলাদা করা হচ্ছে।'
                : 'বইয়ের পাঠ্য অংশ পড়ে গভীর ধারণামূলক ৪টি অপশনসহ মানসম্মত প্রশ্ন প্রস্তুত করা হচ্ছে।'}
            </p>
          </div>

          <div className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>মনে রাখবেন: প্রসেসিং শেষে ছবি ডাটাবেজে সংরক্ষণ করা হবে না</span>
          </div>
        </div>
      )}

      {/* ================= STEP 3: SIDE-BY-SIDE VERIFICATION (SPACIOUS RESPONSIVE GRID) ================= */}
      {step === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: ORIGINAL IMAGE / DOCUMENT VIEWER (5 COLS ON DESKTOP) */}
          <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-sm lg:sticky lg:top-24 flex flex-col">
            
            {/* Viewer Toolbar */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">
                  মূল পাতা / ছবির প্রিভিউ
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  সাময়িক মেমোরি
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  title="জুম ইন"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  title="জুম আউট"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setZoomLevel(1); setRotation(0); }}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  রিসেট
                </button>
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  title="ঘোরান (Rotate)"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image Viewer Container */}
            <div className="h-[480px] sm:h-[580px] overflow-auto p-4 flex items-center justify-center bg-black/50">
              {previewUrl ? (
                selectedFile?.type === 'application/pdf' ? (
                  <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    className="w-full h-full rounded-xl border border-slate-800"
                  />
                ) : (
                  <div 
                    className="transition-transform duration-150 origin-center"
                    style={{ 
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)` 
                    }}
                  >
                    <img
                      src={previewUrl}
                      alt="Uploaded Document"
                      className="max-w-full max-h-[520px] object-contain rounded-xl shadow-2xl border border-slate-700"
                    />
                  </div>
                )
              ) : (
                <div className="text-slate-500 text-xs">কোনো ছবি প্রিভিউ নেই</div>
              )}
            </div>

            {/* Note under image */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span>💡 বামে জুম করে মূল লেখার বানান ও অপশন মিলিয়ে দেখুন</span>
              <span className="text-emerald-400 font-bold">সেভ করলে এই ফাইলটি মুছে যাবে</span>
            </div>

          </div>

          {/* RIGHT COLUMN: VERIFICATION & EDITABLE QUESTIONS (7 COLS ON DESKTOP) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Review Section Header */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    যাচাইকরণ ও এডিট তালিকা ({questions.length}টি প্রশ্ন)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    প্রতিটি প্রশ্ন ও উত্তরের ওপর ক্লিক করে সরাসরি এডিট করতে পারবেন
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন প্রশ্ন যোগ</span>
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div 
                  key={qIdx}
                  className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 shadow-sm hover:border-slate-700 transition-all space-y-3"
                >
                  {/* Question Header & Delete */}
                  <div className="flex items-start justify-between gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 font-black text-xs flex items-center justify-center shrink-0">
                      {qIdx + 1}
                    </span>
                    
                    <div className="flex-1">
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'question', e.target.value)}
                        placeholder="প্রশ্নের বিবরণ লিখুন..."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(qIdx)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
                      title="প্রশ্ন মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.correctAnswerIndex === oIdx || opt === q.correctAnswer;
                      const label = ['ক', 'খ', 'গ', 'ঘ'][oIdx] || String(oIdx + 1);

                      return (
                        <div 
                          key={oIdx}
                          className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition-all ${
                            isCorrect 
                              ? 'bg-emerald-950/40 border-emerald-500/80 ring-1 ring-emerald-500/40' 
                              : 'bg-slate-900/80 border-slate-800'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetCorrectAnswer(qIdx, oIdx)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors cursor-pointer ${
                              isCorrect 
                                ? 'bg-emerald-500 text-black shadow-md' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                            title="সঠিক উত্তর হিসেবে চিহ্নিত করুন"
                          >
                            {label}
                          </button>

                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(qIdx, oIdx, e.target.value)}
                            className="flex-1 bg-transparent text-xs sm:text-sm text-white font-medium focus:outline-none"
                            placeholder={`অপশন ${label}`}
                          />

                          {isCorrect && (
                            <span className="text-[11px] font-black text-emerald-400 shrink-0">
                              ✓ সঠিক
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Field */}
                  <div>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                      placeholder="💡 ব্যাখ্যা (ঐচ্ছিক): কেন এই উত্তরটি সঠিক..."
                      className="w-full px-3.5 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-amber-200/90 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                </div>
              ))}
            </div>

            {/* Bottom Actions Sticky / Responsive Bar */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer text-center"
              >
                বাতিল করুন ও ফাইল ডিলিট
              </button>

              <button
                type="button"
                disabled={isSaving || questions.length === 0}
                onClick={handleFinalizeAndSaveToDatabase}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/40 transition-all cursor-pointer active:scale-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ডাটাবেজে সেভ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>যাচাই সম্পন্ন ও ডাটাবেজে সংরক্ষণ করুন ({questions.length}টি প্রশ্ন)</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
