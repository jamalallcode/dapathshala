import { Question } from '../types';
import { getQuestionsForChapter } from './curriculumQuestions';
import { CURRICULUM_DATA } from './curriculumData';

export interface SharedLiveExam {
  id: string;
  pin?: string;
  title: string;
  subject: string;
  chapter: string;
  duration: number; // minutes
  totalMarks: number;
  childName?: string;
  parentName?: string;
  createdAt: number;
  questions: Question[];
  isPublished?: boolean;
  status?: string;
  score?: number;
  totalScoreObtained?: number;
  totalPossible?: number;
  aiFeedback?: string | null;
  parentComment?: string | null;
  parentFeedback?: string | null;
  aiDetailedMarking?: any[];
  manualGrades?: any;
  answers?: Record<string, number | string>;
  publishedAt?: string;
  submittedAt?: string;
  handwrittenImages?: string[];
}

const STORAGE_KEY = 'dapathshala_live_exams';
const PIN_MAP_KEY = 'dapathshala_pin_map';
const PUBLISHED_MAP_KEY = 'dapathshala_published_evaluations';
const LAST_PUBLISHED_KEY = 'dapathshala_last_published_marksheet';
const SYNC_CHANNEL_NAME = 'dapathshala_live_exams_sync';

// Cross-tab real-time sync channel
let syncChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'sync_live_exam' && event.data.exam) {
        try {
          const all = getAllSharedLiveExams();
          all[event.data.exam.id] = event.data.exam;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
          if (event.data.exam.pin) {
            savePinMapping(event.data.exam.pin, event.data.exam.id);
          }
        } catch {}
      }
      if (event.data && event.data.type === 'marksheet_published' && event.data.marksheet) {
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('dapathshala_marksheet_published', { detail: event.data.marksheet })
            );
          }
        } catch {}
      }
    };
  }
} catch {
  syncChannel = null;
}

export const getAllSharedLiveExams = (): Record<string, SharedLiveExam> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse dapathshala_live_exams:', err);
  }
  return {};
};

