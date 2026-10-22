import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Swords, 
  Flame, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ChallengePlayer, PeerFriend, QuizQuestion, SubjectType } from './types';
import { BATTLE_QUIZ_BANKS } from './communityData';
import { PointScannerAndWinner } from './PointScannerAndWinner';

interface LiveChallengeEngineProps {
  subject: SubjectType;
  opponent: PeerFriend;
  onExit: () => void;
}

export const LiveChallengeEngine: React.FC<LiveChallengeEngineProps> = ({
  subject,
  opponent,
  onExit
}) => {
  const questions: QuizQuestion[] = BATTLE_QUIZ_BANKS[subject] || BATTLE_QUIZ_BANKS['পদার্থবিজ্ঞান'];
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);
  const [isBattleFinished, setIsBattleFinished] = useState<boolean>(false);

  // Player 1 state (User)
  const [player1, setPlayer1] = useState<ChallengePlayer>({
    id: 'p1',
    name: 'আপনি (ইউজার)',
    institution: 'মেধা একাডেমি ও কোচিং হোম',
    avatar: '🎓',
    score: 0,
    correctCount: 0,
    speedBonus: 0,
    streakBonus: 0,
    answers: []
  });
  const [p1Streak, setP1Streak] = useState<number>(0);

  // Player 2 state (Opponent)
  const [player2, setPlayer2] = useState<ChallengePlayer>({
    id: opponent.id,
    name: opponent.name,
    institution: opponent.institution,
    avatar: opponent.avatar,
    score: 0,
    correctCount: 0,
    speedBonus: 0,
    streakBonus: 0,
    answers: []
  });
  const [p2Streak, setP2Streak] = useState<number>(0);
  const [opponentAnsweredThisQ, setOpponentAnsweredThisQ] = useState<boolean>(false);

  const currentQ = questions[currentIdx];
  const timerRef = useRef<any>(null);

  // Countdown timer per question
  useEffect(() => {
    if (isBattleFinished) return;

    setTimeLeft(15);
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setOpponentAnsweredThisQ(false);

    // Simulate opponent answering with realistic human speed (between 3s and 8s)
    const opponentLatency = Math.floor(3000 + Math.random() * 5000);
    const opponentTimeout = setTimeout(() => {
      if (!opponentAnsweredThisQ) {
        // Probability of opponent answering correctly is ~75%
        const isOpponentCorrect = Math.random() < 0.75;
        const oppAnswer = isOpponentCorrect 
          ? currentQ.correctAnswer 
          : (currentQ.correctAnswer + 1) % 4;

        setPlayer2(prev => {
          const nextScore = isOpponentCorrect ? prev.score + 100 : prev.score;
          const nextCorrect = isOpponentCorrect ? prev.correctCount + 1 : prev.correctCount;
          const speedAdd = isOpponentCorrect ? Math.floor(10 + Math.random() * 15) : 0;
          const streakAdd = isOpponentCorrect && p2Streak >= 2 ? 30 : 0;

          return {
            ...prev,
            score: nextScore,
            correctCount: nextCorrect,
            speedBonus: prev.speedBonus + speedAdd,
            streakBonus: prev.streakBonus + streakAdd,
            answers: [...prev.answers, oppAnswer]
          };
        });

        if (isOpponentCorrect) {
          setP2Streak(s => s + 1);
        } else {
          setP2Streak(0);
        }

        setOpponentAnsweredThisQ(true);
      }
    }, opponentLatency);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(opponentTimeout);
    };
  }, [currentIdx, isBattleFinished]);

  const handleTimeExpire = () => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);

    // Record timeout (null answer)
    setPlayer1(prev => ({
      ...prev,
      answers: [...prev.answers, null]
    }));
    setP1Streak(0);

    // Advance after delay
    setTimeout(() => {
      goToNextQuestion();
    }, 1200);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setSelectedOption(idx);
    clearInterval(timerRef.current);

    const isCorrect = idx === currentQ.correctAnswer;
    const speedPoints = isCorrect ? Math.max(5, timeLeft * 2) : 0;
    const nextStreak = isCorrect ? p1Streak + 1 : 0;
    const streakPoints = isCorrect && nextStreak >= 3 ? 50 : 0;

    setP1Streak(nextStreak);
    setPlayer1(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 100 : prev.score,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      speedBonus: prev.speedBonus + speedPoints,
      streakBonus: prev.streakBonus + streakPoints,
      answers: [...prev.answers, idx]
    }));

    // Auto-advance after 1.4s
    setTimeout(() => {
      goToNextQuestion();
    }, 1400);
  };

  const goToNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsBattleFinished(true);
    }
  };

  const handleRematch = () => {
    setCurrentIdx(0);
    setTimeLeft(15);
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setIsBattleFinished(false);
    setP1Streak(0);
    setP2Streak(0);
    setPlayer1({
      id: 'p1',
      name: 'আপনি (ইউজার)',
      institution: 'মেধা একাডেমি ও কোচিং হোম',
      avatar: '🎓',
      score: 0,
      correctCount: 0,
      speedBonus: 0,
      streakBonus: 0,
      answers: []
    });
    setPlayer2({
      id: opponent.id,
      name: opponent.name,
      institution: opponent.institution,
      avatar: opponent.avatar,
      score: 0,
      correctCount: 0,
      speedBonus: 0,
      streakBonus: 0,
      answers: []
    });
  };

  if (isBattleFinished) {
    return (
      <PointScannerAndWinner
        player1={player1}
        player2={player2}
        questions={questions}
        subject={subject}
        onRematch={handleRematch}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Live Head-to-Head HUD Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between gap-4">
          
          {/* Player 1 (You) */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-3xl sm:text-4xl">{player1.avatar}</span>
              {p1Streak >= 3 && (
                <span className="absolute -top-2 -right-1 flex items-center gap-0.5 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
                  <Flame size={10} />
                  {p1Streak}x
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-white">{player1.name}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">আপনি</span>
              </div>
              <div className="text-lg sm:text-2xl font-black text-emerald-400">
                {(player1.score + player1.speedBonus + player1.streakBonus).toLocaleString('bn-BD')} <span className="text-xs text-slate-400 font-normal">পয়েন্ট</span>
              </div>
            </div>
          </div>

          {/* Versus & Timer */}
          <div className="flex flex-col items-center">
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all shadow-lg ${
              timeLeft <= 4 
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse' 
                : 'bg-white/10 border-white/20 text-amber-400'
            }`}>
              <Clock size={16} />
              <span className="font-mono font-black text-base leading-none mt-0.5">{timeLeft}s</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              প্রশ্ন {currentIdx + 1} / ১০
            </span>
          </div>

          {/* Player 2 (Opponent) */}
          <div className="flex items-center gap-3 text-right flex-row-reverse">
            <div className="relative">
              <span className="text-3xl sm:text-4xl">{player2.avatar}</span>
              {p2Streak >= 3 && (
                <span className="absolute -top-2 -left-1 flex items-center gap-0.5 bg-purple-500 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
                  <Flame size={10} />
                  {p2Streak}x
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="font-bold text-xs sm:text-sm text-white">{player2.name}</span>
              </div>
              <div className="text-lg sm:text-2xl font-black text-purple-400">
                {(player2.score + player2.speedBonus + player2.streakBonus).toLocaleString('bn-BD')} <span className="text-xs text-slate-400 font-normal">পয়েন্ট</span>
              </div>
            </div>
          </div>

        </div>

        {/* 10 Question Progress Dots */}
        <div className="grid grid-cols-10 gap-1.5 mt-5 pt-4 border-t border-slate-800">
          {questions.map((_, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const p1Ans = player1.answers[idx];
            const isP1Correct = p1Ans === questions[idx]?.correctAnswer;

            return (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-amber-400 shadow-sm shadow-amber-400 animate-pulse'
                    : isDone
                    ? isP1Correct
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                    : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Opponent Status Toast */}
      {opponentAnsweredThisQ && (
        <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-xs text-purple-900 animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center gap-1.5 font-bold">
            <Sparkles size={14} className="text-purple-600" />
            {player2.name} উত্তর লক করেছেন!
          </span>
          <span className="text-[11px] text-purple-600">আপনার উত্তরের অপেক্ষায়...</span>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
        
        <div className="flex items-center justify-between text-xs">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold">
            বিষয়: {subject}
          </span>
          <span className="font-bold text-slate-400">
            ১০টির মধ্যে {currentIdx + 1} নম্বর প্রশ্ন
          </span>
        </div>

        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
          {currentQ.question}
        </h3>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const isCorrect = optIdx === currentQ.correctAnswer;
            
            let btnStyle = 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-800';
            if (isAnswerLocked) {
              if (isSelected && isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-400';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold ring-2 ring-rose-400';
              } else if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold';
              } else {
                btnStyle = 'border-slate-200 opacity-50 text-slate-400';
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                disabled={isAnswerLocked}
                onClick={() => handleSelectOption(optIdx)}
                className={`p-4 rounded-2xl border-2 text-left font-sans text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between gap-3 ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswerLocked && isCorrect && (
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                )}
                {isAnswerLocked && isSelected && !isCorrect && (
                  <XCircle size={18} className="text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Answer explanation preview if locked */}
        {isAnswerLocked && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 animate-in fade-in duration-200">
            <span className="font-bold text-slate-800">
              {selectedOption === currentQ.correctAnswer ? '✓ চমৎকার! আপনার উত্তর সঠিক হয়েছে।' : '✗ সঠিক উত্তরটি দেখে নিন:'}
            </span>
            <p className="text-slate-600 leading-relaxed font-sans">
              {currentQ.explanation}
            </p>
          </div>
        )}

      </div>

      {/* Exit match prompt */}
      <div className="text-center">
        <button
          type="button"
          onClick={onExit}
          className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer transition-colors"
        >
          কুইজ যুদ্ধ ত্যাগ করুন
        </button>
      </div>

    </div>
  );
};
