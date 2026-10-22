import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Zap, 
  Flame, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  Share2,
  Scan,
  Activity,
  Check
} from 'lucide-react';
import { ChallengePlayer, QuizQuestion, SubjectType } from './types';

interface PointScannerAndWinnerProps {
  player1: ChallengePlayer;
  player2: ChallengePlayer;
  questions: QuizQuestion[];
  subject: SubjectType;
  onRematch: () => void;
  onExit: () => void;
}

export const PointScannerAndWinner: React.FC<PointScannerAndWinnerProps> = ({
  player1,
  player2,
  questions,
  subject,
  onRematch,
  onExit
}) => {
  const [scanStep, setScanStep] = useState<number>(0);
  const [isScanningComplete, setIsScanningComplete] = useState<boolean>(false);
  const [showQuestionReview, setShowQuestionReview] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Scanning animation steps
  useEffect(() => {
    const timer1 = setTimeout(() => setScanStep(1), 700);  // Accuracy scan
    const timer2 = setTimeout(() => setScanStep(2), 1600); // Speed scan
    const timer3 = setTimeout(() => setScanStep(3), 2500); // Streak scan
    const timer4 = setTimeout(() => {
      setScanStep(4);
      setIsScanningComplete(true);
    }, 3400); // Reveal winner

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  const p1TotalScore = player1.score + player1.speedBonus + player1.streakBonus;
  const p2TotalScore = player2.score + player2.speedBonus + player2.streakBonus;

  const isPlayer1Winner = p1TotalScore > p2TotalScore;
  const isDraw = p1TotalScore === p2TotalScore;

  const handleShareResult = () => {
    navigator.clipboard.writeText(`আমি দা-পাঠশালা লাইভ ডুয়েলে ${player2.name}-কে ${p1TotalScore} পয়েন্টে চ্যালেঞ্জ করেছি!`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* PHASE 1: Real-Time Point Scanner (Active while scanning) */}
      {!isScanningComplete && (
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-indigo-500/30 text-center space-y-8 relative overflow-hidden">
          
          {/* Laser scanning beam animation */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent animate-pulse pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-400/30">
              <Scan size={14} className="animate-spin" />
              <span>এআই পয়েন্ট স্ক্যানার বিশ্লেষণ চলছে...</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ১০টি কুইজ উত্তরের লাইভ স্ক্যান ও স্কোর ক্যালকুলেশন
            </h2>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              সঠিক উত্তরের নির্ভুলতা, উত্তর দেওয়ার গতি এবং স্ট্রিক বোনাস বিশ্লেষণ করা হচ্ছে।
            </p>
          </div>

          {/* Scanner metrics checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left text-xs">
            
            {/* Metric 1: Accuracy */}
            <div className={`p-4 rounded-2xl border transition-all ${
              scanStep >= 1 ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">১. নির্ভুলতা স্ক্যান</span>
                {scanStep >= 1 ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Activity size={14} className="animate-pulse" />}
              </div>
              <div className="text-lg font-black text-white">
                {scanStep >= 1 ? `${player1.correctCount}/১০ সঠিক (+${player1.score})` : 'স্ক্যান হচ্ছে...'}
              </div>
            </div>

            {/* Metric 2: Speed */}
            <div className={`p-4 rounded-2xl border transition-all ${
              scanStep >= 2 ? 'bg-blue-950/60 border-blue-500/40 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">২. স্পিড বোনাস</span>
                {scanStep >= 2 ? <CheckCircle2 size={16} className="text-blue-400" /> : <Clock size={14} className="animate-pulse" />}
              </div>
              <div className="text-lg font-black text-white">
                {scanStep >= 2 ? `+${player1.speedBonus} পয়েন্ট` : 'গতি বিশ্লেষণ...'}
              </div>
            </div>

            {/* Metric 3: Streak */}
            <div className={`p-4 rounded-2xl border transition-all ${
              scanStep >= 3 ? 'bg-amber-950/60 border-amber-500/40 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">৩. স্ট্রিক বোনাস</span>
                {scanStep >= 3 ? <CheckCircle2 size={16} className="text-amber-400" /> : <Flame size={14} className="animate-pulse" />}
              </div>
              <div className="text-lg font-black text-white">
                {scanStep >= 3 ? `+${player1.streakBonus} পয়েন্ট` : 'স্ট্রিক হিসাব...'}
              </div>
            </div>

          </div>

          <div className="text-xs text-cyan-400 font-mono font-bold animate-pulse">
            ফাইনাল উইনার ঘোষণা প্রস্তুত হচ্ছে...
          </div>
        </div>
      )}

      {/* PHASE 2: Real-Time Winner Celebration Screen */}
      {isScanningComplete && (
        <div className="space-y-6">
          
          {/* Winner Banner */}
          <div className={`rounded-3xl p-6 sm:p-8 text-white relative shadow-2xl overflow-hidden text-center space-y-4 ${
            isPlayer1Winner 
              ? 'bg-gradient-to-b from-amber-600 via-amber-700 to-slate-950 border border-amber-400/40' 
              : isDraw
              ? 'bg-gradient-to-b from-indigo-700 via-slate-900 to-slate-950 border border-indigo-400/40'
              : 'bg-gradient-to-b from-purple-800 via-slate-900 to-slate-950 border border-purple-400/40'
          }`}>
            
            {/* Trophy & Badge */}
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-5xl shadow-2xl mx-auto">
                {isPlayer1Winner ? '🏆' : isDraw ? '🤝' : '🥈'}
              </div>
              {isPlayer1Winner && (
                <span className="absolute -top-2 -right-2 text-2xl animate-bounce">
                  ✨
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider text-amber-200">
                {subject} • ১০ লাইভ কুইজ ডুয়েল
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {isPlayer1Winner 
                  ? 'অভিনন্দন! আপনি বিজয়ী হয়েছেন!' 
                  : isDraw 
                  ? 'সমানে সমানে লড়াই! ডুয়েল ড্র হয়েছে!' 
                  : 'দারুণ লড়াই! সামান্য ব্যবধানে রানার-আপ!'}
              </h2>
              <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto">
                {isPlayer1Winner
                  ? `আপনি ${player2.name}-কে পরাজিত করে আজকের সর্বোচ্চ পয়েন্ট ও ট্রফি অধিকার করেছেন।`
                  : `${player2.name} সামান্য দ্রুত গতি ও নির্ভুলতার জন্য এগিয়ে গেছেন।`}
              </p>
            </div>

            {/* XP Awarded badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs font-black text-white">
              <Sparkles size={16} className="text-amber-300" />
              <span>আপনার শিক্ষার্থী প্রোফাইলে +{isPlayer1Winner ? 250 : 100} XP যুক্ত হয়েছে!</span>
            </div>
          </div>

          {/* Head-to-Head Score Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Player 1 Card (You) */}
            <div className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${
              isPlayer1Winner 
                ? 'bg-amber-50/50 border-amber-400 shadow-lg ring-4 ring-amber-400/10' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{player1.avatar}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">{player1.name} (আপনি)</h4>
                      {isPlayer1Winner && (
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                          WINNER
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{player1.institution}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>সঠিক উত্তর:</span>
                  <strong className="text-slate-900 font-bold">{player1.correctCount} / ১০টি</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>উত্তর পয়েন্ট:</span>
                  <strong className="text-slate-900 font-bold">+{player1.score}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>স্পিড বোনাস:</span>
                  <strong className="text-blue-600 font-bold">+{player1.speedBonus}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>স্ট্রিক বোনাস:</span>
                  <strong className="text-amber-600 font-bold">+{player1.streakBonus}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-black text-sm">
                  <span className="text-slate-900">মোট পয়েন্ট:</span>
                  <span className="text-xl font-black text-emerald-600">{p1TotalScore.toLocaleString('bn-BD')}</span>
                </div>
              </div>
            </div>

            {/* Player 2 Card (Opponent) */}
            <div className={`p-6 rounded-3xl border-2 transition-all space-y-4 ${
              !isPlayer1Winner && !isDraw 
                ? 'bg-purple-50/50 border-purple-400 shadow-lg ring-4 ring-purple-400/10' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{player2.avatar}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">{player2.name}</h4>
                      {!isPlayer1Winner && !isDraw && (
                        <span className="bg-purple-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                          WINNER
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{player2.institution}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/80 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>সঠিক উত্তর:</span>
                  <strong className="text-slate-900 font-bold">{player2.correctCount} / ১০টি</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>উত্তর পয়েন্ট:</span>
                  <strong className="text-slate-900 font-bold">+{player2.score}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>স্পিড বোনাস:</span>
                  <strong className="text-blue-600 font-bold">+{player2.speedBonus}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>স্ট্রিক বোনাস:</span>
                  <strong className="text-amber-600 font-bold">+{player2.streakBonus}</strong>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-black text-sm">
                  <span className="text-slate-900">মোট পয়েন্ট:</span>
                  <span className="text-xl font-black text-purple-600">{p2TotalScore.toLocaleString('bn-BD')}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onExit}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>কমিউনিটি ফোরামে ফিরুন</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleShareResult}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'কপি হয়েছে' : 'রেজাল্ট শেয়ার করুন'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQuestionReview(!showQuestionReview)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                {showQuestionReview ? 'প্রশ্নোত্তর আড়াল করুন' : '১০টি প্রশ্নের উত্তর ও ব্যাখ্যা দেখুন'}
              </button>

              <button
                type="button"
                onClick={onRematch}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>পুনরায় চ্যালেঞ্জ করুন (Rematch)</span>
              </button>
            </div>
          </div>

          {/* Question Review Drawer */}
          {showQuestionReview && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
              <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
                ১০টি প্রশ্নের পুঙ্খানুপুঙ্খ উত্তর ও এআই ব্যাখ্যা
              </h3>

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const p1Answer = player1.answers[idx];
                  const p2Answer = player2.answers[idx];
                  const isP1Correct = p1Answer === q.correctAnswer;
                  const isP2Correct = p2Answer === q.correctAnswer;

                  return (
                    <div key={q.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-black text-slate-900">
                          {idx + 1}. {q.question}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isP1Correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            আপনার: {isP1Correct ? '✓ সঠিক' : '✗ ভুল'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isP2Correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {player2.name}: {isP2Correct ? '✓ সঠিক' : '✗ ভুল'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        {q.options.map((opt, optIdx) => (
                          <div 
                            key={optIdx}
                            className={`p-2 rounded-xl border ${
                              optIdx === q.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                                : optIdx === p1Answer
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {optIdx === q.correctAnswer && <span className="ml-1 text-emerald-600 font-bold">✓ (সঠিক উত্তর)</span>}
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 text-slate-600 border-t border-slate-200/70 text-[11px] leading-relaxed">
                        <strong className="text-slate-800 font-bold">ব্যাখ্যা: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
