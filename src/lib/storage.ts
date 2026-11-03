import { AssignedTest, AppNotification, StudentSubmission } from '../types';

const TESTS_KEY = "dapathshala_assigned_tests_v2";
const NOTIFS_KEY = "dapathshala_notifications_v2";
const DISMISSED_KEY = "dapathshala_dismissed_notifs_v2";
const SUBMISSIONS_KEY = "dapathshala_submissions_v2";

export const INITIAL_TESTS: AssignedTest[] = [
  {
    id: "test-101",
    title: "অধ্যায় ৩: পরিমাপ ও ক্ষেত্রফল মডেল টেস্ট",
    subject: "গণিত",
    chapter: "অধ্যায় ৩: চার প্রক্রিয়া সম্পর্কিত সমস্যাবলী ও ক্ষেত্রফল",
    questionCount: 5,
    durationMinutes: 15,
    pin: "787193",
    createdAt: "২৬ অক্টোবর ২০২৬, সকাল ১০:৩০",
    status: "reviewed",
    studentName: "পরীক্ষার্থী",
    score: 85,
    totalMarks: 100,
    isPublished: true,
    proctoringEnabled: true,
    aiGradingEnabled: true,
    proctoringFlags: [],
    parentComment: "খুব ভালো হয়েছে। তবে জ্যামিতিক সূত্রে আরও মনোযোগ দিতে হবে।",
    questions: [
      {
        id: "q1",
        question: "একটি আয়তাকার বাগানের দৈর্ঘ্য ২০ মিটার এবং প্রস্থ ১২ মিটার হলে বাগানের ক্ষেত্রফল কত বর্গমিটার?",
        options: ["২৪০ বর্গমিটার", "১২০ বর্গমিটার", "৬৪ বর্গমিটার", "১৮০ বর্গমিটার"],
        correctAnswer: "২৪০ বর্গমিটার",
        studentAnswer: "২৪০ বর্গমিটার",
        explanation: "ক্ষেত্রফল = দৈর্ঘ্য × প্রস্থ = ২০ × ১২ = ২৪০ বর্গমিটার।",
        isCorrect: true
      },
      {
        id: "q2",
        question: "১ হেক্টর = কত বর্গমিটার?",
        options: ["১,০০০ বর্গমিটার", "১০,০০০ বর্গমিটার", "১০০ বর্গমিটার", "৫০,০০০ বর্গমিটার"],
        correctAnswer: "১০,০০০ বর্গমিটার",
        studentAnswer: "১০,০০০ বর্গমিটার",
        explanation: "১ হেক্টর = ১০০ এয়র = ১০,০০০ বর্গমিটার।",
        isCorrect: true
      },
      {
        id: "q3",
        question: "ত্রিভুজের ক্ষেত্রফল নির্ণয়ের সূত্র কোনটি?",
        options: ["(ভূমি × উচ্চতা) ÷ ২", "দৈর্ঘ্য × প্রস্থ", "২ × (দৈর্ঘ্য + প্রস্থ)", "বাহু × বাহু"],
        correctAnswer: "(ভূমি × উচ্চতা) ÷ ২",
        studentAnswer: "(ভূমি × উচ্চতা) ÷ ২",
        explanation: "ত্রিভুজের ক্ষেত্রফল = (ভূমি × উচ্চতা) ÷ ২।",
        isCorrect: true
      },
      {
        id: "q4",
        question: "একটি বর্গাকার মাঠের এক বাহুর দৈর্ঘ্য ২৫ মিটার হলে এর পরিসীমা কত?",
        options: ["৫০ মিটার", "৭৫ মিটার", "১০০ মিটার", "৬২৫ মিটার"],
        correctAnswer: "১০০ মিটার",
        studentAnswer: "১০০ মিটার",
        explanation: "বর্গের পরিসীমা = ৪ × এক বাহুর দৈর্ঘ্য = ৪ × ২৫ = ১০০ মিটার।",
        isCorrect: true
      },
      {
        id: "q5",
        question: "কোন ত্রিভুজের তিনটি বাহুই সমান হলে তাকে কী বলে?",
        options: ["সমবাহু ত্রিভুজ", "সমদ্বিবাহু ত্রিভুজ", "বিষমবাহু ত্রিভুজ", "সমকোণী ত্রিভুজ"],
        correctAnswer: "সমবাহু ত্রিভুজ",
        studentAnswer: "সমদ্বিবাহু ত্রিভুজ",
        explanation: "যে ত্রিভুজের তিনটি বাহুই পরস্পর সমান তাকে সমবাহু ত্রিভুজ বলা হয়।",
        isCorrect: false
      }
    ]
  },
  {
    id: "test-102",
    title: "অধ্যায় ৫: পদার্থ ও শক্তি উইকলি কুইজ",
    subject: "বিজ্ঞান",
    chapter: "অধ্যায় ৫: শক্তির রূপান্তর ও সংরক্ষণ",
    questionCount: 4,
    durationMinutes: 10,
    pin: "542918",
    createdAt: "২৫ অক্টোবর ২০২৬, বিকাল ৪:১৫",
    status: "submitted",
    studentName: "পরীক্ষার্থী",
    score: 75,
    totalMarks: 100,
    isPublished: true,
    proctoringEnabled: true,
    aiGradingEnabled: false,
    questions: [
      {
        id: "sci-1",
        question: "উদ্ভিদ সালোকসংশ্লেষণ প্রক্রিয়ায় কোন শক্তিকে রাসায়নিক শক্তিতে রূপান্তর করে?",
        options: ["আলোক শক্তি", "শব্দ শক্তি", "তাপ শক্তি", "যান্ত্রিক শক্তি"],
        correctAnswer: "আলোক শক্তি",
        studentAnswer: "আলোক শক্তি",
        explanation: "সূর্যালোকের সাহায্যে সবুজ উদ্ভিদ খাদ্য তৈরি করে আলোক শক্তিকে রাসায়নিক শক্তিতে পরিণত করে।",
        isCorrect: true
      },
      {
        id: "sci-2",
        question: "শক্তির মূল উৎস কোনটি?",
        options: ["চাঁদ", "সূর্য", "বিদ্যুৎ", "বাতাস"],
        correctAnswer: "সূর্য",
        studentAnswer: "সূর্য",
        explanation: "পৃথিবীর সকল শক্তির মূল উৎস হলো সূর্য।",
        isCorrect: true
      },
      {
        id: "sci-3",
        question: "টেলিভিশন চললে বিদ্যুৎ শক্তি প্রধানত কোন কোন শক্তিতে রূপান্তরিত হয়?",
        options: ["আলোক ও শব্দ শক্তি", "শব্দ ও রাসায়নিক শক্তি", "চৌম্বক ও পারমাণবিক শক্তি", "শুধুমাত্র তাপ শক্তি"],
        correctAnswer: "আলোক ও শব্দ শক্তি",
        studentAnswer: "আলোক ও শব্দ শক্তি",
        explanation: "টেলিভিশনে বিদ্যুৎ শক্তি মূলত আলো এবং শব্দ শক্তিতে রূপ নেয়।",
        isCorrect: true
      },
      {
        id: "sci-4",
        question: "কোনটি নবায়নযোগ্য শক্তির উৎস?",
        options: ["কয়লা", "প্রাকৃতিক গ্যাস", "বায়ুপ্রবাহ", "পেট্রোলিয়াম"],
        correctAnswer: "বায়ুপ্রবাহ",
        studentAnswer: "প্রাকৃতিক গ্যাস",
        explanation: "বায়ুপ্রবাহ নিঃশেষ হয় না, তাই এটি নবায়নযোগ্য শক্তি।",
        isCorrect: false
      }
    ]
  },
  {
    id: "test-103",
    title: "অধ্যায় ২: পরিবেশ দূষণ ও প্রতিকার প্রস্তুতি",
    subject: "বাংলাদেশ ও বিশ্বপরিচয়",
    chapter: "অধ্যায় ২: পরিবেশের ভারসাম্য",
    questionCount: 3,
    durationMinutes: 10,
    pin: "918374",
    createdAt: "২৪ অক্টোবর ২০২৬, সকাল ১১:০০",
    status: "pending",
    studentName: "পরীক্ষার্থী",
    totalMarks: 60,
    isPublished: false,
    proctoringEnabled: true,
    aiGradingEnabled: true,
    questions: [
      {
        id: "bgs-1",
        question: "বায়ু দূষণের প্রধান কারণ কী?",
        options: ["যানবাহন ও কলকারখানার কালো ধোঁয়া", "গাছ লাগানো", "বৃষ্টিপাত", "নদীতে মাছ ধরা"],
        correctAnswer: "যানবাহন ও কলকারখানার কালো ধোঁয়া",
        explanation: "কালো ধোঁয়ায় কার্বন মনোক্সাইড থাকে যা বাতাস দূষিত করে।"
      },
      {
        id: "bgs-2",
        question: "শব্দ দূষণের ক্ষতিকর প্রভাব কোনটি?",
        options: ["শ্রবণশক্তি হ্রাস পাওয়া", "দৃষ্টিশক্তি বাড়া", "ত্বকের রোগ", "স্মৃতিশক্তি বৃদ্ধি"],
        correctAnswer: "শ্রবণশক্তি হ্রাস পাওয়া",
        explanation: "উচ্চ শব্দের কারণে কানের শ্রবণশক্তি কমে যায় ও হৃদরোগ হতে পারে।"
      },
      {
        id: "bgs-3",
        question: "মাটি দূষণ রোধে কোনটি সবচেয়ে কার্যকর?",
        options: ["প্লাস্টিকের ব্যবহার কমানো ও গাছ লাগানো", "রাসায়নিক কীটনাশক বেশি দেওয়া", "প্লাস্টিক মাটিতে পুঁতে রাখা", "পুকুর ভরাট করা"],
        correctAnswer: "প্লাস্টিকের ব্যবহার কমানো ও গাছ লাগানো",
        explanation: "প্লাস্টিক পচনশীল নয়, তাই পুনর্ব্যবহার ও বৃক্ষরোপণ পরিবেশ রক্ষা করে।"
      }
    ]
  }
];

