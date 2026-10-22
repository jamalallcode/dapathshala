import { Question } from '../types';

export interface SharedLiveExam {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  duration: number; // minutes
  totalMarks: number;
  childName?: string;
  parentName?: string;
  createdAt: number;
  questions: Question[];
}

const STORAGE_KEY = 'dapathshala_live_exams';

export const saveSharedLiveExam = (exam: SharedLiveExam): void => {
  try {
    const existing = getAllSharedLiveExams();
    existing[exam.id] = exam;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Error saving shared live exam:', err);
  }
};

export const getSharedLiveExam = (id: string): SharedLiveExam | null => {
  try {
    // 1. Check dapathshala_live_exams storage
    const all = getAllSharedLiveExams();
    if (id && all[id]) {
      return all[id];
    }

    // 2. Check if compact exam payload is encoded in URL (cross-device/WhatsApp support)
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const encoded = urlParams.get('payload') || urlParams.get('examData');
        if (encoded) {
          const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
          const parsed = JSON.parse(jsonStr);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            saveSharedLiveExam(parsed);
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Could not parse URL payload:', e);
      }
    }

    // 3. Check dapathshala_parent_assigned_tests in localStorage
    if (typeof window !== 'undefined') {
      const assignedRaw = localStorage.getItem('dapathshala_parent_assigned_tests');
      if (assignedRaw) {
        const assignedList = JSON.parse(assignedRaw);
        const match = assignedList.find((t: any) => t.id === id || t.examId === id);
        if (match) {
          const qList = match.questionsList || match.questions || [];
          const formattedQuestions: Question[] = Array.isArray(qList) ? qList.map((q: any, idx: number) => {
            let correctIdx = 0;
            if (typeof q.correctAnswer === 'number') {
              correctIdx = q.correctAnswer;
            } else if (typeof q.correctAnswer === 'string' && q.options) {
              const fIdx = q.options.findIndex((opt: string) => opt.trim() === q.correctAnswer.trim());
              correctIdx = fIdx >= 0 ? fIdx : 0;
            }
            return {
              id: q.id || `q_${idx + 1}`,
              text: q.text || q.question || 'প্রশ্ন',
              options: q.options || [],
              correctAnswer: correctIdx,
              explanation: q.explanation
            };
          }) : [];

          const convertedExam: SharedLiveExam = {
            id: match.id,
            title: match.title || `${match.subject} কাস্টম মূল্যায়ন পরীক্ষা`,
            subject: match.subject || 'সাধারণ',
            chapter: match.chapter || '',
            duration: match.duration || 30,
            totalMarks: match.totalMarks || formattedQuestions.length,
            childName: match.childName || 'শিক্ষার্থী',
            parentName: 'অভিভাবক',
            createdAt: Date.now(),
            questions: formattedQuestions.length > 0 ? formattedQuestions : DEFAULT_DEMO_EXAM.questions
          };
          saveSharedLiveExam(convertedExam);
          return convertedExam;
        }
      }
    }
  } catch (err) {
    console.error('Error retrieving shared live exam:', err);
  }
  return null;
};

export const getAllSharedLiveExams = (): Record<string, SharedLiveExam> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse dapathshala_live_exams:', err);
  }
  return {};
};

// Fallback seed exam if link id is opened directly or demo
export const DEFAULT_DEMO_EXAM: SharedLiveExam = {
  id: 'demo_exam_01',
  title: 'গণিত ও বিজ্ঞান বিশেষ মূল্যায়ন পরীক্ষা',
  subject: 'গণিত',
  chapter: 'বীজগণিতীয় সূত্রাবলী ও প্রয়োগ',
  duration: 25,
  totalMarks: 5,
  childName: 'শিক্ষার্থী',
  parentName: 'অভিভাবক',
  createdAt: Date.now(),
  questions: [
    {
      id: 'q1',
      text: '(a + b)² এর সঠিক সম্প্রসারিত রূপ কোনটি?',
      options: ['a² + 2ab + b²', 'a² - 2ab + b²', 'a² + b²', 'a² + ab + b²'],
      correctAnswer: 0,
      explanation: '(a + b)² = (a + b)(a + b) = a² + 2ab + b²'
    },
    {
      id: 'q2',
      text: 'যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?',
      options: ['16', '14', '18', '12'],
      correctAnswer: 1,
      explanation: 'x² + 1/x² = (x + 1/x)² - 2 = 16 - 2 = 14'
    },
    {
      id: 'q3',
      text: 'একটি দ্বিঘাত সমীকরণের সর্বোচ্চ ঘাত কত?',
      options: ['১', '২', '৩', '৪'],
      correctAnswer: 1,
      explanation: 'দ্বিঘাত সমীকরণে চলের সর্বোচ্চ শক্তি বা ঘাত সর্বদা ২ হয়।'
    },
    {
      id: 'q4',
      text: 'a² - b² এর উৎপাদক বিশ্লেষণ রূপ কোনটি?',
      options: ['(a - b)²', '(a + b)(a - b)', '(a + b)²', 'a² - 2ab + b²'],
      correctAnswer: 1,
      explanation: 'a² - b² = (a + b)(a - b)'
    },
    {
      id: 'q5',
      text: 'সমকোণী ত্রিভুজের অতিভুজ নির্ণয়ের পিথাগোরাসের উপপাদ্য কোনটি?',
      options: ['c² = a² + b²', 'c = a + b', 'c² = a² - b²', 'c = a² + b²'],
      correctAnswer: 0,
      explanation: 'পিথাগোরাসের উপপাদ্য অনুসারে, অতিভুজ² = লম্ব² + ভূমি²।'
    }
  ]
};
