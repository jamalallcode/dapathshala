import { ExamQuestion, CompetitiveExamSeed, ExamTrack } from '../types';
import { shuffleQuestionOptions } from './curriculumQuestions';

export interface CompetitiveTopic {
  id: string;
  name: string;
  track: ExamTrack;
  questions: ExamQuestion[];
}

export const COMPETITIVE_QUESTION_BANK: ExamQuestion[] = [
  // =========================================================================
  // ১. বিসিএস (BCS) - বাংলা সাহিত্য ও ভাষা
  // =========================================================================
  {
    id: 'bcs_q_01',
    question: "চর্যাপদের সবচেয়ে বেশি পদ কে রচনা করেছেন?",
    options: ['লুইপা', 'কাহ্নপা', 'ভুসুকুপা', 'শবরপা'],
    correctAnswer: 'কাহ্নপা',
    explanation: 'চর্যাপদের মোট পদগুলোর মধ্যে কাহ্নপা সর্বোচ্চ ১৩টি পদ রচনা করেন (যদিও ২৪ নম্বর পদটি খণ্ডিত)।',
    solutions: [
      'পদ্ধতি ১ (পাঠ্যবই ও তথ্যভিত্তিক): চর্যাপদ হরপ্রসাদ শাস্ত্রী ১৯০৭ সালে নেপালের রাজদরবার থেকে উদ্ধার করেন। এতে কাহ্নপা সর্বোচ্চ ১৩টি পদ রচনা করেন, ভুসুকুপা ৮টি এবং সরহপা ৪টি পদ রচনা করেন।',
      'পদ্ধতি ২ (বিসিএস স্মৃতি টেকনিক): চর্যাপদে পদ রচনার শীর্ষে "কাহ্নপা" (১৩টি)। মনে রাখুন: কাহ্নপা = তেরো (১৩)। দ্বিতীয় স্থানে ভুসুকুপা (৮টি)।'
    ],
    track: 'bcs',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    topic: 'প্রাচীন ও মধ্যযুগ',
    examSource: '৪৪তম বিসিএস প্রিলিমিনারি',
    year: 2022,
    negativeMarkValue: 0.50
  },
  {
    id: 'bcs_q_02',
    question: "কোনটি রবীন্দ্রনাথ ঠাকুরের রচিত নাটক নয়?",
    options: ['রক্তকরবী', 'ডাকঘর', 'রাজা ও রাণী', 'কৃষ্ণকুমারী'],
    correctAnswer: 'কৃষ্ণকুমারী',
    explanation: "'কৃষ্ণকুমারী' মাইকেল মধুসূদন দত্তের রচিত বাংলা সাহিত্যের প্রথম সার্থক ট্র্যাজেডি নাটক (১৮৬১)।",
    solutions: [
      'পদ্ধতি ১ (সাহিত্য পর্যালোচনা): রবীন্দ্রনাথ ঠাকুরের বিখ্যাত নাটক রক্তকরবী (১৯২৬), ডাকঘর (১৯১২), রাজা ও রাণী (১৮৮৯)। অপরদিকে "কৃষ্ণকুমারী" নাটকটি ১৮৬১ সালে মাইকেল মধুসূদন দত্ত রচনা করেন।',
      'পদ্ধতি ২ (বিকল্প বাদ দেওয়ার শর্টকাট): অপশনগুলো পর্যবেক্ষণ করুন। কৃষ্ণকুমারী মাইকেলের প্রথম ট্র্যাজেডি হিসেবে অতি পরিচিত তথ্য, তাই এটি রবীন্দ্রনাথের নয়।'
    ],
    track: 'bcs',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    topic: 'আধুনিক যুগ',
    examSource: '৪৩তম বিসিএস প্রিলিমিনারি',
    year: 2021,
    negativeMarkValue: 0.50
  },
  {
    id: 'bcs_q_03',
    question: "'প্রত্যুষ' শব্দের সঠিক সন্ধি বিচ্ছেদ কোনটি?",
    options: ['প্রতি + উষ', 'প্রতি + ঊষ', 'প্র + ত্যুষ', 'প্রত্যু + ষ'],
    correctAnswer: 'প্রতি + ঊষ',
    explanation: 'ই/ঈ-কার এর পর হ্রস্ব উ বা দীর্ঘ ঊ থাকলে য-ফলা এবং দীর্ঘ-ঊ কার হয় (প্রতি + ঊষ = প্রত্যুষ)। এখানে ঊ দীর্ঘস্বর।',
    solutions: [
      'পদ্ধতি ১ (ব্যাকরণ সূত্র): য-ফলা নিয়মে ই + ঊ = যূ হয়। ঊষ শব্দে দীর্ঘ-ঊ (ঊষ = প্রত্যূষ/ভোরবেলা)। সুতরাং প্রতি + ঊষ = প্রত্যুষ।',
      'পদ্ধতি ২ (বানান সতর্কতা ট্রিক): অধিকাংশ শিক্ষার্থী ভুল করে হ্রস্ব "উষ" দাগায়। মনে রাখবেন "ঊষা" বা "ঊষ" সবসময় দীর্ঘ ঊ দিয়ে শুরু হয়।'
    ],
    track: 'bcs',
    subject: 'বাংলা ভাষা ও সাহিত্য',
    topic: 'বাংলা ব্যাকরণ',
    examSource: '৪৫তম বিসিএস প্রিলিমিনারি',
    year: 2023,
    negativeMarkValue: 0.50
  },

  // =========================================================================
  // ২. বিসিএস - বাংলাদেশ বিষয়াবলী (সংবিধান ও মুক্তিযুদ্ধ)
  // =========================================================================
  {
    id: 'bcs_q_04',
    question: "বাংলাদেশ সংবিধানের কোন অনুচ্ছেদে 'মৌলিক অধিকার বলবৎকরণ' সম্পর্কিত বিধান রয়েছে?",
    options: ['৪৪ অনুচ্ছেদ', '১০২ অনুচ্ছেদ', '২৭ অনুচ্ছেদ', '৭ অনুচ্ছেদ'],
    correctAnswer: '৪৪ অনুচ্ছেদ',
    explanation: 'সংবিধানের ৩য় ভাগে মৌলিক অধিকারের ৪৪ নং অনুচ্ছেদে সুপ্রিম কোর্টের ১০২ অনুচ্ছেদ অনুযায়ী মৌলিক অধিকার বলবৎ করার নিশ্চয়তা দেওয়া হয়েছে।',
    solutions: [
      'পদ্ধতি ১ (সংবিধান মূল ধারা): সংবিধানের ৪৪(১) অনুচ্ছেদ অনুসারে সংবিধানের ৩য় ভাগে প্রদত্ত যেকোনো অধিকার বলবৎ করার জন্য সুপ্রিম কোর্টে রিট করার অধিকারের নিশ্চয়তা দেওয়া হয়েছে ১০২ অনুচ্ছেদের আওতায়।',
      'পদ্ধতি ২ (বিসিএস প্রশ্ন কৌশল): ৪৪ অনুচ্ছেদ হলো মৌলিক অধিকারের "চাবি" (বলবৎকরণের নিশ্চয়তা), আর ১০২ অনুচ্ছেদ হলো হাইকোর্ট বিভাগের রিট এখতিয়ার।'
    ],
    track: 'bcs',
    subject: 'বাংলাদেশ বিষয়াবলী',
    topic: 'সংবিধান',
    examSource: '৪১তম বিসিএস প্রিলিমিনারি',
    year: 2021,
    negativeMarkValue: 0.50
  },
  {
    id: 'bcs_q_05',
    question: "১৯৭১ সালের মুক্তিযুদ্ধে মুজিবনগর সরকারের রাষ্ট্রপতি কে ছিলেন?",
    options: ['বঙ্গবন্ধু শেখ মুজিবুর রহমান', 'সৈয়দ নজরুল ইসলাম', 'তাজউদ্দীন আহমদ', 'খন্দকার মোশতাক আহমদ'],
    correctAnswer: 'বঙ্গবন্ধু শেখ মুজিবুর রহমান',
    explanation: '১৯৭১ সালের ১০ এপ্রিল গঠিত ও ১৭ এপ্রিল শপথ গ্রহণকারী মুজিবনগর সরকারের রাষ্ট্রপতি ছিলেন বঙ্গবন্ধু শেখ মুজিবুর রহমান এবং সৈয়দ নজরুল ইসলাম ছিলেন উপ-রাষ্ট্রপতি ও অস্থায়ী রাষ্ট্রপতি।',
    solutions: [
      'পদ্ধতি ১ (আইনগত পদবী): ১০ এপ্রিলের স্বাধীনতার ঘোষণাপত্র অনুসারে গণপ্রজাতন্ত্রী বাংলাদেশের রাষ্ট্রপতি নির্বাচিত হন বঙ্গবন্ধু শেখ মুজিবুর রহমান। বঙ্গবন্ধুর অনুপস্থিতিতে উপ-রাষ্ট্রপতি সৈয়দ নজরুল ইসলাম অস্থায়ী রাষ্ট্রপতির দায়িত্ব পালন করেন।',
      'পদ্ধতি ২ (পরীক্ষার কনফিউশন সমাধান): প্রশ্নে যদি "অস্থায়ী রাষ্ট্রপতি" বলত তবে উত্তর হতো সৈয়দ নজরুল ইসলাম; কিন্তু সরাসরি "রাষ্ট্রপতি" চাইলে উত্তর অবশ্যই বঙ্গবন্ধু শেখ মুজিবুর রহমান।'
    ],
    track: 'bcs',
    subject: 'বাংলাদেশ বিষয়াবলী',
    topic: 'মুক্তিযুদ্ধ ও স্বাধীনতা',
    examSource: '৪০তম বিসিএস প্রিলিমিনারি',
    year: 2019,
    negativeMarkValue: 0.50
  },

  // =========================================================================
  // ৩. বিসিএস - গাণিতিক যুক্তি ও মানসিক দক্ষতা
  // =========================================================================
  {
    id: 'bcs_q_06',
    question: "একটি সমকোণী ত্রিভুজের অতিভুজ ১৩ সেমি এবং ভূমি ১২ সেমি হলে, ত্রিভুজটির ক্ষেত্রফল কত বর্গ সেমি?",
    options: ['৩০', '৬০', '৭৮', '৬৫'],
    correctAnswer: '৩০',
    explanation: 'পিথাগোরাসের সূত্রানুযায়ী লম্ব = √(১৩² - ১২²) = √(১৬৯ - ১৪৪) = √২৫ = ৫ সেমি। ক্ষেত্রফল = ১/২ × ভূমি × লম্ব = ১/২ × ১২ × ৫ = ৩০ বর্গ সেমি।',
    solutions: [
      'পদ্ধতি ১ (পিথাগোরাস ও জ্যামিতি সূত্র): লম্ব h = √(c² - b²) = √(169 - 144) = 5 সেমি। ক্ষেত্রফল A = 1/2 × base × height = 1/2 × 12 × 5 = 30 বর্গ সেমি।',
      'পদ্ধতি ২ (পিথাগোরিয়ান ট্রিপলেট শর্টকাট): সমকোণী ত্রিভুজের বহুল প্রচলিত ট্রিপলেট হলো (৫, ১২, ১৩)। অতিভুজ ১৩ ও ভূমি ১২ জানা থাকলে লম্ব সাথে সাথে ৫। মুখে মুখে: (১২ × ৫) ÷ ২ = ৩০।'
    ],
    track: 'bcs',
    subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    topic: 'জ্যামিতি ও ক্ষেত্রফল',
    examSource: '৪৪তম বিসিএস প্রিলিমিনারি',
    year: 2022,
    negativeMarkValue: 0.50
  },
  {
    id: 'bcs_q_07',
    question: "যদি ৩^(x - 1) = ৮১ হয়, তবে x এর মান কত?",
    options: ['৫', '৪', '৩', '৬'],
    correctAnswer: '৫',
    explanation: '৮১ = ৩⁴। সুতরাং ৩^(x - 1) = ৩⁴ => x - 1 = 4 => x = 5।',
    solutions: [
      'পদ্ধতি ১ (সূচক সমাধান): ৩^(x - 1) = ৮১ = ৩⁴। উভয়পক্ষের ভিত্তি (Base) ৩ সমান হওয়ায় ঘাত সমান হবে: x - 1 = 4 => x = 4 + 1 = 5।',
      'পদ্ধতি ২ (অপশন টেস্ট শর্টকাট): অপশন থেকে মান বসান: x = 5 হলে ৩^(5 - 1) = ৩⁴ = 81। মিলে গেল!'
    ],
    track: 'bcs',
    subject: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    topic: 'বীজগণিত ও সূচক',
    examSource: '৪৫তম বিসিএস প্রিলিমিনারি',
    year: 2023,
    negativeMarkValue: 0.50
  },

  // =========================================================================
  // ৪. মেডিকেল ভর্তি পরীক্ষা (Medical & Dental Admission)
  // =========================================================================
  {
    id: 'med_q_01',
    question: "মানবদেহের রক্তে স্বাভাবিক হিমোগ্লোবিনের পরিমাণ কত?",
    options: ['১২-১৬ গ্রাম/ডেসিলিটার', '৮-১০ গ্রাম/ডেসিলিটার', '১৮-২২ গ্রাম/ডেসিলিটার', '৪-৬ গ্রাম/ডেসিলিটার'],
    correctAnswer: '১২-১৬ গ্রাম/ডেসিলিটার',
    explanation: 'প্রাপ্তবয়স্ক মানবদেহে রক্তে হিমোগ্লোবিনের গড় স্বাভাবিক মাত্রা ১২ থেকে ১৬ গ্রাম/ডেসিলিটার (পুরুষে প্রায় ১৪-১৮ এবং নারীতে ১২-১৬ g/dL)।',
    solutions: [
      'পদ্ধতি ১ (মেডিক্যাল ফিজিওলজি স্ট্যান্ডার্ড): রক্তে হিমোগ্লোবিনের সাধারণ রেফারেন্স রেঞ্জ নারীদের ক্ষেত্রে ১২.০–১৫.৫ g/dL এবং পুরুষদের ক্ষেত্রে ১৩.৫–১৭.৫ g/dL। সামগ্রিক গড় রেঞ্জ ১২–১৬ g/dL।',
      'পদ্ধতি ২ (মেডিকেল এমসিকিউ এলিমিনেশন): ৮-১০ হলে মারাত্মক রক্তস্বল্পতা (Anemia) নির্দেশ করে, আর ১৮-২২ পলিসাইথিমিয়া। তাই স্বাভাবিক উত্তর ১২-১৬।'
    ],
    track: 'medical',
    subject: 'জীববিজ্ঞান (প্রাণিবিজ্ঞান)',
    topic: 'রক্ত ও রক্ত সংবহন',
    examSource: 'মেডিকেল ভর্তি পরীক্ষা ২০২৪-২৫',
    year: 2024,
    negativeMarkValue: 0.25
  },
  {
    id: 'med_q_02',
    question: "উদ্ভিদকোষের কোন অঙ্গাণুকে 'কোষের রান্নাঘর' বলা হয়?",
    options: ['মাইটোকন্ড্রিয়া', 'ক্লোরোপ্লাস্ট', 'গলগি বডি', 'রাইবোজোম'],
    correctAnswer: 'ক্লোরোপ্লাস্ট',
    explanation: 'ক্লোরোপ্লাস্টে সালোকসংশ্লেষণ প্রক্রিয়ায় সূর্যালোক ও ক্লোরোফিলের সাহায্যে খাদ্য তৈরি হয় বলে একে কোষের রান্নাঘর বা Food Factory বলা হয়।',
    solutions: [
      'পদ্ধতি ১ (কোষতত্ত্বীয় সংজ্ঞা): মাইটোকন্ড্রিয়া হলো পাওয়ার হাউস (শক্তিঘর), রাইবোজোম প্রোটিন ফ্যাক্টরি, গলগি বস্তু ট্রাফিক পুলিশ এবং ক্লোরোপ্লাস্টে স্ট্রোমা ও গ্রানাতে শর্করা খাদ্য তৈরি হয় বলে একে রান্নাঘর বলে।',
      'পদ্ধতি ২ (মেমরি নেমোনিক): খাদ্য রান্না = গ্রিন কিচেন = ক্লোরোফিল যুক্ত ক্লোরোপ্লাস্ট।'
    ],
    track: 'medical',
    subject: 'জীববিজ্ঞান (উদ্ভিদবিজ্ঞান)',
    topic: 'কোষ ও কোষীয় অঙ্গাণু',
    examSource: 'মেডিকেল ভর্তি পরীক্ষা ২০২৩-২৪',
    year: 2023,
    negativeMarkValue: 0.25
  },
  {
    id: 'med_q_03',
    question: "কোন রশ্মির ভেদন ক্ষমতা (Penetrating Power) সবচেয়ে বেশি?",
    options: ['আলফা (α) রশ্মি', 'বিটা (β) রশ্মি', 'গামা (γ) রশ্মি', 'ক্যাথোড রশ্মি'],
    correctAnswer: 'গামা (γ) রশ্মি',
    explanation: 'গামা রশ্মি উচ্চ শক্তির তড়িচ্চৌম্বকীয় তরঙ্গ, যার কোনো ভর ও আধান নেই। ফলে এর ভেদন ক্ষমতা আলফা ও বিটা রশ্মির চেয়ে বহুগুণ বেশি।',
    solutions: [
      'পদ্ধতি ১ (পরমাণু ও নিউক্লিয়ার পদার্থবিজ্ঞান): ভেদন ক্ষমতার ক্রম: γ > β > α। আলফা ভারী হিলিয়াম নিউক্লিয়াস হওয়ায় সামান্য কাগজের স্তূপেই থেমে যায়; গামা রশ্মি রোধ করতে পুরু সীসার পাতের প্রয়োজন হয়।',
      'পদ্ধতি ২ (শর্টকাট নিয়ম): ভর যত কম ও বেগ যত আলোর সমান, ভেদন ক্ষমতা তত বেশি। গামা ফোটন কণা হওয়ায় সর্বোচ্চ ভেদনশীল।'
    ],
    track: 'medical',
    subject: 'পদার্থবিজ্ঞান',
    topic: 'পরমাণু মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান',
    examSource: 'মেডিকেল ভর্তি পরীক্ষা ২০২২-২৩',
    year: 2022,
    negativeMarkValue: 0.25
  },
  {
    id: 'med_q_04',
    question: "মানুষের চোখের রেটিনার কোন কোষ বর্ণ ও উজ্জ্বল আলোতে দর্শনে সহায়তা করে?",
    options: ['রড কোষ', 'কোন কোষ', 'দ্বিমেরু নিউরন', 'গ্যাংলিয়ন কোষ'],
    correctAnswer: 'কোন কোষ',
    explanation: 'রেটিনার কোণ (Cone) কোষ উজ্জ্বল আলো এবং রঙিন বস্তু দেখতে সাহায্য করে (Color vision), আর রড কোষ মৃদু আলোতে দেখার কাজে লাগে।',
    solutions: [
      'পদ্ধতি ১ (চোখের শারীরস্থান): রেটিনায় প্রায় ১২ কোটি রড এবং ৬০-৭০ লাখ কোণ কোষ থাকে। কোণ কোষে আয়োডোপসিন থাকে যা আলো ও বর্ণের জন্য সংবেদনশীল।',
      'পদ্ধতি ২ (ইংলিশ নেমোনিক ট্রিক): Cone = Color (উভয়ই C দিয়ে শুরু)। Rod = Night / Dim light (মৃদু আলো)।'
    ],
    track: 'medical',
    subject: 'জীববিজ্ঞান (প্রাণিবিজ্ঞান)',
    topic: 'মানব শারীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ',
    examSource: 'মেডিকেল ভর্তি পরীক্ষা ২০২৩-২৪',
    year: 2023,
    negativeMarkValue: 0.25
  },

  // =========================================================================
  // ৫. বিশ্ববিদ্যালয় ভর্তি পরীক্ষা (Dhaka University & Engineering / GST)
  // =========================================================================
  {
    id: 'var_q_01',
    question: "lim(x→0) (sin 5x / x) এর মান কত?",
    options: ['১', '৫', '০', 'অসংজ্ঞায়িত'],
    correctAnswer: '৫',
    explanation: 'আমরা জানি lim(θ→0) (sin θ / θ) = 1। সুতরাং lim(x→0) 5 × (sin 5x / 5x) = 5 × 1 = 5।',
    solutions: [
      'পদ্ধতি ১ (ক্যালকুলাস মৌলিক সূত্র): lim(x→0) [sin(5x) / x] = lim(x→0) 5 × [sin(5x) / (5x)] = 5 × 1 = 5।',
      'পদ্ধতি ২ (ল’ হসপিটাল রুল শর্টকাট): 0/0 আকার হওয়ায় লব ও হরের অন্তরীকরণ করি: d/dx(sin 5x) = 5 cos 5x; d/dx(x) = 1। x=0 বসালে 5 cos(0) / 1 = 5 × 1 = 5।'
    ],
    track: 'varsity',
    subject: 'উচ্চতর গণিত',
    topic: 'অন্তরীকরণ ও লিমিট',
    examSource: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট ২০২৩-২৪',
    year: 2023,
    negativeMarkValue: 0.25
  },
  {
    id: 'var_q_02',
    question: "একটি ভেক্টর A = 2i + 3j - k এবং B = i - 2j + 3k হলে তাদের ডট গুণন (A · B) কত?",
    options: ['-৭', '৭', '১১', '০'],
    correctAnswer: '-৭',
    explanation: 'A · B = AxBx + AyBy + AzBz = (2)(1) + (3)(-2) + (-1)(3) = 2 - 6 - 3 = -7।',
    solutions: [
      'পদ্ধতি ১ (ভেক্টর ডট গুণন সূত্র): A · B = axbx + ayby + azbz = 2(1) + 3(-2) + (-1)(3) = 2 - 6 - 3 = -7।',
      'পদ্ধতি ২ (মানসিক হিসাব কৌশল): সহগগুলো গুণ করে যোগ করুন: 2 - 6 = -4; তারপর -4 - 3 = -7। মাত্র ৩ সেকেন্ডে সমাধান!'
    ],
    track: 'varsity',
    subject: 'পদার্থবিজ্ঞান',
    topic: 'ভেক্টর',
    examSource: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট ২০২২-২৩',
    year: 2022,
    negativeMarkValue: 0.25
  },
  {
    id: 'var_q_03',
    question: "কোন মৌলের ইলেকট্রন বিন্যাসে হুন্ডের নিয়মের ব্যতিক্রম দেখা যায়?",
    options: ['সোডিয়াম (Na)', 'ক্রোমিয়াম (Cr)', 'কার্বন (C)', 'ম্যাগনেসিয়াম (Mg)'],
    correctAnswer: 'ক্রোমিয়াম (Cr)',
    explanation: 'ক্রোমিয়ামের (Z=24) স্বাভাবিক হওয়ার কথা ছিল [Ar] 3d⁴ 4s², কিন্তু অর্ধপূর্ণ d-অরবিটালের অধিক স্থিতিশীলতার জন্য তা হয় [Ar] 3d⁵ 4s¹।',
    solutions: [
      'পদ্ধতি ১ (কোয়ান্টাম রসায়ন তত্ত্ব): অর্ধপূর্ণ (d⁵) বা সম্পূর্ণ পূর্ণ (d¹⁰) অরবিটালের প্রতিসম বণ্টন ও বিনিময় শক্তির কারণে অধিক স্থায়িত্ব পায়। তাই ক্রোমিয়াম (২৪) ও কপার (২৯) এ ব্যতিক্রম ঘটে।',
      'পদ্ধতি ২ (ভর্তি পরীক্ষার হটস্পট তালিকা): ব্যতিক্রমী বিন্যাস বললেই মনে রাখবেন ২৪ নম্বর ক্রোমিয়াম (Cr) এবং ২৯ নম্বর কপার (Cu)। অপশনে Cr উপস্থিত।'
    ],
    track: 'varsity',
    subject: 'রসায়ন',
    topic: 'পরমাণুর গঠন ও পর্যায়বৃত্ত ধর্ম',
    examSource: 'বুয়েট ও ঢাবি প্রিলিমিনারি ভর্তি',
    year: 2023,
    negativeMarkValue: 0.25
  },
  {
    id: 'eng_q_01',
    question: "যদি f(x) = x³ - 3x² + 4 হয়, তবে f'(x) = 0 হলে x এর মান কত?",
    options: ['০ এবং ২', '১ এবং ৩', '-১ এবং ২', '০ এবং ৩'],
    correctAnswer: '০ এবং ২',
    explanation: "f'(x) = 3x² - 6x = 0 => 3x(x - 2) = 0 => x = 0 অথবা x = 2।",
    solutions: [
      'পদ্ধতি ১ (ক্যালকুলাস গুরুমান ও লঘুমান ধাপ): d/dx(x³ - 3x² + 4) = 3x² - 6x। শর্তানুসারে 3x² - 6x = 0 => 3x(x - 2) = 0 => x = 0, 2।',
      'পদ্ধতি ২ (ফ্যাক্টরাইজেশন শর্টকাট): 3x কমন নিলে ভেতর থাকে x - 2। সুতরাং মূল দুটি হলো 0 এবং +2।'
    ],
    track: 'engineering',
    subject: 'উচ্চতর গণিত',
    topic: 'ক্যালকুলাস ও ঢাল',
    examSource: 'বুয়েট ভর্তি পরীক্ষা ২০২২-২৩',
    year: 2022,
    negativeMarkValue: 0.25
  }
];

