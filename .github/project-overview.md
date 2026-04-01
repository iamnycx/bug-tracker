# Mini Bug Tracker - Project Overview

A lightweight, full-stack issue tracking system designed with a strong focus on correctness, safety, and maintainability rather than feature overload.

This project demonstrates how good system design prevents invalid states, ensures predictable behavior, and remains easy to extend.

## Core Philosophy

- Prevent invalid operations at the system level.
- Keep business logic centralized and testable.
- Design APIs that are hard to misuse.
- Make changes safe and low-impact.

## Stack

- Frontend: React + Tailwind
- Backend: Flask + SQLAlchemy
- Validation: Pydantic
- Testing: Pytest
- Database: PostgreSQL (via SQLAlchemy ORM)

## Domain Model

- User: actor/assignee.
- Project: logical bug grouping.
- Bug: core lifecycle entity.
- Comment: communication and audit context.

## Lifecycle State Machine

Canonical lifecycle:

`open -> in_progress -> resolved -> closed`

Required guards:

- Cannot move to `in_progress` without an assignee.
- Cannot move to `resolved` without a resolution note.
- Invalid transitions are rejected explicitly.

## API Surface

- `POST /bugs`
- `GET /bugs`
- `GET /bugs/:id`
- `PUT /bugs/:id`
- `POST /bugs/:id/transition`
- `POST /bugs/:id/comments`

Response contract:

- Success: `{ "data": ..., "error": null, "status": 2xx }`
- Error: `{ "data": null, "error": "message", "status": 4xx/5xx }`

## Architectural Boundaries

- State transition logic lives only in `backend/app/core/state_machine.py`.
- Business rules live only in `backend/app/services/`.
- Route handlers validate and delegate only.
- Frontend components are display-oriented.
- Network calls are centralized in `frontend/src/api/`.

## Testing and Verification

- Cover valid and invalid transitions.
- Test state-machine logic directly (do not mock transition behavior).
- Include service and route tests for domain guardrails.

## Why This Project Stands Out

- Emphasizes engineering maturity over feature count.
- Encodes domain rules so invalid states are hard to represent.
- Supports safe refactoring through layered design.
- Keeps behavior explicit, testable, and reviewer-friendly.
