---
applyTo: 'backend/**'
---

## Backend-Specific Rules

- Import order: stdlib → third-party → local. Use isort conventions.
- All Pydantic schemas go in `backend/app/schema/`. Never validate in routes directly.
- SQLAlchemy models go in `backend/app/models/`. One file per model.
- Services contain business behavior and do not read from Flask request globals.
- Route handlers only validate payload/query params and delegate to services.
- State changes must go through `backend/app/core/state_machine.py`.
- Never mutate bug `status` directly on a model.
- Raise `ValueError` for invalid business rules (e.g., illegal state transition).
  The route handler catches it and returns a 400.
- Database session management: use `db.session` from `flask_sqlalchemy`.
  Never create sessions manually.
- Every model should include auto-managed `created_at` and `updated_at` fields.


## Required Backend Skills

- Use `.github/skills/flask-api-development/` for production-grade decisions.

## Flask API Design Rules

- URI must represent resources; use nouns (plural) for CRUD routes.
  Prefer `/users`, `/projects`, `/bugs` instead of action-style paths.
- Keep URI naming consistent: lowercase and hyphenated words when needed.
- Use hierarchical URIs for nested resources, for example `/bugs/{id}/comments`.
- Use HTTP methods semantically:
    - `GET`: read
    - `POST`: create
    - `PUT`: full update
    - `PATCH`: partial update
    - `DELETE`: remove
- Use verb-style subpaths only for non-CRUD domain actions.

## Validation, Serialization, and Responses

- Validate all request bodies and query params via Pydantic schemas.
- Never trust client input; reject invalid data with explicit 4xx errors.
- Never return raw ORM objects directly from routes.
- Keep response shape consistent with project contract:
    - success: `{ "data": ..., "error": null, "status": 2xx }`
    - failure: `{ "data": null, "error": "message", "status": 4xx/5xx }`

## Security Requirements

- Do not invent custom authentication logic in route handlers.
- Prefer OAuth2/JWT-based auth integration through trusted providers/libraries.
- Protect sensitive endpoints with auth middleware/decorators once auth is introduced.
- Never hardcode secrets; use environment variables/settings only.

## Documentation and Testing

- API endpoints should remain OpenAPI/Swagger-documentable by design.
- Document request payloads, responses, and error cases near route/schema definitions.
- Add tests for happy paths and invalid/edge cases for each endpoint.
- Endpoint tests must assert status codes and response contract shape, not just payload fields.

## Backend Implementation Order

1. Implement `BugStatus` enum + transition policy in `app/core/state_machine.py`.
2. Add ORM models and relationships in `app/models/`.
3. Add schema definitions in `app/schema/`.
4. Implement service methods in `app/services/`.
5. Add/extend routes in `app/routes/` to call services.
6. Add tests for valid and invalid transitions in `backend/tests/`.
