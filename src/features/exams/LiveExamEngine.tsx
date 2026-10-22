import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  RotateCcw,
  Home,
  Save
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Exam, Question, ExamResult } from '../../types';
import { QUESTIONS } from '../../constants';

interface LiveExamEngineProps {
  exam: Exam;
  onClose: () => void;
}

export const LiveExamEngine: React.FC<LiveExamEngineProps> = ({ exam, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [startTime] = useState(Date.now());

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`exam_progress_${exam.id}`);
    if (savedProgress) {
      const { answers: savedAnswers, timeLeft: savedTime } = JSON.parse(savedProgress);
      setAnswers(savedAnswers);
      // Only restore time if it's less than current time left
      if (savedTime < timeLeft) setTimeLeft(savedTime);
    }
  }, [exam.id]);

  // Save progress to localStorage
  useEffect(() => {
    if (!isFinished) {
      localStorage.setItem(`exam_progress_${exam.id}`, JSON.stringify({
        answers,
        timeLeft
      }));
    }
  }, [answers, timeLeft, exam.id, isFinished]);

  const calculateResult = useCallback(() => {
    const totalQuestions = QUESTIONS.length;
    let correctAnswers = 0;
    
    QUESTIONS.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    const examResult: ExamResult = {
      examId: exam.id,
      score: (correctAnswers / totalQuestions) * 100,
      totalQuestions,
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      timeSpent,
      answers
    };

    setResult(examResult);
    setIsFinished(true);
    localStorage.removeItem(`exam_progress_${exam.id}`);
  }, [answers, exam.id, startTime]);

  // Timer logic
  useEffect(() => {
    if (isFinished) return;

    if (timeLeft <= 0) {
      calculateResult();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isFinished, calculateResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [QUESTIONS[currentQuestionIndex].id]: optionIndex
    }));
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = (Object.keys(answers).length / QUESTIONS.length) * 100;

  if (isFinished && result) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-6">
              <Trophy size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">পরীক্ষা সম্পন্ন হয়েছে!</h1>
            <p className="text-slate-500 text-lg">আপনার ফলাফল নিচে দেওয়া হলো</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6 border-none shadow-lg">
              <p className="text-sm font-bold text-slate-500 uppercase mb-1">আপনার স্কোর</p>
              <p className="text-4xl font-black text-emerald-600">{result.score.toFixed(0)}%</p>
            </Card>
            <Card className="text-center p-6 border-none shadow-lg">
              <p className="text-sm font-bold text-slate-500 uppercase mb-1">সঠিক উত্তর</p>
              <p className="text-4xl font-black text-blue-600">{result.correctAnswers}/{result.totalQuestions}</p>
            </Card>
            <Card className="text-center p-6 border-none shadow-lg">
              <p className="text-sm font-bold text-slate-500 uppercase mb-1">সময় লেগেছে</p>
              <p className="text-4xl font-black text-purple-600">{Math.floor(result.timeSpent / 60)}মিনিট</p>
            </Card>
          </div>

          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-slate-900">বিস্তারিত পর্যালোচনা</h2>
            {QUESTIONS.map((q, idx) => {
              const userAnswer = result.answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <Card key={q.id} className={`border-2 ${isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                      {idx + 1}
                    </div>
                    <div className="space-y-4 flex-1">
                      <p className="font-bold text-slate-900 text-lg">{q.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, optIdx) => {
                          const isUserChoice = userAnswer === optIdx;
                          const isCorrectChoice = q.correctAnswer === optIdx;
                          return (
                            <div 
                              key={optIdx}
                              className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-between ${
                                isCorrectChoice ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 
                                isUserChoice ? 'border-red-500 bg-red-50 text-red-900' : 
                                'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              {opt}
                              {isCorrectChoice && <CheckCircle2 size={16} className="text-emerald-600" />}
                              {isUserChoice && !isCorrectChoice && <AlertCircle size={16} className="text-red-600" />}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="p-4 bg-white/50 rounded-xl border border-slate-100 text-sm text-slate-600">
                          <span className="font-bold text-slate-900">ব্যাখ্যা:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" className="flex-1 rounded-2xl gap-2 py-6" onClick={() => window.location.reload()}>
              <RotateCcw size={20} />
              আবার পরীক্ষা দিন
            </Button>
            <Button variant="outline" size="lg" className="flex-1 rounded-2xl gap-2 py-6" onClick={onClose}>
              <Home size={20} />
              ড্যাশবোর্ডে ফিরে যান
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Exam Header */}
      <header className="bg-slate-900 text-white px-4 py-4 sm:px-8 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="font-black text-lg sm:text-xl line-clamp-1">{exam.title}</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{exam.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${timeLeft < 300 ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'}`}>
            <Clock size={20} />
            <span className="font-black text-xl tabular-nums">{formatTime(timeLeft)}</span>
          </div>
          <Button variant="primary" className="hidden sm:flex rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none px-6" onClick={calculateResult}>
            সাবমিট করুন
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-emerald-500"
        />
      </div>

      {/* Main Exam Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest">
                  প্রশ্ন {currentQuestionIndex + 1} / {QUESTIONS.length}
                </span>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Save size={14} />
                  অটো-সেভড
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {currentQuestion.text}
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(idx)}
                      className={`group relative flex items-center p-6 rounded-2xl border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' 
                          : 'border-white bg-white hover:border-slate-200 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black mr-4 transition-colors ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-lg font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-700'}`}>
                        {option}
                      </span>
                      {isSelected && (
                        <div className="ml-auto text-emerald-600">
                          <CheckCircle2 size={24} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Exam Footer Navigation */}
      <footer className="bg-white border-t border-slate-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-2xl gap-2 px-8"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          >
            <ChevronLeft size={20} />
            আগের প্রশ্ন
          </Button>

          <div className="hidden sm:flex gap-2">
            {QUESTIONS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  currentQuestionIndex === idx ? 'bg-slate-900 text-white scale-110 shadow-lg' : 
                  answers[QUESTIONS[idx].id] !== undefined ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === QUESTIONS.length - 1 ? (
            <Button 
              variant="primary" 
              size="lg" 
              className="rounded-2xl gap-2 px-8 bg-emerald-600 hover:bg-emerald-700"
              onClick={calculateResult}
            >
              পরীক্ষা শেষ করুন
              <CheckCircle2 size={20} />
            </Button>
          ) : (
            <Button 
              variant="primary" 
              size="lg" 
              className="rounded-2xl gap-2 px-8"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              পরবর্তী প্রশ্ন
              <ChevronRight size={20} />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};