export const getPinMappings = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(PIN_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const savePinMapping = (pin: string, examId: string): void => {
  try {
    const map = getPinMappings();
    map[pin] = examId;
    localStorage.setItem(PIN_MAP_KEY, JSON.stringify(map));
  } catch {}
};

export const saveSharedLiveExam = (exam: SharedLiveExam): void => {
  try {
    const existing = getAllSharedLiveExams();
    existing[exam.id] = exam;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    if (exam.pin) {
      savePinMapping(exam.pin, exam.id);
    }

    // Broadcast to all other open tabs
    if (syncChannel) {
      syncChannel.postMessage({
        type: 'sync_live_exam',
        exam
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dapathshala_live_exam_saved', { detail: exam })
      );
    }
  } catch (err) {
    console.error('Error saving shared live exam:', err);
  }
};

export const savePublishedMarksheet = (marksheet: any): void => {
  if (!marksheet) return;
  try {
    const examId = marksheet.id || marksheet.examId || 'test-101';
    const pin = marksheet.pin;
    const comment = (marksheet.parentComment || marksheet.parentFeedback || '').trim() || null;

    const enriched = {
      ...marksheet,
      id: examId,
      examId: marksheet.examId || examId,
      isPublished: true,
      status: 'reviewed',
      parentComment: comment,
      parentFeedback: comment,
      publishedAt: marksheet.publishedAt || new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + ', আজ'
    };

    // 1. Update dapathshala_parent_assigned_tests in localStorage
    try {
      const saved = localStorage.getItem('dapathshala_parent_assigned_tests');
      const allTests: any[] = saved ? JSON.parse(saved) : [];
      const idx = allTests.findIndex(t => 
        (examId && (t.id === examId || t.examId === examId)) ||
        (pin && t.pin === pin) ||
        (examId === 'demo_exam_01' && (t.id === 'test-101' || t.examId === 'demo_exam_01')) ||
        (examId === 'test-101' && (t.id === 'demo_exam_01' || t.examId === 'test-101'))
      );
      let updatedTests: any[];
      if (idx >= 0) {
        updatedTests = [...allTests];
        updatedTests[idx] = { ...updatedTests[idx], ...enriched };
      } else {
        updatedTests = [enriched, ...allTests];
      }
      localStorage.setItem('dapathshala_parent_assigned_tests', JSON.stringify(updatedTests));
    } catch (e) {
      console.warn('Error saving to dapathshala_parent_assigned_tests:', e);
    }

    // 2. Update dapathshala_published_evaluations mapping
    try {
      const rawMap = localStorage.getItem(PUBLISHED_MAP_KEY);
      const pubMap: Record<string, any> = rawMap ? JSON.parse(rawMap) : {};
      if (examId) pubMap[examId] = enriched;
      if (marksheet.examId) pubMap[marksheet.examId] = enriched;
      if (marksheet.id) pubMap[marksheet.id] = enriched;
      if (pin) pubMap[pin] = enriched;
      if (examId === 'demo_exam_01' || examId === 'test-101') {
        pubMap['demo_exam_01'] = enriched;
        pubMap['test-101'] = enriched;
      }
      localStorage.setItem(PUBLISHED_MAP_KEY, JSON.stringify(pubMap));
    } catch (e) {
      console.warn('Error saving to PUBLISHED_MAP_KEY:', e);
    }

    // 3. Update dapathshala_last_published_marksheet
    try {
      localStorage.setItem(LAST_PUBLISHED_KEY, JSON.stringify(enriched));
    } catch {}

    // 4. Update dapathshala_live_exams storage
    try {
      const liveExams = getAllSharedLiveExams();
      const existingLive = liveExams[examId] || (marksheet.examId ? liveExams[marksheet.examId] : null);
      const updatedLiveExam: SharedLiveExam = {
        ...(existingLive || {}),
        id: examId,
        pin: pin || existingLive?.pin,
        title: marksheet.title || existingLive?.title || 'মূল্যায়ন পরীক্ষা',
        subject: marksheet.subject || existingLive?.subject || 'সাধারণ',
        chapter: marksheet.chapter || existingLive?.chapter || '',
        duration: marksheet.duration || existingLive?.duration || 30,
        totalMarks: marksheet.totalMarks || marksheet.totalPossible || existingLive?.totalMarks || 10,
        childName: marksheet.childName || marksheet.studentName || existingLive?.childName || 'শিক্ষার্থী',
        parentName: marksheet.parentName || existingLive?.parentName || 'অভিভাবক',
        createdAt: marksheet.createdAt || existingLive?.createdAt || Date.now(),
        questions: (marksheet.questions && marksheet.questions.length > 0) ? marksheet.questions : (existingLive?.questions || []),
        isPublished: true,
        status: 'reviewed',
        score: marksheet.score,
        totalScoreObtained: marksheet.totalScoreObtained,
        totalPossible: marksheet.totalPossible,
        aiFeedback: marksheet.aiFeedback,
        parentComment: comment,
        parentFeedback: comment,
        aiDetailedMarking: marksheet.aiDetailedMarking,
        manualGrades: marksheet.manualGrades,
        answers: marksheet.answers,
        handwrittenImages: marksheet.handwrittenImages,
        publishedAt: enriched.publishedAt
      };

      liveExams[examId] = updatedLiveExam;
      if (marksheet.examId && marksheet.examId !== examId) {
        liveExams[marksheet.examId] = updatedLiveExam;
      }
      if (examId === 'demo_exam_01' || examId === 'test-101') {
        liveExams['demo_exam_01'] = updatedLiveExam;
        liveExams['test-101'] = updatedLiveExam;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(liveExams));
    } catch (e) {
      console.warn('Error updating dapathshala_live_exams:', e);
    }

    // 5. Trigger instant storage sync event across other tabs via dedicated sync key
    try {
      localStorage.setItem('dapathshala_marksheet_pub_sync', JSON.stringify({
        id: examId,
        examId: marksheet.examId || examId,
        pin,
        timestamp: Date.now(),
        marksheet: enriched
      }));
    } catch {}

    // 6. Broadcast across tabs via BroadcastChannel
    if (syncChannel) {
      try {
        syncChannel.postMessage({
          type: 'marksheet_published',
          marksheet: enriched
        });
      } catch {}
    }

    // 7. Dispatch window CustomEvent for current window listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('dapathshala_marksheet_published', { 
          detail: enriched
        })
      );
    }
  } catch (err) {
    console.error('Critical error in savePublishedMarksheet:', err);
  }
};

