import React, { useState } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  Send, 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Swords, 
  User, 
  Share2, 
  Check, 
  X, 
  Tag, 
  Award, 
  Building2,
  ChevronDown,
  ChevronUp,
  Bookmark,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { CommunityQuestion, CommunityAnswer, SubjectType } from './types';

interface PeerForumFeedProps {
  questions: CommunityQuestion[];
  onAddQuestion: (q: CommunityQuestion) => void;
  onAddAnswer: (questionId: string, answer: CommunityAnswer) => void;
  onVoteQuestion: (questionId: string, type: 'up' | 'down') => void;
  onVoteAnswer: (questionId: string, answerId: string, type: 'up' | 'down') => void;
  onMarkAcceptedAnswer: (questionId: string, answerId: string) => void;
  onOpenChallengeModal: () => void;
}

const ALL_SUBJECTS: ('সকল' | SubjectType)[] = [
  'সকল',
  'পদার্থবিজ্ঞান',
  'রসায়ন',
  'উচ্চতর গণিত',
  'জীববিজ্ঞান',
  'আইসিটি',
  'বাংলা ও ইংরেজি',
  'সাধারণ জ্ঞান'
];

export const PeerForumFeed: React.FC<PeerForumFeedProps> = ({
  questions,
  onAddQuestion,
  onAddAnswer,
  onVoteQuestion,
  onVoteAnswer,
  onMarkAcceptedAnswer,
  onOpenChallengeModal
}) => {
  const [selectedSubject, setSelectedSubject] = useState<'সকল' | SubjectType>('সকল');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unsolved' | 'solved' | 'popular'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(questions[0]?.id || null);
  const [newAnswerText, setNewAnswerText] = useState<Record<string, string>>({});
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // New Question Form state
  const [newQuestionForm, setNewQuestionForm] = useState({
    title: '',
    content: '',
    subject: 'পদার্থবিজ্ঞান' as SubjectType,
    grade: 'এইচএসসি (বিজ্ঞান)',
    tags: '',
    coaching: 'মেধা একাডেমি'
  });

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.title.trim() || !newQuestionForm.content.trim()) return;

    const rawTags = newQuestionForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => t.startsWith('#') ? t : `#${t}`);

    const newQ: CommunityQuestion = {
      id: 'q-' + Date.now(),
      title: newQuestionForm.title.trim(),
      content: newQuestionForm.content.trim(),
      subject: newQuestionForm.subject,
      grade: newQuestionForm.grade,
      authorName: 'আপনি (শিক্ষার্থী)',
      authorAvatar: '🎓',
      authorCoaching: newQuestionForm.coaching,
      tags: rawTags.length > 0 ? rawTags : [`#${newQuestionForm.subject}`, '#প্রশ্ন'],
      upvotes: 1,
      downvotes: 0,
      userVote: 'up',
      answers: [],
      createdAt: 'এইমাত্র',
      views: 1,
      hasAcceptedAnswer: false
    };

    onAddQuestion(newQ);
    setShowAskModal(false);
    setNewQuestionForm({
      title: '',
      content: '',
      subject: 'পদার্থবিজ্ঞান',
      grade: 'এইচএসসি (বিজ্ঞান)',
      tags: '',
      coaching: 'মেধা একাডেমি'
    });
    setExpandedQuestionId(newQ.id);
  };

  const handlePostAnswer = (questionId: string) => {
    const text = newAnswerText[questionId];
    if (!text || !text.trim()) return;

    const newAns: CommunityAnswer = {
      id: 'ans-' + Date.now(),
      authorName: 'আপনি (শিক্ষার্থী)',
      authorAvatar: '👨‍🎓',
      authorCoaching: 'দা-পাঠশালা পিয়ার লার্নার',
      content: text.trim(),
      upvotes: 1,
      downvotes: 0,
      userVote: 'up',
      isAccepted: false,
      createdAt: 'এইমাত্র'
    };

    onAddAnswer(questionId, newAns);
    setNewAnswerText(prev => ({ ...prev, [questionId]: '' }));
  };

  const handleShareQuestion = (qId: string) => {
    navigator.clipboard.writeText(`https://dapathshala.com/community/question/${qId}`);
    setCopiedShareId(qId);
    setTimeout(() => setCopiedShareId(null), 2000);
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchSubject = selectedSubject === 'সকল' || q.subject === selectedSubject;
    const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchStatus = true;
    if (filterStatus === 'solved') matchStatus = q.hasAcceptedAnswer;
    if (filterStatus === 'unsolved') matchStatus = !q.hasAcceptedAnswer;
    if (filterStatus === 'popular') matchStatus = q.upvotes >= 10;

    return matchSubject && matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Challenge a Friend Spotlight */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 sm:p-7 text-white shadow-xl border border-indigo-700/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
              <Swords size={14} className="text-amber-400" />
              <span>রিয়েল-টাইম লাইভ কুইজ ডুয়েল</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              বন্ধুকে চ্যালেঞ্জ করো: <span className="text-amber-400">১০ লাইভ কুইজ পরীক্ষা</span>
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              যেকোনো বিষয়ে অন্য যেকোনো কোচিং সেন্টারের সহপাঠীকে লাইভ কুইজে হারিয়ে অর্জন করুন ডাবল পয়েন্ট ও উইনার ট্রফি!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenChallengeModal}
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Swords size={18} />
              <span>বন্ধু নির্বাচন করে চ্যালেঞ্জ দিন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Ask Question Button, Search & Filters */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="যেকোনো প্রশ্ন, সূত্র, বিষয় বা ট্যাগ দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Ask Question Button */}
          <button
            onClick={() => setShowAskModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all"
          >
            <Plus size={16} />
            <span>নতুন প্রশ্ন পোস্ট করুন</span>
          </button>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {ALL_SUBJECTS.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'সব প্রশ্ন' },
              { id: 'unsolved', label: 'সমাধান প্রয়োজন' },
              { id: 'solved', label: 'সমাধানকৃত' },
              { id: 'popular', label: 'জনপ্রিয় প্রশ্ন 🔥' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
            মোট {filteredQuestions.length}টি প্রশ্ন পাওয়া গেছে
          </span>
        </div>

      </div>

      {/* Questions Feed List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
            <HelpCircle size={44} className="text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">কোনো প্রশ্ন পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              আপনার নির্বাচিত ফিল্টারে কোনো প্রশ্ন নেই। আপনি চাইলে নতুন প্রশ্ন পোস্ট করে আলোচনা শুরু করতে পারেন!
            </p>
            <button
              onClick={() => setShowAskModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus size={14} />
              প্রশ্ন পোস্ট করুন
            </button>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md space-y-4"
              >
                {/* Question Header: Author, Meta & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shrink-0">
                      {q.authorAvatar || '🎓'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{q.authorName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {q.authorCoaching}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{q.grade}</span>
                        <span>•</span>
                        <span>{q.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                      {q.subject}
                    </span>
                    {q.hasAcceptedAnswer && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-700" />
                        সমাধানকৃত
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {q.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                    {q.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {q.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setSearchQuery(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Bar: Upvotes, Comments count, Share, Expand */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    
                    {/* Upvote & Downvote */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onVoteQuestion(q.id, 'up')}
                        className={`px-3 py-1.5 flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                          q.userVote === 'up' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <ThumbsUp size={13} />
                        <span>{q.upvotes}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onVoteQuestion(q.id, 'down')}
                        className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
                          q.userVote === 'down' ? 'bg-rose-600 text-white' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <ThumbsDown size={13} />
                      </button>
                    </div>

                    {/* Answer count */}
                    <button
                      type="button"
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-emerald-700 cursor-pointer"
                    >
                      <MessageSquare size={15} />
                      <span>{q.answers.length}টি উত্তর / কমেন্ট</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShareQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="লিংক কপি করুন"
                    >
                      {copiedShareId === q.id ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer px-2 py-1 rounded-lg hover:bg-emerald-50"
                    >
                      <span>{isExpanded ? 'উত্তর গুটিয়ে রাখুন' : 'উত্তর দেখুন ও কমেন্ট করুন'}</span>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Answers & Comments Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                    
                    <h4 className="font-bold text-xs uppercase tracking-wide text-slate-400">
                      সহপাঠী ও শিক্ষকদের সমাধান ({q.answers.length})
                    </h4>

                    {/* Answers List */}
                    <div className="space-y-3">
                      {q.answers.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          এখনও কোনো উত্তর দেওয়া হয়নি। প্রথম উত্তর দিয়ে বন্ধুদের সাহায্য করুন!
                        </p>
                      ) : (
                        q.answers.map((ans) => (
                          <div
                            key={ans.id}
                            className={`p-4 rounded-2xl border transition-all space-y-2 ${
                              ans.isAccepted
                                ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                                : 'bg-slate-50/80 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">{ans.authorAvatar || '👤'}</span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-slate-900">{ans.authorName}</span>
                                    {ans.isTeacher && (
                                      <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                                        ভেরিফায়েড শিক্ষক
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400">{ans.authorCoaching} • {ans.createdAt}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {ans.isAccepted ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                                    <Check size={11} strokeWidth={3} />
                                    গৃহীত সঠিক সমাধান
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onMarkAcceptedAnswer(q.id, ans.id)}
                                    className="text-[10px] font-bold text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 border border-slate-200 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                                  >
                                    সঠিক উত্তর মার্ক করুন
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line pl-1">
                              {ans.content}
                            </p>

                            {/* Upvotes for Answer */}
                            <div className="flex items-center justify-between text-[11px] pt-1 pl-1">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onVoteAnswer(q.id, ans.id, 'up')}
                                  className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded cursor-pointer ${
                                    ans.userVote === 'up' ? 'text-emerald-700 bg-emerald-100' : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                >
                                  <ThumbsUp size={12} />
                                  <span>{ans.upvotes} উপকারী</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add new Answer Input */}
                    <div className="pt-2 flex gap-2">
                      <textarea
                        rows={2}
                        value={newAnswerText[q.id] || ''}
                        onChange={(e) => setNewAnswerText({ ...newAnswerText, [q.id]: e.target.value })}
                        placeholder="আপনার ব্যাখ্যা, সমাধান বা সূত্র লিখুন..."
                        className="flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => handlePostAnswer(q.id)}
                        disabled={!newAnswerText[q.id]?.trim()}
                        className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newAnswerText[q.id]?.trim()
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Send size={14} />
                        <span className="hidden sm:inline">উত্তর দিন</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 my-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <HelpCircle size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-900">কমিউনিটিতে প্রশ্ন জিজ্ঞাসা করুন</h3>
              </div>
              <button 
                onClick={() => setShowAskModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  প্রশ্নের মূল শিরোনাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newQuestionForm.title}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, title: e.target.value })}
                  placeholder="যেমন: কার্নোর ইঞ্জিনের কর্মদক্ষতা কেন ১০০% হতে পারে না?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">বিষয়</label>
                  <select
                    value={newQuestionForm.subject}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, subject: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white outline-none"
                  >
                    {ALL_SUBJECTS.filter(s => s !== 'সকল').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">শ্রেণি / লেভেল</label>
                  <select
                    value={newQuestionForm.grade}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white outline-none"
                  >
                    <option value="এসএসসি (বিজ্ঞান)">এসএসসি (বিজ্ঞান)</option>
                    <option value="এইচএসসি (বিজ্ঞান)">এইচএসসি (বিজ্ঞান)</option>
                    <option value="মেডিকেল এডমিশন">মেডিকেল এডমিশন</option>
                    <option value="ইঞ্জিনিয়ারিং এডমিশন">ইঞ্জিনিয়ারিং এডমিশন</option>
                    <option value="৬ষ্ঠ - ৮ম শ্রেণি">৬ষ্ঠ - ৮ম শ্রেণি</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  বিস্তারিত ব্যাখ্যা বা সমস্যা <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={newQuestionForm.content}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, content: e.target.value })}
                  placeholder="আপনার কোথায় বুঝতে সমস্যা হচ্ছে, কোন সূত্রে ঝামেলা বিস্তারিত উল্লেখ করুন..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={newQuestionForm.tags}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, tags: e.target.value })}
                  placeholder="যেমন: তাপগতিবিদ্যা, এন্ট্রপি, কার্নো"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-200 cursor-pointer"
                >
                  প্রশ্ন পোস্ট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
