import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Search, Filter, Plus, Edit3, Copy, Trash2, Printer, Globe, 
  Download, Upload, Tag, Calendar, Clock, Check, ChevronDown, ChevronUp, 
  Sparkles, FolderArchive, Save, RefreshCw, X, AlertCircle, Eye, CheckCircle2,
  Layers, BarChart2, FileText, ArrowUpDown
} from 'lucide-react';
import { AssignedTest, ExamQuestion } from '../../types';
import { toBn } from '../../lib/utils';
import { BLOOM_LEVELS, normalizeBloomLevel, calculateBloomStats } from '../../lib/bloomTaxonomy';
import { PrintableQuestionPaperModal } from '../exam/PrintableQuestionPaperModal';

interface TeacherQuestionLibraryProps {
  tests: AssignedTest[];
  onSaveTests: (updated: AssignedTest[]) => void;
  onEditPaper: (test: AssignedTest) => void;
  onOpenCreateModal: () => void;
  onDirectStartExam?: (test: AssignedTest) => void;
  onToast: (msg: string) => void;
}

export const TeacherQuestionLibrary: React.FC<TeacherQuestionLibraryProps> = ({
  tests,
  onSaveTests,
  onEditPaper,
  onOpenCreateModal,
  onDirectStartExam,
  onToast
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'questions_desc' | 'questions_asc' | 'title_asc'>('newest');

  // Preview & Printing State
  const [printTest, setPrintTest] = useState<AssignedTest | null>(null);
  const [expandedPreviewIds, setExpandedPreviewIds] = useState<Record<string, boolean>>({});

  // Inline Renaming State
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Tag Adding State
  const [taggingId, setTaggingId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Toggle quick preview for a paper
  const togglePreview = (id: string) => {
    setExpandedPreviewIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Extract unique classes, subjects, and tags for filter dropdowns
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    tests.forEach(t => {
      if (t.studentClass) set.add(t.studentClass);
    });
    return Array.from(set).sort();
  }, [tests]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    tests.forEach(t => {
      if (t.subject) set.add(t.subject);
    });
    return Array.from(set).sort();
  }, [tests]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    tests.forEach(t => {
      (t.customTags || []).forEach(tag => set.add(tag));
    });
    return Array.from(set).sort();
  }, [tests]);

  // Total Metrics
  const totalQuestionsInBank = useMemo(() => {
    return tests.reduce((sum, t) => sum + (t.questions?.length || t.questionCount || 0), 0);
  }, [tests]);

  // Filtered & Sorted Tests
  const filteredTests = useMemo(() => {
    let result = [...tests];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(t => {
        const titleMatch = t.title?.toLowerCase().includes(q);
        const subjectMatch = t.subject?.toLowerCase().includes(q);
        const chapterMatch = t.chapter?.toLowerCase().includes(q);
        const classMatch = t.studentClass?.toLowerCase().includes(q);
        const tagMatch = (t.customTags || []).some(tag => tag.toLowerCase().includes(q));
        const questionTextMatch = (t.questions || []).some(quest => quest.question?.toLowerCase().includes(q));
        return titleMatch || subjectMatch || chapterMatch || classMatch || tagMatch || questionTextMatch;
      });
    }

    if (selectedClassFilter !== 'all') {
      result = result.filter(t => t.studentClass === selectedClassFilter);
    }

    if (selectedSubjectFilter !== 'all') {
      result = result.filter(t => t.subject === selectedSubjectFilter);
    }

    if (selectedTagFilter !== 'all') {
      result = result.filter(t => (t.customTags || []).includes(selectedTagFilter));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.lastModifiedAt ? new Date(a.lastModifiedAt).getTime() : parseInt(a.id.replace(/\D/g, '') || '0', 10);
        const timeB = b.lastModifiedAt ? new Date(b.lastModifiedAt).getTime() : parseInt(b.id.replace(/\D/g, '') || '0', 10);
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = a.lastModifiedAt ? new Date(a.lastModifiedAt).getTime() : parseInt(a.id.replace(/\D/g, '') || '0', 10);
        const timeB = b.lastModifiedAt ? new Date(b.lastModifiedAt).getTime() : parseInt(b.id.replace(/\D/g, '') || '0', 10);
        return timeA - timeB;
      }
      if (sortBy === 'questions_desc') {
        return (b.questions?.length || 0) - (a.questions?.length || 0);
      }
      if (sortBy === 'questions_asc') {
        return (a.questions?.length || 0) - (b.questions?.length || 0);
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '', 'bn');
      }
      return 0;
    });

    return result;
  }, [tests, searchQuery, selectedClassFilter, selectedSubjectFilter, selectedTagFilter, sortBy]);

  // Rename a paper
  const handleStartRename = (t: AssignedTest) => {
    setRenamingId(t.id);
    setRenameValue(t.title);
  };

  const handleSaveRename = (id: string) => {
    if (!renameValue.trim()) {
      onToast('⚠️ প্রশ্নপত্রের নাম ফাঁকা রাখা যাবে না!');
      return;
    }
    const updated = tests.map(t => {
      if (t.id === id) {
        return {
          ...t,
          title: renameValue.trim(),
          lastModifiedAt: new Date().toISOString()
        };
      }
      return t;
    });
    onSaveTests(updated);
    setRenamingId(null);
    onToast('✓ প্রশ্নপত্রের নাম সফলভাবে পরিবর্তন করা হয়েছে।');
  };

  // Add Tag
  const handleAddTag = (id: string) => {
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim();
    const updated = tests.map(t => {
      if (t.id === id) {
        const existingTags = t.customTags || [];
        if (!existingTags.includes(tag)) {
          return {
            ...t,
            customTags: [...existingTags, tag],
            lastModifiedAt: new Date().toISOString()
          };
        }
      }
      return t;
    });
    onSaveTests(updated);
    setNewTagInput('');
    setTaggingId(null);
    onToast(`✓ ট্যাগ "${tag}" সফলভাবে যুক্ত হয়েছে।`);
  };

  // Remove Tag
  const handleRemoveTag = (id: string, tagToRemove: string) => {
    const updated = tests.map(t => {
      if (t.id === id) {
        return {
          ...t,
          customTags: (t.customTags || []).filter(tag => tag !== tagToRemove),
          lastModifiedAt: new Date().toISOString()
        };
      }
      return t;
    });
    onSaveTests(updated);
    onToast(`✓ ট্যাগ মুছে ফেলা হয়েছে।`);
  };

  // Duplicate Paper / Create Parallel Set
  const handleDuplicatePaper = (original: AssignedTest) => {
    const newPin = Math.floor(100000 + Math.random() * 900000).toString();
    const clonedQuestions = (original.questions || []).map((q, idx) => ({
      ...q,
      id: `clone_q_${Date.now()}_${idx}`
    }));

    const duplicatedTest: AssignedTest = {
      ...original,
      id: `test-${Date.now()}`,
      title: `${original.title} (সেট খ - প্রতিলিপি)`,
      pin: newPin,
      createdAt: 'আজ, এইমাত্র',
      lastModifiedAt: new Date().toISOString(),
      status: 'pending',
      questions: clonedQuestions,
      isSavedToLibrary: true,
      customTags: [...(original.customTags || []), 'ক্লোন/সেট খ']
    };

    const updated = [duplicatedTest, ...tests];
    onSaveTests(updated);
    onToast(`✓ প্রশ্নপত্রটির নতুন সেট তৈরি হয়েছে! পিন: ${toBn(newPin)}`);
  };

  // Delete Paper
  const handleDeletePaper = (id: string) => {
    const updated = tests.filter(t => t.id !== id);
    onSaveTests(updated);
    setDeletingId(null);
    onToast('✓ প্রশ্নপত্রটি লাইব্রেরি ও আর্কাইভ থেকে মুছে ফেলা হয়েছে।');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    if (tests.length === 0) {
      onToast('⚠️ কোনো সংরক্ষিত প্রশ্নপত্র নেই!');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tests, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dapathshala_teacher_question_bank_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast(`✓ সকল ${toBn(tests.length)}টি প্রশ্নপত্রের ব্যাকআপ ফাইল ডাউনলোড হয়েছে!`);
  };

  // Import JSON Backup
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);

        if (!Array.isArray(importedData)) {
          onToast('⚠️ ব্যাকআপ ফাইলের ফরম্যাট সঠিক নয় (অ্যারে প্রত্যাশিত)।');
          return;
        }

        // Merge without duplicate IDs
        const existingIds = new Set(tests.map(t => t.id));
        const newTests: AssignedTest[] = [];

        importedData.forEach((item: any) => {
          if (item && item.title && Array.isArray(item.questions)) {
            if (existingIds.has(item.id)) {
              // Generate fresh ID and pin to prevent collision
              item.id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
              item.pin = Math.floor(100000 + Math.random() * 900000).toString();
            }
            item.isSavedToLibrary = true;
            newTests.push(item);
          }
        });

        if (newTests.length === 0) {
          onToast('⚠️ ব্যাকআপ ফাইলে কোনো বৈধ প্রশ্নপত্র পাওয়া যায়নি।');
          return;
        }

        const merged = [...newTests, ...tests];
        onSaveTests(merged);
        onToast(`✓ সফলভাবে ${toBn(newTests.length)}টি প্রশ্নপত্র লাইব্রেরিতে আমদানি করা হয়েছে!`);
      } catch (err) {
        onToast('⚠️ ব্যাকআপ ফাইল পড়া সম্ভব হয়নি। সঠিক JSON ফাইল নির্বাচন করুন।');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // If user opened Official A4 Printable Question Paper, render it naturally as a regular full page
  if (printTest) {
    return (
      <PrintableQuestionPaperModal
        test={printTest}
        onClose={() => setPrintTest(null)}
        onLaunchOnlineExam={onDirectStartExam}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden File Input for JSON Backup Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept=".json" 
        className="hidden" 
      />

      {/* Top Banner & Action Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>শিক্ষকের স্থায়ী প্রশ্ন আর্কাইভ ও ডিজিটাল লাইব্রেরি</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>আমার প্রশ্নপত্র লাইব্রেরি</span>
              <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase">
                {toBn(tests.length)} সেট সংরক্ষিত
              </span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              আপনার তৈরিকৃত ও সংগৃহীত প্রশ্নপত্র আজীবনের জন্য সংরক্ষিত থাকবে। যেকোনো সময় নাম পরিবর্তন, প্রশ্নের পরিমার্জন, বিকল্প প্রশ্ন দিয়ে প্রতিস্থাপন, A4 প্রিন্ট বা ডুপ্লিকেট সেট তৈরি করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্রশ্নপত্র তৈরি</span>
            </button>

            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              title="সকল প্রশ্নপত্রের ব্যাকআপ ফাইল ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>ব্যাকআপ ডাউনলোড</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              title="পূর্বের ব্যাকআপ JSON ফাইল রিস্টোর করুন"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>রিস্টোর / ইমপোর্ট</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-indigo-900/50">
          <div className="bg-slate-800/60 rounded-2xl p-3 border border-indigo-800/30">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>সংরক্ষিত প্রশ্নপত্র</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {toBn(tests.length)} <span className="text-xs font-normal text-slate-400">সেট</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-indigo-800/30">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>মোট প্রশ্নের সংগ্রহ</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {toBn(totalQuestionsInBank)} <span className="text-xs font-normal text-slate-400">টি প্রশ্ন</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-indigo-800/30">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>ভিন্ন বিষয় ও শ্রেণি</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {toBn(availableSubjects.length || 1)} <span className="text-xs font-normal text-slate-400">বিষয়</span>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-2xl p-3 border border-indigo-800/30">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold mb-1">
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট-রেডি ফরম্যাট</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              ১০০% <span className="text-xs font-normal text-slate-400">বোর্ড স্ট্যান্ডার্ড</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sorter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="প্রশ্নপত্রের নাম, বিষয়, অধ্যায়, বা নির্দিষ্ট প্রশ্ন লিখে সার্চ করুন..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sorter Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">সাজান:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="newest">সর্বশেষ সম্পাদিত / নতুন আগে</option>
              <option value="oldest">পুরাতন আগে</option>
              <option value="questions_desc">বেশি প্রশ্ন আগে</option>
              <option value="questions_asc">কম প্রশ্ন আগে</option>
              <option value="title_asc">নাম অনুযায়ী (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>ফিল্টার:</span>
          </span>

          {/* Subject Filter */}
          {availableSubjects.length > 0 && (
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="py-1 px-2.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">সকল বিষয় ({toBn(tests.length)})</option>
              {availableSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          )}

          {/* Class Filter */}
          {availableClasses.length > 0 && (
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="py-1 px-2.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">সকল শ্রেণি</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          )}

          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="py-1 px-2.5 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">সকল ট্যাগ</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {(searchQuery || selectedClassFilter !== 'all' || selectedSubjectFilter !== 'all' || selectedTagFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedClassFilter('all');
                setSelectedSubjectFilter('all');
                setSelectedTagFilter('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto cursor-pointer hover:underline"
            >
              ফিল্টার মুছুন
            </button>
          )}
        </div>
      </div>

      {/* Main List of Archived Question Papers */}
      {filteredTests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
            <FolderArchive className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-black text-slate-800">
              {searchQuery || selectedSubjectFilter !== 'all' || selectedClassFilter !== 'all'
                ? 'কোনো মেলানো প্রশ্নপত্র পাওয়া যায়নি'
                : 'আপনার প্রশ্ন লাইব্রেরি এখনো খালি'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {searchQuery || selectedSubjectFilter !== 'all'
                ? 'অনুগ্রহ করে ভিন্ন কোনো শব্দ লিখে খুঁজুন অথবা ফিল্টার রিসেট করুন।'
                : 'প্রশ্ন তৈরি করার পর বা প্রতিষ্ঠান ও সালের প্রশ্ন ব্যাংক থেকে প্রশ্ন সেভ করলে তা এখানে সংরক্ষিত থাকবে।'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>প্রথম প্রশ্নপত্র তৈরি শুরু করুন</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>প্রদর্শিত হচ্ছে: {toBn(filteredTests.length)}টি প্রশ্নপত্র</span>
          </div>

          {filteredTests.map((test) => {
            const questionList = test.questions || [];
            const qCount = questionList.length || test.questionCount || 0;
            const bloomStats = calculateBloomStats(questionList);
            const isPreviewExpanded = Boolean(expandedPreviewIds[test.id]);
            const isRenaming = renamingId === test.id;
            const isTagging = taggingId === test.id;
            const tags = test.customTags || [];

            return (
              <div 
                key={test.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Paper Header Card */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    {/* Title with Inline Rename support */}
                    <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(test.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            autoFocus
                            className="flex-1 py-1 px-2.5 text-sm sm:text-base font-bold bg-white border-2 border-blue-500 rounded-lg focus:outline-none"
                            placeholder="প্রশ্নপত্রের নতুন শিরোনাম..."
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(test.id)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                            title="সংরক্ষণ"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRenamingId(null)}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
                            title="বাতিল"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-indigo-900 transition-colors">
                            {test.title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => handleStartRename(test)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-blue-600 cursor-pointer rounded"
                            title="নাম পরিবর্তন / রিনেম"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Sub-meta: Subject, Chapter, Class */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          <BookOpen className="w-3 h-3" />
                          <span>{test.subject || 'সাধারণ'}</span>
                        </span>

                        {test.studentClass && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                            {test.studentClass}
                          </span>
                        )}

                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 truncate max-w-xs" title={test.chapter}>
                          অধ্যায়: {test.chapter}
                        </span>

                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-500">
                          পিন: <span className="font-bold text-slate-800">{toBn(test.pin)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Quick Badge: Question Count & Duration */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>{toBn(qCount)} টি প্রশ্ন</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{toBn(test.durationMinutes)} মিনিট</span>
                      </span>
                    </div>
                  </div>

                  {/* Bloom's Taxonomy Cognitive Distribution Bar */}
                  {qCount > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1 text-slate-600">
                          <BarChart2 className="w-3 h-3 text-indigo-500" />
                          <span>ব্লুমস ট্যাক্সোনমি ভারসাম্য:</span>
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-emerald-700">জ্ঞান {toBn(bloomStats.percentages.knowledge)}%</span>
                          <span className="text-blue-700">অনুধাবন {toBn(bloomStats.percentages.comprehension)}%</span>
                          <span className="text-amber-700">প্রয়োগ {toBn(bloomStats.percentages.application)}%</span>
                          <span className="text-purple-700">উচ্চতর {toBn(bloomStats.percentages.higher_order)}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
                        <div style={{ width: `${bloomStats.percentages.knowledge}%` }} className="bg-emerald-500 h-full" title={`জ্ঞানমূলক: ${bloomStats.counts.knowledge}টি`} />
                        <div style={{ width: `${bloomStats.percentages.comprehension}%` }} className="bg-blue-500 h-full" title={`অনুধাবনমূলক: ${bloomStats.counts.comprehension}টি`} />
                        <div style={{ width: `${bloomStats.percentages.application}%` }} className="bg-amber-500 h-full" title={`প্রয়োগমূলক: ${bloomStats.counts.application}টি`} />
                        <div style={{ width: `${bloomStats.percentages.higher_order}%` }} className="bg-purple-500 h-full" title={`উচ্চতর দক্ষতা: ${bloomStats.counts.higher_order}টি`} />
                      </div>
                    </div>
                  )}

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <span 
                        key={tag}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200/60 px-2 py-0.5 rounded-full"
                      >
                        <Tag className="w-2.5 h-2.5 text-indigo-500" />
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(test.id, tag)}
                          className="hover:text-rose-600 ml-0.5 cursor-pointer"
                          title="ট্যাগ মুছুন"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {isTagging ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTag(test.id);
                            if (e.key === 'Escape') setTaggingId(null);
                          }}
                          placeholder="ট্যাগের নাম..."
                          autoFocus
                          className="text-[11px] py-0.5 px-2 bg-white border border-blue-400 rounded-md focus:outline-none w-24"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTag(test.id)}
                          className="text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          যোগ
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaggingId(null)}
                          className="text-[11px] text-slate-500 hover:text-slate-700 px-1 py-0.5 cursor-pointer"
                        >
                          বাতিল
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setTaggingId(test.id);
                          setNewTagInput('');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded-full border border-dashed border-slate-300 transition-colors cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>ট্যাগ যোগ</span>
                      </button>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* 1. Edit / Modify */}
                      <button
                        type="button"
                        onClick={() => onEditPaper(test)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-98 text-indigo-700 font-bold text-xs transition-all cursor-pointer border border-indigo-200 shadow-2xs"
                        title="প্রশ্ন পরিমার্জন, বিকল্প প্রশ্ন দিয়ে প্রতিস্থাপন বা নতুন প্রশ্ন যোগ করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>সংস্কার / এডিট করুন</span>
                      </button>

                      {/* 2. Clone / Parallel Set */}
                      <button
                        type="button"
                        onClick={() => handleDuplicatePaper(test)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-700 font-bold text-xs transition-all cursor-pointer border border-slate-200 shadow-2xs"
                        title="এই প্রশ্নপত্রটি কপি করে সেট খ বা প্যারালাল সেট তৈরি করুন"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        <span>ডুপ্লিকেট / সেট তৈরি</span>
                      </button>

                      {/* 3. A4 Printable Modal */}
                      <button
                        type="button"
                        onClick={() => setPrintTest(test)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-98 text-emerald-800 font-bold text-xs transition-all cursor-pointer border border-emerald-200 shadow-2xs"
                        title="অফিসিয়াল ২-কলাম A4 প্রিন্ট ও শিক্ষক সমাধান গাইড"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-600" />
                        <span>A4 প্রিন্ট / PDF</span>
                      </button>

                      {/* 4. Live Exam */}
                      {onDirectStartExam && (
                        <button
                          type="button"
                          onClick={() => onDirectStartExam(test)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 active:scale-98 text-blue-700 font-bold text-xs transition-all cursor-pointer border border-blue-200 shadow-2xs"
                          title="অনলাইনে সরাসরি পরীক্ষা চালু করুন"
                        >
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span>অনলাইনে লাইভ পরীক্ষা</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Accordion Quick Preview Toggle */}
                      <button
                        type="button"
                        onClick={() => togglePreview(test.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isPreviewExpanded ? 'প্রিভিউ বন্ধ' : 'সব প্রশ্ন দেখুন'}</span>
                        {isPreviewExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {/* Delete */}
                      {deletingId === test.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-1">
                          <span className="text-[11px] font-bold text-rose-700 px-1">মুছবেন?</span>
                          <button
                            type="button"
                            onClick={() => handleDeletePaper(test.id)}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                          >
                            হ্যাঁ
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 rounded text-[11px] cursor-pointer"
                          >
                            না
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingId(test.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="লাইব্রেরি থেকে মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Preview Accordion Drawer (Expanded) */}
                {isPreviewExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200/90 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>প্রশ্নপত্রের বিস্তারিত সূচি ({toBn(questionList.length)}টি প্রশ্ন)</span>
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        সঠিক উত্তর সবুজ বৃত্ত এবং ব্যাখ্যামূলক সমাধান নিচে দেওয়া আছে
                      </span>
                    </div>

                    <div className="space-y-3">
                      {questionList.map((q, qIdx) => {
                        const cog = normalizeBloomLevel(q.cognitiveLevel);
                        const cogMeta = BLOOM_LEVELS[cog];

                        return (
                          <div 
                            key={q.id || qIdx}
                            className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2"
                          >
                            {/* Question Header & Cognitive Badge */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-slate-900 leading-relaxed">
                                <span className="font-mono text-indigo-600 mr-1.5">{toBn(qIdx + 1)}.</span>
                                {q.stimulus && (
                                  <div className="text-slate-600 italic bg-slate-50 p-2 rounded mb-1 text-[11px]">
                                    {q.stimulus}
                                  </div>
                                )}
                                <span>{q.question}</span>
                              </div>
                              <span 
                                className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${cogMeta.accentColor}15`, color: cogMeta.accentColor }}
                              >
                                {cogMeta.banglaName}
                              </span>
                            </div>

                            {/* 4 Options Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {q.options?.map((opt, oIdx) => {
                                const isCorrect = q.correctAnswer?.trim() === opt.trim() || q.correctAnswerIndex === oIdx;
                                const letters = ['(ক)', '(খ)', '(গ)', '(ঘ)'];
                                return (
                                  <div 
                                    key={oIdx}
                                    className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${
                                      isCorrect 
                                        ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' 
                                        : 'bg-white border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span className="font-bold text-slate-500">{letters[oIdx] || `(${oIdx + 1})`}</span>
                                    <span className="flex-1">{opt}</span>
                                    {isCorrect && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation & Solutions if available */}
                            {(q.explanation || (q.solutions && q.solutions.length > 0)) && (
                              <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-2.5 text-[11px] text-slate-700 space-y-1 mt-1">
                                {q.explanation && (
                                  <div>
                                    <span className="font-bold text-indigo-900">তাত্ত্বিক ব্যাখ্যা: </span>
                                    <span>{q.explanation}</span>
                                  </div>
                                )}
                                {q.solutions && q.solutions.length > 0 && (
                                  <div className="pt-1 border-t border-indigo-100/80 space-y-0.5">
                                    <span className="font-bold text-indigo-900">সমাধান পদ্ধতি:</span>
                                    {q.solutions.map((sol, sIdx) => (
                                      <div key={sIdx} className="pl-2 border-l-2 border-indigo-300">
                                        <span className="font-semibold text-slate-800">পদ্ধতি {toBn(sIdx + 1)}: </span>
                                        <span>{sol}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
