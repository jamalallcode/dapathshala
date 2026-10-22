import { MarketplaceCoaching, AdmissionLead } from './marketplaceTypes';

export const BANGLADESH_DIVISIONS = [
  'সব বিভাগ',
  'ঢাকা',
  'চট্টগ্রাম',
  'রাজশাহী',
  'খুলনা',
  'সিলেট',
  'বরিশাল',
  'রংপুর',
  'ময়মনসিংহ'
];

export const POPULAR_PROGRAMS = [
  'সকল প্রোগ্রাম',
  'এইচএসসি বিজ্ঞান',
  'মেডিকেল ভর্তি প্রস্তুতি',
  'বুয়েট / ইঞ্জিনিয়ারিং',
  'ভার্সিটি ‘ক’ ইউনিট',
  'এসএসসি বিজ্ঞান ও গণিত',
  'আইবিএ ও বিইউপি',
  'ইংরেজি ভার্সন স্পেশাল'
];

export const POPULAR_SUBJECTS = [
  'সব বিষয়',
  'পদার্থবিজ্ঞান',
  'রসায়ন',
  'উচ্চতর গণিত',
  'জীববিজ্ঞান',
  'আইসিটি',
  'সাধারণ গণিত',
  'ইংরেজি'
];

export const SAMPLE_MARKETPLACE_COACHINGS: MarketplaceCoaching[] = [
  {
    id: 'c-udvash-farmgate',
    name: 'উদ্ভাস-উন্মেষ একাডেমি (ফার্মগেট শাখা)',
    tagline: 'কনসেপ্ট ক্লিয়ারিং ও ইঞ্জিনিয়ারিং-মেডিকেল ভর্তির আস্থার প্রতীক',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    division: 'ঢাকা',
    district: 'ঢাকা',
    thana: 'ফার্মগেট',
    address: 'প্লট #১২, গ্রিন রোড, ফার্মগেট, ঢাকা-১২১৫',
    phone: '০১৭৫০০০০১১১',
    whatsapp: '০১৭৫০০০০১১১',
    email: 'farmgate@udvash-unmesh.com',
    foundedYear: '২০০০',
    rating: 4.9,
    reviewCount: 384,
    studentCount: 1850,
    successRate: '৯৪% বুয়েট ও মেডিকেল চান্স',
    programs: ['বুয়েট / ইঞ্জিনিয়ারিং', 'এইচএসসি বিজ্ঞান', 'মেডিকেল ভর্তি প্রস্তুতি', 'ভার্সিটি ‘ক’ ইউনিট'],
    subjects: ['পদার্থবিজ্ঞান', 'রসায়ন', 'উচ্চতর গণিত', 'জীববিজ্ঞান'],
    feeRange: '৳২,২০০ - ৳৪,৫০০ / মাস',
    featured: true,
    verified: true,
    facilities: [
      'ডিজিটাল ওএমআর এক্সাম সিস্টেম',
      'প্রতিটি বিষয়ের কনসেপ্ট বুক ও সলিউশন',
      'ফুল এসি সেন্ট্রালাইজড ক্লাসরুম',
      'দৈনিক এসএমএস রেজাল্ট ও অ্যাটেনডেন্স',
      'প্র্যাকটিস ল্যাব ও বুয়েটিয়ান মেন্টরিং'
    ],
    feeStructure: [
      {
        courseName: 'ইঞ্জিনিয়ারিং বুয়েট অ্যাডমিশন স্পেশাল ব্যাচ',
        duration: '৬ মাস মেয়াদি কোর্স',
        monthlyFee: 4200,
        admissionFee: 3000,
        features: ['৮০+ লেকচার ও মডেল টেস্ট', 'দৈনিক কনসেপ্ট বুক', 'সাপ্তাহিক প্র্যাকটিস পেপার'],
        seatsAvailable: 24
      },
      {
        courseName: 'এইচএসসি বিজ্ঞান ফুল অ্যাকাডেমিক কেয়ার (১ম ও ২য় বর্ষ)',
        duration: '১২ মাস রেগুলার',
        monthlyFee: 3200,
        admissionFee: 2000,
        features: ['৪টি মূল বিজ্ঞান বিষয়', 'সাপ্তাহিক রিভিশন টেস্ট', 'অভিভাবক মিটিং'],
        seatsAvailable: 35
      },
      {
        courseName: 'ভার্সিটি ‘ক’ ইউনিট এক্সক্লুসিভ প্রিপারেশন',
        duration: '৫ মাস মেয়াদি',
        monthlyFee: 2800,
        admissionFee: 1500,
        features: ['ঢাবি ও গুচ্ছ স্ট্যান্ডার্ড প্রশ্নব্যাংক', 'শর্টকাট ট্রিকস ক্লাস', 'ওএমআর লাইভ মক'],
        seatsAvailable: 40
      }
    ],
    teachers: [
      { name: 'প্রকৌশলী তানভীর আহমেদ', designation: 'প্রধান পদার্থবিজ্ঞান শিক্ষক', institution: 'বুয়েট (সিভিল-০৮)', experience: '১২ বছর' },
      { name: 'ড. সাজ্জাদ মাহমুদ', designation: 'রসায়ন বিভাগীয় প্রধান', institution: 'ঢাকা বিশ্ববিদ্যালয় (রসায়ন)', experience: '১৪ বছর' },
      { name: 'প্রকৌশলী মেহরাজ হোসেন', designation: 'উচ্চতর গণিত ইনস্ট্রাক্টর', institution: 'বুয়েট (ইইই-১২)', experience: '১০ বছর' }
    ],
    reviews: [
      { studentName: 'সাদিয়া তাসনিম', college: 'ভিকারুননিসা নূন কলেজ', rating: 5, date: '৩ দিন আগে', comment: 'পদার্থবিজ্ঞান ও গণিতের কঠিন টপিকগুলো এত সহজভাবে বুঝিয়ে দেয় যে কোনো ভয়ই থাকে না!', badge: 'বুয়েট সিভিল চান্সপ্রাপ্ত' },
      { studentName: 'আসিফ মাহমুদ', college: 'নটর ডেম কলেজ', rating: 5, date: '১ সপ্তাহ আগে', comment: 'নিয়মিত ওএমআর টেস্টগুলোর কারণে পরীক্ষার হলের ভয় একদম কেটে গেছে।' }
    ]
  },
  {
    id: 'c-retina-dhanmondi',
    name: 'রেটিনা মেডিকেল একাডেমি (ধানমন্ডি)',
    tagline: 'মেডিকেল ডেন্টাল ভর্তি পরীক্ষায় বাংলাদেশের শীর্ষস্থানীয় কোচিং',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80',
    division: 'ঢাকা',
    district: 'ঢাকা',
    thana: 'ধানমন্ডি',
    address: 'বাড়ি #৩২, রোড #৭/এ, ধানমন্ডি আ/এ, ঢাকা-১২০৯',
    phone: '০১৭৫০০০০২২২',
    whatsapp: '০১৭৫০০০০২২২',
    email: 'dhanmondi@retinabd.org',
    foundedYear: '১৯৮২',
    rating: 4.8,
    reviewCount: 420,
    studentCount: 1620,
    successRate: '৯১% সরকারি মেডিকেল চান্স',
    programs: ['মেডিকেল ভর্তি প্রস্তুতি', 'এইচএসসি বিজ্ঞান', 'জীববিজ্ঞান স্পেশাল'],
    subjects: ['জীববিজ্ঞান', 'রসায়ন', 'পদার্থবিজ্ঞান', 'ইংরেজি'],
    feeRange: '৳২,৫০০ - ৳৫,০০০ / মাস',
    featured: true,
    verified: true,
    facilities: [
      'মেডিকেল স্পেশালাইজড ডক্টর মেন্টর',
      'দৈনিক বোটানি ও জুওলজি স্পট টেস্ট',
      'ডিজিটাল স্মার্ট বোর্ড ও অ্যানাটমি ভিজ্যুয়ালাইজেশন',
      'স্টাডি লাইব্রেরি সকাল ৮টা থেকে রাত ৯টা',
      'অনলাইন ও অফলাইন হাইব্রিড ব্যাকআপ'
    ],
    feeStructure: [
      {
        courseName: 'মেডিকেল ও ডেন্টাল ফুল অ্যাডমিশন কোর্স',
        duration: '৬ মাস ফুল কোর্স',
        monthlyFee: 4500,
        admissionFee: 3500,
        features: ['১০০+ পূর্ণাঙ্গ মডেল টেস্ট', 'রেটিনা ডাইজেস্ট ও প্রশ্নব্যাংক', '২৪/৭ ডাউট সলভ গ্রুপ'],
        seatsAvailable: 18
      },
      {
        courseName: 'এইচএসসি জীববিজ্ঞান ও রসায়ন প্রিমিয়াম কম্বো',
        duration: '১০ মাস স্পেশাল',
        monthlyFee: 2600,
        admissionFee: 1500,
        features: ['বোর্ড পরীক্ষার লিখিত ও এমসিকিউ গাইড', 'প্র্যাকটিক্যাল ডেমো ক্লাস'],
        seatsAvailable: 30
      }
    ],
    teachers: [
      { name: 'ডাঃ ফারহানা বিনতে রশীদ', designation: 'প্রধান মেন্টর - জীববিদ্যা', institution: 'ঢাকা মেডিকেল কলেজ (কে-৬৮)', experience: '৯ বছর' },
      { name: 'ডাঃ কামরুল ইসলাম', designation: 'রসায়ন ও সাধারণ জ্ঞান শিক্ষক', institution: 'স্যার সলিমুল্লাহ মেডিকেল', experience: '১১ বছর' }
    ],
    reviews: [
      { studentName: 'নাবিল আহমেদ', college: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ', rating: 5, date: '৫ দিন আগে', comment: 'বায়োলজির প্রতিটি লাইন দাগিয়ে পড়ার কৌশল এখানে না আসলে শিখতাম না!', badge: 'ডিএমসি চান্সপ্রাপ্ত' },
      { studentName: 'ফারজানা ইয়াসমিন', college: 'আইডিয়াল কলেজ', rating: 4, date: '২ সপ্তাহ আগে', comment: 'সাপ্তাহিক মডেল টেস্টের র‍্যাংকিং সিস্টেম খুব প্রতিযোগিতামূলক।' }
    ]
  },
  {
    id: 'c-omega-uttara',
    name: 'ওমেগা সায়েন্স কেয়ার (উত্তরা সেক্টর ৭)',
    tagline: 'এইচএসসি বিজ্ঞান ও এসএসসির সেরা রেজাল্টের নিশ্চয়তা',
    logo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80',
    division: 'ঢাকা',
    district: 'ঢাকা',
    thana: 'উত্তরা',
    address: 'সেক্টর #৭, রোড #৫, বাড়ি #১৮, উত্তরা, ঢাকা-১২৩০',
    phone: '০১৭৫০০০০৩৩৩',
    whatsapp: '০১৭৫০০০০৩৩৩',
    email: 'uttara@omegacare.com',
    foundedYear: '২০১০',
    rating: 4.7,
    reviewCount: 215,
    studentCount: 890,
    successRate: '৯৮% জিপিএ-৫ পাসের হার',
    programs: ['এইচএসসি বিজ্ঞান', 'এসএসসি বিজ্ঞান ও গণিত'],
    subjects: ['উচ্চতর গণিত', 'পদার্থবিজ্ঞান', 'রসায়ন', 'আইসিটি'],
    feeRange: '৳১,৮০০ - ৳৩,২০০ / মাস',
    featured: false,
    verified: true,
    facilities: [
      'ছোট ব্যাচ (প্রতি ব্যাচে মাত্র ২০ জন শিক্ষার্থী)',
      'দুর্বল শিক্ষার্থীদের জন্য রিমেডিয়াল ক্লাস',
      'হোমওয়ার্ক চেকিং ও নিয়মিত ডায়রি সাইন',
      'অভিভাবকদের প্রতি মাসে প্রগ্রেস রিপোর্ট'
    ],
    feeStructure: [
      {
        courseName: 'এইচএসসি বিজ্ঞান ১ম ও ২য় বর্ষ কমপ্লিট ব্যাচ',
        duration: '৮ মাস রানিং',
        monthlyFee: 2800,
        admissionFee: 1500,
        features: ['গণিত ও পদার্থবিজ্ঞান স্পেশাল', 'অধ্যায়ভিত্তিক সিকিউ ও এমসিকিউ শিট', 'সাপ্তাহিক পরীক্ষা'],
        seatsAvailable: 12
      },
      {
        courseName: 'এসএসসি বিজ্ঞান ও উচ্চতর গণিত নিবিড় পরিচর্যা',
        duration: '৬ মাস ফাইনাল রিভিশন',
        monthlyFee: 2000,
        admissionFee: 1000,
        features: ['বোর্ড স্ট্যান্ডার্ড টেস্ট পেপার সলভিং', 'মডেল টেস্ট সিরিজ'],
        seatsAvailable: 25
      }
    ],
    teachers: [
      { name: 'মোঃ রাজিব হোসেন', designation: 'সিনিয়র গণিত শিক্ষক', institution: 'রাজশাহী বিশ্ববিদ্যালয় (গণিত)', experience: '৮ বছর' },
      { name: 'শায়লা শারমিন', designation: 'পদার্থবিজ্ঞান লেকচারার', institution: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়', experience: '৭ বছর' }
    ],
    reviews: [
      { studentName: 'মাহিনুল হাসান', college: 'উত্তরা হাই স্কুল অ্যান্ড কলেজ', rating: 5, date: '৪ দিন আগে', comment: 'ছোট ব্যাচ হওয়ায় শিক্ষক প্রতিজন ছাত্রের খাতা নিজের হাতে দেখেন।' }
    ]
  },
  {
    id: 'c-iconplus-mirpur',
    name: 'আইকন প্লাস ইউনিভার্সিটি অ্যাডমিশন (মিরপুর ১০)',
    tagline: 'ঢাকা বিশ্ববিদ্যালয় ‘খ’ ও ‘গ’ ইউনিট এবং বিইউপি-আইবিএ ভর্তি প্রস্তুতি',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    division: 'ঢাকা',
    district: 'ঢাকা',
    thana: 'মিরপুর',
    address: 'রাউন্ডঅ্যাবাউট মেট্রো স্টেশন সংলগ্ন, মিরপুর-১০, ঢাকা-১২১৬',
    phone: '০১৭৫০০০০৪৪৪',
    whatsapp: '০১৭৫০০০০৪৪৪',
    email: 'mirpur@iconplus.edu.bd',
    foundedYear: '২০০৫',
    rating: 4.8,
    reviewCount: 310,
    studentCount: 1100,
    successRate: '৮৭% ঢাবি ও গুচ্ছ চান্স',
    programs: ['আইবিএ ও বিইউপি', 'ভার্সিটি ‘ক’ ইউনিট'],
    subjects: ['ইংরেজি', 'সাধারণ গণিত', 'আইসিটি'],
    feeRange: '৳১,৫০০ - ৳৩,০০০ / মাস',
    featured: false,
    verified: true,
    facilities: [
      'আইবিএ ও বিইউপি রিটেন স্পেশাল মডিউল',
      'স্পোকেন ও প্রেজেন্টেশন সেশন',
      'সাপ্তাহিক কারেন্ট অ্যাফেয়ার্স ক্যাপসুল',
      'অনলাইন রেকর্ডেড ক্লাস লাইব্রেরি'
    ],
    feeStructure: [
      {
        courseName: 'বিইউপি ও আইবিএ অ্যাডমিশন স্পেশাল ক্র্যাশ কোর্স',
        duration: '৪ মাস মেয়াদি',
        monthlyFee: 3000,
        admissionFee: 2000,
        features: ['অ্যানালিটিক্যাল রাইটিং', 'মক ইন্টারভিউ ও ভাইভা গাইড', '১০ সেট ফুল মক টেস্ট'],
        seatsAvailable: 20
      },
      {
        courseName: 'ভার্সিটি সাধারণ জ্ঞান ও ইংরেজি স্পেশাল কেয়ার',
        duration: '৫ মাস মেয়াদি',
        monthlyFee: 1800,
        admissionFee: 1000,
        features: ['ভোকাবুলারি মাস্টারক্লাস', 'শর্টকাট গ্রামার ট্রিকস'],
        seatsAvailable: 40
      }
    ],
    teachers: [
      { name: 'সাইফুর রহমান চৌধুরী', designation: 'ইংরেজি বিশেষজ্ঞ ও মেন্টর', institution: 'ঢাকা বিশ্ববিদ্যালয় (ইংরেজি)', experience: '১৫ বছর' },
      { name: 'তানজিল আহমেদ', designation: 'আইবিএ ও অ্যানালিটিক্যাল ইনস্ট্রাক্টর', institution: 'আইবিএ, ঢাবি', experience: '৬ বছর' }
    ],
    reviews: [
      { studentName: 'নাঈম চৌধুরী', college: 'ঢাকা কমার্স কলেজ', rating: 5, date: '১ মাস আগে', comment: 'ইংরেজি গ্রামার ও অ্যানালিটিক্যাল অংশের প্রস্তুতি অসাধারণ!' }
    ]
  },
  {
    id: 'c-chittagong-engineers',
    name: 'চিটাগাং ইঞ্জিনিয়ার্স এইড (চকবাজার, চট্টগ্রাম)',
    tagline: 'চুয়েট, বুয়েট ও এইচএসসি সায়েন্সের নির্ভরযোগ্য প্রতিষ্ঠান',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    division: 'চট্টগ্রাম',
    district: 'চট্টগ্রাম',
    thana: 'চকবাজার',
    address: 'রসুল ভিউ কমপ্লেক্স (৩য় তলা), চকবাজার মোড়, চট্টগ্রাম',
    phone: '০১৮৫০০০০৫৫৫',
    whatsapp: '০১৮৫০০০০৫৫৫',
    email: 'chawkbazar@engineersaid.com',
    foundedYear: '২০১২',
    rating: 4.9,
    reviewCount: 260,
    studentCount: 950,
    successRate: '৯২% চুয়েট ও বুয়েট সিলেকশন',
    programs: ['বুয়েট / ইঞ্জিনিয়ারিং', 'এইচএসসি বিজ্ঞান'],
    subjects: ['উচ্চতর গণিত', 'পদার্থবিজ্ঞান', 'রসায়ন'],
    feeRange: '৳২,০০০ - ৳৩,৮০০ / মাস',
    featured: true,
    verified: true,
    facilities: [
      'চুয়েট ও বুয়েটের একঝাঁক শীর্ষ মেধাবী শিক্ষক',
      'প্রতি শুক্রবার তিন ঘণ্টার মেগা মক টেস্ট',
      'এসি মাল্টিমিডিয়া হলরুম',
      'ডিজিটাল লাইব্রেরি ও প্রশ্ন সলভিং সেল'
    ],
    feeStructure: [
      {
        courseName: 'ইঞ্জিনিয়ারিং অ্যাডমিশন মাস্টারক্লাস ব্যাচ',
        duration: '৬ মাস মেয়াদি',
        monthlyFee: 3500,
        admissionFee: 2500,
        features: ['চুয়েট, কুয়েট, রুয়েট ও বুয়েট বিশেষ মডেল', 'সরাসরি শিক্ষক কর্তৃক ডাউট সলভ'],
        seatsAvailable: 28
      },
      {
        courseName: 'এইচএসসি উচ্চতর গণিত ও পদার্থবিজ্ঞান স্পেশাল',
        duration: '১০ মাস স্পেশাল',
        monthlyFee: 2200,
        admissionFee: 1500,
        features: ['সিকিউ ও এমসিকিউ অধ্যায়ভিত্তিক মক', 'ফ্রি প্র্যাকটিস শিট'],
        seatsAvailable: 35
      }
    ],
    teachers: [
      { name: 'প্রকৌশলী হাসানাত জামিল', designation: 'উচ্চতর গণিত প্রধান', institution: 'চুয়েট (সিভিল-১০)', experience: '৯ বছর' },
      { name: 'প্রকৌশলী আবরার ফাহিম', designation: 'পদার্থবিজ্ঞান ইনস্ট্রাক্টর', institution: 'বুয়েট (মেকানিক্যাল)', experience: '৭ বছর' }
    ],
    reviews: [
      { studentName: 'জাহিদুল ইসলাম', college: 'চট্টগ্রাম কলেজ', rating: 5, date: '৬ দিন আগে', comment: 'চকবাজারের ভেতর সেরা ক্লাসরুম ও ইঞ্জিনিয়ারিং প্রস্তুতি প্ল্যাটফর্ম!' }
    ]
  },
  {
    id: 'c-rajshahi-science',
    name: 'রাজশাহী সায়েন্স পয়েন্ট (বোয়ালিয়া, রাজশাহী)',
    tagline: 'রাজশাহী শিক্ষা বোর্ডের টপারদের প্রথম পছন্দ',
    logo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80',
    division: 'রাজশাহী',
    district: 'রাজশাহী',
    thana: 'বোয়ালিয়া',
    address: 'আলুপট্টি মোড় সংলগ্ন, বোয়ালিয়া, রাজশাহী-৬১০০',
    phone: '০১৭৫০০০০৬৬৬',
    whatsapp: '০১৭৫০০০০৬৬৬',
    email: 'rajshahi@sciencepoint.com',
    foundedYear: '২০১৪',
    rating: 4.8,
    reviewCount: 180,
    studentCount: 780,
    successRate: '৮৯% রাবি ও রুয়েট চান্স',
    programs: ['এইচএসসি বিজ্ঞান', 'ভার্সিটি ‘ক’ ইউনিট', 'বুয়েট / ইঞ্জিনিয়ারিং'],
    subjects: ['রসায়ন', 'পদার্থবিজ্ঞান', 'উচ্চতর গণিত', 'জীববিজ্ঞান'],
    feeRange: '৳১,৫০০ - ৳২,৮০০ / মাস',
    featured: false,
    verified: true,
    facilities: [
      'রাজশাহী বিশ্ববিদ্যালয়ের অভিজ্ঞ শিক্ষকমণ্ডলী',
      'দৈনিক এমসিকিউ কুইজ ও ওএমআর ট্র্যাকিং',
      'শান্ত ও মনোরম পড়াশোনার পরিবেশ',
      'অভিভাবক অ্যাপস কানেকশন'
    ],
    feeStructure: [
      {
        courseName: 'এইচএসসি বিজ্ঞান কমপ্লিট বোর্ড ও রাবি প্রিপারেশন',
        duration: '৮ মাস রানিং',
        monthlyFee: 2400,
        admissionFee: 1200,
        features: ['বোর্ড স্ট্যান্ডার্ড পরীক্ষা ও লাইভ সলভিং', 'লেকচার শিট ফ্রি'],
        seatsAvailable: 30
      }
    ],
    teachers: [
      { name: 'প্রফেসর ড. মুমিনুল হক', designation: 'রসায়ন প্রধান', institution: 'রাজশাহী বিশ্ববিদ্যালয়', experience: '১৬ বছর' }
    ],
    reviews: [
      { studentName: 'আফরিন জাহান', college: 'রাজশাহী কলেজ', rating: 5, date: '২ সপ্তাহ আগে', comment: 'রসায়নের বিক্রিয়াগুলো এখন আর মুখস্থ করতে হয় না, সহজে মনে থাকে।' }
    ]
  },
  {
    id: 'c-sylhet-excellence',
    name: 'সিলেট এক্সিলেন্স একাডেমি (জিন্দাবাজার, সিলেট)',
    tagline: 'শাবিপ্রবি ও মেডিকেল ভর্তি প্রস্তুতির বিশ্বস্ত ঠিকানা',
    logo: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=120&h=120&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
    division: 'সিলেট',
    district: 'সিলেট',
    thana: 'জিন্দাবাজার',
    address: 'কাকলী শপিং সিটি সংলগ্ন, জিন্দাবাজার, সিলেট',
    phone: '০১৭৫০০০০৭৭৭',
    whatsapp: '০১৭৫০০০০৭৭৭',
    email: 'sylhet@excellenceacademy.com',
    foundedYear: '২০১৬',
    rating: 4.7,
    reviewCount: 145,
    studentCount: 650,
    successRate: '৮৫% শাবিপ্রবি ও মেডিকেল চান্স',
    programs: ['মেডিকেল ভর্তি প্রস্তুতি', 'ভার্সিটি ‘ক’ ইউনিট', 'এইচএসসি বিজ্ঞান'],
    subjects: ['পদার্থবিজ্ঞান', 'রসায়ন', 'জীববিজ্ঞান'],
    feeRange: '৳১,৮০০ - ৳৩,০০০ / মাস',
    featured: false,
    verified: true,
    facilities: [
      'শাবিপ্রবি ও ওসমানী মেডিকেলের সেরা ইনস্ট্রাক্টর',
      'সাপ্তাহিক ওএমআর মক টেস্ট',
      'ছোট ব্যাচে পাঠদান',
      'অভিভাবক নোটিফিকেশন'
    ],
    feeStructure: [
      {
        courseName: 'শাবিপ্রবি ও সাধারণ ভার্সিটি স্পেশাল ব্যাচ',
        duration: '৫ মাস মেয়াদি',
        monthlyFee: 2600,
        admissionFee: 1500,
        features: ['ম্যাথ ও ফিজিক্স স্পেশাল শর্টকাট', 'প্রশ্নব্যাংক সলিউশন'],
        seatsAvailable: 25
      }
    ],
    teachers: [
      { name: 'মাহবুব আলম', designation: 'পদার্থবিজ্ঞান লেকচারার', institution: 'শাবিপ্রবি (পদার্থবিজ্ঞান)', experience: '৭ বছর' }
    ],
    reviews: [
      { studentName: 'তাহমিদ ইসলাম', college: 'সিলেট এমসি কলেজ', rating: 5, date: '৩ দিন আগে', comment: 'শাবিপ্রবির ম্যাথ প্রশ্ন সমাধানের টেকনিকগুলো এখানে খুব দারুণভাবে শেখানো হয়।' }
    ]
  }
];

export const INITIAL_ADMISSION_LEADS: AdmissionLead[] = [
  {
    id: 'lead-101',
    coachingId: 'c-udvash-farmgate',
    coachingName: 'উদ্ভাস-উন্মেষ একাডেমি (ফার্মগেট শাখা)',
    studentName: 'তানভীর হাসান মাহির',
    phone: '০১৭৯১২২৩৩৪৪',
    email: 'mahir.tanvir@gmail.com',
    guardianName: 'মোঃ মোস্তাফিজুর রহমান',
    guardianPhone: '০১৭১৫৫৬৬৭৭৮',
    currentInstitution: 'নটর ডেম কলেজ, ঢাকা',
    classLevel: 'দ্বাদশ শ্রেণি (HSC-25)',
    programInterest: 'বুয়েট / ইঞ্জিনিয়ারিং',
    preferredShift: 'সকাল (৮:০০ - ১২:০০)',
    targetExam: 'বুয়েট ও চুয়েট ভর্তি পরীক্ষা',
    address: 'মিরপুর-২, ঢাকা',
    notes: 'গণিত ও পদার্থবিজ্ঞান কনসেপ্ট ক্লিয়ারিং ক্লাসে অগ্রাধিকার চাই।',
    appliedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'new'
  },
  {
    id: 'lead-102',
    coachingId: 'c-retina-dhanmondi',
    coachingName: 'রেটিনা মেডিকেল একাডেমি (ধানমন্ডি)',
    studentName: 'নুসরাত জাহান মিম',
    phone: '০১৮১৮৯৯০০১১',
    email: 'mim.nusrat@yahoo.com',
    guardianName: 'মোছাঃ সেলিনা বেগম',
    guardianPhone: '০১৯১১২২৩৩৪৪',
    currentInstitution: 'ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ',
    classLevel: 'দ্বাদশ শ্রেণি (HSC-25)',
    programInterest: 'মেডিকেল ভর্তি প্রস্তুতি',
    preferredShift: 'বিকাল (৩:০০ - ৭:০০)',
    targetExam: 'মেডিকেল ও ডেন্টাল অ্যাডমিশন',
    address: 'ধানমন্ডি রোড #৪, ঢাকা',
    notes: 'রেটিনা ডাইজেস্ট ও অফলাইন ওএমআর মডেল টেস্টে সিট নিশ্চিত করতে চাই।',
    appliedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    status: 'contacted',
    adminNotes: 'অভিভাবকের সাথে কথা হয়েছে, আগামী শুক্রবারে এসে ভর্তি সম্পন্ন করবেন।'
  },
  {
    id: 'lead-103',
    coachingId: 'c-omega-uttara',
    coachingName: 'ওমেগা সায়েন্স কেয়ার (উত্তরা সেক্টর ৭)',
    studentName: 'ফারহান আহমেদ রিয়ান',
    phone: '০১৬৭৭৮৮৯৯০০',
    guardianName: 'জনাব কামরুল হাসান',
    guardianPhone: '০১৭১১২৩৪৫৬৭',
    currentInstitution: 'উত্তরা হাই স্কুল অ্যান্ড কলেজ',
    classLevel: 'একাদশ শ্রেণি (HSC-26)',
    programInterest: 'এইচএসসি বিজ্ঞান',
    preferredShift: 'সকাল (৮:০০ - ১২:০০)',
    targetExam: 'এইচএসসি বোর্ড পরীক্ষা',
    address: 'সেক্টর #১০, উত্তরা, ঢাকা',
    notes: 'উচ্চতর গণিত ও রসায়নের জন্য ছোট ব্যাচে জয়েন করতে আগ্রহী।',
    appliedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    status: 'enrolled',
    adminNotes: 'ভর্তি ফি ও প্রথম মাসের বেতন পরিশোধিত। ব্যাচ-১ এ অন্তর্ভুক্ত।'
  },
  {
    id: 'lead-104',
    coachingId: 'c-chittagong-engineers',
    coachingName: 'চিটাগাং ইঞ্জিনিয়ার্স এইড (চকবাজার, চট্টগ্রাম)',
    studentName: 'রাকিবুল ইসলাম রনি',
    phone: '০১৮১২৩৪৫৬৭৮',
    guardianName: 'মোঃ শফিকুল আলম',
    guardianPhone: '০১৮৯৮৭৬৫৪৩২',
    currentInstitution: 'চট্টগ্রাম কলেজ',
    classLevel: 'দ্বাদশ শ্রেণি (HSC-25)',
    programInterest: 'বুয়েট / ইঞ্জিনিয়ারিং',
    preferredShift: 'অনলাইন লাইভ ব্যাচ',
    targetExam: 'চুয়েট ও ইঞ্জিনিয়ারিং গুচ্ছ',
    address: 'চকবাজার, চট্টগ্রাম',
    appliedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    status: 'new'
  }
];
