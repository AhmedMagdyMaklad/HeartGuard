import pool from '../db.js';
export async function requireAuth(req, res, next) {
    const token = req.cookies?.session_token;
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const result = await pool.query('SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()', [token]);
        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Session expired or invalid' });
            return;
        }
        req.userId = result.rows[0].user_id;
        next();
    }
    catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
