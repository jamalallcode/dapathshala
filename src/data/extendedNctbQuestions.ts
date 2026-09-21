import { BookQuestion } from './initialBookQuestions';

/**
 * Extended NCTB Book Question Bank covering Class 1 to Class 10
 * Tagged strictly by:
 * - classLevel: ১ম শ্রেণি to ১০ম শ্রেণি
 * - subject: বাংলা, গণিত, ইংরেজি, বিজ্ঞান, পদার্থবিজ্ঞান, রসায়ন, ইত্যাদি
 * - topic: specific syllabus chapters (বীজগণিত, ত্রিকোণমিতি, পরিমিতি, ইত্যাদি)
 * - difficulty: 'সহজ' | 'মাঝারি' | 'কঠিন'
 * - Pristine formatting for mathematical symbols, powers, fractions, and Greek terms.
 */
export const EXTENDED_NCTB_QUESTIONS: BookQuestion[] = [
  // ================= 1st to 5th Class (Primary) =================
  {
    id: "cls1-math-1",
    subject: "গণিত",
    classLevel: "১ম শ্রেণি",
    topic: "যোগের ধারণা",
    bookName: "প্রাথমিক গণিত (এনসিটিবি ১ম শ্রেণি)",
    pageNumber: "পৃষ্ঠা ২৫",
    question: "৩ টি আম এবং ২টি আম একসাথে রাখলে মোট কয়টি আম হবে?",
    options: ["৫টি", "৪টি", "৬টি", "৭টি"],
    answer: "৫টি",
    difficulty: "সহজ",
    explanation: "৩ + ২ = ৫।",
    yearOrBoard: "প্রাথমিক মূল্যায়ন"
  },
  {
    id: "cls1-math-2",
    subject: "গণিত",
    classLevel: "১ম শ্রেণি",
    topic: "তুলনা করা (বড়-ছোট)",
    bookName: "প্রাথমিক গণিত (এনসিটিবি ১ম শ্রেণি)",
    pageNumber: "পৃষ্ঠা ১২",
    question: "নিচের সংখ্যাগুলোর মধ্যে কোনটি সবচেয়ে বড়?",
    options: ["৯", "৬", "৪", "৭"],
    answer: "৯",
    difficulty: "সহজ",
    explanation: "প্রদত্ত সংখ্যাগুলোর মধ্যে ৯ সবচেয়ে বড়।",
    yearOrBoard: "প্রাথমিক মূল্যায়ন"
  },
  {
    id: "cls1-bn-1",
    subject: "বাংলা",
    classLevel: "১ম শ্রেণি",
    topic: "স্বরবর্ণ ও ব্যঞ্জনবর্ণ",
    bookName: "আমার বাংলা বই (এনসিটিবি ১ম শ্রেণি)",
    pageNumber: "পৃষ্ঠা ৮",
    question: "বাংলা ভাষায় মোট স্বরবর্ণ কয়টি?",
    options: ["১১টি", "৭টি", "৩৯টি", "৫০টি"],
    answer: "১১টি",
    difficulty: "সহজ",
    explanation: "অ থেকে ঔ পর্যন্ত মোট ১১টি স্বরবর্ণ রয়েছে।",
    yearOrBoard: "জাতীয় প্রাথমিক শিক্ষাক্রম"
  },
  {
    id: "cls2-math-1",
    subject: "গণিত",
    classLevel: "২য় শ্রেণি",
    topic: "নামতা (১ থেকে ১০)",
    bookName: "প্রাথমিক গণিত (এনসিটিবি ২য় শ্রেণি)",
    pageNumber: "পৃষ্ঠা ৪২",
    question: "৭ × ৫ = কত?",
    options: ["৩৫", "৩০", "৪০", "২৮"],
    answer: "৩৫",
    difficulty: "সহজ",
    explanation: "৭ এর ঘরের নামতা: ৭ × ৫ = ৩৫।",
    yearOrBoard: "প্রাথমিক মূল্যায়ন"
  },
  {
    id: "cls3-math-1",
    subject: "গণিত",
    classLevel: "৩য় শ্রেণি",
    topic: "চার অঙ্কের সংখ্যা গণনা",
    bookName: "প্রাথমিক গণিত (এনসিটিবি ৩য় শ্রেণি)",
    pageNumber: "পৃষ্ঠা ১৫",
    question: "চার অঙ্কের ক্ষুদ্রতম সংখ্যা কোনটি?",
    options: ["১০০০", "৯৯৯৯", "১০০১", "১০১০"],
    answer: "১০০০",
    difficulty: "সহজ",
    explanation: "১ এর পর তিনটি শূন্য বসিয়ে চার অঙ্কের ক্ষুদ্রতম সংখ্যা ১০০০ গঠিত হয়।",
    yearOrBoard: "প্রাথমিক পরীক্ষা"
  },
  {
    id: "cls5-math-1",
    subject: "গণিত",
    classLevel: "৫ম শ্রেণি",
    topic: "গ.সা.গু ও ল.সা.গু",
    bookName: "প্রাথমিক গণিত (এনসিটিবি ৫ম শ্রেণি)",
    pageNumber: "পৃষ্ঠা ৩০",
    question: "১২ ও ১৮ এর গরিষ্ঠ সাধারণ গুণনীয়ক (গ.সা.গু) কত?",
    options: ["৬", "৩৬", "৩", "২"],
    answer: "৬",
    difficulty: "মাঝারি",
    explanation: "১২ = ২ × ২ × ৩ এবং ১৮ = ২ × ৩ × ৩; সাধারণ মৌলিক উৎপাদক ২ × ৩ = ৬।",
    yearOrBoard: "পিইসি সমাপনী"
  },
  {
    id: "cls5-math-2",
    subject: "গণিত",
    classLevel: "৫ম শ্রেণি",
    topic: "গড় ও শতকরা",
    bookName: "প্রাথমিক গণিত (এনসিটিবি ৫ম শ্রেণি)",
    pageNumber: "পৃষ্ঠা ৯৫",
    question: "২৫ টাকার ২০% কত টাকা?",
    options: ["৫ টাকা", "৪ টাকা", "১০ টাকা", "১৫ টাকা"],
    answer: "৫ টাকা",
    difficulty: "মাঝারি",
    explanation: "২৫ × (২০/১০০) = ২৫ × (১/৫) = ৫ টাকা।",
    yearOrBoard: "পিইসি সমাপনী"
  },

  // ================= 6th to 8th Class =================
  {
    id: "cls6-math-1",
    subject: "গণিত",
    classLevel: "৬ষ্ঠ শ্রেণি",
    topic: "পূর্ণসংখ্যা ও সংখ্যারেখা",
    bookName: "গণিত (এনসিটিবি ৬ষ্ঠ শ্রেণি)",
    pageNumber: "পৃষ্ঠা ৫৬",
    question: "(-৭) এবং (+৩) এর যোগফল কত?",
    options: ["-৪", "+৪", "-১০", "+১০"],
    answer: "-৪",
    difficulty: "সহজ",
    explanation: "(-৭) + (+৩) = -৭ + ৩ = -৪।",
    yearOrBoard: "৬ষ্ঠ শ্রেণি মূল্যায়ন"
  },
  {
    id: "cls7-math-1",
    subject: "গণিত",
    classLevel: "৭ম শ্রেণি",
    topic: "সূচকের গল্প",
    bookName: "গণিত (এনসিটিবি ৭ম শ্রেণি)",
    pageNumber: "অধ্যায় ১, পৃষ্ঠা ১২",
    question: "2⁴ × 2³ এর মান কত?",
    options: ["2⁷", "2¹²", "4⁷", "2¹"],
    answer: "2⁷",
    difficulty: "সহজ",
    explanation: "ভিত্তি একই হলে গুণের ক্ষেত্রে সূচক যোগ হয়: 2^(4 + 3) = 2⁷ = 128।",
    yearOrBoard: "৭ম শ্রেণি সাময়িক"
  },
  {
    id: "cls8-math-1",
    subject: "গণিত",
    classLevel: "৮ম শ্রেণি",
    topic: "মুনাফা (সরল ও চক্রবৃদ্ধি)",
    bookName: "গণিত (এনসিটিবি ৮ম শ্রেণি)",
    pageNumber: "অনুশীলনী ২.১, পৃষ্ঠা ১৮",
    question: "আসল P, সময় n এবং মুনাফার হার r হলে সরল মুনাফা I নির্ণয়ের সঠিক সূত্র কোনটি?",
    options: ["I = Pnr", "I = P(1 + r)ⁿ", "I = P / nr", "I = n / Pr"],
    answer: "I = Pnr",
    difficulty: "সহজ",
    explanation: "সরল মুনাফার ক্ষেত্রে I = Pnr (Interest = Principal × Time × Rate)।",
    yearOrBoard: "জেএসসি সকল বোর্ড"
  },
  {
    id: "cls8-math-2",
    subject: "গণিত",
    classLevel: "৮ম শ্রেণি",
    topic: "বীজগণিতীয় সূত্রাবলি ও প্রয়োগ (a+b)²",
    bookName: "গণিত (এনসিটিবি ৮ম শ্রেণি)",
    pageNumber: "অনুশীলনী ৪.১, পৃষ্ঠা ৫০",
    question: "যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?",
    options: ["14", "16", "18", "12"],
    answer: "14",
    difficulty: "মাঝারি",
    explanation: "x² + 1/x² = (x + 1/x)² - 2 = 4² - 2 = 16 - 2 = 14।",
    yearOrBoard: "জেএসসি ঢাকা বোর্ড ২০১৯"
  },

  // ================= 9th & 10th Class (Secondary / SSC) =================
  // বীজগণিত (Algebra) - সহজ, মাঝারি, কঠিন
  {
    id: "ssc-math-alg-easy",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "বীজগণিতীয় রাশি",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "অনুশীলনী ৩.১, পৃষ্ঠা ৪৮",
    question: "(a - b)² এর সঠিক বিস্তার কোনটি?",
    options: [
      "a² - 2ab + b²",
      "a² + 2ab + b²",
      "a² - ab + b²",
      "a² + b²"
    ],
    answer: "a² - 2ab + b²",
    difficulty: "সহজ",
    explanation: "(a - b)² = a² - 2ab + b² একটি মৌলিক বীজগণিতীয় বর্গ নির্ণয় সূত্র।",
    yearOrBoard: "ঢাকা বোর্ড ২০২৩"
  },
  {
    id: "ssc-math-alg-med",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "বীজগণিতীয় রাশি",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "অনুশীলনী ৩.২, পৃষ্ঠা ৫৪",
    question: "যদি a + b = 3 এবং ab = 2 হয়, তবে a³ + b³ এর মান কত?",
    options: ["9", "18", "27", "15"],
    answer: "9",
    difficulty: "মাঝারি",
    explanation: "a³ + b³ = (a + b)³ - 3ab(a + b) = 3³ - 3(2)(3) = 27 - 18 = 9।",
    yearOrBoard: "রাজশাহী বোর্ড ২০২১"
  },
  {
    id: "ssc-math-alg-hard",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "বীজগণিতীয় রাশি",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "অনুশীলনী ৩.২, পৃষ্ঠা ৫৭",
    question: "যদি x = √3 + √2 হয়, তবে x³ + 1/x³ এর মান কত?",
    options: ["18√3", "12√3", "18√2", "24√3"],
    answer: "18√3",
    difficulty: "কঠিন",
    explanation: "1/x = √3 - √2; সুতরাং x + 1/x = 2√3। অতএব x³ + 1/x³ = (x + 1/x)³ - 3(x + 1/x) = (2√3)³ - 3(2√3) = 24√3 - 6√3 = 18√3।",
    yearOrBoard: "চট্টগ্রাম বোর্ড ২০২৪"
  },

  // ত্রিকোণমিতি (Trigonometry) - সহজ, মাঝারি, কঠিন
  {
    id: "ssc-math-trig-easy",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "ত্রিকোণমিতি",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "অনুশীলনী ৯.২, পৃষ্ঠা ১৯১",
    question: "tan 45° এর সঠিক মান কত?",
    options: ["1", "0", "√3", "1/√3"],
    answer: "1",
    difficulty: "সহজ",
    explanation: "ত্রিকোণমিতিক কোণ অনুপাত সারণি অনুযায়ী tan 45° = 1।",
    yearOrBoard: "যশোর বোর্ড ২০২০"
  },
  {
    id: "ssc-math-trig-med",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "ত্রিকোণমিতি",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "অনুশীলনী ৯.১, পৃষ্ঠা ১৮৫",
    question: "যদি cos θ = 1/2 হয়, তবে sin²θ এর মান কত?",
    options: ["3/4", "1/4", "1/2", "√3/2"],
    answer: "3/4",
    difficulty: "মাঝারি",
    explanation: "sin²θ = 1 - cos²θ = 1 - (1/2)² = 1 - 1/4 = 3/4।",
    yearOrBoard: "ঢাকা বোর্ড ২০২২"
  },
  {
    id: "ssc-math-trig-hard",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "ত্রিকোণমিতি",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "অনুশীলনী ৯.১, পৃষ্ঠা ১৮৮",
    question: "যদি tan A + sec A = x হয়, তবে sin A এর মান নিচের কোনটি?",
    options: [
      "(x² - 1)/(x² + 1)",
      "(x² + 1)/(x² - 1)",
      "(2x)/(x² + 1)",
      "(x² - 1)/(2x)"
    ],
    answer: "(x² - 1)/(x² + 1)",
    difficulty: "কঠিন",
    explanation: "sec A - tan A = 1/x। যোগ করলে 2 sec A = x + 1/x এবং বিয়োগ করলে 2 tan A = x - 1/x। ভাগ করলে sin A = tan A / sec A = (x² - 1)/(x² + 1)।",
    yearOrBoard: "কুমিল্লা বোর্ড ২০২৩"
  },

  // পরিমিতি (Mensuration) - সহজ, মাঝারি, কঠিন
  {
    id: "ssc-math-mens-easy",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "পরিমিতি ও পরিসংখ্যান",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "অনুশীলনী ১৬.১, পৃষ্ঠা ৩০০",
    question: "একটি ত্রিভুজের ভূমি b এবং উচ্চতা h হলে, ত্রিভুজটির ক্ষেত্রফল নির্ণয়ের সূত্র কোনটি?",
    options: ["1/2 × b × h", "b × h", "2 × b × h", "1/4 × b × h"],
    answer: "1/2 × b × h",
    difficulty: "সহজ",
    explanation: "সাধারণ ত্রিভুজের ক্ষেত্রফল = ১/২ × ভূমি × উচ্চতা।",
    yearOrBoard: "বরিশাল বোর্ড ২০২১"
  },
  {
    id: "ssc-math-mens-med",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "পরিমিতি ও পরিসংখ্যান",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "অনুশীলনী ১৬.৩, পৃষ্ঠা ৩১৩",
    question: "একটি বৃত্তের ব্যাসার্ধ ১৪ সেমি হলে, এর ক্ষেত্রফল কত বর্গ সেমি? (π = 22/7 ধরুন)",
    options: ["616", "88", "308", "154"],
    answer: "616",
    difficulty: "মাঝারি",
    explanation: "ক্ষেত্রফল = π r² = (22/7) × 14 × 14 = 22 × 2 × 14 = 616 বর্গ সেমি।",
    yearOrBoard: "সিলেট বোর্ড ২০২৩"
  },
  {
    id: "ssc-math-mens-hard",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "পরিমিতি ও পরিসংখ্যান",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "অনুশীলনী ১৬.২, পৃষ্ঠা ৩০৮",
    question: "একটি রম্বসের কর্ণদ্বয়ের দৈর্ঘ্য যথাক্রমে ১৬ সেমি ও ১২ সেমি হলে, এর পরিসীমা কত সেমি?",
    options: ["40 সেমি", "20 সেমি", "48 সেমি", "96 সেমি"],
    answer: "40 সেমি",
    difficulty: "কঠিন",
    explanation: "রম্বসের বাহু a = √((d₁/2)² + (d₂/2)²) = √(8² + 6²) = √(64 + 36) = √100 = 10 সেমি। অতএব পরিসীমা = 4a = 4 × 10 = 40 সেমি।",
    yearOrBoard: "দিনাজপুর বোর্ড ২০২৪"
  },

  // জ্যামিতি ও উপপাদ্য (Geometry)
  {
    id: "ssc-math-geom-circle",
    subject: "গণিত",
    classLevel: "১০ম শ্রেণি",
    topic: "জ্যামিতি (বৃত্ত ও ত্রিভুজ)",
    bookName: "মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)",
    pageNumber: "উপপাদ্য ১৭, পৃষ্ঠা ১৪৮",
    question: "বৃত্তের কেন্দ্র ও ব্যাস ভিন্ন কোনো জ্যা-এর মধ্যবিন্দুর সংযোজক রেখাংশ ঐ জ্যা-এর ওপর কী?",
    options: ["লম্ব", "সমান্তরাল", "অর্ধেক", "স্পর্শক"],
    answer: "লম্ব",
    difficulty: "সহজ",
    explanation: "উপপাদ্য ১৭: বৃত্তের কেন্দ্র ও ব্যাস ভিন্ন কোনো জ্যা-এর মধ্যবিন্দুর সংযোজক রেখাংশ ঐ জ্যা-এর ওপর লম্ব।",
    yearOrBoard: "ঢাকা বোর্ড ২০২৪"
  }
];
