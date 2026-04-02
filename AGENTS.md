# Bug-Tracker — Agent Instructions

This project is a bug tracker with a strict state machine at its core.

## Mission

Build a lightweight but production-minded tracker where invalid bug lifecycle transitions are impossible by design.

## Product Summary

- Focus: correctness, safety, maintainability over feature count.
- Core entities: `User`, `Project`, `Bug`, `Comment`.
- Canonical bug lifecycle: `open -> in_progress -> resolved -> closed`.
- UX target: simple Kanban-style flow that reflects backend constraints.

## Current Repository State

- Current code is scaffold-level in both backend and frontend.
- Architecture and behavior rules in this file are the target implementation contract.
- If required files do not exist yet (for example `state_machine.py`), create them in the defined locations.

## Agent And Skill Layout

- Custom agents belong in `.github/agents/`.
- Project skills belong in `.github/skills/`.
- Do not create or rely on hidden `.github/.agents/` paths; normalize installs into the documented folders.

## Persistent User Preferences

- Treat direct user style and UX directives as persistent project instructions.
- When a user gives a durable preference (layout, typography, interaction style, visual language), record it in `AGENTS.md` and/or `.github/copilot-instructions.md` unless explicitly marked temporary.
- Prefer readable UI with generous whitespace and clear typography hierarchy.
- Keep a minimal, square-corner, tech-forward visual style unless superseded by newer user direction.
- For Kanban UX in this project:
    - Keep top action buttons small and right-aligned.
    - Keep `Bug Tracker` title on the left in the top bar.
    - Make bug cards draggable from the whole card surface (not only a handle).
    - Keep a dedicated collapse/expand button on cards.
    - Keep note/comment inputs easy to spot and readily available.
    - Use full-screen app height with no page scroll; each state column should scroll independently.

## Before making any change

1. Read `.github/copilot-instructions.md` for global architecture rules.
2. Read `.github/instructions/backend.instructions.md` and `.github/instructions/frontend.instructions.md`.
3. Read `backend/app/core/state_machine.py` if present; otherwise implement it before adding transition endpoints.
4. Run infrastructure setup before tests (`docker compose up db -d`, then backend migrations).

## Running tests

```bash
cd backend && pytest tests/ -v
```

## Implementation Plan (Comprehensive)

### Phase 1: Backend Domain Core

- Add `BugStatus` enum and state transition policy in `backend/app/core/state_machine.py`.
- Enforce transition guards:
    - assignee required before `in_progress`
    - resolution note required before `resolved`
- Expose one transition entrypoint (for example `transition_state(...)`) and forbid direct status mutation.

### Phase 2: Data Model and Persistence

- Implement SQLAlchemy models in `backend/app/models/`:
    - `user.py`, `project.py`, `bug.py`, `comment.py`
- Ensure each model has auto-managed `created_at` and `updated_at`.
- Add relationships and indexes for common bug filtering (`status`, `priority`, assignee).
- Use Flask-Migrate for schema evolution.

### Phase 3: Service Layer

- Implement business logic only in `backend/app/services/`.
- Routes should only validate input and call services.
- Service APIs should enforce all domain rules and raise explicit errors on invalid operations.

### Phase 4: API Surface

- Implement endpoints for create/list/get/update bug, transition bug, add comment.
- Keep response contract consistent:
    - success: `{ "data": ..., "error": null, "status": 2xx }`
    - failure: `{ "data": null, "error": "message", "status": 4xx/5xx }`
- Keep filtering via query params (status, priority, assignee).
- Keep REST naming strict: resource nouns in URIs, HTTP verbs for behavior.
- Avoid CRUD action words in path names (`/create`, `/get-all`, etc.).

### API Quality Guardrails

- Validate all inputs (body and query) through schemas, not inline route logic.
- Ensure all new endpoints are straightforward to document in OpenAPI/Swagger.
- Include endpoint tests for both happy path and invalid input/edge cases.
- Add auth-aware design (OAuth2/JWT middleware boundaries) for protected routes; do not implement custom ad-hoc auth logic.

### Phase 5: Frontend

- Use Bun runtime only for frontend package management and scripts.
- Place all network calls in `frontend/src/api/`.
- Keep components display-focused and hook-based.
- Build 4-column workflow UI (Open, In Progress, Resolved, Closed) as a Kanban board.
- Support drag-and-drop interactions for moving bug cards between columns.
- Implement `New User`, `New Project`, and `New Bug` as modal popup forms with blurred backdrop.
- Ensure loading/error states for all async views.
- Use `.github/skills/frontend-design/` and `.github/skills/vercel-react-best-practices/` when building or refactoring frontend UI.

### Phase 6: Tests and Verification

- Add direct tests for state machine valid/invalid transitions.
- Add service and endpoint tests for guard conditions.
- Do not mock the state machine in transition tests.

## Feature Checklist

- [ ] State machine implemented and centralized
- [ ] Services enforce business rules
- [ ] Routes contain no business logic
- [ ] Request validation schemas in place
- [ ] Migration added for schema changes
- [ ] Tests for valid and invalid transitions
- [ ] Frontend uses API wrapper functions only

## Adding a new feature checklist

- [ ] Service function added in `app/services/`
- [ ] Route calls service only — no logic in route handler
- [ ] Pydantic schema validates the request body
- [ ] Migration created with `flask db migrate -m "description"`
- [ ] Tests cover the happy path and at least one invalid input
