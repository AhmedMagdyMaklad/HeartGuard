# HeartGuard

A cardiac risk assessment platform with a React/Vite web app and a Flutter mobile app, both connected to the same Node.js/Express + PostgreSQL backend.

## Architecture

- **Frontend (web)**: React 19 + TypeScript + Vite, served on port 5000
- **Backend**: Express + TypeScript (`tsx watch`), port 3001
- **Mobile (Flutter)**: `mobile/` directory — shares backend, auth, DB, and AI features with the web app
- **Styling**: Tailwind CSS v3 + Framer Motion animations
- **Routing (web)**: React Router DOM v7
- **Database**: Replit PostgreSQL (connection via `DATABASE_URL` env var)
- **Auth**: httpOnly cookie sessions (30-day expiry), bcrypt (12 rounds). Also supports `Authorization: Bearer <token>` header for mobile clients.
- **Mobile support**: CORS allows all origins (including no-origin mobile requests). Login/signup return `token` in JSON body alongside the cookie so mobile apps can store and send the token manually.

## Mobile App (`mobile/`)

Flutter app connecting to the same backend via Bearer token auth. Pull changes into local Flutter environment and run `flutter pub get && flutter run`.

### Key mobile files
- `mobile/lib/config/api_config.dart` — backend base URL (update to `.replit.app` URL after deploy)
- `mobile/lib/services/` — `auth_service.dart`, `api_service.dart`, `onboarding_service.dart`, `assessment_service.dart`, `chat_service.dart`
- `mobile/lib/providers/auth_provider.dart` — ChangeNotifier with auth state + onboarding status
- `mobile/lib/router.dart` — go_router with auth-based redirects
- Token stored in SharedPreferences as `session_token`; user JSON as `user`

## User Flow

1. `/` Landing page
2. `/signup` → Register → redirect to `/login`
3. `/login` → sets session → checks `/api/onboarding/status`
   - No profile → `/onboarding/welcome` → basic-info → lifestyle → medical-history → `/dashboard`
   - Has profile → `/dashboard`
4. `/assessment/vitals` → enter metrics → `/assessment/ecg`
5. `/assessment/ecg` → optional ECG upload → POST `/api/assessment` → `/risk-report`
6. `/risk-report` → real AI analysis (analysis_findings, recommendations)
7. `/dashboard` → loads real data; empty state if no assessments yet
8. `/chatbot` → persisted sessions via `/api/chat/*`

## Database Schema

All tables use UUID primary keys via `gen_random_uuid()`.

### `users`
- `id` UUID PK, `email` UNIQUE, `password_hash`, `full_name`, `created_at`, `updated_at`

### `sessions`
- `id` UUID PK, `user_id` FK→users, `token` UNIQUE, `expires_at`, `created_at`

### `user_profiles`
- `id` UUID PK, `user_id` FK→users UNIQUE, `gender`, `date_of_birth`, timestamps

### `lifestyle_data`
- `id` UUID PK, `user_id` FK→users UNIQUE, `cigarettes_per_day`, timestamps

### `medical_history`
- `id` UUID PK, `user_id` FK→users UNIQUE, `conditions TEXT[]`, `has_test_results BOOLEAN`, timestamps

### `risk_assessments`
- `id` UUID PK, `user_id` FK→users, `cholesterol NUMERIC`, `bmi NUMERIC`, `heart_rate INTEGER`, `glucose NUMERIC`, `pulse_pressure NUMERIC`, `ecg_file_url TEXT`, `risk_score NUMERIC`, `risk_level VARCHAR`, `created_at`
- **AI fields**: `ecg_classification TEXT`, `tabular_risk NUMERIC(6,4)`, `combined_risk_score NUMERIC(6,4)`, `analysis_findings TEXT`, `diet_plan TEXT`, `exercise_rec TEXT`, `lifestyle_rec TEXT`, `medical_rec TEXT`
- Risk scoring: low < 33, moderate 33–66, high > 66 (from `combined_risk_score × 100`)

### `chat_sessions`
- `id` UUID PK, `user_id` FK→users, `title TEXT`, `created_at`, `updated_at`

### `chat_messages`
- `id` UUID PK, `user_id` FK→users, `session_id` FK→chat_sessions, `role VARCHAR`, `content TEXT`, `created_at`

## API Endpoints

All routes prefixed `/api/`, proxied from Vite (port 5000) to Express (port 3001).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | — | Create account + session; returns `token` in body |
| POST | `/api/auth/login` | — | Log in; returns `token` in body |
| POST | `/api/auth/logout` | ✓ | Destroys session |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/onboarding/status` | ✓ | All onboarding data |
| PUT | `/api/onboarding/profile` | ✓ | Save gender + date_of_birth |
| PUT | `/api/onboarding/lifestyle` | ✓ | Save cigarettes_per_day |
| PUT | `/api/onboarding/medical-history` | ✓ | Save conditions + has_test_results |
| POST | `/api/assessment` | ✓ | Submit vitals + optional ECG file (multipart/form-data); calls AI; returns assessment |
| GET | `/api/assessment/latest` | ✓ | Most recent assessment |
| GET | `/api/assessment/history` | ✓ | All past assessments |
| POST | `/api/chat/sessions` | ✓ | Create chat session |
| GET | `/api/chat/sessions` | ✓ | List sessions |
| DELETE | `/api/chat/sessions/:id` | ✓ | Delete session |
| GET | `/api/chat/messages?session_id=xxx` | ✓ | Fetch messages |
| POST | `/api/chat/message` | ✓ | Send message; get AI reply |
| GET | `/api/health` | — | Server health check |

## Key Implementation Notes

- PostgreSQL NUMERIC fields return as strings — normalized via `AssessmentService.parseScore()` (mobile) or `parseAssessment()` (web)
- ECG file is optional on mobile; backend uses a 1×1 blank PNG placeholder when none is uploaded
- All onboarding saves use `ON CONFLICT (user_id) DO UPDATE` (safe upsert)
- **Real AI integration**: `POST /api/assessment` calls `https://esmael-saleh-heartguardassessment.hf.space/comprehensive_assessment`. Falls back to local score calculation if external API fails (30s timeout).
- Patient data for AI built from user's profile (gender, DOB→age), lifestyle (cigsPerDay), medical history
- Risk score: `combined_risk_score × 100` (0–100). Risk level: <33 low, 33–65 moderate, ≥66 high
- Chat uses Hugging Face Qwen2.5-72B-Instruct via `HUGGINGFACE_API_TOKEN` secret

## Running the App

```bash
npm run dev      # Frontend — Vite on port 5000
npm run server   # Backend  — Express on port 3001
```
