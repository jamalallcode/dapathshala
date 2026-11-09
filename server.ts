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
const PARENTS_FILE = path.resolve(process.cwd(), '.parents_store.json');
const INSTITUTION_PAPERS_FILE = path.resolve(process.cwd(), '.institution_papers_store.json');

let parentsStore: Record<string, any> = {};

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
  const ghostList = ['test-101', 'test-102', 'test-103', '235071', '997080', '729463', '268649', '723310', '369270', '398679', '264459', '334824', '189893', '330904', '419214'];
  ghostList.forEach(p => {
    delete merged[p];
    delete testsStore[p];
    delete submissionsStore[p];
  });
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
    test.submittedAt = existing.submittedAt || test.submittedAt;
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

  const nowIso = new Date().toISOString();
  const updatedRecord = { 
    ...baseRecord, 
    ...sub, 
    questions, 
    proctoringFlags,
    status: normalizedStatus,
    submittedAt: sub.submittedAt || baseRecord.submittedAt || nowIso
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

// API: Get All Institution Papers
app.get('/api/institution-papers', (_req, res) => {
  const papers = loadJson<any[]>(INSTITUTION_PAPERS_FILE, []);
  res.json(papers);
});

// API: Save or Bulk Upload Institution Papers (Admin)
app.post('/api/institution-papers/bulk', (req, res) => {
  const incoming = req.body;
  if (!incoming) {
    return res.status(400).json({ error: 'No data provided' });
  }
  const toAdd = Array.isArray(incoming) ? incoming : [incoming];
  const existing = loadJson<any[]>(INSTITUTION_PAPERS_FILE, []);
  const map = new Map<string, any>();
  existing.forEach((p: any) => { if (p && p.id) map.set(p.id, p); });
  toAdd.forEach((p: any) => { if (p && p.id) map.set(p.id, p); });
  const updated = Array.from(map.values());
  saveJson(INSTITUTION_PAPERS_FILE, updated);
  console.log(`[Admin Bulk Upload] Saved ${toAdd.length} institution papers. Total: ${updated.length}`);
  res.json({ success: true, count: toAdd.length, total: updated.length });
});

// API: Delete an Institution Paper
app.delete('/api/institution-papers/:id', (req, res) => {
  const id = String(req.params.id).trim();
  const existing = loadJson<any[]>(INSTITUTION_PAPERS_FILE, []);
  const filtered = existing.filter((p: any) => p && p.id !== id);
  saveJson(INSTITUTION_PAPERS_FILE, filtered);
  res.json({ success: true, remaining: filtered.length });
});

// API: Parent Registration (Phone, Password & Name)
app.post('/api/auth/parent-register', (req, res) => {
  const { phone, password, name, id } = req.body || {};
  if (!phone || !password) {
    return res.status(400).json({ error: 'মোবাইল নম্বর ও পাসওয়ার্ড আবশ্যক' });
  }
  const cleanPhone = String(phone).trim();
  const parents = loadJson<Record<string, any>>(PARENTS_FILE, {});
  if (parents[cleanPhone]) {
    return res.status(400).json({ error: 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে' });
  }

  const newParent = {
    id: id || `parent_${cleanPhone}_${Date.now()}`,
    phone: cleanPhone,
    name: name ? String(name).trim() : '',
    password: String(password).trim(),
    createdAt: new Date().toISOString()
  };

  parents[cleanPhone] = newParent;
  parentsStore[cleanPhone] = newParent;
  saveJson(PARENTS_FILE, parents);

  res.json({
    success: true,
    user: {
      id: newParent.id,
      phone: newParent.phone,
      name: newParent.name,
      role: 'parent',
      createdAt: newParent.createdAt
    }
  });
});

// API: Parent Login (Phone & Password)
app.post('/api/auth/parent-login', (req, res) => {
  const { phone, password } = req.body || {};
  if (!phone || !password) {
    return res.status(400).json({ error: 'মোবাইল নম্বর ও পাসওয়ার্ড আবশ্যক' });
  }
  const cleanPhone = String(phone).trim();
  const parents = loadJson<Record<string, any>>(PARENTS_FILE, {});
  const parent = parents[cleanPhone] || parentsStore[cleanPhone];

  if (!parent) {
    return res.status(404).json({ error: 'কোনো অ্যাকাউন্ট পাওয়া যায়নি' });
  }
  if (parent.password !== String(password).trim()) {
    return res.status(401).json({ error: 'পাসওয়ার্ড সঠিক নয়' });
  }

  res.json({
    success: true,
    user: {
      id: parent.id,
      phone: parent.phone,
      name: parent.name || '',
      childName: parent.childName || '',
      childClass: parent.childClass || '',
      role: 'parent',
      createdAt: parent.createdAt
    }
  });
});

// Persistent config & notice stores
const NOTICE_FILE = path.resolve(process.cwd(), '.notice_store.json');
const SYSTEM_CONFIG_FILE = path.resolve(process.cwd(), '.system_config_store.json');

// --- ADMIN MASTER APIS ---

// API: Get All Parents with Activity Stats (Admin)
app.get('/api/admin/parents', (_req, res) => {
  const parents = loadJson<Record<string, any>>(PARENTS_FILE, {});
  const tests = getMergedTests();
  const subs = getMergedSubmissions();

  const parentsList = Object.values(parents).map((p: any) => {
    const parentPhone = String(p.phone || '').trim();
    // Count exams created by this parent
    const createdExams = Object.values(tests).filter((t: any) => t && t.parentPhone === parentPhone);
    const pinList = new Set(createdExams.map((t: any) => String(t.pin || t.id)));
    // Count student submissions for this parent's tests
    const parentSubs = Object.values(subs).filter((s: any) => pinList.has(String(s.pin || s.id)));

    return {
      id: p.id,
      phone: p.phone,
      name: p.name || 'নাম বিহীন',
      childName: p.childName || '',
      childClass: p.childClass || '',
      createdAt: p.createdAt || new Date().toISOString(),
      status: p.status || 'active', // 'active' | 'suspended'
      examsCreated: createdExams.length,
      submissionsReceived: parentSubs.length,
      lastActive: p.lastActive || p.createdAt
    };
  });

  res.json(parentsList);
});

// API: Update Parent Status (Admin can block/suspend or activate parent)
app.post('/api/admin/parents/:phone/status', (req, res) => {
  const phone = String(req.params.phone).trim();
  const { status } = req.body || {};
  if (!status || !['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'সঠিক স্ট্যাটাস প্রদান করুন (active বা suspended)' });
  }
  const parents = loadJson<Record<string, any>>(PARENTS_FILE, {});
  if (!parents[phone]) {
    return res.status(404).json({ error: 'অভিভাবক অ্যাকাউন্ট পাওয়া যায়নি' });
  }
  parents[phone].status = status;
  parentsStore[phone] = parents[phone];
  saveJson(PARENTS_FILE, parents);
  res.json({ success: true, phone, status });
});

// API: Reset Parent Password (Admin)
app.post('/api/admin/parents/:phone/reset-password', (req, res) => {
  const phone = String(req.params.phone).trim();
  const { newPassword } = req.body || {};
  if (!newPassword || String(newPassword).trim().length < 4) {
    return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' });
  }
  const parents = loadJson<Record<string, any>>(PARENTS_FILE, {});
  if (!parents[phone]) {
    return res.status(404).json({ error: 'অভিভাবক অ্যাকাউন্ট পাওয়া যায়নি' });
  }
  parents[phone].password = String(newPassword).trim();
  parentsStore[phone] = parents[phone];
  saveJson(PARENTS_FILE, parents);
  res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে' });
});

// API: Delete Parent Account (Admin)
app.delete('/api/admin/parents/:phone', (req, res) => {
  const phone = String(req.params.phone).trim();
  const parents = loadJson<Record<string, any>>(PARENTS_FILE, {});
  if (parents[phone]) {
    delete parents[phone];
    delete parentsStore[phone];
    saveJson(PARENTS_FILE, parents);
  }
  res.json({ success: true, message: 'অভিভাবক অ্যাকাউন্ট মুছে ফেলা হয়েছে' });
});

// API: Master Analytics & System Stats (Admin)
app.get('/api/admin/stats', (_req, res) => {
  const parents = loadJson<Record<string, any>>(PARENTS_FILE, {});
  const tests = getMergedTests();
  const subs = getMergedSubmissions();
  const institutionPapers = loadJson<any[]>(INSTITUTION_PAPERS_FILE, []);

  const totalParents = Object.keys(parents).length;
  const allTestsList = Object.values(tests);
  const allSubsList = Object.values(subs);

  let totalProctoringFlags = 0;
  let unreviewedCount = 0;

  allSubsList.forEach((s: any) => {
    if (Array.isArray(s.proctoringFlags)) {
      totalProctoringFlags += s.proctoringFlags.length;
    }
    if (s.status === 'submitted') {
      unreviewedCount++;
    }
  });

  res.json({
    totalParents,
    totalExams: allTestsList.length,
    totalSubmissions: allSubsList.length,
    totalInstitutionPapers: institutionPapers.length,
    unreviewedSubmissions: unreviewedCount,
    totalProctoringFlags,
    serverUptimeSeconds: Math.floor(process.uptime()),
    status: 'operational',
    aiStatus: 'online'
  });
});

// API: Global Platform Broadcast Notice (Admin)
app.get('/api/admin/notice', (_req, res) => {
  const notice = loadJson<any>(NOTICE_FILE, {
    isActive: false,
    title: '',
    message: '',
    type: 'info',
    createdAt: ''
  });
  res.json(notice);
});

app.post('/api/admin/notice', (req, res) => {
  const { title, message, type, isActive } = req.body || {};
  const notice = {
    title: title || '',
    message: message || '',
    type: type || 'info', // 'info' | 'warning' | 'alert'
    isActive: Boolean(isActive),
    updatedAt: new Date().toISOString()
  };
  saveJson(NOTICE_FILE, notice);
  res.json({ success: true, notice });
});

// API: System Maintenance Mode (Admin)
app.get('/api/admin/maintenance', (_req, res) => {
  const config = loadJson<any>(SYSTEM_CONFIG_FILE, {
    maintenanceMode: false,
    message: 'দাপাঠশালা পোর্টাল বর্তমানে রক্ষণাবেক্ষণে রয়েছে। শীঘ্রই ফিরে আসছি।'
  });
  res.json(config);
});

app.post('/api/admin/maintenance', (req, res) => {
  const { maintenanceMode, message } = req.body || {};
  const config = {
    maintenanceMode: Boolean(maintenanceMode),
    message: message || 'দাপাঠশালা পোর্টাল বর্তমানে রক্ষণাবেক্ষণে রয়েছে। শীঘ্রই ফিরে আসছি।',
    updatedAt: new Date().toISOString()
  };
  saveJson(SYSTEM_CONFIG_FILE, config);
  res.json({ success: true, config });
});

// API: Full Platform Database Backup & Restore (Admin)
app.get('/api/admin/backup', (_req, res) => {
  const parents = loadJson<Record<string, any>>(PARENTS_FILE, {});
  const tests = getMergedTests();
  const subs = getMergedSubmissions();
  const papers = loadJson<any[]>(INSTITUTION_PAPERS_FILE, []);
  const notice = loadJson<any>(NOTICE_FILE, {});

  const backupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    parents,
    tests,
    submissions: subs,
    institutionPapers: papers,
    notice
  };

  res.setHeader('Content-Disposition', `attachment; filename=dapathshala_backup_${Date.now()}.json`);
  res.setHeader('Content-Type', 'application/json');
  res.json(backupData);
});

app.post('/api/admin/restore', (req, res) => {
  const backup = req.body;
  if (!backup || typeof backup !== 'object') {
    return res.status(400).json({ error: 'অবৈধ ব্যাকআপ ফাইল' });
  }

  if (backup.parents) {
    parentsStore = backup.parents;
    saveJson(PARENTS_FILE, backup.parents);
  }
  if (backup.tests) {
    testsStore = backup.tests;
    saveJson(TESTS_FILE, backup.tests);
  }
  if (backup.submissions) {
    submissionsStore = backup.submissions;
    saveJson(SUBMISSIONS_FILE, backup.submissions);
  }
  if (backup.institutionPapers && Array.isArray(backup.institutionPapers)) {
    saveJson(INSTITUTION_PAPERS_FILE, backup.institutionPapers);
  }
  if (backup.notice) {
    saveJson(NOTICE_FILE, backup.notice);
  }

  res.json({ success: true, message: 'সম্পূর্ণ ডেটা সফলভাবে রিস্টোর করা হয়েছে' });
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
      // If it's a static asset request that Vite middleware didn't handle, don't return index.html
      const ext = path.extname(req.path);
      if (ext && ext !== '.html') {
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
    // Use fallback handler for SPA routes in production
    app.use((_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  let currentServer: any = null;
  let retryCount = 0;
  const maxRetries = 6;

  function bindServer() {
    currentServer = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Dapathshala Full-Stack server running on port ${PORT}`);
    });

    currentServer.on('error', (err: any) => {
      if (err?.code === 'EADDRINUSE') {
        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(`[Port Conflict] Port ${PORT} in use, waiting for release (retry ${retryCount}/${maxRetries})...`);
          try {
            currentServer?.close();
          } catch {}
          setTimeout(() => {
            bindServer();
          }, 1200);
          return;
        }
        console.warn(`[Port Conflict] Port ${PORT} remained busy after ${maxRetries} attempts. Exiting cleanly for fresh restart.`);
        process.exit(1);
      } else {
        console.error('Server listen error:', err?.message || err);
        process.exit(1);
      }
    });
  }

  bindServer();

  const gracefulShutdown = (signal: string) => {
    console.log(`Received ${signal}, closing server gracefully...`);
    if (currentServer) {
      currentServer.close(() => {
        console.log('Server stopped cleanly.');
        process.exit(0);
      });
      setTimeout(() => process.exit(0), 3000);
    } else {
      process.exit(0);
    }
  };

  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.once('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Fatal: Server startup failed:', err);
  process.exit(1);
});
