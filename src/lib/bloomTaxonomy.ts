/**
 * Bloom's Taxonomy & NCTB Cognitive Level Engine
 * ৪টি মানসম্মত স্তর:
 * 1. জ্ঞানমূলক (Knowledge / Recall)
 * 2. অনুধাবনমূলক (Comprehension / Understanding)
 * 3. প্রয়োগমূলক (Application / Problem Solving)
 * 4. উচ্চতর দক্ষতা (Higher Order Thinking / Analysis & Synthesis)
 */

export type BloomLevel = 'knowledge' | 'comprehension' | 'application' | 'higher_order';

export interface BloomLevelMeta {
  key: BloomLevel;
  banglaName: string;
  englishName: string;
  icon: string;
  shortDesc: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentColor: string;
  standardPercentage: string; // বোর্ডের আদর্শ অনুপাত
}

export const BLOOM_LEVELS: Record<BloomLevel, BloomLevelMeta> = {
  knowledge: {
    key: 'knowledge',
    banglaName: 'জ্ঞানমূলক',
    englishName: 'Knowledge',
    icon: '📘',
    shortDesc: 'সংজ্ঞা, সূত্র, তথ্য ও মৌলিক ধারণা স্মরণে রাখার দক্ষতা',
    badgeBg: 'bg-blue-50 text-blue-800',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    accentColor: '#2563eb',
    standardPercentage: '৪০%'
  },
  comprehension: {
    key: 'comprehension',
    banglaName: 'অনুধাবনমূলক',
    englishName: 'Comprehension',
    icon: '📗',
    shortDesc: 'অর্থবোধ, ব্যাখ্যা, তুলনা ও স্বকীয় ভাষায় প্রকাশের দক্ষতা',
    badgeBg: 'bg-emerald-50 text-emerald-800',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    accentColor: '#059669',
    standardPercentage: '৩০%'
  },
  application: {
    key: 'application',
    banglaName: 'প্রয়োগমূলক',
    englishName: 'Application',
    icon: '📙',
    shortDesc: 'গাণিতিক গণনা, সূত্র প্রয়োগ ও বাস্তব সমস্যা সমাধানের দক্ষতা',
    badgeBg: 'bg-amber-50 text-amber-900',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-200',
    accentColor: '#d97706',
    standardPercentage: '২০%'
  },
  higher_order: {
    key: 'higher_order',
    banglaName: 'উচ্চতর দক্ষতা',
    englishName: 'Higher Order Ability',
    icon: '📕',
    shortDesc: 'বিশ্লেষণ, যৌক্তিক যুক্তিখণ্ডন, মূল্যায়ন ও সৃজনশীল বিচার',
    badgeBg: 'bg-purple-50 text-purple-900',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-200',
    accentColor: '#9333ea',
    standardPercentage: '১০%'
  }
};

/**
 * Normalize any input cognitive string to one of the 4 standard BloomLevel keys
 */
export function normalizeBloomLevel(input?: string | null): BloomLevel {
  if (!input) return 'knowledge';
  const val = String(input).toLowerCase().trim();
  if (val.includes('higher') || val.includes('উচ্চতর') || val.includes('দক্ষতা') || val.includes('analysis') || val.includes('evaluation')) {
    return 'higher_order';
  }
  if (val.includes('appl') || val.includes('প্রয়োগ') || val.includes('প্রয়োগ') || val.includes('solve')) {
    return 'application';
  }
  if (val.includes('comp') || val.includes('অনুধাবন') || val.includes('understand') || val.includes('explain')) {
    return 'comprehension';
  }
  return 'knowledge';
}

/**
 * Smart Cognitive Level Inferrer:
 * If a question has no explicit cognitive level, analyze its text and options to deduce the most accurate Bloom level.
 */
export function inferBloomLevelFromQuestion(questionText: string, explanation?: string): BloomLevel {
  const text = `${questionText} ${explanation || ''}`.toLowerCase();

  // Higher Order keywords
  if (
    text.includes('বিশ্লেষণ') || 
    text.includes('যৌক্তিক') || 
    text.includes('তুলনামূলক') || 
    text.includes('সিদ্ধান্ত') || 
    text.includes('সঠিক নয়') ||
    text.includes('উভয়ই') ||
    text.includes('নিচের কোনটি সঠিক?') && (text.includes('i, ii') || text.includes('i ও iii')) ||
    text.includes('উদ্দীপক')
  ) {
    return 'higher_order';
  }

  // Application keywords (Math, Physics numerical, calculation, formula application)
  if (
    text.includes('মান কত') || 
    text.includes('কত হবে') || 
    text.includes('নির্ণয় কর') || 
    text.includes('হিসাব') || 
    text.includes('ক্ষেত্রফল') || 
    text.includes('বেগ') || 
    text.includes('ত্বরণ') || 
    text.includes('বল') || 
    text.includes('কাজ') || 
    text.includes('শতাংশ') || 
    text.includes('লাভ') || 
    text.includes('মুনাফা') || 
    text.includes('অনুপাত') || 
    text.includes('=') ||
    /\d+/.test(questionText) && (text.includes('যোগ') || text.includes('গুণ') || text.includes('ভাগ') || text.includes('বিয়োগ'))
  ) {
    return 'application';
  }

  // Comprehension keywords
  if (
    text.includes('কারণ') || 
    text.includes('কেন') || 
    text.includes('তাৎপর্য') || 
    text.includes('মূলভাব') || 
    text.includes('ব্যাখ্যা') || 
    text.includes('উদ্দেশ্য') || 
    text.includes('বোঝায়') || 
    text.includes('কী নির্দেশ করে') ||
    text.includes('বলতে কী বোঝায়')
  ) {
    return 'comprehension';
  }

  // Default to knowledge
  return 'knowledge';
}

/**
 * Calculate cognitive balance stats from a list of questions
 */
export function calculateBloomStats(questions: { cognitiveLevel?: string; question?: string; explanation?: string }[]) {
  const counts: Record<BloomLevel, number> = {
    knowledge: 0,
    comprehension: 0,
    application: 0,
    higher_order: 0
  };

  questions.forEach(q => {
    const level = q.cognitiveLevel ? normalizeBloomLevel(q.cognitiveLevel) : inferBloomLevelFromQuestion(q.question || '', q.explanation);
    counts[level]++;
  });

  const total = Math.max(1, questions.length);
  const percentages: Record<BloomLevel, number> = {
    knowledge: Math.round((counts.knowledge / total) * 100),
    comprehension: Math.round((counts.comprehension / total) * 100),
    application: Math.round((counts.application / total) * 100),
    higher_order: Math.round((counts.higher_order / total) * 100)
  };

  return {
    counts,
    percentages,
    total: questions.length
  };
}
