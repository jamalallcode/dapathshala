import { AssignedTest, AppNotification, StudentSubmission } from '../types';
import { getQuestionsForChapter } from './curriculumQuestions';
import { supabase } from '../supabase';

const TESTS_KEY = "dapathshala_assigned_tests_v2";
const NOTIFS_KEY = "dapathshala_notifications_v2";
const DISMISSED_KEY = "dapathshala_dismissed_notifs_v2";
const SUBMISSIONS_KEY = "dapathshala_submissions_v2";

// No automatic dummy tests - user will create tests deliberately
export const INITIAL_TESTS: AssignedTest[] = [];

const DELETED_PINS_KEY = "dapathshala_deleted_pins_v2";
const CLEARED_ALL_KEY = "dapathshala_all_tests_cleared_at";

export function getDeletedPins(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_PINS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function addDeletedPin(pinOrId: string): void {
  try {
    const set = getDeletedPins();
    set.add(String(pinOrId).trim());
    localStorage.setItem(DELETED_PINS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function isPinDeleted(pin?: string, id?: string): boolean {
  if (!pin && !id) return false;
  const set = getDeletedPins();
  if (pin && set.has(String(pin).trim())) return true;
  if (id && set.has(String(id).trim())) return true;
  return false;
}

export function getStoredTests(): AssignedTest[] {
  try {
    const raw = localStorage.getItem(TESTS_KEY);
    if (!raw) {
      localStorage.setItem(TESTS_KEY, JSON.stringify([]));
      return [];
    }
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) {
      localStorage.setItem(TESTS_KEY, JSON.stringify([]));
      return [];
    }

    const clearedAtRaw = localStorage.getItem(CLEARED_ALL_KEY);
    const clearedAt = clearedAtRaw ? parseInt(clearedAtRaw, 10) : 0;

    // Filter out previous automatic demo tests, deleted pins, and tests older than clearedAt
    const cleaned: AssignedTest[] = list
      .filter((t: any) => {
        if (!t) return false;
        if (t.id === 'test-101' || t.id === 'test-102' || t.id === 'test-103') return false;
        if (isPinDeleted(t.pin, t.id)) return false;
        if (clearedAt > 0 && t.id && String(t.id).startsWith('test-')) {
          const time = parseInt(String(t.id).replace('test-', ''), 10);
          if (time && time < clearedAt) return false;
        }
        return true;
      })
      .map((t: any) => ({
        ...t,
        questions: Array.isArray(t.questions) ? t.questions : [],
        proctoringFlags: Array.isArray(t.proctoringFlags) ? t.proctoringFlags : []
      }));
    if (cleaned.length !== list.length) {
      localStorage.setItem(TESTS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export async function clearAllStoredTests(): Promise<void> {
  try {
    localStorage.setItem(TESTS_KEY, JSON.stringify([]));
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([]));
    localStorage.setItem(CLEARED_ALL_KEY, Date.now().toString());

    window.dispatchEvent(new Event("dapathshala_tests_updated"));
    window.dispatchEvent(new Event("dapathshala_submissions_updated"));

    // 1. Delete all from server
    try {
      await fetch('/api/tests', { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to clear server tests:', e);
    }

    // 2. Delete all from Supabase (using reliable PostgREST filters for each table schema)
    if (supabase) {
      try {
        await supabase.from('assigned_tests').delete().neq('id', '___dummy___');
        await supabase.from('exam_submissions').delete().neq('pin', '___dummy___');
        await supabase.from('assigned_tests').delete().gte('pin', '0');
        await supabase.from('exam_submissions').delete().gte('pin', '0');
      } catch (e) {
        console.warn('Failed to clear Supabase tests:', e);
      }
    }
  } catch (e) {
    console.error("Error clearing tests", e);
  }
}

export async function deleteStoredTest(pinOrId: string): Promise<void> {
  const pin = String(pinOrId).trim();
  addDeletedPin(pin);

  const list = getStoredTests().filter(t => t.pin !== pin && t.id !== pin);
  localStorage.setItem(TESTS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("dapathshala_tests_updated"));

  // 1. Server delete
  try {
    await fetch(`/api/tests/${pin}`, { method: 'DELETE' });
  } catch (e) {}

  // 2. Supabase delete
  if (supabase) {
    try {
      await supabase.from('assigned_tests').delete().eq('pin', pin);
      await supabase.from('assigned_tests').delete().eq('id', pin);
      await supabase.from('exam_submissions').delete().eq('pin', pin);
      await supabase.from('exam_submissions').delete().eq('test_id', pin);
    } catch (e) {}
  }
}

export function saveStoredTests(tests: AssignedTest[]): void {
  try {
    localStorage.setItem(TESTS_KEY, JSON.stringify(tests));
    if (tests.length > 0) {
      localStorage.removeItem(CLEARED_ALL_KEY);
    }
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
    const b64 = btoa(binary);
    // Produce URL-safe base64: replace + with -, / with _, remove padding =
    const urlSafe = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return encodeURIComponent(urlSafe);
  } catch (err) {
    console.error('encodeTestForUrl error:', err);
    return '';
  }
}

/**
 * Decodes an encoded test string from URL into an AssignedTest object.
 * Robust against URL-encoded characters, spaces, and base64 padding issues.
 */
export function decodeTestFromUrl(encodedStr: string): AssignedTest | null {
  try {
    if (!encodedStr) return null;
    let clean = encodedStr.trim();
    try {
      clean = decodeURIComponent(clean);
    } catch {}
    // Restore standard Base64: spaces/dashes to +, underscores to /
    clean = clean.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4 !== 0) {
      clean += '=';
    }
    const binary = atob(clean);
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
 * e.g. https://www.dapathshala.com/?pin=531824
 * Clean, minimal, and fits perfectly on WhatsApp, Messenger and SMS without long text!
 */
export function getShareableTestUrl(test: AssignedTest): string {
  const origin = window.location.origin;
  const path = window.location.pathname.endsWith('/') 
    ? window.location.pathname 
    : `${window.location.pathname || ''}/`;
  const cleanPath = path.replace(/\/+/g, '/');
  return `${origin}${cleanPath}?pin=${test.pin}`;
}

/**
 * Backend synchronization helpers for cross-device persistence with Supabase + Server
 */
export async function syncTestToServer(test: AssignedTest): Promise<boolean> {
  // 1. Sync to Supabase Cloud if connected
  if (supabase) {
    try {
      await supabase.from('assigned_tests').upsert([{
        pin: String(test.pin).trim(),
        id: test.id,
        title: test.title,
        subject: test.subject,
        chapter: test.chapter,
        status: test.status,
        question_count: test.questionCount,
        duration_minutes: test.durationMinutes,
        score: test.score,
        parent_comment: test.parentComment,
        proctoring_flags: test.proctoringFlags || [],
        questions: test.questions || [],
        payload: test,
        updated_at: new Date().toISOString()
      }], { onConflict: 'pin' });
    } catch (sbErr) {
      // Table might not exist yet; safe fallback
    }
  }

  // 2. Also sync to local Node Express Server
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
  const pin = String(pinOrId).trim();

  // 1. Try Supabase Cloud first
  if (supabase) {
    try {
      const { data } = await supabase
        .from('assigned_tests')
        .select('*')
        .or(`pin.eq.${pin},id.eq.${pin}`)
        .limit(1);

      if (data && data.length > 0) {
        const item = data[0];
        const payload = item.payload || {};
        const questions = (Array.isArray(item.questions) && item.questions.length > 0)
          ? item.questions
          : (Array.isArray(payload.questions) && payload.questions.length > 0 ? payload.questions : []);
        return {
          ...payload,
          id: item.id || payload.id,
          pin: item.pin || payload.pin,
          title: item.title || payload.title,
          subject: item.subject || payload.subject,
          chapter: item.chapter || payload.chapter,
          status: item.status || payload.status,
          score: item.score ?? payload.score,
          parentComment: item.parent_comment || payload.parentComment,
          questionCount: item.question_count ?? payload.questionCount ?? questions.length,
          durationMinutes: item.duration_minutes ?? payload.durationMinutes ?? 15,
          questions,
          proctoringFlags: item.proctoring_flags || payload.proctoringFlags || []
        };
      }
    } catch (sbErr) {
      // Supabase table or network issue; fallback to Express API
    }
  }

  // 2. Fallback to Express API
  try {
    const res = await fetch(`/api/tests/${pin}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        const questions = Array.isArray(data.questions) ? data.questions : [];
        return {
          ...data,
          questionCount: data.questionCount ?? questions.length,
          durationMinutes: data.durationMinutes ?? 15,
          questions,
          proctoringFlags: Array.isArray(data.proctoringFlags) ? data.proctoringFlags : []
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch test from server:', err);
  }
  return null;
}

export async function fetchAllTestsFromServer(): Promise<AssignedTest[]> {
  const clearedAtRaw = typeof window !== 'undefined' ? localStorage.getItem(CLEARED_ALL_KEY) : null;
  const clearedAt = clearedAtRaw ? parseInt(clearedAtRaw, 10) : 0;

  // 1. Try Supabase Cloud first
  if (supabase) {
    try {
      const { data } = await supabase
        .from('assigned_tests')
        .select('*')
        .order('updated_at', { ascending: false });

      if (Array.isArray(data) && data.length > 0) {
        return data
          .filter((item: any) => {
            if (isPinDeleted(item.pin, item.id)) return false;
            if (clearedAt > 0 && item.id && String(item.id).startsWith('test-')) {
              const time = parseInt(String(item.id).replace('test-', ''), 10);
              if (time && time < clearedAt) return false;
            }
            if (clearedAt > 0 && item.created_at) {
              const itemTime = new Date(item.created_at).getTime();
              if (itemTime && itemTime < clearedAt) return false;
            }
            return true;
          })
          .map((item: any) => {
            const payload = item.payload || {};
            let questions = (Array.isArray(item.questions) && item.questions.length > 0)
              ? item.questions
              : (Array.isArray(payload.questions) && payload.questions.length > 0 ? payload.questions : []);
            return {
              ...payload,
              id: item.id || payload.id,
              pin: item.pin || payload.pin,
              title: item.title || payload.title,
              subject: item.subject || payload.subject,
              chapter: item.chapter || payload.chapter,
              status: item.status || payload.status,
              score: item.score ?? payload.score,
              parentComment: item.parent_comment || payload.parentComment,
              questionCount: item.question_count ?? payload.questionCount ?? questions.length,
              durationMinutes: item.duration_minutes ?? payload.durationMinutes ?? 15,
              questions,
              proctoringFlags: item.proctoring_flags || payload.proctoringFlags || []
            };
          });
      }
    } catch (sbErr) {
      // Fallback to Express API
    }
  }

  // 2. Fallback to Express API
  try {
    const res = await fetch('/api/tests');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data
          .filter((t: any) => {
            if (isPinDeleted(t.pin, t.id)) return false;
            if (clearedAt > 0 && t.id && String(t.id).startsWith('test-')) {
              const time = parseInt(String(t.id).replace('test-', ''), 10);
              if (time && time < clearedAt) return false;
            }
            return true;
          })
          .map((t: any) => {
            let questions = Array.isArray(t.questions) && t.questions.length > 0 ? t.questions : [];
            return {
              ...t,
              questionCount: t.questionCount ?? questions.length,
              durationMinutes: t.durationMinutes ?? 15,
              questions,
              proctoringFlags: Array.isArray(t.proctoringFlags) ? t.proctoringFlags : []
            };
          });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch all tests from server:', err);
  }
  return [];
}

export async function syncSubmissionToServer(submission: any): Promise<boolean> {
  const pin = String(submission.pin || '').trim();

  // 1. Sync to Supabase Cloud
  if (supabase && pin) {
    try {
      await supabase.from('exam_submissions').upsert([{
        pin: pin,
        test_id: submission.id,
        title: submission.title,
        status: submission.status || 'submitted',
        score: submission.score,
        student_name: submission.studentName || 'পরীক্ষার্থী',
        proctoring_flags: submission.proctoringFlags || [],
        questions: submission.questions || [],
        payload: submission,
        updated_at: new Date().toISOString()
      }], { onConflict: 'pin' });

      // Also update assigned_tests table
      await supabase.from('assigned_tests').update({
        status: submission.status || 'submitted',
        score: submission.score,
        proctoring_flags: submission.proctoringFlags || [],
        questions: submission.questions || [],
        updated_at: new Date().toISOString()
      }).eq('pin', pin);
    } catch (sbErr) {
      // Safe fallback
    }
  }

  // 2. Sync to Express Server
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
  const pin = String(pinOrId).trim();

  // 1. Try Supabase Cloud first
  if (supabase) {
    try {
      const { data } = await supabase
        .from('exam_submissions')
        .select('*')
        .or(`pin.eq.${pin},test_id.eq.${pin}`)
        .limit(1);

      if (data && data.length > 0) {
        const item = data[0];
        const payload = item.payload || {};
        return {
          ...payload,
          pin: item.pin || payload.pin,
          id: item.test_id || payload.id,
          title: item.title || payload.title,
          status: item.status || payload.status,
          score: item.score ?? payload.score,
          studentName: item.student_name || payload.studentName,
          questions: item.questions || payload.questions || [],
          proctoringFlags: item.proctoring_flags || payload.proctoringFlags || []
        };
      }
    } catch (sbErr) {
      // Fallback
    }
  }

  // 2. Fallback to Express Server
  try {
    const res = await fetch(`/api/submissions/${pin}`);
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
    const b64 = btoa(binary);
    const urlSafe = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return encodeURIComponent(urlSafe);
  } catch (err) {
    return '';
  }
}

/**
 * Decodes a submission from URL so parent can review across devices.
 */
export function decodeSubmissionFromUrl(encodedStr: string): AssignedTest | null {
  try {
    if (!encodedStr) return null;
    let clean = encodedStr.trim();
    try {
      clean = decodeURIComponent(clean);
    } catch {}
    clean = clean.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4 !== 0) {
      clean += '=';
    }
    const binary = atob(clean);
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
 * e.g. https://www.dapathshala.com/?reviewPin=531824
 */
export function getShareableSubmissionUrl(test: AssignedTest): string {
  const origin = window.location.origin;
  const path = window.location.pathname.endsWith('/') 
    ? window.location.pathname 
    : `${window.location.pathname || ''}/`;
  const cleanPath = path.replace(/\/+/g, '/');
  return `${origin}${cleanPath}?reviewPin=${test.pin}`;
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
