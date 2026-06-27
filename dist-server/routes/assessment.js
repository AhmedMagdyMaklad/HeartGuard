import { Router } from 'express';
import multer from 'multer';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const AI_ENDPOINT = 'https://esmael-saleh-heartguardassessment.hf.space/comprehensive_assessment';
// POST /api/assessment — submit vitals (+optional ECG) and get AI risk score
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
    const { cholesterol, bmi, heart_rate, glucose, pulse_pressure } = req.body;
    if (!cholesterol || !bmi || !heart_rate || !glucose || !pulse_pressure) {
        res.status(400).json({ error: 'All vitals fields are required: cholesterol, bmi, heart_rate, glucose, pulse_pressure' });
        return;
    }
    if (!req.file) {
        res.status(400).json({ error: 'An ECG image is required to run the assessment.' });
        return;
    }
    const vitals = {
        cholesterol: Number(cholesterol),
        bmi: Number(bmi),
        heart_rate: Number(heart_rate),
        glucose: Number(glucose),
        pulse_pressure: Number(pulse_pressure),
    };
    try {
        // Fetch user's onboarding data to build the patient profile
        const [profileResult, lifestyleResult, medHistResult] = await Promise.all([
            pool.query('SELECT gender, date_of_birth FROM user_profiles WHERE user_id = $1', [req.userId]),
            pool.query('SELECT cigarettes_per_day FROM lifestyle_data WHERE user_id = $1', [req.userId]),
            pool.query('SELECT conditions FROM medical_history WHERE user_id = $1', [req.userId]),
        ]);
        const profile = profileResult.rows[0];
        const lifestyle = lifestyleResult.rows[0];
        const medHist = medHistResult.rows[0];
        // Derive demographics
        const gender = profile?.gender ?? 'male';
        const dob = profile?.date_of_birth ? new Date(profile.date_of_birth) : null;
        const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 45;
        const cigsPerDay = lifestyle?.cigarettes_per_day ?? 0;
        const conditions = medHist?.conditions ?? [];
        const prevalentHyp = conditions.some(c => /hypertension|high blood pressure/i.test(c)) ? 1 : 0;
        const prevalentStroke = conditions.some(c => /stroke/i.test(c)) ? 1 : 0;
        const diabetes = conditions.some(c => /diabetes/i.test(c)) ? 1 : 0;
        const patientData = {
            male: gender === 'male' ? 1 : 0,
            age,
            cigsPerDay,
            BPMeds: prevalentHyp,
            prevalentStroke,
            prevalentHyp,
            diabetes,
            totChol: vitals.cholesterol,
            BMI: vitals.bmi,
            heartRate: vitals.heart_rate,
            glucose: vitals.glucose,
            pulsePressure: vitals.pulse_pressure,
        };
        // Build multipart request for the AI endpoint
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const mimeType = req.file.mimetype;
        const formData = new FormData();
        formData.append('file', new Blob([fileBuffer], { type: mimeType }), fileName);
        formData.append('patient_data_json', JSON.stringify(patientData));
        // Call external AI API (with a 30s timeout)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        let aiResult = null;
        try {
            const aiResponse = await fetch(AI_ENDPOINT, {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });
            clearTimeout(timeout);
            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                if (aiData.status === 'success' && aiData.models_output) {
                    const combinedScore = aiData.models_output.combined_risk_score ?? 0;
                    const scorePercent = Math.round(combinedScore * 100);
                    const level = scorePercent < 33 ? 'low' : scorePercent < 66 ? 'moderate' : 'high';
                    aiResult = {
                        ecg_classification: aiData.models_output.ecg_classification ?? 'Unknown',
                        tabular_risk: aiData.models_output.tabular_risk ?? 0,
                        combined_risk_score: combinedScore,
                        analysis_findings: aiData.report?.analysis_findings ?? '',
                        diet_plan: aiData.report?.recommendations?.diet_plan ?? '',
                        exercise_rec: aiData.report?.recommendations?.exercise ?? '',
                        lifestyle_rec: aiData.report?.recommendations?.lifestyle ?? '',
                        medical_rec: aiData.report?.recommendations?.medical ?? '',
                        risk_score: scorePercent,
                        risk_level: level,
                    };
                }
            }
        }
        catch (aiErr) {
            clearTimeout(timeout);
            console.error('External AI API error (using fallback):', aiErr);
        }
        // Fall back to local calculation if AI call failed
        const localScore = calculateRiskScore(vitals);
        const risk_score = aiResult?.risk_score ?? localScore;
        const risk_level = aiResult?.risk_level ?? (localScore < 33 ? 'low' : localScore < 66 ? 'moderate' : 'high');
        const result = await pool.query(`INSERT INTO risk_assessments
         (user_id, cholesterol, bmi, heart_rate, glucose, pulse_pressure,
          ecg_file_url, risk_score, risk_level,
          ecg_classification, tabular_risk, combined_risk_score,
          analysis_findings, diet_plan, exercise_rec, lifestyle_rec, medical_rec)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`, [
            req.userId,
            vitals.cholesterol, vitals.bmi, vitals.heart_rate, vitals.glucose, vitals.pulse_pressure,
            fileName,
            risk_score,
            risk_level,
            aiResult?.ecg_classification ?? null,
            aiResult?.tabular_risk ?? null,
            aiResult?.combined_risk_score ?? null,
            aiResult?.analysis_findings ?? null,
            aiResult?.diet_plan ?? null,
            aiResult?.exercise_rec ?? null,
            aiResult?.lifestyle_rec ?? null,
            aiResult?.medical_rec ?? null,
        ]);
        res.status(201).json({ assessment: result.rows[0] });
    }
    catch (err) {
        console.error('Assessment save error:', err);
        res.status(500).json({ error: 'Failed to save assessment' });
    }
});
// GET /api/assessment/latest — most recent assessment for the logged-in user
router.get('/latest', requireAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM risk_assessments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [req.userId]);
        res.json({ assessment: result.rows[0] || null });
    }
    catch (err) {
        console.error('Assessment fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch assessment' });
    }
});
// GET /api/assessment/history — all assessments, newest first
router.get('/history', requireAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM risk_assessments WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
        res.json({ assessments: result.rows });
    }
    catch (err) {
        console.error('Assessment history error:', err);
        res.status(500).json({ error: 'Failed to fetch assessment history' });
    }
});
// Local fallback risk score calculation
function calculateRiskScore({ cholesterol, bmi, heart_rate, glucose, pulse_pressure, }) {
    let score = 0;
    if (cholesterol >= 240)
        score += 25;
    else if (cholesterol >= 200)
        score += 15;
    else if (cholesterol < 125)
        score += 10;
    if (bmi >= 30)
        score += 20;
    else if (bmi >= 25)
        score += 10;
    else if (bmi < 18.5)
        score += 5;
    if (heart_rate > 100)
        score += 15;
    else if (heart_rate < 50)
        score += 10;
    if (glucose >= 126)
        score += 20;
    else if (glucose >= 100)
        score += 10;
    else if (glucose < 70)
        score += 5;
    if (pulse_pressure > 80)
        score += 20;
    else if (pulse_pressure > 60)
        score += 10;
    else if (pulse_pressure < 25)
        score += 10;
    return Math.min(score, 100);
}
export default router;