// Presets for Curated Mock Exams
export const COMPETITIVE_EXAM_PRESETS: CompetitiveExamSeed[] = [
  {
    id: 'bcs_mock_46',
    title: '৪৬তম বিসিএস প্রিলিমিনারি স্পেশাল মডেল টেস্ট',
    track: 'bcs',
    trackLabel: 'বিসিএস প্রিলিমিনারি',
    badge: 'বিসিএস ২০২৪',
    subject: 'সার্বিক সিলেবাস (বাংলা, বাংলাদেশ, আন্তর্জাতিক, গণিত, বিজ্ঞান)',
    year: 2024,
    questionCount: 10,
    durationMinutes: 12,
    negativeMark: 0.50,
    description: 'পিএসসির সর্বশেষ সিলেবাস ও মানবন্টন অনুযায়ী আসল বিসিএস প্রশ্নের আলোকে তৈরি সেলফ-টেস্ট। নেগেটিভ মার্কিং -০.৫০।',
    questions: COMPETITIVE_QUESTION_BANK.filter(q => q.track === 'bcs')
  },
  {
    id: 'bcs_45th_past',
    title: '৪৫তম বিসিএস প্রিলিমিনারি - বিগত সালের প্রশ্ন ও সমাধান',
    track: 'bcs',
    trackLabel: 'বিসিএস বিগত সাল',
    badge: 'আসল প্রশ্ন ২০২৩',
    subject: '৪৫তম বিসিএস পিএসসি মূল প্রশ্নপত্র',
    year: 2023,
    questionCount: 8,
    durationMinutes: 10,
    negativeMark: 0.50,
    description: 'বিগত ৪৫তম বিসিএস প্রিলির আসল প্রশ্নপত্র। প্রতিটি প্রশ্নের সাথে ২টি সহজ ব্যাখ্যামূলক সমাধান সংযুক্ত।',
    questions: COMPETITIVE_QUESTION_BANK.filter(q => q.track === 'bcs' && q.examSource?.includes('৪৫তম'))
  },
  {
    id: 'med_mock_2025',
    title: 'মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষা ২০২৪-২৫ স্পেশাল মডেল টেস্ট',
    track: 'medical',
    trackLabel: 'মেডিকেল ভর্তি (MBBS/BDS)',
    badge: 'মেডিকেল ২০২৫',
    subject: 'জীববিজ্ঞান, পদার্থবিজ্ঞান ও রসায়ন',
    year: 2025,
    questionCount: 10,
    durationMinutes: 10,
    negativeMark: 0.25,
    description: 'স্বাস্থ্য শিক্ষা অধিদপ্তর কর্তৃক প্রণীত মানদণ্ড অনুসারে জীববিজ্ঞান ও বিজ্ঞানভিত্তিক নিবিড় মূল্যায়ন। নেগেটিভ মার্কিং -০.২৫।',
    questions: COMPETITIVE_QUESTION_BANK.filter(q => q.track === 'medical')
  },
  {
    id: 'du_ka_unit_mock',
    title: 'ঢাকা বিশ্ববিদ্যালয় ‘ক’ ইউনিট বিজ্ঞান ভর্তি মডেল টেস্ট',
    track: 'varsity',
    trackLabel: 'বিশ্ববিদ্যালয় ভর্তি',
    badge: 'ঢাবি ‘ক’ ইউনিট',
    subject: 'পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিত',
    year: 2024,
    questionCount: 8,
    durationMinutes: 10,
    negativeMark: 0.25,
    description: 'ঢাকা বিশ্ববিদ্যালয়ের বিগত বছরের প্রশ্ন ধাঁচ ও সময় সীমাবদ্ধতার ভিত্তিতে প্রস্তুতকৃত স্পেশাল টেস্ট।',
    questions: COMPETITIVE_QUESTION_BANK.filter(q => q.track === 'varsity')
  },
  {
    id: 'buet_preli_mock',
    title: 'ইঞ্জিনিয়ারিং প্রিলিমিনারি স্পেশাল টেস্ট (বুয়েট ও গুচ্ছ)',
    track: 'engineering',
    trackLabel: 'ইঞ্জিনিয়ারিং ভর্তি',
    badge: 'বুয়েট ও সিকেয়েট',
    subject: 'উচ্চতর গণিত ও পদার্থবিজ্ঞান',
    year: 2024,
    questionCount: 6,
    durationMinutes: 8,
    negativeMark: 0.25,
    description: 'ক্যালকুলাস, ভেক্টর ও মেকানিক্সের উচ্চতর দক্ষতাভিত্তিক প্রশ্নাবলি। সমাধান সহ রিয়েল প্র্যাকটিস।',
    questions: COMPETITIVE_QUESTION_BANK.filter(q => q.track === 'engineering' || q.track === 'varsity')
  }
];

