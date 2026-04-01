# Bug-Tracker — Copilot Instructions

## Project

Bug tracker with enforced state machine transitions.
Stack: Flask + SQLAlchemy (backend), React + Tailwind (frontend), PostgreSQL, Docker.

## Engineering Intent

- Prioritize correctness and explicit domain constraints over feature breadth.
- Keep architecture layered so behavior is predictable and testable.
- Make invalid states structurally hard to represent.

## Non-Negotiable Architecture Rules

- Business logic lives ONLY in `backend/app/services/`. Never in route handlers.
- State transition logic lives ONLY in `backend/app/core/state_machine.py`.
- Route handlers do two things only: validate input (via Pydantic schema) and call a service.
- React components are display-only. No business logic, no direct fetch calls.
- All API calls from the frontend go through functions in `frontend/src/api/`.

## State Machine

Valid states: `open` → `in_progress` → `resolved` → `closed`

- Bugs must have an assignee before transitioning to `in_progress`
- Bugs must have a `resolution_note` before transitioning to `resolved`
- Never update `status` directly on the model — always call `transition_state()`
- Never hardcode state strings — always use the `BugStatus` enum

## Domain Entities (Target)

- `User`: actor/assignee.
- `Project`: logical grouping for bugs.
- `Bug`: lifecycle-driven primary aggregate.
- `Comment`: communication and audit context for bug work.

## API Contract

Every endpoint returns: `{ "data": ..., "error": null, "status": 200 }`
On error: `{ "data": null, "error": "message", "status": 4xx }`

## Database

- Always use SQLAlchemy ORM. No raw SQL.
- Every model must have `created_at` and `updated_at` (auto-managed).
- Use Flask-Migrate for all schema changes. Never modify tables manually.

## Testing

- Every valid AND invalid state transition must have a test.
- Do not mock the state machine test it directly.
- Tests live in `backend/tests/`.

## Endpoint Scope (Target)

- `POST /bugs`
- `GET /bugs`
- `GET /bugs/:id`
- `PUT /bugs/:id`
- `POST /bugs/:id/transition`
- `POST /bugs/:id/comments`

## Delivery Plan Expectations

- If the repository is scaffold-level, implement missing files in the canonical locations instead of bypassing rules.
- Introduce new behavior in this order:
    1.  enum + state machine
    2.  models + migration
    3.  service methods
    4.  route wiring
    5.  frontend API wrappers + UI
    6.  tests (unit + integration)
- Keep changes localized; avoid spreading transition logic across layers.

## Python Style

- Type hints on all function signatures.
- No `print()` for logging — use `app.logger`.
