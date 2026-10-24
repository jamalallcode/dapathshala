import { supabase } from '../supabase';

export interface ProctoringLogEntry {
  id: string;
  examId: string;
  examTitle: string;
  studentName: string;
  childId: string;
  violationType: 'tab_switch' | 'window_blur' | 'fullscreen_exit' | 'copy_attempt' | 'right_click';
  violationDetails: string;
  flagCount: number;
  isAutoSubmitted: boolean;
  timestamp: string;
  isRead?: boolean;
}

const STORAGE_LOGS_KEY = 'dapathshala_proctoring_logs';
const PROCTORING_CHANNEL_NAME = 'dapathshala_proctoring_channel';

// Initial realistic demo logs so parents immediately see real-time log entries and red flags
const SEED_PROCTORING_LOGS: ProctoringLogEntry[] = [
  {
    id: 'log_seed_1',
    examId: 'test-101',
    examTitle: 'গণিত সাপ্তাহিক মূল্যায়ন',
    studentName: 'আরাফাত রহমান',
    childId: 'child_1',
    violationType: 'tab_switch',
    violationDetails: 'অন্য ট্যাব বা ব্রাউজার উইন্ডোতে যাওয়ার চেষ্টা করেছে',
    flagCount: 1,
    isAutoSubmitted: false,
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    isRead: false
  },
  {
    id: 'log_seed_2',
    examId: 'test-101',
    examTitle: 'গণিত সাপ্তাহিক মূল্যায়ন',
    studentName: 'আরাফাত রহমান',
    childId: 'child_1',
    violationType: 'fullscreen_exit',
    violationDetails: 'অনুমতি ছাড়া ফুলস্ক্রিন মোড থেকে বের হওয়ার চেষ্টা করেছে',
    flagCount: 2,
    isAutoSubmitted: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isRead: false
  }
];

// Helper to broadcast via BroadcastChannel across browser tabs
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(PROCTORING_CHANNEL_NAME);
  }
} catch {
  broadcastChannel = null;
}

/**
 * Record a suspicious proctoring event to Supabase and Local Realtime Channel
 */
export const recordProctoringViolation = async (
  entry: Omit<ProctoringLogEntry, 'id' | 'timestamp'>
): Promise<ProctoringLogEntry> => {
  const newLog: ProctoringLogEntry = {
    ...entry,
    id: 'plog_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    isRead: false
  };

  // 1. Local Storage Persistence
  try {
    const existing = getProctoringLogs();
    const updated = [newLog, ...existing];
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (err) {
    console.warn('Failed to save log to localStorage:', err);
  }

  // 2. Broadcast via BroadcastChannel (instant real-time communication across parent/child tabs)
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage(newLog);
    }
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }

  // 3. Dispatch Local CustomEvent for same-tab updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('dapathshala_proctoring_alert', { detail: newLog })
    );
  }

  // 4. Record to Supabase if configured
  if (supabase) {
    try {
      const { error } = await supabase.from('exam_proctoring_logs').insert([
        {
          id: newLog.id,
          exam_id: newLog.examId,
          exam_title: newLog.examTitle,
          student_name: newLog.studentName,
          child_id: newLog.childId,
          violation_type: newLog.violationType,
          violation_details: newLog.violationDetails,
          flag_count: newLog.flagCount,
          is_auto_submitted: newLog.isAutoSubmitted,
          created_at: newLog.timestamp
        }
      ]);

      if (error) {
        console.warn('Supabase exam_proctoring_logs insert note:', error.message);
      }
    } catch (err) {
      console.warn('Supabase proctoring network note:', err);
    }
  }

  return newLog;
};

/**
 * Get all proctoring logs from storage with optional childId filter
 */
