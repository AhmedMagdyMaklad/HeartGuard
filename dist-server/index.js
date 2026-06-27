import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import onboardingRouter from './routes/onboarding.js';
import assessmentRouter from './routes/assessment.js';
import chatRouter from './routes/chat.js';
import pool from './db.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const app = express();
// Run any pending column additions on startup
async function runMigrations() {
    try {
        await pool.query(`
      ALTER TABLE risk_assessments
        ADD COLUMN IF NOT EXISTS ecg_classification TEXT,
        ADD COLUMN IF NOT EXISTS tabular_risk       NUMERIC(6,4),
        ADD COLUMN IF NOT EXISTS combined_risk_score NUMERIC(6,4),
        ADD COLUMN IF NOT EXISTS analysis_findings  TEXT,
        ADD COLUMN IF NOT EXISTS diet_plan          TEXT,
        ADD COLUMN IF NOT EXISTS exercise_rec       TEXT,
        ADD COLUMN IF NOT EXISTS lifestyle_rec      TEXT,
        ADD COLUMN IF NOT EXISTS medical_rec        TEXT
    `);
        await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title      TEXT NOT NULL DEFAULT 'New Conversation',
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      )
    `);
        await pool.query(`
      ALTER TABLE chat_messages
        ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE
    `);
        console.log('Database migration complete.');
    }
    catch (err) {
        console.error('Migration error:', err);
    }
}
const PORT = 3001; // Always 3001 — mapped to external port 80 by the platform
app.use(cors({
    origin: isProduction ? false : 'http://localhost:5000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/chat', chatRouter);
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// In production: serve built frontend + handle SPA routing
if (isProduction) {
    const distPath = path.resolve(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}
runMigrations().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`HeartGuard API running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
    });
});
