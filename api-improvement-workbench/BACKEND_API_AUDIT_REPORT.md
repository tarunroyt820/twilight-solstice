# Nextaro Backend API Audit Report

Generated on: 2026-04-06
Scope: Complete backend API code review (`backend/`), route/controller/service/data-layer behavior.

## 1) Backend API: How It Works

### 1.1 Request Flow
1. `backend/server.js` loads `backend/.env`, starts Express, then connects to MongoDB in background.
2. `backend/app.js` applies middleware: `helmet`, custom XSS sanitizer, CORS policy, request logging, JSON parsing, and rate-limits.
3. Routes are mounted under `/api/*`:
   - `/api/auth`
   - `/api/dashboard`
   - `/api/profile`
   - `/api/ai`
   - `/api/career-plan`
   - `/api/resume`
4. Protected routes use JWT auth middleware (`backend/middleware/auth.js`) with Bearer token.
5. Controllers perform DB operations through Mongoose models (`User`, `Message`, `CareerPlan`) and call AI services when needed.

### 1.2 API Surface
- `POST /api/auth/signup` create account + send email OTP.
- `POST /api/auth/login` return access token + refresh token.
- `POST /api/auth/refresh` rotate short-lived access token.
- `POST|GET /api/auth/verify-email` verify OTP.
- `POST /api/auth/resend-verification` resend OTP.
- `POST /api/auth/forgot-password` generate reset token + send mail.
- `POST /api/auth/reset-password` reset password by token.
- `GET /api/dashboard/overview` aggregated dashboard stats.
- `GET /api/profile` get authenticated profile.
- `PUT /api/profile` update profile.
- `GET /api/profile/:id` public profile by user id.
- `POST /api/ai/ask` career chat (stored in message history).
- `POST /api/ai/chat/stream` SSE streaming AI response.
- `GET /api/ai/history` chat history.
- `GET /api/ai/test` unauthenticated AI test endpoint.
- `POST /api/career-plan/generate` AI-generated JSON career plan.
- `GET /api/career-plan` fetch saved plan.
- `PATCH /api/career-plan/milestone/:index` mark milestone completion.
- `POST /api/resume/upload` upload resume via multer.

## 2) Key Advantages

1. Security baseline is present.
Definition: `helmet`, CORS allow-list, XSS sanitization, and route-level/auth-level rate limiting are already enabled.

2. Clean route/controller separation.
Definition: routes are thin; business logic is in controllers/services, making further refactor straightforward.

3. Multi-provider AI strategy.
Definition: provider router + fallback + circuit breaker reduce single-provider outage risk.

4. Useful product-level AI context.
Definition: prompt includes compact profile + plan context and trimmed chat history, improving relevance.

5. Password storage is hashed.
Definition: bcrypt hashing is correctly used before save/reset.

6. Refresh-token flow exists.
Definition: frontend interceptor can recover from expired access token automatically.

## 3) Errors and Risks (Priority Ordered)

### Critical
1. Boot hard-depends on GROQ key even when not using Groq.
Location: `backend/app.js`
Impact: server exits if `GROQ_API_KEY` missing, even if non-AI routes only.

2. Public AI test endpoint is enabled.
Location: `backend/routes/aiRoutes.js`
Impact: unauthenticated users can hit paid AI resources and consume quota.

### High
3. Auth middleware does not reject missing/deleted user after token decode.
Location: `backend/middleware/auth.js`
Impact: if token is valid but user is deleted, `req.user` can be null and downstream routes may fail unpredictably.

4. Profile update allows sensitive field mutation.
Location: `backend/controllers/profileController.js`
Impact: endpoint blocks only `password`, `email`, `_id`; attacker can try to set fields like `isEmailVerified`, reset token fields, or other internal flags.

5. Resume upload has no file type/size guard.
Location: `backend/middleware/upload.js`
Impact: large or unsafe uploads can be stored, causing storage abuse and security concerns.

### Medium
6. Login does not enforce `isEmailVerified`.
Location: `backend/controllers/authController.js`
Impact: email verification flow can be bypassed unless frontend enforces it.

7. Chat history query is unbounded before trimming.
Location: `backend/controllers/aiController.js`
Impact: DB read cost grows with user message volume, increasing latency.

8. Refresh tokens are stateless and not revocable.
Location: `backend/controllers/authController.js`
Impact: stolen refresh token remains usable until expiration.

9. AI endpoint error messages are mostly generic.
Location: AI services + global handler
Impact: difficult incident diagnosis in production monitoring.

### Low
10. Some comments/logs contain legacy naming (`Nextro` vs `Nextaro`) and noisy logs.
Impact: maintainability/readability.

## 4) Observed API Behavior Patterns

1. Success response shapes are inconsistent (`message`, `success`, `answer`, raw document payloads).
2. Error response schema is inconsistent (sometimes `message`, sometimes `error`, sometimes both).
3. Most endpoints rely on implicit validation (Mongoose/runtime) instead of explicit request validation (e.g., zod/joi).
4. Most controllers return `500` for many conditions where `400/401/403/404/422` would be better.

## 5) Immediate Improvement Focus (Next 7 Days)

1. Remove or protect `/api/ai/test` with auth + admin role.
2. Replace startup env check with provider-aware validation.
3. Add allow-list based profile update DTO.
4. Add upload restrictions (`fileFilter`, `limits.fileSize`, allowed MIME extensions).
5. Add explicit validation middleware for auth/profile/career-plan payloads.
6. Cap AI history fetch in DB query (`limit`) and index messages on `{ userId, timestamp }`.
7. Standardize API responses via a response helper format.

## 6) Validation Note

This report is based on static code audit and endpoint design analysis. Runtime/live API execution was not performed in this pass.