// Helper to generate customized test in 1 click
export function generateCompetitiveTestInOneClick(options: {
  track: ExamTrack;
  subject?: string;
  questionCount: number;
  durationMinutes?: number;
  title?: string;
}): {
  title: string;
  track: ExamTrack;
  subject: string;
  chapter: string;
  durationMinutes: number;
  negativeMarking: number;
  questions: ExamQuestion[];
} {
  const { track, subject, questionCount, durationMinutes, title } = options;
  
  // Filter available bank
  let candidates = COMPETITIVE_QUESTION_BANK.filter(q => {
    if (track && q.track !== track) return false;
    if (subject && subject !== 'সকল বিষয়' && q.subject !== subject) return false;
    return true;
  });

  // If candidate count is less, borrow from adjacent tracks
  if (candidates.length === 0) {
    candidates = COMPETITIVE_QUESTION_BANK;
  }

  // Shuffle and pick
  const shuffledPool = [...candidates].sort(() => Math.random() - 0.5);
  const selectedRaw = shuffledPool.slice(0, Math.min(questionCount, shuffledPool.length));

  // If still need more, duplicate with option reshuffle
  while (selectedRaw.length < questionCount) {
    const pick = candidates[Math.floor(Math.random() * candidates.length)] || COMPETITIVE_QUESTION_BANK[0];
    selectedRaw.push({
      ...pick,
      id: `${pick.id}_dup_${Math.random().toString(36).substring(2, 6)}`
    });
  }

  // Naturally shuffle options so correct answers distribute evenly across ক, খ, গ, ঘ
  const questions: ExamQuestion[] = selectedRaw.map((q, idx) => {
    const { shuffledOptions, correctIndex } = shuffleQuestionOptions(q.options, q.correctAnswer);
    return {
      id: `q_${Date.now()}_${idx}`,
      question: q.question,
      options: shuffledOptions,
      correctAnswer: q.correctAnswer,
      correctAnswerIndex: correctIndex,
      explanation: q.explanation,
      solutions: q.solutions || [
        `পদ্ধতি ১: ${q.explanation}`,
        `পদ্ধতি ২: বিকল্প পরীক্ষা ও তথ্য বিশ্লেষণ পদ্ধতি।`
      ],
      track: q.track || track,
      subject: q.subject,
      topic: q.topic,
      examSource: q.examSource,
      year: q.year,
      negativeMarkValue: track === 'bcs' ? 0.50 : 0.25
    };
  });

  const trackLabels: Record<ExamTrack, string> = {
    academic: 'একাডেমিক',
    bcs: 'বিসিএস প্রিলিমিনারি',
    medical: 'মেডিকেল ভর্তি',
    varsity: 'বিশ্ববিদ্যালয় ভর্তি',
    engineering: 'প্রকৌশল ভর্তি'
  };

  const finalTitle = title || `${trackLabels[track]} - ১ ক্লিকে তৈরি মডেল টেস্ট (${questions.length}টি প্রশ্ন)`;
  const negMark = track === 'bcs' ? 0.50 : 0.25;
  const calcDuration = durationMinutes || Math.max(5, Math.ceil(questions.length * (track === 'bcs' ? 0.6 : 0.8)));

  return {
    title: finalTitle,
    track,
    subject: subject || 'সার্বিক প্রস্তুতি',
    chapter: 'পূর্ণাঙ্গ মূল্যায়ন',
    durationMinutes: calcDuration,
    negativeMarking: negMark,
    questions
  };
}
