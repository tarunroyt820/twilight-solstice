# Career Path — Design Report

## Overview
- Goal: Generate personalized career plans that help users progress toward target roles by identifying skill gaps, proposing actionable milestones, and tracking progress.
- Users: Job seekers, internal employees, career coaches.
- Core features: target-role planning, skill-gap analysis, milestone-based learning roadmaps, progress tracking, notifications.

---

## Data Model (Summary)

- CareerPlan (MongoDB/Mongoose)
  - `userId` (ObjectId)
  - `title` (String)
  - `targetRole` (String)
  - `status` (ACTIVE | PAUSED | COMPLETED)
  - `overallProgress` (Number 0-100)
  - `milestones`: array of objects with { title, type, estimateHours, priority, dueDate, completed, evidence[], notes }
  - `recommendations`: array of { source, type, payload, confidence }
  - `notes`, timestamps

- Milestone and Recommendation may be embedded or stored separately. The current implementation uses an embedded model for simplicity.

---

## Backend Services & API Flows

- Suggested endpoints:
  - `POST /api/career-plans` — create a new plan (targetRole, optional milestones)
  - `GET /api/career-plans` — list user plans
  - `GET /api/career-plans/:id` — get plan details
  - `PATCH /api/career-plans/:id` — update plan
  - `POST /api/career-plans/:id/complete-milestone` — mark milestone complete + evidence
  - `POST /api/career-plans/:id/refresh` — re-run AI recommendations

- Services:
  - `careerPlanService` — create/read/update logic and progress computation
  - `recommendationService` — contacts AI, formats recommendations
  - Background jobs: nightly scoring, reminders, stale milestone detection

- Asynchronous design:
  - Use a queue (e.g., BullMQ + Redis) for heavy tasks like AI calls and external data fetches to keep API responses snappy.

---

## AI Integration & Workflows

- Inputs: user profile, resume text, declared skills, target role, market/job data.
- AI tasks:
  - Skill gap analysis: identify missing or under-expressed skills for the target role.
  - Milestone generation: produce actionable milestones with estimated effort, priority, and example evidence.
  - Resource recommendations: courses, articles, projects, repositories.
- Output: Structured JSON (machine-parseable). Always implement robust parsing and fallback to rule-based suggestions if AI returns invalid output.
- Store provenance: model, provider, prompt version, and confidence with each recommendation.

---

## Frontend Components & UX

- Components (suggested):
  - `CareerPathShell` — overview of active plan and KPI summary.
  - `CreatePlanModal` — capture target role, timeframe, intensity.
  - `PlanTimeline` — visual roadmap; allow reordering and quick edits.
  - `MilestoneCard` — detail view to add evidence, mark complete.
  - `RecommendationPanel` — show AI suggestions (accept/reject), before/after resume lines.

- UX principles:
  - Server-driven authoritative plan state.
  - Fast inline actions (complete milestone, upload evidence, accept suggestion).
  - Progressive disclosure: KPIs first, expand for details.
  - Accessibility: ARIA labels and keyboard support for core actions.

- State management: use React Query or SWR for caching, optimistic updates for milestone completion.

---

## Notifications & Reminders

- Trigger events: milestone due, inactivity > threshold, new recommendations, plan refreshed.
- Channels: in-app toasts, email, push notifications (if available).
- Throttling: daily digest plus immediate high-priority alerts.

---

## Metrics & Analytics

- Product metrics: plan creation rate, milestone completion rate, average time-to-first-milestone, plan retention (30-day, 90-day).
- AI metrics: recommendation acceptance rate, user feedback vs AI confidence.
- Logging: emit analytics events (Segment/Amplitude) for flows and conversions.

---

## Security & Privacy

- Minimal PII stored; encrypt sensitive fields when necessary.
- Authorization: all API endpoints must validate `req.user` and ownership.
- Audit logs for plan modifications and recommendation accept/reject actions.
- Clearly indicate AI-generated suggestions and obtain opt-in for AI data usage where required.

---

## Testing & Validation

- Unit tests for services and controllers.
- Integration tests for parsing AI responses (mock providers).
- End-to-end tests for core user flows: create plan → complete milestone → notification.
- Load testing for scheduled jobs and AI throughput.

---

## Edge Cases & Error Handling

- If AI returns invalid JSON, fallback to conservative rule-based recommendations.
- Concurrent edits: use optimistic locking/version field to avoid lost updates.
- User abandonment: provide a revive workflow that re-prioritizes tasks and re-engages the user.

---

## Roadmap (Suggested Phases)

- Phase 1 (MVP, ~2 weeks): plan creation, basic AI skill-gap analysis, milestone CRUD, timeline UI.
- Phase 2 (~4 weeks): recommendation acceptance, evidence upload, reminders, analytics.
- Phase 3 (~4 weeks): resume tailoring, external course/job integrations.
- Phase 4: advanced coaching features, team plans, export/print.

---

## Acceptance Criteria (examples)

- User can create a plan from a target role and receive at least 3–5 actionable milestones.
- Marking a milestone complete updates `overallProgress` immediately in the UI.
- User can accept/reject AI recommendations; re-generation is available on demand.
- Reminders are sent for overdue milestones based on user preferences.

---

## Implementation Artifacts Added

- `backend/models/CareerPlan.js`
- `backend/services/careerPlanService.js`
- `backend/controllers/careerPlanController.js`
- `backend/routes/careerPlanRoutes.js`
- `backend/services/ai/prompts/careerPlan.prompt.js`
- `docs/CareerPath_Report.md` (this file)

---

## Next Steps I can implement for you now
1. Register `careerPlanRoutes` in the server (`app.js`/`server.js`).
2. Scaffold the frontend shell `CareerPathShell` and related components.
3. Implement `recommendationService` to call the AI and persist results.

Tell me which of the three I should start with, or I can proceed to register the routes automatically.
