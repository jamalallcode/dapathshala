export interface ChapterSeedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const CHAPTER_QUESTION_BANK: Record<string, ChapterSeedQuestion[]> = {
  // ------------------- বাংলা (BANGLA) -------------------
  'অপরিচিতা': [
    {
      question: "'অপরিচিতা' ছোটগল্পে অনুপমের বন্ধুর নাম কী ছিল?",
      options: ['হরিশ', 'বিনুদা', 'শম্ভুনাথ সেন', 'গজাধর'],
      correctAnswer: 'হরিশ',
      explanation: 'হরিশ কানপুরে কাজ করত এবং সে-ই প্রথম কল্যাণীর সাথে অনুপমের বিয়ের প্রস্তাব এনেছিল।'
    },
    {
      question: "অনুপমকে কার কন্যা কল্যাণীর সাথে বিয়ের প্রস্তাব দেওয়া হয়েছিল?",
      options: ['শম্ভুনাথ সেন', 'রামসুন্দর ঘোষ', 'কিশোরীলাল', 'বনমালী'],
      correctAnswer: 'শম্ভুনাথ সেন',
      explanation: 'শম্ভুনাথ সেন ছিলেন একজন আত্মমর্যাদাসম্পন্ন বলিষ্ঠ ব্যক্তিত্ব ও কল্যাণীর পিতা।'
    },
    {
      question: "অনুপমের মামা বিয়ের আসরে কী পরীক্ষা করতে চেয়েছিলেন?",
      options: ['কন্যার গহনার খাঁটি সোনা', 'যৌতুকের নগদ টাকা', 'বরের পোশাক', 'খাবারের মান'],
      correctAnswer: 'কন্যার গহনার খাঁটি সোনা',
      explanation: 'মামা সেকরা এনে কল্যাণীর গায়ের গহনা পরখ করে অবমাননাকর পরিস্থিতির সৃষ্টি করেন।'
    },
    {
      question: "কল্যাণী বিয়ে ভেঙে যাওয়ার পর নিজেকে কোন ব্রতে নিয়োজিত করেন?",
      options: ['নারীশিক্ষা বিস্তার ও দেশসেবা', 'সংগীত চর্চা', 'সাহিত্য রচনা', 'তীর্থ ভ্রমণ'],
      correctAnswer: 'নারীশিক্ষা বিস্তার ও দেশসেবা',
      explanation: 'কল্যাণী আজীবন অবিবাহিত থেকে মেয়েদের শিক্ষার দায়িত্ব গ্রহণ করেছিলেন।'
    },
    {
      question: "'অপরিচিতা' গল্পে অনুপমের প্রধান দুর্বলতা কী ছিল?",
      options: ['মামার কথার অবাধ্য না হওয়ার ব্যক্তিত্বহীনতা', 'অর্থের লোভ', 'অহংকার', 'ভীতু স্বভাব'],
      correctAnswer: 'মামার কথার অবাধ্য না হওয়ার ব্যক্তিত্বহীনতা',
      explanation: 'অনুপম নিজে কোনো দৃঢ় সিদ্ধান্ত নিতে পারত না, মামাই ছিল তার অভিভাবক।'
    }
  ],
  'বিলাসী': [
    {
      question: "'বিলাসী' গল্পটি কার জবানিতে বা কোন চরিত্রের দৃষ্টিকোণ থেকে বর্ণিত হয়েছে?",
      options: ['ন্যাড়া', 'মৃত্যুঞ্জয়', 'খুড়ো', 'শরৎচন্দ্র'],
      correctAnswer: 'ন্যাড়া',
      explanation: 'গল্পের কথক ন্যাড়া তার নিজস্ব অভিজ্ঞতার আলোকে পুরো কাহিনী বর্ণনা করেছেন।'
    },
    {
      question: "মৃত্যুঞ্জয় কোন জাতের মেয়ে বিলাসীর সেবায় জীবন ফিরে পেয়েছিল?",
      options: ['সাপুড়ে', 'কামার', 'কুমার', 'তাঁতী'],
      correctAnswer: 'সাপুড়ে',
      explanation: 'বিলাসী সাপুড়ের মেয়ে ছিল এবং সে নিষ্ঠার সাথে মৃত্যুঞ্জয়কে মৃত্যুর মুখ থেকে বাঁচিয়েছিল।'
    },
    {
      question: "মৃত্যুঞ্জয়ের সম্পত্তির একমাত্র উত্তরাধিকারী হতে কে চক্রান্ত করেছিল?",
      options: ['মৃত্যুঞ্জয়ের খুড়ো', 'গ্রামের মোড়ল', 'ন্যাড়া', 'কবিরাজ'],
      correctAnswer: 'মৃত্যুঞ্জয়ের খুড়ো',
      explanation: 'মৃত্যুঞ্জয়ের খুড়ো তার বিশাল বাগান ও জমিজমা দখল করার জন্য বিলাসীর ওপর অত্যাচার চালিয়েছিল।'
    },
    {
      question: "মৃত্যুঞ্জয় শেষ পর্যন্ত কীভাবে মৃত্যুবরণ করে?",
      options: ['বিষধর সাপের দংশনে', 'কলেরায়', 'অনাহারে', 'দুর্ঘটনায়'],
      correctAnswer: 'বিষধর সাপের দংশনে',
      explanation: 'সাপ ধরতে গিয়ে অসাবধানতাবশত বিষাক্ত সাপের ছোবলে মৃত্যুঞ্জয় মারা যায়।'
    },
    {
      question: "মৃত্যুঞ্জয়ের মৃত্যুর পর বিলাসী কী করেছিল?",
      options: ['বিষ খেয়ে আত্মহত্যা করেছিল', 'গ্রাম ছেড়ে চলে গিয়েছিল', 'সাপ ধরা চালিয়েছিল', 'বাপের বাড়ি গিয়েছিল'],
      correctAnswer: 'বিষ খেয়ে আত্মহত্যা করেছিল',
      explanation: 'মৃত্যুঞ্জয়ের মৃত্যুর সপ্তম দিনে বিলাসী বিষপানে আত্মাহুতি দেয়।'
    }
  ],
  'বায়ান্নর দিনগুলো': [
    {
      question: "'বায়ান্নর দিনগুলো' রচনায় বঙ্গবন্ধু শেখ মুজিবুর রহমান কেন অনশন করেছিলেন?",
      options: ['বিনা বিচারে দীর্ঘকাল বন্দি রাখার প্রতিবাদে', 'খাবারের মান বৃদ্ধির দাবিতে', 'পোশাক পরিবর্তনের জন্য', 'মুক্তির পর বিদেশে যাওয়ার জন্য'],
      correctAnswer: 'বিনা বিচারে দীর্ঘকাল বন্দি রাখার প্রতিবাদে',
      explanation: 'পাকিস্তান সরকারের অন্যায়ভাবে বিনা বিচারে রাজবন্দি রাখার বিরুদ্ধে তিনি অনশন করেন।'
    },
    {
      question: "শেখ মুজিবুর রহমানের সাথে ঢাকা কেন্দ্রীয় কারাগারে অনশনে কে ছিলেন?",
      options: ['মহিউদ্দিন আহমদ', 'রফিক উদ্দিন', 'তাজউদ্দীন আহমদ', 'শেরে বাংলা'],
      correctAnswer: 'মহিউদ্দিন আহমদ',
      explanation: 'মহিউদ্দিন আহমদ ও শেখ মুজিবুর রহমান একসঙ্গে অনশন শুরু করেছিলেন।'
    },
    {
      question: "অনশন চলাকালে তাঁদের ঢাকা কারাগার থেকে কোন জেলে স্থানান্তর করা হয়?",
      options: ['ফরিদপুর জেল', 'রাজশাহী জেল', 'খুলনা জেল', 'কুমিল্লা জেল'],
      correctAnswer: 'ফরিদপুর জেল',
      explanation: 'সরকার তাঁদের আন্দোলন স্তিমিত করতে গোপনে স্টিমারে করে ফরিদপুর জেলে পাঠিয়ে দেয়।'
    },
    {
      question: "১৯৫২ সালের ২১শে ফেব্রুয়ারি পুলিশের গুলিতে কারা শহীদ হন?",
      options: ['সালাম, বরকত, রফিক, জব্বার', 'তিতুমীর ও সূর্যসেন', 'ক্ষুদিরাম ও প্রীতিলতা', 'আসাদ ও মতিউর'],
      correctAnswer: 'সালাম, বরকত, রফিক, জব্বার',
      explanation: 'মাতৃভাষা বাংলার দাবিতে রাজপথে মিছিলরত সালাম, বরকত, রফিক, জব্বার শহীদ হন।'
    },
    {
      question: "অনশনের কত দিন পর শেখ মুজিবুর রহমান মুক্তি পেয়েছিলেন?",
      options: ['২৭শে ফেব্রুয়ারি', '২১শে ফেব্রুয়ারি', '২৫শে ফেব্রুয়ারি', '১লা মার্চ'],
      correctAnswer: '২৭শে ফেব্রুয়ারি',
      explanation: 'দীর্ঘ অনশনের পর অবস্থার চরম অবনতি হলে সরকার তাঁকে মুক্তি দিতে বাধ্য হয়।'
    }
  ],
  'রেইনকোট': [
    {
      question: "'রেইনকোট' গল্পে রেইনকোটটি মূলত কার ছিল?",
      options: ['মুক্তিযোদ্ধা মিন্টুর (শ্যালক)', 'প্রভাষক নুরুল হুদার', 'প্রিন্সিপাল আফাজ আহমদের', 'ড. ইসহাকের'],
      correctAnswer: 'মুক্তিযোদ্ধা মিন্টুর (শ্যালক)',
      explanation: 'মিন্টু মুক্তিযুদ্ধে যাওয়ার সময় তার রেইনকোটটি বোনের বাড়িতে রেখে গিয়েছিল।'
    },
    {
      question: "নুরুল হুদা কোন বিষয়ের কলেজ প্রভাষক ছিলেন?",
      options: ['রসায়ন', 'পদার্থবিজ্ঞান', 'বাংলা', 'ইতিহাস'],
      correctAnswer: 'রসায়ন',
      explanation: 'নুরুল হুদা ঢাকা শহরের একটি কলেজের রসায়ন বিভাগের প্রভাষক ছিলেন।'
    },
    {
      question: "মিন্টুর রেইনকোট গায়ে দেওয়ার পর নুরুল হুদার মধ্যে কী পরিবর্তন ঘটে?",
      options: ['মুক্তিযুদ্ধের চেতনা ও দেশপ্রেমের অসীম সাহস সঞ্চার হয়', 'শীত দূর হয়', 'ভয় ও দ্বিধা বাড়ে', 'অহংকার জাগে'],
      correctAnswer: 'মুক্তিযুদ্ধের চেতনা ও দেশপ্রেমের অসীম সাহস সঞ্চার হয়',
      explanation: 'রেইনকোটটি তাকে উষ্ণতার সাথে সাথে মুক্তির সংগ্রামে অংশ নেওয়ার তীব্র মানসিক শক্তি দেয়।'
    },
    {
      question: "কলেজের প্রিন্সিপাল আফাজ আহমদ কাদের অন্ধ অনুগত ছিল?",
      options: ['পাকিস্তানি হানাদার বাহিনীর', 'মুক্তিযোদ্ধাদের', 'ছাত্র ইউনিয়নের', 'শিক্ষক সমিতির'],
      correctAnswer: 'পাকিস্তানি হানাদার বাহিনীর',
      explanation: 'প্রিন্সিপাল আফাজ আহমদ পাকিস্তানি মিলিটারিকে সন্তুষ্ট রাখতে কলেজে উর্দু চালু করতে চেয়েছিল।'
    },
    {
      question: "হানাদার বাহিনীর বর্বর নির্যাতনের মুখেও নুরুল হুদা কী করতে অস্বীকার করেন?",
      options: ['মুক্তিযোদ্ধা শ্যালক ও ছাত্রদের তথ্য দিতে', 'কলেজে ক্লাস নিতে', 'বেতন নিতে', 'রেইনকোট খুলতে'],
      correctAnswer: 'মুক্তিযোদ্ধা শ্যালক ও ছাত্রদের তথ্য দিতে',
      explanation: 'নুরুল হুদা চরম শারীরিক নির্যাতনের মুখেও বিদ্রোহীদের ঠিকানা প্রকাশ করেননি।'
    }
  ],
  'সোনার তরী': [
    {
      question: "'সোনার তরী' কবিতায় কৃষক নদীর কূলে একা বসে কী করছিল?",
      options: ['কাটা ধানের পাশে বসে নৌকার প্রতীক্ষা করছিল', 'মাছ ধরছিল', 'গান গাইছিল', 'নদী পারাপার করছিল'],
      correctAnswer: 'কাটা ধানের পাশে বসে নৌকার প্রতীক্ষা করছিল',
      explanation: 'শ্রাবণের মেঘলা দিনে কৃষক তার জীবনের শ্রেষ্ঠ ফসল কেটে কূলে বসে ছিল।'
    },
    {
      question: "কবিতায় 'সোনার তরী' ও 'সোনার ধান' কিসের প্রতীক?",
      options: ['মানুষের অবিনশ্বর সৃষ্টিকর্ম ও শিল্পের প্রতীক', 'অর্থবিত্তের অহংকার', 'কৃষিকাজের ফল', 'সোনার অলংকার'],
      correctAnswer: 'মানুষের অবিনশ্বর সৃষ্টিকর্ম ও শিল্পের প্রতীক',
      explanation: 'সোনার ধান হলো মানুষের কর্ম ও শিল্পকর্ম, যা কালজয়ী কিন্তু মানুষ মরণশীল।'
    },
    {
      question: "নৌকার মাঝি কী গ্রহণ করে এবং কাকে কূলে ফেলে রেখে চলে যায়?",
      options: ['ধান তুলে নেয়, কৃষককে ফেলে যায়', 'কৃষককে তুলে নেয়, ধান ফেলে যায়', 'উভয়কে গ্রহণ করে', 'কাউকে নেয় না'],
      correctAnswer: 'ধান তুলে নেয়, কৃষককে ফেলে যায়',
      explanation: 'মহাকালের তরী মানুষের সৃষ্টিকে ধারণ করে কিন্তু ব্যক্তিকে ধারণ করতে পারে না।'
    },
    {
      question: "'ঠাঁই নাই, ঠাঁই নাই— ছোট সে তরী' চরণটিতে কী ফুটে উঠেছে?",
      options: ['মহাকালের তরীতে ব্যক্তিস্বত্বার স্থান না পাওয়ার চিরন্তন ট্র্যাজেডি', 'নৌকার ধারণক্ষমতা কম', 'মাঝির নিষ্ঠুরতা', 'ধানের ওজন বেশি'],
      correctAnswer: 'মহাকালের তরীতে ব্যক্তিস্বত্বার স্থান না পাওয়ার চিরন্তন ট্র্যাজেডি',
      explanation: 'সৃষ্টি অমর কিন্তু স্রষ্টা নশ্বর— এই পরম সত্য এখানে প্রকাশিত।'
    },
    {
      question: "'সোনার তরী' কবিতাটি কোন ছন্দে রচিত?",
      options: ['মাত্রাবৃত্ত ছন্দ', 'অক্ষরবৃত্ত ছন্দ', 'স্বরবৃত্ত ছন্দ', 'গদ্য ছন্দ'],
      correctAnswer: 'মাত্রাবৃত্ত ছন্দ',
      explanation: "'সোনার তরী' কবিতাটি সুষম মাত্রাবৃত্ত (৮+৫ মাত্রার) ছন্দে রচিত।"
    }
  ],
  'বিদ্রোহী': [
    {
      question: "'বিদ্রোহী' কবিতাটি কাজী নজরুল ইসলামের কোন প্রথম কাব্যগ্রন্থে প্রকাশিত হয়?",
      options: ['অগ্নিবীণা (১৯২২)', 'বিষের বাঁশী', 'সাম্যবাদী', 'সর্বহারা'],
      correctAnswer: 'অগ্নিবীণা (১৯২২)',
      explanation: "'অগ্নিবীণা' কাব্যগ্রন্থের দ্বিতীয় কবিতা হলো যুগান্তকারী 'বিদ্রোহী'।"
    },
    {
      question: "কবিতায় কবি কার সাথে নিজেকে তুলনা করে বলেছেন 'আমি চির উন্নত শির'?",
      options: ['হিমালয়ের শিখর', 'আকাশের মেঘ', 'সাগরের উত্তাল ঢেউ', 'সূর্যের দীপ্তি'],
      correctAnswer: 'হিমালয়ের শিখর',
      explanation: "'বল বীর— বল উন্নত মম শির! শির নেহারি আমারি নতশির ওই শিখর হিমাদ্রির!'"
    },
    {
      question: "'মম এক হাতে বাঁকা বাঁশের বাঁশরী, আর হাতে...' শূন্যস্থানে কী হবে?",
      options: ['রণ-তূর্য', 'তীর-ধনুক', 'কৃপাণ', 'অগ্নিবাণ'],
      correctAnswer: 'রণ-তূর্য',
      explanation: "নজরুল একই সাথে প্রেমের বাঁশি ও দ্রোহের রণ-তূর্য বাজাতে জানতেন।"
    },
    {
      question: "কবি কখন নিজেকে শান্ত ঘোষণা করবেন বলে পণ করেছেন?",
      options: ['উৎপীড়িতের ক্রন্দন-রোল আকাশে-বাতাসে না ধ্বনিলে', 'স্বাধীনতা অর্জিত হলে', 'যুদ্ধের সমাপ্তি ঘটলে', 'মৃত্যুর পূর্বে'],
      correctAnswer: 'উৎপীড়িতের ক্রন্দন-রোল আকাশে-বাতাসে না ধ্বনিলে',
      explanation: "'যবে উৎপীড়িতের ক্রন্দন-রোল আকাশে-বাতাসে ধ্বনিবে না... বিদ্রোহী রণ-ক্লান্ত, আমি সেই দিন হব শান্ত।'"
    },
    {
      question: "'বিদ্রোহী' কবিতায় কবি নিজেকে কার 'পরশু' বা কুঠার বলেছেন?",
      options: ['ভৃগু', 'পরশুরামের কঠোর পরশু', 'ইন্দ্রের বজ্র', 'শিবের ত্রিশূল'],
      correctAnswer: 'পরশুরামের কঠোর পরশু',
      explanation: 'কবি অত্যাচারী রাজন্যবর্গকে ধ্বংস করার জন্য পরশুরামের কুঠারের মতো গর্জে ওঠেন।'
    }
  ],
  'প্রতিদান': [
    {
      question: "'প্রতিদান' কবিতাটি কবি জসীমউদ্দীনের কোন কাব্যগ্রন্থের অন্তর্ভুক্ত?",
      options: ['বালুচর', 'নকশী কাঁথার মাঠ', 'সোজন বাদিয়ার ঘাট', 'ধানক্ষেত'],
      correctAnswer: 'বালুচর',
      explanation: "'প্রতিদান' কবিতাটি কবি জসীমউদ্দীনের বিখ্যাত 'বালুচর' কাব্যগ্রন্থ থেকে সংকলিত।"
    },
    {
      question: "'আমার এ ঘর ভাঙ্গিয়াছে যেবা, আমি বাঁধি তার...'— শূন্যস্থানে কী হবে?",
      options: ['ঘর', 'বাগান', 'সুখ', 'কুল'],
      correctAnswer: 'ঘর',
      explanation: "কবি অহিংসা ও পরম ক্ষমার মাধ্যমে শত্রুকেও আপন করে নেওয়ার মহৎ বার্তা দিয়েছেন।"
    },
    {
      question: "যে কবিকে বিষ দিয়েছে, কবি তার প্রতিদানে কী দিয়েছেন?",
      options: ['মধুর বাণী ও ভালোবাসা', 'বিষ', 'নীরবতা', 'অভিশাপ'],
      correctAnswer: 'মধুর বাণী ও ভালোবাসা',
      explanation: 'কবি প্রতিহিংসার বিপরীতে ক্ষমা, পরোপকার ও ভালোবাসার প্রতিদান দান করেছেন।'
    },
    {
      question: "'প্রতিদান' কবিতার মূল বক্তব্য কী?",
      options: ['শত্রুকেও ভালোবাসায় আপন করে নেওয়া ও আত্মত্যাগ', 'প্রতিশোধ গ্রহণ', 'গ্রামীণ জীবনের কষ্ট', 'প্রকৃতির রূপ বর্ণনা'],
      correctAnswer: 'শত্রুকেও ভালোবাসায় আপন করে নেওয়া ও আত্মত্যাগ',
      explanation: 'ক্ষমা ও ভালোবাসার মাধ্যমে হিংসা জয় করাই এই কবিতার মূল সুর।'
    },
    {
      question: "পল্লীকবি জসীমউদ্দীনকে কী উপাধিতে ভূষিত করা হয়?",
      options: ['পল্লীকবি', 'বিদ্রোহী কবি', 'মহাকবি', 'স্বভাব কবি'],
      correctAnswer: 'পল্লীকবি',
      explanation: 'পল্লীর মানুষের আবেগ, প্রকৃতি ও জীবন সুন্দরভাবে ফুটিয়ে তোলার জন্য তাঁকে পল্লীকবি বলা হয়।'
    }
  ],
  'তাহারেই পড়ে মনে': [
    {
      question: "'তাহারেই পড়ে মনে' কবিতাটি প্রথম কোন পত্রিকায় প্রকাশিত হয়?",
      options: ['মাসিক মোহাম্মদী', 'সওগাত', 'প্রবাসী', 'বঙ্গদর্শন'],
      correctAnswer: 'মাসিক মোহাম্মদী',
      explanation: '১৯৩৫ সালে কবি সুফিয়া কামালের এই বিখ্যাত কবিতাটি মাসিক মোহাম্মদী পত্রিকায় প্রকাশিত হয়।'
    },
    {
      question: "'তাহারেই পড়ে মনে' কবিতায় কার প্রতি কবির গভীর শোক ফুটে উঠেছে?",
      options: ['প্রয়াত স্বামী ও সাহিত্য প্রেরণা সৈয়দ নেহাল হোসেনের', 'পিতার', 'মাতার', 'সন্তানের'],
      correctAnswer: 'প্রয়াত স্বামী ও সাহিত্য প্রেরণা সৈয়দ নেহাল হোসেনের',
      explanation: 'কবির প্রথম স্বামী সৈয়দ নেহাল হোসেনের আকস্মিক মৃত্যুতে কবির হৃদয় বিষাদে নিমগ্ন হয়েছিল।'
    },
    {
      question: "প্রকৃতিতে বসন্ত এলেও কবির মনে কেন উল্লাস নেই?",
      options: ['প্রিয়জন হারানোর শূন্যতা ও বিষাদময় বেদনায়', 'অসুস্থতার কারণে', 'শীতের প্রকোপে', 'কাজের ব্যস্ততায়'],
      correctAnswer: 'প্রিয়জন হারানোর শূন্যতা ও বিষাদময় বেদনায়',
      explanation: 'বসন্তের অপার সৌন্দর্যও কবির ব্যক্তিগত শোককে ঢাকতে পারেনি।'
    },
    {
      question: "কবিতাটি মূলত কোন ধাঁচে রচিত?",
      options: ['কবি ও ভক্তের সংলাপধর্মী নাটকীয় ধাঁচে', 'বর্ণনামূলক ধাঁচে', 'পত্র কবিতায়', 'মহাকাব্যের ধাঁচে'],
      correctAnswer: 'কবি ও ভক্তের সংলাপধর্মী নাটকীয় ধাঁচে',
      explanation: 'কবিতাটিতে কবি ও ভক্তের মধ্যকার মনোমুগ্ধকর কথোপকথন ফুটে উঠেছে।'
    },
    {
      question: "'কহিল সে স্নিগ্ধ আঁখি তুলি— সুরভী কি পবনের বুকে?'— এখানে 'সুরভী' শব্দের অর্থ কী?",
      options: ['সুগন্ধ বা সৌরভ', 'ফুল', 'বসন্ত', 'বাতাস'],
      correctAnswer: 'সুগন্ধ বা সৌরভ',
      explanation: "'সুরভী' শব্দের অর্থ সুবাস বা সুগন্ধ।"
    }
  ],
  'ফেব্রুয়ারি ১৯৬৯': [
    {
      question: "'ফেব্রুয়ারি ১৯৬৯' কবিতাটি কোন ঐতিহাসিক পটভূমিতে রচিত?",
      options: ['১৯৬৯ সালের ঐতিহাসিক গণঅভ্যুত্থান', '১৯৫২ সালের ভাষা আন্দোলন', '১৯৭১ সালের মুক্তিযুদ্ধ', '১৯৬৬ সালের ছয় দফা'],
      correctAnswer: '১৯৬৯ সালের ঐতিহাসিক গণঅভ্যুত্থান',
      explanation: '১৯৬৯ সালে আইয়ুব খানের স্বৈরাচারের বিরুদ্ধে বাঙালির উত্তাল গণঅভ্যুত্থানের প্রেক্ষাপটে রচিত।'
    },
    {
      question: "কবিতায় কবি কৃষ্ণচূড়া ফুলকে কিসের সাথে তুলনা করেছেন?",
      options: ['শহীদের রক্তের বুদ্বুদ ও চেতনার রঙের সাথে', 'বসন্তের সৌন্দর্যের সাথে', 'লাল পতাকার সাথে', 'সূর্যাস্তের সাথে'],
      correctAnswer: 'শহীদের রক্তের বুদ্বুদ ও চেতনার রঙের সাথে',
      explanation: 'কৃষ্ণচূড়ার লাল রঙকে কবি শহীদের আত্মত্যাগের রক্তের প্রতীক হিসেবে দেখেছেন।'
    },
    {
      question: "কবিতায় কার আত্মত্যাগকে বিশেষ শ্রদ্ধায় স্মরণ করা হয়েছে?",
      options: ['শহীদ আসাদ ও বরকত', 'তিতুমীর', 'মতিউর', 'নুরুলদীন'],
      correctAnswer: 'শহীদ আসাদ ও বরকত',
      explanation: '১৯৬৯ এর আসাদ ও ১৯৫২ এর বরকতের রক্ত যেন একই ধারায় একীভূত।'
    },
    {
      question: "'ফেব্রুয়ারি ১৯৬৯' কবিতাটির রচয়িতা কে?",
      options: ['শামসুর রাহমান', 'আল মাহমুদ', 'নির্মলেন্দু গুণ', 'রফিক আজাদ'],
      correctAnswer: 'শামসুর রাহমান',
      explanation: 'আধুনিক বাংলা কবিতার অন্যতম প্রধান কবি শামসুর রাহমান এই কবিতার স্রষ্টা।'
    },
    {
      question: "কবিতায় 'কমলবন' বলতে মূলত কী বোঝানো হয়েছে?",
      options: ['বাঙালির মানবিক ও সুকোমল সাংস্কৃতিক চেতনা', 'পদ্মের বাগান', 'নদী তীরের বন', 'শহরের উদ্যান'],
      correctAnswer: 'বাঙালির মানবিক ও সুকোমল সাংস্কৃতিক চেতনা',
      explanation: 'ঘাতকদের পদতলে দলিত হওয়া মানবিক সংস্কৃতিকেই কমলবন বলা হয়েছে।'
    }
  ],
  'সমাস': [
    {
      question: "'সিংহ চিহ্নিত আসন = সিংহাসন' কোন সমাসের উদাহরণ?",
      options: ['মধ্যপদলোপী কর্মধারয়', 'দ্বন্দ্ব সমাস', 'বহুব্রীহি সমাস', 'তৎপুরুষ সমাস'],
      correctAnswer: 'মধ্যপদলোপী কর্মধারয়',
      explanation: "ব্যাসবাক্যের মধ্যপদের 'চিহ্নিত' লোপ পেয়ে সিংহাসন গঠিত হয়েছে।"
    },
    {
      question: "যে সমাসে পূর্বপদ ও পরপদ উভয়ের অর্থই প্রধানভাবে বজায় থাকে তাকে কী বলে?",
      options: ['দ্বন্দ্ব সমাস', 'দ্বিগু সমাস', 'কর্মধারয় সমাস', 'বহুব্রীহি সমাস'],
      correctAnswer: 'দ্বন্দ্ব সমাস',
      explanation: 'যেমন: মাতা ও পিতা = মাতাপিতা (উভয় পদের অর্থ প্রাধান্য পায়)।'
    },
    {
      question: "'দশ আনন যার = দশানন' কোন সমাস?",
      options: ['বহুব্রীহি সমাস', 'দ্বিগু সমাস', 'কর্মধারয় সমাস', 'তৎপুরুষ সমাস'],
      correctAnswer: 'বহুব্রীহি সমাস',
      explanation: 'যে সমাসে পূর্বপদ বা পরপদ কারও অর্থ না বুঝিয়ে অন্য কোনো ব্যক্তি বা বস্তুকে বোঝায়।'
    },
    {
      question: "পূর্বপদের বিভক্তি লোপ পেয়ে যে সমাস হয় তাকে কী সমাস বলে?",
      options: ['তৎপুরুষ সমাস', 'অব্যয়ীভাব সমাস', 'দ্বন্দ্ব সমাস', 'কর্মধারয় সমাস'],
      correctAnswer: 'তৎপুরুষ সমাস',
      explanation: 'যেমন: বিপদকে আপন্ন = বিপদাপন্ন (দ্বিতীয়া তৎপুরুষ)।'
    },
    {
      question: "'উপকূল' শব্দটির সমাস ও ব্যাসবাক্য কোনটি?",
      options: ['কূলের সমীপে (অব্যয়ীভাব)', 'কূলের বিপরীত (দ্বন্দ্ব)', 'উপ যে কূল (কর্মধারয়)', 'কূলের জন্য (তৎপুরুষ)'],
      correctAnswer: 'কূলের সমীপে (অব্যয়ীভাব)',
      explanation: "সমীপ্য অর্থে 'উপ' অব্যয়যোগে অব্যয়ীভাব সমাস নিষ্পন্ন হয়েছে।"
    }
  ],
  'কারক': [
    {
      question: "'তিলে তৈল আছে'— এখানে 'তিলে' কোন কারকে কোন বিভক্তি?",
      options: ['অধিকরণে ৭মী (এ-বিভক্তি)', 'অপাদানে ৭মী', 'করণে ৭মী', 'কর্মে ৭মী'],
      correctAnswer: 'অধিকরণে ৭মী (এ-বিভক্তি)',
      explanation: 'স্থান বা বস্তুর সর্বত্র ব্যপ্ত থাকা বোঝাতে অভিব্যাপক অধিকরণ কারক হয়।'
    },
    {
      question: "'বাবা বাড়ি নেই'— এখানে 'বাড়ি' কোন কারকে কোন বিভক্তি?",
      options: ['অধিকরণে শূন্য বিভক্তি', 'অপাদানে শূন্য', 'কর্মে শূন্য', 'কর্তায় শূন্য'],
      correctAnswer: 'অধিকরণে শূন্য বিভক্তি',
      explanation: 'স্থান নির্দেশ করায় অধিকরণ কারক এবং কোনো বিভক্তি চিহ্ন না থাকায় প্রথমা/শূন্য।'
    },
    {
      question: "'ঘোড়ায় গাড়ি টানে'— 'ঘোড়ায়' কোন কারকে কোন বিভক্তি?",
      options: ['কর্তৃকারকে ৭মী (য়-বিভক্তি)', 'করণে ৭মী', 'অপাদানে ৭মী', 'কর্মে ৭মী'],
      correctAnswer: 'কর্তৃকারকে ৭মী (য়-বিভক্তি)',
      explanation: 'ক্রিয়া সম্পাদনকারী ঘোড়া, তাই কর্তৃকারক।'
    },
    {
      question: "'কলম দিয়ে লিখি'— এখানে 'কলম দিয়ে' কোন কারক?",
      options: ['করণ কারক', 'কর্ম কারক', 'অপাদান কারক', 'অধিকরণ কারক'],
      correctAnswer: 'করণ কারক',
      explanation: 'ক্রিয়া সম্পাদনের উপকরণ বা মাধ্যম হলো করণ কারক।'
    },
    {
      question: "'গাছ থেকে পাতা পড়ে'— 'গাছ থেকে' কোন কারক?",
      options: ['অপাদান কারক', 'অধিকরণ কারক', 'করণ কারক', 'কর্ম কারক'],
      correctAnswer: 'অপাদান কারক',
      explanation: 'যা থেকে কোনো কিছু বিচ্যুত, পতিত বা জাত হয় তা অপাদান কারক।'
    }
  ],
  'বানান': [
    {
      question: "বাংলা একাডেমির প্রমিত বানানের নিয়ম অনুযায়ী নিচের কোন বানানটি শুদ্ধ?",
      options: ['মুহূর্ত', 'মুহুর্ত', 'মুহূত্ত', 'মুহুর্ত্ত'],
      correctAnswer: 'মুহূর্ত',
      explanation: 'হ-এ দীর্ঘ-উ এবং র-এর রেফ ত-এর উপর (মুহূর্ত)।'
    },
    {
      question: "তৎসম ব্যতীত সকল অতৎসম (দেশি, বিদেশি, তদ্ভব) শব্দে কোন কার ব্যবহৃত হবে?",
      options: ['হ্রস্ব ই-কার (ি)', 'দীর্ঘ ঈ-কার (ী)', 'উভয়ই', 'কোনোটিই নয়'],
      correctAnswer: 'হ্রস্ব ই-কার (ি)',
      explanation: 'প্রমিত নিয়মে অতৎসম শব্দে কেবল হ্রস্ব ই (ি) ব্যবহৃত হয় (যেমন: সরকারি, জানুয়ারি)।'
    },
    {
      question: "নিচের কোন বানানটি শুদ্ধ?",
      options: ['পুরস্কার', 'পুরষ্কার', 'পুুরস্কার', 'পুরোস্কার'],
      correctAnswer: 'পুরস্কার',
      explanation: "অ-কারের পর বিসর্গ থাকলে দন্ত্য-স হয় (পুরস্কার)।"
    },
    {
      question: "নিচের কোন বানানগুচ্ছের সবগুলো বানানই শুদ্ধ?",
      options: ['মুমূর্ষু, সান্ত্বনা, উজ্জ্বল', 'মুমুর্য, সান্তনা, উজ্জল', 'মুমূর্ষু, শান্তনা, উজ্জল', 'মুমূর্যু, সান্তনা, উজ্জ্বল'],
      correctAnswer: 'মুমূর্ষু, সান্ত্বনা, উজ্জ্বল',
      explanation: "মুমূর্ষু (হ্রস্ব-উ, দীর্ঘ-উ, হ্রস্ব-উ) এবং সান্ত্বনা (ন্ত্ব) প্রমিত রূপ।"
    }
  ],
  'উপসর্গ': [
    {
      question: "বাংলা ভাষায় ব্যবহৃত খাঁটি বাংলা উপসর্গ মোট কতটি?",
      options: ['২১টি', '২০টি', '২৫টি', '১৯টি'],
      correctAnswer: '২১টি',
      explanation: 'বাংলা ভাষায় খাঁটি বাংলা উপসর্গ ২১টি এবং সংস্কৃত উপসর্গ ২০টি।'
    },
    {
      question: "নিচের কোন চারটি উপসর্গ বাংলা ও সংস্কৃত উভয় ভাষাতেই রয়েছে?",
      options: ['আ, সু, বি, নি', 'অ, অনা, কু, নি', 'প্র, পরা, অপ, সম', 'গর, বে, কম, দর'],
      correctAnswer: 'আ, সু, বি, নি',
      explanation: "'আ, সু, বি, নি' এই চারটি উপসর্গ উভয় শ্রেণিতেই ব্যবহৃত হয়।"
    },
    {
      question: "'অনুপস্থিত' শব্দটিতে 'অনু' উপসর্গটি কী অর্থে ব্যবহৃত হয়েছে?",
      options: ['অভাব বা নেতিবাচক অর্থে', 'সাদৃশ্য অর্থে', 'পশ্চাৎ অর্থে', 'পুনঃপুন অর্থে'],
      correctAnswer: 'অভাব বা নেতিবাচক অর্থে',
      explanation: 'উপস্থিতির অভাব বোঝাতে নেতিবাচক অর্থে অনু/অন ব্যবহৃত।'
    }
  ],
  'বাক্য রূপান্তর': [
    {
      question: "'যাঁরা পরিশ্রম করেন, তাঁরা সফল হন'— বাক্যটি কোন শ্রেণির?",
      options: ['জটিল বা মিশ্র বাক্য', 'সরল বাক্য', 'যৌগিক বাক্য', 'আবেগসূচক বাক্য'],
      correctAnswer: 'জটিল বা মিশ্র বাক্য',
      explanation: "'যাঁরা...তাঁরা' সাপেক্ষ সর্বনাম দ্বারা যুক্ত হওয়ায় এটি জটিল বাক্য।"
    },
    {
      question: "'পরিশ্রমীরাই সফল হন'— এটি কোন বাক্যের উদাহরণ?",
      options: ['সরল বাক্য', 'জটিল বাক্য', 'যৌগিক বাক্য', 'প্রশ্নবোধক বাক্য'],
      correctAnswer: 'সরল বাক্য',
      explanation: 'একটিমাত্র কর্তা এবং একটিমাত্র সমাপিকা ক্রিয়া থাকায় এটি সরল বাক্য।'
    },
    {
      question: "'তিনি ধনী, কিন্তু অসৎ'— এটি কোন শ্রেণির বাক্য?",
      options: ['যৌগিক বাক্য', 'সরল বাক্য', 'জটিল বাক্য', 'শর্তসূচক বাক্য'],
      correctAnswer: 'যৌগিক বাক্য',
      explanation: "'কিন্তু' সংযোজক/বিয়োজক অব্যয় দ্বারা দুটি স্বাধীন বাক্য যুক্ত হয়েছে।"
    }
  ],

  // ------------------- ইংরেজি (ENGLISH) -------------------
  'verbs': [
    {
      question: "Neither of the two candidates _____ qualified for the post.",
      options: ['is', 'are', 'were', 'have been'],
      correctAnswer: 'is',
      explanation: "'Neither of' is followed by a plural noun but takes a singular verb."
    },
    {
      question: "One of my closest friends _____ going abroad next week.",
      options: ['is', 'are', 'were', 'have been'],
      correctAnswer: 'is',
      explanation: "'One of + plural noun' always takes a singular verb."
    },
    {
      question: "He talks as if he _____ everything.",
      options: ['knew', 'knows', 'has known', 'will know'],
      correctAnswer: 'knew',
      explanation: "Clauses after 'as if' take past subjunctive when the main clause is present."
    },
    {
      question: "I look forward to _____ from you soon.",
      options: ['hearing', 'hear', 'heard', 'be hearing'],
      correctAnswer: 'hearing',
      explanation: "Expressions like 'look forward to' take a gerund (verb + ing)."
    },
    {
      question: "If I had studied harder, I _____ the examination.",
      options: ['would have passed', 'will pass', 'passed', 'would pass'],
      correctAnswer: 'would have passed',
      explanation: "Third conditional structure: If + past perfect, would have + past participle."
    }
  ],
  'voice': [
    {
      question: "Change into passive: 'Who broke the glass?'",
      options: ['By whom was the glass broken?', 'Who was the glass broken by?', 'By whom the glass was broken?', 'By whom is the glass broken?'],
      correctAnswer: 'By whom was the glass broken?',
      explanation: "Interrogative passive with 'who' begins with 'By whom + auxiliary + subject + V3?'"
    },
    {
      question: "Passive form of: 'Do the work.'",
      options: ['Let the work be done.', 'You are told to work.', 'The work should be done.', 'Let do the work.'],
      correctAnswer: 'Let the work be done.',
      explanation: "Imperative sentences take the structure 'Let + object + be + past participle'."
    },
    {
      question: "Active of: 'He was seen singing by me.'",
      options: ['I saw him singing.', 'I had seen him singing.', 'I was seeing him sing.', 'He sang to me.'],
      correctAnswer: 'I saw him singing.',
      explanation: "Past simple passive converts directly to active subject + V2 + object."
    }
  ],
  'preposition': [
    {
      question: "She is interested _____ learning computer programming.",
      options: ['in', 'at', 'on', 'with'],
      correctAnswer: 'in',
      explanation: "The appropriate preposition after 'interested' is 'in'."
    },
    {
      question: "He is senior _____ me by two years.",
      options: ['to', 'than', 'from', 'of'],
      correctAnswer: 'to',
      explanation: "Latin comparatives like senior, junior, superior take 'to', not 'than'."
    },
    {
      question: "He died _____ malaria last month.",
      options: ['of', 'from', 'by', 'for'],
      correctAnswer: 'of',
      explanation: "When dying of a disease or illness, 'die of' is the correct preposition."
    }
  ],

  // ------------------- গণিত (MATH) -------------------
  'বীজগণিত': [
    {
      question: "নিচের কোনটি একটি দ্বিঘাত সমীকরণের আদর্শ রূপ?",
      options: ['ax² + bx + c = 0', 'ax + b = 0', 'ax³ + bx² + c = 0', 'a/x + b = 0'],
      correctAnswer: 'ax² + bx + c = 0',
      explanation: 'দ্বিঘাত সমীকরণে অজ্ঞাত রাশির সর্বোচ্চ ঘাত ২ হয়।'
    },
    {
      question: "যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?",
      options: ['14', '16', '18', '12'],
      correctAnswer: '14',
      explanation: 'x² + 1/x² = (x + 1/x)² - 2 = 16 - 2 = 14।'
    },
    {
      question: "যদি a + b = 7 এবং ab = 10 হয়, তবে a² + b² এর মান কত?",
      options: ['29', '49', '39', '19'],
      correctAnswer: '29',
      explanation: 'a² + b² = (a + b)² - 2ab = 49 - 20 = 29।'
    },
    {
      question: "(a - b)² এর সঠিক সম্প্রসারিত সূত্র কোনটি?",
      options: ['a² - 2ab + b²', 'a² + 2ab + b²', 'a² - b²', '(a + b)(a - b)'],
      correctAnswer: 'a² - 2ab + b²',
      explanation: '(a - b)² = a² - 2ab + b²।'
    },
    {
      question: "a³ - b³ এর উৎপাদকে বিশ্লেষণ সূত্র কোনটি?",
      options: ['(a - b)(a² + ab + b²)', '(a - b)(a² - ab + b²)', '(a + b)(a² - ab + b²)', '(a - b)³ + 3ab(a - b)'],
      correctAnswer: '(a - b)(a² + ab + b²)',
      explanation: 'উৎপাদকে বিশ্লেষণ: a³ - b³ = (a - b)(a² + ab + b²)।'
    }
  ],
  'ত্রিকোণমিতি': [
    {
      question: "sin²θ + cos²θ এর মান কত?",
      options: ['১', '০', '২', '-১'],
      correctAnswer: '১',
      explanation: 'ত্রিকোণমিতির মৌলিক অভেদ sin²θ + cos²θ = ১।'
    },
    {
      question: "tan 45° এর মান কত?",
      options: ['১', '০', '১/√৩', '√৩'],
      correctAnswer: '১',
      explanation: 'tan 45° = sin 45° / cos 45° = (1/√2) / (1/√2) = 1।'
    },
    {
      question: "একটি সমকোণী ত্রিভুজের লম্ব ৪ সেমি ও ভূমি ৩ সেমি হলে অতিভুজ কত?",
      options: ['৫ সেমি', '৭ সেমি', '৬ সেমি', '৮ সেমি'],
      correctAnswer: '৫ সেমি',
      explanation: 'অতিভুজ = √(৪² + ৩²) = √(১৬ + ৯) = √২৫ = ৫ সেমি।'
    }
  ],
  'লগারিদম': [
    {
      question: "log₁₀(1000) এর মান কত?",
      options: ['৩', '২', '১', '৪'],
      correctAnswer: '৩',
      explanation: '১০০০ = ১০³, সুতরাং log₁₀(১০³) = ৩।'
    },
    {
      question: "যেকোনো ভিত্তি a এর জন্য log_a(1) এর মান কত?",
      options: ['০', '১', 'a', 'অসীম'],
      correctAnswer: '০',
      explanation: 'a⁰ = ১, তাই log_a(১) = ০।'
    }
  ],

  // ------------------- পদার্থবিজ্ঞান (PHYSICS) -------------------
  'পদার্থবিজ্ঞান': [
    {
      question: "নিউটনের গতির দ্বিতীয় সূত্রানুসারে প্রযুক্ত বল (F) এর সমীকরণ কোনটি?",
      options: ['F = ma', 'F = mv', 'F = m/a', 'F = 1/2mv²'],
      correctAnswer: 'F = ma',
      explanation: 'বস্তুর ভরবেগের পরিবর্তনের হার তার ওপর প্রযুক্ত বলের সমানুপাতিক (F = ma)।'
    },
    {
      question: "পড়ন্ত বস্তুর ক্ষেত্রে অভিকর্ষজ ত্বরণ 'g' এর আদর্শ মান কত?",
      options: ['9.8 m/s²', '9.8 m/s', '8.9 m/s²', '10 m/s'],
      correctAnswer: '9.8 m/s²',
      explanation: 'ভূপৃষ্ঠে অভিকর্ষজ ত্বরণের আদর্শ মান ৯.৮ মিটার/সেকেন্ড²।'
    },
    {
      question: "কাজের এসআই (SI) একক কী?",
      options: ['জুল (Joule)', 'নিউটন (Newton)', 'ওয়াট (Watt)', 'প্যাসকেল (Pascal)'],
      correctAnswer: 'জুল (Joule)',
      explanation: 'কাজের আন্তর্জাতিক একক হলো জুল।'
    },
    {
      question: "একটি চলন্ত গাড়ির গতিশক্তি কোন সমীকরণ দ্বারা নির্ধারিত হয়?",
      options: ['Ek = 1/2 mv²', 'Ek = mgh', 'Ek = mv', 'Ek = Fs'],
      correctAnswer: 'Ek = 1/2 mv²',
      explanation: 'গতিশক্তি Ek = ১/২ × ভর (m) × বেগ² (v²)।'
    },
    {
      question: "শব্দ তরঙ্গ কোন ধরনের তরঙ্গ?",
      options: ['অনুদৈর্ঘ্য বা যান্ত্রিক তরঙ্গ', 'তড়িৎচৌম্বকীয় তরঙ্গ', 'আলোক তরঙ্গ', 'তির্যক তরঙ্গ'],
      correctAnswer: 'অনুদৈর্ঘ্য বা যান্ত্রিক তরঙ্গ',
      explanation: 'শব্দ চলাচলের জন্য জড় মাধ্যমের প্রয়োজন হয় এবং এটি অনুদৈর্ঘ্য তরঙ্গ।'
    }
  ],

  // ------------------- রসায়ন (CHEMISTRY) -------------------
  'রসায়ন': [
    {
      question: "পানির রাসায়নিক সংকেত কোনটি?",
      options: ['H₂O', 'CO₂', 'H₂O₂', 'NaCl'],
      correctAnswer: 'H₂O',
      explanation: 'পানির অণুতে দুটি হাইড্রোজেন এবং একটি অক্সিজেন পরমাণু যুক্ত থাকে।'
    },
    {
      question: "পর্যায় সারণির আধুনিক জনক কাকে বলা হয় বা এটি কার পারমাণবিক সংখ্যার ওপর ভিত্তি করে প্রতিষ্ঠিত?",
      options: ['হেনরি মোসলে', 'মেন্ডেলিভ', 'ডাল্টন', 'রাদারফোর্ড'],
      correctAnswer: 'হেনরি মোসলে',
      explanation: 'হেনরি মোসলে পারমাণবিক সংখ্যার ভিত্তিতে আধুনিক পর্যায় সারণির বিন্যাস প্রস্তাব করেন।'
    },
    {
      question: "নিচের কোনটি নিষ্ক্রিয় গ্যাস (Noble Gas)?",
      options: ['হিলিয়াম (He)', 'অক্সিজেন (O₂)', 'নাইট্রোজেন (N₂)', 'হাইড্রোজেন (H₂)'],
      correctAnswer: 'হিলিয়াম (He)',
      explanation: 'হিলিয়াম পর্যায় সারণির ১৮তম গ্রুপের নিষ্ক্রিয় গ্যাস।'
    },
    {
      question: "খাবার লবণের রাসায়নিক নাম কী?",
      options: ['সোডিয়াম ক্লোরাইড (NaCl)', 'ক্যালসিয়াম কার্বনেট', 'সোডিয়াম বাইকার্বনেট', 'পটাশিয়াম আয়োডাইড'],
      correctAnswer: 'সোডিয়াম ক্লোরাইড (NaCl)',
      explanation: 'খাবার লবণ হলো সোডিয়াম ও ক্লোরিনের আয়নিক যৌগ সোডিয়াম ক্লোরাইড।'
    },
    {
      question: "নিরপেক্ষ পানির pH মান কত?",
      options: ['৭', '০', '১৪', '৫'],
      correctAnswer: '৭',
      explanation: 'pH স্কেলে ৭ মান নিরপেক্ষ জলীয় দ্রবণ নির্দেশ করে।'
    }
  ],

  // ------------------- জীববিজ্ঞান ও বিজ্ঞান (BIOLOGY & SCIENCE) -------------------
  'বিজ্ঞান': [
    {
      question: "উদ্ভিদের সালোকসংশ্লেষণ প্রক্রিয়ায় কোন গ্যাস প্রধান কাঁচামাল হিসেবে গৃহীত হয়?",
      options: ['কার্বন ডাই-অক্সাইড (CO₂)', 'অক্সিজেন (O₂)', 'নাইট্রোজেন (N₂)', 'মিথেন'],
      correctAnswer: 'কার্বন ডাই-অক্সাইড (CO₂)',
      explanation: 'উদ্ভিদ বায়ুমণ্ডল থেকে CO₂ গ্রহণ করে এবং সৌরশক্তির সাহায্যে গ্লুকোজ তৈরি করে।'
    },
    {
      question: "কোষের 'শক্তিঘর' বা Powerhouse কাকে বলা হয়?",
      options: ['মাইটোকন্ড্রিয়া', 'নিউক্লিয়াস', 'রাইবোসোম', 'গলজি বস্তু'],
      correctAnswer: 'মাইটোকন্ড্রিয়া',
      explanation: 'মাইটোকন্ড্রিয়াতে শ্বসনের এটিপি (শক্তি) উৎপাদিত হয় বলে একে কোষের পাওয়ারহাউজ বলে।'
    },
    {
      question: "মানবদেহের স্বাভাবিক তাপমাত্রা কত?",
      options: ['৯৮.৪° ফারেনহাইট (বা ৩৭° সেলসিয়াস)', '১০০° ফারেনহাইট', '৯৬° ফারেনহাইট', '১০২° ফারেনহাইট'],
      correctAnswer: '৯৮.৪° ফারেনহাইট (বা ৩৭° সেলসিয়াস)',
      explanation: 'সুস্থ মানবদেহের আদর্শ তাপমাত্রা প্রায় ৯৮.৪°F বা ৩৭°C।'
    },
    {
      question: "রক্তের কোন উপাদান শরীরে রোগ প্রতিরোধ ক্ষমতা তৈরি করে?",
      options: ['শ্বেত রক্তকণিকা (WBC)', 'লোহিত রক্তকণিকা (RBC)', 'অনুচক্রিকা (Platelet)', 'প্লাজমা'],
      correctAnswer: 'শ্বেত রক্তকণিকা (WBC)',
      explanation: 'শ্বেত রক্তকণিকা বা লিউকোসাইট অ্যান্টিবডি তৈরি করে জীবাণু ধ্বংস করে।'
    },
    {
      question: "সূর্যের আলো থেকে আমাদের ত্বক কোন ভিটামিন সংশ্লেষ করে?",
      options: ['ভিটামিন ডি (Vitamin D)', 'ভিটামিন এ', 'ভিটামিন সি', 'ভিটামিন বি'],
      correctAnswer: 'ভিটামিন ডি (Vitamin D)',
      explanation: 'সূর্যরশ্মির উপস্থিতিতে ত্বকে ভিটামিন ডি উৎপাদিত হয়।'
    }
  ],

  // ------------------- আইসিটি (ICT) -------------------
  'আইসিটি': [
    {
      question: "বাইনারি সংখ্যা পদ্ধতিতে কয়টি মৌলিক প্রতীক বা অঙ্ক ব্যবহৃত হয়?",
      options: ['২টি (০ এবং ১)', '১০টি', '৮টি', '১৬টি'],
      correctAnswer: '২টি (০ এবং ১)',
      explanation: 'বাইনারিতে কেবল দুটি অঙ্ক ০ এবং ১ ব্যবহৃত হয় (বেস ২)।'
    },
    {
      question: "১ গিগাবাইট (1 GB) সমান কত মেগাবাইট (MB)?",
      options: ['১০২৪ MB', '১০০০ MB', '৫১২ MB', '২০৪৮ MB'],
      correctAnswer: '১০২৪ MB',
      explanation: '১ GB = ১০২৪ MB (২¹⁰ মেগাবাইট)।'
    },
    {
      question: "HTML এর পূর্ণরূপ কোনটি?",
      options: ['HyperText Markup Language', 'HyperText Machine Language', 'HighText Markup Language', 'HyperTransfer Mode Link'],
      correctAnswer: 'HyperText Markup Language',
      explanation: 'ওয়েব পেজ তৈরির প্রমিত ভাষা হলো HyperText Markup Language।'
    },
    {
      question: "কম্পিউটারের মস্তিষ্ক হিসেবে কোন অংশকে বিবেচনা করা হয়?",
      options: ['সিপিইউ (CPU)', 'র‍্যাম (RAM)', 'হার্ডডিস্ক', 'মনিটর'],
      correctAnswer: 'সিপিইউ (CPU)',
      explanation: 'সেন্ট্রাল প্রসেসিং ইউনিট (CPU) সব গাণিতিক ও যৌক্তিক নিয়ন্ত্রণ সম্পন্ন করে।'
    }
  ]
};

