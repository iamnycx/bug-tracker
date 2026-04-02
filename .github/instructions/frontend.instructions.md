---
applyTo: 'frontend/**'
---

## Frontend-Specific Rules

- Use functional components with hooks only. No class components.
- Use Bun runtime only for frontend dependency installation and script execution.
  Use `bun install`, `bun run dev`, `bun run build`, and `bun run test`.
- All `fetch` / `axios` calls go in `frontend/src/api/` modules only.
  Components call these functions, never `fetch` directly.
- Tailwind only for styling. No inline styles, no CSS modules, no styled-components.
- Keep components small and single-purpose. If a component exceeds ~80 lines,
  consider splitting it.
- API base URL comes from `import.meta.env.VITE_API_URL`. Never hardcode localhost.
- Handle loading and error states explicitly in every component that fetches data.
- The core workflow UI must be a Kanban board with drag-and-drop interactions for bug cards.
- "New User", "New Project", and "New Bug" actions must open modal popups with a blurred backdrop.

## Required Frontend Skills

- Use `.github/skills/frontend-design/` for clean, distinctive, production-grade UI design decisions.
- Use `.github/skills/vercel-react-best-practices/` for React performance and rendering patterns.
- When implementing or refactoring frontend features, apply both skills together unless the task is explicitly backend-only.

## React Best Practices

- Keep components focused on rendering and interaction; move data transforms to helpers.
- Prefer composition over prop drilling chains. Extract reusable child components early.
- Use stable keys from domain IDs; never use array index as key for dynamic lists.
- Keep state minimal and derived where possible. Do not duplicate derivable state.
- Use controlled inputs for forms and validate input before calling API wrappers.
- Use `useEffect` only for side effects. Do not use effects for pure computations.
- Include complete dependency arrays for hooks; avoid disabling lint rules for hooks.
- Cancel or ignore stale async requests in effects to avoid race-condition UI bugs.
- Use memoization (`useMemo`, `useCallback`) only for measured rerender/perf issues.
- Keep event handlers small; extract complex logic to utility functions or hooks.

## State and Data Rules

- Keep server state and UI state separate conceptually.
- Normalize repeated UI lookups (for example map bugs by id) in helper functions.
- Ensure optimistic updates are reversible when API calls fail.
- Always surface backend validation/transition errors in the UI with actionable text.

## Accessibility and UX Rules

- Use semantic HTML (`button`, `form`, `label`) instead of clickable `div`s.
- Ensure keyboard accessibility for interactive elements and dialogs.
- Add accessible names/labels for form controls and icon-only buttons.
- Keep loading, empty, and error states visible for each asynchronous region.

## Frontend Testing Expectations

- Add unit/component tests for critical rendering branches and interaction flows.
- Test loading, success, and error scenarios for API-backed components.
- Prefer behavior-focused assertions over implementation details.

## Frontend Structure Goals

- `src/api/`: typed API wrapper functions for all backend endpoints.
- `src/components/`: display-focused UI pieces (board columns, cards, forms).
- `src/lib/`: reusable utility helpers only.

## UX Contract

- Represent bug states as four explicit columns: Open, In Progress, Resolved, Closed.
- Support drag-and-drop card movement between columns, with transitions mapped to backend state rules.
- Surface backend transition errors clearly (for example, missing assignee or resolution note).
- Reflect backend enums in UI selectors; do not hardcode divergent state values.
- Keep create flows in modal dialogs (`New User`, `New Project`, `New Bug`) with blur-overlay background and clear cancel/confirm controls.
