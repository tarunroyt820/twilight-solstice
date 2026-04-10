# API Improvement Backlog

Generated on: 2026-04-06

## Sprint 1 (Security and Stability)

1. Harden boot-time config validation.
Definition: validate only required env keys per route/provider; do not block full server boot on non-critical provider keys.
Target files: `backend/app.js`, `backend/services/ai/ai.service.js`.

2. Lock down `/api/ai/test`.
Definition: either remove in production or require auth + admin gate + strict rate limit.
Target files: `backend/routes/aiRoutes.js`.

3. Harden JWT guard.
Definition: if decoded user id no longer exists, return 401 and never call `next()`.
Target files: `backend/middleware/auth.js`.

4. Introduce safe profile update schema.
Definition: allow only approved editable keys (`fullName`, `jobTitle`, `experienceLevel`, `careerGoal`, `education`, `skills`).
Target files: `backend/controllers/profileController.js`.

5. Restrict resume uploads.
Definition: accept only PDF/DOC/DOCX and max size (for example 2MB), reject unsupported files with clear 400 response.
Target files: `backend/middleware/upload.js`, `backend/controllers/resumeController.js`.

## Sprint 2 (Performance and Reliability)

1. Optimize chat history retrieval.
Definition: fetch only required recent rows (`sort desc + limit`) and reverse in memory.
Target files: `backend/controllers/aiController.js`.

2. Add DB indexes.
Definition: index `Message(userId, timestamp)`, `CareerPlan(userId unique)`, `User(email unique + lowercase)`.
Target files: `backend/models/*.js`.

3. Introduce structured error handling.
Definition: centralized app errors (`AppError`), uniform payload `{ success, code, message, details }`.
Target files: `backend/app.js`, controllers.

4. Add request validation middleware.
Definition: validate payload shape before controllers.
Target files: `backend/routes/*.js`, new `backend/middleware/validate.js`.

## Sprint 3 (DX, Observability, and Testing)

1. Add API contract docs.
Definition: OpenAPI spec or markdown endpoint contract with examples.

2. Add automated API tests.
Definition: Jest + supertest coverage for auth/profile/ai/career-plan flows.

3. Add request tracing and metrics.
Definition: request id, latency logs, provider success/fail counters.

4. Add environment profiles.
Definition: separate `.env.development`, `.env.test`, `.env.production` conventions.

## Suggested Folder Structure for Implementation

```text
api-improvement-workbench/
  BACKEND_API_AUDIT_REPORT.md
  API_IMPROVEMENT_BACKLOG.md
  thunder-client/
    THUNDER_CLIENT_SETUP_AND_TESTING.md
    nextaro-api-thunder-collection.json
```