export const getPublishedMarksheet = (idOrPin?: string | null): any | null => {
  if (typeof window === 'undefined') return null;
  const key = idOrPin ? idOrPin.trim() : '';

  try {
    let urlId = '';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      urlId = (urlParams.get('id') || urlParams.get('examId') || urlParams.get('pin') || '').trim();
    } catch {}

    const searchKeys = [key, urlId].filter(Boolean) as string[];

    // 1. Check PUBLISHED_MAP_KEY
    const rawMap = localStorage.getItem(PUBLISHED_MAP_KEY);
    if (rawMap) {
      const pubMap = JSON.parse(rawMap);
      for (const k of searchKeys) {
        if (pubMap[k] && (pubMap[k].isPublished || pubMap[k].status === 'reviewed')) {
          return pubMap[k];
        }
        const pinMap = getPinMappings();
        const resolvedId = pinMap[k];
        if (resolvedId && pubMap[resolvedId] && (pubMap[resolvedId].isPublished || pubMap[resolvedId].status === 'reviewed')) {
          return pubMap[resolvedId];
        }
      }
      if (searchKeys.includes('test-101') && pubMap['test-101'] && (pubMap['test-101'].isPublished || pubMap['test-101'].status === 'reviewed')) {
        return pubMap['test-101'];
      }
      if (searchKeys.includes('demo_exam_01') && pubMap['demo_exam_01'] && (pubMap['demo_exam_01'].isPublished || pubMap['demo_exam_01'].status === 'reviewed')) {
        return pubMap['demo_exam_01'];
      }
    }

    // 2. Check dapathshala_parent_assigned_tests
    const rawAssigned = localStorage.getItem('dapathshala_parent_assigned_tests');
    if (rawAssigned) {
      const tests = JSON.parse(rawAssigned);
      if (Array.isArray(tests)) {
        const match = tests.find((t: any) => 
          (t.isPublished === true || t.status === 'reviewed' || !!t.parentComment || !!t.parentFeedback) && (
            searchKeys.some(k => (t.id && t.id === k) || (t.examId && t.examId === k) || (t.pin && t.pin === k)) ||
            (key === 'demo_exam_01' && (t.id === 'test-101' || t.examId === 'demo_exam_01')) ||
            (key === 'test-101' && (t.id === 'demo_exam_01' || t.examId === 'test-101'))
          )
        );
        if (match) return match;
      }
    }

    // 3. Check LAST_PUBLISHED_KEY
    const rawLast = localStorage.getItem(LAST_PUBLISHED_KEY);
    if (rawLast) {
      const last = JSON.parse(rawLast);
      if (last && (last.isPublished || last.status === 'reviewed' || !!last.parentComment || !!last.parentFeedback)) {
        if (searchKeys.some(k => (last.id && last.id === k) || (last.examId && last.examId === k) || (last.pin && last.pin === k)) ||
            (key === 'demo_exam_01' && (last.id === 'test-101' || last.examId === 'demo_exam_01')) ||
            (key === 'test-101' && (last.id === 'demo_exam_01' || last.examId === 'test-101'))) {
          return last;
        }
      }
    }

    // 4. Check dapathshala_live_exams
    for (const k of searchKeys) {
      const allLive = getAllSharedLiveExams();
      if (allLive[k] && (allLive[k].isPublished || allLive[k].status === 'reviewed' || !!allLive[k].parentComment || !!allLive[k].parentFeedback)) {
        return allLive[k];
      }
    }
  } catch (err) {
    console.warn('Error reading published marksheet:', err);
  }
  return null;
};

export const subscribeToPublishedMarksheet = (callback: (marksheet: any) => void): (() => void) => {
  const handleCustomEvent = (e: any) => {
    if (e.detail) {
      callback(e.detail);
    }
  };

  const handleBroadcast = (event: MessageEvent) => {
    if (event.data && event.data.type === 'marksheet_published' && event.data.marksheet) {
      callback(event.data.marksheet);
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === 'dapathshala_marksheet_pub_sync' || event.key === LAST_PUBLISHED_KEY || event.key === 'dapathshala_parent_assigned_tests' || event.key === PUBLISHED_MAP_KEY) {
      let latest: any = null;
      if (event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed && (parsed.isPublished || parsed.status === 'reviewed' || parsed.parentComment || parsed.parentFeedback)) {
            latest = parsed.marksheet || parsed;
          }
        } catch {}
      }
      if (!latest) {
        latest = getPublishedMarksheet();
      }
      if (latest) {
        callback(latest);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('dapathshala_marksheet_published', handleCustomEvent);
    window.addEventListener('storage', handleStorage);
  }

  if (syncChannel) {
    syncChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('dapathshala_marksheet_published', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
    }
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleBroadcast);
    }
  };
};

