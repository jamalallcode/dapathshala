import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

// Safe process-level error handlers
process.on('uncaughtException', (err) => {
  console.warn('Handled uncaught exception:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.warn('Handled unhandled rejection:', reason);
});

const app = express();

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const val = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(val)) return val;
  }
  if (process.env.APP_PORT) {
    const val = parseInt(process.env.APP_PORT, 10);
    if (!isNaN(val)) return val;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const val = parseInt(process.env.PORT, 10);
    if (!isNaN(val)) return val;
  }
  return 3000;
}

const PORT = resolvePort();

app.use(express.json({ limit: '10mb' }));

// Health check endpoint for pre-warming & container health probes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// In-memory cache + persistent file storage
const TESTS_FILE = path.resolve(process.cwd(), '.tests_store.json');
const SUBMISSIONS_FILE = path.resolve(process.cwd(), '.submissions_store.json');

function loadJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed;
    }
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e);
  }
  return fallback;
}

function saveJson(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error saving ${filePath}:`, e);
  }
}

// Convert if it was an array previously
let submissionsStore: Record<string, any> = {};
let testsStore: Record<string, any> = {};

function getMergedSubmissions(): Record<string, any> {
  const disk = loadJson(SUBMISSIONS_FILE, {} as Record<string, any>);
  const merged: Record<string, any> = { ...disk, ...submissionsStore };
  // If disk has submitted or reviewed records, make sure they overwrite any stale memory records
  for (const [k, v] of Object.entries(disk || {})) {
    if (v && (v.status === 'submitted' || v.status === 'reviewed')) {
      merged[k] = v;
    }
  }
  submissionsStore = merged;
  return merged;
}

function getMergedTests(): Record<string, any> {
  const disk = loadJson(TESTS_FILE, {} as Record<string, any>);
  const merged: Record<string, any> = { ...disk, ...testsStore };
  for (const [k, v] of Object.entries(disk || {})) {
    if (v && (v.status === 'submitted' || v.status === 'reviewed')) {
      merged[k] = v;
    }
  }
  // Remove legacy automatic demo placeholder IDs if present
  delete merged['test-101'];
  delete merged['test-102'];
  delete merged['test-103'];
  delete merged['235071'];
  delete merged['997080'];
  delete merged['729463'];
  testsStore = merged;
  return merged;
}

// Initial load
getMergedSubmissions();
getMergedTests();

// Helper to find a record by pin or id
function findRecord(store: Record<string, any>, query: string): any {
  if (!query) return null;
  const q = String(query).trim();
  if (store[q]) return store[q];
  if (store[`test-${q}`]) return store[`test-${q}`];
  return Object.values(store).find((item: any) => 
    item && (
      String(item.pin).trim() === q || 
      String(item.id).trim() === q ||
      String(item.id).replace('test-', '').trim() === q
    )
  ) || null;
}

// API: Get All Tests & Submissions for Parent Dashboard
app.get('/api/tests', (_req, res) => {
  const tests = getMergedTests();
  const subs = getMergedSubmissions();
  const mergedMap = new Map<string, any>();

  // Add tests first
  Object.values(tests).forEach((t: any) => {
    if (t && (t.pin || t.id)) {
      const key = String(t.pin || t.id).trim();
      mergedMap.set(key, t);
    }
  });

  // Override with submissions (submitted or reviewed always wins!)
  Object.values(subs).forEach((s: any) => {
    if (s && (s.pin || s.id)) {
      const key = String(s.pin || s.id).trim();
      const existing = mergedMap.get(key) || {};
      const questions = (Array.isArray(s.questions) && s.questions.length > 0)
        ? s.questions
        : (Array.isArray(existing.questions) ? existing.questions : []);
      mergedMap.set(key, { ...existing, ...s, questions, status: s.status || 'submitted' });
    }
  });

  const uniqueTests = Array.from(mergedMap.values())
    .filter((item, index, self) => 
      index === self.findIndex(t => (t.pin && t.pin === item.pin) || (t.id && t.id === item.id))
    )
    .map((item: any) => ({
      ...item,
      questions: Array.isArray(item.questions) ? item.questions : [],
      proctoringFlags: Array.isArray(item.proctoringFlags) ? item.proctoringFlags : [],
      questionCount: item.questionCount ?? (Array.isArray(item.questions) ? item.questions.length : 0),
      durationMinutes: item.durationMinutes ?? 15
    }));

  res.json(uniqueTests);
});

// API: Save Test
app.post('/api/tests', (req, res) => {
  const test = req.body;
  if (!test || (!test.pin && !test.id)) {
    return res.status(400).json({ error: 'Invalid test payload or missing PIN' });
  }
  const pinKey = test.pin ? String(test.pin).trim() : '';
  const idKey = test.id ? String(test.id).trim() : '';

  const subs = getMergedSubmissions();
  const tests = getMergedTests();

  // If this test was already submitted by the student, ALWAYS preserve submitted/reviewed status
  const existingSub = (pinKey && findRecord(subs, pinKey)) || (idKey && findRecord(subs, idKey));
  const existingTest = (pinKey && findRecord(tests, pinKey)) || (idKey && findRecord(tests, idKey));
  const existing = existingSub || existingTest;

  if (existing && (existing.status === 'submitted' || existing.status === 'reviewed')) {
    test.status = existing.status;
    test.score = existing.score ?? test.score;
    test.parentComment = existing.parentComment ?? test.parentComment;
    test.questions = (existing.questions && existing.questions.length > 0) ? existing.questions : test.questions;
    test.proctoringFlags = existing.proctoringFlags || test.proctoringFlags;
  }
  if (pinKey) testsStore[pinKey] = test;
  if (idKey) testsStore[idKey] = test;
  saveJson(TESTS_FILE, testsStore);
  res.json({ success: true, pin: test.pin, status: test.status });
});

// API: Get Test by PIN or ID (prioritizes submitted answer sheets so parent instantly gets "উত্তরপত্র")
app.get('/api/tests/:pin', (req, res) => {
  const pin = String(req.params.pin).trim();
  const subs = getMergedSubmissions();
  const tests = getMergedTests();

  const sub = findRecord(subs, pin);
  if (sub && (sub.status === 'submitted' || sub.status === 'reviewed')) {
    return res.json(sub);
  }
  const test = findRecord(tests, pin);
  if (test) {
    if (sub) {
      return res.json({ ...test, ...sub });
    }
    return res.json(test);
  }
  if (sub) {
    return res.json(sub);
  }
  res.status(404).json({ error: 'Test not found' });
});

// API: Delete All Tests and Submissions (Complete Clean Slate)
app.delete('/api/tests', (_req, res) => {
  testsStore = {};
  submissionsStore = {};
  saveJson(TESTS_FILE, {});
  saveJson(SUBMISSIONS_FILE, {});
  console.log('[All Tests Cleared] testsStore and submissionsStore reset to empty');
  res.json({ success: true, message: 'All tests and submissions cleared successfully' });
});

// API: Delete Test by PIN or ID
app.delete('/api/tests/:pinOrId', (req, res) => {
  const pinOrId = String(req.params.pinOrId).trim();
  const tests = getMergedTests();
  const subs = getMergedSubmissions();
  let deleted = false;

  const test = findRecord(tests, pinOrId);
  if (test) {
    delete testsStore[pinOrId];
    if (test.pin) delete testsStore[String(test.pin).trim()];
    if (test.id) delete testsStore[String(test.id).trim()];
    deleted = true;
  }
  const sub = findRecord(subs, pinOrId);
  if (sub) {
    delete submissionsStore[pinOrId];
    if (sub.pin) delete submissionsStore[String(sub.pin).trim()];
    if (sub.id) delete submissionsStore[String(sub.id).trim()];
    deleted = true;
  }
  if (deleted) {
    saveJson(TESTS_FILE, testsStore);
    saveJson(SUBMISSIONS_FILE, submissionsStore);
  }
  res.json({ success: true, message: 'Test deleted successfully' });
});

// API: Save Student Submission (updates both submissionsStore and testsStore with "submitted" status)
app.post('/api/submissions', (req, res) => {
  const sub = req.body;
  if (!sub || (!sub.pin && !sub.id)) {
    return res.status(400).json({ error: 'Invalid submission' });
  }
  const pinKey = sub.pin ? String(sub.pin).trim() : '';
  const idKey = sub.id ? String(sub.id).trim() : '';
  const normalizedStatus = sub.status || 'submitted';

  const tests = getMergedTests();
  const baseRecord = (pinKey && findRecord(tests, pinKey)) || (idKey && findRecord(tests, idKey)) || {};
  const questions = (Array.isArray(sub.questions) && sub.questions.length > 0)
    ? sub.questions
    : (Array.isArray(baseRecord.questions) ? baseRecord.questions : []);
  const proctoringFlags = Array.isArray(sub.proctoringFlags) 
    ? sub.proctoringFlags 
    : (Array.isArray(baseRecord.proctoringFlags) ? baseRecord.proctoringFlags : []);

  const updatedRecord = { 
    ...baseRecord, 
    ...sub, 
    questions, 
    proctoringFlags,
    status: normalizedStatus 
  };

  if (pinKey) {
    submissionsStore[pinKey] = updatedRecord;
    testsStore[pinKey] = updatedRecord;
  }
  if (idKey) {
    submissionsStore[idKey] = updatedRecord;
    testsStore[idKey] = updatedRecord;
  }
  saveJson(SUBMISSIONS_FILE, submissionsStore);
  saveJson(TESTS_FILE, testsStore);

  console.log(`[Submission Saved] PIN: ${pinKey || idKey}, Status: ${normalizedStatus}, Score: ${updatedRecord.score}`);
  res.json({ success: true, pin: pinKey || idKey, status: normalizedStatus });
});

// API: Get All Submissions
app.get('/api/submissions', (_req, res) => {
  const subs = getMergedSubmissions();
  res.json(Object.values(subs));
});

// API: Get Student Submission by PIN or ID
app.get('/api/submissions/:pin', (req, res) => {
  const pin = String(req.params.pin).trim();
  const subs = getMergedSubmissions();
  const tests = getMergedTests();

  const sub = findRecord(subs, pin);
  if (sub) {
    return res.json(sub);
  }
  const test = findRecord(tests, pin);
  if (test && (test.status === 'submitted' || test.status === 'reviewed')) {
    return res.json(test);
  }
  res.status(404).json({ error: 'Submission not found' });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Explicit fallback for client-side navigation in dev mode
    app.use(async (req, res, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const indexHtmlPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
          let template = fs.readFileSync(indexHtmlPath, 'utf-8');
          template = await vite.transformIndexHtml(req.originalUrl, template);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        }
        next();
      } catch (e: any) {
        vite?.ssrFixStacktrace?.(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dapathshala Full-Stack server running on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err?.message || err);
  });

  const gracefulShutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer();
