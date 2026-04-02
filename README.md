# Bug Tracker

Production-minded bug tracker with a strict lifecycle state machine, role-based access control, and a Kanban-first UI.

## Overview

This repository contains a full-stack bug tracking system built for correctness and maintainability.

- Backend: Flask, SQLAlchemy, Flask-Migrate, JWT auth
- Frontend: React, TypeScript, Vite, Bun, Tailwind, dnd-kit
- Database: PostgreSQL
- Local orchestration: Docker Compose

Core workflow:

- open -> in_progress -> resolved -> closed

The system enforces guard conditions so invalid transitions are blocked by design.

## Product Goals

- Prevent invalid bug states with centralized transition rules
- Keep business logic in services, not route handlers
- Provide clear API contracts and structured error responses
- Offer a clean Kanban workflow with drag-and-drop interactions
- Keep frontend data access centralized in API modules

## Architecture

### Backend

- State machine logic is centralized in `backend/app/core/state_machine.py`
- Route handlers validate input and delegate work to services
- Business rules live in `backend/app/services/`
- ORM models live in `backend/app/models/`
- Pydantic schemas live in `backend/app/schema/`

### Frontend

- API calls are isolated in `frontend/src/api/`
- Dashboard orchestration is handled by hooks in `frontend/src/lib/dashboard/`
- Components remain UI-focused in `frontend/src/components/`
- App uses React Router with protected dashboard routes

### API Response Contract

All endpoints use a consistent response envelope:

- Success: `{ "data": ..., "error": null, "status": 2xx }`
- Error: `{ "data": null, "error": "message", "status": 4xx/5xx }`

## Domain Model

- User: actor, assignee, role bearer (`admin` or `member`)
- Project: grouping context for bugs
- Bug: lifecycle-driven aggregate with assignee and resolution metadata
- Comment: audit/communication on bugs

## State Machine Rules

Valid transitions only:

- open -> in_progress
- in_progress -> resolved
- resolved -> closed

Guards:

- Assignee required before moving to in_progress
- Resolution note required before moving to resolved

Additional role constraints:

- Admin can create users/projects/bugs and perform all transitions
- Member can read entities, comment, and only resolve in_progress bugs

## API Endpoints

Authentication:

- POST /auth/register
- POST /auth/login
- GET /auth/me

Users:

- POST /users (admin)
- GET /users
- GET /users/:id

Projects:

- POST /projects (admin)
- GET /projects
- GET /projects/:id

Bugs:

- POST /bugs (admin)
- GET /bugs
- GET /bugs/:id
- PUT /bugs/:id
- POST /bugs/:id/transition
- POST /bugs/:id/comments
- GET /bugs/:id/comments

## Repository Layout

- `backend/`: Flask API, services, models, migrations, tests
- `frontend/`: React app, API client layer, dashboard UI, tests
- `docker-compose.yaml`: local stack orchestration

## Prerequisites

- Docker and Docker Compose
- Bun 1.3.x (frontend local scripts)
- Python 3.14 and uv (optional, for backend local non-docker flow)

## Quick Start (Recommended: Docker)

1. Create env files:
    - Copy `backend/.env.example` to `backend/.env`
    - Copy `frontend/.env.example` to `frontend/.env`

2. Start full stack:
    - `docker compose up --build`

3. Open apps:
    - Frontend: http://localhost:5173
    - Backend: http://localhost:5000

Notes:

- Backend container runs migrations on startup (`flask db upgrade`)
- Code is bind-mounted for hot reload in both frontend and backend services

## Local Development (Without Docker)

### Backend

1. From `backend/`:
    - `uv venv .venv`
    - `uv sync --dev`
2. Set environment variables (or use `backend/.env`)
3. Run migrations:
    - `uv run flask --app run db upgrade`
4. Start server:
    - `uv run flask --app run run --host 0.0.0.0 --port 5000 --debug`

### Frontend

1. From `frontend/`:
    - `bun install`
2. Start dev server:
    - `bun run dev`

## Environment Variables

### Backend

From `backend/.env.example`:

- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `JWT_ACCESS_TOKEN_EXPIRES_MINUTES`
- `DATABASE_URL`
- `DEBUG`
- `CORS_ORIGINS`

### Frontend

From `frontend/.env.example`:

- `VITE_API_URL`

## Database and Migrations

- ORM: SQLAlchemy
- Migrations: Flask-Migrate (Alembic)
- DB: PostgreSQL in Docker, configurable via `DATABASE_URL`

Common commands (backend):

- Create migration: `uv run flask --app run db migrate -m "message"`
- Apply migration: `uv run flask --app run db upgrade`

## Testing

### Backend

- Run all tests:
    - `docker compose exec -T backend sh -lc 'PYTHONPATH=/app uv run pytest tests -q'`

### Frontend

- Run Vitest suite:
    - `cd frontend && bun run test`

Important:

- Use `bun run test` for frontend tests. `bun test` runs Bun's test runner, which is different from Vitest config.

## Observability and Error Handling

- Standardized API envelope for all responses
- Unexpected route errors are logged with traceback context via route utilities
- State machine and validation errors are returned as actionable 4xx responses

## Security Model

- JWT-based authentication
- Role-based route guards (`admin`, `member`)
- Input validation through Pydantic schemas
- No hardcoded request trust; invalid payloads fail with 400

## Key Technical Decisions

1. Centralized state machine enforcement

- Decision: Keep transition policy in one module and call it from the model/service boundary.
- Why: Prevents lifecycle drift and scattered transition logic.

2. Thin routes, service-owned business logic

- Decision: Route handlers only parse/validate and delegate.
- Why: Improves testability and keeps behavior consistent across endpoints.

3. Uniform response envelope

- Decision: Every endpoint returns the same top-level response shape.
- Why: Simplifies frontend error handling and observability.

4. Frontend API isolation

- Decision: Network calls only in `frontend/src/api/`.
- Why: Prevents fetch logic from leaking into UI components and enables cleaner mocking.

5. Kanban as first-class workflow

- Decision: Product UX is a state-column board mapped to backend lifecycle states.
- Why: Keeps business state and user interactions aligned and intuitive.

6. Role-aware behavior at backend boundary

- Decision: Enforce permissions in route guards and service checks.
- Why: Ensures consistent authorization independent of client implementation.

7. Docker-first development experience

- Decision: Compose stack runs DB, backend, and frontend with hot reload.
- Why: Reduces setup variance and keeps onboarding fast.

## Deployment Notes

For production deployment:

- Set strong, unique `SECRET_KEY` and `JWT_SECRET_KEY`
- Use managed PostgreSQL with backups
- Restrict `CORS_ORIGINS` to trusted domains
- Run migrations as part of release pipeline
- Serve frontend assets via CDN/edge and place backend behind reverse proxy
- Add monitoring, request logging, and alerting

## Current Status

This repository includes:

- Authenticated API with role guards
- Enforced bug lifecycle transitions and guard rules
- Kanban dashboard with create flows and comments
- Backend and frontend automated test coverage

If you want, a next step is adding a small OpenAPI section and curl examples for each endpoint in this README.
