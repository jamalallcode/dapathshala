import { ExamQuestion } from '../types';

export interface InstitutionPaper {
  id: string;
  institutionName: string;
  institutionType: 'school' | 'college' | 'cadet' | 'board';
  districtOrBoard?: string;
  year: string;
  studentClass: string;
  subject: string;
  examType: string;
  durationMinutes: number;
  totalMarks?: number;
  questionCount?: number;
  questions: ExamQuestion[];
  createdAt: string;
  isCustomUploaded?: boolean;
}

const STORAGE_KEY = 'dapathshala_institution_papers_v1';

// Pre-seeded authentic question papers for top institutions & boards
export const INITIAL_INSTITUTION_PAPERS: InstitutionPaper[] = [
  {
    id: 'paper_motijheel_ideal_2024_10_bangla',
    institutionName: 'মতিঝিল আইডিয়াল স্কুল অ্যান্ড কলেজ',
    institutionType: 'school',
    districtOrBoard: 'ঢাকা',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি',
    subject: 'বাংলা ১ম পত্র',
    examType: 'টেস্ট পরীক্ষা / নির্বাচনী পরীক্ষা',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-11-15T10:00:00Z',
    questions: [
      {
        id: 'mi_b1',
        question: "'অপরিচিতা' গল্পে অনুপমের পিসতুতো ভাইয়ের নাম কী?",
        options: ['বিনু', 'হরিশ', 'গজাধর', 'মন্মথ'],
        correctAnswer: 'বিনু',
        correctAnswerIndex: 0,
        explanation: 'অনুপমের পিসতুতো ভাই বিনুদা ভাষা ব্যবহারে অত্যন্ত সংযমী ও রুচিশীল ছিলেন।'
      },
      {
        id: 'mi_b2',
        question: "শম্ভুনাথ সেন পেশায় কী ছিলেন?",
        options: ['ডাক্তার', 'উকিল', 'শিক্ষক', 'ব্যবসায়ী'],
        correctAnswer: 'ডাক্তার',
        correctAnswerIndex: 0,
        explanation: 'শম্ভুনাথ সেন পশ্চিমে ডাক্তার হিসেবে কাজ করতেন এবং ছিলেন আত্মমর্যাদাবোধসম্পন্ন ব্যক্তি।'
      },
      {
        id: 'mi_b3',
        question: "'সুভা' গল্পে সুভার প্রকৃত নাম কী ছিল?",
        options: ['সুভাষিণী', 'সুহাসিনী', 'সুকুমারী', 'সুরভী'],
        correctAnswer: 'সুভাষিণী',
        correctAnswerIndex: 0,
        explanation: 'সুভার দুই বড় বোনের নাম ছিল সুকেশিনী ও সুহাসিনী, তাই মিল রেখে তার নাম রাখা হয়েছিল সুভাষিণী।'
      },
      {
        id: 'mi_b4',
        question: "'মানুষ মুহম্মদ (স.)' প্রবন্ধে কোন ঐতিহাসিক চুক্তির উল্লেখ পাওয়া যায়?",
        options: ['হুদায়বিয়ার সন্ধি', 'মদিনা সনদ', 'বদরের সন্ধি', 'আকাবার শপথ'],
        correctAnswer: 'হুদায়বিয়ার সন্ধি',
        correctAnswerIndex: 0,
        explanation: 'হজরত মুহম্মদ (স.)-এর ধৈর্য ও বিচক্ষণতার অনন্য নিদর্শন হুদায়বিয়ার সন্ধি।'
      },
      {
        id: 'mi_b5',
        question: "'কপোতাক্ষ নদ' কবিতায় কোন ছন্দের প্রয়োগ ঘটেছে?",
        options: ['অমিত্রাক্ষর ছন্দ', 'মাত্রাবৃত্ত', 'দলবৃত্ত', 'অক্ষরবৃত্ত'],
        correctAnswer: 'অমিত্রাক্ষর ছন্দ',
        correctAnswerIndex: 0,
        explanation: 'মাইকেল মধুসূদন দত্ত প্রবর্তিত চোদ্দ মাত্রার অমিত্রাক্ষর ছন্দে সনেটটি রচিত।'
      },
      {
        id: 'mi_b6',
        question: "'একাত্তরের দিনগুলি' স্মৃতিচারণমূলক রচনায় লেখিকার জ্যেষ্ঠ পুত্রের নাম কী?",
        options: ['রুমি', 'জামী', 'বদি', 'আলম'],
        correctAnswer: 'রুমি',
        correctAnswerIndex: 0,
        explanation: 'শহীদ শাফী ইমাম রুমি ক্র্যাক প্লাটুনের একজন অকুতোভয় গেরিলা যোদ্ধা ছিলেন।'
      },
      {
        id: 'mi_b7',
        question: "‘বঙ্গবাণী’ কবিতায় আব্দুল হাকিম কোন শতকের কবি?",
        options: ['সপ্তদশ শতক', 'ষোড়শ শতক', 'অষ্টাদশ শতক', 'পঞ্চদশ শতক'],
        correctAnswer: 'সপ্তদশ শতক',
        correctAnswerIndex: 0,
        explanation: 'মধ্যযুগের বিশিষ্ট কবি আব্দুল হাকিম আনুমানিক সপ্তদশ শতকের প্রতিনিধি ছিলেন।'
      },
      {
        id: 'mi_b8',
        question: "'বই পড়া' প্রবন্ধে প্রমথ চৌধুরী লাইব্রেরিকে কার চেয়েও ওপরে স্থান দিয়েছেন?",
        options: ['স্কুল-কলেজ', 'হাসপাতাল', 'আদালত', 'সংসদ'],
        correctAnswer: 'স্কুল-কলেজ',
        correctAnswerIndex: 0,
        explanation: 'প্রমথ চৌধুরীর মতে মানুষের স্বশিক্ষিত হওয়ার জন্য লাইব্রেরির স্থান স্কুল-কলেজেরও উপরে।'
      }
    ]
  },
  {
    id: 'paper_motijheel_girls_2024_10_bangla',
    institutionName: 'মতিঝিল সরকারি বালিকা উচ্চ বিদ্যালয়',
    institutionType: 'school',
    districtOrBoard: 'ঢাকা',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি',
    subject: 'বাংলা ১ম পত্র',
    examType: 'নির্বাচনী পরীক্ষা / টেস্ট পরীক্ষা',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-11-12T10:00:00Z',
    questions: [
      {
        id: 'mg_b1',
        question: "‘পল্লিজননী’ কবিতায় সন্তানের শিয়রে বসে মা কার সাথে লড়াই করছিল?",
        options: ['মৃত্যুরূপী পরোয়ানা', 'রোগ ও অন্ধকারের সাথে', 'মশার কামড়ের সাথে', 'শীতের সাথে'],
        correctAnswer: 'রোগ ও অন্ধকারের সাথে',
        correctAnswerIndex: 1,
        explanation: 'জসীমউদ্দীন রচিত পল্লিজননী কবিতায় সন্তানকে সুস্থ করে তুলতে একাকী মায়ের ব্যাকুল আকুতি ফুটে উঠেছে।'
      },
      {
        id: 'mg_b2',
        question: "‘আম-আঁটির ভেঁপু’ উপাখ্যানটি বিভূতিভূষণ বন্দ্যোপাধ্যায়ের কোন উপন্যাস থেকে সংকলিত?",
        options: ['পথের পাঁচালী', 'অপরাজিত', 'আরণ্যক', 'ইছামতী'],
        correctAnswer: 'পথের পাঁচালী',
        correctAnswerIndex: 0,
        explanation: 'কালজয়ী উপন্যাস পথের পাঁচালীর শৈশব পর্ব থেকে অংশটি চয়ন করা হয়েছে।'
      },
      {
        id: 'mg_b3',
        question: "অপু ও দুর্গার বাবার নাম কী ছিল?",
        options: ['হরিহর রায়', 'ভুবন মুখুয্যে', 'নীলমণি রায়', 'সেজ তরফ'],
        correctAnswer: 'হরিহর রায়',
        correctAnswerIndex: 0,
        explanation: 'হরিহর রায় একজন দরিদ্র ব্রাহ্মণ ও স্বপ্নদর্শী লেখক-পুরোহিত ছিলেন।'
      },
      {
        id: 'mg_b4',
        question: "'শিক্ষা ও মনুষ্যত্ব' প্রবন্ধে মোতাহের হোসেন চৌধুরী মানবজীবনকে কার সাথে তুলনা করেছেন?",
        options: ['একটি দোতলা ঘরের সাথে', 'একটি বহতা নদীর সাথে', 'একটি বটবৃক্ষের সাথে', 'একটি প্রদীপের সাথে'],
        correctAnswer: 'একটি দোতলা ঘরের সাথে',
        correctAnswerIndex: 0,
        explanation: 'জীবসত্তা হলো নিচের তলা এবং মানবসত্তা হলো ওপরের তলা; শিক্ষাই হলো সিঁড়ি।'
      },
      {
        id: 'mg_b5',
        question: "'রানার' কবিতায় রানার কিসের বোঝা নিয়ে ছুটে চলে?",
        options: ['দুঃখ ও চিঠির বোঝা', 'টাকার থলে', 'খাবারের ঝুড়ি', 'সংবাদপত্রের গাঁট'],
        correctAnswer: 'দুঃখ ও চিঠির বোঝা',
        correctAnswerIndex: 0,
        explanation: 'সুকান্ত ভট্টাচার্য রানারের অবিরাম ছুটে চলাকে মানবিক মর্যাদায় চিত্রিত করেছেন।'
      },
      {
        id: 'mg_b6',
        question: "'মুহম্মদ (স.) ছিলেন একজন মানবীয় রাসুল'— এই বাক্যে কোনটি ফুটে ওঠে?",
        options: ['অতিমানবীয় অহংকার বর্জন ও বিনম্র মানবপ্রেম', 'অলৌকিক ক্ষমতা', 'ভীতিকর রূপ', 'সম্পদের মোহ'],
        correctAnswer: 'অতিমানবীয় অহংকার বর্জন ও বিনম্র মানবপ্রেম',
        correctAnswerIndex: 0,
        explanation: 'রাসুল (স.) সর্বাবস্থায় নিজেকে রক্তমাংসের সাধারণ মানুষ ও সেবক হিসেবে পরিচয় দিতেন।'
      }
    ]
  },
  {
    id: 'paper_motijheel_ideal_2024_10_math',
    institutionName: 'মতিঝিল আইডিয়াল স্কুল অ্যান্ড কলেজ',
    institutionType: 'school',
    districtOrBoard: 'ঢাকা',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি',
    subject: 'সাধারণ গণিত',
    examType: 'টেস্ট পরীক্ষা / নির্বাচনী পরীক্ষা',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-11-18T10:00:00Z',
    questions: [
      {
        id: 'mi_m1',
        question: "যদি A = {1, 2, 3} হয়, তবে P(A) বা শক্তি সেটের উপাদান সংখ্যা কত?",
        options: ['8', '6', '3', '16'],
        correctAnswer: '8',
        correctAnswerIndex: 0,
        explanation: 'কোনো সেটের উপাদান সংখ্যা n হলে তার শক্তি সেটের উপাদান সংখ্যা 2^n = 2^3 = 8 হয়।'
      },
      {
        id: 'mi_m2',
        question: "x + 1/x = 3 হলে, x² + 1/x² এর মান কত?",
        options: ['7', '9', '11', '5'],
        correctAnswer: '7',
        correctAnswerIndex: 0,
        explanation: 'x² + 1/x² = (x + 1/x)² - 2 = 3² - 2 = 9 - 2 = 7।'
      },
      {
        id: 'mi_m3',
        question: "log₂ 16 এর মান কত?",
        options: ['4', '2', '8', '16'],
        correctAnswer: '4',
        correctAnswerIndex: 0,
        explanation: '16 = 2^4, সুতরাং log₂ (2^4) = 4 log₂ 2 = 4।'
      },
      {
        id: 'mi_m4',
        question: "একটি বৃত্তের ব্যাসার্ধ 7 সেমি হলে তার পরিধি কত? (π = 22/7)",
        options: ['44 সেমি', '88 সেমি', '154 সেমি', '22 সেমি'],
        correctAnswer: '44 সেমি',
        correctAnswerIndex: 0,
        explanation: 'পরিধি = 2πr = 2 × (22/7) × 7 = 44 সেমি।'
      },
      {
        id: 'mi_m5',
        question: "tan 45° + sin 30° এর মান কত?",
        options: ['3/2', '1', '1/2', '2'],
        correctAnswer: '3/2',
        correctAnswerIndex: 0,
        explanation: 'tan 45° = 1 এবং sin 30° = 1/2; 1 + 1/2 = 3/2।'
      },
      {
        id: 'mi_m6',
        question: "2, 4, 6, 8, ... ধারাটির দশম পদ কোনটি?",
        options: ['20', '18', '22', '24'],
        correctAnswer: '20',
        correctAnswerIndex: 0,
        explanation: 'সমান্তর ধারার n-তম পদ = a + (n-1)d = 2 + (10-1)×2 = 2 + 18 = 20।'
      }
    ]
  },
  {
    id: 'paper_viqarunnisa_2024_10_bangla',
    institutionName: 'ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ',
    institutionType: 'school',
    districtOrBoard: 'ঢাকা',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি',
    subject: 'বাংলা ১ম পত্র',
    examType: 'নির্বাচনী পরীক্ষা / টেস্ট পরীক্ষা',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-11-20T10:00:00Z',
    questions: [
      {
        id: 'vn_b1',
        question: "‘তোমাকে পাওয়ার জন্যে, হে স্বাধীনতা’ কবিতায় কার কপালে সিঁথির সিঁদুর মুছে গেল?",
        options: ['হরিদাসীর', 'সখিনা বিবির', 'রুস্তম শেখের', 'তেহট্টের জমিদারের'],
        correctAnswer: 'হরিদাসীর',
        correctAnswerIndex: 0,
        explanation: 'শামসুর রাহমানের কবিতায় হরিদাসীর সিঁথির সিঁদুর মোছার রূপকে বিধবা হওয়ার করুণ চিত্র আঁকা হয়েছে।'
      },
      {
        id: 'vn_b2',
        question: "‘নিমগাছ’ গল্পের ম্যাজিক বাক্য কোনটি?",
        options: ['বাড়ির গৃহকর্ম-নিপুণা লক্ষ্মী বউটার ঠিক এক দশা।', 'কেউ ছালটা ছাড়িয়ে নিয়ে সিদ্ধ করছে।', 'কবিরাজরা প্রশংসায় পঞ্চমুখ।', 'হঠাৎ একদিন একটা নতুন ধরনের লোক এল।'],
        correctAnswer: 'বাড়ির গৃহকর্ম-নিপুণা লক্ষ্মী বউটার ঠিক এক দশা।',
        correctAnswerIndex: 0,
        explanation: 'বনফুলের এই শেষ বাক্যটিতেই প্রতীকের আড়াল ভেঙে নারীর আত্মত্যাগের মর্মন্তুদ সত্য উন্মোচিত হয়েছে।'
      },
      {
        id: 'vn_b3',
        question: "'কাকতাড়ুয়া' উপন্যাসের কেন্দ্রীয় চরিত্রের নাম কী?",
        options: ['বুধা', 'আলী', 'মিঠু', 'কুন্তি'],
        correctAnswer: 'বুধা',
        correctAnswerIndex: 0,
        explanation: 'সেলিনা হোসেনের মুক্তিযুদ্ধভিত্তিক কিশোর উপন্যাসের মূল চরিত্র পিতৃমাতৃহীন দুরন্ত কিশোর বুধা।'
      },
      {
        id: 'vn_b4',
        question: "'বহিপীর' নাটকের নাট্যকার কে?",
        options: ['সৈয়দ ওয়ালীউল্লাহ', 'মুনীর চৌধুরী', 'সেলিম আল দীন', 'নুরুল মোমেন'],
        correctAnswer: 'সৈয়দ ওয়ালীউল্লাহ',
        correctAnswerIndex: 0,
        explanation: 'সামাজিক কুসংস্কার ও ভণ্ড পীরপ্রথার বিরুদ্ধে বলিষ্ঠ নাটক বহিপীর লিখেছেন সৈয়দ ওয়ালীউল্লাহ।'
      },
      {
        id: 'vn_b5',
        question: "তাহেরা কোন নদীর তীরের মেয়ে ছিল?",
        options: ['পদ্মা', 'মেঘনা', 'ধলেশ্বরী', 'কর্ণফুলী'],
        correctAnswer: 'পদ্মা',
        correctAnswerIndex: 0,
        explanation: 'বহিপীর নাটকে তাহেরা জমিদারের বজরায় আশ্রয় নিয়েছিল এবং সে পদ্মাপাড়ের মেয়ে।'
      }
    ]
  },
  {
    id: 'paper_rajuk_2024_10_physics',
    institutionName: 'রাজউক উত্তরা মডেল কলেজ',
    institutionType: 'college',
    districtOrBoard: 'ঢাকা',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি',
    subject: 'পদার্থবিজ্ঞান',
    examType: 'টেস্ট পরীক্ষা / নির্বাচনী পরীক্ষা',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-11-22T10:00:00Z',
    questions: [
      {
        id: 'rj_p1',
        question: "মহাকর্ষীয় ধ্রুবক G এর এসআই একক কোনটি?",
        options: ['N m² kg⁻²', 'N m kg⁻¹', 'kg m s⁻²', 'N kg⁻¹'],
        correctAnswer: 'N m² kg⁻²',
        correctAnswerIndex: 0,
        explanation: 'F = G(m1m2)/r² থেকে G = Fr²/(m1m2), যার একক নিউটন-মিটার²-কেজি⁻²।'
      },
      {
        id: 'rj_p2',
        question: "কোনো বস্তুর বেগ দ্বিগুণ করা হলে তার গতিশক্তি কতগুণ বৃদ্ধি পাবে?",
        options: ['৪ গুণ', '২ গুণ', '৮ গুণ', 'অপরিবর্তিত থাকবে'],
        correctAnswer: '৪ গুণ',
        correctAnswerIndex: 0,
        explanation: 'গতিশক্তি Ek = 1/2 m v²; যেহেতু বেগ দ্বিগুণ (2v), তাই (2)² = ৪ গুণ হবে।'
      },
      {
        id: 'rj_p3',
        question: "শব্দের বেগ সবচেয়ে বেশি কোন মাধ্যমে?",
        options: ['কঠিন মাধ্যমে', 'তরল মাধ্যমে', 'বায়বীয় মাধ্যমে', 'শূন্য মাধ্যমে'],
        correctAnswer: 'কঠিন মাধ্যমে',
        correctAnswerIndex: 0,
        explanation: 'কঠিন পদার্থের স্থিতিস্থাপকতা ও ঘনত্ব সবচেয়ে বেশি হওয়ায় সেখানে শব্দের বেগ সর্বাধিক (যেমন লোহায় প্রায় ৫১৩৭ মি/সে)।'
      },
      {
        id: 'rj_p4',
        question: "১ অশ্বক্ষমতা (1 Horse Power) সমান কত ওয়াট?",
        options: ['746 W', '1000 W', '550 W', '786 W'],
        correctAnswer: '746 W',
        correctAnswerIndex: 0,
        explanation: '1 HP = 746 Watt।'
      },
      {
        id: 'rj_p5',
        question: "উত্তল লেন্সের প্রধান ফোকাসে বস্তু রাখলে প্রতিবিম্ব কোথায় গঠিত হবে?",
        options: ['অসীমে', 'বক্রতার কেন্দ্রে', 'ফোকাস ও আলোক কেন্দ্রের মাঝে', 'লেন্সের ঠিক পেছনে'],
        correctAnswer: 'অসীমে',
        correctAnswerIndex: 0,
        explanation: 'ফোকাসে রক্ষিত বস্তুর প্রতিসৃত রশ্মিগুলো সমান্তরাল হওয়ায় প্রতিবিম্ব অসীমে সৃষ্টি হয়।'
      }
    ]
  },
  {
    id: 'paper_notredame_2024_11_bangla',
    institutionName: 'নটর ডেম কলেজ, ঢাকা',
    institutionType: 'college',
    districtOrBoard: 'ঢাকা',
    year: '২০২৪',
    studentClass: 'একাদশ-দ্বাদশ (এইচএসসি)',
    subject: 'বাংলা ১ম পত্র',
    examType: 'বার্ষিক পরীক্ষা / কলেজ টেস্ট',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-11-25T10:00:00Z',
    questions: [
      {
        id: 'nd_b1',
        question: "‘রক্তে আমার অনাদি অস্থি’ কার রচিত কবিতা?",
        options: ['দিলওয়ার', 'শামসুর রাহমান', 'আল মাহমুদ', 'নির্মলেন্দু গুণ'],
        correctAnswer: 'দিলওয়ার',
        correctAnswerIndex: 0,
        explanation: 'গণমানুষের কবি দিলওয়ার সুরমা পাড়ের শ্রমজীবী মানুষের চেতনায় এই কবিতা রচনা করেছেন।'
      },
      {
        id: 'nd_b2',
        question: "‘বিদ্রোহী’ কবিতাটি কাজী নজরুল ইসলামের কোন কাব্যগ্রন্থের অন্তর্ভুক্ত?",
        options: ['অগ্নিবীণা', 'বিষের বাঁশী', 'ছায়ানট', 'প্রলয়শিখা'],
        correctAnswer: 'অগ্নিবীণা',
        correctAnswerIndex: 0,
        explanation: '১৯২২ সালে প্রকাশিত নজরুলের প্রথম কাব্যগ্রন্থ ‘অগ্নিবীণা’র দ্বিতীয় কবিতা ‘বিদ্রোহী’।'
      },
      {
        id: 'nd_b3',
        question: "‘সিরাজউদ্দৌলা’ নাটকে ইংরেজদের পক্ষে প্রধান কূটকৌশলী কে ছিলেন?",
        options: ['লর্ড ক্লাইভ', 'ওয়াটস', 'হলওয়েল', 'ড্রেক'],
        correctAnswer: 'লর্ড ক্লাইভ',
        correctAnswerIndex: 0,
        explanation: 'রবার্ট ক্লাইভ মীরজাফর ও জগৎশেঠদের সাথে ষড়যন্ত্র করে পলাশীর নাট্যমঞ্চ সাজিয়েছিলেন।'
      },
      {
        id: 'nd_b4',
        question: "'লালসালু' উপন্যাসে মজিদ কার মাজারের ওপর ভিত্তি করে কর্তৃত্ব প্রতিষ্ঠা করে?",
        options: ['মোদাচ্ছের পীর', 'শাহজালাল', 'বড়পীর', 'কুতুব মিনা'],
        correctAnswer: 'মোদাচ্ছের পীর',
        correctAnswerIndex: 0,
        explanation: 'মজিদ অজ্ঞাত ‘মোদাচ্ছের’ (নামহীন) পীরের মিথ্যা কবরে লালসালু চড়িয়ে মহব্বতনগর গ্রামে শোষণ চালায়।'
      }
    ]
  },
  {
    id: 'paper_dhaka_board_2024_10_bangla',
    institutionName: 'ঢাকা শিক্ষা বোর্ড (এসএসসি)',
    institutionType: 'board',
    districtOrBoard: 'ঢাকা',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি (এসএসসি)',
    subject: 'বাংলা ১ম পত্র',
    examType: 'এসএসসি বোর্ড পরীক্ষা',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-02-15T10:00:00Z',
    questions: [
      {
        id: 'db_b1',
        question: "‘আমার সন্তান যেন থাকে দুধেভাতে’— এই অমর প্রার্থনাটি কার?",
        options: ['ঈশ্বরী পাটুনীর', 'অন্নদামঙ্গলের কবির', 'ভবানী পাঠকের', 'সুধার মার'],
        correctAnswer: 'ঈশ্বরী পাটুনীর',
        correctAnswerIndex: 0,
        explanation: 'ভারতচন্দ্র রায়গুণাকরের অন্নদামঙ্গল কাব্যে সাধারণ মাঝিমাতা ঈশ্বরী পাটুনী দেবীর কাছে এই বর প্রার্থনা করেছিলেন।'
      },
      {
        id: 'db_b2',
        question: "‘সাহসী জননী বাংলা’ কবিতায় কবি কাদের অসুর বলেছেন?",
        options: ['হানাদার পাকিস্তানি বাহিনীকে', 'ব্রিটিশ বেনিয়াদের', 'মুঘল সুবেদারদের', 'রাজাকার ও দালালিদের'],
        correctAnswer: 'হানাদার পাকিস্তানি বাহিনীকে',
        correctAnswerIndex: 0,
        explanation: 'কামাল চৌধুরী একাত্তরের বর্বর পাকিস্তানি বাহিনীকে ধ্বংসাত্মক দানব বা অসুর বলে আখ্যায়িত করেছেন।'
      },
      {
        id: 'db_b3',
        question: "'জীবন-সঙ্গীত' কবিতায় হেমচন্দ্র বন্দ্যোপাধ্যায় জীবনকে কিসের সাথে তুলনা না করার আহ্বান জানিয়েছেন?",
        options: ['মিথ্যা বা স্বপ্নময় মায়ামরীচিকার সাথে', 'ফুলবাগানের সাথে', 'সমুদ্রের সাথে', 'যুদ্ধক্ষেত্রের সাথে'],
        correctAnswer: 'মিথ্যা বা স্বপ্নময় মায়ামরীচিকার সাথে',
        correctAnswerIndex: 0,
        explanation: 'জীবন কেবল অলীক স্বপ্ন নয়, এটি এক বাস্তব সংসার-সমরাঙ্গন যেখানে জয়ী হতে হবে।'
      },
      {
        id: 'db_b4',
        question: "‘মানুষ’ কবিতায় কবি নজরুল ভুখারির ক্ষোভের মাধ্যমে কোন শ্রেণির ভণ্ডামিকে তুলে ধরেছেন?",
        options: ['ধর্মব্যবসায়ী মোল্লা ও পুরোহিতদের', 'ধনিক বণিক শ্রেণির', 'সামন্ত জমিদারদের', 'ভণ্ড কবিদের'],
        correctAnswer: 'ধর্মব্যবসায়ী মোল্লা ও পুরোহিতদের',
        correctAnswerIndex: 0,
        explanation: 'ক্ষুধার্ত মানুষকে খাবার না দিয়ে মন্দিরে-মসজিদে তালা দেওয়া ধর্মব্যবসায়ীদের তিনি ধিক্কার জানিয়েছেন।'
      },
      {
        id: 'db_b5',
        question: "‘ঝর্ণার গান’ কবিতায় কবি সত্যেন্দ্রনাথ দত্ত কোন উপাধিতে ভূষিত?",
        options: ['ছন্দের জাদুকর', 'পল্লীকবি', 'বিদ্রোহী কবি', 'সাহিত্য সম্রাট'],
        correctAnswer: 'ছন্দের জাদুকর',
        correctAnswerIndex: 0,
        explanation: 'অনুপম ছন্দ ও ধ্বনিবৈচিত্র্যের কারণে সত্যেন্দ্রনাথ দত্ত ‘ছন্দের জাদুকর’ নামে খ্যাত।'
      }
    ]
  },
  {
    id: 'paper_dhaka_board_2024_10_math',
    institutionName: 'ঢাকা শিক্ষা বোর্ড (এসএসসি)',
    institutionType: 'board',
    districtOrBoard: 'ঢাকা',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি (এসএসসি)',
    subject: 'সাধারণ গণিত',
    examType: 'এসএসসি বোর্ড পরীক্ষা',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-02-18T10:00:00Z',
    questions: [
      {
        id: 'db_m1',
        question: "কোনো ত্রিভুজের তিনটি কোণের অনুপাত 1 : 2 : 3 হলে বৃহত্তম কোণটির মান কত?",
        options: ['90°', '60°', '45°', '120°'],
        correctAnswer: '90°',
        correctAnswerIndex: 0,
        explanation: 'অনুপাতের যোগফল = 1 + 2 + 3 = 6। ত্রিভুজের তিন কোণের সমষ্টি 180°। বৃহত্তম কোণ = 180° × (3/6) = 90°।'
      },
      {
        id: 'db_m2',
        question: "একটি সামান্তরিকের ভূমি 12 সেমি ও উচ্চতা 8 সেমি হলে তার ক্ষেত্রফল কত?",
        options: ['96 বর্গ সেমি', '48 বর্গ সেমি', '192 বর্গ সেমি', '20 বর্গ সেমি'],
        correctAnswer: '96 বর্গ সেমি',
        correctAnswerIndex: 0,
        explanation: 'সামান্তরিকের ক্ষেত্রফল = ভূমি × উচ্চতা = 12 × 8 = 96 বর্গ সেমি।'
      },
      {
        id: 'db_m3',
        question: "যদি a + b = 5 এবং a - b = 3 হয়, তবে 4ab এর মান কত?",
        options: ['16', '24', '8', '34'],
        correctAnswer: '16',
        correctAnswerIndex: 0,
        explanation: '4ab = (a + b)² - (a - b)² = 5² - 3² = 25 - 9 = 16।'
      },
      {
        id: 'db_m4',
        question: "sec² θ - tan² θ এর মান কত?",
        options: ['1', '0', '-1', '2'],
        correctAnswer: '1',
        correctAnswerIndex: 0,
        explanation: 'ত্রিকোণমিতিক মৌলিক অভেদ অনুযায়ী sec² θ - tan² θ = 1।'
      },
      {
        id: 'db_m5',
        question: "1 থেকে 10 পর্যন্ত স্বাভাবিক সংখ্যার গড় কত?",
        options: ['5.5', '5', '6', '4.5'],
        correctAnswer: '5.5',
        correctAnswerIndex: 0,
        explanation: '1 থেকে 10 এর যোগফল = 10×11/2 = 55। গড় = 55/10 = 5.5।'
      }
    ]
  },
  {
    id: 'paper_chittagong_board_2024_10_bangla',
    institutionName: 'চট্টগ্রাম শিক্ষা বোর্ড (এসএসসি)',
    institutionType: 'board',
    districtOrBoard: 'চট্টগ্রাম',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি (এসএসসি)',
    subject: 'বাংলা ১ম পত্র',
    examType: 'এসএসসি বোর্ড পরীক্ষা',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-02-16T10:00:00Z',
    questions: [
      {
        id: 'cb_b1',
        question: "‘কপোতাক্ষ নদ’ কবিতার অষ্টকে (প্রথম আট লাইনে) কোন ভাবটি প্রকাশ পেয়েছে?",
        options: ['স্মৃতিকাতরতা ও নদের রূপবর্ণনা', 'দেশপ্রেমের জয়গান', 'বিদায়গাথা', 'ভবিষ্যতের আশা'],
        correctAnswer: 'স্মৃতিকাতরতা ও নদের রূপবর্ণনা',
        correctAnswerIndex: 0,
        explanation: 'সনেটের অষ্টকে ভাবের প্রবর্তন ও কপোতাক্ষের দুগ্ধস্রোতরূপী জলের স্মৃতিমন্থন রয়েছে।'
      },
      {
        id: 'cb_b2',
        question: "‘ঝর্ণার গান’ কবিতায় ঝর্ণা কার পায়ে সুরের নুপূর বাজিয়ে চলে?",
        options: ['পাহাড়ের ও নুড়ি পাথরের', 'মেঘের', 'বনদেবীর', 'হরিণের'],
        correctAnswer: 'পাহাড়ের ও নুড়ি পাথরের',
        correctAnswerIndex: 0,
        explanation: 'ঝর্ণা চপল পায়ে নুড়ি পাথরের গায়ে তান তুলে কলতান সৃষ্টি করে ঝরে পড়ে।'
      },
      {
        id: 'cb_b3',
        question: "'সুভা' গল্পে সুভার সবচেয়ে ঘনিষ্ঠ বোবা বন্ধু কারা ছিল?",
        options: ['সর্বশী ও পাঙ্গুলি নামের দুটি গাভী', 'বিড়াল ছানা', 'গোয়াল ঘরের কুকুর', 'প্রকৃতির পাখি'],
        correctAnswer: 'সর্বশী ও পাঙ্গুলি নামের দুটি গাভী',
        correctAnswerIndex: 0,
        explanation: 'সুভার অব্যক্ত হৃদয়ের ভাষা বুঝতে পারত কেবল সর্বশী ও পাঙ্গুলি গাভী দুটি।'
      }
    ]
  },
  {
    id: 'paper_mirzapur_cadet_2024_10_math',
    institutionName: 'মির্জাপুর ক্যাডেট কলেজ',
    institutionType: 'cadet',
    districtOrBoard: 'টাঙ্গাইল',
    year: '২০২৪',
    studentClass: '১০ম শ্রেণি',
    subject: 'সাধারণ গণিত',
    examType: 'নির্বাচনী পরীক্ষা / ক্যাডেট টেস্ট',
    durationMinutes: 30,
    totalMarks: 30,
    createdAt: '2024-11-28T10:00:00Z',
    questions: [
      {
        id: 'mc_m1',
        question: "বৃত্তের কেন্দ্র থেকে ব্যাস ভিন্ন কোনো জ্যা-এর ওপর অঙ্কিত লম্ব জ্যা-টিকে কী করে?",
        options: ['সমদ্বিখণ্ডিত করে', 'ত্রিখণ্ডিত করে', 'দ্বিগুণ করে', 'স্পর্শ করে'],
        correctAnswer: 'সমদ্বিখণ্ডিত করে',
        correctAnswerIndex: 0,
        explanation: 'জ্যামিতিক উপপাদ্য অনুযায়ী কেন্দ্র থেকে জ্যা-এর উপর লম্ব জ্যা-কে সমান দুই ভাগে বিভক্ত করে।'
      },
      {
        id: 'mc_m2',
        question: "একটি চাকার ব্যাসার্ধ 21 সেমি হলে একবার পূর্ণ ঘূর্ণনে চাকাটি কত দূরত্ব অতিক্রম করবে?",
        options: ['132 সেমি', '66 সেমি', '264 সেমি', '1386 সেমি'],
        correctAnswer: '132 সেমি',
        correctAnswerIndex: 0,
        explanation: 'এক ঘূর্ণনে দূরত্ব = পরিধি = 2πr = 2 × (22/7) × 21 = 132 সেমি।'
      },
      {
        id: 'mc_m3',
        question: "x + y = 6 এবং x - y = 4 হলে xy এর মান কত?",
        options: ['5', '10', '8', '12'],
        correctAnswer: '5',
        correctAnswerIndex: 0,
        explanation: 'xy = ((x+y)/2)² - ((x-y)/2)² = (6/2)² - (4/2)² = 3² - 2² = 9 - 4 = 5।'
      }
    ]
  }
];