/**
 * Returns matching questions strictly for the requested subject and chapter.
 * Never switches subjects (e.g. if subject is Bangla, it will NEVER return Math or English).
 */
export const getQuestionsForChapter = (
  subject: string,
  chapter: string,
  count: number = 5,
  marksPerQuestion: number = 1
) => {
  const normSub = (subject || '').trim().toLowerCase();
  const normChap = (chapter || '').trim().toLowerCase();

  let pool: ChapterSeedQuestion[] = [];

  // 1. Direct search in the question bank for keyword matches
  for (const [key, questions] of Object.entries(CHAPTER_QUESTION_BANK)) {
    const keyLower = key.toLowerCase();
    if (normChap.includes(keyLower) || keyLower.includes(normChap)) {
      pool = questions;
      break;
    }
  }

  // 2. Strict Subject Guard: If not directly found by chapter keyword, match strictly within subject!
  if (pool.length === 0) {
    if (normSub.includes('বাংলা') || normSub.includes('bangla')) {
      if (normChap.includes('সোনার') || normChap.includes('তরী')) pool = CHAPTER_QUESTION_BANK['সোনার তরী'];
      else if (normChap.includes('বিদ্রোহী')) pool = CHAPTER_QUESTION_BANK['বিদ্রোহী'];
      else if (normChap.includes('প্রতিদান')) pool = CHAPTER_QUESTION_BANK['প্রতিদান'];
      else if (normChap.includes('তাহারেই')) pool = CHAPTER_QUESTION_BANK['তাহারেই পড়ে মনে'];
      else if (normChap.includes('ফেব্রুয়ারি') || normChap.includes('১৯৬৯')) pool = CHAPTER_QUESTION_BANK['ফেব্রুয়ারি ১৯৬৯'];
      else if (normChap.includes('রেইনকোট')) pool = CHAPTER_QUESTION_BANK['রেইনকোট'];
      else if (normChap.includes('বায়ান্ন')) pool = CHAPTER_QUESTION_BANK['বায়ান্নর দিনগুলো'];
      else if (normChap.includes('বিলাসী')) pool = CHAPTER_QUESTION_BANK['বিলাসী'];
      else if (normChap.includes('সমাস')) pool = CHAPTER_QUESTION_BANK['সমাস'];
      else if (normChap.includes('কারক')) pool = CHAPTER_QUESTION_BANK['কারক'];
      else if (normChap.includes('বানান')) pool = CHAPTER_QUESTION_BANK['বানান'];
      else if (normChap.includes('উপসর্গ') || normChap.includes('প্রত্যয়')) pool = CHAPTER_QUESTION_BANK['উপসর্গ'];
      else if (normChap.includes('বাক্য')) pool = CHAPTER_QUESTION_BANK['বাক্য রূপান্তর'];
      else pool = CHAPTER_QUESTION_BANK['অপরিচিতা'];
    } else if (normSub.includes('ইং') || normSub.includes('eng')) {
      if (normChap.includes('voice')) pool = CHAPTER_QUESTION_BANK['voice'];
      else if (normChap.includes('prep')) pool = CHAPTER_QUESTION_BANK['preposition'];
      else pool = CHAPTER_QUESTION_BANK['verbs'];
    } else if (normSub.includes('পদার্থ') || normSub.includes('phy')) {
      pool = CHAPTER_QUESTION_BANK['পদার্থবিজ্ঞান'];
    } else if (normSub.includes('রসায়') || normSub.includes('chem')) {
      pool = CHAPTER_QUESTION_BANK['রসায়ন'];
    } else if (normSub.includes('ict') || normSub.includes('আইসিটি') || normSub.includes('তথ্য')) {
      pool = CHAPTER_QUESTION_BANK['আইসিটি'];
    } else if (normSub.includes('বিজ্ঞ') || normSub.includes('জীব') || normSub.includes('bio')) {
      pool = CHAPTER_QUESTION_BANK['বিজ্ঞান'];
    } else {
      // Math
      if (normChap.includes('ত্রিকোণ')) pool = CHAPTER_QUESTION_BANK['ত্রিকোণমিতি'];
      else if (normChap.includes('লগ')) pool = CHAPTER_QUESTION_BANK['লগারিদম'];
      else pool = CHAPTER_QUESTION_BANK['বীজগণিত'];
    }
  }

  // 3. Guarantee requested number of questions
  const results = [];
  for (let i = 0; i < count; i++) {
    const q = pool[i % pool.length];
    results.push({
      id: 'pq_' + Date.now().toString(36) + '_' + i,
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      marks: marksPerQuestion,
      explanation: q.explanation
    });
  }

  return results;
};