export const getSubjectCode = (subject: string): string => {
  const norm = (subject || '').trim().toLowerCase();
  if (norm.includes('বাংলা') || norm.includes('bangla')) return 'bn';
  if (norm.includes('ইং') || norm.includes('eng')) return 'en';
  if (norm.includes('গণিত') || norm.includes('math')) return 'math';
  if (norm.includes('বিজ্ঞ') || norm.includes('sci')) return 'sci';
  if (norm.includes('আইসিটি') || norm.includes('ict') || norm.includes('তথ্য')) return 'ict';
  if (norm.includes('পদার্থ') || norm.includes('phy')) return 'phy';
  if (norm.includes('রসায়ন') || norm.includes('রসায়ন') || norm.includes('chem')) return 'chem';
  if (norm.includes('জীব') || norm.includes('bio')) return 'bio';
  return 'gen';
};

export const getChapterIndex = (subject: string, chapter: string): number => {
  const cleanSubject = subject === 'রসায়ন' ? 'রসায়ন' : subject;
  const list = CURRICULUM_DATA[cleanSubject] || CURRICULUM_DATA['বাংলা'] || [];
  const idx = list.findIndex(c => c.toLowerCase().includes(chapter.toLowerCase()) || chapter.toLowerCase().includes(c.toLowerCase()));
  return idx >= 0 ? idx : 0;
};

/**
 * Generates a concise, informative short exam ID:
 * Format: exam_{subCode}_ch{chIdx}_q{count}_{shortHash}
 * Example: exam_bn_ch2_q50_8k2a
 */
export const generateShortExamId = (subject: string, chapter: string, count: number = 15): string => {
  const subCode = getSubjectCode(subject);
  const chIdx = getChapterIndex(subject, chapter);
  const safeCount = Math.max(1, Math.min(100, count || 15));
  const hash = Math.random().toString(36).substring(2, 6);
  return `exam_${subCode}_ch${chIdx}_q${safeCount}_${hash}`;
};

/**
 * Generates a clean, friendly 6-digit PIN code
 */
export const generateExamPin = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Builds a clean, short URL for sharing with exact question count
 */
export const buildCleanExamUrl = (examId: string, count?: number): string => {
  const countParam = count ? `&count=${count}` : '';
  if (typeof window === 'undefined') return `/exam/live?id=${examId}${countParam}`;
  return `${window.location.origin}/exam/live?id=${examId}${countParam}`;
};

