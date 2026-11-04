import { AssignedTest, AppNotification, StudentSubmission } from '../types';
import { getQuestionsForChapter } from './curriculumQuestions';

const TESTS_KEY = "dapathshala_assigned_tests_v2";
const NOTIFS_KEY = "dapathshala_notifications_v2";
const DISMISSED_KEY = "dapathshala_dismissed_notifs_v2";
const SUBMISSIONS_KEY = "dapathshala_submissions_v2";

// No automatic dummy tests - user will create tests deliberately
export const INITIAL_TESTS: AssignedTest[] = [];

export function getStoredTests(): AssignedTest[] {
  try {
    const raw = localStorage.getItem(TESTS_KEY);
    if (!raw) {
      localStorage.setItem(TESTS_KEY, JSON.stringify([]));
      return [];
    }
    const list: AssignedTest[] = JSON.parse(raw);
    // Filter out previous automatic demo tests (test-101, test-102, test-103)
    const cleaned = list.filter(t => t.id !== 'test-101' && t.id !== 'test-102' && t.id !== 'test-103');
    if (cleaned.length !== list.length) {
      localStorage.setItem(TESTS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function clearAllStoredTests(): void {
  try {
    localStorage.setItem(TESTS_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event("dapathshala_tests_updated"));
  } catch (e) {
    console.error("Error clearing tests", e);
  }
}

export function saveStoredTests(tests: AssignedTest[]): void {
  try {
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
    window.dispatchEvent(new Event("dapathshala_tests_updated"));
    // Sync to backend API in background for cross-device support
    tests.forEach(t => {
      syncTestToServer(t);
    });
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
 * Generates an ultra-short, clean shareable URL containing only the 6-digit PIN.
 * e.g. https://domain.com/?pin=997080
 * Fits on a single line on WhatsApp and mobile SMS!
 */
export function getShareableTestUrl(test: AssignedTest): string {
  const origin = window.location.origin;
  return `${origin}?pin=${test.pin}`;
}

/**
 * Backend synchronization helpers for cross-device persistence
 */
export async function syncTestToServer(test: AssignedTest): Promise<boolean> {
  try {
    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(test)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchTestFromServer(pinOrId: string): Promise<AssignedTest | null> {
  try {
    const res = await fetch(`/api/tests/${pinOrId}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Failed to fetch test from server:', err);
  }
  return null;
}

export async function syncSubmissionToServer(submission: any): Promise<boolean> {
  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchSubmissionFromServer(pinOrId: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/submissions/${pinOrId}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Failed to fetch submission from server:', err);
  }
  return null;
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
 * Generates the clean shareable submission URL that the child sends to the parent.
 */
export function getShareableSubmissionUrl(test: AssignedTest): string {
  const origin = window.location.origin;
  return `${origin}?reviewPin=${test.pin}`;
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
