import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Calendar, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  X, 
  GraduationCap, 
  Filter, 
  Landmark, 
  Sparkles,
  School,
  Lock,
  Eye,
  RotateCcw
} from 'lucide-react';
import { InstitutionPaper, getStoredInstitutionPapers, syncInstitutionPapersWithServer } from '../../lib/institutionPapers';

interface InstitutionPaperExplorerProps {
  onSelectPaper: (paper: InstitutionPaper) => void;
  onBack: () => void;
  onOpenAdminUpload?: () => void;
}

export const InstitutionPaperExplorer: React.FC<InstitutionPaperExplorerProps> = ({
  onSelectPaper,
  onBack,
  onOpenAdminUpload
}) => {
  const [papers, setPapers] = useState<InstitutionPaper[]>(() => getStoredInstitutionPapers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activePreviewPaper, setActivePreviewPaper] = useState<InstitutionPaper | null>(null);

  useEffect(() => {
    setPapers(getStoredInstitutionPapers());
    syncInstitutionPapersWithServer().then(latest => {
      if (latest && latest.length > 0) setPapers(latest);
    });

    const handleUpdate = () => {
      setPapers(getStoredInstitutionPapers());
    };
    window.addEventListener('dapathshala_institution_papers_updated', handleUpdate);
    return () => {
      window.removeEventListener('dapathshala_institution_papers_updated', handleUpdate);
    };
  }, []);

  // Filter options extraction
  const filterOptions = useMemo(() => {
    const years = Array.from(new Set(papers.map(p => p.year))).sort().reverse();
    const classes = Array.from(new Set(papers.map(p => p.studentClass)));
    const subjects = Array.from(new Set(papers.map(p => p.subject)));
    const boardCount = papers.filter(p => p.institutionType === 'board').length;
    const schoolCount = papers.filter(p => p.institutionType === 'school').length;
    const collegeCount = papers.filter(p => p.institutionType === 'college').length;
    const cadetCount = papers.filter(p => p.institutionType === 'cadet').length;
    return { years, classes, subjects, boardCount, schoolCount, collegeCount, cadetCount };
  }, [papers]);

  // Filtered papers
  const filteredPapers = useMemo(() => {
    return papers.filter(p => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.institutionName.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.studentClass.toLowerCase().includes(q) ||
        p.examType.toLowerCase().includes(q) ||
        p.year.includes(q) ||
        (p.districtOrBoard && p.districtOrBoard.toLowerCase().includes(q));

      const matchesType = selectedType === 'all' || p.institutionType === selectedType;
      const matchesYear = selectedYear === 'all' || p.year === selectedYear;
      const matchesClass = selectedClass === 'all' || p.studentClass === selectedClass;
      const matchesSubject = selectedSubject === 'all' || p.subject === selectedSubject;

      return matchesSearch && matchesType && matchesYear && matchesClass && matchesSubject;
    });
  }, [papers, searchQuery, selectedType, selectedYear, selectedClass, selectedSubject]);

  const hasActiveFilters = selectedType !== 'all' || selectedYear !== 'all' || selectedClass !== 'all' || selectedSubject !== 'all' || searchQuery;

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedYear('all');
    setSelectedClass('all');
    setSelectedSubject('all');
    setSearchQuery('');
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in pb-10">
      
      {/* ======================================================== */}
      {/* 1. SLIM & COMPACT TOP NAVIGATION & FILTERS BAR           */}
      {/* (উচ্চতা খুব কম রেখে মূল বোর্ড/স্কুল কার্ডের জন্য জায়গা বৃদ্ধি) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
        
        {/* Row A: Header with Back button, Title & Admin Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>ফিরে যান</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-slate-900">
                    বিভিন্ন প্রতিষ্ঠান ও সালের প্রশ্নপত্র
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-black">
                    মোট {filteredPapers.length}টি সংরক্ষিত
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  ঢাকা ও চট্টগ্রাম শিক্ষা বোর্ড এবং মতিঝিল আইডিয়াল, ভিকারুননিসা সহ শীর্ষ প্রতিষ্ঠানের প্রশ্নপত্র ১-ক্লিকেই ব্যবহার করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Quick Category Buttons & Discreet Admin Portal */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              সবগুলো ({papers.length})
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('board')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedType === 'board'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/70'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>শিক্ষা বোর্ড ({filterOptions.boardCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('school')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedType === 'school'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/70'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>শীর্ষ স্কুল ({filterOptions.schoolCount})</span>
            </button>

            {onOpenAdminUpload && (
              <button
                type="button"
                onClick={onOpenAdminUpload}
                title="অ্যাডমিন প্যানেল: শতশত প্রশ্নপত্র এক ক্লিকে আপলোড"
                className="px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50/50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span className="hidden md:inline">এডমিন আপলোড</span>
              </button>
            )}
          </div>
        </div>

        {/* Row B: Slim Integrated Search & Dropdowns in ONE single neat row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] sm:min-w-[260px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="প্রতিষ্ঠানের নাম, বোর্ড, সাল বা বিষয় খুঁজুন..."
              className="w-full pl-9 pr-7 py-1.5 sm:py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:border-purple-500 cursor-pointer shadow-2xs"
          >
            <option value="all">সব শ্রেণি</option>
            {filterOptions.classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:border-purple-500 cursor-pointer shadow-2xs"
          >
            <option value="all">সব বিষয়</option>
            {filterOptions.subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs font-bold focus:outline-none focus:border-purple-500 cursor-pointer shadow-2xs"
          >
            <option value="all">সব সাল</option>
            {filterOptions.years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-purple-700 hover:text-purple-900 hover:bg-purple-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          )}
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. MAIN BOARDS & INSTITUTIONS CARDS GRID                */}
      {/* (কোনো পপাপ নয়, স্ক্রিন জুড়ে উন্মুক্ত ও সুবিন্যস্ত কার্ড)       */}
      {/* ======================================================== */}
      {filteredPapers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <School className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">কোনো প্রশ্নপত্র পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            অন্য কোনো সাল, বিষয় বা শব্দ লিখে খুঁজুন অথবা ফিল্টার রিসেট করুন।
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              সব প্রশ্নপত্র পুনরায় দেখুন
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredPapers.map(paper => {
            const count = paper.questionCount || (paper.questions ? paper.questions.length : 0);
            const isBoard = paper.institutionType === 'board';
            const isSchool = paper.institutionType === 'school';
            const isCollege = paper.institutionType === 'college';

            return (
              <div
                key={paper.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-purple-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group space-y-4 relative"
              >
                {/* Card Top: Badges & Institution Info */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isBoard ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-900 font-black text-[11px] border border-purple-200">
                          <Landmark className="w-3 h-3 text-purple-700" />
                          <span>শিক্ষা বোর্ড</span>
                        </span>
                      ) : isSchool ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black text-[11px] border border-emerald-200">
                          <School className="w-3 h-3 text-emerald-700" />
                          <span>শীর্ষ স্কুল</span>
                        </span>
                      ) : isCollege ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 font-black text-[11px] border border-blue-200">
                          <GraduationCap className="w-3 h-3 text-blue-700" />
                          <span>কলেজ</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-black text-[11px] border border-amber-200">
                          <Building2 className="w-3 h-3 text-amber-700" />
                          <span>ক্যাডেট</span>
                        </span>
                      )}
                      
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-[11px]">
                        {paper.year}
                      </span>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                      {paper.studentClass}
                    </span>
                  </div>

                  {/* Institution Name */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-purple-800 transition-colors leading-snug">
                      {paper.institutionName}
                    </h3>
                    <p className="text-xs font-bold text-purple-700 mt-0.5">
                      {paper.examType}
                    </p>
                  </div>

                  {/* Subject & Meta Specifications Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 text-slate-900">
                        <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                        <span>{paper.subject}</span>
                      </span>
                      <span className="text-purple-700 font-extrabold">
                        {count}টি বহুনির্বাচনি (MCQ)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/60 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>সময়: {paper.durationMinutes} মিনিট</span>
                      </span>
                      <span>পূর্ণমান: {paper.totalMarks || count}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Preview & Direct Exam Creation */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePreviewPaper(paper)}
                    className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="প্রশ্নগুলো আগে দেখে নিন"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>প্রশ্ন দেখুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPaper(paper)}
                    className="flex-1 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs shadow-purple-200 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>এই প্রশ্নপত্র নিয়ে তৈরি করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. QUESTION PAPER QUICK PREVIEW MODAL                    */}
      {/* (প্রশ্নগুলো দেখার সুবিধার্থে একটি ক্লিন প্রিভিউ প্যানেল)       */}
      {/* ======================================================== */}
      {activePreviewPaper && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 mb-1 inline-block">
                  প্রশ্নপত্র প্রিভিউ
                </span>
                <h4 className="font-bold text-base sm:text-lg">{activePreviewPaper.institutionName}</h4>
                <p className="text-xs text-purple-200/90 font-medium mt-0.5">
                  {activePreviewPaper.studentClass} • {activePreviewPaper.subject} • {activePreviewPaper.examType} ({activePreviewPaper.year})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewPaper(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm bg-slate-50/50">
              {activePreviewPaper.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="font-bold text-slate-900 text-xs sm:text-sm pt-0.5">
                      {q.question}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 pl-8">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = opt === q.correctAnswer;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs ${
                            isCorrect 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="mr-1.5 text-slate-400 font-bold">
                            {['(ক)', '(খ)', '(গ)', '(ঘ)'][oIdx] || `(${oIdx + 1})`}
                          </span>
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="ml-1.5 text-emerald-600 font-black text-[11px]">✓ (সঠিক উত্তর)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-2 pl-8 pt-1.5 text-[11px] text-slate-500 font-medium border-t border-slate-100 flex items-start gap-1">
                      <span>💡</span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3.5 sm:px-6 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-600">
                মোট প্রশ্ন: {activePreviewPaper.questions.length}টি • পূর্ণমান: {activePreviewPaper.totalMarks || activePreviewPaper.questions.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  const target = activePreviewPaper;
                  setActivePreviewPaper(null);
                  onSelectPaper(target);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm shadow-purple-200 transition-all cursor-pointer"
              >
                <span>এই প্রশ্নপত্র নিয়ে পরীক্ষা তৈরি করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