export const getSharedLiveExam = (idOrPin: string): SharedLiveExam | null => {
  if (!idOrPin) return null;
  const cleanKey = idOrPin.trim();

  try {
    // 1. Resolve PIN to examId if user entered a 6-digit PIN
    const pinMap = getPinMappings();
    const resolvedId = pinMap[cleanKey] || cleanKey;

    // 2. Check dapathshala_live_exams storage
    const all = getAllSharedLiveExams();
    if (resolvedId && all[resolvedId]) {
      return all[resolvedId];
    }
    if (cleanKey && all[cleanKey]) {
      return all[cleanKey];
    }

    // 3. Check dapathshala_parent_assigned_tests in localStorage
    if (typeof window !== 'undefined') {
      const assignedRaw = localStorage.getItem('dapathshala_parent_assigned_tests');
      if (assignedRaw) {
        const assignedList = JSON.parse(assignedRaw);
        const match = assignedList.find((t: any) => 
          t.id === resolvedId || 
          t.examId === resolvedId || 
          t.id === cleanKey || 
          t.examId === cleanKey ||
          t.pin === cleanKey
        );
        if (match) {
          const qList = match.questionsList || match.questions || [];
          const formattedQuestions: Question[] = Array.isArray(qList) ? qList.map((q: any, idx: number) => {
            let correctIdx = 0;
            if (typeof q.correctAnswer === 'number') {
              correctIdx = q.correctAnswer;
            } else if (typeof q.correctAnswer === 'string' && q.options) {
              const fIdx = q.options.findIndex((opt: string) => opt.trim() === q.correctAnswer.trim());
              correctIdx = fIdx >= 0 ? fIdx : 0;
            }
            return {
              id: q.id || `q_${idx + 1}`,
              text: q.question || q.text || 'প্রশ্ন',
              options: q.options || [],
              correctAnswer: correctIdx,
              explanation: q.explanation
            };
          }) : [];

          const fallbackCount = match.questionCount || match.totalMarks || (formattedQuestions.length > 0 ? formattedQuestions.length : 15);
          const convertedExam: SharedLiveExam = {
            id: match.id || resolvedId,
            pin: match.pin,
            title: match.title || `${match.subject} মূল্যায়ন পরীক্ষা`,
            subject: match.subject || 'সাধারণ',
            chapter: match.chapter || '',
            duration: match.duration || 30,
            totalMarks: match.totalMarks || (formattedQuestions.length > 0 ? formattedQuestions.length : fallbackCount),
            childName: match.childName || match.studentName || 'শিক্ষার্থী',
            parentName: 'অভিভাবক',
            createdAt: Date.now(),
            questions: formattedQuestions.length > 0 ? formattedQuestions : getQuestionsForChapter(match.subject || 'বাংলা', match.chapter || '', fallbackCount, 1),
            isPublished: match.isPublished === true || match.status === 'reviewed',
            status: match.status,
            score: match.score,
            totalScoreObtained: match.totalScoreObtained,
            totalPossible: match.totalPossible,
            aiFeedback: match.aiFeedback,
            parentComment: match.parentComment,
            parentFeedback: match.parentFeedback || match.parentComment,
            aiDetailedMarking: match.aiDetailedMarking,
            manualGrades: match.manualGrades,
            answers: match.answers,
            handwrittenImages: match.handwrittenImages,
            publishedAt: match.publishedAt
          };
          saveSharedLiveExam(convertedExam);
          return convertedExam;
        }
      }

      // Check if a published marksheet exists directly for this ID or PIN
      const pub = getPublishedMarksheet(resolvedId) || getPublishedMarksheet(cleanKey);
      if (pub) {
        const qList = pub.questions || pub.questionsList || [];
        const formattedQuestions: Question[] = Array.isArray(qList) ? qList.map((q: any, idx: number) => {
          let correctIdx = 0;
          if (typeof q.correctAnswer === 'number') {
            correctIdx = q.correctAnswer;
          } else if (typeof q.correctAnswer === 'string' && q.options) {
            const fIdx = q.options.findIndex((opt: string) => opt.trim() === q.correctAnswer.trim());
            correctIdx = fIdx >= 0 ? fIdx : 0;
          }
          return {
            id: q.id || `q_${idx + 1}`,
            text: q.question || q.text || 'প্রশ্ন',
            options: q.options || [],
            correctAnswer: correctIdx,
            explanation: q.explanation
          };
        }) : [];

        const pubFallbackCount = pub.questionCount || pub.totalMarks || pub.totalPossible || (formattedQuestions.length > 0 ? formattedQuestions.length : 15);
        const pubExam: SharedLiveExam = {
          id: pub.id || pub.examId || resolvedId,
          pin: pub.pin,
          title: pub.title || `${pub.subject} মূল্যায়ন পরীক্ষা`,
          subject: pub.subject || 'সাধারণ',
          chapter: pub.chapter || '',
          duration: pub.duration || 30,
          totalMarks: pub.totalMarks || pub.totalPossible || (formattedQuestions.length > 0 ? formattedQuestions.length : pubFallbackCount),
          childName: pub.childName || pub.studentName || 'শিক্ষার্থী',
          parentName: 'অভিভাবক',
          createdAt: Date.now(),
          questions: formattedQuestions.length > 0 ? formattedQuestions : getQuestionsForChapter(pub.subject || 'বাংলা', pub.chapter || '', pubFallbackCount, 1),
          isPublished: true,
          status: 'reviewed',
          score: pub.score,
          totalScoreObtained: pub.totalScoreObtained,
          totalPossible: pub.totalPossible,
          aiFeedback: pub.aiFeedback,
          parentComment: pub.parentComment,
          parentFeedback: pub.parentFeedback || pub.parentComment,
          aiDetailedMarking: pub.aiDetailedMarking,
          manualGrades: pub.manualGrades,
          answers: pub.answers,
          handwrittenImages: pub.handwrittenImages,
          publishedAt: pub.publishedAt
        };
        return pubExam;
      }
    }

    // 4. Smart recovery from short ID (e.g. exam_bn_ch0_8k2a) for cross-device links without large URLs
    if (resolvedId && resolvedId.startsWith('exam_')) {
      const parts = resolvedId.split('_');
      let sub = 'বাংলা';
      let ch = 'অপরিচিতা (গল্প - রবীন্দ্রনাথ ঠাকুর)';

      const code = parts[1];
      const chIdx = parseInt(parts[2]?.replace('ch', '') || '0', 10);

      if (code === 'bn') {
        sub = 'বাংলা';
        ch = CURRICULUM_DATA['বাংলা']?.[chIdx] || 'অপরিচিতা (গল্প - রবীন্দ্রনাথ ঠাকুর)';
      } else if (code === 'en') {
        sub = 'ইংরেজি';
        ch = CURRICULUM_DATA['ইংরেজি']?.[chIdx] || 'Right Form of Verbs & Subject-Verb Agreement';
      } else if (code === 'math') {
        sub = 'গণিত';
        ch = CURRICULUM_DATA['গণিত']?.[chIdx] || 'বাস্তব সংখ্যা ও সেট-ফাংশন';
      } else if (code === 'sci') {
        sub = 'বিজ্ঞান';
        ch = CURRICULUM_DATA['বিজ্ঞান']?.[chIdx] || 'উন্নততর জীবনধারা ও সুষম খাদ্য';
      } else if (code === 'ict') {
        sub = 'আইসিটি';
        ch = CURRICULUM_DATA['আইসিটি']?.[chIdx] || 'সংখ্যা পদ্ধতি (বাইনারি, অকটাল, হেক্সাডেসিমেল)';
      } else if (code === 'phy') {
        sub = 'পদার্থবিজ্ঞান';
        ch = CURRICULUM_DATA['পদার্থবিজ্ঞান']?.[chIdx] || 'গতি ও গতির সমীকরণ';
      } else if (code === 'chem') {
        sub = 'রসায়ন';
        ch = CURRICULUM_DATA['রসায়ন']?.[chIdx] || 'পদার্থের অবস্থা ও কণার গতিতত্ত্ব';
      } else if (code === 'bio') {
        sub = 'জীববিজ্ঞান';
        ch = CURRICULUM_DATA['জীববিজ্ঞান']?.[chIdx] || 'জীবকোষ ও টিস্যুর গঠন';
      }

      // Extract exact question count from ID (e.g. _q50_) or query param (?count=50)
      let targetCount = 15;
      const countMatch = resolvedId.match(/_q(\d+)_/);
      if (countMatch && countMatch[1]) {
        targetCount = parseInt(countMatch[1], 10);
      } else if (typeof window !== 'undefined') {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const cParam = urlParams.get('count');
          if (cParam) {
            targetCount = parseInt(cParam, 10);
          }
        } catch {}
      }

      const safeQuestionCount = Math.max(1, Math.min(100, targetCount || 15));
      const generated = getQuestionsForChapter(sub, ch, safeQuestionCount, 1);
      const reconstructedQuestions: Question[] = generated.map((q, idx) => {
        const correctIdx = q.options.findIndex(opt => opt.trim() === q.correctAnswer.trim());
        return {
          id: q.id || `q_${idx + 1}`,
          text: q.question,
          options: q.options,
          correctAnswer: correctIdx >= 0 ? correctIdx : 0,
          explanation: q.explanation
        };
      });

      const reconstructedExam: SharedLiveExam = {
        id: resolvedId,
        pin: pinMap[resolvedId] || (cleanKey && cleanKey.length === 6 ? cleanKey : undefined) || generateExamPin(),
        title: `${sub}: ${ch} কাস্টম মূল্যায়ন`,
        subject: sub,
        chapter: ch,
        duration: Math.max(15, Math.min(120, Math.round(safeQuestionCount * 1.5))),
        totalMarks: reconstructedQuestions.length,
        childName: 'শিক্ষার্থী',
        parentName: 'অভিভাবক',
        createdAt: Date.now(),
        questions: reconstructedQuestions
      };
      saveSharedLiveExam(reconstructedExam);
      return reconstructedExam;
    }
  } catch (err) {
    console.error('Error retrieving shared live exam:', err);
  }
  return null;
};

