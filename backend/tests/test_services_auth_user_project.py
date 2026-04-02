from app import create_app
from app.extensions import db
from app.schema import AuthLoginRequest, ProjectCreate, UserCreate
from app.services import AuthService, ProjectService, UserService


def test_auth_service_login_and_identity(app) -> None:
    with app.app_context():
        first_user = UserService.create_user(
            UserCreate(name="Alice", email="alice@example.com", password="password123")
        )

        token, logged_in = AuthService.login(
            AuthLoginRequest(email="alice@example.com", password="password123")
        )
        assert token
        assert logged_in.id == first_user.id

        assert AuthService.get_user_by_identity(str(first_user.id)).email == "alice@example.com"


def test_auth_service_rejects_bad_credentials_and_identity(app) -> None:
    with app.app_context():
        UserService.create_user(
            UserCreate(name="Alice", email="alice@example.com", password="password123")
        )

        try:
            AuthService.login(AuthLoginRequest(email="alice@example.com", password="wrong"))
        except ValueError as exc:
            assert str(exc) == "Invalid email or password"
        else:
            raise AssertionError("Expected invalid login to fail")

        try:
            AuthService.get_user_by_identity("not-an-int")
        except ValueError as exc:
            assert str(exc) == "Invalid token identity"
        else:
            raise AssertionError("Expected invalid identity to fail")


def test_auth_service_rejects_blocked_users(app) -> None:
    with app.app_context():
        user = UserService.create_user(
            UserCreate(name="Blocked", email="blocked@example.com", password="password123")
        )
        admin = AuthService.ensure_admin_user()
        UserService.set_blocked(user.id, blocked=True, actor_user_id=admin.id)

        try:
            AuthService.login(AuthLoginRequest(email="blocked@example.com", password="password123"))
        except ValueError as exc:
            assert str(exc) == "User is blocked"
        else:
            raise AssertionError("Expected blocked login to fail")


def test_auth_service_ensure_admin_user_is_idempotent(app) -> None:
    with app.app_context():
        admin_one = AuthService.ensure_admin_user()
        admin_two = AuthService.ensure_admin_user()
        assert admin_one.id == admin_two.id
        assert admin_two.role == "admin"
        assert admin_two.credential_password is not None
        assert admin_two.is_blocked is False


def test_user_service_crud(app) -> None:
    with app.app_context():
        user = UserService.create_user(
            UserCreate(name="Charlie", email="charlie@example.com", password="password123")
        )
        assert user.id is not None
        assert user.credential_password == "password123"
        assert UserService.get_user_by_id(user.id).email == "charlie@example.com"
        assert UserService.get_user_by_email("charlie@example.com").id == user.id
        assert len(UserService.list_users()) >= 2

        try:
            UserService.create_user(
                UserCreate(name="Duplicate", email="charlie@example.com", password="password123")
            )
        except ValueError as exc:
            assert "already exists" in str(exc)
        else:
            raise AssertionError("Expected duplicate user creation to fail")

        admin = AuthService.ensure_admin_user()
        blocked = UserService.set_blocked(user.id, blocked=True, actor_user_id=admin.id)
        assert blocked.is_blocked is True

        unblocked = UserService.set_blocked(user.id, blocked=False, actor_user_id=admin.id)
        assert unblocked.is_blocked is False

        try:
            UserService.set_blocked(admin.id, blocked=True, actor_user_id=admin.id)
        except ValueError as exc:
            assert str(exc) == "Admin cannot block their own account"
        else:
            raise AssertionError("Expected admin self-block to fail")


def test_project_service_crud(app) -> None:
    with app.app_context():
        project = ProjectService.create_project(ProjectCreate(name="Core", description="Core project"))
        assert project.id is not None
        assert ProjectService.get_project_by_id(project.id).name == "Core"

        updated = ProjectService.update_project(project.id, name="Core v2", description="Updated")
        assert updated.name == "Core v2"
        assert updated.description == "Updated"

        assert ProjectService.list_projects()[0].id == project.id
        assert ProjectService.delete_project(project.id) is True
        assert ProjectService.get_project_by_id(project.id) is None


def test_project_service_missing_project_raises(app) -> None:
    with app.app_context():
        try:
            ProjectService.update_project(9999, name="Nope")
        except ValueError as exc:
            assert str(exc) == "Project 9999 not found"
        else:
            raise AssertionError("Expected missing project update to fail")

        try:
            ProjectService.delete_project(9999)
        except ValueError as exc:
            assert str(exc) == "Project 9999 not found"
        else:
            raise AssertionError("Expected missing project delete to fail")
