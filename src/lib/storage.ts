import { AssignedTest, AppNotification, StudentSubmission } from '../types';
import { getQuestionsForChapter } from './curriculumQuestions';

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
      localStorage.setItem(NOTIFS_KEY, JSON.stringify([]));
      return [];
    }
    const list: AppNotification[] = JSON.parse(raw);
    // Remove read or dismissed notifications so once viewed they do not remain
    const unread = list.filter(n => !n.isRead && n.testId !== 'test-101');
    if (unread.length !== list.length) {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(unread));
    }
    return unread;
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

// =====================================================================
// CROSS-DEVICE SHARING & URL RECONSTRUCTION HELPERS
// =====================================================================

/**
 * Compactly encodes an AssignedTest into a URL-safe Base64 string
 * with full Unicode / Bangla character support.
 */
export function encodeTestForUrl(test: AssignedTest): string {
  try {
    const payload = {
      i: test.id,
      t: test.title,
      s: test.subject,
      c: test.chapter,
      d: test.durationMinutes,
      p: test.pin,
      pr: test.proctoringEnabled ? 1 : 0,
      q: test.questions.map(q => ({
        id: q.id,
        q: q.question,
        o: q.options,
        a: q.correctAnswer,
        e: q.explanation || ''
      }))
    };
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return encodeURIComponent(btoa(binary));
  } catch (err) {
    console.error('encodeTestForUrl error:', err);
    return '';
  }
}

/**
 * Decodes an encoded test string from URL into an AssignedTest object.
 */
export function decodeTestFromUrl(encodedStr: string): AssignedTest | null {
  try {
    const decodedUri = decodeURIComponent(encodedStr);
    const binary = atob(decodedUri);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const p = JSON.parse(json);

    return {
      id: p.i || `test-${Date.now()}`,
      title: p.t || 'অনলাইন পরীক্ষা',
      subject: p.s || 'সাধারণ গণিত',
      chapter: p.c || 'অধ্যায় মূল্যায়ন',
      questionCount: p.q ? p.q.length : 5,
      durationMinutes: p.d || 15,
      pin: p.p || '123456',
      createdAt: 'আজ, নির্ধারিত পরীক্ষা',
      status: 'pending',
      studentName: 'পরীক্ষার্থী',
      totalMarks: (p.q ? p.q.length : 5) * 20,
      proctoringEnabled: p.pr === 1,
      aiGradingEnabled: true,
      questions: (p.q || []).map((q: any) => ({
        id: q.id,
        question: q.q,
        options: q.o,
        correctAnswer: q.a,
        explanation: q.e || ''
      }))
    };
  } catch (err) {
    console.error('decodeTestFromUrl error:', err);
    return null;
  }
}

/**
 * Generates the full shareable URL containing the PIN and encoded exam payload.
 * When anyone opens this link on ANY device, mobile or desktop, the exam opens immediately!
 */
export function getShareableTestUrl(test: AssignedTest): string {
  const origin = window.location.origin;
  const encoded = encodeTestForUrl(test);
  return `${origin}?pin=${test.pin}&exam=${encoded}`;
}

/**
 * Encodes a completed student submission into a URL-safe string.
 */
export function encodeSubmissionForUrl(test: AssignedTest): string {
  try {
    const payload = {
      i: test.id,
      t: test.title,
      s: test.subject,
      c: test.chapter,
      p: test.pin,
      sc: test.score || 0,
      fl: test.proctoringFlags || [],
      st: test.status,
      q: test.questions.map(q => ({
        id: q.id,
        q: q.question,
        o: q.options,
        a: q.correctAnswer,
        sa: q.studentAnswer || '',
        ic: q.isCorrect ? 1 : 0,
        e: q.explanation || ''
      }))
    };
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return encodeURIComponent(btoa(binary));
  } catch (err) {
    return '';
  }
}

/**
 * Decodes a submission from URL so parent can review across devices.
 */
export function decodeSubmissionFromUrl(encodedStr: string): AssignedTest | null {
  try {
    const decodedUri = decodeURIComponent(encodedStr);
    const binary = atob(decodedUri);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder().decode(bytes);
    const p = JSON.parse(json);

    return {
      id: p.i || `test-${Date.now()}`,
      title: p.t || 'অনলাইন পরীক্ষা',
      subject: p.s || 'সাধারণ গণিত',
      chapter: p.c || 'অধ্যায় মূল্যায়ন',
      questionCount: p.q ? p.q.length : 5,
      durationMinutes: 15,
      pin: p.p || '123456',
      createdAt: 'আজ, জমা দেওয়া খাতা',
      status: (p.st as any) || 'submitted',
      studentName: 'পরীক্ষার্থী',
      score: p.sc,
      totalMarks: (p.q ? p.q.length : 5) * 20,
      proctoringEnabled: true,
      aiGradingEnabled: true,
      proctoringFlags: p.fl || [],
      questions: (p.q || []).map((q: any) => ({
        id: q.id,
        question: q.q,
        options: q.o,
        correctAnswer: q.a,
        studentAnswer: q.sa,
        isCorrect: q.ic === 1,
        explanation: q.e || ''
      }))
    };
  } catch (err) {
    return null;
  }
}

/**
 * Generates the shareable submission URL that the child sends to the parent.
 */
export function getShareableSubmissionUrl(test: AssignedTest): string {
  const origin = window.location.origin;
  const encoded = encodeSubmissionForUrl(test);
  return `${origin}?reviewId=${test.id}&subData=${encoded}`;
}

/**
 * Fallback generator: If someone manually enters a 6-digit PIN on any device
 * and the exact custom test is not in that device's localStorage,
 * deterministically construct a curriculum test for that PIN so they are NEVER locked out!
 */
export function generateFallbackTestForPin(pin: string): AssignedTest {
  const pinNum = parseInt(pin, 10) || 123456;
  const subjects = [
    { sub: 'সাধারণ গণিত', chap: 'বীজগণিত ও সমীকরণ' },
    { sub: 'সাধারণ বিজ্ঞান', chap: 'পদার্থবিজ্ঞান ও বলগতি' },
    { sub: 'বাংলা', chap: 'অপরিচিতা (রবীন্দ্রনাথ ঠাকুর)' },
    { sub: 'সাধারণ গণিত', chap: 'জ্যামিতি ও ক্ষেত্রফল' },
    { sub: 'ইংরেজি', chap: 'Right Form of Verbs' }
  ];
  const selected = subjects[pinNum % subjects.length];
  const rawQuestions = getQuestionsForChapter(selected.sub, selected.chap, 5);

  return {
    id: `test-pin-${pin}`,
    title: `${selected.sub}: ${selected.chap} মূল্যায়ন`,
    subject: selected.sub,
    chapter: selected.chap,
    questionCount: 5,
    durationMinutes: 15,
    pin: pin,
    createdAt: 'আজ, নির্ধারিত পরীক্ষা',
    status: 'pending',
    studentName: 'পরীক্ষার্থী / সন্তান',
    totalMarks: 100,
    proctoringEnabled: true,
    aiGradingEnabled: true,
    questions: rawQuestions.map((q, idx) => ({
      id: q.id || `q_${pin}_${idx}`,
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || ''
    }))
  };
}
