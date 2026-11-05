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
const initialSubmissions = loadJson(SUBMISSIONS_FILE, {});
let submissionsStore: Record<string, any> = Array.isArray(initialSubmissions) ? {} : initialSubmissions;
let testsStore: Record<string, any> = loadJson(TESTS_FILE, {});
// Remove legacy automatic demo placeholder IDs if present
delete testsStore['test-101'];
delete testsStore['test-102'];
delete testsStore['test-103'];

// API: Save Test
app.post('/api/tests', (req, res) => {
  const test = req.body;
  if (!test || !test.pin) {
    return res.status(400).json({ error: 'Invalid test payload or missing PIN' });
  }
  testsStore[test.pin] = test;
  if (test.id) testsStore[test.id] = test;
  saveJson(TESTS_FILE, testsStore);
  res.json({ success: true, pin: test.pin });
});

// API: Get Test by PIN or ID
app.get('/api/tests/:pin', (req, res) => {
  const { pin } = req.params;
  const test = testsStore[pin];
  if (test) {
    return res.json(test);
  }
  res.status(404).json({ error: 'Test not found' });
});

// API: Delete Test by PIN or ID
app.delete('/api/tests/:pinOrId', (req, res) => {
  const { pinOrId } = req.params;
  let deleted = false;
  if (testsStore[pinOrId]) {
    const test = testsStore[pinOrId];
    delete testsStore[pinOrId];
    if (test.pin) delete testsStore[test.pin];
    if (test.id) delete testsStore[test.id];
    deleted = true;
  }
  if (submissionsStore[pinOrId]) {
    const sub = submissionsStore[pinOrId];
    delete submissionsStore[pinOrId];
    if (sub.pin) delete submissionsStore[sub.pin];
    if (sub.id) delete submissionsStore[sub.id];
  }
  if (deleted) {
    saveJson(TESTS_FILE, testsStore);
    saveJson(SUBMISSIONS_FILE, submissionsStore);
  }
  res.json({ success: true, message: 'Test deleted successfully' });
});

// API: Save Student Submission
app.post('/api/submissions', (req, res) => {
  const sub = req.body;
  if (!sub || (!sub.pin && !sub.id)) {
    return res.status(400).json({ error: 'Invalid submission' });
  }
  const key = sub.pin || sub.id;
  submissionsStore[key] = sub;
  if (sub.id) submissionsStore[sub.id] = sub;
  if (sub.pin) submissionsStore[sub.pin] = sub;
  saveJson(SUBMISSIONS_FILE, submissionsStore);
  res.json({ success: true, key });
});

// API: Get Student Submission
app.get('/api/submissions/:pin', (req, res) => {
  const { pin } = req.params;
  const sub = submissionsStore[pin];
  if (sub) {
    return res.json(sub);
  }
  res.status(404).json({ error: 'Submission not found' });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false 
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dapathshala Full-Stack server running on port ${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err?.message || err);
  });
}

startServer();
