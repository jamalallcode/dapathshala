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
    const all = getAllSharedLiveExams();
    if (all[id]) {
      return all[id];
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
