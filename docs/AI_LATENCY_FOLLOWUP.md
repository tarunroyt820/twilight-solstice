# AI Integration And Latency Follow-Up

## Where AI is used

- `src/services/aiApi.ts`
  - Shared frontend gateway for AI calls.
  - `askAI()` sends `POST /api/ai/ask`.
  - `getHistory()` sends `GET /api/ai/history`.

- `src/components/dashboard/AIAssistantShell.tsx`
  - Full chat UI.
  - Loads saved history with `getHistory()`.
  - Sends chat messages through `askAI()`.

- `src/components/dashboard/SkillGapShell.tsx`
  - Calls `askAI()` to generate the skill gap analysis when no plan is available.

## Backend AI flow

- `backend/routes/aiRoutes.js`
  - Exposes `/api/ai/ask` and `/api/ai/history`.

- `backend/controllers/aiController.js`
  - Saves user message to MongoDB
  - Fetches profile + chat history
  - Builds prompt
  - Calls provider
  - Saves assistant response

- `backend/services/ai/ai.service.js`
  - Central provider gateway (Groq only).

## Current provider

- `backend/.env`
  - `AI_PROVIDER=groq`

## Why the AI Assistant can feel slow

Each chat turn does multiple operations:

- MongoDB write (user message)
- MongoDB read (profile + history)
- Groq provider call
- MongoDB write (assistant message)

Recommended next optimizations:

1. Reduce prompt size and/or history length.
2. Cache profile context per session.
3. Use a smaller chat model for conversational turns (Llama), and a heavier model (optionally Qwen) only for deep tasks.