// Load all papers (combining pre-seeded + locally added custom papers)
export function getStoredInstitutionPapers(): InstitutionPaper[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INSTITUTION_PAPERS));
      return INITIAL_INSTITUTION_PAPERS;
    }
    const parsed: InstitutionPaper[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INSTITUTION_PAPERS));
      return INITIAL_INSTITUTION_PAPERS;
    }

    // Merge: ensure all initial papers exist while keeping custom uploaded papers
    const mergedMap = new Map<string, InstitutionPaper>();
    INITIAL_INSTITUTION_PAPERS.forEach(p => mergedMap.set(p.id, p));
    parsed.forEach(p => mergedMap.set(p.id, p));

    return Array.from(mergedMap.values());
  } catch {
    return INITIAL_INSTITUTION_PAPERS;
  }
}

// Save one or multiple papers locally and trigger update event
export function saveInstitutionPapers(papers: InstitutionPaper[]): void {
  try {
    const current = getStoredInstitutionPapers();
    const map = new Map<string, InstitutionPaper>();
    current.forEach(p => map.set(p.id, p));
    papers.forEach(p => map.set(p.id, p));
    const merged = Array.from(map.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event('dapathshala_institution_papers_updated'));
  } catch (e) {
    console.error('Error saving institution papers:', e);
  }
}