// Fallback seed exam if link id is opened directly or demo
export const DEFAULT_DEMO_EXAM: SharedLiveExam = {
  id: 'demo_exam_01',
  title: 'গণিত ও বিজ্ঞান বিশেষ মূল্যায়ন পরীক্ষা',
  subject: 'গণিত',
  chapter: 'বীজগণিতীয় সূত্রাবলী ও প্রয়োগ',
  duration: 25,
  totalMarks: 5,
  childName: 'শিক্ষার্থী',
  parentName: 'অভিভাবক',
  createdAt: Date.now(),
  questions: [
    {
      id: 'q1',
      text: '(a + b)² এর সঠিক সম্প্রসারিত রূপ কোনটি?',
      options: ['a² + 2ab + b²', 'a² - 2ab + b²', 'a² + b²', 'a² + ab + b²'],
      correctAnswer: 0,
      explanation: '(a + b)² = (a + b)(a + b) = a² + 2ab + b²'
    },
    {
      id: 'q2',
      text: 'যদি x + 1/x = 4 হয়, তবে x² + 1/x² এর মান কত?',
      options: ['16', '14', '18', '12'],
      correctAnswer: 1,
      explanation: 'x² + 1/x² = (x + 1/x)² - 2 = 16 - 2 = 14'
    },
    {
      id: 'q3',
      text: 'একটি দ্বিঘাত সমীকরণের সর্বোচ্চ ঘাত কত?',
      options: ['১', '২', '৩', '৪'],
      correctAnswer: 1,
      explanation: 'দ্বিঘাত সমীকরণে চলের সর্বোচ্চ শক্তি বা ঘাত সর্বদা ২ হয়।'
    },
    {
      id: 'q4',
      text: 'a² - b² এর উৎপাদক বিশ্লেষণ রূপ কোনটি?',
      options: ['(a - b)²', '(a + b)(a - b)', '(a + b)²', 'a² - 2ab + b²'],
      correctAnswer: 1,
      explanation: 'a² - b² = (a + b)(a - b)'
    },
    {
      id: 'q5',
      text: 'সমকোণী ত্রিভুজের অতিভুজ নির্ণয়ের পিথাগোরাসের উপপাদ্য কোনটি?',
      options: ['c² = a² + b²', 'c = a + b', 'c² = a² - b²', 'c = a² + b²'],
      correctAnswer: 0,
      explanation: 'পিথাগোরাসের উপপাদ্য অনুসারে, অতিভুজ² = লম্ব² + ভূমি²।'
    }
  ]
};

