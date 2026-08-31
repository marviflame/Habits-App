import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.routes';
import habitsRoutes from './routes/habits.routes';
import logsRoutes from './routes/logs.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);
const CORS_ORIGINS = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const CLIENT_DIST_DIR = process.env.CLIENT_DIST_DIR || path.resolve(__dirname, '..', '..', 'client', 'dist');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/habits', logsRoutes);

if (fs.existsSync(CLIENT_DIST_DIR)) {
  app.use(express.static(CLIENT_DIST_DIR, { index: false, maxAge: '1d' }));
  app.get('*', (_req, res, next) => {
    const indexHtml = path.join(CLIENT_DIST_DIR, 'index.html');
    if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
    next();
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Habits server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 CORS origins: ${CORS_ORIGINS.join(', ')}`);
  if (fs.existsSync(CLIENT_DIST_DIR)) {
    console.log(`🌐 Serving built client from: ${CLIENT_DIST_DIR}`);
  }
});

export default app;
