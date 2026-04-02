"""API validation and response contract checks."""

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


def _auth_headers(client):
    login = client.post(
        "/auth/login",
        json={
            "email": settings.ADMIN_EMAIL,
            "password": settings.ADMIN_PASSWORD,
        },
    )
    assert login.status_code == 200
    token = login.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_api_response_shape_on_success(client):
    """Success payloads use { data, error, status }."""
    headers = _auth_headers(client)
    r = client.get("/users", headers=headers)
    assert r.status_code == 200
    body = r.get_json()
    assert set(body.keys()) == {"data", "error", "status"}
    assert body["error"] is None
    assert body["status"] == 200
    assert isinstance(body["data"], list)


def test_bugs_list_rejects_invalid_status_query(client):
    headers = _auth_headers(client)
    r = client.get("/bugs?status=not_a_status", headers=headers)
    assert r.status_code == 400
    body = r.get_json()
    assert body["data"] is None
    assert body["error"] is not None
    assert body["status"] == 400


def test_bugs_list_rejects_unknown_query_param(client):
    headers = _auth_headers(client)
    r = client.get("/bugs?foo=bar", headers=headers)
    assert r.status_code == 400


def test_bugs_update_rejects_extra_fields(client):
    headers = _auth_headers(client)
    project = client.post(
        "/projects",
        json={"name": "P", "description": "d"},
        headers=headers,
    )
    assert project.status_code == 201
    project_id = project.get_json()["data"]["id"]

    bug = client.post(
        "/bugs",
        json={
            "project_id": project_id,
            "title": "T",
            "description": "D",
            "priority": "low",
        },
        headers=headers,
    )
    assert bug.status_code == 201
    bug_id = bug.get_json()["data"]["id"]

    r = client.put(
        f"/bugs/{bug_id}",
        json={"priority": "medium", "status": "closed"},
        headers=headers,
    )
    assert r.status_code == 400