export const getProctoringLogs = (childId?: string): ProctoringLogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_LOGS_KEY);
    let logs: ProctoringLogEntry[] = raw ? JSON.parse(raw) : SEED_PROCTORING_LOGS;
    if (childId) {
      return logs.filter(log => !log.childId || log.childId === childId);
    }
    return logs;
  } catch {
    return SEED_PROCTORING_LOGS;
  }
};

/**
 * Fetch latest proctoring logs directly from Supabase database table
 */
export const fetchSupabaseProctoringLogs = async (childId?: string): Promise<ProctoringLogEntry[]> => {
  if (!supabase) return getProctoringLogs(childId);

  try {
    let query = supabase
      .from('exam_proctoring_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (childId) {
      query = query.eq('child_id', childId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const fetched: ProctoringLogEntry[] = data.map((row: any) => ({
        id: row.id,
        examId: row.exam_id,
        examTitle: row.exam_title,
        studentName: row.student_name,
        childId: row.child_id,
        violationType: row.violation_type,
        violationDetails: row.violation_details,
        flagCount: row.flag_count,
        isAutoSubmitted: row.is_auto_submitted,
        timestamp: row.created_at,
        isRead: false
      }));

      // Merge with local storage
      const local = getProctoringLogs();
      const mergedMap = new Map<string, ProctoringLogEntry>();
      [...fetched, ...local].forEach(item => mergedMap.set(item.id, item));
      const merged = Array.from(mergedMap.values());
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(merged.slice(0, 50)));

      return childId ? merged.filter(l => !l.childId || l.childId === childId) : merged;
    }
  } catch (err) {
    console.warn('Error fetching Supabase proctoring logs:', err);
  }

  return getProctoringLogs(childId);
};

/**
 * Mark logs as read
 */
export const markProctoringLogsAsRead = (childId?: string): void => {
  try {
    const logs = getProctoringLogs();
    const updated = logs.map(l => {
      if (!childId || l.childId === childId) {
        return { ...l, isRead: true };
      }
      return l;
    });
    localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to mark logs as read:', err);
  }
};

/**
 * Subscribe to real-time proctoring alerts across Supabase and BroadcastChannel
 */
export const subscribeToProctoringAlerts = (
  callback: (log: ProctoringLogEntry) => void
): (() => void) => {
  // 1. BroadcastChannel message listener
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.id && event.data.violationDetails) {
      callback(event.data as ProctoringLogEntry);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // 2. CustomEvent listener
  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<ProctoringLogEntry>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dapathshala_proctoring_alert', handleCustomEvent);
  }

  // 3. Supabase Realtime Subscription if available
  let supabaseSubscription: any = null;
  if (supabase) {
    try {
      supabaseSubscription = supabase
        .channel('proctoring_realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'exam_proctoring_logs' },
          (payload: any) => {
            if (payload?.new) {
              const row = payload.new;
              const entry: ProctoringLogEntry = {
                id: row.id,
                examId: row.exam_id,
                examTitle: row.exam_title || 'লাইভ পরীক্ষা',
                studentName: row.student_name || 'শিক্ষার্থী',
                childId: row.child_id || 'child_1',
                violationType: row.violation_type,
                violationDetails: row.violation_details,
                flagCount: row.flag_count,
                isAutoSubmitted: row.is_auto_submitted,
                timestamp: row.created_at || new Date().toISOString(),
                isRead: false
              };
              callback(entry);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase realtime channel subscription note:', err);
    }
  }

  // Return unsubscribe cleanup function
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('dapathshala_proctoring_alert', handleCustomEvent);
    }
    if (supabaseSubscription && supabase) {
      try {
        supabase.removeChannel(supabaseSubscription);
      } catch {}
    }
  };
};

