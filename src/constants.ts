import { Exam, Note, Candidate, Question } from './types';

export const EXAMS: Exam[] = [
  { id: '1', title: 'গণিত ফাইনাল পরীক্ষা', date: '2026-04-15', duration: 120, subject: 'গণিত', totalMarks: 100 },
  { id: '2', title: 'পদার্থবিজ্ঞান মিডটার্ম', date: '2026-04-20', duration: 90, subject: 'পদার্থবিজ্ঞান', totalMarks: 50 },
  { id: '3', title: 'রসায়ন কুইজ', date: '2026-04-25', duration: 45, subject: 'রসায়ন', totalMarks: 20 },
];

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'নিচের কোনটি মৌলিক সংখ্যা?',
    options: ['৪', '৬', '৯', '১১'],
    correctAnswer: 3,
    explanation: '১১ একটি মৌলিক সংখ্যা কারণ এর ১ এবং ১১ ছাড়া অন্য কোনো উৎপাদক নেই।'
  },
  {
    id: 'q2',
    text: 'পানির রাসায়নিক সংকেত কী?',
    options: ['H2O', 'CO2', 'O2', 'NaCl'],
    correctAnswer: 0,
    explanation: 'পানির অণুতে দুটি হাইড্রোজেন এবং একটি অক্সিজেন পরমাণু থাকে।'
  },
  {
    id: 'q3',
    text: 'নিউটনের গতির দ্বিতীয় সূত্রটি কী?',
    options: ['F = ma', 'E = mc2', 'v = u + at', 's = ut + 1/2at2'],
    correctAnswer: 0,
    explanation: 'বল (F) = ভর (m) × ত্বরণ (a)।'
  },
  {
    id: 'q4',
    text: 'বাংলাদেশের জাতীয় কবি কে?',
    options: ['রবীন্দ্রনাথ ঠাকুর', 'কাজী নজরুল ইসলাম', 'জসীমউদ্দীন', 'জীবনানন্দ দাশ'],
    correctAnswer: 1,
    explanation: 'কাজী নজরুল ইসলাম বাংলাদেশের জাতীয় কবি।'
  },
  {
    id: 'q5',
    text: 'সূর্য থেকে পৃথিবীতে আলো আসতে কত সময় লাগে?',
    options: ['৫ মিনিট', '৮ মিনিট ২০ সেকেন্ড', '১০ মিনিট', '১২ মিনিট'],
    correctAnswer: 1,
    explanation: 'সূর্য থেকে পৃথিবীতে আলো আসতে গড়ে ৮ মিনিট ২০ সেকেন্ড সময় লাগে।'
  }
];

export const NOTES: Note[] = [
  { id: '1', title: 'সহজ ক্যালকুলাস', author: 'অধ্যাপক স্মিথ', price: 15.99, subject: 'গণিত', rating: 4.8, previewUrl: 'https://picsum.photos/seed/math/400/600' },
  { id: '2', title: 'জৈব রসায়নের মূলকথা', author: 'ডাঃ জেন', price: 12.50, subject: 'রসায়ন', rating: 4.5, previewUrl: 'https://picsum.photos/seed/chem/400/600' },
  { id: '3', title: 'কোয়ান্টাম মেকানিক্স পরিচিতি', author: 'আলবার্ট ই.', price: 25.00, subject: 'পদার্থবিজ্ঞান', rating: 4.9, previewUrl: 'https://picsum.photos/seed/physics/400/600' },
];

export const CANDIDATES: Candidate[] = [
  { id: '1', name: 'রহিম আহমেদ', division: 'ঢাকা', position: 'সভাপতি', votes: 1250 },
  { id: '2', name: 'করিম উল্লাহ', division: 'চট্টগ্রাম', position: 'সম্পাদক', votes: 980 },
  { id: '3', name: 'ফাতিমা বেগম', division: 'সিলেট', position: 'কোষাধ্যক্ষ', votes: 1100 },
];
