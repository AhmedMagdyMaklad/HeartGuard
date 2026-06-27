import { Request, Response, NextFunction } from 'express';
import pool from '../db.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  // Accept token from cookie (web) or Authorization: Bearer <token> header (mobile)
  let token = req.cookies?.session_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Session expired or invalid' });
      return;
    }

    req.userId = result.rows[0].user_id;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
