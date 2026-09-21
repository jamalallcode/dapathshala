// Comprehensive NCTB Curriculum mapping for Class 1 to Class 10 (SSC)
// Structured for seamless multi-class, multi-subject, and multi-chapter question generation

export interface ClassSubjectMeta {
  classLevel: string;
  gradeNumber: number;
  label: string;
  group?: 'primary' | 'junior' | 'secondary';
  subjects: {
    name: string;
    icon: string;
    bookTitle: string;
    chapters: string[];
  }[];
}

export const NCTB_CLASS_SYLLABUS: ClassSubjectMeta[] = [
  // ================= 1st to 5th Class (Primary) =================
  {
    classLevel: '১ম শ্রেণি',
    gradeNumber: 1,
    label: '১ম শ্রেণি (প্রাথমিক)',
    group: 'primary',
    subjects: [
      {
        name: 'আমার বাংলা বই',
        icon: '📚',
        bookTitle: 'আমার বাংলা বই (এনসিটিবি ১ম শ্রেণি)',
        chapters: ['বর্ণমালা পরিচয়', 'স্বরবর্ণ ও ব্যঞ্জনবর্ণ', 'সহজ ছড়া ও কবিতা', 'ছোট গল্প ও বাক্য গঠন']
      },
      {
        name: 'প্রাথমিক গণিত',
        icon: '📐',
        bookTitle: 'প্রাথমিক গণিত (এনসিটিবি ১ম শ্রেণি)',
        chapters: ['তুলনা করা (বড়-ছোট)', 'গণনা (১ থেকে ২০)', 'যোগের ধারণা', 'বিয়োগের ধারণা', 'জ্যামিতিক আকৃতি']
      },
      {
        name: 'English for Today',
        icon: '🔤',
        bookTitle: 'English for Today (Class 1)',
        chapters: ['Alphabet & Phonics', 'Greetings & Farewells', 'Numbers (1 to 10)', 'Colors & Common Objects']
      }
    ]
  },
  {
    classLevel: '২য় শ্রেণি',
    gradeNumber: 2,
    label: '২য় শ্রেণি (প্রাথমিক)',
    group: 'primary',
    subjects: [
      {
        name: 'আমার বাংলা বই',
        icon: '📚',
        bookTitle: 'আমার বাংলা বই (এনসিটিবি ২য় শ্রেণি)',
        chapters: ['যুক্তবর্ণের ব্যবহার', 'কবিতা ও ছড়া', 'গল্প ও চরিত্র', 'বিপরীত শব্দ ও সমার্থক শব্দ']
      },
      {
        name: 'প্রাথমিক গণিত',
        icon: '📐',
        bookTitle: 'প্রাথমিক গণিত (এনসিটিবি ২য় শ্রেণি)',
        chapters: ['সংখ্যার তুলনা (১ থেকে ১০০)', 'হাতে রেখে যোগ', 'হাতে রেখে বিয়োগ', 'নামতা (১ থেকে ১০)', 'গুণ ও ভাগের ধারণা']
      },
      {
        name: 'English for Today',
        icon: '🔤',
        bookTitle: 'English for Today (Class 2)',
        chapters: ['Days of the week', 'Action Words & Verbs', 'Simple Sentences', 'Rhymes & Chants']
      }
    ]
  },
  {
    classLevel: '৩য় শ্রেণি',
    gradeNumber: 3,
    label: '৩য় শ্রেণি (প্রাথমিক)',
    group: 'primary',
    subjects: [
      {
        name: 'বাংলা',
        icon: '📚',
        bookTitle: 'আমার বাংলা বই (এনসিটিবি ৩য় শ্রেণি)',
        chapters: ['গদ্য ও পদ্যাংশ', 'ব্যাকরণ ও বাক্য শুদ্ধি', 'যুক্তবর্ণ ও বিরামচিহ্ন', 'অনুচ্ছেদ লিখন']
      },
      {
        name: 'প্রাথমিক গণিত',
        icon: '📐',
        bookTitle: 'প্রাথমিক গণিত (এনসিটিবি ৩য় শ্রেণি)',
        chapters: ['চার অঙ্কের সংখ্যা গণনা', 'যোগ ও বিয়োগ সমস্যা', 'গুণ ও ভাগ', 'মুদ্রা ও টাকা-পয়সা', 'পরিমাপ ও সময়']
      },
      {
        name: 'English for Today',
        icon: '🔤',
        bookTitle: 'English for Today (Class 3)',
        chapters: ['Parts of the Body', 'Daily Routine', 'Telling the Time', 'Short Comprehension']
      },
      {
        name: 'প্রাথমিক বিজ্ঞান',
        icon: '🔬',
        bookTitle: 'প্রাথমিক বিজ্ঞান (এনসিটিবি ৩য় শ্রেণি)',
        chapters: ['জীব ও জড়', 'উদ্ভিদ ও প্রাণীর বিভিন্নতা', 'বিভিন্ন ধরনের পদার্থ', 'পানি ও মাটি দূষণ', 'স্বাস্থ্যবিধি']
      },
      {
        name: 'বাংলাদেশ ও বিশ্বপরিচয়',
        icon: '🌍',
        bookTitle: 'বাংলাদেশ ও বিশ্বপরিচয় (এনসিটিবি ৩য় শ্রেণি)',
        chapters: ['আমাদের পরিবেশ ও সমাজ', 'আমাদের জাতির পিতা', 'বাংলাদেশের ভূ-প্রকৃতি', 'যানবাহন ও যোগাযোগ']
      }
    ]
  },
  {
    classLevel: '৪র্থ শ্রেণি',
    gradeNumber: 4,
    label: '৪র্থ শ্রেণি (প্রাথমিক)',
    group: 'primary',
    subjects: [
      {
        name: 'বাংলা',
        icon: '📚',
        bookTitle: 'আমার বাংলা বই (এনসিটিবি ৪র্থ শ্রেণি)',
        chapters: ['বীরশ্রেষ্ঠদের আত্মত্যাগ', 'বাংলাদেশের প্রকৃতি ও লোকশিল্প', 'ব্যাকরণ ও ব্যাকরণিক পদ', 'এককথায় প্রকাশ ও বিপরীত শব্দ']
      },
      {
        name: 'প্রাথমিক গণিত',
        icon: '📐',
        bookTitle: 'প্রাথমিক গণিত (এনসিটিবি ৪র্থ শ্রেণি)',
        chapters: ['বড় সংখ্যা ও স্থানীয় মান', 'গাণিতিক প্রতীক ও বন্ধনী', 'সাধারণ ভগ্নাংশ ও দশমিক', 'রেখা ও কোণ', 'পরিমাপ ও সময়']
      },
      {
        name: 'English for Today',
        icon: '🔤',
        bookTitle: 'English for Today (Class 4)',
        chapters: ['Family & Occupations', 'Food & Habits', 'Prepositions of Place', 'Wh-questions & Dialogue']
      },
      {
        name: 'প্রাথমিক বিজ্ঞান',
        icon: '🔬',
        bookTitle: 'প্রাথমিক বিজ্ঞান (এনসিটিবি ৪র্থ শ্রেণি)',
        chapters: ['জীব ও পরিবেশের সম্পর্ক', 'উদ্ভিদ ও প্রাণীর বাসস্থান', 'মাটি ও মাটির উপাদান', 'খাদ্য উপাদান ও পুষ্টি', 'পদার্থের রূপান্তর']
      },
      {
        name: 'বাংলাদেশ ও বিশ্বপরিচয়',
        icon: '🌍',
        bookTitle: 'বাংলাদেশ ও বিশ্বপরিচয় (এনসিটিবি ৪র্থ শ্রেণি)',
        chapters: ['আমাদের চারপাশের পরিবেশ', 'সমাজের বিভিন্ন পেশা', 'বাংলাদেশের ভৌগোলিক অঞ্চল', 'অধিকার ও নাগরিক দায়িত্ব']
      }
    ]
  },
  {
    classLevel: '৫ম শ্রেণি',
    gradeNumber: 5,
    label: '৫ম শ্রেণি (প্রাথমিক সমাপনী)',
    group: 'primary',
    subjects: [
      {
        name: 'বাংলা',
        icon: '📚',
        bookTitle: 'আমার বাংলা বই (এনসিটিবি ৫ম শ্রেণি)',
        chapters: ['এই দেশ এই মানুষ', 'সুন্দরবনের প্রাণী', 'স্মরণীয় যাঁরা চিরদিন', 'শব্দার্থ ও বাক্য তৈরি', 'বিরামচিহ্নের যথার্থ ব্যবহার', 'যুক্তবর্ণ ও বিপরীত শব্দ']
      },
      {
        name: 'প্রাথমিক গণিত',
        icon: '📐',
        bookTitle: 'প্রাথমিক গণিত (এনসিটিবি ৫ম শ্রেণি)',
        chapters: ['গুণ ও ভাগ সংক্রান্ত সমস্যা', 'চার প্রক্রিয়া সম্পর্কিত সমস্যাবলি', 'গ.সা.গু ও ল.সা.গু', 'সাধারণ ভগ্নাংশ ও দশমিক ভগ্নাংশ', 'গড় ও শতকরা', 'পরিমাপ ও জ্যামিতি']
      },
      {
        name: 'English for Today',
        icon: '🔤',
        bookTitle: 'English for Today (Class 5)',
        chapters: ['Hello & Self Introduction', 'Eat Healthy & Nutrition', 'The Liberation War Museum', 'A Firefighter', 'Prepositions & Tenses', 'Question Framing']
      },
      {
        name: 'প্রাথমিক বিজ্ঞান',
        icon: '🔬',
        bookTitle: 'প্রাথমিক বিজ্ঞান (এনসিটিবি ৫ম শ্রেণি)',
        chapters: ['আমাদের পরিবেশ ও বাস্তুসংস্থান', 'পরিবেশ দূষণ ও প্রতিরোধ', 'জীবনের জন্য পানি', 'বায়ু ও বায়ুমণ্ডল', 'পদার্থ ও শক্তি', 'সুস্থ জীবনের জন্য খাদ্য']
      },
      {
        name: 'বাংলাদেশ ও বিশ্বপরিচয়',
        icon: '🌍',
        bookTitle: 'বাংলাদেশ ও বিশ্বপরিচয় (এনসিটিবি ৫ম শ্রেণি)',
        chapters: ['আমাদের মুক্তিযুদ্ধ (১৯৭১)', 'ব্রিটিশ শাসন ও উপমহাদেশ', 'বাংলাদেশের ঐতিহাসিক স্থান', 'আমাদের অর্থনীতি: কৃষি ও শিল্প', 'জনসংখ্যা ও মানবসম্পদ']
      }
    ]
  },

  // ================= 6th to 8th Class (Junior) =================
  {
    classLevel: '৬ষ্ঠ শ্রেণি',
    gradeNumber: 6,
    label: '৬ষ্ঠ শ্রেণি (জুনিয়র)',
    group: 'junior',
    subjects: [
      {
        name: 'বাংলা',
        icon: '📚',
        bookTitle: 'বাংলা (এনসিটিবি ৬ষ্ঠ শ্রেণি)',
        chapters: ['প্রমিত ভাষা ও আঞ্চলিক রূপ', 'শব্দের অর্থ ও ব্যাকরণিক শ্রেণি', 'কবিতা ও ছন্দের জাদু', 'গল্প ও নাটক', 'বিবরণমূলক ও তথ্যমূলক লেখা']
      },
      {
        name: 'গণিত',
        icon: '📐',
        bookTitle: 'গণিত (এনসিটিবি ৬ষ্ঠ শ্রেণি)',
        chapters: ['সংখ্যার গল্প ও স্বাভাবিক সংখ্যা', 'পূর্ণসংখ্যা ও সংখ্যারেখা', 'মৌলিক উৎপাদকের গাছ (গসাগু ও লসাগু)', 'ভগ্নাংশের খেলা', 'ঐকিক নিয়ম ও শতকরা', 'সরল সমীকরণ ও বীজগণিতীয় সূত্র', 'জ্যামিতিক আকৃতি ও পরিমাপ']
      },
      {
        name: 'English',
        icon: '🔤',
        bookTitle: 'English (Class 6 NCTB)',
        chapters: ['Talking to People', 'Little Things & Poems', 'Future Lies in Present', 'Ask and Answer', 'Together We Are One']
      },
      {
        name: 'বিজ্ঞান',
        icon: '🔬',
        bookTitle: 'বিজ্ঞান অনুসন্ধানী ও অনুশীলন পাঠ (৬ষ্ঠ শ্রেণি)',
        chapters: ['বিজ্ঞানের পরিমাপ ও একক', 'জীবজগৎ ও উদ্ভিদের বৈশিষ্ট্য', 'উদ্ভিদের বাহ্যিক বৈশিষ্ট্য', 'পদার্থের গঠন ও বৈশিষ্ট্য', 'আলোর খেলা ও প্রতিসরণ', 'গতি ও বলের প্রাথমিক ধারণা']
      },
      {
        name: 'ইতিহাস ও সামাজিক বিজ্ঞান',
        icon: '🌍',
        bookTitle: 'ইতিহাস ও সামাজিক বিজ্ঞান (৬ষ্ঠ শ্রেণি)',
        chapters: ['আত্মপরিচয় ও সংস্কৃতি', 'প্রাচীন সভ্যতার উন্মেষ', 'আমাদের মুক্তিযুদ্ধ ও স্বাধীনতা', 'প্রাকৃতিক সম্পদ ও জলবায়ু পরিবর্তন']
      }
    ]
  },
  {
    classLevel: '৭ম শ্রেণি',
    gradeNumber: 7,
    label: '৭ম শ্রেণি (জুনিয়র)',
    group: 'junior',
    subjects: [
      {
        name: 'বাংলা',
        icon: '📚',
        bookTitle: 'বাংলা (এনসিটিবি ৭ম শ্রেণি)',
        chapters: ['শব্দ তৈরি ও প্রত্যয়', 'ব্যাকরণিক শ্রেণির বিশ্লেষণ', 'সাহিত্য পাঠ ও ভাবার্থ', 'বিশ্লেষণমূলক রচনা']
      },
      {
        name: 'গণিত',
        icon: '📐',
        bookTitle: 'গণিত (এনসিটিবি ৭ম শ্রেণি)',
        chapters: ['সূচকের গল্প', 'অজানা রাশির সূচক, গুণ ও তাদের প্রয়োগ', 'ভগ্নাংশের লসাগু ও গসাগু', 'অনুপাত ও সমানুপাত', 'ত্রিভুজ ও চতুর্ভুজের বৈশিষ্ট্য', 'চলকের মান ও একচলক সমীকরণ']
      },
      {
        name: 'English',
        icon: '🔤',
        bookTitle: 'English (Class 7 NCTB)',
        chapters: ['A Dream School', 'Playing with the Words', 'If by Rudyard Kipling', 'The Frog and the Ox', 'Knowing our Parents']
      },
      {
        name: 'বিজ্ঞান',
        icon: '🔬',
        bookTitle: 'বিজ্ঞান (৭ম শ্রেণি)',
        chapters: ['ক্ষুদ্র অণুজীব জগৎ', 'উদ্ভিদের পুষ্টি ও সালোকসংশ্লেষণ', 'পদার্থের গঠন ও পরমাণু তত্ত্ব', 'শক্তি ও রূপান্তর', 'পৃথিবী ও মহাকর্ষ']
      },
      {
        name: 'ইতিহাস ও সামাজিক বিজ্ঞান',
        icon: '🌍',
        bookTitle: 'ইতিহাস ও সামাজিক বিজ্ঞান (৭ম শ্রেণি)',
        chapters: ['দক্ষিণ এশিয়ার ঐতিহাসিক পটভূমি', 'বাংলার মধ্যযুগীয় ইতিহাস', 'সংবিধান ও গণতন্ত্র', 'পরিবেশ বিপর্যয় ও সংরক্ষণ']
      }
    ]
  },
  {
    classLevel: '৮ম শ্রেণি',
    gradeNumber: 8,
    label: '৮ম শ্রেণি (জুনিয়র জেএসসি)',
    group: 'junior',
    subjects: [
      {
        name: 'বাংলা',
        icon: '📚',
        bookTitle: 'সাহিত্য কণিকা ও ব্যাকরণ (৮ম শ্রেণি)',
        chapters: ['অতিথির স্মৃতি (শরৎচন্দ্র চট্টোপাধ্যায়)', 'নৈবেদ্য ও কবিতা', 'সন্ধি ও উপসর্গ', 'কারক ও বিভক্তি নির্ণয়', 'সমাস ও প্রত্যয়', 'বাক্য রূপান্তর ও সারসংক্ষেপ']
      },
      {
        name: 'গণিত',
        icon: '📐',
        bookTitle: 'গণিত (এনসিটিবি ৮ম শ্রেণি)',
        chapters: ['প্যাটার্ন ও সংখ্যা বিন্যাস', 'মুনাফা (সরল ও চক্রবৃদ্ধি)', 'পরিমাপ ও ক্ষেত্রফল', 'বীজগণিতীয় সূত্রাবলি ও প্রয়োগ (a+b)²', 'উৎপাদকে বিশ্লেষণ ও গসাগু-লসাগু', 'চতুর্ভুজ অঙ্কন ও পিথাগোরাসের উপপাদ্য', 'বৃত্ত ও বৃত্তচাপ', 'পরিসংখ্যান ও পাইচিত্র']
      },
      {
        name: 'English',
        icon: '🔤',
        bookTitle: 'English for Today (Class 8)',
        chapters: ['Our Folk Songs', 'Nakshi Kantha', 'Ethnic People of Bangladesh', 'Prepositions & Connectors', 'Voice & Narration', 'Formal Letters']
      },
      {
        name: 'বিজ্ঞান',
        icon: '🔬',
        bookTitle: 'সাধারণ বিজ্ঞান (৮ম শ্রেণি)',
        chapters: ['প্রাণিজগতের শ্রেণিবিন্যাস', 'জীবদেহের বৃদ্ধি ও বংশগতি (কোষ বিভাজন)', 'রাসায়নিক বিক্রিয়া ও সমীকরণ', 'পদার্থের অবস্থা ও পরমাণুর গঠন', 'আলো ও লেন্স', 'বর্তনী ও চলবিদ্যুৎ', 'অম্ল, ক্ষারক ও লবণ']
      },
      {
        name: 'বাংলাদেশ ও বিশ্বপরিচয়',
        icon: '🌍',
        bookTitle: 'বাংলাদেশ ও বিশ্বপরিচয় (৮ম শ্রেণি)',
        chapters: ['ঔপনিবেশিক যুগ ও বাংলার মুক্তিসংগ্রাম', 'মুক্তিযুদ্ধ ও স্বাধীন বাংলাদেশের অভ্যুদয়', 'বাংলাদেশের ভৌগোলিক গঠন', 'রাষ্ট্র ও সরকার ব্যবস্থা', 'সামাজিকীকরণ ও উন্নয়ন']
      }
    ]
  },

  // ================= 9th & 10th Class (SSC Secondary) =================
  {
    classLevel: '৯ম শ্রেণি',
    gradeNumber: 9,
    label: '৯ম শ্রেণি (মাধ্যমিক)',
    group: 'secondary',
    subjects: [
      {
        name: 'বাংলা',
        icon: '📚',
        bookTitle: 'বাংলা ১ম ও ২য় পত্র (এনসিটিবি)',
        chapters: ['কারক ও বিভক্তি', 'সন্ধি', 'সমাস', 'ধ্বনি ও বর্ণ প্রকরণ', 'শব্দ ও পদ প্রকরণ', 'উপসর্গ ও অনুসর্গ', 'বাগধারা ও প্রবাদ']
      },
      {
        name: 'গণিত',
        icon: '📐',
        bookTitle: 'মাধ্যমিক সাধারণ গণিত (৯ম-১০ম শ্রেণি)',
        chapters: ['বাস্তব সংখ্যা ও সেট', 'বীজগণিতীয় রাশি (সূত্রের প্রয়োগ)', 'উৎপাদকে বিশ্লেষণ', 'সূচক ও লগারিদম (log)', 'এক চলকবিশিষ্ট সমীকরণ', 'জ্যামিতি: রেখা, কোণ ও ত্রিভুজ', 'ব্যবহারিক জ্যামিতি ও পিথাগোরাস']
      },
      {
        name: 'ইংরেজি',
        icon: '🔤',
        bookTitle: 'English 1st & 2nd Paper (Class 9-10)',
        chapters: ['Prepositions', 'Right Form of Verbs', 'Voice Change (Active to Passive)', 'Transformation of Sentences', 'Narration', 'Vocabulary & Synonyms']
      },
      {
        name: 'পদার্থবিজ্ঞান',
        icon: '⚛️',
        bookTitle: 'পদার্থবিজ্ঞান (এনসিটিবি ৯ম-১০ম)',
        chapters: ['ভৌত রাশি ও পরিমাপ', 'গতি (Motion: বেগ, ত্বরণ)', 'বল ও নিউটনের সূত্র', 'কাজ, ক্ষমতা ও শক্তি', 'পদার্থের অবস্থা ও চাপ (প্যাসকেল)']
      },
      {
        name: 'রসায়ন',
        icon: '🧪',
        bookTitle: 'রসায়ন (এনসিটিবি ৯ম-১০ম)',
        chapters: ['রসায়নের ধারণা', 'পদার্থের গঠন ও বোর মডেল', 'পর্যায় সারণি ও মৌলের ধর্ম', 'রাসায়নিক বন্ধন ও আয়ন', 'মোলের ধারণা ও রাসায়নিক গণনা']
      },
      {
        name: 'জীববিজ্ঞান',
        icon: '🌱',
        bookTitle: 'জীববিজ্ঞান (এনসিটিবি ৯ম-১০ম)',
        chapters: ['জীবন পাঠ ও শ্রেণিবিন্যাস', 'জীবকোষ ও টিস্যু', 'কোষ বিভাজন (মাইটোটিক ও মিয়োসিস)', 'জীবনীশক্তি ও সালোকসংশ্লেষণ', 'উদ্ভিদের খনিজ পুষ্টি']
      },
      {
        name: 'বাংলাদেশ ও বিশ্বপরিচয়',
        icon: '🏛️',
        bookTitle: 'বাংলাদেশ ও বিশ্বপরিচয় (৯ম-১০ম)',
        chapters: ['পূর্ব বাংলার আন্দোলন ও জাতীয়তাবাদের উত্থান', 'স্বাধীন বাংলাদেশ', 'সৌরজগৎ ও ভূমণ্ডল', 'বাংলাদেশের সংবিধান ও রাষ্ট্র কাঠামো']
      }
    ]
  },
  {
    classLevel: '১০ম শ্রেণি',
    gradeNumber: 10,
    label: '১০ম শ্রেণি (এসএসসি স্পেশাল)',
    group: 'secondary',
    subjects: [
      {
        name: 'বাংলা',
        icon: '📚',
        bookTitle: 'বাংলা ভাষার ব্যাকরণ ও নির্মিতি (এনসিটিবি ১০ম শ্রেণি)',
        chapters: ['কারক ও বিভক্তি', 'সন্ধি', 'সমাস', 'বাক্যতত্ত্ব ও বাক্য পরিবর্তন', 'শব্দের দ্বিরুক্তি ও প্রত্যয়', 'ণ-ত্ব ও ষ-ত্ব বিধান', 'বাগধারা ও প্রবাদ প্রবচন', 'অনুবাদ ও সারাংশ']
      },
      {
        name: 'গণিত',
        icon: '📐',
        bookTitle: 'মাধ্যমিক সাধারণ গণিত (এনসিটিবি ১০ম শ্রেণি)',
        chapters: [
          'বীজগণিতীয় রাশি (বর্গ ও ঘন)',
          'সূচক ও লগারিদম (log)',
          'এক চলক ও দ্বিঘাত সমীকরণ',
          'বীজগণিতীয় অনুপাত ও সমানুপাত',
          'সমান্তর ও গুণোত্তর ধারা',
          'ত্রিকোণমিতিক অনুপাত (sin, cos, tan)',
          'দূরত্ব ও উচ্চতা (উন্নতি ও অবনতি কোণ)',
          'জ্যামিতি (বৃত্ত ও স্পর্শক সংক্রান্ত উপপাদ্য)',
          'পরিমিতি (ত্রিভুজ, চতুর্ভুজ ও বৃত্তের ক্ষেত্রফল)',
          'পরিসংখ্যান (গড়, মধ্যক ও প্রচুরক)'
        ]
      },
      {
        name: 'ইংরেজি',
        icon: '🔤',
        bookTitle: 'English Grammar & Composition (Class 10)',
        chapters: [
          'Prepositions & Idioms',
          'Right Form of Verbs',
          'Voice Change',
          'Direct and Indirect Narration',
          'Transformation (Simple, Complex, Compound)',
          'Tag Questions & Modifiers',
          'Completing Sentences'
        ]
      },
      {
        name: 'পদার্থবিজ্ঞান',
        icon: '⚛️',
        bookTitle: 'পদার্থবিজ্ঞান (এনসিটিবি ১০ম শ্রেণি)',
        chapters: [
          'গতি ও নিউটনের গতিসূত্র',
          'কাজ, ক্ষমতা ও শক্তি',
          'পদার্থের অবস্থা, চাপ ও প্লবতা',
          'তরঙ্গ ও শব্দ',
          'আলোর প্রতিফলন ও প্রতিসরণ',
          'স্থির তড়িৎ ও কুলম্বের সূত্র',
          'চল তড়িৎ ও ওহমের সূত্র',
          'তড়িতের চৌম্বক ক্রিয়া',
          'আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স'
        ]
      },
      {
        name: 'রসায়ন',
        icon: '🧪',
        bookTitle: 'রসায়ন (এনসিটিবি ১০ম শ্রেণি)',
        chapters: [
          'পর্যায় সারণি ও মৌলের পর্যায়বৃত্ত ধর্ম',
          'রাসায়নিক বন্ধন (আয়নিক ও সমযোজী)',
          'মোলের ধারণা ও রাসায়নিক গণনা',
          'রাসায়নিক বিক্রিয়া ও জারণ-বিজারণ',
          'রসায়ন ও শক্তি (তড়িৎ রাসায়নিক কোষ)',
          'অ্যাসিড, ক্ষারক সমতা ও pH',
          'খনিজ সম্পদ ও জীবাশ্ম জ্বালানি (হাইড্রোকার্বন)'
        ]
      },
      {
        name: 'জীববিজ্ঞান',
        icon: '🌱',
        bookTitle: 'জীববিজ্ঞান (এনসিটিবি ১০ম শ্রেণি)',
        chapters: [
          'কোষ ও টিস্যুর গঠন',
          'জীবনীশক্তি (সালোকসংশ্লেষণ ও শ্বসন)',
          'উদ্ভিদ ও প্রাণীর খাদ্য পুষ্টি',
          'জীবদেহে রক্ত সংবহন ও হৃদপিণ্ড',
          'রেচন প্রক্রিয়া ও বৃক্ক',
          'বংশগতি ও ডিএনএ অনুলিপন',
          'জীবের বংশগতি ও বিবর্তন'
        ]
      },
      {
        name: 'উচ্চতর গণিত',
        icon: '📈',
        bookTitle: 'মাধ্যমিক উচ্চতর গণিত (এনসিটিবি ১০ম শ্রেণি)',
        chapters: [
          'সেট ও ফাংশন',
          'বীজগণিতীয় রাশি ও আংশিক ভগ্নাংশ',
          'জ্যামিতি (অ্যাপোলোনিয়াসের উপপাদ্য)',
          'দ্বিপদী বিস্তার (Binomial Expansion)',
          'স্থানাঙ্ক জ্যামিতি (ঢাল ও সমীকরণ)',
          'ত্রিকোণমিতি (রেডিয়ান ও কোণ অনুপাত)',
          'সমতলীয় ভেক্টর',
          'সম্ভাবনা (Probability)'
        ]
      },
      {
        name: 'বাংলাদেশ ও বিশ্বপরিচয়',
        icon: '🏛️',
        bookTitle: 'বাংলাদেশ ও বিশ্বপরিচয় (এনসিটিবি ১০ম শ্রেণি)',
        chapters: [
          'বাংলাদেশের ইতিহাস ও মুক্তিযুদ্ধ',
          'সংবিধান, নাগরিক অধিকার ও মৌলিক অধিকার',
          'সরকার ব্যবস্থা ও বিচার বিভাগ',
          'আন্তর্জাতিক সম্পর্ক ও জাতিসংঘ'
        ]
      }
    ]
  },
  // ================= Job & Recruitment (চাকুরি) =================
  {
    classLevel: 'চাকুরি',
    gradeNumber: 12,
    label: 'চাকুরি প্রস্তুতি (বিসিএস, প্রাইমারি, মেডিকেল)',
    group: 'secondary',
    subjects: [
      {
        name: 'চাকুরি প্রস্তুতি',
        icon: '💼',
        bookTitle: 'চাকুরি ও বিসিএস প্রস্তুতি সহায়িকা',
        chapters: [
          'বিসিএস প্রিলিমিনারি',
          'প্রাথমিক শিক্ষক নিয়োগ',
          'মেডিকেল ভর্তি পরীক্ষা',
          'এনটিআরসিএ (শিক্ষক নিবন্ধন)',
          'ব্যাংক নিয়োগ পরীক্ষা'
        ]
      },
      {
        name: 'বাংলা',
        icon: '📚',
        bookTitle: 'চাকুরি বাংলা সাহিত্য ও ব্যাকরণ',
        chapters: [
          'প্রাচীন ও মধ্যযুগ (চর্যাপদ ও মঙ্গলকাব্য)',
          'আধুনিক যুগ ও সাহিত্যিকগণ',
          'ব্যাকরণ (সন্ধি, সমাস, কারক ও প্রত্যয়)'
        ]
      },
      {
        name: 'গণিত',
        icon: '📐',
        bookTitle: 'চাকুরি গণিত ও মানসিক দক্ষতা',
        chapters: [
          'পাটিগণিত (লাভ-ক্ষতি, শতকরা ও সুদকষা)',
          'বীজগণিত ও জ্যামিতি',
          'মানসিক দক্ষতা ও বিশ্লেষণ'
        ]
      },
      {
        name: 'সাধারণ জ্ঞান',
        icon: '🌍',
        bookTitle: 'সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক)',
        chapters: [
          'বাংলাদেশের ইতিহাস ও মুক্তিযুদ্ধ',
          'বাংলাদেশের সংবিধান ও প্রশাসন',
          'আন্তর্জাতিক সংগঠন ও সাম্প্রতিক বিশ্ব'
        ]
      }
    ]
  }
];

// Helper to get class meta by classLevel string
export function getClassMeta(classLevel: string): ClassSubjectMeta | undefined {
  return NCTB_CLASS_SYLLABUS.find(c => c.classLevel === classLevel || c.label.includes(classLevel));
}

// Helper to get all subjects for a class
export function getSubjectsForClass(classLevel: string) {
  const meta = getClassMeta(classLevel);
  return meta ? meta.subjects : [];
}

// Helper to get chapters for a class and subject
export function getChaptersForClassAndSubject(classLevel: string, subjectName: string): string[] {
  const meta = getClassMeta(classLevel);
  if (!meta) return ['সকল অধ্যায়'];
  const subj = meta.subjects.find(s => s.name === subjectName || subjectName.includes(s.name) || s.name.includes(subjectName));
  return subj ? ['সকল অধ্যায়', ...subj.chapters] : ['সকল অধ্যায়'];
}