// Delete paper
export function deleteInstitutionPaper(paperId: string): void {
  try {
    const current = getStoredInstitutionPapers();
    const filtered = current.filter(p => p.id !== paperId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('dapathshala_institution_papers_updated'));
  } catch (e) {
    console.error('Error deleting institution paper:', e);
  }
}

// Fetch papers from server API with local sync
export async function syncInstitutionPapersWithServer(): Promise<InstitutionPaper[]> {
  try {
    const res = await fetch('/api/institution-papers');
    if (res.ok) {
      const serverPapers: InstitutionPaper[] = await res.json();
      if (Array.isArray(serverPapers) && serverPapers.length > 0) {
        saveInstitutionPapers(serverPapers);
        return getStoredInstitutionPapers();
      }
    }
  } catch {}
  return getStoredInstitutionPapers();
}

// Send bulk papers to server
export async function pushBulkPapersToServer(papers: InstitutionPaper[]): Promise<boolean> {
  try {
    const res = await fetch('/api/institution-papers/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(papers)
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Intelligent Smart Parser for Bulk Soft-Copy Question Papers (Word/Text/PDF paste)
 * Parses blocks like:
 * ১. প্রশ্নটির শিরোনাম কী?
 * ক) অপশন ১   খ) অপশন ২   গ) অপশন ৩   ঘ) অপশন ৪
 * উত্তর: ক
 * ব্যাখ্যা: এটি সঠিক উত্তরের কারণ।
 */
