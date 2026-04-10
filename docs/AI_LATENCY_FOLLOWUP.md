# AI Integration And Latency Follow-Up

## Where AI is used

- `src/services/aiApi.ts`
  - Shared frontend gateway for AI calls.
  - `askAI()` sends `POST /api/ai/ask`.
  - `getHistory()` sends `GET /api/ai/history`.

- `src/components/dashboard/AIAssistantShell.tsx`
  - Full chat UI.
  - Loads saved history with `getHistory()`.
  - Sends every chat message through `askAI()`.

- `src/components/dashboard/CareerPathShell.tsx`
  - Calls `askAI()` to generate the personalized career path.

- `src/components/dashboard/SkillGapShell.tsx`
  - Calls `askAI()` to generate the skill gap analysis.

## Backend AI flow

- `backend/routes/aiRoutes.js`
  - Exposes `/api/ai/ask` and `/api/ai/history`.

- `backend/controllers/aiController.js`
  - On every `ask` request, the backend currently does this in sequence:
    1. Save the user message to MongoDB
    2. Fetch the user profile from MongoDB
    3. Build a long personalized prompt
    4. Call the configured AI provider
    5. Save the AI response to MongoDB

- `backend/services/ai/ai.service.js`
  - Central provider gateway.
  - Current configured provider is read from `AI_PROVIDER`.

## Current provider

- `backend/.env`
  - `AI_PROVIDER=nvidia`
  - `AI_ENABLE_FALLBACK=false`

This means the app is currently using the NVIDIA-backed chat provider first, not multiple providers at the same time.

## Why the AI Assistant feels slow

The AI Assistant is the most latency-sensitive place in the app because it uses the full chat path for every single message:

- MongoDB write for the user message
- MongoDB read for the profile
- AI provider call
- MongoDB write for the assistant reply

That full sequence happens for each chat turn, so the delay is much more noticeable there than in one-shot features like Career Path or Skill Gap.

## Note for later work

The AI Assistant response time should be improved in a future pass.

Recommended investigation order:

1. Measure the time spent in:
   - DB write 1
   - profile fetch
   - provider call
   - DB write 2

2. Check whether the NVIDIA model `z-ai/glm4.7` is the main latency source.

3. Consider making the assistant path lighter:
   - cache profile context for the session
   - reduce prompt size
   - use a faster chat model for conversational turns
   - defer or batch some persistence work if acceptable

## Extra inconsistency to review later

- `backend/services/ai/gemini.service.js` exists, but `backend/services/ai/ai.service.js` currently only lists:
  - `deepseek`
  - `nvidia`
  - `groq`

- `backend/routes/aiRoutes.js` test route still reports:
  - `process.env.AI_PROVIDER || "gemini"`

This provider naming/default behavior should be cleaned up later so the project has one clear source of truth.
