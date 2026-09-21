import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Layers, 
  Check, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  RotateCcw,
  Sliders,
  ChevronRight,
  Flame,
  Zap,
  Sprout
} from 'lucide-react';
import { NCTB_CLASS_SYLLABUS, getClassMeta } from '../../../data/nctbClassSyllabus';
import { BookQuestion } from '../../../data/initialBookQuestions';
import { MathFormulaRenderer } from '../../Common/MathFormulaRenderer';

export interface QuestionWizardConfig {
  selectedClass: string;
  selectedSubjects: string[];
  selectedTopics: string[];
  selectedDifficulties: ('সহজ' | 'মাঝারি' | 'কঠিন')[];
  questionCount: number;
}

interface QuestionGenerationWizardProps {
  allQuestions: BookQuestion[];
  onGeneratePaper: (selectedQuestions: BookQuestion[], config: QuestionWizardConfig) => void;
  onCancel?: () => void;
  initialClass?: string;
}

export const QuestionGenerationWizard: React.FC<QuestionGenerationWizardProps> = ({
  allQuestions,
  onGeneratePaper,
  onCancel,
  initialClass = '১০ম শ্রেণি'
}) => {
  // Wizard steps: 1: Class, 2: Subject, 3: Topic / Chapter, 4: Difficulty & Config
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Selections
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['গণিত']);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<('সহজ' | 'মাঝারি' | 'কঠিন')[]>([
    'সহজ', 
    'মাঝারি', 
    'কঠিন'
  ]);
  const [targetCount, setTargetCount] = useState<number>(10);

  // Available subjects for selected class
  const classMeta = useMemo(() => {
    return getClassMeta(selectedClass) || NCTB_CLASS_SYLLABUS.find(c => c.classLevel === '১০ম শ্রেণি')!;
  }, [selectedClass]);

  const availableSubjects = useMemo(() => {
    return classMeta.subjects || [];
  }, [classMeta]);

  // Available chapters/topics for selected subjects
  const availableTopics = useMemo(() => {
    const topics: { subject: string; chapter: string }[] = [];
    selectedSubjects.forEach(subjName => {
      const foundSubj = availableSubjects.find(s => s.name === subjName);
      if (foundSubj) {
        foundSubj.chapters.forEach(ch => {
          topics.push({ subject: subjName, chapter: ch });
        });
      }
    });
    return topics;
  }, [selectedSubjects, availableSubjects]);

  // Toggle multi-select for subjects
  const handleToggleSubject = (subjectName: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectName)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(s => s !== subjectName);
      } else {
        return [...prev, subjectName];
      }
    });
  };

  // Toggle multi-select for topics
  const handleToggleTopic = (topicName: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicName)) {
        return prev.filter(t => t !== topicName);
      } else {
        return [...prev, topicName];
      }
    });
  };

  const handleSelectAllTopics = () => {
    if (selectedTopics.length === availableTopics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(availableTopics.map(t => t.chapter));
    }
  };

  // Toggle difficulty
  const handleToggleDifficulty = (diff: 'সহজ' | 'মাঝারি' | 'কঠিন') => {
    setSelectedDifficulties(prev => {
      if (prev.includes(diff)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(d => d !== diff);
      } else {
        return [...prev, diff];
      }
    });
  };

  // Matching questions query from DB
  const matchingQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      // Class matching
      const matchesClass = 
        !selectedClass || 
        q.classLevel === selectedClass || 
        (selectedClass === '১০ম শ্রেণি' && (q.classLevel === '৯ম-১০ম শ্রেণি' || q.classLevel === '১০ম শ্রেণি')) ||
        (selectedClass === '৯ম শ্রেণি' && (q.classLevel === '৯ম-১০ম শ্রেণি' || q.classLevel === '৯ম শ্রেণি')) ||
        q.classLevel?.includes(selectedClass.replace(' শ্রেণি', ''));

      // Subject matching
      const matchesSubject = 
        selectedSubjects.length === 0 || 
        selectedSubjects.some(subj => {
          if (subj === 'গণিত' || subj === 'প্রাথমিক গণিত' || subj === 'উচ্চতর গণিত') {
            return q.subject === 'গণিত' || q.subject === 'প্রাথমিক গণিত' || q.subject === 'উচ্চতর গণিত' || q.subject === 'অংক';
          }
          if (subj === 'বাংলা' || subj === 'আমার বাংলা বই') {
            return q.subject === 'বাংলা' || q.subject === 'আমার বাংলা বই';
          }
          if (subj.includes('English')) {
            return q.subject === 'ইংরেজি' || q.subject === 'English';
          }
          return q.subject === subj || q.subject?.includes(subj);
        });

      // Topic matching
      const matchesTopic = 
        selectedTopics.length === 0 || 
        selectedTopics.some(t => q.topic?.includes(t) || t.includes(q.topic || ''));

      // Difficulty matching
      const qDiff = q.difficulty || 'মাঝারি';
      const matchesDifficulty = selectedDifficulties.includes(qDiff as any);

      return matchesClass && matchesSubject && matchesTopic && matchesDifficulty;
    });
  }, [allQuestions, selectedClass, selectedSubjects, selectedTopics, selectedDifficulties]);

  // Final Action: Generate the paper
  const handleComplete = () => {
    let finalQuestions = [...matchingQuestions];
    
    // If fewer than targetCount matching, fallback to subject pool so teacher gets a full set
    if (finalQuestions.length < targetCount) {
      const fallbackQuestions = allQuestions.filter(q => 
        !finalQuestions.some(fq => fq.id === q.id) &&
        selectedSubjects.some(subj => q.subject.includes(subj) || subj.includes(q.subject))
      );
      finalQuestions = [...finalQuestions, ...fallbackQuestions];
    }

    // Limit to target count
    finalQuestions = finalQuestions.slice(0, targetCount);

    onGeneratePaper(finalQuestions, {
      selectedClass,
      selectedSubjects,
      selectedTopics,
      selectedDifficulties,
      questionCount: targetCount
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden mb-8 transition-all">
      {/* Wizard Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              <span>স্মার্ট প্রশ্নপত্র জেনারেটর উইজার্ড</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ধাপে ধাপে সরকারি পাঠ্যবই থেকে প্রশ্ন নির্বাচন করুন
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              ১ম শ্রেণি থেকে ১০ম শ্রেণির এনসিটিবি কারিকুলাম অনুযায়ী শ্রেণি, বিষয়, অধ্যায় ও কাঠিন্যের স্তর নির্বাচন করে নিমেষেই অক্ষত ও ত্রুটিমুক্ত প্রশ্নপত্র তৈরি করুন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right shrink-0">
            <div className="text-[11px] text-slate-300 font-medium">উপলব্ধ মোট প্রশ্ন</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {matchingQuestions.length} <span className="text-xs text-white font-normal">টি প্রযোজ্য</span>
            </div>
          </div>
        </div>

        {/* 4 Step Progress Indicator */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-white/10">
          {[
            { step: 1, title: '১. শ্রেণি', icon: GraduationCap },
            { step: 2, title: '২. বিষয়', icon: BookOpen },
            { step: 3, title: '৩. অধ্যায়', icon: Layers },
            { step: 4, title: '৪. চূড়ান্ত', icon: Sliders },
          ].map(s => {
            const isActive = currentStep === s.step;
            const isDone = currentStep > s.step;
            const Icon = s.icon;
            return (
              <button
                key={s.step}
                onClick={() => setCurrentStep(s.step)}
                className={`py-2 px-1 sm:px-3 rounded-xl flex items-center justify-center sm:justify-start gap-2 text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                    : isDone
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="hidden sm:inline truncate">{s.title}</span>
                {isDone && <Check size={12} className="text-emerald-300 hidden sm:inline" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wizard Body Steps */}
      <div className="p-4 sm:p-7 min-h-[380px] flex flex-col justify-between">
        {/* STEP 1: CLASS SELECTION */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap className="text-primary" size={20} />
                  <span>কোন শ্রেণির জন্য প্রশ্ন তৈরি করবেন?</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  নিচের তালিকা থেকে কাঙ্ক্ষিত শ্রেণি নির্বাচন করুন (১ম থেকে ১০ম শ্রেণি):
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                নির্বাচিত: {selectedClass}
              </span>
            </div>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3.5">
              {NCTB_CLASS_SYLLABUS.map((item) => {
                const isSelected = selectedClass === item.classLevel;
                return (
                  <button
                    key={item.classLevel}
                    onClick={() => {
                      setSelectedClass(item.classLevel);
                      // Default first subject
                      if (item.subjects.length > 0) {
                        setSelectedSubjects([item.subjects[0].name]);
                      }
                      setSelectedTopics([]);
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 group ${
                      isSelected
                        ? 'border-slate-950 bg-slate-950 text-white shadow-lg ring-2 ring-slate-950/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                        isSelected ? 'bg-white/20 text-amber-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        Class {item.gradeNumber}
                      </span>
                      {isSelected && <CheckCircle2 size={16} className="text-amber-400" />}
                    </div>

                    <div>
                      <div className="font-extrabold text-sm sm:text-base leading-snug">
                        {item.classLevel}
                      </div>
                      <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {item.subjects.length}টি প্রধান বিষয়
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: SUBJECT SELECTION (MULTI-SELECT SUPPORTED) */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="text-primary" size={20} />
                  <span>{selectedClass} এর বিষয় নির্বাচন করুন</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  এক বা একাধিক বিষয় নির্বাচন করতে পারেন (যেমন: গণিত ও বিজ্ঞান একসাথে):
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  নির্বাচিত: {selectedSubjects.length}টি বিষয়
                </span>
              </div>
            </div>

            {/* Subjects Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableSubjects.map((subj) => {
                const isSelected = selectedSubjects.includes(subj.name);
                return (
                  <button
                    key={subj.name}
                    onClick={() => handleToggleSubject(subj.name)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-32 group ${
                      isSelected
                        ? 'border-slate-950 bg-slate-950 text-white shadow-md ring-2 ring-slate-950/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{subj.icon}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                      </div>
                    </div>

                    <div>
                      <div className="font-black text-sm sm:text-base leading-snug truncate">
                        {subj.name}
                      </div>
                      <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {subj.chapters.length}টি নির্ধারিত অধ্যায়
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: TOPIC / CHAPTER SELECTION (MULTI-SELECT SUPPORTED) */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Layers className="text-primary" size={20} />
                  <span>কোন কোন অধ্যায় বা টপিক থেকে প্রশ্ন করবেন?</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  নির্দিষ্ট অধ্যায় (যেমন বীজগণিত, ত্রিকোণমিতি, পরিমিতি) নির্বাচন করুন অথবা সবগুলো রাখুন:
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllTopics}
                  className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-all"
                >
                  {selectedTopics.length === availableTopics.length ? 'সবগুলো বাদ দিন' : 'সব অধ্যায় নির্বাচন'}
                </button>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  {selectedTopics.length === 0 ? 'সব অধ্যায় প্রযোজ্য' : `${selectedTopics.length}টি নির্বাচিত`}
                </span>
              </div>
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {availableTopics.map((topicItem, idx) => {
                const isSelected = selectedTopics.includes(topicItem.chapter);
                return (
                  <button
                    key={`${topicItem.subject}-${topicItem.chapter}-${idx}`}
                    onClick={() => handleToggleTopic(topicItem.chapter)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 truncate">
                        {topicItem.subject}
                      </div>
                      <div className="text-xs font-bold truncate leading-tight mt-0.5">
                        {topicItem.chapter}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-md shrink-0 border flex items-center justify-center ${
                      isSelected ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check size={10} className="stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: DIFFICULTY & QUESTION COUNT */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Sliders className="text-primary" size={20} />
                <span>কাঠিন্যের স্তর ও প্রশ্নের সংখ্যা নির্ধারণ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                সহজ, মাঝারি ও কঠিন প্রশ্নের মিশ্রণ এবং পূর্ণমান সেট করুন:
              </p>
            </div>

            {/* 3 Difficulty Toggles */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                কাঠিন্যের মাত্রা নির্বাচন (একাধিক নির্বাচনযোগ্য):
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'সহজ', label: 'সহজ প্রশ্ন', icon: Sprout, color: 'emerald' },
                  { id: 'মাঝারি', label: 'মাঝারি প্রশ্ন', icon: Zap, color: 'amber' },
                  { id: 'কঠিন', label: 'কঠিন প্রশ্ন', icon: Flame, color: 'rose' },
                ].map(item => {
                  const isSelected = selectedDifficulties.includes(item.id as any);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleToggleDifficulty(item.id as any)}
                      className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? item.color === 'emerald'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-black shadow-xs ring-1 ring-emerald-500/20'
                            : item.color === 'amber'
                            ? 'bg-amber-50 border-amber-500 text-amber-950 font-black shadow-xs ring-1 ring-amber-500/20'
                            : 'bg-rose-50 border-rose-500 text-rose-950 font-black shadow-xs ring-1 ring-rose-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Icon size={18} className={isSelected ? `text-${item.color}-600` : 'text-slate-400'} />
                      <span className="text-xs font-extrabold">{item.label}</span>
                      {isSelected && <span className="text-[10px] text-emerald-600 font-bold">✓ সক্রিয়</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Number of Questions Slider */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  মোট প্রশ্নের সংখ্যা (পূর্ণমান):
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 bg-white px-3 py-1 rounded-xl border border-slate-200">
                  {targetCount} টি প্রশ্ন
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="w-full accent-slate-950 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold px-1">
                <span>৫টি</span>
                <span>১০টি</span>
                <span>১৫টি</span>
                <span>২০টি</span>
                <span>২৫টি</span>
                <span>৩০টি</span>
              </div>
            </div>

            {/* Mathematical Equation & Layout Guarantee Notice */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
              <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>নিখুঁত অক্ষত লেআউট নিশ্চয়তা:</strong> বীজগণিত (a² - b²), সূচক, লগারিদম, ত্রিকোণমিতি (sin²θ + cos²θ = 1) এবং পরিমিতির সূত্রসমূহ মূল ডেটাবেজ থেকে কোনো চিহ্ন না ভেঙে অক্ষত অবস্থায় ২-কলাম বা ১-কলামে নির্ভুলভাবে প্রশ্নপত্রে বসবে।
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all"
              >
                ← পূর্ববর্তী ধাপ
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-semibold transition-all"
              >
                বাতিল করুন
              </button>
            )}
          </div>

          <div className="w-full sm:w-auto flex items-center justify-end">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>পরবর্তী ধাপ</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98"
              >
                <FileText size={16} className="shrink-0" />
                <span>প্রশ্নপত্র তৈরি করুন ({matchingQuestions.length > 0 ? `${Math.min(targetCount, matchingQuestions.length)}টি প্রশ্ন` : `${targetCount}টি`})</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionGenerationWizard;