export function getStoredTests(): AssignedTest[] {
  try {
    const raw = localStorage.getItem(TESTS_KEY);
    if (!raw) {
      localStorage.setItem(TESTS_KEY, JSON.stringify(INITIAL_TESTS));
      return INITIAL_TESTS;
    }
    const list: AssignedTest[] = JSON.parse(raw);
    let changed = false;
    const migrated = list.map(t => {
      if (t.id === 'test-101' && t.status === 'submitted' && t.score !== undefined) {
        changed = true;
        return { ...t, status: 'reviewed' as const };
      }
      return t;
    });
    if (changed) {
      localStorage.setItem(TESTS_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return INITIAL_TESTS;
  }
}

export function saveStoredTests(tests: AssignedTest[]): void {
  try {
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
    window.dispatchEvent(new Event("dapathshala_tests_updated"));
  } catch (e) {
    console.error("Error saving tests", e);
  }
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFS_KEY);
    if (!raw) {
      const initial: AppNotification[] = [
        {
          id: "notif-1",
          title: "নতুন উত্তরপত্র জমা হয়েছে",
          message: 'পরীক্ষার্থী "গণিত অধ্যায় ৩: পরিমাপ ও ক্ষেত্রফল" পরীক্ষার উত্তরপত্র জমা দিয়েছে।',
          time: "১০ মিনিট আগে",
          testId: "test-101",
          isRead: false,
          forRole: "parent"
        }
      ];
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new Event("dapathshala_notifs_updated"));
  } catch (e) {
    console.error("Error saving notifs", e);
  }
}

export function addDismissedNotifId(id: string): void {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(list));
    }
  } catch {
  }
}

export function clearAllNotifications(): void {
  try {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("dapathshala_notifs_updated"));
  } catch (e) {
    console.error("Error clearing notifs", e);
  }
}

export function getStoredSubmissions(): Record<string, StudentSubmission> {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredSubmission(sub: StudentSubmission): void {
  try {
    const subs = getStoredSubmissions();
    subs[sub.testId] = sub;
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs));
    window.dispatchEvent(new Event("dapathshala_submissions_updated"));
  } catch (e) {
    console.error("Error saving submission", e);
  }
}
