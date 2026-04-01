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

## Backend Implementation Order

1. Implement `BugStatus` enum + transition policy in `app/core/state_machine.py`.
2. Add ORM models and relationships in `app/models/`.
3. Add schema definitions in `app/schema/`.
4. Implement service methods in `app/services/`.
5. Add/extend routes in `app/routes/` to call services.
6. Add tests for valid and invalid transitions in `backend/tests/`.
