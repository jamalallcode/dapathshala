export interface BookQuestion {
  id: string;
  subject: string;
  classLevel: string;
  topic: string;
  bookName: string;
  pageNumber?: string;
  question: string;
  options: [string, string, string, string];
  answer: string;
  explanation?: string;
  yearOrBoard?: string;
  year?: string;
  examCategory?: string;
  difficulty?: 'সহজ' | 'মাঝারি' | 'কঠিন';
}

export function resolveDifficulty(q: BookQuestion, fallbackIdx: number = 0): 'সহজ' | 'মাঝারি' | 'কঠিন' {
  if (q.difficulty) return q.difficulty;
  const sum = (q.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + fallbackIdx;
  const mod = sum % 3;
  if (mod === 0) return 'সহজ';
  if (mod === 1) return 'মাঝারি';
  return 'কঠিন';
}
