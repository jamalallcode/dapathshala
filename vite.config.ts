import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, loadEnv, Plugin} from 'vite';

function examSubmissionsApiPlugin(): Plugin {
  const storeFilePath = path.resolve(__dirname, '.submissions_store.json');
  const logsFilePath = path.resolve(__dirname, '.proctoring_logs_store.json');
  const marksheetFilePath = path.resolve(__dirname, '.published_marksheets_store.json');

  const readJson = (filePath: string, fallback: any[] = []) => {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {}
    return fallback;
  };

  const writeJson = (filePath: string, data: any) => {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to write JSON file:', filePath, e);
    }
  };

  return {
    name: 'exam-submissions-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';

        // Enable CORS for all /api/ requests
        if (url.startsWith('/api/')) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.end();
            return;
          }
        }

        // 1. GET & POST /api/submissions
        if (url.startsWith('/api/submissions')) {
          if (req.method === 'GET') {
            const list = readJson(storeFilePath, []);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(list));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const payload = JSON.parse(body);
                const current = readJson(storeFilePath, []);
                const norm = (s?: string) => (s || '').trim().toLowerCase().replace(/[\s\-_:(),।]/g, '');
                const targetPin = payload.pin ? String(payload.pin).trim() : '';

                const idx = current.findIndex((item: any) => 
                  (item.id && (item.id === payload.id || item.id === payload.examId)) ||
                  (item.examId && (item.examId === payload.id || item.examId === payload.examId)) ||
                  (targetPin && item.pin && String(item.pin).trim() === targetPin) ||
                  (payload.title && norm(item.title) === norm(payload.title))
                );

                if (idx >= 0) {
                  current[idx] = { ...current[idx], ...payload, status: 'submitted' };
                } else {
                  current.unshift({ ...payload, status: 'submitted' });
                }

                writeJson(storeFilePath, current);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, submission: payload }));
              } catch (e: any) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: e?.message || 'Invalid JSON' }));
              }
            });
            return;
          }
        }

        // 2. GET & POST /api/proctoring-logs
        if (url.startsWith('/api/proctoring-logs')) {
          if (req.method === 'GET') {
            const logs = readJson(logsFilePath, []);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(logs));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const logEntry = JSON.parse(body);
                const current = readJson(logsFilePath, []);
                current.unshift(logEntry);
                writeJson(logsFilePath, current.slice(0, 100));
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, log: logEntry }));
              } catch (e: any) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: e?.message || 'Invalid JSON' }));
              }
            });
            return;
          }
        }

        // 3. GET & POST /api/published-marksheets
        if (url.startsWith('/api/published-marksheets')) {
          if (req.method === 'GET') {
            const marksheets = readJson(marksheetFilePath, []);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(marksheets));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const sheet = JSON.parse(body);
                const current = readJson(marksheetFilePath, []);
                const idx = current.findIndex((item: any) => item.id === sheet.id || item.examId === sheet.examId);
                if (idx >= 0) {
                  current[idx] = sheet;
                } else {
                  current.unshift(sheet);
                }
                writeJson(marksheetFilePath, current);
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, sheet }));
              } catch (e: any) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: e?.message || 'Invalid JSON' }));
              }
            });
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), examSubmissionsApiPlugin()],
    define: {
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
      'process.env.APP_URL': JSON.stringify(env.APP_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

