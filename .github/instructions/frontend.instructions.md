---
applyTo: 'frontend/**'
---

## Frontend-Specific Rules

- Use functional components with hooks only. No class components.
- All `fetch` / `axios` calls go in `frontend/src/api/` modules only.
  Components call these functions, never `fetch` directly.
- Tailwind only for styling. No inline styles, no CSS modules, no styled-components.
- Keep components small and single-purpose. If a component exceeds ~80 lines,
  consider splitting it.
- API base URL comes from `import.meta.env.VITE_API_URL`. Never hardcode localhost.
- Handle loading and error states explicitly in every component that fetches data.

## Frontend Structure Goals

- `src/api/`: typed API wrapper functions for all backend endpoints.
- `src/components/`: display-focused UI pieces (board columns, cards, forms).
- `src/lib/`: reusable utility helpers only.

## UX Contract

- Represent bug states as four explicit columns: Open, In Progress, Resolved, Closed.
- Surface backend transition errors clearly (for example, missing assignee or resolution note).
- Reflect backend enums in UI selectors; do not hardcode divergent state values.
