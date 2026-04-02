from app import create_app
from app.extensions import db


def main() -> int:
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///endpoint_check.db",
        }
    )

    with app.app_context():
        db.drop_all()
        db.create_all()

    client = app.test_client()

    checks: list[tuple[str, int, int]] = []

    def record(name: str, got: int, expected: int) -> None:
        checks.append((name, got, expected))

    record("GET /", client.get("/").status_code, 200)

    user = client.post("/users", json={"name": "Alice", "email": "alice@example.com"})
    record("POST /users", user.status_code, 201)
    user_id = user.get_json()["data"]["id"]

    record("GET /users", client.get("/users").status_code, 200)
    record("GET /users/:id", client.get(f"/users/{user_id}").status_code, 200)
    record(
        "POST /users duplicate",
        client.post("/users", json={"name": "Alice2", "email": "alice@example.com"}).status_code,
        400,
    )

    project = client.post("/projects", json={"name": "Core", "description": "Core project"})
    record("POST /projects", project.status_code, 201)
    project_id = project.get_json()["data"]["id"]

    record("GET /projects", client.get("/projects").status_code, 200)
    record("GET /projects/:id", client.get(f"/projects/{project_id}").status_code, 200)

    bug = client.post(
        "/bugs",
        json={"project_id": project_id, "title": "Bug A", "description": "Desc", "priority": "high"},
    )
    record("POST /bugs", bug.status_code, 201)
    bug_id = bug.get_json()["data"]["id"]

    record("GET /bugs", client.get("/bugs").status_code, 200)
    record("GET /bugs/:id", client.get(f"/bugs/{bug_id}").status_code, 200)
    record("PUT /bugs/:id", client.put(f"/bugs/{bug_id}", json={"priority": "critical"}).status_code, 200)

    record(
        "POST /bugs/:id/transition in_progress without assignee",
        client.post(f"/bugs/{bug_id}/transition", json={"status": "in_progress"}).status_code,
        400,
    )
    record("PUT /bugs/:id set assignee", client.put(f"/bugs/{bug_id}", json={"assignee_id": user_id}).status_code, 200)
    record(
        "POST /bugs/:id/transition in_progress",
        client.post(f"/bugs/{bug_id}/transition", json={"status": "in_progress"}).status_code,
        200,
    )
    record(
        "POST /bugs/:id/transition resolved without note",
        client.post(f"/bugs/{bug_id}/transition", json={"status": "resolved"}).status_code,
        400,
    )
    record(
        "PUT /bugs/:id set resolution note",
        client.put(f"/bugs/{bug_id}", json={"resolution_note": "Fixed"}).status_code,
        200,
    )
    record(
        "POST /bugs/:id/transition resolved",
        client.post(f"/bugs/{bug_id}/transition", json={"status": "resolved"}).status_code,
        200,
    )
    record(
        "POST /bugs/:id/transition closed",
        client.post(f"/bugs/{bug_id}/transition", json={"status": "closed"}).status_code,
        200,
    )
    record(
        "POST /bugs/:id/transition invalid from closed",
        client.post(f"/bugs/{bug_id}/transition", json={"status": "open"}).status_code,
        400,
    )

    record(
        "POST /bugs/:id/comments",
        client.post(f"/bugs/{bug_id}/comments", json={"author_id": user_id, "text": "Looks good"}).status_code,
        201,
    )
    record("GET /bugs/:id/comments", client.get(f"/bugs/{bug_id}/comments").status_code, 200)
    record(
        "POST /bugs/:id/comments invalid",
        client.post(f"/bugs/{bug_id}/comments", json={"text": "Missing author"}).status_code,
        400,
    )

    failures = [c for c in checks if c[1] != c[2]]
    print(f"TOTAL={len(checks)} FAILED={len(failures)}")
    for name, got, expected in failures:
        print(f"FAIL {name}: got={got} expected={expected}")

    if failures:
        return 1

    print("ALL_ENDPOINTS_OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
