import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
// POST /api/auth/register — creates account only, no session (user must log in separately)
router.post('/register', async (req, res) => {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    try {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existing.rows.length > 0) {
            res.status(409).json({ error: 'An account with this email already exists' });
            return;
        }
        const password_hash = await bcrypt.hash(password, 12);
        const userResult = await pool.query('INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name', [email.toLowerCase(), password_hash, full_name || null]);
        res.status(201).json({ user: userResult.rows[0] });
    }
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Failed to create account' });
    }
});
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    try {
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existing.rows.length > 0) {
            res.status(409).json({ error: 'An account with this email already exists' });
            return;
        }
        const password_hash = await bcrypt.hash(password, 12);
        const userResult = await pool.query('INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at', [email.toLowerCase(), password_hash, full_name || null]);
        const user = userResult.rows[0];
        const token = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await pool.query('INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, token, expiresAt]);
        res.cookie('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
        });
        res.status(201).json({ user: { id: user.id, email: user.email, full_name: user.full_name } });
    }
    catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Failed to create account' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = crypto.randomBytes(48).toString('hex');
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await pool.query('INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, token, expiresAt]);
        res.cookie('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            expires: expiresAt,
        });
        res.json({ user: { id: user.id, email: user.email, full_name: user.full_name } });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Failed to log in' });
    }
});
// POST /api/auth/logout
router.post('/logout', async (req, res) => {
    const token = req.cookies?.session_token;
    if (token) {
        await pool.query('DELETE FROM sessions WHERE token = $1', [token]).catch(() => { });
    }
    res.clearCookie('session_token');
    res.json({ success: true });
});
// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, full_name, created_at FROM users WHERE id = $1', [req.userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user: result.rows[0] });
    }
    catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export default router;