// Legacy helper for backward compatibility with encoded URL payloads
export const decodeExamFromUrlPayload = (payload: string): SharedLiveExam | null => {
  try {
    if (!payload) return null;
    let decoded = '';
    try {
      decoded = decodeURIComponent(escape(atob(payload)));
    } catch {
      decoded = atob(payload);
    }
    const parsed = JSON.parse(decoded);
    if (parsed && (parsed.id || parsed.title)) {
      const exam: SharedLiveExam = {
        id: parsed.id || `exam_${Date.now()}`,
        pin: parsed.pin,
        title: parsed.title || 'অনলাইন পরীক্ষা',
        subject: parsed.subject || 'সাধারণ',
        chapter: parsed.chapter || '',
        duration: parsed.duration || 20,
        totalMarks: parsed.totalMarks || (parsed.questions ? parsed.questions.length : 10),
        childName: parsed.childName,
        parentName: parsed.parentName,
        createdAt: parsed.createdAt || Date.now(),
        questions: parsed.questions || []
      };
      // Cache it into local storage so subsequent accesses by ID succeed immediately
      saveSharedLiveExam(exam);
      return exam;
    }
  } catch (err) {
    console.warn('Failed to decode legacy exam payload:', err);
  }
  return null;
};

export const encodeExamToUrlPayload = (exam: SharedLiveExam): string => {
  try {
    const compact = {
      id: exam.id,
      pin: exam.pin,
      title: exam.title,
      subject: exam.subject,
      chapter: exam.chapter,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      childName: exam.childName,
      parentName: exam.parentName,
      createdAt: exam.createdAt,
      questions: exam.questions
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(compact))));
  } catch (err) {
    console.warn('Failed to encode exam payload:', err);
    return '';
  }
};
