from typing import Optional
from werkzeug.security import generate_password_hash

from ..extensions import db
from ..models import User
from ..schema import UserCreate


class UserService:
    """Service for user operations."""

    @staticmethod
    def create_user(data: UserCreate) -> User:
        """Create a new user."""
        existing = User.query.filter_by(email=data.email).first()
        if existing:
            raise ValueError(f"User with email {data.email} already exists")

        user = User(
            name=data.name,
            email=data.email,
            password_hash=generate_password_hash(data.password),
            credential_password=data.password,
            role=data.role,
            is_blocked=False,
        )
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_user_by_id(user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.session.get(User, user_id)

    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email."""
        return User.query.filter_by(email=email).first()

    @staticmethod
    def list_users() -> list[User]:
        """List all users."""
        return User.query.all()

    @staticmethod
    def set_blocked(
        user_id: int,
        *,
        blocked: bool,
        actor_user_id: int,
    ) -> User:
        """Block or unblock a user account."""
        user = db.session.get(User, user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")

        if user.id == actor_user_id:
            raise ValueError("Admin cannot block their own account")

        if user.role == "admin" and blocked:
            raise ValueError("Admin accounts cannot be blocked")

        user.is_blocked = blocked
        db.session.commit()
        return user
