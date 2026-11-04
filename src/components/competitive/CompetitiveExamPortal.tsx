import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  Play, 
  FileText, 
  Search, 
  HelpCircle, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Upload, 
  ArrowRight,
  GraduationCap,
  Layers,
  BarChart2
} from 'lucide-react';
import { AssignedTest, ExamTrack, ExamQuestion } from '../../types';
import { 
  COMPETITIVE_EXAM_PRESETS, 
  COMPETITIVE_QUESTION_BANK, 
  generateCompetitiveTestInOneClick 
} from '../../lib/competitiveQuestionBank';
import { saveStoredTests, getStoredTests } from '../../lib/storage';

interface CompetitiveExamPortalProps {
  onStartExam: (test: AssignedTest) => void;
  onNavigateHome: () => void;
}

export const CompetitiveExamPortal: React.FC<CompetitiveExamPortalProps> = ({
  onStartExam,
  onNavigateHome
}) => {
  const [selectedTrack, setSelectedTrack] = useState<ExamTrack | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'mock_tests' | 'topics' | 'generator' | 'import'>('mock_tests');
  
  // 1-Click Generator State
  const [genTrack, setGenTrack] = useState<ExamTrack>('bcs');
  const [genSubject, setGenSubject] = useState('সকল বিষয়');
  const [genCount, setGenCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bulk import state
  const [importText, setImportText] = useState('');
  const [importTrack, setImportTrack] = useState<ExamTrack>('bcs');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Filtered presets
  const filteredPresets = COMPETITIVE_EXAM_PRESETS.filter(item => {
    if (selectedTrack !== 'all' && item.track !== selectedTrack) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.trackLabel.toLowerCase().includes(q) ||
        (item.year && item.year.toString().includes(q))
      );
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Launch a curated preset exam
  const handleLaunchPreset = (preset: typeof COMPETITIVE_EXAM_PRESETS[0]) => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const test: AssignedTest = {
      id: `comp_${Date.now()}_${preset.id}`,
      title: preset.title,
      subject: preset.subject,
      chapter: preset.trackLabel,
      questionCount: preset.questions.length,
      durationMinutes: preset.durationMinutes,
      pin,
      createdAt: new Date().toLocaleDateString('bn-BD'),
      status: 'pending',
      studentName: 'পরীক্ষার্থী',
      proctoringEnabled: true,
      aiGradingEnabled: true,
      track: preset.track,
      negativeMarking: preset.negativeMark,
      examSource: preset.badge,
      year: preset.year,
      questions: preset.questions.map((q, idx) => ({
        ...q,
        id: `q_${Date.now()}_${idx}`
      }))
    };

    // Save to storage
    const existing = getStoredTests();
    saveStoredTests([test, ...existing]);

    // Start exam
    onStartExam(test);
  };

  // 1-Click Instant Exam Generation
  const handleOneClickGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateCompetitiveTestInOneClick({
        track: genTrack,
        subject: genSubject,
        questionCount: genCount
      });

      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const test: AssignedTest = {
        id: `oneclick_${Date.now()}`,
        title: generated.title,
        subject: generated.subject,
        chapter: generated.chapter,
        questionCount: generated.questions.length,
        durationMinutes: generated.durationMinutes,
        pin,
        createdAt: new Date().toLocaleDateString('bn-BD'),
        status: 'pending',
        studentName: 'পরীক্ষার্থী',
        proctoringEnabled: true,
        aiGradingEnabled: true,
        track: generated.track,
        negativeMarking: generated.negativeMarking,
        questions: generated.questions
      };

      const existing = getStoredTests();
      saveStoredTests([test, ...existing]);

      setIsGenerating(false);
      showToast(`✓ "${test.title}" সফলভাবে তৈরি হয়েছে! পরীক্ষা শুরু হচ্ছে...`);
      setTimeout(() => {
        onStartExam(test);
      }, 700);
    }, 400);
  };

  // Bulk Import Questions from Text/JSON/CSV
  const handleBulkImport = () => {
    if (!importText.trim()) {
      setImportStatus('অনুগ্রহ করে প্রশ্ন টেক্সট বা ফরম্যাট পেস্ট করুন।');
      return;
    }

    try {
      // Simple parse lines or JSON
      let addedCount = 0;
      if (importText.trim().startsWith('[') || importText.trim().startsWith('{')) {
        const parsed = JSON.parse(importText);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        list.forEach((item: any) => {
          if (item.question && Array.isArray(item.options)) {
            COMPETITIVE_QUESTION_BANK.push({
              id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              question: item.question,
              options: item.options,
              correctAnswer: item.correctAnswer || item.options[0],
              explanation: item.explanation || 'সংগৃহীত সমাধান',
              solutions: item.solutions || ['পদ্ধতি ১: সাধারণ সমাধান', 'পদ্ধতি ২: তথ্য বিশ্লেষণ'],
              track: importTrack,
              subject: item.subject || 'সাধারণ',
              negativeMarkValue: importTrack === 'bcs' ? 0.50 : 0.25
            });
            addedCount++;
          }
        });
      } else {
        // Line-by-line format: Question? | Opt1, Opt2, Opt3, Opt4 | Answer | Explanation
        const lines = importText.split('\n').filter(l => l.trim().length > 0);
        lines.forEach(line => {
          const parts = line.split('|').map(s => s.trim());
          if (parts.length >= 3) {
            const qText = parts[0];
            const opts = parts[1].split(',').map(o => o.trim());
            const ans = parts[2];
            const exp = parts[3] || 'তথ্য ও ব্যাখ্যা';
            if (opts.length >= 2) {
              COMPETITIVE_QUESTION_BANK.push({
                id: `custom_line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                question: qText,
                options: opts.length === 4 ? opts : [...opts, 'অন্যান্য', 'কোনটিই নয়'].slice(0, 4),
                correctAnswer: ans,
                explanation: exp,
                solutions: [`পদ্ধতি ১: ${exp}`, 'পদ্ধতি ২: বিকল্প বিশ্লেষণ পদ্ধতি'],
                track: importTrack,
                subject: 'সংগৃহীত ব্যাংক',
                negativeMarkValue: importTrack === 'bcs' ? 0.50 : 0.25
              });
              addedCount++;
            }
          }
        });
      }

      setImportStatus(`✓ সফলভাবে ${addedCount}টি প্রশ্ন ডাটাবেজে যুক্ত করা হয়েছে! এখন ১ ক্লিকে প্রশ্নপত্র তৈরিতে এগুলো ব্যবহার হবে।`);
      setImportText('');
    } catch (e: any) {
      setImportStatus('ফরম্যাট সঠিক নয়। অনুগ্রহ করে লাইনভিত্তিক প্রশ্ন|অপশন|সঠিক উত্তর আকারে দিন বা JSON দিন।');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs sm:text-sm animate-in slide-in-from-top flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Hero */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-300">
            <span>বিসিএস (BCS)</span>
            <span>·</span>
            <span>মেডিকেল ও ডেন্টাল</span>
            <span>·</span>
            <span>ঢাকা বিশ্ববিদ্যালয় ও গুচ্ছ</span>
            <span>·</span>
            <span>বুয়েট ও ইঞ্জিনিয়ারিং</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            ভর্তি ও সরকারি চাকরি প্রস্তুতি পোর্টাল
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            বিগত বছরের আসল প্রশ্নপত্র, পিএসসি ও স্বাস্থ্য অধিদপ্তরের মানদণ্ডে নির্ধারিত নেগেটিভ মার্কিংসহ পূর্ণাঙ্গ মডেল টেস্ট এবং বিষয়ভিত্তিক প্রশ্নব্যাংকের মাধ্যমে নিজেকে যাচাই করুন।
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('generator')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>১ ক্লিকে প্রশ্নপত্র তৈরি করুন</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-400" />
              <span>প্রশ্নব্যাংক ইমপোর্ট (Excel / Text)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Controller */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('mock_tests')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'mock_tests'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🏆 পূর্ণাঙ্গ মডেল টেস্ট ও বিগত সালের প্রশ্ন
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'generator'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          ⚡ ১ ক্লিকে প্রশ্নপত্র জেনারেটর
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('topics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'topics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          📚 বিষয়ভিত্তিক প্রশ্নব্যাংক
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'import'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          📥 প্রশ্ন আপলোড ও সংরক্ষণ
        </button>
      </div>

      {/* ================================================================= */}
      {/* TAB 1: CURATED MOCK TESTS & PAST PAPERS                           */}
      {/* ================================================================= */}
      {activeTab === 'mock_tests' && (
        <div className="space-y-5">
          
          {/* Track Filter Tabs & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Track Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
              {[
                { id: 'all', label: 'সকল ক্যাটাগরি' },
                { id: 'bcs', label: 'বিসিএস প্রিলিমিনারি' },
                { id: 'medical', label: 'মেডিকেল ও ডেন্টাল' },
                { id: 'varsity', label: 'বিশ্ববিদ্যালয় ভর্তি' },
                { id: 'engineering', label: 'ইঞ্জিনিয়ারিং' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedTrack(item.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedTrack === item.id
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="পরীক্ষা বা বিষয়ের নাম খুঁজুন..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPresets.map(preset => (
              <div
                key={preset.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                      {preset.trackLabel}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {preset.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {preset.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{preset.durationMinutes} মিনিট</span>
                    </span>
                    <span>·</span>
                    <span>{preset.questionCount}টি বহুনির্বাচনী প্রশ্ন</span>
                    <span>·</span>
                    <span className="text-rose-600 font-semibold">
                      নেগেটিভ মার্ক: -{preset.negativeMark.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLaunchPreset(preset)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>পরীক্ষা শুরু করুন (টাইমারসহ)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPresets.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">কোনো পরীক্ষা পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-500">অনুগ্রহ করে সার্চ কুয়েরি পরিবর্তন করুন বা অন্য ক্যাটাগরি নির্বাচন করুন।</p>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 2: 1-CLICK INSTANT EXAM GENERATOR                             */}
      {/* ================================================================= */}
      {activeTab === 'generator' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">ইনস্ট্যান্ট জেনারেটর</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              ১ ক্লিকে প্রশ্নপত্র ও মডেল টেস্ট তৈরি করুন
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              আপনার পছন্দের ক্যাটাগরি ও প্রশ্ন সংখ্যা নির্বাচন করুন। কেন্দ্রীয় প্রশ্নব্যাংক থেকে স্বয়ংক্রিয়ভাবে নির্ভুল উত্তর ও বিকল্প সমাধানসহ সম্পূর্ণ প্রশ্নপত্র তৈরি হবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Track Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">পরীক্ষার বিভাগ বা ট্র্যাক:</label>
              <select
                value={genTrack}
                onChange={e => setGenTrack(e.target.value as ExamTrack)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bcs">🏛️ বিসিএস প্রিলিমিনারি</option>
                <option value="medical">🩺 মেডিকেল ও ডেন্টাল ভর্তি</option>
                <option value="varsity">🏢 বিশ্ববিদ্যালয় ভর্তি (ঢাবি/গুচ্ছ)</option>
                <option value="engineering">⚙️ ইঞ্জিনিয়ারিং (বুয়েট/সিকেয়েট)</option>
              </select>
            </div>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">বিষয় নির্বাচন:</label>
              <select
                value={genSubject}
                onChange={e => setGenSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="সকল বিষয়">সকল বিষয় (পূর্ণাঙ্গ মডেল টেস্ট)</option>
                <option value="বাংলা ভাষা ও সাহিত্য">বাংলা ভাষা ও সাহিত্য</option>
                <option value="বাংলাদেশ বিষয়াবলী">বাংলাদেশ বিষয়াবলী</option>
                <option value="গাণিতিক যুক্তি ও মানসিক দক্ষতা">গণিত ও মানসিক দক্ষতা</option>
                <option value="জীববিজ্ঞান (প্রাণিবিজ্ঞান)">জীববিজ্ঞান</option>
                <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
                <option value="উচ্চতর গণিত">উচ্চতর গণিত</option>
                <option value="রসায়ন">রসায়ন</option>
              </select>
            </div>

            {/* Question Count */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">প্রশ্নের সংখ্যা:</label>
              <select
                value={genCount}
                onChange={e => setGenCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>৫টি প্রশ্ন (কুইক টেস্ট - ৫ মিনিট)</option>
                <option value={10}>১০টি প্রশ্ন (স্ট্যান্ডার্ড - ১০ মিনিট)</option>
                <option value={20}>২০টি প্রশ্ন (মিডিয়াম - ২০ মিনিট)</option>
                <option value={50}>৫০টি প্রশ্ন (হাফ মডেল টেস্ট - ৪৫ মিনিট)</option>
                <option value={100}>১০০টি প্রশ্ন (পূর্ণাঙ্গ মডেল টেস্ট - ৯০ মিনিট)</option>
              </select>
            </div>
          </div>

          {/* Rule Highlights */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
            <div className="space-y-0.5">
              <span className="font-bold block">নেগেটিভ মার্কিং নিয়ম:</span>
              <p className="text-blue-800 text-[11px]">
                {genTrack === 'bcs' ? 'বিসিএস পরীক্ষার নিয়ম অনুযায়ী প্রতিটি ভুল উত্তরের জন্য ০.৫০ নম্বর কাটা যাবে।' : 'মেডিকেল ও ভর্তি পরীক্ষার নিয়ম অনুযায়ী প্রতিটি ভুল উত্তরের জন্য ০.২৫ নম্বর কাটা যাবে।'}
              </p>
            </div>
            <div className="shrink-0 text-[11px] font-bold bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700">
              {genTrack === 'bcs' ? 'নেগেটিভ: -০.৫০' : 'নেগেটিভ: -০.২৫'}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleOneClickGenerate}
              className="py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{isGenerating ? 'প্রশ্নপত্র প্রস্তুত হচ্ছে...' : '১ ক্লিকে প্রশ্নপত্র তৈরি ও পরীক্ষা শুরু করুন'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: SUBJECT & TOPIC WISE QUESTION BANKS                        */}
      {/* ================================================================= */}
      {activeTab === 'topics' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">বিষয়ভিত্তিক আর্কাইভ ও সেলফ-প্র্যাকটিস</h3>
              <p className="text-xs text-slate-500">দুর্বল বিষয়গুলো চিহ্নিত করে একক বিষয়ের ওপর পরীক্ষা দিয়ে প্রস্তুতি মজবুত করুন।</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {[
              { title: 'বাংলা ভাষা ও সাহিত্য', track: 'bcs' as const, qCount: 15, tag: 'বিসিএস ও পিএসসি', source: 'চর্যাপদ, আধুনিক যুগ ও ব্যাকরণ' },
              { title: 'বাংলাদেশ বিষয়াবলী', track: 'bcs' as const, qCount: 12, tag: 'বিসিএস ও বিশ্ববিদ্যালয়', source: 'সংবিধান, মুক্তিযুদ্ধ ও অর্থনীতি' },
              { title: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা', track: 'bcs' as const, qCount: 10, tag: 'বিসিএস ও ব্যাংক জব', source: 'বীজগণিত, জ্যামিতি ও মানসিক দক্ষতা' },
              { title: 'জীববিজ্ঞান (প্রাণি ও উদ্ভিদবিজ্ঞান)', track: 'medical' as const, qCount: 14, tag: 'মেডিকেল ও ডেন্টাল', source: 'কোষতত্ত্ব, রক্তসংবহন ও জিনতত্ত্ব' },
              { title: 'পদার্থবিজ্ঞান', track: 'varsity' as const, qCount: 10, tag: 'ঢাবি ‘ক’ ইউনিট ও মেডিকেল', source: 'ভেক্টর, গতিবিদ্যা ও নিউক্লিয়ার' },
              { title: 'উচ্চতর গণিত ও ক্যালকুলাস', track: 'engineering' as const, qCount: 8, tag: 'বুয়েট ও বিশ্ববিদ্যালয়', source: 'লিমিট, অন্তরীকরণ ও যোগজীকরণ' }
            ].map((topic, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {topic.tag}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{topic.title}</h4>
                  <p className="text-xs text-slate-500">{topic.source}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">প্রশ্ন ভাণ্ডার: {topic.qCount}+ টি</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGenTrack(topic.track);
                      setGenSubject(topic.title);
                      setGenCount(10);
                      handleOneClickGenerate();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>অনুশীলন শুরু</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: BULK QUESTION IMPORT & STORAGE MANAGEMENT                  */}
      {/* ================================================================= */}
      {activeTab === 'import' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">বাল্ক প্রশ্ন ডেটাবেজ ইমপোর্ট</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              আপনার সংরক্ষিত হাজার হাজার প্রশ্ন ডাটাবেজে যুক্ত করুন
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              আপনার কাছে থাকা সকল বইয়ের (১ম-১২শ বা বিসিএস/মেডিকেল/বিশ্ববিদ্যালয়) প্রশ্নাবলি এক ক্লিকে প্ল্যাটফর্মের কেন্দ্রীয় মেমোরি ও প্রশ্নব্যাংকে ইমপোর্ট করুন।
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-slate-700">লক্ষ্য বিভাগ (Track):</label>
              <select
                value={importTrack}
                onChange={e => setImportTrack(e.target.value as ExamTrack)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
              >
                <option value="bcs">বিসিএস ও চাকরি</option>
                <option value="medical">মেডিকেল ভর্তি</option>
                <option value="varsity">বিশ্ববিদ্যালয় ভর্তি</option>
                <option value="academic">একাডেমিক (১ম-১২শ)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                প্রশ্ন টেক্সট / পাইপ ফরম্যাট অথবা JSON পেস্ট করুন:
              </label>
              <textarea
                rows={6}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={`ফরম্যাট উদাহরণ ১ (পাইপ সেপারেটেড):\nপ্রশ্নটি এখানে লিখুন? | অপশন ক, অপশন খ, অপশন গ, অপশন ঘ | সঠিক উত্তর | সংক্ষিপ্ত ব্যাখ্যা\n\nফরম্যাট উদাহরণ ২ (JSON Array):\n[\n  {\n    "question": "চর্যাপদ কে আবিষ্কার করেন?",\n    "options": ["হরপ্রসাদ শাস্ত্রী", "সুকুমার সেন", "সুনীতিকুমার", "ড. মুহম্মদ শহীদুল্লাহ"],\n    "correctAnswer": "হরপ্রসাদ শাস্ত্রী",\n    "explanation": "১৯০৭ সালে নেপাল থেকে আবিষ্কার করেন"\n  }\n]`}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900">
                {importStatus}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBulkImport}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>ডাটাবেজে সেভ করুন</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportText(`চর্যাপদ কোন ছন্দে রচিত? | মাত্রাবৃত্ত ছন্দ, অক্ষরবৃত্ত ছন্দ, স্বরবৃত্ত ছন্দ, গদ্য ছন্দ | মাত্রাবৃত্ত ছন্দ | চর্যাপদের অধিকাংশ পদই মাত্রাবৃত্ত ছন্দে রচিত।\nরক্তে গ্লুকোজের স্বাভাবিক মাত্রা কত? | ৩.৯ থেকে ৫.৬ mmol/L, ৭.৫ থেকে ১০.২ mmol/L, ১.২ থেকে ২.৪ mmol/L, ১১.০ থেকে ১৫.০ mmol/L | ৩.৯ থেকে ৫.৬ mmol/L | খালি পেটে স্বাভাবিক মাত্রা ৩.৯ - ৫.৬ মিলিমোল/লিটার।`);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                নমুনা প্রশ্ন লোড করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
