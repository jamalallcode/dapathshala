import { CommunityQuestion, PeerFriend, QuizQuestion, SubjectType } from './types';

export const INITIAL_PEER_FRIENDS: PeerFriend[] = [
  {
    id: 'friend-1',
    name: 'তাহমিদ চৌধুরী',
    institution: 'নটর ডেম কলেজ • মেধা একাডেমি',
    avatar: '👨‍🎓',
    status: 'online',
    rating: 1540,
    wins: 28,
    matchesPlayed: 35
  },
  {
    id: 'friend-2',
    name: 'নুসরাত ফারজানা',
    institution: 'ভিকারুননিসা নূন • উদ্ভাস কেয়ার',
    avatar: '👩‍🎓',
    status: 'online',
    rating: 1620,
    wins: 42,
    matchesPlayed: 48
  },
  {
    id: 'friend-3',
    name: 'সাজিদ মাহমুদ',
    institution: 'ঢাকা কলেজ • রেটিনা একাডেমি',
    avatar: '🧑‍💻',
    status: 'online',
    rating: 1480,
    wins: 19,
    matchesPlayed: 26
  },
  {
    id: 'friend-4',
    name: 'রাইসা ইসলাম',
    institution: 'রাজশাহী কলেজ • ওমেগা সায়েন্স',
    avatar: '🔬',
    status: 'in_game',
    rating: 1510,
    wins: 23,
    matchesPlayed: 30
  },
  {
    id: 'friend-5',
    name: 'সামিউল হক',
    institution: 'চট্টগ্রাম কলেজ • সাইন্স কেয়ার',
    avatar: '📐',
    status: 'offline',
    rating: 1390,
    wins: 12,
    matchesPlayed: 18
  }
];

export const INITIAL_QUESTIONS: CommunityQuestion[] = [
  {
    id: 'q-101',
    title: 'প্রাসের গতিতে সর্বোচ্চ উচ্চতায় বেগ কেন শূন্য হয় না?',
    content: 'প্রাসের সর্বোচ্চ বিন্দুতে পৌঁছালে আমরা জানি উল্লম্ব বেগ Vy = 0 হয়, কিন্তু আনুভূমিক বেগ Vx কি বজায় থাকে? তাহলে সর্বোচ্চ বিন্দুতে মোট বেগ কত হবে এবং কেন ত্বরণ g কাজ করবে?',
    subject: 'পদার্থবিজ্ঞান',
    grade: 'এইচএসসি (বিজ্ঞান)',
    authorName: 'আবরার নাদিম',
    authorAvatar: '👨‍🎓',
    authorCoaching: 'মেধা একাডেমি (ধানমন্ডি)',
    tags: ['#গতিবিদ্যা', '#প্রাস', '#এইচএসসি'],
    upvotes: 24,
    downvotes: 1,
    createdAt: '২ ঘণ্টা আগে',
    views: 184,
    hasAcceptedAnswer: true,
    answers: [
      {
        id: 'ans-1',
        authorName: 'ডাঃ তানভীর আহমেদ (শিক্ষক)',
        authorAvatar: '👨‍🏫',
        authorCoaching: 'দা-পাঠশালা ফিজিক্স ফ্যাকাল্টি',
        isTeacher: true,
        content: 'খুব চমৎকার ও গুরুত্বপূর্ণ প্রশ্ন! প্রাসের ক্ষেত্রে আনুভূমিক বরাবর কোনো বাহ্যিক বল বা ত্বরণ থাকে না (বাতাসের বাধা অগ্রাহ্য করলে)। তাই আনুভূমিক বেগ Vx = V₀ cosθ সর্বদা ধ্রুবক থাকে। সর্বোচ্চ উচ্চতায় কেবল উল্লম্ব বেগ Vy = 0 হয়। ফলে সর্বোচ্চ বিন্দুতে লব্ধি বেগ V = Vx = V₀ cosθ। আর এই বিন্দুতেও অভিকর্ষজ ত্বরণ g খাড়া নিচের দিকে কাজ করে বলেই প্রাসের গতিপথ অধিবৃত্তাকার (parabolic) হয়।',
        upvotes: 38,
        downvotes: 0,
        isAccepted: true,
        createdAt: '১ ঘণ্টা আগে'
      },
      {
        id: 'ans-2',
        authorName: 'নুসরাত ফারজানা',
        authorAvatar: '👩‍🎓',
        authorCoaching: 'ভিকারুননিসা নূন',
        content: 'একমত! মনে রাখার সহজ ট্রিক: প্রাস অনুভূমিক বরাবর সমবেগে চলে আর উলম্ব বরাবর সমত্বরণে (মন্দনসহ) চলে। তাই শীর্ষে লম্ব বেগ শূন্য হলেও অনুভূমিক বেগ শূন্য নয়।',
        upvotes: 12,
        downvotes: 0,
        createdAt: '৪৫ মিনিট আগে'
      }
    ]
  },
  {
    id: 'q-102',
    title: 'জৈব রসায়নে মারকনিকভ নিয়ম এবং বিপরীত মারকনিকভ নিয়মের মূল পার্থক্য কী?',
    content: 'অপ্রতিসম অ্যালকিনের সাথে HBr সংযোজনে কখন কার্বোক্যাটায়ন তৈরি হয় আর কখন পারঅক্সাইড (খারাস প্রভাব) দিলে অ্যান্টি-মারকনিকভ উৎপাদ প্রধান হয়? ফ্রি-র‍্যাডিক্যাল মেকানিজম সংক্ষেপে ব্যাখ্যা করলে খুব উপকৃত হতাম।',
    subject: 'রসায়ন',
    grade: 'এইচএসসি (বিজ্ঞান)',
    authorName: 'সাদিয়া জাহান',
    authorAvatar: '👩‍🎓',
    authorCoaching: 'অগ্রদূত একাডেমি (উত্তরা)',
    tags: ['#জৈবরসায়ন', '#মারকনিকভ', '#অ্যালকিন'],
    upvotes: 19,
    downvotes: 0,
    createdAt: '৩ ঘণ্টা আগে',
    views: 142,
    hasAcceptedAnswer: false,
    answers: [
      {
        id: 'ans-3',
        authorName: 'সাজিদ মাহমুদ',
        authorAvatar: '🧑‍💻',
        authorCoaching: 'ঢাকা কলেজ',
        content: 'সাধারণ অবস্থায় HBr যুক্ত হলে ইলেক্ট্রোফিলিক সংযোজন ঘটে এবং ২° কার্বোক্যাটায়ন বেশি স্থায়ী হওয়ায় মারকনিকভ নিয়মে হাইড্রোজেন যেখানে হাইড্রোজেন বেশি সেখানে যুক্ত হয়। কিন্তু জৈব পারঅক্সাইড (R-O-O-R) থাকলে বিক্রিয়াটি ব্রোমিন ফ্রি-র‍্যাডিক্যাল দ্বারা শুরু হয়। ২° ফ্রি-র‍্যাডিক্যাল অধিক স্থায়ী হওয়ায় ব্রোমিন কম হাইড্রোজেনযুক্ত কার্বনে আগে যুক্ত হয়, ফলে অ্যান্টি-মারকনিকভ উৎপাদ গঠিত হয়।',
        upvotes: 21,
        downvotes: 1,
        isAccepted: false,
        createdAt: '২ ঘণ্টা আগে'
      }
    ]
  },
  {
    id: 'q-103',
    title: 'ফাংশনের লিমিট x→0 হলে sin(ax)/sin(bx) এর সরাসরি মান কত?',
    content: 'এইচএসসি পরীক্ষায় এই টাইপের বহু নির্বাচনী প্রশ্ন প্রায়ই আসে। এল-হসপিটাল (L\'Hôpital) রুল ছাড়া সূত্র দিয়ে দ্রুত ৫ সেকেন্ডে বের করার কোনো শর্টকাট আছে কি?',
    subject: 'উচ্চতর গণিত',
    grade: 'এসএসসি / এইচএসসি',
    authorName: 'রাকিবুল হাসান',
    authorAvatar: '🧑‍🎓',
    authorCoaching: 'প্রয়াস ক্যাডেট একাডেমি',
    tags: ['#ক্যালকুলাস', '#লিমিট', '#শর্টকাট'],
    upvotes: 31,
    downvotes: 0,
    createdAt: '৫ ঘণ্টা আগে',
    views: 295,
    hasAcceptedAnswer: true,
    answers: [
      {
        id: 'ans-4',
        authorName: 'তাহমিদ চৌধুরী',
        authorAvatar: '👨‍🎓',
        authorCoaching: 'নটর ডেম কলেজ',
        content: 'সহজ উত্তর হলো a/b। কারণ lim(x→0) sin(ax)/(ax) = 1। সুতরাং [sin(ax)/(ax) * a] / [sin(bx)/(bx) * b] = (1 * a)/(1 * b) = a/b। যেকোনো sin, tan এর ক্ষেত্রে সহগের অনুপাতই সরাসরি উত্তর!',
        upvotes: 45,
        downvotes: 0,
        isAccepted: true,
        createdAt: '৪ ঘণ্টা আগে'
      }
    ]
  }
];

