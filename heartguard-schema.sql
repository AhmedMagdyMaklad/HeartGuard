-- ============================================================
--  HeartGuard – PostgreSQL Database Schema
--  Engine : PostgreSQL 14+
--  All primary keys use UUID (gen_random_uuid())
-- ============================================================

-- ------------------------------------------------------------
-- 1. USERS
--    Core identity table – every other table references this.
-- ------------------------------------------------------------
CREATE TABLE users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    full_name     VARCHAR(255),
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. SESSIONS
--    Auth token store for session-based authentication.
-- ------------------------------------------------------------
CREATE TABLE sessions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT        NOT NULL UNIQUE,
    expires_at TIMESTAMP   NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_token   ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ------------------------------------------------------------
-- 3. USER_PROFILES
--    Demographic info collected during onboarding (step 1/3).
-- ------------------------------------------------------------
CREATE TABLE user_profiles (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    gender        VARCHAR(20),
    date_of_birth DATE,
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 4. LIFESTYLE_DATA
--    Lifestyle metrics collected during onboarding (step 2/3).
-- ------------------------------------------------------------
CREATE TABLE lifestyle_data (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    cigarettes_per_day  INT         NOT NULL DEFAULT 0,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. MEDICAL_HISTORY
--    Pre-existing conditions collected during onboarding (step 3/3).
-- ------------------------------------------------------------
CREATE TABLE medical_history (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    conditions       TEXT[]      NOT NULL DEFAULT '{}',
    has_test_results BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 6. RISK_ASSESSMENTS
--    One row per assessment run.  Stores both raw vitals and
--    all AI-generated outputs (ECG, tabular, combined scores,
--    and the four recommendation categories).
-- ------------------------------------------------------------
CREATE TABLE risk_assessments (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Raw vitals (Step 1 – Health Metrics)
    cholesterol         NUMERIC(6,2),
    bmi                 NUMERIC(5,2),
    heart_rate          INT,
    glucose             NUMERIC(6,2),
    pulse_pressure      NUMERIC(6,2),
    -- AI outputs (Step 2 – ECG Analysis)
    ecg_file_url        TEXT,
    risk_score          INT,
    risk_level          VARCHAR(20),
    ecg_classification  TEXT,
    tabular_risk        NUMERIC(5,4),
    combined_risk_score NUMERIC(5,4),
    -- Natural-language findings & recommendations
    analysis_findings   TEXT,
    diet_plan           TEXT,
    exercise_rec        TEXT,
    lifestyle_rec       TEXT,
    medical_rec         TEXT,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_risk_assessments_user_id ON risk_assessments(user_id);

-- ------------------------------------------------------------
-- 7. CHAT_SESSIONS
--    A named conversation thread belonging to a user.
-- ------------------------------------------------------------
CREATE TABLE chat_sessions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- ------------------------------------------------------------
-- 8. CHAT_MESSAGES
--    Individual messages within a chat session.
--    role ∈ {'user', 'assistant'}
-- ------------------------------------------------------------
CREATE TABLE chat_messages (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    session_id UUID        NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content    TEXT        NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id    ON chat_messages(user_id);
