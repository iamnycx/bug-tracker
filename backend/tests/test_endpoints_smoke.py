from pathlib import Path
import sys

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import create_app
from app.config import settings
from app.extensions import db
from app.services.auth import AuthService


@pytest.fixture()
def client(tmp_path: Path):
    test_db = tmp_path / "test.db"
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{test_db}",
        }
    )

    with app.app_context():
        db.drop_all()
        db.create_all()
        AuthService.ensure_admin_user()

    with app.test_client() as test_client:
        yield test_client


def test_backend_endpoints_smoke(client):
    response = client.get("/")
    assert response.status_code == 200

    login = client.post(
        "/auth/login",
        json={
            "email": settings.ADMIN_EMAIL,
            "password": settings.ADMIN_PASSWORD,
        },
    )
    assert login.status_code == 200
    token = login.get_json()["data"]["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    assert client.get("/users").status_code == 401
    assert client.get("/users", headers=auth_headers).status_code == 200

    me = client.get("/auth/me", headers=auth_headers)
    assert me.status_code == 200

    user = client.post(
        "/users",
        json={"name": "Alice", "email": "alice@example.com", "password": "password123"},
        headers=auth_headers,
    )
    assert user.status_code == 201
    user_id = user.get_json()["data"]["id"]

    assert client.get(f"/users/{user_id}", headers=auth_headers).status_code == 200
    assert client.post(
        "/users",
        json={"name": "Alice2", "email": "alice@example.com", "password": "password123"},
        headers=auth_headers,
    ).status_code == 400

    project = client.post(
        "/projects",
        json={"name": "Core", "description": "Core project"},
        headers=auth_headers,
    )
    assert project.status_code == 201
    project_id = project.get_json()["data"]["id"]

    assert client.get("/projects", headers=auth_headers).status_code == 200
    assert client.get(f"/projects/{project_id}", headers=auth_headers).status_code == 200

    bug = client.post(
        "/bugs",
        json={
            "project_id": project_id,
            "title": "Bug A",
            "description": "Desc",
            "priority": "high",
        },
        headers=auth_headers,
    )
    assert bug.status_code == 201
    bug_id = bug.get_json()["data"]["id"]

    assert client.get("/bugs", headers=auth_headers).status_code == 200
    assert client.get(f"/bugs/{bug_id}", headers=auth_headers).status_code == 200
    assert client.put(
        f"/bugs/{bug_id}",
        json={"priority": "critical"},
        headers=auth_headers,
    ).status_code == 200

    # Transition guards
    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "in_progress"},
        headers=auth_headers,
    ).status_code == 400

    assert client.put(
        f"/bugs/{bug_id}",
        json={"assignee_id": user_id},
        headers=auth_headers,
    ).status_code == 200

    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "in_progress"},
        headers=auth_headers,
    ).status_code == 200

    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "resolved"},
        headers=auth_headers,
    ).status_code == 400

    assert client.put(
        f"/bugs/{bug_id}",
        json={"resolution_note": "Fixed"},
        headers=auth_headers,
    ).status_code == 200

    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "resolved"},
        headers=auth_headers,
    ).status_code == 200

    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "closed"},
        headers=auth_headers,
    ).status_code == 200

    assert client.post(
        f"/bugs/{bug_id}/transition",
        json={"status": "open"},
        headers=auth_headers,
    ).status_code == 400

    # Comments
    assert client.post(
        f"/bugs/{bug_id}/comments",
        json={"text": "Looks good"},
        headers=auth_headers,
    ).status_code == 201

    assert client.get(f"/bugs/{bug_id}/comments", headers=auth_headers).status_code == 200

    assert client.post(
        f"/bugs/{bug_id}/comments",
        json={},
        headers=auth_headers,
    ).status_code == 400

    member_create = client.post(
        "/users",
        json={"name": "Member", "email": "member@example.com", "password": "password123"},
        headers=auth_headers,
    )
    assert member_create.status_code == 201
    member_id = member_create.get_json()["data"]["id"]

    member_login = client.post(
        "/auth/login",
        json={"email": "member@example.com", "password": "password123"},
    )
    assert member_login.status_code == 200
    member_token = member_login.get_json()["data"]["access_token"]
    member_headers = {"Authorization": f"Bearer {member_token}"}

    assert client.get("/users", headers=member_headers).status_code == 200
    assert client.get("/projects", headers=member_headers).status_code == 200
    assert client.get("/bugs", headers=member_headers).status_code == 200

    block_member = client.patch(f"/users/{member_id}/block", headers=auth_headers)
    assert block_member.status_code == 200

    assert client.get("/bugs", headers=member_headers).status_code == 403