export const BATTLE_QUIZ_BANKS: Record<SubjectType, QuizQuestion[]> = {
  'পদার্থবিজ্ঞান': [
    {
      id: 'phy-1',
      question: 'অভিকর্ষজ ত্বরণ g এর মান পৃথিবীর কোথায় সর্বাধিক হয়?',
      options: ['বিষুব অঞ্চলে', 'মেরু অঞ্চলে', 'ক্রান্তীয় অঞ্চলে', 'পৃথিবীর কেন্দ্রে'],
      correctAnswer: 1,
      explanation: 'মেরু অঞ্চলে পৃথিবীর ব্যাসার্ধ R সবচেয়ে কম হওয়ায় g = GM/R² সূত্রে g এর মান সর্বাধিক (৯.৮৩ মি/সে²) হয়।',
      subject: 'পদার্থবিজ্ঞান'
    },
    {
      id: 'phy-2',
      question: 'কোনো গতিশীল বস্তুর ভরবেগ দ্বিগুণ করা হলে তার গতিশক্তি কতগুণ বৃদ্ধি পাবে?',
      options: ['২ গুণ', '৪ গুণ', '৮ গুণ', 'অপরিবর্তিত থাকবে'],
      correctAnswer: 1,
      explanation: 'আমরা জানি Ek = P²/(2m)। ভরবেগ P দ্বিগুণ হলে গতিশক্তি ৪ গুণ হয়ে যায়।',
      subject: 'পদার্থবিজ্ঞান'
    },
    {
      id: 'phy-3',
      question: 'শব্দ তরঙ্গ এক মাধ্যম থেকে অন্য মাধ্যমে প্রবেশ করলে নিচের কোনটি অপরিবর্তিত থাকে?',
      options: ['তরঙ্গদৈর্ঘ্য', 'বেগ', 'কম্পাঙ্ক (Frequency)', 'তীব্রতা'],
      correctAnswer: 2,
      explanation: 'কম্পাঙ্ক শুধুমাত্র উৎসের ওপর নির্ভর করে, তাই মাধ্যম পরিবর্তনের সাথে সাথে কম্পাঙ্ক অপরিবর্তিত থাকে।',
      subject: 'পদার্থবিজ্ঞান'
    },
    {
      id: 'phy-4',
      question: 'মহাকর্ষীয় ধ্রুবক G এর এসআই (SI) একক কোনটি?',
      options: ['N m² kg⁻²', 'N m kg⁻¹', 'N m⁻² kg²', 'kg m s⁻²'],
      correctAnswer: 0,
      explanation: 'F = G(m₁m₂)/r² থেকে G = F r²/(m₁m₂), যার একক N m² kg⁻²।',
      subject: 'পদার্থবিজ্ঞান'
    },
    {
      id: 'phy-5',
      question: 'একটি সরল দোলকের দৈর্ঘ্য ৪ গুণ বাড়ানো হলে তার দোলনকাল কতগুণ হবে?',
      options: ['২ গুণ', '৪ গুণ', '১৬ গুণ', 'অর্ধেক'],
      correctAnswer: 0,
      explanation: 'দোলনকাল T ∝ √L। দৈর্ঘ্য ৪ গুণ হলে দোলনকাল √৪ = ২ গুণ বৃদ্ধি পাবে।',
      subject: 'পদার্থবিজ্ঞান'
    },
    {
      id: 'phy-6',
      question: 'কোনো আলোক রশ্মি ঘন মাধ্যম থেকে লঘু মাধ্যমে ক্রান্তি কোণে আপতিত হলে প্রতিসরণ কোণ কত ডিগ্রি হয়?',
      options: ['০°', '৪৫°', '৬০°', '৯০°'],
      correctAnswer: 3,
      explanation: 'ক্রান্তি কোণে আপতিত হলে প্রতিসরিত রশ্মি দুই মাধ্যমের বিভেদতল ঘেঁষে যায়, অর্থাৎ প্রতিসরণ কোণ ৯০° হয়।',
      subject: 'পদার্থবিজ্ঞান'
    },
    {
      id: 'phy-7',
      question: 'তড়িৎ ধারকত্বের (Capacitance) একক কোনটি?',
      options: ['কুলম্ব', 'ফ্যারাড (Farad)', 'ভোল্ট', 'ওহম'],
      correctAnswer: 1,
      explanation: 'ধারকত্ব C = Q/V, যার এসআই একক হলো ফ্যারাড (F)।',
      subject: 'পদার্থবিজ্ঞান'
    },
    {
      id: 'phy-8',
      question: 'প্রাসের অনুভূমিক পাল্লা (Range) সর্বোচ্চ পেতে নিক্ষেপণ কোণ কত হতে হবে?',
      options: ['৩০°', '৪৫°', '৬০°', '৯০°'],
      correctAnswer: 1,
      explanation: 'R = (v² sin 2θ)/g সূত্রে sin 2θ এর সর্বোচ্চ মান ১ পেতে θ = ৪৫° হতে হবে।',
      subject: 'পদার্থবিজ্ঞান'
    },
    {
      id: 'phy-9',
      question: 'পানির ত্রৈধ বিন্দু (Triple point of water) এর তাপমাত্রা কত কেলভিন?',
      options: ['২৭৩.১৫ K', '২৭৩.১৬ K', '৩৭৩.১৫ K', '০ K'],
      correctAnswer: 1,
      explanation: 'বিশুদ্ধ পানির ত্রৈধ বিন্দুর পরম তাপমাত্রা আন্তর্জাতিকভাবে ২৭৩.১৬ কেলভিন (০.০১°C) নির্ধারিত।',
      subject: 'পদার্থবিজ্ঞান'
    },
    {
      id: 'phy-10',
      question: 'সূর্যের শক্তির মূল উৎস কোন নিউক্লিয়ার বিক্রিয়া?',
      options: ['নিউক্লিয়ার ফিশন', 'নিউক্লিয়ার ফিউশন (সংশ্লেষণ)', 'আলফা ক্ষয়', 'রাসায়নিক দহন'],
      correctAnswer: 1,
      explanation: 'সূর্যের অভ্যন্তরে উচ্চ চাপে ও তাপে হাইড্রোজেন নিউক্লিয়াস পরস্পর যুক্ত হয়ে হিলিয়াম তৈরির নিউক্লিয়ার ফিউশন বিক্রিয়ায় বিপুল শক্তি নির্গত হয়।',
      subject: 'পদার্থবিজ্ঞান'
    }
  ],
  'রসায়ন': [
    {
      id: 'chem-1',
      question: 'পর্যায় সারণির কোন গ্রুপের মৌলগুলোকে ক্ষার ধাতু (Alkali Metals) বলা হয়?',
      options: ['গ্রুপ ১', 'গ্রুপ ২', 'গ্রুপ ১৭', 'গ্রুপ ১৮'],
      correctAnswer: 0,
      explanation: 'গ্রুপ ১ এর মৌলগুলো (H ব্যতীত Li, Na, K, Rb, Cs, Fr) পানির সাথে বিক্রিয়া করে তীব্র ক্ষার তৈরি করায় এদের ক্ষার ধাতু বলে।',
      subject: 'রসায়ন'
    },
    {
      id: 'chem-2',
      question: 'পরমাণুর d-উপস্তরে সর্বোচ্চ কতটি ইলেকট্রন থাকতে পারে?',
      options: ['২টি', '৬টি', '১০টি', '১৪টি'],
      correctAnswer: 2,
      explanation: 'd উপস্তরের জন্য l=2, তাই চৌম্বক কোয়ান্টাম সংখ্যা m এর মান ৫টি (-2, -1, 0, +1, +2), যার প্রতিটিতে ২টি করে মোট ১০টি ইলেকট্রন থাকতে পারে।',
      subject: 'রসায়ন'
    },
    {
      id: 'chem-3',
      question: 'ভিনেগারে অ্যাসিটিক এসিডের কত শতাংশ জলীয় দ্রবণ থাকে?',
      options: ['১-২%', '৪-১০%', '১৫-২০%', '৫০-৬০%'],
      correctAnswer: 1,
      explanation: 'ভিনেগার বা সিরকা হলো মূলত অ্যাসিটিক এসিডের (ইথানয়িক এসিড) ৪% থেকে ১০% জলীয় দ্রবণ।',
      subject: 'রসায়ন'
    },
    {
      id: 'chem-4',
      question: 'নিচের কোন অণুর জ্যামিতিক আকৃতি চতুস্তলকীয় (Tetrahedral)?',
      options: ['CH₄ (মিথেন)', 'H₂O (পানি)', 'NH₃ (অ্যামোনিয়া)', 'CO₂ (কার্বন ডাইঅক্সাইড)'],
      correctAnswer: 0,
      explanation: 'মিথেনে কার্বনের sp³ সংকরায়ণ ঘটে এবং কোনো মুক্তজোড় ইলেকট্রন না থাকায় এটি সুষম চতুস্তলকীয় (১০৯.৫°)।',
      subject: 'রসায়ন'
    },
    {
      id: 'chem-5',
      question: 'পানির pH এর মান ৭ এর বেশি হলে দ্রবণটি কেমন হবে?',
      options: ['অম্লীয়', 'ক্ষারীয়', 'নিরপেক্ষ', 'উভধর্মী'],
      correctAnswer: 1,
      explanation: 'pH স্কেলে ৭ এর নিচে অম্লীয়, ৭ এ নিরপেক্ষ এবং ৭ এর উপরে ক্ষারীয় দ্রবণ নির্দেশ করে।',
      subject: 'রসায়ন'
    },
    {
      id: 'chem-6',
      question: 'সবচেয়ে বেশি তড়িৎ-ঋণাত্মক (Electronegative) মৌল কোনটি?',
      options: ['অক্সিজেন (O)', 'ক্লোরিন (Cl)', 'ফ্লুরিন (F)', 'নাইট্রোজেন (N)'],
      correctAnswer: 2,
      explanation: 'পাউলিং স্কেলে ফ্লুরিনের তড়িৎ-ঋণাত্মকতার মান সর্বোচ্চ ৪.০।',
      subject: 'রসায়ন'
    },
    {
      id: 'chem-7',
      question: 'আদর্শ গ্যাস সমীকরণ কোনটি?',
      options: ['PV = nRT', 'P/V = nRT', 'PV = mgh', 'V/T = nR'],
      correctAnswer: 0,
      explanation: 'বয়েল ও চার্লসের যৌথ সূত্র থেকে প্রতিপাদিত আদর্শ গ্যাস সমীকরণ PV = nRT।',
      subject: 'রসায়ন'
    },
    {
      id: 'chem-8',
      question: 'বেনজিনের আণবিক সংকেত কোনটি?',
      options: ['C₆H₁₂', 'C₆H₆', 'C₂H₄', 'C₆H₁₄'],
      correctAnswer: 1,
      explanation: 'বেনজিন একটি অ্যারোমেটিক হাইড্রোকার্বন যার সংকেত C₆H₆।',
      subject: 'রসায়ন'
    },
    {
      id: 'chem-9',
      question: 'কোন ধাতুটি সাধারণ তাপমাত্রায় তরল অবস্থায় থাকে?',
      options: ['পারদ (Hg)', 'ব্রোমিন (Br)', 'গ্যালিয়াম (Ga)', 'সোডিয়াম (Na)'],
      correctAnswer: 0,
      explanation: 'পারদ একমাত্র ধাতু যা সাধারণ কক্ষ তাপমাত্রায় তরল থাকে। (ব্রোমিন তরল কিন্তু এটি অধাতু)।',
      subject: 'রসায়ন'
    },
    {
      id: 'chem-10',
      question: 'অক্সিডেশন বা জারণ বিক্রিয়ায় মৌল কী করে?',
      options: ['ইলেকট্রন ত্যাগ করে', 'ইলেকট্রন গ্রহণ করে', 'প্রোটন হারায়', 'ভর কমে যায়'],
      correctAnswer: 0,
      explanation: 'আধুনিক মতবাদ অনুযায়ী জারণ হলো ইলেকট্রন বর্জন প্রক্রিয়া (Oxidation is Loss of electrons)।',
      subject: 'রসায়ন'
    }
  ],
  'উচ্চতর গণিত': [
    {
      id: 'math-1',
      question: 'd/dx (sin x) এর অন্তরজ (Derivative) কোনটি?',
      options: ['cos x', '-cos x', 'tan x', '-sin x'],
      correctAnswer: 0,
      explanation: 'ক্যালকুলাসের মৌলিক সূত্র অনুযায়ী sin x এর ডিফারেনশিয়েশন হলো cos x।',
      subject: 'উচ্চতর গণিত'
    },
    {
      id: 'math-2',
      question: 'দ্বিঘাত সমীকরণ ax² + bx + c = 0 এর মূলদ্বয় সমান হওয়ার শর্ত কোনটি?',
      options: ['b² - 4ac > 0', 'b² - 4ac = 0', 'b² - 4ac < 0', 'b = 0'],
      correctAnswer: 1,
      explanation: 'নিশ্চায়ক (Discriminant) D = b² - 4ac = 0 হলে সমীকরণের মূল দুটি বাস্তব ও পরস্পর সমান হয়।',
      subject: 'উচ্চতর গণিত'
    },
    {
      id: 'math-3',
      question: '∫ e^x dx এর সমাকলন (Integration) কী হবে?',
      options: ['e^x + c', 'e^(2x) + c', 'x e^x + c', 'ln x + c'],
      correctAnswer: 0,
      explanation: 'সূচকীয় ফাংশন e^x এর অন্তরজ ও সমাকলন উভয়ই e^x বহাল থাকে।',
      subject: 'উচ্চতর গণিত'
    },
    {
      id: 'math-4',
      question: 'দুটি ভেক্টর A এবং B পরস্পর লম্ব হলে তাদের ডট গুণন (A · B) কত হবে?',
      options: ['১', '০', '-১', 'অসীম'],
      correctAnswer: 1,
      explanation: 'A · B = AB cos(৯০°) = ০, কারণ cos(৯০°) = ০।',
      subject: 'উচ্চতর গণিত'
    },
    {
      id: 'math-5',
      question: '⁵P₂ এর মান কত?',
      options: ['১০', '২০', '৬০', '১২০'],
      correctAnswer: 1,
      explanation: '⁵P₂ = ৫! / (৫ - ২)! = (৫ × ৪ × ৩!) / ৩! = ২০।',
      subject: 'উচ্চতর গণিত'
    },
    {
      id: 'math-6',
      question: 'বৃত্তের কেন্দ্র (০, ০) এবং ব্যাসার্ধ ৫ একক হলে বৃত্তটির সমীকরণ কোনটি?',
      options: ['x² + y² = ৫', 'x² + y² = ২৫', 'x² - y² = ২৫', 'x + y = ৫'],
      correctAnswer: 1,
      explanation: 'মূলবিন্দু কেন্দ্রবিশিষ্ট বৃত্তের সমীকরণ x² + y² = r² = ৫² = ২৫।',
      subject: 'উচ্চতর গণিত'
    },
    {
      id: 'math-7',
      question: 'জটিল সংখ্যা i এর মান √(-১) হলে i⁴ এর মান কত?',
      options: ['i', '-১', '১', '-i'],
      correctAnswer: 2,
      explanation: 'i² = -১, সুতরাং i⁴ = (i²)² = (-১)² = ১।',
      subject: 'উচ্চতর গণিত'
    },
    {
      id: 'math-8',
      question: 'cos² θ + sin² θ এর মান সর্বদা কত?',
      options: ['০', '১', '২', 'অনির্ণেয়'],
      correctAnswer: 1,
      explanation: 'ত্রিকোণমিতির মৌলিক অভেদ অনুযায়ী যেকোনো কোণ θ এর জন্য sin² θ + cos² θ = ১।',
      subject: 'উচ্চতর গণিত'
    },
    {
      id: 'math-9',
      question: 'একটি সরলরেখার সমীকরণ 2x - y + 5 = 0 হলে এর ঢাল (Slope, m) কত?',
      options: ['২', '-২', '১/২', '৫'],
      correctAnswer: 0,
      explanation: 'y = mx + c আকারে সাজালে y = 2x + 5, যেখানে ঢাল m = ২।',
      subject: 'উচ্চতর গণিত'
    },
    {
      id: 'math-10',
      question: 'লগারিদম log₁₀(১০০০) এর মান কত?',
      options: ['১', '২', '৩', '১০'],
      correctAnswer: 2,
      explanation: 'যেহেতু ১০³ = ১০০০, তাই log₁₀(১০³) = ৩ log₁₀(১০) = ৩।',
      subject: 'উচ্চতর গণিত'
    }
  ],
  'জীববিজ্ঞান': [
    {
      id: 'bio-1',
      question: 'কোষের শক্তিঘর (Powerhouse of the cell) কাকে বলা হয়?',
      options: ['মাইটোকন্ড্রিয়া', 'রাইবোসোম', 'গলগি বডি', 'লাইসোজোম'],
      correctAnswer: 0,
      explanation: 'কোষীয় শ্বসনের ক্রেবস চক্র ও এটিপি (ATP) তৈরির প্রধান কেন্দ্র হলো মাইটোকন্ড্রিয়া।',
      subject: 'জীববিজ্ঞান'
    },
    {
      id: 'bio-2',
      question: 'ডিএনএ (DNA) এর ডাবল হেলিক্স কাঠামোর আবিষ্কারক কে?',
      options: ['রবার্ট হুক', 'ওয়াটসন ও ক্রিক', 'গ্রেগর জোহান মেন্ডেল', 'লুই পাস্তুর'],
      correctAnswer: 1,
      explanation: '১৯৫৩ সালে জেমস ওয়াটসন এবং ফ্রান্সিস ক্রিক ডিএনএ এর দ্বিতন্ত্রী হেলিক্স মডেল প্রস্তাব করেন।',
      subject: 'জীববিজ্ঞান'
    },
    {
      id: 'bio-3',
      question: 'মানবদেহের সবচেয়ে বড় গ্রন্থি (Largest Gland) কোনটি?',
      options: ['যকৃৎ (Liver)', 'অগ্ন্যাশয় (Pancreas)', 'থাইরয়েড', 'পিটুইটারি'],
      correctAnswer: 0,
      explanation: 'মানবদেহের সবচেয়ে বড় ও গুরুত্বপূর্ণ রাসায়নিক গবেষণাগার সদৃশ গ্রন্থি হলো যকৃৎ।',
      subject: 'জীববিজ্ঞান'
    },
    {
      id: 'bio-4',
      question: 'সালোকসংশ্লেষণ প্রক্রিয়ায় উপজাত হিসেবে কোন গ্যাস নির্গত হয়?',
      options: ['কার্বন ডাইঅক্সাইড', 'অক্সিজেন', 'নাইট্রোজেন', 'হাইড্রোজেন'],
      correctAnswer: 1,
      explanation: 'পানির আলোক বিভাজন (Photolysis of water) এর ফলে অক্সিজেন গ্যাস উৎপন্ন হয়ে পরিবেশে মুক্ত হয়।',
      subject: 'জীববিজ্ঞান'
    },
    {
      id: 'bio-5',
      question: 'কোন রক্তের গ্রুপকে সর্বজনীন দাতা (Universal Donor) বলা হয়?',
      options: ['A+', 'B+', 'AB+', 'O-'],
      correctAnswer: 3,
      explanation: 'O- গ্রুপে কোনো A, B অ্যান্টিজেন বা Rh ফ্যাক্টর না থাকায় এটি যেকোনো গ্রহীতাকে নিরাপদভাবে দেওয়া যায়।',
      subject: 'জীববিজ্ঞান'
    },
    {
      id: 'bio-6',
      question: 'উদ্ভিদে পানি ও খনিজ লবণ পরিবহনের দায়িত্বে কোন কলা নিয়োজিত?',
      options: ['ফ্লোয়েম', 'জাইলেম', 'প্যারেনকাইমা', 'কোলেনকাইমা'],
      correctAnswer: 1,
      explanation: 'জাইলেম টিস্যু মূলরোম হতে গৃহীত পানি ও পুষ্টি উপাদান উদ্ভিদের ঊর্ধ্বভাগে পাতায় পৌঁছে দেয়।',
      subject: 'জীববিজ্ঞান'
    },
    {
      id: 'bio-7',
      question: 'মানবদেহে স্বাভাবিক অবস্থায় ক্রোমোজোম সংখ্যা কতটি?',
      options: ['২৩টি', '৪৬টি', '৪৮টি', '৯২টি'],
      correctAnswer: 1,
      explanation: 'মানবদেহের দেহকোষে ২৩ জোড়া বা মোট ৪৬টি ক্রোমোজোম থাকে।',
      subject: 'জীববিজ্ঞান'
    },
    {
      id: 'bio-8',
      question: 'ইনসুলিন হরমোন কোন অঙ্গের আইলেটস অব ল্যাঙ্গারহ্যান্স থেকে নিঃসৃত হয়?',
      options: ['যকৃৎ', 'অগ্ন্যাশয়', 'বৃক্ক', 'পাকস্থলী'],
      correctAnswer: 1,
      explanation: 'অগ্ন্যাশয়ের বিটা কোষ থেকে ইনসুলিন নিঃসৃত হয়ে রক্তের গ্লুকোজ নিয়ন্ত্রণ করে।',
      subject: 'জীববিজ্ঞান'
    },
    {
      id: 'bio-9',
      question: 'কোষ বিভাজনের কোন ধাপে ক্রোমোজোমগুলো বিষুবীয় অঞ্চলে অবস্থান নেয়?',
      options: ['প্রোফেজ', 'মেটাফেজ', 'অ্যানাফেজ', 'টেলোফেজ'],
      correctAnswer: 1,
      explanation: 'মেটাফেজ ধাপে ক্রোমোজোমগুলো স্পিন্ডল যন্ত্রের বিষুবীয় অঞ্চলে সজ্জিত হয় (মেটাকাইনেসিস)।',
      subject: 'জীববিজ্ঞান'
    },
    {
      id: 'bio-10',
      question: 'অ্যান্টিবডি প্রস্তুত ও রোগ প্রতিরোধে গুরুত্বপূর্ণ ভূমিকা রাখে কোন রক্তকণিকা?',
      options: ['লোহিত রক্তকণিকা', 'শ্বেত রক্তকণিকা', 'অণুচক্রিকা', 'রক্তরস'],
      correctAnswer: 1,
      explanation: 'শ্বেত রক্তকণিকার লিম্ফোসাইট অ্যান্টিবডি তৈরি করে এবং ফ্যাগোসাইটোসিস প্রক্রিয়ায় জীবাণু ধ্বংস করে।',
      subject: 'জীববিজ্ঞান'
    }
  ],
  'আইসিটি': [
    {
      id: 'ict-1',
      question: 'বাইনারি সংখ্যা (1010)₂ এর ডেসিমেল মান কত?',
      options: ['৮', '১০', '১২', '১৪'],
      correctAnswer: 1,
      explanation: '1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10।',
      subject: 'আইসিটি'
    },
    {
      id: 'ict-2',
      question: 'HTML এর পূর্ণরূপ কোনটি?',
      options: ['Hyper Text Markup Language', 'Hyper Tool Multi Language', 'High Tech Modern Language', 'Hyperlink Text Machine Language'],
      correctAnswer: 0,
      explanation: 'ওয়েব পেজ স্ট্রাকচার তৈরির ভাষা হলো Hyper Text Markup Language (HTML)।',
      subject: 'আইসিটি'
    },
    {
      id: 'ict-3',
      question: 'কোন লজিক গেটের আউটপুট শুধুমাত্র সকল ইনপুট ১ হলেই ১ হয়?',
      options: ['OR গেট', 'AND গেট', 'NOT গেট', 'XOR গেট'],
      correctAnswer: 1,
      explanation: 'AND গেটের বুলিয়ান গুণন নিয়মে সকল ইনপুট ১ হলে আউটপুট ১ পাওয়া যায়।',
      subject: 'আইসিটি'
    },
    {
      id: 'ict-4',
      question: 'কম্পিউটারের প্রাথমিক মেমোরি কোনটি?',
      options: ['র‍্যাম (RAM)', 'হার্ডডিস্ক (HDD)', 'পেনড্রাইভ', 'সিডি রম'],
      correctAnswer: 0,
      explanation: 'RAM হলো প্রধান উদ্বায়ী মেমোরি যা প্রসেসর সরাসরি দ্রুত ডেটা পাঠ ও লিখতে ব্যবহার করে।',
      subject: 'আইসিটি'
    },
    {
      id: 'ict-5',
      question: 'IPv4 অ্যাড্রেস কত বিটের হয়ে থাকে?',
      options: ['১৬ বিট', '৩২ বিট', '৬৪ বিট', '১২৮ বিট'],
      correctAnswer: 1,
      explanation: 'IPv4 ঠিকানা ৪টি অক্টেট নিয়ে গঠিত, অর্থাৎ ৪ × ৮ = ৩২ বিটের হয়।',
      subject: 'আইসিটি'
    },
    {
      id: 'ict-6',
      question: 'নিচের কোনটি ডেটাবেজ তৈরির রিলেশনাল কুয়েরি ল্যাঙ্গুয়েজ?',
      options: ['HTML', 'SQL', 'CSS', 'XML'],
      correctAnswer: 1,
      explanation: 'Structured Query Language (SQL) রিলেশনাল ডাটাবেজ পরিচালনার আদর্শ ভাষা।',
      subject: 'আইসিটি'
    },
    {
      id: 'ict-7',
      question: 'সি প্রোগ্রামে কোন হেডার ফাইল স্ট্যান্ডার্ড ইনপুট/আউটপুটের জন্য আবশ্যক?',
      options: ['<math.h>', '<stdio.h>', '<conio.h>', '<stdlib.h>'],
      correctAnswer: 1,
      explanation: 'printf এবং scanf ফাংশনের প্রোটোটাইপ <stdio.h> (Standard Input Output) ফাইলে থাকে।',
      subject: 'আইসিটি'
    },
    {
      id: 'ict-8',
      question: 'ক্লাউড কম্পিউটিংয়ের সার্ভিস মডেল কোনটি নয়?',
      options: ['SaaS', 'PaaS', 'IaaS', 'DaaS (ড্রিল অ্যাজ আ সার্ভিস)'],
      correctAnswer: 3,
      explanation: 'ক্লাউডের মূল ৩টি স্তর হলো SaaS (Software), PaaS (Platform) এবং IaaS (Infrastructure)।',
      subject: 'আইসিটি'
    },
    {
      id: 'ict-9',
      question: 'ওয়াই-ফাই (Wi-Fi) প্রযুক্তির আইইইই (IEEE) স্ট্যান্ডার্ড কোনটি?',
      options: ['IEEE 802.3', 'IEEE 802.11', 'IEEE 802.15', 'IEEE 802.16'],
      correctAnswer: 1,
      explanation: 'ওয়্যারলেস লোকাল এরিয়া নেটওয়ার্কের জন্য IEEE 802.11 স্ট্যান্ডার্ড কার্যকর।',
      subject: 'আইসিটি'
    },
    {
      id: 'ict-10',
      question: '১ গিগাবাইট (1 GB) সমান কত মেগাবাইট (MB)?',
      options: ['১০০০ MB', '১০২৪ MB', '৫১২ MB', '২০৪৮ MB'],
      correctAnswer: 1,
      explanation: 'কম্পিউটারের বাইনারি হিসাব অনুযায়ী ১ গিগাবাইট = ২¹⁰ মেগাবাইট = ১০২৪ মেগাবাইট।',
      subject: 'আইসিটি'
    }
  ],
  'বাংলা ও ইংরেজি': [
    {
      id: 'ben-1',
      question: 'বাংলা সাহিত্যের প্রাচীনতম নিদর্শন কোনটি?',
      options: ['শ্রীকৃষ্ণকীর্তন', 'চর্যাপদ', 'পদ্মাবতী', 'মনসামঙ্গল'],
      correctAnswer: 1,
      explanation: 'হরপ্রসাদ শাস্ত্রী ১৯০৭ সালে নেপালের রাজদরবার থেকে বৌদ্ধ সিদ্ধাচার্যদের রচিত চর্যাপদ আবিষ্কার করেন।',
      subject: 'বাংলা ও ইংরেজি'
    },
    {
      id: 'ben-2',
      question: '"The pen is mightier than the sword" - এটি কিসের উদাহরণ?',
      options: ['Metaphor', 'Metonymy', 'Simile', 'Personification'],
      correctAnswer: 1,
      explanation: 'এখানে pen দ্বারা সাহিত্য/লেখার শক্তি এবং sword দ্বারা সামরিক শক্তি নির্দেশ করা হয়েছে, যা Metonymy।',
      subject: 'বাংলা ও ইংরেজি'
    },
    {
      id: 'ben-3',
      question: 'বাংলা ভাষায় ব্যাকরণ প্রথম কে রচনা করেন?',
      options: ['উইলিয়াম কেরি', 'ম্যানুয়েল দা আসসুম্পসাঁও', 'রাজা রামমোহন রায়', 'ঈশ্বরচন্দ্র বিদ্যাসাগর'],
      correctAnswer: 1,
      explanation: 'পর্তুগিজ যাজক ম্যানুয়েল দা আসসুম্পসাঁও ১৭৪৩ সালে রোমান হরফে প্রথম বাংলা ব্যাকরণ ও অভিধান রচনা করেন।',
      subject: 'বাংলা ও ইংরেজি'
    },
    {
      id: 'ben-4',
      question: 'What is the synonym of "Benevolent"?',
      options: ['Cruel', 'Kind & Generous', 'Selfish', 'Arrogant'],
      correctAnswer: 1,
      explanation: 'Benevolent অর্থ পরোপকারী, দয়ালু বা বদান্য (Kind and generous)।',
      subject: 'বাংলা ও ইংরেজি'
    },
    {
      id: 'ben-5',
      question: '"সূর্যোদয়ে অন্ধকার দূরীভূত হয়" - এখানে "সূর্যোদয়ে" কোন কারকে কোন বিভক্তি?',
      options: ['করণে ৭মী', 'অধিকরণে ৭মী (ভাবাধিকরণ)', 'অপাদানে ৫মী', 'কর্তায় শূন্য'],
      correctAnswer: 1,
      explanation: 'একটি ক্রিয়া দ্বারা অন্য ক্রিয়া প্রকাশ পেলে ভাবাধিকরণ হয় এবং "এ" বিভক্তির জন্য ভাবাধিকরণে ৭মী।',
      subject: 'বাংলা ও ইংরেজি'
    },
    {
      id: 'ben-6',
      question: 'Choose the correct spelling:',
      options: ['Accomodation', 'Accommodation', 'Acommodation', 'Acomodation'],
      correctAnswer: 1,
      explanation: 'সঠিক বানান হলো Double c এবং Double m বিশিষ্ট: A-C-C-O-M-M-O-D-A-T-I-O-N।',
      subject: 'বাংলা ও ইংরেজি'
    },
    {
      id: 'ben-7',
      question: '"বিদ্রোহী" কবিতাটি কাজী নজরুল ইসলামের কোন কাব্যগ্রন্থের অন্তর্ভুক্ত?',
      options: ['অগ্নিবীণা', 'বিষের বাঁশী', 'সর্বহারা', 'প্রলয়শিখা'],
      correctAnswer: 0,
      explanation: 'কাজী নজরুল ইসলামের প্রথম প্রকাশিত কাব্যগ্রন্থ "অগ্নিবীণা" (১৯২২)-এর দ্বিতীয় কবিতা হলো "বিদ্রোহী"।',
      subject: 'বাংলা ও ইংরেজি'
    },
    {
      id: 'ben-8',
      question: 'Neither of the boys ____ present in the class today.',
      options: ['is', 'are', 'were', 'have been'],
      correctAnswer: 0,
      explanation: '"Neither of" এর পর প্লুরাল নাউন থাকলেও ভার্ব সর্বদা সিঙ্গুলার (is) হয়।',
      subject: 'বাংলা ও ইংরেজি'
    },
    {
      id: 'ben-9',
      question: 'সন্ধি বিচ্ছেদ করুন: "বিদ্যালয়"',
      options: ['বিদ্যা + আলয়', 'বিদ্য + লয়', 'বিদ + আলয়', 'বিদ্যা + অলয়'],
      correctAnswer: 0,
      explanation: 'আ-কার ও আ-কার মিলে আ-কার হয়: বিদ্যা + আলয় = বিদ্যালয়।',
      subject: 'বাংলা ও ইংরেজি'
    },
    {
      id: 'ben-10',
      question: 'What is the past participle form of "Choose"?',
      options: ['Chose', 'Chosen', 'Choosen', 'Choosing'],
      correctAnswer: 1,
      explanation: 'Choose (Present) -> Chose (Past) -> Chosen (Past Participle)।',
      subject: 'বাংলা ও ইংরেজি'
    }
  ],
  'সাধারণ জ্ঞান': [
    {
      id: 'gk-1',
      question: 'বাংলাদেশের সংবিধান কত তারিখে গণপরিষদে গৃহীত হয়?',
      options: ['২৬ মার্চ ১৯৭২', '৪ নভেম্বর ১৯৭২', '১৬ ডিসেম্বর ১৯৭২', '৭ মার্চ ১৯৭২'],
      correctAnswer: 1,
      explanation: '১৯৭২ সালের ৪ নভেম্বর গণপরিষদে বাংলাদেশের সংবিধান গৃহীত হয় এবং ১৬ ডিসেম্বর থেকে কার্যকর হয়।',
      subject: 'সাধারণ জ্ঞান'
    },
    {
      id: 'gk-2',
      question: 'পদ্মা সেতুর মোট দৈর্ঘ্য কত কিলোমিটার?',
      options: ['৬.১৫ কিমি', '৫.০৩ কিমি', '৭.২ কিমি', '৮.৪ কিমি'],
      correctAnswer: 0,
      explanation: 'পদ্মা সেতুর মূল কাঠামোর দৈর্ঘ্য ৬.১৫ কিলোমিটার এবং এতে ৪১টি স্প্যান রয়েছে।',
      subject: 'সাধারণ জ্ঞান'
    },
    {
      id: 'gk-3',
      question: 'জাতিসংঘের বর্তমান সদর দপ্তর কোথায় অবস্থিত?',
      options: ['জেনেভা', 'প্যারিস', 'নিউ ইয়র্ক', 'লন্ডন'],
      correctAnswer: 2,
      explanation: 'মার্কিন যুক্তরাষ্ট্রের নিউইয়র্ক শহরের ম্যানহাটনে জাতিসংঘের মূল সদর দফতর অবস্থিত।',
      subject: 'সাধারণ জ্ঞান'
    },
    {
      id: 'gk-4',
      question: 'কোন প্রণালী এশিয়া ও ইউরোপ মহাদেশকে পৃথক করেছে?',
      options: ['জিব্রাল্টার প্রণালী', 'বসফরাস প্রণালী', 'মালাক্কা প্রণালী', 'পক প্রণালী'],
      correctAnswer: 1,
      explanation: 'তুরস্কের বসফরাস প্রণালী এশিয়া ও ইউরোপ মহাদেশকে বিভক্ত করেছে।',
      subject: 'সাধারণ জ্ঞান'
    },
    {
      id: 'gk-5',
      question: 'নোবেল পুরস্কারের জনক আলফ্রেড নোবেল কোন দেশের বিজ্ঞানী ছিলেন?',
      options: ['সুইডেন', 'নরওয়ে', 'জার্মানি', 'যুক্তরাজ্য'],
      correctAnswer: 0,
      explanation: 'ডিনামাইটের আবিষ্কারক ও নোবেল পুরস্কারের প্রবক্তা আলফ্রেড নোবেল সুইডেনের নাগরিক ছিলেন।',
      subject: 'সাধারণ জ্ঞান'
    },
    {
      id: 'gk-6',
      question: 'বিশ্বের বৃহত্তম ম্যানগ্রোভ বন সুন্দরবনের কত শতাংশ বাংলাদেশে পড়েছে?',
      options: ['৪০%', '৫০%', '৬০%', '৭০%'],
      correctAnswer: 2,
      explanation: 'সুন্দরবনের প্রায় ৬০% অংশ বাংলাদেশের সীমানায় এবং বাকি ৪০% অংশ ভারতে অবস্থিত।',
      subject: 'সাধারণ জ্ঞান'
    },
    {
      id: 'gk-7',
      question: 'বাংলাদেশের স্বাধীনতা যুদ্ধে কতজন বীরশ্রেষ্ঠ খেতাব লাভ করেন?',
      options: ['৭ জন', '৮ জন', '৬৮ জন', '১৭৫ জন'],
      correctAnswer: 0,
      explanation: 'মুক্তিযুদ্ধে অসামান্য বীরত্বের জন্য ৭ জন বীরসেনানীকে বীরশ্রেষ্ঠ উপাধিতে ভূষিত করা হয়।',
      subject: 'সাধারণ জ্ঞান'
    },
    {
      id: 'gk-8',
      question: 'পৃথিবীর গভীরতম মহাসাগর কোনটি?',
      options: ['আটলান্টিক মহাসাগর', 'প্রশান্ত মহাসাগর', 'ভারত মহাসাগর', 'উত্তর মহাসাগর'],
      correctAnswer: 1,
      explanation: 'প্রশান্ত মহাসাগরের মারিয়ানা ট্রেঞ্চ (মারিয়ানা খাত) পৃথিবীর গভীরতম স্থান।',
      subject: 'সাধারণ জ্ঞান'
    },
    {
      id: 'gk-9',
      question: 'আন্তর্জাতিক মাতৃভাষা দিবস কোন তারিখে বিশ্বব্যাপী পালিত হয়?',
      options: ['২১ ফেব্রুয়ারি', '২৬ মার্চ', '১৬ ডিসেম্বর', '১ মে'],
      correctAnswer: 0,
      explanation: '১৯৯৯ সালে ইউনেস্কো ২১শে ফেব্রুয়ারিকে আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে স্বীকৃতি দেয়।',
      subject: 'সাধারণ জ্ঞান'
    },
    {
      id: 'gk-10',
      question: 'সূর্য থেকে পৃথিবীতে আলো পৌঁছাতে গড়ে কত সময় লাগে?',
      options: ['৫ মিনিট', '৮ মিনিট ২০ সেকেন্ড', '১০ মিনিট', '১২ মিনিট ৩০ সেকেন্ড'],
      correctAnswer: 1,
      explanation: 'প্রায় ১৫ কোটি কিমি দূরত্ব অতিক্রম করে আলো সেকেন্ডে ৩ লক্ষ কিমি বেগে আসতে প্রায় ৫০০ সেকেন্ড বা ৮ মিনিট ২০ সেকেন্ড সময় নেয়।',
      subject: 'সাধারণ জ্ঞান'
    }
  ]
};
