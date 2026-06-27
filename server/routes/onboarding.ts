import { Router, Response } from 'express';
import pool from '../db.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/onboarding/status — fetch all saved onboarding data for the current user
router.get('/status', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [profile, lifestyle, medical] = await Promise.all([
      pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.userId]),
      pool.query('SELECT * FROM lifestyle_data WHERE user_id = $1', [req.userId]),
      pool.query('SELECT * FROM medical_history WHERE user_id = $1', [req.userId]),
    ]);

    res.json({
      profile: profile.rows[0] || null,
      lifestyle: lifestyle.rows[0] || null,
      medical_history: medical.rows[0] || null,
    });
  } catch (err) {
    console.error('Onboarding status error:', err);
    res.status(500).json({ error: 'Failed to fetch onboarding status' });
  }
});

// PUT /api/onboarding/profile — save basic info (gender, date_of_birth)
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { gender, date_of_birth } = req.body;

  if (!gender || !date_of_birth) {
    res.status(400).json({ error: 'Gender and date of birth are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, gender, date_of_birth)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET
         gender = EXCLUDED.gender,
         date_of_birth = EXCLUDED.date_of_birth,
         updated_at = NOW()
       RETURNING *`,
      [req.userId, gender, date_of_birth]
    );
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('Profile save error:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// PUT /api/onboarding/lifestyle — save lifestyle data (cigarettes_per_day)
router.put('/lifestyle', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { cigarettes_per_day } = req.body;

  if (cigarettes_per_day === undefined || cigarettes_per_day === null) {
    res.status(400).json({ error: 'cigarettes_per_day is required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO lifestyle_data (user_id, cigarettes_per_day)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET
         cigarettes_per_day = EXCLUDED.cigarettes_per_day,
         updated_at = NOW()
       RETURNING *`,
      [req.userId, cigarettes_per_day]
    );
    res.json({ lifestyle: result.rows[0] });
  } catch (err) {
    console.error('Lifestyle save error:', err);
    res.status(500).json({ error: 'Failed to save lifestyle data' });
  }
});

// PUT /api/onboarding/medical-history — save conditions + has_test_results
router.put('/medical-history', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { conditions, has_test_results } = req.body;

  if (!Array.isArray(conditions)) {
    res.status(400).json({ error: 'conditions must be an array' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO medical_history (user_id, conditions, has_test_results)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET
         conditions = EXCLUDED.conditions,
         has_test_results = EXCLUDED.has_test_results,
         updated_at = NOW()
       RETURNING *`,
      [req.userId, conditions, has_test_results ?? false]
    );
    res.json({ medical_history: result.rows[0] });
  } catch (err) {
    console.error('Medical history save error:', err);
    res.status(500).json({ error: 'Failed to save medical history' });
  }
});

export default router;