export function parseRawTextToQuestions(rawText: string): ExamQuestion[] {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();
  const parsedQuestions: ExamQuestion[] = [];

  // Split into chunks by question numbers (e.g. "১.", "1.", "প্রশ্ন ১:", "Q1.")
  const splitRegex = /(?:^|\n+)(?:(?:প্রশ্ন\s*)?([০-৯\d]+)[\.\:\-\)]|\bQ\s*([০-৯\d]+)[\.\:\-\)])\s*/i;
  const rawBlocks = text.split(splitRegex);

  // If simple splitting didn't yield blocks, try newline-based splitting
  const blocksToProcess: string[] = [];
  if (rawBlocks.length > 2) {
    for (let i = 1; i < rawBlocks.length; i += 3) {
      const qNum = rawBlocks[i] || rawBlocks[i + 1] || `${Math.floor(i / 3) + 1}`;
      const content = rawBlocks[i + 2] || '';
      blocksToProcess.push(`প্রশ্ন ${qNum}: ${content}`);
    }
  } else {
    // Fallback: split by double newlines
    blocksToProcess.push(...text.split(/\n\s*\n+/).filter(b => b.trim().length > 10));
  }

  blocksToProcess.forEach((block, idx) => {
    const cleanBlock = block.trim();
    if (!cleanBlock) return;

    const lines = cleanBlock.split('\n').map(l => l.trim()).filter(Boolean);
    let questionText = lines[0] || '';
    // Strip leading question numbers from text
    questionText = questionText.replace(/^(?:প্রশ্ন\s*)?[০-৯\d]+[\.\:\-\)]\s*/i, '').trim();

    let options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    // Search for answer and explanation lines first
    lines.forEach(line => {
      const ansMatch = line.match(/(?:উত্তর|সঠিক উত্তর|উত্তরঃ|Ans|Answer)\s*[\:\-\=]?\s*([কখগঘabcd১২৩৪1234]|\S+)/i);
      if (ansMatch) {
        correctAnswer = ansMatch[1].trim();
      }
      const expMatch = line.match(/(?:ব্যাখ্যা|সমাধান|Explanation|Note)\s*[\:\-\=]?\s*(.+)/i);
      if (expMatch) {
        explanation = expMatch[1].trim();
      }
    });

    // Detect options in either single line "ক) ... খ) ... গ) ... ঘ) ..." or separate lines
    const optionMatches = cleanBlock.matchAll(/(?:[কখগঘabcd]|\([কখগঘabcd]\)|[১-৪]\.|\([১-৪]\))\s*([^\n\rকখগঘabcd\(\)]+)/gi);
    for (const match of optionMatches) {
      const optText = match[1]?.trim()
        ?.replace(/^(?:উত্তর|ব্যাখ্যা|Ans|Explanation).*$/i, '')
        ?.trim();
      if (optText && optText.length > 0 && !options.includes(optText)) {
        options.push(optText);
      }
    }

    // If regex match didn't catch 4 options, look for lines starting with ক/খ/গ/ঘ or A/B/C/D
    if (options.length < 4) {
      options = [];
      lines.forEach(l => {
        if (/^[কখগঘabcd\(\)1-4১২৩৪]/i.test(l) && !/(?:উত্তর|Ans|ব্যাখ্যা)/i.test(l)) {
          const cleanedOpt = l.replace(/^[কখগঘabcd\(\)1-4১২৩৪\.\-\)]+\s*/i, '').trim();
          if (cleanedOpt) options.push(cleanedOpt);
        }
      });
    }

    // Ensure we have at least 4 options, pad if necessary
    while (options.length < 4) {
      options.push(`বিকল্প ${options.length + 1}`);
    }
    options = options.slice(0, 4);

    // Resolve correctAnswer to match the exact option string
    let matchedOption = options[0];
    const letter = correctAnswer.toLowerCase().trim();
    if (letter === 'ক' || letter === 'a' || letter === '১' || letter === '1') {
      matchedOption = options[0];
    } else if (letter === 'খ' || letter === 'b' || letter === '২' || letter === '2') {
      matchedOption = options[1];
    } else if (letter === 'গ' || letter === 'c' || letter === '৩' || letter === '3') {
      matchedOption = options[2];
    } else if (letter === 'ঘ' || letter === 'd' || letter === '৪' || letter === '4') {
      matchedOption = options[3];
    } else {
      const found = options.find(o => o.toLowerCase().includes(letter) || letter.includes(o.toLowerCase()));
      if (found) matchedOption = found;
    }

    const correctIdx = options.indexOf(matchedOption);

    parsedQuestions.push({
      id: `parsed_q_${Date.now()}_${idx + 1}`,
      question: questionText || `প্রশ্ন ${idx + 1}`,
      options,
      correctAnswer: matchedOption,
      correctAnswerIndex: correctIdx !== -1 ? correctIdx : 0,
      explanation: explanation || 'পাঠ্যবই ও প্রশ্নপত্রের নির্দেশিকা অনুসারে নির্ধারিত।'
    });
  });

  return parsedQuestions;
}
