import { Router } from 'express';
import { InferenceClient } from '@huggingface/inference';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const HF_MODEL = 'Qwen/Qwen2.5-72B-Instruct';
const SYSTEM_PROMPT = `You are HeartGuard AI, a knowledgeable and empathetic heart health assistant. Your role is to help users understand cardiovascular health topics clearly and accurately.

Guidelines:
- Answer only heart health, cardiology, and related wellness topics (diet, exercise, stress, sleep, medications, symptoms, risk factors).
- If a user describes an emergency (chest pain, stroke symptoms, difficulty breathing, etc.), immediately and urgently tell them to call emergency services (911).
- Be warm, supportive, and use plain language. Avoid unnecessary jargon.
- Format responses using short paragraphs or bullet points for readability.
- Always recommend consulting a doctor or cardiologist for personal medical decisions.
- Do NOT answer questions unrelated to health or wellness.
- Keep responses concise but thorough — aim for 150-300 words.
- Never repeat the user's question back at them. Just answer directly.`;
function getClient() {
    if (!HF_TOKEN)
        return null;
    return new InferenceClient(HF_TOKEN);
}
async function callHuggingFace(conversationHistory) {
    const client = getClient();
    if (!client)
        throw new Error('HUGGINGFACE_API_TOKEN not set');
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory.map(m => ({
            role: m.role,
            content: m.content,
        })),
    ];
    const completion = await client.chatCompletion({
        model: HF_MODEL,
        messages,
        max_tokens: 500,
        temperature: 0.65,
        top_p: 0.9,
    });
    const text = completion.choices?.[0]?.message?.content?.trim();
    if (!text)
        throw new Error('Empty response from HuggingFace');
    return text;
}
function makeTitle(firstMessage) {
    const clean = firstMessage.replace(/\s+/g, ' ').trim();
    return clean.length > 52 ? clean.slice(0, 49) + '…' : clean;
}
// ─── SESSION ROUTES ───────────────────────────────────────────────────────────
// POST /api/chat/sessions — create a new session
router.post('/sessions', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(`INSERT INTO chat_sessions (user_id, title) VALUES ($1, 'New Conversation') RETURNING *`, [req.userId]);
        res.json({ session: result.rows[0] });
    }
    catch (err) {
        console.error('Create session error:', err);
        res.status(500).json({ error: 'Failed to create session' });
    }
});
// GET /api/chat/sessions — list all sessions for user with last message preview
router.get('/sessions', requireAuth, async (req, res) => {
    try {
        const result = await pool.query(`SELECT
         s.id, s.title, s.created_at, s.updated_at,
         (SELECT content FROM chat_messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) AS last_message,
         (SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) AS message_count
       FROM chat_sessions s
       WHERE s.user_id = $1
       ORDER BY s.updated_at DESC`, [req.userId]);
        res.json({ sessions: result.rows });
    }
    catch (err) {
        console.error('List sessions error:', err);
        res.status(500).json({ error: 'Failed to list sessions' });
    }
});
// DELETE /api/chat/sessions/:id — delete a session and all its messages
router.delete('/sessions/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2', [id, req.userId]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete session error:', err);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});
// ─── MESSAGE ROUTES ───────────────────────────────────────────────────────────
// GET /api/chat/messages?session_id=xxx — fetch messages for a session
router.get('/messages', requireAuth, async (req, res) => {
    const { session_id } = req.query;
    if (!session_id || typeof session_id !== 'string') {
        res.status(400).json({ error: 'session_id query param is required' });
        return;
    }
    try {
        const result = await pool.query('SELECT * FROM chat_messages WHERE session_id = $1 AND user_id = $2 ORDER BY created_at ASC', [session_id, req.userId]);
        res.json({ messages: result.rows });
    }
    catch (err) {
        console.error('Chat history error:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// POST /api/chat/message — send a message in a session
router.post('/message', requireAuth, async (req, res) => {
    const { content, session_id } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({ error: 'Message content is required' });
        return;
    }
    if (!session_id || typeof session_id !== 'string') {
        res.status(400).json({ error: 'session_id is required' });
        return;
    }
    const userMessage = content.trim();
    try {
        // Verify session belongs to this user
        const sessionRes = await pool.query('SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2', [session_id, req.userId]);
        if (sessionRes.rowCount === 0) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        const session = sessionRes.rows[0];
        // Save user message
        await pool.query('INSERT INTO chat_messages (user_id, session_id, role, content) VALUES ($1, $2, $3, $4)', [req.userId, session_id, 'user', userMessage]);
        // Auto-title: update if still default and this is the first user message
        if (session.title === 'New Conversation') {
            const msgCount = await pool.query('SELECT COUNT(*) FROM chat_messages WHERE session_id = $1 AND role = $2', [session_id, 'user']);
            if (parseInt(msgCount.rows[0].count) <= 1) {
                await pool.query('UPDATE chat_sessions SET title = $1, updated_at = now() WHERE id = $2', [makeTitle(userMessage), session_id]);
            }
        }
        // Touch session updated_at
        await pool.query('UPDATE chat_sessions SET updated_at = now() WHERE id = $1', [session_id]);
        // Build conversation history for AI context (last 12 messages)
        const historyResult = await pool.query('SELECT role, content FROM chat_messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 12', [session_id]);
        const conversationHistory = historyResult.rows.reverse();
        let assistantContent;
        if (!HF_TOKEN) {
            assistantContent = 'The AI assistant is not configured. Please add the HUGGINGFACE_API_TOKEN secret.';
        }
        else {
            try {
                assistantContent = await callHuggingFace(conversationHistory);
            }
            catch (aiErr) {
                console.error('HuggingFace AI error:', aiErr);
                assistantContent = "I'm having a moment of trouble reaching the AI service. Please try sending your message again — it usually resolves quickly.";
            }
        }
        const saved = await pool.query('INSERT INTO chat_messages (user_id, session_id, role, content) VALUES ($1, $2, $3, $4) RETURNING *', [req.userId, session_id, 'assistant', assistantContent]);
        // Touch session again after AI reply
        await pool.query('UPDATE chat_sessions SET updated_at = now() WHERE id = $1', [session_id]);
        res.json({ message: saved.rows[0] });
    }
    catch (err) {
        console.error('Chat message error:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
});
export default router;
