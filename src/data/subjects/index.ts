import { BookQuestion } from '../questionTypes';
import { BANGLA_QUESTIONS } from './banglaQuestions';
import { MATH_QUESTIONS } from './mathQuestions';
import { ENGLISH_QUESTIONS } from './englishQuestions';
import { SCIENCE_QUESTIONS } from './scienceQuestions';
import { GK_QUESTIONS } from './gkQuestions';
import { JOB_QUESTIONS } from './jobQuestions';

export { BANGLA_QUESTIONS } from './banglaQuestions';
export { MATH_QUESTIONS } from './mathQuestions';
export { ENGLISH_QUESTIONS } from './englishQuestions';
export { SCIENCE_QUESTIONS } from './scienceQuestions';
export { GK_QUESTIONS } from './gkQuestions';
export { JOB_QUESTIONS } from './jobQuestions';

/**
 * Combined list of all questions across dedicated subject files.
 * Adding or managing questions in any subject is now isolated to its own file.
 */
export const ALL_STORED_SUBJECT_QUESTIONS: BookQuestion[] = [
  ...BANGLA_QUESTIONS,
  ...MATH_QUESTIONS,
  ...ENGLISH_QUESTIONS,
  ...SCIENCE_QUESTIONS,
  ...GK_QUESTIONS,
  ...JOB_QUESTIONS
];

export const SUBJECT_TOPIC_MAP: Record<string, string[]> = {
  "বাংলা": [
    "সকল অধ্যায়",
    "কারক ও বিভক্তি",
    "সন্ধি",
    "সমাস",
    "বাগধারা ও প্রবাদ",
    "ধ্বনি ও বর্ণ প্রকরণ",
    "স্বরবর্ণ ও ব্যঞ্জনবর্ণ",
    "যুক্তবর্ণ ও বাক্য",
    "বিপরীত শব্দ ও সমার্থক"
  ],
  "গণিত": [
    "সকল অধ্যায়",
    "বীজগণিতীয় রাশি",
    "ত্রিকোণমিতি",
    "পরিমিতি ও পরিসংখ্যান",
    "জ্যামিতি (বৃত্ত ও ত্রিভুজ)",
    "সমান্তর ও গুণোত্তর ধারা",
    "এক চলক ও দ্বিঘাত সমীকরণ",
    "যোগের ধারণা",
    "তুলনা করা (বড়-ছোট)",
    "নামতা (১ থেকে ১০)",
    "গড় ও শতকরা",
    "মুনাফা ও লাভ-ক্ষতি"
  ],
  "ইংরেজি": [
    "সকল অধ্যায়",
    "Prepositions",
    "Voice Change",
    "Right Form of Verbs",
    "Vocabulary & Synonyms",
    "Alphabet & Simple Words",
    "Parts of Speech"
  ],
  "বিজ্ঞান": [
    "সকল অধ্যায়",
    "উদ্ভিদ ও প্রাণীর বৈচিত্র্য",
    "পরমাণুর গঠন"
  ],
  "পদার্থবিজ্ঞান": [
    "সকল অধ্যায়",
    "গতি ও বল",
    "কাজ, ক্ষমতা ও শক্তি",
    "আলোর প্রতিফলন ও প্রতিসরণ"
  ],
  "রসায়ন": [
    "সকল অধ্যায়",
    "পর্যায় সারণি ও মৌল",
    "রাসায়নিক বন্ধন"
  ],
  "জীববিজ্ঞান": [
    "সকল অধ্যায়",
    "জীবকোষ ও টিস্যু",
    "রক্ত সংবহন ও হৃদপিণ্ড"
  ],
  "সাধারণ জ্ঞান": [
    "সকল অধ্যায়",
    "বাংলাদেশের ইতিহাস ও মুক্তিযুদ্ধ",
    "বাংলাদেশের সংবিধান",
    "আন্তর্জাতিক বিষয়াবলী"
  ],
  "চাকুরি প্রস্তুতি": [
    "সকল অধ্যায়",
    "বিসিএস প্রিলিমিনারি",
    "প্রাথমিক শিক্ষক নিয়োগ",
    "মেডিকেল ভর্তি পরীক্ষা",
    "এনটিআরসিএ (শিক্ষক নিবন্ধন)",
    "ব্যাংক নিয়োগ পরীক্ষা"
  ]
};