export interface ExamSubmissionPayload {
  id: string;
  examId: string;
  title: string;
  subject: string;
  chapter: string;
  questions: any[];
  duration: number;
  totalMarks: number;
  studentName: string;
  childId: string;
  answers: Record<string, number>;
  handwrittenImages: string[];
  submittedAt: string;
  status: 'submitted';
  score?: number | null;
  redFlagsCount?: number;
  violations?: string[];
  evaluationMode?: 'ai' | 'manual' | 'pending';
  aiFeedback?: string | null;
  aiDetailedMarking?: Array<{
    questionId: string;
    isCorrect: boolean;
    marksObtained: number;
    maxMarks: number;
    redInkNote: string;
  }>;
  manualGrades?: Record<string, { marks: number; comment: string }>;
  parentComment?: string | null;
}

const STORAGE_TESTS_KEY = 'dapathshala_parent_assigned_tests';

/**
 * Submit an exam script with handwritten images and answers, notifying the parent dashboard in real-time
 */
export const submitExamScript = async (
  payload: ExamSubmissionPayload
): Promise<ExamSubmissionPayload> => {
  // 1. Persist to localStorage assigned tests
  try {
    const raw = localStorage.getItem(STORAGE_TESTS_KEY);
    const existing: any[] = raw ? JSON.parse(raw) : [];

    const norm = (s?: string) => {
      if (!s) return '';
      return s.trim().toLowerCase()
        .replace(/\u09AF\u09BC/g, '\u09DF') // normalize Bengali Ya
        .replace(/[\s\-_:(),।]/g, '');
    };

    const targetPin = (payload as any).pin ? String((payload as any).pin).trim() : '';
    const targetTitle = norm(payload.title);
    const targetChapter = norm(payload.chapter);
    const targetSubject = (payload.subject || '').trim();

    // Find the matching test in the assigned tests list
    let index = existing.findIndex(t => {
      if (!t) return false;
      // 1. ID or examId match
      if (t.id && (t.id === payload.id || t.id === payload.examId)) return true;
      if (t.examId && (t.examId === payload.id || t.examId === payload.examId)) return true;
      // 2. PIN match
      if (targetPin && t.pin && String(t.pin).trim() === targetPin) return true;
      if (targetPin && (t.id === targetPin || t.examId === targetPin)) return true;
      // 3. Exact or normalized title match
      if (targetTitle && norm(t.title) === targetTitle) return true;
      return false;
    });

    // If not matched yet, try matching any pending test in the same subject and chapter
    if (index === -1) {
      index = existing.findIndex(t => {
        if (!t || t.status !== 'pending') return false;
        if (targetSubject && t.subject === targetSubject) {
          if (targetChapter && (norm(t.chapter).includes(targetChapter) || targetChapter.includes(norm(t.chapter)))) {
            return true;
          }
        }
        return false;
      });
    }

    // If still not matched, and there is only ONE pending test, match that pending test!
    if (index === -1) {
      const pendingIndices = existing
        .map((t, idx) => (t && t.status === 'pending' ? idx : -1))
        .filter(idx => idx !== -1);
      if (pendingIndices.length === 1) {
        index = pendingIndices[0];
      }
    }

    let updated: any[];
    if (index >= 0) {
      const prevTest = existing[index];
      const prevQ = prevTest.questionsList || prevTest.questions || [];
      const payloadQ = payload.questions || [];
      const mergedQuestions = (payloadQ.length >= prevQ.length && payloadQ.length > 0)
        ? payloadQ
        : (prevQ.length > 0 ? prevQ : payloadQ);

      updated = [...existing];
      updated[index] = {
        ...prevTest,
        ...payload,
        pin: prevTest.pin || targetPin,
        title: prevTest.title || payload.title,
        subject: prevTest.subject || payload.subject,
        chapter: prevTest.chapter || payload.chapter,
        status: 'submitted',
        isSubmitted: true,
        isViewed: false,
        questions: mergedQuestions,
        questionsList: prevTest.questionsList || mergedQuestions,
        totalMarks: mergedQuestions.length > 0 ? mergedQuestions.length : (payload.totalMarks || prevTest.totalMarks || 15)
      };
    } else {
      updated = [{ ...payload, status: 'submitted', isSubmitted: true, isViewed: false }, ...existing];
    }
    localStorage.setItem(STORAGE_TESTS_KEY, JSON.stringify(updated));

    // Also update dapathshala_live_exams storage so both remain synchronized
    try {
      const rawLive = localStorage.getItem('dapathshala_live_exams');
      if (rawLive) {
        const liveExams = JSON.parse(rawLive);
        const lKey = payload.id || payload.examId || (payload as any).pin;
        if (lKey && liveExams[lKey]) {
          liveExams[lKey] = {
            ...liveExams[lKey],
            status: 'submitted',
            answers: payload.answers,
            handwrittenImages: payload.handwrittenImages,
            submittedAt: payload.submittedAt
          };
          localStorage.setItem('dapathshala_live_exams', JSON.stringify(liveExams));
        }
      }
    } catch {}
  } catch (err) {
    console.warn('Failed to save exam submission locally:', err);
  }

  // 1b. Persist notification directly to dapathshala_notifications
  try {
    const notifRaw = localStorage.getItem('dapathshala_notifications');
    const currentNotifs: any[] = notifRaw ? JSON.parse(notifRaw) : [];
    const testKey = payload.id || payload.examId || (payload as any).pin;
    const notifEntry = {
      id: 'notif_sub_' + testKey,
      title: 'নতুন খাতা জমা পড়েছে!',
      message: `${payload.studentName || 'সন্তান'} "${payload.title || payload.subject}" পরীক্ষা সম্পন্ন করেছে এবং খাতা জমা দিয়েছে।`,
      time: 'আজ, এইমাত্র',
      read: false,
      examId: testKey
    };
    const filtered = currentNotifs.filter((n: any) => 
      n.examId !== testKey &&
      n.examId !== payload.id &&
      n.examId !== payload.examId &&
      (!((payload as any).pin) || n.examId !== (payload as any).pin)
    );
    localStorage.setItem('dapathshala_notifications', JSON.stringify([notifEntry, ...filtered]));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dapathshala_new_notification', { detail: notifEntry })
      );
    }
  } catch {}

  // 1c. Trigger cross-tab storage sync event
  try {
    localStorage.setItem('dapathshala_last_submission_sync', JSON.stringify({
      id: payload.id,
      timestamp: Date.now(),
      payload
    }));
  } catch {}

  // 2. Broadcast via BroadcastChannel
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'exam_submitted',
        submission: payload
      });
    }
  } catch (err) {
    console.warn('BroadcastChannel error on submit:', err);
  }

  // 3. Dispatch window CustomEvent for same-page listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('dapathshala_exam_submission', { detail: payload })
    );
  }

  // 4. Save to Supabase if configured
  if (supabase) {
    try {
      await supabase.from('exam_submissions').upsert([
        {
          id: payload.id,
          exam_id: payload.examId,
          title: payload.title,
          student_name: payload.studentName,
          child_id: payload.childId,
          subject: payload.subject,
          answers: payload.answers,
          handwritten_images: payload.handwrittenImages,
          score: payload.score,
          status: 'submitted',
          submitted_at: payload.submittedAt
        }
      ]);
    } catch (err) {
      console.warn('Supabase submission insert note:', err);
    }
  }

  return payload;
};

/**
 * Subscribe to new exam submissions in real-time
 */
export const subscribeToExamSubmissions = (
  callback: (submission: ExamSubmissionPayload) => void
): (() => void) => {
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'exam_submitted' && event.data.submission) {
      callback(event.data.submission as ExamSubmissionPayload);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  const handleCustomEvent = (event: Event) => {
    const custom = event as CustomEvent<ExamSubmissionPayload>;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'dapathshala_last_submission_sync' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed.payload) {
          callback(parsed.payload as ExamSubmissionPayload);
        }
      } catch {}
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dapathshala_exam_submission', handleCustomEvent);
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('dapathshala_exam_submission', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
    }
  };
};
