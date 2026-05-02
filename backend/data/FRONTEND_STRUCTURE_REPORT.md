# Frontend Structure Report

## 🗂️ Frontend Structure Report

### 1. Tech Stack
- React 19.0.0
- Vite ^6.0.3 (configured in `vite.config.ts`)
- TypeScript ^5.7.2 (project `tsconfig.json` with `jsx: react-jsx`)
- Tailwind CSS ^3.4.16 with plugin `tailwindcss-animate`
- PostCSS + Autoprefixer (see `postcss.config.mjs`)
- Axios for HTTP client (centralized wrapper in `src/services/http.ts`)
- Routing: `react-router-dom` v7.13.0
- UI primitives: Radix UI packages (many `@radix-ui/*` deps) + custom UI components under `src/components/ui`
- Tooling: ESLint/Prettier suggested by scripts (not all configs present in repo root), Vite build and dev scripts in `package.json`

Notes: full dependency list and versions visible in [package.json](package.json).

---

### 2. Project Folder Tree (frontend-relevant)
(annotated — show key files / purpose)

- src/
  - main.tsx — app bootstrap (ReactDOM) and global imports
  - App.tsx — top-level routes
  - index.css — global Tailwind + design tokens
  - vite-env.d.ts
  - assets/ — static images and placeholders
  - hooks/ — reusable React hooks (e.g. `use-mobile`, `use-toast`)
  - lib/ — misc helpers (e.g. `utils.ts`)
  - services/
    - http.ts — axios instance + refresh-token logic
    - skillExchangeApi.ts — frontend client for trade/skill endpoints
    - profileApi.ts, discoveryApi.ts, aiApi.ts, etc.
  - utils/
    - authToken.ts — token helpers
    - profileStorage.ts, tempEnhancedProfileStorage.ts
  - components/
    - common/ — `Button.tsx`, `InputField.tsx`, `Logo.tsx`, `NotFound.tsx`, etc.
    - layout/ — `Navbar.tsx`, `Footer.tsx`, `ThemeToggle.tsx`
    - ui/ — UI primitives and design tokens wrappers (`button.tsx`, `card.tsx`, `toast.tsx`, `dialog.tsx`, pagination, forms, etc.)
    - auth/ — `AuthPage.tsx`, `ForgotPasswordPage.tsx`, `ProtectedRoute.tsx`, `ResetPasswordPage.tsx`
    - landing/ — `HeroSection.tsx`, `PricingSection.tsx`, `TestimonialsSection.tsx`, etc.
    - dashboard/ — `Dashboard.tsx`, `SkillExchangeShell.tsx`, `OverviewShell.tsx`, `SkillGapShell.tsx`, `AIAssistantShell.tsx`, etc.
    - skill-exchange/ — `SearchProfiles.tsx`, `RequestExchangeModal.tsx`, `SkillRequestsPage.tsx`, `SkillExchangesPage.tsx`, `SkillProfileSetupPage.tsx`, `SkillPublicProfilePage.tsx`, `SkillMatchesPage.tsx`, `SkillNotificationsPage.tsx`, `TermsPage.tsx` and `shared.ts`
    - onboarding/ — `OnboardingFlow.tsx`
    - profile/ — `PublicProfile.tsx`
  - pages/
    - FindPeople.tsx — discover page wired to `SearchProfiles`
    - AdminDashboard.tsx

- public/ (if present) — served static assets (not enumerated here)
- index.html — Vite entry

Key files (examples):
- [src/main.tsx](src/main.tsx)
- [src/App.tsx](src/App.tsx)
- [src/services/http.ts](src/services/http.ts)
- [src/services/skillExchangeApi.ts](src/services/skillExchangeApi.ts)
- [src/components/skill-exchange/RequestExchangeModal.tsx](src/components/skill-exchange/RequestExchangeModal.tsx)
- [src/components/skill-exchange/SkillRequestsPage.tsx](src/components/skill-exchange/SkillRequestsPage.tsx)
- [src/components/ui/button.tsx](src/components/ui/button.tsx)

---

### 3. Component Architecture

- Pages → Layout → Components model:
  - `App.tsx` defines high-level routes and composes global layout pieces (e.g., `Navbar`, `Footer`) for public routes and `Dashboard` for protected routes.
  - Each feature area (dashboard, skill-exchange, onboarding, landing) has a `shell` or `Page` component that arranges page-level layout and imports feature components.
  - UI primitives (`src/components/ui/*`) act as a local design-system layer — shared atoms (buttons, inputs, dialogs, toast), molecules (cards, forms), and small composed components. These are used across `landing/`, `auth/`, `dashboard/` and feature pages.

- Shared vs Page-specific:
  - Shared: `src/components/ui`, `src/components/common`, `src/components/layout`.
  - Feature-specific: `src/components/skill-exchange/*`, `src/components/landing/*`, `src/components/auth/*`, `src/components/dashboard/*`.

- Patterns observed:
  - Component composition via props and local state.
  - Hooks folder provides shared logic (responsive helpers, toasts).
  - Minimal cross-cutting global state — most components fetch data on mount and rely on local state.

- Design system / UI library:
  - No external full design system like Material UI; the project uses Radix UI primitives (`@radix-ui/*` dependencies) and a custom component library under `src/components/ui`. This mirrors patterns used by `shadcn/ui` but appears to be a bespoke local UI layer.

