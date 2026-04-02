# Bug Tracker

Production-minded bug tracker with a strict lifecycle state machine, role-based access control, and a Kanban-first UI.

## Overview

This repository contains a full-stack bug tracking system built for correctness and maintainability.

**Live demo:** https://bug-tracker-tau-liart.vercel.app

- Backend: Flask, SQLAlchemy, Flask-Migrate, JWT auth
- Frontend: React, TypeScript, Vite, Bun, Tailwind, dnd-kit
- Database: PostgreSQL
- Local orchestration: Docker Compose

Core workflow:

- open -> in_progress -> resolved -> closed

The system enforces guard conditions so invalid transitions are blocked by design.

## Default Admin Credentials

For local/dev bootstrapping, the backend creates (or updates) an admin user with:

- Email: `admin@bugtracker.local`
- Password: `admin12345`

In production, you should set these through environment variables on Render:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

The app bootstraps this admin account automatically (idempotent) so it exists in your deployed database.

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

1. Clone the repository:

```bash
git clone https://github.com/iamnycx/bug-tracker.git
cd bug-tracker
```

2. Create env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start full stack:

```bash
docker compose up --build
```

4. Open apps:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

5. Stop the stack:

```bash
docker compose down
```

6. Reset the database and volumes if you need a clean start:

```bash
docker compose down -v
```

Notes:

- Backend container runs migrations on startup:

```bash
flask db upgrade
```

- Code is bind-mounted for hot reload in both frontend and backend services

## Local Development (Without Docker)

### Backend

1. From `backend/`:

```bash
cd backend
uv venv .venv
uv sync --dev
cp .env.example .env
```

If you do not want to run a local PostgreSQL instance for manual development, set `DATABASE_URL=sqlite:///dev.db` in `backend/.env` instead of the Postgres connection string.

2. Run migrations:

```bash
uv run flask --app run db upgrade
```

3. Start server:

```bash
uv run flask --app run run --host 0.0.0.0 --port 5000 --debug
```

### Frontend

1. From `frontend/`:

```bash
cd frontend
bun install
cp .env.example .env
```

2. Start dev server:

```bash
bun run dev
```

## Environment Variables

### Backend

From `backend/.env.example`:

- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `JWT_ACCESS_TOKEN_EXPIRES_MINUTES`
- `DATABASE_URL`
- `DEBUG`
- `CORS_ORIGINS`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Frontend

From `frontend/.env.example`:

- `VITE_API_URL`

## Deployment

This project is compatible with local development and cloud deployment at the same time.

Recommended hosting layout:

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

### Backend on Render

Deploy the backend as a Docker service using the production stage from `backend/Dockerfile`.

Use these settings:

- Build command: use the Dockerfile
- Start command: `sh -c "uv run flask --app run db upgrade && exec uv run granian --interface wsgi run:app --host 0.0.0.0 --port 8000"`
- Environment variables:

```bash
SECRET_KEY=your-strong-secret
JWT_SECRET_KEY=your-strong-jwt-secret
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=120
DATABASE_URL=postgresql://...
DEBUG=False
CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@bugtracker.local
ADMIN_PASSWORD=admin12345
```

If you use Vercel preview deployments, you can allow all Vercel subdomains by setting:

```bash
CORS_ORIGINS=https://*.vercel.app,https://your-vercel-app.vercel.app,http://localhost:5173
```

If you use Neon, copy the pooled or direct connection string from Neon and paste it into `DATABASE_URL`. If the connection requires SSL, keep the `sslmode=require` option that Neon provides.

### Frontend on Vercel

Set the frontend environment variable in Vercel:

```bash
VITE_API_URL=https://your-render-backend.onrender.com
```

Use these build settings:

- Framework preset: Vite
- Build command: `bun run build`
- Output directory: `dist`

### Local Development Together With Cloud Deployments

For local Docker development, keep these values in `backend/.env` and `frontend/.env`:

```bash
# backend/.env
SECRET_KEY=dev-secret-change-me
JWT_SECRET_KEY=change-this-to-a-long-random-secret-at-least-32-characters
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=120
DATABASE_URL=postgresql://bugtracker:bugtracker@db:5432/bugtracker
DEBUG=True
CORS_ORIGINS=http://localhost:5173

# frontend/.env
VITE_API_URL=http://localhost:5000
```

This keeps local Docker Compose working while using separate production values in Vercel and Render.

### Keep Admin User In Render + Neon

To keep this admin user available in your deployed app:

1. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in Render environment variables.
2. Keep `DATABASE_URL` pointed to your Neon database.
3. Ensure migrations run (`flask db upgrade`) during deploy/start.
4. Trigger one request after deploy (for example `GET /auth/me` or `POST /auth/login`) so admin bootstrap runs.

Because Neon is persistent, the admin row remains in the database across restarts/redeploys. The bootstrap is safe to run repeatedly and will keep the admin account aligned with your configured env vars.

### Deployment Checklist

1. Push the repository to GitHub.
2. Create a Neon PostgreSQL database.
3. Deploy the backend to Render and set `DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`, and `CORS_ORIGINS`.
4. Deploy the frontend to Vercel and set `VITE_API_URL` to the Render backend URL.
5. Update `CORS_ORIGINS` to include the final Vercel domain.
6. Redeploy both services after changing environment variables.

## Database and Migrations

- ORM: SQLAlchemy
- Migrations: Flask-Migrate (Alembic)
- DB: PostgreSQL in Docker, configurable via `DATABASE_URL`

Common commands (backend):

```bash
uv run flask --app run db migrate -m "message"
uv run flask --app run db upgrade
```

## Testing

### Backend

```bash
docker compose exec -T backend sh -lc 'PYTHONPATH=/app uv run pytest tests -q'
```

### Frontend

```bash
cd frontend
bun run test
```

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
