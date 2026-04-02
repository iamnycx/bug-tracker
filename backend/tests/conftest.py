from pathlib import Path

import pytest

from app import create_app
from app.config import settings
from app.extensions import db
from app.services.auth import AuthService


@pytest.fixture()
def app(tmp_path: Path):
    test_db = tmp_path / "test.db"
    application = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{test_db}",
        }
    )

    with application.app_context():
        db.drop_all()
        db.create_all()
        AuthService.ensure_admin_user()
        yield application


@pytest.fixture()
def client(app):
    with app.test_client() as test_client:
        yield test_client


@pytest.fixture()
def auth_headers(client):
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