---

### 4. State Management

- No centralized store detected (no Redux/Zustand/Jotai in dependencies or `store/` folder).
- Local React state and hooks are the primary state mechanism. Example: `SkillRequestsPage.tsx` uses `useState` and `useEffect` to fetch lists; `RequestExchangeModal.tsx` manages form state locally.
- Token/session handling: persisted tokens in `localStorage` with helper `getAuthToken` and interceptor-based refresh logic in `src/services/http.ts` using a `refreshPromise` concurrency guard.

Conclusion: state management is component-scoped + token/session orchestration, suitable for a small-to-medium app but may need centralized caching for larger scale lists.

---

### 5. Routing Strategy

- Routing is explicit via `react-router-dom` and configured in [src/App.tsx](src/App.tsx). Routes include public pages and a `ProtectedRoute` wrapper for authenticated dashboards.
- No file-based routing system (e.g., Next.js-style) — route definitions are centralized in `App.tsx`.
- Route examples: `/`, `/login`, `/signup`, `/dashboard/*`, `/discover`, `/profile/:userId`.

---

### 6. Styling Approach

- Tailwind CSS is the primary styling system (utility-first). Config present in [tailwind.config.js](tailwind.config.js) and global tokens in [src/index.css](src/index.css).
- Some custom CSS utilities and layers defined in `src/index.css` (design tokens, `.glass`, `.abyss-card`, etc.).
- UI components use Tailwind classes extensively. No CSS Modules or styled-components detected.

---

### 7. API / Data Layer

- HTTP client: centralized `axios` instance in [src/services/http.ts](src/services/http.ts) that handles:
  - API base URL from `import.meta.env.VITE_API_URL` or `http://localhost:5000` default
  - Response interceptor to auto-refresh tokens via `POST /api/auth/refresh` (concurrency-safe `refreshPromise`)
- High-level service clients exist under `src/services/` (e.g., `skillExchangeApi.ts`, `profileApi.ts`, `discoveryApi.ts`). These wrap `axios` calls and map responses to typed interfaces.
- No React Query, SWR, or other data caching layer detected — data fetching is manual via service calls and useEffect.

---

### 8. Code Quality & Tooling

- TypeScript enabled with `strict: true` in `tsconfig.json`.
- Linting and formatting: `eslint` and `prettier` scripts exist in `package.json`, but configuration files (`.eslintrc`, `.prettierrc`) were not in the scanned root (may exist elsewhere).
- Tests: backend has node scripts for unit-like tests (`backend/scripts/test_exchange_services.js`), but frontend testing setup (Jest/Vitest/Cypress) not detected in the repo root. No `vitest` or `jest` dependency in `package.json`.
- Build and dev: Vite dev (`npm run dev`) and `npm run build` uses `tsc && vite build` (TypeScript compile + Vite build). `dev:all` concurrently runs frontend and backend.

---

### 9. Summary & Observations

Key strengths:
- Clear folder separation between UI primitives, feature components, services, and utilities.
- Centralized HTTP client with token refresh logic reduces duplication and improves session resilience.
- Use of Tailwind + local UI primitives provides consistent look-and-feel and fast iterations.
- TypeScript `strict` mode enabled — strong signal of type discipline.

Areas to improve:
- No global data caching (React Query) — repeated fetches across components could be optimized with a query/caching layer for lists (matches, search results, requests).
- No centralized state store for cross-cutting UI state (e.g., modal open/close, notifications) — fine for now, but may become harder to maintain at scale.
- Testing: frontend test runner/config missing — add unit/component tests (Vitest/React Testing Library) and E2E (Playwright/Cypress) for core flows (search → request → accept).
- Error/surface handling: API errors mapped to thrown Error messages — consider a standardized error object and consistent UI error presentation.
- Some small mismatches existed between frontend and backend contract (for example `message` field in requests) — these should be validated in API types and e2e tests.

Recommended next steps (prioritized):
1. Add a light data-caching layer (React Query) for lists and search endpoints.
2. Add frontend unit tests for `SkillRequestsPage` and `RequestExchangeModal` and an E2E test for create → accept flow.
3. Add a shared error/ui-toaster service to standardize user-facing error messages.
4. Consider a minimal global store (Zustand) if cross-cutting UI state grows.

---

Files referenced in this report:
- [src/App.tsx](src/App.tsx)
- [src/main.tsx](src/main.tsx)
- [src/index.css](src/index.css)
- [vite.config.ts](vite.config.ts)
- [tsconfig.json](tsconfig.json)
- [postcss.config.mjs](postcss.config.mjs)
- [tailwind.config.js](tailwind.config.js)
- [src/services/http.ts](src/services/http.ts)
- [src/services/skillExchangeApi.ts](src/services/skillExchangeApi.ts)
- [src/components/skill-exchange/RequestExchangeModal.tsx](src/components/skill-exchange/RequestExchangeModal.tsx)
- [src/components/skill-exchange/SkillRequestsPage.tsx](src/components/skill-exchange/SkillRequestsPage.tsx)
- [src/components/ui/button.tsx](src/components/ui/button.tsx)


---
Report generated: April 30, 2026
