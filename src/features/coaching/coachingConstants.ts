import { SubscriptionPlan, CoachingProfile, SubscriptionState, Invoice } from './types';

export const BD_DIVISIONS = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'
];

export const BD_DISTRICTS: Record<string, string[]> = {
  'ঢাকা': ['ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'মুন্সীগঞ্জ', 'নরসিংদী', 'মানিকগঞ্জ', 'টাঙ্গাইল', 'কিশোরগঞ্জ', 'ফরিদপুর'],
  'চট্টগ্রাম': ['চট্টগ্রাম', 'কক্সবাজার', 'কুমিল্লা', 'ফেনী', 'ব্রাহ্মণবাড়িয়া', 'নোয়াখালী', 'চাঁদপুর', 'রাঙ্গামাটি'],
  'রাজশাহী': ['রাজশাহী', 'বগুড়া', 'পাবনা', 'সিরাজগঞ্জ', 'নাটোর', 'নওগাঁ', 'চাঁপাইনবাবগঞ্জ', 'জয়পুরহাট'],
  'খুলনা': ['খুলনা', 'যশোর', 'কুষ্টিয়া', 'ঝিনাইদহ', 'সাতক্ষীরা', 'বাগেরহাট', 'চুয়াডাঙ্গা', 'মেহেরপুর'],
  'বরিশাল': ['বরিশাল', 'পটুয়াখালী', 'ভোলা', 'পিরোজপুর', 'বরগুনা', 'ঝালকাঠি'],
  'সিলেট': ['সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ'],
  'রংপুর': ['রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম', 'গাইবান্ধা', 'নীলফামারী', 'লালমনিরহাট', 'ঠাকুরগাঁও', 'পঞ্চগড়'],
  'ময়মনসিংহ': ['ময়মনসিংহ', 'জামালপুর', 'নেত্রকোণা', 'শেরপুর']
};

export const PRESET_LOGOS = [
  { id: 'logo-1', icon: '🎓', label: 'গ্র্যাজুয়েশন ক্যাপ', bg: 'bg-emerald-600', text: 'ক্যাপ' },
  { id: 'logo-2', icon: '🏛️', label: 'একাডেমি ভবন', bg: 'bg-indigo-600', text: 'ভবন' },
  { id: 'logo-3', icon: '🔬', label: 'বিজ্ঞান ল্যাব', bg: 'bg-blue-600', text: 'বিজ্ঞান' },
  { id: 'logo-4', icon: '📐', label: 'গণিত ও প্রকৌশল', bg: 'bg-amber-600', text: 'গণিত' },
  { id: 'logo-5', icon: '⭐', label: 'স্টার একাডেমি', bg: 'bg-rose-600', text: 'স্টার' },
  { id: 'logo-6', icon: '📚', label: 'জ্ঞান পাঠশালা', bg: 'bg-teal-600', text: 'বই' },
];

export const CURRICULUM_OPTIONS = [
  '৬ষ্ঠ - ৮ম শ্রেণি (সাধারণ)',
  'এসএসসি বিজ্ঞান বিভাগ',
  'এসএসসি ব্যবসায় শিক্ষা',
  'এসএসসি মানবিক বিভাগ',
  'এইচএসসি বিজ্ঞান বিভাগ',
  'এইচএসসি বাণিজ্য ও মানবিক',
  'মেডিকেল এডমিশন কেয়ার',
  'বুয়েট / ইঞ্জিনিয়ারিং এডমিশন',
  'ক্যাডেট কলেজ ভর্তি প্রস্তুতি',
  'দাখিল ও আলিম প্রোগ্রাম'
];

export const SAAS_PLANS: SubscriptionPlan[] = [
  {
    id: 'trial',
    name: 'ফ্রি ট্রায়াল (Free Trial)',
    englishName: 'Free Trial',
    badge: '১৪ দিন ফ্রি',
    popular: false,
    monthlyPrice: 0,
    yearlyPrice: 0,
    studentLimit: 50,
    description: 'নতুন কোচিং সেন্টারের জন্য সম্পূর্ণ বিনামূল্যে ট্রায়াল দিয়ে দেখার সুযোগ। কোনো কার্ডের প্রয়োজন নেই।',
    features: [
      'সর্বোচ্চ ৫০ জন শিক্ষার্থী পরিচালনা',
      '২টি সক্রিয় ব্যাচ তৈরি ও রুটিন',
      'দৈনিক উপস্থিতি ট্র্যাকার (Attendance)',
      'ডিজিটাল নোটিশ বোর্ড',
      '১ জন অ্যাডমিন ও শিক্ষক অ্যাকাউন্ট',
      'বেসিক রেজাল্ট শিট ডাউনলোড'
    ]
  },
  {
    id: 'pro',
    name: 'মাসিক প্রো (Monthly Pro)',
    englishName: 'Monthly Pro',
    badge: 'সবচেয়ে জনপ্রিয়',
    popular: true,
    monthlyPrice: 1999,
    yearlyPrice: 19990, // Discounted for 12 mo
    studentLimit: 300,
    description: 'মাঝারি ও প্রতিষ্ঠিত কোচিং সেন্টারের সকল ডিজিটাল কার্যক্রম স্বয়ংক্রিয় করার পূর্ণাঙ্গ প্যাকেজ।',
    features: [
      '৩০০ জন পর্যন্ত শিক্ষার্থী পরিচালনা',
      'আনলিমিটেড ব্যাচ ও ক্লাস রুটিন',
      'এআই স্বয়ংক্রিয় খাতা মূল্যায়ন ও ডিজিটাল লাল কালি',
      'লাইভ মডেল টেস্ট ও অ্যান্টি-চিটিং নজরদারি',
      'স্বয়ংক্রিয় এসএমএস ও নোটিফিকেশন অ্যালার্ট',
      'বিকাশ ও নগদ দিয়ে সরাসরি টিউশন ফি আদায়',
      'অভিভাবক বিশেষ পোর্টাল ও অগ্রগতি ট্র্যাকিং',
      '৩ জন শিক্ষক ও অ্যাসিস্ট্যান্ট অ্যাকাউন্ট',
      'প্রিন্টযোগ্য মানি রিসিট ও অ্যাডমিট কার্ড'
    ]
  },
  {
    id: 'enterprise',
    name: 'বার্ষিক এন্টারপ্রাইজ (Yearly Enterprise)',
    englishName: 'Enterprise Mega',
    badge: 'সেরা সাশ্রয় (২০% ছাড়)',
    popular: false,
    monthlyPrice: 2499,
    yearlyPrice: 18999, // Super discount for 1 year
    studentLimit: 1000,
    description: 'শীর্ষস্থানীয় একাডেমি ও একাধিক শাখার জন্য নিজস্ব ব্র্যান্ডিং ও প্রিমিয়াম সুবিধার অল-ইন-ওয়ান প্ল্যান।',
    features: [
      '১,০০০+ শিক্ষার্থী ও আনলিমিটেড ব্যাচ',
      'নিজস্ব সাবডোমেইন ও ব্র্যান্ডেড অ্যাপ পোর্টাল',
      'একাধিক ব্রাঞ্চ / শাখার সেন্ট্রাল ড্যাশবোর্ড',
      'আনলিমিটেড এআই খাতা দেখা ও স্মার্ট অ্যানালিটিক্স',
      'সীমাহীন লাইভ চিটিং মনিটরিং ও রেড ফ্ল্যাগিং',
      'কাস্টম এসএমএস গেটওয়ে ইন্টিগ্রেশন',
      'অটো-রিনিউয়াল সুরক্ষা ও ডেডিকেটেড ম্যানেজার',
      '২৪/৭ প্রায়োরিটি ফোন ও হোয়াটসঅ্যাপ ভিআইপি সাপোর্ট',
      'ডাটা ব্যাকআপ ও এক্সেল রিপোর্ট এক্সপোর্ট'
    ]
  }
];

export const DEFAULT_COACHING_PROFILE: CoachingProfile = {
  id: 'c-default-101',
  name: 'মেধা একাডেমি ও কোচিং হোম',
  tagline: 'সততা, নিয়মানুবর্তিতা ও আধুনিক শিক্ষার নির্ভরযোগ্য প্রতিষ্ঠান',
  logo: '🎓',
  themeColor: '#059669', // Emerald 600
  eiinNumber: 'REG-DH-2024-89',
  phone: '01711-002233',
  email: 'info@medha-academy.edu.bd',
  division: 'ঢাকা',
  district: 'ঢাকা',
  address: 'বাড়ি নং ৪২, রোড ৭, ধানমন্ডি আ/এ, ঢাকা-১২০৫',
  branchesCount: 2,
  studentCapacity: 350,
  curriculumLevels: ['এসএসসি বিজ্ঞান বিভাগ', 'এইচএসসি বিজ্ঞান বিভাগ', 'মেডিকেল এডমিশন কেয়ার'],
  subdomain: 'medha-academy',
  foundedYear: '২০১৮',
  registeredAt: '২০২৪-০১-১৫'
};

export const INITIAL_SUBSCRIPTION_STATE: SubscriptionState = {
  planId: 'pro',
  planName: 'মাসিক প্রো (Monthly Pro)',
  status: 'active',
  billingCycle: 'monthly',
  startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  renewalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days remaining (triggers warning banner)
  autoRenew: true,
  lastPaymentMethod: 'bkash',
  lastAmountPaid: 1999,
  lastTransactionId: 'TRX9B82K410L',
  smsAlertsEnabled: true,
  emailAlertsEnabled: true,
  whatsappAlertsEnabled: true,
  alertDaysBefore: [7, 3, 1]
};

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNo: 'INV-2026-09-001',
    date: '১ সেপ্টেম্বর, ২০২৬',
    planName: 'মাসিক প্রো (Monthly Pro)',
    cycle: 'monthly',
    amount: 1999,
    paymentMethod: 'bkash',
    transactionId: 'BKASH-9X8K12L7',
    status: 'paid'
  },
  {
    id: 'inv-102',
    invoiceNo: 'INV-2026-10-002',
    date: '১ অক্টোবর, ২০২৬',
    planName: 'মাসিক প্রো (Monthly Pro)',
    cycle: 'monthly',
    amount: 1999,
    paymentMethod: 'bkash',
    transactionId: 'BKASH-4A9J77D2',
    status: 'paid'
  }
];
